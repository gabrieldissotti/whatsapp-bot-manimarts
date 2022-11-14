const { Schema } = require('mongoose');
const {
  DEFAULT_SCRIPT_VERSION,
} = require('../../../../core/constants/scripts');
const StageSchema = require('./StageSchema');

const Script = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
      required: true,
      auto: true,
    },
    stages: [StageSchema],
    createdAt: Date,
    version: {
      type: String,
      default: DEFAULT_SCRIPT_VERSION,
    },
  },
  { collection: 'scripts' }
);

module.exports = Script;
