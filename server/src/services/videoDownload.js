import ytDlpWrapPkg from 'yt-dlp-wrap-plus';
const YTDlpWrap = ytDlpWrapPkg.default || ytDlpWrapPkg;
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import ffmpegPath from 'ffmpeg-static';
import { TMP_DIR, YTDLP_BIN_PATH } from '../config/paths.js';

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

async function downloadToTempFile(youtubeUrl) {
  const ytdlp = await ensureBinary();
  const id = randomUUID();
  const outTemplate = path.join(TMP_DIR, `${id}.%(ext)s`);

  await ytdlp.execPromise([
    youtubeUrl,
    '-o',
    outTemplate,
    '-f',
    `bestvideo[height<=${MAX_HEIGHT}]+bestaudio/best[height<=${MAX_HEIGHT}]/best`,
    '--merge-output-format',
    'mp4',
    '--ffmpeg-location',
    ffmpegPath,
    '--no-playlist',
    '--no-warnings',
    '--no-check-certificates',
  ]);

  const file = fs.readdirSync(TMP_DIR).find((f) => f.startsWith(id + '.') && !f.endsWith('.part'));
  if (!file) throw new Error('Download hua lekin file nahi mili.');
  return path.join(TMP_DIR, file);
}

// Render jaisi free hosting par ek single HTTP request ~100 second ke baad
// khud hi timeout kar deti hai — yt-dlp+ffmpeg (kam CPU wale free plan par)
// itni der me poora nahi hota. Isliye download ko background job ki tarah
// chalate hain: turant "started" bol dete hain, client status poll karta
// rehta hai, aur jab file taiyar ho jaaye tab ek alag (fast) request se
// file serve hoti hai.
const jobs = new Map();

export function getJobStatus(videoId) {
  return jobs.get(videoId) || null;
}

export function startDownloadJob(videoId, youtubeUrl) {
  const existing = jobs.get(videoId);
  if (existing && (existing.status === 'pending' || existing.status === 'ready')) {
    return existing;
  }

  const job = { status: 'pending', filePath: null, error: null };
  jobs.set(videoId, job);

  downloadToTempFile(youtubeUrl)
    .then((filePath) => {
      job.filePath = filePath;
      job.status = 'ready';
    })
    .catch((err) => {
      job.status = 'failed';
      job.error = String(err?.message || err).slice(0, 2000);
      console.error('Download job failed:', err);
    });

  return job;
}

export function clearJob(videoId) {
  const job = jobs.get(videoId);
  if (job?.filePath) fs.unlink(job.filePath, () => {});
  jobs.delete(videoId);
}
