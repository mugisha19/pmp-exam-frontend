/**
 * CountdownTimer Component
 * Countdown timer for scheduled quizzes
 */

import { Clock } from "lucide-react";
import { cn } from "@/utils/cn";
import { useState, useEffect } from "react";

export const CountdownTimer = ({ targetDate, className, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!targetDate) {
      setTimeLeft(null);
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      if (isNaN(target)) {
        setTimeLeft(null);
        return;
      }
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft(null);
        onExpire?.();
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onExpire]);

  if (!timeLeft) {
    return null;
  }

  const formatTime = (value) => String(value).padStart(2, "0");

  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      <Clock className="w-4 h-4 text-accent-primary" />
      <span className="text-gray-600">Starts in:</span>
      <div className="flex items-center gap-1 font-medium text-gray-900">
        {timeLeft.days > 0 && (
          <>
            <span>{timeLeft.days}d</span>
            <span className="text-gray-400">:</span>
          </>
        )}
        <span>{formatTime(timeLeft.hours)}</span>
        <span className="text-gray-400">:</span>
        <span>{formatTime(timeLeft.minutes)}</span>
        <span className="text-gray-400">:</span>
        <span>{formatTime(timeLeft.seconds)}</span>
      </div>
    </div>
  );
};

export default CountdownTimer;

