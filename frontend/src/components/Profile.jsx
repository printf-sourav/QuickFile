import React, { useState, useEffect } from 'react';
import api from '../api';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        setUser(storedUser);

        const statsResponse = await api.get('/stats/');
        console.log('Stats response:', statsResponse.data);
        if (statsResponse.data.success) {
          setStats(statsResponse.data.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="profile-page d-flex justify-content-center align-items-center">
        <div className="spinner-border text-light" style={{ width: '3rem', height: '3rem' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">
        <h1 className="page-title">Profile</h1>
        
        <div className="profile-card">
          <div className="profile-header">
            <img
              src={user?.avatar || 'https://via.placeholder.com/150'}
              alt="Profile"
              className="profile-avatar"
            />
            <h2 className="profile-name">{user?.username || 'User'}</h2>
            <p className="profile-email">{user?.email || 'user@example.com'}</p>
          </div>
        </div>

        {stats && (
          <>
            <div className="row g-4 mb-4">
              <div className="col-md-4">
                <div className="stat-card">
                  <div className="stat-value">{stats.totalFiles || 0}</div>
                  <div className="stat-label">Total Files</div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="stat-card">
                  <div className="stat-value">{stats.totalDownloads || 0}</div>
                  <div className="stat-label">Total Downloads</div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="stat-card">
                  <div className="stat-value">{stats.totalStorageUsed || 0} MB</div>
                  <div className="stat-label">Storage Used</div>
                </div>
              </div>
            </div>

            {stats.mostDownloadedFile && (
              <div className="profile-card">
                <h3 className="mb-3">Most Downloaded File</h3>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5>{stats.mostDownloadedFile.filename}</h5>
                    <p className="text-muted mb-0">
                      Downloads: {stats.mostDownloadedFile.downloadCount}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
