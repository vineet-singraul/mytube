import { Link } from 'react-router-dom';

export default function VideoCard({ video }) {
  return (
    <Link to={`/watch/${video._id}`} className="video-card">
      <div className="thumb-wrap">
        {video.thumbnail ? (
          <img src={video.thumbnail} alt={video.title} loading="lazy" />
        ) : (
          <div className="thumb-placeholder">▶</div>
        )}
      </div>
      <div className="video-info">
        <p className="video-title">{video.title}</p>
        <p className="video-channel">{video.channel}</p>
      </div>
    </Link>
  );
}
