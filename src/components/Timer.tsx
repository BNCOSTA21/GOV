import React from 'react';
import { useTimer } from '@/hooks/useTimer';

interface TimerProps {
  initialHours?: number;
  initialMinutes?: number;
  initialSeconds?: number;
  onComplete?: () => void;
  className?: string;
}

export const Timer: React.FC<TimerProps> = ({ 
  initialHours = 0,
  initialMinutes = 0,
  initialSeconds = 0,
  onComplete,
  className = ''
}) => {
  const { formatTime } = useTimer({ 
    initialHours, 
    initialMinutes, 
    initialSeconds, 
    onComplete 
  });

  return (
    <div className={`font-mono text-2xl font-bold ${className}`}>
      {formatTime()}
    </div>
  );
};