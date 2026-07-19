# React Hooks 完全指南

> 本文系统讲解 React Hooks 的动机、原理、常用 API 和最佳实践。

---

## 目录

- [WHY：为什么需要 Hooks](#why为什么需要-hooks)
- [WHAT：Hooks 本质](#whathooks-本质)
- [🎤 面试回答完整版（10分版）](#-面试回答完整版10分版)

---

## WHY：为什么需要 Hooks

类组件（面向对象编程思想的一种表征）、函数组件侧重发展。早期函数组件无法定义和维护 state，也就是早期被叫做无状态组件。

**函数组件会捕获 render 内部的状态，这是两类组件最大的不同**

- 函数组件像拍照——每次 render 把当时的 props/state 拍成一张照片，里面的函数都引用这张照片里的值；
- 类组件像录像——this 始终是同一台摄像机，永远拍到当前画面

Hooks 帮助函数式组件进行完整版组件开发。

---

## WHAT：Hooks 本质

Hooks 本质是链表。每个函数组件的 Fiber 节点上挂着一个 hooks 链表，按调用顺序排列。这就是为什么 Hooks 必须在组件顶层调用、不能放在条件/循环中——链表依赖调用顺序。

---

## Q: React Hooks 解决了什么问题？

**A:**

**Hooks 是 React 16.8 引入的新特性**，让函数组件拥有了状态管理、副作用处理等能力，解决了函数组件原本作为"无状态组件"的局限。

解决的核心问题：

1. **逻辑复用困难**：类组件通过 HOC / Render Props 复用逻辑，会产生"包装地狱"；Hooks 通过**自定义 Hook** 优雅复用
2. **复杂组件难以理解**：相关逻辑被拆散到各个生命周期方法中；Hooks 可按功能聚合
3. **`this` 使人迷惑**：类组件中 `this` 指向问题不直观；函数组件无 `this`

常用 Hooks 速览：

| Hook                | 用途                                           |
| ------------------- | ---------------------------------------------- |
| `useState`        | 管理组件内部状态                               |
| `useEffect`       | 处理副作用，模拟生命周期                       |
| `useRef`          | 获取 DOM 引用 / 保存不触发渲染的可变值         |
| `useContext`      | 读取 Context 数据                              |
| `useMemo`         | 缓存计算结果，类似 Vue `computed`            |
| `useCallback`     | 缓存函数引用，避免子组件无效重渲染             |
| `useReducer`      | 复杂状态逻辑，类 Redux 模式                    |
| `useLayoutEffect` | 与 `useEffect` 类似，但在 DOM 绘制前同步执行 |

**核心四点：**

1. 告别难以理解的 Class
2. 解决业务难以拆分的问题
3. 使状态逻辑复用变得可行
4. 函数组件从设计思想上看更加契合 React 的理念

---

## Q: 常用 Hooks 用法

**A:**

`useState`

```js
const [state, setState] = useState(initialValue)
```

注意事项：

1. `setState` 是**异步**的（React 18 起所有场景均批处理），调用后不能立即读到新值
2. 若新值与旧值相同（`Object.is` 比较），React 会跳过重新渲染
3. 更新对象/数组时需创建新引用，不能直接 `state.xxx = value`
4. 可传入函数进行**更新函数**模式：

```js
setCount(prev => prev + 1) // 更安全的更新方式
```

`useEffect`

```js
useEffect(() => {
  // 副作用逻辑（数据请求、事件订阅等）
  return () => {
    // 清理函数（组件卸载或依赖变化前执行）
  }
}, [deps]) // 依赖数组
```

执行时机：

- 依赖数组为空 `[]`：仅在挂载后执行一次（类似 `componentDidMount`）
- 有依赖项：依赖变化时重新执行
- 不传依赖：每次渲染后都执行

> ️ **注意**：在回调中使用的变量若未加入依赖数组，会产生**闭包陷阱**（读到过期值）。

`useRef`

```js
const ref = useRef(initialValue)
// ref.current 存储值，修改不触发重新渲染
```

主要用途：

1. 获取 DOM 元素引用：`<input ref={ref} />`
2. 存储跨渲染的可变值（如定时器 ID），修改不触发渲染

`useMemo` / `useCallback`

```js
// 缓存计算结果
const memoValue = useMemo(() => expensiveCalc(a, b), [a, b])

// 缓存函数引用（一般配合 React.memo 子组件使用）
const memoFn = useCallback(() => doSomething(a), [a])
```

> ⚠️ **注意**：不要过度使用 `useMemo`/`useCallback`，记忆化本身有开销，只在真正有性能问题时使用。

`useContext`

```js
// 先创建 Context
const ThemeContext = React.createContext('light')

// Provider 提供值
<ThemeContext.Provider value="dark">
  <Child />
</ThemeContext.Provider>

// 消费（任意层级子组件）
const theme = useContext(ThemeContext)
```

`useReducer`

```js
const [state, dispatch] = useReducer(reducer, initialState)
```

适合状态逻辑复杂、多个子值或下一状态依赖前一状态的场景。

```js
function reducer(state, action) {
  switch (action.type) {
    case 'increment': return { count: state.count + 1 }
    case 'decrement': return { count: state.count - 1 }
    case 'reset':     return { count: 0 }
    default: throw new Error('Unknown action: ' + action.type)
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 })
  return (
    <>
      <p>count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'reset' })}>重置</button>
    </>
  )
}
```

`useState` vs `useReducer` 对比：

| 维度     | `useState`   | `useReducer`           |
| -------- | -------------- | ------------------------ |
| 适用场景 | 简单独立状态   | 多个状态相互关联         |
| 更新逻辑 | 分散在各处     | 集中在 reducer           |
| 状态依赖 | 需用函数式更新 | dispatch action 天然支持 |
| 可测试性 | 一般           | 高（reducer 是纯函数）   |

> ⚠️ **注意**：当状态更新逻辑需要在组件外复用，或状态对象有 3 个以上字段频繁联动更新时，优先考虑 `useReducer`。

---

## Q: useEffect 执行机制

**A:**

执行时机详解：

```js
// 1. 每次渲染后都执行（不传依赖）
useEffect(() => { console.log('每次渲染后') })

// 2. 仅挂载后执行一次（空依赖）
useEffect(() => { console.log('仅挂载一次') }, [])

// 3. 依赖变化时执行
useEffect(() => { console.log('count 变化了') }, [count])

// 4. 清理函数：在组件卸载 或 下次 effect 执行前 调用
useEffect(() => {
  const timer = setInterval(() => console.log(count), 1000)
  return () => clearInterval(timer)  // cleanup
}, [count])
```

cleanup 执行时机（不只是组件销毁）：

每次依赖项变化重新执行 effect 之前，React 都会**先执行上一次的 cleanup**，再执行新的 effect：

```
初次渲染：
  → 执行 effect

count 变化，触发更新：
  → 先执行上一次的 cleanup  ← 这里先跑
  → 再执行新的 effect

组件销毁：
  → 执行最后一次 cleanup
```

| 触发时机 | 是否执行 cleanup |
|---------|----------------|
| 依赖项变化（重新执行 effect 前） | ✅ 执行上一次的 cleanup |
| 组件卸载 | ✅ 执行最后一次的 cleanup |
| 首次挂载 | ❌ 没有上一次，不执行 |

**为什么需要这样设计？** 以订阅为例：

```js
useEffect(() => {
  const sub = subscribe(userId)
  return () => sub.unsubscribe()  // userId 变化前先取消旧订阅
}, [userId])
```

如果 `userId` 从 `1` 变成 `2`，不先 cleanup 的话，旧订阅和新订阅会同时存在，导致 bug。cleanup 的本质是"**在下一次 effect 跑之前，把上一次的副作用清干净**"。

执行顺序（父子嵌套）：

```
父 render → 子 render → 子 useEffect → 父 useEffect
（类似 componentDidMount，子先挂载完成）
```

闭包陷阱（Stale Closure）：

```js
// ❌ 经典问题：effect 中读到了旧的 count 值
function Counter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      console.log(count) // 永远打印 0！（闭包捕获了初始值）
    }, 1000)
    return () => clearInterval(timer)
  }, []) // 依赖数组为空，effect 只创建一次，count 被"锁死"

  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

解决方案：

```js
// 方案1：将 count 加入依赖（推荐）
useEffect(() => {
  const timer = setInterval(() => {
    console.log(count)
  }, 1000)
  return () => clearInterval(timer)
}, [count]) // count 变化时重建 timer

// 方案2：使用 ref 保存最新值，不触发重渲染
const countRef = useRef(count)
useEffect(() => { countRef.current = count })

useEffect(() => {
  const timer = setInterval(() => {
    console.log(countRef.current) // 始终读到最新值
  }, 1000)
  return () => clearInterval(timer)
}, [])
```

---

## Q: useEffect vs useLayoutEffect

**A:**

两者 API 完全相同，区别仅在于**执行时机**：

| 维度         | `useEffect`                    | `useLayoutEffect`                        |
| ------------ | -------------------------------- | ------------------------------------------ |
| 执行时机     | 浏览器**绘制后**异步执行   | DOM 更新后、浏览器**绘制前**同步执行 |
| 是否阻塞绘制 | ❌ 不阻塞                        | ✅ 会阻塞                                  |
| 适用场景     | 数据请求、事件订阅等大多数副作用 | 需要读取/修改 DOM 布局、避免闪烁           |
| SSR 支持     | ✅                               | ❌ 服务端渲染不支持，会警告                |

执行顺序：

```
render → DOM 更新 → useLayoutEffect → 浏览器绘制 → useEffect
```

典型场景：

```js
// useLayoutEffect：避免 tooltip 位置计算闪烁
function Tooltip({ children }) {
  const ref = useRef(null)
  const [pos, setPos] = useState({ top: 0 })

  // 在绘制前同步计算位置，用户看不到闪烁
  useLayoutEffect(() => {
    const rect = ref.current.getBoundingClientRect()
    setPos({ top: rect.bottom + 8 })
  }, [])

  return (
    <>
      <span ref={ref}>{children}</span>
      <div style={{ position: 'fixed', top: pos.top }}>提示框</div>
    </>
  )
}
```

> ⚠️ **注意**：优先使用 `useEffect`；只有在遇到用户可见的 DOM 闪烁问题时才考虑 `useLayoutEffect`。

---

## Q: 自定义 Hook 封装如何封装？

**A:**

**自定义 Hook** 是以 `use` 开头的函数，本质是**提取组件逻辑的工具**，允许将重复的有状态逻辑从组件中抽离复用。

规则：

1. 函数名必须以 `use` 开头（React 依此识别 Hook）
2. 只能在 React 函数组件或其他 Hook 中调用

示例 1：封装数据请求

```js
function useFetch(url) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    fetch(url)
      .then(res => res.json())
      .then(data => { if (!cancelled) setData(data) })
      .catch(err => { if (!cancelled) setError(err) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true } // 清理防止竞态
  }, [url])

  return { data, loading, error }
}

// 使用
function UserList() {
  const { data, loading, error } = useFetch('/api/users')
  if (loading) return <p>加载中...</p>
  if (error) return <p>出错了</p>
  return <ul>{data.map(u => <li key={u.id}>{u.name}</li>)}</ul>
}
```

示例 2：封装本地存储

```js
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : initialValue
  })

  const setStoredValue = (newValue) => {
    setValue(newValue)
    localStorage.setItem(key, JSON.stringify(newValue))
  }

  return [value, setStoredValue]
}

// 使用
const [theme, setTheme] = useLocalStorage('theme', 'light')
```

示例 3：封装防抖

```js
function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
```

自定义 Hook vs HOC vs Render Props：

| 维度     | 自定义 Hook | HOC           | Render Props |
| -------- | ----------- | ------------- | ------------ |
| 逻辑复用 | ✅ 最优雅   | ✅ 可以       | ✅ 可以      |
| 组件嵌套 | ✅ 无嵌套   | ❌ 包装层级多 | ❌ 嵌套深    |
| 调试体验 | ✅ 直观     |  组件名混乱 | 一般         |
| 适用版本 | 函数组件    | 函数/类组件   | 函数/类组件  |

---

## Q: useRef vs useState

**A:**

| 维度         | `useState`        | `useRef`                     |
| ------------ | ------------------- | ------------------------------ |
| 触发重新渲染 | ✅ 是               | ❌ 否                          |
| 存储类型     | 组件状态（UI 相关） | 可变引用值（非 UI 相关）       |
| 返回值       | `[value, setter]` | `{ current: value }`         |
| 更新方式     | 调用 `setState`   | 直接赋值 `ref.current = xxx` |
| 读取时机     | 下一次渲染后生效    | 立即生效                       |

使用场景：

- `useState`：存储影响 UI 渲染的状态（计数、输入值、列表等）
- `useRef`：获取 DOM 引用、存储定时器 ID、记录上一次的值等

---

## Q: 其他 Hooks 全览（含废弃标注）

**A:**

React 官方提供了 **16+ 个** Hook，按使用频率分为四档：

### ✅ 高频使用（面试必考）

| Hook | 版本 | 用途 | 要点 |
|------|------|------|------|
| `useState` | 16.8 | 管理组件内部状态 | setState 异步批处理，函数式更新 `prev => prev + 1` |
| `useEffect` | 16.8 | 处理副作用 | 依赖数组控制时机，cleanup 在下次执行前清理 |
| `useRef` | 16.8 | DOM 引用 / 可变值 | `.current` 修改不触发渲染，立即生效 |
| `useContext` | 16.8 | 读取 Context 数据 | value 变化时所有消费者重渲染，注意性能 |
| `useMemo` | 16.8 | 缓存计算结果 | `useMemo(() => fn(), deps)` |
| `useCallback` | 16.8 | 缓存函数引用 | `useMemo(() => fn, deps)` 的语法糖 |
| `useReducer` | 16.8 | 复杂状态逻辑 | reducer 纯函数，dispatch action |

### 🔵 React 18 新增（并发相关）

| Hook | 版本 | 用途 | 要点 |
|------|------|------|------|
| `useId` | 18 | 生成唯一 ID | SSR 水合一致性，避免 SSR/CSR ID 不匹配 |
| `useTransition` | 18 | 区分紧急/非紧急更新 | `startTransition(() => setX())` 标记为低优先级 |
| `useDeferredValue` | 18 | 延迟非紧急值的更新 | 类似 debounced state，但由 React 调度 |
| `useSyncExternalStore` | 18 | 订阅外部数据源 | 解决 tearing 问题，替代 `useEffect` 订阅模式 |

### 🟡 低频使用（知道即可）

| Hook | 版本 | 用途 | 要点 |
|------|------|------|------|
| `useLayoutEffect` | 16.8 | DOM 更新后、绘制前同步执行 | 会阻塞浏览器绘制，避免闪烁 |
| `useImperativeHandle` | 16.8 | 自定义 ref 暴露给父组件的值 | 配合 `forwardRef`，让子组件控制父组件通过 ref 拿到的内容 |
| `useDebugValue` | 16.8 | 在 DevTools 中显示自定义 Hook 的标签 | 仅开发环境有用，生产环境无效果 |

###  废弃 / 不推荐

| Hook / API | 状态 | 说明 |
|-----------|------|------|
| `useMemo` / `useCallback` | ⚠️ React 19 Compiler 下不再需要 | React Compiler 自动注入 memoization，手动加反而多余 |
| `React.memo` | ⚠️ React 19 Compiler 下不再需要 | 同上，Compiler 自动处理 |
| `ComponentWillMount` 等 UNSAFE 生命周期 | ❌ 已废弃 | React 17 加 `UNSAFE_` 前缀，18 应避免使用 |
| `Class Component` | ️ 不推荐新项目使用 | 函数组件 + Hooks 是官方推荐方向 |

###  完整 Hooks 速查表

```
React Hooks 全景图（按版本）

React 16.8（首批）
  ├── useState          ✅ 高频
  ├── useEffect         ✅ 高频
  ├── useContext        ✅ 高频
  ├── useReducer        ✅ 高频
  ├── useCallback       ✅ 高频（⚠️ R19 Compiler 下不需要）
  ├── useMemo           ✅ 高频（⚠️ R19 Compiler 下不需要）
  ├── useRef            ✅ 高频
  ├── useLayoutEffect   🟡 低频
  ├── useImperativeHandle 🟡 低频
  └── useDebugValue     🟡 低频（仅 DevTools）

React 18（并发）
  ├── useId              🔵 新增
  ├── useTransition      🔵 新增
  ├── useDeferredValue    新增
  └── useSyncExternalStore 🔵 新增（替代外部订阅模式）

React 19（Compiler + Actions）
  ├── use                🔵 新增（读取 Promise/Context，实验性）
  ├── useOptimistic      🔵 新增（乐观更新）
  └── useActionState     🔵 新增（替代 useTransition + useState 模式）
```

### `useImperativeHandle` 示例

```jsx
// 子组件：通过 forwardRef + useImperativeHandle 暴露方法给父组件
const ChildInput = forwardRef(function ChildInput(props, ref) {
  const inputRef = useRef(null)

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    clear: () => { inputRef.current.value = '' }
  }), [])

  return <input ref={inputRef} {...props} />
})

// 父组件
function Parent() {
  const childRef = useRef(null)

  return (
    <>
      <ChildInput ref={childRef} />
      <button onClick={() => childRef.current.focus()}>聚焦</button>
    </>
  )
}
```

### `useTransition` 示例

```jsx
function SearchPage() {
  const [input, setInput] = useState('')
  const [results, setResults] = useState([])
  const [isPending, startTransition] = useTransition()

  const handleChange = (e) => {
    setInput(e.target.value)              // 紧急：输入框立即响应
    startTransition(() => {               // 非紧急：过滤可被打断
      setResults(filterHeavy(e.target.value))
    })
  }

  return (
    <>
      <input value={input} onChange={handleChange} />
      {isPending && <p>搜索中...</p>}
      <ul>{results.map(r => <li>{r}</li>)}</ul>
    </>
  )
}
```

### `useDeferredValue` 示例

```jsx
function SearchResults({ query }) {
  // deferredQuery 会在空闲时才更新，保证输入框流畅
  const deferredQuery = useDeferredValue(query)

  const results = useMemo(
    () => heavySearch(deferredQuery),
    [deferredQuery]
  )

  return <ul>{results.map(r => <li>{r}</li>)}</ul>
}
```

### `useSyncExternalStore` 示例

```jsx
// 替代 useEffect 订阅外部 store 的模式，解决并发模式下的 tearing 问题
function useExternalStore(store) {
  return useSyncExternalStore(
    store.subscribe,      // 订阅函数
    store.getSnapshot,    // 获取当前快照
    store.getServerSnapshot // SSR 时的快照（可选）
  )
}
```

### `useId` 示例

```jsx
// SSR 和 CSR 生成一致的 ID，避免水合不匹配
function FormField({ label }) {
  const id = useId()
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input id={id} />
    </>
  )
}
```

---

## Q: React.memo 优化如何使用？

**A:**

**`React.memo`** 是一个高阶组件，用于对**函数组件**进行浅比较优化。当父组件重新渲染时，若子组件接收的 props 没有发生变化（`Object.is` 浅比较），则跳过子组件的重新渲染。

基本用法：

```jsx
const MyComponent = React.memo(function MyComponent(props) {
  return <div>{props.name}</div>
})
```

自定义比较函数（第二个参数）：

```jsx
function arePropsEqual(prevProps, nextProps) {
  // 返回 true 则跳过渲染，返回 false 则重新渲染
  return prevProps.id === nextProps.id
}

const MyComponent = React.memo(Component, arePropsEqual)
```

memo 后的组件仍会重渲的情况：

- 组件自身 state 发生变化
- 组件使用的 Context 发生变化
- 父组件每次都传入新的对象/函数引用（如内联对象、内联回调）

**真实场景（电商搜索页）**：

搜索页中，输入框内容变化会导致父组件频繁重渲染。若商品卡片组件渲染较重（图片懒加载、价格计算、埋点逻辑），可使用 `React.memo` 避免无意义重渲。

```jsx
import React, { useCallback, useMemo, useState } from 'react'

const ProductList = React.memo(function ProductList({ products, onBuy }) {
  console.log('ProductList render')
  return (
    <ul>
      {products.map(item => (
        <li key={item.id}>
          {item.name} - {item.price}
          <button onClick={() => onBuy(item.id)}>购买</button>
        </li>
      ))}
    </ul>
  )
})

export default function SearchPage({ allProducts }) {
  const [keyword, setKeyword] = useState('')

  // 缓存过滤结果，避免每次输入都重新构造数组
  const visibleProducts = useMemo(() => {
    return allProducts.filter(item => item.name.includes(keyword))
  }, [allProducts, keyword])

  // 缓存回调引用，避免 ProductList 因函数引用变化而重渲
  const handleBuy = useCallback((id) => {
    console.log('buy:', id)
  }, [])

  return (
    <div>
      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder='搜索商品'
      />
      <ProductList products={visibleProducts} onBuy={handleBuy} />
    </div>
  )
}
```

> ️ **注意**：`React.memo` 常与 `useMemo`、`useCallback` 配合使用；否则 props 的引用每次都变，`React.memo` 可能失效。

`React.memo` / `useMemo` / `useCallback` 对比：

| 维度     | `React.memo` | `useMemo`              | `useCallback`            |
| -------- | -------------- | ------------------------ | -------------------------- |
| 作用对象 | 函数组件       | 函数组件内的**值** | 函数组件内的**函数** |
| 作用     | 跳过组件重渲染 | 缓存计算结果             | 缓存函数引用               |
| 依赖比较 | 浅比较 props   | deps 数组                | deps 数组                  |

> ⚠️ **注意**：不要过度使用 `React.memo`，记忆化本身有额外开销（存储快照、执行比较），只在真正出现性能瓶颈时使用。

---

## useEffect 与类生命周期对比

| 场景 | 类组件 | useEffect |
|------|--------|-----------|
| 挂载后做一次 | `componentDidMount` | `useEffect(fn, [])` |
| 某值变化后执行 | `componentDidUpdate` + 手动 if 判断 | `useEffect(fn, [dep])` |
| 每次 render 后都执行 | `componentDidUpdate`（无 if） | `useEffect(fn)` 不传依赖 |
| 卸载时清理 | `componentWillUnmount` | `useEffect` 返回的 cleanup 函数 |
| 请求 + 清理一体 | 分散在两个生命周期 | 写在同一个 `useEffect` 里 |

### componentDidMount → useEffect(fn, [])

空依赖数组 → 只在挂载时执行一次，适合发请求、初始化。

```jsx
// ❌ 类组件
class MyComponent extends React.Component {
  componentDidMount() {
    fetch('/api/data').then(...)
  }
  render() { return <div>Hello</div> }
}

// ✅ 函数组件
function MyComponent() {
  useEffect(() => {
    fetch('/api/data').then(...)
  }, []) // 空依赖 = 仅一次

  return <div>Hello</div>
}
```

### componentDidUpdate → useEffect(fn, [deps])

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
  }, [userId]) // 自动只在 userId 变化时执行

  return <div>{userId}</div>
}
```

> ✅ `useEffect` 是"精确订阅"，比类组件的"全量监听 + 手动过滤"更简洁、更安全。

### componentWillUnmount → useEffect return cleanup

创建与销毁写在同一处，逻辑内聚。

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

> ✅ `useEffect` 的 cleanup 不仅在卸载时执行，还在每次依赖变化重新执行 effect **之前**执行——比类组件更强大。

### 常见陷阱

```js
// ❌ count 跟请求无关，每次 count 变化都重新请求
useEffect(() => {
  fetchData(userId)
}, [userId, count])

// ✅ 只声明真正需要的依赖
useEffect(() => {
  fetchData(userId)
}, [userId])
```

> ⚠️ **核心差异**：类组件 `componentDidUpdate` 是"无差别全监听"，`useEffect` 是"精确订阅"。依赖数组既是优势也是陷阱——漏写了就会拿到旧值（stale closure）。

---

## HOW

---

## 🎤 面试回答完整版（10分版）

### 第一段：先定性——Hooks 解决什么问题

Hooks 是 React 16.8 引入的新特性，让函数组件拥有了原本只有类组件才有的状态管理和副作用处理能力。它解决了三个核心问题：一是类组件的 HOC/Render Props 复用逻辑会产生"包装地狱"，Hooks 通过自定义 Hook 优雅复用；二是类组件把相关逻辑拆散到各个生命周期方法中难以理解，Hooks 可以按功能聚合；三是 `this` 指向问题不直观，函数组件没有 `this`。

**一句话：Hooks 让函数组件从"无状态组件"变成"完整组件"，同时保持了函数组件的核心优势——每次渲染捕获当次 props/state（闭包语义），而类组件通过 `this` 读取的始终是最新值。**

---

### 第二段：常用 Hooks 速览

React 提供了 8 个核心 Hook：

| Hook | 作用 |
|------|------|
| `useState` | 管理组件内部状态，`setState` 异步批处理 |
| `useEffect` | 处理副作用，依赖数组控制执行时机 |
| `useRef` | 获取 DOM 引用 / 保存不触发渲染的可变值 |
| `useContext` | 读取 Context 数据 |
| `useMemo` | 缓存计算结果 |
| `useCallback` | 缓存函数引用（配合 memo 使用） |
| `useReducer` | 复杂状态逻辑，reducer 纯函数 |
| `useLayoutEffect` | DOM 更新后、浏览器绘制前同步执行 |

**`useState` vs `useReducer`：** 简单独立状态用 `useState`；多个状态相互关联、或状态更新逻辑需要复用时用 `useReducer`。`useReducer` 的 reducer 是纯函数，可测试性更好。

**`useMemo` vs `useCallback`：** `useMemo` 缓存计算结果（值），`useCallback` 缓存函数引用。`useCallback` 本质上是 `useMemo(() => fn, deps)` 的语法糖。

---

### 第三段：useEffect 执行机制——最关键的 Hook

`useEffect` 的执行时机取决于依赖数组：

- `[]` → 仅挂载后执行一次（类似 `componentDidMount`）
- `[dep]` → 依赖变化时执行（类似 `componentDidUpdate` + 手动 if 判断）
- 不传依赖 → 每次渲染后都执行
- cleanup 函数 → 组件卸载时执行（类似 `componentWillUnmount`）

**关键设计：cleanup 不仅在卸载时执行，还在每次依赖变化重新执行 effect 之前执行。** 这样保证"上一次副作用"被清理干净再执行新的。以订阅为例：`userId` 从 1 变成 2 时，先 `unsubscribe()` 旧订阅，再 `subscribe()` 新订阅。

**闭包陷阱：** `useEffect` 回调中读取的变量必须是当次渲染的 const。如果依赖数组漏写了某个变量，就会读到过期值。

```js
// ❌ 依赖数组为空，count 被"锁死"在初始值 0
useEffect(() => {
  const timer = setInterval(() => console.log(count), 1000) // 永远打印 0
  return () => clearInterval(timer)
}, [])

// ✅ 方案1：加入依赖
useEffect(() => { ... }, [count])

// ✅ 方案2：ref 保存最新值
const countRef = useRef(count)
useEffect(() => { countRef.current = count })
useEffect(() => { setInterval(() => console.log(countRef.current), 1000) }, [])
```

---

### 第四段：useEffect vs useLayoutEffect

两者 API 完全相同，区别仅在于执行时机：

| 维度 | `useEffect` | `useLayoutEffect` |
|------|------------|------------------|
| 执行时机 | 浏览器**绘制后**异步 | DOM 更新后、浏览器**绘制前**同步 |
| 是否阻塞绘制 | ❌ 不阻塞 | ✅ 会阻塞 |
| 适用场景 | 数据请求、事件订阅 | 需要读取/修改 DOM 布局、避免闪烁 |
| SSR 支持 | ✅ | ❌ 会警告 |

执行顺序：`render → DOM 更新 → useLayoutEffect → 浏览器绘制 → useEffect`

**使用原则：优先用 `useEffect`；只有遇到用户可见的 DOM 闪烁问题时才考虑 `useLayoutEffect`。**

---

### 第五段：自定义 Hook

自定义 Hook 是以 `use` 开头的函数，本质是**提取组件逻辑的工具**。规则：函数名必须以 `use` 开头，只能在组件或其他 Hook 中调用。

常见封装：`useFetch`（数据请求 + 竞态清理）、`useLocalStorage`（状态与 localStorage 同步）、`useDebounce`（防抖值）。

对比 HOC 和 Render Props，自定义 Hook 最优雅——无嵌套、无 props 冲突、调试直观。

---

### 第六段：useRef vs useState

| 维度 | `useState` | `useRef` |
|------|-----------|---------|
| 触发重新渲染 | ✅ 是 | ❌ 否 |
| 存储类型 | 组件状态（UI 相关） | 可变引用值（非 UI 相关） |
| 更新方式 | `setState`（下一渲染生效） | `ref.current = xxx`（立即生效） |
| 使用场景 | 计数、输入值、列表等 | DOM 引用、定时器 ID、记录上次值 |

---

### 第七段：React.memo 配合使用

`React.memo` 是函数组件的浅比较优化，props 不变则跳过重渲染。但它需要配合 `useCallback`（稳函数引用）和 `useMemo`（稳对象引用）才能生效——否则每次 props 都是新引用，memo 永远失效。

| 维度 | `React.memo` | `useMemo` | `useCallback` |
|------|-------------|----------|-------------|
| 作用对象 | 函数组件 | 值 | 函数 |
| 作用 | 跳过重渲染 | 缓存计算结果 | 缓存函数引用 |
| 依赖 | 浅比较 props | deps 数组 | deps 数组 |

> ⚠️ **注意**：不要过度使用 `React.memo`。渲染次数不等于渲染成本——轻组件 memo 的浅比较总开销可能超过渲染本身。只有"重渲染 + 高成本"的组件才值得 memo。

**收尾：** Hooks 的设计让 React 从类组件时代全面进入函数组件时代。核心思想是"组合优于继承"——用自定义 Hook 复用逻辑，用 `useEffect` 精确订阅副作用，用 `useMemo/useCallback` 配合 `React.memo` 做性能优化。理解 Hooks 的本质（链表）和闭包语义，是掌握 React 的关键。
