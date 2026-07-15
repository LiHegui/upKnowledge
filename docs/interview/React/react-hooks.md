# WHY

类组件（面向对象编程思想的一种表征）、函数组件侧重发展。早期函数组件无法定义和维护state, 也就是早期被叫做无状态组件

**函数组件会捕获render内部的状态，这是两类组件最大的不同**

- 函数组件像拍照——每次 render 把当时的 props/state 拍成一张照片，里面的函数都引用这张照片里的值；
- 类组件像录像——this 始终是同一台摄像机，永远拍到当前画面

Hooks 帮助 函数式组件进行完整版组件开发

## useState 

定义维护state

## useEffect

允许函数组件执行副作用操作

useEffect 在一定程度上弥补了生命周期在函数式组件得缺失

componentDidMount componentDidUpdate componentWillUnmount 三个生命周期做的事，可以放在useEffect里来做

## 1. componentDidMount → useEffect(fn, [])

空依赖数组 → 只在挂载时执行一次，适合发请求、初始化。

```jsx
// ❌ 类组件
class MyComponent extends React.Component {
  componentDidMount() {
    fetch('/api/data').then(res => res.json())
  }
  render() { return <div>Hello</div> }
}

// ✅ 函数组件
function MyComponent() {
  useEffect(() => {
    fetch('/api/data').then(res => res.json())
  }, []) // 空依赖 → 仅挂载时执行一次

  return <div>Hello</div>
}
```

## 2. componentDidUpdate → useEffect(fn, [deps])

依赖数组自动对比，无需手动 if 判断。

```jsx
// ❌ 类组件 — 必须手动对比 prevProps，忘记写 if → 无限循环
class MyComponent extends React.Component {
  componentDidUpdate(prevProps) {
    if (this.props.userId !== prevProps.userId) {
      fetch(`/api/user/${this.props.userId}`)
    }
  }
  render() { return <div>{this.props.userId}</div> }
}

// ✅ 函数组件 — 声明式监听，自动对比
function MyComponent({ userId }) {
  useEffect(() => {
    fetch(`/api/user/${userId}`)
  }, [userId]) // userId 变化时才执行

  return <div>{userId}</div>
}
```

## 3. componentWillUnmount → useEffect return cleanup

创建与销毁写在同一处，逻辑内聚，不容易遗忘清理。

```jsx
// ❌ 类组件 — 创建和清理分散在两个生命周期
class Timer extends React.Component {
  componentDidMount() {
    this.id = setInterval(() => console.log('tick'), 1000)
  }
  componentWillUnmount() {
    clearInterval(this.id) // 单独写，容易忘
  }
  render() { return <div>Timer</div> }
}

// ✅ 函数组件 — cleanup 紧挨着创建逻辑
function Timer() {
  useEffect(() => {
    const id = setInterval(() => console.log('tick'), 1000)
    return () => {
      clearInterval(id) // 创建与销毁写在一起
    }
  }, [])

  return <div>Timer</div>
}
```

## 核心四点

1. 告别难以理解的Class
2. 解决业务难以拆分的问题
3. 使状态逻辑复用变得可行
4. 函数组件从设计思想上看更加契合React的理念

# WHAT

Hooks 本质是链表

# HOW