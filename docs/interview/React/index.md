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
// 适合状态逻辑复杂、多个子值或下一状态依赖前一状态的场景
```

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

1. **一种数据结构**：每个 React 元素对应一个 Fiber 节点，构成单链表树（每个节点有 `child`、`sibling`、`return` 属性）
2. **一个执行单元**：每次调度执行最小的工作单位

**执行原理（两个阶段）：**

| 阶段     | 名称                  | 特点                                                                        |
| -------- | --------------------- | --------------------------------------------------------------------------- |
| 第一阶段 | render/reconciliation | **可中断**，构建 workInProgress Fiber 树，找出所有变更（effect list） |
| 第二阶段 | commit                | **不可中断**，将所有变更同步更新到真实 DOM                            |

**为什么 Vue 没有 Fiber？**

Vue 是基于 **template + watcher** 的组件级更新，每次只更新变化的组件，任务颗粒度本身就足够小，不需要 Fiber 的任务切片机制。

React 的 `setState` 无论在哪里调用都从根节点开始更新，任务量大，需要 Fiber 来分片调度。

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

什么是严格模式？

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
