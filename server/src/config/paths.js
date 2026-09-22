import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// server/src/config -> server/
export const SERVER_ROOT = path.resolve(__dirname, '../..');
export const CLIENT_DIST = path.resolve(SERVER_ROOT, '..', 'client', 'dist');
