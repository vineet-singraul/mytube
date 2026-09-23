import ytDlpWrapPkg from 'yt-dlp-wrap-plus';
const YTDlpWrap = ytDlpWrapPkg.default || ytDlpWrapPkg;
import fs from 'fs';
import path from 'path';
import ffmpegPath from 'ffmpeg-static';
import Video from '../models/Video.js';
import { VIDEO_DIR, THUMB_DIR, YTDLP_BIN_PATH } from '../config/paths.js';

const MAX_HEIGHT = process.env.MAX_VIDEO_HEIGHT || '480';

let ytDlpWrap = null;
let ensureBinaryPromise = null;

async function ensureBinary() {
  if (ytDlpWrap) return ytDlpWrap;
  if (!ensureBinaryPromise) {
    ensureBinaryPromise = (async () => {
      if (!fs.existsSync(YTDLP_BIN_PATH)) {
        await YTDlpWrap.downloadFromGithub(YTDLP_BIN_PATH);
      }
      ytDlpWrap = new YTDlpWrap(YTDLP_BIN_PATH);
    })();
  }
  await ensureBinaryPromise;
  return ytDlpWrap;
}

// Ye admin ki apni machine (normal ghar/office internet) par chalta hai — is
// isliye YouTube ka cloud-IP bot-check yahan nahi lagta.
const queue = [];
let processing = false;

export function enqueueDownload(videoId) {
  queue.push(videoId);
  processQueue();
}

async function processQueue() {
  if (processing) return;
  processing = true;
  while (queue.length) {
    const videoId = queue.shift();
    await downloadOne(videoId);
  }
  processing = false;
}

function findFile(dir, prefix, excludeExt = []) {
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith(prefix + '.') && !excludeExt.some((ext) => f.endsWith(ext)) && !f.endsWith('.part'));
  return files[0] || null;
}

async function downloadOne(videoId) {
  const video = await Video.findById(videoId);
  if (!video) return;

  try {
    video.status = 'downloading';
    video.errorMessage = '';
    await video.save();

    const ytdlp = await ensureBinary();

    const info = JSON.parse(
      await ytdlp.execPromise([
        video.youtubeUrl,
        '--dump-single-json',
        '--no-warnings',
        '--no-playlist',
        '--no-check-certificates',
      ])
    );

    const outTemplate = path.join(VIDEO_DIR, `${video.youtubeId}.%(ext)s`);
    await ytdlp.execPromise([
      video.youtubeUrl,
      '-o',
      outTemplate,
      '-f',
      `bestvideo[height<=${MAX_HEIGHT}]+bestaudio/best[height<=${MAX_HEIGHT}]/best`,
      '--merge-output-format',
      'mp4',
      '--ffmpeg-location',
      ffmpegPath,
      '--write-thumbnail',
      '--no-playlist',
      '--no-warnings',
      '--no-check-certificates',
      // YouTube ke "n challenge" ke liye JS runtime chahiye; deno default hai
      // par install nahi hota, isliye Node.js (already installed) batate hain.
      '--js-runtimes',
      'node',
    ]);

    const videoFile = findFile(VIDEO_DIR, video.youtubeId, ['.jpg', '.jpeg', '.webp', '.png']);
    if (!videoFile) throw new Error('Download hua lekin video file nahi mili.');

    let thumbnailFile = findFile(THUMB_DIR, video.youtubeId);
    if (!thumbnailFile) {
      const thumbInVideoDir = fs
        .readdirSync(VIDEO_DIR)
        .find((f) => f.startsWith(video.youtubeId + '.') && /\.(jpg|jpeg|webp|png)$/i.test(f));
      if (thumbInVideoDir) {
        fs.renameSync(path.join(VIDEO_DIR, thumbInVideoDir), path.join(THUMB_DIR, thumbInVideoDir));
        thumbnailFile = thumbInVideoDir;
      }
    }

    const stats = fs.statSync(path.join(VIDEO_DIR, videoFile));

    video.title = info.title || video.title || video.youtubeUrl;
    video.description = info.description || '';
    video.channel = info.uploader || info.channel || '';
    video.duration = info.duration || 0;
    video.videoFile = videoFile;
    video.thumbnailFile = thumbnailFile || '';
    video.fileSize = stats.size;
    video.status = 'ready';
    video.errorMessage = '';
    await video.save();
  } catch (err) {
    video.status = 'failed';
    video.errorMessage = String(err?.message || err).slice(0, 500);
    await video.save();
  }
}
