import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import './ReservationsPage.css';
import ReservationModal from '../components/ReservationModal';
import * as XLSX from 'xlsx';

function ReservationsPage() {
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [editable, setEditable] = useState(false);
  const [filters, setFilters] = useState({
    roomNo: '',
    customer: '',
    checkIn: '',
    checkOut: ''
  });

  const [reservation, setReservation] = useState({
    roomNo: '',
    customer: '',
    checkIn: '',
    checkOut: '',
    total: '',
    deposit: '',
    remaining: '',
    reference: '',
    pension: '',
    adults: '',
    children: '',
    phone: '',
    nationality: '',
    tcNo: '',
    passportNo: '',
    extraRequestChecked: false,
    extraDescription: '',
    extraPrice: ''
  });

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchRooms();
    fetchReservations();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await api.get(`/rooms?userId=${userId}`);
      setRooms(response.data);
    } catch (error) {
      console.error('Oda verileri alınamadı:', error);
    }
  };

  const fetchReservations = async () => {
    try {
      const response = await api.get(`/reservations?userId=${userId}`);
      setReservations(response.data);
    } catch (error) {
      console.error('Rezervasyonlar alınamadı:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    const updatedReservation = {
      ...reservation,
      [name]: type === 'checkbox' ? checked : value
    };

    const total = parseFloat(name === 'total' ? value : updatedReservation.total || 0);
    const deposit = parseFloat(name === 'deposit' ? value : updatedReservation.deposit || 0);
    const extra = parseFloat(name === 'extraPrice' ? value : updatedReservation.extraPrice || 0);

    updatedReservation.remaining = (total + extra - deposit).toString();

    setReservation(updatedReservation);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reservation.roomNo || !reservation.customer || !reservation.checkIn || !reservation.checkOut || !reservation.total) {
      alert('Lütfen tüm zorunlu alanları doldurunuz.');
      return;
    }

    try {
      setLoading(true);
      await api.post('/reservations', { ...reservation, userId });
      alert('✅ Rezervasyon başarıyla kaydedildi!');
      setReservation({
        roomNo: '', customer: '', checkIn: '', checkOut: '', total: '', deposit: '', remaining: '', reference: '', pension: '',
        adults: '', children: '', phone: '', nationality: '', tcNo: '', passportNo: '', extraRequestChecked: false,
        extraDescription: '', extraPrice: ''
      });
      fetchReservations();
    } catch (error) {
      console.error('❌ Rezervasyon kaydedilemedi:', error);
      alert('❌ Hata oluştu. Rezervasyon kaydedilemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu rezervasyonu silmek istediğinize emin misiniz?")) return;
    try {
      await api.delete(`/reservations/${id}?userId=${userId}`);
      alert("Rezervasyon silindi.");
      fetchReservations();
    } catch (err) {
      alert("Hata oluştu, silinemedi.");
      console.error(err);
    }
  };

  const handleEdit = (reservation) => {
    setSelectedReservation(reservation);
    setEditable(true);
  };

  const handleUpdate = () => {
    fetchReservations();
    setSelectedReservation(null);
    setEditable(false);
  };

  const sendWhatsApp = (r) => {
    const phone = r.phone?.replace(/\D/g, '');
    const message = `Merhaba ${r.customer},\nRezervasyonunuz oluşturulmuştur.\nGiriş: ${r.checkIn?.slice(0,10)}\nÇıkış: ${r.checkOut?.slice(0,10)}\nTutar: ${r.total}₺\nİyi tatiller!`;
    if (!phone) return alert("Telefon numarası eksik!");
    const url = `https://wa.me/90${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(reservations);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rezervasyonlar");
    XLSX.writeFile(workbook, "rezervasyonlar.xlsx");
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const filteredReservations = reservations.filter((r) =>
    r.roomNo.toString().includes(filters.roomNo) &&
    r.customer.toLowerCase().includes(filters.customer.toLowerCase()) &&
    r.checkIn.includes(filters.checkIn) &&
    r.checkOut.includes(filters.checkOut)
  );

  return (
    <div className="reservations-container">
      <h2>➕ Yeni Rezervasyon</h2>
      <form onSubmit={handleSubmit} className="reservation-form">
        <label>Oda Seç:</label>
        <select name="roomNo" value={reservation.roomNo} onChange={handleChange} required>
          <option value="">Lütfen Oda Seçin</option>
          {rooms.map((room) => (
            <option key={room._id} value={room.roomNo}>
              {room.roomNo} - {room.name}
            </option>
          ))}
        </select>

        <input type="text" name="customer" placeholder="Müşteri Adı Soyadı" value={reservation.customer} onChange={handleChange} required />
        <input type="date" name="checkIn" value={reservation.checkIn} onChange={handleChange} required />
        <input type="date" name="checkOut" value={reservation.checkOut} onChange={handleChange} required />
        <input type="number" name="total" placeholder="Toplam Tutar" value={reservation.total} onChange={handleChange} required />
        <input type="number" name="deposit" placeholder="Kapora Tutarı" value={reservation.deposit} onChange={handleChange} />
        <input type="number" name="remaining" placeholder="Kalan Ödeme" value={reservation.remaining} readOnly />
        <input type="text" name="reference" placeholder="Referans Kaynağı" value={reservation.reference} onChange={handleChange} />

        <select name="pension" value={reservation.pension} onChange={handleChange}>
          <option value="">Pansiyon Tipi</option>
          <option value="Kahvaltı Dahil">Kahvaltı Dahil</option>
          <option value="Kahvaltı Hariç">Kahvaltı Hariç</option>
        </select>

        <input type="number" name="adults" placeholder="Yetişkin Sayısı" value={reservation.adults} onChange={handleChange} />
        <input type="number" name="children" placeholder="0-12 Yaş Çocuk Sayısı" value={reservation.children} onChange={handleChange} />
        <input type="text" name="phone" placeholder="İletişim Numarası" value={reservation.phone} onChange={handleChange} />

        <select name="nationality" value={reservation.nationality} onChange={handleChange}>
          <option value="">Uyruk Seçin</option>
          <option value="TC">Türkiye Cumhuriyeti</option>
          <option value="Foreign">Yabancı</option>
        </select>

        {reservation.nationality === 'TC' && (
          <input type="text" name="tcNo" placeholder="T.C. Kimlik No" value={reservation.tcNo} onChange={handleChange} />
        )}
        {reservation.nationality === 'Foreign' && (
          <input type="text" name="passportNo" placeholder="Pasaport No" value={reservation.passportNo} onChange={handleChange} />
        )}

        <label>
          <input type="checkbox" name="extraRequestChecked" checked={reservation.extraRequestChecked} onChange={handleChange} />
          Ekstra Talep Var
        </label>

        {reservation.extraRequestChecked && (
          <>
            <input type="text" name="extraDescription" placeholder="Ekstra Açıklama" value={reservation.extraDescription} onChange={handleChange} />
            <input type="number" name="extraPrice" placeholder="Ekstra Ücret" value={reservation.extraPrice} onChange={handleChange} />
          </>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Kaydediliyor...' : '💾 Kaydet'}
        </button>
      </form>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
        <h3>📋 Kayıtlı Rezervasyonlar</h3>
        <button className="btn green" onClick={exportToExcel}>📥 Excel'e Aktar</button>
      </div>

      <table className="reservations-table">
        <thead>
          <tr>
            <th>
              Oda No<br />
              <input type="text" name="roomNo" value={filters.roomNo} onChange={handleFilterChange} placeholder="Filtrele" />
            </th>
            <th>
              Müşteri<br />
              <input type="text" name="customer" value={filters.customer} onChange={handleFilterChange} placeholder="Filtrele" />
            </th>
            <th>
              Giriş<br />
              <input type="date" name="checkIn" value={filters.checkIn} onChange={handleFilterChange} />
            </th>
            <th>
              Çıkış<br />
              <input type="date" name="checkOut" value={filters.checkOut} onChange={handleFilterChange} />
            </th>
            <th>Tutar</th>
            <th>Telefon</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {filteredReservations.map((r, i) => (
            <tr key={i}>
              <td>{r.roomNo}</td>
              <td>{r.customer}</td>
              <td>{r.checkIn?.slice(0, 10)}</td>
              <td>{r.checkOut?.slice(0, 10)}</td>
              <td>{r.total}</td>
              <td>{r.phone}</td>
              <td>
                <button onClick={() => setSelectedReservation(r)} title="Detay">🔍</button>
                <button onClick={() => handleEdit(r)} title="Düzenle">✏️</button>
                <button onClick={() => sendWhatsApp(r)} title="WhatsApp">🟢</button>
                <button onClick={() => handleDelete(r._id)} title="Sil">❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedReservation && (
        <ReservationModal
          reservation={selectedReservation}
          onClose={() => { setSelectedReservation(null); setEditable(false); }}
          onUpdate={handleUpdate}
          editable={editable}
        />
      )}
    </div>
  );
}

export default ReservationsPage;
