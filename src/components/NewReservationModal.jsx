import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import './ReservationModal.css';

function NewReservationModal({ date, selectedRoom, onClose, onReservationAdded, initialData, isEdit }) {
  const [form, setForm] = useState({
    roomNo: selectedRoom || '',
    customer: '',
    checkIn: date ? date.toISOString().slice(0, 10) : '',
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
    tcKimlikNo: '',
    pasaportNo: '',
    extraRequest: false,
    extraDescription: '',
    extraFee: '',
    notes: [],
    expenses: []
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        checkIn: initialData.checkIn?.slice(0, 10) || '',
        checkOut: initialData.checkOut?.slice(0, 10) || '',
        tcKimlikNo: initialData.tcKimlikNo || '',
        pasaportNo: initialData.pasaportNo || '',
        extraFee: initialData.extraFee || '',
        extraRequest: initialData.extraRequest || false,
        extraDescription: initialData.extraDescription || '',
      });
    }
  }, [initialData]);

  useEffect(() => {
    const total = parseFloat(form.total || 0);
    const deposit = parseFloat(form.deposit || 0);
    const extra = parseFloat(form.extraFee || 0);
    const remaining = total + extra - deposit;
    setForm((prev) => ({
      ...prev,
      remaining: isNaN(remaining) ? '' : remaining.toFixed(2)
    }));
  }, [form.total, form.deposit, form.extraFee]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setForm((prev) => ({ ...prev, [name]: val }));
  };

  const handleSave = async () => {
    try {
      // 1. Rezervasyonu kaydet
      const response = await api.post('/reservations', form);
      const saved = response.data;

      // 2. Kapora varsa otomatik muhasebeye gönder
      if (parseFloat(form.deposit) > 0) {
        await api.post('/muhasebe/add', {
          date: new Date(),
          type: 'Gelir',
          category: 'Kapora',
          amount: parseFloat(form.deposit),
          note: `${form.roomNo} no'lu rezervasyon kaporası`,
          userId: localStorage.getItem('userId')
        });
      }

      // 3. Local storage'e ekle
      const existing = JSON.parse(localStorage.getItem('reservations') || '[]');
      localStorage.setItem('reservations', JSON.stringify([...existing, saved]));

      alert('✅ Rezervasyon ve kapora başarıyla kaydedildi!');
      onReservationAdded && onReservationAdded(saved);
      onClose();
    } catch (err) {
      console.error('❌ Kayıt hatası:', err);
      alert('Rezervasyon kaydedilemedi!');
    }
  };

  const handleUpdate = async () => {
    if (!form._id) {
      alert("Rezervasyon ID'si eksik, güncelleme yapılamaz!");
      return;
    }
    try {
      await api.put(`/reservations/${form._id}`, form);
      alert('✅ Rezervasyon güncellendi!');
      onReservationAdded && onReservationAdded(form);
      onClose();
    } catch (err) {
      console.error('❌ Güncelleme hatası:', err);
      alert('Rezervasyon güncellenemedi!');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? '✏️ Rezervasyonu Güncelle' : '➕ Yeni Rezervasyon'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="section" style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <select name="roomNo" value={form.roomNo || ''} onChange={handleChange} disabled={!isEdit ? true : false}>
              <option>{form.roomNo || 'Oda No'}</option>
            </select>

            <input name="customer" value={form.customer || ''} onChange={handleChange} placeholder="Müşteri Adı Soyadı" />
            <input name="checkIn" value={form.checkIn || ''} type="date" onChange={handleChange} />
            <input name="checkOut" value={form.checkOut || ''} onChange={handleChange} type="date" min={form.checkIn} />
            <input name="total" value={form.total || ''} onChange={handleChange} placeholder="Toplam Tutar" />
            <input name="deposit" value={form.deposit || ''} onChange={handleChange} placeholder="Kapora Tutarı" />
            <input name="remaining" value={form.remaining || ''} readOnly placeholder="Kalan Ödeme" />
            <input name="reference" value={form.reference || ''} onChange={handleChange} placeholder="Referans Kaynağı" />

            <select name="pension" value={form.pension || ''} onChange={handleChange}>
              <option value="">Pansiyon Tipi</option>
              <option value="Kahvaltı Dahil">Kahvaltı Dahil</option>
              <option value="Kahvaltı Hariç">Kahvaltı Hariç</option>
            </select>

            <input name="adults" value={form.adults || ''} onChange={handleChange} placeholder="Yetişkin Sayısı" />
            <input name="children" value={form.children || ''} onChange={handleChange} placeholder="0-12 Yaş Çocuk Sayısı" />
            <input name="phone" value={form.phone || ''} onChange={handleChange} placeholder="İletişim Numarası" />

            <select name="nationality" value={form.nationality || ''} onChange={handleChange}>
              <option value="">Uyruk Seçin</option>
              <option value="Türkiye">Türkiye</option>
              <option value="Pasaport">Pasaport</option>
            </select>

            {form.nationality === 'Türkiye' && (
              <input name="tcKimlikNo" value={form.tcKimlikNo || ''} onChange={handleChange} placeholder="TC Kimlik No" />
            )}
            {form.nationality === 'Pasaport' && (
              <input name="pasaportNo" value={form.pasaportNo || ''} onChange={handleChange} placeholder="Pasaport No" />
            )}
          </div>

          <div style={{ marginTop: '15px' }}>
            <label>
              <input type="checkbox" name="extraRequest" checked={form.extraRequest || false} onChange={handleChange} />
              Ekstra Talep Var
            </label>
          </div>

          {form.extraRequest && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <input name="extraDescription" value={form.extraDescription || ''} onChange={handleChange} placeholder="Ekstra Açıklama" />
              <input name="extraFee" value={form.extraFee || ''} onChange={handleChange} placeholder="Ekstra Ücret" />
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ marginTop: '20px' }}>
          {isEdit ? (
            <button className="btn green" onClick={handleUpdate}>💾 Güncelle</button>
          ) : (
            <button className="btn red" onClick={handleSave}>💾 Kaydet</button>
          )}
          <button className="btn gray" onClick={onClose}>İptal</button>
        </div>
      </div>
    </div>
  );
}

export default NewReservationModal;
