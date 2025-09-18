import { useState, useEffect, useCallback } from "react";

const INITIAL_TIME = 2400; // 40 minutes in seconds

export function useCountdownTimer() {
  const [timeRemaining, setTimeRemaining] = useState(INITIAL_TIME);
  const [isActive, setIsActive] = useState(false);

  const startTimer = useCallback(() => {
    setIsActive(true);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsActive(false);
  }, []);

  const resetTimer = useCallback(() => {
	  setIsActive(false);
	  setTimeRemaining(INITIAL_TIME);
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  return {
    timeRemaining,
    isActive,
    startTimer,
    pauseTimer,
	resetTimer,
  };
};
