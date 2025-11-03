import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

const Download = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [hasDownloaded, setHasDownloaded] = React.useState(false);

  useEffect(() => {
    // Prevent double download
    if (hasDownloaded) return;

    const downloadFile = async () => {
      try {
        setHasDownloaded(true);
        
        console.log('API Base URL:', import.meta.env.VITE_API_URL);
        console.log('Downloading via token:', token);
        
        // Download file directly from backend (it will stream with proper headers)
        const response = await api.get(`/files/download/${token}`, {
          responseType: 'blob',
          timeout: 120000, // 2 minutes timeout for large files
          onDownloadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log('Download progress:', percentCompleted + '%');
          }
        });
        
        // Get filename from content-disposition header
        const contentDisposition = response.headers['content-disposition'];
        let filename = 'download';
        
        if (contentDisposition) {
          // Extract filename from: attachment; filename="test.pdf"
          const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1];
          }
        }
        
        console.log('Content-Disposition:', contentDisposition);
        console.log('Downloaded filename:', filename);
        console.log('File size:', response.data.size, 'bytes');
        
        // Verify we actually received data
        if (!response.data || response.data.size === 0) {
          throw new Error('Received empty file from server');
        }
        
        // Create blob URL and trigger download
        const blob = new Blob([response.data], { type: 'application/octet-stream' });
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        console.log('Download triggered successfully');
        
        // Cleanup
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
        }, 100);
        
        setStatus('success');
        
        // Redirect to landing page after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } catch (err) {
        console.error('Download error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        
        // Set a more descriptive error message
        if (err.response?.status === 404) {
          setErrorMessage('Download link not found or expired');
        } else if (err.message.includes('Network Error')) {
          setErrorMessage('Cannot connect to server. Check API URL configuration.');
        } else {
          setErrorMessage(err.response?.data?.message || 'Download failed. Please try again.');
        }
        
        setStatus('error');
        setTimeout(() => {
          navigate('/');
        }, 5000);
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
            <p className="text-white">{errorMessage}</p>
            <p className="text-white mt-2"><small>Redirecting in 5 seconds...</small></p>
          </>
        )}
      </div>
    </div>
  );
};

export default Download;
