import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  
  console.log('Dashboard component rendering');

  const actions = [
    {
      icon: '🔗',
      title: 'Share Link',
      description: 'Upload a file and generate a shareable link',
      path: '/share-link',
    },
    {
      icon: '👤',
      title: 'Profile',
      description: 'View your profile and statistics',
      path: '/profile',
    },
    {
      icon: '📂',
      title: 'All Files',
      description: 'View and manage all your uploaded files',
      path: '/all-files',
    },
    {
      icon: '⬆️',
      title: 'Upload File',
      description: 'Upload files to your account',
      path: '/upload',
    },
  ];

  return (
    <div className="dashboard">
      <div className="container">
        <h1 className="dashboard-title">Dashboard</h1>
        <div className="row g-4">
          {actions.map((action, index) => (
            <div key={index} className="col-md-6 col-lg-3">
              <div className="action-card" onClick={() => navigate(action.path)}>
                <div className="action-card-icon">{action.icon}</div>
                <h3 className="action-card-title">{action.title}</h3>
                <p className="action-card-desc">{action.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
