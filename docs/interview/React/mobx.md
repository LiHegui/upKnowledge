# MobX 完全指南

> MobX 是 React 生态中与 Redux 齐名的状态管理库，主打 **响应式编程**（Reactive Programming） + **最小化样板代码**。本文涵盖：核心理念、API、与 Redux 对比、源码原理、最佳实践等核心考点。

---

## 基础认知篇

## Q: MobX 是什么？它解决了什么问题？

<details><summary>查看答案</summary>

**A:**

**MobX** 是一个基于「**响应式数据流**」的状态管理库，核心思想：

> **任何源自应用状态的东西都应该自动地获得。**（Anything that can be derived from the application state, should be derived. Automatically.）

**核心解决的问题：**

| 痛点 | Redux 方案 | MobX 方案 |
|------|-----------|----------|
| 状态变更需手动派发 | `dispatch(action)` | 直接修改 `store.xxx = yyy` |
| 派生数据需手动计算 | `reselect` 选择器 | `@computed` 自动缓存 |
| 组件订阅状态需手动 | `connect` / `useSelector` | `observer` 自动订阅 |
| 样板代码多 | action / reducer / type | 一个 class 搞定 |

**一句话定位**：MobX 让状态管理像 Vue 一样「响应式」，让 React 也能享受到「改数据 = 自动更新视图」的开发体验。

</details>

---

## Q: MobX 和 Redux 该怎么选？

<details><summary>查看答案</summary>

**A:**

**多维度对比：**

| 维度 | Redux | MobX |
|------|-------|------|
| **设计哲学** | 函数式（纯函数 + 不可变） | 响应式（OOP + 可变状态） |
| **数据流** | 单向数据流（严格） | 响应式数据流 |
| **状态可变性** | ❌ 不可变（必须返回新对象） | ✅ 可变（直接修改） |
| **样板代码** | 多（action / reducer / type） | 少（一个 class） |
| **学习曲线** | 陡峭（需理解 reducer、middleware） | 平缓（类似 Vue） |
| **调试工具** | ✅ Redux DevTools（时间旅行强大） | ✅ mobx-react-devtools |
| **性能** | 需手动优化（memo / reselect） | 自动精确订阅，开箱即用 |
| **适用场景** | 大型应用、需严格状态追溯 | 中小型应用、快速开发 |
| **TypeScript 友好度** | 一般（RTK 改善） | ✅ 极佳（装饰器天然支持） |

**选择建议：**

- 选 **Redux**：团队大、状态变更复杂、需要严格的时间旅行调试、追求函数式纯净
- 选 **MobX**：追求开发效率、状态结构嵌套深、团队熟悉 OOP、个人项目或中小型项目
- 选 **Zustand / Jotai**：简单全局状态、不想引入重型方案

> 💡 **现代 React 项目趋势**：Redux Toolkit (RTK) + RTK Query 已大幅简化 Redux；而 MobX 在 v6 后也去掉了装饰器强依赖。两者差距在缩小。

</details>

---

## Q: 同一个 Counter 场景，用 Redux 和 MobX 分别如何实现？

<details><summary>查看答案</summary>

**A:**

通过同一个「计数器 + 异步加 1」场景，直观对比两者代码风格差异。

**场景需求：**
- 状态：`count`、`loading`
- 动作：`increment` 同步加 1、`incrementAsync` 异步加 1
- 派生：`double = count * 2`

---

### 方案 A：Redux（Redux Toolkit + React-Redux）

```ts
// store/counterSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export const incrementAsync = createAsyncThunk(
  'counter/incrementAsync',
  async () => {
    await new Promise(r => setTimeout(r, 1000))
    return 1
  }
)

const counterSlice = createSlice({
  name: 'counter',
  initialState: { count: 0, loading: false },
  reducers: {
    increment: (state) => { state.count += 1 },  // Immer 加持，看似可变实则不可变
  },
  extraReducers: (builder) => {
    builder
      .addCase(incrementAsync.pending,   (s) => { s.loading = true })
      .addCase(incrementAsync.fulfilled, (s, a) => { s.count += a.payload; s.loading = false })
  },
})

export const { increment } = counterSlice.actions
export default counterSlice.reducer
```

```tsx
// Counter.tsx
import { useSelector, useDispatch } from 'react-redux'

function Counter() {
  const { count, loading } = useSelector((s: RootState) => s.counter)
  const double = useSelector((s: RootState) => s.counter.count * 2)  // 派生需 selector
  const dispatch = useDispatch()

  return (
    <div>
      <p>{count} × 2 = {double}</p>
      <button onClick={() => dispatch(increment())}>+1</button>
      <button onClick={() => dispatch(incrementAsync())} disabled={loading}>
        {loading ? '加载中...' : '异步 +1'}
      </button>
    </div>
  )
}
```

**特征**：分层清晰（slice / action / selector / dispatch），样板较多，但每一步都可追踪、可调试。

---

### 方案 B：MobX

```ts
// store/CounterStore.ts
import { makeAutoObservable, runInAction } from 'mobx'

export class CounterStore {
  count = 0
  loading = false

  constructor() {
    makeAutoObservable(this)
  }

  get double() {            // computed 自动缓存
    return this.count * 2
  }

  increment() {             // action 自动推断
    this.count += 1
  }

  async incrementAsync() {
    this.loading = true
    await new Promise(r => setTimeout(r, 1000))
    runInAction(() => {
      this.count += 1
      this.loading = false
    })
  }
}

export const counterStore = new CounterStore()
```

```tsx
// Counter.tsx
import { observer } from 'mobx-react-lite'
import { counterStore as store } from '@/store/CounterStore'

const Counter = observer(() => (
  <div>
    <p>{store.count} × 2 = {store.double}</p>
    <button onClick={() => store.increment()}>+1</button>
    <button onClick={() => store.incrementAsync()} disabled={store.loading}>
      {store.loading ? '加载中...' : '异步 +1'}
    </button>
  </div>
))
```

**特征**：一个 class 搞定，直接 `store.count += 1`，组件直接读字段，无需 selector / dispatch。

---

### 代码量对比

| 维度 | Redux (RTK) | MobX |
|------|-------------|------|
| **总行数** | ~35 行 | ~22 行 |
| **概念数** | slice / thunk / reducer / selector / dispatch / useSelector | class / observable / action / observer |
| **状态变更** | 必须 dispatch action | 直接赋值 |
| **异步处理** | createAsyncThunk + extraReducers | async 函数 + runInAction |
| **派生计算** | useSelector 中重算（或 reselect 缓存） | get 访问器自动缓存 |
| **类型推导** | 需手写 RootState / AppDispatch | 类即类型，零额外定义 |

---

### 心智模型差异

```
Redux:  View → dispatch(action) → reducer(state, action) → newState → re-render
        ───────────────────────────────────────────────────────────────────
        显式、单向、可追溯（每一步都能在 DevTools 看到）

MobX:   View ↔ Observable State
        ───────────────────────
        隐式、双向、自动响应（改数据 = 视图更新）
```

> 💡 **核心差异**：Redux 把状态当**事件流**处理（事件溯源），MobX 把状态当**响应式对象**处理（数据驱动）。前者重过程追溯，后者重开发效率。

</details>

---

## 核心 API 篇

## Q: MobX 的核心概念有哪些？

<details><summary>查看答案</summary>

**A:**

MobX 的核心可以用 4 个概念概括：

```
   Action（动作）
       ↓ 修改
   Observable State（可观察状态）
       ↓ 派生
   Computed Values（计算值）
       ↓ 触发
   Reactions（反应：自动渲染 / autorun）
```

**1. Observable（可观察状态）** — 状态源头

```js
import { observable, makeObservable, action, computed } from 'mobx'

class TodoStore {
  todos = []        // 可观察数组
  filter = 'all'    // 可观察字符串

  constructor() {
    makeObservable(this, {
      todos: observable,
      filter: observable,
      doneCount: computed,
      addTodo: action,
    })
  }

  get doneCount() {
    return this.todos.filter(t => t.done).length
  }

  addTodo(text) {
    this.todos.push({ text, done: false })
  }
}
```

**2. Action（动作）** — 状态变更的唯一入口

- 所有修改 `observable` 的操作都应包裹在 `action` 中
- 严格模式下（`configure({ enforceActions: 'always' })`），未声明 action 直接改状态会报错
- action 内多次修改会**合并为一次通知**（事务性），避免中间态渲染

**3. Computed（计算值）** — 派生状态

- 类似 Vue 的 `computed`，**自动缓存**，依赖未变则不重新计算
- 只有被 `observer` 或 `autorun` 使用时才会重新求值（惰性）

**4. Reaction（反应）** — 副作用

三种 API：
- `autorun(fn)`：fn 中用到的 observable 一变就重跑（首次会执行一次）
- `reaction(data, effect)`：只追踪 `data` 函数返回值，变化时执行 `effect`
- `when(predicate, effect)`：条件满足时执行一次

```js
autorun(() => {
  console.log(`完成数: ${store.doneCount}`)
})
```

</details>

---

## Q: `observer` 是如何让 React 组件自动响应 MobX 状态变化的？

<details><summary>查看答案</summary>

**A:**

`observer` 是 `mobx-react-lite` 提供的高阶组件（HOC），核心原理：

**1. 包装组件成 Reaction**

```jsx
import { observer } from 'mobx-react-lite'

const TodoList = observer(() => {
  return <div>{store.doneCount}</div>  // 读取 observable
})
```

`observer(Component)` 内部做了三件事：

```js
// 简化伪代码
function observer(Component) {
  return function ObserverWrapper(props) {
    // 1. 使用 useSyncExternalStore 订阅 MobX
    const [, forceUpdate] = useState()

    // 2. 创建一个 Reaction，绑定组件
    const reaction = useRef(
      new Reaction('observer', () => forceUpdate({}))
    )

    // 3. 在 reaction.track 中执行渲染，收集依赖
    let rendering
    reaction.current.track(() => {
      rendering = Component(props)
    })

    return rendering
  }
}
```

**2. 自动依赖追踪**

渲染时，组件内**读取**的每个 observable 字段都被记录为依赖：

- 读 `store.todos` → 订阅 todos
- 读 `store.doneCount` → 订阅 computed → 间接订阅 todos
- **没读的字段不会订阅**（精确订阅，无需 memo）

**3. 状态变化 → 重新渲染**

当 observable 变化 → 触发 Reaction → 调用 `forceUpdate` → 组件重渲染。

> ✅ **关键优势**：MobX 是**字段级精确订阅**，组件只在用到的状态变化时才更新，性能优于 Redux 默认行为。

</details>

---

## 进阶原理篇

## Q: MobX 是如何实现响应式追踪的？底层原理是什么？

<details><summary>查看答案</summary>

**A:**

MobX 的响应式原理与 Vue 高度相似，核心是 **依赖收集 + 派发更新**。

**1. 数据劫持：Proxy / defineProperty**

- MobX 5+：使用 **Proxy**（不支持 IE11）
- MobX 4：使用 `Object.defineProperty`

```js
// observable 的本质：把对象包装成 Proxy
const state = observable({ count: 0 })
// 等价于（简化）：
const state = new Proxy({ count: 0 }, {
  get(target, key) {
    // 1. 依赖收集：记录当前 Reaction 依赖了 key
    reportObserved(target, key)
    return target[key]
  },
  set(target, key, value) {
    target[key] = value
    // 2. 派发更新：通知所有依赖该 key 的 Reaction
    propagateChanged(target, key)
    return true
  }
})
```

**2. 三大核心数据结构**

| 概念 | 角色 |
|------|------|
| **Atom** | 最小观察单元（每个 observable 字段对应一个 Atom） |
| **Reaction** | 副作用（observer 组件 / autorun / reaction） |
| **Derivation** | 派生（Computed + Reaction 的基类） |

**3. 依赖图（Dependency Graph）**

MobX 维护一张图：

```
Atom(todos)  ──→  Computed(doneCount)  ──→  Reaction(TodoList组件)
                                       ──→  Reaction(Footer组件)
```

- 当 Atom 变化 → 沿图传播 → 标记下游为「脏」
- Computed 是惰性的：被读取时若是脏的才重新计算
- Reaction 是急切的：脏了就重新执行

**4. 事务（Transaction）**

`action` 包裹的代码会开启事务，事务内多次修改只触发一次 Reaction：

```js
@action
batchUpdate() {
  this.a = 1
  this.b = 2
  this.c = 3
  // 事务结束后，只通知一次
}
```

</details>

---

## Q: MobX 6 相比 MobX 5/4 有哪些重大变化？

<details><summary>查看答案</summary>

**A:**

MobX 6（2020 年底发布）是一次重大重构，目标是**降低使用门槛**和**移除装饰器依赖**。

**1. 装饰器变为可选**

MobX 5：依赖装饰器（需要 Babel/TS 配置）

```ts
class Store {
  @observable count = 0
  @action increment() { this.count++ }
  @computed get double() { return this.count * 2 }
}
```

MobX 6：默认使用 `makeObservable` / `makeAutoObservable`

```ts
class Store {
  count = 0
  constructor() {
    makeAutoObservable(this)  // 自动推断
    // 或精确声明：
    // makeObservable(this, { count: observable, increment: action, double: computed })
  }
  increment() { this.count++ }
  get double() { return this.count * 2 }
}
```

**2. `makeAutoObservable` 自动推断**

- 普通字段 → observable
- getter → computed
- 方法 → action

**3. 默认开启严格模式**

- 状态变更必须在 action 中（`enforceActions: 'observed'`）
- 防止误改 state

**4. 更好的 TypeScript 支持**

- 不再依赖实验性装饰器
- 类型推导更准确

**5. 兼容 React 18**

- `mobx-react-lite` 使用 `useSyncExternalStore`
- 支持并发模式（Concurrent Mode）

</details>

---

## 实战篇

## Q: 在 React + TypeScript 项目中如何组织 MobX Store？

<details><summary>查看答案</summary>

**A:**

**推荐结构：多 Store + RootStore 模式**

```
src/
├── stores/
│   ├── RootStore.ts        ← 根 Store，组合所有子 Store
│   ├── UserStore.ts        ← 用户模块
│   ├── TodoStore.ts        ← 业务模块
│   └── context.tsx         ← React Context 注入
```

**1. 定义子 Store**

```ts
// stores/TodoStore.ts
import { makeAutoObservable, runInAction } from 'mobx'
import type { RootStore } from './RootStore'

export class TodoStore {
  todos: Todo[] = []
  loading = false

  constructor(public root: RootStore) {
    makeAutoObservable(this, { root: false })
  }

  get doneCount() {
    return this.todos.filter(t => t.done).length
  }

  async fetchTodos() {
    this.loading = true
    try {
      const data = await api.getTodos()
      // 异步回调中需用 runInAction 包裹
      runInAction(() => {
        this.todos = data
        this.loading = false
      })
    } catch (err) {
      runInAction(() => { this.loading = false })
    }
  }
}
```

**2. RootStore 组合**

```ts
// stores/RootStore.ts
export class RootStore {
  userStore: UserStore
  todoStore: TodoStore

  constructor() {
    this.userStore = new UserStore(this)
    this.todoStore = new TodoStore(this)
  }
}
```

**3. Context 注入 + Hook**

```tsx
// stores/context.tsx
import { createContext, useContext } from 'react'
import { RootStore } from './RootStore'

const StoreContext = createContext<RootStore | null>(null)

export const StoreProvider = ({ children }: { children: React.ReactNode }) => (
  <StoreContext.Provider value={new RootStore()}>{children}</StoreContext.Provider>
)

export const useStore = () => {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore must be used within StoreProvider')
  return store
}
```

**4. 组件中使用**

```tsx
import { observer } from 'mobx-react-lite'
import { useStore } from '@/stores/context'

const TodoList = observer(() => {
  const { todoStore } = useStore()

  useEffect(() => { todoStore.fetchTodos() }, [])

  if (todoStore.loading) return <Spin />
  return (
    <ul>
      {todoStore.todos.map(t => <li key={t.id}>{t.text}</li>)}
      <div>已完成：{todoStore.doneCount}</div>
    </ul>
  )
})
```

</details>

---

## Q: MobX 使用中有哪些常见踩坑点？

<details><summary>查看答案</summary>

**A:**

**1. 异步操作中状态变更必须用 `runInAction`**

```ts
// ❌ 严格模式下报错
async fetchData() {
  const data = await api.get()
  this.list = data  // 警告：不在 action 中
}

// ✅ 正确做法
async fetchData() {
  const data = await api.get()
  runInAction(() => { this.list = data })
}
```

**2. 解构会丢失响应性**

```tsx
// ❌ 解构后 count 就是普通变量，不会响应更新
const TodoCount = observer(() => {
  const { count } = todoStore
  return <div>{count}</div>  // 不会更新
})

// ✅ 直接访问字段
const TodoCount = observer(() => {
  return <div>{todoStore.count}</div>
})
```

**3. `observer` 包裹层级要够细**

```tsx
// ❌ 父组件 observer，子组件不是 observer，子组件不会更新
const Parent = observer(() => {
  return <Child count={store.count} />  // store.count 变了 → Parent 重渲染 → Child 通过 props 接收
})

// ✅ 子组件单独包 observer，性能更好
const Child = observer(({ count }) => <div>{count}</div>)
```

**4. 数组/对象的引用监听陷阱**

```ts
// ❌ Map / Set 必须用 observable.map / observable.set
this.cache = new Map()  // 不会响应

// ✅
this.cache = observable.map()
```

**5. computed 中不要有副作用**

```ts
get badComputed() {
  console.log('被读取')   // ❌ 副作用
  api.report()           // ❌ 调用接口
  return this.list.length
}
```

**6. 避免 observable 嵌套过深**

- 默认深度可观察，嵌套对象也会被代理
- 性能敏感场景用 `observable.shallow` / `observable.ref`

```ts
class Store {
  // 只观察引用变化，不深入对象内部
  config = observable.ref({ ... })
}
```

</details>

---

## Q: MobX 与 React 18 并发模式兼容性如何？

<details><summary>查看答案</summary>

**A:**

**MobX 6.6+ 完全兼容 React 18 并发模式**，核心改造点：

**1. 使用 `useSyncExternalStore`**

`mobx-react-lite` 内部从 `useState + forceUpdate` 改造为 `useSyncExternalStore`：

```js
// React 18 提供的外部 Store 订阅 API
useSyncExternalStore(
  subscribe,    // 订阅函数
  getSnapshot,  // 获取当前状态快照
)
```

**好处：**
- 避免 **tearing**（撕裂）：并发渲染时不会读到不一致的中间状态
- 自动支持 `<Suspense>` / `startTransition`

**2. 与 Suspense 配合**

```tsx
const DataView = observer(() => {
  // MobX 状态可以无缝配合 React.lazy / Suspense
  if (!store.data) throw store.fetchPromise  // 抛出 Promise
  return <div>{store.data.title}</div>
})

<Suspense fallback={<Loading />}>
  <DataView />
</Suspense>
```

**3. startTransition 兼容**

```tsx
import { startTransition } from 'react'

startTransition(() => {
  store.updateFilter('done')  // 标记为非紧急更新
})
```

> ⚠️ **注意**：项目升级到 React 18 时，确保 `mobx-react-lite` ≥ 3.3.0、`mobx` ≥ 6.3.0。

</details>

---

## 总结

> MobX = **响应式数据流** + **精确依赖追踪** + **最小化样板**
>
> - **核心 4 概念**：Observable / Action / Computed / Reaction
> - **底层原理**：Proxy 劫持 + Atom 依赖图 + 事务批处理
> - **React 集成**：`observer` HOC + 字段级精确订阅
> - **最佳实践**：RootStore + makeAutoObservable + runInAction 包裹异步
> - **适用场景**：中小型项目、追求开发效率、偏好 OOP 风格

📚 **延伸阅读**：
- [MobX 官方文档](https://mobx.js.org/)
- [Redux 完全指南](./redux.md)
- [React 渲染行为完全指南](./react-rendering-behavior.md)
