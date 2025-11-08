import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import CustomInput from '@/components/common/CustomInput';
import CustomButton from '@/components/common/CustomButton';
import Navbar from '@/components/layout/Navbar';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/files');
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
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
            <h1 className="text-4xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">
              Sign in to access your files
            </p>
          </div>

          <div className="bg-card p-8 rounded-xl border border-border shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <CustomInput
                label="Email"
                type="email"
                icon={Mail}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <CustomInput
                label="Password"
                type="password"
                icon={Lock}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <CustomButton
                type="submit"
                disabled={isLoading}
                fullWidth
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </CustomButton>
              <p className="text-xs text-muted-foreground text-center">Tip: If you were redirected here after a refresh, just sign in again.</p>
            </form>

            {}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
