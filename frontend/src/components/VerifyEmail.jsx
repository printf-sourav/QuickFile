import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await api.patch(`/users/verify/${token}`);
        
        if (response.data.success) {
          setStatus('success');
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          setStatus('error');
        }
      } catch (err) {
        console.error('Verification error:', err);
        setStatus('error');
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="landing-page">
      <div className="landing-content">
        {status === 'verifying' && (
          <>
            <div className="spinner-border text-light mb-3" style={{ width: '4rem', height: '4rem' }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h2 className="text-white">Verifying your email...</h2>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="landing-logo">✅</div>
            <h2 className="text-white">Email Verified!</h2>
            <p className="text-white">Your account has been verified successfully.</p>
            <p className="text-white">Redirecting to login page...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="landing-logo">❌</div>
            <h2 className="text-white">Verification Failed</h2>
            <p className="text-white">Invalid or expired verification link.</p>
            <button className="btn btn-light mt-3" onClick={() => navigate('/register')}>
              Register Again
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
