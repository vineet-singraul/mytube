import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import InstallPrompt from './components/InstallPrompt.jsx';
import Home from './pages/Home.jsx';
import Watch from './pages/Watch.jsx';
import Admin from './pages/Admin.jsx';

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <InstallPrompt />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/watch/:id" element={<Watch />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
    </div>
  );
}
