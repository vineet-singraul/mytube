import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client.js';
import VideoCard from '../components/VideoCard.jsx';

export default function Watch() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    setVideo(null);
    api.get(`/videos/${id}`).then((res) => setVideo(res.data));
    api.get('/videos').then((res) => setRelated(res.data.filter((v) => v._id !== id)));
  }, [id]);

  if (!video) return <p className="empty-state">Load ho raha hai...</p>;

  return (
    <div className="watch-page">
      <div className="player-col">
        <video
          key={video._id}
          src={`/api/videos/${video._id}/stream`}
          controls
          autoPlay
          className="video-player"
        />
        <h1 className="watch-title">{video.title}</h1>
        <p className="watch-channel">{video.channel}</p>
        {video.description && <p className="watch-description">{video.description}</p>}
      </div>
      <div className="related-col">
        {related.map((v) => (
          <VideoCard key={v._id} video={v} />
        ))}
      </div>
    </div>
  );
}
