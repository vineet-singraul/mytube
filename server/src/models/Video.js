import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema(
  {
    youtubeId: { type: String, required: true, unique: true },
    youtubeUrl: { type: String, required: true },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    channel: { type: String, default: '' },
    duration: { type: Number, default: 0 },
    thumbnailFile: { type: String, default: '' },
    videoFile: { type: String, default: '' },
    fileSize: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'downloading', 'ready', 'failed'],
      default: 'pending',
    },
    errorMessage: { type: String, default: '' },
    exportedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Video', videoSchema);
