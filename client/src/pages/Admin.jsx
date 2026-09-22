import { useEffect, useState } from 'react';
import api, { getAdminKey, setAdminKey } from '../api/client.js';
import ShareQR from '../components/ShareQR.jsx';

export default function Admin() {
  const [keyInput, setKeyInput] = useState(getAdminKey());
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [urls, setUrls] = useState('');
  const [videos, setVideos] = useState([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  async function tryUnlock(k) {
    setAdminKey(k);
    try {
      await api.get('/admin/videos');
      setUnlocked(true);
      setMessage('');
    } catch {
      setUnlocked(false);
      setMessage('Galat admin key.');
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    tryUnlock(getAdminKey());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadVideos() {
    const res = await api.get('/admin/videos');
    setVideos(res.data);
  }

  useEffect(() => {
    if (unlocked) loadVideos();
  }, [unlocked]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    setMessage('Add ho raha hai...');
    try {
      const res = await api.post('/admin/videos', { urls });
      const added = res.data.results.filter((r) => r.status === 'added').length;
      const exists = res.data.results.filter((r) => r.status === 'already_exists').length;
      const invalid = res.data.results.filter((r) => r.status === 'invalid').length;
      const failed = res.data.results.filter((r) => r.status === 'failed').length;
      setMessage(
        `${added} video(s) add ho gaye. ${exists} pehle se maujood the. ${invalid} link invalid the. ${failed} fail ho gaye.`
      );
      setUrls('');
      await loadVideos();
    } catch {
      setMessage('Kuch galat ho gaya, dobara try karein.');
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Ye video delete karein?')) return;
    await api.delete(`/admin/videos/${id}`);
    setVideos((v) => v.filter((x) => x._id !== id));
  }

  if (checking) return <p className="empty-state">Check ho raha hai...</p>;

  if (!unlocked) {
    return (
      <div className="admin-login">
        <h2>Admin Login</h2>
        <p className="hint-text">Ye account signup nahi hai — sirf ek secret key (.env me ADMIN_KEY) hai.</p>
        <input
          type="password"
          placeholder="Admin key"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
        />
        <button onClick={() => tryUnlock(keyInput)}>Enter</button>
        {message && <p className="error-text">{message}</p>}
      </div>
    );
  }

  return (
    <div className="admin-page">
      <ShareQR />
      <h2>Admin Panel — Videos Add Karein</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          rows={6}
          placeholder={'Ek ya multiple YouTube links yahan paste karein, har link naye line me:\nhttps://youtube.com/watch?v=...\nhttps://youtu.be/...'}
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
        />
        <button type="submit" disabled={sending || !urls.trim()}>
          {sending ? 'Add ho raha hai...' : 'Videos Add Karein'}
        </button>
      </form>
      {message && <p className="status-text">{message}</p>}

      <h3>Sabhi Videos ({videos.length})</h3>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {videos.map((v) => (
            <tr key={v._id}>
              <td>{v.title || v.youtubeUrl}</td>
              <td>
                <span className={`badge badge-${v.status}`}>{v.status === 'ready' ? 'Ready' : 'Fail'}</span>
                {v.status === 'failed' && v.errorMessage && <div className="error-text">{v.errorMessage}</div>}
              </td>
              <td>
                <button className="danger" onClick={() => handleDelete(v._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
