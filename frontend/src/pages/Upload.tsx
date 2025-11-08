import { motion } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import FileUpload from '@/components/files/FileUpload';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const Upload = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
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
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Upload Your File</h1>
            <p className="text-lg text-muted-foreground">
              Share files securely with auto-expiry links
            </p>
          </div>

          <FileUpload />
        </motion.div>
      </div>
    </div>
  );
};

export default Upload;
