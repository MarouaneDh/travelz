import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import MomentDetail from './pages/MomentDetail.jsx';
import Profile from './pages/Profile.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Studio from './pages/Studio.jsx';
import './app.css';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/moment/:id" element={<MomentDetail />} />
      <Route path="/u/:username" element={<Profile />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/studio" element={<Studio />} />
      <Route path="/admin" element={<Navigate to="/studio" replace />} />
    </Routes>
  );
}
