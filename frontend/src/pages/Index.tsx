import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileUp, Shield, Clock, Zap } from 'lucide-react';
import CustomButton from '@/components/common/CustomButton';
import Navbar from '@/components/layout/Navbar';

const Index = () => {
  const features = [
    {
      icon: FileUp,
      title: 'Easy Upload',
      description: 'Drag and drop or click to upload files instantly',
    },
    {
      icon: Shield,
      title: 'Secure Sharing',
      description: 'Share files with secure, unique links',
    },
    {
      icon: Clock,
      title: 'Auto-Expire',
      description: 'Files automatically delete after set time',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Upload and share files in seconds',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Share Files Instantly
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Upload, share, and auto-expire files with QuickFile. Simple, secure, and fast file sharing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/upload">
                <CustomButton variant="primary" size="lg" icon={FileUp}>
                  Start Uploading
                </CustomButton>
              </Link>
              <Link to="/signup">
                <CustomButton variant="outline" size="lg">
                  Create Account
                </CustomButton>
              </Link>
            </div>
          </motion.div>
        </div>

        {}
        <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>
      </section>

      {}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose QuickFile?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience seamless file sharing with powerful features designed for simplicity.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-shadow"
              >
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-primary to-accent p-12 rounded-2xl text-center text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Join thousands of users sharing files securely with QuickFile.
            </p>
            <Link to="/signup">
              <CustomButton variant="secondary" size="lg">
                Create Free Account
              </CustomButton>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
