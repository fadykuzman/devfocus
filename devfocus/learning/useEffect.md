# useEffect Hook

## What is useEffect?

`useEffect` lets you perform side effects in functional components. It serves the same purpose as `componentDidMount`, `componentDidUpdate`, and `componentWillUnmount` combined in class components.

## Basic Syntax

```javascript
useEffect(() => {
  // Side effect code here
  
  return () => {
    // Cleanup code here (optional)
  }
}, [dependencies]) // Dependencies array (optional)
```

## When useEffect Runs

### No Dependencies Array
```javascript
useEffect(() => {
  console.log('Runs after every render')
})
```
- Runs after every render (initial + all updates)

### Empty Dependencies Array
```javascript
useEffect(() => {
  console.log('Runs once after initial render')
}, [])
```
- Runs only once after the initial render (like componentDidMount)

### With Dependencies
```javascript
useEffect(() => {
  console.log('Runs when isRunning changes')
}, [isRunning])
```
- Runs after initial render AND whenever any dependency changes

## Timer Implementation Example

In our countdown timer:

```javascript
useEffect(() => {
  if (!isRunning) return // Don't run if timer is paused
  
  const interval = setInterval(() => {
    setTimeRemaining(prev => {
      if (prev <= 1) {
        setIsRunning(false) // Stop timer at 0
        return 0
      }
      return prev - 1
    })
  }, 1000)
  
  return () => clearInterval(interval) // Cleanup
}, [isRunning]) // Run when isRunning changes
```

This effect:
1. Only runs when `isRunning` changes
2. Sets up an interval to decrement time every second
3. Cleans up the interval when effect re-runs or component unmounts

## Cleanup Function

The cleanup function runs:
- Before the effect runs again (if dependencies changed)
- When the component unmounts

Common cleanup scenarios:
- Clear intervals/timeouts
- Cancel network requests
- Remove event listeners
- Close WebSocket connections

## Effect Patterns

### Data Fetching
```javascript
useEffect(() => {
  const fetchData = async () => {
    const response = await api.getData()
    setData(response)
  }
  fetchData()
}, [])
```

### Event Listeners
```javascript
useEffect(() => {
  const handleResize = () => setWindowWidth(window.innerWidth)
  
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
}, [])
```

### Intervals and Timeouts
```javascript
useEffect(() => {
  const timer = setInterval(() => {
    setCount(prev => prev + 1)
  }, 1000)
  
  return () => clearInterval(timer)
}, [])
```

## Dependencies Array Deep Dive

### What to Include
- All values from component scope used inside the effect
- State variables, props, functions defined in component

### React's Rule
Every value from component scope that's used inside useEffect should be in the dependencies array.

### Common Mistakes

```javascript
// Wrong - missing dependency
const [count, setCount] = useState(0)
useEffect(() => {
  const timer = setInterval(() => {
    setCount(count + 1) // Uses count but not in deps
  }, 1000)
  return () => clearInterval(timer)
}, []) // Missing count dependency

// Right - use function update
useEffect(() => {
  const timer = setInterval(() => {
    setCount(prev => prev + 1) // No dependency on count
  }, 1000)
  return () => clearInterval(timer)
}, [])
```

## Performance Considerations

### Expensive Effects
```javascript
useEffect(() => {
  // Only run when specific values change
  const result = expensiveCalculation(a, b)
  setResult(result)
}, [a, b]) // Only re-run if a or b changes
```

### Multiple Effects
Split unrelated logic into separate effects:

```javascript
// Good - separate concerns
useEffect(() => {
  // Timer logic
}, [isRunning])

useEffect(() => {
  // Analytics tracking
}, [timeRemaining])
```

## Common Gotchas

### Infinite Loops
```javascript
// Wrong - creates infinite loop
const [data, setData] = useState([])
useEffect(() => {
  setData([...data, 'new item']) // data changes, effect runs again
}, [data])

// Right - be specific about dependencies
useEffect(() => {
  if (someCondition) {
    setData(prev => [...prev, 'new item'])
  }
}, [someCondition])
```

### Stale Closures in Effects
Effects capture values from when they were created. Use the function form of state setters to avoid stale values.

### Missing Cleanup
Always clean up subscriptions, intervals, and listeners to prevent memory leaks.