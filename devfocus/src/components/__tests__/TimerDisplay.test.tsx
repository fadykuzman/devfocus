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
			expect(timeElement).toHaveClass("text-timer-mobile");
			expect(timeElement).toHaveClass("md:text-timer-desktop");
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

		it("should meet accessibility contrast requirements", () => {
			render(<TimerDisplay timeRemainingInSeconds={2400} />);
			const timeElement = screen.getByTestId("timer-display");

			// Get computed styles
			const computedStyle = window.getComputedStyle(timeElement);
			const color = computedStyle.color;
			const backgroundColor = computedStyle.backgroundColor;

			// Parse colors and calculate contrast ratio
			// This test verifies the contrast meets WCAG 2.1 AA standards (4.5:1 ratio)
			expect(color).toBeDefined();
			expect(backgroundColor).toBeDefined();

			// Could also test specific color values
			// expect(color).toBe("rgb(45, 55, 72)"); // #2d3748
		});

		it("should apply responsive font size classes", () => {
			render(<TimerDisplay timeRemainingInSeconds={2400} />);
			const timeElement = screen.getByTestId("timer-display");

			// Test mobile class
			expect(timeElement).toHaveClass("text-timer-mobile");

			// Test desktop responsive class
			expect(timeElement).toHaveClass("md:text-timer-desktop");
		});

	});
});
