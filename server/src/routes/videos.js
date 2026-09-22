import express from 'express';
import fs from 'fs';
import Video from '../models/Video.js';
import { startDownloadJob, getJobStatus, clearJob } from '../services/videoDownload.js';

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

// Offline-download background job ki tarah chalta hai (dekhein videoDownload.js
// me comment) taaki free hosting ke ~100s request-timeout se na takraye.
router.post('/:id/download/start', async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video || video.status !== 'ready') return res.status(404).json({ error: 'not found' });
  const job = startDownloadJob(video._id.toString(), video.youtubeUrl);
  res.json({ status: job.status });
});

router.get('/:id/download/status', (req, res) => {
  const job = getJobStatus(req.params.id);
  res.json({ status: job?.status || 'idle', error: job?.error || null });
});

router.get('/:id/download/file', (req, res) => {
  const job = getJobStatus(req.params.id);
  if (!job || job.status !== 'ready' || !fs.existsSync(job.filePath)) {
    return res.status(404).json({ error: 'not ready' });
  }

  const stat = fs.statSync(job.filePath);
  res.writeHead(200, {
    'Content-Type': 'video/mp4',
    'Content-Length': stat.size,
  });

  const stream = fs.createReadStream(job.filePath);
  stream.pipe(res);
  const cleanup = () => clearJob(req.params.id);
  stream.on('close', cleanup);
  stream.on('error', cleanup);
  res.on('close', cleanup);
});

export default router;
