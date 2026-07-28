# WebRTC 音视频通信

> WebRTC（Web Real-Time Communication）是浏览器原生的**实时点对点（P2P）音视频与数据通信**能力，无需插件即可实现视频通话、屏幕共享、文件直传等场景。本篇按面试高频排序，从整体流程到工程落地逐层展开。

---

## Q: WebRTC 是什么？解决了什么问题？

**A:**

WebRTC 是一套由 W3C 和 IETF 标准化的**浏览器实时通信 API + 协议栈**，核心目标是让浏览器之间**直接建立点对点连接**，传输音视频流和任意二进制数据，而不必经过服务器中转媒体。

它解决的核心痛点：

- 传统方案（如 Flash、插件）体验差、需安装；WebRTC **浏览器原生支持**，`getUserMedia` 一行拿到摄像头麦克风
- HTTP/WebSocket 走服务器中转，**延迟高、服务器带宽压力大**；WebRTC 媒体流走 P2P，**低延迟、省服务器带宽**
- 内置**回声消除、噪声抑制、自动增益、抗丢包（NACK/FEC）、拥塞控制**等音视频工程能力

三个核心 API：

| API | 作用 |
|:---|:---|
| `getUserMedia()` | 采集本地音视频流（`MediaStream`） |
| `RTCPeerConnection` | 建立/管理 P2P 连接，收发媒体流 |
| `RTCDataChannel` | 在 P2P 连接上收发任意数据（文件、消息、游戏状态） |

---

## Q: 完整的 WebRTC 连接建立流程是怎样的？（信令 + SDP + ICE）

**A:**

WebRTC 本身**不规定信令协议**——「怎么把连接信息传给对方」由开发者自行实现（常用 **WebSocket**）。整体分三步：

**1. 信令交换（Signaling）** — 通过服务器交换「连接描述」

```
A                        信令服务器(WebSocket)                    B
│  createOffer() 生成 SDP                                        │
│ ──────────── offer(SDP) ──────────────────────────────────►  │
│                                          setRemoteDescription │
│                                          createAnswer()       │
│ ◄──────────── answer(SDP) ──────────────────────────────────│
│  setRemoteDescription                                         │
```

**2. SDP（会话描述协议）** — 描述「我支持什么编解码器、分辨率、传输参数」，双方协商出交集。

**3. ICE 候选交换** — 找到一条能连通的网络路径：

```
│ ◄─────────── ICE candidate（边生成边发送，trickle ICE）──────► │
│         双方各自把候选发给对方，尝试打洞建立直连               │
```

> ⚠️ **注意**：offer/answer 与 ICE candidate 都要靠信令通道传递。信令只负责"牵线"，一旦连接建立，媒体流不再经过信令服务器。

---

## Q: STUN 和 TURN 服务器分别是干什么的？为什么需要它们？

**A:**

由于绝大多数设备处在 **NAT（网络地址转换）/ 防火墙**后面，只有私网 IP，双方无法直接知道彼此的公网地址，需要辅助服务器。

| 服务器 | 作用 | 是否中转媒体 |
|:---|:---|:---:|
| **STUN** | 帮客户端**发现自己的公网 IP:端口**，尝试 NAT 打洞（P2P 直连） | ❌ 否，仅探测 |
| **TURN** | 当 NAT 太严格无法打洞时，**中继转发媒体流**（兜底方案） | ✅ 是，全程中转 |

配置示例：

```js
const pc = new RTCPeerConnection({
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },        // STUN：免费、公开
    {                                                 // TURN：需自建/付费，消耗带宽
      urls: 'turn:turn.example.com:3478',
      username: 'user',
      credential: 'pass',
    },
  ],
});
```

> ⚠️ **注意**：TURN 会全程中转流量、消耗服务器带宽，是**最后兜底**手段。生产环境常用 [coturn](https://github.com/coturn/coturn) 自建。ICE 会按 `host → srflx(STUN) → relay(TURN)` 优先级择优连接。

---

## Q: 一个最小可用的一对一视频通话怎么实现？

**A:**

核心代码骨架（信令用 WebSocket，此处省略其收发细节）：

```js
// 1. 采集本地流
const localStream = await navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true,
});
localVideo.srcObject = localStream;

// 2. 创建连接并加入本地轨道
const pc = new RTCPeerConnection({ iceServers: [/* STUN/TURN */] });
localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

// 3. 监听远端流
pc.ontrack = (e) => { remoteVideo.srcObject = e.streams[0]; };

// 4. 收集到 ICE 候选就发给对方（trickle ICE）
pc.onicecandidate = (e) => {
  if (e.candidate) signaling.send({ type: 'ice', candidate: e.candidate });
};

// 5. 主叫方发起 offer
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);
signaling.send({ type: 'offer', sdp: offer });

// 6. 收到对方消息时的处理（简化）
signaling.onmessage = async ({ type, sdp, candidate }) => {
  if (type === 'answer') await pc.setRemoteDescription(sdp);
  else if (type === 'ice') await pc.addIceCandidate(candidate);
};
```

被叫方逻辑对称：收到 offer → `setRemoteDescription` → `createAnswer` → `setLocalDescription` → 回传 answer。

---

## Q: RTCDataChannel 是什么？和 WebSocket 有何区别？

**A:**

`RTCDataChannel` 是建立在 WebRTC P2P 连接之上的**双向数据通道**，可传任意二进制/文本，适合文件直传、实时游戏、白板协同等。

与 WebSocket 的关键区别：

| 维度 | RTCDataChannel | WebSocket |
|:---|:---|:---|
| 拓扑 | **P2P 直连**（不经服务器） | **C/S**，必经服务器中转 |
| 底层 | SCTP over DTLS over UDP | TCP |
| 传输语义 | 可配**有序/无序、可靠/不可靠** | 始终可靠、有序 |
| 延迟 | 低（直连 + 可选不可靠模式） | 相对较高（需过服务器） |
| 建连成本 | 高（需信令 + ICE 协商） | 低（一次握手） |

```js
const dc = pc.createDataChannel('chat', {
  ordered: false,        // 不要求顺序
  maxRetransmits: 0,     // 不重传 —— 适合实时游戏状态
});
dc.onmessage = (e) => console.log('收到:', e.data);
dc.onopen = () => dc.send('hello over P2P');
```

---

## Q: 如何实现屏幕共享？和摄像头采集有何不同？

**A:**

屏幕共享用 `getDisplayMedia`，采集摄像头用 `getUserMedia`，API 对称但来源不同：

```js
// 屏幕/窗口/标签页共享
const screenStream = await navigator.mediaDevices.getDisplayMedia({
  video: { frameRate: 15 },
  audio: true,           // 部分浏览器可采集系统/标签页音频
});

// 切换：把屏幕轨道替换到已有连接中（无需重新协商整条连接）
const screenTrack = screenStream.getVideoTracks()[0];
const sender = pc.getSenders().find(s => s.track?.kind === 'video');
await sender.replaceTrack(screenTrack);

// 监听用户点击浏览器原生「停止共享」
screenTrack.onended = () => { /* 切回摄像头 */ };
```

> 💡 `replaceTrack` 可在不中断通话的情况下切换轨道，比 `removeTrack` + `addTrack` 更平滑（后者会触发重新协商）。

---

## Q: 一对多 / 多对多场景下，为什么不用纯 P2P？有哪些架构方案？

**A:**

纯 Mesh（全网状 P2P）在 N 人时每个客户端要维护 N-1 条连接，**上行带宽和 CPU 编码压力随人数平方增长**，超过 4~6 人就扛不住。生产方案通常引入媒体服务器：

| 架构 | 说明 | 适用 |
|:---|:---|:---|
| **Mesh** | 各端两两直连，无媒体服务器 | 1v1、极小群（≤4） |
| **SFU**（选择性转发单元） | 每端只上行一路，服务器按需转发给其他人 | **主流**，中大型会议（如声网、LiveKit、mediasoup） |
| **MCU**（多点控制单元） | 服务器把多路流**混合成一路**再下发 | 客户端弱、需录制混流的场景，服务器成本高 |

> 💡 SFU 是当下主流：客户端上行压力小、服务器不做转码只做转发，扩展性与成本平衡最好。

---

## Q: WebRTC 常见的连接失败原因和排查思路？

**A:**

排查按「信令 → ICE → 媒体」分层：

1. **信令没通** —— offer/answer/ICE 没正确经服务器转发；检查 WebSocket 连接与消息透传。
2. **ICE 连不上** —— 监听 `pc.oniceconnectionstatechange`，卡在 `checking`/`failed` 通常是 **NAT 太严格且缺 TURN**；对称型 NAT 必须走 TURN 中继。
3. **有连接无画面** —— 检查是否 `addTrack` 了、`ontrack` 是否绑定、`<video>` 是否设置 `autoplay playsinline`（移动端静音自动播放限制）。
4. **HTTPS 限制** —— `getUserMedia`/`getDisplayMedia` 只在 **HTTPS 或 localhost** 下可用。

```js
pc.oniceconnectionstatechange = () => {
  console.log('ICE 状态:', pc.iceConnectionState);
  // new → checking → connected/completed → (disconnected/failed/closed)
};
```

> 💡 调试利器：Chrome 打开 `chrome://webrtc-internals/` 可实时查看 ICE 候选、码率、丢包、RTT 等全部内部指标。

---

## 相关阅读

- 信令与后端实时通道基础：后端知识库「🌐 网络 & 协议 → WebSocket 专题」
- 实时数据同步与冲突解决：[实时协同系统](/frontend/解决方案/实时协同系统/)
- 本仓库 Demo：`project/rtc-demo/`（Vue 3 + Vite + WebRTC P2P 通话）

---

<!-- TODO 骨架，后续可补充：
  - 编解码器选择（VP8/VP9/H.264/AV1）与 SDP munging
  - 带宽自适应（simulcast、SVC、拥塞控制 GCC）
  - 录制（MediaRecorder）与截图
  - 移动端/弱网优化实践
  - getStats() 质量监控指标详解
-->
