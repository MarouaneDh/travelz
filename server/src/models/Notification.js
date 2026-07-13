import mongoose from 'mongoose';

/**
 * An in-app notification. Two tiers for now (live streaming arrives in v4):
 *  - 'follow' → someone started following you (Social)
 *  - 'moment' → someone you follow added a new moment somewhere (Exploration)
 */
const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: { type: String, enum: ['follow', 'moment'], required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    moment: { type: mongoose.Schema.Types.ObjectId, ref: 'Moment' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
