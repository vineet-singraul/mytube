import { useEffect, useState } from 'react';
import { saveOfflineVideo, getOfflineVideo, deleteOfflineVideo } from '../db/offlineStore.js';

export default function DownloadButton({ video }) {
  const [state, setState] = useState('checking'); // checking | idle | downloading | done | error
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    getOfflineVideo(video._id).then((existing) => setState(existing ? 'done' : 'idle'));
  }, [video._id]);

  async function handleDownload() {
    setState('downloading');
    setProgress(0);
    try {
      const res = await fetch(`/api/videos/${video._id}/download`);
      if (!res.ok) throw new Error('download failed');

      const total = Number(res.headers.get('Content-Length')) || 0;
      const reader = res.body.getReader();
      const chunks = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        if (total) setProgress(Math.round((received / total) * 100));
      }

      const videoBlob = new Blob(chunks, { type: 'video/mp4' });

      let thumbnailBlob = null;
      try {
        const thumbRes = await fetch(video.thumbnail);
        thumbnailBlob = await thumbRes.blob();
      } catch {
        // thumbnail na mile to bhi video save ho jaaye
      }

      await saveOfflineVideo({
        id: video._id,
        title: video.title,
        channel: video.channel,
        videoBlob,
        thumbnailBlob,
      });

      setState('done');
    } catch {
      setState('error');
    }
  }

  async function handleDelete() {
    await deleteOfflineVideo(video._id);
    setState('idle');
  }

  if (state === 'checking') return null;

  if (state === 'done') {
    return (
      <button className="danger" onClick={handleDelete}>
        Downloaded ✓ (Hatayein)
      </button>
    );
  }

  if (state === 'downloading') {
    return <button disabled>Download ho raha hai... {progress}%</button>;
  }

  if (state === 'error') {
    return <button onClick={handleDownload}>Fail — Dobara Try Karein</button>;
  }

  return <button onClick={handleDownload}>⬇ Offline Download Karein</button>;
}
