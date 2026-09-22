import express from 'express';
import Video from '../models/Video.js';

const router = express.Router();

// Public list — sirf ready videos dikhte hain.
router.get('/', async (req, res) => {
  const { q } = req.query;
  const filter = { status: 'ready' };
  if (q) filter.title = { $regex: q, $options: 'i' };
  const videos = await Video.find(filter).sort({ createdAt: -1 }).select('-errorMessage');
  res.json(videos);
});

router.get('/:id', async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video || video.status !== 'ready') return res.status(404).json({ error: 'not found' });
  res.json(video);
});

export default router;
