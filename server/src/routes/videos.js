import express from 'express';
import fs from 'fs';
import Video from '../models/Video.js';
import { downloadVideoToTempFile } from '../services/videoDownload.js';

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

// Offline-download ke liye: video file yt-dlp se banti hai aur seedha
// response me stream ho jaati hai, phir server se delete ho jaati hai —
// server par permanently kuch store nahi hota.
router.get('/:id/download', async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video || video.status !== 'ready') return res.status(404).json({ error: 'not found' });

  let filePath;
  try {
    filePath = await downloadVideoToTempFile(video.youtubeUrl);
  } catch (err) {
    console.error('Download failed:', err.message);
    return res.status(500).json({ error: 'Download fail ho gaya, dobara try karein.' });
  }

  const stat = fs.statSync(filePath);
  res.writeHead(200, {
    'Content-Type': 'video/mp4',
    'Content-Length': stat.size,
    'Content-Disposition': `attachment; filename="${video.youtubeId}.mp4"`,
  });

  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
  const cleanup = () => fs.unlink(filePath, () => {});
  stream.on('close', cleanup);
  stream.on('error', cleanup);
  res.on('close', cleanup);
});

export default router;
