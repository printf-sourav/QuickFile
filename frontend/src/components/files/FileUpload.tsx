import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, File, CheckCircle } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import CustomButton from '@/components/common/CustomButton';
import ProgressBar from './ProgressBar';

interface FileUploadProps {
  onUploadSuccess?: () => void;
}

const FileUpload = ({ onUploadSuccess }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [expiryHours, setExpiryHours] = useState(24);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('expiryHours', expiryHours.toString());

    try {
      const response = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        },
      });

      toast.success('File uploaded successfully!');
      setSelectedFile(null);
      setUploadProgress(0);
      onUploadSuccess?.();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Upload failed';
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`file-upload-area p-12 text-center cursor-pointer ${
          isDragging ? 'drag-active' : ''
        }`}
        onClick={() => fileInputRef.current?.click()}
        whileHover={{ scale: 1.01 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="File upload"
        />
        
        <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">
          {isDragging ? 'Drop your file here' : 'Drag & drop your file'}
        </h3>
        <p className="text-muted-foreground mb-4">or click to browse</p>
        <p className="text-sm text-muted-foreground">Maximum file size: 100MB</p>
      </motion.div>

      {}
      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6 p-6 bg-card border border-border rounded-xl"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <File className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
                disabled={uploading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Auto-delete after:
              </label>
              <select
                value={expiryHours}
                onChange={(e) => setExpiryHours(Number(e.target.value))}
                className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={uploading}
              >
                <option value={1}>1 hour</option>
                <option value={6}>6 hours</option>
                <option value={24}>24 hours</option>
                <option value={72}>3 days</option>
                <option value={168}>7 days</option>
              </select>
            </div>

            {}
            {uploading && (
              <div className="mb-4">
                <ProgressBar progress={uploadProgress} />
              </div>
            )}

            {}
            <CustomButton
              onClick={handleUpload}
              disabled={uploading}
              fullWidth
              icon={uploading ? undefined : CheckCircle}
            >
              {uploading ? 'Uploading...' : 'Upload File'}
            </CustomButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;
