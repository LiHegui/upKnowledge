# 虚拟列表（Virtual List）完全指南

> 虚拟列表是前端**大数据量渲染**的核心优化手段，也是中高级前端面试的高频考点。本章从原理到实战、从固定高度到动态高度、从原生 JS 到 React/Vue 框架，系统讲解虚拟列表的方方面面。

---

## 认知篇

## Q: 为什么需要虚拟列表？直接渲染大量 DOM 有什么问题？

**A:**

当列表数据量达到 **数千甚至数万条** 时，直接渲染所有 DOM 节点会导致严重的性能问题：

**1. DOM 节点爆炸**

```
10万条数据 × 每条 3 个子元素 = 30万+ DOM 节点
```

浏览器需要为每个节点分配内存、计算布局、绑定事件，DOM 越多性能越差。

**2. 各阶段性能对比**

| 阶段 | 1000 条 | 10000 条 | 100000 条 |
|------|---------|----------|-----------|
| 首次渲染 | ~50ms | ~500ms | **5s+** |
| 滚动帧率 | 60fps | 30~40fps | **<10fps 卡顿** |
| 内存占用 | ~10MB | ~80MB | **500MB+** |
| 搜索/过滤 | 即时 | ~200ms | **2s+** |

**3. 用户体验问题**

- 首屏白屏时间过长
- 滚动卡顿、掉帧
- 页面内存溢出甚至崩溃（尤其移动端）
- 交互响应迟缓

> ⚠️ **注意**：Chrome 开发者工具 → Performance Monitor 可以实时观察 DOM 节点数，超过 **1500** 个节点时就应考虑优化。

---

## Q: 虚拟列表的核心原理是什么？

**A:**

虚拟列表的核心思想：**只渲染用户可见区域（viewport）内的少量 DOM 元素**，通过动态计算和占位模拟完整列表的滚动效果。

### 架构示意图

```
                        ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
                          整体高度（phantom）
                        │  = total × itemHeight    │
                        
                        │ ┌─────────────────────┐  │
                          │                     │
                        │ │   已滚出可视区域      │  │  ← startOffset（上方留白）
                          │   （不渲染 DOM）      │
                        │ │                     │  │
   scrollTop ──────────── ├─────────────────────┤
                        │ │  ✅ 可见条目 0       │  │
                          │  ✅ 可见条目 1       │     ← 只有这部分有真实 DOM
   容器可视高度 ────────│ │  ✅ 可见条目 2       │  │
   （viewportHeight）     │  ✅ ...             │
                        │ │  ✅ 可见条目 N       │  │
                          ├─────────────────────┤
                        │ │                     │  │
                          │   未进入可视区域      │     ← endOffset（下方留白）
                        │ │   （不渲染 DOM）      │  │
                          │                     │
                        │ └─────────────────────┘  │
                        └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

### 关键计算公式（固定行高）

```js
// 已知量
const itemHeight = 50          // 每项高度
const viewportHeight = 600     // 容器可见高度
const totalCount = 100000      // 数据总条数

// 派生量
const totalHeight = totalCount * itemHeight          // 列表总高度（撑开滚动条）
const visibleCount = Math.ceil(viewportHeight / itemHeight)  // 可见条数

// 滚动时动态计算
const scrollTop = container.scrollTop                // 当前滚动偏移
const startIndex = Math.floor(scrollTop / itemHeight)        // 起始索引
const endIndex = Math.min(startIndex + visibleCount, totalCount)  // 结束索引
const startOffset = startIndex * itemHeight                  // 内容偏移量
```

### 核心流程

1. **初始化**：计算可见条数，创建 phantom（撑高度）+ content（真实内容）层
2. **监听 scroll**：根据 `scrollTop` 算出 `startIndex` / `endIndex`
3. **渲染**：只渲染 `[startIndex, endIndex)` 范围内的元素
4. **偏移**：通过 `transform: translateY(startOffset)` 将内容层定位到正确位置

---

## 实现篇

## Q: 如何用原生 JS 手写一个固定高度的虚拟列表？

**A:**

### 完整实现

```html
<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  
  .virtual-list-container {
    height: 600px;
    overflow-y: auto;
    position: relative;
    border: 1px solid #ddd;
    width: 400px;
    margin: 20px auto;
  }
  
  .virtual-list-phantom {
    /* 撑开整体高度，产生原生滚动条 */
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
  }
  
  .virtual-list-content {
    /* 真实渲染层 */
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
  }
  
  .list-item {
    height: 50px;
    line-height: 50px;
    padding: 0 16px;
    border-bottom: 1px solid #eee;
    color: #333;
  }
  
  .list-item:hover {
    background: #f5f5f5;
  }
</style>
</head>
<body>

<div class="virtual-list-container" id="container"></div>

<script>
class VirtualList {
  constructor({ el, itemHeight, data, renderItem }) {
    this.el = el
    this.itemHeight = itemHeight
    this.data = data
    this.renderItem = renderItem

    this.viewportHeight = el.clientHeight
    // 可见条数 + 上下各 bufferSize 条缓冲
    this.bufferSize = 5
    this.visibleCount = Math.ceil(this.viewportHeight / itemHeight)
    this.renderCount = this.visibleCount + this.bufferSize * 2

    this._initDOM()
    this._bindEvents()
    this._render()
  }

  _initDOM() {
    // 占位层：撑开总高度
    this.phantom = document.createElement('div')
    this.phantom.className = 'virtual-list-phantom'
    this.phantom.style.height = this.data.length * this.itemHeight + 'px'

    // 内容层：只放可见元素
    this.content = document.createElement('div')
    this.content.className = 'virtual-list-content'

    this.el.appendChild(this.phantom)
    this.el.appendChild(this.content)
  }

  _bindEvents() {
    let ticking = false
    this.el.addEventListener('scroll', () => {
      if (!ticking) {
        // 用 rAF 节流滚动回调，保证不超过屏幕刷新率
        requestAnimationFrame(() => {
          this._render()
          ticking = false
        })
        ticking = true
      }
    })
  }

  _render() {
    const scrollTop = this.el.scrollTop

    // 计算实际渲染范围（含 buffer）
    let startIndex = Math.floor(scrollTop / this.itemHeight) - this.bufferSize
    startIndex = Math.max(0, startIndex)

    let endIndex = startIndex + this.renderCount
    endIndex = Math.min(endIndex, this.data.length)

    // 偏移内容层到正确位置
    const offsetY = startIndex * this.itemHeight
    this.content.style.transform = `translateY(${offsetY}px)`

    // 渲染条目
    this.content.innerHTML = ''
    const fragment = document.createDocumentFragment()
    for (let i = startIndex; i < endIndex; i++) {
      fragment.appendChild(this.renderItem(this.data[i], i))
    }
    this.content.appendChild(fragment)
  }

  // 数据更新
  updateData(newData) {
    this.data = newData
    this.phantom.style.height = newData.length * this.itemHeight + 'px'
    this._render()
  }
}

// ===== 使用 =====
const mockData = Array.from({ length: 100000 }, (_, i) => ({
  id: i,
  text: `第 ${i + 1} 条数据 — ${Math.random().toString(36).slice(2, 8)}`
}))

const list = new VirtualList({
  el: document.getElementById('container'),
  itemHeight: 50,
  data: mockData,
  renderItem: (item, index) => {
    const div = document.createElement('div')
    div.className = 'list-item'
    div.textContent = item.text
    return div
  }
})
</script>
</body>
</html>
```

### 关键要点

| 要点 | 说明 |
|------|------|
| **双层结构** | phantom 层撑高度，content 层放真实 DOM |
| **缓冲区（buffer）** | 上下各多渲染 N 条，防止快速滚动时出现白屏闪烁 |
| **rAF 节流** | 使用 `requestAnimationFrame` 节流 scroll 回调 |
| **DocumentFragment** | 批量 DOM 操作，减少重排次数 |
| **transform 偏移** | 用 `translateY` 而非 `top`，触发 GPU 合成层，避免回流 |

---

## Q: 如何实现不定高度（动态高度）的虚拟列表？

**A:**

不定高度是虚拟列表的**难点**，因为每项高度不同，无法用简单乘法算出偏移位置。

### 核心策略：预估高度 + 渲染后修正

```
1. 初始化时，为每项设置一个预估高度（estimatedHeight）
2. 计算所有条目的预估 top/bottom 位置缓存
3. 渲染后，通过 ResizeObserver 获取实际高度
4. 用实际高度修正位置缓存，并更新总高度
```

### 完整实现

```js
class DynamicVirtualList {
  constructor({ el, data, estimatedHeight, renderItem }) {
    this.el = el
    this.data = data
    this.estimatedHeight = estimatedHeight || 80
    this.renderItem = renderItem

    this.viewportHeight = el.clientHeight
    this.bufferSize = 5

    // 位置缓存：记录每条的 index / height / top / bottom
    this.positions = this.data.map((_, index) => ({
      index,
      height: this.estimatedHeight,
      top: index * this.estimatedHeight,
      bottom: (index + 1) * this.estimatedHeight,
    }))

    this._initDOM()
    this._bindEvents()
    this._render()
  }

  // 总高度 = 最后一条的 bottom
  get totalHeight() {
    const last = this.positions[this.positions.length - 1]
    return last ? last.bottom : 0
  }

  _initDOM() {
    this.phantom = document.createElement('div')
    this.phantom.style.height = this.totalHeight + 'px'

    this.content = document.createElement('div')
    this.content.style.position = 'absolute'
    this.content.style.left = '0'
    this.content.style.right = '0'
    this.content.style.top = '0'

    this.el.style.position = 'relative'
    this.el.style.overflow = 'auto'
    this.el.appendChild(this.phantom)
    this.el.appendChild(this.content)
  }

  _bindEvents() {
    let ticking = false
    this.el.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this._render()
          ticking = false
        })
        ticking = true
      }
    })
  }

  // 二分查找：根据 scrollTop 找到 startIndex
  _findStartIndex(scrollTop) {
    let low = 0
    let high = this.positions.length - 1

    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      const midBottom = this.positions[mid].bottom

      if (midBottom === scrollTop) {
        return mid + 1
      } else if (midBottom < scrollTop) {
        low = mid + 1
      } else {
        // midBottom > scrollTop
        if (mid === 0 || this.positions[mid - 1].bottom <= scrollTop) {
          return mid
        }
        high = mid - 1
      }
    }
    return low
  }

  _render() {
    const scrollTop = this.el.scrollTop

    // 通过二分查找定位 startIndex
    let startIndex = this._findStartIndex(scrollTop) - this.bufferSize
    startIndex = Math.max(0, startIndex)

    // 找到 endIndex：bottom 超出 scrollTop + viewportHeight 的第一项
    let endIndex = startIndex
    const bottomEdge = scrollTop + this.viewportHeight
    while (endIndex < this.data.length && this.positions[endIndex].top < bottomEdge) {
      endIndex++
    }
    endIndex = Math.min(endIndex + this.bufferSize, this.data.length)

    // 渲染可见条目
    this.content.innerHTML = ''
    const fragment = document.createDocumentFragment()
    for (let i = startIndex; i < endIndex; i++) {
      const node = this.renderItem(this.data[i], i)
      node.dataset.index = i
      fragment.appendChild(node)
    }
    this.content.appendChild(fragment)

    // 偏移
    this.content.style.transform = `translateY(${this.positions[startIndex].top}px)`

    // 渲染后更新实际高度
    this._updatePositions()
  }

  _updatePositions() {
    const nodes = this.content.children
    for (const node of nodes) {
      const index = +node.dataset.index
      const rect = node.getBoundingClientRect()
      const oldHeight = this.positions[index].height
      const newHeight = rect.height

      // 高度有变化才更新
      if (Math.abs(oldHeight - newHeight) > 0.5) {
        const diff = newHeight - oldHeight
        this.positions[index].height = newHeight
        this.positions[index].bottom += diff

        // 修正后续所有条目的 top/bottom
        for (let j = index + 1; j < this.positions.length; j++) {
          this.positions[j].top = this.positions[j - 1].bottom
          this.positions[j].bottom = this.positions[j].top + this.positions[j].height
        }
      }
    }

    // 更新总高度
    this.phantom.style.height = this.totalHeight + 'px'
  }
}
```

### 关键技术要点

| 难点 | 解决方案 |
|------|----------|
| 未渲染的项不知道高度 | 使用**预估高度**初始化位置缓存 |
| 渲染后高度可能变化 | `getBoundingClientRect()` 或 `ResizeObserver` 获取实际高度 |
| 根据 scrollTop 查找起始项 | **二分查找**（O(log n)），不能再用除法 |
| 修正后续项位置 | 从变化位置开始，向后逐个修正 `top` / `bottom` |
| 总高度动态变化 | 每次更新后重新设置 phantom 高度 |

> ⚠️ **注意**：大量修正后续位置的操作时间复杂度为 O(n)，生产级库通常使用**树状数组（Fenwick Tree）** 或**分段求和**优化到 O(log n)。

---

## Q: 虚拟列表的缓冲区（Buffer）是什么？为什么需要？

**A:**

缓冲区是指在可见范围的**上下两端额外渲染若干条目**：

```
        ┌────────────────────┐
        │  buffer 上方 (N条)  │  ← 已滚出视口但仍保留 DOM
        ├────────────────────┤
        │                    │
        │    可见区域         │  ← 用户看到的
        │                    │
        ├────────────────────┤
        │  buffer 下方 (N条)  │  ← 即将进入视口的预渲染
        └────────────────────┘
```

**为什么需要缓冲区：**

1. **防止白屏闪烁**：用户快速滚动时，如果没有缓冲，新内容来不及渲染会短暂白屏
2. **平滑滚动**：缓冲区内的元素已经在 DOM 中，滚入视口时无需等待渲染
3. **减少渲染频率**：小幅滚动不会触发内容切换，降低 scroll 回调开销

**缓冲区大小建议：**

| 场景 | 推荐 bufferSize | 说明 |
|------|-----------------|------|
| 普通列表 | 3~5 条 | 平衡性能与体验 |
| 快速滚动场景 | 8~10 条 | 减少白屏概率 |
| 移动端 | 2~3 条 | 移动端 DOM 开销更大 |
| 复杂单项（含图片等） | 2~3 条 | 每项渲染成本高，缓冲要少 |

---

## 进阶篇

## Q: 虚拟列表如何处理滚动到指定位置（scrollToIndex）？

**A:**

`scrollToIndex` 是虚拟列表的常见需求，比如「回到顶部」「跳转到第 N 条」。

### 固定高度实现

```js
scrollToIndex(index) {
  const offset = index * this.itemHeight
  this.el.scrollTop = offset
}
```

### 动态高度实现

```js
scrollToIndex(index, align = 'start') {
  const position = this.positions[index]
  if (!position) return

  switch (align) {
    case 'start':
      // 目标项对齐容器顶部
      this.el.scrollTop = position.top
      break
    case 'center':
      // 目标项居中
      this.el.scrollTop = position.top - (this.viewportHeight - position.height) / 2
      break
    case 'end':
      // 目标项对齐容器底部
      this.el.scrollTop = position.bottom - this.viewportHeight
      break
  }
}
```

> ⚠️ **注意**：动态高度场景下，如果目标项从未被渲染过，其位置是**预估值**，跳转后可能需要**二次修正**。

---

## Q: 虚拟列表如何结合无限滚动（Infinite Scroll）加载？

**A:**

虚拟列表 + 无限滚动是最常见的组合方案：**虚拟列表负责渲染优化，无限滚动负责数据加载**。

### 实现思路

```js
class InfiniteVirtualList extends VirtualList {
  constructor(options) {
    super(options)
    this.loading = false
    this.hasMore = true
    this.loadMore = options.loadMore  // 加载更多的回调
    this.threshold = options.threshold || 200  // 距底部多少 px 触发
  }

  _bindEvents() {
    super._bindEvents()

    this.el.addEventListener('scroll', () => {
      if (this.loading || !this.hasMore) return

      const { scrollTop, scrollHeight, clientHeight } = this.el
      // 距底部小于 threshold 时触发加载
      if (scrollHeight - scrollTop - clientHeight < this.threshold) {
        this._fetchMore()
      }
    })
  }

  async _fetchMore() {
    this.loading = true
    this._showLoading()

    try {
      const { data, hasMore } = await this.loadMore()
      this.data = [...this.data, ...data]
      this.hasMore = hasMore
      this.phantom.style.height = this.data.length * this.itemHeight + 'px'
      this._render()
    } finally {
      this.loading = false
      this._hideLoading()
    }
  }

  _showLoading() {
    // 显示底部 loading 指示器
  }

  _hideLoading() {
    // 隐藏 loading 指示器
  }
}

// 使用
const list = new InfiniteVirtualList({
  el: document.getElementById('container'),
  itemHeight: 50,
  data: initialData,
  renderItem: (item) => { /* ... */ },
  threshold: 300,
  loadMore: async () => {
    const res = await fetch(`/api/list?page=${page++}`)
    const json = await res.json()
    return { data: json.list, hasMore: json.hasMore }
  }
})
```

### 方案对比

| 方案 | 思路 | 优点 | 缺点 |
|------|------|------|------|
| scroll 事件监听 | 计算距底距离 | 兼容性好 | 需手动节流 |
| IntersectionObserver | 监听哨兵元素进入视口 | 性能好，无需手动计算 | 与虚拟列表配合稍复杂 |
| 滚动百分比 | `scrollTop / (scrollHeight - clientHeight)` | 简单 | 精度不够 |

---

## Q: 虚拟列表中如何处理搜索高亮和筛选？

**A:**

### 筛选

筛选时替换数据源即可，虚拟列表会自动只渲染匹配项：

```js
function filterList(keyword) {
  const filtered = allData.filter(item =>
    item.text.includes(keyword)
  )
  virtualList.updateData(filtered)
}
```

### 搜索高亮

在 `renderItem` 中处理高亮逻辑：

```js
function renderItem(item, index) {
  const div = document.createElement('div')
  div.className = 'list-item'

  if (keyword) {
    // 转义特殊字符，防止 ReDoS
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escaped})`, 'gi')
    div.innerHTML = item.text.replace(regex, '<mark>$1</mark>')
  } else {
    div.textContent = item.text
  }

  return div
}
```

### 搜索跳转

结合 `scrollToIndex` 跳转到第一个匹配项：

```js
function searchAndJump(keyword) {
  const index = allData.findIndex(item => item.text.includes(keyword))
  if (index !== -1) {
    virtualList.scrollToIndex(index)
  }
}
```

---

## 框架实战篇

## Q: 如何用 React Hooks 实现虚拟列表？

**A:**

### 固定高度 — 自定义 Hook

```tsx
import { useState, useRef, useCallback, useMemo } from 'react'

interface UseVirtualListOptions {
  itemHeight: number
  overscan?: number  // 缓冲条数
}

function useVirtualList<T>(data: T[], options: UseVirtualListOptions) {
  const { itemHeight, overscan = 5 } = options
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)

  const containerHeight = containerRef.current?.clientHeight || 0

  const { startIndex, endIndex, totalHeight, offsetY, visibleData } = useMemo(() => {
    let start = Math.floor(scrollTop / itemHeight) - overscan
    start = Math.max(0, start)

    let end = Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    end = Math.min(end, data.length)

    return {
      startIndex: start,
      endIndex: end,
      totalHeight: data.length * itemHeight,
      offsetY: start * itemHeight,
      visibleData: data.slice(start, end),
    }
  }, [scrollTop, containerHeight, data, itemHeight, overscan])

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return {
    containerRef,
    containerProps: {
      ref: containerRef,
      onScroll,
      style: { height: '100%', overflow: 'auto', position: 'relative' as const },
    },
    wrapperProps: {
      style: { height: totalHeight, position: 'relative' as const },
    },
    listProps: {
      style: { transform: `translateY(${offsetY}px)` },
    },
    visibleData,
    startIndex,
  }
}
```

### 使用示例

```tsx
function VirtualListDemo() {
  const data = useMemo(
    () => Array.from({ length: 100000 }, (_, i) => ({ id: i, text: `Item ${i + 1}` })),
    []
  )

  const { containerProps, wrapperProps, listProps, visibleData, startIndex } =
    useVirtualList(data, { itemHeight: 50 })

  return (
    <div {...containerProps} style={{ ...containerProps.style, height: 600 }}>
      <div {...wrapperProps}>
        <div {...listProps}>
          {visibleData.map((item, i) => (
            <div
              key={startIndex + i}
              style={{ height: 50, lineHeight: '50px', borderBottom: '1px solid #eee' }}
            >
              {item.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

### 生产环境推荐库

| 库 | 特点 | 适用场景 |
|----|------|----------|
| **react-window** | 轻量（~6KB），API 简洁 | 固定/可变高度列表、网格 |
| **@tanstack/react-virtual** | 框架无关，功能全面 | 动态高度、水平/网格、窗口级滚动 |
| **react-virtuoso** | 开箱即用，支持分组/倒序 | 聊天列表、复杂列表 |
| **react-virtualized** | 功能最全但较重 | 大型表格、多维度场景 |

**react-window 快速示例：**

```tsx
import { FixedSizeList } from 'react-window'

const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
  <div style={style}>第 {index + 1} 条</div>
)

<FixedSizeList height={600} itemCount={100000} itemSize={50} width="100%">
  {Row}
</FixedSizeList>
```

**@tanstack/react-virtual 示例（动态高度）：**

```tsx
import { useVirtualizer } from '@tanstack/react-virtual'

function DynamicList({ data }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,  // 预估高度
  })

  return (
    <div ref={parentRef} style={{ height: 600, overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.key}
            ref={virtualizer.measureElement}
            data-index={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {data[virtualRow.index].content}
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## Q: 如何用 Vue 3 Composition API 实现虚拟列表？

**A:**

### 自定义组合式函数 useVirtualList

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface VirtualListOptions {
  itemHeight: number
  overscan?: number
}

function useVirtualList<T>(data: T[], options: VirtualListOptions) {
  const { itemHeight, overscan = 5 } = options
  const containerRef = ref<HTMLElement | null>(null)
  const scrollTop = ref(0)
  const containerHeight = ref(0)

  const totalHeight = computed(() => data.length * itemHeight)

  const startIndex = computed(() => {
    const start = Math.floor(scrollTop.value / itemHeight) - overscan
    return Math.max(0, start)
  })

  const endIndex = computed(() => {
    const end = Math.ceil((scrollTop.value + containerHeight.value) / itemHeight) + overscan
    return Math.min(end, data.length)
  })

  const visibleData = computed(() =>
    data.slice(startIndex.value, endIndex.value).map((item, i) => ({
      data: item,
      index: startIndex.value + i,
    }))
  )

  const offsetY = computed(() => startIndex.value * itemHeight)

  const onScroll = (e: Event) => {
    scrollTop.value = (e.target as HTMLElement).scrollTop
  }

  onMounted(() => {
    if (containerRef.value) {
      containerHeight.value = containerRef.value.clientHeight
    }
  })

  return { containerRef, totalHeight, visibleData, offsetY, onScroll }
}

// ===== 使用 =====
const list = Array.from({ length: 100000 }, (_, i) => ({
  id: i,
  text: `第 ${i + 1} 条数据`,
}))

const { containerRef, totalHeight, visibleData, offsetY, onScroll } =
  useVirtualList(list, { itemHeight: 50 })
</script>

<template>
  <div
    ref="containerRef"
    class="virtual-container"
    @scroll="onScroll"
  >
    <div :style="{ height: totalHeight + 'px', position: 'relative' }">
      <div :style="{ transform: `translateY(${offsetY}px)` }">
        <div
          v-for="{ data: item, index } in visibleData"
          :key="index"
          class="list-item"
        >
          {{ item.text }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.virtual-container {
  height: 600px;
  overflow-y: auto;
  border: 1px solid #ddd;
}
.list-item {
  height: 50px;
  line-height: 50px;
  padding: 0 16px;
  border-bottom: 1px solid #eee;
}
</style>
```

### Vue 生产级库推荐

| 库 | Vue 版本 | 特点 |
|----|----------|------|
| **vue-virtual-scroller** | Vue 3 | 官方推荐，支持 RecycleScroller / DynamicScroller |
| **vueuc (v-virtual-list)** | Vue 3 | Naive UI 内置，轻量 |
| **@tanstack/vue-virtual** | Vue 3 | TanStack 的 Vue 版本，功能全面 |

**vue-virtual-scroller 固定高度示例：**

```vue
<template>
  <RecycleScroller
    class="scroller"
    :items="list"
    :item-size="50"
    key-field="id"
    v-slot="{ item }"
  >
    <div class="item">{{ item.text }}</div>
  </RecycleScroller>
</template>

<script setup>
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
</script>
```

**vue-virtual-scroller 动态高度示例：**

```vue
<template>
  <DynamicScroller
    :items="list"
    :min-item-size="40"
    key-field="id"
  >
    <template v-slot="{ item, index, active }">
      <DynamicScrollerItem :item="item" :active="active" :data-index="index">
        <div class="item">{{ item.content }}</div>
      </DynamicScrollerItem>
    </template>
  </DynamicScroller>
</template>
```

---

## 面试高频考点篇

## Q: 手写虚拟列表时最容易踩哪些坑？

**A:**

| 坑 | 表现 | 解决方案 |
|----|------|----------|
| **快速滚动白屏** | 滚动太快，新 DOM 来不及渲染 | 增大 buffer 缓冲区；用 `requestAnimationFrame` 节流 |
| **抖动/跳动** | 动态高度场景，位置预估不准 | 渲染后修正 position cache；使用 `ResizeObserver` |
| **滚动条跳变** | 修正高度后总高度变化，滚动条位置突变 | 累积差值补偿，避免单次大幅修正 |
| **key 使用不当** | 用 index 做 key 导致 React/Vue 复用错乱 | 用数据唯一 id 作为 key |
| **内存泄漏** | scroll 事件监听未清理 | 组件卸载时 `removeEventListener` |
| **图片加载导致高度变化** | 图片加载后撑开高度 | 预设图片容器高度或用 `ResizeObserver` 监听 |
| **横向滚动未处理** | 表格场景需要双向虚拟化 | 同时计算横纵两个维度的可见范围 |

---

## Q: 虚拟列表有哪些实现方案？各有什么优缺点？

**A:**

### 方案一：固定高度（Fixed Size）

```
偏移 = index × itemHeight
```

- ✅ 实现简单，性能最好
- ❌ 不适合内容高度不一的场景

### 方案二：动态高度 — 预估 + 修正

```
初始化预估高度 → 渲染后获取实际高度 → 修正位置缓存
```

- ✅ 支持任意高度内容
- ❌ 首次渲染可能滚动条跳变，需要额外修正逻辑

### 方案三：DOM 回收（Recycle）

```
不销毁 DOM，只替换内容和位置（对象池模式）
```

- ✅ 避免频繁创建/销毁 DOM，GC 压力小
- ✅ 滚动更流畅
- ❌ 实现复杂度高
- 📦 vue-virtual-scroller 的 `RecycleScroller` 就是这个思路

### 方案四：虚拟化 + 窗口级滚动（Window Scroller）

```
不在固定容器内滚动，而是用浏览器原生 window 滚动
```

- ✅ 更自然的滚动体验，支持全局滚动
- ❌ 需要计算元素在页面中的绝对位置

### 对比总结

| 维度 | 固定高度 | 动态高度 | DOM 回收 | 窗口级滚动 |
|------|----------|----------|----------|------------|
| 实现难度 | ⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| 滚动流畅度 | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 内存占用 | 低 | 中 | **最低** | 中 |
| 适用场景 | 固定行高列表 | 博客/评论列表 | 长列表/IM 聊天 | 瀑布流/信息流 |

---

## Q: 虚拟列表 vs 分页 vs 懒加载，应该选哪个？

**A:**

| 维度 | 虚拟列表 | 分页 | 懒加载（无限滚动） |
|------|----------|------|--------------------|
| **数据量** | 一次性拿到全部或大量数据 | 每页固定条数 | 逐批追加 |
| **DOM 数量** | 始终少量（~20-50） | 每页少量 | **持续增长** ⚠️ |
| **用户体验** | 流畅滚动，无中断 | 有分页操作中断 | 滚动连续，但可能越来越卡 |
| **适用场景** | 大列表（1000+）实时浏览 | 表格数据、搜索结果 | 社交信息流 |
| **最佳实践** | ✅ 虚拟列表 + 懒加载 | ✅ 后台管理系统 | ⚠️ 需配合虚拟列表 |

> ⚠️ **注意**：**懒加载 ≠ 虚拟列表**。懒加载只解决「何时加载数据」的问题，不解决 DOM 过多的问题。当懒加载累积了数千条 DOM 后，仍然会卡顿。**最佳实践是虚拟列表 + 懒加载结合使用。**

---

## Q: 虚拟列表中如何处理复杂交互（选中、拖拽、编辑）？

**A:**

### 选中状态管理

状态不能存在 DOM 上（因为 DOM 会被回收），必须存在数据层：

```js
// ✅ 正确：状态跟随数据
const selectedIds = new Set()

function toggleSelect(id) {
  if (selectedIds.has(id)) {
    selectedIds.delete(id)
  } else {
    selectedIds.add(id)
  }
  virtualList._render()  // 重新渲染以更新 UI
}

function renderItem(item) {
  const div = document.createElement('div')
  div.className = `list-item ${selectedIds.has(item.id) ? 'selected' : ''}`
  div.textContent = item.text
  div.addEventListener('click', () => toggleSelect(item.id))
  return div
}
```

### 拖拽排序

虚拟列表中拖拽需要特殊处理：

```js
// 关键点：
// 1. 拖拽时固定被拖拽元素（脱离虚拟列表渲染循环）
// 2. 拖拽目标位置通过坐标计算对应 index
// 3. 放置时更新数据源顺序，而非 DOM 顺序

function getDropIndex(clientY) {
  const scrollTop = container.scrollTop
  const containerTop = container.getBoundingClientRect().top
  const offsetInList = clientY - containerTop + scrollTop
  return Math.floor(offsetInList / itemHeight)
}
```

### 行内编辑

```js
// 关键点：
// 1. 编辑状态存在数据层（editingId）
// 2. 滚动后再回来，编辑状态依然保持
// 3. 失焦或回车时保存数据并退出编辑态

const editingId = ref(null)

function renderItem(item) {
  if (editingId.value === item.id) {
    // 渲染输入框
    const input = document.createElement('input')
    input.value = item.text
    input.addEventListener('blur', () => {
      item.text = input.value
      editingId.value = null
      virtualList._render()
    })
    return input
  }
  // 渲染普通文本
  const div = document.createElement('div')
  div.textContent = item.text
  div.addEventListener('dblclick', () => {
    editingId.value = item.id
    virtualList._render()
  })
  return div
}
```

> ⚠️ **核心原则**：虚拟列表中，一切状态都应**存在数据层**而非 DOM 层，因为 DOM 随时会被销毁和重建。

---

## 性能调优篇

## Q: 虚拟列表还能做哪些性能优化？

**A:**

### 1. 使用 `requestAnimationFrame` 节流

```js
let ticking = false
container.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      render()
      ticking = false
    })
    ticking = true
  }
})
```

### 2. 避免 `innerHTML`，使用 DOM Diff 或对象池

```js
// 对象池：复用 DOM 节点而非反复创建销毁
class DOMPool {
  constructor(createFn) {
    this.pool = []
    this.createFn = createFn
  }

  acquire() {
    return this.pool.pop() || this.createFn()
  }

  release(node) {
    this.pool.push(node)
  }
}
```

### 3. CSS `contain` 属性优化渲染

```css
.list-item {
  contain: layout style paint;
  /* 告诉浏览器该元素独立于外部布局，可优化重排 */
}
```

### 4. `will-change` 提示 GPU 合成

```css
.virtual-list-content {
  will-change: transform;
  /* 提前创建合成层，滚动时只需 GPU 移动 */
}
```

### 5. Web Worker 处理大量数据

```js
// 将搜索/排序/过滤等耗时操作放到 Worker 中
const worker = new Worker('list-worker.js')

worker.postMessage({ type: 'filter', keyword: 'test', data: allData })
worker.onmessage = (e) => {
  virtualList.updateData(e.data)
}
```

### 6. 骨架屏 / Loading 占位

```js
renderItem(item, index) {
  if (!item) {
    // 数据还未加载，显示骨架屏
    const skeleton = document.createElement('div')
    skeleton.className = 'skeleton-item'
    skeleton.innerHTML = '<div class="skeleton-line"></div>'
    return skeleton
  }
  // 正常渲染
}
```

### 优化检查清单

| 优化项 | 是否应用 | 效果 |
|--------|----------|------|
| rAF 节流 scroll | ✅ 必须 | 减少回调频率 |
| buffer 缓冲区 | ✅ 必须 | 防止快速滚动白屏 |
| DocumentFragment 批量操作 | ✅ 推荐 | 减少重排次数 |
| transform 替代 top | ✅ 推荐 | 避免回流，GPU 加速 |
| CSS contain | ✅ 推荐 | 限制重排范围 |
| DOM 对象池 | ⚡ 进阶 | 减少 GC 压力 |
| Web Worker 数据处理 | ⚡ 进阶 | 避免主线程阻塞 |
| 二分查找定位 | ⚡ 动态高度必须 | O(log n) 定位起始项 |

---
