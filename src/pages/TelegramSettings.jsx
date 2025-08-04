import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';

export default function TelegramSettings() {
  const [chatId, setChatId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mevcut Chat ID ve şirket adını getir
    api.get('/company/my-info')
      .then(res => {
        setChatId(res.data.telegramChatId || '');
        setCompanyName(res.data.companyName || '');
      })
      .catch(err => {
        console.error('Telegram bilgisi alınamadı:', err);
        alert('Telegram bilgisi alınamadı, lütfen tekrar deneyin.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = () => {
    if (!chatId.trim()) {
      alert('Lütfen geçerli bir Chat ID girin.');
      return;
    }
    api.post('/company/updateTelegramId', { telegramChatId: chatId })
      .then(() => alert('Telegram Chat ID başarıyla kaydedildi!'))
      .catch(() => alert('Kayıt sırasında hata oluştu!'));
  };

  if (loading) return <p>Yükleniyor...</p>;

  return (
    <div style={{ maxWidth: 500, margin: '20px auto', padding: 20 }}>
      <h2>Telegram Ayarları</h2>
      <p><strong>İşletme:</strong> {companyName}</p>
      <label htmlFor="chatId">Telegram Chat ID</label>
      <input
        id="chatId"
        type="text"
        value={chatId}
        onChange={e => setChatId(e.target.value)}
        placeholder="Telegram Chat ID'nizi buraya yapıştırın"
        style={{ width: '100%', padding: 8, marginBottom: 12 }}
      />
      <button onClick={handleSave} style={{ padding: '10px 20px' }}>
        Kaydet
      </button>
    </div>
  );
}
