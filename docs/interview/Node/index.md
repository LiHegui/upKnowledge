# Node.js 面试题

## Node 中有哪些全局对象？

**真正的全局对象**（在所有模块中可用）：

| 对象 | 说明 |
|------|------|
| `global` | Node 的全局命名空间，类似浏览器的 `window` |
| `process` | 描述当前 Node 进程状态，如 `process.env`、`process.argv`、`process.exit()` |
| `Buffer` | 处理二进制数据 |
| `clearInterval` / `setInterval` | 定时器 |
| `clearTimeout` / `setTimeout` | 计时器 |
| `queueMicrotask` | 微任务入列 |
| `console` | 日志输出 |

**模块级别变量**（看起来像全局但实际是模块内局部）：`__dirname`、`__filename`、`module`、`exports`、`require`

## 说说对 Node.js 的理解？

Node.js 是一个基于 **Chrome V8 引擎**的 JavaScript 运行时环境。

核心特点：
- **单线程**：只有一个主线程，不会为每个请求建立线程
- **事件驱动**：基于事件循环（Event Loop），回调函数处理异步操作
- **非阻塞 I/O**：文件读写、数据库查询、网络请求均不阵塞主线程
- **适合 I/O 密集型**：高并发请求处理场景（不适合 CPU 密集型）

## Node.js 的事件循环（Event Loop）是什么？

Event Loop 是 Node.js 实现非阻塞 I/O 的核心机制，基于 **libuv** 库实现。

```
每个循环周期阶段（简化）：

timers        -> 执行 setTimeout/setInterval 回调
pending I/O   -> 执行延迟的 I/O 回调
idl,prepare   -> 内部使用
poll          -> 获取新的 I/O 事件；如果没有就在此阶段阻塞
check         -> 执行 setImmediate 回调
close events  -> 关闭回调（如 socket.on('close',...)）
```

**微任务（Microtask）** 在每个阶段切换时优先执行，包括 `Promise.then`、`queueMicrotask`、`process.nextTick`（最高优先级）。

```js
setTimeout(() => console.log('setTimeout'), 0)
setImmediate(() => console.log('setImmediate'))
Promise.resolve().then(() => console.log('Promise'))
process.nextTick(() => console.log('nextTick'))

// 输出顺序： nextTick -> Promise -> setTimeout 或 setImmediate
```

## 说说 Node.js 中的 Stream（流）

Stream 是处理流式数据的抽象接口，分为四类：

| 类型 | 说明 | 典型 |
|------|------|------|
| Readable | 可读流 | `fs.createReadStream()` |
| Writable | 可写流 | `fs.createWriteStream()` |
| Duplex | 双向流 | `net.Socket` |
| Transform | 转换流 | `zlib.createGzip()` |

**优势**：处理大文件时不需要将全部数据载入内存，节省内存、提高并发处理能力。

```js
// 大文件复制示例
 const fs = require('fs')
fs.createReadStream('big.file').pipe(fs.createWriteStream('copy.file'))
```

## 什么是 Node.js 的中间件（Middleware）？

以 Koa/Express 为例，中间件是一个函数，接收请求和响应对象，可以在请求和响应周期执行任意逻辑。

**Express 中间件：**
```js
// 应用级中间件
app.use((req, res, next) => {
  console.log('Time:', Date.now())
  next()  // 传递到下一个中间件
})
```

**Koa 洋葱模型（中间件执行顺序）：**
```js
app.use(async (ctx, next) => {
  console.log('before')
  await next()   // 执行下一个中间件
  console.log('after')
})
// 进入顺序： before1 -> before2 -> 路由处理器 -> after2 -> after1
```

## require 的加载机制是什么？

```
1. 计算绝对路径
2. 查询缓存（require.cache）——已加载则直接返回
3. 找到文件（按 .js -> .json -> .node 顺序）
4. 加载模块（包裹模块代码至函数）
5. 执行模块代码，设置 module.exports
6. 返回 module.exports
```

**CommonJS 缓存机制**：模块首次加载后结果会被缓存，后续 `require` 同一模块直接返回缓存结果。

## Node.js 如何处理高并发？

1. **集群模块（cluster）**：利用多核 CPU，主进程 fork 子进程
2. **负载均衡**：配合 Nginx 或 PM2 内置负载均衡
3. **缓存** ： Redis 缓存热点数据，减少数据库压力
4. **消息队列**：异步序列化高并发写操作

```js
const cluster = require('cluster')
const http = require('http')
const numCPUs = require('os').cpus().length

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) cluster.fork()
} else {
  http.createServer((req, res) => res.end('hello')).listen(8000)
}
```
