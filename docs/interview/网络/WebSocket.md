# WebSocket 专题

---

## Q: 说说对 WebSocket 的理解？心跳机制？应用场景？

### 一、定义

WebSocket 是一种**在单个 TCP 连接上实现全双工通信**的协议，解决了 HTTP「请求-响应」模式下服务器无法主动推送的问题。

- 协议标识：`ws://` / `wss://`（TLS 加密）
- 标准：**RFC 6455**

### 二、核心特点

1. **全双工**：客户端与服务端可同时收发
2. **持久连接**：一次握手，长期保持
3. **低延迟**：数据帧头小，无 HTTP 头部冗余
4. **协议升级**：借 HTTP 的 `Upgrade` 完成握手，复用 80/443 端口

### 三、与 HTTP 的关系

**握手流程（4 步）：**

```
1. TCP 三次握手（HTTP 自带）
   ↓
2. 客户端发 HTTP 升级请求：
   GET /chat HTTP/1.1
   Host: example.com
   Upgrade: websocket           ← 声明要升级
   Connection: Upgrade
   Sec-WebSocket-Key: dGhl...   ← 随机 base64
   Sec-WebSocket-Version: 13
   ↓
3. 服务端响应：
   HTTP/1.1 101 Switching Protocols
   Upgrade: websocket
   Connection: Upgrade
   Sec-WebSocket-Accept: s3pP... ← key 经 SHA-1+base64 计算的校验值
   ↓
4. 同一 TCP 连接，协议切换为 WebSocket，开始用帧通信
```

> 注意：TCP 连接在握手前**就已经建立**（HTTP 依赖 TCP），握手不是"建连"，而是**在同一条 TCP 连接上协议升级**。

**为什么是「独立协议」：**
- 握手后**完全不用 HTTP 语义**，数据走自定义二进制帧（FIN / Opcode / Mask / Payload Length / Payload Data）
- 有自己的控制帧（Ping / Pong / Close）和状态码（1000 正常关闭、1006 异常等）
- 帧头只有 2~14 字节，远小于 HTTP 头

**为什么要「借 HTTP 握手」：**
- 复用现有 80/443 端口，**穿透代理、防火墙**
- 复用 HTTP 鉴权、Cookie、CORS 等基础设施
- 不需要为 WebSocket 单独开端口

**`Sec-WebSocket-Key/Accept` 的作用**：防止普通 HTTP 缓存/代理误识别（必须真正支持 WebSocket 的服务端才能算出正确 Accept）。

**HTTP 为什么做不到主动推送：**

| 维度 | HTTP（含 keep-alive）| WebSocket |
|------|---------------------|-----------|
| 通信模型 | 请求-响应，必须客户端先发 | 全双工，双方可主动发 |
| 长连接 | ✅ 复用 TCP，但仍单向触发 | ✅ 双向同时收发 |
| 服务端推送 | ❌ 需轮询/长轮询模拟 | ✅ 原生支持 |

> ⚠️ 误区：HTTP/1.1 默认开启 **keep-alive** 已经是长连接（复用 TCP 避免反复握手），WebSocket 解决的不是「长连接」问题，而是「**服务端主动推送 + 双向同时通信**」问题。WebSocket 出现前只能用**轮询**（polling）/ **长轮询**（long-polling）/ **SSE** 模拟推送，浪费带宽且延迟高。

### 四、客户端 API

**事件（4 个）：**

| 事件 | 触发时机 | 典型用法 |
|------|---------|---------|
| `onopen` | 握手成功、连接建立 | 启动心跳、flush 队列、恢复订阅 |
| `onmessage` | 收到服务端消息 | 解析 JSON、分发到业务处理 |
| `onerror` | 连接异常 | 日志上报，**不在此处理重连**（会接着触发 onclose）|
| `onclose` | 连接关闭 | 区分主动/被动，被动触发重连 |

**方法（2 个）：**

| 方法 | 说明 |
|------|------|
| `send(data)` | 发送数据，支持 `string` / `ArrayBuffer` / `Blob` / `ArrayBufferView` |
| `close(code?, reason?)` | 主动关闭，状态码 1000 正常、1001 离开等 |

**属性：**

| 属性 | 说明 |
|------|------|
| `readyState` | 连接状态（见下表），`send()` 前必须判断 |
| `bufferedAmount` | 已调 `send()` 但还未发出的字节数，用于流控（值持续上涨说明发送速度跟不上）|
| `binaryType` | 接收二进制类型：`'blob'`（默认）或 `'arraybuffer'` |
| `url` | 连接的 URL（含 query），只读 |
| `protocol` | 实际使用的子协议（握手时通过 `Sec-WebSocket-Protocol` 协商），只读 |
| `extensions` | 服务端启用的扩展（如 `permessage-deflate`），只读 |

**`readyState` 4 个状态值（静态常量）：**

| 值 | 常量 | 含义 |
|----|------|------|
| `0` | `WebSocket.CONNECTING` | 正在建立连接（构造后默认状态）|
| `1` | `WebSocket.OPEN` | 连接已建立，可正常通信 |
| `2` | `WebSocket.CLOSING` | 正在关闭（调用 `close()` 后）|
| `3` | `WebSocket.CLOSED` | 连接已关闭或建连失败 |

> 用常量比写数字更可读：`if (ws.readyState === WebSocket.OPEN) ...`

**`close()` 常用状态码：**

| 码 | 含义 |
|----|------|
| 1000 | 正常关闭 |
| 1001 | 端点离开（如页面跳走、服务重启）|
| 1006 | **异常关闭**（无 close 帧，最常见的"断网"码，不可主动发）|
| 1008 | 策略违反（如鉴权失败）|
| 1011 | 服务端内部错误 |
| 4000~4999 | 应用自定义码 |

```js
const ws = new WebSocket('wss://example.com', ['chat-v2']) // 第二参数为子协议数组

ws.onopen = () => {
  console.log(ws.protocol)   // 实际协商出的子协议，如 'chat-v2'
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'hello' }))
  }
}
ws.onmessage = (e) => JSON.parse(e.data)
ws.onerror = (e) => console.error(e)            // 仅日志
ws.onclose = (e) => {
  console.log(e.code, e.reason, e.wasClean)     // wasClean: 是否正常关闭
  if (!manualClosed) reconnect()
}
ws.close(1000, 'user logout')
```

### 五、典型应用场景

- 即时聊天、在线客服、直播弹幕、协同文档
- 股票行情、赛事比分、IoT 设备状态
- 多人游戏、实时白板、远程控制
- 替代轮询 / 长轮询

### 六、工程实践关键设计

#### 1. 心跳机制

**为什么需要：**
- 网络中间设备（Nginx、LB、运营商网关）会在长时间无数据时**静默断开**空闲连接
- 客户端往往**感知不到 `onclose`**（连接假死），消息发出去如石沉大海
- TCP 自带的 keepalive **默认 2 小时**才探测，粒度太粗，无法反映**应用层**假死，需在应用层补一套

**两种实现方式：**
- **应用层心跳**（推荐）：客户端定时发 `ping`，服务端回 `pong`；发出 ping 后启短超时定时器（如 5s），到点未收 pong → 主动 `close()` → 触发重连
- **协议层心跳**：服务端发 `Ping` 控制帧，浏览器自动回 `Pong`，前端无法干预，作为兜底
- 必须**前后端约定一致**：协议字段、间隔、超时阈值

**心跳本质**：不是「我还活着」，而是「**主动探测连接死没死**」——能 close 触发重连才是闭环。

```js
let heartbeatTimer = null
let pongTimer = null

function startHeartbeat(ws) {
  heartbeatTimer = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'ping' }))
      // pong 超时定时器：到点未收到 pong 则判定连接失效
      pongTimer = setTimeout(() => ws.close(), 5000)
    }
  }, 30000) // 心跳间隔需小于网关/LB 空闲超时（一般 30~60s）
}

function onPong() {
  clearTimeout(pongTimer)
}
```

#### 2. 重连策略

**完整闭环（生产级）：**

1. **入口统一**：只在 `onclose` 里处理重连；`onerror` 只记日志（错误会接着触发 `onclose`，避免双触发）
2. **区分主动 vs 被动**：用 `manualClosed` 标志位记录，用户主动 close 不重连
3. **指数退避 + 随机抖动**：`delay = min(1000 * 2^n, 30000) + random(0, 1000)`，避免重连风暴
4. **最大重试次数**：如 10 次后停止并提示用户检查网络
5. **重置计数**：`onopen` 中将 `retryCount = 0`，否则下次断开会直接从最大退避开始
6. **联动浏览器网络事件**：
   - `online` → 立即重连（绕过退避等待）
   - `offline` → 不浪费重连尝试
   - `visibilitychange` 回到前台 → 立即心跳探活
7. **重连后业务状态恢复**：底层 TCP 一断，应用层状态全失。按业务需要恢复：

   | 操作 | 触发条件 |
   |------|---------|
   | 重发 auth | 需要识别用户身份（IM、协同、私有数据推送）|
   | 重发 subscribe | 用了房间/频道订阅模式 |
   | flush 离线队列 | 有 `send()` 调用即应兜底 |

   公开行情、HMR、内网工具等无身份场景无需鉴权。鉴权方式包括 URL 拼参、Cookie、首条 auth 消息、`Sec-WebSocket-Protocol` 子协议头、IP 白名单。

   ```js
   ws.onopen = async () => {
     ws.send(JSON.stringify({ type: 'auth', token: getToken() }))
     await waitForAuthOk()
     for (const room of subscriptions) {
       ws.send(JSON.stringify({ type: 'subscribe', room }))
     }
     while (pendingQueue.length) {
       ws.send(JSON.stringify(pendingQueue.shift()))
     }
     retryCount = 0
     startHeartbeat()
   }
   ```

```js
let retryCount = 0
let manualClosed = false
const MAX_RETRY = 10

function reconnect() {
  if (manualClosed || retryCount >= MAX_RETRY) return
  const delay = Math.min(1000 * 2 ** retryCount, 30000) + Math.random() * 1000
  setTimeout(() => {
    retryCount++
    connect()
  }, delay)
}

window.addEventListener('online', () => {
  retryCount = 0   // 网络恢复，重置后立即重连
  if (!isConnected) connect()
})

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') triggerHeartbeat()
})
```

#### 3. 消息可靠性与幂等

**离线消息队列：**
- 调 `send()` 时判断 `readyState`，非 OPEN 则入队
- `onopen` 中 flush 队列（while 内每次重判 readyState，flush 过程中可能再次断开）
- **容量保护**：超 `MAX_QUEUE_SIZE` 丢最老的，避免长时间断网吃光内存
- **持久化**：高可靠场景下队列同步到 `localStorage`，刷新页面不丢消息

```js
const pendingQueue = []
const MAX_QUEUE_SIZE = 100

function send(msg) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg))
  } else {
    if (pendingQueue.length >= MAX_QUEUE_SIZE) pendingQueue.shift() // 丢最老
    pendingQueue.push(msg)
    localStorage.setItem('ws_queue', JSON.stringify(pendingQueue))   // 持久化
  }
}

ws.onopen = () => {
  while (pendingQueue.length && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(pendingQueue.shift()))
  }
}
```

**ACK 确认 + 超时重发：**
- 发送方维护「已发未确认」列表
- 收到 ACK 后从列表移除
- 超时未 ACK 则带原 `seq` 重发
- 接收方靠 `seq` 去重（业务幂等）

```js
const pending = new Map() // seq → { msg, timer }
let sendSeq = 0
const ACK_TIMEOUT = 5000

function reliableSend(payload) {
  const seq = ++sendSeq
  const msg = { seq, payload }
  ws.send(JSON.stringify(msg))
  const timer = setTimeout(() => resend(seq), ACK_TIMEOUT)
  pending.set(seq, { msg, timer })
}

function resend(seq) {
  const item = pending.get(seq)
  if (!item) return
  ws.send(JSON.stringify(item.msg)) // 带原 seq 重发
  item.timer = setTimeout(() => resend(seq), ACK_TIMEOUT)
}

ws.onmessage = (e) => {
  const data = JSON.parse(e.data)
  if (data.type === 'ack') {
    const item = pending.get(data.seq)
    if (item) {
      clearTimeout(item.timer)
      pending.delete(data.seq) // 已确认，移除
    }
  }
}
```

> **两者关系**：离线队列兜底「断网期间」消息不丢；ACK 重发兜底「在线但丢包」消息不丢；seq 去重避免重发导致服务端重复处理。

#### 4. 状态管理

- 防止重复调用 `connect()` 创建多个实例
- 页面/组件销毁时主动关闭连接，避免占用服务端连接数

#### 5. 异常监控与降级

- 上报连接状态、断开次数等指标
- 失败时降级为长轮询

---

## Q: WebSocket 和 SSE（Server-Sent Events）有什么区别？

| 维度 | WebSocket | SSE |
|------|-----------|-----|
| **方向** | 双向（全双工） | 单向（服务端 → 客户端） |
| **协议** | 独立协议（借 HTTP 握手） | 完全基于 HTTP（`text/event-stream`）|
| **二进制支持** | ✅ 支持 `ArrayBuffer`/`Blob` | ❌ 仅文本（UTF-8）|
| **自动重连** | 需自己实现 | ✅ 浏览器内置（`retry` 字段）|
| **断点续传** | 需自己处理 | ✅ 内置 `Last-Event-ID` 头 |
| **HTTP/2 复用** | ❌ 独立 TCP | ✅ 可复用同一连接 |
| **代理/防火墙穿透** | 部分代理对 ws 不友好 | 完美兼容（就是普通 HTTP）|
| **复杂度** | 高（需配心跳/重连/队列）| 低（一行代码搞定）|
| **适用场景** | 聊天、协同、游戏 | 行情推送、通知、日志流 |

**什么时候选 SSE：**
1. 只需服务端推送——通知中心、新消息提醒
2. **AI 流式输出**（典型）——GPT/Claude/DeepSeek 等 LLM 的 token 流推送（OpenAI 官方 SDK 就用 SSE）
3. 实时数据展示——股票行情、监控数据、日志流
4. 代码极简优先 / 复用现有 HTTP 鉴权与负载均衡

**什么时候选 WebSocket：**
- 双向交互频繁（聊天、协同文档、白板、多人游戏）
- 需要传输二进制数据（Protobuf、音视频、自定义协议）

---

## Q: 如何保证 WebSocket 消息的顺序性？

**为什么 TCP 顺序不够：**

TCP 只保证**单连接内**字节按序到达，但应用层在两种场景下会乱序：
1. **多连接并行发送**（如客户端开多条 ws 提升吞吐）——两条 TCP 之间没有顺序保证
2. **断线重发**：本地队列消息和重连后新发的消息可能交错到达

**解决：单调递增 seq + 接收方重排**

> ⚠️ **注意**：用**单调递增序号**（`seq: 1, 2, 3...`），不是「当前/总数」格式（`1/100`）。后者是分片传输（如大文件断点续传），WebSocket 消息是无限流，没有「总数」概念。

- 发送方每条消息打递增 `seq`
- 接收方维护 `expectedSeq`，乱序到达先入缓冲、按序处理
- 重复消息（`seq < expectedSeq`）丢弃实现幂等
- 配合 ACK 机制 + 超时重发保证可靠投递

```js
let expectedSeq = 1
const buffer = new Map()

function onMessage({ seq, content }) {
  if (seq < expectedSeq) return // 重复，丢弃
  buffer.set(seq, content)
  while (buffer.has(expectedSeq)) {
    handle(buffer.get(expectedSeq))
    buffer.delete(expectedSeq)
    expectedSeq++
  }
}
```

---

## Q: WebSocket 可以传输二进制数据吗？

可以。支持 `ArrayBuffer`、`Blob`，适合 Protobuf、MessagePack 等二进制协议。

```js
const ws = new WebSocket('wss://example.com')
ws.binaryType = 'arraybuffer'
ws.onmessage = (e) => {
  if (e.data instanceof ArrayBuffer) {
    const view = new DataView(e.data)
    // 解析二进制数据
  }
}
```

---

## Q: WebSocket 连接数上限怎么处理？

- 单机受限于**文件描述符**和**内存**（单连接约数十 KB）
- 单机优化：调高 `ulimit -n`、epoll/kqueue、Nginx 调优
- 横向扩展：多节点 + **消息队列**（Redis Pub/Sub、Kafka、NATS）广播
- 网关层用**一致性哈希**或**会话保持**

---

## Q: WebSocket 和 WebRTC 的区别？

| 维度 | WebSocket | WebRTC |
|------|-----------|--------|
| **通信模式** | 客户端 ↔ 服务器 | 端到端（P2P） |
| **底层协议** | TCP | UDP（DTLS/SRTP） |
| **延迟** | 较低 | 极低 |
| **数据类型** | 文本 / 二进制 | 音视频流 + DataChannel |
| **使用门槛** | 简单 | 需信令服务 + STUN/TURN |
| **典型场景** | 聊天、推送、协同 | 音视频通话、屏幕共享、P2P 传输 |

> WebRTC 的**信令通道**通常用 WebSocket 实现。

---

## Q: 如何封装一个生产级的 WebSocket 客户端？

整合**心跳保活、自动重连（指数退避）、消息队列、seq 排序、订阅分发**于一体的封装示例：

```ts
/** 事件监听回调 */
type Listener = (data: any) => void

interface Options {
  url: string                 // WebSocket 服务地址
  heartbeatInterval?: number  // 心跳间隔（ms），默认 30s
  pongTimeout?: number        // pong 超时时间（ms），超时未收到则断开重连
  maxRetry?: number           // 最大重连次数，避免无限重连
}

export class WSClient {
  private ws: WebSocket | null = null
  private opts: Required<Options>
  private retryCount = 0             // 当前重连次数（指数退避用）
  private heartbeatTimer: any = null // 心跳定时器
  private pongTimer: any = null      // pong 超时定时器
  private manualClosed = false       // 是否为用户主动关闭（用户主动关闭则不重连）

  // 待发送消息队列：连接未就绪 / 已断开时暂存，连接后 flush
  private pendingQueue: string[] = []

  // 发送方递增 seq（每条业务消息分配唯一序号）
  private sendSeq = 0

  // 接收方期望的下一条 seq；乱序消息先入 recvBuffer 等待
  private expectedSeq = 1
  private recvBuffer = new Map<number, any>()

  // 事件订阅表：type → 一组监听函数（业务侧通过 on/off 订阅）
  private listeners = new Map<string, Set<Listener>>()

  constructor(options: Options) {
    // 合并默认配置
    this.opts = {
      heartbeatInterval: 30000,
      pongTimeout: 5000,
      maxRetry: 10,
      ...options,
    }
  }

  /** 建立连接（外部入口） */
  connect() {
    this.manualClosed = false
    this.ws = new WebSocket(this.opts.url)
    this.ws.onopen = this.onOpen
    this.ws.onmessage = this.onMessage
    this.ws.onclose = this.onClose
    this.ws.onerror = this.onError
  }

  /** 主动关闭：标记后不再触发重连 */
  close() {
    this.manualClosed = true
    this.clearTimers()
    this.ws?.close()
  }

  /**
   * 发送业务消息，自动打 seq
   * - 已连接：立即发送
   * - 未连接 / 断线中：入队，等连接恢复后由 flushQueue flush
   */
  send(type: string, payload: any) {
    const msg = JSON.stringify({ seq: ++this.sendSeq, type, payload })
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(msg)
    } else {
      this.pendingQueue.push(msg)
    }
  }

  /** 订阅某种类型的消息 */
  on(type: string, fn: Listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set())
    this.listeners.get(type)!.add(fn)
  }

  /** 取消订阅 */
  off(type: string, fn: Listener) {
    this.listeners.get(type)?.delete(fn)
  }

  // ===== 内部方法 =====

  /** 连接成功：重置重连计数、启动心跳、flush 离线期间缓存的消息 */
  private onOpen = () => {
    this.retryCount = 0
    this.startHeartbeat()
    this.flushQueue()
  }

  /** 收到消息：处理心跳响应 → 按 seq 重排 → 分发给业务监听器 */
  private onMessage = (e: MessageEvent) => {
    const msg = JSON.parse(e.data)

    // 1. 心跳响应：清除 pong 超时定时器即可
    if (msg.type === 'pong') {
      clearTimeout(this.pongTimer)
      return
    }

    // 2. 顺序保证：按 seq 重排（仅业务消息携带 seq）
    if (typeof msg.seq === 'number') {
      if (msg.seq < this.expectedSeq) return // 重复消息，幂等丢弃
      this.recvBuffer.set(msg.seq, msg)
      // 连续按序消费缓冲区
      while (this.recvBuffer.has(this.expectedSeq)) {
        const m = this.recvBuffer.get(this.expectedSeq)!
        this.dispatch(m)
        this.recvBuffer.delete(this.expectedSeq)
        this.expectedSeq++
      }
    } else {
      // 无 seq 的消息（如服务端广播）直接分发
      this.dispatch(msg)
    }
  }

  /** 连接关闭：清理定时器，若非主动关闭则触发重连 */
  private onClose = () => {
    this.clearTimers()
    if (!this.manualClosed) this.reconnect()
  }

  /** 错误兜底：主动 close 触发 onclose，统一走重连逻辑 */
  private onError = () => {
    this.ws?.close()
  }

  /** 按 type 路由到所有订阅者 */
  private dispatch(msg: any) {
    this.listeners.get(msg.type)?.forEach((fn) => fn(msg.payload))
  }

  /**
   * 启动应用层心跳
   * - 定时发 ping
   * - 设置 pong 超时定时器：超时未收到 pong 则 close 触发重连
   */
  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState !== WebSocket.OPEN) return
      this.ws.send(JSON.stringify({ type: 'ping' }))
      this.pongTimer = setTimeout(() => this.ws?.close(), this.opts.pongTimeout)
    }, this.opts.heartbeatInterval)
  }

  /** 清理心跳 & pong 超时定时器 */
  private clearTimers() {
    clearInterval(this.heartbeatTimer)
    clearTimeout(this.pongTimer)
  }

  /**
   * 指数退避重连
   * - 退避公式：min(1000 * 2^n, 30s) + 随机抖动（避免雪崩）
   * - 达到 maxRetry 后停止
   */
  private reconnect() {
    if (this.retryCount >= this.opts.maxRetry) return
    const delay = Math.min(1000 * 2 ** this.retryCount, 30000) + Math.random() * 1000
    setTimeout(() => {
      this.retryCount++
      this.connect()
    }, delay)
  }

  /** 连接恢复后，把断开期间排队的消息按顺序发出 */
  private flushQueue() {
    while (this.pendingQueue.length && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(this.pendingQueue.shift()!)
    }
  }
}
```

**使用方式**：

```ts
// 创建实例并连接
const ws = new WSClient({ url: 'wss://example.com/chat' })
ws.connect()

// 订阅不同类型的消息
ws.on('message', (data) => console.log('收到消息', data))
ws.on('notify', (data) => console.log('系统通知', data))

// 发送业务消息（自动打 seq，断线期间会入队）
ws.send('message', { to: 'userA', content: 'hello' })

// 页面/组件销毁时主动关闭，避免资源泄漏
window.addEventListener('beforeunload', () => ws.close())
```

**设计要点**：

| 能力 | 实现 |
|------|------|
| 心跳保活 | `setInterval` 发 ping，超时未收 pong → 主动关闭触发重连 |
| 自动重连 | `onclose` 中指数退避 + 抖动，区分主动 / 被动关闭 |
| 消息队列 | 断开期间消息入队，`onopen` 后 flush |
| 顺序保证 | 发送方递增 seq，接收方 expectedSeq + 缓冲区重排 |
| 幂等 | `seq < expectedSeq` 直接丢弃 |
| 订阅分发 | `on/off/dispatch` 按 `type` 路由，业务侧解耦 |

> 💡 可继续扩展：ACK 确认、消息持久化（localStorage）、订阅 `online`/`offline` 主动重连、`visibilitychange` 后立即心跳探活等。

---
