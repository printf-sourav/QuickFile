import React, { useState } from 'react';
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
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('User saved, navigating to dashboard');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
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
