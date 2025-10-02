export function formatTime(totalSeconds: number): string {
	const clampedSeconds = Math.max(0, totalSeconds);
	const minutes = Math.floor(clampedSeconds / 60);
	const seconds = clampedSeconds % 60;
	return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
