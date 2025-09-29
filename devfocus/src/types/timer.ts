export const TimerMode = {
  FOCUS: "focus",
  BREAK: "break",
} as const;

export type TimerMode = (typeof TimerMode)[keyof typeof TimerMode];
