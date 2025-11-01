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
        
        // Download the file as blob from backend
        const response = await api.patch(`/files/download/${token}`, {}, {
          responseType: 'blob'
        });
        
        console.log('Download started');
        
        // Get filename from content-disposition header
        const contentDisposition = response.headers['content-disposition'];
        let filename = 'download';
        
        if (contentDisposition) {
          // Try different regex patterns to extract filename
          const filenameMatch = contentDisposition.match(/filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?;?/i);
          if (filenameMatch && filenameMatch[1]) {
            filename = decodeURIComponent(filenameMatch[1]);
          }
        }
        
        // Create blob with proper content type
        const contentType = response.headers['content-type'] || 'application/octet-stream';
        const blob = new Blob([response.data], { type: contentType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        // Cleanup after a short delay
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 100);
        
        setStatus('success');
        
        // Redirect to landing page after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);
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
