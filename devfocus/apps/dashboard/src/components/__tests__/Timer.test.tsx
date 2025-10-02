import { fireEvent, render, screen, act } from "@testing-library/react";
import Timer from "../Timer";
import { on } from "events";
import { warn } from "console";

describe("Timer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it("should render Timer display and play button initially", () => {
    render(<Timer />);
    expect(screen.getByTestId("timer-display")).toHaveTextContent("40:00");
    expect(screen.getByTestId("play-pause-button")).toHaveTextContent("Play");
    expect(screen.getByTestId("reset-button")).toHaveTextContent("Reset");
    expect(screen.getByTestId("timer-container")).toBeInTheDocument();
  });

  it("should start timer when play button is clicked", () => {
    render(<Timer />);

    const button = screen.getByTestId("play-pause-button");

    expect(button).toHaveTextContent("Play");

    fireEvent.click(button);

    expect(button).toHaveTextContent("Pause");
  });

  it("decrements time when timer is active", () => {
    render(<Timer />);

    const timerDisplay = screen.getByTestId("timer-display");
    const playButton = screen.getByTestId("play-pause-button");

    // Start timer
    fireEvent.click(playButton);

    // Advance time by 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Time should decrease
    expect(timerDisplay).toHaveTextContent("39:59");
  });

  it("stops counting when paused", () => {
    render(<Timer />);

    const timerDisplay = screen.getByTestId("timer-display");
    const playButton = screen.getByTestId("play-pause-button");

    // Start timer
    fireEvent.click(playButton);

    // Let some time pass
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(timerDisplay).toHaveTextContent("39:58");

    // Pause timer
    fireEvent.click(playButton);

    // Advance more time
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Time should remain the same
    expect(timerDisplay).toHaveTextContent("39:58");
  });

  it("stops automatically when timer reaches zero", () => {
    render(<Timer />);

    const timerDisplay = screen.getByTestId("timer-display");
    const button = screen.getByTestId("play-pause-button");

    // Start timer
    fireEvent.click(button);

    // Advance by full duration
    act(() => {
      vi.advanceTimersByTime(2400 * 1000); // 40 minutes
    });

    // Timer should stop at zero
    expect(timerDisplay).toHaveTextContent("00:00");
    expect(button).toHaveTextContent("Play");
  });

  it("should stay at initial state when reset button clicked", () => {
    render(<Timer />);

    const timerDisplay = screen.getByTestId("timer-display");
    const playPausebutton = screen.getByTestId("play-pause-button");
    const resetButton = screen.getByTestId("reset-button");

    expect(timerDisplay).toHaveTextContent("40:00");
    expect(playPausebutton).toHaveTextContent("Play");

    fireEvent.click(resetButton);

    expect(timerDisplay).toHaveTextContent("40:00");
    expect(playPausebutton).toHaveTextContent("Play");
  });

  it("should return to initial state when time passed and reset clicked", () => {
    render(<Timer />);

    const timerDisplay = screen.getByTestId("timer-display");
    const playPausebutton = screen.getByTestId("play-pause-button");
    const resetButton = screen.getByTestId("reset-button");

    fireEvent.click(playPausebutton);

    act(() => {
      vi.advanceTimersByTime(40 * 1000);
    });

    expect(timerDisplay).toHaveTextContent("39:20");
    expect(playPausebutton).toHaveTextContent("Pause");

    fireEvent.click(resetButton);

    expect(timerDisplay).toHaveTextContent("40:00");
    expect(playPausebutton).toHaveTextContent("Play");
  });

  it("should return to initial state after timer completion and reset clicked", () => {
    render(<Timer />);

    const timerDisplay = screen.getByTestId("timer-display");
    const playPausebutton = screen.getByTestId("play-pause-button");
    const resetButton = screen.getByTestId("reset-button");

    fireEvent.click(playPausebutton);

    act(() => {
      vi.advanceTimersByTime(2400 * 1000);
    });

    expect(timerDisplay).toHaveTextContent("00:00");
    expect(playPausebutton).toHaveTextContent("Play");

    fireEvent.click(resetButton);

    expect(timerDisplay).toHaveTextContent("40:00");
    expect(playPausebutton).toHaveTextContent("Play");
  });

  it("it shows the mode switch component in FOCUS (default) mode", () => {
    render(<Timer />);
    const modeSwitch = screen.getByTestId("timer-mode-switch");
    expect(modeSwitch).toBeInTheDocument();
  });

  it("it switches to BREAK mode when mode switch clicked", () => {
    render(<Timer />);
    const modeSwitch = screen.getByTestId("timer-mode-switch");
    const timerDisplay = screen.getByTestId("timer-display");
    expect(timerDisplay).toHaveTextContent("40:00");
    expect(modeSwitch).toHaveTextContent("FOCUS");
    const switchInput = screen.getByRole("switch");
    fireEvent.click(switchInput);
    expect(modeSwitch).toHaveTextContent("BREAK");
    expect(timerDisplay).toHaveTextContent("10:00");
  });
  it("should maintain BREAK mode when pausing and resuming", () => {
    render(<Timer />);
    const modeSwitch = screen.getByTestId("timer-mode-switch");
    const timerDisplay = screen.getByTestId("timer-display");
    expect(timerDisplay).toHaveTextContent("40:00");
    expect(modeSwitch).toHaveTextContent("FOCUS");
    const switchInput = screen.getByRole("switch");
    fireEvent.click(switchInput);
    expect(modeSwitch).toHaveTextContent("BREAK");
    expect(timerDisplay).toHaveTextContent("10:00");
	fireEvent.click(screen.getByTestId("play-pause-button"));
	act(() => {
		vi.advanceTimersByTime(30 * 1000);
	});
	expect(timerDisplay).toHaveTextContent("09:30");
	fireEvent.click(screen.getByTestId("play-pause-button"));
	act(() => {
		vi.advanceTimersByTime(30*1000);
	});
	expect(timerDisplay).toHaveTextContent("09:30");
  });

  it("should switch back to FOCUS mode when clicked again", () => {
    render(<Timer />);
    const modeSwitch = screen.getByTestId("timer-mode-switch");
    const timerDisplay = screen.getByTestId("timer-display");
    expect(timerDisplay).toHaveTextContent("40:00");
    expect(modeSwitch).toHaveTextContent("FOCUS");
    const switchInput = screen.getByRole("switch");
    fireEvent.click(switchInput);
    expect(modeSwitch).toHaveTextContent("BREAK");
    expect(timerDisplay).toHaveTextContent("10:00");
    fireEvent.click(switchInput);
    expect(timerDisplay).toHaveTextContent("40:00");
    expect(modeSwitch).toHaveTextContent("FOCUS");
  });
});
