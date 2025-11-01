import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="landing-content">
        <div className="landing-logo">📁</div>
        <h1 className="landing-title">QuickFile</h1>
        <p className="landing-subtitle">Share your files instantly and securely</p>
        <div className="landing-buttons">
          <button className="btn btn-light" onClick={() => navigate('/login')}>
            Login
          </button>
          <button className="btn btn-outline-light" onClick={() => navigate('/register')}>
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
