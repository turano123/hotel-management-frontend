import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import api from '../api/axiosInstance';
import CalendarGrid from '../components/CalendarGrid';
import ReservationModal from '../components/ReservationModal';
import './DashboardPage.css';

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(true);
  const [reservations, setReservations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedReservation, setSelectedReservation] = useState(null);

  const toggleMenu = () => setMenuOpen(prev => !prev);

  const normalizeDate = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
  };

  const today = normalizeDate(new Date());
  const userId = localStorage.getItem('userId'); // 🔑 Kullanıcı ID alındı

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    try {
      const parsedUser =
        storedUser && storedUser !== 'undefined' ? JSON.parse(storedUser) : null;
      setUser(parsedUser);
    } catch (error) {
      console.error('Kullanıcı verisi çözülemedi:', error);
      setUser(null);
    }

    const fetchData = async () => {
      try {
        const [resRooms, resReservations] = await Promise.all([
          api.get(`/rooms?userId=${userId}`), // 🎯 Kullanıcıya özel odalar
          api.get(`/reservations?userId=${userId}`), // 🎯 Kullanıcıya özel rezervasyonlar
        ]);
        setRooms(resRooms.data);
        setReservations(resReservations.data);
      } catch (err) {
        console.error('Veriler alınamadı:', err);
      }
    };

    if (userId) fetchData();
  }, [userId]);

  const todaysCheckIns = reservations.filter(r => normalizeDate(r.checkIn) === today);
  const todaysCheckOuts = reservations.filter(r => normalizeDate(r.checkOut) === today);
  const activeStays = reservations.filter(r =>
    normalizeDate(r.checkIn) <= today && normalizeDate(r.checkOut) > today
  );

  const filteredReservations = selectedRoom
    ? reservations.filter(r => r.roomNo === selectedRoom)
    : reservations;

  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const handleDayClick = (day, status, reservation) => {
    if (status === 'dolu' && reservation) {
      setSelectedReservation(reservation);
    }
  };

  const closeModal = () => {
    setSelectedReservation(null);
  };

  return (
    <div className="dashboard-container">
      <div className="toggle-button" onClick={toggleMenu}>
        {menuOpen ? <FaTimes /> : <FaBars />}
      </div>

      <aside className={`sidebar ${menuOpen ? 'open' : 'closed'}`}>
        <ul className="menu">
          <li><Link to="/"><span role="img" aria-label="home">🏠</span> {menuOpen && 'Ana Sayfa'}</Link></li>
          <li><Link to="/check-in-out"><span role="img" aria-label="door">🚪</span> {menuOpen && 'Giriş / Çıkış'}</Link></li>
          <li><Link to="/reservations"><span role="img" aria-label="calendar">📅</span> {menuOpen && 'Rezervasyonlar'}</Link></li>
          <li><Link to="/availability"><span role="img" aria-label="calendar">📆</span> {menuOpen && 'Müsaitlik'}</Link></li>
          <li><Link to="/rooms"><span role="img" aria-label="house">🏠</span> {menuOpen && 'Odalar'}</Link></li>
          <li><Link to="/accounting"><span role="img" aria-label="money">💰</span> {menuOpen && 'Ön Muhasebe'}</Link></li>
          <li><Link to="/agencies"><span role="img" aria-label="globe">🌐</span> {menuOpen && 'Acenteler'}</Link></li>
          <li><Link to="/settings"><span role="img" aria-label="gear">⚙️</span> {menuOpen && 'Ayarlar'}</Link></li>
          <li><Link to="/support"><span role="img" aria-label="tools">🛠️</span> {menuOpen && 'Destek'}</Link></li>
        </ul>
      </aside>

      <main className="dashboard-main">
        <h1>🎉 Hoş geldiniz, {user?.email?.split('@')[0] || 'Misafir'}!</h1>

        <div className="grid-container">
          <section className="grid-item giriş">
            <h2>📥 Bugün Girecek Misafirler</h2>
            {todaysCheckIns.length === 0 ? (
              <p className="empty">Bugün giriş yapacak misafir yok.</p>
            ) : (
              <ul>{todaysCheckIns.map((r, i) => <li key={i}>{r.customer} — Oda {r.roomNo}</li>)}</ul>
            )}
          </section>

          <section className="grid-item çıkış">
            <h2>📤 Bugün Çıkacak Misafirler</h2>
            {todaysCheckOuts.length === 0 ? (
              <p className="empty">Bugün çıkış yapacak misafir yok.</p>
            ) : (
              <ul>{todaysCheckOuts.map((r, i) => <li key={i}>{r.customer} — Oda {r.roomNo}</li>)}</ul>
            )}
          </section>

          <section className="grid-item aktif">
            <h2>🏨 Aktif Konaklayanlar</h2>
            {activeStays.length === 0 ? (
              <p className="empty">Aktif konaklama yok.</p>
            ) : (
              <ul>{activeStays.map((r, i) => <li key={i}>{r.customer} — Oda {r.roomNo}</li>)}</ul>
            )}
          </section>

          <section className="grid-item takvim">
            <h2>📅 Müsaitlik Takvimi</h2>

            <label><strong>Oda Seç:</strong></label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              style={{ width: '100%', padding: '6px', borderRadius: '6px', marginBottom: '10px' }}
            >
              <option value="">Tüm Odalar</option>
              {rooms.map((room) => (
                <option key={room._id} value={room.roomNo}>
                  {room.roomNo} - {room.roomName}
                </option>
              ))}
            </select>

            <label><strong>Ay Seç:</strong></label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              style={{ width: '100%', padding: '6px', borderRadius: '6px', marginBottom: '10px' }}
            >
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>

            <CalendarGrid
              year={selectedYear}
              month={selectedMonth}
              reservations={filteredReservations}
              onDayClick={handleDayClick}
            />
          </section>
        </div>

        {selectedReservation && (
          <ReservationModal
            reservation={selectedReservation}
            onClose={closeModal}
            onUpdate={() => {}}
          />
        )}
      </main>
    </div>
  );
}

export default DashboardPage;
