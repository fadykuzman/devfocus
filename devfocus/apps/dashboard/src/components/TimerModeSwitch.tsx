import { useCallback } from "react";
import { TimerMode } from "../types/timer";

interface TimerModeSwitchProps {
  currentMode: TimerMode;
  isTimerActive: boolean;
  onModeChange: () => void;
}

const TimerModeSwitch = ({
  currentMode,
  isTimerActive,
  onModeChange,
}: TimerModeSwitchProps) => {

  return (
    <div 
	data-testid="timer-mode-switch" 
	id="timer-mode-switch"
	className="flex items-center justify-center gap-6 mb-8 ${isTimerActive ? 'opacity-60' : ''}`"
	>
	{/* Left Label */}
	<span className={`
		text-sm font-medium select-none transition-opacity duration-200
		${currentMode === TimerMode.FOCUS ? 'text-black font-bold' : 'text-gray-500'}
		${isTimerActive ? 'text-gray-400': ''}
		`}>
	FOCUS
	</span>

	{/* Toggle Switch */}
      <input
        type="checkbox"
        role="switch"
        disabled={isTimerActive}
        aria-label="Switch between focus and break mode"
        aria-checked={currentMode === TimerMode.BREAK}
        onClick={() => onModeChange()}
		className="sr-only"
      />
	  {/* Toggle Track */}
	  <div
	  className={`
		  relative w-14 h-7 rounded-full transition-all duration-200
		  ${currentMode === TimerMode.BREAK ? 'bg-gray-800' : 'bg-gray-300'}
		  ${isTimerActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}
		  `}
		  onClick={!isTimerActive ? onModeChange : undefined}
		  >
		  {/* Toggle Thumb */}
		  <div
		  className={`
			  absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md
			  transition-all duration-200 ease-in-out
			  ${currentMode === TimerMode.BREAK ? 'translate-x-7' : 'translate-x-0'}
			  ${isTimerActive ? 'bg-gray-100' : ''}
			  `}
			  />
		  </div>
	  {/* Right Label */}
      <span className={`
		  text-sm font-medium select-none transition-opacity duration-200
		  ${currentMode === TimerMode.BREAK ? 'text-black font-bold' : 'text-gray-500'}
		  ${isTimerActive ? 'text-gray-400': ''}
		  `}> 
	  BREAK
      </span>
    </div>
  );
};

export default TimerModeSwitch;
