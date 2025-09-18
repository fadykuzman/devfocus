# useCallback Hook

## What is useCallback?

`useCallback` is a React Hook that returns a memoized version of a callback function. It only changes if one of its dependencies changes. This is useful for performance optimization.

## Basic Syntax

```javascript
const memoizedCallback = useCallback(
  () => {
    // Your function code
  },
  [dependencies] // Dependencies array
)
```

## Why Use useCallback?

### Problem: Function Recreation
```javascript
function MyComponent() {
  const [count, setCount] = useState(0)
  
  // This function is recreated on every render
  const handleClick = () => {
    setCount(count + 1)
  }
  
  return <ExpensiveChild onClick={handleClick} />
}
```

Every render creates a new `handleClick` function, causing `ExpensiveChild` to re-render even if nothing actually changed.

### Solution: useCallback
```javascript
function MyComponent() {
  const [count, setCount] = useState(0)
  
  // This function is only recreated when count changes
  const handleClick = useCallback(() => {
    setCount(count + 1)
  }, [count])
  
  return <ExpensiveChild onClick={handleClick} />
}
```

## Timer Implementation Example

In our countdown timer:

```javascript
const start = useCallback(() => {
  setIsRunning(true)
}, []) // No dependencies - function never changes

const pause = useCallback(() => {
  setIsRunning(false)
}, []) // No dependencies - function never changes

const reset = useCallback(() => {
  setTimeRemaining(INITIAL_TIME)
  setIsRunning(false)
}, []) // No dependencies - function never changes
```

Why use useCallback here?
- Components using this hook won't re-render unnecessarily
- Function references stay stable between renders
- Better performance when passing these functions as props

## When to Use useCallback

### 1. Functions Passed as Props
```javascript
// Child component wrapped in React.memo won't re-render
// if the callback doesn't change
const MyComponent = () => {
  const handleClick = useCallback(() => {
    // handle click
  }, [])
  
  return <ExpensiveChild onClick={handleClick} />
}
```

### 2. Dependencies for Other Hooks
```javascript
const fetchData = useCallback(async () => {
  const response = await api.get(`/data/${userId}`)
  setData(response)
}, [userId])

// This effect only runs when fetchData actually changes
useEffect(() => {
  fetchData()
}, [fetchData])
```

### 3. Custom Hooks (Our Timer Case)
When creating custom hooks that return functions, useCallback prevents consumers from experiencing unnecessary re-renders.

## When NOT to Use useCallback

### 1. Simple Functions Used Only Internally
```javascript
// Don't wrap this - it's only used internally
const handleClick = () => setCount(count + 1)
```

### 2. Functions That Change on Every Render Anyway
```javascript
// useCallback doesn't help here because `value` changes frequently
const handleClick = useCallback(() => {
  doSomething(value)
}, [value]) // If value changes often, no benefit
```

### 3. Premature Optimization
Only use when you have performance issues or when passing functions to memoized components.

## Dependencies Array Rules

### Include All Referenced Values
```javascript
const [a, b] = useState()

const callback = useCallback(() => {
  doSomething(a, b) // Both a and b should be in dependencies
}, [a, b])
```

### Function Form for State Updates
```javascript
// Good - no dependency on count needed
const increment = useCallback(() => {
  setCount(prev => prev + 1)
}, [])

// Less optimal - needs count as dependency
const increment = useCallback(() => {
  setCount(count + 1)
}, [count])
```

## Common Patterns

### Event Handlers
```javascript
const handleInputChange = useCallback((event) => {
  setValue(event.target.value)
}, [])
```

### API Calls
```javascript
const fetchUser = useCallback(async (id) => {
  const user = await api.getUser(id)
  setUser(user)
}, [])
```

### Complex Calculations
```javascript
const calculateExpensiveValue = useCallback(() => {
  return someExpensiveCalculation(inputA, inputB)
}, [inputA, inputB])
```

## Performance Impact

### Memory Usage
- useCallback stores the function in memory
- Only use when the performance benefit outweighs memory cost

### Comparison Cost
- React compares dependencies using Object.is()
- For simple cases, this comparison might cost more than just recreating the function

## Best Practices

1. **Profile First**: Only optimize when you have actual performance issues
2. **Pair with React.memo**: useCallback is most effective with memoized components
3. **Minimize Dependencies**: Use function form of state updates when possible
4. **Document Why**: Add comments explaining why you're using useCallback

## useCallback vs useMemo

```javascript
// useCallback - memoizes the function itself
const memoizedCallback = useCallback(() => {
  return a + b
}, [a, b])

// useMemo - memoizes the result of calling a function
const memoizedValue = useMemo(() => {
  return a + b
}, [a, b])

// They're equivalent to:
const memoizedCallback = useCallback(fn, deps)
const memoizedValue = useMemo(() => fn, deps)
```