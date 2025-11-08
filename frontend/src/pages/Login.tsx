import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  
  // Get the page the user was trying to access, default to /files
  // Avoid redirecting back to /login or /signup
  const from = (location.state as any)?.from;
  const redirectTo = (from && from !== '/login' && from !== '/signup') ? from : '/files';

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(redirectTo, { replace: true });
    }
  }, [user, navigate, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      // Navigation will be handled by useEffect after user state updates
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
            <div className="mt-6 text-center">
              <span className="text-sm text-muted-foreground">Don't have an account? </span>
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Create one
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
