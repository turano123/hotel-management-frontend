// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import './AuthForm.css';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });

      // ✅ Token ve kullanıcı bilgilerini kaydet
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        email: response.data.email,
        name: response.data.name,
        userId: response.data.userId
      }));

      // ✅ userId ayrı olarak kaydedildi
      localStorage.setItem('userId', response.data.userId);

      // ✅ Başarılı girişte yönlendir
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Giriş başarısız.');
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleLogin}>
        <h2>Giriş Yap</h2>

        <input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="auth-button">Giriş Yap</button>

        {error && <p className="auth-error">{error}</p>}

        <p className="auth-switch">
          Hesabınız yok mu? <Link to="/register">Kayıt Ol</Link>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;
