# ECharts 技术要点

> 覆盖 ECharts 整体架构认知、渲染机制、大数据性能优化、最佳渲染策略、常见图表实践与常见问题排查，附带可运行真实代码。

---

## 一、整体认知

### 1.1 ECharts 是什么

ECharts 是百度开源、Apache 孵化的前端可视化库，底层渲染引擎是 **ZRender**，支持 Canvas 和 SVG 两种渲染方式。

```
你的代码（option 配置）
     │
     ▼
  ECharts 核心层
  ├── 数据处理   — 数据集、数据转换、坐标系计算
  ├── 布局计算   — 图表尺寸、坐标系、图例位置
  └── 图表实现   — 各种图表类型的绘制逻辑
     │
     ▼
  ZRender（渲染引擎）
  ├── Canvas 渲染器  — 默认，性能强
  └── SVG 渲染器     — 矢量，适合小数据
     │
     ▼
  浏览器（Canvas / SVG DOM）
```

---

### 1.2 Canvas vs SVG 渲染模式

这是 ECharts 最重要的基础选择，直接影响性能上限：

| 维度 | Canvas（默认）| SVG |
|------|-------------|-----|
| 渲染方式 | 位图，GPU 加速 | DOM 节点，CPU 渲染 |
| 大数据量 | ✅ 性能强（万级无压力）| ❌ 节点多时卡顿 |
| 交互精度 | 基于像素检测 | DOM 事件，精确 |
| 缩放清晰度 | ❌ 放大模糊 | ✅ 矢量无损 |
| 内存占用 | 低 | 高（大量 DOM）|
| 截图导出 | ✅ `canvas.toDataURL()` | ✅ 序列化 SVG |
| 移动端 | ✅ 推荐 | ⚠️ 性能较差 |
| SSR 服务端渲染 | ❌ 需要 node-canvas | ✅ 字符串输出 |

```typescript
// 在初始化时指定渲染器
const chart = echarts.init(container, null, {
  renderer: 'canvas',  // 默认，大数据首选
  // renderer: 'svg',  // 小数据、需要高清导出时选
})
```

**选择口诀：数据量大用 Canvas，要高清矢量用 SVG，SSR 场景必须用 SVG。**

---

### 1.3 核心组件体系

```
option（配置项）
├── title           — 标题
├── legend          — 图例
├── grid            — 直角坐标系的容器
├── xAxis / yAxis   — X/Y 轴（支持多轴）
├── polar           — 极坐标系
├── geo             — 地理坐标系（地图）
├── tooltip         — 提示框
├── toolbox         — 工具栏（保存图片、数据视图等）
├── dataZoom        — 数据缩放（区域缩放/滚动条）
├── visualMap       — 视觉映射（颜色/大小与数值的映射）
├── dataset         — 数据集（推荐用于数据与图表分离）
├── series[]        — 系列（图表的核心，定义图表类型和数据）
└── color[]         — 全局颜色列表
```

---

### 1.4 按需引入 vs 全量引入（5.x 核心差异）

```typescript
// ❌ 全量引入：打包体积 ~1MB（gzip 后 ~300KB）
import * as echarts from 'echarts'

// ✅ 按需引入：只引入用到的部分，体积可降低 60%~80%
import * as echarts from 'echarts/core'
import { LineChart, BarChart, ScatterChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  ToolboxComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'  // 或 SVGRenderer

// 注册用到的组件
echarts.use([
  LineChart,
  BarChart,
  ScatterChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  ToolboxComponent,
  CanvasRenderer,
])

// 之后正常使用
const chart = echarts.init(container)
```

---

## 二、初始化与基础配置

### 2.1 标准初始化

```typescript
// utils/echarts.ts — 封装初始化逻辑

export function initChart(
  container: HTMLElement,
  option: echarts.EChartsOption,
  opts: { renderer?: 'canvas' | 'svg'; theme?: string | object } = {}
): echarts.ECharts {
  // 防止重复初始化（同一个容器已有实例时直接复用）
  const existing = echarts.getInstanceByDom(container)
  if (existing) existing.dispose()

  const chart = echarts.init(container, opts.theme ?? null, {
    renderer: opts.renderer ?? 'canvas',
    useDirtyRect: true,   // 开启脏矩形优化（5.x 新特性，只重绘变化的区域）
  })

  chart.setOption(option)
  return chart
}
```

---

### 2.2 响应式自适应

```typescript
// ❌ 错误：监听 window resize，当父容器变化但窗口不变时不触发
window.addEventListener('resize', () => chart.resize())

// ✅ 正确：用 ResizeObserver 监听容器本身的尺寸变化
function makeResponsive(chart: echarts.ECharts, container: HTMLElement) {
  const observer = new ResizeObserver(() => {
    chart.resize()
  })
  observer.observe(container)

  // 返回销毁函数
  return () => {
    observer.disconnect()
    chart.dispose()
  }
}
```

---

### 2.3 主题配置

```typescript
// 内置主题
echarts.init(container, 'dark')    // 暗色
echarts.init(container, 'light')   // 亮色（默认）

// 自定义主题（在 https://echarts.apache.org/zh/theme-builder.html 生成）
import customTheme from './custom-theme.json'
echarts.registerTheme('myTheme', customTheme)
echarts.init(container, 'myTheme')
```

---

## 三、渲染机制深入

### 3.1 ZRender 渲染流程

每次调用 `chart.setOption()` 会经历以下步骤：

```
setOption(newOption)
   │
   ▼
① Diff option（对比新旧配置，找出变化部分）
   │
   ▼
② 数据处理（坐标计算、数值转换、数据集处理）
   │
   ▼
③ 布局计算（各组件尺寸、位置）
   │
   ▼
④ 生成渲染指令（ZRender 图形元素）
   │
   ▼
⑤ 渲染到 Canvas/SVG
   │
   └─ 脏矩形优化（useDirtyRect: true）
      只重绘变化的矩形区域，而不是整个画布
```

### 3.2 脏矩形优化（ECharts 5.x）

```typescript
// 开启后，动画或数据更新时只刷新变化的区域
// 对于有动画、Tooltip 频繁显示/隐藏的图表，性能提升明显
echarts.init(container, null, {
  useDirtyRect: true,   // ← 开启脏矩形
})
```

### 3.3 setOption 的两种模式

```typescript
// 模式一：合并模式（默认）
// 新 option 和旧 option 深度合并，只更新变化的部分
chart.setOption(newOption)

// 模式二：替换模式（notMerge: true）
// 完全用新 option 替换，旧配置清空重建
// 适合：图表类型切换、数据结构完全变化
chart.setOption(newOption, { notMerge: true })

// 模式三：懒更新（lazyUpdate: true）
// 不立即渲染，等下一帧批量渲染（减少多次快速更新的重绘次数）
chart.setOption(newOption, { lazyUpdate: true })
```

---

## 四、大数据性能优化

### 4.1 问题定位：什么情况下会卡？

| 场景 | 数据量阈值（Canvas 模式）| 表现 |
|------|----------------------|------|
| 折线图 | > 10,000 点 | 渲染慢、交互卡 |
| 散点图 | > 5,000 点 | 渲染慢 |
| 柱状图 | > 2,000 柱 | 绘制慢 |
| 关系图（graph）| > 500 节点 | 布局计算慢 |
| 地图（geo）| 高精度边界 | 解析慢 |

---

### 4.2 策略一：开启 large 模式

折线图、散点图、柱状图内置大数据优化，超过阈值自动启用 Canvas 合批绘制：

```typescript
// 折线图大数据模式
series: [{
  type: 'line',
  large: true,              // ← 开启大数据模式
  largeThreshold: 2000,    // 超过此数量才启用（默认 2000）
  symbol: 'none',          // 关闭数据点圆圈（大数据时绘制圆圈很耗性能）
  sampling: 'lttb',        // ← 数据降采样（见下节）
  data: hugeData,
}]

// 散点图大数据模式
series: [{
  type: 'scatter',
  large: true,
  largeThreshold: 2000,
  data: millionPoints,
}]
```

---

### 4.3 策略二：数据降采样（sampling）

10 万个点渲染到 1000px 宽的图表，99% 的点在像素上是重叠的。降采样在不影响视觉的前提下大幅减少渲染点数：

```typescript
series: [{
  type: 'line',
  sampling: 'lttb',      // Largest Triangle Three Buckets（最佳视觉保真度）
  // sampling: 'average', // 平均值采样
  // sampling: 'min',     // 最小值
  // sampling: 'max',     // 最大值
  // sampling: 'sum',     // 求和
  data: rawData,          // 原始 100,000 个点，ECharts 自动降采样后渲染
}]
```

**LTTB 算法**：保留折线的拐点和极值，视觉还原度最高，推荐大数据折线图首选。

**与 DataZoom 配合：**

```typescript
option = {
  dataZoom: [{
    type: 'inside',   // 内置缩放（滚轮/触摸）
    start: 0,
    end: 10,          // 初始只显示前 10% 的数据
  }, {
    type: 'slider',   // 底部滑动条
  }],
  series: [{
    type: 'line',
    sampling: 'lttb',   // 缩放时自动对当前视口数据采样
    data: rawData,
  }],
}
```

---

### 4.4 策略三：渐进渲染（progressive）

数据量极大时，避免一次性渲染阻塞主线程，改为分批渲染：

```typescript
series: [{
  type: 'scatter',
  progressive: 400,           // 每帧最多渲染 400 个数据点
  progressiveThreshold: 3000, // 超过 3000 个点才启用渐进渲染
  data: bigData,
}]
```

**效果：** 图表先渲染一部分，逐帧追加，用户能看到图表"逐渐出现"，不会感觉卡死。

---

### 4.5 策略四：WebGL 渲染（ECharts-GL）

当 Canvas 2D 无法满足需求时（百万级数据点、3D 图表），使用 ECharts-GL（WebGL 加速）：

```bash
npm install echarts-gl
```

```typescript
import 'echarts-gl'

// 百万级散点图（WebGL 渲染，性能是 Canvas 的 10~100 倍）
option = {
  series: [{
    type: 'scatterGL',        // ← GL 版本
    progressive: 1e6,
    progressiveThreshold: 1e6,
    symbolSize: 2,
    data: millionPoints,      // [x, y] 格式
    itemStyle: {
      opacity: 0.1,
    },
  }],
}

// 3D 柱状图
option = {
  series: [{
    type: 'bar3D',
    data: data3D,
    shading: 'realistic',
  }],
}
```

---

### 4.6 策略五：关闭不必要的动画

动画在大数据场景下会严重影响性能：

```typescript
option = {
  animation: false,                    // 全局关闭动画

  // 或者针对特定 series 关闭
  series: [{
    type: 'line',
    animation: false,                  // 只关闭这个系列的动画
    animationThreshold: 2000,          // 超过此数量自动关闭动画（默认 2000）
    data: bigData,
  }],
}
```

---

### 4.7 策略六：dataset + transform 数据集方案

将数据与图表逻辑分离，数据只处理一次，多图表共享：

```typescript
option = {
  dataset: {
    source: [
      // 原始数据（可以是二维数组或对象数组）
      ['product', '2023', '2024', '2025'],
      ['手机', 43.3, 85.8, 93.7],
      ['电脑', 83.1, 73.4, 55.1],
      ['平板', 86.4, 65.2, 82.5],
    ],
  },
  series: [
    { type: 'bar', seriesLayoutBy: 'row' },  // 以行为系列
    { type: 'bar', seriesLayoutBy: 'row' },
    { type: 'bar', seriesLayoutBy: 'row' },
  ],
}

// dataset 的数据转换（filter / sort / regression）
option = {
  dataset: [
    { source: rawData },
    {
      transform: {
        type: 'filter',
        config: { dimension: 'score', '>': 60 },  // 过滤 score > 60
      },
    },
    {
      transform: {
        type: 'sort',
        config: { dimension: 'score', order: 'desc' },
      },
    },
  ],
  series: [{
    type: 'bar',
    datasetIndex: 2,  // 使用第三个 dataset（已过滤+排序的）
  }],
}
```

---

### 4.8 策略七：虚拟化/分页 + 增量更新

对于实时流数据（如监控大盘），不要每次都 setOption 全量数据：

```typescript
class RealtimeChart {
  private chart: echarts.ECharts
  private maxPoints = 1000        // 最多保留 1000 个数据点
  private buffer: [number, number][] = []

  constructor(container: HTMLElement) {
    this.chart = echarts.init(container, null, { useDirtyRect: true })
    this.chart.setOption({
      animation: false,             // 实时图关闭动画
      xAxis: { type: 'time' },
      yAxis: { type: 'value' },
      series: [{ type: 'line', data: [], symbol: 'none', sampling: 'lttb' }],
    })
  }

  // 追加新数据点（不重建整个 option）
  appendData(timestamp: number, value: number) {
    this.buffer.push([timestamp, value])

    // 超出最大点数时丢弃旧数据（滑动窗口）
    if (this.buffer.length > this.maxPoints) {
      this.buffer.shift()
    }

    // 增量更新：只更新 series.data，不重建整个配置
    this.chart.setOption({
      series: [{ data: this.buffer }],
    }, {
      lazyUpdate: true,     // 批量渲染，不立即刷新
    })
  }
}

// 每秒追加一个新数据点
const chart = new RealtimeChart(container)
setInterval(() => {
  chart.appendData(Date.now(), Math.random() * 100)
}, 1000)
```

---

### 4.9 策略八：Web Worker 处理数据

数据处理（排序、过滤、聚合）放在 Worker，不阻塞主线程：

```typescript
// data-worker.ts
self.onmessage = (e) => {
  const { rawData, config } = e.data

  // 耗时的数据处理（排序、统计、格式化）
  const processed = rawData
    .filter(item => item.value > config.threshold)
    .sort((a, b) => b.value - a.value)
    .slice(0, config.limit)

  self.postMessage({ processed })
}

// main.ts
const worker = new Worker(new URL('./data-worker.ts', import.meta.url))

worker.postMessage({ rawData: hugeArray, config: { threshold: 10, limit: 1000 } })
worker.onmessage = (e) => {
  chart.setOption({ series: [{ data: e.data.processed }] })
}
```

---

## 五、常见图表最佳实践

### 5.1 折线图 —— 大数据时间序列

```typescript
option = {
  animation: false,
  tooltip: {
    trigger: 'axis',
    // 大数据时 tooltip 格式化要快，避免复杂计算
    formatter: (params) => {
      const p = params[0]
      return `${p.axisValueLabel}<br/>${p.value[1].toFixed(2)}`
    },
  },
  xAxis: {
    type: 'time',               // 时间轴（自动处理时间格式）
    boundaryGap: false,
  },
  yAxis: { type: 'value' },
  dataZoom: [
    { type: 'inside', start: 80, end: 100 },  // 默认显示最后 20% 的数据
    { type: 'slider' },
  ],
  series: [{
    type: 'line',
    symbol: 'none',             // 不显示数据点（大数据必须关）
    lineStyle: { width: 1 },
    sampling: 'lttb',           // 降采样
    large: true,
    data: timeSeriesData,       // [[timestamp, value], ...]
  }],
}
```

---

### 5.2 散点图 —— 百万级数据点

```typescript
// 普通散点图（< 5万点）
series: [{
  type: 'scatter',
  large: true,
  largeThreshold: 2000,
  symbolSize: 3,
  data: points,
}]

// 超大数据（> 10万点）→ 用 WebGL
series: [{
  type: 'scatterGL',
  symbolSize: 2,
  itemStyle: { opacity: 0.3 },
  data: millionPoints,
}]
```

---

### 5.3 柱状图 —— 动态排名（racing bar）

```typescript
// 数据驱动的排名动画
const rawData = {
  '2020': [['手机', 100], ['电脑', 80], ['平板', 60]],
  '2021': [['手机', 130], ['平板', 90], ['电脑', 70]],
}

function updateChart(year: string) {
  const data = rawData[year]
    .sort((a, b) => a[1] - b[1])  // 从小到大排（柱状图从上到下显示）

  chart.setOption({
    yAxis: { data: data.map(d => d[0]) },
    series: [{
      data: data.map(d => d[1]),
      realtimeSort: true,           // 开启实时排序动画
      label: {
        show: true,
        position: 'right',
        formatter: ({ value }) => value.toLocaleString(),
      },
    }],
  })
}

// 自动播放
let year = 2020
const timer = setInterval(() => {
  if (year > 2025) { clearInterval(timer); return }
  updateChart(String(year++))
}, 1500)
```

---

### 5.4 热力图 —— 日历 / 矩阵数据

```typescript
// 日历热力图（GitHub commit 风格）
option = {
  calendar: {
    range: '2025',
    cellSize: [14, 14],
  },
  visualMap: {
    min: 0,
    max: 100,
    calculable: true,
    orient: 'horizontal',
    inRange: { color: ['#ebedf0', '#216e39'] },  // GitHub 绿色系
  },
  series: [{
    type: 'heatmap',
    coordinateSystem: 'calendar',
    data: calendarData,  // [[date, value], ...]，date 格式 '2025-01-01'
  }],
}
```

---

### 5.5 关系图（graph）—— 大量节点优化

```typescript
option = {
  series: [{
    type: 'graph',
    layout: 'force',               // 力导向布局
    force: {
      initLayout: 'circular',      // 初始布局（避免力导算法从随机位置开始）
      gravity: 0.1,
      repulsion: 200,
      edgeLength: [50, 100],
    },
    roam: true,                    // 允许缩放和平移
    large: true,                   // 大数据模式
    largeThreshold: 2000,
    focusNodeAdjacency: true,      // 点击高亮相邻节点
    lineStyle: {
      opacity: 0.3,                // 边线设置较低透明度（节点多时边线密集）
      curveness: 0.1,
    },
    label: { show: false },        // 节点多时关闭 label（太拥挤）
    nodes: graphNodes,             // { id, name, value, category }
    edges: graphEdges,             // { source, target }
  }],
}
```

---

### 5.6 地图 —— 省市区数据可视化

```typescript
import chinaGeoJSON from './china.json'

// 注册地图数据
echarts.registerMap('china', chinaGeoJSON)

option = {
  geo: {
    map: 'china',
    roam: true,
    label: { show: true },
    itemStyle: {
      borderColor: '#fff',
      borderWidth: 1,
    },
    emphasis: {
      itemStyle: { areaColor: '#3498db' },
    },
  },
  visualMap: {
    min: 0,
    max: 1000,
    left: 'left',
    top: 'bottom',
    calculable: true,
  },
  series: [{
    type: 'map',
    map: 'china',
    geoIndex: 0,
    data: provinceData,  // [{ name: '广东', value: 980 }]
  }],
}

// 点击省份下钻
chart.on('click', (params) => {
  if (params.componentType === 'series') {
    const province = params.name
    drillDownToProvince(province)
  }
})
```

---

## 六、框架集成

### 6.1 Vue3 组合式封装（完整版）

```typescript
// composables/useECharts.ts
import { ref, shallowRef, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts/core'

export function useECharts(
  containerRef: Ref<HTMLElement | null>,
  initialOption: echarts.EChartsOption,
  opts: { renderer?: 'canvas' | 'svg'; useDirtyRect?: boolean } = {}
) {
  // shallowRef：图表实例不需要深度响应
  const chart = shallowRef<echarts.ECharts | null>(null)

  function init() {
    if (!containerRef.value) return

    // 防止重复初始化
    const existing = echarts.getInstanceByDom(containerRef.value)
    if (existing) existing.dispose()

    chart.value = echarts.init(containerRef.value, null, {
      renderer: opts.renderer ?? 'canvas',
      useDirtyRect: opts.useDirtyRect ?? true,
    })

    chart.value.setOption(initialOption)
  }

  // 更新 option
  function setOption(option: echarts.EChartsOption, notMerge = false) {
    chart.value?.setOption(option, { notMerge, lazyUpdate: true })
  }

  // 响应式 resize
  let resizeObserver: ResizeObserver | null = null

  onMounted(() => {
    init()

    resizeObserver = new ResizeObserver(() => chart.value?.resize())
    if (containerRef.value) {
      resizeObserver.observe(containerRef.value)
    }
  })

  onUnmounted(() => {
    resizeObserver?.disconnect()
    chart.value?.dispose()
    chart.value = null
  })

  return { chart, setOption }
}
```

```vue
<!-- BarChart.vue -->
<template>
  <div ref="containerRef" style="width: 100%; height: 400px;" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useECharts } from '@/composables/useECharts'

const props = defineProps<{
  data: { name: string; value: number }[]
}>()

const containerRef = ref<HTMLElement | null>(null)

const { chart, setOption } = useECharts(containerRef, {
  xAxis: { type: 'category' },
  yAxis: { type: 'value' },
  series: [{ type: 'bar', data: [] }],
})

// 监听数据变化，动态更新图表
watch(() => props.data, (newData) => {
  setOption({
    xAxis: { data: newData.map(d => d.name) },
    series: [{ data: newData.map(d => d.value) }],
  })
}, { immediate: true })
</script>
```

---

### 6.2 React Hook 封装

```typescript
// hooks/useECharts.ts
import { useEffect, useRef } from 'react'
import * as echarts from 'echarts/core'

export function useECharts(option: echarts.EChartsOption, deps: any[] = []) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // 初始化
    chartRef.current = echarts.init(containerRef.current, null, {
      useDirtyRect: true,
    })
    chartRef.current.setOption(option)

    // ResizeObserver
    const observer = new ResizeObserver(() => chartRef.current?.resize())
    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
      chartRef.current?.dispose()
      chartRef.current = null
    }
  }, [])  // 只在挂载时初始化

  // option 变化时更新
  useEffect(() => {
    chartRef.current?.setOption(option, { lazyUpdate: true })
  }, deps)

  return containerRef
}

// 使用
function SalesChart({ data }) {
  const containerRef = useECharts({
    xAxis: { data: data.map(d => d.name) },
    yAxis: {},
    series: [{ type: 'bar', data: data.map(d => d.value) }],
  }, [data])  // data 变化时重新渲染

  return <div ref={containerRef} style={{ width: '100%', height: '400px' }} />
}
```

---

## 七、常见问题与解决方案

### 7.1 图表不渲染 / 白屏

```
排查顺序：

① 容器高度为 0
   → height 必须是具体数值，父容器 display:flex 时子元素高度可能为 0

② ECharts 实例未成功创建
   → console.log(echarts.getInstanceByDom(container)) 检查是否有实例

③ option 格式错误（silent 模式下不报错）
   → chart.setOption(option, false, true) 第三个参数开启校验

④ 按需引入时漏注册了组件
   → 比如用了 DataZoom 但没有 echarts.use([DataZoomComponent])
```

```typescript
// 开发环境检测工具
if (import.meta.env.DEV) {
  chart.on('rendered', () => console.log('ECharts 渲染完成'))
  chart.on('error', (e) => console.error('ECharts 错误', e))
}
```

---

### 7.2 Tooltip 超出容器被截断

```typescript
tooltip: {
  confine: true,     // ← 将 tooltip 限制在图表范围内，防止超出截断
  appendToBody: true, // ← 或者将 tooltip DOM 挂载到 body 上（脱离容器限制）
}
```

---

### 7.3 图例/坐标轴标签文字重叠

```typescript
// X 轴标签旋转
xAxis: {
  axisLabel: {
    rotate: 45,            // 旋转 45 度
    interval: 0,           // 强制显示所有标签（不跳过）
    // interval: 'auto',   // 自动决定显示哪些（默认，可能跳过部分）
    overflow: 'truncate',  // 超长文字截断
    width: 80,
  },
}

// 图例换行（当图例数量多时）
legend: {
  type: 'scroll',   // 改为可滚动图例，而不是全部挤在一行
  orient: 'vertical',
  right: 10,
  top: 20,
  bottom: 20,
}
```

---

### 7.4 数据更新时动画闪烁

```typescript
// 原因：每次 setOption 都触发了动画
// 解决：
series: [{
  animationDurationUpdate: 300,  // 控制更新动画时长
  animationEasingUpdate: 'linear',
}]

// 实时数据流：完全关闭动画
option = {
  animation: false,
}

// 或者设置合适的防抖间隔
const debouncedUpdate = debounce((data) => {
  chart.setOption({ series: [{ data }] })
}, 200)
```

---

### 7.5 内存泄漏（多实例）

```typescript
// ❌ 错误：没有销毁旧实例就创建新实例，WebGL 上下文溢出
function refresh(container, option) {
  const chart = echarts.init(container)  // 旧实例未释放
  chart.setOption(option)
}

// ✅ 正确：初始化前检查并销毁旧实例
function refresh(container, option) {
  const existing = echarts.getInstanceByDom(container)
  if (existing) existing.dispose()

  const chart = echarts.init(container)
  chart.setOption(option)
  return chart
}

// Vue/React 组件中：在 onUnmounted/useEffect cleanup 里调用 chart.dispose()
```

---

### 7.6 resize 不生效

```typescript
// ❌ 常见问题：容器在 display:none 时初始化，尺寸为 0
// Tab 切换、弹窗等场景中常见

// ✅ 解决方案：在容器可见时再初始化，或显示后手动 resize
watch(isVisible, (visible) => {
  if (visible) {
    nextTick(() => {
      if (!chartInstance) {
        initChart()
      } else {
        chartInstance.resize()
      }
    })
  }
})
```

---

### 7.7 多图表联动（DataZoom 同步）

```typescript
// 场景：多个图表使用同一个时间轴，缩放时同步联动
const charts = [chart1, chart2, chart3]

charts.forEach((chart, idx) => {
  chart.on('datazoom', (e) => {
    charts.forEach((other, otherIdx) => {
      if (otherIdx === idx) return
      // 同步其他图表的 dataZoom 范围
      other.dispatchAction({
        type: 'dataZoom',
        start: e.start ?? e.batch?.[0]?.start,
        end: e.end ?? e.batch?.[0]?.end,
      })
    })
  })
})
```

---

### 7.8 图表导出为图片

```typescript
// 导出为 PNG（Canvas 模式）
function exportChart(chart: echarts.ECharts, filename = 'chart') {
  const url = chart.getDataURL({
    type: 'png',           // 'png' | 'jpeg' | 'svg'
    pixelRatio: 2,         // 2 倍分辨率，导出高清图
    backgroundColor: '#fff',
    excludeComponents: ['toolbox'],  // 导出时排除工具栏
  })

  const link = document.createElement('a')
  link.download = `${filename}.png`
  link.href = url
  link.click()
}

// 工具栏内置导出（推荐）
toolbox: {
  feature: {
    saveAsImage: {
      pixelRatio: 2,
      title: '下载图片',
    },
    dataView: { readOnly: false },   // 查看原始数据
    dataZoom: {},                     // 区域缩放
    restore: {},                      // 还原
  },
}
```

---

## 八、性能优化 Checklist

```
初始化阶段
  ✅ 按需引入（减少 bundle 体积）
  ✅ 指定 renderer: 'canvas'（大数据场景）
  ✅ 开启 useDirtyRect: true
  ✅ 用 shallowRef 存图表实例（Vue）

数据层
  ✅ 数据量 > 2000：开启 large: true
  ✅ 折线图时间序列：配置 sampling: 'lttb'
  ✅ 数据量 > 10万：使用 scatterGL / lineGL
  ✅ 实时流数据：增量更新，不重建 option
  ✅ 耗时数据处理放 Web Worker

渲染层
  ✅ 关闭不必要的 symbol（symbol: 'none'）
  ✅ 大数据关闭动画（animation: false）
  ✅ 更新用 lazyUpdate: true 批量合并
  ✅ tooltip 开启 confine: true

交互层
  ✅ dataZoom 控制可视区域，减少渲染范围
  ✅ mousemove / scroll 事件节流
  ✅ 图例过多用 type: 'scroll'

生命周期
  ✅ 组件销毁时调用 chart.dispose()
  ✅ ResizeObserver 替代 window.resize
  ✅ 容器不可见时不初始化图表
```

---

## 九、快速参考卡

| 场景 | 推荐方案 |
|------|---------|
| < 2000 点，折线图 | 默认配置 |
| 2000 ~ 10万点，折线图 | `large: true` + `sampling: 'lttb'` + `symbol: 'none'` |
| > 10万点，折线图 | ECharts-GL `lineGL` |
| 散点图大量数据 | `scatterGL` + `itemStyle.opacity: 0.1` |
| 实时数据流 | 增量 setOption + `lazyUpdate` + 关闭动画 |
| 颜色/大小映射 | `visualMap` 组件 |
| 下钻图表 | 点击事件 + 动态注册新地图 / 新 option |
| 多图表时间联动 | DataZoom 事件 + `dispatchAction` |
| 图表截图 | `chart.getDataURL({ pixelRatio: 2 })` |
| SSR 服务端渲染 | `renderer: 'svg'` + `echarts-server` |

---

## 十、面试题精选

> 本章将前九章的核心知识点提炼为面试高频问答，建议先尝试自答再展开查看。

---

## Q: ECharts 渲染 10 万条以上数据时卡顿，根本原因是什么？有哪些优化方案？

**A:**

**根本原因：** Canvas 2D 每帧需要逐点绘制，10 万个点意味着 10 万次绘制指令，主线程长时间被占用，导致页面卡顿甚至无响应。

**优化方案全景：**

| 层级 | 方案 | 说明 |
|------|------|------|
| 渲染器选择 | `renderer: 'canvas'`（默认）| SVG 基于 DOM，大数据节点爆炸，必须用 Canvas |
| 合批绘制 | `large: true` + `largeThreshold` | 启用 Canvas 合批，自动对数据**采样特征值**，减少渲染点数 |
| 降采样 | `sampling: 'lttb'` | LTTB 算法保留拐点和极值，视觉还原度最高 |
| 分帧渲染 | `progressive` + `progressiveThreshold` | 每帧渲染固定数量的点，图表逐帧出现，不阻塞主线程 |
| 数据传输 | SSE / WebSocket 流式推送 | 避免一次性传输大量数据，按批接收并增量追加 |
| 框架优化 | `markRaw` / 普通对象存数据 | 避免 Vue Proxy 对图表数据深度代理 |
| 超大数据 | ECharts-GL（WebGL） | 百万级数据点用 `scatterGL` / `lineGL`，性能是 Canvas 的 10~100 倍 |

```js
// 推荐配置：2000 ~ 10万点折线图
series: [{
  type: 'line',
  large: true,
  largeThreshold: 2000,
  symbol: 'none',           // 关闭数据点圆圈，省去大量绘制
  sampling: 'lttb',         // LTTB 降采样
  progressive: 1000,        // 每帧渲染 1000 点，可与 large 同时开启
  progressiveThreshold: 5000,
  animation: false,         // 大数据必须关闭动画
  data: hugeData,
}]

// Vue 中：实例用 markRaw，数据用普通对象
import { markRaw, ref } from 'vue'
const chartInstance = ref(null)
const rawData = []  // ⚠️ 不用 reactive/ref

onMounted(() => {
  chartInstance.value = markRaw(echarts.init(el.value))
})
```

> ⚠️ **注意**：`dataZoom` 默认 `start:0, end:100` 是全量渲染，**不是**性能优化手段。只有将 `end` 设为较小值（如 `end: 20`）才能限制渲染范围，否则它仅是交互组件。

---

## Q: `large` 模式和 `progressive` 模式的区别是什么？

**A:**

| 对比维度 | `large: true` | `progressive` |
|---------|--------------|---------------|
| 原理 | Canvas **合批绘制** + 内部采样，减少绘制次数 | **分帧渐进渲染**，将数据拆成多帧依次绘制 |
| 视觉效果 | 一次性出现（只渲染特征值） | 图表逐帧"生长"出来 |
| 主线程阻塞 | 单帧内完成，数据极大时仍可能短暂阻塞 | 分帧执行，完全不阻塞 |
| 推荐场景 | 数据一次性加载完毕 | 数据量极大、需要展示渲染进度 |

```js
// 两者可同时开启，互相补充
series: [{
  type: 'scatter',
  large: true,               // 合批绘制
  largeThreshold: 2000,
  progressive: 400,          // 分帧渲染
  progressiveThreshold: 3000,
  data: bigData,
}]
```

---

## Q: 实时流数据场景（边接收边渲染）如何优化？`setOption` 够用吗？

**A:**

**`setOption` vs `appendData` 的选择：**

| 场景 | 推荐 API | 原因 |
|------|---------|------|
| 一次性静态数据 | `setOption` | 简单直接 |
| 实时追加新数据点 | `appendData` | 只追加增量，不重建整个 series |
| 图表类型/结构切换 | `setOption({ notMerge: true })` | 完全重建 |
| 短时间内多次更新 | `setOption({ lazyUpdate: true })` | 合并为一次重绘 |

**ECharts 内部已基于 `requestAnimationFrame` 调度**，`lazyUpdate: true` 开启后同一帧内的多次 `setOption` 自动合并，无需手动干预。

**三种流式渲染方案：**

```js
// ① 普通推送（< 60次/秒）：appendData 直接追加，ECharts 内部 RAF 控制节奏
const rawData = []  // ⚠️ 普通数组，不用响应式
source.onmessage = (e) => {
  const { points, total } = JSON.parse(e.data)
  rawData.push(...points)
  chart.appendData({ seriesIndex: 0, data: points })
  if (rawData.length >= total) source.close()
}

// ② 高频推送（> 60次/秒）：业务层手动 RAF 攒批，避免频繁 diff 开销
let buffer = [], rafId = null
socket.onmessage = (e) => {
  buffer.push(...JSON.parse(e.data).points)
  if (!rafId) {
    rafId = requestAnimationFrame(() => {
      chart.appendData({ seriesIndex: 0, data: buffer })
      buffer = []
      rafId = null
    })
  }
}

// ③ 高频推送 + 需要数据计算：Worker 处理，主线程只渲染
// worker.js
self.onmessage = ({ data: { raw } }) => {
  const processed = raw.filter(p => p.value > 0).map(p => [p.ts, p.value])
  self.postMessage(processed)
}
// main.js
const worker = new Worker('./worker.js')
socket.onmessage = (e) => worker.postMessage({ raw: JSON.parse(e.data) })
worker.onmessage = ({ data: processed }) => {
  chart.appendData({ seriesIndex: 0, data: processed })
}
```

**选型建议：**

| 场景 | 方案 |
|------|------|
| 普通推送，无复杂计算 | `appendData` 直接追加 |
| 高频推送，数据格式简单 | 业务层手动 RAF 攒批 |
| 高频推送 + 数据需要计算/聚合 | Web Worker 处理 + 主线程渲染 |

---
