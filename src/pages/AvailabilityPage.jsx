// 1. AvailabilityPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import CalendarGrid from '../components/CalendarGrid';
import ReservationModal from '../components/ReservationModal';
import NewReservationModal from '../components/NewReservationModal';
import './AvailabilityPage.css';

function AvailabilityPage() {
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear] = useState(new Date().getFullYear());
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [search, setSearch] = useState('');
  const [editReservation, setEditReservation] = useState(null);

  const userId = localStorage.getItem('userId');

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get(`/rooms?userId=${userId}`);
        setRooms(res.data);
      } catch (err) {
        console.error('Oda verileri alınamadı:', err);
      }
    };

    const fetchReservations = async () => {
      try {
        const res = await api.get(`/reservations?userId=${userId}`);
        setReservations(res.data);
        localStorage.setItem('reservations', JSON.stringify(res.data));
      } catch (err) {
        console.error('Rezervasyon verileri alınamadı:', err);
      }
    };

    fetchRooms();
    fetchReservations();
  }, [userId]);

  const filteredReservations = reservations.filter((res) => {
    const checkInDate = new Date(res.checkIn);
    const roomMatch = selectedRoom ? res.roomNo === selectedRoom : true;
    const monthMatch = checkInDate.getMonth() === selectedMonth;
    const searchMatch = res.customer?.toLowerCase().includes(search.toLowerCase());
    return roomMatch && monthMatch && searchMatch;
  });

  const handleDayClick = (day, status, reservation) => {
    const clickedDate = new Date(selectedYear, selectedMonth, day, 12);
    if (status === 'dolu') {
      setSelectedReservation(reservation);
    } else {
      setSelectedDate(clickedDate);
    }
  };

  const closeModals = () => {
    setSelectedReservation(null);
    setSelectedDate(null);
    setEditReservation(null);
  };

  const handleReservationAdded = (newReservation) => {
    const updated = [...reservations, newReservation];
    setReservations(updated);
    localStorage.setItem('reservations', JSON.stringify(updated));
  };

  const handleEditRedirect = (res) => {
    setEditReservation(res);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Bu rezervasyonu silmek istediğinizden emin misiniz?');
    if (!confirmDelete) return;

    try {
      await api.delete(`/reservations/${id}`);
      const updated = reservations.filter(r => r._id !== id);
      setReservations(updated);
      localStorage.setItem('reservations', JSON.stringify(updated));
    } catch (error) {
      console.error('Silme hatası:', error);
    }
  };

  const handleReservationUpdated = (updatedReservation) => {
    const updated = reservations.map((res) =>
      res._id === updatedReservation._id ? updatedReservation : res
    );
    setReservations(updated);
    localStorage.setItem('reservations', JSON.stringify(updated));
    setEditReservation(null);
  };

  return (
    <div className="availability-container">
      <h2>Müsaitlik Takvimi</h2>

      <div className="filters">
        <select
          value={selectedRoom}
          onChange={(e) => setSelectedRoom(e.target.value)}>
          <option value="">Tüm Odalar</option>
          {rooms.map((room) => (
            <option key={room._id} value={room.roomNo}>
              {room.roomNo} - {room.roomName}
            </option>
          ))}
        </select>

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
          {monthNames.map((month, index) => (
            <option key={index} value={index}>{month}</option>
          ))}
        </select>
      </div>

      <h3>Takvim Görünümü</h3>
      <CalendarGrid
        year={selectedYear}
        month={selectedMonth}
        reservations={filteredReservations}
        onDayClick={handleDayClick}
      />

      <h3 style={{ marginTop: '40px' }}>Rezervasyon Listesi</h3>

      <div className="table-header-controls">
        <input
          className="search-input"
          type="text"
          placeholder="Müşteri Ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table className="availability-table">
        <thead>
          <tr>
            <th>Oda No</th>
            <th>Müşteri</th>
            <th>Giriş</th>
            <th>Çıkış</th>
            <th>Durum</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {filteredReservations.map((res, index) => (
            <tr key={index}>
              <td>{res.roomNo}</td>
              <td>{res.customer}</td>
              <td>{format(new Date(res.checkIn), 'dd MMMM yyyy', { locale: tr })}</td>
              <td>{format(new Date(res.checkOut), 'dd MMMM yyyy', { locale: tr })}</td>
              <td className="status-full">Dolu</td>
              <td className="action-buttons">
                <button type="button" className="edit" onClick={() => handleEditRedirect(res)}>Düzenle</button>
                <button type="button" className="delete" onClick={() => handleDelete(res._id)}>Sil</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedReservation && (
        <ReservationModal reservation={selectedReservation} onClose={closeModals} onUpdate={handleReservationUpdated} />
      )}
      {selectedDate && (
        <NewReservationModal
          date={selectedDate}
          selectedRoom={selectedRoom}
          onClose={closeModals}
          onReservationAdded={handleReservationAdded}
        />
      )}
      {editReservation && (
        <ReservationModal
          reservation={editReservation}
          onClose={closeModals}
          onUpdate={handleReservationUpdated}
        />
      )}
    </div>
  );
}

export default AvailabilityPage;
