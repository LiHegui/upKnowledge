# 前端性能优化

## 什么是懒加载（Lazy Loading）？

懒加载是指延迟加载资源或组件，在真正需要展示时才加载，**减少首屏资源体积**。

**常见场景：**

```js
// 图片懒加载（Intersection Observer）
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target
      img.src = img.dataset.src
      observer.unobserve(img)
    }
  })
})
document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img))

// 路由懒加载（Vue Router）
{
  path: '/about',
  component: () => import('./views/About.vue')  // 动态导入
}
```

## 如何优化动画性能？

1. **使用 `transform` 和 `opacity`** 替代 `top`/`left` 等引发回流的属性
2. **开启硬件加速**
   ```css
   .box {
     will-change: transform;  /* 提前告知浏览器该元素将变化 */
     transform: translateZ(0); /* 创建新图层，启用 GPU 加速 */
   }
   ```
3. **使用 `requestAnimationFrame`** 替代 setTimeout/setInterval
   ```js
   function animate() {
     // 动画逻辑
     requestAnimationFrame(animate) // 和屏幕刷新率同步
   }
   requestAnimationFrame(animate)
   ```
4. **60fps 目标**：每帧预绝 16.7ms，避免长任务阴塞主线程

## 前端性能优化——预请求 (Prefetch / Preload)

| 属性 | 说明 | 适用场景 |
|------|------|----------|
| `preload` | **现在**需要，高优先加载 | 当前页面的关键资源 |
| `prefetch` | **未来**可能需要，低优先级 | 下一个页面的资源 |
| `preconnect` | 提前建立 TCP 连接 | CDN 、第三方 API |
| `dns-prefetch` | 提前 DNS 解析 | 跨域资源 |

```html
<!-- preload: 当前页必用字体 -->
<link rel="preload" href="font.woff2" as="font" crossorigin>
<!-- prefetch: 下一页的脚本 -->
<link rel="prefetch" href="/next-page.js">
```

## 图片优化的方式有哪些？

1. **选择合适格式**：JPG（写实图）、PNG（透明图）、WebP（压缩率更高）、SVG（图标、矢量图）
2. **压缩**：工具压缩（TinyPNG）或构建时自动压缩
3. **懒加载**：视口内才加载（Intersection Observer）
4. **响应式图片**：`srcset` + `sizes` 根据屏幕分辨率加载
5. **CDN**：图片放 CDN 加速全球访问
6. **雪碧图**（Sprite）：小图标合并，减少 HTTP 请求数
7. **Base64**：极小图标直接嵌入 CSS

## 如何减少首屏加载时间（资源加载优化）？

1. **减少请求数**
   - HTTP/2 多路实现多请求并发
   - 将小资源 inline（base64图片）
   - 合并 CSS/JS 文件
2. **减小文件体积**
   - Gzip / Brotli 压缩
   - Tree Shaking 去除未用代码
   - 代码分割（Code Splitting）
3. **缓存策略**
   - 设置强缓存 `Cache-Control: max-age=31536000`
   - 文件内容 hash（webpack 内容哈希）
4. **CDN 加速**：静态资源部署到 CDN
5. **首屏内容优先加载**
   - 关键 CSS inline 到 `<head>`
   - 自底部加载 `<script>` 或使用 `defer`

## 什么是防抖（debounce）和节流（throttle）？

**防抖：** 频繁触发后延迟执行，在 n 秒内只执行最后一次。
```js
function debounce(fn, delay) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
// 适用：搜索输入框、表单验证
```

**节流：** 在 n 秒内最多执行一次。
```js
function throttle(fn, delay) {
  let last = 0
  return (...args) => {
    const now = Date.now()
    if (now - last >= delay) {
      last = now
      fn(...args)
    }
  }
}
// 适用：滚动事件、鼠标移动
```

## Q: 虚拟列表的实现原理是什么？如何手写一个？

**A:**

虚拟列表（Virtual List）只渲染**可视区域内**的数据项，通过上下占位符模拟真实滚动高度，是大数据量列表渲染的核心优化手段。

当列表数据超过 **1000+** 条时，应考虑使用虚拟列表。

### 核心原理

```
┌─────────────────────┐  ← 容器（固定高度，overflow: auto）
│  ┌───────────────┐  │
│  │  上方占位 div  │  │  ← 高度 = 已滚过的条数 × itemHeight
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │   可见条目 1   │  │  ← 只渲染这些 DOM
│  │   可见条目 2   │  │
│  │   可见条目 3   │  │
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │  下方占位 div  │  │  ← 高度 = 剩余条数 × itemHeight
│  └───────────────┘  │
└─────────────────────┘
```

### 原生 JS 实现（固定行高）

```js
class VirtualList {
  constructor({ container, itemHeight, total, renderItem }) {
    this.container = container
    this.itemHeight = itemHeight
    this.total = total
    this.renderItem = renderItem

    // 容器必须是固定高度 + overflow: auto
    this.viewHeight = container.clientHeight
    this.visibleCount = Math.ceil(this.viewHeight / itemHeight) + 2 // 缓冲 2 条

    this._buildDOM()
    this._render(0)
    this.container.addEventListener('scroll', () => {
      const scrollTop = this.container.scrollTop
      const startIndex = Math.floor(scrollTop / itemHeight)
      this._render(startIndex)
    })
  }

  _buildDOM() {
    // 撑开整体高度的 phantom 层
    this.phantom = document.createElement('div')
    this.phantom.style.height = this.total * this.itemHeight + 'px'
    // 真实渲染层（绝对定位）
    this.content = document.createElement('div')
    this.content.style.position = 'absolute'
    this.content.style.top = 0
    this.content.style.left = 0
    this.content.style.right = 0

    this.container.style.position = 'relative'
    this.container.appendChild(this.phantom)
    this.container.appendChild(this.content)
  }

  _render(startIndex) {
    const endIndex = Math.min(startIndex + this.visibleCount, this.total)
    // 偏移量 = 起始条目 × 行高
    this.content.style.transform = `translateY(${startIndex * this.itemHeight}px)`
    this.content.innerHTML = ''
    for (let i = startIndex; i < endIndex; i++) {
      this.content.appendChild(this.renderItem(i))
    }
  }
}

// 使用
const list = new VirtualList({
  container: document.querySelector('.list-wrap'),
  itemHeight: 50,
  total: 100000,
  renderItem: (index) => {
    const div = document.createElement('div')
    div.style.height = '50px'
    div.textContent = `第 ${index + 1} 条数据`
    return div
  }
})
```

### 不定行高虚拟列表

行高不固定时，需要维护每项的位置缓存（position cache）：

```js
// 策略：预估高度 + 实际渲染后更新缓存
const positions = data.map((_, i) => ({
  index: i,
  height: estimatedHeight,       // 预估高度
  top: i * estimatedHeight,      // 预估 top
  bottom: (i + 1) * estimatedHeight
}))

// 渲染后，通过 ResizeObserver 或 getBoundingClientRect 更新实际高度
// 同时修正后续所有条目的 top/bottom
```

---

## Q: Vue / React 中如何使用虚拟列表？

**A:**

生产环境推荐使用成熟的虚拟列表库，而非手写。

### Vue 方案：vue-virtual-scroller

```bash
npm install vue-virtual-scroller
```

```vue
<template>
  <RecycleScroller
    class="scroller"
    :items="list"
    :item-size="50"
    key-field="id"
    v-slot="{ item }"
  >
    <div class="item">{{ item.name }}</div>
  </RecycleScroller>
</template>

<script setup>
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

const list = Array.from({ length: 100000 }, (_, i) => ({ id: i, name: `Item ${i}` }))
</script>

<style>
.scroller { height: 600px; }
.item { height: 50px; display: flex; align-items: center; }
</style>
```

不定高场景使用 `<DynamicScroller>` + `<DynamicScrollerItem>`：

```vue
<DynamicScroller :items="list" :min-item-size="40" key-field="id">
  <template v-slot="{ item, index, active }">
    <DynamicScrollerItem :item="item" :active="active" :data-index="index">
      <div class="item">{{ item.content }}</div>
    </DynamicScrollerItem>
  </template>
</DynamicScroller>
```

### React 方案：react-window / react-virtual

```bash
npm install react-window
```

```jsx
import { FixedSizeList } from 'react-window'

const Row = ({ index, style }) => (
  <div style={style}>第 {index + 1} 条 — {data[index].name}</div>
)

function App() {
  return (
    <FixedSizeList
      height={600}        // 容器高度
      itemCount={100000}  // 总条数
      itemSize={50}       // 每条高度
      width="100%"
    >
      {Row}
    </FixedSizeList>
  )
}
```

不定高使用 `VariableSizeList`：

```jsx
import { VariableSizeList } from 'react-window'

const getItemSize = (index) => data[index].height || 60 // 动态返回每条高度

<VariableSizeList height={600} itemCount={data.length} itemSize={getItemSize} width="100%">
  {({ index, style }) => <div style={style}>{data[index].content}</div>}
</VariableSizeList>
```

> ⚠️ **注意**：`react-window` 轻量但功能有限；`react-virtual`（TanStack Virtual）更灵活，支持网格、水平滚动、动态高度等复杂场景。

---

## Q: IntersectionObserver API如何使用？

**A:**

`IntersectionObserver` 是浏览器提供的**异步 API**，用于监测目标元素与视口（或指定根元素）的交叉状态，无需监听 `scroll` 事件，性能更优。

**基础用法：**

```js
const observer = new IntersectionObserver(callback, options)

observer.observe(targetEl)    // 开始观察
observer.unobserve(targetEl)  // 停止观察某元素
observer.disconnect()         // 停止全部观察
```

**回调参数（entries）：**

```js
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    console.log(entry.target)           // 被观察的 DOM 元素
    console.log(entry.isIntersecting)   // 是否进入视口（true/false）
    console.log(entry.intersectionRatio) // 交叉比例 0~1
    console.log(entry.boundingClientRect) // 元素的位置信息
  })
})
```

**配置项（options）：**

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `root` | 作为视口的根元素，null 表示浏览器视口 | `null` |
| `rootMargin` | 根元素的扩展边距，类似 CSS margin | `"0px"` |
| `threshold` | 触发回调的交叉比例阈值，可为数组 | `0` |

```js
const observer = new IntersectionObserver(callback, {
  root: null,              // 使用视口作为根
  rootMargin: '0px 0px -100px 0px', // 视口底部收缩 100px（提前触发）
  threshold: [0, 0.5, 1]  // 进入 0%、50%、100% 时分别触发
})
```

**典型应用场景：**

```js
// 1. 图片懒加载
const imgObserver = new IntersectionObserver((entries) => {
  entries.forEach(({ isIntersecting, target }) => {
    if (isIntersecting) {
      target.src = target.dataset.src
      imgObserver.unobserve(target)  // 加载后取消观察
    }
  })
})
document.querySelectorAll('img[data-src]').forEach(img => imgObserver.observe(img))

// 2. 无限滚动加载
const sentinel = document.querySelector('#load-more')
const listObserver = new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting) fetchNextPage()
})
listObserver.observe(sentinel)

// 3. 元素曝光埋点
const buryObserver = new IntersectionObserver((entries) => {
  entries.forEach(({ isIntersecting, target }) => {
    if (isIntersecting) {
      reportExposure(target.dataset.id)
      buryObserver.unobserve(target)
    }
  })
}, { threshold: 0.5 })  // 50% 可见才算曝光
```

**IntersectionObserver vs scroll 事件：**

| 对比维度 | IntersectionObserver | scroll 事件监听 |
|---------|----------------------|----------------|
| 性能 | ✅ 异步，不阻塞主线程 | ❌ 同步，频繁触发 |
| 代码复杂度 | ✅ 简洁，原生支持 | ❌ 需手动计算位置 |
| 精度控制 | ✅ 支持 threshold 阈值 | ❌ 需自行实现 |
| 兼容性 | ✅ 现代浏览器全支持 | ✅ 全部支持 |
| 适用场景 | 懒加载、曝光、无限滚动 | 特殊滚动交互逻辑 |

> ⚠️ **注意**：`IntersectionObserver` 的回调在浏览器空闲时异步执行，不保证实时触发；若需精确实时响应，仍需结合 `scroll` 事件。

---

## Q: 前端性能优化有哪些体系化的手段？

**A:**

前端性能优化是一个系统性工程，可从**加载、渲染、执行**三个层面展开。

### 一、加载性能优化

**减少请求数 / 体积**

| 手段 | 说明 |
|------|------|
| 代码压缩 | Terser（JS）、CSSNano（CSS），去注释/空白/缩短变量名 |
| Gzip / Brotli | 服务器开启传输压缩，体积可减少 60%~80% |
| 图片优化 | WebP/AVIF 替代 JPEG/PNG；响应式图片 `srcset`；工具压缩 |
| 代码分割 | Webpack/Vite 按路由/组件懒加载，减少首屏 JS 体积 |
| Tree-shaking | 打包时移除未使用代码（ES Module 静态分析） |

**利用缓存**

```
强缓存（Cache-Control: max-age=31536000）→ 直接读本地，不发请求
协商缓存（ETag / Last-Modified）→ 询问服务器是否过期，未过期返回 304
```

文件名加 hash（`app.3f8a2c.js`）实现**长期缓存**，变更后自动失效。

**资源加载策略**

```html
<!-- CSS 放 <head>，防止 FOUC -->
<link rel="stylesheet" href="main.css">

<!-- JS 用 defer，不阻塞解析，按序执行 -->
<script defer src="app.js"></script>

<!-- 预加载关键资源 -->
<link rel="preload" href="hero.jpg" as="image">
<link rel="preconnect" href="https://api.example.com">
<link rel="dns-prefetch" href="https://cdn.example.com">
```

**使用 CDN**：将静态资源分发至全球节点，用户从最近节点获取，降低延迟。

---

### 二、渲染性能优化

**减少重排（Reflow）和重绘（Repaint）**

```js
// ❌ 强制刷新布局队列（每次读都导致重排）
for (let i = 0; i < 100; i++) {
  el.style.width = el.offsetWidth + 1 + 'px'
}

// ✅ 先统一读，再统一写
const width = el.offsetWidth
for (let i = 0; i < 100; i++) {
  el.style.width = width + i + 'px'
}
```

| 触发重排的操作 | 只触发重绘 | 只触发合成（最优）|
|-------------|-----------|----------------|
| 改变宽高、位置 | 改变颜色、背景 | `transform`、`opacity` |

**硬件加速动画**

```css
.animated {
  will-change: transform;      /* 提示浏览器提升为独立合成层 */
  transform: translateZ(0);    /* GPU 渲染，不触发重排重绘 */
}
```

**长任务拆分**

```js
// ❌ 一次执行 10000 次，阻塞主线程
processAll(bigList)

// ✅ 分片执行，每片让出主线程
function processChunk(list, index = 0) {
  const end = Math.min(index + 100, list.length)
  for (let i = index; i < end; i++) process(list[i])
  if (end < list.length) setTimeout(() => processChunk(list, end), 0)
}
```

---

### 三、核心 Web 指标（Core Web Vitals）

| 指标 | 全称 | 衡量 | 优化方向 |
|------|------|------|---------|
| **LCP** | Largest Contentful Paint | 加载速度 | 优化首屏大图、服务器响应、预加载 |
| **INP** | Interaction to Next Paint | 交互响应 | 拆分长任务、减少主线程阻塞 |
| **CLS** | Cumulative Layout Shift | 视觉稳定性 | 给图片/视频设定宽高，避免动态插入内容 |

---

### 四、架构级优化

| 方案 | 说明 |
|------|------|
| **SSR**（服务端渲染） | 服务器生成 HTML 直接返回，提升首屏速度和 SEO |
| **SSG**（静态站点生成） | 构建时预生成 HTML，适合内容不频繁变化的场景 |
| **PWA** | Service Worker 缓存资源 + 离线能力，二次访问极快 |
| **HTTP/2** | 多路复用，单连接并发多请求，消除队头阻塞 |

> ⚠️ **注意**：性能优化要**先测量再优化**，使用 Chrome DevTools Lighthouse / Performance 面板找到真正瓶颈，不要盲目优化。

---

## 大数据处理篇

## Q: 前端如何高效处理大数据量场景（10万+ 条）？

**A:**

大数据量处理的核心矛盾是**主线程被占用 → 页面卡顿/无响应**。常用策略：

### 一、时间切片（Time Slicing）

将大任务拆分成多个小任务，每次执行后让出主线程：

```js
// 方案1：setTimeout 分片（简单易用）
function processInChunks(data, chunkSize = 200) {
  let index = 0
  function next() {
    const end = Math.min(index + chunkSize, data.length)
    for (let i = index; i < end; i++) process(data[i])
    index = end
    if (index < data.length) setTimeout(next, 0) // 让出主线程
  }
  next()
}

// 方案2：requestIdleCallback（利用浏览器空闲时间）
function processWhenIdle(data) {
  let index = 0
  function idle(deadline) {
    // timeRemaining() 返回当前帧剩余的空闲时间（ms）
    while (index < data.length && deadline.timeRemaining() > 1) {
      process(data[index++])
    }
    if (index < data.length) requestIdleCallback(idle)
  }
  requestIdleCallback(idle)
}

// 方案3：scheduler（React 内部方案，可独立使用）
import { scheduleCallback, NormalPriority } from 'scheduler'
scheduleCallback(NormalPriority, () => {
  // 可中断的任务逻辑
})
```

### 二、Web Worker（多线程）

将计算密集型任务迁移到 Worker 线程，完全不阻塞主线程：

```js
// worker.js
self.onmessage = function(e) {
  const { data } = e
  // 在 Worker 中执行耗时计算（排序、过滤、统计等）
  const result = heavyCompute(data)
  self.postMessage(result)
}

// main.js
const worker = new Worker('./worker.js')
worker.postMessage(bigDataArray)          // 发送数据（结构化克隆，有开销）
worker.onmessage = (e) => render(e.data) // 接收结果，回到主线程渲染

// 传递大数据用 Transferable 避免拷贝开销
const buffer = new ArrayBuffer(bigArray.byteLength)
worker.postMessage({ buffer }, [buffer]) // buffer 所有权转移，主线程不再持有
```

**Vue 中封装 Worker：**

```js
// useWorker.js（组合式 API）
import { onUnmounted } from 'vue'

export function useWorker(workerPath) {
  const worker = new Worker(workerPath)

  const run = (data) => new Promise((resolve, reject) => {
    worker.onmessage = (e) => resolve(e.data)
    worker.onerror = reject
    worker.postMessage(data)
  })

  onUnmounted(() => worker.terminate())
  return { run }
}

// 组件中使用
const { run } = useWorker('/workers/sort.js')
const result = await run(bigList)
```

**React 中封装 Worker：**

```js
// useWorker hook
import { useEffect, useRef } from 'react'

function useWorker(workerFactory) {
  const workerRef = useRef(null)
  useEffect(() => {
    workerRef.current = workerFactory()
    return () => workerRef.current?.terminate()
  }, [])

  const run = (data) => new Promise((resolve) => {
    workerRef.current.onmessage = (e) => resolve(e.data)
    workerRef.current.postMessage(data)
  })
  return run
}
```

### 三、数据分页 / 无限滚动

```js
// 分页（最简单）：每次只加载当前页数据
const PAGE_SIZE = 50
const currentPage = ref(1)
const displayData = computed(() => rawData.slice(
  (currentPage.value - 1) * PAGE_SIZE,
  currentPage.value * PAGE_SIZE
))

// 无限滚动：滚动到底时追加下一批
const observer = new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting) loadMore()
})
observer.observe(sentinel) // sentinel 是列表底部的哨兵元素
```

### 四、数据结构优化

```js
// 大数据搜索：用 Map 代替 Array.find（O(1) vs O(n)）
const map = new Map(data.map(item => [item.id, item]))
const found = map.get(targetId)  // O(1)

// 大数据过滤：提前建立索引
const index = {}
data.forEach(item => {
  const key = item.category
  ;(index[key] ??= []).push(item)
})
const filtered = index['vue'] ?? []  // 按分类 O(1) 获取

// 使用 TypedArray 处理数值密集型数据（内存更紧凑）
const prices = new Float64Array(1000000)
```

---

## Q: Web Worker 有哪些使用限制和注意事项？

**A:**

| 限制 | 说明 |
|------|------|
| 无法操作 DOM | Worker 中没有 `document`、`window` 对象 |
| 通信有序列化开销 | postMessage 使用结构化克隆，大对象需用 Transferable |
| 无法访问 localStorage | 可使用 IndexedDB 或 Cache API |
| 同源限制 | Worker 脚本必须与主页面同源 |
| 创建成本较高 | 避免频繁创建，应维护 Worker 池复用 |

```js
// Worker 池（复用避免频繁创建销毁）
class WorkerPool {
  constructor(workerPath, size = 4) {
    this.queue = []
    this.workers = Array.from({ length: size }, () => ({
      worker: new Worker(workerPath),
      busy: false
    }))
  }

  run(data) {
    return new Promise((resolve) => {
      const free = this.workers.find(w => !w.busy)
      if (free) {
        free.busy = true
        free.worker.onmessage = (e) => {
          free.busy = false
          resolve(e.data)
          this._drainQueue()
        }
        free.worker.postMessage(data)
      } else {
        this.queue.push({ data, resolve })
      }
    })
  }

  _drainQueue() {
    if (this.queue.length === 0) return
    const { data, resolve } = this.queue.shift()
    this.run(data).then(resolve)
  }
}
```

> ⚠️ **注意**：Vite 项目中引入 Worker 用 `new Worker(new URL('./worker.js', import.meta.url))`，可让 Vite 正确处理 Worker 依赖。

---

## 大数据图表篇

## Q: 前端渲染大数据量图表有哪些优化手段？

**A:**

### 一、Canvas 渲染替代 SVG

| 对比维度 | SVG | Canvas |
|---------|-----|--------|
| 渲染原理 | DOM 节点，每个图形是元素 | 位图绘制，无 DOM 节点 |
| 数据量 | ❌ 超过 1000 点明显卡顿 | ✅ 10 万+ 点流畅 |
| 交互 | ✅ 天然支持事件绑定 | ❌ 需手动计算碰撞检测 |
| 缩放 | ✅ 矢量无损 | ❌ 放大失真（可用 devicePixelRatio 优化） |
| 适用场景 | 图标、少量数据图表 | 大数据折线/散点图、实时监控 |

```js
// Canvas 高清适配（解决 Retina 屏模糊）
function setupCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  canvas.style.width = rect.width + 'px'
  canvas.style.height = rect.height + 'px'
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
  return ctx
}
```

### 二、数据降采样（Data Downsampling）

10 万个点渲染到 1000px 宽的图表，99% 的点在像素层面是重叠的，降采样可大幅减少绘制量而视觉效果几乎不变：

```js
// 最简单：等间距采样
function sampleData(data, maxPoints = 1000) {
  if (data.length <= maxPoints) return data
  const step = Math.ceil(data.length / maxPoints)
  return data.filter((_, i) => i % step === 0)
}

// 更精确：LTTB（Largest Triangle Three Buckets）算法
// 保留折线拐点和峰值，视觉还原度更高
// 可使用 npm install d3-array / @observablehq/plot 等库
import { lttb } from 'downsample'
const sampled = lttb(data, 1000) // 降采样到 1000 个点
```

### 三、ECharts 大数据优化

```js
// 1. 开启 large 模式（折线图/散点图/柱状图专属）
series: [{
  type: 'scatter',
  large: true,           // 启用大数据模式（Canvas 合批绘制）
  largeThreshold: 2000,  // 超过此数量启用 large 模式
  data: bigData
}]

// 2. 折线图关闭不必要的功能
series: [{
  type: 'line',
  symbol: 'none',         // 不显示数据点（大数据时省去圆圈绘制）
  sampling: 'lttb',       // ECharts 内置降采样（lttb / average / max / min）
  data: bigData
}]

// 3. 数据量极大时使用 dataset + encode
option = {
  dataset: { source: bigData },
  series: [{ type: 'line', encode: { x: 'time', y: 'value' } }]
}

// 4. 实时数据更新：增量追加而非全量更新
chart.appendData({
  seriesIndex: 0,
  data: newPoints  // 仅追加新数据点
})

// 5. 关闭动画（大数据时动画反而拖慢）
animation: false
```

### 四、WebGL 渲染（超大数据量）

百万级数据点，Canvas 2D 也力不从心时，使用 WebGL：

```js
// ECharts GL（基于 WebGL）
import 'echarts-gl'

option = {
  series: [{
    type: 'scatter3D',       // 3D 散点图
    data: millionPoints,
    symbolSize: 2
  }]
}

// 或使用 Three.js / PixiJS 自定义 WebGL 渲染
import * as THREE from 'three'
// 百万点用 BufferGeometry + Points（比 Mesh 轻量得多）
const geometry = new THREE.BufferGeometry()
const positions = new Float32Array(data.length * 3)
data.forEach((p, i) => {
  positions[i * 3] = p.x
  positions[i * 3 + 1] = p.y
  positions[i * 3 + 2] = p.z ?? 0
})
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
const points = new THREE.Points(geometry, new THREE.PointsMaterial({ size: 0.5 }))
scene.add(points)
```

### 五、离屏 Canvas（OffscreenCanvas）

将 Canvas 绘制放到 Worker 线程，彻底不占用主线程：

```js
// main.js
const canvas = document.querySelector('canvas')
const offscreen = canvas.transferControlToOffscreen()
const worker = new Worker('./chart-worker.js')
worker.postMessage({ canvas: offscreen, data: bigData }, [offscreen])

// chart-worker.js
self.onmessage = function({ data: { canvas, data } }) {
  const ctx = canvas.getContext('2d')
  // 在 Worker 中完成所有绘制
  drawChart(ctx, data)
}
```

> ⚠️ **注意**：OffscreenCanvas 兼容性已达到约 95%（2025年），Safari 16.4+ 已支持，可在生产环境使用但需做降级处理。

---

## Vue 性能优化篇

## Q: Vue3 有哪些性能优化手段？

**A:**

### 一、响应式优化

```vue
<script setup>
import { ref, shallowRef, shallowReactive, markRaw } from 'vue'

// ✅ 大对象/不需要深度响应的数据用 shallowRef
const tableData = shallowRef([]) // 只追踪 .value 的引用变化，不递归代理子对象

// ✅ markRaw：第三方库实例（如 ECharts、Three.js）不需要响应式
const chart = markRaw(echarts.init(el))
const chartRef = ref(null)
chartRef.value = markRaw(echarts.init(el)) // 避免 ECharts 内部对象被代理

// ✅ shallowReactive：只需要浅层响应的对象
const state = shallowReactive({ list: [], page: 1 })
</script>
```

### 二、渲染优化

```vue
<template>
  <!-- v-once：静态内容只渲染一次，后续跳过 diff -->
  <header v-once>
    <h1>{{ staticTitle }}</h1>
  </header>

  <!-- v-memo：仅当依赖项变化时才重新渲染（Vue 3.2+）-->
  <!-- 列表项只在 id 或 selected 状态变化时更新 -->
  <div v-for="item in list" :key="item.id" v-memo="[item.id, item.selected]">
    <ItemCard :item="item" />
  </div>
</template>
```

### 三、组件懒加载

```js
// defineAsyncComponent：组件级代码分割
import { defineAsyncComponent } from 'vue'

const HeavyChart = defineAsyncComponent({
  loader: () => import('./HeavyChart.vue'),
  loadingComponent: LoadingSpinner,   // 加载中显示
  errorComponent: ErrorFallback,      // 加载失败显示
  delay: 200,                          // 延迟多少 ms 才显示 loading
  timeout: 5000                        // 超时时间
})
```

### 四、keep-alive 缓存组件

```vue
<template>
  <!-- 缓存已访问过的路由组件，切换时不销毁/重建 -->
  <router-view v-slot="{ Component }">
    <keep-alive :include="['ListView', 'DetailView']" :max="10">
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>
```

```js
// 配合生命周期钩子
import { onActivated, onDeactivated } from 'vue'

// 每次组件被激活时执行（替代 mounted）
onActivated(() => refreshData())
// 组件被缓存时执行
onDeactivated(() => pauseTimer())
```

### 五、列表渲染优化

```vue
<!-- ✅ 合理设置 key（用唯一 id 而非 index） -->
<div v-for="item in list" :key="item.id">

<!-- ✅ 避免同时使用 v-if 和 v-for（v-if 优先级更高，先过滤再渲染） -->
<!-- ❌ 错误：每次渲染都过滤 -->
<li v-for="item in list" v-if="item.active" :key="item.id">

<!-- ✅ 正确：用计算属性预先过滤 -->
<li v-for="item in activeList" :key="item.id">
```

```js
// computed 缓存过滤结果
const activeList = computed(() => list.value.filter(i => i.active))
```

### 六、计算属性与侦听器

```js
// ✅ computed 自动缓存，依赖不变则不重算
const sortedList = computed(() => [...rawList.value].sort((a, b) => a.time - b.time))

// ✅ watchEffect 懒收集依赖，避免不必要的侦听
watchEffect(() => {
  // 只有用到的依赖才会被追踪
  if (enabled.value) renderChart(data.value)
})

// ✅ 大数据 watch 用 { deep: false } 避免深度遍历开销
watch(tableData, handler, { deep: false, flush: 'post' })
```

### 七、编译器优化（Vue3 内置）

Vue3 编译器在构建时自动做以下优化，了解即可：

| 优化 | 说明 |
|------|------|
| **静态提升（Static Hoisting）** | 无响应式依赖的 VNode 提升到 render 外，复用同一对象 |
| **Patch Flags** | 给动态节点打标记，diff 时只比较有标记的部分 |
| **块（Block Tree）** | 动态节点收集到 block 数组，跳过静态节点的 diff |
| **Tree-shaking** | 运行时按需引入，Vue3 核心仅 10KB（gzip） |

---

## Q: Vue 中 keep-alive 的工作原理是什么？

**A:**

`<keep-alive>` 在内部维护一个**组件实例缓存 Map**：

1. 组件首次渲染时，正常创建实例并挂载
2. 离开时，不调用 `unmounted`，而是将实例保存到 `cache` Map 中，并将 DOM 移除
3. 再次访问时，从 `cache` 中取出实例，直接挂载，触发 `onActivated`

```
cache Map: { 'ListView': vnode, 'DetailView': vnode, ... }
keys Set:  ['ListView', 'DetailView']  // LRU 排序
```

**LRU 淘汰**：当缓存数量超过 `:max` 时，淘汰最久未访问的组件实例，调用其 `unmounted`。

> ⚠️ **注意**：缓存组件实例会占用内存，`:max` 建议设置合理值（如 5-10）；避免对频繁变化的表单组件使用 keep-alive，否则缓存的脏数据难以清理。

---

## React 性能优化篇

## Q: React 有哪些性能优化手段？

**A:**

### 一、避免不必要的重渲染

```jsx
import { memo, useMemo, useCallback } from 'react'

// React.memo：组件级缓存，props 不变则跳过渲染
const ListItem = memo(({ item, onDelete }) => {
  return <div>{item.name} <button onClick={() => onDelete(item.id)}>删除</button></div>
})

function App() {
  const [list, setList] = useState(data)
  const [filter, setFilter] = useState('')

  // useCallback：缓存函数引用，避免每次渲染产生新函数导致子组件重渲染
  const handleDelete = useCallback((id) => {
    setList(prev => prev.filter(i => i.id !== id))
  }, []) // 空依赖数组，函数引用永远不变

  // useMemo：缓存计算结果，避免每次渲染都重算
  const filteredList = useMemo(
    () => list.filter(i => i.name.includes(filter)),
    [list, filter] // 只有 list 或 filter 变化才重算
  )

  return <>{filteredList.map(item => <ListItem key={item.id} item={item} onDelete={handleDelete} />)}</>
}
```

### 二、代码分割与懒加载

```jsx
import { lazy, Suspense } from 'react'

// lazy + Suspense：路由/组件级代码分割
const Dashboard = lazy(() => import('./Dashboard'))
const HeavyChart = lazy(() => import('./HeavyChart'))

function App() {
  return (
    <Suspense fallback={<Skeleton />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Suspense>
  )
}

// 预加载：鼠标悬停时提前加载
const preloadDashboard = () => import('./Dashboard')
<Link onMouseEnter={preloadDashboard} to="/dashboard">Dashboard</Link>
```

### 三、并发特性（React 18+）

```jsx
import { useTransition, useDeferredValue, startTransition } from 'react'

// useTransition：将非紧急更新标记为可中断
function SearchList({ data }) {
  const [query, setQuery] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleChange = (e) => {
    // 输入框更新是紧急的（立即执行）
    setQuery(e.target.value)
    // 列表过滤是非紧急的（可被中断，不阻塞输入）
    startTransition(() => setFilteredData(data.filter(i => i.name.includes(e.target.value))))
  }

  return (
    <>
      <input onChange={handleChange} />
      {isPending && <Spinner />}
      <List data={filteredData} />
    </>
  )
}

// useDeferredValue：推迟派生值的更新（类似防抖，但由 React 调度）
function App() {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query) // 输入流畅，搜索滞后

  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <SearchResults query={deferredQuery} /> {/* 使用延迟值 */}
    </>
  )
}
```

### 四、状态管理优化

```jsx
// 避免将大对象放在单一 useState，拆分状态减少重渲染范围
// ❌ 任意子字段变化，整个对象都更新，所有用到 state 的组件重渲染
const [state, setState] = useState({ userInfo, settings, data })

// ✅ 拆分，各自独立更新
const [userInfo, setUserInfo] = useState(null)
const [settings, setSettings] = useState({})
const [data, setData] = useState([])

// Context 分层，避免 Context 变化导致全量重渲染
// ❌ 把所有状态放一个 Context
const AppContext = createContext({ user, theme, cart, notifications })

// ✅ 按关注点分离 Context
const UserContext = createContext(user)
const ThemeContext = createContext(theme)
// 只订阅需要的 Context，其他 Context 变化不影响本组件
```

### 五、列表优化

```jsx
// ✅ key 使用稳定唯一 id，不用 index（index 会导致 diff 错误复用）
{list.map(item => <Card key={item.id} item={item} />)}

// ✅ 大列表使用虚拟列表
import { FixedSizeList } from 'react-window'
<FixedSizeList height={600} itemCount={bigList.length} itemSize={60} width="100%">
  {({ index, style }) => <div style={style}><Card item={bigList[index]} /></div>}
</FixedSizeList>
```

### 六、性能分析工具

```jsx
// React Profiler：测量组件渲染耗时
import { Profiler } from 'react'

<Profiler id="List" onRender={(id, phase, actualDuration) => {
  console.log(`${id} [${phase}] 渲染耗时: ${actualDuration.toFixed(2)}ms`)
}}>
  <ListComponent />
</Profiler>
```

DevTools：安装 **React Developer Tools** 浏览器插件，使用 Profiler 面板录制渲染，找到 "why did this render"。

---

## Q: React.memo、useMemo、useCallback 的区别是什么？

**A:**

| 工具 | 缓存对象 | 适用场景 |
|------|---------|---------|
| `React.memo` | **组件**（避免重渲染） | 纯展示组件，父组件频繁更新但 props 不变 |
| `useMemo` | **计算结果值** | 耗时计算（排序、过滤、格式化大数据） |
| `useCallback` | **函数引用** | 传给子组件的回调，搭配 `React.memo` 避免子组件重渲染 |

```jsx
// 三者组合使用的典型场景
const sortedData = useMemo(() => [...data].sort(compareFn), [data]) // 缓存计算
const handleClick = useCallback((id) => deleteItem(id), [])         // 缓存函数

const ListItem = memo(({ item, onClick }) => ( // 缓存组件
  <div onClick={() => onClick(item.id)}>{item.name}</div>
))
```

> ⚠️ **注意**：`useMemo` / `useCallback` 本身有额外的内存和比较开销，**不要过度使用**。只在确认有性能问题时才引入，优先用 React DevTools Profiler 验证确实有重渲染问题。

---

