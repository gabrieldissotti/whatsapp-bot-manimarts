import { Schema } from 'mongoose';
import { DEFAULT_SCRIPT_VERSION } from '../../../../core/constants/scripts';
import StageSchema from './StageSchema';

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

export default Script;
