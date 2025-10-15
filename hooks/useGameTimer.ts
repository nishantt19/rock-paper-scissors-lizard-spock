import { useState, useEffect } from "react";

const TIMEOUT = 5 * 60 * 1000;

export const useGameTimer = (lastAction: bigint | undefined) => {
  const [remainingTime, setRemainingTime] = useState<number>(0);

  useEffect(() => {
    if (!lastAction) return;

    const lastActionInMs = Number(lastAction) * 1000;
    const timeoutEnd = lastActionInMs + TIMEOUT;

    const updateTimer = () => {
      const now = Date.now();
      const remaining = timeoutEnd - now;
      setRemainingTime(remaining > 0 ? remaining : 0);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [lastAction]);

  const formatTime = () => {
    const mins = Math.floor(remainingTime / 60000);
    const secs = Math.floor((remainingTime % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isTimeoutAvailable = remainingTime <= 0;

  return {
    remainingTime,
    formatTime,
    isTimeoutAvailable,
  };
};