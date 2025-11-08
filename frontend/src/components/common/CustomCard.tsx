import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CustomCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const CustomCard = ({ children, className, hover = false }: CustomCardProps) => {
  return (
    <motion.div
      whileHover={hover ? { y: -4, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' } : {}}
      className={cn(
        'bg-card text-card-foreground rounded-xl border border-border p-6 shadow-sm',
        'transition-all duration-200',
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export default CustomCard;
