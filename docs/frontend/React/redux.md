# Redux 完全指南

> 覆盖 Redux 从入门到工程实践的全部知识点：核心概念、API 原理、中间件机制、Redux Toolkit、react-redux、异步方案、状态设计、选型对比。

---

## 目录

- [基础概念篇](#基础概念篇)
  - [Q: Redux 是什么？解决了什么问题？](#q-redux-是什么解决了什么问题)
  - [Q: Redux 核心概念有哪些？](#q-redux-核心概念有哪些)
  - [Q: Action 和 Action Creator 是什么？](#q-action-和-action-creator-是什么)
  - [Q: Reducer 是什么？有什么约束？](#q-reducer-是什么有什么约束)
  - [Q: combineReducers 是什么？如何拆分 Reducer？](#q-combinereducers-是什么如何拆分-reducer)
- [Redux 整体链路图（纯 Markdown 版）](#redux-整体链路图纯-markdown-版)
- [核心 API 篇](#核心-api-篇)
  - [Q: createStore 内部是如何实现的？](#q-createstore-内部是如何实现的)
  - [Q: compose 函数是什么？有什么用？](#q-compose-函数是什么有什么用)
- [中间件篇](#中间件篇)
  - [Q: Redux 中间件的实现原理是什么？](#q-redux-中间件的实现原理是什么)
  - [Q: redux-thunk 是什么？如何实现异步 action？](#q-redux-thunk-是什么如何实现异步-action)
  - [Q: redux-saga 是什么？与 redux-thunk 有何区别？](#q-redux-saga-是什么与-redux-thunk-有何区别)
- [react-redux 篇](#react-redux-篇)
  - [Q: react-redux 如何连接 React 和 Redux？](#q-react-redux-如何连接-react-和-redux)
  - [Q: useSelector 的性能注意事项有哪些？](#q-useselector-的性能注意事项有哪些)
- [Redux Toolkit 篇](#redux-toolkit-篇)
  - [Q: Redux Toolkit（RTK）是什么？核心 API 有哪些？](#q-redux-toolkitrtk-是什么核心-api-有哪些)
  - [Q: createSlice 是如何工作的？](#q-createslice-是如何工作的)
  - [Q: configureStore 与 createStore 有何区别？](#q-configurestore-与-createstore-有何区别)
  - [Q: RTK Query 是什么？](#q-rtk-query-是什么)
- [状态设计篇](#状态设计篇)
  - [Q: Redux 如何实现多个组件之间的通信？](#q-redux-如何实现多个组件之间的通信)
  - [Q: Redux 状态该如何设计？哪些状态适合放 Redux？](#q-redux-状态该如何设计哪些状态适合放-redux)
- [选型对比篇](#选型对比篇)
  - [Q: Redux vs Context vs Zustand vs Jotai 如何选择？](#q-redux-vs-context-vs-zustand-vs-jotai-如何选择)
  - [Q: Zustand 相比 Redux 有哪些优势？](#q-zustand-相比-redux-有哪些优势)
- [🎤 面试回答完整版（10分版）](#-面试回答完整版10分版)

---

## 基础概念篇

## Q: Redux 是什么？解决了什么问题？

**A:**

**Redux** 是一个用于 JavaScript 应用的**可预测状态管理库**，核心思想来源于 Flux 架构与函数式编程（Elm 语言影响）。

**解决的核心问题：**

| 问题                             | Redux 的解法                                    |
| -------------------------------- | ----------------------------------------------- |
| 组件层级深，props 传递繁琐       | 全局单一 Store，任意组件直接订阅                 |
| 状态变更难以追踪，调试困难       | 所有变更必须通过 Action，变更轨迹可回溯          |
| 多个组件共享同一状态时容易混乱   | 状态集中管理，单向数据流保证可预测性             |
| 异步操作与状态更新耦合复杂       | 中间件机制（Thunk/Saga）统一处理副作用           |

**Redux 三大原则：**

1. **单一数据源（Single Source of Truth）**：整个应用的 state 存储在唯一一棵对象树中
2. **State 只读（State is Read-Only）**：唯一改变 state 的方式是触发 Action
3. **纯函数更新（Changes with Pure Functions）**：Reducer 必须是纯函数，相同输入始终得到相同输出

---

## Q: Redux 核心概念有哪些？

**A:**

| 概念           | 说明                                                                   |
| -------------- | ---------------------------------------------------------------------- |
| **Store**      | 整个应用唯一的状态容器，由 `createStore(reducer)` 创建                |
| **State**      | 存储在 Store 中的状态数据，只读                                        |
| **Action**     | 描述"发生了什么"的普通对象，必须包含 `type` 字段                      |
| **Action Creator** | 返回 Action 对象的工厂函数，简化 Action 构造                      |
| **Reducer**    | 纯函数 `(prevState, action) => newState`，定义状态如何变化            |
| **Dispatch**   | `store.dispatch(action)`，触发状态变更的唯一方式                      |
| **Subscribe**  | `store.subscribe(listener)`，监听 state 变化                          |
| **Selector**   | 从 state 中派生数据的函数，通常配合 Reselect 做缓存                   |

**完整数据流：**

```
用户操作
  ↓
dispatch(action)           // 派发一个 action
  ↓
Middleware 处理            // 可拦截、转换、延迟（异步中间件在此处理）
  ↓
Reducer(state, action)     // 纯函数计算新 state
  ↓
Store 更新 state
  ↓
订阅者（组件）收到通知 → 重新渲染
```

---

## Q: Action 和 Action Creator 是什么？

**A:**

**Action** 是描述状态变更意图的普通 JS 对象，必须有 `type` 属性：

```js
// 最简单的 Action
{ type: 'INCREMENT' }

// 携带数据的 Action（payload 是约定俗成的字段名）
{ type: 'ADD_TODO', payload: { id: 1, text: '学习 Redux' } }

// FSA（Flux Standard Action）规范
{ type: 'ADD_TODO', payload: { text: '...' }, error: false, meta: {} }
```

**Action Creator** 是返回 Action 的工厂函数，避免手写重复的 type 字符串：

```js
// Action Creator
const increment = () => ({ type: 'INCREMENT' })
const addTodo = (text) => ({ type: 'ADD_TODO', payload: { text } })

// 使用
store.dispatch(increment())
store.dispatch(addTodo('学习 Redux'))
```

> ⚠️ **注意**：Redux Toolkit 的 `createSlice` 会自动生成 Action Creator，无需手写。

---

## Q: Reducer 是什么？有什么约束？

**A:**

**Reducer** 是一个纯函数，接收当前 state 和 action，返回新的 state：

```js
function counterReducer(state = 0, action) {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1
    case 'DECREMENT':
      return state - 1
    case 'RESET':
      return 0
    default:
      return state // ⚠️ 必须有 default，返回原 state
  }
}
```

**Reducer 的约束（必须是纯函数）：**

| 约束                   | 说明                                                          |
| ---------------------- | ------------------------------------------------------------- |
| ❌ 不能修改传入的 state | 必须返回新对象（不可变更新）                                  |
| ❌ 不能有副作用         | 不能调用 API、修改外部变量、随机数、`Date.now()` 等          |
| ❌ 不能调用非纯函数     | 相同输入必须返回相同输出                                      |
| ✅ 必须有 default 分支  | 未匹配的 action 原样返回 state                                |

**不可变更新写法：**

```js
// ❌ 错误：直接修改 state
case 'ADD_TODO':
  state.todos.push(action.payload)
  return state

// ✅ 正确：返回新对象
case 'ADD_TODO':
  return {
    ...state,
    todos: [...state.todos, action.payload]
  }

// ✅ RTK 中（内置 Immer，可以"直接修改"，实际上生成新对象）
addTodo: (state, action) => {
  state.todos.push(action.payload) // ✅ OK，Immer 代理
}
```

---

## Q: combineReducers 是什么？如何拆分 Reducer？

**A:**

随着应用增大，将所有逻辑放在一个 Reducer 中会导致文件臃肿。`combineReducers` 将多个子 Reducer 合并为一个根 Reducer：

```js
import { combineReducers } from 'redux'

const userReducer = (state = {}, action) => { /* ... */ }
const cartReducer = (state = [], action) => { /* ... */ }
const uiReducer  = (state = { loading: false }, action) => { /* ... */ }

const rootReducer = combineReducers({
  user: userReducer,
  cart: cartReducer,
  ui: uiReducer,
})

// store.getState() 结果
// {
//   user: {},
//   cart: [],
//   ui: { loading: false }
// }
```

**`combineReducers` 内部原理（简化版）：**

```js
function combineReducers(reducers) {
  return function combination(state = {}, action) {
    let hasChanged = false
    const nextState = {}
    for (const key in reducers) {
      const prevStateForKey = state[key]
      const nextStateForKey = reducers[key](prevStateForKey, action)
      nextState[key] = nextStateForKey
      hasChanged = hasChanged || nextStateForKey !== prevStateForKey
    }
    return hasChanged ? nextState : state
  }
}
```

> ⚠️ **注意**：每次 dispatch 时，**所有**子 Reducer 都会被调用。所以每个 Reducer 的 `default` 分支必须返回原 state，否则会被置为 `undefined`。

---

## Redux 整体链路图（纯 Markdown 版）

### 🔄 一、完整数据流总览

```
Component(useDispatch)
  ↓ dispatch(action)
Middleware Chain（拦截 / 增强）
  ↓ next(action)
Reducer((prev, action) => newState)
  ↓
State Tree（不可变更新）
  ↓ notify subscribers
Component 重渲染（useSelector）
```

> 整个流程是**单向的**：数据只能从 dispatch → Reducer → State → 组件 单向流动，不能反向。

---

### ⚙️ 二、一次 dispatch 的完整生命周期

```
① dispatch(action) — 唯一入口
   组件调用 dispatch，传入一个描述"发生了什么"的 Action 对象（必须含 type 字段）
   
② Middleware Chain 处理
   action 依次经过每个中间件；可在此拦截、转换、记录、处理异步（thunk / saga）
   每个中间件调用 next(action) 将控制权传给下一层
   
③ 原始 store.dispatch — 进入 Reducer
   中间件链末端调用原始 dispatch，触发 Reducer：(prevState, action) => newState
   Reducer 必须是纯函数，返回新对象（不可变）
   
④ State Tree 更新
   Store 将 Reducer 的返回值保存为新 state
   combineReducers 将所有子 Reducer 的结果合并为一棵完整的状态树
   
⑤ notify subscribers() — 通知订阅者
   Store 调用所有通过 subscribe() 注册的监听函数
   react-redux 的 useSelector 在此处执行 selector 并进行 === 比对
   
⑥ 组件按需重渲染
   useSelector 的返回值与上次不同（=== 比较失败）→ 触发组件重渲染，UI 更新
```

> ⚠️ **注意**：每次 dispatch，**所有 Reducer 都会被调用**（combineReducers 内部遍历）。未匹配的 action 必须在 default 分支返回原 state，否则会被置为 undefined。

---

### 🧅 三、Middleware 洋葱模型

```
middleware1（最外层 — 如 logger）
  ├─ 前置：打印 action 信息
  │
  ├─ middleware2（如 thunk）
  │  ├─ 前置：判断 action 是否为函数，是则执行异步逻辑并 dispatch 新 action
  │  │
  │  ├─ middleware3（如 saga）
  │  │  ├─ 前置：监听特定 action，交由 Generator 处理复杂流程
  │  │  │
  │  │  ├─ ⭐ 原始 store.dispatch(action)
  │  │  │    → 调用 Reducer → 更新 State → notify()
  │  │  │
  │  │  └─ 后置：saga 处理完成回调
  │  │
  │  └─ 后置：thunk 无后置逻辑
  │
  └─ 后置：打印更新后的 state
```

**中间件签名（三层柯里化）：**

```
store  =>  next  =>  action  =>  { ... next(action) ... }
```

| 参数 | 说明 |
|------|------|
| `store` | applyMiddleware 注入 `{ getState, dispatch }` |
| `next` | 下一个中间件的 dispatch 函数 |
| `action` | 实际传入的动作对象 |

---

### 🔌 四、react-redux 连接层

| 组件 / Hook | 职责 | 要点 |
|------------|------|------|
| **`<Provider store={store}>`** | 将 store 放入 React Context | 包裹整个应用根节点；Context 本身不触发子组件重渲染 |
| **`useDispatch()`** | 从 Context 取出 `store.dispatch` | 返回经中间件增强的 dispatch；建议配合 `useCallback` 缓存回调 |
| **`useSelector(selector)`** | 订阅 store | 与上次结果 `===` 比较，不同才重渲染；返回新引用（如 `.filter`）会无效重渲 |

> ⚠️ **注意**：useSelector 默认用**严格相等（===）**比较。若 selector 每次返回新对象/数组，即使内容相同也会触发重渲染——此时需要 `createSelector`（Reselect 记忆化）或 `shallowEqual`。

---

### 🛠️ 五、Redux Toolkit（RTK）各层职责

| API | 职责 | 关键特性 |
|-----|------|---------|
| **`configureStore`** | 替代 `createStore` | 自动 `combineReducers`；内置 redux-thunk；自动集成 Redux DevTools；开发模式可变性检测 |
| **`createSlice`** | 一次性定义 reducer + actions | 内置 Immer，可"直接修改"state；自动生成 action creators；`extraReducers` 处理外部 action |
| **`createAsyncThunk`** | 封装异步操作为标准 thunk | 自动生成 pending/fulfilled/rejected；支持 abort 取消；支持 condition 提前中止 |
| **RTK Query** | 服务端状态管理（≈ React Query） | 自动缓存 & 去重请求；自动生成 useXxxQuery/Mutation；tag 失效机制自动重新请求 |

> 💡 **职责分工**：`createSlice` 管客户端 UI 状态 / `RTK Query` 管服务端数据状态。两者职责应严格分离，不要把 API 数据手动存入 slice。

## 核心 API 篇

## Q: createStore 内部是如何实现的？

**A:**

`createStore` 是 Redux 的核心函数，返回包含 `getState / dispatch / subscribe` 的 Store 对象：

```js
function createStore(reducer, preloadedState, enhancer) {
  // 支持省略 preloadedState，直接传 enhancer
  if (typeof preloadedState === 'function') {
    enhancer = preloadedState
    preloadedState = undefined
  }

  // 如果有 enhancer（applyMiddleware），委托给 enhancer
  if (enhancer) {
    return enhancer(createStore)(reducer, preloadedState)
  }

  let currentState = preloadedState
  let currentListeners = []
  let isDispatching = false

  function getState() {
    return currentState
  }

  function subscribe(listener) {
    currentListeners.push(listener)
    return function unsubscribe() {
      const index = currentListeners.indexOf(listener)
      currentListeners.splice(index, 1)
    }
  }

  function dispatch(action) {
    if (isDispatching) throw new Error('Reducers may not dispatch actions.')
    try {
      isDispatching = true
      currentState = reducer(currentState, action) // 调用 Reducer
    } finally {
      isDispatching = false
    }
    currentListeners.forEach(listener => listener()) // 通知所有订阅者
    return action
  }

  // 初始化：触发一次 dispatch 让 Reducer 返回默认 state
  dispatch({ type: '@@redux/INIT' })

  return { getState, dispatch, subscribe }
}
```

---

## Q: compose 函数是什么？有什么用？

**A:**

`compose` 将多个函数**从右到左**组合成一个函数——**本质就是把手写嵌套调用变成动态组合**：

```js
// 手写嵌套（静态，函数数量固定）
const result = f(g(h(x)))

// compose（动态，函数数量可变）
const result = compose(f, g, h)(x)
```

数据流从**右往左**：`x → h → g → f → 输出`

**Redux 中的实现：**

```js
function compose(...fns) {
  if (fns.length === 0) return arg => arg
  if (fns.length === 1) return fns[0]
  return fns.reduce((f, g) => (...args) => f(g(...args)))
}

// 示例
const add1 = x => x + 1
const double = x => x * 2
const square = x => x * x

const transform = compose(square, double, add1)
transform(3) // square(double(add1(3))) = square(double(4)) = square(8) = 64
```

**在 Redux 中的用途：** `applyMiddleware` 使用 `compose` 将中间件链串联，形成洋葱模型：

```js
dispatch = compose(middleware1, middleware2, middleware3)(store.dispatch)
```

**`reduce` 折叠过程逐步拆解：**

`reduce` 的作用是把数组"折叠"成一个值，先看求和的类比：

```js
// 经典例子：求和
[1, 2, 3, 4].reduce((acc, cur) => acc + cur, 0) // → 10
```

compose 里，`reduce` 不传初始值时，数组第一个元素作为初始 accumulator，逐步把数组**折叠成一个函数**：

```js
[f, g, h].reduce((a, b) => (...args) => a(b(...args)))
// 第 1 次：a=f,  b=g  → 合并成 (...args) => f(g(...args))
// 第 2 次：a=上一步结果, b=h → 合并成 (...args) => f(g(h(...args)))
// 最终返回：(...args) => f(g(h(...args)))
```

**`...args` 从哪里来？**

`...args` 是 compose 返回的函数**被调用时**由外部传入的实参（延迟绑定，定义时并不存在）：

```js
dispatch = compose(...chain)(store.dispatch)
//                           ^^^^^^^^^^^^^
//                           调用时才传入，这就是 args[0]
```

**`compose(...chain)(store.dispatch)` 的两步理解：**

关键点：`compose(...chain)` 返回的是**函数定义**，不是执行结果，要分两步看：

```js
// 第一步：compose(...chain) 返回一个函数定义，f/g/h 内部都还没被调用
const composed = (...args) => f(g(h(...args)))

// 第二步：(store.dispatch) 才是真正触发执行，store.dispatch 填入 args
composed(store.dispatch)
// 等价于：f(g(h(store.dispatch)))
```

类比普通函数：

```js
const fn = (x) => x * 2   // 定义，没执行
fn(5)                      // 传参，才执行
```

**柯里化 vs compose 的区别：**

| | 写法 | 含义 |
|---|---|---|
| **柯里化** | `a => b => c => ...` | 每层返回下一个函数，逐层接收**不同参数** |
| **compose** | `x => f(g(h(x)))` | 嵌套调用，把上一层的**输出**作为下一层的输入 |

中间件签名 `store => next => action => {}` 是**柯里化**；`compose` 是**函数嵌套组合**，两者不同。

---

## 中间件篇

## Q: Redux 中间件的实现原理是什么？

**A:**

Redux 中间件是一个**增强 `dispatch` 函数**的机制，使其支持处理异步操作、日志记录等副作用。

**洋葱模型（Koa 风格）：**

```
dispatch(action)
  →  middleware1 前置逻辑
    →  middleware2 前置逻辑
      →  原始 dispatch → Reducer → 新 state
    ←  middleware2 后置逻辑
  ←  middleware1 后置逻辑
```

**中间件的标准结构（三层柯里化）：**

```js
const myMiddleware = store => next => action => {
  // ——— action 到达 Reducer 之前 ———
  console.log('before dispatch:', action)

  const result = next(action) // next 是下一个中间件的 dispatch（或原始 dispatch）

  // ——— action 处理完成之后 ———
  console.log('after dispatch, new state:', store.getState())

  return result
}
```

**`applyMiddleware` 核心实现（带注释）：**

```js
function applyMiddleware(...middlewares) {
  return (baseCreateStore) => (reducer, initialState) => {

    // 1. 用原始 createStore 创建未增强的 store
    const store = baseCreateStore(reducer, initialState)

    // 2. 构造 middlewareAPI，只暴露 getState 和 dispatch
    //    不直接传整个 store，是为了限制中间件权限（避免调用 subscribe 等方法）
    let dispatch = store.dispatch
    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action) => dispatch(action), // ← 闭包包一层，见下方说明
    }

    // 3. 每个中间件传入 middlewareAPI，得到 (next) => (action) => any
    const chain = middlewares.map(middleware => middleware(middlewareAPI))

    // 4. compose 将 chain 从右到左串联，传入原始 dispatch 作为最终 next
    dispatch = compose(...chain)(store.dispatch)

    // 5. 返回增强后的 store（dispatch 已被替换）
    return { ...store, dispatch }
  }
}
```

**为什么 dispatch 要用闭包包一层？**

```js
// ❌ 直接引用：中间件拿到的永远是原始 store.dispatch（增强前）
dispatch: store.dispatch

// ✅ 闭包包一层：调用时才执行，此时外层 dispatch 已被替换为增强版
dispatch: (action) => dispatch(action)
```

这个设计让中间件内部可以 `dispatch` 新的 action（例如 thunk 异步完成后再次 dispatch），且始终经过完整的中间件链处理，而不是绕过中间件直接到 Reducer。

**`baseCreateStore` 是什么？**

就是传入的原始 `createStore` 函数，只是换了个参数名，便于理解其"被增强前"的身份：

```
applyMiddleware(mid1, mid2)(createStore)(reducer, initialState)
//                          ^^^^^^^^^^^
//                          这个 createStore 就是 baseCreateStore
```

**中间件学习难点汇总：**

| 难点 | 说明 |
| --- | --- |
| 三层柯里化 | `store => next => action => {}`，每层职责不同，不要混淆 |
| `compose` 执行顺序 | `compose(a, b, c)` 是**右到左**组合，`c` 最先处理 action |
| `dispatch` 闭包替换 | `middlewareAPI` 里的 `dispatch` 用闭包指向最终值，设计很隐晦 |
| `next` 的身份 | 是**下一个中间件**的 dispatch 函数，不是 `store.dispatch` |

**Redux 中间件 vs 其他框架中间件：**

| 场景 | 机制 |
|---|---|
| **Redux 中间件** | `applyMiddleware` + 柯里化函数链 |
| **Koa 中间件** | `async/await` + `next()` 的洋葱模型，与 Redux 类似但实现不同 |
| **Express 中间件** | `(req, res, next) => {}` 线性链，无"后置逻辑"洋葱 |
| **Next.js Middleware** | Edge Runtime 上的请求拦截，类似 Express |

Redux、Koa、Express 中间件都遵循同一个设计模式：**责任链（Chain of Responsibility）**，通过 `next` 将控制权传递给下一层。

**整体执行流程总结：**

```
用户调用 dispatch(action)
       ↓
中间件1 的 (action) => { ... next(action) ... }  ← 前置逻辑
       ↓ next
中间件2 的 (action) => { ... next(action) ... }  ← 前置逻辑
       ↓ next
中间件3 的 (action) => { ... next(action) ... }  ← 前置逻辑
       ↓ next
原始 store.dispatch(action) → Reducer → 更新 state
       ↑
中间件3 next(action) 返回后 ← 后置逻辑
       ↑
中间件2 next(action) 返回后 ← 后置逻辑
       ↑
中间件1 next(action) 返回后 ← 后置逻辑
```

---

## Q: redux-thunk 是什么？如何实现异步 action？

**A:**

**redux-thunk** 允许 `dispatch` 接受一个**函数**而不只是对象，该函数会被中间件调用，从而实现异步操作。

**redux-thunk 源码（极简）：**

```js
function createThunkMiddleware(extraArgument) {
  return store => next => action => {
    // 如果 action 是函数，则调用它并传入 dispatch 和 getState
    if (typeof action === 'function') {
      return action(store.dispatch, store.getState, extraArgument)
    }
    // 否则按普通 action 处理
    return next(action)
  }
}

export default createThunkMiddleware()
```

**使用示例：**

```js
// ✅ Thunk Action Creator：返回一个函数
const fetchUser = (userId) => async (dispatch, getState) => {
  dispatch({ type: 'FETCH_USER_REQUEST' })
  try {
    const user = await api.getUser(userId)
    dispatch({ type: 'FETCH_USER_SUCCESS', payload: user })
  } catch (error) {
    dispatch({ type: 'FETCH_USER_FAILURE', payload: error.message })
  }
}

// 组件中
store.dispatch(fetchUser(42)) // dispatch 一个函数
```

**在 RTK 中使用 `createAsyncThunk`（推荐）：**

```js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

// 自动生成 pending / fulfilled / rejected 三个 action
export const fetchUser = createAsyncThunk('user/fetch', async (userId) => {
  const response = await api.getUser(userId)
  return response.data
})

const userSlice = createSlice({
  name: 'user',
  initialState: { data: null, loading: false, error: null },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchUser.pending, state => { state.loading = true })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  }
})
```

---

## Q: redux-saga 是什么？与 redux-thunk 有何区别？

**A:**

**redux-saga** 是一个基于 **Generator 函数**的 Redux 副作用管理中间件，专为复杂异步流程设计。

**核心概念：**

| 概念        | 说明                                              |
| ----------- | ------------------------------------------------- |
| `Saga`      | 一个 Generator 函数，监听 action 并处理副作用      |
| `Effect`    | 描述副作用的纯对象（call/put/take/fork 等）        |
| `call`      | 调用异步函数（可被测试拦截）                       |
| `put`       | 触发一个 action（相当于 dispatch）                 |
| `take`      | 监听某个 action，阻塞等待                          |
| `takeEvery` | 每次 action 都响应（并发执行）                     |
| `takeLatest`| 只处理最新的 action，取消之前未完成的任务          |
| `fork`      | 非阻塞调用，派生子 Saga                            |

**使用示例：**

```js
import { call, put, takeLatest } from 'redux-saga/effects'

// Worker Saga：处理具体异步逻辑
function* fetchUserSaga(action) {
  try {
    const user = yield call(api.getUser, action.payload) // 调用异步函数
    yield put({ type: 'FETCH_USER_SUCCESS', payload: user }) // dispatch action
  } catch (error) {
    yield put({ type: 'FETCH_USER_FAILURE', payload: error.message })
  }
}

// Watcher Saga：监听 action
function* watchFetchUser() {
  yield takeLatest('FETCH_USER_REQUEST', fetchUserSaga)
}

// 注册到 store
import createSagaMiddleware from 'redux-saga'
const sagaMiddleware = createSagaMiddleware()
const store = createStore(rootReducer, applyMiddleware(sagaMiddleware))
sagaMiddleware.run(watchFetchUser)
```

**redux-thunk vs redux-saga 对比：**

| 维度           | redux-thunk                         | redux-saga                            |
| -------------- | ----------------------------------- | ------------------------------------- |
| 学习曲线       | ✅ 低（普通函数/async-await）        | ❌ 高（需了解 Generator）              |
| 代码组织       | 逻辑分散在各 action creator 中      | ✅ 集中在 Saga 文件，关注点分离       |
| 可测试性       | 需要 mock API 调用                  | ✅ Effect 是纯对象，直接断言，无需 mock|
| 复杂流程       | ❌ 竞态、取消、防抖处理复杂         | ✅ takeLatest/race/cancel 等原语支持  |
| 包大小         | ✅ ~600B                            | ❌ ~14KB                              |
| 适用场景       | 简单异步、小型项目                  | 复杂流程、大型项目、需要取消/竞态处理 |

---

## react-redux 篇

## Q: react-redux 如何连接 React 和 Redux？

**A:**

`react-redux` 是 Redux 的官方 React 绑定库，核心原理是利用 **React Context** 将 Store 注入组件树，再通过订阅机制触发组件更新。

**`<Provider>` 组件：**

```jsx
import { Provider } from 'react-redux'
import { store } from './store'

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
)
```

内部实现：将 store 放入 Context，使所有子组件可以访问。

**`useSelector`：读取状态**

```jsx
import { useSelector } from 'react-redux'

function UserName() {
  // 只订阅 state.user.name，其他字段变化不会触发重渲染
  const name = useSelector(state => state.user.name)
  return <span>{name}**
}
```

`useSelector` 内部使用严格相等（`===`）判断返回值是否变化，变化则触发重渲染。

**`useDispatch`：触发 action**

```jsx
import { useDispatch } from 'react-redux'
import { increment } from './counterSlice'

function IncrementButton() {
  const dispatch = useDispatch()
  return <button onClick={() => dispatch(increment())}>+1</button>
}
```

**旧版 `connect` HOC（了解即可）：**

```jsx
const mapStateToProps = state => ({ count: state.counter.count })
const mapDispatchToProps = dispatch => ({ increment: () => dispatch(increment()) })

export default connect(mapStateToProps, mapDispatchToProps)(Counter)
```

> ⚠️ **注意**：`connect` 是 class 组件时代的产物，函数组件优先使用 `useSelector` + `useDispatch`。

---

## Q: useSelector 的性能注意事项有哪些？

**A:**

**问题：返回新引用导致无效重渲染**

```jsx
// ❌ 每次 state 更新，filter 都会创建新数组，导致组件重渲染
const todos = useSelector(state => state.todos.filter(t => !t.done))

// ✅ 方案1：用 Reselect 缓存派生数据
import { createSelector } from 'reselect'

const selectUndoneTodos = createSelector(
  state => state.todos,
  todos => todos.filter(t => !t.done) // 仅 todos 引用变化时才重新计算
)
const todos = useSelector(selectUndoneTodos)

// ✅ 方案2：shallowEqual 浅比较（返回对象/数组时）
import { shallowEqual } from 'react-redux'
const { name, age } = useSelector(
  state => ({ name: state.user.name, age: state.user.age }),
  shallowEqual // 替代默认的 === 比较
)
```

**最佳实践：**

| 场景                     | 推荐做法                                   |
| ------------------------ | ------------------------------------------ |
| 读取单个原始值           | 直接 `useSelector(state => state.x.y)`    |
| 读取多个字段             | 多次调用 `useSelector` 或用 `shallowEqual` |
| 从 state 派生数据        | 使用 `createSelector`（Reselect）          |
| 高频更新的大列表         | 配合 `React.memo` 拆分子组件               |

---

## Redux Toolkit 篇

## Q: Redux Toolkit（RTK）是什么？核心 API 有哪些？

**A:**

**Redux Toolkit（RTK）** 是 Redux 官方推荐的工具集，解决了原始 Redux 样板代码多、配置繁琐的问题。

**核心 API 一览：**

| API                    | 作用                                                              |
| ---------------------- | ----------------------------------------------------------------- |
| `configureStore`       | 替代 `createStore`，内置 DevTools、thunk 中间件                  |
| `createSlice`          | 一次性定义 reducer + action creators，内置 Immer                  |
| `createAsyncThunk`     | 生成异步 action，自动处理 pending/fulfilled/rejected              |
| `createSelector`       | 来自 Reselect，创建记忆化 Selector                                |
| `createEntityAdapter`  | 标准化处理集合数据（CRUD 操作内置）                               |
| `RTK Query`            | 数据请求 + 缓存方案（类 React Query）                             |

---

## Q: createSlice 是如何工作的？

**A:**

`createSlice` 接受一个配置对象，自动生成 action creators 和 reducer：

```js
import { createSlice } from '@reduxjs/toolkit'

const counterSlice = createSlice({
  name: 'counter',                    // slice 名称（action type 前缀）
  initialState: { count: 0 },         // 初始 state
  reducers: {
    // 每个 key 对应一个 case reducer + 自动生成的 action creator
    increment(state) {
      state.count += 1                // ✅ Immer 允许"直接修改"
    },
    decrement(state) {
      state.count -= 1
    },
    incrementByAmount(state, action) {
      state.count += action.payload
    },
    reset() {
      return { count: 0 }             // 也可以返回全新 state
    }
  }
})

// 自动生成的 Action Creators
export const { increment, decrement, incrementByAmount, reset } = counterSlice.actions

// Action type 示例：'counter/increment'

// Reducer（注册到 store）
export default counterSlice.reducer
```

**`extraReducers`：处理外部 action（如 createAsyncThunk）**

```js
const todosSlice = createSlice({
  name: 'todos',
  initialState: { items: [], loading: false },
  reducers: { /* ... */ },
  extraReducers: builder => {
    builder
      .addCase(fetchTodos.pending, state => { state.loading = true })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addMatcher(
        action => action.type.endsWith('/rejected'),
        state => { state.loading = false }
      )
  }
})
```

---

## Q: configureStore 与 createStore 有何区别？

**A:**

```js
import { configureStore } from '@reduxjs/toolkit'

const store = configureStore({
  reducer: {
    counter: counterReducer,
    user: userReducer,
  },
  // 以下均有默认值，通常无需手动配置
  middleware: getDefaultMiddleware => getDefaultMiddleware(), // 默认：thunk + 可变检测 + 序列化检测
  devTools: process.env.NODE_ENV !== 'production',           // 自动启用 Redux DevTools
  preloadedState: {},                                        // 初始 state
})
```

| 维度              | `createStore`                                   | `configureStore`                          |
| ----------------- | ----------------------------------------------- | ----------------------------------------- |
| combineReducers   | 需手动调用                                      | ✅ 传对象自动合并                          |
| 中间件配置        | 需手动 `applyMiddleware`                        | ✅ 默认内置 thunk，一行添加自定义中间件    |
| Redux DevTools    | 需手动配置 enhancer                             | ✅ 自动集成                                |
| Immer             | ❌ 无                                           | ✅ createSlice 内置                        |
| 可变性检测        | ❌ 无                                           | ✅ 开发模式下自动检测                      |

---

## Q: RTK Query 是什么？

**A:**

**RTK Query** 是 RTK 内置的**服务端状态管理**方案（类似 React Query / SWR），专门处理数据请求、缓存、自动同步。

**核心功能：**

- 自动缓存 & 去重请求
- 自动生成 loading / error / data 状态
- 数据失效与重新获取
- 乐观更新
- 支持 WebSocket 实时数据

**基本用法：**

```js
// store/api.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['User'],
  endpoints: builder => ({
    getUser: builder.query({
      query: id => `/users/${id}`,
      providesTags: ['User'],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/users/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['User'], // 更新后自动重新获取 User 数据
    }),
  })
})

export const { useGetUserQuery, useUpdateUserMutation } = userApi
```

```jsx
// 组件中使用（自动管理 loading/error/data）
function UserProfile({ id }) {
  const { data: user, isLoading, isError } = useGetUserQuery(id)
  const [updateUser] = useUpdateUserMutation()

  if (isLoading) return <Spinner />
  if (isError) return <Error />

  return (
    <div>
      <p>{user.name}</p>
      <button onClick={() => updateUser({ id, name: '新名字' })}>修改</button>
    </div>
  )
}
```

> ⚠️ **注意**：RTK Query 管理**服务端状态**（接口数据），Redux state 管理**客户端 UI 状态**，两者职责应分离，不要把 API 数据手动存入 Redux slice。

---

## 状态设计篇

## Q: Redux 如何实现多个组件之间的通信？

**A:**

Redux 通过**全局单一 Store** 实现跨组件通信，任意组件都可以读取或修改共享状态，无需通过 props 层层传递。

**核心机制：**

```
组件A dispatch(action)  →  Reducer 更新 Store  →  组件B/C 订阅数据变化  →  自动重新渲染
```

**示例（无父子关系的两个组件共享状态）：**

```jsx
import { useSelector, useDispatch } from 'react-redux'
import { increment } from './counterSlice'

// 组件A：修改状态
function ComponentA() {
  const dispatch = useDispatch()
  return <button onClick={() => dispatch(increment())}>+1</button>
}

// 组件B：读取状态（与 A 无父子关系）
function ComponentB() {
  const count = useSelector(state => state.counter.count)
  return <p>当前计数：{count}</p>
}

// 两个组件共同挂载在某个父组件下，通过 Redux 通信，父组件无需传递任何 props
function App() {
  return (
    <>
      <ComponentA />
      <ComponentB />
    </>
  )
}
```

**多组件共享状态的管理策略：**

| 策略                        | 说明                                              |
| --------------------------- | ------------------------------------------------- |
| `useSelector` 精准订阅      | 只选择用到的字段，其他 state 变化不触发重渲染      |
| `createSelector`（Reselect）| 记忆化派生数据，相同输入不重新计算                 |
| 按业务拆分 Slice            | `combineReducers` 合并，结构清晰                  |
| RTK Query                   | 接口数据单独管理，避免与 UI 状态混用               |

---

## Q: Redux 状态该如何设计？哪些状态适合放 Redux？

**A:**

**判断原则：**

```
这个 state 需要被多个无父子关系的组件共享吗？
  是 → 考虑 Redux / Zustand
  否 → 放 useState / useReducer 即可
```

**各类状态的归属：**

| 状态类型                    | 适合放哪里                     | 原因                             |
| --------------------------- | ------------------------------ | -------------------------------- |
| 服务端数据（用户列表、文章）| RTK Query / React Query        | 自带缓存、loading、同步机制      |
| 全局 UI 状态（侧边栏折叠）  | Redux / Zustand                | 多个不相关组件需要知道           |
| 用户认证信息（token、角色） | Redux + localStorage           | 全局可访问，需持久化             |
| 表单数据                    | 本地 `useState` / React Hook Form | 只有表单组件自己关心          |
| 弹窗/Toast 显隐             | 本地 `useState` 或小型全局 store| 通常只有父组件控制              |
| 全局主题/语言               | Context 或 Redux               | 低频更新，Context 即可           |

> ⚠️ **注意**：Redux 不是越多越好。**只把真正需要跨多层组件共享、且变更逻辑复杂的状态放入 Redux。** 过度使用 Redux 会增加代码复杂度，降低可维护性。

---

## 选型对比篇

## Q: Redux vs Context vs Zustand vs Jotai 如何选择？

**A:**

| 维度           | Redux（RTK）                | Context + useReducer       | Zustand                     | Jotai                        |
| -------------- | --------------------------- | -------------------------- | --------------------------- | ---------------------------- |
| 包大小         | ~47KB（RTK）                | 0（内置）                  | ~2KB                        | ~3KB                         |
| 学习曲线       | ❌ 较高                      | ✅ 低（React 内置概念）    | ✅ 极低                     | ✅ 低                         |
| 性能           | ✅ 精准订阅                  | ❌ Context 值变化全量重渲  | ✅ 精准订阅                 | ✅ 原子级订阅，极精准          |
| DevTools       | ✅ 强大的时间旅行调试        | ❌ 无                       | ✅ 支持                     | ✅ 支持                       |
| 异步处理       | ✅ Thunk / Saga / RTK Query  | 需手动处理                 | 内置 async 支持             | 支持 async atom               |
| 代码量         | ❌ 多（Slice + extraReducers）| 中等                       | ✅ 极少                     | ✅ 极少                       |
| 适用规模       | 中大型复杂应用               | 小型 / 低频更新全局状态    | 中小型，追求简洁             | 细粒度状态，组件级原子状态    |

**选型建议：**

```
小型项目 / 原型          →  Context + useState
中型项目 / 追求轻量      →  Zustand（首选）
大型项目 / 已有 Redux    →  Redux Toolkit（RTK）
需要复杂异步流           →  RTK + redux-saga
细粒度原子状态设计        →  Jotai / Recoil
全栈数据请求 + 缓存      →  RTK Query / React Query（无论用哪种全局状态库）
```

---

## Q: Zustand 相比 Redux 有哪些优势？

**A:**

**Zustand** 是一个极简的状态管理库，API 仅需几行代码：

```js
import { create } from 'zustand'

const useCounterStore = create((set, get) => ({
  count: 0,
  increment: () => set(state => ({ count: state.count + 1 })),
  decrement: () => set(state => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
  double: () => set({ count: get().count * 2 }), // get() 读取当前 state
}))

// 组件中
function Counter() {
  const { count, increment } = useCounterStore()
  return <button onClick={increment}>{count}</button>
}
```

**Zustand vs Redux 对比：**

| 维度               | Redux（RTK）                                | Zustand                          |
| ------------------ | ------------------------------------------- | -------------------------------- |
| 概念复杂度         | Store / Action / Reducer / Middleware       | 只有 `create` + `set` / `get`   |
| 代码量             | 较多                                        | ✅ 极少                          |
| 与 React 解耦      | 需要 `react-redux` Provider 包裹            | ✅ 无需 Provider                 |
| 订阅颗粒度         | `useSelector` + Reselect                    | ✅ 直接 selector 函数，同样精准  |
| 调试工具           | Redux DevTools（功能强大）                  | 支持 Redux DevTools（需配置）    |
| 迁移成本           | ❌ 改造代价大                                | ✅ 可逐步引入                    |

> ⚠️ **注意**：对于已有 Redux 的大型项目，不建议强行迁移到 Zustand。新项目在不需要复杂中间件和时间旅行调试的场景下，Zustand 是更轻量的选择。

---

## 🎤 面试回答完整版（10分版）

### 第一段：Redux 解决了什么问题

Redux 解决的根本问题是——当你的应用有大量跨组件、跨层级共享状态时，直接传递 props 或组件间通信会导致数据流不可控、Bug 难以追踪。Redux 的方案是抽出全局 Store，通过单向数据流让每一次状态变更都变得可预测、可回溯。它本质上不是状态管理库，而是『状态变更流程的规范化框架』——把任意地方都可以修改任意状态，变成所有人都必须走同一个流程来申请修改。

---

### 第二段：核心概念速览

Redux 有四个核心概念：Store——唯一状态容器，整个应用只有一个，保证了任何时候你只有一个真相来源。Action——描述发生了什么，是一个普通对象，必须有 `type` 字段。它的目的不是『通知 Reducer 改什么』，而是『记录刚才发生了什么』——这就是时间旅行调试的基础。Reducer——纯函数 `(state, action) => newState`，纯函数约束确保了可预测性：相同输入永远相同输出。这也是 Redux 可以不依赖框架独立使用的原因。Dispatch——触发状态变更的唯一途径，保证了没有隐式修改、没有双向绑定带来的『不知道谁改了数据』的问题。

---

### 第三段：三大原则

三大原则是上面设计的具体体现：单一数据源、State 只读、纯函数更新。三者共同服务一个核心价值——可预测性。

---

### 第四段：中间件机制

中间件是 Redux 最具设计巧思的部分。它本质是一个增强 dispatch 的机制——让你可以在 action 到达 Reducer 之前或之后插入自定义逻辑。它的实现核心是三层柯里化 + compose 函数组合。标准结构是 `store => next => action => { ... }`：第一层收到 `getState` 和 `dispatch`；第二层收到下一个中间件的 dispatch；第三层才是实际 action。`applyMiddleware` 内部用 `compose` 把所有中间件串成洋葱模型——action 从外层穿过所有中间件到达 Reducer，结果再穿回来。注意一个小设计：`middlewareAPI` 中的 `dispatch` 用闭包包了一层 `(action) => dispatch(action)`，这保证了中间件内部 dispatch 的新 action 仍会走完整中间件链，而不是绕过。

---

### 第五段：RTK——现代 Redux

原始 Redux 最大的痛点是样板代码太多。官方在 2019 年推出了 Redux Toolkit。核心变化：① `createSlice` 合一——action type、creator、reducer 一步定义，自动生成。② 内置 Immer——不需要手写 `...state` 展开了。③ `configureStore`——替代 `createStore`，自动 `combineReducers`、自动挂载 thunk 中间件和 DevTools。④ `createAsyncThunk`——替代手写 thunk action creator，自动生成 pending/fulfilled/rejected 三个 action。现在做新项目，绝不要用原始 Redux 写法，一律用 RTK。

---

### 第六段：选型判断

我的选型标准很简单：这个状态是否被两个以上不相关的组件需要？如果是，考虑 Redux 或 Zustand；如果不是，放组件本地。另外有个常见误区：用 Context 代替 Redux 来传递频繁更新的状态。Context 没有选择器机制，Provider 的值一变化，下面所有消费者都重渲染，性能反而不如 Redux 的精准订阅 + Reselect 记忆化。对于新项目，我个人倾向：简单全局状态用 Zustand、复杂业务逻辑用 RTK、服务端数据用 React Query / RTK Query——不混在一起。

**状态管理方案选型对比：**

| 维度 | Redux (RTK) | Zustand | MobX | Context + useReducer |
|------|------------|---------|------|---------------------|
| 样板代码 | 中（RTK 后减少） | 极少 | 少 | 少 |
| 时间旅行调试 | ✅ DevTools 完整支持 | 需配置 | 一般 | ❌ |
| 学习曲线 | 陡峭 | 平缓 | 平缓 | 平缓 |
| 精准订阅 | ✅ Reselect 记忆化 | ✅ selector 函数 | ✅ computed 自动缓存 | ❌ 全消费者重渲染 |
| 不可变性 | ✅ 强制（Immer） | 推荐 | ❌ 可变 | 推荐 |
| 适用场景 | 大型复杂应用 | 轻量全局状态 | 中小型 / OOP 偏好 | 低频更新、简单状态 |
| 服务端数据 | RTK Query | 需额外集成 | 需额外集成 | 需额外集成 |
