import { Schema } from 'mongoose';
import MediaSchema from './MediaSchema';

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
});

export default Stage;
