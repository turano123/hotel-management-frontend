import React, { useState, useEffect } from 'react';
import './ReservationModal.css';
import api from '../api/axiosInstance';

function ReservationModal({ reservation: original, onClose, onUpdate, editable = false }) {
  const [reservation, setReservation] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCurrency, setExpenseCurrency] = useState('₺ TL');
  const [showPaymentScreen, setShowPaymentScreen] = useState(false);
  const [showFinalPayment, setShowFinalPayment] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [finalPayment, setFinalPayment] = useState({ tl: 0, usd: 0, eur: 0 });
  const [takeAll, setTakeAll] = useState(false);

  // 💡 useEffect sadece component seviyesinde kullanılmalı
  useEffect(() => {
    if (original) {
      setReservation({ ...original });
      setNotes(original.notes || []);
      setExpenses(original.expenses || []);
    }
  }, [original]);

  const refreshReservation = async () => {
    try {
      const response = await api.get(`/reservations/${original._id}`);
      setReservation(response.data);
      setNotes(response.data.notes || []);
      setExpenses(response.data.expenses || []);
    } catch (error) {
      console.error("❌ Rezervasyon güncellenemedi:", error);
    }
  };

  if (!reservation) return null;

  const updateField = (field, value) => {
    setReservation(prev => ({ ...prev, [field]: value }));
  };

  const saveChanges = () => {
    const updated = { ...reservation, notes, expenses };
    onUpdate && onUpdate(updated);
  };

  const handleSaveChanges = async () => {
    try {
      await api.put(`/reservations/${reservation._id}`, { ...reservation, notes, expenses });
      alert('✅ Rezervasyon güncellendi!');
      onUpdate();
      onClose();
    } catch (err) {
      console.error('❌ Güncelleme hatası:', err);
      alert('Güncelleme başarısız!');
    }
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      const now = new Date().toLocaleString('tr-TR');
      const note = `${now} - ${newNote}`;
      const updatedNotes = [...notes, note];
      setNotes(updatedNotes);
      setNewNote('');
      saveChanges();
    }
  };

  const handleAddExpense = () => {
    if (expenseDesc.trim() && expenseAmount && !isNaN(expenseAmount)) {
      const newExpense = {
        desc: expenseDesc,
        amount: parseFloat(expenseAmount),
        currency: expenseCurrency,
      };
      const updatedExpenses = [...expenses, newExpense];
      setExpenses(updatedExpenses);
      setExpenseDesc('');
      setExpenseAmount('');
      setExpenseCurrency('₺ TL');
      saveChanges();
    }
  };

  const calculateTotals = () => {
    const tl = expenses.filter(e => e.currency === '₺ TL').reduce((sum, e) => sum + e.amount, 0);
    const usd = expenses.filter(e => e.currency === '$ USD').reduce((sum, e) => sum + e.amount, 0);
    const eur = expenses.filter(e => e.currency === '€ EUR').reduce((sum, e) => sum + e.amount, 0);
    return { tl, usd, eur };
  };

  const renderFinalPaymentScreen = () => {
    const totals = calculateTotals();
    const cari = {
      tl: (Number(reservation.deposit) || 0) + totals.tl,
      usd: totals.usd,
      eur: totals.eur,
    };

    const handleCheckboxChange = (e) => {
      const checked = e.target.checked;
      setTakeAll(checked);
      if (checked) {
        setFinalPayment({ ...cari });
      } else {
        setFinalPayment({ tl: 0, usd: 0, eur: 0 });
      }
    };

   const handleConfirm = async () => {
  const now = new Date().toLocaleString('tr-TR');
  const not = `💰 Tahsilat alındı (${selectedPaymentMethod}) → TL: ${finalPayment.tl}, USD: ${finalPayment.usd}, EUR: ${finalPayment.eur} (${now})`;
  const updatedNotes = [...notes, not];

  const previousDeposit = parseFloat(reservation.deposit) || 0;
  const total = parseFloat(reservation.total) || 0;
  const newDeposit = previousDeposit + finalPayment.tl;
  const newRemaining = Math.max(0, total - newDeposit);

  const updatedReservation = {
    ...reservation,
    deposit: newDeposit,
    remaining: newRemaining,
    notes: updatedNotes
  };

  try {
    await api.put(`/reservations/${reservation._id}`, updatedReservation);
    setReservation(updatedReservation);
    setNotes(updatedNotes);
    setShowFinalPayment(false);
    alert('✅ Tahsilat kaydedildi!');
    onUpdate();
    onClose();
  } catch (error) {
    console.error('❌ Tahsilat güncelleme hatası:', error);
    alert('Tahsilat kaydedilemedi!');
  }
};


    return (
      <div className="modal-body">
        <h3>💸 Tahsilat Girişi</h3>
        <p><strong>Cari Bakiye:</strong></p>
        <p>₺ TL: {cari.tl}</p>
        <p>$ USD: {cari.usd}</p>
        <p>€ EUR: {cari.eur}</p>

        <label>
          <input type="checkbox" checked={takeAll} onChange={handleCheckboxChange} />
          Tamamını Al
        </label>

        {!takeAll && (
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <input type="number" placeholder="₺ TL" value={finalPayment.tl} onChange={e => setFinalPayment(prev => ({ ...prev, tl: parseFloat(e.target.value || 0) }))} />
            <input type="number" placeholder="$ USD" value={finalPayment.usd} onChange={e => setFinalPayment(prev => ({ ...prev, usd: parseFloat(e.target.value || 0) }))} />
            <input type="number" placeholder="€ EUR" value={finalPayment.eur} onChange={e => setFinalPayment(prev => ({ ...prev, eur: parseFloat(e.target.value || 0) }))} />
          </div>
        )}

        <button className="btn green" style={{ marginTop: '15px' }} onClick={handleConfirm}>Tahsilatı Onayla</button>
      </div>
    );
  };

  const renderPaymentScreen = () => {
    const totals = calculateTotals();

    return (
      <div className="modal-body">
        <h3>💳 Ödeme Bilgileri</h3>
        <p>Kapora: {reservation.deposit} ₺</p>
        <p>Kalan: {reservation.remaining} ₺</p>
        <p>Toplam Ekstra (₺): {totals.tl}</p>
        <p>Toplam ($): {totals.usd}</p>
        <p>Toplam (€): {totals.eur}</p>

        <label>Ödeme Türü:</label>
        <select value={selectedPaymentMethod} onChange={e => setSelectedPaymentMethod(e.target.value)}>
          <option value="">Seçiniz</option>
          <option value="Nakit">Nakit</option>
          <option value="Havale">Havale</option>
          <option value="Kredi Kartı">Kredi Kartı</option>
        </select>

        <button className="btn green" style={{ marginTop: 10 }} onClick={() => setShowFinalPayment(true)}>
          Tahsil Edildi
        </button>
      </div>
    );
  };

  const renderContent = () => {
    if (showFinalPayment) return renderFinalPaymentScreen();
    if (showPaymentScreen) return renderPaymentScreen();

    switch (activeTab) {
      case 'details':
        return (
          <div className="modal-body">
            {editable ? (
              <>
                <div className="section"><label>Müşteri:</label><input value={reservation.customer} onChange={e => updateField('customer', e.target.value)} /></div>
                <div className="section"><label>Telefon:</label><input value={reservation.phone} onChange={e => updateField('phone', e.target.value)} /></div>
                <div className="section"><label>Referans:</label><input value={reservation.reference} onChange={e => updateField('reference', e.target.value)} /></div>
                <div className="section"><label>Oda No:</label><input value={reservation.roomNo} onChange={e => updateField('roomNo', e.target.value)} /></div>
                <div className="section"><label>Giriş Tarihi:</label><input type="date" value={reservation.checkIn?.slice(0, 10)} onChange={e => updateField('checkIn', e.target.value)} /></div>
                <div className="section"><label>Çıkış Tarihi:</label><input type="date" value={reservation.checkOut?.slice(0, 10)} onChange={e => updateField('checkOut', e.target.value)} /></div>
                <div className="section"><label>Pansiyon:</label><input value={reservation.pension} onChange={e => updateField('pension', e.target.value)} /></div>

                <div className="section"><label>Toplam Tutar:</label><input type="number" value={reservation.total} onChange={e => updateField('total', e.target.value)} /></div>
                <div className="section"><label>Kapora:</label><input type="number" value={reservation.deposit} onChange={e => {
                  const deposit = parseFloat(e.target.value) || 0;
                  const total = parseFloat(reservation.total) || 0;
                  updateField('deposit', deposit);
                  updateField('remaining', total - deposit);
                }} /></div>
                <div className="section"><label>Kalan Ödeme:</label><input type="number" value={reservation.remaining} onChange={e => updateField('remaining', e.target.value)} /></div>

                <div className="section">
                  <label>Uyruk:</label>
                  <select value={reservation.nationality} onChange={e => updateField('nationality', e.target.value)}>
                    <option value="">Seçiniz</option>
                    <option value="T.C.">T.C.</option>
                    <option value="Yabancı">Yabancı</option>
                  </select>
                </div>
                <div className="section">
                  <label>
                    <input type="checkbox" checked={reservation.extraRequestChecked} onChange={e => updateField('extraRequestChecked', e.target.checked)} />
                    Ekstra Talep Var
                  </label>
                </div>
                {reservation.extraRequestChecked && (
                  <>
                    <div className="section"><label>Açıklama:</label><input value={reservation.extraDescription} onChange={e => updateField('extraDescription', e.target.value)} /></div>
                    <div className="section"><label>Ücret:</label><input type="number" value={reservation.extraPrice} onChange={e => updateField('extraPrice', e.target.value)} /></div>
                  </>
                )}
                <button className="btn green" onClick={handleSaveChanges}>💾 Güncelle</button>
              </>
            ) : (
              <>
                <div className="section"><strong>Müşteri:</strong> {reservation.customer}</div>
                <div className="section"><strong>Oda No:</strong> {reservation.roomNo} | <strong>Pansiyon:</strong> {reservation.pension}</div>
                <div className="section"><strong>Giriş:</strong> {reservation.checkIn?.slice(0, 10)} | <strong>Çıkış:</strong> {reservation.checkOut?.slice(0, 10)}</div>
                <div className="section"><strong>Toplam:</strong> {reservation.total} ₺ | <strong>Kapora:</strong> {reservation.deposit} ₺ | <strong>Kalan:</strong> {reservation.remaining} ₺</div>
                <div className="section"><strong>Referans:</strong> {reservation.reference}</div>
                <div className="section"><strong>Yetişkin:</strong> {reservation.adults} | <strong>Çocuk:</strong> {reservation.children}</div>
                <div className="section"><strong>Telefon:</strong> {reservation.phone}</div>
              </>
            )}
          </div>
        );
      case 'notes':
        return (
          <div className="modal-body">
            <h4>📝 Notlar</h4>
            <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Not girin..." />
            <button className="btn green" onClick={handleAddNote}>Kaydet</button>
            <ul style={{ marginTop: '10px' }}>
              {notes.map((note, i) => <li key={i}>{note}</li>)}
            </ul>
          </div>
        );
      case 'expenses':
        return (
          <div className="modal-body">
            <h4>💸 Ek Harcamalar</h4>
            <input placeholder="Açıklama" value={expenseDesc} onChange={e => setExpenseDesc(e.target.value)} />
            <div style={{ display: 'flex', gap: 10 }}>
              <input placeholder="Tutar" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} />
              <select value={expenseCurrency} onChange={e => setExpenseCurrency(e.target.value)}>
                <option value="₺ TL">₺ TL</option>
                <option value="$ USD">$ USD</option>
                <option value="€ EUR">€ EUR</option>
              </select>
            </div>
            <button className="btn green" style={{ marginTop: 10 }} onClick={handleAddExpense}>Ekle</button>
            <ul>
              {expenses.map((e, i) => (
                <li key={i}>{e.desc} - {e.amount} {e.currency}</li>
              ))}
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📄 Rezervasyon Kartı</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {renderContent()}

        <div className="modal-footer">
          <button className={`btn blue ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>Detaylar</button>
          <button className={`btn yellow ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>Notlar</button>
          <button className={`btn green ${activeTab === 'payment' ? 'active' : ''}`} onClick={() => { setShowPaymentScreen(true); setShowFinalPayment(false); setActiveTab('payment'); }}>Ödeme</button>
          <button className={`btn purple ${activeTab === 'expenses' ? 'active' : ''}`} onClick={() => setActiveTab('expenses')}>Ek Harcama</button>
          <button className="btn red" onClick={onClose}>Kapat</button>
        </div>
      </div>
    </div>
  );
}

export default ReservationModal;
