import { render, screen } from "@testing-library/react";
import TimerDisplay from "../TimerDisplay";

describe("TimerDisplay", () => {
  it("renders formatted time correctly", () => {
    render(<TimerDisplay timeRemainingInSeconds={2400} />);
    const timeElement = screen.getByTestId("timer-display");
    expect(timeElement).toHaveTextContent("40:00");
  });

  it("should update when time remaining changes", () => {
    const { rerender } = render(<TimerDisplay timeRemainingInSeconds={2400} />);
    const timeElement = screen.getByTestId("timer-display");
    expect(timeElement).toHaveTextContent("40:00");

    rerender(<TimerDisplay timeRemainingInSeconds={125} />);
    expect(timeElement).toHaveTextContent("02:05");
  });

  it("should contain accessibility attributes", () => {
    render(<TimerDisplay timeRemainingInSeconds={2400} />);
    const timeElement = screen.getByTestId("timer-display");
    expect(timeElement).toHaveAttribute("aria-label", "Timer showing 40:00");
  });

  it("handles zero seconds", () => {
    render(<TimerDisplay timeRemainingInSeconds={0} />);
    expect(screen.getByTestId("timer-display")).toHaveTextContent("00:00");
  });
});
