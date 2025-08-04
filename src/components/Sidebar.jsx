// src/components/Sidebar.jsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './sidebar.css';

export default function Sidebar({ onLogout }) {
  const [open, setOpen] = useState(true);

  const linkClass = ({ isActive }) =>
    isActive ? 'sidebar-link active' : 'sidebar-link';

  return (
    <aside className={`sidebar${open ? '' : ' closed'}`}>
      <button
        className="sidebar-toggle"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? 'Menüyü Kapat' : 'Menüyü Aç'}
      >
        {open ? '✖' : '☰'}
      </button>

      <nav>
        <NavLink to="/dashboard" className={linkClass}>
          <span role="img" aria-label="ev">🏠</span>
          <span className="link-text">Ana Sayfa</span>
        </NavLink>
        <NavLink to="/reservations" className={linkClass}>
          <span role="img" aria-label="takvim">📋</span>
          <span className="link-text">Rezervasyonlar</span>
        </NavLink>
        <NavLink to="/musaitlik" className={linkClass}>
          <span role="img" aria-label="takvim">📅</span>
          <span className="link-text">Müsaitlik</span>
        </NavLink>
        <NavLink to="/rooms" className={linkClass}>
          <span role="img" aria-label="oda">🏡</span>
          <span className="link-text">Odalar</span>
        </NavLink>
        <NavLink to="/on-muhasebe" className={linkClass}>
          <span role="img" aria-label="para">💰</span>
          <span className="link-text">Ön Muhasebe</span>
        </NavLink>
        <NavLink to="/acenteler" className={linkClass}>
          <span role="img" aria-label="globe">🌐</span>
          <span className="link-text">Acenteler</span>
        </NavLink>
        <NavLink to="/ayarlar" className={linkClass}>
          <span role="img" aria-label="ayar">⚙️</span>
          <span className="link-text">Ayarlar</span>
        </NavLink>

        {/* Telegram menüsü eklendi */}
        <NavLink to="/telegram-settings" className={linkClass}>
          <span role="img" aria-label="telegram">✈️</span>
          <span className="link-text">Telegram</span>
        </NavLink>
      </nav>

      {/* 🔴 Çıkış Yap Butonu */}
      <div className="logout-wrapper">
        <button className="logout-button" onClick={onLogout}>
          <span role="img" aria-label="çıkış">🚪</span>
          <span className="link-text">Çıkış Yap</span>
        </button>
      </div>
    </aside>
  );
}
