import { render, screen } from "@testing-library/react";
import TimerDisplay from "../TimerDisplay";

describe("TimerDisplay", () => {
  describe("Behavior", () => {
    it("renders formatted time correctly", () => {
      render(<TimerDisplay timeRemainingInSeconds={2400} />);
      const timeElement = screen.getByTestId("timer-display");
      expect(timeElement).toHaveTextContent("40:00");
    });

    it("should update when time remaining changes", () => {
      const { rerender } = render(
        <TimerDisplay timeRemainingInSeconds={2400} />,
      );
      const timeElement = screen.getByTestId("timer-display");
      expect(timeElement).toHaveTextContent("40:00");

      rerender(<TimerDisplay timeRemainingInSeconds={125} />);
      expect(timeElement).toHaveTextContent("02:05");
    });

    it("handles zero seconds", () => {
      render(<TimerDisplay timeRemainingInSeconds={0} />);
      expect(screen.getByTestId("timer-display")).toHaveTextContent("00:00");
    });
  });

  describe("Accessability", () => {
    it("should contain accessibility attributes", () => {
      render(<TimerDisplay timeRemainingInSeconds={2400} />);
      const timeElement = screen.getByTestId("timer-display");
      expect(timeElement).toHaveAttribute("aria-label", "Timer showing 40:00");
    });
  });

  describe("Typography and Styling", () => {
    it("should use monospace font for timer display", () => {
      render(<TimerDisplay timeRemainingInSeconds={2400} />);
      const timeElement = screen.getByTestId("timer-display");
      expect(timeElement).toHaveClass("font-mono");
    });

    it("should have large font size for prominence", () => {
      render(<TimerDisplay timeRemainingInSeconds={2400} />);
      const timeElement = screen.getByTestId("timer-display");
      expect(timeElement).toHaveClass("text-8xl");
    });

    it("should use tabular numbers to prevent width jumping", () => {
      render(<TimerDisplay timeRemainingInSeconds={2400} />);
      const timeElement = screen.getByTestId("timer-display");
      expect(timeElement).toHaveClass("font-variant-numeric");
    });

    it("should use ultra-light font weight", () => {
      render(<TimerDisplay timeRemainingInSeconds={2400} />);
      const timeElement = screen.getByTestId("timer-display");
      expect(timeElement).toHaveClass("font-extralight");
      // Test for font-extralight or font-thin classes
    });

    // Test 5: Primary timer color
    it("should use deep slate color for timer text", () => {
      render(<TimerDisplay timeRemainingInSeconds={2400} />);
      const timeElement = screen.getByTestId("timer-display");
      expect(timeElement).toHaveClass("text-timer-primary");
    });

    // Test 6: High contrast compliance
    it("should meet accessibility contrast requirements", () => {
      // Test computed styles for contrast ratio
      // Hint: Use getComputedStyle() to check actual colors
    });
  });
});
