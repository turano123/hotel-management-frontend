// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import './AuthForm.css';

function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    identityNo: '',
    taxNo: '',
    taxOffice: '',
    companyName: '',
    authorizedPerson: '',
    hotelName: '', // 💡 Otel / İşletme Adı
    address: '',
    tourismCert: 'Yok',
    tourismCertNo: '',
  });

  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [vergiFile, setVergiFile] = useState(null);
  const [turizmFile, setTurizmFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== repeatPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    if (!vergiFile) {
      setError('Vergi levhası yüklenmesi zorunludur.');
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    data.append('password', password);
    data.append('vergiFile', vergiFile);
    if (formData.tourismCert === 'Var' && turizmFile) {
      data.append('turizmFile', turizmFile);
    }

    try {
      await api.post('/auth/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess('✅ Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.msg || '❌ Kayıt başarısız.');
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Kayıt Ol</h2>

        <div className="row">
          <input name="firstName" placeholder="İsim" value={formData.firstName} onChange={handleChange} required />
          <input name="lastName" placeholder="Soyisim" value={formData.lastName} onChange={handleChange} required />
        </div>

        <input name="email" type="email" placeholder="E-posta" value={formData.email} onChange={handleChange} required />

        <div className="row">
          <input name="phone" placeholder="Telefon" value={formData.phone} onChange={handleChange} required />
          <input name="identityNo" placeholder="TCKN / Pasaport No" value={formData.identityNo} onChange={handleChange} required />
        </div>

        <div className="row">
          <input name="taxNo" placeholder="Vergi Numarası" value={formData.taxNo} onChange={handleChange} required />
          <input name="taxOffice" placeholder="Vergi Dairesi" value={formData.taxOffice} onChange={handleChange} required />
        </div>

        <div className="row">
          <input name="companyName" placeholder="Şirket Unvanı" value={formData.companyName} onChange={handleChange} required />
          <input name="authorizedPerson" placeholder="Yetkili Kişi" value={formData.authorizedPerson} onChange={handleChange} required />
        </div>

        <input name="hotelName" placeholder="Otel / İşletme Adı" value={formData.hotelName} onChange={handleChange} required />

        <textarea name="address" placeholder="Açık Adres" value={formData.address} onChange={handleChange} required />

        <label>Vergi Levhası Yükle *</label>
        <div className="file-upload">
          <input type="file" accept="image/*" onChange={(e) => setVergiFile(e.target.files[0])} required />
        </div>

        <label>Turizm Belgesi:</label>
        <select name="tourismCert" value={formData.tourismCert} onChange={handleChange}>
          <option>Yok</option>
          <option>Var</option>
        </select>

        {formData.tourismCert === 'Var' && (
          <>
            <input name="tourismCertNo" placeholder="Belge Numarası" value={formData.tourismCertNo} onChange={handleChange} />
            <div className="file-upload">
              <input type="file" accept="image/*" onChange={(e) => setTurizmFile(e.target.files[0])} />
            </div>
          </>
        )}

        <input type="password" placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <input type="password" placeholder="Şifre Tekrar" value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} required />

        <button type="submit" className="auth-button">Üye Ol</button>

        {error && <p className="auth-error">{error}</p>}
        {success && <p className="auth-success">{success}</p>}

        <p className="auth-switch">
          Zaten hesabınız var mı? <Link to="/"><strong style={{ color: '#d23c3c' }}>Giriş Yap</strong></Link>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;
