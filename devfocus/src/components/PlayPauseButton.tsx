interface PlayPauseButtonProps {
  isActive: boolean;
  onToggle: () => void;
}
const PlayPauseButton = ({ isActive, onToggle }: PlayPauseButtonProps) => {
  return (
    <button
      id="play-pause-button"
      data-testid="play-pause-button"
	  aria-label="Play Pause Button"
	  role="button"
      onClick={onToggle}
    >
      {isActive ? "Pause" : "Play"}
    </button>
  );
};

export default PlayPauseButton;
