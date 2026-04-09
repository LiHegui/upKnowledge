# React 渲染行为完全指南

> 原文：[A (Mostly) Complete Guide to React Rendering Behavior](https://blog.isquaredsoftware.com/2020/05/blogged-answers-a-mostly-complete-guide-to-react-rendering-behavior/)
> 作者：Mark Erikson（Redux 维护者）
> 更新于 2022 年 10 月，涵盖 React 18 内容

---

## 目录

- [什么是"渲染"？](#什么是渲染)
  - [渲染流程概述](#渲染流程概述)
  - [Render 阶段与 Commit 阶段](#render-阶段与-commit-阶段)
  - [React 与 Vue 渲染流程对比](#react-与-vue-渲染流程对比)
- [React 如何处理渲染？](#react-如何处理渲染)
  - [触发渲染的方式](#触发渲染的方式)
  - [默认渲染行为](#默认渲染行为)
  - [React 渲染规则](#react-渲染规则)
  - [组件元数据与 Fiber](#组件元数据与-fiber)
  - [组件类型与协调](#组件类型与协调)
  - [Key 与协调](#key-与协调)
  - [渲染批处理与时机](#渲染批处理与时机)
  - [异步渲染、闭包与状态快照](#异步渲染闭包与状态快照)
  - [渲染行为的边界情况](#渲染行为的边界情况)
- [提升渲染性能](#提升渲染性能)
  - [组件渲染优化技术](#组件渲染优化技术)
  - [新 Props 引用如何影响渲染优化](#新-props-引用如何影响渲染优化)
  - [优化 Props 引用](#优化-props-引用)
  - [是否应该到处加 memo？](#是否应该到处加-memo)
  - [不可变性与重渲染](#不可变性与重渲染)
  - [测量 React 组件渲染性能](#测量-react-组件渲染性能)
- [Context 与渲染行为](#context-与渲染行为)
  - [Context 基础](#context-基础)
  - [更新 Context 值](#更新-context-值)
  - [状态更新、Context 与重渲染](#状态更新context-与重渲染)
  - [Context 更新与渲染优化](#context-更新与渲染优化)
  - [Context 与渲染器边界](#context-与渲染器边界)
- [React-Redux 与渲染行为](#react-redux-与渲染行为)
  - [React-Redux 订阅机制](#react-redux-订阅机制)
  - [connect 与 useSelector 的区别](#connect-与-useselector-的区别)
- [未来的 React 改进](#未来的-react-改进)
  - [React Compiler（原"React Forget"）](#react-compiler原react-forget)
  - [Context Selectors](#context-selectors)
- [总结](#总结)
- [最终思考](#最终思考)

---

## 什么是"渲染"？

**渲染**是 React 根据当前 props 和 state 的组合，询问组件"你希望你的这部分 UI 现在看起来是什么样子"的过程。

---

### 渲染流程概述

在渲染过程中，React 会从组件树的根部开始，向下循环，找出所有被标记为需要更新的组件。对于每个被标记的组件，React 会调用：

- 函数组件：`FunctionComponent(props)`
- 类组件：`classComponentInstance.render()`

并将渲染输出保存下来，用于后续步骤。

组件的渲染输出通常用 JSX 语法编写，最终会被编译为 `React.createElement()` 调用：

```js
// JSX 语法：
return <MyComponent a={42} b="testing">Text here</MyComponent>

// 编译为：
return React.createElement(MyComponent, {a: 42, b: "testing"}, "Text Here")

// 最终生成的元素对象：
{ type: MyComponent, props: {a: 42, b: "testing"}, children: ["Text Here"] }

// React 内部调用实际函数来渲染：
let elements = MyComponent({...props, children})

// 对于"宿主组件"如 HTML：
return <button onClick={() => {}}>Click Me</button>
// 变成：
{ type: "button", props: {onClick}, children: ["Click me"] }
```

收集完整个组件树的渲染输出后，React 会对新旧对象树进行 diff（也就是"虚拟 DOM" diff），计算出需要应用到真实 DOM 的所有变更。这个过程称为**协调（Reconciliation）**。

React 随后会在一个**同步序列**中将所有计算出的变更应用到 DOM。

> ⚠️ **注意**：React 团队近年来已淡化"虚拟 DOM"这个术语。Dan Abramov 指出：React 的核心原则是 "UI 是值"（value UI），而不是某种 DOM 的 workaround。

---

### Render 阶段与 Commit 阶段

React 团队将渲染工作在概念上分为两个阶段：

- **Render 阶段**：调用组件函数生成新的 Element 树，并在内部进行 Reconciliation（协调/diff），计算出"哪些地方需要变"——此时**不会动真实 DOM**
- **Commit 阶段**：拿着 Render 阶段算好的变更列表，一次性同步写入真实 DOM

React 更新 DOM 后，按以下顺序执行（**区分首次挂载和后续更新**）：

1. 更新所有 refs，指向对应的 DOM 节点和组件实例
2. 同步运行 commit 阶段生命周期：
   - **首次挂载**：运行 `componentDidMount`、`useLayoutEffect`（setup）
   - **后续更新**：运行 `useLayoutEffect`（先执行上次的 cleanup，再执行新的 setup），然后运行 `componentDidUpdate`
3. 设置一个短暂的 timeout，到期后运行所有 `useEffect`（先 cleanup 上次，再执行新的）——即"Passive Effects"阶段

React 18 引入了**并发渲染（Concurrent Rendering）**，例如 `useTransition`。这让 React 可以在渲染阶段暂停工作，让浏览器处理事件，随后恢复、丢弃或重新计算工作。Commit 阶段始终是同步执行的。

**关键点**：**"渲染"并不等于"更新 DOM"**，组件可能被渲染而不产生任何可见变化：

- 组件可能返回与上次完全相同的输出，所以不需要任何 DOM 变更
- 在并发渲染中，React 可能多次渲染一个组件，但如果其他更新使当前工作无效，则每次都会丢弃渲染输出

用两个具体场景来理解：

**场景一：输出没变，DOM 不动**

```jsx
function Counter({ count }) {
  return <div>Count: {count}</div>;
}
```

父组件更新触发 `Counter` 重渲染，但如果 `count` 还是 5，React 执行完组件函数后发现新旧输出一样，就不会动 DOM。**渲染（执行函数）发生了，但 DOM 没有变化。**

**场景二：并发渲染下，渲染结果被丢弃**

这是 React 18 并发模式特有的行为：

```
用户快速输入搜索关键词：
  输入 "r"   → React 开始渲染搜索结果...
  输入 "re"  → 旧渲染还没完，新输入来了！
               React 直接丢弃 "r" 的渲染结果，重新渲染 "re" 的
  输入 "rea" → 同上，丢弃 "re" 的结果，渲染 "rea" 的
```

React 会在渲染阶段暂停/丢弃"过时"的渲染工作，只有**最终确认有效**的渲染结果才会进入 Commit 阶段写入 DOM。

> 💡 "渲染" = React **执行组件函数、计算输出**这个过程；"更新 DOM" = 把计算结果**真正写入页面**。这也是为什么**渲染函数里不能有副作用**——它可能被执行多次，甚至结果被丢弃。

---

### React 与 Vue 渲染流程对比

两者在宏观流程上类似，本质都是 **生成新树 → diff → 应用变更**，但有重要区别。

**⚠️ 常见误区**：diff（协调/Reconciliation）并不是发生在 Render 和 Commit 阶段"之后"，而是 **Render 阶段内部**的一部分：

```
Render 阶段
  ├── 调用组件函数，生成新的 React Element 树
  └── Reconciliation（协调/diff）← diff 在这里完成

Commit 阶段
  └── 将 diff 结果应用到真实 DOM（此时已有现成的变更列表）
```

**React vs Vue 3 流程对比：**

| 步骤 | React | Vue 3 |
|------|-------|-------|
| 生成新虚拟树 | 调用组件函数 → 生成 React Element | 执行 render 函数 → 生成 VNode 树 |
| Diff | Reconciliation（Fiber 树对比） | patch 算法（VNode 树对比） |
| 应用变更 | Commit 阶段写入真实 DOM | 执行 DOM patch 操作 |

**三大关键差异：**

1. **触发粒度不同**：Vue 的响应式系统（Proxy）会精确追踪哪个组件依赖了哪个数据，数据变了只有对应组件重渲染；React 默认是父组件渲染则整棵子树都渲染，再由 diff 判断 DOM 是否真的需要改变

2. **可中断性不同**：React 18 并发模式下，Render 阶段可以被中断/丢弃，Commit 阶段始终同步；Vue 3 的渲染是同步的（调度是异步的，但渲染本身不可中断）

3. **内部数据结构不同**：React 用 **Fiber 链表**（可中断遍历），Vue 用 **VNode 树**（递归遍历）

---

## React 如何处理渲染？

### 触发渲染的方式

初始渲染完成后，有几种方式可以告诉 React 排队一次重渲染：

**函数组件：**
- `useState` 的 setter 函数
- `useReducer` 的 dispatch

**类组件：**
- `this.setState()`
- `this.forceUpdate()`

**其他：**
- 再次调用 `ReactDOM.render(<App>)`（等价于对根组件调用 `forceUpdate()`）
- `useSyncExternalStore` hook 触发的更新

> 函数组件没有 `forceUpdate` 方法，但可以用 `useReducer` 实现类似效果：
> ```js
> const [, forceRender] = useReducer((c) => c + 1, 0);
> ```

---

### 默认渲染行为

**非常重要**：

> **React 的默认行为是：当父组件渲染时，React 会递归地渲染其内部的所有子组件！**

例如，组件树为 `A > B > C > D`，用户点击 B 中的按钮触发 `setState()`：

1. B 调用 `setState()`，排队一次 B 的重渲染
2. React 从树的顶部开始渲染
3. React 看到 A 未被标记，跳过
4. React 看到 B 被标记，渲染 B，B 返回 `<C />`
5. C 未被标记，但因为父级 B 渲染了，React 继续向下渲染 C，C 返回 `<D />`
6. D 也未被标记，但因为父级 C 渲染了，React 继续渲染 D

**总结两条关键规则：**

> ✅ 渲染一个组件，默认情况下会导致其内部所有组件也被渲染！

> ✅ 正常渲染时，React 不关心 props 是否改变——只要父组件渲染了，子组件就会被无条件渲染！

调用根组件 `<App>` 的 `setState()` 会导致 React 重渲染**整个组件树**的每个组件。大多数组件可能返回与上次完全相同的输出，所以 React 不需要修改 DOM——但 React 仍然要完成询问组件渲染自身、对比输出的工作。

> **记住：渲染本身不是坏事——这正是 React 判断是否需要修改 DOM 的方式！**

---

### React 渲染规则

渲染逻辑必须是**纯粹的（pure）**，不能有副作用！

**渲染逻辑不可以：**
- ❌ 修改已存在的变量和对象
- ❌ 创建随机值，如 `Math.random()` 或 `Date.now()`
- ❌ 发起网络请求
- ❌ 排队状态更新

**渲染逻辑可以：**
- ✅ 修改渲染过程中新创建的对象
- ✅ 抛出错误
- ✅ "懒初始化"尚未创建的数据（如缓存值）

---

### 组件元数据与 Fiber

React 存储了一个内部数据结构，用于跟踪应用中所有当前存在的组件实例。这个数据结构的核心对象叫做 **"fiber"**，它包含描述以下内容的元数据字段：

- 在组件树的这个位置应渲染什么类型的组件
- 与该组件关联的当前 props 和 state
- 指向父、兄弟、子组件的指针
- React 用于跟踪渲染过程的其他内部元数据

Fiber 类型的简化版本：

```ts
export type Fiber = {
  tag: WorkTag;           // 标识 fiber 类型
  key: null | string;     // 子节点的唯一标识符
  type: any;              // 与此 fiber 关联的函数/类
  child: Fiber | null;
  sibling: Fiber | null;
  index: number;
  pendingProps: any;      // 进入此 fiber 的数据（参数/props）
  memoizedProps: any;     // 用于创建输出的 props
  updateQueue: Array<State | StateUpdaters>;  // 状态更新和回调的队列
  memoizedState: any;     // 用于创建输出的 state
  dependencies: Dependencies | null;  // 此 fiber 的依赖（contexts, events）
};
```

在渲染过程中，React 会遍历这个 fiber 对象树，并在计算新渲染结果时构建更新后的树。

**关键点**：
- 这些 fiber 对象存储了真实的组件 props 和 state 值
- 当你在组件中使用 `props` 和 `state` 时，React 实际上是让你访问存储在 fiber 对象上的值
- React hooks 之所以能工作，是因为 React 将组件的所有 hooks 存储为挂接到该组件 fiber 对象上的链表

---

### 组件类型与协调

React 在重渲染时会尝试高效复用现有的组件树和 DOM 结构。如果你要求 React 在树的同一位置渲染相同类型的组件或 HTML 节点，React 会复用并在适当时应用更新，而不是从头重新创建。

**React 的渲染逻辑首先基于 `type` 字段使用 `===` 引用比较来比较元素。** 如果某个位置的元素类型发生了变化（比如从 `<div>` 变成 `<span>`，或从 `<ComponentA>` 变成 `<ComponentB>`），React 会假设整个子树已经变化，销毁整个现有组件树区段（包括所有 DOM 节点），然后用新实例从头重建。

**这意味着永远不要在渲染过程中创建新的组件类型！**

```jsx
// ❌ 错误！每次渲染都会创建新的 ChildComponent 引用！
function ParentComponent() {
  function ChildComponent() {
    return <div>Hi</div>;
  }
  return <ChildComponent />;
}

// ✅ 正确：组件定义在外部，只创建一次引用
function ChildComponent() {
  return <div>Hi</div>;
}
function ParentComponent() {
  return <ChildComponent />;
}
```

---

### Key 与协调

React 通过 **`key`** 这个伪 prop 来识别组件"实例"。`key` 不是真正的 prop——它是给 React 的指令，永远不会传递给实际组件（即永远无法访问 `props.key`）。

**key 在渲染列表时尤其重要**，特别是当数据可能被重新排序、添加或删除时。**尽量使用数据对象的唯一 ID 作为 key，仅在无法获取时才用数组下标作为 key。**

```jsx
// ✅ 使用数据对象的 ID 作为列表项的 key
todos.map((todo) => <TodoListItem key={todo.id} todo={todo} />);
```

**为什么数组下标作为 key 会导致问题？**

假设有 10 个 `<TodoListItem>`，key 为 `0..9`。删除第 6、7 项，末尾添加 3 个新条目后，key 变为 `0..10`。React 会以为只是在末尾新增了一项，从而重用现有 DOM 节点和组件实例。这会导致渲染数据错位，还需要不必要地更新多个列表项。

使用 `key={todo.id}` 时，React 能正确识别出删除了 2 项、新增了 3 项，会销毁 2 个旧实例，创建 3 个新实例，效率更高。

**key 还有更多用途**：可以在任何组件上添加 `key`，来指示其 identity。修改 key 会让 React 销毁旧实例并创建新实例。常见用例是 **"列表 + 详情表单"** 组合：

```jsx
// 当选中项变化时，销毁并重建表单实例，避免表单内残留旧状态
<DetailForm key={selectedItem.id} />
```

---

### 渲染批处理与时机

**React 会自动对多次 `setState()` 调用进行批处理**，将多次调用合并为一次渲染，而不是每次调用都触发一次渲染。

**React 17 及更早版本**：只在 React 事件处理程序（如 `onClick` 回调）中进行批处理。在事件处理程序之外（如 `setTimeout`、`await` 之后、普通 JS 事件处理程序中）排队的更新不会被批处理，每次都会单独触发重渲染。

**React 18**：对任意单个事件循环 tick 中排队的所有更新进行**自动批处理**。

```js
const [counter, setCounter] = useState(0);

const onClick = async () => {
  setCounter(0);
  setCounter(1);      // ← 与上一行合并为一次渲染

  const data = await fetchSomeData();

  setCounter(2);
  setCounter(3);      // ← 与上一行合并为一次渲染
};
```

- **React 17**：执行 **3 次**渲染（前两个批处理，后两个各自独立）
- **React 18**：执行 **2 次**渲染（前两个批处理，后两个也批处理）

React 18 提供了 `flushSync()` API 来强制立即渲染，退出自动批处理。

---

### 异步渲染、闭包与状态快照

一个极其常见的误解：

```js
function MyComponent() {
  const [counter, setCounter] = useState(0);

  const handleClick = () => {
    setCounter(counter + 1);
    // ❌ 这里打印的是旧值！
    console.log(counter);
  };
}
```

**为什么不生效？**

`handleClick` 是一个**闭包**——它只能看到函数定义时存在的变量值。换句话说，这些状态变量是**时间快照**。

`handleClick` 在最近一次渲染时被定义，因此它只能看到该次渲染时 `counter` 的值。调用 `setCounter()` 排队了未来的渲染，那次未来的渲染会有新的 `counter` 变量和新的 `handleClick` 函数……但当前这个 `handleClick` 永远无法看到新值。

> 新 React 文档在 [State as a Snapshot](https://react.dev/learn/adding-interactivity#state-as-a-snapshot) 一节中详细介绍了这个概念。

---

### 渲染行为的边界情况

#### Commit 阶段生命周期

`componentDidMount`、`componentDidUpdate` 和 `useLayoutEffect` 存在于 commit 阶段，允许在渲染后、浏览器绘制前执行额外逻辑。

常见用例：
1. 第一次用部分数据渲染组件
2. 在 commit 阶段生命周期中用 refs 测量真实 DOM 节点的大小
3. 根据测量结果设置 state
4. 立即用更新后的数据重新渲染

由于 React 总是在 commit 阶段生命周期中**同步**运行渲染，只有"最终"内容会显示在屏幕上。

`useEffect` 回调中的状态更新会被排队，在所有 `useEffect` 回调完成后的"Passive Effects"阶段末尾统一刷新。

#### 协调器批处理方法

- **React 17 及更早**：可用 `unstable_batchedUpdates()` 将事件处理程序外的多次更新打包
- **React 18**：提供 `flushSync()` API 强制立即渲染、退出自动批处理

#### `<StrictMode>`

在开发模式下，`<StrictMode>` 标签内的组件会被**双重渲染**。因此不能依靠 `console.log()` 来计算渲染次数。应改用 React DevTools Profiler 或在 `useEffect` / `componentDidMount/Update` 中添加日志。

#### 渲染时设置 State

通常不应该在渲染逻辑中排队状态更新。但有一个例外：**函数组件可以在渲染时有条件地调用 `setSomeState()`**（相当于类组件中的 `getDerivedStateFromProps`）。React 会立即应用状态更新并同步重渲染该组件。如果组件无限排队更新，React 在一定次数（目前为 50 次）后会报错。

---

## 提升渲染性能

虽然渲染是 React 正常工作的一部分，但有时渲染工作是"浪费的"努力。如果组件的渲染输出没有改变，那对应部分的 DOM 就不需要更新，渲染该组件的工作就是多余的。

**两种基本优化方法：**
1. 把同样的工作做得更快
2. 做更少的工作

优化 React 渲染主要是第二种——在适当时跳过组件渲染。

---

### 组件渲染优化技术

React 提供了三个主要 API，允许我们潜在地跳过渲染：

**1. `React.memo()`**

内置的高阶组件，接受你的组件类型作为参数，返回一个包装组件。默认行为是检查 props 是否改变，如未改变则阻止重渲染。函数组件和类组件都可以用 `React.memo()` 包装。

**2. `React.Component.shouldComponentUpdate`**

可选的类组件生命周期方法，返回 `false` 时跳过渲染。

**3. `React.PureComponent`**

实现了 props 和 state 的浅比较作为默认的 `shouldComponentUpdate`。

这些方法都使用**浅相等（shallow equality）**比较：检查两个对象的每个字段，用 `===` 对比各值。实际上相当于：

```js
const shouldRender = !shallowEqual(newProps, prevProps);
```

**还有一种鲜为人知的技术**：如果 React 组件在渲染输出中返回与上次完全相同的元素引用，React 会跳过重渲染该子组件。

```jsx
// 方式一：props.children 技术（当父组件状态更新时，children 不会重渲染）
function SomeProvider({ children }) {
  const [counter, setCounter] = useState(0);
  return (
    <div>
      <button onClick={() => setCounter(counter + 1)}>Count: {counter}</button>
      <OtherChildComponent />
      {children}
    </div>
  );
}

// 方式二：useMemo 技术（dependencies 不变时，memoizedElement 引用不变）
function OptimizedParent() {
  const [counter1, setCounter1] = useState(0);
  const [counter2, setCounter2] = useState(0);

  const memoizedElement = useMemo(() => {
    // 只有 counter1 变化时才重新渲染 ExpensiveChildComponent
    return <ExpensiveChildComponent />;
  }, [counter1]);

  return (
    <div>
      <button onClick={() => setCounter1(counter1 + 1)}>Counter 1: {counter1}</button>
      <button onClick={() => setCounter2(counter2 + 1)}>Counter 2: {counter2}</button>
      {memoizedElement}
    </div>
  );
}
```

概念上的区别：
- `React.memo()`：由**子组件**控制
- 相同元素引用：由**父组件**控制

对于所有这些技术，**跳过渲染一个组件意味着 React 也会跳过渲染该整个子树**，因为它有效地阻止了默认的"递归渲染子组件"行为。

---

### 新 Props 引用如何影响渲染优化

默认情况下，React 会重渲染所有嵌套组件，即使它们的 props 没有改变。这意味着传递新引用作为 props 无关紧要——子组件无论如何都会渲染。

```jsx
// 这完全没问题——NormalChildComponent 无论如何都会渲染
function ParentComponent() {
  const onClick = () => { console.log('Button clicked'); };
  const data = { a: 1, b: 2 };
  return <NormalChildComponent onClick={onClick} data={data} />;
}
```

但如果子组件尝试通过检查 props 是否改变来优化渲染，传递新引用会导致子组件渲染：

```jsx
const MemoizedChildComponent = React.memo(ChildComponent);

function ParentComponent() {
  const onClick = () => { console.log('Button clicked'); };  // 每次新引用！
  const data = { a: 1, b: 2 };  // 每次新引用！
  return <MemoizedChildComponent onClick={onClick} data={data} />;
}
```

这会导致 `MemoizedChildComponent` 总是重渲染，因为每次渲染都会创建新的函数引用和对象引用，memo 的比较工作也就白费了。

类似地，`<MemoizedChild><OtherComponent /></MemoizedChild>` 也会强制子组件总是渲染，因为 `props.children` 始终是新引用。

---

### 优化 Props 引用

React 提供了两个 hook 来帮助复用相同引用：

- **`useMemo`**：用于任何类型的通用数据，如创建对象或进行复杂计算
- **`useCallback`**：专门用于创建回调函数

```jsx
const MemoizedChildComponent = React.memo(ChildComponent);

function ParentComponent() {
  const onClick = useCallback(() => {
    console.log('Button clicked');
  }, []); // 空依赖数组 = 只创建一次

  const data = useMemo(() => ({ a: 1, b: 2 }), []); // 只创建一次

  return <MemoizedChildComponent onClick={onClick} data={data} />;
}
```

---

### 是否应该到处加 memo？

**不需要**对全部函数或对象使用 `useMemo` 和 `useCallback`——只在确实会影响子组件行为时才需要。

**为什么 React 不默认把所有组件包装在 `React.memo()` 里？**

Dan Abramov 指出：memoization 本身也有比较 props 的开销，而且很多情况下 memoization 检查永远无法阻止重渲染（因为组件总是收到新的 props）。就像不会对每个函数都使用 `Lodash.memoize()` 一样。

React 官方新文档的说法：

> 只有当组件经常以完全相同的 props 重渲染，且其渲染逻辑很昂贵时，使用 `memo` 才有价值。如果你的组件重渲染时没有明显延迟，`memo` 是不必要的。如果传入的 props 总是不同的（比如对象或在渲染时定义的函数），`memo` 完全无用——这就是为什么通常需要 `useMemo` 和 `useCallback` 配合 `memo` 使用。

---

### 不可变性与重渲染

React 中的状态更新**必须以不可变方式进行**，主要原因：

1. 依赖 `!shallowEqual(newProps, prevProps)` 进行优化的组件，会因 mutation 错误地以为没有任何变化
2. `useState` 和 `useReducer` 要求新状态值必须是新引用

```js
const [todos, setTodos] = useState(someTodosArray);

// ❌ 错误：同一引用，组件不会重新渲染
const onClick = () => {
  todos[3].completed = true;
  setTodos(todos); // 同一数组引用！
};

// ✅ 正确：创建新数组引用
const onClick = () => {
  const newTodos = todos.slice();
  newTodos[3].completed = true;
  setTodos(newTodos);
};
```

> **注意**：类组件的 `this.setState()` 并不关心是否发生了 mutation——它总是完成重渲染。但 `useState/useReducer` 需要新引用。

**底线：React 及整个 React 生态系统都假设以不可变方式更新。任何时候发生 mutation，都有产生 bug 的风险。不要这样做。**

---

### 测量 React 组件渲染性能

使用 [React DevTools Profiler](https://reactjs.org/blog/2018/09/10/introducing-the-react-profiler.html) 查看每次 commit 中哪些组件在渲染。找出意外渲染的组件，用 DevTools 分析其渲染原因，然后修复（可能通过 `React.memo()` 包装，或让父组件 memoize 传下来的 props）。

> ⚠️ **注意**：React 在开发构建中运行速度要慢得多。可以在开发模式下进行相对时间的对比分析，但**绝不要用 React 开发构建来测量绝对渲染时间**——只在生产构建中测量绝对时间！

---

## Context 与渲染行为

Context API 是一种让单个用户提供的值对一个组件子树可用的机制。`<MyContext.Provider>` 内的任何组件都可以读取该上下文实例中的值，而无需通过每个中间组件显式传递 prop。

**Context 不是"状态管理"工具**。你必须自己管理传入上下文的值，通常通过将数据保存在 React 组件 state 中，并基于该数据构建上下文值。

---

### Context 基础

上下文提供者接收单个 `value` prop：

```jsx
<MyContext.Provider value={42}>
```

子组件可以通过渲染消费者组件或使用 `useContext` hook 来消费上下文：

```jsx
// 方式一：Consumer 组件
<MyContext.Consumer>{ (value) => <div>{value}</div> }</MyContext.Consumer>

// 方式二：useContext hook（推荐）
const value = useContext(MyContext);
```

---

### 更新 Context 值

当组件渲染了 context provider 时，React 会检查是否给该 provider 提供了新值。如果 provider 的值是新引用，React 就知道值已更改，消费该 context 的组件需要更新。

**注意：向 context provider 传递新对象会导致它更新：**

```jsx
function ParentComponent() {
  const [a, setA] = useState(0);
  const [b, setB] = useState('text');

  const contextValue = { a, b }; // 每次渲染都是新对象引用！

  return (
    <MyContext.Provider value={contextValue}>
      <ChildComponent />
    </MyContext.Provider>
  );
}
```

**每次 `ParentComponent` 渲染时，React 都会注意到 `MyContext.Provider` 被赋予了新值，并迫使消费该 context 的所有嵌套组件重渲染。**

目前没有办法让消费 context 的组件跳过由新 context 值引起的更新，即使它只关心值的一部分。

---

### 状态更新、Context 与重渲染

将各知识点联系起来：

- 调用 `setState()` 会排队该组件的渲染
- React 默认递归渲染嵌套组件
- Context providers 由渲染它们的组件提供值
- 该值通常来自父组件的 state

因此，**默认情况下，任何渲染了 context provider 的父组件的状态更新，会导致其所有后代重渲染——无论它们是否读取了 context 值！**

实际上，子组件通常是因为**父组件渲染了**而重渲染，而不是因为 context 更新。

---

### Context 更新与渲染优化

```jsx
function GreatGrandchildComponent() {
  return <div>Hi</div>;
}

function GrandchildComponent() {
  const value = useContext(MyContext);
  return (
    <div>
      {value.a}
      <GreatGrandchildComponent />
    </div>
  );
}

function ChildComponent() {
  return <GrandchildComponent />;
}

const MemoizedChildComponent = React.memo(ChildComponent);

function ParentComponent() {
  const [a, setA] = useState(0);
  const [b, setB] = useState("text");
  const contextValue = {a, b};

  return (
    <MyContext.Provider value={contextValue}>
      <MemoizedChildComponent />
    </MyContext.Provider>
  );
}
```

调用 `setA(42)` 时：

1. `ParentComponent` 渲染，创建新的 `contextValue` 引用
2. React 看到 `MyContext.Provider` 有新值，需要更新 context 消费者
3. React 尝试渲染 `MemoizedChildComponent`，但它用 `React.memo()` 包装，没有 props 传入，因此**跳过渲染 ChildComponent**
4. 但 `MyContext.Provider` 有了更新，可能有更下方的组件需要知道
5. React 继续向下到 `GrandchildComponent`，看到它读取 `MyContext`，**因为 context 变化而强制重渲染它**
6. 由于 `GrandchildComponent` 渲染了，`GreatGrandchildComponent` 也随之渲染

> 正如 Sophie Alpert 所说：**"Context Provider 正下方的 React 组件可能应该使用 `React.memo`"**

这样，父组件的状态更新就不会强制所有组件重渲染，只有读取到 context 的部分才会更新。（也可以通过让 `ParentComponent` 渲染 `<MyContext.Provider>{props.children}</MyContext.Provider>` 实现类似效果。）

**注意**：一旦 `GrandchildComponent` 因新 context 值而渲染，React 就会回到默认行为——递归重渲染其内部的所有内容。

---

### Context 与渲染器边界

如果应用中存在多个渲染器（如 ReactDOM 内使用 React-Three-Fiber），context providers 不会跨渲染器边界传递。这是 React 的已知限制。

解决方案：可以使用 [its-fine](https://github.com/pmndrs/its-fine) 库中的 `useContextBridge` hook 作为有效的 workaround。

---

## React-Redux 与渲染行为

"Context vs Redux" 是 React 社区最常被问到的问题之一。但这其实是一个[错误的二选一问题](https://blog.isquaredsoftware.com/2021/01/context-redux-differences/)——Redux 和 Context 是不同的工具，做不同的事。

---

### React-Redux 订阅机制

React-Redux 使用 context 传递的是 **Redux store 实例**，而不是当前 state 值。因此传入 `<ReactReduxContext.Provider>` 的始终是同一个 context 值。

Redux store 在每次 dispatch action 时都会运行所有订阅者通知回调。React-Redux 订阅 Redux store 并在回调中读取最新 state、diff 值，如果相关数据发生变化则强制重渲染。

**性能特点**：

与 context 相比，组件不需要因父组件渲染而重渲染，但每次 store 状态更新时都需要运行整个组件树的 `mapState/useSelector` 函数。通常选择器的开销小于 React 进行另一次渲染的开销，所以通常是净收益——但这是必须要做的工作。

---

### connect 与 useSelector 的区别

**`connect`** 是高阶组件，包装你的组件，在 props 未改变时阻止重渲染。它等价于 `PureComponent/React.memo()`，是防火墙，阻止默认渲染行为向下级联。

- 有很多 connect 组件 → 大多数重渲染级联仅限于组件树的一小部分
- 每个 connect 组件读取的数据更少 → 重渲染的可能性更低

**`useSelector`** 是 hook，无法阻止父组件渲染导致的子组件渲染。

> ⚠️ **关键性能差异**：用 `connect` 时，每个 connect 组件像 `React.memo()` 一样充当防火墙，防止渲染级联。纯用 `useSelector` 时，组件树中较大的部分可能因 Redux store 更新而重渲染——因为没有其他 connect 组件来阻止渲染级联向下传播。

如果这成为性能问题，解决方案是根据需要手动将组件包装在 `React.memo()` 中。

---

## 未来的 React 改进

### React Compiler（原"React Forget"）

> **注：截至 2024 年，React Compiler 已正式发布，可作为 Babel 插件使用。**

React Compiler 旨在通过静态分析和转换函数组件体，自动添加 memoization 能力。它不仅会 memoize hook 依赖数组，还会 memoize JSX 元素返回值。

结合 React 的"相同元素引用"优化，React Compiler 有可能**自动消除整个 React 组件树中的不必要渲染**！

---

### Context Selectors

目前，消费 context 的组件无法选择性地订阅 context 值的某一部分，导致任何 context 值更新都会强制所有消费者重渲染。

社区提出了"context selectors" API 的 RFC，Andrew Clark 于 2021 年 1 月实现了概念验证，但目前尚无进一步进展。

在此之前，可以使用 Daishi Kato 维护的 [use-context-selector](https://github.com/dai-shi/use-context-selector) 库作为 polyfill。如果该特性最终发布，`Context + useReducer` 组合对于管理大量 React 应用状态会更具可行性。

---

## 总结

- React 默认**递归渲染所有子组件**，当父组件渲染时，其子组件也会渲染
- 渲染本身没有问题——这是 React 知道需要做什么 DOM 变更的方式
- **渲染会花时间**，UI 输出没有改变的"浪费渲染"会积累开销
- 大多数时候传递新引用（如回调函数、对象）是没问题的
- `React.memo()` 等 API 可以在 props 未改变时跳过不必要的渲染
- 但**如果总是传递新引用作为 props，`React.memo()` 永远无法跳过渲染**——可能需要 memoize 这些值
- Context 使值可访问于任何深层嵌套的感兴趣组件
- **Context provider 通过引用比较来判断值是否改变**
- 新的 context 值会强制所有嵌套消费者重渲染
- 但通常子组件本来就会因正常的父→子渲染级联而重渲染
- 建议在 context provider 的子组件上使用 `React.memo()`，或用 `{props.children}`，以避免整棵树在更新 context 值时都重渲染
- 当子组件基于新 context 值渲染时，React 会继续向下级联渲染
- **React-Redux 使用对 Redux store 的订阅来检查更新**，而不是通过 context 传递 store state
- 订阅在每次 Redux store 更新时都运行，需要尽可能快
- React-Redux 做了大量工作来确保只有数据改变的组件被强制重渲染
- `connect` 就像 `React.memo()`，大量 connect 组件可以最小化一次性渲染的组件数量
- `useSelector` 是 hook，无法阻止父组件引起的渲染。如果全用 `useSelector`，应考虑给某些组件加 `React.memo()` 来避免渲染级联
- **React Compiler 可能会大幅简化这一切**

---

## 最终思考

整个情况比 "context 让所有东西渲染，Redux 不会，用 Redux" 要复杂得多。

**何时使用 Context？**
- 只需要传递不常改变的简单值
- 有一些需在应用部分区域访问的 state 或函数，不想一路传递 props
- 想使用 React 内置功能而不添加额外库

**何时使用（React-）Redux？**
- 有大量应用状态需要在很多地方使用
- 应用状态随时间频繁更新
- 更新状态的逻辑可能很复杂
- 应用代码库规模中等或大型，可能由多人协作

> 请注意这些不是硬性规则，而是建议的参考指南。请根据实际情况选择最适合的工具。

---

*原文作者：Mark Erikson（Redux 维护者）*
*原文地址：https://blog.isquaredsoftware.com/2020/05/blogged-answers-a-mostly-complete-guide-to-react-rendering-behavior/*
