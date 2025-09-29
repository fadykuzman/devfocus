import { useCallback, useState, useEffect} from "react";

interface TimerModeSwitchProps {
	currentMode: 'focus' | 'break';
	isTimerActive: boolean;
	onModeChange: (mode: 'focus' | 'break') => void;
}

const TimerModeSwitch = ({ currentMode, isTimerActive, onModeChange }: TimerModeSwitchProps) => {

	const changeMode = useCallback(() => {
		if (currentMode === 'focus') {
			onModeChange('break')
		} else {
			onModeChange('focus')
		}

	}, [currentMode])

	return (
		<div data-testid="timer-mode-switch" id="timer-mode-switch">
			<input
				type="checkbox"
				role="switch"
				disabled={isTimerActive}
				aria-label="Switch between focus and break mode"
				aria-checked={currentMode === 'break'}
				aria-describedby="mode-info"
				aria-controls="timer-display"
				onClick={changeMode}
			/>
			<span id="mode-info">
				{currentMode === 'focus' ?
						'FOCUS . 40min' : 'BREAK . 10min'}
				</span >
		</div>

	);
}

export default TimerModeSwitch;
