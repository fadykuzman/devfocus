# useState Hook

## What is useState?

`useState` is a React Hook that lets you add state variables to functional components. Before hooks, only class components could have state.

## Basic Syntax

```javascript
const [stateVariable, setStateFunction] = useState(initialValue)
```

- `stateVariable` - the current state value
- `setStateFunction` - function to update the state
- `initialValue` - what the state starts as

## How it Works

1. **Initial Render**: `useState` returns the initial value
2. **Re-renders**: `useState` returns the current state value
3. **State Updates**: Calling the setter function triggers a re-render
4. **Immutability**: React compares the new state to the old state

## Timer Implementation Example

In our countdown timer:

```javascript
const [timeRemaining, setTimeRemaining] = useState(2400)
const [isRunning, setIsRunning] = useState(false)
```

- `timeRemaining` starts at 2400 (40 minutes in seconds)
- `isRunning` starts as false (timer paused)
- When we call `setTimeRemaining(2399)`, React re-renders with the new time
- When we call `setIsRunning(true)`, the timer starts

## State Update Patterns

### Direct Update
```javascript
setTimeRemaining(2399)
```

### Function Update (Recommended for dependent updates)
```javascript
setTimeRemaining(prev => prev - 1)
```

Why use the function form?
- Guarantees you're working with the latest state
- Prevents race conditions in rapid updates
- Essential when state depends on previous state

## Key Rules

1. **Only call at top level** - never in loops, conditions, or nested functions
2. **State is immutable** - always create new values, don't mutate existing
3. **Async updates** - state changes aren't immediate, they schedule re-renders
4. **Batching** - React groups multiple state updates together for performance

## Common Gotchas

### Stale Closures
```javascript
// Wrong - might use old timeRemaining value
setInterval(() => {
  setTimeRemaining(timeRemaining - 1)
}, 1000)

// Right - always gets current value
setInterval(() => {
  setTimeRemaining(prev => prev - 1)
}, 1000)
```

### Object/Array Updates
```javascript
// Wrong - mutating existing state
const [user, setUser] = useState({name: 'John', age: 30})
user.age = 31 // Don't do this!

// Right - creating new object
setUser({...user, age: 31})
```

## Performance Considerations

- Each `useState` call creates a separate state variable
- React uses Object.is() to compare old and new state
- If the value hasn't changed, React skips the re-render
- For expensive initial values, use lazy initialization:

```javascript
const [expensiveState, setExpensiveState] = useState(() => {
  return someExpensiveComputation()
})
```