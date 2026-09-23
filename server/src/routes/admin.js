import express from 'express';
import fs from 'fs';
import path from 'path';
import Video from '../models/Video.js';
import { enqueueDownload } from '../services/downloader.js';
import { extractYoutubeId } from '../utils/youtube.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { VIDEO_DIR, THUMB_DIR } from '../config/paths.js';

const router = express.Router();
router.use(adminAuth);

router.post('/videos', async (req, res) => {
  const { urls } = req.body || {};
  if (!urls || (typeof urls !== 'string' && !Array.isArray(urls))) {
    return res.status(400).json({ error: 'urls (string ya array) zaroori hai' });
  }

  const list = Array.isArray(urls) ? urls : urls.split('\n');
  const cleaned = [...new Set(list.map((u) => u.trim()).filter(Boolean))];

  const results = [];
  for (const url of cleaned) {
    const youtubeId = extractYoutubeId(url);
    if (!youtubeId) {
      results.push({ url, status: 'invalid' });
      continue;
    }

    let video = await Video.findOne({ youtubeId });
    if (video) {
      if (video.status === 'failed') {
        video.status = 'pending';
        video.errorMessage = '';
        await video.save();
        enqueueDownload(video._id.toString());
        results.push({ url, status: 'retrying', id: video._id });
      } else {
        results.push({ url, status: 'already_exists', id: video._id });
      }
      continue;
    }

    video = await Video.create({ youtubeId, youtubeUrl: url, status: 'pending' });
    enqueueDownload(video._id.toString());
    results.push({ url, status: 'queued', id: video._id });
  }

  res.json({ results });
});

router.get('/videos', async (req, res) => {
  const videos = await Video.find().sort({ createdAt: -1 });
  res.json(videos);
});

router.post('/videos/:id/retry', async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) return res.status(404).json({ error: 'not found' });
  video.status = 'pending';
  video.errorMessage = '';
  await video.save();
  enqueueDownload(video._id.toString());
  res.json({ ok: true });
});

router.delete('/videos/:id', async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) return res.status(404).json({ error: 'not found' });

  for (const [dir, file] of [
    [VIDEO_DIR, video.videoFile],
    [THUMB_DIR, video.thumbnailFile],
  ]) {
    if (file) {
      const filePath = path.join(dir, file);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  }

  await video.deleteOne();
  res.json({ ok: true });
});

export default router;
