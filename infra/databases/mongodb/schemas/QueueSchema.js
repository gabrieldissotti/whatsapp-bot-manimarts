const { Schema } = require('mongoose');

const Queue = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
      required: true,
      auto: true,
    },
    topic: {
      type: String,
      required: true,
    },
    message: {
      type: Schema.Types.Mixed,
      required: true,
    },
    resolved: {
      type: Boolean,
      default: false,
    },
  },
  { collection: 'queue', timestamps: true }
);

const anHourInSeconds = 3600;

Queue.index({ createdAt: new Date() }, { expireAfterSeconds: anHourInSeconds });

module.exports = Queue;
