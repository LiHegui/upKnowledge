# 网络面试核心知识

> 📐 本页采用 **Q&A + 图解** 风格，每题先看结论 → 再看图 → 再看细节，3 秒抓住要点。

<style>
.net-flow{display:flex;align-items:stretch;gap:0;flex-wrap:wrap;margin:12px 0}
.net-step{flex:1;min-width:90px;padding:12px 8px;text-align:center;font-size:12px;font-weight:600;border-radius:7px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:4px}
.net-step sub{font-weight:400;color:#888;font-size:11px;display:block;margin-top:2px}
.net-arr{color:#999;font-size:18px;padding:0 4px;display:flex;align-items:center}
.net-b{background:rgba(79,142,247,.12);border:1px solid rgba(79,142,247,.4);color:#2563eb}
.net-g{background:rgba(61,220,132,.12);border:1px solid rgba(61,220,132,.4);color:#059669}
.net-p{background:rgba(181,123,238,.12);border:1px solid rgba(181,123,238,.4);color:#8b5cf6}
.net-o{background:rgba(255,159,67,.12);border:1px solid rgba(255,159,67,.4);color:#ea580c}
.net-y{background:rgba(255,209,102,.12);border:1px solid rgba(255,209,102,.4);color:#ca8a04}
.net-r{background:rgba(255,92,92,.12);border:1px solid rgba(255,92,92,.4);color:#dc2626}
.net-osi{display:flex;flex-direction:column;gap:4px;margin:14px 0;max-width:680px}
.net-osi-row{display:flex;align-items:center;padding:10px 14px;border-radius:6px;font-size:13px;gap:12px}
.net-osi-row b{min-width:90px}
.net-osi-row span{color:#666;font-size:12px}
.net-cmp{display:flex;gap:12px;margin:14px 0;flex-wrap:wrap}
.net-cmp-card{flex:1;min-width:240px;border-radius:8px;padding:14px 16px;border:1px solid #ddd}
.net-cmp-card h5{margin:0 0 8px;font-size:14px}
.net-cmp-card ul{margin:0;padding-left:18px;font-size:13px;line-height:1.7}
.net-cmp-tcp{border-color:#3b82f6;background:rgba(59,130,246,.04)}
.net-cmp-tcp h5{color:#2563eb}
.net-cmp-udp{border-color:#10b981;background:rgba(16,185,129,.04)}
.net-cmp-udp h5{color:#059669}
</style>

---

## 协议基础篇

### Q: HTTP 和 HTTPS 的区别？

**A:**

| 维度 | HTTP | HTTPS |
|------|------|-------|
| 传输方式 | 明文 ❌ | 加密 ✅（TLS/SSL） |
| 端口 | 80 | 443 |
| 证书 | 不需要 | 需要 CA 证书 |
| 性能 | 快 | 略慢（多了握手 + 加解密） |
| URL | `http://` | `https://` |

> 💡 **一句话**：HTTPS = HTTP + TLS。在 HTTP 和 TCP 之间多加了一层 TLS 用于加密。

```
HTTP:   应用层(HTTP) ─────────────────> TCP
HTTPS:  应用层(HTTP) ──> TLS加密层 ──> TCP
```

---

### Q: HTTPS 是如何保证通信安全的？握手流程是怎样的？

**A:**

**核心思想**：用**非对称加密**安全地交换一个**对称密钥**，之后用对称密钥加密通信（性能更好）。

<div class="net-flow">
  <div class="net-step net-b">① ClientHello<sub>客户端随机数<br>+ 支持的加密套件</sub></div>
  <div class="net-arr">→</div>
  <div class="net-step net-g">② ServerHello<sub>服务器随机数<br>+ 选定加密套件<br>+ 证书(含公钥)</sub></div>
  <div class="net-arr">→</div>
  <div class="net-step net-p">③ 客户端验证证书<sub>校验 CA 签名<br>有效期、域名</sub></div>
  <div class="net-arr">→</div>
  <div class="net-step net-o">④ 生成 Pre-master<sub>用公钥加密<br>发给服务器</sub></div>
  <div class="net-arr">→</div>
  <div class="net-step net-y">⑤ 双方生成会话密钥<sub>3 个随机数<br>→ master secret</sub></div>
  <div class="net-arr">→</div>
  <div class="net-step net-r">⑥ 对称加密通信<sub>用 AES 加密<br>传输数据</sub></div>
</div>

**为什么混用对称 + 非对称加密？**

| 加密方式 | 速度 | 密钥管理 | 用途 |
|---------|------|---------|------|
| 非对称（RSA/ECC） | 慢 ❌ | 安全 ✅ | 仅用于交换对称密钥 |
| 对称（AES） | 快 ✅ | 难以安全传输 ❌ | 加密后续业务数据 |

> ⚠️ **证书的作用**：防止**中间人攻击**。CA 用自己的私钥给服务器公钥签名，浏览器内置 CA 公钥可验证签名，确认拿到的公钥确实属于该域名。

---

### Q: 说说 OSI 七层模型？

**A:**

<div class="net-osi">
  <div class="net-osi-row" style="background:#fee2e2;color:#991b1b"><b>7. 应用层</b><span>HTTP / HTTPS / DNS / FTP / SMTP</span></div>
  <div class="net-osi-row" style="background:#fed7aa;color:#9a3412"><b>6. 表示层</b><span>数据格式转换、加密压缩</span></div>
  <div class="net-osi-row" style="background:#fef3c7;color:#92400e"><b>5. 会话层</b><span>建立、管理、终止会话</span></div>
  <div class="net-osi-row" style="background:#dcfce7;color:#166534"><b>4. 传输层</b><span>TCP / UDP — 端到端通信</span></div>
  <div class="net-osi-row" style="background:#cffafe;color:#155e75"><b>3. 网络层</b><span>IP / ICMP — 路由寻址</span></div>
  <div class="net-osi-row" style="background:#dbeafe;color:#1e40af"><b>2. 数据链路层</b><span>以太网 / ARP — 相邻节点间帧传输</span></div>
  <div class="net-osi-row" style="background:#e9d5ff;color:#6b21a8"><b>1. 物理层</b><span>网线、光纤、电信号</span></div>
</div>

**记忆口诀**：「**物**理 — **数**链 — **网**络 — **传**输 — **会**话 — **表**示 — **应**用」 → 「物数网传会表应」

> 💡 **实际工程中**用 **TCP/IP 四层模型**：应用层（融合 5/6/7）/ 传输层 / 网络层 / 网络接口层（融合 1/2）。

---

## TCP / UDP 篇

### Q: TCP 三次握手流程是什么？为什么是三次？

**A:**

TCP（传输控制协议）是一种面向连接的、可靠的传输层协议。三次握手的目的是确保**双方都能发送和接收数据**。

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 380" style="max-width:640px;width:100%;height:auto;background:#fff;border:1px solid #e5e7eb;border-radius:8px;">
  <defs>
    <marker id="arr1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="#475569"/>
    </marker>
  </defs>
  <!-- 顶部角色 -->
  <rect x="60" y="20" width="120" height="34" rx="6" fill="#3b82f6"/>
  <text x="120" y="42" text-anchor="middle" fill="#fff" font-size="15" font-weight="700">客户端 Client</text>
  <rect x="460" y="20" width="120" height="34" rx="6" fill="#10b981"/>
  <text x="520" y="42" text-anchor="middle" fill="#fff" font-size="15" font-weight="700">服务器 Server</text>
  <!-- 时间线 -->
  <line x1="120" y1="60" x2="120" y2="360" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 4"/>
  <line x1="520" y1="60" x2="520" y2="360" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 4"/>
  <!-- 初始状态 -->
  <text x="120" y="78" text-anchor="middle" fill="#64748b" font-size="13" font-weight="600">CLOSED</text>
  <text x="520" y="78" text-anchor="middle" fill="#64748b" font-size="13" font-weight="600">LISTEN</text>
  <!-- ① SYN -->
  <text x="80" y="118" text-anchor="end" fill="#0ea5e9" font-size="13" font-weight="600">SYN_SENT</text>
  <line x1="120" y1="130" x2="520" y2="170" stroke="#475569" stroke-width="2" marker-end="url(#arr1)"/>
  <text x="320" y="142" text-anchor="middle" fill="#0f172a" font-size="13" font-weight="600">① SYN=1, seq=x</text>
  <!-- ② SYN+ACK -->
  <text x="560" y="188" text-anchor="start" fill="#16a34a" font-size="13" font-weight="600">SYN_RCVD</text>
  <line x1="520" y1="200" x2="120" y2="240" stroke="#475569" stroke-width="2" marker-end="url(#arr1)"/>
  <text x="320" y="212" text-anchor="middle" fill="#0f172a" font-size="13" font-weight="600">② SYN=1, ACK=1, seq=y, ack=x+1</text>
  <!-- ③ ACK -->
  <text x="80" y="258" text-anchor="end" fill="#0ea5e9" font-size="13" font-weight="600">ESTABLISHED</text>
  <line x1="120" y1="270" x2="520" y2="310" stroke="#475569" stroke-width="2" marker-end="url(#arr1)"/>
  <text x="320" y="282" text-anchor="middle" fill="#0f172a" font-size="13" font-weight="600">③ ACK=1, seq=x+1, ack=y+1</text>
  <text x="560" y="328" text-anchor="start" fill="#16a34a" font-size="13" font-weight="600">ESTABLISHED</text>
  <!-- 底部数据传输 -->
  <line x1="120" y1="350" x2="520" y2="350" stroke="#f59e0b" stroke-width="2" marker-end="url(#arr1)" marker-start="url(#arr1)"/>
  <text x="320" y="345" text-anchor="middle" fill="#f59e0b" font-size="13" font-weight="700">🎉 连接建立，开始数据传输</text>
</svg>

> 💡 **记忆口诀**：「我能发 → 你能收能发 → 我能收」，三次刚好让**双方都确认对方的收发能力**。

**为什么不是两次？** 防止已失效的旧连接请求突然到达服务器，造成资源浪费。

**为什么不是四次？** 第二次握手中 `SYN` 和 `ACK` 可以合并，没必要拆成两次。

---

### Q: TCP 四次挥手流程是什么？为什么是四次？

**A:**

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" style="max-width:640px;width:100%;height:auto;background:#fff;border:1px solid #e5e7eb;border-radius:8px;">
  <defs>
    <marker id="arr2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="#475569"/>
    </marker>
  </defs>
  <!-- 顶部角色 -->
  <rect x="60" y="20" width="120" height="34" rx="6" fill="#3b82f6"/>
  <text x="120" y="42" text-anchor="middle" fill="#fff" font-size="15" font-weight="700">客户端 Client</text>
  <rect x="460" y="20" width="120" height="34" rx="6" fill="#10b981"/>
  <text x="520" y="42" text-anchor="middle" fill="#fff" font-size="15" font-weight="700">服务器 Server</text>
  <!-- 时间线 -->
  <line x1="120" y1="60" x2="120" y2="460" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 4"/>
  <line x1="520" y1="60" x2="520" y2="460" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 4"/>
  <!-- 初始状态 -->
  <text x="120" y="78" text-anchor="middle" fill="#64748b" font-size="13" font-weight="600">ESTABLISHED</text>
  <text x="520" y="78" text-anchor="middle" fill="#64748b" font-size="13" font-weight="600">ESTABLISHED</text>
  <!-- ① FIN -->
  <text x="80" y="118" text-anchor="end" fill="#0ea5e9" font-size="13" font-weight="600">FIN_WAIT_1</text>
  <line x1="120" y1="130" x2="520" y2="165" stroke="#475569" stroke-width="2" marker-end="url(#arr2)"/>
  <text x="320" y="142" text-anchor="middle" fill="#0f172a" font-size="13" font-weight="600">① FIN=1, seq=u</text>
  <!-- ② ACK -->
  <text x="560" y="183" text-anchor="start" fill="#16a34a" font-size="13" font-weight="600">CLOSE_WAIT</text>
  <line x1="520" y1="195" x2="120" y2="230" stroke="#475569" stroke-width="2" marker-end="url(#arr2)"/>
  <text x="320" y="207" text-anchor="middle" fill="#0f172a" font-size="13" font-weight="600">② ACK=1, ack=u+1</text>
  <text x="80" y="248" text-anchor="end" fill="#0ea5e9" font-size="13" font-weight="600">FIN_WAIT_2</text>
  <!-- 半关闭说明 -->
  <rect x="430" y="218" width="180" height="50" rx="6" fill="#fef3c7" stroke="#f59e0b"/>
  <text x="520" y="238" text-anchor="middle" fill="#92400e" font-size="11" font-weight="600">服务器处理剩余数据</text>
  <text x="520" y="255" text-anchor="middle" fill="#92400e" font-size="11">（半关闭，仍可发送）</text>
  <!-- ③ FIN -->
  <text x="560" y="298" text-anchor="start" fill="#16a34a" font-size="13" font-weight="600">LAST_ACK</text>
  <line x1="520" y1="310" x2="120" y2="345" stroke="#475569" stroke-width="2" marker-end="url(#arr2)"/>
  <text x="320" y="322" text-anchor="middle" fill="#0f172a" font-size="13" font-weight="600">③ FIN=1, ACK=1, seq=v, ack=u+1</text>
  <!-- ④ ACK -->
  <text x="80" y="363" text-anchor="end" fill="#dc2626" font-size="13" font-weight="600">TIME_WAIT</text>
  <line x1="120" y1="375" x2="520" y2="410" stroke="#475569" stroke-width="2" marker-end="url(#arr2)"/>
  <text x="320" y="387" text-anchor="middle" fill="#0f172a" font-size="13" font-weight="600">④ ACK=1, seq=u+1, ack=v+1</text>
  <text x="560" y="428" text-anchor="start" fill="#64748b" font-size="13" font-weight="600">CLOSED</text>
  <!-- TIME_WAIT 说明 -->
  <text x="80" y="408" text-anchor="end" fill="#dc2626" font-size="11" font-style="italic">等待 2MSL</text>
  <text x="80" y="450" text-anchor="end" fill="#64748b" font-size="13" font-weight="600">CLOSED</text>
</svg>

| 步骤 | 方向 | 报文 | 客户端状态 | 服务器状态 |
|------|------|------|----------|----------|
| ① | C → S | `FIN` | `FIN_WAIT_1` | `ESTABLISHED` |
| ② | S → C | `ACK` | `FIN_WAIT_2` | `CLOSE_WAIT` |
| ③ | S → C | `FIN` | `FIN_WAIT_2` | `LAST_ACK` |
| ④ | C → S | `ACK` | `TIME_WAIT` → `CLOSED` | `CLOSED` |

> ⚠️ **为什么是 4 次而不是 3 次？**
> 服务器收到 `FIN` 后，可能还有数据未发完，所以 `ACK` 和 `FIN` 必须**分两次发送**（不能像握手那样合并）。这就是 TCP 的「半关闭」特性。

> ⏱️ **为什么 TIME_WAIT 要等 2MSL？**
> - 确保最后一个 `ACK` 能可靠到达服务器（若丢失，服务器会重传 `FIN`）
> - 让旧连接的残留报文在网络中自然消亡，避免污染新连接

---

---

### Q: TCP 和 UDP 的区别？分别适合什么场景？

**A:**

<div class="net-cmp">
  <div class="net-cmp-card net-cmp-tcp">
    <h5>🛡️ TCP — 可靠老实人</h5>
    <ul>
      <li>面向<b>连接</b>（三次握手）</li>
      <li><b>可靠</b>传输：确认、重传、流控、拥塞控制</li>
      <li>面向<b>字节流</b>，无边界</li>
      <li>开销大，速度慢</li>
      <li>一对一</li>
    </ul>
    <p style="margin:8px 0 0;font-size:12px;color:#666"><b>场景</b>：网页、文件下载、邮件、SSH</p>
  </div>
  <div class="net-cmp-card net-cmp-udp">
    <h5>⚡ UDP — 极速莽夫</h5>
    <ul>
      <li><b>无连接</b>，直接发</li>
      <li><b>不可靠</b>：可能丢、乱、重复</li>
      <li>面向<b>报文</b>，保留边界</li>
      <li>开销小，速度快</li>
      <li>支持一对一、一对多、多对多</li>
    </ul>
    <p style="margin:8px 0 0;font-size:12px;color:#666"><b>场景</b>：视频通话、直播、DNS、游戏、QUIC</p>
  </div>
</div>

> 💡 **选择依据**：要可靠选 TCP，要实时选 UDP。比如视频通话宁可丢几帧也不能卡顿，所以用 UDP。

---

## 实战篇

### Q: 从输入 URL 到页面渲染发生了什么？

**A:**

<div class="net-flow">
  <div class="net-step net-b">① URL 解析<sub>判断是 URL<br>还是搜索词</sub></div>
  <div class="net-arr">→</div>
  <div class="net-step net-g">② DNS 查询<sub>域名 → IP</sub></div>
  <div class="net-arr">→</div>
  <div class="net-step net-p">③ TCP 连接<sub>三次握手</sub></div>
  <div class="net-arr">→</div>
  <div class="net-step net-o">④ TLS 握手<sub>仅 HTTPS</sub></div>
  <div class="net-arr">→</div>
  <div class="net-step net-y">⑤ 发起请求<sub>HTTP Request</sub></div>
  <div class="net-arr">→</div>
  <div class="net-step net-r">⑥ 服务器响应<sub>HTTP Response</sub></div>
  <div class="net-arr">→</div>
  <div class="net-step net-b">⑦ 浏览器渲染<sub>解析 + 布局 + 绘制</sub></div>
</div>

**第 7 步「浏览器渲染」展开**：

```
HTML → DOM Tree ─┐
                 ├─→ Render Tree → Layout → Paint → Composite
CSS  → CSSOM   ─┘
                  ↑
        JS（可能阻塞解析）
```

详见 [浏览器渲染原理](../浏览器/index.md)。

---

### Q: DNS 解析的过程是怎样的？

**A:**

DNS = 把**域名**翻译成 **IP 地址**的「翻译官」。

<div class="net-flow">
  <div class="net-step net-b">浏览器缓存</div>
  <div class="net-arr">→</div>
  <div class="net-step net-g">操作系统缓存<sub>hosts 文件</sub></div>
  <div class="net-arr">→</div>
  <div class="net-step net-p">本地 DNS 服务器<sub>运营商</sub></div>
  <div class="net-arr">→</div>
  <div class="net-step net-o">根域名服务器<sub>.</sub></div>
  <div class="net-arr">→</div>
  <div class="net-step net-y">顶级域名服务器<sub>.com</sub></div>
  <div class="net-arr">→</div>
  <div class="net-step net-r">权威域名服务器<sub>example.com</sub></div>
</div>

**查询特点**：

- **客户端 → 本地 DNS**：递归查询（要么给答案，要么报错）
- **本地 DNS → 根/顶级/权威**：迭代查询（每一步只告诉你下一步去哪问）
- 每层结果都会**缓存**，下次更快

> 💡 **优化技巧**：`<link rel="dns-prefetch" href="//example.com">` 提前解析关键域名。

---

### Q: 常见 HTTP 请求方法和状态码？

**A:**

**请求方法**：

| 方法 | 用途 | 幂等 | 安全 |
|------|------|-----|------|
| GET | 获取 | ✅ | ✅ |
| POST | 创建 | ❌ | ❌ |
| PUT | 完整更新 | ✅ | ❌ |
| PATCH | 部分更新 | ❌ | ❌ |
| DELETE | 删除 | ✅ | ❌ |
| OPTIONS | 预检（CORS） | ✅ | ✅ |
| HEAD | 同 GET 但只返响应头 | ✅ | ✅ |

**状态码**：

| 范围 | 含义 | 常见 |
|------|------|------|
| 1xx | 信息 | 101 切换协议（WebSocket） |
| 2xx | 成功 | 200 OK / 201 Created / 204 No Content |
| 3xx | 重定向 | 301 永久 / 302 临时 / 304 协商缓存命中 |
| 4xx | 客户端错误 | 400 参数错 / 401 未认证 / 403 无权限 / 404 找不到 |
| 5xx | 服务端错误 | 500 内部错 / 502 网关错 / 503 不可用 / 504 网关超时 |

---

## HTTP 缓存篇

### Q: 浏览器 HTTP 缓存是怎么工作的？强缓存和协商缓存的区别？

**A:**

<div class="net-flow">
  <div class="net-step net-b">请求资源</div>
  <div class="net-arr">→</div>
  <div class="net-step net-g">查强缓存<sub>Cache-Control<br>Expires</sub></div>
  <div class="net-arr">→</div>
  <div class="net-step net-y">命中？<sub>直接用<br>200(disk/memory)</sub></div>
  <div class="net-arr">→</div>
  <div class="net-step net-o">查协商缓存<sub>If-Modified-Since<br>If-None-Match</sub></div>
  <div class="net-arr">→</div>
  <div class="net-step net-p">304 用本地<br>或 200 返新</div>
</div>

**对比一览：**

| 维度 | 🟢 强缓存 | 🟡 协商缓存 |
|------|--------|-----------|
| 是否发请求 | ❌ 不发 | ✅ 发，问服务器 |
| 状态码 | `200 (from disk/memory cache)` | `304 Not Modified` 或 `200` |
| 响应头 | `Cache-Control` / `Expires` | `Last-Modified` / `ETag` |
| 请求头 | 无 | `If-Modified-Since` / `If-None-Match` |
| 触发时机 | 第一选择 | 强缓存失效后 |

**关键字段说明：**

| 字段 | 含义 | 示例 |
|------|------|------|
| `Cache-Control: max-age=3600` | 资源 3600 秒内直接用缓存 | 强缓存首选 |
| `Cache-Control: no-cache` | 不用强缓存，每次走协商 | 不是「不缓存」⚠️ |
| `Cache-Control: no-store` | 真正的不缓存 | 敏感数据 |
| `ETag` / `If-None-Match` | 资源唯一标识（哈希），精确 | 协商缓存优先 |
| `Last-Modified` / `If-Modified-Since` | 最后修改时间（秒级精度） | 弱兜底 |

> 💡 **ETag 优先于 Last-Modified**：因为时间戳精度只到秒，1 秒内多次修改无法识别；而 ETag 是内容哈希，更精确。

**最佳实践：**

- **静态资源（hash 文件名）**：`Cache-Control: max-age=31536000, immutable`（一年强缓存）
- **HTML 入口文件**：`Cache-Control: no-cache`（每次协商，保证更新及时）
- **API 数据**：按业务决定，通常 `no-cache` 或短 `max-age`

---

## 接口与实时通信实战篇

### Q: 如何设计一个支持超时取消和重试的 fetch 封装？

**A:**

原生 `fetch` 没有内置超时机制，需要通过 `AbortController` 实现。

**基础版：单次 fetch + 超时控制**

```js
function fetchWithTimeout(url, options = {}, timeout = 10000) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  return fetch(url, { ...options, signal: controller.signal })
    .then(res => {
      clearTimeout(timeoutId)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    })
    .catch(err => {
      clearTimeout(timeoutId)
      if (err.name === 'AbortError') {
        throw new Error(`请求超时（${timeout}ms）`)
      }
      throw err
    })
}
```

**进阶版：支持超时 + 自动重试 + 指数退避**

```js
async function fetchWithRetry(url, options = {}, {
  timeout = 10000,
  retries = 3,
  retryDelay = 1000,   // 初始重试间隔
  retryOn = [503, 429] // 哪些状态码触发重试
} = {}) {

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const res = await fetch(url, { ...options, signal: controller.signal })
      clearTimeout(timeoutId)

      // 判断是否需要重试
      if (retryOn.includes(res.status) && attempt < retries) {
        const delay = retryDelay * Math.pow(2, attempt) // 指数退避
        await sleep(delay)
        continue
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()

    } catch (err) {
      clearTimeout(timeoutId)

      const isLast = attempt === retries
      if (isLast) throw err  // 最后一次失败，直接抛出

      if (err.name === 'AbortError') {
        // 超时也重试
        await sleep(retryDelay * Math.pow(2, attempt))
      } else {
        throw err  // 非超时错误，不重试
      }
    }
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }
```

> ⚠️ **生产建议**：无限重试可能造成接口雪崩，务必加**最大重试次数限制**和**断路器（Circuit Breaker）机制**。

---

### Q: WebRTC 的核心原理是什么？建连流程是怎样的？

**A:**

**WebRTC** 是浏览器端实时音视频/数据通信标准，核心目标是**端到端（P2P）低延迟**通信。

**四大核心组件：**

| 组件 | 作用 |
|------|------|
| `getUserMedia` | 采集摄像头/麦克风流 |
| `RTCPeerConnection` | P2P 连接对象，负责媒体与数据传输 |
| **信令服务器**（自建，通常用 WebSocket） | 交换 SDP / ICE 信息 |
| **STUN / TURN** | NAT 穿透；穿透失败时 TURN 中继转发 |

**建连流程：**

<div class="net-flow">
  <div class="net-step net-b">① A 创建 offer<sub>SDP</sub></div>
  <div class="net-arr">→</div>
  <div class="net-step net-g">② 信令转发<sub>给 B</sub></div>
  <div class="net-arr">→</div>
  <div class="net-step net-p">③ B 创建 answer<sub>回给 A</sub></div>
  <div class="net-arr">→</div>
  <div class="net-step net-o">④ 交换 ICE<sub>候选路径</sub></div>
  <div class="net-arr">→</div>
  <div class="net-step net-y">⑤ 选最优链路<sub>P2P 或 TURN</sub></div>
  <div class="net-arr">→</div>
  <div class="net-step net-r">⑥ 媒体流建立</div>
</div>

```ts
const pc = new RTCPeerConnection({
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
})
const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
stream.getTracks().forEach(track => pc.addTrack(track, stream))
const offer = await pc.createOffer()
await pc.setLocalDescription(offer)
// 通过信令服务器把 offer 发给对端
```

| 维度 | WebSocket | WebRTC |
|------|-----------|--------|
| 连接形态 | 客户端-服务器 | 端到端（优先 P2P） |
| 典型场景 | 即时消息、推送 | 音视频通话、实时互动 |
| 延迟 | 取决于服务端 | 直连时通常更低 |
| 信令 | 不需要 | ✅ 必须 |

> ⚠️ **注意**：WebRTC 并不"去服务器化"，至少需要信令服务；复杂网络下还需 TURN 服务保障连通率。

---

## 扩展专题

> 📂 **WebSocket** 相关面试题（理解、心跳、重连、SSE 对比、二进制传输、连接数扩展、与 WebRTC 对比等）已抽离至独立文档：[WebSocket 专题](./WebSocket.md)

---
