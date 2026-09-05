import { City } from "../models/City.js";
import { Neighborhood } from "../models/Neighborhood.js";
import { Place } from "../models/Place.js";
import { Food } from "../models/Food.js";
import { Event } from "../models/Event.js";
import { LanguageLesson } from "../models/LanguageLesson.js";
import { User } from "../models/User.js";
import { env } from "../config/env.js";

const CATEGORY_KEYWORDS = {
  shopping: ["fashion", "shopping", "style", "streetwear", "boutique"],
  nightlife: ["nightlife", "clubbing", "underground music", "party", "club"],
  bar: ["bar", "drinks", "cocktail", "soju", "beer"],
  cafe: ["cafe", "coffee", "dessert"],
  culture: ["museum", "gallery", "history", "traditional", "palace"],
  kpop: ["kpop", "k-pop", "idol", "album", "photocard"],
  art: ["art", "gallery", "indie", "mural"],
  nature: ["nature", "park", "hike", "outdoors"],
  market: ["market", "street food"],
  wellness: ["spa", "jjimjilbang", "wellness", "relax"],
};

const CITY_ALIASES = {
  seoul: "seoul",
  busan: "busan",
  incheon: "incheon",
  daegu: "daegu",
  daejeon: "daejeon",
  gwangju: "gwangju",
  jeju: "jeju",
};

function detectCity(promptLower) {
  for (const [alias, slug] of Object.entries(CITY_ALIASES)) {
    if (promptLower.includes(alias)) return slug;
  }
  return null;
}

function detectCategories(promptLower) {
  const found = new Set();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => promptLower.includes(kw))) found.add(category);
  }
  return found;
}

function detectBudget(promptLower) {
  if (/(cheap|budget|student|affordable|inexpensive)/.test(promptLower)) return [1, 2];
  if (/(luxury|fancy|upscale|expensive|splurge)/.test(promptLower)) return [3, 4];
  return [1, 2, 3, 4];
}

function timeSlotFor(category) {
  if (["cafe", "market", "nature"].includes(category)) return "Morning";
  if (["shopping", "culture", "art", "landmark"].includes(category)) return "Afternoon";
  return "Evening";
}

async function enhanceWithOpenAI(structured, originalPrompt) {
  if (!env.OPENAI_API_KEY) return structured;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are the DONGNE Korea Assistant. Rewrite the given JSON itinerary's 'summary' field into two warm, specific sentences, in the same JSON structure. Do not invent places not present in the data. Return only valid JSON.",
          },
          { role: "user", content: JSON.stringify({ request: originalPrompt, itinerary: structured }) },
        ],
        temperature: 0.6,
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) return structured;
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return structured;
    const parsed = JSON.parse(content);
    return { ...structured, summary: parsed.summary || structured.summary, aiEnhanced: true };
  } catch {
    return structured;
  }
}

export async function generateItinerary({ prompt, userId }) {
  const promptLower = prompt.toLowerCase();
  let citySlug = detectCity(promptLower);
  const categories = detectCategories(promptLower);
  const priceLevels = detectBudget(promptLower);

  if (!citySlug && userId) {
    const user = await User.findById(userId).populate("homeCity", "slug");
    citySlug = user?.homeCity?.slug || null;
  }
  citySlug = citySlug || "seoul";

  const city = await City.findOne({ slug: citySlug });
  if (!city) {
    return {
      summary: "I couldn't find that city yet in DONGNE — try Seoul, Busan, Incheon, Daegu, Daejeon, Gwangju, or Jeju.",
      city: null,
      stops: [],
      food: [],
      events: [],
      phrases: [],
    };
  }

  const categoryList = categories.size ? [...categories] : ["cafe", "culture", "shopping", "bar"];

  const neighborhoods = await Neighborhood.find({ city: city._id })
    .sort({ rating: -1 })
    .limit(6);

  let bestNeighborhood = neighborhoods[0] || null;
  if (categories.size && neighborhoods.length) {
    const scored = neighborhoods.map((n) => {
      const tagOverlap = n.vibeTags.filter((tag) => categories.has(tag)).length;
      return { n, score: tagOverlap * 5 + n.rating };
    });
    scored.sort((a, b) => b.score - a.score);
    bestNeighborhood = scored[0]?.n || bestNeighborhood;
  }

  const placeQuery = {
    city: city._id,
    category: { $in: categoryList },
    priceLevel: { $in: priceLevels },
    status: "published",
  };
  if (bestNeighborhood) placeQuery.neighborhood = bestNeighborhood._id;

  let places = await Place.find(placeQuery).sort({ rating: -1 }).limit(5).populate("neighborhood", "name slug");
  if (places.length < 3) {
    places = await Place.find({ city: city._id, priceLevel: { $in: priceLevels }, status: "published" })
      .sort({ rating: -1 })
      .limit(5)
      .populate("neighborhood", "name slug");
  }

  const stops = places.map((place) => ({
    time: timeSlotFor(place.category),
    placeId: place._id,
    name: place.name,
    slug: place.slug,
    category: place.category,
    neighborhood: place.neighborhood?.name,
    why: `Matches your interest in ${categoryList.includes(place.category) ? place.category : "exploring " + city.name} with a ${place.rating.toFixed(1)}★ rating.`,
  }));

  const foodDocs = await Food.find(
    priceLevels[0] === 1 ? {} : {},
  )
    .sort({ popularityScore: -1 })
    .limit(3);

  const upcomingEvents = await Event.find({
    city: city._id,
    startDate: { $gte: new Date() },
  })
    .sort({ startDate: 1 })
    .limit(2);

  const phraseCategory = categoryList.includes("shopping") ? "shopping" : categoryList.includes("bar") ? "food" : "travel";
  const lesson = await LanguageLesson.findOne({ category: phraseCategory }).sort({ level: 1 });
  const phrases = (lesson?.vocabulary || []).slice(0, 4);

  const structured = {
    summary: `A ${categoryList.join(", ")} day in ${bestNeighborhood?.name || city.name}, ${city.name} — built from ${places.length} real spots in DONGNE's database, matched to your ${priceLevels[0] <= 2 && priceLevels[priceLevels.length - 1] <= 2 ? "budget-friendly" : "flexible"} vibe.`,
    city: { name: city.name, slug: city.slug },
    neighborhood: bestNeighborhood ? { name: bestNeighborhood.name, slug: bestNeighborhood.slug } : null,
    stops,
    food: foodDocs.map((f) => ({ id: f._id, nameEnglish: f.nameEnglish, nameKorean: f.nameKorean, slug: f.slug })),
    events: upcomingEvents.map((e) => ({ id: e._id, title: e.title, slug: e.slug, startDate: e.startDate })),
    phrases,
    aiEnhanced: false,
  };

  return enhanceWithOpenAI(structured, prompt);
}
