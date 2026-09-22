import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const SERVER_ROOT = path.resolve(__dirname, '../..');
export const CLIENT_DIST = path.resolve(SERVER_ROOT, '..', 'client', 'dist');
export const TMP_DIR = path.join(SERVER_ROOT, 'tmp');
export const BIN_DIR = path.join(SERVER_ROOT, 'bin');
export const YTDLP_BIN_PATH = path.join(BIN_DIR, os.platform() === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');

fs.mkdirSync(TMP_DIR, { recursive: true });
fs.mkdirSync(BIN_DIR, { recursive: true });
