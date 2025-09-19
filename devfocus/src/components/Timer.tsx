'use client'
import { useCountdownTimer } from "../hooks/useCountdownTimer";
import TimerDisplay from "./TimerDisplay";
import PlayPauseButton from "./PlayPauseButton";

const Timer = () => {
	const {
    timeRemaining,
    isActive,
    startTimer,
    pauseTimer,
	} = useCountdownTimer();

	const handleToggle = () => {
		isActive ? pauseTimer() : startTimer()
	};

  return (
    <div
      id="timer-container"
      data-testid="timer-container"
      className="flex flex-col items-center justify-center min-h-screen py-2"
    >
      <TimerDisplay timeRemainingInSeconds={timeRemaining} />
      <div className="space-x-4">
        <PlayPauseButton isActive={isActive} onToggle={handleToggle} />
      </div>
    </div>
  );
};

export default Timer;
