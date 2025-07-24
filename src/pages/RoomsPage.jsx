import React, { useState, useEffect } from 'react';
import './RoomsPage.css';
import api from '../api/axiosInstance';

function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem('userId');

  const [saleModal, setSaleModal] = useState({
    open: false,
    roomId: null,
    type: null,
    start: '',
    end: ''
  });

  const [newRoom, setNewRoom] = useState({
    roomNo: '',
    name: '',
    bedCount: '',
    maxAdults: '',
    maxChildren: '',
    weekPrice: '',
    weekendPrice: '',
    jacuzzi: false,
    hotPool: false,
    hasPool: false,
    poolType: '',
    poolDiameter: '',
    poolWidth: '',
    poolHeight: '',
    view: [],
    familyOnly: 'Hayır',
    petsAllowed: 'Hayır',
    firePit: false,
    fireplace: false,
    sauna: false,
    steamRoom: false,
    conservative: 'Hayır',
    poolShared: 'ortak',
    jacuzziLocation: 'içmekan',
    washingMachine: false,
    dishwasher: false,
    iron: false,
    bathroomCount: '',
    stove: false,
    kitchen: false,
    closedAll: false,
    closeRange: null,
  });

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    if (name === 'view') {
      setNewRoom(prev => ({
        ...prev,
        view: checked
          ? [...prev.view, value]
          : prev.view.filter(v => v !== value),
      }));
    } else if (type === 'checkbox') {
      setNewRoom(prev => ({ ...prev, [name]: checked }));
    } else {
      setNewRoom(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddRoom = async () => {
    try {
      const payload = { ...newRoom, userId };
      const response = await api.post('/rooms', payload);
      setRooms(prev => [...prev, response.data]);
      setNewRoom({
        roomNo: '',
        name: '',
        bedCount: '',
        maxAdults: '',
        maxChildren: '',
        weekPrice: '',
        weekendPrice: '',
        jacuzzi: false,
        hotPool: false,
        hasPool: false,
        poolType: '',
        poolDiameter: '',
        poolWidth: '',
        poolHeight: '',
        view: [],
        familyOnly: 'Hayır',
        petsAllowed: 'Hayır',
        firePit: false,
        fireplace: false,
        sauna: false,
        steamRoom: false,
        conservative: 'Hayır',
        poolShared: 'ortak',
        jacuzziLocation: 'içmekan',
        washingMachine: false,
        dishwasher: false,
        iron: false,
        bathroomCount: '',
        stove: false,
        kitchen: false,
        closedAll: false,
        closeRange: null,
      });
      setShowForm(false);
    } catch (error) {
      console.error('Oda eklenemedi:', error);
      alert('Oda eklenemedi. Lütfen eksik alanları kontrol edin.');
    }
  };

  const openFormForEdit = (room) => {
    setNewRoom(room);
    setShowForm(true);
    setOpenMenuId(null);
  };

  const handleDelete = (id) => {
    setRooms(prev => prev.filter(room => room.id !== id));
    setOpenMenuId(null);
  };

  const toggleClosedAll = (id) => {
    setSaleModal({ open: true, roomId: id, type: null, start: '', end: '' });
    setOpenMenuId(null);
  };

  useEffect(() => {
    (async () => {
      try {
        const response = await api.get(`/rooms?userId=${userId}`);
        setRooms(response.data);
      } catch (err) {
        console.error('Oda listesi alınamadı:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  return (
    <div className="rooms-container">
      {/* tüm JSX burada devam ediyor */}
    </div>
  );


  return (
    <div className="rooms-container">
      <h2>🏥️ Odalar</h2>
      <button className="add-button" onClick={() => setShowForm(f => !f)}>
        {showForm ? 'Formu Kapat' : 'Yeni Oda Ekle'}
      </button>

      {showForm && (
        <div className="room-form">
          {/* Temel Bilgiler */}
          <input name="roomNo" placeholder="Oda No" value={newRoom.roomNo} onChange={handleChange} />
          <input name="name" placeholder="Oda Adı" value={newRoom.name} onChange={handleChange} />
          <input name="bedCount" placeholder="Yatak Sayısı" value={newRoom.bedCount} onChange={handleChange} />
          <input name="maxAdults" placeholder="Maks. Yetişkin" value={newRoom.maxAdults} onChange={handleChange} />
          <input name="maxChildren" placeholder="Maks. Çocuk" value={newRoom.maxChildren} onChange={handleChange} />
          <input name="weekPrice" placeholder="Hafta İçi Fiyat" value={newRoom.weekPrice} onChange={handleChange} />
          <input name="weekendPrice" placeholder="Hafta Sonu Fiyat" value={newRoom.weekendPrice} onChange={handleChange} />

          {/* Jakuzi / Sıcak Havuz / Havuz */}
          <div className="checkbox-row">
            <label>
              <input type="checkbox" name="jacuzzi" checked={newRoom.jacuzzi} onChange={handleChange} /> 🛁 Jakuzi
            </label>
            <label>
              <input type="checkbox" name="hotPool" checked={newRoom.hotPool} onChange={handleChange} /> 🌡️ Sıcak Havuz
            </label>
            <label>
              <input type="checkbox" name="hasPool" checked={newRoom.hasPool} onChange={handleChange} /> 🏊 Havuz
            </label>
          </div>

          {/* Havuz Türü & Dinamik Alanlar */}
          {newRoom.hasPool && (
            <>
              <select name="poolType" value={newRoom.poolType} onChange={handleChange}>
                <option value="">Havuz Türü</option>
                <option value="normal">Normal</option>
                <option value="oval">Oval</option>
                <option value="kosegen">Köşegen</option>
              </select>
              {newRoom.poolType === 'oval' && (
                <input name="poolDiameter" placeholder="Çap (m)" value={newRoom.poolDiameter} onChange={handleChange} />
              )}
              {newRoom.poolType === 'kosegen' && (
                <>
                  <input name="poolWidth" placeholder="En (m)" value={newRoom.poolWidth} onChange={handleChange} />
                  <input name="poolHeight" placeholder="Boy (m)" value={newRoom.poolHeight} onChange={handleChange} />
                </>
              )}
            </>
          )}

          {/* Manzara */}
          <div className="section-title">🌄 Manzara Tipi:</div>
          <div className="checkbox-row">
            {['Dağ', 'Göl', 'Orman', 'Bahçe', 'Deniz'].map(v => (
              <label key={v}>
                <input type="checkbox" name="view" value={v} checked={newRoom.view.includes(v)} onChange={handleChange} />
                {v}
              </label>
            ))}
          </div>

          {/* Aile & Evcil */}
          <div className="checkbox-row">
            <label>
              Sadece Aileye:
              <select name="familyOnly" value={newRoom.familyOnly} onChange={handleChange}>
                <option value="Evet">Evet</option>
                <option value="Hayır">Hayır</option>
              </select>
            </label>
            <label>
              Evcil Hayvan:
              <select name="petsAllowed" value={newRoom.petsAllowed} onChange={handleChange}>
                <option value="Evet">Evet</option>
                <option value="Hayır">Hayır</option>
              </select>
            </label>
          </div>

          {/* Ek Özellikler */}
          <div className="section-title">✨ Ek Özellikler</div>
          <div className="checkbox-row">
            <label>
              <input type="checkbox" name="firePit" checked={newRoom.firePit} onChange={handleChange} /> 🔥 Ateş Çukuru
            </label>
            <label>
              <input type="checkbox" name="fireplace" checked={newRoom.fireplace} onChange={handleChange} /> 🔥 Şömine
            </label>
            <label>
              <input type="checkbox" name="sauna" checked={newRoom.sauna} onChange={handleChange} /> 🌡️ Sauna
            </label>
            <label>
              <input type="checkbox" name="steamRoom" checked={newRoom.steamRoom} onChange={handleChange} /> 💧 Buhar Odası
            </label>
            <label>
              Muhafazakar:
              <select name="conservative" value={newRoom.conservative} onChange={handleChange}>
                <option value="Evet">Evet</option>
                <option value="Hayır">Hayır</option>
              </select>
            </label>
            <label>
              Havuz Tipi:
              <select name="poolShared" value={newRoom.poolShared} onChange={handleChange}>
                <option value="ortak">Ortak</option>
                <option value="özel">Özel</option>
              </select>
            </label>
            {newRoom.jacuzzi && (
              <label>
                Jakuzi Konumu:
                <select name="jacuzziLocation" value={newRoom.jacuzziLocation} onChange={handleChange}>
                  <option value="içmekan">İç Mekan</option>
                  <option value="dışmekan">Dış Mekan</option>
                </select>
              </label>
            )}
            <label>
              <input type="checkbox" name="washingMachine" checked={newRoom.washingMachine} onChange={handleChange} /> 🧺 Çamaşır Makinası
            </label>
            <label>
              <input type="checkbox" name="dishwasher" checked={newRoom.dishwasher} onChange={handleChange} /> 🍽️ Bulaşık Makinası
            </label>
            <label>
              <input type="checkbox" name="iron" checked={newRoom.iron} onChange={handleChange} /> 🧼 Ütü
            </label>
            <label>
              Banyo Sayısı:
              <input type="number" name="bathroomCount" placeholder="Adet" value={newRoom.bathroomCount} onChange={handleChange} style={{ width: '80px' }} />
            </label>
            <label>
              <input type="checkbox" name="stove" checked={newRoom.stove} onChange={handleChange} /> 🔥 Ocak
            </label>
            <label>
              <input type="checkbox" name="kitchen" checked={newRoom.kitchen} onChange={handleChange} /> 🍳 Mutfak
            </label>
          </div>
          <div className="button-row">
            <button className="save-button" onClick={handleAddRoom}>Kaydet</button>
          </div>
        </div>
      )}

      {/* --- Tablo render kısmı --- */}
      {rooms.length > 0 ? (
        <table className="rooms-table">
          <thead>
            <tr>
              <th>Oda No</th>
              <th>Oda Adı</th>
              <th>Yatak</th>
              <th>Yetişkin</th>
              <th>Çocuk</th>
              <th>Hafta İçi</th>
              <th>Hafta Sonu</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => (
              <tr key={room._id}>
                <td>{room.roomNo}</td>
                <td>{room.name}</td>
                <td>{room.bedCount}</td>
                <td>{room.maxAdults}</td>
                <td>{room.maxChildren}</td>
                <td>{room.weekPrice}</td>
                <td>{room.weekendPrice}</td>
                <td className="action-cell" style={{ position: 'relative' }}>
                  <button
                    className="menu-trigger"
                    onClick={() =>
                      setOpenMenuId(openMenuId === room.id ? null : room.id)
                    }
                  >
                    ⋮
                  </button>
                  {openMenuId === room.id && (
                    <div className="action-menu">
                      <button onClick={() => openFormForEdit(room)}>Düzenle</button>
                      <button onClick={() => handleDelete(room.id)}>Sil</button>
                      <button onClick={() => toggleClosedAll(room.id)}>
                        {room.closedAll ? 'Satışı Aç' : 'Satışı Kapat'}
                      </button>
                    </div>
                  )}
                  {/* Satış Durumu */}
                  {room.closedAll && <span style={{ color: "red", marginLeft: 8 }}>Tamamen Kapalı</span>}
                  {room.closeRange && (
                    <span style={{ color: "orange", marginLeft: 8 }}>
                      {room.closeRange.start} ~ {room.closeRange.end} arası kapalı
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Henüz eklenmiş oda yok.</p>
      )}

      {/* Satış Durumu Görüntüsü */}
{saleModal.open && (
  <div className="sale-modal-bg">
    <div className="sale-modal">
      <h4>Satışa Kapama Seçeneği</h4>
      <button
        onClick={() =>
          setSaleModal({ open: false, roomId: null, type: null, start: '', end: '' })
        }
        style={{ float: "right" }}
      >
        Kapat
      </button>

      {/* ✅ Buraya oda bilgisi gösterimi ekliyoruz */}
      <div style={{ margin: '10px 0', padding: '8px', background: '#f7f7f7', borderRadius: '6px' }}>
        <strong>Oda Bilgisi:</strong><br />
        {rooms.find(r => r.id === saleModal.roomId)?.roomNo} - {rooms.find(r => r.id === saleModal.roomId)?.name}
      </div>

      <div style={{ marginBottom: "14px" }}>
        <label>
          <input
            type="radio"
            name="saleType"
            checked={saleModal.type === 'full'}
            onChange={() => setSaleModal(prev => ({ ...prev, type: 'full' }))}
          /> Tamamen Satışa Kapat
        </label>
        <br />
        <label>
          <input
            type="radio"
            name="saleType"
            checked={saleModal.type === 'date'}
            onChange={() => setSaleModal(prev => ({ ...prev, type: 'date' }))}
          /> Tarih Aralığında Satışa Kapat
        </label>
      </div>


            {saleModal.type === 'date' && (
              <div style={{ marginBottom: "14px" }}>
                <span>Başlangıç: </span>
                <input
                  type="date"
                  value={saleModal.start}
                  onChange={e => setSaleModal(prev => ({ ...prev, start: e.target.value }))}
                />
                <span style={{ marginLeft: "10px" }}>Bitiş: </span>
                <input
                  type="date"
                  value={saleModal.end}
                  onChange={e => setSaleModal(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
            )}

            <button
              className="save-button"
              disabled={
                saleModal.type === null ||
                (saleModal.type === 'date' && (!saleModal.start || !saleModal.end))
              }
              onClick={() => {
                setRooms(prev =>
                  prev.map(room => {
                    if (room.id !== saleModal.roomId) return room;
                    if (saleModal.type === 'full') {
                      return { ...room, closedAll: true, closeRange: null };
                    }
                    if (saleModal.type === 'date') {
                      return { ...room, closedAll: false, closeRange: { start: saleModal.start, end: saleModal.end } };
                    }
                    return room;
                  })
                );
                setSaleModal({ open: false, roomId: null, type: null, start: '', end: '' });
              }}
            >
              Onayla
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoomsPage;
