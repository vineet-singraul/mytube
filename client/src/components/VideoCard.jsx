import { Link } from 'react-router-dom';

function formatDuration(totalSeconds) {
  if (!totalSeconds) return '';
  const sec = Math.floor(totalSeconds);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const ss = String(s).padStart(2, '0');
  if (h) return `${h}:${String(m).padStart(2, '0')}:${ss}`;
  return `${m}:${ss}`;
}

export default function VideoCard({ video }) {
  return (
    <Link to={`/watch/${video._id}`} className="video-card">
      <div className="thumb-wrap">
        {video.thumbnailFile ? (
          <img src={`/thumbnails/${video.thumbnailFile}`} alt={video.title} loading="lazy" />
        ) : (
          <div className="thumb-placeholder">▶</div>
        )}
        <span className="duration-badge">{formatDuration(video.duration)}</span>
      </div>
      <div className="video-info">
        <p className="video-title">{video.title}</p>
        <p className="video-channel">{video.channel}</p>
      </div>
    </Link>
  );
}
