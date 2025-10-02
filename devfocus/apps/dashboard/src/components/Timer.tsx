"use client";
import { useState, useCallback, useEffect} from "react";
import { useCountdownTimer } from "../hooks/useCountdownTimer";
import { useNotifications } from "../hooks/useNotifications";
import TimerDisplay from "./TimerDisplay";
import PlayPauseButton from "./PlayPauseButton";
import ResetButton from "./ResetButton";
import TimerModeSwitch from "./TimerModeSwitch";
import { TimerMode } from "../types/timer";

const Timer = () => {
  const [mode, setMode] = useState<TimerMode>(TimerMode.FOCUS);

  const { timeRemaining, isActive, startTimer, pauseTimer, resetTimer } =
    useCountdownTimer({ type: mode });

  const {requestPermission, notify} = useNotifications({type: mode}); 

  const handleToggle = useCallback((): void => {
    isActive ? pauseTimer() : startTimer();
  }, [isActive, pauseTimer, startTimer]); 

  const onModeChange = useCallback((): void => {
    if (mode === TimerMode.FOCUS) {
      setMode(TimerMode.BREAK);
    } else {
      setMode(TimerMode.FOCUS);
    }
  }, [mode]);


  useEffect(() => {
	  requestPermission();
  },[requestPermission]);

  useEffect(() => {
	  if (timeRemaining === 0 && isActive) {
		  console.log("Timer ended, sending notification");
		  notify();
		  pauseTimer();
	  }

  }, [timeRemaining, isActive, notify, pauseTimer]);

  return (
    <div
      id="timer-container"
      data-testid="timer-container"
      className="flex flex-col items-center justify-center min-h-screen py-2 safe-all"
    >
      <TimerModeSwitch
        currentMode={mode}
        isTimerActive={isActive}
        onModeChange={onModeChange}
      />

      <div className="mt-8 md:mt-12 lg:mt-18">
        <TimerDisplay timeRemainingInSeconds={timeRemaining} />
      </div>
      <div className="flex space-x-4">
        <PlayPauseButton isActive={isActive} onToggle={handleToggle} />
        <ResetButton onClick={resetTimer} />
      </div>
    </div>
  );
};

export default Timer;
