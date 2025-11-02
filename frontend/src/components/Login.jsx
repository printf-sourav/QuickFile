import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Logging in with:', formData);
      const response = await api.post('/users/login', formData);
      console.log('Login response:', response.data);
      
      if (response.data.success) {
        const userData = response.data.data; // User object is directly in data
        console.log('Setting user in localStorage:', userData);
        
        // Check if email is verified
        if (userData.emailVerified === false) {
          setError('Please verify your email before logging in. Check your inbox for the verification link.');
          setShowResend(true); // Show resend option immediately
          return;
        }
        
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('User saved, navigating to dashboard');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Extract error message from response
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.response) {
        // Server responded with error
        errorMessage = err.response.data?.message || errorMessage;
        
        // Show resend button if email is not verified
        if (errorMessage.toLowerCase().includes('not verified') || 
            errorMessage.toLowerCase().includes('not verfied')) {
          setShowResend(true);
        }
      } else if (err.request) {
        // Request was made but no response
        errorMessage = 'Cannot connect to server. Please check your connection.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!resendEmail) {
      setError('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(resendEmail)){
      setError('Please enter a valid email address');
      return;
    }

    setResendLoading(true);
    setError('');
    setResendSuccess('');

    try {
      const response = await api.post('/users/resend-verification', { email: resendEmail });
      
      if (response.data.success) {
        setResendSuccess('✅ Verification email sent successfully! Please check your inbox.');
        setShowResend(false);
        setTimeout(() => {
          setResendSuccess('');
        }, 5000);
      }
    } catch (err) {
      console.error('Resend error:', err);
      
      // Extract error message
      let errorMessage = 'Failed to resend email. Please try again.';
      if (err.response) {
        errorMessage = err.response.data?.message || errorMessage;
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please check your connection.';
      }
      
      setError(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        {resendSuccess && (
          <div className="alert alert-success" role="alert">
            {resendSuccess}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              className="form-control"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        {/* Resend Verification Email Section */}
        {showResend && (
          <div className="mt-4 p-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '10px' }}>
            <h6 className="text-white mb-3">
              <span style={{ marginRight: '8px' }}>📧</span>
              Resend Verification Email
            </h6>
            <div className="mb-3">
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
              />
            </div>
            <button 
              className="btn btn-warning w-100" 
              onClick={handleResendVerification}
              disabled={resendLoading}
            >
              {resendLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Sending...
                </>
              ) : (
                <>
                  <span style={{ marginRight: '8px' }}>🔄</span>
                  Resend Verification Email
                </>
              )}
            </button>
            <button 
              className="btn btn-link text-white w-100 mt-2" 
              onClick={() => setShowResend(false)}
            >
              <span style={{ marginRight: '5px' }}>✖️</span>
              Cancel
            </button>
          </div>
        )}

        {/* Always show resend link at bottom */}
        {!showResend && (
          <div className="text-center mt-3">
            <button 
              className="btn btn-link" 
              onClick={() => setShowResend(true)}
              style={{ 
                textDecoration: 'none', 
                fontSize: '0.9rem',
                color: '#a0aec0'
              }}
            >
              <span style={{ marginRight: '5px' }}>📧</span>
              Didn't receive verification email?
            </button>
          </div>
        )}

        <div className="auth-link">
          Don't have an account?{' '}
          <span 
            onClick={() => navigate('/register')} 
            style={{ cursor: 'pointer', color: '#667eea', fontWeight: 600 }}
          >
            Register here
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
