import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client.js';
import VideoCard from '../components/VideoCard.jsx';
import DownloadButton from '../components/DownloadButton.jsx';

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
        <iframe
          key={video._id}
          className="video-player"
          src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0&autoplay=1`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        <h1 className="watch-title">{video.title}</h1>
        <p className="watch-channel">{video.channel}</p>
        <DownloadButton video={video} />
      </div>
      <div className="related-col">
        {related.map((v) => (
          <VideoCard key={v._id} video={v} />
        ))}
      </div>
    </div>
  );
}
