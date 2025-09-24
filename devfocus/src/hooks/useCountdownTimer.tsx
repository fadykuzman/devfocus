import { useState, useEffect, useCallback } from "react";

const DEFAULT_FOCUS_DURATION = 2400; // 40 minutes in seconds
const DEFAULT_BREAK_DURATION = 600;

interface useCountdownTimerOptions {
	type?: "focus" | "break";
}

export function useCountdownTimer(options: useCountdownTimerOptions = {}) {
	const { type = "focus" } = options;

	const getInitialTime = useCallback(() => {
		return type === "break" ? DEFAULT_BREAK_DURATION : DEFAULT_FOCUS_DURATION;
	}, [type]);

	const [timeRemaining, setTimeRemaining] = useState(() => getInitialTime());
	const [isActive, setIsActive] = useState(false);

	const startTimer = useCallback(() => {
		setIsActive(true);
	}, []);

	const pauseTimer = useCallback(() => {
		setIsActive(false);
	}, []);

	const resetTimer = useCallback(() => {
		setIsActive(false);
		setTimeRemaining(getInitialTime());
	}, [type, getInitialTime]);

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
}
