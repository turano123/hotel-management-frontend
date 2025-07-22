// src/components/RegisterForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Kayıt başarılı!');
        navigate('/'); // Giriş sayfasına yönlendir
      } else {
        alert('❌ Kayıt başarısız: ' + (data.message || data.error));
      }
    } catch (err) {
      alert('🚨 Hata: ' + err.message);
    }
  };

  return (
    <div>
      <h2>Kayıt Ol</h2>
      <input
        type="email"
        placeholder="E-posta"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Şifre"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="customer">Müşteri</option>
        <option value="receptionist">Resepsiyonist</option>
        <option value="admin">Admin</option>
      </select>
      <button onClick={handleRegister}>Kayıt Ol</button>
    </div>
  );
};

export default RegisterForm;
