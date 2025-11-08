import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import FileCard from '@/components/files/FileCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { FileX } from 'lucide-react';

interface FileData {
  _id: string;
  filename: string;
  size: number;
  url: string;
  expiresAt: string;
}

const Files = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [files, setFiles] = useState<FileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFiles();
    }
  }, [user]);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/files/allfile');
      const items: FileData[] = response.data?.data || [];
      setFiles(items);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch files';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/files/${id}`);
      setFiles((prev) => prev.filter((file) => file._id !== id));
      toast.success('File deleted successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete file';
      toast.error(message);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2">My Files</h1>
            <p className="text-lg text-muted-foreground">
              Manage your uploaded files
            </p>
          </div>

          {files.length === 0 ? (
            <div className="text-center py-20">
              <FileX className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No files yet</h3>
              <p className="text-muted-foreground">
                Upload your first file to get started
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {files.map((file, index) => (
                <motion.div
                  key={file._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <FileCard file={{
                    id: file._id,
                    filename: file.filename,
                    originalName: file.filename,
                    size: file.size,
                    url: file.url,
                    expiresAt: file.expiresAt,
                  }} onDelete={handleDelete} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Files;
