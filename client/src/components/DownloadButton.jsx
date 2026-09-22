import { useEffect, useRef, useState } from 'react';
import { saveOfflineVideo, getOfflineVideo, deleteOfflineVideo } from '../db/offlineStore.js';

export default function DownloadButton({ video }) {
  const [state, setState] = useState('checking'); // checking | idle | preparing | downloading | done | error
  const [progress, setProgress] = useState(0);
  const pollRef = useRef(null);

  useEffect(() => {
    getOfflineVideo(video._id).then((existing) => setState(existing ? 'done' : 'idle'));
    return () => clearInterval(pollRef.current);
  }, [video._id]);

  async function fetchAndStore() {
    setState('downloading');
    setProgress(0);
    const res = await fetch(`/api/videos/${video._id}/download/file`);
    if (!res.ok) throw new Error('file fetch failed');

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
  }

  async function handleDownload() {
    setState('preparing');
    try {
      const startRes = await fetch(`/api/videos/${video._id}/download/start`, { method: 'POST' });
      if (!startRes.ok) throw new Error('start failed');

      pollRef.current = setInterval(async () => {
        const statusRes = await fetch(`/api/videos/${video._id}/download/status`);
        const data = await statusRes.json();

        if (data.status === 'ready') {
          clearInterval(pollRef.current);
          try {
            await fetchAndStore();
          } catch {
            setState('error');
          }
        } else if (data.status === 'failed') {
          clearInterval(pollRef.current);
          setState('error');
        }
        // 'pending' ya 'idle' hone par polling jaari rehti hai
      }, 3000);
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

  if (state === 'preparing') {
    return <button disabled>Taiyar ho raha hai... (1-3 minute lag sakte hain)</button>;
  }

  if (state === 'downloading') {
    return <button disabled>Phone me save ho raha hai... {progress}%</button>;
  }

  if (state === 'error') {
    return <button onClick={handleDownload}>Fail — Dobara Try Karein</button>;
  }

  return <button onClick={handleDownload}>⬇ Offline Download Karein</button>;
}
