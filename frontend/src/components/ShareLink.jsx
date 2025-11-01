import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const ShareLink = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [shareLink, setShareLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Upload file
      const formData = new FormData();
      formData.append('files', file);

      const uploadResponse = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload response:', uploadResponse.data);
      
      if (uploadResponse.data.success && uploadResponse.data.data.length > 0) {
        const fileId = uploadResponse.data.data[0]._id;
        console.log('File uploaded, ID:', fileId);

        // Generate share link - backend route is /:id/share (POST)
        const linkResponse = await api.post(`/files/${fileId}/share`);
        console.log('Link response:', linkResponse.data);
        
        if (linkResponse.data.success) {
          // Backend returns {shortUrl, longUrl} in data
          const shareUrl = linkResponse.data.data.shortUrl || linkResponse.data.data.longUrl;
          setShareLink(shareUrl);
        }
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || 'Failed to generate share link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="share-page">
      <div className="container">
        <div className="share-card">
          <h2 className="auth-title">Share a File</h2>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          
          {!shareLink ? (
            <>
              <div className="upload-area" onClick={() => document.getElementById('fileInput').click()}>
                <div className="upload-icon">📁</div>
                <h4>Click to select a file</h4>
                <p className="text-muted">{file ? file.name : 'No file selected'}</p>
              </div>
              <input
                type="file"
                id="fileInput"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <button
                className="btn btn-primary w-100"
                onClick={handleUpload}
                disabled={loading || !file}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Generating Link...
                  </>
                ) : (
                  'Generate Share Link'
                )}
              </button>
            </>
          ) : (
            <div className="link-display">
              <h4 className="text-center mb-3">Your Share Link</h4>
              <div className="link-text">{shareLink}</div>
              <div className="d-flex gap-2">
                <button className="btn btn-copy flex-grow-1" onClick={handleCopy}>
                  📋 Copy Link
                </button>
                <button
                  className="btn btn-secondary flex-grow-1"
                  onClick={() => {
                    setShareLink('');
                    setFile(null);
                  }}
                >
                  Upload Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareLink;
