import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Video from '../models/Video.js';
import { VIDEO_DIR, THUMB_DIR } from '../config/paths.js';

async function run() {
  const inIndex = process.argv.indexOf('--in');
  const inDir = inIndex !== -1 ? process.argv[inIndex + 1] : null;

  if (!inDir) {
    console.error('Istemal: npm run import -- --in "D:\\USB\\export1"');
    process.exit(1);
  }

  const manifestPath = path.join(inDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error(`manifest.json nahi mili: ${manifestPath}`);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  const filesDir = path.join(inDir, 'files');

  await connectDB();

  let count = 0;
  for (const item of manifest) {
    const videoDest = path.join(VIDEO_DIR, item.videoFile);
    if (!fs.existsSync(videoDest)) {
      const videoSrc = path.join(filesDir, item.videoFile);
      if (!fs.existsSync(videoSrc)) {
        console.warn(`Chetavani: source video file nahi mili, skip: ${item.videoFile}`);
        continue;
      }
      fs.copyFileSync(videoSrc, videoDest);
    }

    if (item.thumbnailFile) {
      const thumbDest = path.join(THUMB_DIR, item.thumbnailFile);
      if (!fs.existsSync(thumbDest)) {
        const thumbSrc = path.join(filesDir, item.thumbnailFile);
        if (fs.existsSync(thumbSrc)) fs.copyFileSync(thumbSrc, thumbDest);
      }
    }

    await Video.findOneAndUpdate(
      { youtubeId: item.youtubeId },
      { ...item, status: 'ready', errorMessage: '' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    count++;
  }

  console.log(`${count} video(s) import ho gaye is machine par.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Import fail ho gaya:', err);
  process.exit(1);
});
