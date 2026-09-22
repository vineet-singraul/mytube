import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema(
  {
    youtubeId: { type: String, required: true, unique: true },
    youtubeUrl: { type: String, required: true },
    title: { type: String, default: '' },
    channel: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
    status: {
      type: String,
      enum: ['ready', 'failed'],
      default: 'ready',
    },
    errorMessage: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Video', videoSchema);
