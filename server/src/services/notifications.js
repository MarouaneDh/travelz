import { Follow } from '../models/Follow.js';
import { Notification } from '../models/Notification.js';

/** Notify a user that `actor` started following them (Social tier). */
export async function notifyFollow(recipientId, actorId) {
  if (String(recipientId) === String(actorId)) return;
  await Notification.create({ recipient: recipientId, type: 'follow', actor: actorId });
}

/**
 * Notify all of an owner's followers that they added a new moment (Exploration
 * tier). Fans out one notification per follower.
 */
export async function notifyNewMoment(moment) {
  const followers = await Follow.find({ following: moment.owner }).select('follower').lean();
  if (!followers.length) return;

  await Notification.insertMany(
    followers.map((f) => ({
      recipient: f.follower,
      type: 'moment',
      actor: moment.owner,
      moment: moment._id,
    }))
  );
}
