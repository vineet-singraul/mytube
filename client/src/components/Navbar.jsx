import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="logo">
        <span className="logo-icon">▶</span> MyTube
      </Link>
      <div className="nav-links">
        <Link to="/downloads" className="admin-link">
          Downloads
        </Link>
        <Link to="/admin" className="admin-link">
          Admin
        </Link>
      </div>
    </header>
  );
}
