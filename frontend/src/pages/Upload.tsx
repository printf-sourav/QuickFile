import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import FileUpload from '@/components/files/FileUpload';

const Upload = () => {
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
