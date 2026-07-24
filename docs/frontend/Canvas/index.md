# Canvas 技术要点

> 覆盖 Canvas 2D 整体认知、核心 API、像素与高清屏、动画体系、性能优化、交互实现、图像处理、离屏渲染与常见问题，附带可运行真实代码。

---

## 一、整体认知

### 1.1 Canvas 是什么

Canvas 是 HTML5 提供的**位图绘图 API**，通过 JavaScript 在 `<canvas>` 元素上进行像素级绘制。与 SVG（矢量 DOM）不同，Canvas 绘制后的内容是"死的"——画完就是一堆像素，没有 DOM 节点，无法直接绑定事件。

```
你的 JS 代码
   │ ctx.fillRect / ctx.drawImage / ctx.arc ...
   ▼
Canvas 2D Context（绘图指令队列）
   │
   ▼
浏览器合成层（GPU 加速合成）
   │
   ▼
屏幕（位图像素）
```

---

### 1.2 Canvas vs SVG

| 维度 | Canvas | SVG |
|------|--------|-----|
| 本质 | 位图（像素矩阵）| 矢量（DOM 节点树）|
| 放大缩小 | ❌ 模糊（像素化）| ✅ 无损 |
| 大量图形 | ✅ 性能好（无 DOM）| ❌ 节点多时卡顿 |
| 事件绑定 | ❌ 需手动计算碰撞 | ✅ 直接 addEventListener |
| 动画 | ✅ 逐帧重绘，灵活 | ✅ CSS/SMIL 动画 |
| 图像处理 | ✅ 像素级操作 | ❌ 不支持 |
| 截图 / 导出 | ✅ toDataURL() | ✅ 序列化 XML |
| SEO / 无障碍 | ❌ 对屏幕阅读器不友好 | ✅ DOM 可被索引 |
| 适合场景 | 游戏、粒子、图表、图像处理 | 图标、UI、少量数据图表 |

---

### 1.3 Canvas 2D vs WebGL

| 维度 | Canvas 2D | WebGL |
|------|-----------|-------|
| 学习曲线 | 平缓 | 陡峭（需要 GLSL 着色器）|
| 性能 | 好（CPU 渲染为主）| 极好（GPU 并行）|
| 3D 支持 | ❌ | ✅ |
| 百万级粒子 | ❌ | ✅ |
| 适合场景 | 2D 图表、画板、小游戏 | 3D 场景、大数据可视化 |

> 本文聚焦 **Canvas 2D**，WebGL 见 Three.js / ECharts-GL 章节。

---

## 二、基础 API

### 2.1 获取上下文与基本设置

```html
<canvas id="canvas" width="800" height="600"></canvas>
```

```typescript
const canvas = document.getElementById('canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d')!

// ⚠️ width/height 是绘图分辨率（像素）
// style.width/height 是 CSS 显示尺寸
// 两者不相等时画面会拉伸或模糊
canvas.width = 800
canvas.height = 600
canvas.style.width = '800px'
canvas.style.height = '600px'
```

---

### 2.2 基本图形绘制

```typescript
// ── 矩形 ──────────────────────────────
ctx.fillStyle = '#3498db'
ctx.fillRect(10, 10, 200, 100)      // 填充矩形（x, y, width, height）

ctx.strokeStyle = '#e74c3c'
ctx.lineWidth = 3
ctx.strokeRect(10, 120, 200, 100)   // 描边矩形

ctx.clearRect(0, 0, canvas.width, canvas.height)  // 清除区域（透明）

// ── 路径（绘制复杂图形的基础）────────────
ctx.beginPath()            // 开始新路径（必须，否则和上次路径合并）
ctx.moveTo(50, 50)         // 移动画笔（不画线）
ctx.lineTo(200, 50)        // 画直线
ctx.lineTo(200, 200)
ctx.closePath()            // 闭合路径（连接起点和终点）
ctx.fill()                 // 填充
ctx.stroke()               // 描边

// ── 圆形和圆弧 ─────────────────────────
ctx.beginPath()
ctx.arc(
  150, 150,          // 圆心 x, y
  80,                // 半径
  0,                 // 起始角（弧度，0 = 右侧）
  Math.PI * 2,       // 结束角（2π = 完整圆）
  false              // 是否逆时针
)
ctx.fillStyle = 'rgba(52, 152, 219, 0.6)'
ctx.fill()

// 只画半圆
ctx.beginPath()
ctx.arc(150, 300, 80, 0, Math.PI)   // 0 到 π = 下半圆
ctx.stroke()

// ── 贝塞尔曲线 ─────────────────────────
ctx.beginPath()
ctx.moveTo(50, 300)
ctx.quadraticCurveTo(150, 200, 250, 300)  // 二次贝塞尔（一个控制点）
ctx.stroke()

ctx.beginPath()
ctx.moveTo(50, 400)
ctx.bezierCurveTo(100, 300, 200, 500, 300, 400)  // 三次贝塞尔（两个控制点）
ctx.stroke()
```

---

### 2.3 文字绘制

```typescript
ctx.font = 'bold 24px "PingFang SC", sans-serif'
ctx.textAlign = 'center'           // 水平对齐：left | center | right
ctx.textBaseline = 'middle'        // 垂直基线：top | middle | bottom | alphabetic

// 填充文字
ctx.fillStyle = '#2c3e50'
ctx.fillText('Hello Canvas', 400, 300)

// 描边文字
ctx.strokeStyle = '#e74c3c'
ctx.lineWidth = 1
ctx.strokeText('Hello Canvas', 400, 350)

// 测量文字宽度（用于居中、换行计算）
const metrics = ctx.measureText('Hello Canvas')
console.log(metrics.width)   // 文字像素宽度
console.log(metrics.actualBoundingBoxAscent)   // 基线以上高度
console.log(metrics.actualBoundingBoxDescent)  // 基线以下高度

// 手动实现文字换行
function fillWrappedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split('')
  let line = ''

  for (const char of words) {
    const testLine = line + char
    if (ctx.measureText(testLine).width > maxWidth && line !== '') {
      ctx.fillText(line, x, y)
      line = char
      y += lineHeight
    } else {
      line = testLine
    }
  }
  ctx.fillText(line, x, y)
}
```

---

### 2.4 图片绘制

```typescript
// 方式一：从 Image 对象绘制
const img = new Image()
img.onload = () => {
  // drawImage 三种重载：
  ctx.drawImage(img, 50, 50)                       // 原始尺寸
  ctx.drawImage(img, 50, 50, 200, 150)             // 指定宽高（拉伸）
  ctx.drawImage(img, 50, 50, 100, 100, 50, 50, 200, 200)  // 裁剪+缩放
  //            源图, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight
}
img.src = '/images/photo.jpg'

// 方式二：从 Canvas 绘制到另一个 Canvas（截图、合成）
const sourceCanvas = document.getElementById('source') as HTMLCanvasElement
ctx.drawImage(sourceCanvas, 0, 0)

// 方式三：从 Video 帧绘制（视频截帧）
const video = document.querySelector('video')!
function captureVideoFrame() {
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
}
video.addEventListener('play', () => {
  const loop = () => {
    if (!video.paused) {
      captureVideoFrame()
      requestAnimationFrame(loop)
    }
  }
  loop()
})
```

---

### 2.5 状态保存与变换

```typescript
// save/restore 是管理状态的关键，避免样式污染
ctx.save()                          // 入栈：保存当前所有状态
  ctx.translate(200, 200)           // 移动坐标原点
  ctx.rotate(Math.PI / 4)           // 旋转 45°
  ctx.scale(1.5, 1.5)              // 缩放 1.5 倍

  ctx.fillStyle = '#e74c3c'
  ctx.fillRect(-50, -50, 100, 100)  // 在变换后的坐标系中绘制
ctx.restore()                        // 出栈：恢复之前的状态

// 绘制旋转的文字
function drawRotatedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, angle: number) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.fillText(text, 0, 0)
  ctx.restore()
}

// 变换矩阵（setTransform 直接设置完整矩阵）
// ctx.setTransform(a, b, c, d, e, f)
// a=scaleX, b=skewY, c=skewX, d=scaleY, e=translateX, f=translateY
ctx.setTransform(1, 0, 0, 1, 0, 0)  // 重置为单位矩阵
```

---

### 2.6 渐变与阴影

```typescript
// 线性渐变
const linearGrad = ctx.createLinearGradient(0, 0, 400, 0)  // x1,y1,x2,y2
linearGrad.addColorStop(0, '#3498db')
linearGrad.addColorStop(0.5, '#9b59b6')
linearGrad.addColorStop(1, '#e74c3c')
ctx.fillStyle = linearGrad
ctx.fillRect(0, 0, 400, 100)

// 径向渐变
const radialGrad = ctx.createRadialGradient(200, 200, 10, 200, 200, 100)  // x1,y1,r1,x2,y2,r2
radialGrad.addColorStop(0, '#fff')
radialGrad.addColorStop(1, 'rgba(0,0,0,0)')
ctx.fillStyle = radialGrad
ctx.beginPath()
ctx.arc(200, 200, 100, 0, Math.PI * 2)
ctx.fill()

// 阴影
ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
ctx.shadowBlur = 15
ctx.shadowOffsetX = 5
ctx.shadowOffsetY = 5
ctx.fillStyle = '#3498db'
ctx.fillRect(50, 50, 200, 100)

// 绘制完后清除阴影（避免影响后续绘制）
ctx.shadowColor = 'transparent'
ctx.shadowBlur = 0
```

---

## 三、高清屏适配（devicePixelRatio）

**最常见的问题：在高分屏（Retina）上 Canvas 内容模糊。**

**原因：** Canvas 的物理像素与逻辑像素不一致。Retina 屏 `devicePixelRatio = 2`，1 个 CSS 像素 = 4 个物理像素，但 Canvas 默认按 1:1 绘制，被拉伸就模糊了。

```typescript
function createHDCanvas(container: HTMLElement): {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
} {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const dpr = window.devicePixelRatio || 1

  // 获取容器的 CSS 尺寸
  const { width, height } = container.getBoundingClientRect()

  // canvas 实际像素 = CSS 尺寸 × dpr（保证清晰度）
  canvas.width = width * dpr
  canvas.height = height * dpr

  // CSS 尺寸不变（视觉大小不变）
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  // 缩放 ctx，使后续的绘制坐标仍以 CSS 像素为单位
  ctx.scale(dpr, dpr)

  container.appendChild(canvas)
  return { canvas, ctx }
}

// 使用：之后的绘制代码用 CSS 像素坐标，自动适配高清
const { canvas, ctx } = createHDCanvas(document.getElementById('app')!)
ctx.fillRect(10, 10, 100, 50)  // 用 CSS 像素，不用关心 dpr

// 响应窗口 dpr 变化（外接显示器切换等场景）
window.matchMedia('screen and (resolution: 2dppx)').addEventListener('change', () => {
  // 重新设置 canvas 尺寸和缩放
  reinitCanvas()
})
```

---

## 四、动画体系

### 4.1 动画循环的正确写法

```typescript
// ❌ 错误：用 setInterval，不与屏幕刷新率同步，可能丢帧或过度绘制
setInterval(() => {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  draw()
}, 16)

// ✅ 正确：requestAnimationFrame，与屏幕刷新率同步（60fps = ~16.6ms/帧）
let animationId: number
let lastTime = 0

function animate(timestamp: number) {
  const deltaTime = timestamp - lastTime   // 距上一帧的时间（ms）
  lastTime = timestamp

  // 基于 deltaTime 更新状态，而不是固定步长（帧率无关）
  update(deltaTime)
  render()

  animationId = requestAnimationFrame(animate)
}

function startAnimation() {
  animationId = requestAnimationFrame(animate)
}

function stopAnimation() {
  cancelAnimationFrame(animationId)
}
```

### 4.2 帧率控制（节流到指定 FPS）

```typescript
// 限制到 30fps（游戏或低性能设备优化）
const TARGET_FPS = 30
const FRAME_INTERVAL = 1000 / TARGET_FPS
let lastFrameTime = 0

function animateThrottled(timestamp: number) {
  requestAnimationFrame(animateThrottled)

  const elapsed = timestamp - lastFrameTime
  if (elapsed < FRAME_INTERVAL) return   // 跳过这一帧

  lastFrameTime = timestamp - (elapsed % FRAME_INTERVAL)  // 对齐时间戳
  render()
}
```

### 4.3 完整粒子动画示例

```typescript
interface Particle {
  x: number
  y: number
  vx: number    // x 方向速度（像素/ms）
  vy: number    // y 方向速度
  radius: number
  color: string
  alpha: number  // 透明度（0~1）
  life: number   // 剩余生命（ms）
}

class ParticleSystem {
  private ctx: CanvasRenderingContext2D
  private particles: Particle[] = []
  private animationId = 0
  private lastTime = 0

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!
  }

  // 生成一个粒子
  spawn(x: number, y: number, count = 20) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 0.2 + 0.05   // 0.05 ~ 0.25 px/ms
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 4 + 2,
        color: `hsl(${Math.random() * 60 + 10}, 100%, 60%)`,  // 暖色系
        alpha: 1,
        life: Math.random() * 1000 + 500,   // 0.5~1.5 秒生命
      })
    }
  }

  private update(deltaTime: number) {
    this.particles = this.particles.filter(p => {
      p.x += p.vx * deltaTime
      p.y += p.vy * deltaTime
      p.vy += 0.0003 * deltaTime     // 重力
      p.life -= deltaTime
      p.alpha = Math.max(0, p.life / 1000)   // 根据剩余生命淡出
      return p.life > 0
    })
  }

  private render() {
    // 不完全清除，留下拖影效果
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    this.particles.forEach(p => {
      this.ctx.save()
      this.ctx.globalAlpha = p.alpha
      this.ctx.fillStyle = p.color
      this.ctx.beginPath()
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
      this.ctx.fill()
      this.ctx.restore()
    })
  }

  start() {
    const loop = (timestamp: number) => {
      const deltaTime = timestamp - this.lastTime
      this.lastTime = timestamp
      this.update(deltaTime)
      this.render()
      this.animationId = requestAnimationFrame(loop)
    }
    this.animationId = requestAnimationFrame(loop)
  }

  stop() {
    cancelAnimationFrame(this.animationId)
  }
}

// 使用
const system = new ParticleSystem(canvas)
system.start()

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect()
  system.spawn(e.clientX - rect.left, e.clientY - rect.top)
})
```

---

## 五、性能优化

### 5.1 离屏 Canvas（OffscreenCanvas）

把绘制任务移到 Web Worker，彻底不占用主线程：

```typescript
// ✅ 方式一：transferControlToOffscreen（主流推荐）

// main.ts
const canvas = document.getElementById('canvas') as HTMLCanvasElement
const offscreen = canvas.transferControlToOffscreen()  // 将控制权交出去

const worker = new Worker(new URL('./render-worker.ts', import.meta.url))
worker.postMessage({ canvas: offscreen, width: 800, height: 600 }, [offscreen])
// ↑ offscreen 作为 Transferable 传递，零拷贝

// render-worker.ts
self.onmessage = (e) => {
  const { canvas, width, height } = e.data
  const ctx = canvas.getContext('2d')!

  // 所有渲染在 Worker 中执行，主线程完全不阻塞
  function render() {
    ctx.clearRect(0, 0, width, height)
    // ... 复杂绘制逻辑
    requestAnimationFrame(render)
  }
  render()
}
```

```typescript
// ✅ 方式二：用 OffscreenCanvas 缓存静态内容（不用 Worker）

// 把复杂但不变的背景画到离屏 Canvas，主画布每帧只 drawImage 一次
const bgCanvas = new OffscreenCanvas(800, 600)
const bgCtx = bgCanvas.getContext('2d')!

// 只画一次背景（复杂网格、坐标轴等）
function drawBackground() {
  for (let x = 0; x < 800; x += 20) {
    bgCtx.beginPath()
    bgCtx.moveTo(x, 0)
    bgCtx.lineTo(x, 600)
    bgCtx.strokeStyle = '#eee'
    bgCtx.stroke()
  }
}
drawBackground()

// 动画循环：背景直接贴图，只更新动态部分
function render() {
  ctx.clearRect(0, 0, 800, 600)
  ctx.drawImage(bgCanvas, 0, 0)    // ← 贴背景（极快）
  drawDynamicContent()              // 只画变化的内容
  requestAnimationFrame(render)
}
```

---

### 5.2 分层 Canvas

将静态内容和动态内容分离到不同 Canvas 层，减少重绘面积：

```html
<div style="position: relative; width: 800px; height: 600px;">
  <!-- 层1：背景（静态，只画一次）-->
  <canvas id="bg-layer"      style="position: absolute; z-index: 1;" />
  <!-- 层2：游戏元素（低频更新）-->
  <canvas id="game-layer"    style="position: absolute; z-index: 2;" />
  <!-- 层3：UI/特效（高频更新）-->
  <canvas id="ui-layer"      style="position: absolute; z-index: 3;" />
</div>
```

```typescript
// 分层渲染策略
const bgCtx = (document.getElementById('bg-layer') as HTMLCanvasElement).getContext('2d')!
const gameCtx = (document.getElementById('game-layer') as HTMLCanvasElement).getContext('2d')!
const uiCtx = (document.getElementById('ui-layer') as HTMLCanvasElement).getContext('2d')!

// 背景只画一次
drawBackground(bgCtx)

function gameLoop() {
  // 每帧只清除和重绘游戏层、UI 层
  gameCtx.clearRect(0, 0, 800, 600)
  drawSprites(gameCtx)

  uiCtx.clearRect(0, 0, 800, 600)
  drawHUD(uiCtx)        // 血量、分数等 UI

  requestAnimationFrame(gameLoop)
}
```

---

### 5.3 Path2D 缓存复杂路径

```typescript
// 复杂路径（比如中国地图）只计算一次，之后复用
const complexPath = new Path2D()
complexPath.moveTo(100, 100)
// ... 大量 lineTo、bezierCurveTo 等
complexPath.closePath()

// 之后每帧只需：
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fill(complexPath)     // 直接复用，无需重新计算路径
  ctx.stroke(complexPath)
}

// Path2D 还可以从 SVG path 数据创建（从 SVG 迁移到 Canvas 时很有用）
const svgPath = new Path2D('M 10 10 L 200 10 L 200 200 Z')
ctx.fill(svgPath)
```

---

### 5.4 ImageBitmap 高性能图片

```typescript
// ❌ 普通方式：每次 drawImage 都解码
const img = new Image()
img.src = '/large-image.jpg'
ctx.drawImage(img, 0, 0)   // 解码在主线程，可能阻塞

// ✅ ImageBitmap：提前解码，绘制时直接 GPU 上传
async function loadBitmap(url: string): Promise<ImageBitmap> {
  const res = await fetch(url)
  const blob = await res.blob()
  return createImageBitmap(blob, {
    resizeWidth: 800,           // 可在解码时直接缩放
    resizeHeight: 600,
    resizeQuality: 'high',
  })
}

const bitmap = await loadBitmap('/large-image.jpg')

// 渲染时直接用，比 drawImage(img) 快很多
function render() {
  ctx.drawImage(bitmap, 0, 0)
}

// 用完后释放 GPU 资源
bitmap.close()
```

---

### 5.5 避免常见性能陷阱

```typescript
// ❌ 陷阱1：频繁切换 fillStyle（会打断 GPU 批处理）
items.forEach(item => {
  ctx.fillStyle = item.color   // 每个都切换颜色 → 性能差
  ctx.fillRect(item.x, item.y, item.w, item.h)
})

// ✅ 优化：按颜色分组批量绘制
const grouped = groupBy(items, 'color')
for (const [color, group] of Object.entries(grouped)) {
  ctx.fillStyle = color
  group.forEach(item => ctx.fillRect(item.x, item.y, item.w, item.h))
}

// ❌ 陷阱2：浮点数坐标（会触发抗锯齿，产生模糊和额外计算）
ctx.fillRect(10.5, 20.3, 100.7, 50.1)

// ✅ 优化：整数坐标（|0 或 Math.round）
ctx.fillRect(10 | 0, 20 | 0, 100 | 0, 50 | 0)
// 或: ctx.fillRect(Math.round(x), Math.round(y), w, h)

// ❌ 陷阱3：在动画循环中创建对象（频繁 GC）
function render() {
  const color = `rgb(${r}, ${g}, ${b})`  // 每帧创建新字符串
  ctx.fillStyle = color
}

// ✅ 优化：复用对象，或在循环外创建
let colorStr = ''
function updateColor(r: number, g: number, b: number) {
  colorStr = `rgb(${r}, ${g}, ${b})`     // 只在颜色变化时更新
}

// ❌ 陷阱4：不必要的 save/restore（有开销）
function drawSimple() {
  ctx.save()
  ctx.fillStyle = 'red'
  ctx.fillRect(0, 0, 10, 10)
  ctx.restore()
}

// ✅ 优化：不需要保存状态时直接改，用完再改回
function drawSimple() {
  const prevFill = ctx.fillStyle
  ctx.fillStyle = 'red'
  ctx.fillRect(0, 0, 10, 10)
  ctx.fillStyle = prevFill
}
```

---

## 六、交互实现

### 6.1 鼠标坐标转换

```typescript
// Canvas 坐标 ≠ 鼠标坐标（需要减去 Canvas 的 offset）
function getCanvasPos(canvas: HTMLCanvasElement, event: MouseEvent): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1

  // 高分屏时还需要除以 dpr（因为我们对 ctx 做了 scale(dpr, dpr)）
  return {
    x: (event.clientX - rect.left),   // CSS 像素坐标
    y: (event.clientY - rect.top),
  }
}

canvas.addEventListener('mousemove', (e) => {
  const { x, y } = getCanvasPos(canvas, e)
  console.log(`Canvas 坐标: ${x}, ${y}`)
})
```

---

### 6.2 点击检测（isPointInPath）

```typescript
// 方式一：isPointInPath（针对路径的碰撞检测）
const shapes: { path: Path2D; color: string; name: string }[] = [
  { path: (() => { const p = new Path2D(); p.rect(50, 50, 100, 100); return p })(), color: '#3498db', name: '蓝色方块' },
  { path: (() => { const p = new Path2D(); p.arc(300, 150, 60, 0, Math.PI * 2); return p })(), color: '#e74c3c', name: '红色圆形' },
]

canvas.addEventListener('click', (e) => {
  const { x, y } = getCanvasPos(canvas, e)

  for (const shape of shapes) {
    if (ctx.isPointInPath(shape.path, x, y)) {
      console.log(`点击了：${shape.name}`)
      break
    }
  }
})

// 鼠标悬停时改变光标
canvas.addEventListener('mousemove', (e) => {
  const { x, y } = getCanvasPos(canvas, e)
  const isHover = shapes.some(s => ctx.isPointInPath(s.path, x, y))
  canvas.style.cursor = isHover ? 'pointer' : 'default'
})
```

---

### 6.3 拖拽实现

```typescript
interface DraggableRect {
  x: number
  y: number
  width: number
  height: number
  color: string
  isDragging: boolean
  dragOffsetX: number
  dragOffsetY: number
}

class DragCanvas {
  private ctx: CanvasRenderingContext2D
  private rects: DraggableRect[] = []
  private dragTarget: DraggableRect | null = null

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!
    this.bindEvents()
  }

  addRect(x: number, y: number, w: number, h: number, color: string) {
    this.rects.push({ x, y, width: w, height: h, color, isDragging: false, dragOffsetX: 0, dragOffsetY: 0 })
  }

  private hitTest(x: number, y: number): DraggableRect | null {
    // 从上往下检测（后绘制的在上层，优先命中）
    for (let i = this.rects.length - 1; i >= 0; i--) {
      const r = this.rects[i]
      if (x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height) {
        return r
      }
    }
    return null
  }

  private bindEvents() {
    this.canvas.addEventListener('mousedown', (e) => {
      const { x, y } = getCanvasPos(this.canvas, e)
      const hit = this.hitTest(x, y)
      if (hit) {
        this.dragTarget = hit
        hit.isDragging = true
        hit.dragOffsetX = x - hit.x
        hit.dragOffsetY = y - hit.y
        this.canvas.style.cursor = 'grabbing'
      }
    })

    this.canvas.addEventListener('mousemove', (e) => {
      const { x, y } = getCanvasPos(this.canvas, e)
      if (this.dragTarget) {
        this.dragTarget.x = x - this.dragTarget.dragOffsetX
        this.dragTarget.y = y - this.dragTarget.dragOffsetY
        this.render()
      } else {
        this.canvas.style.cursor = this.hitTest(x, y) ? 'grab' : 'default'
      }
    })

    const stopDrag = () => {
      if (this.dragTarget) {
        this.dragTarget.isDragging = false
        this.dragTarget = null
        this.canvas.style.cursor = 'default'
      }
    }

    this.canvas.addEventListener('mouseup', stopDrag)
    this.canvas.addEventListener('mouseleave', stopDrag)
  }

  render() {
    const { ctx, canvas } = this
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    this.rects.forEach(r => {
      ctx.save()
      // 拖拽中的方块添加阴影
      if (r.isDragging) {
        ctx.shadowColor = 'rgba(0,0,0,0.4)'
        ctx.shadowBlur = 20
        ctx.shadowOffsetY = 10
      }
      ctx.fillStyle = r.color
      ctx.fillRect(r.x, r.y, r.width, r.height)
      ctx.restore()
    })
  }
}
```

---

## 七、图像处理（像素操作）

### 7.1 getImageData / putImageData

```typescript
// 获取像素数据（RGBA 数组，每个像素 4 个值）
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
const data = imageData.data  // Uint8ClampedArray，格式：[R,G,B,A, R,G,B,A, ...]

// 遍历每个像素
for (let i = 0; i < data.length; i += 4) {
  const r = data[i]
  const g = data[i + 1]
  const b = data[i + 2]
  const a = data[i + 3]

  // 获取某个像素的坐标
  const pixelIndex = i / 4
  const x = pixelIndex % canvas.width
  const y = Math.floor(pixelIndex / canvas.width)
}

// 把修改后的像素写回 Canvas
ctx.putImageData(imageData, 0, 0)
```

---

### 7.2 常用图像滤镜实现

```typescript
// 灰度滤镜
function grayscale(ctx: CanvasRenderingContext2D) {
  const { width, height } = ctx.canvas
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    // 人眼对不同颜色敏感度不同，用加权平均
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
    data[i] = data[i + 1] = data[i + 2] = gray
  }
  ctx.putImageData(imageData, 0, 0)
}

// 反色滤镜
function invert(ctx: CanvasRenderingContext2D) {
  const { width, height } = ctx.canvas
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    data[i]     = 255 - data[i]      // R
    data[i + 1] = 255 - data[i + 1]  // G
    data[i + 2] = 255 - data[i + 2]  // B
    // Alpha 不变
  }
  ctx.putImageData(imageData, 0, 0)
}

// 亮度/对比度调整
function adjustBrightnessContrast(ctx: CanvasRenderingContext2D, brightness = 0, contrast = 0) {
  // brightness: -100 ~ 100, contrast: -100 ~ 100
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast))
  const { width, height } = ctx.canvas
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    // 先调亮度
    data[i]     = Math.min(255, Math.max(0, data[i]     + brightness))
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + brightness))
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + brightness))
    // 再调对比度
    data[i]     = Math.min(255, Math.max(0, factor * (data[i]     - 128) + 128))
    data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128))
    data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128))
  }
  ctx.putImageData(imageData, 0, 0)
}

// 马赛克滤镜
function mosaic(ctx: CanvasRenderingContext2D, blockSize = 10) {
  const { width, height } = ctx.canvas
  for (let y = 0; y < height; y += blockSize) {
    for (let x = 0; x < width; x += blockSize) {
      // 取每个块左上角像素的颜色
      const pixel = ctx.getImageData(x, y, 1, 1).data
      ctx.fillStyle = `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3] / 255})`
      ctx.fillRect(x, y, blockSize, blockSize)
    }
  }
}
```

---

### 7.3 合成模式（globalCompositeOperation）

```typescript
// 控制新绘制内容与已有内容的混合方式
// 默认：'source-over'（新内容覆盖旧内容）

ctx.globalCompositeOperation = 'destination-out'
// 新内容的形状 → 变成透明（橡皮擦效果！）

// 其他常用值：
// 'multiply'     — 正片叠底（暗色效果）
// 'screen'       — 滤色（亮色效果）
// 'overlay'      — 叠加
// 'lighter'      — 颜色加亮
// 'xor'          — 异或（相交部分透明）

// 实用案例：橡皮擦
function useEraser(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!
  let isErasing = false

  canvas.addEventListener('mousedown', () => isErasing = true)
  canvas.addEventListener('mouseup', () => isErasing = false)
  canvas.addEventListener('mousemove', (e) => {
    if (!isErasing) return
    const { x, y } = getCanvasPos(canvas, e)

    ctx.save()
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(x, y, 20, 0, Math.PI * 2)
    ctx.fill()     // 填充 → 但因为是 destination-out，实际效果是擦除
    ctx.restore()
  })
}
```

---

## 八、实战：在线画板

```typescript
class DrawingBoard {
  private ctx: CanvasRenderingContext2D
  private isDrawing = false
  private lastX = 0
  private lastY = 0
  private history: ImageData[] = []  // 撤销历史
  private historyIndex = -1

  tool: 'pen' | 'eraser' | 'line' | 'rect' = 'pen'
  color = '#000000'
  lineWidth = 4

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!
    this.ctx.lineCap = 'round'      // 线段端点圆滑
    this.ctx.lineJoin = 'round'     // 拐角圆滑
    this.bindEvents()
    this.saveSnapshot()             // 保存初始状态
  }

  private saveSnapshot() {
    // 截断未来历史（在中间撤销后再画）
    this.history = this.history.slice(0, this.historyIndex + 1)
    this.history.push(this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height))
    this.historyIndex = this.history.length - 1
  }

  undo() {
    if (this.historyIndex <= 0) return
    this.historyIndex--
    this.ctx.putImageData(this.history[this.historyIndex], 0, 0)
  }

  redo() {
    if (this.historyIndex >= this.history.length - 1) return
    this.historyIndex++
    this.ctx.putImageData(this.history[this.historyIndex], 0, 0)
  }

  clearAll() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.saveSnapshot()
  }

  exportPNG(): string {
    return this.canvas.toDataURL('image/png')
  }

  private startDraw(x: number, y: number) {
    this.isDrawing = true
    this.lastX = x
    this.lastY = y

    if (this.tool === 'pen' || this.tool === 'eraser') {
      this.ctx.beginPath()
      this.ctx.moveTo(x, y)
    }
  }

  private draw(x: number, y: number) {
    if (!this.isDrawing) return

    const ctx = this.ctx
    ctx.lineWidth = this.lineWidth
    ctx.strokeStyle = this.tool === 'eraser' ? '#ffffff' : this.color
    ctx.globalCompositeOperation = this.tool === 'eraser' ? 'destination-out' : 'source-over'

    if (this.tool === 'pen' || this.tool === 'eraser') {
      ctx.lineTo(x, y)
      ctx.stroke()
    }
  }

  private endDraw() {
    if (!this.isDrawing) return
    this.isDrawing = false
    this.ctx.globalCompositeOperation = 'source-over'
    this.saveSnapshot()
  }

  private bindEvents() {
    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = this.canvas.getBoundingClientRect()
      const point = 'touches' in e ? e.touches[0] : e
      return {
        x: point.clientX - rect.left,
        y: point.clientY - rect.top,
      }
    }

    // 鼠标事件
    this.canvas.addEventListener('mousedown', (e) => { const { x, y } = getPos(e); this.startDraw(x, y) })
    this.canvas.addEventListener('mousemove', (e) => { const { x, y } = getPos(e); this.draw(x, y) })
    this.canvas.addEventListener('mouseup', () => this.endDraw())
    this.canvas.addEventListener('mouseleave', () => this.endDraw())

    // 触摸事件（移动端）
    this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); const { x, y } = getPos(e); this.startDraw(x, y) }, { passive: false })
    this.canvas.addEventListener('touchmove', (e) => { e.preventDefault(); const { x, y } = getPos(e); this.draw(x, y) }, { passive: false })
    this.canvas.addEventListener('touchend', () => this.endDraw())

    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'z') this.undo()
      if (e.ctrlKey && e.key === 'y') this.redo()
    })
  }
}
```

---

## 九、常见问题

### 9.1 Canvas 内容模糊

```typescript
// 原因：未处理 devicePixelRatio
// ✅ 解决：见第三章 createHDCanvas
```

### 9.2 Canvas 导出图片跨域报错

```typescript
// 原因：Canvas 上绘制了跨域图片，污染了画布，getImageData/toDataURL 报安全错误
const img = new Image()
img.crossOrigin = 'anonymous'   // ← 必须在设置 src 之前
img.src = 'https://other-domain.com/image.jpg'
img.onload = () => {
  ctx.drawImage(img, 0, 0)
  // 现在可以正常 toDataURL
  const url = canvas.toDataURL()
}

// 同时，服务器也必须响应 Access-Control-Allow-Origin: *
```

### 9.3 动画停止后 Canvas 内容消失

```typescript
// 原因：Canvas 尺寸改变时内容会被清除（包括窗口 resize）
window.addEventListener('resize', () => {
  // ❌ 直接改 canvas.width/height 会清空内容
  canvas.width = newWidth

  // ✅ 先保存，resize 后恢复
  const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height)
  canvas.width = newWidth
  canvas.height = newHeight
  ctx.putImageData(snapshot, 0, 0)

  // 更好的做法：resize 后触发完整的重渲染
})
```

### 9.4 触摸事件滚动与绘制冲突

```typescript
// 移动端 touchmove 默认会滚动页面，需要阻止
canvas.addEventListener('touchmove', (e) => {
  e.preventDefault()   // 阻止页面滚动
  // ... 绘制逻辑
}, { passive: false })   // ← passive: false 才能调用 preventDefault
```

### 9.5 内存泄漏（大量 ImageData）

```typescript
// getImageData 返回的大型 TypedArray 要注意及时释放
// JavaScript GC 无法精确控制 TypedArray 的释放时机

// ✅ 频繁操作时：复用 ImageData 对象，不要每帧都 getImageData
const imageData = ctx.getImageData(0, 0, width, height)  // 只创建一次

function processFrame() {
  // 直接修改已有的 imageData.data
  for (let i = 0; i < imageData.data.length; i += 4) {
    // ... 处理像素
  }
  ctx.putImageData(imageData, 0, 0)  // 写回
}
```

---

## 十、快速参考卡

| 需求 | API / 方案 |
|------|-----------|
| 高清屏不模糊 | `canvas.width = cssWidth * dpr` + `ctx.scale(dpr, dpr)` |
| 动画循环 | `requestAnimationFrame` + deltaTime |
| 大量图形不卡 | 分层 Canvas + OffscreenCanvas |
| 复杂路径复用 | `Path2D` |
| 高性能图片 | `createImageBitmap()` |
| Worker 渲染 | `canvas.transferControlToOffscreen()` |
| 点击检测 | `ctx.isPointInPath(path, x, y)` |
| 图像滤镜 | `getImageData` → 像素操作 → `putImageData` |
| 橡皮擦 | `globalCompositeOperation = 'destination-out'` |
| 导出图片 | `canvas.toDataURL('image/png')` |
| 跨域图片 | `img.crossOrigin = 'anonymous'` |
| SSR 渲染 | `node-canvas` 或改用 `renderer: 'svg'` |
