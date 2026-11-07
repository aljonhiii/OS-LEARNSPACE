import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function CountdownTimer({ initialSeconds = 8703, label = "left to next lesson" }) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  const formatTime = (secs) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-end justify-center">
      <div className="flex items-center gap-2">
        <span className="font-mono text-3xl font-bold tracking-tight text-blue-600">
          {formatTime(secondsLeft)}
        </span>
      </div>
      <span className="text-xs font-medium text-slate-400 mt-0.5">
        {label}
      </span>
    </div>
  );
}
