import { formatTime } from "../utils/formatTime";

interface TimerDisplayProps {
  timeRemainingInSeconds: number;
}

const TimerDisplay = ({ timeRemainingInSeconds }: TimerDisplayProps) => {
  const formattedTime = formatTime(timeRemainingInSeconds);
  
  return (
    <div id="timer-display" data-testid="timer-display"
	aria-label={`Timer showing ${formattedTime}`}
	role="timer"
	>
      {formattedTime}
    </div>
  );
};

export default TimerDisplay;
