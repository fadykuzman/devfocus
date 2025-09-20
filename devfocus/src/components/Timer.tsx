"use client";
import { useCountdownTimer } from "../hooks/useCountdownTimer";
import TimerDisplay from "./TimerDisplay";
import PlayPauseButton from "./PlayPauseButton";
import ResetButton from "./ResetButton";

const Timer = () => {
	const { timeRemaining, isActive, startTimer, pauseTimer, resetTimer } =
		useCountdownTimer();

	const handleToggle = () => {
		isActive ? pauseTimer() : startTimer();
	};

	return (
		<div
			id="timer-container"
			data-testid="timer-container"
			className="flex flex-col items-center justify-center min-h-screen py-2 safe-all"
		>
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
