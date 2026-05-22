# JWT 登录方案

> JWT（JSON Web Token）是目前最流行的无状态身份认证方案，面试高频考点。

---

## Q: JWT 是什么？由哪几部分组成？

**A:**

**JWT（JSON Web Token）** 是一种开放标准（RFC 7519），以 JSON 格式在各方之间安全传输信息的紧凑字符串，通常用于身份验证和信息交换。

**三段结构（用 `.` 分隔）：**

```
Header.Payload.Signature
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywiaWF0IjoxNjE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

| 部分 | 内容 | 编码方式 |
|------|------|---------|
| **Header（头部）** | 算法类型（HS256）、Token 类型（JWT）| Base64URL |
| **Payload（载荷）** | 用户信息（userId、角色）、过期时间（exp）等 | Base64URL |
| **Signature（签名）** | `HMACSHA256(base64(header) + "." + base64(payload), secret)` | 哈希签名 |

> ⚠️ **注意**：Payload 是 Base64URL 编码，**不是加密**，任何人都能解码看到内容。敏感信息（密码、身份证）不要放 Payload。

---

## Q: JWT 登录认证流程是怎样的？

**A:**

```
客户端                          服务器
  │                               │
  │─── POST /login {user, pass} ─▶│
  │                               │ 验证账号密码
  │                               │ 生成 JWT（包含 userId、过期时间）
  │◀── 200 { token: "eyJ..." } ───│
  │                               │
  │ 存储 token（localStorage）      │
  │                               │
  │─── GET /api/user              │
  │    Authorization: Bearer eyJ..│
  │                               │ 验证 JWT 签名
  │                               │ 解析 Payload，获取 userId
  │◀── 200 { name: "Alice" } ─────│
```

---

## Q: JWT 的优缺点是什么？与 Session 有什么区别？

**A:**

| 对比维度 | Session（会话） | JWT（令牌） |
|---------|---------------|------------|
| 状态 | 有状态（服务器存储 Session）| 无状态（服务器不存储）|
| 存储位置 | 服务端内存/Redis | 客户端（localStorage/Cookie）|
| 扩展性 | 需要共享 Session（Redis）| 天然支持分布式，无需共享 |
| 性能 | 每次请求查 Session 存储 | 直接验证签名，无 I/O |
| 安全 | Cookie 可设 HttpOnly | Payload 可见，Token 泄露难吊销 |
| 失效控制 | 随时删除 Session | 必须等 Token 过期（难以主动吊销）|

**JWT 优点：**
- 无需服务端存储，天然适合微服务/分布式
- 跨域友好（放在请求头，不受 Cookie 跨域限制）
- 携带用户信息，减少数据库查询

**JWT 缺点：**
- **难以主动吊销**：Token 被盗无法让其立即失效
- Token 体积比 Session ID 大
- Payload 未加密，不能存放敏感数据

---

## Q: JWT Token 如何安全存储？

**A:**

| 存储方式 | 优点 | 缺点 | 推荐 |
|---------|------|------|------|
| `localStorage` | 简单，不受 Cookie 大小限制 | XSS 攻击可读取 | ⚠️ 一般用 |
| `sessionStorage` | 关闭标签页自动清除 | 多标签不共享 | ⚠️ 场景有限 |
| `HttpOnly Cookie` | JS 无法读取，防 XSS | 需防 CSRF | ✅ 推荐 |
| 内存（变量） | 最安全，页面关闭即消失 | 刷新丢失，需配合 Cookie | ✅ 安全性高 |

**推荐方案：**

```
Access Token（短期，15分钟） → 内存或 localStorage
Refresh Token（长期，7天）   → HttpOnly Cookie（防 XSS）
```

刷新流程：
- Access Token 过期时，用 Refresh Token 静默刷新，获取新 Access Token
- Refresh Token 泄露时，可通过将其加入黑名单（Redis）来吊销

---

## Q: JWT 前端实现示例

**A:**

**登录后存储 Token：**

```js
// 登录
async function login(username, password) {
  const { data } = await axios.post('/api/login', { username, password })
  localStorage.setItem('token', data.token)
}
```

**请求拦截器自动携带 Token：**

```js
// axios 拦截器（封装在 request.js 中）
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器处理 401（Token 过期）
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Token 过期，尝试刷新
      try {
        const { data } = await axios.post('/api/refresh')
        localStorage.setItem('token', data.token)
        // 重试原请求
        error.config.headers.Authorization = `Bearer ${data.token}`
        return axios(error.config)
      } catch {
        // 刷新失败，跳转登录页
        localStorage.removeItem('token')
        router.push('/login')
      }
    }
    return Promise.reject(error)
  }
)
```

**路由守卫验证登录状态（Vue Router）：**

```js
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})
```

---

## Q: 如何解决 JWT 难以主动吊销的问题？

**A:**

JWT 的核心设计是**无状态**，主动吊销要求引入状态，常见方案：

1. **Token 黑名单（Redis）**：登出时将 Token 加入 Redis 黑名单，每次请求校验
   - 优点：实现简单；缺点：引入了状态，失去部分无状态优势

2. **短期 Access Token + 长期 Refresh Token**
   - Access Token 有效期 15 分钟，泄露影响短暂
   - Refresh Token 存在服务端，可随时撤销

3. **版本号（Token Version）**
   - 用户表中存一个 `token_version` 字段
   - JWT Payload 中携带版本号，服务端验证版本是否匹配
   - 强制下线时，将 `token_version + 1`，旧 Token 立即失效
