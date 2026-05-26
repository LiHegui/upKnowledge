# WebSocket 专题

> 从 `网络/index.md` 抽离整理，集中收录 WebSocket 相关面试题与工程实践要点。

---

## Q: 说说对 WebSocket 的理解？心跳机制？应用场景？

**A:** 可以从**基础概念、核心特点、与 HTTP 的关系、典型应用场景、工程实践关键设计**几个层面展开。

### 一、什么是 WebSocket？

WebSocket 是一种**在单个 TCP 连接上实现全双工通信**的协议，它解决了 HTTP 协议「请求-响应」模式下服务器无法主动推送数据的痛点。

- 协议标识：`ws://`（非加密）和 `wss://`（基于 TLS 加密）
- 标准化：由 IETF 定为 **RFC 6455**，所有现代浏览器都支持

### 二、核心特点与优势

1. **全双工通信**：客户端和服务端可以**同时**向对方发送数据，没有传统 HTTP「必须由客户端发起请求」的限制
2. **持久连接**：一旦建立连接，只要不主动关闭就一直保持，减少反复握手开销
3. **低延迟**：省去每次通信都需携带 HTTP 头部（尤其 Cookie 等冗余信息），数据帧头很小，适合高频、实时场景
4. **协议升级**：通过 HTTP 的 `Upgrade` 机制完成握手，兼容现有 Web 基础设施（80/443 端口、代理、防火墙等）

### 三、与 HTTP 的关系及连接过程

- **握手阶段**：客户端发送一个携带 `Upgrade: websocket` 的 HTTP 请求，服务端确认后返回 `101 Switching Protocols`，之后协议升级为 WebSocket
- **数据传输阶段**：不再使用 HTTP 语义，而是基于帧（frame）传输数据
- **常见误区**：WebSocket 不是「基于 HTTP 的」，而是「借助 HTTP 完成握手」的独立协议

```http
GET /chat HTTP/1.1
Host: example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
```

### 四、典型应用场景

- **实时双向通信**：即时聊天、在线客服、直播弹幕、协同文档（如 Google Docs）
- **实时数据推送**：股票/加密货币行情、体育赛事比分、物联网设备状态
- **游戏与交互**：多人在线游戏、实时白板、远程控制
- **低延迟替代方案**：替代轮询（Polling）/长轮询（Long Polling），显著降低服务器压力和网络延迟

### 五、工程实践中的关键设计

仅使用 `onopen`/`onmessage`/`onclose`/`onerror` 是不够的，还需考虑：

#### 1. 心跳机制（Heartbeat）

- **为什么需要**：网络中间设备（如 Nginx、负载均衡）可能在长时间无数据时主动断开连接，而客户端可能无法及时感知到 `onclose`
- **如何实现**：
  - **应用层心跳**：客户端定时发送 `ping`（自定义消息），服务端必须回复 `pong`；若一段时间未收到 `pong`，则主动关闭连接并重连
  - **协议层心跳**：服务端发送协议层 `Ping` 帧，浏览器自动回复 `Pong`，但需后端主动管理
- **核心要点**：心跳必须**前后端配合**，单靠前端无法闭环

```js
// 应用层心跳示例
let heartbeatTimer = null
let pongTimer = null

function startHeartbeat(ws) {
  heartbeatTimer = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'ping' }))
      // 超时未收到 pong 则判定连接失效
      pongTimer = setTimeout(() => ws.close(), 5000)
    }
  }, 30000)
}

function onPong() {
  clearTimeout(pongTimer)
}
```

#### 2. 重连策略

- 在 `onclose` 中判断是否为主动关闭（如用户退出），若不是则触发重连
- 采用**指数退避 + 随机抖动**，避免瞬时大量重连打垮服务器
- 设置最大重试次数，结合 `online`/`offline` 事件，在网络恢复时立即尝试重连

```js
let retryCount = 0
const MAX_RETRY = 10

function reconnect() {
  if (retryCount >= MAX_RETRY) return
  const delay = Math.min(1000 * 2 ** retryCount, 30000) + Math.random() * 1000
  setTimeout(() => {
    retryCount++
    connect()
  }, delay)
}
```

#### 3. 消息可靠性与幂等

- 连接断开时，引入**消息队列**暂存待发送消息，连接恢复后重发
- 重发可能造成重复消息，业务层需设计幂等性（如使用唯一 ID 去重）

#### 4. 状态管理与并发控制

- 防止同时多次调用 `connect()` 创建多个连接实例，需用标志位或锁控制
- 页面关闭/刷新时，应在 `beforeunload` 中主动关闭连接，避免资源泄漏

#### 5. 异常监控与降级

- 记录连接状态变化（断开、重连成功、超时等）上报监控，便于排查
- WebSocket 连接失败时可降级为 HTTP 轮询或长轮询（尤其在老旧网络环境下）

### 六、总结

WebSocket 是一个**标准化、低延迟、全双工**的通信协议，非常适合实时性要求高的场景。但在实际工程中，**需要围绕它构建一套完整的稳定性方案**（心跳、重连、消息可靠性、监控等），才能真正发挥其优势，避免「连接假死」「消息丢失」等问题。

> 💡 **答题建议**：先简洁给出定义和特点，然后结合项目中的具体实践，聊聊心跳重连的设计，体现技术深度和工程落地能力。

---

## Q: WebSocket 和 SSE（Server-Sent Events）有什么区别？

**A:**

| 维度 | WebSocket | SSE |
|------|-----------|-----|
| **方向** | 双向（全双工） | 单向（服务端 → 客户端） |
| **协议** | 独立协议（借 HTTP 握手） | 基于 HTTP |
| **二进制支持** | ✅ 支持 `ArrayBuffer`/`Blob` | ❌ 仅文本 |
| **自动重连** | 需自己实现 | ✅ 浏览器内置 |
| **复杂度** | 较高 | 较低 |
| **适用场景** | 聊天、协同、游戏等交互频繁场景 | 行情推送、通知、日志流等单向推送 |

- 若只需要服务端推送，**SSE 更轻量**
- 若需要双向高频交互，选 WebSocket

---

## Q: 如何保证 WebSocket 消息的顺序性？

**A:**

- TCP 本身保证帧顺序，单连接下消息天然有序
- 但若应用层有**多个连接**或**消息被缓存重发**，则需在消息中加入**序列号**（seq），由接收方按 seq 重排序
- 配合 ACK 确认机制可进一步保证可靠投递

---

## Q: WebSocket 可以传输二进制数据吗？

**A:** 可以。

- WebSocket 支持 `ArrayBuffer`、`Blob` 等二进制帧
- 适合传输图片、音频、自定义二进制协议（如 Protobuf、MessagePack）
- 客户端可通过 `ws.binaryType = 'arraybuffer'` 指定接收类型

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

**A:**

- 单机受限于**操作系统文件描述符**和**内存**（一个连接通常占数十 KB）
- 单机优化：调高 `ulimit -n`、使用 epoll/kqueue、Nginx 反向代理调优
- 横向扩展：多节点部署，借助**消息队列**（如 Redis Pub/Sub、Kafka、NATS）在多个服务节点间广播消息
- 网关层做**一致性哈希**或**会话保持**，让同一用户始终落到同一节点

---

## Q: WebSocket 和 WebRTC 的区别？

**A:**

| 对比维度 | WebSocket | WebRTC |
|---------|-----------|--------|
| **通信模式** | 客户端 ↔ 服务器 | 端到端（P2P） |
| **底层协议** | TCP | UDP（DTLS/SRTP） |
| **延迟** | 较低（受服务器中转影响） | 极低（直连） |
| **数据类型** | 任意（文本/二进制） | 音视频流 + DataChannel |
| **使用门槛** | 简单 | 需信令服务 + STUN/TURN |
| **典型场景** | 聊天、推送、协同 | 音视频通话、屏幕共享、P2P 文件传输 |

> WebRTC 的**信令通道**通常用 WebSocket 实现（WebRTC 本身不规定信令协议）。

---
