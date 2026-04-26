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

## 什么是虚拟列表（Virtual List）？

只渲染**可视口区域内**的数据项，副层圣上下格占位符，用于重渲染大量数据时的性能优化。

当列表数据超过 **1000+** 条时，应考虑使用虚拟列表。

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

