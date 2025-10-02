import { renderHook, act } from "@testing-library/react";
import { useCountdownTimer } from "../useCountdownTimer";

describe("useCountdownTimer", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.clearAllTimers();
	});

	it("should initialize with default time", () => {
		const { result } = renderHook(() => useCountdownTimer({type: 'focus'}));
		expect(result.current.timeRemaining).toBe(2400); // 40 minutes in seconds
		expect(result.current.isActive).toBe(false);
	});

	it("should start the timer", () => {
		const { result } = renderHook(() => useCountdownTimer({type: 'focus'}));
		act(() => {
			result.current.startTimer();
		});
		expect(result.current.isActive).toBe(true);
	});

	it("should pause the timer", () => {
		const { result } = renderHook(() => useCountdownTimer({type: 'focus'}));
		act(() => {
			result.current.startTimer();
		});
		expect(result.current.isActive).toBe(true);
		act(() => {
			result.current.pauseTimer();
		});
		expect(result.current.isActive).toBe(false);
	});

	it("should count down the time when active", () => {
		const { result } = renderHook(() => useCountdownTimer({type: 'focus'}));
		act(() => {
			result.current.startTimer();
		});
		act(() => {
			vi.advanceTimersByTime(1000); // Advance time by 1 second
		});
		expect(result.current.timeRemaining).toBe(2399);
		act(() => {
			vi.advanceTimersByTime(4000); // Advance time by 4 more seconds
		});
		expect(result.current.timeRemaining).toBe(2395);
	});

	it("should stop at zero", () => {
		const { result } = renderHook(() => useCountdownTimer({type: 'focus'}));
		act(() => {
			result.current.startTimer();
		});
		act(() => {
			vi.advanceTimersByTime(2400 * 1000); // Advance time by 40 minutes (default time)
		});
		expect(result.current.timeRemaining).toBe(0);
		expect(result.current.isActive).toBe(false);
	});

	it("should stay at zero if advanced further that set time, by default", () => {
		const { result } = renderHook(() => useCountdownTimer({type: 'focus'}));
		act(() => {
			result.current.startTimer();
		});
		act(() => {
			vi.advanceTimersByTime(2401 * 1000); // Advance time by 40 minutes (default time)
		});
		expect(result.current.timeRemaining).toBe(0);
		expect(result.current.isActive).toBe(false);
	});

	it("should start and pause the timer correctly", () => {
		const { result } = renderHook(() => useCountdownTimer({type: 'focus'}));
		act(() => {
			result.current.startTimer();
		});
		act(() => {
			vi.advanceTimersByTime(2000);
		});
		expect(result.current.timeRemaining).toBe(2398);
		act(() => {
			result.current.pauseTimer();
		});
		act(() => {
			vi.advanceTimersByTime(2000);
		});
		expect(result.current.timeRemaining).toBe(2398); // Should remain the same afters pauseing
		expect(result.current.isActive).toBe(false);
		act(() => {
			result.current.startTimer();
		});
		act(() => {
			vi.advanceTimersByTime(1000);
		});
		expect(result.current.timeRemaining).toBe(2397);
		expect(result.current.isActive).toBe(true);
	});

	it("should handle rapid start/pause calls", () => {
		const { result } = renderHook(() => useCountdownTimer({type: 'focus'}));
		act(() => {
			result.current.startTimer();
			result.current.pauseTimer();
			result.current.startTimer();
			result.current.pauseTimer();
			result.current.startTimer();
		});
		expect(result.current.isActive).toBe(true);
		act(() => {
			vi.advanceTimersByTime(1000);
		});
		expect(result.current.timeRemaining).toBe(2399);
	});

	it("should handle realistic user interactions", () => {
		const { result } = renderHook(() => useCountdownTimer({type: 'focus'}));

		// User starts timer
		act(() => {
			result.current.startTimer();
		});

		// Brief moment passes (user sees UI update)
		act(() => {
			vi.advanceTimersByTime(300);
		});

		// Accidental double-click on pause
		act(() => {
			result.current.pauseTimer();
		});

		act(() => {
			vi.advanceTimersByTime(150); // Very quick accidental second click
		});

		act(() => {
			result.current.pauseTimer(); // Second click
		});

		expect(result.current.isActive).toBe(false);
	});

	it("should reset the timer to initial time", () => {
		const { result } = renderHook(() => useCountdownTimer({type: 'focus'}));

		act(() => {
			result.current.startTimer();
		});

		act(() => {
			vi.advanceTimersByTime(5000);
		});

		expect(result.current.timeRemaining).toBe(2395);

		act(() => {
			result.current.resetTimer();
		});

		expect(result.current.timeRemaining).toBe(2400);
		expect(result.current.isActive).toBe(false);
	});

	it("should reset timer while paused", () => {
		// start → pause → reset → verify state
		const { result } = renderHook(() => useCountdownTimer({type: 'focus'}));
		act(() => {
			result.current.startTimer();
		});
		act(() => {
			vi.advanceTimersByTime(5000);
		});

		expect(result.current.timeRemaining).toBe(2395);

		act(() => {
			result.current.pauseTimer();
		});

		expect(result.current.isActive).toBe(false);

		act(() => {
			result.current.resetTimer();
		});

		expect(result.current.timeRemaining).toBe(2400);
		expect(result.current.isActive).toBe(false);
	});
});

describe("Break timer", () => {
	it("should initialise timer with 10-minutes default", () => {
		const { result } = renderHook(() => useCountdownTimer({ type: "break" }));
		expect(result.current.isActive).toBe(false);
		expect(result.current.timeRemaining).toBe(600);
	});

	it("should default to focus timer for backward compatibility", () => {
		const { result } = renderHook(() => useCountdownTimer());
		expect(result.current.isActive).toBe(false);
		expect(result.current.timeRemaining).toBe(2400);
	});
});

describe("Custom Timer Durations", () => {
	it("should accept custom focus duration", () => {
		// Test: useCountdownTimer({ type: 'focus', focusDuration: 1800 })
		// Expect: timeRemaining = 1800
	});

	it("should accept custom break duration", () => {
		// Test: useCountdownTimer({ type: 'break', breakDuration: 300 })
		// Expect: timeRemaining = 300
	});

	it("should use defaults when custom durations not provided", () => {
		// Test both types without custom durations
		// Expect: focus = 2400, break = 600
	});
});
