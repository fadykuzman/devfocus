import { fireEvent, render, screen, act } from "@testing-library/react";
import Timer from "../Timer";

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



  it('stops automatically when timer reaches zero', () => {
    render(<Timer />);

    const timerDisplay = screen.getByTestId('timer-display');
    const button = screen.getByTestId('play-pause-button');

    // Start timer
    fireEvent.click(button);

    // Advance by full duration
    act(() => {
      vi.advanceTimersByTime(2400 * 1000); // 40 minutes
    });

    // Timer should stop at zero
    expect(timerDisplay).toHaveTextContent('00:00');
    expect(button).toHaveTextContent('Play');
  });
});
