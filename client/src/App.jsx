import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import MomentDetail from './pages/MomentDetail.jsx';
import Admin from './pages/Admin.jsx';
import './app.css';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/moment/:id" element={<MomentDetail />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}
