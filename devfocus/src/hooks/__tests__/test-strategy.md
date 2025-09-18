  - [x] Initial State Test:
  - Hook should start with timeRemaining: 2400 (40 minutes in seconds)
  -slkj Hook should start with isRunning: false

  - [x] Start Function Test:
  - Calling start() should set isRunning to true
  - Time should begin decrementing when started

  - [x] Pause Function Test:
  - Calling pause() should set isRunning to false
  - Time should stop decrementing when paused


  - [x] Countdown Behavior Test:
  - When running, time should decrease by 1 every second
  - Use vi.advanceTimersByTime(1000) to simulate 1 second passing
  - Test multiple seconds: 2400 → 2399 → 2398

  - [x] Timer Completion Test:
  - When time reaches 0, isRunning should automatically become false
  - Timer should not go below 0
  - stays at 0

  - [x] Start/Pause/Resume Flow Test:
  - Start timer, let it run, pause it, resume it
  - Verify time continues from where it was paused

  
  - [x] Rapid Start/Pause Calls:

  - [x] What happens when you advance time by more than the remaining time?
  - [ ] Does the timer behave correctly with fractional advances (500ms)?

