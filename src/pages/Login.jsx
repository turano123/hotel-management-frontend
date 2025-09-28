// src/pages/Login.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios"; // <- diziline göre: pages/ -> api/ (1 seviye yukarı)

export default function Login() {
  const navigate = useNavigate();

  // ---------- form state ----------
  const [email, setEmail] = useState(() => localStorage.getItem("rememberEmail") || "");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(!!localStorage.getItem("rememberEmail"));
  const [showPwd, setShowPwd] = useState(false);

  // ---------- ui state ----------
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [caps, setCaps] = useState(false);

  const pwdRef = useRef(null);
  const abortRef = useRef(null);

  // token varsa doğrudan yönlendir
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/", { replace: true });
    return () => {
      // unmount'ta pending istek varsa iptal et
      abortRef.current?.abort?.();
    };
  }, [navigate]);

  // Caps Lock tespiti
  const handleKeyEvent = (e) => {
    try {
      const isCaps = e.getModifierState && e.getModifierState("CapsLock");
      setCaps(!!isCaps);
    } catch {}
  };

  // yalnız dev ortamında örnek doldurma butonları
  const samples = useMemo(
    () =>
      (import.meta?.env?.DEV
        ? [
            { tag: "Master", email: "master@demo.local", pass: "Master123!" },
            { tag: "Otel 1", email: "hotel1@demo.local", pass: "Demo123!" },
          ]
        : []),
    []
  );
  const fill = (s) => {
    setEmail(s.email);
    setPassword(s.pass);
    setTimeout(() => pwdRef.current?.focus(), 0);
  };

  // basit e-posta kontrolü
  const isValidEmail = (v) => /\S+@\S+\.\S+/.test(v);

  // login sonrası session kaydı
  const saveSession = (resp) => {
    const token = resp?.token || resp?.accessToken;
    const role =
      resp?.role ||
      resp?.user?.role ||
      (resp?.user?.isMaster ? "MASTER_ADMIN" : "HOTEL_ADMIN") ||
      "HOTEL_ADMIN";
    const hotelId =
      resp?.hotel?._id ||
      resp?.hotelId ||
      resp?.user?.hotel?._id ||
      resp?.user?.hotelId ||
      "";

    if (token) localStorage.setItem("token", token);
    if (role) localStorage.setItem("role", role);
    if (hotelId) localStorage.setItem("hotelId", hotelId);

    if (remember) localStorage.setItem("rememberEmail", email);
    else localStorage.removeItem("rememberEmail");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setError("E-posta ve şifre zorunludur.");
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setError("Lütfen geçerli bir e-posta girin.");
      return;
    }

    // varsa önceki isteği iptal et
    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const { data } = await api.post(
        "/auth/login",
        { email: trimmedEmail, password },
        { signal: controller.signal }
      );
      saveSession(data);
      navigate("/", { replace: true });
    } catch (err) {
      // backend tarafı: 400 doğrulama/kredi hatası, 429 rate limit, vs.
      const resp = err?.response;
      const msgFromApi =
        resp?.data?.message ||
        (resp?.status === 429
          ? "Çok fazla deneme. Lütfen biraz sonra tekrar deneyin."
          : "");
      setError(msgFromApi || "Giriş başarısız. Bilgileri kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand">
            <span className="dot" />
            <span>HMS &amp; Channels</span>
          </div>
          <h1 className="auth-title">Panele Giriş</h1>
          <p className="auth-subtitle">Master veya Otel kullanıcısı ile giriş yapın.</p>
        </div>

        {error && (
          <div className="card auth-alert" role="alert">
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={onSubmit} onKeyUp={handleKeyEvent} noValidate>
          <label className="field">
            <span className="field-label">E-posta</span>
            <input
              className="input"
              type="email"
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              autoComplete="username email"
              placeholder="ornek@otel.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              aria-invalid={!!error}
            />
          </label>

          <label className="field password-field">
            <span className="field-label">Şifre</span>
            <input
              ref={pwdRef}
              className="input"
              type={showPwd ? 'text' : 'password'}
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyUp={handleKeyEvent}
              disabled={loading}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="btn ghost toggle"
              onClick={() => setShowPwd((s) => !s)}
              tabIndex={-1}
              aria-label={showPwd ? 'Şifreyi gizle' : 'Şifreyi göster'}
            >
              {showPwd ? 'Gizle' : 'Göster'}
            </button>
            {caps && <div className="caps-warning">Caps Lock açık görünüyor.</div>}
          </label>

          <div className="remember-row">
            <label>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={loading}
              />
              <span>Beni hatırla</span>
            </label>
            <span className="security-note">Güvenilmeyen cihazlarda şifre kaydetmeyin.</span>
          </div>

          <button className="btn primary auth-submit" disabled={loading}>
            {loading ? 'Giriş yapılıyor…' : 'Giriş yap'}
          </button>
        </form>

        {samples.length > 0 && (
          <div className="auth-footer" aria-live="polite">
            <div className="divider"><span>Örnek kullanıcılar (DEV)</span></div>
            <div className="samples">
              {samples.map((s) => (
                <button
                  key={s.tag}
                  type="button"
                  className="btn outline"
                  onClick={() => fill(s)}
                  disabled={loading}
                  title={`${s.email} / ${s.pass}`}
                >
                  {s.tag}
                </button>
              ))}
            </div>
            <p className="auth-note">
              Örnekler: <b>master@demo.local / Master123!</b> — <b>hotel1@demo.local / Demo123!</b>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
