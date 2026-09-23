import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { connectDB } from './config/db.js';
import { CLIENT_DIST, THUMB_DIR } from './config/paths.js';
import videoRoutes from './routes/videos.js';
import adminRoutes from './routes/admin.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/thumbnails', express.static(THUMB_DIR));

app.use('/api/videos', videoRoutes);
app.use('/api/admin', adminRoutes);
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Production build me React app isi server se serve hoti hai (ek hi port,
// offline machine par simple deployment ke liye).
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get('*', (req, res) => {
    res.sendFile(`${CLIENT_DIST}/index.html`);
  });
}

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server chal raha hai: http://0.0.0.0:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB se connect nahi ho paya:', err.message);
    process.exit(1);
  });
