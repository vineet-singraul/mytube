import { useEffect, useState } from 'react';
import { getAllOfflineVideos, deleteOfflineVideo } from '../db/offlineStore.js';

export default function Downloads() {
  const [videos, setVideos] = useState(null);
  const [playing, setPlaying] = useState(null);
  const [playUrl, setPlayUrl] = useState('');

  useEffect(() => {
    getAllOfflineVideos().then(setVideos);
  }, []);

  function openVideo(v) {
    const url = URL.createObjectURL(v.videoBlob);
    setPlayUrl(url);
    setPlaying(v);
  }

  function closePlayer() {
    if (playUrl) URL.revokeObjectURL(playUrl);
    setPlayUrl('');
    setPlaying(null);
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    await deleteOfflineVideo(id);
    setVideos((list) => list.filter((v) => v.id !== id));
  }

  if (playing) {
    return (
      <div className="watch-page">
        <div className="player-col">
          <video src={playUrl} controls autoPlay className="video-player" />
          <h1 className="watch-title">{playing.title}</h1>
          <p className="watch-channel">{playing.channel}</p>
          <button onClick={closePlayer}>← Wapas Downloads Par Jaayein</button>
        </div>
      </div>
    );
  }

  if (videos === null) return <p className="empty-state">Load ho raha hai...</p>;

  if (videos.length === 0) {
    return <p className="empty-state">Abhi koi video download nahi hua. Kisi bhi video par "Offline Download Karein" dabayein.</p>;
  }

  return (
    <div className="home">
      <h2>Aapke Downloads</h2>
      <p className="hint-text">Ye videos bina internet ke bhi chalenge.</p>
      <div className="video-grid">
        {videos.map((v) => (
          <div key={v.id} className="video-card" onClick={() => openVideo(v)} role="button" tabIndex={0}>
            <div className="thumb-wrap">
              {v.thumbnailBlob ? (
                <img src={URL.createObjectURL(v.thumbnailBlob)} alt={v.title} />
              ) : (
                <div className="thumb-placeholder">▶</div>
              )}
            </div>
            <div className="video-info">
              <p className="video-title">{v.title}</p>
              <p className="video-channel">{v.channel}</p>
              <button className="danger" onClick={(e) => handleDelete(v.id, e)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
