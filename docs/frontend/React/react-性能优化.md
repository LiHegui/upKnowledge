# React 性能优化完全指南

> 遵循 **"先测量，再优化，避免过早优化"** 的核心原则。性能优化是一个闭环流程：**测量 → 分析 → 优化 → 再测量**。

---

## 目录

- [📊 阶段一：建立性能基线（测量）](#-阶段一建立性能基线测量)
- [🚀 阶段二：资源加载与 Bundle 优化](#-阶段二资源加载与-bundle-优化)
- [⚛️ 阶段三：运行时渲染优化](#-阶段三运行时渲染优化)
- [🚦 阶段四：高级与并发特性](#-阶段四高级与并发特性)
- [🌐 阶段五：服务端渲染与流式渲染](#-阶段五服务端渲染与流式渲染)
- [🤖 React Compiler —— 自动 Memoization](#-react-compiler--自动-memoization)
- [⚠️ 常见性能反模式](#-常见性能反模式)
- [✅ 性能自查清单](#-性能自查清单)
- [🎤 面试回答完整版（10分版）](#-面试回答完整版10分版)

---

## 📊 阶段一：建立性能基线（测量）

在动手优化前，必须先通过数据了解应用的性能现状，找到真正的瓶颈。

### 1. React DevTools Profiler

最核心的工具。在浏览器中打开 React DevTools 的 "Profiler" 标签页，录制一次用户操作，然后分析**火焰图（Flamegraph）**。

**关注点：**
- 寻找**渲染耗时过长**（超过 16ms，即一帧的时间）的组件
- 寻找**频繁渲染**的组件

**核心操作：** 点击火焰图中的某个条，右侧面板会显示 **"为什么渲染？（Why did this render?）"**，直接定位到是由于 `props` 还是 `state` 变化导致的。

### 2. Chrome DevTools Performance

在 "Performance" 标签页录制，分析：
- **主线程（Main）** 活动，识别**长任务（Long Task）**——超过 50ms 的任务会阻塞渲染
- **布局抖动（Layout Thrashing）**——强制同步布局导致反复回流
- **网络（Network）** 加载瀑布图

### 3. Bundle Analyzer

在构建配置中加入 `webpack-bundle-analyzer` 或 `vite-bundle-analyzer`，生成可视化的依赖包大小图，找出占用空间最大的"罪魁祸首"。

---

## 🚀 阶段二：资源加载与 Bundle 优化

此阶段让页面**更快加载和变得可交互**。

### 代码分割（Code Splitting）

使用 `React.lazy` 和 `Suspense` 实现按路由或按需加载组件，显著减少初始 JS 包大小：

```jsx
const Dashboard = React.lazy(() => import('./Dashboard'))
const Settings = React.lazy(() => import('./Settings'))

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  )
}
```

### 优化第三方库

通过 Bundle Analyzer 检查体积庞大但使用率低的库，寻找更轻量的替代品或按需引入：

| ❌ 体积大 | ✅ 轻量替代 |
|---------|-----------|
| moment.js（~300KB） | date-fns（~4KB，按需导入） |
| lodash（全量 ~500KB） | lodash-es（按需 tree-shakable） |
| antd（全量 ~1.5MB） | 按需导入组件 |

### 图片优化

- 使用现代格式：WebP、AVIF
- 响应式图片：`srcSet` + `sizes` 适配不同屏幕
- 懒加载：`loading="lazy"` 属性或 IntersectionObserver

### 启用压缩

生产构建默认开启 JS/CSS 压缩。额外可配置：
- **Gzip / Brotli 压缩**：服务端启用，Brotli 压缩率比 Gzip 高约 20%
- **Tree Shaking**：确保 ES Module 导入方式，剔除未使用的代码

---

## ⚛️ 阶段三：运行时渲染优化

此阶段让页面在**交互和更新时更流畅**，避免不必要的计算和渲染。

> ⚠️ **前置判断：渲染次数 ≠ 渲染成本。**
>
> 在动手加 memo 之前，先判断组件的渲染成本：
> - **子组件量大但轻**（如 1000 个 `<div>`） → memo 的浅比较总开销可能超过渲染本身，**不划算**
> - **子组件少但重**（大型图表、复杂计算、富文本编辑器） → memo + useMemo 收益明显
>
> 优化依据不是"它重渲染了"，而是"它的重渲染是否造成了明显的性能问题"。

### 避免不必要的重新渲染

#### `React.memo`

对**纯展示组件**使用 `React.memo` 进行浅比较，避免父组件更新时无关子组件跟着重渲染：

```jsx
const ExpensiveChart = React.memo(function ExpensiveChart({ data }) {
  // data 没变时，父组件渲染也不会触发这里
  return <Chart data={data} />
})
```

**切勿过度使用**：memo 的浅比较本身也有开销。只在组件渲染成本较高且 props 经常不变时使用。

#### `useCallback` — 缓存函数引用

当把函数作为 props 传递给被 `React.memo` 包裹的子组件时，必须使用 `useCallback` 保证函数引用不变，否则 memo 会失效：

```jsx
// ❌ 父组件每次渲染都创建新函数，memo 失效
<MemoChild onClick={() => handleClick(id)} />

// ✅ 依赖不变时复用同一个函数引用
const handleClick = useCallback(() => {
  // ...
}, [id])
```

#### `useMemo` — 缓存复杂计算结果

适用于数据过滤、排序等开销大的计算。对于简单计算，使用它反而增加开销：

```jsx
// ✅ 只在 todos 变化时才重新计算
const filteredTodos = useMemo(
  () => todos.filter(t => t.status === 'done'),
  [todos]
)

// ❌ 没必要——简单计算的开销小于 useMemo 的依赖比较
const fullName = useMemo(() => `${first} ${last}`, [first, last])
```

### 状态管理优化

#### 状态下沉（State Colocation）

将状态放在**使用它的最小公共父组件**中，避免状态提升过高导致整个子树重新渲染：

```jsx
// ❌ 状态在 App，整个子树跟着渲染
function App() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <Header onToggle={() => setIsOpen(!isOpen)} />
    <Sidebar isOpen={isOpen} />
    <MainContent />  {/* 不需要 isOpen，但会跟着渲染 */}
  )
}

// ✅ 状态下沉到 Header
function Header() {
  const [isOpen, setIsOpen] = useState(false) // 只在 Header 内部
  return <Sidebar isOpen={isOpen} />
}
```

#### 拆分 Context

将变化频繁和不频繁的数据放在不同的 `Context.Provider` 中，避免高频更新触发所有消费者重渲染：

```jsx
// ❌ 一个 Context 包所有
<AppContext.Provider value={{ user, theme, notifications }}>
  <App />
</AppContext.Provider>

// ✅ 拆分：高频和低频分离
<UserContext.Provider value={user}>
  <ThemeContext.Provider value={theme}>
    <NotificationContext.Provider value={notifications}>
      <App />
    </NotificationContext.Provider>
  </ThemeContext.Provider>
</UserContext.Provider>
```

#### 惰性初始化 State

对于需要通过复杂计算得到的初始状态，使用**函数形式**，该函数只会在首次渲染时执行一次：

```js
// ❌ 每次渲染都执行 computeInitialState
const [state, setState] = useState(computeInitialState())

// ✅ 只执行一次
const [state, setState] = useState(() => computeInitialState())
```

### 列表与 Key

- 为列表项指定**稳定、唯一**的 `key`，**不要使用索引（index）**，尤其是在列表顺序可能变化的情况下
- 对于超长列表（1000+ 项），使用**虚拟列表（Windowing）** 技术，只渲染可视区域内的元素：

```jsx
import { FixedSizeList } from 'react-window'

function VirtualList({ items }) {
  return (
    <FixedSizeList height={400} itemCount={items.length} itemSize={35}>
      {({ index, style }) => (
        <div style={style}>{items[index].name}</div>
      )}
    </FixedSizeList>
  )
}
```

---

## 🚦 阶段四：高级与并发特性

### useTransition — 标记非紧急更新

将非紧急更新（如搜索过滤结果、图表渲染）标记为"过渡任务"，确保用户交互（如输入）始终流畅：

```jsx
function SearchPage() {
  const [query, setQuery] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleChange = (e) => {
    // 紧急：更新输入框显示
    setQuery(e.target.value)

    // 非紧急：过滤结果列表
    startTransition(() => {
      setFilteredResults(filterData(e.target.value))
    })
  }

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending ? <Spinner /> : <Results data={filteredResults} />}
    </>
  )
}
```

**`useDeferredValue`** 是 `useTransition` 的另一种形式，适用于无法直接控制状态更新的场景（如外部传进来的 `value`）：

```jsx
const deferredQuery = useDeferredValue(query)
// deferredQuery 会在空闲时更新，优先保证 query 的响应
```

### 避免在 useEffect 中链式更新状态

链式更新会导致额外的渲染周期，尽可能在一次更新中完成所有状态变更：

```jsx
// ❌ 两次渲染
useEffect(() => {
  setData(response.data)
  setLoading(false)
}, [])

// ✅ 如果你真的需要两次更新（应该合并的话），用 useReducer 或合并状态
const [state, dispatch] = useReducer(reducer, { data: null, loading: true })
useEffect(() => {
  fetchData().then(data => dispatch({ type: 'DONE', data }))
}, [])
```

### 使用 requestIdleCallback

将低优先级的任务放在浏览器空闲时执行：

```jsx
useEffect(() => {
  const id = requestIdleCallback(() => {
    // 分析日志、预加载等非紧急操作
    analytics.report()
  })
  return () => cancelIdleCallback(id)
}, [])
```

---

## 🌐 阶段五：服务端渲染与流式渲染

如果项目使用 Next.js / Remix 等 SSR 框架，性能瓶颈与纯 CSR 完全不同：

| 问题 | 原因 | 解法 |
|------|------|------|
| **TTFB 慢** | 服务端需要获取所有数据才能渲染 HTML | **Streaming** + Suspense 边界，逐步发送 |
| **Hydration 阻塞** | 浏览器需要下载并执行所有组件的 JS 才能恢复交互 | **选择性 Hydration**：优先恢复可见区域 |
| **首屏 JS 过大** | 全量客户端 JS 被打包 | **Server Components**：减少发送到客户端的代码 |

```jsx
// Next.js App Router：Streaming + Suspense
function Page() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<Skeleton />}>
        {/* 这个组件的数据加载不阻塞页面其余部分的渲染 */}
        <SlowDataComponent />
      </Suspense>
    </div>
  )
}
```

**SSR vs SSR + Streaming 的 TTFB 差异：**

```
传统 SSR：                  等待所有数据 → 一次性发送全部 HTML → Hydration
                            [────── TTFB ──────]

SSR + Streaming：           发送框架 HTML  →  逐步流式发送各 Suspense 区块
                            [TTFB] → [Suspense A] → [Suspense B]
```

---

## 🤖 React Compiler —— 自动 Memoization

React 19 引入的 **React Compiler**（原 React Forget）在编译阶段自动为组件和 Hook 注入 memoization，无需手动使用 `useMemo` / `useCallback` / `React.memo`。

**工作原理：**

```jsx
// 你写的代码
function Parent() {
  const data = { a: 1 }
  return <Child data={data} />
}

// Compiler 编译后（自动注入 memoization）
function Parent() {
  const $ = _c(2)
  let data
  if ($[0] !== Symbol.for('react.memo_cache_sentinel')) {
    data = { a: 1 }
    $[0] = true
    $[1] = data
  } else {
    data = $[1]
  }
  return <Child data={data} />
}
```

**影响：**
- 如果项目使用了 React Compiler，**手动加 memo / useMemo / useCallback 反而多余**——编译后的代码已经自动做了
- 但 Compiler 目前不是默认启用的，需要在构建配置中启用 Babel 插件
- 如果团队没有 Compiler，手工优化仍然必要

---

## ⚠️ 常见性能反模式

### 1. `flushSync` 滥用

`flushSync` 强制退出 React 18 的自动批处理，立即同步渲染。每次调用都会导致一次独立的渲染周期：

```jsx
// ❌ 每次 fetch 都强制同步渲染，造成多次渲染
flushSync(() => setLoading(true))
fetchData().then(data => flushSync(() => setData(data)))
flushSync(() => setLoading(false))

// ✅ 让 React 批处理，一次渲染完成
setLoading(true)
fetchData().then(data => setData(data))
setLoading(false) // 合并为一次渲染
```

> `flushSync` 是**逃生舱**，不是常规武器。日常开发中强烈不建议使用。

### 2. 在渲染过程中创建组件类型

每次渲染都创建新的组件引用，导致 React 认为类型变了，卸载旧实例再挂载新实例：

```jsx
function Parent() {
  // ❌ 每次渲染 ChildComponent 都是新引用，React 会卸载旧实例重建
  function ChildComponent() {
    return <div>Hi</div>
  }
  return <ChildComponent />
}
```

### 3. props.children 导致 memo 失效

`props.children` 始终是新引用，会穿透 memo：

```jsx
// ❌ children 每次都是新引用，MemoizedWrapper 的 memo 永远失效
<MemoizedWrapper>
  <ExpensiveChild />
</MemoizedWrapper>
```

此时如果 wrapper 本身不需要根据 children 变化重渲染，考虑用 `useMemo` 包裹 children。

### 4. 内联对象/函数 props 导致 memo 失效

```jsx
// ❌ 没有 useCallback/useMemo，memo 白写
<MemoChild
  style={{ color: 'red' }}
  onClick={() => handleClick()}
/>
```

---

## ✅ 性能自查清单

### 开发阶段
- [ ] 已安装并熟悉 **React DevTools Profiler**
- [ ] 知道如何读取火焰图，定位"为什么渲染"

### 构建阶段
- [ ] 已配置 **Bundle Analyzer**，分析首屏加载的依赖
- [ ] 已启用代码分割（`React.lazy` + `Suspense`）
- [ ] 已启用生产构建压缩和 Tree Shaking

### 编码阶段
- [ ] 检查渲染成本：**渲染次数 ≠ 渲染成本**，优先优化成本高的组件
- [ ] 检查是否存在不必要的重渲染，应用了 `React.memo`
- [ ] 检查传递给子组件的回调/对象，是否用了 `useCallback` / `useMemo`
- [ ] 检查状态是否被放置在合理层级，Context 是否合理拆分
- [ ] 检查列表渲染是否使用稳定且唯一的 `key`
- [ ] 检查大型数据集是否考虑了虚拟列表

### 体验阶段
- [ ] 对于复杂交互，是否考虑了 `useTransition` / `useDeferredValue`
- [ ] 是否检查过 `flushSync` 的滥用

---

## 🎤 面试回答完整版（10分版）

### 第一段：核心原则

React 性能优化的核心原则是先测量再优化，避免过早优化。整个优化框架分为五个阶段。

---

### 第二段：建立性能基线

第一阶段是建立基线。用 React DevTools Profiler 录制火焰图，找到渲染耗时过长或频繁渲染的组件，直接在火焰图中点开看"为什么渲染"，定位到具体是 props 还是 state 变化导致的。配合 Chrome Performance 看长任务和布局抖动、Bundle Analyzer 看依赖体积。

---

### 第三段：资源加载优化

第二阶段是资源加载优化。代码分割用 React.lazy + Suspense 按路由或按需加载；用 Bundle Analyzer 找出体积大的第三方库，按需引入或换轻量替代品；图片用 WebP/AVIF 格式加懒加载；生产构建确保压缩和 Tree Shaking 开启。如果项目用了 SSR，还要关注流式渲染——用 Suspense 边界逐步发送 HTML，降低 TTFB。

---

### 第四段：运行时渲染优化

第三阶段是运行时渲染优化。但动手加 memo 之前要做一个前置判断：渲染次数不等于渲染成本。子组件量大但轻（比如大量纯文本）时，memo 的浅比较总开销可能超过渲染本身；子组件少但重（大型图表、复杂计算）时，memo + useMemo 收益才明显。优化依据不是它重渲染了，而是重渲染是否造成了明显的性能问题。

**具体手段：React.memo 缓存纯展示组件；useCallback 稳定函数引用配合 memo；useMemo 缓存复杂计算结果。状态管理上，把状态下沉到最小公共父组件，拆分高频/低频的 Context。长列表用 react-window 做虚拟列表，key 用稳定唯一 ID 不用 index。**

---

### 第五段：并发特性

第四阶段是用并发特性。useTransition 和 useDeferredValue 把非紧急更新标记为过渡任务，优先保证用户交互的响应性。注意用 requestIdleCallback 处理低优先级任务，避免在 useEffect 中链式更新状态导致额外渲染。

---

### 第六段：了解未来方向

第五阶段是了解 React Compiler 的方向。React 19 的 Compiler 在编译阶段自动注入 memoization，如果项目用了它，手动加 memo/useCallback 反而多余。但目前 Compiler 不是默认启用的，手工优化仍然必要。

---

### 第七段：常见反模式

最后要警惕几个常见反模式：flushSync 滥用会破坏批处理导致多次渲染；在渲染函数内定义组件类型会导致 React 每次都卸载重建；内联对象和函数 props 会让 memo 永远失效。

**五阶段优化路径总览：**

| 阶段 | 关键动作 | 核心工具 |
|------|---------|---------|
| ① 基线测量 | 定位渲染瓶颈 | DevTools Profiler / Chrome Performance / Bundle Analyzer |
| ② 资源加载 | 减少首屏体积 | React.lazy + Suspense、按需引入、WebP |
| ③ 运行时渲染 | 减少无效渲染 | React.memo / useCallback / useMemo / 状态下沉 / 虚拟列表 |
| ④ 并发特性 | 保证交互响应 | useTransition / useDeferredValue |
| ⑤ SSR & 流式 | 降低 TTFB | Suspense boundary、selective hydration |

**常见反模式速查：**

| 反模式 | 后果 | 正确做法 |
|-------|------|---------|
| `flushSync` 滥用 | 强制同步渲染，破坏批处理 | 默认批处理即可，极少场景才需 flushSync |
| 渲染函数内定义组件 | 每次渲染卸载重建，丢失状态 | 移到组件外部定义 |
| 内联对象/函数 props | `memo` 永远失效 | `useMemo` / `useCallback` 包裹 |
| `children` 传 JSX 给 memo 组件 | children 引用每次都新，memo 失效 | 把变化部分拆到子组件内部 |
| 盲目加 memo | 浅比较开销 > 渲染开销 | 先测量，只针对"重渲染 + 高成本"的组件 |

**渲染次数 ≠ 渲染成本：**

| 场景 | 渲染次数 | 单次成本 | 优化收益 |
|------|---------|---------|---------|
| 1000 个纯文本子组件 | 多 | 极低 | memo 浅比较总开销可能超过渲染 |
| 3 个大型图表子组件 | 少 | 极高 | memo + useMemo 收益明显 |
| 深层 Context 消费组件 | 多 | 中 | 拆分 Context 比 memo 更有效 |