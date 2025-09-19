interface ResetButtonProps {
	onClick: () => void
}

const ResetButton = ({onClick}: ResetButtonProps) => {
	return (
		<button
		id='reset-button'
		data-testid='reset-button'
		onClick={onClick}
		role='button'
		aria-label='Reset Timer'
		>Reset</button>
	);
}

export default ResetButton;
