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

// On-demand: sirf jab user "Download" dabaye tab hi video file banti hai,
// server par permanently store nahi hoti — response ke baad turant delete.
export async function downloadVideoToTempFile(youtubeUrl) {
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
