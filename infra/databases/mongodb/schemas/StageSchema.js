const { Schema } = require('mongoose');
const MediaSchema = require('./MediaSchema');

const Stage = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    required: true,
    auto: true,
  },
  message: {
    medias: [MediaSchema],
    text: String,
    template: String,
  },
  position: {
    type: Number,
    required: true,
  },
  rules: {
    should_wait_seconds_to_reply: Number,
    alternative_message: {
      condition: String,
      message: {
        medias: [MediaSchema],
        text: String,
        template: String,
      },
    },
  },
});

module.exports = Stage;
