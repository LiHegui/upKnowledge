# React 原理深入学习计划（一周速通版）

> 开始日期：2026-04-08
> 预计周期：7 天（1 周）
> 每日时长：2 ~ 2.5 小时
> 当前阶段：Day 1
> 基础情况：会用 React（Hooks / 组件），原理待深入

---

## 学习路线图

### Day 1 — JSX & 虚拟 DOM & Fiber 地基

**目标**：一天打通「JSX → ReactElement → Fiber 节点」的认知链路

| 时间  | 内容                                                                  |
| ----- | --------------------------------------------------------------------- |
| 30min | JSX 本质 → Babel 编译 →`React.createElement` → ReactElement 结构 |
| 30min | 虚拟 DOM 是什么、为什么需要它、与真实 DOM 的关系                      |
| 40min | 旧 Stack Reconciler 的问题 → Fiber 诞生背景 → Fiber 节点字段结构    |
| 20min | 总结：用自己语言描述「JSX 到 Fiber」的过程                            |

- [ ] 理解 JSX 编译产物，能说出 ReactElement 的关键字段

  JSX: `<MyComponent a={42} b="testing"}, "Text Here"> -> React.createElement(MyComponent, {a: 42, b: 'testing'}, "Text Here"})) -> {}`
- [ ] 能说出 Fiber 节点包含哪些关键字段（child / sibling / return / effectTag）
- [ ] 知道 Fiber 为什么用链表代替递归

---

### Day 2 — 渲染流程：Render Phase & Commit Phase

**目标**：搞清楚 React 一次渲染的完整流程，理解「可中断」的本质

| 时间  | 内容                                                            |
| ----- | --------------------------------------------------------------- |
| 40min | Render Phase：beginWork → completeWork，构建 WorkInProgress 树 |
| 30min | 双缓冲机制：current 树 vs workInProgress 树，何时切换           |
| 30min | Commit Phase 三个子阶段：beforeMutation / mutation / layout     |
| 20min | 总结：为什么 Render Phase 可中断而 Commit Phase 不能            |

- [ ] 能区分 Render Phase 和 Commit Phase 的职责
- [ ] 理解双缓冲树切换时机
- [ ] 知道 `useEffect` 和 `useLayoutEffect` 分别在哪个阶段触发

---

### Day 3 — Scheduler 调度 & Reconciler diff 算法

**目标**：理解 React 如何调度任务优先级，以及 diff 的核心策略

| 时间  | 内容                                                      |
| ----- | --------------------------------------------------------- |
| 40min | Scheduler：时间切片原理、MessageChannel 实现、5ms 时间片  |
| 20min | 优先级模型：Lane 模型，哪些更新是高优先级                 |
| 50min | diff 算法三个策略：跨层不比、类型不同直接替换、同层用 key |
| 20min | 实验：手动推演 key 变化时 diff 的结果（移动 vs 删除重建） |

- [ ] 能解释时间切片为什么用 MessageChannel 而不是 setTimeout
- [ ] 知道 diff 算法的三条核心假设
- [ ] 理解 key 的本质作用

---

### Day 4 — useState & useReducer 原理

**目标**：理解 Hooks 底层数据结构，彻底搞懂「为何不能在条件中用 Hook」

| 时间  | 内容                                                                      |
| ----- | ------------------------------------------------------------------------- |
| 30min | Hook 链表结构：每个 Fiber 的 `memoizedState` 存放 Hook 单链表           |
| 30min | mount 阶段 vs update 阶段：`mountState` / `updateState` 的区别        |
| 40min | dispatch 触发更新的完整链路：queue → scheduler → reconciler → renderer |
| 40min | 🛠️ 手写极简 useState（闭包版理解链表版）                                |

- [ ] 能画出 Hook 链表结构图
- [ ] 解释「为何不能在条件中用 Hook」（链表顺序必须稳定）
- [ ] 手写的 useState 能跑通简单 demo

---

### Day 5 — useEffect / useLayoutEffect / useRef / useMemo 原理

**目标**：高频 Hooks 原理全部拿下，能解答面试中的时机类问题

| 时间  | 内容                                                                         |
| ----- | ---------------------------------------------------------------------------- |
| 35min | `useEffect`：副作用链表、异步执行（宏任务）、cleanup 机制                  |
| 25min | `useLayoutEffect`：同步执行（Commit layout 阶段）、与 useEffect 的本质区别 |
| 25min | `useRef`：ref 对象为何能跨渲染保持引用（Hook 链表节点不重建）              |
| 25min | `useMemo` / `useCallback`：依赖数组浅比较、缓存值 vs 缓存函数            |
| 20min | 总结：画出 5 个 Hook 的执行时机对比表                                        |

- [ ] 能准确说出 useEffect 和 useLayoutEffect 的执行时序差异
- [ ] 理解 useRef 不触发重渲染的原因
- [ ] 能解释 useMemo 什么时候用、什么时候没必要用

---

### Day 6 — 合成事件 & Context & 并发模式

**目标**：覆盖面试高频考点，理解 React 事件系统和 Concurrent 特性

| 时间  | 内容                                                                      |
| ----- | ------------------------------------------------------------------------- |
| 35min | 合成事件：事件委托到根节点、SyntheticEvent 包装、与原生事件的冒泡顺序差异 |
| 20min | 合成事件踩坑：`e.stopPropagation()` 的作用范围                          |
| 30min | Context 原理：Provider value 变化 → 订阅它的消费者组件强制重渲染         |
| 35min | Concurrent Mode：`startTransition` 低优更新、`Suspense` 挂起机制      |
| 20min | 总结：整理合成事件 vs 原生事件的对比表                                    |

- [ ] 能解释 React 事件委托的原理
- [ ] 理解 Context 更新触发重渲染的链路
- [ ] 能举例说明 startTransition 的使用场景

---

### Day 7 — 手写 Mini React + 总结收尾

**目标**：动手实现，把 6 天知识全部串联，形成完整知识体系

| 时间  | 内容                                                           |
| ----- | -------------------------------------------------------------- |
| 60min | 🛠️ 手写 Mini React：createElement + render + useState        |
| 40min | 梳理核心原理笔记，整理 8 个必背面试高频问题                    |
| 30min | 写入知识库：将核心原理补充到 `docs/interview/React/index.md` |

- [ ] Mini React 能渲染组件并响应 useState 更新
- [ ] 能不看资料说出 Fiber / diff / Hooks / 合成事件 的核心原理
- [ ] 知识库更新完成

---

## 进度追踪

| Day   | 主题                              | 状态      | 完成日期 |
| ----- | --------------------------------- | --------- | -------- |
| Day 1 | JSX & 虚拟 DOM & Fiber 地基       | 🔄 进行中 | -        |
| Day 2 | 渲染流程：Render / Commit Phase   | ⏳ 未开始 | -        |
| Day 3 | Scheduler 调度 & diff 算法        | ⏳ 未开始 | -        |
| Day 4 | useState & useReducer 原理        | ⏳ 未开始 | -        |
| Day 5 | useEffect / useRef / useMemo 原理 | ⏳ 未开始 | -        |
| Day 6 | 合成事件 & Context & 并发模式     | ⏳ 未开始 | -        |
| Day 7 | 手写 Mini React + 总结收尾        | ⏳ 未开始 | -        |

---

## 每日学习记录

### Day 1 — 2026-04-08

**📌 今日目标**：JSX & 虚拟 DOM & Fiber 地基（打通认知链路，共 ~2h）

**🔍 学习要点提示**：

- JSX → `React.createElement(type, props, ...children)` → 返回 ReactElement 对象 `{ type, key, ref, props, $$typeof }`
- 虚拟 DOM 的真正价值：**跨平台** + **批量最小化 DOM 操作**（不是「比真实 DOM 快」）
- 旧 Stack Reconciler 用递归遍历，无法中断 → 长任务卡住主线程
- Fiber 用链表（`child` / `sibling` / `return`）+ 循环代替递归，每处理一个节点就可暂停

**💡 推荐资源**：

- [Babel REPL](https://babeljs.io/repl) — 粘贴 JSX 实时看编译结果
- 搜索：「React Fiber Lin Clark A Cartoon Intro」— 经典动画演示

**💻 代码练习**：

```jsx
// 练习一：在 Babel REPL 中输入，观察编译产物
const element = (
  <div className="app">
    <h1>Hello React</h1>
    <p>速通第一天</p>
  </div>
);

// 练习二：手写极简 createElement，理解 ReactElement 结构
function createElement(type, props, ...children) {
  return {
    type,
    props: { ...props, children: children.length === 1 ? children[0] : children },
  };
}

// 练习三：尝试描述一个 Fiber 节点的结构（字段含义）
const fiber = {
  type: 'div',
  stateNode: null,   // 真实 DOM
  child: null,       // 第一个子节点
  sibling: null,     // 下一个兄弟节点
  return: null,      // 父节点
  memoizedState: null, // Hook 链表
  effectTag: 'PLACEMENT',
};
```

**✏️ 学习笔记**：

<!-- 手动填写：今天的核心收获 -->

**❓ 疑问记录**：

<!-- 遇到的疑问，下次对话告诉我 -->

**⭐ 一句话总结**：

<!-- 用一句话描述今天最重要的收获 -->

---

> 📝 **Day 2 ~ Day 7**：每天说「给我今天的任务」或「继续学习计划」，我会根据你的进度生成当日详细任务 + 资源 + 练习，并自动更新到本文档。
