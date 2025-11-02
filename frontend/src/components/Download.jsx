import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

const Download = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [hasDownloaded, setHasDownloaded] = React.useState(false);

  useEffect(() => {
    // Prevent double download
    if (hasDownloaded) return;

    const downloadFile = async () => {
      try {
        setHasDownloaded(true);
        
        // Get file metadata from backend
        const response = await api.patch(`/files/download/${token}`);
        
        if (response.data.success && response.data.data.url) {
          const { url, filename } = response.data.data;
          
          // Download directly from Cloudinary URL
          const link = document.createElement('a');
          link.href = url;
          link.download = filename || 'download';
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          setStatus('success');
          
          // Redirect to landing page after 3 seconds
          setTimeout(() => {
            navigate('/');
          }, 3000);
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (err) {
        console.error('Download error:', err);
        setStatus('error');
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    };

    downloadFile();
  }, [token, navigate, hasDownloaded]);

  return (
    <div className="landing-page">
      <div className="landing-content">
        {status === 'loading' && (
          <>
            <div className="spinner-border text-light mb-3" style={{ width: '4rem', height: '4rem' }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h2 className="text-white">Downloading your file...</h2>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="landing-logo">✅</div>
            <h2 className="text-white">Download started!</h2>
            <p className="text-white">Redirecting you to home page...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="landing-logo">❌</div>
            <h2 className="text-white">Download failed</h2>
            <p className="text-white">Invalid or expired link. Redirecting...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default Download;
