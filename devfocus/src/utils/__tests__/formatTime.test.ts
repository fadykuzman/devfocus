import { formatTime } from '../formatTime';

describe("formatTime", () => {

	it('should format time correctly for less than a minute', () => {
		expect(formatTime(45)).toBe('00:45');
		expect(formatTime(9)).toBe('00:09');
	});

	it('should format time correctly for exactly one minute', () => {
		expect(formatTime(60)).toBe('01:00');
	});

	it('should format time correctly for more than one minute', () => {
		expect(formatTime(125)).toBe('02:05');
		expect(formatTime(3600)).toBe('60:00');
	});

	it('should format time correctly for zero seconds', () => {
		expect(formatTime(0)).toBe('00:00');
	});

	it('should format time correctly for large values', () => {
		expect(formatTime(3661)).toBe('61:01'); // 61 minutes and 1 second
		expect(formatTime(7325)).toBe('122:05'); // 122 minutes and 5 seconds
	});

	it('should handle negative values gracefully', () => {
		expect(formatTime(-45)).toBe('00:00'); // default behavior
	});
})
