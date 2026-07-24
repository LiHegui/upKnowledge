# React Fiber 架构与 Diff 算法深度解析

> 本文围绕 **"Fiber 是什么 → 双缓冲机制 → 协调流程 → Diff 策略"** 这条主线，帮你建立对 React 内部调和过程的完整认知。
> 背景：JavaScript 执行和浏览器渲染**共享同一个主线程**。浏览器通过事件循环（Event Loop）交替处理 JavaScript 任务和渲染任务，长 JavaScript 任务会阻塞渲染，造成页面卡顿。

---

## 目录

- [一、什么是 Fiber？核心字段拆解](#一什么是-fiber核心字段拆解)
- [二、双缓冲树机制](#二双缓冲树机制)
- [三、协调流程总览：beginWork → completeWork](#三协调流程总览beginwork--completework)
- [四、单节点 Diff —— reconcileSingleElement](#四单节点-diff--reconcilesingleelement)
- [五、多节点 Diff —— reconcileChildrenArray 两轮遍历](#五多节点-diff--reconcilechildrenarray-两轮遍历)
- [六、key 的本质作用](#六key-的本质作用)
- [七、首次挂载 vs 更新对比总结](#七首次挂载-vs-更新对比总结)
- [🎤 面试回答完整版（10分版）](#-面试回答完整版10分版)

---

## 一、什么是 Fiber？核心字段拆解

**Fiber** 是 React 16 重写内核后引入的核心数据结构，本质是一个 **JavaScript 对象**。每个 React 组件（或 DOM 节点）都对应一个 Fiber 节点，它在整个组件的生命周期内**持久存在**，是 React 协调引擎真正操作的对象。

> ⚠️ **注意**：React Element 每次渲染都会重新生成，但 Fiber 节点不会——它被复用并持续更新。

### Fiber 节点核心字段

| 分组 | 字段 | 说明 |
|:---:|------|------|
| 🏷️ 身份 | `type` | 组件函数本身（函数组件）或字符串 `'div'`（宿主节点）。Diff 的关键依据之一。 |
| 🏷️ 身份 | `key` | 用户显式设置的唯一标识，优先于 type 进行列表项匹配。 |
| 🏷️ 身份 | `tag` | Fiber 类型枚举：函数组件（0）、类组件（1）、HostComponent（5，即原生 DOM 节点）等。 |
| 📦 状态 | `pendingProps` | 本次渲染即将使用的新 props，由父组件传入或 React Element 提供。 |
| 📦 状态 | `memoizedState` | 函数组件的 Hook 链表头节点；或类组件的 `this.state`。上次渲染后的已确认状态。 |
| 📦 状态 | `memoizedProps` | 上次渲染后已确认的 props，用于本次与 pendingProps 对比。 |
| ⚡ 副作用 | `flags`（effectTag） | 标记本节点需要在 Commit 阶段进行什么 DOM 操作：Placement（插入）、Update（更新）、Deletion（删除）。 |
| ⚡ 副作用 | `updateQueue` | 待处理的状态更新队列，`setState` 产生的 Update 对象会挂载在这里等待处理。 |
| 🌳 树结构 | `return` | 指向父 Fiber 节点（注意：不是 `parent`，React 历史命名习惯）。 |
| 🌳 树结构 | `child` | 指向第一个子 Fiber 节点。 |
|  树结构 | `sibling` | 指向下一个兄弟 Fiber 节点。通过 `child → sibling → sibling` 链表表达多个子节点。 |
| 🔄 双缓冲 | `alternate` | 指向另一棵树中对应的 Fiber 节点（current ↔ workInProgress 互相引用）。 |
| 🔄 双缓冲 | `stateNode` | 类组件实例（`this`）、函数组件为 `null`、DOM 节点为真实 DOM 引用。 |

> 💡 Fiber 节点通过 `return / child / sibling` 三个指针把整棵组件树表示成一个**单链表**，这让 React 可以随时中断遍历，并在之后恢复——这是并发模式（Concurrent Mode）可中断渲染的基础。

---

## 二、双缓冲树机制

React 内部始终维护**两棵 Fiber 树**：

- **current 树**：当前屏幕上正在显示的内容所对应的 Fiber 树，`FiberRoot.current` 指向它的根节点。
- **workInProgress（WIP）树**：正在构建中的、描述"下一帧"内容的 Fiber 树。

当一次更新完成、WIP 树被 Commit 到 DOM 后，`FiberRoot.current` 会切换指向 WIP 树，原来的 current 树则成为下一次更新的"旧树"。这种"乒乓切换"的设计就叫做**双缓冲（Double Buffering）**。

### 双缓冲工作示意图

```
current 树（屏幕上正在显示）        workInProgress 树（正在构建）

  FiberRoot                          FiberRoot
    └─ App                             └─ App
       ├─ Header                          ├─ Header
       └─ Content                         └─ Content
          └─ List (旧 props)                 └─ List (新 props 🔄)
              ↑                                  ↑
              └────────── alternate 互指 ─────────┘

Commit 完成后 → FiberRoot.current 切换指向 WIP 树
→ 原 current 树变成下一次的"旧树"
```

### 完整的指针切换流程

```
WIP 树构建完成 → Commit 写入 DOM → FiberRoot.current = WIP → 原 current 变成下次的"旧树"
```

> ⚠️ **为什么这样设计？** 双缓冲确保了"在建"和"在用"互不干扰，即使 Render 阶段被中断重来（并发模式），当前屏幕也不受影响；Commit 阶段只需一次原子性切换，避免用户看到中间状态。

---

## 三、协调流程总览：beginWork → completeWork

React 的协调（Reconciliation）过程由 `workLoopSync`（同步）或 `workLoopConcurrent`（并发）驱动，本质是对 Fiber 树进行**深度优先遍历**，分两个阶段处理每个节点。

### beginWork（向下 · 入）

从根节点开始，逐层深入子节点：

1. **接收当前 Fiber 节点** — 根据 `fiber.tag` 判断类型（函数组件、类组件、HostComponent 等）
2. **执行组件函数 / render** — 函数组件：调用函数体，执行 Hooks；类组件：调用 `render()`；宿主节点：直接处理 props
3. **reconcileChildren（Diff）** — 拿到返回的 React Element，与旧的子 Fiber 做对比，生成新的子 Fiber 链表，挂到 `workInProgress.child`
4. **返回第一个子节点** — 工作循环继续向下处理子节点，直到叶子节点（`child === null`）

### completeWork（向上 · 出）

到达叶子节点后，开始向上回溯：

1. **到达叶子节点后触发** — 当 `beginWork` 返回 `null`（无子节点），开始回溯
2. **处理宿主节点的 DOM 操作** — 对于 `HostComponent`：首次创建 DOM 实例，或标记属性变更（写入 `flags`）
3. **收集副作用（effectList）** — 将有 `flags` 标记的节点收集到父节点的副作用链表，向上冒泡
4. **转向兄弟节点或继续回溯** — 有 `sibling` → 对兄弟节点继续 beginWork；否则向 `return`（父节点）回溯

### 遍历顺序示例

以 `App → A → A1 → A2 → B` 这棵树为例：

```
beginWork(App) → beginWork(A) → beginWork(A1) → completeWork(A1)
→ beginWork(A2) → completeWork(A2) → completeWork(A)
→ beginWork(B) → completeWork(B) → completeWork(App)
```

> 💡 `beginWork` 阶段完成的是"判断与标记"，`completeWork` 完成的是"收集与准备"。整个 Render 阶段结束后，所有需要做的 DOM 操作都已被收集，Commit 阶段按清单执行即可。

---

## 四、单节点 Diff —— reconcileSingleElement

当组件的 `render` 返回**单个 React Element**（非数组）时，React 调用 `reconcileSingleElement`。

**核心逻辑**：在旧的子 Fiber 链表中寻找能被**复用**的节点，判断条件依次为 `key` 和 `type`。

### 决策流程

```
新 React Element（render 返回值）
  → 遍历旧子 Fiber 链表
    → key 相同？
      ├─ ❌ 不同 → 标记旧 Fiber 为 Deletion（删除），继续遍历下一个兄弟
      │             → 全部遍历后仍无匹配 → createFiberFromElement 全新创建
      └─ ✅ 相同 → 再判断 type
          ├─ type 也相同 → useFiber（createWorkInProgress）→ ✅ 节点复用
          └─ type 不同   → key 相同说明是同一"位置"，但类型变了
                           → 删除旧 Fiber 及其所有兄弟 → createFiberFromElement 全新创建
```

### 复用 vs 新建的代价对比

| 维度 | 复用节点 ✅ | 新建节点 ❌ |
|------|-----------|-----------|
| 状态 | 仅更新 pendingProps | 全部重建，状态丢失 |
| DOM | 仅属性变更 | 需要 DOM 插入（mount） |
| 生命周期 | 无额外触发 | 会触发 unmount 生命周期 |

> ⚠️ **关键结论**：判断条件是 **key 优先，type 其次**。key 不同时，React 不会再判断 type——直接认为这不是同一个节点。这就是为什么 key 写错会导致组件状态意外丢失。

---

## 五、多节点 Diff —— reconcileChildrenArray 两轮遍历

当 `render` 返回的是**数组**（多个子节点）时，React 使用 `reconcileChildrenArray`，通过**两轮遍历**处理新旧节点列表。

> 💡 React 的列表 Diff **不使用传统的最长公共子序列（LCS）算法**，而是针对"大多数更新是顺序不变的小变动"这一实际场景，做了贪心优化。

### 第一轮：顺序遍历，处理可预测的变化

1. **同时从头开始遍历新旧两个列表** — 按索引位置逐个比较 `newChildren[i]` 与旧 Fiber 链表中对应位置的节点
2. **key 和 type 都相同 → 复用，继续** — 调用 `updateSlot`，复用并更新 props，指针前进
3. **key 不匹配 → 立即退出第一轮** — 任意一侧 key 不一致，第一轮终止，进入第二轮处理剩余节点

### 第二轮：处理移动、新增、删除

1. **把旧链表剩余节点存入 Map** — 以 `key → Fiber` 或 `index → Fiber` 为索引，快速查找可复用节点（O(1)）
2. **遍历新列表剩余项** — 在 Map 中查找对应 key：
   - ✅ 找到且 type 相同 → 复用，从 Map 移除
   -  未找到 → 新建 Fiber（Placement 标记）
3. **Map 中剩余的旧节点 → 全部删除** — 遍历结束后，Map 中未被匹配的节点都是已删除的节点，打上 Deletion 标记

### 场景 A：顺序未变，仅 props 更新

第一轮全部命中，无需进入第二轮。

```
旧列表：  [A(key="a")] → [B(key="b")] → [C(key="c")]
新列表：  [A'(key="a")] → [B'(key="b")] → [C'(key="c")]
结果：    ✅ 三个节点全部复用，无移动，仅更新 props
```

### 场景 B：列表末尾新增节点

第一轮命中旧节点，第二轮处理新增。

```
旧列表：  [A(key="a")] → [B(key="b")]
新列表：  [A'(key="a")] → [B'(key="b")] → [C(key="c")]
结果：     C 在旧 Map 中找不到，标记 Placement（插入）
```

### 场景 C：节点移动（最复杂）

第二轮处理，需要 `lastPlacedIndex` 算法判断哪些节点需要移动。

```
旧列表：  [A(i=0)] → [B(i=1)] → [C(i=2)] → [D(i=3)]
新列表：  [D(旧i=3)] → [A(旧i=0)] → [B(旧i=1)] → [C(旧i=2)]
```

> **lastPlacedIndex 算法**：React 追踪"最后一个可不移动的旧节点索引"。遍历时 D(3) 设为 lastPlacedIndex=3，后续 A(0)、B(1)、C(2) 的旧索引均 < 3，说明它们需要被移动到 D 的后面 → 标记 Placement。

>  **lastPlacedIndex 核心思想**：React 优先保持相对顺序不变的节点不动，对于在旧位置"靠前"却在新位置"靠后"的节点，打上移动标记。这样可以最小化真实 DOM 操作次数。

---

## 六、key 的本质作用

`key` 是 React Diff 算法在处理**列表节点**时，用来识别"逻辑上相同的节点"的唯一标识。它的本质是：**让 Diff 算法在 O(n) 时间内，跨越索引位置找到可复用节点。**

### 有 key vs 无 key 对比

**场景：在列表头部插入新节点 Dave**

#### ❌ 无 key（或用 index 作 key）

```
旧列表：  [Alice(i=0)] → [Bob(i=1)] → [Carol(i=2)]
新列表：  [Dave(i=0)]  → [Alice(i=1)] → [Bob(i=2)] → [Carol(i=3)]

按 index 对比：
  i=0: Alice ≠ Dave → 更新 ❌
  i=1: Bob ≠ Alice → 更新 ❌
  i=2: Carol ≠ Bob → 更新 ❌
  i=3: null → Carol → 新建 

结果：4 个节点全部重建/更新，状态全部丢失！
```

#### ✅ 有正确的 key（稳定唯一标识）

```
旧列表：  [Alice(key="alice")] → [Bob(key="bob")] → [Carol(key="carol")]
新列表：  [Dave(key="dave")]   → [Alice(key="alice")] → [Bob(key="bob")] → [Carol(key="carol")]

通过 key 映射：
  alice → 找到旧节点 → 复用 ✅
  bob   → 找到旧节点 → 复用 ✅
  carol → 找到旧节点 → 复用 ✅
  dave  → Map 中不存在 → 新建 ✅

结果：仅 1 个新建，3 个复用，状态全部保留！
```

### key 使用原则

| ✅ 应该这样做 | ❌ 不应该这样做 |
|-------------|---------------|
| 使用数据的稳定唯一 ID（如数据库 ID、UUID） | 使用数组 index 作 key（增删时顺序变化会引发错误复用） |
| 同级兄弟节点间唯一即可（不需全局唯一） | 使用 `Math.random()` 作 key（每次渲染都变，强制全量重建） |

---

## 七、首次挂载 vs 更新对比总结

### Mount vs Update 全流程对比

| 维度 |  首次挂载（Mount） | 🔄 状态更新（Update） |
|------|---------------------|----------------------|
| **触发来源** | `ReactDOM.createRoot().render(<App/>)` | `setState` / `dispatch` / 父组件重渲染 |
| **current 树** | 不存在（为 null） | 存在，提供对比基准 |
| **Diff 操作** | 无对比，直接 `createFiberFromElement` 全量创建 | `reconcileChildFibers` 对比新 Element 与旧 Fiber，决定复用或新建 |
| **flags 标记** | 所有节点都打上 `Placement`（需要插入 DOM） | 仅标记实际变化的节点（Update / Placement / Deletion） |
| **effectList** | 包含整棵树的所有节点 | 只包含有 flags 的节点（通常远少于全量） |
| **Commit 操作** | 一次性将整棵 Fiber 树对应的 DOM 插入页面 | 按 effectList 最小化 DOM 操作 |
| **生命周期** | 触发 `componentDidMount` / `useEffect`（首次） | 触发 `componentDidUpdate` / `useEffect`（cleanup + 重新执行） |

### 两阶段 Fiber 创建函数对比

| | 首次挂载 | 状态更新 |
|---|--------|---------|
| **调用函数** | `mountChildFibers()` | `reconcileChildFibers()` |
| **核心操作** | `createFiberFromElement()` | `useFiber()` 或 `createFiberFromElement()` |
| **副作用追踪** | 不追踪（根节点除外），减少开销 | 追踪副作用，为变化节点打 flags |

> 💡 这两个函数是同一套逻辑（`ChildReconciler`）用不同参数（`shouldTrackSideEffects`）创建的两个版本，这也是 React 源码中经典的"闭包工厂"模式。

---

## 总结

| 问题 | 答案 |
|:---:|:---|
| **Fiber 和 React Element 的关系？** | Element 是每次渲染临时生成的"蓝图"（不可变），Fiber 是持久的"建筑实体"，Reconciliation 就是用新蓝图更新建筑的过程。 |
| **双缓冲的意义？** | current 树服务当前屏幕，WIP 树在后台构建，互不干扰，Commit 阶段原子切换，避免用户看到中间态。 |
| **单节点 Diff 的核心？** | key 优先匹配，type 作为复用的最终判断；key 相同 type 不同时，全量重建，不保留状态。 |
| **多节点 Diff 的两轮含义？** | 第一轮处理顺序不变的主流情况（贪心），第二轮用 Map 处理乱序移动/新增/删除。 |
| **为什么不能用 index 作 key？** | 增删时 index 变化会导致错误复用（旧节点被当成不同节点的 key 映射），引发 UI 错乱和状态丢失。 |
| **Mount 和 Update 的本质区别？** | Mount 时 current 树为 null，全量创建；Update 时有旧 Fiber 可对比，最小化变更。 |

---

## 🎤 面试回答完整版（10分版）

### 第一段：先定性

Fiber 是 React 16 为了解决两个问题而引入的重写——一是传统递归 Diff 不可中断，导致长任务阻塞渲染；二是缺乏优先级调度能力，高优交互要给低优数据渲染让路。

---

### 第二段：数据结构怎么支撑可中断

核心是把树形结构变成链表。每个 Fiber 节点有三个指针——`return` 指向父节点、`child` 指向第一个子节点、`sibling` 指向下一个兄弟节点。整棵树就被表达成了一个单链表。传统递归 Diff 像函数调用栈，一旦入栈就必须全部执行完才能退出。Fiber 链表让 React 可以在每处理完一个节点后，检查时间切片是否用完、是否有更高优先级的更新进来。如果有，就暂停，把控制权还给浏览器去渲染——下次再从暂停的那个节点继续。这就好比翻一本书：递归是一次性从头翻到尾，中间不能停；Fiber 是每翻一页就抬头看一眼——有没有更重要的事要处理。

---

### 第三段：双缓冲——为什么 WIP 树可以随便丢弃

React 维护了两棵树——current 树对应屏幕上正在显示的内容，workInProgress 树描述下一帧。每次更新的 Render 阶段，React 基于 current 树 clone 出一棵新的 WIP 树来构建。这里有个关键点：WIP 树本质是一份草稿。如果构建过程中被更高优先级的更新打断，已构建的部分直接废弃，重新从新的根节点开始构建。因为 current 树没变，屏幕上的内容不会闪烁或错乱。当 WIP 树构建完成后，Commit 阶段 `FiberRoot.current` 指针做一次原子切换，指向新的 WIP 树。原来的 current 树成为下一次的"旧树"，被回收或复用。所以 WIP 树被废弃不是"浪费"——它恰恰是双缓冲设计的核心意图：宁可重来，也不要让用户看到中间状态。

---

### 第四段：协调流程怎么跑

Render 阶段分为两个子阶段：beginWork 向下、completeWork 向上。beginWork 从根节点入手，判断节点类型——函数组件就调用函数体执行 hooks，类组件就调 render()，DOM 节点就直接处理 props。然后调 reconcileChildren 做 Diff，生成子 Fiber 链表，接着继续深入第一个子节点。completeWork 到达叶子节点后开始回溯，对 DOM 节点在这一步创建或更新 DOM 实例，同时把有副作用的节点通过 effectList 逐级向上收集。整个 Render 阶段不操作真实 DOM，只做标记和收集。Commit 阶段直接拿着根节点上的 effectList 清单执行，所以很快。

---

### 第五段：Diff 策略——面试核心

React 的 Diff 基于三个假设：只做同级比较、类型不同直接重建、key 标识节点身份。这三个假设保证了 O(n) 的时间复杂度。单节点 Diff：key 优先于 type。key 不同直接认为不是同一个节点，跳过；key 相同再判断 type——type 也相同就复用，type 不同就删除旧节点及其所有兄弟，全新创建。多节点 Diff 是两轮遍历。第一轮从头按索引顺序对比，key 和 type 都匹配就复用，遇到不匹配立即退出。大多数场景（顺序不变、仅更新 props）第一轮就全部命中，直接结束。这是针对"实际项目中 90% 的更新都是顺序不变的"做的贪心优化，也是 React 不用 LCS 算法的原因——LCS 最坏 O(n²)，而且大多数场景的收益为 0。第二轮把旧链表剩余节点以 key 为索引放入 Map，遍历新列表在 Map 中查找。找到就复用，找不到就新建。最后 Map 中剩下的节点全部标记删除。节点移动的判断依赖 lastPlacedIndex 算法——记录最后一个不需要移动的节点在旧列表中的索引，后续节点的旧索引如果小于这个值，说明它在新列表里被移到了前面，标记为需要移动。

---

### 第六段：key 的本质——收束到工程实践

没有 key，Diff 只能按索引对比——在列表头部插入一个节点，后面所有节点的索引都变了，导致全部重建。这只是性能问题。更严重的是有状态的子组件——比如每个列表项里有一个 input，用户输入了内容。用 index 作 key，头部插入时，原来输入框的状态会被错误地复用给另一个列表项，导致 UI 错乱和数据丢失。所以 key 的核心作用不是"性能优化"，而是保持节点身份的稳定性——让 React 在索引变化后仍然能认出"这是之前那个组件"，保留它的状态。最佳实践：用数据的稳定唯一 ID，不用 index，不用随机数。

---

### 第七段：点睛收尾

总结：Fiber 用链表结构解决了递归不可中断的问题；双缓冲保障了可中断的安全边界；两轮遍历的 Diff 在 O(n) 内处理了 90% 的常规更新；key 保证了组件身份在索引变化时的稳定性。理解 Fiber，本质上就是理解了 React 对『如何在浏览器主线程上优雅地执行大量计算』这个问题的答案。

**三个层次一句话总览：**

| 层次 | 核心设计 | 解决了什么 |
|------|---------|----------|
| 数据结构层 | 链表（return / child / sibling） | 递归不可中断 → 可中断可恢复 |
| 设计模式层 | 双缓冲（current ↔ WIP） | 可中断导致中间状态不可见 → 草稿树可丢弃 |
| 算法层 | 两轮 Diff（贪心 + Map） | O(n²) → O(n)，且 90% 场景第一轮结束 |

**单节点 vs 多节点 Diff 对比：**

| 维度 | 单节点 Diff | 多节点 Diff（第一轮） | 多节点 Diff（第二轮） |
|------|------------|---------------------|---------------------|
| 匹配依据 | key 优先于 type | 按索引顺序对比 key + type | key 查 Map |
| 失败处理 | 直接全部重建 | 退出第一轮，进入第二轮 | 找不到则新建，剩余则删除 |
| 命中场景 | 只有一个子节点 | 列表顺序不变（90% 常见） | 列表增删、顺序变动 |
| 移动判断 | 无需 | 无需（位置不变） | lastPlacedIndex 算法 |

**key 的三种错误用法对比：**

| 用法 | 后果 | 严重性 |
|------|------|-------|
| `key={index}` | 列表头部插入时，有状态组件状态错位 | ⚠️ 数据丢失 |
| `key={Math.random()}` | 每次渲染都重建全部节点 | ❌ 性能崩溃 |
| `key={稳定唯一ID}` | React 能正确识别节点身份 | ✅ 最佳实践 |