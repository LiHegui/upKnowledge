# CRDT 协同编辑 Demo 逐行讲解

> 本页是「[实时协同系统](./)」专题的**实战教程篇**，以本仓库的协同编辑器 demo 真实代码为例，面向零基础读者，把「一个字符从输入到同步」讲透。
>
> CRDT / YATA / State Vector / 墓碑等**概念原理**不在此重复，见 [CRDT 原理与 Yjs 实战](./CRDT原理)。本页只聚焦**这份 demo 的代码是怎么跑起来的**。

---

## 一、核心思想：传"操作"而非"状态"

理解整份代码前，先抓住一个关键区别。

普通做法（Last-Write-Wins）传输的是**状态**——整个文档内容：

```
"Hello!" ← 直接把全文发出去，后到的覆盖先到的，会丢数据
```

CRDT 传输的是**操作（Operation）**——一个带全局唯一标识的动作：

```
"在逻辑位置 #5、由用户B、插入字符 '!'"
```

每个操作都携带「**谁**做的（用户 ID）、**什么逻辑时刻**（逻辑时钟）、**做了什么**（插入/删除 + 内容 + 位置）」。因为信息完整且位置是逻辑锚点，无论到达顺序如何都能正确合并。

> 为什么这样就能无冲突？背后的 YATA 算法与数学性质见 [CRDT 原理 · 核心算法篇](./CRDT原理#核心算法篇)。

---

## 二、项目整体架构

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

**关键点**：服务器上也有一个 `Y.Doc`，它是所有客户端 doc 的"权威副本"，用于给新加入的客户端提供初始状态。每个浏览器 Tab 各持有一份独立副本，通过 WebSocket 交换 `update`。

---

## 三、关键代码逐行讲解

### 3.1 服务端：共享 Y.Doc

```javascript
// server.js 第 32-34 行
const Y     = require('yjs');

const ydoc  = new Y.Doc();          // 服务器端的"权威"文档副本
const ytext = ydoc.getText('content'); // 获取名为 'content' 的协同文本
```

- `new Y.Doc()` 创建一个文档容器，类似 MongoDB 中的一个 document
- `getText('content')` 从文档中获取（或创建）一个名叫 `content` 的协同文本共享类型
- 这个 `ydoc` 是所有用户操作的汇总，始终保持最新状态
- 服务器重启后 `ydoc` 会重置（本 demo 未做持久化，生产方案见 [CRDT 原理 · 持久化](./CRDT原理#工程实践篇)）

### 3.2 客户端：本地 Y.Doc

```javascript
// index.html（Script 部分）
var ydoc  = new Y.Doc();
var ytext = ydoc.getText('content');
```

- 每个浏览器 Tab 都有**自己独立的** `Y.Doc`
- 和服务器的 `ydoc` 是"副本"关系，名字必须一样（`'content'`）
- 刚创建时是空的，通过 sync2 同步服务器状态

### 3.3 连接握手：sync1 / sync2

这是 Yjs 的标准「差量同步」流程，确保新用户能收到完整文档：

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
  // 'remote' 是 origin 标记，用于防止回声（见 3.6）
  Y.applyUpdate(ydoc, update, 'remote');
  break;
}
```

图解：

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

> `State Vector` 与 `encodeStateAsUpdate` 的差量同步原理，见 [CRDT 原理 · State Vector](./CRDT原理#q-state-vector-状态向量-是什么-在-yjs-中有何作用)。

### 3.4 增量更新：update 消息

```javascript
// 客户端 —— 本地 Y.Doc 变化时自动触发
ydoc.on('update', function(update, origin) {
  if (origin === 'remote') return;  // 防止回声，见 3.6
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

### 3.5 textarea ↔ Yjs 双向桥接

把"普通 textarea"和"CRDT Y.Text"连接起来，是整份 demo 最有技巧性的地方。

**方向一：Yjs → textarea（别人的修改 → 我的界面）**

```javascript
ytext.observe(function() {
  var newVal = ytext.toString();       // 获取 CRDT 当前文本
  if (editorEl.value === newVal) return; // 没变就不更新（性能优化）

  var sel = editorEl.selectionStart;   // 保存光标位置

  suppressInput = true;                // 🔑 阻止下面的赋值触发 input 事件
  editorEl.value = newVal;             // 更新 textarea 显示
  suppressInput = false;

  // 恢复光标（防止远端更新把光标跳到末尾）
  editorEl.selectionStart = editorEl.selectionEnd = Math.min(sel, newVal.length);
});
```

**方向二：textarea → Yjs（我的输入 → CRDT 操作）**

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

**diff 算法举例**——用户把 `"Hello World"` 第5位的空格删掉：

```
旧文本：  H e l l o   W o r l d
          0 1 2 3 4 5 6 7 8 9 10

新文本：  H e l l o W o r l d
          0 1 2 3 4 5 6 7 8 9

diff 计算：
  s=5（前5个字符 "Hello" 相同）
  e=5（后5个字符 "World" 相同）
  delCount = 11-5-5 = 1（删掉1个字符，即空格）
  insText  = ""（没有插入）

CRDT 操作：ytext.delete(5, 1)
```

> `transact` 为什么要包裹：把多个操作合并成一个 `update` 事件，只触发一次网络发送。详见 [CRDT 原理 · 事务](./CRDT原理#q-yjs-的核心-api-有哪些-如何快速上手)。

### 3.6 防止回声：origin 标记

这是很容易忽略却非常重要的细节。若不处理，会形成无限循环：

```
远端 update 到达
  → Y.applyUpdate(ydoc, update)
  → ydoc 'update' 事件触发
  → wsSend({ type: 'update', ... })   ← 把别人的操作又发回去了！
  → 服务器再广播 → 又触发 update → 死循环 💀
```

**解决方案**：`origin` 参数

```javascript
// 应用远端更新时，传入 'remote' 作为 origin 标记
Y.applyUpdate(ydoc, update, 'remote');
//                          ^^^^^^^^ 这个值会出现在 ydoc 'update' 事件的第二个参数里

ydoc.on('update', function(update, origin) {
  if (origin === 'remote') return;  // 是远端触发的，跳过，不再转发
  wsSend({ type: 'update', update: uint8ToBase64(update) });
});
```

本地输入时，`ydoc.transact()` 不传 origin（默认为 `null`），所以会正常发送。

> 与之配套的另一处防循环是 textarea 的 `suppressInput`（见 3.5），两者分别打破「网络转发」和「界面回填」两条循环链路。

---

## 四、为什么用 base64 传输？

Yjs 的 `update` 是 `Uint8Array`（二进制），而本 demo 的通信协议是 **JSON over WebSocket**。JSON 不能直接表示二进制，所以需要 base64 编码：

```javascript
// 服务端（Node.js）
function toBase64(uint8arr) {
  return Buffer.from(uint8arr).toString('base64');   // Uint8Array → "AAIBCw=="
}
function fromBase64(str) {
  return new Uint8Array(Buffer.from(str, 'base64'));  // base64 → Uint8Array
}

// 客户端（浏览器）
function uint8ToBase64(arr) {
  var binary = '';
  for (var i = 0; i < arr.length; i++) binary += String.fromCharCode(arr[i]);
  return btoa(binary);  // 浏览器内置 btoa
}
function base64ToUint8(b64) {
  var binary = atob(b64);  // 浏览器内置 atob
  var arr = new Uint8Array(binary.length);
  for (var i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return arr;
}
```

**代价**：体积增大约 33%（3 字节变 4 字节）。对文本编辑的增量更新（通常只有几十字节）完全可以接受。若追求极致，可改用二进制 WebSocket 帧直接传 `Uint8Array`，省去编解码。

---

## 五、串起来：一次输入的完整数据流

```
用户在 textarea 输入 "X"
    │
    ▼  input 事件（suppressInput=false）
diff 算法算出最小改动（哪里删、哪里插）
    │
    ▼
ydoc.transact(() => ytext.insert/delete)
    │  Yjs 记录操作（含用户ID + 逻辑时钟 + 逻辑位置）
    ▼
ydoc 'update' 事件（origin != 'remote'）
    │  Uint8Array → base64
    ▼
WebSocket 发送 { type: 'update', update: 'base64...' }
    │
    ▼
服务器 Y.applyUpdate() → 广播给其他客户端
    │
    ▼
其他客户端 Y.applyUpdate(ydoc, update, 'remote')
    │  CRDT 合并（自动解决并发冲突）
    ▼
ytext.observe() 触发 → textarea.value = ytext.toString()
    │
    ▼
用户看到更新 ✓
```

整个流程的核心魔法在 `Y.applyUpdate()`：无论收到的操作顺序如何、无论多少人同时编辑，Yjs 的 CRDT 算法都能保证所有副本最终收敛到相同的文档状态。

> 想看两个用户**同时插入 / 同时删除**时 YATA 如何裁决顺序，见 [CRDT 原理 · 高频考点](./CRDT原理#高频考点篇)。

---

## 六、这份 demo 特有的几个疑问

**Q：服务器挂了，数据会丢吗？**
本 demo 会丢——`Y.Doc` 只在内存里。生产环境需持久化（追加写入 / 定期快照 / y-leveldb），三种方案见 [CRDT 原理 · 持久化](./CRDT原理#q-crdt-持久化方案服务器重启后数据如何恢复)。

**Q：离线后重连会丢操作吗？**
不会。重连后 `ws.onopen` 重新发送 `sync1` 触发差量同步，本地积累的操作也会补发给服务器。本 demo 的重连逻辑：

```javascript
ws.onclose = function() {
  setStatus('offline', '已断开，重连中…');
  setTimeout(connect, 2000);  // 2 秒后重连
};
```

完整离线同步流程（含 IndexedDB 持久化）见 [CRDT 原理 · 离线编辑](./CRDT原理#q-离线编辑与同步重连后如何同步)。

---

## 相关阅读

- 概念原理与面试考点：[CRDT 原理与 Yjs 实战](./CRDT原理)
- 上层概览与技术选型：[实时协同系统](./)
- 可运行源码：本仓库 `project/聊天室demo/`（Express + WebSocket + Yjs）
