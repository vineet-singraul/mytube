import { useEffect, useState } from 'react';
import api from '../api/client.js';
import VideoCard from '../components/VideoCard.jsx';

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get('/videos', { params: q ? { q } : {} })
      .then((res) => {
        if (active) setVideos(res.data);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [q]);

  return (
    <div className="home">
      <div className="search-bar">
        <input placeholder="Videos khojein..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {loading ? (
        <p className="empty-state">Load ho raha hai...</p>
      ) : videos.length === 0 ? (
        <p className="empty-state">Abhi koi video nahi hai. Admin panel se videos add karein.</p>
      ) : (
        <div className="video-grid">
          {videos.map((v) => (
            <VideoCard key={v._id} video={v} />
          ))}
        </div>
      )}
    </div>
  );
}
