import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    avatar: null,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResendOption, setShowResendOption] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Client-side validation
    if (!formData.username || !formData.email || !formData.password) {
      setError('All fields are required (username, email, password)');
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(formData.email)){
      setError('Please provide a valid email address');
      setLoading(false);
      return;
    }

    // Password validation
    if(formData.password.length < 6){
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    // Username validation (no spaces)
    if(/\s/.test(formData.username)){
      setError('Username cannot contain spaces');
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append('username', formData.username);
      data.append('email', formData.email);
      data.append('password', formData.password);
      if (formData.avatar) {
        data.append('avatar', formData.avatar);
      }

      console.log('Submitting registration...');
      const response = await api.post('/users/register', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Registration response:', response.data);
      
      if (response.data.success) {
        alert('Registration successful! Please check your email to verify your account.');
        setShowResendOption(true);
        // Don't navigate immediately - show resend option
      }
    } catch (err) {
      console.error('Registration error:', err);
      
      // Extract error message from response
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.response) {
        // Server responded with error
        errorMessage = err.response.data?.message || errorMessage;
      } else if (err.request) {
        // Request was made but no response
        errorMessage = 'Cannot connect to server. Please check your connection.';
      } else if (err.message) {
        // Something else happened
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setError('');

    try {
      const response = await api.post('/users/resend-verification', { email: formData.email });
      
      if (response.data.success) {
        alert('✅ Verification email sent successfully! Please check your inbox.');
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
    if (e.target.name === 'avatar') {
      setFormData({
        ...formData,
        avatar: e.target.files[0],
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
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
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email}
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
          <div className="mb-3">
            <label htmlFor="avatar" className="form-label">
              Profile Picture (Optional)
            </label>
            <input
              type="file"
              className="form-control"
              id="avatar"
              name="avatar"
              onChange={handleChange}
              accept="image/*"
            />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Registering...
              </>
            ) : (
              'Register'
            )}
          </button>
        </form>

        {/* Show resend option after successful registration */}
        {showResendOption && (
          <div className="mt-4 p-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '10px' }}>
            <div className="alert alert-info mb-3">
              <strong>
                <span style={{ marginRight: '8px' }}>📧</span>
                Check your email!
              </strong>
              <br />
              We've sent a verification link to <strong>{formData.email}</strong>
            </div>
            <p className="text-white small mb-3">
              <span style={{ marginRight: '5px' }}>❓</span>
              Didn't receive the email?
            </p>
            <button 
              className="btn btn-warning w-100 mb-2" 
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
              className="btn btn-success w-100" 
              onClick={() => navigate('/login')}
            >
              <span style={{ marginRight: '8px' }}>✅</span>
              Go to Login
            </button>
          </div>
        )}

        <div className="auth-link">
          Already have an account?{' '}
          <span 
            onClick={() => navigate('/login')} 
            style={{ cursor: 'pointer', color: '#667eea', fontWeight: 600 }}
          >
            Login here
          </span>
        </div>
      </div>
    </div>
  );
};

export default Register;
