import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import api from './api';

// Components
import Landing from './components/Landing';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ShareLink from './components/ShareLink';
import Profile from './components/Profile';
import AllFiles from './components/AllFiles';
import Upload from './components/Upload';
import Download from './components/Download';

// Navbar Component
const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing user:', e);
        localStorage.removeItem('user');
      }
    }
  }, [location]);

  const handleLogout = async () => {
    try {
      await api.post('/users/logout');
      localStorage.removeItem('user');
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
      localStorage.removeItem('user');
      navigate('/');
    }
  };

  if (!user) {
    console.log('No user in navbar');
    return null;
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light fixed-top">
      <div className="container">
        <div 
          className="navbar-brand" 
          onClick={() => navigate('/dashboard')}
          style={{ cursor: 'pointer' }}
        >
          <span className="navbar-logo">📁</span>
          QuickFile
        </div>
        <div className="ms-auto">
          <div className="dropdown">
            <button
              className="btn btn-outline-primary dropdown-toggle"
              type="button"
              id="navbarDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {user.username}
            </button>
            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
              <li>
                <button 
                  className="dropdown-item" 
                  onClick={() => navigate('/dashboard')}
                >
                  🏠 Dashboard
                </button>
              </li>
              <li>
                <button 
                  className="dropdown-item" 
                  onClick={() => navigate('/profile')}
                >
                  👤 Profile
                </button>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <button className="dropdown-item" onClick={handleLogout}>
                  🚪 Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('user');
  console.log('ProtectedRoute check - user exists:', !!user);
  
  if (!user) {
    console.log('No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public Route Component (redirect to dashboard if logged in)
const PublicRoute = ({ children }) => {
  const user = localStorage.getItem('user');
  return user ? <Navigate to="/dashboard" /> : children;
};

// App Content Component
const AppContent = () => {
  const location = useLocation();
  const isAuthPage = ['/', '/login', '/register'].includes(location.pathname) || location.pathname.startsWith('/download');

  useEffect(() => {
    if (isAuthPage) {
      document.body.style.paddingTop = '0';
    } else {
      document.body.style.paddingTop = '70px';
    }
  }, [isAuthPage]);

  return (
    <>
      {!isAuthPage && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Landing />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        
        {/* Download Route (public but special) */}
        <Route path="/download/:token" element={<Download />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/share-link"
          element={
            <ProtectedRoute>
              <ShareLink />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/all-files"
          element={
            <ProtectedRoute>
              <AllFiles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

// Main App Component
const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
