import express from 'express';
import Video from '../models/Video.js';
import { fetchYoutubeMetadata } from '../services/metadata.js';
import { extractYoutubeId } from '../utils/youtube.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();
router.use(adminAuth);

// Ek ya ek saath kai YouTube links add karne ke liye.
// Body: { urls: "line1\nline2\nline3" }  ya  { urls: ["url1", "url2"] }
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

    const existing = await Video.findOne({ youtubeId });
    if (existing) {
      results.push({ url, status: 'already_exists', id: existing._id });
      continue;
    }

    try {
      const meta = await fetchYoutubeMetadata(youtubeId, url);
      const video = await Video.create({
        youtubeId,
        youtubeUrl: url,
        title: meta.title,
        channel: meta.channel,
        thumbnail: meta.thumbnail,
        status: 'ready',
      });
      results.push({ url, status: 'added', id: video._id });
    } catch (err) {
      const video = await Video.create({
        youtubeId,
        youtubeUrl: url,
        status: 'failed',
        errorMessage: String(err?.message || err).slice(0, 300),
      });
      results.push({ url, status: 'failed', id: video._id });
    }
  }

  res.json({ results });
});

router.get('/videos', async (req, res) => {
  const videos = await Video.find().sort({ createdAt: -1 });
  res.json(videos);
});

router.delete('/videos/:id', async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) return res.status(404).json({ error: 'not found' });
  await video.deleteOne();
  res.json({ ok: true });
});

export default router;
