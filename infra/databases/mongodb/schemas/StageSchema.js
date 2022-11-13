import mongoose from 'mongoose';
import MediaSchema from './MediaSchema';

const { Schema } = mongoose;

const Stage = new Schema({
  _id: Schema.ObjectId,
  message: {
    medias: [MediaSchema],
    text: String,
    template: String,
  },
  position: {
    type: Number,
    required: true,
  },
});

export default Stage;
