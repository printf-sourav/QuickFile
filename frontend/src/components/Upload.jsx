import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Upload = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
    setError('');
    setSuccess('');
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      console.log('Uploading files:', files.length);
      const response = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload response:', response.data);
      
      if (response.data.success) {
        setSuccess(`Successfully uploaded ${response.data.data.length} file(s)!`);
        setFiles([]);
        document.getElementById('fileInput').value = '';
        
        // Redirect to All Files page after 1.5 seconds
        setTimeout(() => {
          navigate('/all-files');
        }, 1500);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-page">
      <div className="container">
        <div className="share-card">
          <h2 className="auth-title">Upload Files</h2>
          
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          
          {success && (
            <div className="alert alert-success" role="alert">
              {success}
            </div>
          )}

          <div className="upload-area" onClick={() => document.getElementById('fileInput').click()}>
            <div className="upload-icon">⬆️</div>
            <h4>Click to select files</h4>
            <p className="text-muted">
              {files.length > 0 ? `${files.length} file(s) selected` : 'No files selected'}
            </p>
            {files.length > 0 && (
              <div className="mt-2">
                {files.map((file, index) => (
                  <div key={index} className="text-muted small">
                    {file.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <input
            type="file"
            id="fileInput"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          
          <button
            className="btn btn-primary w-100"
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
          >
            {uploading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Uploading...
              </>
            ) : (
              'Upload Files'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Upload;
