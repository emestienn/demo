import { Notification } from "../models/Notification.js";
import { emitToUser } from "../sockets/index.js";

export async function createNotification({ recipient, actor, type, message, targetType, targetId }) {
  if (actor && String(actor) === String(recipient)) return null;

  const notification = await Notification.create({
    recipient,
    actor,
    type,
    message,
    targetType,
    targetId,
  });

  const populated = await notification.populate("actor", "username displayName avatarUrl");
  emitToUser(recipient, "notification:new", populated.toObject());
  return populated;
}
