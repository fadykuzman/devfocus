import { render, screen, fireEvent } from "@testing-library/react";

import TimerModeSwitch from "../TimerModeSwitch";

describe("TimerModeSwitch - Mode Display", () => {
  it('should display "FOCUS • 40min" when currentMode is focus', () => {
    render(
      <TimerModeSwitch
        currentMode="focus"
        isTimerActive={false}
        onModeChange={vi.fn()}
      />,
    );
    const modeSwitch = screen.getByTestId("timer-mode-switch");
    expect(modeSwitch).toHaveTextContent("FOCUS &bull; 40min");
  });
  it('should display "BREAK • 10min" when currentMode is break', () => {
    render(
      <TimerModeSwitch
        currentMode="break"
        isTimerActive={true}
        onModeChange={vi.fn()}
      />,
    );
    const modeSwitch = screen.getByTestId("timer-mode-switch");
    expect(modeSwitch).toHaveTextContent("BREAK &bull; 10min");
  });
});

describe("TimerModeSwitch - Interactive States", () => {
  it("should be interactive when timer is inactive", () => {
    render(
      <TimerModeSwitch
        currentMode="focus"
        isTimerActive={false}
        onModeChange={vi.fn()}
      />,
    );
    const modeSwitch = screen.getByRole("switch");

    expect(modeSwitch).not.toBeDisabled();
    expect(modeSwitch).toHaveAttribute(
      "aria-label",
      "Switch between focus and break mode",
    );
  });

  it("should be disabled when timer is active", () => {
    render(
      <TimerModeSwitch
        currentMode="focus"
        isTimerActive={true}
        onModeChange={vi.fn()}
      />,
    );
    const modeSwitch = screen.getByRole("switch");

    expect(modeSwitch).toBeDisabled();
    expect(modeSwitch).toHaveAttribute(
      "aria-label",
      "Switch between focus and break mode",
    );
  });
});

describe("TimerModeSwitch - Mode Switching", () => {
  it('should call onModeChange with "break" when  switching from focus', () => {
    const changeMode = vi.fn();
    render(
      <TimerModeSwitch
        currentMode="focus"
        isTimerActive={false}
        onModeChange={changeMode}
      />,
    );

    const modeSwitch = screen.getByRole("switch");

    fireEvent.click(modeSwitch);

    expect(changeMode).toHaveBeenCalledWith("break");
  });

  it('should call onModeChange with "focus" when  switching from break', () => {
    const changeMode = vi.fn();
    render(
      <TimerModeSwitch
        currentMode="break"
        isTimerActive={false}
        onModeChange={changeMode}
      />,
    );

    const modeSwitch = screen.getByRole("switch");

    fireEvent.click(modeSwitch);

    expect(changeMode).toHaveBeenCalledWith("focus");
  });

  it("should not call onModeChange when timer is active", () => {
    const changeMode = vi.fn();
    render(
      <TimerModeSwitch
        currentMode="break"
        isTimerActive={true}
        onModeChange={changeMode}
      />,
    );

    const modeSwitch = screen.getByRole("switch");

    fireEvent.click(modeSwitch);

    expect(changeMode).not.toHaveBeenCalled();
  });
});

describe("TimerModeSwitch - Accessibility", () => {
  it("should have proper aria-label describing current mode", () => {
    const changeMode = vi.fn();
    render(
      <TimerModeSwitch
        currentMode="break"
        isTimerActive={false}
        onModeChange={changeMode}
      />,
    );

    const modeSwitch = screen.getByRole("switch");

    expect(modeSwitch).toHaveAttribute(
      "aria-label",
      "Switch between focus and break mode",
    );
  });
  it("should indicate disabled state to screen readers", () => {
    const changeMode = vi.fn();
    render(
      <TimerModeSwitch
        currentMode="break"
        isTimerActive={true}
        onModeChange={changeMode}
      />,
    );

    const modeSwitch = screen.getByRole("switch");

    expect(modeSwitch).toBeDisabled();
  });
});
