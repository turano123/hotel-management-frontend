// frontend/src/components/Layout.jsx
import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

function classNames(...xs) {
  return xs.filter(Boolean).join(' ')
}

const MENUS = {
  MASTER_ADMIN: [
    { to: '/', label: 'Dashboard', exact: true },
    { to: '/master/hotels', label: 'Oteller' },
  ],
  DEFAULT_HOTEL: [
    { to: '/', label: 'Dashboard', exact: true },
    { to: '/hotel/reservations', label: 'Rezervasyonlar' },
    { to: '/hotel/finance', label: 'Gelir-Gider' },
    { to: '/hotel/channels', label: 'Kanallar' },
    { to: '/hotel/rooms', label: 'Odalar' }, // 👈 yeni
  ],
}

function roleLabel(role) {
  if (role === 'MASTER_ADMIN') return 'Master Admin'
  if (role === 'HOTEL_ADMIN') return 'Otel Admin'
  if (role === 'HOTEL_STAFF') return 'Personel'
  return role || 'Kullanıcı'
}

export default function Layout({ children, role }) {
  const navigate = useNavigate()
  const email = localStorage.getItem('email') || ''
  const initials = (email || role || '?')
    .toString()
    .trim()
    .slice(0, 1)
    .toUpperCase()

  const logout = () => {
    // İleride sadece auth anahtarlarını silmek istersen burada seçici temizleyebilirsin.
    localStorage.clear()
    navigate('/login', { replace: true })
  }

  const menu =
    role === 'MASTER_ADMIN'
      ? MENUS.MASTER_ADMIN
      : MENUS.DEFAULT_HOTEL

  const today = new Date()
  const dayFormatter = new Intl.DateTimeFormat('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  const formattedDate = dayFormatter.format(today)
  const prettyDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="brand" title="HMS & Channels">
            <span className="dot" />
            <div className="brand-text">
              <span className="brand-title">HMS & Channels</span>
              <span className="brand-subtitle">Konuk deneyimini yönetin</span>
            </div>
          </div>

          {/* Kullanıcı kutusu */}
          <div className="userbox" aria-label="Oturum bilgileri">
            <div className="avatar" aria-hidden>{initials}</div>
            <div className="user-meta">
              <div className="user-email" title={email}>{email || '—'}</div>
              <div className="user-role">{roleLabel(role)}</div>
            </div>
          </div>
        </div>

        {/* Navigasyon */}
        <nav className="nav" aria-label="Ana navigasyon">
          <ul className="nav-group">
            {menu.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={!!item.exact}
                  className={({ isActive }) =>
                    classNames('nav-link', isActive && 'active')
                  }
                >
                  <span className="nav-indicator" aria-hidden />
                  <span className="nav-label">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={logout}
            className="nav-link logout"
            aria-label="Çıkış yap"
          >
            <span className="nav-indicator" aria-hidden />
            <span className="nav-label">Çıkış</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-date" aria-label="Bugünün tarihi">
            {prettyDate}
          </div>
          <p>Misafirleriniz için her günü özel kılın.</p>
        </div>
      </aside>

      {/* İçerik */}
      <div className="main">
        <header className="header">
          <div className="header-greeting">
            <span className="header-eyebrow">Hoş geldiniz</span>
            <span className="header-title">{email || 'Kontrol Paneli'}</span>
          </div>
          <div className="header-right">
            <span className="header-role">{roleLabel(role)}</span>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  )
}
