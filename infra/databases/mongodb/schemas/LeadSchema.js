import mongoose from 'mongoose';
import StageSchema from './StageSchema';

const { Schema } = mongoose;
const { ObjectId } = Schema;

const Lead = new Schema({
  _id: ObjectId,
  name: String,
  phoneNumber: String,
  createdAt: Date,
  stage: StageSchema,
});

export default Lead;
