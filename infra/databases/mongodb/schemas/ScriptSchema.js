import mongoose from 'mongoose';
import StageSchema from './StageSchema';

const { Schema } = mongoose;
const { ObjectId } = Schema;

const Script = new Schema({
  _id: ObjectId,
  stages: [StageSchema],
  createdAt: Date,
  version: {
    type: String,
    default: '1.0.0',
  },
});

export default Script;
