import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface ExpiryTimerProps {
  expiresAt: string;
}

const ExpiryTimer = ({ expiresAt }: ExpiryTimerProps) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }

      
      setIsExpiringSoon(diff < 3600000);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setTimeLeft(`${days}d ${hours % 24}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); 

    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <div className={`flex items-center gap-1.5 text-sm ${
      isExpiringSoon ? 'text-warning' : 'text-muted-foreground'
    }`}>
      <Clock className="w-4 h-4" />
      <span>Expires in {timeLeft}</span>
    </div>
  );
};

export default ExpiryTimer;
