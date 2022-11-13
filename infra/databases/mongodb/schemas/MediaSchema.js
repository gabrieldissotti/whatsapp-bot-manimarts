import mongoose from 'mongoose';

const { Schema } = mongoose;
const { ObjectId } = Schema;

const Media = new Schema({
  _id: ObjectId,
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

export default Media;
