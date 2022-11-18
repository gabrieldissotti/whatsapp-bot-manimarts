const { Schema } = require('mongoose');
const {
  DEFAULT_SCRIPT_VERSION,
  DEFAULT_SCRIPT_POSITION,
} = require('../../../../core/constants/scripts');

const Lead = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
      required: true,
      auto: true,
    },
    name: String,
    phoneNumber: String,
    stage_position: {
      type: Number,
      default: DEFAULT_SCRIPT_POSITION,
    },
    script_version: {
      type: String,
      default: DEFAULT_SCRIPT_VERSION,
    },
    createdAt: Date,
    stage_id: Number,
    locked_in_this_stage_until: {
      type: Date,
      default: null,
    },
    received_some_image_so_far: {
      type: Boolean,
      default: false,
    },
  },
  { collection: 'leads' }
);

module.exports = Lead;
