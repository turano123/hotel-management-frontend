// 📁 src/pages/ProfilePage.jsx
import React, { useEffect, useState } from 'react';

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');

      try {
        const response = await fetch('http://localhost:5000/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (response.ok) {
          setProfile(data.user);
        } else {
          alert('❌ Erişim reddedildi: ' + data.error);
        }
      } catch (err) {
        alert('🚨 Sunucuya erişilemedi');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <p>Yükleniyor...</p>;

  return (
    <div style={{ padding: '30px' }}>
      <h2>👤 Kullanıcı Profili</h2>
      {profile ? (
        <div style={{ marginTop: '20px' }}>
          <p><strong>ID:</strong> {profile.userId}</p>
          <p><strong>Rol:</strong> {profile.role}</p>
        </div>
      ) : (
        <p>Kullanıcı bilgisi alınamadı.</p>
      )}
    </div>
  );
}

export default ProfilePage;
