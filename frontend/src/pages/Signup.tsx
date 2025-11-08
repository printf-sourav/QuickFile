import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import CustomInput from '@/components/common/CustomInput';
import CustomButton from '@/components/common/CustomButton';
import Navbar from '@/components/layout/Navbar';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (user) return null; // hide entire signup if logged in

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await register(name, email, password);
      navigate('/files');
    } catch (error) {
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Registration Disabled</h1>
            <p className="text-muted-foreground">
              Account creation is currently closed.
            </p>
          </div>

          <div className="bg-card p-8 rounded-xl border border-border shadow-sm text-center">
            <p className="text-sm text-muted-foreground">Sign ups are disabled. Please contact support if you need access.</p>
            <div className="mt-6">
              <Link to="/login" className="text-primary hover:underline font-medium">
                Go to Login
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
