import express from 'express';
import fs from 'fs';
import path from 'path';
import Video from '../models/Video.js';
import { VIDEO_DIR } from '../config/paths.js';

const router = express.Router();

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

// Local storage se range-request streaming — offline machine par bina
// internet ke bhi seek/scrub sahi chalta hai.
router.get('/:id/stream', async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video || !video.videoFile) return res.status(404).end();

  const filePath = path.join(VIDEO_DIR, video.videoFile);
  if (!fs.existsSync(filePath)) return res.status(404).end();

  const stat = fs.statSync(filePath);
  const range = req.headers.range;

  if (!range) {
    res.writeHead(200, {
      'Content-Length': stat.size,
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes',
    });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
  const start = parseInt(startStr, 10);
  const end = endStr ? parseInt(endStr, 10) : stat.size - 1;
  const chunkSize = end - start + 1;

  res.writeHead(206, {
    'Content-Range': `bytes ${start}-${end}/${stat.size}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': chunkSize,
    'Content-Type': 'video/mp4',
  });
  fs.createReadStream(filePath, { start, end }).pipe(res);
});

export default router;
