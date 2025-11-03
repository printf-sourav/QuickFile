import React, { useState, useEffect } from 'react';
import api from '../api';

const AllFiles = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await api.get('/files/allfile');
      console.log('Files response:', response.data);
      if (response.data.success) {
        setFiles(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId) => {
    console.log('Delete button clicked for:', fileId);
    
    try {
      console.log('Starting delete request...');
      const response = await api.delete(`/files/${fileId}`);
      console.log('Delete response:', response.data);
      
      if (response.data.success) {
        // Update state to remove the deleted file
        setFiles(prevFiles => {
          const newFiles = prevFiles.filter((file) => file._id !== fileId);
          console.log('Files after delete:', newFiles.length);
          return newFiles;
        });
      } else {
        throw new Error('Delete failed');
      }
    } catch (err) {
      console.error('Delete error:', err);
      console.error('Error details:', err.response?.data);
      alert(err.response?.data?.message || 'Failed to delete file');
      // Refetch files to ensure we have the correct state
      fetchFiles();
    }
  };

  const handleDownload = async (fileId, filename) => {
    try {
      console.log('Starting download for:', filename);
      
      // Download file from backend with proper headers
      const response = await api.get(`/files/direct-download/${fileId}`, {
        responseType: 'blob',
        timeout: 120000, // 2 minutes timeout for large files
        onDownloadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log('Download progress:', percentCompleted + '%');
        }
      });
      
      console.log('Response received, size:', response.data.size, 'bytes');
      
      // Verify we actually received data
      if (!response.data || response.data.size === 0) {
        throw new Error('Received empty file from server');
      }
      
      // Get filename from header if available
      const contentDisposition = response.headers['content-disposition'];
      let downloadFilename = filename;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
        if (filenameMatch && filenameMatch[1]) {
          downloadFilename = filenameMatch[1];
        }
      }
      
      console.log('Downloading as:', downloadFilename);
      
      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/octet-stream' });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = downloadFilename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      console.log('Download triggered successfully');
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
    } catch (error) {
      console.error('Download error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Failed to download file';
      if (error.message.includes('timeout')) {
        errorMessage = 'Download timeout - file may be too large';
      } else if (error.response?.status === 404) {
        errorMessage = 'File not found';
      } else if (error.message.includes('empty file')) {
        errorMessage = 'Received empty file from server';
      }
      
      alert(errorMessage);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (loading) {
    return (
      <div className="files-page d-flex justify-content-center align-items-center">
        <div className="spinner-border text-light" style={{ width: '3rem', height: '3rem' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="files-page">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="page-title mb-0">All Files</h1>
          <button 
            className="btn btn-light" 
            onClick={() => {
              setLoading(true);
              fetchFiles();
            }}
          >
            🔄 Refresh
          </button>
        </div>
        {files.length === 0 ? (
          <div className="text-center text-white">
            <h3>No files uploaded yet</h3>
            <p>Upload your first file to get started!</p>
          </div>
        ) : (
          <div className="row g-4">
            {files.map((file) => (
              <div key={file._id} className="col-md-6 col-lg-4">
                <div className="file-card">
                  <div className="file-icon">📄</div>
                  <h5 className="file-name">{file.filename}</h5>
                  <p className="file-size">{formatFileSize(file.size)}</p>
                  <p className="text-muted small">Downloads: {file.downloadCount}</p>
                  <div className="file-actions">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        console.log('Download button clicked');
                        handleDownload(file._id, file.filename);
                      }}
                    >
                      Download
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Delete button clicked - event triggered');
                        handleDelete(file._id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllFiles;
