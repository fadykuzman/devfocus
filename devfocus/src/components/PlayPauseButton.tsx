interface PlayPauseButtonProps {
  isActive: boolean;
  onToggle: () => void;
}
const PlayPauseButton = ({ isActive, onToggle }: PlayPauseButtonProps) => {
  return (
    <button
      id="play-pause-button"
      data-testid="play-pause-button"
	  aria-label={isActive ? "Pause Timer" : "Play Timer"}
	  role="button"
      onClick={onToggle}
    >
      {isActive ? "Pause" : "Play"}
    </button>
  );
};

export default PlayPauseButton;
