const { Schema } = require('mongoose');

const Media = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    required: true,
    auto: true,
  },
  url: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['image', 'audio', 'video'],
    required: true,
  },
});

module.exports = Media;
