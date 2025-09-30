import { useCallback } from "react";
import { TimerMode } from "../types/timer";

interface TimerModeSwitchProps {
  currentMode: TimerMode;
  isTimerActive: boolean;
  onModeChange: (mode: TimerMode) => void;
}

const TimerModeSwitch = ({
  currentMode,
  isTimerActive,
  onModeChange,
}: TimerModeSwitchProps) => {
  const changeMode = useCallback(() => {
    if (currentMode === TimerMode.FOCUS) {
      onModeChange(TimerMode.BREAK);
    } else {
      onModeChange(TimerMode.FOCUS);
    }
  }, [currentMode]);

  return (
    <div data-testid="timer-mode-switch" id="timer-mode-switch">
      <input
        type="checkbox"
        role="switch"
        disabled={isTimerActive}
        aria-label="Switch between focus and break mode"
        aria-checked={currentMode === TimerMode.BREAK}
        onClick={changeMode}
      />
      <span id="mode-info">
        {currentMode === TimerMode.FOCUS ? "FOCUS" : "BREAK"}
      </span>
    </div>
  );
};

export default TimerModeSwitch;
