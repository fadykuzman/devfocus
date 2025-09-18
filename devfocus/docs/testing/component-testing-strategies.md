# Component Testing Strategies

A comprehensive guide for testing React components with Vitest and React Testing Library.

## Core Testing Categories

### 1. **Rendering Tests**
Verify components render correctly with different props.

```javascript
// Basic rendering
it('renders with default props', () => {
  render(<TimerDisplay timeRemaining={2400} />);
  expect(screen.getByText('40:00')).toBeInTheDocument();
});

// Props variations
it('renders different time values', () => {
  const { rerender } = render(<TimerDisplay timeRemaining={90} />);
  expect(screen.getByText('01:30')).toBeInTheDocument();
  
  rerender(<TimerDisplay timeRemaining={5} />);
  expect(screen.getByText('00:05')).toBeInTheDocument();
});
```

### 2. **Props Testing**
Test component behavior with various prop combinations.

```javascript
// Required props
it('handles required props correctly', () => {
  render(<PlayPauseButton isActive={true} onToggle={vi.fn()} />);
  expect(screen.getByRole('button')).toBeInTheDocument();
});

// Optional props
it('handles optional props', () => {
  render(<Timer showReset={false} />);
  expect(screen.queryByText('Reset')).not.toBeInTheDocument();
});

// Prop edge cases
it('handles extreme prop values', () => {
  render(<TimerDisplay timeRemaining={0} />);
  expect(screen.getByText('00:00')).toBeInTheDocument();
});
```

### 3. **User Interaction Tests**
Test user events and their effects.

```javascript
// Click events
it('calls onToggle when button clicked', () => {
  const mockToggle = vi.fn();
  render(<PlayPauseButton isActive={false} onToggle={mockToggle} />);
  
  fireEvent.click(screen.getByRole('button'));
  expect(mockToggle).toHaveBeenCalledTimes(1);
});

// Keyboard events
it('handles keyboard interactions', () => {
  const mockToggle = vi.fn();
  render(<PlayPauseButton isActive={false} onToggle={mockToggle} />);
  
  fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
  expect(mockToggle).toHaveBeenCalled();
});

// Form interactions
it('handles form submission', () => {
  const mockSubmit = vi.fn();
  render(<TimeSettingsForm onSubmit={mockSubmit} />);
  
  fireEvent.change(screen.getByLabelText('Minutes'), { target: { value: '25' } });
  fireEvent.click(screen.getByText('Save'));
  
  expect(mockSubmit).toHaveBeenCalledWith({ minutes: 25 });
});
```

### 4. **State Changes Tests**
Test component state updates and visual changes.

```javascript
// Visual state changes
it('shows different text based on active state', () => {
  const { rerender } = render(<PlayPauseButton isActive={false} onToggle={vi.fn()} />);
  expect(screen.getByText('Play')).toBeInTheDocument();
  
  rerender(<PlayPauseButton isActive={true} onToggle={vi.fn()} />);
  expect(screen.getByText('Pause')).toBeInTheDocument();
});

// Multiple state combinations
it('handles complex state combinations', () => {
  render(<Timer isActive={true} timeRemaining={60} showWarning={true} />);
  
  expect(screen.getByText('01:00')).toBeInTheDocument();
  expect(screen.getByTestId('warning-indicator')).toBeInTheDocument();
});
```

### 5. **Accessibility Testing**
Ensure components are usable by screen readers and keyboard navigation.

```javascript
// ARIA labels
it('has accessible labels', () => {
  render(<TimerDisplay timeRemaining={2400} />);
  expect(screen.getByLabelText('Timer display showing 40 minutes remaining')).toBeInTheDocument();
});

// Role attributes
it('has correct ARIA roles', () => {
  render(<PlayPauseButton isActive={false} onToggle={vi.fn()} />);
  expect(screen.getByRole('button')).toBeInTheDocument();
});

// Focus management
it('manages focus correctly', () => {
  render(<TimerControls />);
  const playButton = screen.getByText('Play');
  
  playButton.focus();
  expect(document.activeElement).toBe(playButton);
});

// Screen reader announcements
it('provides screen reader announcements', () => {
  render(<Timer timeRemaining={60} />);
  expect(screen.getByText('1 minute remaining')).toHaveAttribute('aria-live', 'polite');
});
```

### 6. **CSS Classes and Styling Tests**
Test styling behavior and conditional classes.

```javascript
// CSS class application
it('applies correct CSS classes', () => {
  render(<TimerDisplay timeRemaining={2400} />);
  const display = screen.getByText('40:00');
  expect(display).toHaveClass('timer-display', 'text-4xl', 'font-mono');
});

// Conditional styling
it('applies warning styles when time is low', () => {
  render(<TimerDisplay timeRemaining={30} />);
  expect(screen.getByText('00:30')).toHaveClass('text-red-500');
});

// Dynamic classes
it('toggles classes based on state', () => {
  const { rerender } = render(<PlayPauseButton isActive={false} onToggle={vi.fn()} />);
  expect(screen.getByRole('button')).toHaveClass('btn-play');
  
  rerender(<PlayPauseButton isActive={true} onToggle={vi.fn()} />);
  expect(screen.getByRole('button')).toHaveClass('btn-pause');
});
```

### 7. **Error Handling Tests**
Test component behavior with invalid or missing props.

```javascript
// Missing required props
it('handles missing props gracefully', () => {
  // This should not crash
  render(<TimerDisplay timeRemaining={undefined} />);
  expect(screen.getByText('00:00')).toBeInTheDocument();
});

// Invalid prop values
it('handles invalid prop values', () => {
  render(<TimerDisplay timeRemaining={-100} />);
  expect(screen.getByText('00:00')).toBeInTheDocument();
});

// Error boundaries
it('triggers error boundary on component error', () => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
  
  expect(() => {
    render(<ProblematicComponent badProp="invalid" />);
  }).toThrow();
  
  spy.mockRestore();
});
```

### 8. **Integration Tests**
Test components working together.

```javascript
// Parent-child communication
it('passes data between parent and child correctly', () => {
  render(<Timer />);
  
  fireEvent.click(screen.getByText('Start'));
  expect(screen.getByText('40:00')).toBeInTheDocument();
  
  // Simulate time passing
  act(() => {
    vi.advanceTimersByTime(1000);
  });
  
  expect(screen.getByText('39:59')).toBeInTheDocument();
});

// Multiple components interaction
it('coordinates multiple components', () => {
  render(<TimerApp />);
  
  fireEvent.click(screen.getByText('Start'));
  expect(screen.getByText('Pause')).toBeInTheDocument();
  
  fireEvent.click(screen.getByText('Reset'));
  expect(screen.getByText('40:00')).toBeInTheDocument();
  expect(screen.getByText('Start')).toBeInTheDocument();
});
```

### 9. **Utility Function Tests**
Test helper functions separately from components.

```javascript
// Time formatting utility
describe('formatTime utility', () => {
  it('formats seconds to MM:SS correctly', () => {
    expect(formatTime(2400)).toBe('40:00');
    expect(formatTime(90)).toBe('01:30');
    expect(formatTime(5)).toBe('00:05');
    expect(formatTime(0)).toBe('00:00');
  });
  
  it('handles edge cases', () => {
    expect(formatTime(-10)).toBe('00:00');
    expect(formatTime(3661)).toBe('61:01');
  });
});
```

## Best Practices

### Test Organization
```javascript
describe('TimerDisplay Component', () => {
  describe('Rendering', () => {
    // Rendering tests here
  });
  
  describe('Time Formatting', () => {
    // Formatting tests here
  });
  
  describe('Accessibility', () => {
    // A11y tests here
  });
});
```

### Setup and Cleanup
```javascript
describe('Component Tests', () => {
  beforeEach(() => {
    // Setup before each test
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    // Cleanup after each test
    vi.clearAllTimers();
    cleanup();
  });
});
```

### Mock Functions
```javascript
// Create consistent mocks
const mockToggle = vi.fn();
const mockReset = vi.fn();

beforeEach(() => {
  mockToggle.mockReset();
  mockReset.mockReset();
});
```

### Common Patterns
```javascript
// Reusable render helper
const renderTimer = (props = {}) => {
  const defaultProps = {
    timeRemaining: 2400,
    isActive: false,
    onToggle: vi.fn(),
    ...props
  };
  
  return render(<Timer {...defaultProps} />);
};

// Custom queries
const getTimerDisplay = () => screen.getByTestId('timer-display');
const getPlayButton = () => screen.getByRole('button', { name: /play|start/i });
```

## Testing Priority

1. **High Priority**: Rendering, Props, User Interactions
2. **Medium Priority**: State Changes, Accessibility, Error Handling  
3. **Lower Priority**: CSS Classes, Complex Integration

Focus on core functionality first, then expand to edge cases and polish.