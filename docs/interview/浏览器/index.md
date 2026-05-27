# 浏览器原理

> 涵盖：HTTP 缓存、渲染流程、Web 安全、脚本加载、本地存储、帧调度、标签页通信、Source Map。按面试高频排序。

---

## Q: 谈谈你对浏览器缓存机制的理解？

**A:**

浏览器请求资源时，会先查找本地缓存：**若命中且未过期则直接复用**，避免重复请求服务器，提升加载性能。

**核心流程：**

1. 每次请求先在浏览器缓存中查找该资源及其缓存标识
2. 每次拿到响应后，会将结果与缓存标识一并存入缓存

按"是否需要向服务端再次发起请求"，缓存分为两类：

| 类型 | 是否发请求 | 决定者 | 命中表现 |
|------|----------|-------|---------|
| **强缓存** | ❌ 不发请求 | 浏览器本地 | 直接读缓存（status: 200，来源 memory/disk cache） |
| **协商缓存** | ✅ 发请求 | 服务器 | 服务器返回 304，浏览器读本地缓存 |

> 💡 **优先级**：强缓存优先于协商缓存。强缓存命中 → 直接用；未命中 → 走协商缓存；协商缓存也失效 → 服务器返回 200 + 新资源。

---

## Q: 什么是强缓存？涉及哪些 HTTP 字段？

**A:**

**强缓存**：在缓存有效期内，浏览器直接使用本地缓存，**不与服务器通信**。

**相关字段：**

- **`Expires`（HTTP/1.0）**
  服务器返回的资源到期时间（绝对时间戳）。客户端时间 < `Expires` 时直接命中缓存。
  > ⚠️ 缺陷：依赖客户端本地时间，不准确。

- **`Cache-Control`（HTTP/1.1，优先级更高）**
  通过指令控制缓存行为：

  | 指令 | 含义 |
  |------|------|
  | `public` | 客户端 + 代理服务器都可缓存 |
  | `private` | 仅客户端可缓存（默认值） |
  | `no-cache` | 可缓存，但每次使用前必须走协商缓存验证 |
  | `no-store` | 完全禁用缓存（强缓存与协商缓存都不用） |
  | `max-age=xxx` | 缓存有效期（秒） |

```http
Cache-Control: max-age=3600, public
```

---

## Q: 什么是协商缓存？涉及哪些 HTTP 字段？

**A:**

**协商缓存**：强缓存失效后，浏览器携带缓存标识发请求，**由服务器决定**资源是否更新。

- 资源未更新 → 返回 **304 Not Modified**，浏览器读本地缓存
- 资源已更新 → 返回 **200** + 新资源

**两组字段（成对使用）：**

| 请求头（客户端发） | 响应头（服务端给） | 含义 |
|-------------------|------------------|------|
| `If-Modified-Since` | `Last-Modified` | 资源最后修改时间（精度：秒） |
| `If-None-Match` | `ETag` | 资源唯一标识（哈希） |

**ETag 优先于 Last-Modified**，因为：
1. `Last-Modified` 精度只到秒，1 秒内多次修改无法识别
2. 文件内容未变但修改时间变了（如重新构建），会误判为更新
3. `ETag` 基于内容生成，更精准

```http
# 首次响应
Last-Modified: Wed, 21 Oct 2025 07:28:00 GMT
ETag: "33a64df551"

# 再次请求
If-Modified-Since: Wed, 21 Oct 2025 07:28:00 GMT
If-None-Match: "33a64df551"
```

---

## Q: 强缓存与协商缓存完整流程总结？

**A:**

```
浏览器请求资源
      │
      ▼
检查强缓存 (Cache-Control / Expires)
      │
   ┌──┴──┐
  命中    未命中
   │       │
   ▼       ▼
直接用    发请求带 If-None-Match / If-Modified-Since
本地缓存   │
(200 from  ▼
 cache)   服务器对比 ETag / Last-Modified
           │
        ┌──┴──┐
       未变    已变
        │      │
        ▼      ▼
       304    200 + 新资源
       用缓存  更新缓存
```

> 📌 **结论**：强缓存优先 → 不命中走协商 → 协商也不命中重新拉取并存入缓存。

---

## Q: 在地址栏输入 URL 敲下回车后发生了什么？

**A:**

主流程六步：

1. **URL 解析**：判断是搜索词还是合法 URL，补全协议
2. **DNS 查询**：递归查找域名对应 IP（浏览器缓存 → 系统缓存 → 路由器 → ISP DNS → 根域名）
3. **TCP 三次握手**：与服务器建立连接（HTTPS 还要 TLS 握手）
4. **HTTP 请求**：发送请求报文（方法、Header、Body）
5. **服务器响应**：返回状态码 + 响应头 + 响应体
6. **页面渲染**：解析 HTML → 构建 DOM/CSSOM → 渲染树 → 布局 → 绘制（详见下文渲染流程）

> 💡 **延伸点**：可结合 HTTP 缓存、TCP 慢启动、CDN、HTTPS 证书校验、HTTP/2 多路复用展开。

---

## Q: 浏览器的渲染流程是怎样的？

**A:**

浏览器要解析三类资源：**HTML、CSS、JavaScript**，并最终绘制到屏幕上。

**1. 解析 HTML 构建 DOM 树**

字节数据 → 字符串 → Token → Node → **DOM Tree**

**2. 解析 CSS 构建 CSSOM 树**

CSS 解析与 DOM 解析**并行**，不阻塞 DOM 构建；但会**阻塞 JS 执行**（JS 可能读样式）。

**3. 处理 JavaScript**

- 默认情况下，遇到 `<script>` 会**暂停 HTML 解析**，等待 JS 下载并执行完成（因为 JS 可能修改 DOM/CSSOM）
- 这就是为什么推荐把 `<script>` 放在 `<body>` 底部
- `async` / `defer` 可改变此行为（见下题）

**4. 合并为渲染树（Render Tree）**

DOM Tree + CSSOM Tree → **Render Tree**（只包含可见节点）

**5. 布局（Layout / Reflow）**

计算每个节点的几何位置和尺寸。

**6. 分层 → 绘制指令 → 分块 → 光栅化 → 合成**

- **分层**：将页面拆为多个图层（如 `transform`、`opacity` 元素）
- **分块**：将每层切分为若干矩形块，便于并行处理
- **光栅化**：将矢量绘制指令转为位图（像素）
- **合成**：由合成线程将各层位图合并显示

> 📌 **关键**：JS 阻塞 HTML 解析的本质 → JS 可能修改 DOM，浏览器必须先执行完再继续。

[掘金好文：浏览器渲染原理](https://juejin.cn/post/6844903815758479374)

---

## Q: `<script>`、`async`、`defer` 的区别？

**A:**

| 属性 | 下载 | 执行时机 | 是否阻塞 HTML 解析 | 多个脚本顺序 |
|------|------|---------|-------------------|------------|
| 无属性（默认） | 同步 | 立即执行 | ✅ 阻塞 | 按文档顺序 |
| `async` | 异步并行 | 下载完立即执行（可能在 DOMContentLoaded 前） | ❌ 不阻塞 | ❌ 不保证顺序 |
| `defer` | 异步并行 | HTML 解析完成后、DOMContentLoaded 之前 | ❌ 不阻塞 | ✅ 按文档顺序 |

```html
<script src="a.js"></script>          <!-- 阻塞 -->
<script async src="b.js"></script>    <!-- 异步，谁先下完先执行 -->
<script defer src="c.js"></script>    <!-- 异步，按顺序，DOMContentLoaded 前执行 -->
```

> 💡 **使用建议**：
> - 与 DOM 无依赖的统计脚本 → `async`
> - 依赖 DOM 或有先后顺序的业务脚本 → `defer`

---

## Q: 什么是 XSS 攻击？如何防范？

**A:**

**XSS（Cross-Site Scripting，跨站脚本攻击）** 是攻击者将恶意脚本注入到网页中，用户浏览时脚本在其浏览器执行，从而窃取信息、劫持会话或进行钓鱼攻击。

**三种类型：**

| 类型 | 原理 | 典型场景 |
|------|------|---------|
| 存储型（Stored XSS） | 恶意脚本持久化到数据库，所有用户访问时触发 | 评论区、帖子 |
| 反射型（Reflected XSS） | 脚本通过 URL 参数传给服务器，再反射到页面 | 搜索框、错误提示 |
| DOM 型（DOM-based XSS） | 前端 JS 直接将不可信数据写入 DOM，不经过服务器 | 动态渲染、前端路由 |

**示例（反射型）：**

```
// 攻击者构造恶意链接，诱导用户点击
https://example.com/search?q=<script>document.cookie 发送到攻击者服务器</script>
```

**防范措施：**

1. **输出编码（转义）**：将 `<`、`>`、`"` 等特殊字符转为 HTML 实体（现代框架如 Vue/React 默认处理插值）
2. **CSP（Content Security Policy）**：通过 HTTP 头限制脚本来源
   ```http
   Content-Security-Policy: default-src 'self'; script-src 'self'
   ```
3. **HttpOnly Cookie**：设置后 JS 无法读取，防止 Cookie 被窃取
4. **输入验证**：服务端对用户输入进行白名单校验
5. **避免危险 API**：禁止使用 `innerHTML`、`document.write`，改用 `textContent`

---

## Q: 什么是 CSRF 攻击？如何防范？

**A:**

**CSRF（Cross-Site Request Forgery，跨站请求伪造）** 是攻击者诱导已登录用户访问恶意页面，该页面自动发起对受信任站点的请求，利用用户的合法登录态执行未授权操作（如转账、改密码）。

**攻击流程：**

```
用户登录 bank.com → Cookie 存储认证信息
         ↓
攻击者发送邮件，诱导用户点击 evil.com 链接
         ↓
evil.com 页面自动发请求 → bank.com/transfer?to=攻击者&amount=10000
         ↓
bank.com 收到请求，携带合法 Cookie，以为是用户本人操作 → 转账成功 ✗
```

**与 XSS 的区别：**

| 对比维度 | XSS | CSRF |
|---------|-----|------|
| 攻击目标 | 用户浏览器中执行恶意脚本 | 利用用户身份伪造请求 |
| 是否需要注入脚本 | ✅ 是 | ❌ 否 |
| 防御核心 | 输出编码、CSP | Token 验证、SameSite |

**防范措施：**

1. **CSRF Token**：服务器生成随机 token 与表单/请求绑定，验证请求来源
   ```js
   // 请求头中携带 token（第三方无法伪造）
   headers: { 'X-CSRF-Token': getCsrfToken() }
   ```
2. **SameSite Cookie**（最推荐）：设置 `SameSite=Strict/Lax`，跨站请求不携带 Cookie
   ```http
   Set-Cookie: sessionId=xxx; SameSite=Lax; HttpOnly; Secure
   ```
3. **检查 Referer / Origin 头**：拒绝非白名单来源的请求
4. **双 Submit Cookie**：请求中同时携带 Cookie 值和参数值，服务端校验一致性

---

## Q: JavaScript 本地存储有哪几种方式？区别与应用场景？

**A:**

| 方式 | 容量 | 生命周期 | 与服务器通信 | 作用域 | 典型场景 |
|------|------|---------|------------|--------|---------|
| **Cookie** | ~4KB | 可设置过期时间，默认会话级 | ✅ 每次请求自动携带 | 同源（可配 Domain/Path） | 身份认证、会话保持 |
| **localStorage** | ~5MB | 持久化，除非手动清除 | ❌ 不参与请求 | 同源 | 长期保存用户偏好、Token |
| **sessionStorage** | ~5MB | 当前标签页关闭即清除 | ❌ 不参与请求 | 同源 + 同标签页 | 一次性表单数据、临时登录态 |
| **IndexedDB** | 大（按需，可达几百 MB） | 持久化 | ❌ | 同源 | 离线数据库、大数据缓存 |

> ⚠️ **注意**：`localStorage` / `sessionStorage` 只能存字符串，对象需要 `JSON.stringify` 序列化；同步 API 操作大数据时会阻塞主线程。

---

## Q: 浏览器一帧（Frame）内都做了哪些事情？`requestAnimationFrame` 和 `requestIdleCallback` 分别在哪个阶段执行？

**A:**

浏览器以 **60fps** 为目标渲染页面，每帧约 **16.6ms**。在这 16.6ms 内，浏览器按固定顺序执行以下任务：

```
每一帧（16.6ms @ 60fps）
│
├── 1. Input Events（输入事件）
│       阻塞型：touch、wheel（须立即响应）
│       非阻塞型：click、keypress
│
├── 2. Timers + JavaScript
│       执行 setTimeout / setInterval 到期回调
│
├── 3. Begin Frame（开始帧）
│       Per-frame 事件：window resize、scroll、media query change
│
├── 4. requestAnimationFrame ← 动画回调在此执行
│       在下一次绘制前调用，适合做动画
│
├── 5. Layout（布局）
│       Recalculate Style（重新计算样式）
│       Update Layout（更新布局 / Reflow）
│
├── 6. Paint（绘制）
│       Compositing update、Paint invalidation、Record
│
└── 7. idle period（空闲阶段）← requestIdleCallback 在此执行
        仅在前 6 步耗时 < 16.6ms 时才有剩余时间
        React Fiber 调度器也在此阶段干活
```

**rAF vs rIC 对比：**

| 维度             | `requestAnimationFrame` | `requestIdleCallback`   |
| ---------------- | ------------------------- | ------------------------- |
| 执行时机         | 每帧绘制前（稳定）        | 每帧末尾空闲时（不稳定）  |
| 是否每帧必定执行 | ✅ 是                     | ❌ 否（帧繁忙时可能跳过） |
| 适用场景         | 动画、视觉更新            | 低优先级后台任务          |
| Safari 支持      | ✅                        | ❌ 不支持                 |
| 可指定超时       | ❌                        | ✅`{ timeout: 1000 }`   |

```js
// rAF：每帧调用，适合动画
function animate() {
  box.style.left = (parseFloat(box.style.left) + 1) + 'px'
  requestAnimationFrame(animate)
}
requestAnimationFrame(animate)

// rIC：空闲时执行，不影响主线程
requestIdleCallback((deadline) => {
  while (deadline.timeRemaining() > 1) {
    doBackgroundWork() // 利用空闲时间做低优先级工作
  }
}, { timeout: 2000 }) // 最多等 2s，超时强制执行
```

> ⚠️ **注意**：React Fiber 并未直接使用 `requestIdleCallback`（延迟不稳定且 Safari 不支持），而是用 **`MessageChannel`** 自行模拟实现了调度器，原理思路与 rIC 相同但更可控。

> ⚠️ **常见混淆**：rAF 是「**下一帧渲染前**执行」（与刷新率同步，页面卷动 / 动画场景一定调），**不是**「空闲时才调」。空闲时才调是 rIC 的语义。面试里别把两者说反了。

---

## Q: 不同标签页之间如何通信？

**A:**

常见方案：

| 方案 | 适用场景 | 是否同源 |
|------|---------|---------|
| **`localStorage` + `storage` 事件** | 简单通知 | ✅ 同源 |
| **`BroadcastChannel`** | 标签页间广播消息 | ✅ 同源 |
| **`SharedWorker`** | 多标签共享状态 / 长连接 | ✅ 同源 |
| **`postMessage`** | 跨窗口/iframe，可跨源 | 跨源 |
| **Service Worker** | PWA、消息中转 | ✅ 同源 |

**重点：SharedWorker**

`SharedWorker` 是一种特殊的 Web Worker，可在多个浏览器上下文（窗口、iframe、其他 worker）中共享运行。全局作用域为 `SharedWorkerGlobalScope`。

**关键特性**：只要创建时第一个参数（脚本路径）相同，多个页签就共享同一个 Worker 实例，可用来同步状态、复用 WebSocket 连接等。

```js
// 页面 A & 页面 B（同源）
const myWorker = new SharedWorker('worker.js')

myWorker.port.start()
myWorker.port.postMessage('Hello, worker!')
myWorker.port.onmessage = (e) => {
  console.log('收到 worker 消息:', e.data)
}
```

```js
// worker.js
const ports = []
onconnect = (e) => {
  const port = e.ports[0]
  ports.push(port)
  port.onmessage = (event) => {
    // 广播给所有连接的页面
    ports.forEach(p => p.postMessage(event.data))
  }
}
```

---

## Q: Source Map 映射的原理是什么？

**A:**

**Source Map** 是一个 JSON 文件，建立了压缩/转译后代码与原始源代码之间的**位置映射关系**，让开发者在调试时可以看到原始代码（TS、模块化 JS 等），而不是混淆压缩后的代码。

**为什么需要 Source Map？**

生产环境 JS 经过压缩、合并、Babel 转译、TS 编译等处理后，报错位置对应的是编译后的代码，难以定位问题。Source Map 解决了这个问题。

**Source Map 文件结构：**

```json
{
  "version": 3,
  "file": "bundle.min.js",
  "sources": ["src/a.ts", "src/b.ts"],
  "names": ["foo", "bar"],
  "mappings": "AACA,SAAS,GAAG"
}
```

`mappings` 字段使用 **Base64 VLQ 编码**，记录编译后每个位置 → 原始文件/行/列的对应关系。

**如何关联 Source Map：**

```js
// 文件末尾注释（开发/测试环境）
//# sourceMappingURL=bundle.min.js.map

// HTTP 响应头（对浏览器隐藏，仅错误监控平台读取）
// SourceMap: bundle.min.js.map
```

**Webpack/Vite 中的配置策略：**

| 场景 | 推荐配置 | 说明 |
|------|---------|------|
| 开发环境 | `eval-cheap-module-source-map` | 构建快，支持行级定位 |
| 生产（错误监控） | `hidden-source-map` | `.map` 文件不暴露给浏览器，只上传到 Sentry |
| 生产（开源项目） | `source-map` | 最完整，可在 DevTools 中查看原始源码 |

> ⚠️ **注意**：生产环境不建议将完整 Source Map 暴露给浏览器（会泄露源码），推荐使用 `hidden-source-map` 并将 `.map` 文件仅上传到错误监控平台（如 Sentry）。

---

**参考资料**

- [彻底理解浏览器的缓存机制 - 掘金](https://juejin.cn/post/6844903593275817998)
- [浏览器渲染原理 - 掘金](https://juejin.cn/post/6844903815758479374)
