import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileUp, Moon, Sun, LogOut, User, Files } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import CustomButton from '@/components/common/CustomButton';
import { useCallback } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const goProfile = useCallback(() => navigate('/profile'), [navigate]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-primary rounded-lg group-hover:scale-110 transition-transform">
              <FileUp className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">QuickFile</span>
          </Link>

          {}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/upload">
                  <CustomButton variant="ghost" size="sm" icon={FileUp}>
                    Upload
                  </CustomButton>
                </Link>
                <Link to="/files">
                  <CustomButton variant="ghost" size="sm" icon={Files}>
                    My Files
                  </CustomButton>
                </Link>
                <CustomButton
                  variant="ghost"
                  size="sm"
                  icon={theme === 'dark' ? Sun : Moon}
                  onClick={toggleTheme}
                />
                <button
                  onClick={goProfile}
                  className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">{user.username || user.email}</span>
                </button>
                <CustomButton
                  variant="outline"
                  size="sm"
                  icon={LogOut}
                  onClick={handleLogout}
                >
                  Logout
                </CustomButton>
              </>
            ) : (
              <>
                <CustomButton
                  variant="ghost"
                  size="sm"
                  icon={theme === 'dark' ? Sun : Moon}
                  onClick={toggleTheme}
                />
                <Link to="/login">
                  <CustomButton variant="ghost" size="sm">
                    Login
                  </CustomButton>
                </Link>
                <Link to="/signup">
                  <CustomButton variant="primary" size="sm">
                    Sign Up
                  </CustomButton>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      {}
    </motion.nav>
  );
};

export default Navbar;
