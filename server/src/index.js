import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { connectDB } from './config/db.js';
import { CLIENT_DIST } from './config/paths.js';
import videoRoutes from './routes/videos.js';
import adminRoutes from './routes/admin.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/videos', videoRoutes);
app.use('/api/admin', adminRoutes);
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Temporary diagnostic — cookies.txt setup verify karne ke liye.
app.get('/api/debug/cookies', (req, res) => {
  const p = process.env.COOKIES_PATH || '(not set)';
  const exists = process.env.COOKIES_PATH ? fs.existsSync(process.env.COOKIES_PATH) : false;
  let size = null;
  if (exists) size = fs.statSync(process.env.COOKIES_PATH).size;
  let secretsDir = '(no /etc/secrets dir)';
  if (fs.existsSync('/etc/secrets')) {
    secretsDir = fs.readdirSync('/etc/secrets').map((name) => {
      const full = `/etc/secrets/${name}`;
      try {
        const st = fs.statSync(full);
        return st.isDirectory() ? { name, dir: fs.readdirSync(full) } : { name, file: true };
      } catch (e) {
        return { name, error: String(e.message) };
      }
    });
  }
  res.json({ COOKIES_PATH: p, exists, size, secretsDir });
});

// Production build me React app isi server se serve hoti hai (ek hi port).
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
