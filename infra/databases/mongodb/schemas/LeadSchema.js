import { Schema } from 'mongoose';
import {
  DEFAULT_SCRIPT_VERSION,
  DEFAULT_SCRIPT_POSITION,
} from '../../../../core/constants/scripts';

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
  },
  { collection: 'leads' }
);

export default Lead;
