# CRDT 详解 —— 以本协同编辑器 Demo 为例

> 面向零基础读者，结合项目真实代码讲解。

---

## 目录

1. [为什么需要 CRDT？先看问题](#1-为什么需要-crdt先看问题)
2. [CRDT 是什么？](#2-crdt-是什么)
3. [CRDT 的核心思想：操作而非状态](#3-crdt-的核心思想操作而非状态)
4. [Yjs：本项目使用的 CRDT 库](#4-yjs本项目使用的-crdt-库)
5. [项目整体架构](#5-项目整体架构)
6. [数据流全链路追踪](#6-数据流全链路追踪)
7. [关键代码逐行讲解](#7-关键代码逐行讲解)
   - 7.1 服务端：共享 Y.Doc
   - 7.2 客户端：本地 Y.Doc
   - 7.3 连接握手：sync1 / sync2
   - 7.4 增量更新：update 消息
   - 7.5 textarea ↔ Yjs 双向桥接
   - 7.6 防止回声：origin 标记
8. [冲突场景演示：CRDT 如何自动解决](#8-冲突场景演示crdt-如何自动解决)
9. [State Vector 是什么？](#9-state-vector-是什么)
10. [为什么用 base64 传输？](#10-为什么用-base64-传输)
11. [CRDT vs 其他方案对比](#11-crdt-vs-其他方案对比)
12. [常见问题 FAQ](#12-常见问题-faq)

---

## 1. 为什么需要 CRDT？先看问题

假设没有 CRDT，用最简单的「谁发消息用谁的内容」（Last-Write-Wins）：

```
初始文档：  "Hello"

用户A 在位置5 插入 "World"  → 发送 "HelloWorld"
用户B 同时在位置5 插入 "!"   → 发送 "Hello!"

服务器先收到A，广播 "HelloWorld"
服务器后收到B，广播 "Hello!"

结果：所有人看到 "Hello!"，A 的 "World" 直接丢失了！
```

这就是**协同编辑中的并发冲突**问题。两个人同时编辑，必然产生冲突，而 Last-Write-Wins 直接丢弃了先到的内容。

用户希望看到的正确结果是：`"Hello!World"` 或 `"HelloWorld!"`（至少两者的内容都保留）。

---

## 2. CRDT 是什么？

**CRDT** = **Conflict-free Replicated Data Type**（无冲突可复制数据类型）

拆开理解：

| 词 | 含义 |
|---|---|
| **Conflict-free** | 任何并发操作都能自动合并，不产生冲突 |
| **Replicated** | 数据在多个节点（用户）上各有一份副本 |
| **Data Type** | 它是一种特殊设计的数据结构，不是协议 |

**一句话总结**：CRDT 是一种数学上保证「无论以任何顺序合并任意多个副本的修改，最终所有副本都会收敛到相同状态」的数据结构。

### 两个关键数学性质

1. **交换律**（Commutativity）：A 操作 + B 操作 = B 操作 + A 操作，顺序不影响结果
2. **幂等性**（Idempotency）：同一个操作重复应用多次，效果等同于应用一次（不会出现重复内容）

---

## 3. CRDT 的核心思想：操作而非状态

普通做法（Last-Write-Wins）传输的是**状态**：
```
"Hello!" ← 整个文档内容
```

CRDT 传输的是**操作（Operation）**：
```
"在逻辑位置 #5、由用户B、插入字符 '!'" ← 带有全局唯一标识的操作
```

每个操作都包含：
- **谁**做的（用户 ID）
- **什么时候**做的（逻辑时钟，不是物理时间）
- **做了什么**（插入/删除 + 内容 + 位置）

因为每个操作有唯一 ID 且携带了足够的语义，无论收到的顺序如何，CRDT 算法都能正确合并它们。

---

## 4. Yjs：本项目使用的 CRDT 库

本项目使用 **[Yjs](https://github.com/yjs/yjs)** 作为 CRDT 实现。Yjs 的核心概念：

### Y.Doc —— 文档对象
```
Y.Doc 是 CRDT 的"容器"，里面可以放各种共享数据类型。
每个客户端、服务器各有一个 Y.Doc，它们是"副本"关系。
```

### Y.Text —— 协同文本
```
Y.Text 是专门用于协同文本编辑的 CRDT 类型。
内部使用 YATA 算法（Yet Another Transformation Approach）。
支持 insert(index, text) 和 delete(index, length)。
```

### Update —— 增量更新包
```
当 Y.Doc 发生变化时，Yjs 会生成一个 "update"（二进制数据）。
这个 update 可以被传输到其他节点，应用后让对方的 Y.Doc 也"赶上"这个变化。
```

### State Vector —— 版本向量
```
State Vector 记录了"我已经收到了哪些用户的第几个操作"。
用于增量同步：告诉对方"我缺哪些，你只发我缺的就行"。
```

---

## 5. 项目整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                         项目架构图                               │
│                                                                  │
│  浏览器A                服务器               浏览器B              │
│  ┌──────────┐          ┌────────────┐       ┌──────────┐        │
│  │ Y.Doc(A) │◄─update─►│  Y.Doc(S) │◄─────►│ Y.Doc(B) │        │
│  │  ytext   │          │  ytext     │       │  ytext   │        │
│  └────┬─────┘          └────────────┘       └────┬─────┘        │
│       │ observe                                   │ observe      │
│       ▼                                           ▼              │
│  ┌──────────┐                              ┌──────────┐         │
│  │ textarea │                              │ textarea │         │
│  └──────────┘                              └──────────┘         │
│                                                                  │
│  ──── WebSocket 长连接 ────────────────────────────────────      │
│  消息类型：init / sync1 / sync2 / update / mouse / typing        │
└─────────────────────────────────────────────────────────────────┘
```

**关键点**：服务器上也有一个 `Y.Doc`，它是所有客户端 doc 的"权威副本"，用于给新加入的客户端提供初始状态。

---

## 6. 数据流全链路追踪

### 6.1 用户 A 连接服务器

```
A 打开浏览器
    │
    ├─ WebSocket 建立连接
    │
    ├─ 服务器发送 { type: 'init', userId: 1, name: '用户1', color: '#e74c3c', users: [...] }
    │      ↳ 客户端：记录 myId, myName, myColor，解锁 textarea
    │
    └─ 服务器发送 { type: 'sync2', update: 'base64...' }
           ↳ 客户端：Y.applyUpdate(ydoc, update, 'remote')
           ↳ 本地 Y.Doc 同步到服务器当前状态
           ↳ ytext.observe() 触发 → textarea 显示当前文档内容
```

### 6.2 用户 A 输入文字

```
A 在 textarea 按下一个键，输入 "X"
    │
    ├─ input 事件触发
    │
    ├─ 对比新旧内容，算出 diff（哪里删、哪里插）
    │
    ├─ ydoc.transact(() => { ytext.insert(pos, 'X') })
    │      ↳ Y.Doc 内部记录此操作（含 A 的用户时钟）
    │      ↳ 触发 ydoc 'update' 事件，生成增量 update 二进制包
    │
    ├─ wsSend({ type: 'update', update: base64(update) })
    │      ↳ 通过 WebSocket 发送给服务器
    │
服务器收到
    ├─ Y.applyUpdate(ydoc, update)  ← 服务器 Y.Doc 也记录此操作
    │
    └─ 广播给所有其他客户端：{ type: 'update', update: 'base64...' }

B 收到
    ├─ Y.applyUpdate(ydoc, update, 'remote')
    │      ↳ B 的 Y.Doc 合并此操作
    │      ↳ ytext.observe() 触发
    │
    └─ textarea.value = ytext.toString()  ← 界面更新显示 "X"
```

---

## 7. 关键代码逐行讲解

### 7.1 服务端：共享 Y.Doc

```javascript
// server.js 第 32-34 行
const Y     = require('yjs');

const ydoc  = new Y.Doc();          // 服务器端的"权威"文档副本
const ytext = ydoc.getText('content'); // 获取名为 'content' 的协同文本
```

**解释**：
- `new Y.Doc()` 创建一个文档容器，类似 MongoDB 中的一个 document
- `getText('content')` 从文档中获取（或创建）一个名叫 `content` 的协同文本共享类型
- 这个 `ydoc` 是所有用户操作的汇总，始终保持最新状态
- 服务器重启后 `ydoc` 会重置（本 demo 未做持久化）

---

### 7.2 客户端：本地 Y.Doc

```javascript
// index.html（Script 部分）
var ydoc  = new Y.Doc();
var ytext = ydoc.getText('content');
```

**解释**：
- 每个浏览器 Tab 都有**自己独立的** `Y.Doc`
- 和服务器的 `ydoc` 是"副本"关系，名字必须一样（`'content'`）
- 刚创建时是空的，通过 sync2 同步服务器状态

---

### 7.3 连接握手：sync1 / sync2

这是 Yjs 的标准"差量同步"流程，确保新用户能收到完整文档：

```javascript
// 客户端 —— WebSocket 连接成功后
ws.onopen = function() {
  // 告诉服务器"我目前的版本（可能是空）"
  // Y.encodeStateVector 生成 State Vector：{ 用户A: 我已收到A的第N个操作 }
  wsSend({ type: 'sync1', sv: uint8ToBase64(Y.encodeStateVector(ydoc)) });
};
```

```javascript
// 服务端 —— 收到 sync1
case 'sync1': {
  const sv = fromBase64(msg.sv);
  // encodeStateAsUpdate(ydoc, sv) = 
  //   "把 ydoc 中，sv 没有的那些操作，打包成一个 update"
  const update = Y.encodeStateAsUpdate(ydoc, sv);
  jsend(ws, { type: 'sync2', update: toBase64(update) });
  break;
}
```

```javascript
// 客户端 —— 收到 sync2（或 update）
case 'sync2':
case 'update': {
  var update = base64ToUint8(msg.update);
  // 将服务器发来的操作合并到本地 Y.Doc
  // 'remote' 是 origin 标记，用于防止回声（见 7.6）
  Y.applyUpdate(ydoc, update, 'remote');
  break;
}
```

**图解**：

```
客户端（新连接，空文档）          服务器（已有 "Hello"）
         │                              │
         │──sync1: sv={}───────────────►│  "我的版本是空的"
         │                              │
         │◄─sync2: update=[H,e,l,l,o]──│  "给你缺失的所有操作"
         │                              │
   applyUpdate                          │
   本地 ytext = "Hello" ✓               │
```

---

### 7.4 增量更新：update 消息

```javascript
// 客户端 —— 本地 Y.Doc 变化时自动触发
ydoc.on('update', function(update, origin) {
  if (origin === 'remote') return;  // 防止回声，见 7.6
  // update 是 Uint8Array（二进制），转 base64 后通过 JSON 传输
  wsSend({ type: 'update', update: uint8ToBase64(update) });
});
```

```javascript
// 服务端 —— 收到增量更新
case 'update': {
  const update = fromBase64(msg.update);
  Y.applyUpdate(ydoc, update);         // 1. 服务器自己合并
  jbroadcastExcept(ws, {               // 2. 转发给所有其他客户端
    type: 'update', update: msg.update
  });
  break;
}
```

**关键理解**：`update` 不是文档全文，而是一个**增量操作包**。类比 Git 的 commit：不是传整个代码库，只传"改了哪些行"。

---

### 7.5 textarea ↔ Yjs 双向桥接

这部分是把"普通 textarea"和"CRDT Y.Text"连接起来，是最有技巧性的地方。

#### 方向一：Yjs → textarea（别人的修改 → 我的界面）

```javascript
// 监听 Y.Text 的任何变化（无论来自本地还是远端）
ytext.observe(function() {
  var newVal = ytext.toString();       // 获取 CRDT 当前文本
  if (editorEl.value === newVal) return; // 没变就不更新（性能优化）
  
  var sel = editorEl.selectionStart;   // 保存光标位置
  
  suppressInput = true;                // 🔑 阻止下面的 textarea 更新触发 input 事件
  editorEl.value = newVal;             // 更新 textarea 显示
  suppressInput = false;
  
  // 恢复光标（防止远端更新把光标跳到末尾）
  editorEl.selectionStart = editorEl.selectionEnd = Math.min(sel, newVal.length);
});
```

#### 方向二：textarea → Yjs（我的输入 → CRDT 操作）

```javascript
editorEl.addEventListener('input', function() {
  if (suppressInput) return;  // 🔑 防止 Yjs→textarea 的更新再次触发

  var newVal = editorEl.value;
  var oldVal = ytext.toString();

  // ── 最小 diff 算法 ──
  // 从头找第一个不同的位置
  var s = 0;
  while (s < oldVal.length && s < newVal.length && oldVal[s] === newVal[s]) s++;

  // 从尾找最后一个不同的位置
  var e = 0;
  while (e < oldVal.length - s && e < newVal.length - s
         && oldVal[oldVal.length - 1 - e] === newVal[newVal.length - 1 - e]) e++;

  var delCount = oldVal.length - s - e;  // 要删除多少个字符
  var insText  = newVal.slice(s, newVal.length - e);  // 要插入什么

  // 用 CRDT 操作替换（不是直接赋值！）
  ydoc.transact(function() {
    if (delCount > 0) ytext.delete(s, delCount);
    if (insText.length > 0) ytext.insert(s, insText);
  });
});
```

**举例说明 diff 算法**：

```
旧文本：  H e l l o   W o r l d
          0 1 2 3 4 5 6 7 8 9 10

用户把第5位的空格删掉，改成 "HelloWorld"

新文本：  H e l l o W o r l d
          0 1 2 3 4 5 6 7 8 9

diff 计算：
  s=5（前5个字符 "Hello" 相同）
  e=5（后5个字符 "World" 相同）
  delCount = 11-5-5 = 1（删掉1个字符，即空格）
  insText  = ""（没有插入）

CRDT 操作：ytext.delete(5, 1)
```

---

### 7.6 防止回声：origin 标记

这是很容易忽略却非常重要的细节。

**问题**：如果不做处理，会形成无限循环：

```
远端 update 到达
  → Y.applyUpdate(ydoc, update)
  → ydoc 'update' 事件触发
  → wsSend({ type: 'update', ... })   ← 把别人的操作又发回去了！
  → 服务器再广播
  → 又触发 update
  → 死循环 💀
```

**解决方案**：`origin` 参数

```javascript
// 应用远端更新时，传入 'remote' 作为 origin 标记
Y.applyUpdate(ydoc, update, 'remote');
//                          ^^^^^^^^ 这个值会出现在 ydoc 'update' 事件的第二个参数里

// ydoc 'update' 事件处理器中检查 origin
ydoc.on('update', function(update, origin) {
  if (origin === 'remote') return;  // 是远端触发的，跳过，不再转发
  wsSend({ type: 'update', update: uint8ToBase64(update) });
});
```

**本地输入时**，`ydoc.transact()` 不传 origin（默认为 `null`），所以会正常发送。

---

## 8. 冲突场景演示：CRDT 如何自动解决

假设文档当前内容是 `"Hello"`，用户 A 和 B 同时编辑：

```
用户A（userId=1）：在末尾插入 "World" → ytext.insert(5, 'World')
用户B（userId=2）：在末尾插入 "!"     → ytext.insert(5, '!')
```

网络延迟导致两人几乎同时操作，服务器收到的顺序是先 A 后 B。

**Yjs 内部是如何记录操作的？**

每个 `insert` 操作内部结构（简化）：
```
操作A: { id: {client: 1, clock: 1}, content: 'World', left: <id of 'o'>, right: null }
操作B: { id: {client: 2, clock: 1}, content: '!',     left: <id of 'o'>, right: null }
```

注意：位置不是 `index=5`，而是"插在哪个字符的右边"（使用**逻辑位置**，即另一个操作的 ID）。这样即使先插入了 'World'，'!' 的逻辑位置依然明确。

**合并规则（YATA 算法）**：
- 两个操作都说"我在 'o' 的右边插入"
- 需要决定谁在前谁在后
- Yjs 使用 `client ID` 大小来打破平局（client=2 > client=1，所以 '!' 在 'World' 前面）

**所有节点最终收敛到**：`"Hello!World"`

无论 A 先收到还是 B 先收到，经过 CRDT 合并，**所有人最终看到相同的结果**，没有任何内容丢失。

---

## 9. State Vector 是什么？

State Vector（状态向量）是 Yjs 用于描述"我目前知道哪些操作"的紧凑摘要。

```javascript
// 假设文档收到了以下操作：
// 用户1 的第1、2、3个操作
// 用户2 的第1、2个操作

// State Vector 看起来像：
{ 1: 3, 2: 2 }
// 意思：用户1的前3个操作我都有了，用户2的前2个操作我都有了
```

**用途**：

```javascript
// 客户端连接时发送自己的 State Vector
wsSend({ type: 'sync1', sv: uint8ToBase64(Y.encodeStateVector(ydoc)) });
// 如果客户端是全新的（空文档），SV = {}

// 服务端收到后，只发送客户端缺少的操作
const update = Y.encodeStateAsUpdate(ydoc, sv);
// encodeStateAsUpdate 会自动对比：
// "我有 {1:5, 2:3}，你有 {1:2, 2:2}，那我把用户1的第3、4、5个操作发给你"
```

**好处**：节省带宽，不用每次都传输全量文档，只传增量。

---

## 10. 为什么用 base64 传输？

Yjs 的 `update` 是 `Uint8Array`（二进制数据）。

本项目的通信协议是 **JSON over WebSocket**（所有消息都是 JSON 字符串）。

JSON 不能直接表示二进制数据，所以需要 base64 编码：

```javascript
// 服务端（Node.js）
function toBase64(uint8arr) {
  return Buffer.from(uint8arr).toString('base64');
  // Uint8Array → base64 字符串，如: "AAIBCw=="
}

function fromBase64(str) {
  return new Uint8Array(Buffer.from(str, 'base64'));
  // base64 字符串 → Uint8Array
}

// 客户端（浏览器）
function uint8ToBase64(arr) {
  var binary = '';
  for (var i = 0; i < arr.length; i++) binary += String.fromCharCode(arr[i]);
  return btoa(binary);  // 浏览器内置 btoa 函数
}

function base64ToUint8(b64) {
  var binary = atob(b64);  // 浏览器内置 atob 函数
  var arr = new Uint8Array(binary.length);
  for (var i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return arr;
}
```

**base64 的代价**：体积增大约 33%（3字节变4字节）。对于文本编辑的增量更新（通常只有几十字节），这个开销完全可以接受。

---

## 11. CRDT vs 其他方案对比

### 方案一：Last-Write-Wins（本项目最初的版本）

```
优点：实现极简（广播全文即可）
缺点：并发编辑必然丢数据，不适合多人协作
```

### 方案二：OT（Operational Transformation，Google Docs 使用）

```
优点：成熟方案，Google Docs / SharePoint 都用
缺点：
  - 算法极其复杂，实现容易出 bug
  - 需要中央服务器协调操作顺序（不能去中心化）
  - 操作必须经过服务器"变换"后才能应用
```

### 方案三：CRDT（本项目当前方案）

```
优点：
  - 数学保证最终一致性，无冲突
  - 操作可以乱序接收，最终结果相同
  - 天然支持离线编辑（离线时积累操作，重连后合并）
  - 可以去中心化（P2P 协作）

缺点：
  - 内存占用较高（需要保留操作历史，"墓碑"机制）
  - 删除操作的实现比 OT 复杂
  - Yjs 等库已经解决了大部分实现难题
```

### 对比表

| 特性 | Last-Write-Wins | OT | CRDT (Yjs) |
|------|----------------|----|------------|
| 并发安全 | ❌ | ✅ | ✅ |
| 实现复杂度 | 极低 | 极高 | 中（用库） |
| 离线编辑 | ❌ | ❌ | ✅ |
| 中央服务器依赖 | 需要 | 强依赖 | 可选 |
| 内存占用 | 低 | 中 | 较高 |
| 代表产品 | 简易聊天 | Google Docs | Figma / Linear |

---

## 12. 常见问题 FAQ

### Q1：服务器挂了，数据会丢吗？

**本 demo 会丢**。因为 `Y.Doc` 只在内存里。生产环境需要持久化：
```javascript
// 方案：监听 ydoc update，写入数据库
ydoc.on('update', (update) => {
  // 追加到数据库
  db.append('doc_updates', update);
});

// 启动时从数据库恢复
const savedUpdates = await db.getAll('doc_updates');
savedUpdates.forEach(u => Y.applyUpdate(ydoc, u));
```

### Q2：离线后重连，会丢操作吗？

**不会**。这是 CRDT 的优势之一：

```
用户 A 离线，继续在本地编辑，Y.Doc 积累了操作
→ 重连后，发送 sync1（我的 State Vector）
→ 服务器回复 sync2（我缺的操作）
→ 同时，客户端把本地积累的操作发给服务器
→ 双方都补全了对方缺失的操作
→ 最终收敛 ✓
```

本 demo 的断线重连逻辑：
```javascript
ws.onclose = function() {
  setStatus('offline', '已断开，重连中…');
  setTimeout(connect, 2000);  // 2秒后重连
};
```
重连后 `ws.onopen` 会重新发送 `sync1`，触发差量同步。

### Q3：为什么 textarea 的 `suppressInput` 变量要存在？

防止**无限循环**：

```
ytext 变化 → ytext.observe 触发 → editorEl.value = newText
                                         ↓
                                  触发 input 事件！
                                         ↓
                                  input 处理器读取 editorEl.value
                                         ↓
                                  ydoc.transact(ytext.insert...)
                                         ↓
                                  又触发 ytext.observe... 💀
```

`suppressInput = true` 在修改 `editorEl.value` 前设置，`input` 处理器开头检查它，发现是 `true` 就直接 `return`，打破循环。

### Q4：为什么 `transact` 包裹操作？

`ydoc.transact()` 把多个操作合并成一个 `update` 事件：

```javascript
// 不用 transact：每个操作都触发一次 update 事件（触发2次网络发送）
ytext.delete(5, 1);  // 触发 update 事件
ytext.insert(5, 'X'); // 触发 update 事件

// 用 transact：所有操作合并为一个 update（只触发1次网络发送）
ydoc.transact(() => {
  ytext.delete(5, 1);
  ytext.insert(5, 'X');
}); // 触发1次 update 事件
```

减少网络请求，提升性能。

### Q5：`Y.encodeStateAsUpdate(ydoc, sv)` 中 `sv` 不传会怎样？

```javascript
Y.encodeStateAsUpdate(ydoc)       // 返回完整文档的所有操作（全量）
Y.encodeStateAsUpdate(ydoc, sv)   // 只返回 sv 中没有的操作（增量）
```

新用户连接时，客户端发送 `sync1` 中的 `sv` 是空的 `Y.Doc` 的 State Vector（近似于 `{}`），服务器会返回完整文档。之后的增量 `update` 只包含新操作。

---

## 总结

```
用户输入一个字符
    │
    ▼
textarea input 事件
    │
    ├─ diff 算法（找到最小改动）
    │
    ▼
ydoc.transact(() => ytext.insert/delete)
    │
    ├─ CRDT 记录操作（含用户ID + 逻辑时钟 + 内容）
    │
    ▼
ydoc 'update' 事件（origin != 'remote'）
    │
    ├─ 序列化为 Uint8Array → base64
    │
    ▼
WebSocket 发送 { type: 'update', update: 'base64...' }
    │
    ▼
服务器 Y.applyUpdate() → 广播给其他客户端
    │
    ▼
其他客户端 Y.applyUpdate(ydoc, update, 'remote')
    │
    ├─ CRDT 合并（自动解决并发冲突）
    │
    ▼
ytext.observe() 触发
    │
    ▼
textarea.value = ytext.toString()
    │
    ▼
用户看到更新 ✓
```

整个流程的核心魔法在 `Y.applyUpdate()`：无论收到的操作顺序如何，无论多少人同时编辑，Yjs 的 CRDT 算法都能保证所有副本最终收敛到相同的文档状态。
