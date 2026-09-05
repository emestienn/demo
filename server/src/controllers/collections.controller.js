import { Collection } from "../models/Collection.js";
import { Place } from "../models/Place.js";
import { Post } from "../models/Post.js";
import { Event } from "../models/Event.js";
import { Food } from "../models/Food.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { checkAndUnlockAchievements } from "../services/gamification.service.js";

export const listMyCollections = asyncHandler(async (req, res) => {
  const collections = await Collection.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: collections });
});

export const getCollection = asyncHandler(async (req, res) => {
  const collection = await Collection.findById(req.params.id).populate("owner", "username displayName avatarUrl");
  if (!collection) throw ApiError.notFound("Collection not found");
  if (!collection.isPublic && (!req.user || !collection.owner._id.equals(req.user._id))) {
    throw ApiError.forbidden("This collection is private");
  }

  const grouped = { Place: [], Post: [], Event: [], Food: [] };
  for (const item of collection.items) grouped[item.itemType].push(item.itemId);

  const [places, posts, events, foods] = await Promise.all([
    Place.find({ _id: { $in: grouped.Place } }).select("name slug images category rating priceLevel"),
    Post.find({ _id: { $in: grouped.Post } }).select("text images author").populate("author", "username avatarUrl"),
    Event.find({ _id: { $in: grouped.Event } }).select("title slug startDate images"),
    Food.find({ _id: { $in: grouped.Food } }).select("nameEnglish nameKorean slug images"),
  ]);

  const byId = new Map([
    ...places.map((p) => [String(p._id), { itemType: "Place", data: p }]),
    ...posts.map((p) => [String(p._id), { itemType: "Post", data: p }]),
    ...events.map((p) => [String(p._id), { itemType: "Event", data: p }]),
    ...foods.map((p) => [String(p._id), { itemType: "Food", data: p }]),
  ]);

  const resolvedItems = collection.items
    .map((item) => ({
      _id: item._id,
      note: item.note,
      order: item.order,
      ...byId.get(String(item.itemId)),
    }))
    .filter((item) => item.data)
    .sort((a, b) => a.order - b.order);

  res.json({ success: true, data: { ...collection.toObject(), items: resolvedItems } });
});

export const createCollection = asyncHandler(async (req, res) => {
  const collection = await Collection.create({
    owner: req.user._id,
    name: req.body.name,
    description: req.body.description || "",
    coverImage: req.body.coverImage || "",
    isPublic: Boolean(req.body.isPublic),
  });
  const unlocked = await checkAndUnlockAchievements(req.user._id);
  res.status(201).json({ success: true, data: collection, unlocked });
});

export const updateCollection = asyncHandler(async (req, res) => {
  const collection = await Collection.findOne({ _id: req.params.id, owner: req.user._id });
  if (!collection) throw ApiError.notFound("Collection not found");

  const allowed = ["name", "description", "coverImage", "isPublic"];
  for (const field of allowed) {
    if (req.body[field] !== undefined) collection[field] = req.body[field];
  }
  await collection.save();
  res.json({ success: true, data: collection });
});

export const deleteCollection = asyncHandler(async (req, res) => {
  const collection = await Collection.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
  if (!collection) throw ApiError.notFound("Collection not found");
  res.json({ success: true, data: null });
});

export const addItem = asyncHandler(async (req, res) => {
  const collection = await Collection.findOne({ _id: req.params.id, owner: req.user._id });
  if (!collection) throw ApiError.notFound("Collection not found");

  const { itemType, itemId, note } = req.body;
  const alreadyIn = collection.items.some((i) => i.itemType === itemType && String(i.itemId) === itemId);
  if (alreadyIn) throw ApiError.conflict("Item already in this collection");

  collection.items.push({ itemType, itemId, note: note || "", order: collection.items.length });
  await collection.save();
  res.status(201).json({ success: true, data: collection });
});

export const removeItem = asyncHandler(async (req, res) => {
  const collection = await Collection.findOne({ _id: req.params.id, owner: req.user._id });
  if (!collection) throw ApiError.notFound("Collection not found");

  collection.items = collection.items.filter((i) => String(i._id) !== req.params.itemId);
  await collection.save();
  res.json({ success: true, data: collection });
});

export const reorderItems = asyncHandler(async (req, res) => {
  const collection = await Collection.findOne({ _id: req.params.id, owner: req.user._id });
  if (!collection) throw ApiError.notFound("Collection not found");

  const orderMap = new Map(req.body.orderedItemIds.map((id, index) => [id, index]));
  for (const item of collection.items) {
    if (orderMap.has(String(item._id))) item.order = orderMap.get(String(item._id));
  }
  await collection.save();
  res.json({ success: true, data: collection });
});
