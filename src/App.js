import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import RoomsPage from './pages/RoomsPage';
import ReservationsPage from './pages/ReservationsPage';
import AvailabilityPage from './pages/AvailabilityPage';

import MainLayout from './components/MainLayout';

export default function App() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    // Sayfa değişince localStorage'dan token’ı tekrar kontrol et
    setIsAuthenticated(!!localStorage.getItem('token'));
  }, [location]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated
            ? <Navigate to="/dashboard" replace />
            : <LoginPage />
        }
      />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        element={
          isAuthenticated
            ? <MainLayout />
            : <Navigate to="/" replace />
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/reservations" element={<ReservationsPage />} />
        <Route path="/musaitlik" element={<AvailabilityPage />} />
      </Route>

      <Route path="*" element={<h1>404 – Sayfa Bulunamadı</h1>} />
    </Routes>
  );
}
