# React 面试题

> 本文覆盖 React 核心原理与工程实践，包含：组件基础、事件机制、Hooks、生命周期、Fiber 架构、状态管理、路由、高阶组件等核心考点。

---

## 基础认知篇

## Q: 谈谈你对 React 的理解？

**A:**

React 是用于构建用户界面的 JavaScript **库**（不是框架），只提供了 UI 层面的解决方案，遵循组件设计模式与函数式编程理念。

**核心特点：**

| 特性       | 说明                                                   |
| ---------- | ------------------------------------------------------ |
| JSX 语法   | JS 的语法扩展，可以在 JS 中写类 HTML 结构              |
| 单向数据流 | 数据从父组件流向子组件，子组件不能直接修改父组件的数据 |
| 虚拟 DOM   | 用 JS 对象描述真实 DOM，通过 diff 算法最小化 DOM 操作  |
| 声明式编程 | 描述 UI 的"状态"，由 React 负责更新真实 DOM            |
| 组件化     | 页面拆分为独立可复用的组件，提升代码复用率与可维护性   |

**关于组件：**

- React 组件首字母必须**大写**，小写会被识别为原生 DOM 标签（Babel 转义时的判断依据）
- `React.Fragment`（等价 `<></>`）用于包裹多个根元素而不产生额外 DOM 节点
- 组件应具备：**可组合、可重用、可维护**的特点

---

## Q: JSX 是什么？JSX 转成真实 DOM 的过程是怎样的？

**A:**

**JSX** 是 JavaScript 的语法扩展，它和模板语言很像，但具备完整的 JavaScript 能力。

**转换流程：**

```
JSX  Babel 编译  React.createElement()  ReactElement（虚拟 DOM）  ReactDOM.render()  真实 DOM
```

**第一步：Babel 将 JSX 编译为 `React.createElement()`**

```js
/**
 * @param {*} type    节点类型（string 表示原生标签，function/class 表示自定义组件）
 * @param {*} config  组件属性，以键值对形式存储
 * @param {*} children 子节点内容
 */
React.createElement(type, config, children)
```

Babel 编译时的判断规则：

- 首字母**小写**  认定为原生 DOM 标签，`type` 编译为**字符串**
- 首字母**大写**  认定为自定义组件，`type` 编译为**对象引用**

**第二步：`React.createElement()` 返回 ReactElement（虚拟 DOM 对象）**

```js
function FunctionComponent(props) {
  return (
    <div className="border">
      FunctionComponent
      <p>{props.name}</p>
    </div>
  );
}

class ClassComponent extends Component {
  render() {
    return (
      <div className="border">
        <h3>ClassComponent</h3>
        <p className={this.props.color}>{this.props.name}</p>
      </div>
    );
  }
}
```

**第三步：`ReactDOM.render()` 将虚拟 DOM 渲染到真实 DOM**

```js
ReactDOM.render(
  element,    // 需要渲染的 ReactElement
  container,  // 挂载目标容器
  callback    // 渲染完成后的回调（可选）
);

// 示例
ReactDOM.render(<App />, document.getElementById('root'));
```

---

## Q: Real DOM 和 Virtual DOM 有什么区别？各自的优缺点？

**A:**

**虚拟 DOM** 是 `React.createElement()` 创建的 JS 对象，用轻量级数据结构描述真实 DOM 的结构与属性。

**核心对比：**

| 维度     | 真实 DOM                | 虚拟 DOM                   |
| -------- | ----------------------- | -------------------------- |
| 操作成本 | 高（浏览器处理 DOM 慢） | 低（纯 JS 对象运算快）     |
| 更新策略 | 每次变化立即渲染        | 批量收集变化，统一更新一次 |
| 跨平台   | ❌ 依赖浏览器环境       | ✅ 可跨平台（RN、SSR）     |
| 首次渲染 | 快                      | 略慢（多一层 JS 对象创建） |

**核心依据**：浏览器处理 DOM 非常慢，处理 JavaScript 非常快。

**更新流程：**

```
组件更新  render()  新虚拟 DOM  diff 算法定位差异  最小化更新真实 DOM
```

> 📖 推荐：[「React深入」一文吃透虚拟DOM和diff算法](https://juejin.cn/post/7116326409961734152)

---

## Q: 说说对 React 中类组件和函数组件的理解？有什么区别？

**A:**

| 维度            | 类组件                                | 函数组件                   |
| --------------- | ------------------------------------- | -------------------------- |
| 定义方式        | `class Foo extends React.Component` | `function Foo(props) {}` |
| 状态管理        | `this.state` + `this.setState()`  | `useState()` Hook        |
| 生命周期        | 完整生命周期方法                      | `useEffect()` 模拟       |
| `this` 问题   | 存在 `this` 指向问题                | 无 `this`                |
| 性能            | 稍重（实例化开销）                    | 更轻量                     |
| 逻辑复用        | HOC / Render Props                    | 自定义 Hook（更优雅）      |
| 现代 React 趋势 | ❌ 逐渐减少使用                       | ✅ 主流推荐                |

**核心差异**：函数组件通过 Hooks 获得了状态和副作用能力后，已基本替代类组件。函数组件每次渲染都是一次新的函数调用，**捕获的是当次渲染的 props/state**（闭包语义），而类组件通过 `this` 读取的始终是最新值。

---

## Q: state 和 props 有什么区别？

**A:**

| 维度     | state                                      | props                 |
| -------- | ------------------------------------------ | --------------------- |
| 来源     | 组件内部自己定义                           | 由父组件传入          |
| 可修改性 | ✅ 可通过 `setState` / `useState` 修改 | ❌ 只读，不可直接修改 |
| 访问范围 | 组件私有                                   | 由父组件控制          |
| 触发更新 | 修改会触发组件重新渲染                     | 父组件更新时随之更新  |

**关键原则**：

- `state` 是组件自身维护的内部数据，外部无法访问
- `props` 是父组件传入的参数，子组件若需修改须通过调用父组件传来的回调函数实现（**单向数据流**）

---

## Q: 组件中如何验证 Props？

**A:**

**方式一：使用 `prop-types` 库（JS 项目）**

```js
import React from 'react'
import propTypes from 'prop-types'

class MyComponent extends React.Component {
  render() {
    return <div>{this.props.name}</div>
  }
}

MyComponent.propTypes = {
  name: propTypes.string.isRequired,
  age: propTypes.number,
  onClick: propTypes.func
}

MyComponent.defaultProps = {
  age: 18
}

export default MyComponent
```

**方式二：使用 TypeScript 接口（TS 项目，推荐）**

```tsx
interface Props {
  name: string
  age?: number
  onClick?: () => void
}

const MyComponent: React.FC<Props> = ({ name, age = 18 }) => {
  return <div>{name} - {age}</div>
}
```

> ⚠️ **注意**：TS 项目优先使用接口定义 Props，比 `prop-types` 更安全、更友好（编译期检查）。

---

## Q: super() 和 super(props) 有什么区别？

**A:**

`super` 关键字用于调用父类构造函数，在类组件中必须在使用 `this` 之前调用。

|                           | `super()`                     | `super(props)`                  |
| ------------------------- | ------------------------------- | --------------------------------- |
| 作用                      | 调用父类构造函数                | 调用父类构造函数并传入 props      |
| 构造函数中 `this.props` | `undefined` ❌                | 可正常访问 ✅                     |
| 使用场景                  | 构造函数内不访问 `this.props` | 构造函数内需要访问 `this.props` |

```js
// ❌ 不推荐
class MyComponent extends React.Component {
  constructor(props) {
    super()
    console.log(this.props) // undefined
  }
}

// ✅ 推荐
class MyComponent extends React.Component {
  constructor(props) {
    super(props)
    console.log(this.props) // { ... }
  }
}
```

> ⚠️ **注意**：现代 React 更推荐函数组件 + Hooks，类组件场景越来越少，此知识点属于历史遗留考点。

---

## Q: 为什么说 React 中的 props 是只读的？

**A:**

React 中 props 实现单向数据流，父组件传入子组件的数据在子组件中是**只读的**。

**原因：**

1. **可预测性**：如果子组件可随意修改 props，数据变化来源难以追踪，状态变得不可预测
2. **单向数据流**：数据只能从上到下（父  子）流动，组件间关系清晰
3. **组件纯净性**：相同的 props 输入，组件应产出相同的 UI 输出

**子组件想"修改"父组件数据的正确方式：** 父组件传入回调函数，子组件调用该回调通知父组件更新。

---

## Q: React 组件之间如何通信？

**A:**

React 组件通信方式根据组件关系分为以下几类：

**1. 父 → 子：props 传递**

```jsx
function Parent() {
  return <Child name="Alice" age={18} />
}
function Child({ name, age }) {
  return <p>{name} - {age}</p>
}
```

**2. 子 → 父：回调函数**

```jsx
function Parent() {
  const handleData = (data) => console.log('子组件传来：', data)
  return <Child onSend={handleData} />
}
function Child({ onSend }) {
  return <button onClick={() => onSend('hello')}>发送</button>
}
```

**3. 跨层级：Context**

```jsx
const UserContext = React.createContext(null)

function App() {
  return (
    <UserContext.Provider value={{ name: 'Alice' }}>
      <Page />
    </UserContext.Provider>
  )
}

// 任意层级子组件直接获取
function DeepChild() {
  const user = useContext(UserContext)
  return <p>{user.name}</p>
}
```

**4. 兄弟组件：状态提升**

将共享状态提升到最近的公共父组件，兄弟组件通过 props 共享数据。

```jsx
function Parent() {
  const [count, setCount] = useState(0)
  return (
    <>
      <ChildA count={count} />
      <ChildB onIncrement={() => setCount(c => c + 1)} />
    </>
  )
}
```

**5. 全局状态：Redux / Zustand / Jotai**

适合大型应用，状态与 UI 完全解耦。

**6. 事件总线（不推荐）**

通过发布/订阅模式在任意组件间通信，但会导致数据流难以追踪，不推荐在 React 中使用。

**选择建议：**

| 场景                 | 推荐方式        |
| -------------------- | --------------- |
| 父子直接传递         | props / 回调    |
| 隔层传递（低频更新） | Context         |
| 兄弟共享             | 状态提升        |
| 中大型应用全局状态   | Redux / Zustand |

---

## 事件机制篇

## Q: 说说 React 的事件机制？

**A:**

React 基于浏览器事件机制，自身实现了一套**合成事件（Synthetic Event）**系统，包括事件注册、合成、冒泡、派发等。

**1. 合成事件**

React 事件是对原生 DOM 事件的包装，提供统一 API，解决跨浏览器兼容性问题。

- ✅ 跨浏览器兼容
- ✅ 通过事件委托绑定到**根节点**，而非具体 DOM 元素

**2. 事件委托**

React 将所有事件统一绑定到根节点（React 17 之前是 `document`，React 17 起改为 `ReactDOM.render` 的容器节点），事件触发时根据 `event.target` 找到对应组件并调用处理函数。

**优点：**

- 减少内存消耗（不为每个元素绑定事件）
- 组件动态增删无需手动绑定/解绑

**3. 事件传播**

与原生 DOM 事件相同，分三个阶段：捕获阶段  目标阶段  冒泡阶段。

默认在**冒泡阶段**触发，如需监听捕获阶段可使用 `onClickCapture`。

```jsx
function MyComponent() {
  return (
    <div
      onClickCapture={() => console.log('捕获阶段')}
      onClick={() => console.log('冒泡阶段')}
    >
      <button>Click me</button>
    </div>
  )
}
```

**4. 与原生事件对比**

| 特性         | 原生 DOM 事件       | React 合成事件                 |
| ------------ | ------------------- | ------------------------------ |
| 事件绑定     | 直接绑定到 DOM 元素 | 委托到根节点                   |
| 事件对象     | 原生 `Event`      | `SyntheticEvent`             |
| 跨浏览器兼容 | 需手动处理          | 自动处理                       |
| 事件池化     | 无                  | 有（React 17 前有，17 后废弃） |

**5. React 17 的变化**

React 17 将事件委托从 `document` 改为根容器，使 React 应用与非 React 代码共存更友好（多个 React 版本混用场景）。

> ⚠️ **注意**：React 17 起已废弃事件池化机制，无需再调用 `event.persist()`。

---

## Hooks 篇

## Q: 说说对 React Hooks 的理解？解决了什么问题？

**A:**

**Hooks 是 React 16.8 引入的新特性**，让函数组件拥有了状态管理、副作用处理等能力，解决了函数组件原本作为"无状态组件"的局限。

**解决的核心问题：**

1. **逻辑复用困难**：类组件通过 HOC / Render Props 复用逻辑，会产生"包装地狱"；Hooks 通过**自定义 Hook** 优雅复用
2. **复杂组件难以理解**：相关逻辑被拆散到各个生命周期方法中；Hooks 可按功能聚合
3. **`this` 使人迷惑**：类组件中 `this` 指向问题不直观；函数组件无 `this`

**常用 Hooks 速览：**

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

---

## Q: 常用 Hooks 的用法和注意事项？

**A:**

**`useState`**

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

**`useEffect`**

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

> ⚠️ **注意**：在回调中使用的变量若未加入依赖数组，会产生**闭包陷阱**（读到过期值）。

**`useRef`**

```js
const ref = useRef(initialValue)
// ref.current 存储值，修改不触发重新渲染
```

主要用途：

1. 获取 DOM 元素引用：`<input ref={ref} />`
2. 存储跨渲染的可变值（如定时器 ID），修改不触发渲染

**`useMemo` / `useCallback`**

```js
// 缓存计算结果
const memoValue = useMemo(() => expensiveCalc(a, b), [a, b])

// 缓存函数引用（一般配合 React.memo 子组件使用）
const memoFn = useCallback(() => doSomething(a), [a])
```

> ⚠️ **注意**：不要过度使用 `useMemo`/`useCallback`，记忆化本身有开销，只在真正有性能问题时使用。

**`useContext`**

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

**`useReducer`**

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

**`useState` vs `useReducer` 对比：**

| 维度     | `useState`   | `useReducer`           |
| -------- | -------------- | ------------------------ |
| 适用场景 | 简单独立状态   | 多个状态相互关联         |
| 更新逻辑 | 分散在各处     | 集中在 reducer           |
| 状态依赖 | 需用函数式更新 | dispatch action 天然支持 |
| 可测试性 | 一般           | 高（reducer 是纯函数）   |

> ⚠️ **注意**：当状态更新逻辑需要在组件外复用，或状态对象有 3 个以上字段频繁联动更新时，优先考虑 `useReducer`。

---

## Q: useEffect 的执行时机与闭包陷阱？

**A:**

**执行时机详解：**

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

**cleanup 执行时机（不只是组件销毁）：**

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

**执行顺序（父子嵌套）：**

```
父 render → 子 render → 子 useEffect → 父 useEffect
（类似 componentDidMount，子先挂载完成）
```

**闭包陷阱（Stale Closure）：**

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

**解决方案：**

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

## Q: useEffect 和 useLayoutEffect 有什么区别？

**A:**

两者 API 完全相同，区别仅在于**执行时机**：

| 维度         | `useEffect`                    | `useLayoutEffect`                        |
| ------------ | -------------------------------- | ------------------------------------------ |
| 执行时机     | 浏览器**绘制后**异步执行   | DOM 更新后、浏览器**绘制前**同步执行 |
| 是否阻塞绘制 | ❌ 不阻塞                        | ✅ 会阻塞                                  |
| 适用场景     | 数据请求、事件订阅等大多数副作用 | 需要读取/修改 DOM 布局、避免闪烁           |
| SSR 支持     | ✅                               | ❌ 服务端渲染不支持，会警告                |

**执行顺序：**

```
render → DOM 更新 → useLayoutEffect → 浏览器绘制 → useEffect
```

**典型场景：**

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

## Q: 什么是自定义 Hook？如何封装？

**A:**

**自定义 Hook** 是以 `use` 开头的函数，本质是**提取组件逻辑的工具**，允许将重复的有状态逻辑从组件中抽离复用。

**规则：**

1. 函数名必须以 `use` 开头（React 依此识别 Hook）
2. 只能在 React 函数组件或其他 Hook 中调用

**示例 1：封装数据请求**

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

**示例 2：封装本地存储**

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

**示例 3：封装防抖**

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

**自定义 Hook vs HOC vs Render Props：**

| 维度     | 自定义 Hook | HOC           | Render Props |
| -------- | ----------- | ------------- | ------------ |
| 逻辑复用 | ✅ 最优雅   | ✅ 可以       | ✅ 可以      |
| 组件嵌套 | ✅ 无嵌套   | ❌ 包装层级多 | ❌ 嵌套深    |
| 调试体验 | ✅ 直观     | ❌ 组件名混乱 | 一般         |
| 适用版本 | 函数组件    | 函数/类组件   | 函数/类组件  |

---

## Q: useRef 和 useState 的区别？

**A:**

| 维度         | `useState`        | `useRef`                     |
| ------------ | ------------------- | ------------------------------ |
| 触发重新渲染 | ✅ 是               | ❌ 否                          |
| 存储类型     | 组件状态（UI 相关） | 可变引用值（非 UI 相关）       |
| 返回值       | `[value, setter]` | `{ current: value }`         |
| 更新方式     | 调用 `setState`   | 直接赋值 `ref.current = xxx` |
| 读取时机     | 下一次渲染后生效    | 立即生效                       |

**使用场景：**

- `useState`：存储影响 UI 渲染的状态（计数、输入值、列表等）
- `useRef`：获取 DOM 引用、存储定时器 ID、记录上一次的值等

---

## Q: React.memo 是什么？如何使用？

**A:**

**`React.memo`** 是一个高阶组件，用于对**函数组件**进行浅比较优化。当父组件重新渲染时，若子组件接收的 props 没有发生变化（`Object.is` 浅比较），则跳过子组件的重新渲染。

**基本用法：**

```jsx
const MyComponent = React.memo(function MyComponent(props) {
  return <div>{props.name}</div>
})
```

**自定义比较函数（第二个参数）：**

```jsx
function arePropsEqual(prevProps, nextProps) {
  // 返回 true 则跳过渲染，返回 false 则重新渲染
  return prevProps.id === nextProps.id
}

const MyComponent = React.memo(Component, arePropsEqual)
```

**memo 后的组件仍会重渲的情况：**

- 组件自身 state 发生变化
- 组件使用的 Context 发生变化

**`React.memo` / `useMemo` / `useCallback` 对比：**

| 维度     | `React.memo` | `useMemo`              | `useCallback`            |
| -------- | -------------- | ------------------------ | -------------------------- |
| 作用对象 | 函数组件       | 函数组件内的**值** | 函数组件内的**函数** |
| 作用     | 跳过组件重渲染 | 缓存计算结果             | 缓存函数引用               |
| 依赖比较 | 浅比较 props   | deps 数组                | deps 数组                  |

> ⚠️ **注意**：不要过度使用 `React.memo`，记忆化本身有额外开销（存储快照、执行比较），只在真正出现性能瓶颈时使用。

---

## 生命周期篇

## Q: React 生命周期有哪些阶段？每个阶段对应的方法是？

**A:**

React 类组件生命周期分为三个阶段：

**1. 挂载阶段（Mounting）**

| 方法                                              | 说明                                                           |
| ------------------------------------------------- | -------------------------------------------------------------- |
| `constructor(props)`                            | 初始化 `state`，绑定方法；必须调用 `super(props)`          |
| `static getDerivedStateFromProps(props, state)` | 静态方法，每次渲染前调用，返回对象更新 state，返回 null 不更新 |
| `render()`                                      | 必须实现，返回 JSX，不应产生副作用                             |
| `componentDidMount()`                           | DOM 挂载后调用，适合：数据请求、事件监听、DOM 操作             |

**2. 更新阶段（Updating）**

| 方法                                                   | 说明                                                              |
| ------------------------------------------------------ | ----------------------------------------------------------------- |
| `static getDerivedStateFromProps()`                  | 同挂载阶段，每次更新前也会调用                                    |
| `shouldComponentUpdate(nextProps, nextState)`        | 返回 `true` 则更新，`false` 则跳过；性能优化入口              |
| `render()`                                           | 同上                                                              |
| `getSnapshotBeforeUpdate(prevProps, prevState)`      | 在 DOM 更新前调用，返回值传给 `componentDidUpdate` 的第三个参数 |
| `componentDidUpdate(prevProps, prevState, snapshot)` | 更新完成后调用                                                    |

**3. 卸载阶段（Unmounting）**

| 方法                       | 说明                                                   |
| -------------------------- | ------------------------------------------------------ |
| `componentWillUnmount()` | 组件销毁前调用，用于清理定时器、取消订阅、移除事件监听 |

**生命周期执行顺序：**

```
挂载: constructor  getDerivedStateFromProps  render  componentDidMount
更新: getDerivedStateFromProps  shouldComponentUpdate  render  getSnapshotBeforeUpdate  componentDidUpdate
卸载: componentWillUnmount
```

> ⚠️ **注意**：`componentWillMount`、`componentWillReceiveProps`、`componentWillUpdate` 已在 React 17 中标记为 `UNSAFE_` 前缀，React 18 中应避免使用。

**函数组件对应关系（Hooks）：**

| 类组件生命周期            | 函数组件 Hooks 等价                                      |
| ------------------------- | -------------------------------------------------------- |
| `componentDidMount`     | `useEffect(() => {}, [])`                              |
| `componentDidUpdate`    | `useEffect(() => {}, [deps])`                          |
| `componentWillUnmount`  | `useEffect(() => { return () => { /* 清理 */ } }, [])` |
| `shouldComponentUpdate` | `React.memo` + `useMemo`                             |

---

## 状态管理篇

## Q: React Context 是什么？如何使用？有哪些局限？

**A:**

**Context** 是 React 提供的跨层级数据共享方案，避免 props 一级一级手动传递（"prop drilling"）。

**基本用法（三步）：**

```jsx
// 1. 创建 Context
const ThemeContext = React.createContext('light') // 参数为默认值

// 2. Provider 提供数据（包裹需要共享数据的组件树）
function App() {
  const [theme, setTheme] = useState('dark')
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Page />
    </ThemeContext.Provider>
  )
}

// 3. 消费（任意层级子组件）
function Button() {
  const { theme, setTheme } = useContext(ThemeContext)
  return (
    <button style={{ background: theme === 'dark' ? '#333' : '#fff' }}>
      当前主题：{theme}
    </button>
  )
}
```

**Context 的局限性：**

| 局限           | 说明                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------- |
| 性能问题       | Context value 变化时，**所有**消费该 Context 的组件都会重新渲染，即使它们实际用到的数据没变 |
| 难以按需订阅   | 不像 Redux/Zustand，无法只订阅 state 的某个字段                                                   |
| 大量数据不适合 | 高频更新的全局状态（如实时数据）会造成大量无效重渲染                                              |

**性能优化：拆分 Context**

```jsx
// ❌ 把所有数据放一个 Context — 任何数据变化都让所有消费者重渲
const AppContext = createContext({ user, theme, cart })

// ✅ 按更新频率拆分
const UserContext = createContext(null)    // 低频
const ThemeContext = createContext(null)   // 低频
const CartContext = createContext(null)    // 高频
```

> ⚠️ **注意**：Context 适合**低频更新的全局状态**（主题、国际化、用户信息）。高频更新或复杂状态交互，应使用 Redux / Zustand 等专业状态管理库。

---

## Q: 说说 React 中 setState 的执行机制？

**A:**

`setState` 是类组件中更新状态的方法，其执行流程如下：

1. 将 `partialState` 存入当前组件实例的状态暂存队列
2. 判断是否处于**批量更新**状态：
   - **是**  将组件加入待更新队列，延迟更新
   - **否**  标记批量更新为 `true`，将组件加入队列
3. 遍历待更新队列，依次执行：
   1. 合并暂存队列中的所有 state，得到最终 state
   2. `shouldComponentUpdate`  判断是否继续更新
   3. `render()`
   4. `componentDidUpdate`

**多次 setState 会合并吗？**

大多数情况会合并（批处理），但**完全替换时不合并**。合并只是一种性能优化策略。

---

## Q: setState 是同步还是异步？

**A:**

setState 的同步/异步行为取决于调用上下文：

**异步（批处理）场景：**

- React 合成事件处理函数中
- React 生命周期方法中

```js
handleClick = () => {
  this.setState({ count: this.state.count + 1 })
  console.log(this.state.count) // 输出旧值，因为是异步批处理
}
```

**同步场景（React 17 及以前）：**

- `setTimeout`、`Promise`、原生事件回调中

```js
setTimeout(() => {
  this.setState({ count: this.state.count + 1 })
  console.log(this.state.count) // 输出新值，同步更新
}, 0)
```

**React 18 的变化：自动批处理（Automatic Batching）**

React 18 起，所有场景（包括 `setTimeout`、`Promise`、原生事件）都默认进行批处理，全面异步化。

```js
// React 18 中想强制同步更新，使用 flushSync
import { flushSync } from 'react-dom'

flushSync(() => {
  this.setState({ count: this.state.count + 1 })
})
console.log(this.state.count) // 已更新
```

**如何在 setState 后获取最新状态：**

```js
// 方式1：回调函数
this.setState({ count: this.state.count + 1 }, () => {
  console.log(this.state.count) // 新值
})

// 方式2：函数式更新
this.setState(prevState => ({
  count: prevState.count + 1
}))
```

---

## Q: 如何理解 Redux？

**A:**

Redux 是一个用于 JavaScript 应用的**状态管理库**，常与 React 搭配使用。核心思想：将应用所有状态**集中管理**，使状态变化可预测且易于调试。

**核心概念：**

| 概念          | 说明                                                             |
| ------------- | ---------------------------------------------------------------- |
| `Store`     | 存储应用状态的唯一容器，整个应用只有一个 Store                   |
| `State`     | 存储在 Store 中的状态对象                                        |
| `Action`    | 描述状态变化的普通对象，必须包含 `type` 字段                   |
| `Reducer`   | 纯函数，`(state, action) => newState`，定义状态如何响应 Action |
| `Dispatch`  | 触发 Action 的方法                                               |
| `Subscribe` | 监听状态变化的方法                                               |

**工作流程：**

```
UI 交互  dispatch(action)  Reducer(state, action)  新 State  通知订阅者  UI 更新
```

**示例代码：**

```js
// Reducer
const counterReducer = (state = 0, action) => {
  switch (action.type) {
    case 'INCREMENT': return state + 1
    case 'DECREMENT': return state - 1
    default: return state
  }
}

// 创建 Store
const store = createStore(counterReducer)

// 订阅
store.subscribe(() => console.log('state:', store.getState()))

// 派发 Action
store.dispatch({ type: 'INCREMENT' }) // state: 1
store.dispatch({ type: 'INCREMENT' }) // state: 2
store.dispatch({ type: 'DECREMENT' }) // state: 1
```

**Redux 三大原则：**

1. **单一数据源**：整个应用 state 存于唯一 Store
2. **State 只读**：只能通过 dispatch Action 改变 state
3. **纯函数更新**：Reducer 必须是纯函数

**优缺点：**

|  | 优点                              | 缺点                              |
| - | --------------------------------- | --------------------------------- |
|  | ✅ 状态可预测，易于调试           | ❌ 样板代码多（Action / Reducer） |
|  | ✅ 状态集中，便于全局共享         | ❌ 学习曲线较陡                   |
|  | ✅ 时间旅行调试（Redux DevTools） | ❌ 小项目引入成本高               |

> 📖 现代 React 项目推荐使用 **Redux Toolkit（RTK）**，大幅减少样板代码。

**Redux Toolkit（RTK）简化写法：**

```js
import { createSlice, configureStore } from '@reduxjs/toolkit'

// createSlice 自动生成 action creators + reducer
const counterSlice = createSlice({
  name: 'counter',
  initialState: { count: 0 },
  reducers: {
    increment: state => { state.count += 1 }, // 内部使用 Immer，可"直接修改"
    decrement: state => { state.count -= 1 },
    incrementByAmount: (state, action) => { state.count += action.payload }
  }
})

export const { increment, decrement, incrementByAmount } = counterSlice.actions

const store = configureStore({ reducer: { counter: counterSlice.reducer } })

// 组件中使用（配合 react-redux）
import { useSelector, useDispatch } from 'react-redux'

function Counter() {
  const count = useSelector(state => state.counter.count)
  const dispatch = useDispatch()
  return (
    <>
      <p>{count}</p>
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={() => dispatch(decrement())}>-</button>
    </>
  )
}
```

**RTK vs 原始 Redux 对比：**

| 维度       | 原始 Redux                                    | Redux Toolkit               |
| ---------- | --------------------------------------------- | --------------------------- |
| 样板代码   | ❌ 多（action type / creator / reducer 分离） | ✅ 极少（createSlice 合一） |
| 不可变更新 | ❌ 需手写展开 `...state`                    | ✅ 内置 Immer，直接"修改"   |
| 异步处理   | 需安装 redux-thunk                            | ✅ 内置 createAsyncThunk    |
| 推荐程度   | 已过时                                        | ✅ 官方推荐                 |

---

## 架构原理篇

## Q: React Fiber 是什么？有什么用？

**A:**

**背景问题：React 16 之前的痛点**

React 16 之前使用**递归**对比虚拟 DOM 树（称为 reconcilation 协调），这个过程是**同步且不可中断的**。一旦开始，会一直占用主线程，导致：

- 页面卡顿（超过 16ms 则掉帧）
- 用户交互事件得不到及时响应

**Fiber 的解决方案**

Fiber 将渲染任务拆分为**可中断的执行单元**，每执行完一个单元，检查是否还有剩余时间（利用 `requestIdleCallback` 思想），没有时间则让出控制权，优先响应高优先级任务。

**Fiber 是什么？**

Fiber 同时是：

1. **一种数据结构**：每个 React 元素对应一个 Fiber 节点，构成单链表树
2. **一个执行单元**：每次调度执行最小的工作单位

每个 Fiber 节点的关键字段：

```js
FiberNode {
  type,           // 组件类型（string 原生标签 / function / class）
  stateNode,      // 真实 DOM 节点 或 组件实例
  child,          // 第一个子节点
  sibling,        // 下一个兄弟节点
  return,         // 父节点
  effectTag,      // 要执行的副作用标记（Placement / Update / Deletion）
  expirationTime, // 优先级 / 过期时间
}
```

**时间切片（Time Slicing）**

Fiber 把原来不可中断的递归树遍历，改造成**可中断的链表遍历**，利用浏览器每帧末尾的空闲时间执行，每片约 5ms：

```
每一帧（16.6ms @ 60fps）
├── 1. Input Events   阻塞型：touch/wheel；非阻塞型：click/keypress
├── 2. Timers         定时器回调
├── 3. Begin Frame    resize / scroll / media query change
├── 4. rAF            requestAnimationFrame 回调
├── 5. Layout         Recalculate Style + Update Layout
├── 6. Paint          Compositing / Paint invalidation / Record
└── 7. idle period  ← requestIdleCallback / Fiber 在此执行（有剩余时间才执行）
```

> ⚠️ **注意**：React 并未直接使用 `requestIdleCallback`（rIC 延迟不稳定，且不兼容 Safari），而是自己用 **`MessageChannel`** 模拟实现了调度器（scheduler）。

```js
// 伪代码示意
function workLoop(deadline) {
  while (nextUnitOfWork && deadline.timeRemaining() > 1) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork) // 处理一个 Fiber 节点
  }
  requestIdleCallback(workLoop) // 下一帧继续
}
```

**执行原理（两个阶段）：**

| 阶段     | 名称                  | 是否可中断  | 做什么                                                    |
| -------- | --------------------- | ----------- | --------------------------------------------------------- |
| 第一阶段 | render/reconciliation | ✅ 可中断   | 构建 workInProgress Fiber 树，标记所有变更（effect list） |
| 第二阶段 | commit                | ❌ 不可中断 | 将变更一次性同步提交到真实 DOM                            |

> ⚠️ **注意**：render 阶段可中断意味着其中的生命周期（如 `componentWillMount`）可能被**重复调用**，这也是 React 废弃这些"不安全生命周期"的根本原因。

**Fiber 如何把渲染树变成链表？**

原始 JSX 是一棵树，Fiber 用三个指针将其改造为可线性遍历的结构：

```
JSX 结构：
<App>
  <Header />
  <Main>
    <List />
    <Footer />
  </Main>
</App>
```

```
Fiber 节点指针图：

         ┌─────────────────────────────────────────────────┐
         │                    App                          │
         │              child ↓                            │
         └─────────────────────────────────────────────────┘
                             │
              ┌──────────────▼──────────────┐
              │           Header            │
              │      sibling ──────────────→┤
              └─────────────────────────────┘
                                            │
              ┌─────────────────────────────▼──┐
              │             Main               │
              │         child ↓   return ↑ App │
              └────────────────────────────────┘
                             │
              ┌──────────────▼──────────────┐
              │            List             │
              │  sibling ──────────────────→┤  return ↑ Main
              └─────────────────────────────┘
                                            │
              ┌─────────────────────────────▼──┐
              │            Footer              │
              │                   return ↑ Main│
              └────────────────────────────────┘
```

**遍历顺序（深度优先，用箭头标出走法）：**

```
步骤  当前节点   操作
 1    App      beginWork → 有 child，走 child
 2    Header   beginWork → 无 child，completeWork → 有 sibling，走 sibling
 3    Main     beginWork → 有 child，走 child
 4    List     beginWork → 无 child，completeWork → 有 sibling，走 sibling
 5    Footer   beginWork → 无 child，completeWork → 无 sibling，沿 return 回到 Main
 6    Main     completeWork → 无 sibling，沿 return 回到 App
 7    App      completeWork → 遍历结束 ✅
```

完整路径可以用一行表示：

```
App → Header → Main → List → Footer → Main(complete) → App(complete)
```

**为什么这样设计就能「中断」？**

递归版本的调用栈在 JS 引擎内部，无法暂停：

```
// ❌ 递归：一旦开始就必须跑完，中途无法停止
function render(node) {
  process(node)
  node.children.forEach(child => render(child)) // 栈帧藏在引擎里
}
```

Fiber 把"当前走到哪了"存在一个变量里，随时可以保存和恢复：

```js
// ✅ Fiber：执行权在自己手里，任意时刻可暂停
let nextUnitOfWork = App_fiber  // 记住"下一步走哪"

function workLoop(deadline) {
  while (nextUnitOfWork && deadline.timeRemaining() > 1) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    //                   ↑ 每次只处理一个节点，返回下一个节点
  }
  if (nextUnitOfWork) {
    // 时间不够了，但 nextUnitOfWork 还保存着，下一帧接着走
    requestIdleCallback(workLoop)
  }
}
```

> 核心就是：**把隐式调用栈（递归）变成显式指针（链表）**，让执行状态可以在任意节点暂停和恢复。

**为什么 Vue 没有 Fiber？**

Vue 是基于 **template + watcher** 的组件级更新，每次只更新变化的组件，任务颗粒度本身就足够小，不需要 Fiber 的任务切片机制。

React 的 `setState` 无论在哪里调用都从根节点开始更新，任务量大，需要 Fiber 来分片调度。

**Fiber 和 Vue 的 VNode 是一回事吗？**

可以粗略类比，但 Fiber 承担的职责远比 VNode 多：

| | React Fiber | Vue VNode |
|--|--|--|
| 本质 | JS 对象，描述组件信息 | JS 对象，描述节点信息 |
| 用于 diff | ✅ | ✅ |
| 存储组件运行时状态（hooks、state） | ✅ | ❌ |
| 存储调度信息（优先级、过期时间） | ✅ | ❌ |
| 数据结构 | **链表**（可中断遍历） | **树**（递归遍历） |

VNode 是纯粹的"描述快照"，只记录节点长什么样；Fiber 除此之外还把组件的所有 hooks 作为链表挂在节点上，并记录调度状态：

```js
// Vue VNode —— 只描述长什么样
{ type: 'div', props: { class: 'foo' }, children: [...] }

// React Fiber —— 描述 + 运行时状态 + 调度信息
{
  type: MyComponent,
  memoizedState,    // hooks 链表挂在这（useState/useEffect 都在这）
  memoizedProps,
  child / sibling / return,  // 链表指针
  flags,            // 标记需要做什么操作（插入/更新/删除）
  lanes,            // 优先级
}
```

> 一句话：**Fiber ≈ VNode 的功能 + 组件运行时状态（hooks）+ 调度信息 + 可中断的链表结构**。

---

## Q: React 18 和之前版本有哪些主要区别？

**A:**

| 特性               | React 17 及以前               | React 18                                                                     |
| ------------------ | ----------------------------- | ---------------------------------------------------------------------------- |
| **批量更新** | 仅在合成事件/生命周期中批处理 | **全场景自动批处理**                                                   |
| **并发模式** | 实验性                        | 正式发布（`createRoot` 启用）                                              |
| **Suspense** | 仅支持懒加载                  | 支持数据获取（配合 RSC）                                                     |
| **新 Hooks** |                               | `useId`、`useTransition`、`useDeferredValue`、`useSyncExternalStore` |
| **根 API**   | `ReactDOM.render()`         | `ReactDOM.createRoot()`                                                    |

**关键变化详解：**

**1. 并发模式（Concurrent Mode）**

```js
// React 18 启用并发模式
import { createRoot } from 'react-dom/client'
const root = createRoot(document.getElementById('root'))
root.render(<App />)
```

**2. `useTransition`  区分紧急/非紧急更新**

```js
const [isPending, startTransition] = useTransition()

startTransition(() => {
  // 非紧急更新（如搜索过滤），可被打断
  setFilteredList(heavyFilter(input))
})
```

**3. `useDeferredValue`  延迟非紧急值**

```js
const deferredValue = useDeferredValue(inputValue)
// deferredValue 会在空闲时才更新，避免主线程被占用
```

---

## Q: React 并发模式下，高优先级更新如何打断低优先级渲染？

**A:**

这是 React 18 并发渲染的核心机制：高优先级任务（如用户输入）会**打断**当前正在进行的低优先级渲染，等高优先级任务完成后，低优先级任务**从头重做**，而不是从断点续上。

**核心机制拆解：**

**1. Lanes 优先级模型**

React 为不同来源的更新分配不同"车道"，优先级从高到低：

| Lane | 场景 | 优先级 |
| :--- | :--- | :--- |
| `SyncLane` | 用户输入、受控组件 | 最高，同步执行 |
| `InputContinuousLane` | 连续输入（拖拽、滚动） | 高 |
| `DefaultLane` | 普通 setState | 中 |
| `TransitionLane` | `startTransition` 包裹的更新 | 低，可被打断 |

**2. 可中断的工作循环**

```js
// 并发模式工作循环（简化）
function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress) // 每处理一个 Fiber 节点都检查
  }
}
```

每处理完一个 Fiber 节点，`shouldYield()` 都会检查是否有更高优先级任务或帧时间已用尽。一旦返回 `true`，循环立即退出。

**3. 中断 → 重做，而不是续上**

```
时间轴 ─────────────────────────────────────────────►

低优先级渲染（TransitionLane）：
  [A✓][B✓][C...] ← shouldYield() = true，停！
               ↓
       ✗ 旧 WIP 树作废（B 是用旧 state 算的，不能用）

高优先级渲染（SyncLane，用户输入）：
               [A'][B'][C'][D'] ← 基于最新 state 完整跑一遍
                              ↓ Commit → DOM 更新

低优先级任务重新调度：
                              [从头开始，合并最新 state 重跑]
```

**为什么不能从断点续上？**

被打断时，已处理完的节点（如 B）是基于**旧 state** 计算的。新的高优先级更新改变了 state，如果继续跑剩余节点，就会出现树中有的节点用新 state、有的用旧 state 的**新旧混用**问题，导致 UI 不一致。唯一安全的做法是丢弃旧 WIP 树，从头重算。

**这也是为什么渲染函数必须是纯函数：**

> ⚠️ **注意**：并发模式下，组件函数**可能被多次执行，结果也可能被丢弃**。如果渲染函数有副作用（直接写 DOM、发请求），就会因重复执行产生 bug。这不是最佳实践，而是并发模式的**硬性约束**。

**`startTransition` 的本质：**

`startTransition` 就是把更新标记为 `TransitionLane`（低优先级），让用户输入随时可以打断它。被打断的渲染会被丢弃并重来，这正是"不阻塞输入"效果的底层实现。

```js
const [isPending, startTransition] = useTransition()

startTransition(() => {
  // 标记为低优先级，可被用户输入打断
  setFilteredList(heavyFilter(input))
})
```

**4. 状态跳变现象**

由于低优先级任务会被完全重做，你可能观察到状态从 `0` 直接跳到 `2`，而不是经过 `1`——因为将状态置为 `1` 的那次低优先级渲染已被作废，最终渲染时合并了所有挂起的更新。

---

## Q: React diff 算法的原理是什么？

**A:**

React 在组件更新时会产生新的虚拟 DOM，diff 算法负责**计算新旧虚拟 DOM 树之间的最小差异**，以最低代价更新真实 DOM。

传统 tree diff 时间复杂度 O(n³)，React 通过三个策略将其降至 **O(n)**：

**策略 1：同层比较（Tree Diff）**

只对比同一层级的节点，不跨层级比较。若节点跨层级移动，React 直接销毁旧节点并在新位置创建新节点。

**策略 2：组件类型判断（Component Diff）**

- 同类型组件 → 复用组件实例，递归对比子树
- 不同类型组件 → 直接销毁旧组件树，创建新组件

**策略 3：Key 标识（Element Diff）**

同层同类型的**列表节点**通过 `key` 识别唯一性，实现节点的高效复用和最少移动。

**整体流程：**

```
新旧虚拟 DOM 对比 → 产生 effect list（变更集合）→ commit 阶段统一更新到真实 DOM
```

---

## Q: React 中 key 的作用是什么？用来解决哪类问题？

**A:**

`key` 是 React 渲染列表时用于**识别节点唯一身份**的特殊属性，帮助 diff 算法在同层节点间快速找到对应关系，从而实现节点复用。

**核心作用：**

1. **减少不必要的 DOM 操作** — 通过 key 复用已有节点，避免全量重建
2. **维持组件状态** — 相同 key 的组件视为同一实例，内部 state 得以保留
3. **强制重置组件** — 主动修改 key 可强制销毁并重新创建组件

```jsx
// ❌ 用 index 作 key：插入/删除元素时引发错误复用
{list.map((item, index) => <Item key={index} data={item} />)}

// ✅ 用稳定唯一 ID 作 key
{list.map(item => <Item key={item.id} data={item} />)}
```

**用 index 作 key 的危害：**

当列表发生插入/删除/重排时，index 与节点的映射关系错乱，导致：

- 表单输入值与数据错位
- 动画/过渡效果异常
- 性能下降（diff 需要大量 DOM 操作）

> ⚠️ **注意**：只有在列表**顺序不变**且元素**无内部状态**时，才可以用 index 作 key。

---

## Q: React 和 Vue 的 diff 算法有何不同？

**A:**

两者核心思想相同（同层比较），但在具体策略和底层机制上有明显差异：

| 维度         | React                       | Vue 2                  | Vue 3                        |
| ------------ | --------------------------- | ---------------------- | ---------------------------- |
| 遍历方向     | 从左到右单向遍历            | 双端比较（首尾四指针） | 双端 + 最长递增子序列（LIS） |
| 节点移动优化 | key + 顺序映射              | 头尾交叉比较           | LIS 找到不需移动的节点集合   |
| 调度机制     | Fiber 可中断调度            | 同步更新               | 同步更新                     |
| 更新粒度     | 默认从根组件向下整棵树 diff | 组件级粒度             | 组件级粒度（编译时静态提升） |

**Vue 3 LIS 算法优势：**

Vue 3 通过计算**最长递增子序列**，找出无需移动的节点集合，只移动剩余节点，将 DOM 移动次数降到最低。

**为何 React 需要 Fiber 而 Vue 不需要：**

React 的 `setState` 没有精确的依赖追踪，无论哪里触发更新都要从根组件开始向下 diff，任务量大；Vue 的响应式系统在组件级别精确收集依赖，天然支持细粒度更新，任务本身量级小，不需要 Fiber 来切片调度。

---

## 路由篇

## Q: React Router 有几种模式？实现原理是什么？

**A:**

React Router 主要支持两种路由模式：

**1. BrowserRouter（History 模式）**

- 依赖 HTML5 History API（`pushState`、`replaceState`、`popstate` 事件）
- URL 格式：`http://example.com/path`
- ✅ URL 简洁，SEO 友好
- ❌ 需要服务器配置（直接访问子路径需服务端返回 `index.html`）

```jsx
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/about" component={About} />
        <Route path="/" component={Home} />
      </Switch>
    </Router>
  )
}
```

**2. HashRouter（Hash 模式）**

- 利用 URL 中 `#` 后的 hash 部分，监听 `hashchange` 事件
- URL 格式：`http://example.com/#/path`
- ✅ 兼容性好，无需服务器配置
- ❌ URL 不美观，SEO 不友好

**对比：**

| 特性       | BrowserRouter | HashRouter        |
| ---------- | ------------- | ----------------- |
| URL 格式   | `/path`     | `/#/path`       |
| 依赖 API   | History API   | URL hash          |
| 服务器配置 | 需要          | 不需要            |
| SEO        | ✅ 友好       | ❌ 不友好         |
| 兼容性     | 现代浏览器    | 所有浏览器        |
| 适用场景   | 现代 Web 应用 | 静态部署/旧浏览器 |

---

## Q: React Router v6 相比 v5 有哪些核心变化？

**A:**

**1. `Switch` → `Routes`，`component` → `element`**

```jsx
// v5
<Switch>
  <Route path="/about" component={About} />
  <Route exact path="/" component={Home} />
</Switch>

// v6（Routes 自动精确匹配，不再需要 exact）
<Routes>
  <Route path="/about" element={<About />} />
  <Route path="/" element={<Home />} />
</Routes>
```

**2. 嵌套路由：`<Outlet>` 替代手动嵌套**

```jsx
// v6 嵌套路由
<Routes>
  <Route path="/dashboard" element={<Dashboard />}>
    <Route path="stats" element={<Stats />} />     {/* /dashboard/stats */}
    <Route path="profile" element={<Profile />} /> {/* /dashboard/profile */}
  </Route>
</Routes>

// Dashboard 组件中用 Outlet 声明子路由渲染位置
function Dashboard() {
  return (
    <div>
      <nav>...</nav>
      <Outlet /> {/* 子路由在此渲染 */}
    </div>
  )
}
```

**3. hooks 替代高阶组件**

```jsx
// v5：withRouter HOC 注入路由 props
const MyComp = withRouter(({ history, location }) => ...)

// v6：直接使用 hooks（函数组件专用）
function MyComp() {
  const navigate = useNavigate()     // 替代 history.push
  const location = useLocation()
  const params = useParams()
  const [searchParams] = useSearchParams()
}
```

**4. 编程式导航 `useNavigate` 替代 `useHistory`**

```jsx
// v5
const history = useHistory()
history.push('/home')
history.goBack()

// v6
const navigate = useNavigate()
navigate('/home')
navigate(-1)           // 后退
navigate('/home', { replace: true }) // replace
```

**主要变化汇总：**

| 变化点       | v5                     | v6                      |
| ------------ | ---------------------- | ----------------------- |
| 路由容器     | `<Switch>`           | `<Routes>`            |
| 路由组件传入 | `component={Comp}`   | `element={<Comp />}`  |
| 精确匹配     | 需要 `exact`         | 默认精确                |
| 嵌套路由     | 组件内再写 `<Route>` | `<Outlet>`            |
| 编程导航     | `useHistory()`       | `useNavigate()`       |
| 路由参数     | `useParams()`        | `useParams()`（不变） |

---

## 高阶组件篇

## Q: 什么是高阶组件（HOC）？有哪些使用场景？

**A:**

::: tip 定义
**高阶组件（HOC）是参数为组件、返回值为新组件的函数。**

HOC 不是 React API，而是基于 React 组合特性形成的设计模式，用于复用组件逻辑。
:::

**核心用途：**

| 用途       | 说明                               |
| ---------- | ---------------------------------- |
| 复用逻辑   | 将公共逻辑抽离到 HOC，多个组件共用 |
| 强化 props | 劫持并混入新的 props               |
| 赋能组件   | 为组件注入额外生命周期、事件等能力 |
| 控制渲染   | 条件渲染、节流渲染、懒加载等       |

**两种实现方式：**

** 正向属性代理**（最常用）

```jsx
function withLogger(WrapComponent) {
  return class Advance extends React.Component {
    state = { name: 'HOC 注入的数据' }

    render() {
      return <WrapComponent {...this.props} {...this.state} />
    }
  }
}
```

代理组件先于业务组件 mount，在 fiber tree 中处于父节点位置。

** 反向组件继承**

```jsx
class Index extends React.Component {
  render() {
    return <div>hello,world</div>
  }
}

function HOC(Component) {
  return class WrapComponent extends Component {
    // 继承业务组件，可以访问业务组件的 state/生命周期
  }
}

export default HOC(Index)
```

**实战示例：控制渲染（性能优化）**

```jsx
function HOC(Component) {
  return function RenderWrapComponent(props) {
    const { num } = props
    // 仅当 num 变化时重新渲染 Component
    const RenderElement = useMemo(() => <Component {...props} />, [num])
    return RenderElement
  }
}
```

**实战示例：劫持生命周期**

```jsx
function withLifecycle(Component) {
  const originDidMount = Component.prototype.componentDidMount
  Component.prototype.componentDidMount = function () {
    console.log('HOC 劫持：componentDidMount')
    originDidMount && originDidMount.call(this)
  }
  return class extends React.Component {
    render() {
      return <Component {...this.props} />
    }
  }
}
```

**实战示例：事件注入**

```jsx
function withClickLog(Component) {
  return function Wrap(props) {
    const dom = useRef(null)
    useEffect(() => {
      const handler = () => console.log('发生点击事件')
      dom.current.addEventListener('click', handler)
      return () => dom.current.removeEventListener('click', handler)
    }, [])
    return <div ref={dom}><Component {...props} /></div>
  }
}
```

**HOC vs 自定义 Hooks（现代 React 中的取舍）：**

| 维度       | HOC                   | 自定义 Hook  |
| ---------- | --------------------- | ------------ |
| 逻辑复用   | ✅ 可以               | ✅ 更优雅    |
| 嵌套层级   | ❌ 容易产生"包裹地狱" | ✅ 扁平      |
| Props 冲突 | ❌ 需手动规避         | ✅ 无此问题  |
| 适用场景   | 需要渲染层面增强时    | 纯逻辑复用时 |

> 📖 推荐：[「react进阶」一文吃透React高阶组件(HOC)](https://juejin.cn/post/6940422320427106335)

---

## Q: React.PureComponent 是什么？与 React.memo 有何区别？

**A:**

**`React.PureComponent`** 是类组件的优化版本，内置了 `shouldComponentUpdate`，通过**浅比较** props 和 state 决定是否跳过重新渲染，当两者均无变化时跳过 `render()`。

```jsx
class MyComponent extends React.PureComponent {
  render() {
    return <div>{this.props.name}</div>
  }
}
// 等价于在普通 Component 中手动实现：
shouldComponentUpdate(nextProps, nextState) {
  return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState)
}
```

**与 `React.memo` 对比：**

| 维度     | `PureComponent`    | `React.memo`                 |
| -------- | -------------------- | ------------------------------ |
| 适用范围 | 类组件               | 函数组件                       |
| 比较内容 | props + state        | 仅 props                       |
| 比较方式 | 浅比较（不可自定义） | 浅比较（可传第二个参数自定义） |
| 现代推荐 | ❌ 类组件逐渐淘汰    | ✅ 函数组件首选                |

> ⚠️ **注意**：浅比较无法感知深层数据变化。当 state 包含嵌套对象时，必须返回新对象引用（不能直接 `mutate`），否则 PureComponent 会错误地跳过更新。

---

## 性能优化篇

## Q: React 应用有哪些常见的性能优化手段？

**A:**

**一、避免不必要的重新渲染**

| 手段                      | 说明                                             |
| ------------------------- | ------------------------------------------------ |
| `React.memo`            | 对函数组件 props 做浅比较，未变化则跳过渲染      |
| `useMemo`               | 缓存计算结果，避免每次渲染重复计算               |
| `useCallback`           | 缓存函数引用，避免传给子组件的函数每次都是新引用 |
| `PureComponent`         | 类组件的 memo 等价方案                           |
| `shouldComponentUpdate` | 手动控制类组件是否更新                           |

```jsx
// 典型组合：父组件缓存函数 + 子组件 memo
const Parent = () => {
  const [count, setCount] = useState(0)
  const [name, setName] = useState('')

  // ✅ useCallback 缓存，name 不变时引用不变
  const handleClick = useCallback(() => {
    console.log('clicked')
  }, []) // 无依赖，永远是同一引用

  return (
    <>
      <input value={name} onChange={e => setName(e.target.value)} />
      <HeavyChild onClick={handleClick} /> {/* name 变化时不会重渲 */}
    </>
  )
}

const HeavyChild = React.memo(({ onClick }) => {
  console.log('HeavyChild render')
  return <button onClick={onClick}>点击</button>
})
```

**二、代码分割与懒加载**

```jsx
// 路由级别懒加载（最常见）
const Home = React.lazy(() => import('./pages/Home'))
const About = React.lazy(() => import('./pages/About'))

function App() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Suspense>
  )
}
```

**三、列表优化**

- **虚拟列表**：只渲染可视区域的列表项（`react-window` / `react-virtual`），避免大列表 DOM 节点过多
- **分页/无限滚动**：控制单次渲染数据量

```jsx
import { FixedSizeList } from 'react-window'

function VirtualList({ data }) {
  return (
    <FixedSizeList height={400} itemCount={data.length} itemSize={50}>
      {({ index, style }) => (
        <div style={style}>{data[index].name}</div>
      )}
    </FixedSizeList>
  )
}
```

**四、并发特性（React 18）**

```jsx
// useTransition：标记非紧急更新，让紧急更新（如输入）优先
const [isPending, startTransition] = useTransition()

const handleInput = (e) => {
  setInput(e.target.value)                  // 紧急：立即更新输入框
  startTransition(() => {
    setFilteredList(heavyFilter(e.target.value)) // 非紧急：可被打断
  })
}
```

**五、其他通用优化**

- **避免在 JSX 中创建匿名函数**（会造成 memo 失效）：将函数提到组件外或用 `useCallback`
- **Context 拆分**：按更新频率拆分多个 Context，减少无效重渲
- **图片懒加载**：`loading="lazy"` 或 Intersection Observer
- **web worker**：将 CPU 密集型计算移到 worker，不阻塞主线程

---

## Q: React 的渲染行为完整机制是什么？（渲染触发 → Commit 全流程）

**A:**

React 渲染分为两个阶段：

| 阶段                  | 说明                                                                                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Render 阶段** | React 调用组件函数（或 `render()`），生成新的虚拟 DOM，通过 Fiber diff 找出需要变更的节点。此阶段**纯计算，不修改 DOM**，可被打断（并发模式）。 |
| **Commit 阶段** | 将 Render 阶段产生的变更一次性同步应用到真实 DOM，**不可中断**，随后触发 `useLayoutEffect` / `componentDidMount` / `componentDidUpdate`。   |

**触发重新渲染的条件：**

- `setState` / `useState` 的 setter 被调用（即使值相同，默认也会触发）
- 父组件重新渲染 → 子组件默认跟着渲染（除非用 `React.memo` 阻止）
- `Context` 值变化 → 所有消费该 Context 的组件重新渲染
- `forceUpdate()`（类组件）

**常见误区：**

> ⚠️ **注意**：「重新渲染」≠「DOM 真的发生了变化」。Render 阶段只是 React 在内存中调用组件函数，Commit 阶段才会比对差异真正修改 DOM。过度渲染消耗的是 JS 执行时间，而非一定会产生 DOM 操作。

**渲染优化核心原则：**

1. 用 `React.memo` / `useMemo` / `useCallback` 打断不必要的渲染链
2. 将频繁变化的 state 下移到最近的需要它的子组件
3. Context 按更新频率拆分，避免整棵子树重渲

> 📖 **延伸阅读**：[A (Mostly) Complete Guide to React Rendering Behavior](https://blog.isquaredsoftware.com/2020/05/blogged-answers-a-mostly-complete-guide-to-react-rendering-behavior/) — Redux 维护者 Mark Erikson 对 React 渲染行为的完整深度解析，强烈推荐。

---

## 错误处理篇

## Q: 什么是错误边界（Error Boundary）？如何使用？

**A:**

**错误边界**是一种 React 类组件，能够捕获其**子组件树**在渲染、生命周期或构造函数中抛出的 JavaScript 错误，防止整个应用崩溃，并渲染降级 UI。

**实现方式（必须用类组件）：**

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  // 静态方法：捕获到错误时更新 state，触发降级渲染
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  // 实例方法：用于记录错误日志（上报到监控系统）
  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo)
    // reportErrorToMonitor(error, errorInfo) // 上报
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <h2>出了一些问题，请刷新重试。</h2>
    }
    return this.props.children
  }
}

// 使用
function App() {
  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      <Header />
      <ErrorBoundary fallback={<p>侧边栏加载失败</p>}>
        <Sidebar />
      </ErrorBoundary>
      <Main />
    </ErrorBoundary>
  )
}
```

**错误边界的局限（以下情况无法捕获）：**

| 无法捕获的场景                      | 原因                                  |
| ----------------------------------- | ------------------------------------- |
| 事件处理函数中的错误                | 不在渲染链路上，用 `try/catch` 处理 |
| 异步代码（`setTimeout`、Promise） | 已脱离同步渲染上下文                  |
| 服务端渲染（SSR）中的错误           | ErrorBoundary 仅在客户端工作          |
| 错误边界自身的错误                  | 需要上层的 ErrorBoundary              |

> ⚠️ **注意**：React 18 后，没有被错误边界包裹的渲染错误会导致整个应用卸载。因此建议在根组件和关键功能模块都添加错误边界。

---

## Q: React.lazy 和 Suspense 是什么？如何实现代码分割？

**A:**

**`React.lazy`** 允许延迟加载组件，只有当组件第一次被渲染时才动态导入对应代码包。**`Suspense`** 用于在懒加载组件尚未就绪时展示 fallback 内容。

**基本用法：**

```jsx
import React, { Suspense, lazy } from 'react'

// lazy 接收一个返回 Promise 的函数，Promise 需 resolve 一个含 default export 的模块
const LazyComponent = lazy(() => import('./LazyComponent'))

function App() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <LazyComponent />
    </Suspense>
  )
}
```

**路由级代码分割（最常见实践）：**

```jsx
const Home    = lazy(() => import('./pages/Home'))
const About   = lazy(() => import('./pages/About'))
const Profile = lazy(() => import('./pages/Profile'))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/"        element={<Home />} />
          <Route path="/about"   element={<About />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
```

**原理：**

`React.lazy` + 动态 `import()` 会让打包工具（Webpack/Vite）将该组件**拆分为独立 chunk**，首屏只加载当前路由需要的 JS，其余按需加载。

**与错误边界配合（生产必备）：**

```jsx
function App() {
  return (
    <ErrorBoundary fallback={<p>页面加载失败，请刷新重试</p>}>
      <Suspense fallback={<Loading />}>
        <LazyPage />
      </Suspense>
    </ErrorBoundary>
  )
}
```

> ⚠️ **注意**：`React.lazy` 目前只支持**默认导出**（`default export`）。如果需要命名导出，需要创建中间模块转换或使用 `lazy(() => import('./Comp').then(m => ({ default: m.NamedExport })))`。

---

## React高级用法篇

## Q: React 严格模式（StrictMode）是什么？有什么作用？

**A:**

**StrictMode** 是 React 内置的一个开发辅助工具组件，用于在开发环境中发现应用潜在问题。它本身不渲染任何可见 UI，也不会影响子组件的渲染结果。

**使用方式：**

可以将整个应用或局部组件树包裹在 `<React.StrictMode>` 中：

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'

// 整个应用启用严格模式
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

也可以只对部分组件树启用：

```jsx
function App() {
  return (
    <div>
      <Header /> {/* 不启用严格模式 */}
      <React.StrictMode>
        <Main /> {/* 仅 Main 及其子树启用严格模式 */}
      </React.StrictMode>
    </div>
  )
}
```

**核心作用：**

| 作用                 | 说明                                        |
| -------------------- | ------------------------------------------- |
| 识别不安全的生命周期 | 检测正在使用的 `UNSAFE_` 系列生命周期方法 |
| 检测副作用           | 故意调用渲染函数两次，暴露不纯的渲染逻辑    |
| 检测废弃 API         | 警告已废弃的 API 用法（如 `findDOMNode`） |
| 检测 ref 用法        | 警告字符串 ref 的使用（已废弃）             |
| 检测旧版 Context     | 发现旧版 Context API 的使用                 |

> ⚠️ **注意**：StrictMode 对功能没有任何影响，仅用于开发阶段辅助发现问题。React 官方推荐所有新项目默认开启。

---

## Q: StrictMode 会影响生产环境吗？

**A:**

**不会**。StrictMode 仅在**开发环境**下生效，在生产构建（`NODE_ENV=production`）中会被 React 自动跳过，不产生任何额外行为。

| 环境                        | StrictMode 行为                         |
| --------------------------- | --------------------------------------- |
| 开发环境（`development`） | ✅ 开启额外检测：双重渲染、控制台警告等 |
| 生产环境（`production`）  | ❌ 完全透明，与普通 Fragment 等价       |

**因此：**

- 不必担心开启 StrictMode 后影响生产性能
- React 官方推荐**所有新项目默认开启** StrictMode
- `create-react-app`、Next.js 等脚手架默认在根组件包裹了 StrictMode

```jsx
// StrictMode 在生产环境等价于：
<React.Fragment>
  <App />
</React.Fragment>
```

---

## Q: 严格模式下组件会被渲染几次？为什么？

**A:**

在严格模式（开发环境）下，React 会对组件**额外渲染一次（共渲染两次）**。

**受影响的调用：**

| 调用                                 | 执行次数 |
| ------------------------------------ | -------- |
| 函数组件的渲染函数体                 | ×2      |
| `useState` 的初始化函数            | ×2      |
| `useMemo` / `useCallback` 的回调 | ×2      |
| `useReducer` 的 reducer 函数       | ×2      |
| 类组件的 `render()` 方法           | ×2      |
| 类组件的 `constructor`             | ×2      |
| `getDerivedStateFromProps`         | ×2      |

**为什么要渲染两次？**

React 的**纯函数渲染原则**要求：相同输入（props/state）必须产生相同输出。双重渲染用于验证这一原则——如果两次渲染结果不一致，说明渲染函数存在**副作用**（不纯）。

```jsx
// ❌ 不纯的渲染 - 严格模式下会暴露问题
let count = 0
function BadComponent() {
  count++ // 修改了外部变量，渲染不纯！
  return <div>{count}</div>
}

// ✅ 纯函数渲染 - 相同输入产生相同输出
function GoodComponent({ count }) {
  return <div>{count}</div>
}
```

**React 18 新增：`useEffect` 双调用**

React 18 的严格模式会对 `useEffect` 进行额外的**挂载 → 卸载 → 再挂载**循环，模拟组件被复用的场景（为未来的 Offscreen API 做准备）：

```jsx
// React 18 StrictMode 下 useEffect 的调用顺序：
// 1. 挂载 → effect 执行
// 2. 卸载 → cleanup 执行
// 3. 再次挂载 → effect 再次执行

useEffect(() => {
  console.log('mount') // 会打印两次
  return () => {
    console.log('unmount') // 会打印一次（在第二次 mount 之前）
  }
}, [])
```

> ⚠️ **注意**：双重渲染在控制台不会显示重复日志（React 会抑制第二次渲染的输出），但 effect 双调用的日志是可见的。这意味着清理函数必须正确编写，否则会暴露出 bug。

---

## Q: 使用严格模式会发现哪些潜在问题？

**A:**

严格模式可以帮助检测以下类型的潜在问题：

**1. 不安全的生命周期方法**

以下已标记为不安全的生命周期方法在严格模式下会触发警告：

```jsx
// ❌ 这些方法会收到控制台警告
componentWillMount()          // → 改用 componentDidMount
componentWillReceiveProps()   // → 改用 getDerivedStateFromProps
componentWillUpdate()         // → 改用 getSnapshotBeforeUpdate
```

**2. 旧版字符串 ref**

```jsx
// ❌ 字符串 ref 已废弃，StrictMode 下会警告
class MyComponent extends React.Component {
  render() {
    return <div ref="myRef" /> // ⚠️ 不推荐
  }
}

// ✅ 改用 createRef 或 useRef
class MyComponent extends React.Component {
  myRef = React.createRef()
  render() {
    return <div ref={this.myRef} />
  }
}
```

**3. 废弃的 `findDOMNode` 用法**

```jsx
// ❌ findDOMNode 已废弃
ReactDOM.findDOMNode(this)

// ✅ 改用 ref
const ref = useRef(null)
return <div ref={ref} />
```

**4. 不纯的渲染函数（副作用）**

通过双重渲染机制发现渲染中的副作用：

```jsx
// ❌ 渲染函数中有副作用 - 严格模式会暴露
function BadComponent() {
  someExternalArray.push('item') // 渲染中修改了外部状态！
  return <div>{someExternalArray.length}</div>
}
```

**5. Effect 清理不完整**

React 18 StrictMode 会额外执行一次 effect 挂载-卸载-再挂载，暴露清理函数不完整的问题：

```jsx
// ❌ 缺少清理 - 可能导致内存泄漏或重复订阅
useEffect(() => {
  window.addEventListener('resize', handleResize)
  // 没有 return cleanup！
}, [])

// ✅ 正确写法
useEffect(() => {
  window.addEventListener('resize', handleResize)
  return () => {
    window.removeEventListener('resize', handleResize)
  }
}, [])
```

**6. 旧版 Context API**

```jsx
// ❌ 旧版 Context API 已废弃，StrictMode 下会警告
childContextTypes / getChildContext()

// ✅ 改用新版 React.createContext
const MyContext = React.createContext(defaultValue)
```

**问题类型汇总：**

| 问题类型        | 检测方式         | 修复建议                        |
| --------------- | ---------------- | ------------------------------- |
| 不安全生命周期  | 控制台警告       | 迁移到安全替代方法              |
| 字符串 ref      | 控制台警告       | 改用 `createRef` / `useRef` |
| `findDOMNode` | 控制台警告       | 改用 ref                        |
| 不纯渲染        | 双重渲染不一致   | 确保渲染函数无副作用            |
| Effect 未清理   | 双重 effect 调用 | 添加完整的 cleanup 函数         |
| 旧版 Context    | 控制台警告       | 迁移到新 Context API            |

---
