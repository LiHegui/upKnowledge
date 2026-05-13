# CRDT 协同编辑方案

> 无冲突可复制数据类型（CRDT）是现代协同编辑系统的核心技术，被 Figma、Linear 等产品广泛采用。

---

## 基础概念篇

## Q: CRDT 无冲突复制

**A:**

**CRDT**（Conflict-free Replicated Data Type，无冲突可复制数据类型）是一种数学上保证「任意顺序合并任意多个副本的修改，最终所有副本都收敛到相同状态」的数据结构。

**为什么需要 CRDT？**

在协同编辑场景中，最简单的「最后写入胜（Last-Write-Wins）」方式会导致数据丢失：

```
初始文档：  "Hello"

用户A 在位置5 插入 "World"  → 发送 "HelloWorld"
用户B 同时在位置5 插入 "!"   → 发送 "Hello!"

服务器先收到A，广播 "HelloWorld"
服务器后收到B，广播 "Hello!"

结果：所有人看到 "Hello!"，A 的 "World" 直接丢失！
```

CRDT 解决了这个问题，保证两方的内容都被保留，且所有用户最终看到相同结果（如 `"Hello!World"`）。

**两个关键数学性质：**

| 性质 | 含义 | 效果 |
|:---|:---|:---|
| **交换律** | A ∘ B = B ∘ A | 操作顺序不影响最终结果 |
| **幂等性** | A ∘ A = A | 同一操作重复应用，结果不变 |

---

## Q: CRDT 类型分类

**A:**

CRDT 分为两大流派：

### 1. State-based CRDT（基于状态）

节点间交换**完整状态**，通过 `merge` 函数合并（要求满足**格（Lattice）**结构）。

```
优点：简单，不需要可靠传输
缺点：状态可能很大，传输成本高
典型：G-Counter（只增计数器）、2P-Set
```

### 2. Operation-based CRDT（基于操作）

节点间只传输**操作增量**，接收方应用操作。

```
优点：传输量小，适合实时编辑
缺点：需要保证操作至少送达一次（AT-LEAST-ONCE 语义）
典型：Yjs（YATA 算法）、Automerge（RGA 算法）
```

### 常见 CRDT 数据类型

| 类型 | 全称 | 用途 |
|:---|:---|:---|
| **G-Counter** | Grow-only Counter | 分布式计数（只增） |
| **PN-Counter** | Positive-Negative Counter | 可增减的计数器 |
| **G-Set** | Grow-only Set | 只能添加的集合 |
| **2P-Set** | Two-Phase Set | 可添加/删除的集合 |
| **OR-Set** | Observed-Remove Set | 并发安全的集合 |
| **LWW-Element-Set** | Last-Write-Wins Set | 基于时间戳的集合 |
| **RGA** | Replicated Growable Array | 协同文本（Automerge） |
| **YATA** | Yet Another Transformation Approach | 协同文本（Yjs） |

---

## Q: CRDT 和 OT（操作转换）的核心区别是什么？

**A:**

| 维度 | OT（操作转换） | CRDT |
|:---|:---|:---|
| **核心思想** | 并发操作经过"转换"后正确应用 | 操作设计为可交换、幂等，无需转换 |
| **架构依赖** | **中心化**，必须有服务器协调顺序 | **去中心化**，可 P2P，服务器可选 |
| **离线支持** | 弱，对操作顺序敏感 | ✅ 强，天然支持离线，重连后自动合并 |
| **实现复杂度** | 极高（转换函数难以保证正确性） | 中等（用 Yjs 等库可大幅降低） |
| **内存占用** | 较低 | 较高（需保留"墓碑"操作历史） |
| **扩展性** | 受限于中央服务器 | 水平扩展，天然适合大规模协作 |
| **代表产品** | Google Docs、ShareDB | Figma、Linear、Notion（部分） |
| **代表库** | ShareDB | Yjs、Automerge |

> ⚠️ **前沿动态**：剑桥大学 Martin Kleppmann 教授提出的 **Eg-walker 算法**尝试融合两者优点——兼具 CRDT 轻量内存、OT 快速合并长分支的能力，代表未来发展方向。

---

## 核心算法篇

## Q: Yjs 使用的 YATA 算法是如何保证无冲突的？

**A:**

**YATA**（Yet Another Transformation Approach）是 Yjs 的核心算法，其关键是用**逻辑位置**替代**物理索引**。

### 物理索引的问题

```
文档：  H e l l o
索引：  0 1 2 3 4

用户A：insert(5, 'World')  → "在第5位插入"
用户B：insert(5, '!')      → "在第5位插入"
```

`insert(5, 'X')` 在 A 的操作应用后，B 的 "第5位" 已经变成了 'W' 的位置，语义错乱。

### YATA 的逻辑位置

每个插入操作记录「我插在哪个字符的右边」（使用字符的全局唯一 ID）：

```
操作A: { id: {client:1, clock:1}, content: 'World', left: id('o'), right: null }
操作B: { id: {client:2, clock:1}, content: '!',     left: id('o'), right: null }
```

两个操作都声明「插在 'o' 的右边」，YATA 通过 **client ID 大小**打破平局：
- client=2 > client=1，'!' 排在 'World' 前面
- 最终所有节点收敛：`"Hello!World"`

### 核心保证

- 每个操作有**全局唯一 ID**（`{clientID, clock}`）
- 位置用**逻辑锚点**描述，不随其他操作变化而失效
- 相同的 client ID 排序规则保证所有节点**决策一致**

---

## Q: CRDT 中的「墓碑机制」是什么？为什么删除操作比插入难？

**A:**

### 问题背景

CRDT 的插入很简单：给操作一个唯一 ID，标记好逻辑位置即可。

但**删除**是个难题：

```
场景：
用户A 读取文档 "Hello"，准备删除 'H'（id=1）
用户B 同时也操作了 id=1 这个字符

如果 A 直接删掉这条记录，B 的操作参照的 id=1 就找不到了 → 崩溃
```

### 墓碑机制（Tombstone）

CRDT 永不真正删除数据，而是将被删元素标记为**墓碑（Tombstone）**：

```javascript
// 概念示意
{
  id: { client: 1, clock: 1 },
  content: 'H',
  deleted: true   // 🪦 墓碑标记，不再显示，但依然存在于数据结构中
}
```

**好处**：
- 其他节点的操作若引用了该 ID，依然能找到锚点
- 删除操作天然幂等（重复标记墓碑无副作用）
- 并发删除安全（两人同时删同一字符，结果一致：该字符被删）

**代价**：
- 文档历史越长，墓碑越多，内存占用持续增大
- Yjs 提供 **`Y.Doc.gc`（垃圾回收）** 机制，在不需要历史的场景下清理墓碑

```javascript
// 关闭垃圾回收（需要保留完整历史，如版本对比）
const ydoc = new Y.Doc({ gc: false });

// 默认开启 GC（自动清理不再被引用的墓碑）
const ydoc = new Y.Doc(); // gc: true
```

---

## Q: State Vector（状态向量）是什么？在 Yjs 中有何作用？

**A:**

**State Vector** 是 Yjs 用于描述「我目前知道哪些操作」的紧凑摘要，格式是一个 Map：

```javascript
// 示例：文档收到了：用户1的前3个操作，用户2的前2个操作
State Vector = { clientID_1: 3, clientID_2: 2 }
```

### 在 Yjs 中的作用：差量同步

```javascript
// 1. 新客户端连接，发送自身 SV（空文档时 SV 近似 {}）
const sv = Y.encodeStateVector(ydoc);
ws.send({ type: 'sync1', sv: toBase64(sv) });

// 2. 服务端收到 SV，只返回客户端缺少的操作
const update = Y.encodeStateAsUpdate(serverDoc, clientSV);
// 自动对比：「我有 {1:5, 2:3}，你有 {1:2}，给你 1 的 3~5 和 2 的 1~3」
ws.send({ type: 'sync2', update: toBase64(update) });

// 3. 客户端应用增量，完成同步
Y.applyUpdate(ydoc, update, 'remote');
```

**优势**：避免全量同步，只传输增量，节省带宽。大型文档（历史操作多）的新用户接入时性能显著优于全量同步方案。

---

## Yjs 实战篇

## Q: Yjs 的核心 API 有哪些？如何快速上手？

**A:**

### 核心概念

```javascript
import * as Y from 'yjs';

// Y.Doc —— CRDT 容器
const ydoc = new Y.Doc();

// 共享数据类型（同名 = 同一份数据）
const ytext  = ydoc.getText('content');   // 协同文本
const yarray = ydoc.getArray('items');    // 协同数组
const ymap   = ydoc.getMap('meta');       // 协同键值对
```

### Y.Text 常用操作

```javascript
// 插入文本（位置, 内容）
ytext.insert(0, 'Hello');
ytext.insert(5, ' World');

// 删除文本（起始位置, 长度）
ytext.delete(5, 1);  // 删除空格

// 读取当前文本
console.log(ytext.toString()); // "HelloWorld"

// 带格式的插入（用于富文本）
ytext.insert(0, 'Bold text', { bold: true });

// 监听变化
ytext.observe(event => {
  console.log('变化了:', ytext.toString());
});
```

### 事务（Transact）

将多个操作合并成一个 update，减少网络请求：

```javascript
// ❌ 触发两次 update 事件 → 两次网络发送
ytext.delete(5, 1);
ytext.insert(5, 'X');

// ✅ 合并为一次 update → 一次网络发送
ydoc.transact(() => {
  ytext.delete(5, 1);
  ytext.insert(5, 'X');
});
```

### 监听 Doc 变更并同步

```javascript
// 本地变更 → 发送给服务器
ydoc.on('update', (update, origin) => {
  if (origin === 'remote') return; // 防止回声
  ws.send(JSON.stringify({
    type: 'update',
    update: Buffer.from(update).toString('base64')
  }));
});

// 收到服务器更新 → 应用到本地
ws.on('message', (msg) => {
  const { type, update } = JSON.parse(msg);
  if (type === 'update') {
    const uint8 = Buffer.from(update, 'base64');
    Y.applyUpdate(ydoc, uint8, 'remote'); // 'remote' 标记防回声
  }
});
```

---

## Q: Yjs 的 sync1/sync2 握手协议是如何工作的？

**A:**

Yjs 标准握手流程（**差量同步**），确保新用户能获取完整文档：

```
客户端（新连接，空文档）          服务器（已有 "Hello"）
         │                              │
         │──sync1: sv={}───────────────►│  "我的版本是空的"
         │                              │
         │◄──sync2: update=[所有操作]───│  "给你缺失的所有操作"
         │                              │
   Y.applyUpdate()                      │
   本地 ytext = "Hello" ✓               │
         │                              │
         │──update: {我之后的新操作}────►│  增量实时同步
         │◄──update: {其他人的操作}─────│
```

```javascript
// 客户端：连接后立即发送 sync1
ws.onopen = () => {
  const sv = Y.encodeStateVector(ydoc);
  ws.send(JSON.stringify({ type: 'sync1', sv: toBase64(sv) }));
};

// 服务端：收到 sync1，返回客户端缺少的部分
if (msg.type === 'sync1') {
  const clientSV = fromBase64(msg.sv);
  const update = Y.encodeStateAsUpdate(serverDoc, clientSV);
  ws.send(JSON.stringify({ type: 'sync2', update: toBase64(update) }));
}

// 客户端：收到 sync2，完成初始化
if (msg.type === 'sync2') {
  Y.applyUpdate(ydoc, fromBase64(msg.update), 'remote');
}
```

---

## Q: 如何在 textarea 和 Yjs 之间建立双向数据绑定？

**A:**

这是实现协同编辑的核心桥接逻辑，需要处理好「防止无限循环」问题：

```javascript
let suppressInput = false; // 防循环标志

// ── 方向1：Yjs → textarea（接收别人的修改）
ytext.observe(() => {
  const newVal = ytext.toString();
  if (textarea.value === newVal) return; // 无变化跳过

  const cursor = textarea.selectionStart; // 保存光标
  suppressInput = true;
  textarea.value = newVal;               // 更新界面
  suppressInput = false;

  // 恢复光标（防止远端更新把光标跳到末尾）
  textarea.selectionStart = textarea.selectionEnd =
    Math.min(cursor, newVal.length);
});

// ── 方向2：textarea → Yjs（自己的输入 → CRDT 操作）
textarea.addEventListener('input', () => {
  if (suppressInput) return; // 防止 Yjs 更新触发的 input 事件

  const newVal = textarea.value;
  const oldVal = ytext.toString();

  // 最小 diff：找到最小改动区间
  let s = 0;
  while (s < oldVal.length && s < newVal.length && oldVal[s] === newVal[s]) s++;
  let e = 0;
  while (
    e < oldVal.length - s &&
    e < newVal.length - s &&
    oldVal[oldVal.length - 1 - e] === newVal[newVal.length - 1 - e]
  ) e++;

  const delCount = oldVal.length - s - e;
  const insText  = newVal.slice(s, newVal.length - e);

  ydoc.transact(() => {
    if (delCount > 0) ytext.delete(s, delCount);
    if (insText.length > 0) ytext.insert(s, insText);
  });
});
```

> ⚠️ **注意**：`suppressInput` 打破了「Yjs 更新 textarea → 触发 input → 再次更新 Yjs」的死循环；`origin === 'remote'` 打破了「收到远端 update → 触发 ydoc update 事件 → 再次发送」的死循环。

---

## 工程实践篇

## Q: CRDT 持久化方案服务器重启后数据如何恢复？

**A:**

Yjs 的 `Y.Doc` 默认只在内存中，服务器重启数据会丢失。生产环境需要持久化：

### 方案一：追加写入（推荐，写入快）

```javascript
// 每次收到 update，追加到数据库
ydoc.on('update', async (update) => {
  await db.appendUpdate(docId, update);
});

// 启动时回放所有 update，重建 doc
const updates = await db.getAllUpdates(docId);
updates.forEach(u => Y.applyUpdate(ydoc, u));
```

### 方案二：定期快照（读取快，写入慢）

```javascript
// 定期将完整状态序列化存储
setInterval(async () => {
  const snapshot = Y.encodeStateAsUpdate(ydoc);
  await db.saveSnapshot(docId, snapshot);
}, 60 * 1000); // 每分钟快照一次

// 启动时从快照恢复
const snapshot = await db.getSnapshot(docId);
if (snapshot) Y.applyUpdate(ydoc, snapshot);
```

### 方案三：y-leveldb / y-redis（生态库）

Yjs 生态提供了开箱即用的持久化适配器：

```javascript
import { LeveldbPersistence } from 'y-leveldb';

const persistence = new LeveldbPersistence('./data');

// 从持久化层加载文档
const persistedDoc = await persistence.getYDoc('my-room');
Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedDoc));

// 自动监听并持久化
persistence.writeState('my-room', ydoc);
```

---

## Q: 离线编辑与同步重连后如何同步？

**A:**

离线支持是 CRDT 相比 OT 最大的优势之一，整个流程是：

```
用户离线
  │
  ▼
继续在本地 Y.Doc 上编辑，操作积累在内存中
  │
  ▼
浏览器端用 IndexedDB 持久化本地 Y.Doc（防止刷新丢失）
  │
  ▼
网络恢复，重新连接 WebSocket
  │
  ▼
发送 sync1（携带本地最新 State Vector）
  │
  ▼
服务器返回 sync2（本地缺少的操作）
  │
  ▼
客户端把本地积累的操作发给服务器（update）
  │
  ▼
双方补全缺失操作，CRDT 自动合并冲突 ✓
```

**IndexedDB 持久化（使用 y-indexeddb）**：

```javascript
import { IndexeddbPersistence } from 'y-indexeddb';

const provider = new IndexeddbPersistence('my-document', ydoc);

// 等待本地数据加载完成再连接服务器
provider.on('synced', () => {
  console.log('本地数据加载完成，可以连接服务器了');
  connectWebSocket();
});
```

---

## Q: 协同编辑中如何实现「用户光标同步」？

**A:**

光标位置不属于文档内容，不适合用 `Y.Text` 管理。Yjs 提供了专门的 **Awareness 协议**处理此类实时状态：

```javascript
import { WebsocketProvider } from 'y-websocket';

const provider = new WebsocketProvider(
  'wss://your-server', 'room-name', ydoc
);

const awareness = provider.awareness;

// 设置自己的光标信息
awareness.setLocalStateField('cursor', {
  anchor: { index: 10, assoc: -1 },
  head:   { index: 15, assoc: 1  },
  color:  '#e74c3c',
  name:   '用户A'
});

// 监听其他人的光标变化
awareness.on('change', ({ added, updated, removed }) => {
  // 遍历所有在线用户的状态
  awareness.getStates().forEach((state, clientId) => {
    if (clientId === awareness.clientID) return; // 跳过自己
    renderRemoteCursor(clientId, state.cursor, state.color, state.name);
  });
});
```

**Awareness 的特点**：
- 数据**不持久化**，用户断线后状态自动清除
- 基于心跳机制，延迟通常 < 100ms
- 非常轻量，不影响文档 CRDT 的性能

---

## Q: 如何在协同环境中实现撤销/重做（Undo/Redo）？

**A:**

协同环境的 Undo 与单人编辑不同：**用户只能撤销自己的操作，不能撤销他人的操作**。

Yjs 提供了 `UndoManager`：

```javascript
import * as Y from 'yjs';

const ydoc  = new Y.Doc();
const ytext = ydoc.getText('content');

// 创建 UndoManager，只管理 ytext 的本地操作
const undoManager = new Y.UndoManager(ytext, {
  captureTimeout: 500 // 500ms 内的操作合并为一次 undo
});

// 撤销/重做
document.querySelector('#undo').onclick = () => undoManager.undo();
document.querySelector('#redo').onclick = () => undoManager.redo();

// 监听栈状态（用于更新按钮 disabled 状态）
undoManager.on('stack-item-added', updateButtons);
undoManager.on('stack-item-popped', updateButtons);

function updateButtons() {
  undoBtn.disabled = !undoManager.canUndo();
  redoBtn.disabled = !undoManager.canRedo();
}
```

> ⚠️ **注意**：`UndoManager` 只追踪**本地用户的操作**。当用户执行 Undo 时，Yjs 会生成"反向操作"并应用，而不是简单地回滚到历史状态（否则会覆盖他人的修改）。

---

## 面试高频篇

## Q: 如果两个用户同时删除了同一个字符，会发生什么？

**A:**

CRDT 的墓碑机制天然处理了这个场景，**并发删除是安全的**：

```
初始文档：  H(id=1) e(id=2) l(id=3) l(id=4) o(id=5)

用户A 删除 'H'（id=1）→ 操作: delete(id=1)
用户B 同时也删除 'H'（id=1）→ 操作: delete(id=1)

合并结果：
  id=1 的节点被标记为 deleted:true（墓碑）
  无论谁先到达服务器，两次 delete 操作的效果相同 → 幂等 ✓

所有用户最终看到：  e l l o  （'H' 被删除，只删一次）
```

**关键**：Yjs 在内部用 `Set<string>` 记录已标记为删除的 item ID，重复删除只是再次标记，不会产生任何副作用。

---

## Q: CRDT 的内存占用问题如何优化？

**A:**

CRDT 由于需要保留墓碑，内存会随文档历史增长。生产环境优化策略：

### 1. 开启 GC（默认行为）

```javascript
// 默认 gc: true，Yjs 会自动回收不再被引用的墓碑
const ydoc = new Y.Doc(); // gc 默认开启
```

> ⚠️ 注意：开启 GC 后将无法支持版本历史追溯。如需版本管理，关闭 GC 并配合快照实现。

### 2. 文档分片

大型文档（如超长文章）拆分为多个独立的 `Y.Doc`：

```javascript
// 每个章节/段落独立管理
const sectionDoc = new Y.Doc();
const sectionText = sectionDoc.getText('content');
```

### 3. 定期快照 + 清理历史

```javascript
// 定期保存快照，清空操作历史（谨慎使用）
const snapshot = Y.encodeStateAsUpdate(ydoc);
// 保存 snapshot，重建一个新的 ydoc，从 snapshot 恢复
// 老文档的操作历史不再需要
```

### 4. 使用 y-protocols 的 compact 功能

将操作序列压缩：同一 clientID 的连续插入可被合并存储，减少内存占用。

---

## Q: 请描述一个完整的 Yjs 协同系统中，用户输入一个字符的全链路数据流。

**A:**

```
用户在 textarea 输入 "X"（在位置 5）
    │
    ▼
input 事件触发（suppressInput=false，正常处理）
    │
    ▼
最小 diff 算法：oldVal="Hello" newVal="HellXo"
  → s=4（前4个相同）
  → e=1（后1个 'o' 相同）
  → delCount=0, insText='X'
    │
    ▼
ydoc.transact(() => ytext.insert(4, 'X'))
    │
    ├─ Yjs 内部：记录操作 {id:{client:1,clock:N}, content:'X', left:id('l'), right:id('o')}
    │
    ▼
ydoc 'update' 事件触发（origin=null，非 remote）
    │
    ▼
序列化：Uint8Array → base64
    │
    ▼
WebSocket 发送 { type: 'update', update: 'base64...' }
    │
    ▼
服务器收到
  → Y.applyUpdate(serverDoc, update)   // 服务器 doc 合并
  → 广播给所有其他客户端（除发送者）
    │
    ▼
其他客户端收到 update
  → Y.applyUpdate(ydoc, update, 'remote')   // 'remote' 防回声
  → CRDT 算法合并（自动解决并发冲突）
    │
    ▼
ytext.observe() 触发
  → suppressInput=true
  → textarea.value = ytext.toString()   // "HellXo"
  → suppressInput=false
    │
    ▼
用户看到更新 ✓
```

**整个流程的魔法**在 `Y.applyUpdate()`：无论操作以何种顺序到达、无论多少人并发编辑，CRDT 算法保证所有副本最终收敛到完全一致的状态。

---

## Q: 在生产环境中，如何设计 CRDT 协同系统的后端架构？

**A:**

### 单服务器架构（中小规模）

```
客户端A ──WebSocket──┐
客户端B ──WebSocket──┤── Node.js 服务 ── Y.Doc（内存） ── Redis/LevelDB（持久化）
客户端C ──WebSocket──┘
```

### 多服务器架构（高可用）

多台服务器需要同步彼此的 `Y.Doc`：

```
客户端A ──── 服务器1 ──┐
                       ├── Redis Pub/Sub ── 广播 update ── 服务器2 ──── 客户端B
客户端C ──── 服务器1 ──┘                                               客户端D
```

实现要点：

```javascript
// 服务器收到客户端 update 后，同时：
// 1. 应用到本地 Y.Doc
// 2. 发布到 Redis 频道，通知其他服务器节点
redis.publish(`doc:${docId}`, update);

// 订阅其他服务器发来的 update
redis.subscribe(`doc:${docId}`, (update) => {
  Y.applyUpdate(localDoc, update);
  broadcastToLocalClients(update);
});
```

### 推荐技术栈

| 场景 | 推荐方案 |
|:---|:---|
| 快速原型 | Node.js + `y-websocket` + 内存存储 |
| 中等规模 | Node.js + `y-websocket` + `y-leveldb` |
| 生产级别 | Node.js + Redis Pub/Sub + PostgreSQL（快照） + `y-redis` |
| 去中心化 | Yjs + `y-webrtc`（P2P，无需服务器） |
