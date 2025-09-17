import { useState, useEffect } from 'react';

interface UseTimerProps {
  initialHours?: number;
  initialMinutes?: number;
  initialSeconds?: number;
  onComplete?: () => void;
}

export const useTimer = ({ 
  initialHours = 0, 
  initialMinutes = 0, 
  initialSeconds = 0,
  onComplete 
}: UseTimerProps) => {
  const [time, setTime] = useState({
    hours: initialHours,
    minutes: initialMinutes,
    seconds: initialSeconds
  });

  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTime(prevTime => {
        const totalSeconds = prevTime.hours * 3600 + prevTime.minutes * 60 + prevTime.seconds;
        
        if (totalSeconds <= 1) {
          setIsRunning(false);
          onComplete?.();
          return { hours: 0, minutes: 0, seconds: 0 };
        }

        const newTotal = totalSeconds - 1;
        const newHours = Math.floor(newTotal / 3600);
        const newMinutes = Math.floor((newTotal % 3600) / 60);
        const newSeconds = newTotal % 60;

        return {
          hours: newHours,
          minutes: newMinutes,
          seconds: newSeconds
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, onComplete]);

  const formatTime = () => {
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${pad(time.hours)}:${pad(time.minutes)}:${pad(time.seconds)}`;
  };

  return {
    time,
    formatTime,
    isRunning,
    setIsRunning
  };
};