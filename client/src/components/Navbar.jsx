import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="logo">
        <span className="logo-icon">▶</span> MyTube
      </Link>
      <Link to="/admin" className="admin-link">
        Admin
      </Link>
    </header>
  );
}
