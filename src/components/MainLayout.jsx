// src/components/MainLayout.jsx
import React from 'react';
import Sidebar from './Sidebar';
import { Outlet, useNavigate } from 'react-router-dom';
import '../styles/MainLayout.css';

function MainLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Local storage'dan token ve user bilgilerini temizle
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Login sayfasına yönlendir
    navigate('/');
  };

  return (
    <div className="app-wrapper">
      <Sidebar onLogout={handleLogout} /> {/* logout fonksiyonu Sidebar'a iletildi */}
      <div className="content-wrapper">
        <Outlet />
      </div>
    </div>
  );
}

export default MainLayout;