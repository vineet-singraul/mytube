import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Video from '../models/Video.js';
import { VIDEO_DIR, THUMB_DIR } from '../config/paths.js';

async function run() {
  const outIndex = process.argv.indexOf('--out');
  const outDir = outIndex !== -1 ? process.argv[outIndex + 1] : null;

  if (!outDir) {
    console.error('Istemal: npm run export -- --out "D:\\USB\\export1"');
    process.exit(1);
  }

  await connectDB();

  const videos = await Video.find({ status: 'ready', exportedAt: null });
  if (!videos.length) {
    console.log('Export karne ke liye koi naya video nahi hai.');
    await mongoose.disconnect();
    return;
  }

  const filesDir = path.join(outDir, 'files');
  fs.mkdirSync(filesDir, { recursive: true });

  const manifest = [];
  for (const video of videos) {
    const videoSrc = path.join(VIDEO_DIR, video.videoFile);
    if (fs.existsSync(videoSrc)) {
      fs.copyFileSync(videoSrc, path.join(filesDir, video.videoFile));
    } else {
      console.warn(`Chetavani: video file nahi mili, skip kar rahe hain: ${video.videoFile}`);
      continue;
    }

    if (video.thumbnailFile) {
      const thumbSrc = path.join(THUMB_DIR, video.thumbnailFile);
      if (fs.existsSync(thumbSrc)) {
        fs.copyFileSync(thumbSrc, path.join(filesDir, video.thumbnailFile));
      }
    }

    manifest.push({
      youtubeId: video.youtubeId,
      youtubeUrl: video.youtubeUrl,
      title: video.title,
      description: video.description,
      channel: video.channel,
      duration: video.duration,
      thumbnailFile: video.thumbnailFile,
      videoFile: video.videoFile,
      fileSize: video.fileSize,
    });

    video.exportedAt = new Date();
    await video.save();
  }

  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

  console.log(`${manifest.length} video(s) export ho gaye: ${outDir}`);
  console.log('Ab is poore folder ko USB drive me copy karke offline machine par le jaayein,');
  console.log('aur wahan "npm run import -- --in <path>" chalayein.');

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Export fail ho gaya:', err);
  process.exit(1);
});
