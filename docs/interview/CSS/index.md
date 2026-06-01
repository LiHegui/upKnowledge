# CSS 技术要点

> 涵盖：BFC、盒模型、布局（Flex / 定位 / 居中）、动画、性能、响应式、Sass/Less。按面试高频排序。

---

## Q: 谈谈你对 BFC 的理解？

**A:**

**BFC（Block Formatting Context，块级格式化上下文）** 是页面中一块独立的渲染区域，内部按一套独立规则布局，且与外部相互隔离。

**渲染规则：**

- 内部盒子在垂直方向上一个接一个放置
- 同一 BFC 内相邻块级元素的垂直 margin 会**折叠**（取较大值）
- BFC 区域不会与 `float` 元素重叠
- 计算 BFC 高度时，内部浮动元素**参与高度计算**（清除浮动原理）
- BFC 是隔离的独立容器，内外互不影响

**触发条件：**

- `float` 不为 `none`
- `position: absolute | fixed`
- `display: inline-block | table-cell | flow-root`（`flow-root` 是 CSS3 专为 BFC 设计，无副作用，推荐）
- `overflow` 不为 `visible`（`hidden` / `auto` / `scroll`）

**应用场景：**

- ✅ 清除内部浮动（父元素设 `overflow: hidden` 或 `display: flow-root`）
- ✅ 防止相邻元素 margin 折叠（用 BFC 包裹其中一个）
- ✅ 自适应两栏布局（左浮动 + 右 BFC，右侧自动避开浮动）

> ⚠️ **注意**：`display: flex / grid` 创建的是 **FFC / GFC**，不是 BFC，但行为类似（也是独立格式化上下文）。

<!-- BFC 可视化 Demo（class 以 bfc- 前缀作用域隔离） -->
<style>
.bfc-demo-wrap { font-family:'PingFang SC','Microsoft YaHei',sans-serif; color:#333; margin:20px 0; }
.bfc-demo-wrap h4 { margin:24px 0 8px; color:#2c3e50; font-size:15px; }
.bfc-label { font-size:13px; color:#888; margin:8px 0; }
.bfc-stage { border:1px dashed #bbb; padding:12px; margin:8px 0 16px; background:#fafafa; }
.bfc-box { padding:10px; color:#fff; box-sizing:border-box; }
.bfc-red    { background:#e74c3c; }
.bfc-blue   { background:#3498db; }
.bfc-green  { background:#2ecc71; }
.bfc-orange { background:#f39c12; }
.bfc-purple { background:#9b59b6; }
.bfc-bad  { border:3px solid #e74c3c !important; }
.bfc-good { border:3px solid #2ecc71 !important; }
.bfc-yel  { background:#ffe !important; }
</style>

<div class="bfc-demo-wrap">

<h4>① 规则 1：块级元素垂直排列（默认行为）</h4>
<div class="bfc-stage">
  <div class="bfc-box bfc-red">第一块（块级元素自动占满一行）</div>
  <div class="bfc-box bfc-blue">第二块（紧跟其后，垂直排列）</div>
  <div class="bfc-box bfc-green">第三块（继续往下排）</div>
</div>

<h4>② 规则 2：浮动元素参与高度计算（清除浮动）</h4>
<div class="bfc-label">❌ 不开启 BFC：父元素高度塌陷（红框紧贴顶部）</div>
<div class="bfc-stage bfc-bad">
  <div class="bfc-box bfc-blue" style="float:left; width:120px;">浮动子元素 1</div>
  <div class="bfc-box bfc-green" style="float:left; width:120px;">浮动子元素 2</div>
</div>
<div class="bfc-label">✅ 父元素加 <code>overflow: hidden</code> 触发 BFC：高度正确包裹</div>
<div class="bfc-stage bfc-good" style="overflow:hidden;">
  <div class="bfc-box bfc-blue" style="float:left; width:120px;">浮动子元素 1</div>
  <div class="bfc-box bfc-green" style="float:left; width:120px;">浮动子元素 2</div>
</div>

<h4>③ 规则 3：BFC 不与浮动元素重叠（自适应两栏布局）</h4>
<div class="bfc-label">❌ 右侧被左侧浮动覆盖</div>
<div class="bfc-stage">
  <div class="bfc-box bfc-red" style="float:left; width:150px; height:80px;">左侧浮动</div>
  <div class="bfc-box bfc-blue" style="height:120px;">右侧普通块（左边被红色盒子盖住了！）</div>
</div>
<div class="bfc-label">✅ 右侧加 <code>overflow: hidden</code> 触发 BFC：自动让出空间，宽度自适应</div>
<div class="bfc-stage">
  <div class="bfc-box bfc-red" style="float:left; width:150px; height:80px;">左侧浮动</div>
  <div class="bfc-box bfc-blue" style="height:120px; overflow:hidden;">右侧 BFC，乖乖待在浮动元素旁边，剩余宽度自适应 —— 经典两栏布局！</div>
</div>

<h4>④ 规则 4：阻止相邻元素 margin 折叠</h4>
<div class="bfc-label">❌ 两个盒子各设 <code>margin: 30px 0</code>，实际间距只有 30px（折叠了）</div>
<div class="bfc-stage bfc-yel">
  <div class="bfc-box bfc-orange" style="margin:30px 0;">上方盒子（margin-bottom: 30px）</div>
  <div class="bfc-box bfc-purple" style="margin:30px 0;">下方盒子（margin-top: 30px）</div>
</div>
<div class="bfc-label">✅ 用一个 BFC 父级包裹下方盒子：间距变成 60px（不再折叠）</div>
<div class="bfc-stage bfc-yel">
  <div class="bfc-box bfc-orange" style="margin:30px 0;">上方盒子（margin-bottom: 30px）</div>
  <div style="overflow:hidden;">
    <div class="bfc-box bfc-purple" style="margin:30px 0;">下方盒子（被 BFC 包裹，margin 隔离）</div>
  </div>
</div>

</div>

---

## Q: 谈谈你对盒子模型的理解？

**A:**

一个盒子由四个部分组成：`content`、`padding`、`border`、`margin`。通过 `box-sizing` 切换两种模型：

| 模型 | `box-sizing` 值 | 元素宽度计算 |
|------|----------------|------------|
| **W3C 标准盒模型** | `content-box`（默认） | `width = content` |
| **IE 怪异盒模型** | `border-box` | `width = content + padding + border` |
| 继承父元素 | `inherit` | — |

```css
* { box-sizing: border-box; } /* 项目常用全局设置，避免 padding 撑开元素 */
```

> 💡 现代 CSS Reset / 项目脚手架（如 Tailwind）默认会把所有元素设为 `border-box`。

---

## Q: 元素居中有哪些方案？

**A:**

### 方案一：Flex 布局（✅ 最推荐）

```css
.parent {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center;     /* 垂直居中 */
}
```

### 方案二：绝对定位 + transform（✅ 推荐，不需要知道子元素尺寸）

```css
.parent { position: relative; }
.child {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

### 方案三：Grid 布局

```css
.parent {
  display: grid;
  place-items: center; /* 等同于 align-items + justify-items */
}
```

### 方案四：绝对定位 + margin: auto（需要确定子元素尺寸）

```css
.parent { position: relative; }
.child {
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  margin: auto;
  width: 100px;
  height: 100px;
}
```

### 方案五：绝对定位 + 负 margin（需要确定子元素尺寸）

```css
.child {
  position: absolute;
  top: 50%; left: 50%;
  width: 100px; height: 100px;
  margin-top: -50px;
  margin-left: -50px;
}
```

### 方案对比

| 方案 | 是否需要知道子元素尺寸 | 兼容性 | 推荐度 |
|------|---------------------|-------|-------|
| Flex | ❌ 不需要 | ✅ 现代浏览器全支持 | ⭐⭐⭐⭐⭐ |
| 绝对定位 + transform | ❌ 不需要 | ✅ IE9+ | ⭐⭐⭐⭐ |
| Grid `place-items` | ❌ 不需要 | ✅ 现代浏览器 | ⭐⭐⭐⭐ |
| 绝对定位 + `margin:auto` | ✅ 需要 | ✅ 全兼容 | ⭐⭐⭐ |
| 绝对定位 + 负 margin | ✅ 需要 | ✅ 全兼容 | ⭐⭐ |

---

## Q: Flex 布局容器和子项属性分别如何设置？

**A:**

### 容器属性（父元素）

```css
.container {
  display: flex;
  flex-direction: row;         /* 主轴：row | row-reverse | column | column-reverse */
  flex-wrap: nowrap;           /* 换行：nowrap | wrap | wrap-reverse */
  justify-content: flex-start; /* 主轴对齐：flex-start | flex-end | center | space-between | space-around | space-evenly */
  align-items: stretch;        /* 交叉轴对齐（单行） */
  align-content: stretch;      /* 交叉轴对齐（多行） */
  gap: 16px;                   /* 子项间距 */
}

/* 简写 */
flex-flow: row nowrap;
```

### 子项属性

```css
.item {
  flex-grow: 0;     /* 放大比例，默认 0 */
  flex-shrink: 1;   /* 缩小比例，默认 1 */
  flex-basis: auto; /* 主轴初始尺寸 */
  flex: 0 1 auto;   /* 简写：grow shrink basis */
  align-self: auto; /* 单独覆盖父容器的 align-items */
  order: 0;         /* 排列顺序，数值越小越靠前 */
}
```

### 常见场景速查

```css
/* 水平垂直居中 */
.box { display: flex; justify-content: center; align-items: center; }

/* 左固定，右自适应 */
.sidebar { width: 200px; flex-shrink: 0; }
.main    { flex: 1; }

/* Sticky footer */
.layout  { display: flex; flex-direction: column; min-height: 100vh; }
.content { flex: 1; }
```

### justify-content 各值效果

| 值 | 效果 |
|----|------|
| `flex-start` | 靠主轴起点排列（默认） |
| `flex-end` | 靠主轴终点排列 |
| `center` | 居中 |
| `space-between` | 两端对齐，子项间均分间隔 |
| `space-around` | 每个子项两侧等距，端部距离是中间的一半 |
| `space-evenly` | 所有间距完全相等（包括两端） |

---

## Q: `flex: 1` 的含义是什么？

**A:**

`flex: 1` 是 `flex: 1 1 0%` 的简写：

- `flex-grow: 1` — 有剩余空间时**等比放大**
- `flex-shrink: 1` — 空间不足时**等比缩小**
- `flex-basis: 0%` — 初始尺寸为 **0**，从零开始分配空间

> ⚠️ **注意**：`flex: 1` 与 `flex: auto`（即 `flex: 1 1 auto`）的区别在于 `flex-basis`。`flex: 1` 忽略子项自身内容宽度，完全按比例分配；`flex: auto` 则先按内容分配，再分配剩余空间。

```css
.col { flex: 1; }      /* 三列等宽 */
.col-a { flex: 1; }    /* 1:2:1 比例 */
.col-b { flex: 2; }
.col-c { flex: 1; }
```

---

## Q: position 五种定位方式有什么区别？

**A:**

| 值 | 是否脱离文档流 | 参照物 | 特点 |
|----|-------------|-------|------|
| `static` | ❌ 不脱离 | 无（正常流） | 默认值，`top/left` 无效 |
| `relative` | ❌ 不脱离（保留占位） | 自身原始位置 | 原位置仍占据空间 |
| `absolute` | ✅ 脱离 | 最近的非 static 祖先 | 找不到则相对 `<html>` |
| `fixed` | ✅ 脱离 | 视口（viewport） | 不随页面滚动 |
| `sticky` | 介于两者之间 | 最近滚动容器 | 到达阈值前 relative，之后 fixed |

```css
/* 子绝父相：经典用法 */
.parent { position: relative; }
.child  { position: absolute; top: 0; right: 0; }

/* 固定按钮 */
.back-to-top { position: fixed; bottom: 20px; right: 20px; }

/* 表头吸顶 */
thead th { position: sticky; top: 0; background: white; z-index: 1; }
```

> ⚠️ **注意**：
> - `absolute` 找不到非 static 祖先时，相对 `<html>` 根元素定位
> - 若父元素有 `transform`、`filter`、`perspective`，`fixed` 会失效，改为相对该父元素定位
> - `sticky` 必须指定阈值（如 `top: 0`），且不能在 `overflow: hidden` 容器内

---

## Q: z-index 为什么会失效？什么是层叠上下文？

**A:**

### z-index 生效条件

`z-index` **只对定位元素**（`position` 不为 `static`）以及 Flex/Grid 子项生效，普通流元素设置无效。

### 层叠上下文（Stacking Context）

层叠上下文是 CSS 中的「隔离层」，形成层叠上下文的元素内部 z-index 与外部完全隔离。

**触发条件：**

| 条件 | 说明 |
|------|------|
| `position: relative/absolute/fixed/sticky` + `z-index` 不为 `auto` | 最常见 |
| `opacity` 值小于 1 | 半透明元素 |
| `transform` 不为 `none` | 含 translate / rotate 等 |
| `filter` 不为 `none` | 含 blur 等 |
| `will-change` 指定上述属性 | 提前声明 |
| `isolation: isolate` | 专门用于创建层叠上下文 |

### 层叠顺序（从低到高）

```
背景和边框 → 负 z-index → 块级元素 → 浮动元素 → 行内元素 → z-index:0/auto → 正 z-index
```

### z-index 失效的常见原因

```css
/* ❌ 无效：普通流元素 */
.box { z-index: 999; }
/* ✅ 有效 */
.box { position: relative; z-index: 999; }

/* ❌ 父元素创建层叠上下文，子元素被「隔离」 */
.parent { position: relative; z-index: 1; }
.child  { position: relative; z-index: 9999; } /* 再大也突破不了父级层叠 */

/* ❌ transform 导致 fixed 失效 */
.parent { transform: translateX(0); }
.child  { position: fixed; } /* 失效，改为相对 .parent 定位 */
```

---

## Q: 什么是回流与重绘？如何减少？

**A:**

| 概念 | 触发条件 | 性能消耗 |
|------|---------|---------|
| **回流（Reflow）** | DOM 元素的**布局或几何属性**改变（宽高、位置、内容、display） | 🔴 高（需重新计算布局） |
| **重绘（Repaint）** | 仅元素**样式属性**改变（颜色、背景、visibility） | 🟡 中（不涉及布局重算） |

> 📌 **回流必然引起重绘，重绘不一定引起回流**。

**优化措施：**

1. **避免频繁修改样式**：合并多次操作，或一次性设置 `cssText` / 切换 class
2. **使用 transform / opacity 替代位移**：走 GPU 合成层，不触发回流重绘
3. **离线操作 DOM**：先 `display: none` 或 `documentFragment` 批量改完再插入
4. **缓存布局值**：避免在循环中反复读取 `offsetWidth` / `getBoundingClientRect()`（会强制同步回流）
5. **减少 DOM 数量**：节点越少，计算量越小
6. **复杂动画用 `position: absolute / fixed`**：脱离文档流，回流范围只在自身

---

## Q: 隐藏元素的几种方式有什么区别？

**A:**

| 维度 | `display: none` | `visibility: hidden` | `opacity: 0` |
|------|----------------|----------------------|-------------|
| 是否占据空间 | ❌ 不占据 | ✅ 占据 | ✅ 占据 |
| 是否触发回流 | ✅ 触发 | ❌ 仅重绘 | ❌ 仅重绘（提升为合成层） |
| 是否响应事件 | ❌ 不响应 | ❌ 不响应 | ✅ 可点击 |
| 是否被子元素继承 | ❌ 非继承 | ✅ 继承（子可用 visible 覆盖） | ✅ 继承（子无法用 opacity:1 取消） |
| 是否支持 transition | ❌ 不支持 | ✅ 支持（瞬时切换显示，延时隐藏） | ✅ 完美支持 |
| 屏幕阅读器是否读取 | ❌ 不读取 | ✅ 读取 | ✅ 读取 |

**形象比喻：**

- `display: none` —— 从这个世界消失了，不存在了
- `visibility: hidden` —— 视觉和物理上都隐身了，看不见也摸不到，但还存在
- `opacity: 0` —— 视觉上隐身了，看不见，但可以触摸得到

---

## Q: CSS 样式优先级如何计算？

**A:**

**优先级权重（A, B, C, D 四位系统）：**

| 选择器 | 权重 |
|-------|------|
| 内联样式 `style=""` | `1 0 0 0` |
| ID 选择器 `#id` | `0 1 0 0` |
| 类 / 属性 / 伪类 `.cls` `[attr]` `:hover` | `0 0 1 0` |
| 标签 / 伪元素 `div` `::before` | `0 0 0 1` |
| 通配符 / 后代 / 子代 `*` `>` ` ` `+` `~` | `0` |
| `!important` | 最高（覆盖一切） |

```css
/* 计算示例：0,2,1,1 */
#main #content .post p { ... }
```

**比较规则**：先比 A 位，A 相同再比 B 位，依次比下去。**优先级不会进位**（10 个类选择器也不会等于 1 个 ID）。

**可继承属性：**

- 字体系列（`font-family`、`font-size` 等）
- 文本系列（`color`、`line-height`、`text-align` 等）
- 元素可见性（`visibility`）
- 列表属性（`list-style`）
- 光标 `cursor`

---

## Q: 如何实现单行 / 多行文本溢出省略？

**A:**

### 单行省略

```css
.single {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
```

### 多行省略（基于 WebKit，移动端兼容性好）

```css
.multi {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;  /* 限制行数 */
  overflow: hidden;
  text-overflow: ellipsis;
}
```

### 通用兼容方案（伪元素模拟）

```css
.multi-fallback {
  position: relative;
  line-height: 1.5em;
  max-height: 3em;        /* 行高 × 行数 */
  overflow: hidden;
}
.multi-fallback::after {
  content: '...';
  position: absolute;
  right: 0;
  bottom: 0;
  padding: 0 4px;
  background: #fff;
}
```

> ⚠️ **注意**：`-webkit-line-clamp` 在非 WebKit 内核浏览器需要降级方案；现代主流浏览器（Chrome / Edge / Safari / 移动端）已广泛支持。

---

## Q: CSS 如何画一个三角形？有哪些方法？

**A:**

### 方法 1：border 不同颜色（最经典）

利用边框相接处呈 45° 切角的特性，将其他三边设为透明：

```css
/* 向下三角 */
.triangle-down {
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 50px 50px 0;
  border-color: #d9534f transparent transparent;
}

/* 空心三角（用 ::after 叠一个白色小三角） */
.triangle-hollow {
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 50px 50px;
  border-color: transparent transparent #d9534f;
  position: relative;
}
.triangle-hollow::after {
  content: '';
  position: absolute;
  top: 6px;
  left: -40px;
  border-style: solid;
  border-width: 0 40px 40px;
  border-color: transparent transparent #fff;
}
```

### 方法 2：Unicode 三角符号

最简单但不可自定义形状（只能改字色/字号）：

```html
<span style="font-size:100px; color:blue;">▼</span>
<!-- 可选：◄ ► ▼ ▲ ◀ ▶ ⊿ △ ▽ ▷ ◁ -->
```

### 方法 3：linear-gradient 线性渐变

```css
.triangle-linear {
  width: 120px;
  height: 100px;
  background: linear-gradient(to bottom right, blue 50%, transparent 50%);
}
```

### 方法 4：conic-gradient 锥形渐变

```css
.triangle-conic {
  width: 120px;
  height: 100px;
  background: conic-gradient(from 90deg at 0 0, blue 0 40deg, transparent 40.1deg);
}
```

### 方法 5：伪元素旋转

容器 `overflow:hidden`，内部用旋转的方块露出三角部分：

```css
.triangle-rotate {
  width: 120px;
  height: 100px;
  position: relative;
  overflow: hidden;
}
.triangle-rotate::after {
  content: '';
  position: absolute;
  inset: 0;
  background: blue;
  transform-origin: 0 0;
  transform: rotate(56deg);
}
```

### 方法 6：clip-path 裁剪（✅ 现代推荐）

最直观、可任意定义多边形顶点：

```css
.triangle-clip {
  width: 100px;
  height: 100px;
  background: blue;
  clip-path: polygon(0 0, 100% 0, 0 100%);
}
```

### 方案对比

| 方法 | 优点 | 缺点 |
|------|------|------|
| border | 兼容性最好 | 无法加阴影/渐变 |
| Unicode | 一行搞定 | 只能改字色字号 |
| linear-gradient | 灵活 | 锯齿较明显 |
| conic-gradient | 角度可控 | 兼容性稍弱 |
| 伪元素旋转 | 边缘清晰 | 计算角度麻烦 |
| **clip-path** | 任意形状、可加阴影 | IE 不支持 |

---

## Q: transition 过渡动画有哪些属性？

**A:**

`transition` 用于在元素**状态改变时**（如 hover、class 切换）平滑过渡 CSS 属性值。

```css
transition: property duration timing-function delay;
/* 简写 */
transition: all 0.3s ease-in-out 0s;
```

| 属性 | 说明 | 示例值 |
|------|------|-------|
| `transition-property` | 要过渡的属性，`all` 表示全部 | `width`, `opacity`, `all` |
| `transition-duration` | 持续时间 | `0.3s`, `300ms` |
| `transition-timing-function` | 缓动函数 | `ease` / `linear` / `ease-in-out` / `cubic-bezier()` |
| `transition-delay` | 延迟开始时间 | `0.2s` |

```css
.btn {
  background-color: blue;
  transform: scale(1);
  transition: background-color 0.3s ease, transform 0.2s ease;
}
.btn:hover {
  background-color: red;
  transform: scale(1.1);
}
```

> ⚠️ **注意**：`transition` 不支持 `display` 属性的过渡（`none ↔ block` 无法渐变），可用 `visibility + opacity` 替代实现渐隐效果。

---

## Q: transform 有哪些常用变形函数？

**A:**

`transform` 本身不是动画，而是**变形操作**，配合 `transition` 或 `animation` 才呈现动画效果。由于不会触发回流，**性能优于直接修改 `top/left/width`**。

| 函数 | 说明 | 示例 |
|------|------|------|
| `translate(x, y)` | 位移（不脱离文档流） | `translate(50px, 100px)` |
| `translateX(n)` / `translateY(n)` | 单轴位移 | `translateX(-50%)` 常用于居中 |
| `scale(x, y)` | 缩放 | `scale(1.5)` 放大1.5倍 |
| `rotate(deg)` | 旋转 | `rotate(45deg)` |
| `skew(x, y)` | 倾斜 | `skew(20deg, 10deg)` |
| `matrix(...)` | 矩阵变换（综合以上） | 较少直接使用 |

### 3D 变换

```css
.parent { perspective: 1000px; }       /* 开启3D空间 */

.card {
  transform: rotateY(180deg);          /* 绕Y轴翻转 */
  transform: translateZ(100px);        /* Z轴位移 */
  transform: rotate3d(1, 1, 0, 45deg);
}
```

### transform-origin

控制变形基准点，默认为元素中心 `50% 50%`：

```css
.rotate-corner {
  transform-origin: top left;  /* 以左上角为基准旋转 */
  transform: rotate(45deg);
}
```

---

## Q: animation 关键帧动画有哪 8 个属性？

**A:**

`animation` 配合 `@keyframes` 实现完全自定义、无需触发、可循环的动画。

### @keyframes 定义动画序列

```css
@keyframes slideIn {
  from {                        /* 等同 0% */
    transform: translateX(-100%);
    opacity: 0;
  }
  50% { opacity: 0.5; }
  to {                          /* 等同 100% */
    transform: translateX(0);
    opacity: 1;
  }
}
```

### 8 个属性详解

```css
.box {
  animation-name: slideIn;                /* 对应 @keyframes 名称 */
  animation-duration: 1s;                 /* 持续时间 */
  animation-timing-function: ease-in-out; /* 缓动 */
  animation-delay: 0.5s;                  /* 延迟 */
  animation-iteration-count: infinite;    /* 次数：数字 | infinite */
  animation-direction: alternate;         /* normal | reverse | alternate | alternate-reverse */
  animation-fill-mode: forwards;          /* none | forwards | backwards | both */
  animation-play-state: running;          /* running | paused */
}

/* 简写 */
animation: slideIn 1s ease-in-out 0.5s infinite alternate forwards;
```

| 属性 | 关键作用 |
|------|---------|
| `animation-direction: alternate` | 实现往返动画 |
| `animation-fill-mode: forwards` | 让动画停在最后一帧 |
| `animation-play-state` | JS 可控制暂停：`el.style.animationPlayState = 'paused'` |

---

## Q: transition 与 animation 的区别？

**A:**

| 对比维度 | `transition` | `animation` |
|---------|-------------|-------------|
| 触发方式 | 需要状态变化触发（hover、class 切换） | 自动执行，无需触发 |
| 关键帧 | 只有起止两个状态 | 可定义多个关键帧（`%` 控制） |
| 循环播放 | ❌ 不支持 | ✅ 支持（`infinite`） |
| 暂停控制 | ❌ 不支持 | ✅ `animation-play-state: paused` |
| 方向控制 | ❌ 不支持 | ✅ `animation-direction: alternate` |
| 适用场景 | 简单 hover、状态切换 | 复杂动画、自动播放、loading |

---

## Q: 常用 CSS 动画效果如何实现？

**A:**

```css
/* 1. 淡入淡出 */
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.fade-in { animation: fadeIn 0.5s ease forwards; }

/* 2. 骨架屏 Shimmer */
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

/* 3. 旋转 Loading */
@keyframes spin { to { transform: rotate(360deg); } }
.loader {
  width: 40px; height: 40px;
  border: 4px solid #eee;
  border-top-color: #3498db;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* 4. 弹跳 */
@keyframes bounce {
  0%, 100% { transform: translateY(0); animation-timing-function: ease-in; }
  50%      { transform: translateY(-30px); animation-timing-function: ease-out; }
}
.bounce { animation: bounce 0.8s infinite; }
```

---

## Q: CSS 动画如何做性能优化？

**A:**

### 核心原则：触发 GPU 合成层，避免回流重绘

**✅ 推荐使用（走合成层，不触发回流）：**
- `transform`（translate / scale / rotate）
- `opacity`
- `filter`

**❌ 避免使用（触发回流）：**
- `top` / `left` / `margin` / `width` / `height`

### will-change 提示浏览器

```css
.animated {
  will-change: transform, opacity;
}

/* 动画结束后还原，避免常驻 GPU 内存 */
.animated.done {
  will-change: auto;
}
```

> ⚠️ **注意**：`will-change` 不要滥用，会占用额外 GPU 内存，只在**确实有性能瓶颈**时使用。

### 动画 API 性能对比

| 方式 | 优点 | 缺点 |
|------|------|------|
| CSS animation | 自动走 GPU 合成层，性能最优 | 逻辑控制弱 |
| JS + `requestAnimationFrame` | 逻辑灵活，可精细控制 | 需手动优化性能 |
| JS + `setTimeout/setInterval` | ❌ 不推荐 | 不与屏幕刷新率同步，卡顿明显 |

---

## Q: 媒体查询与响应式布局有哪些方案？

**A:**

### 媒体查询语法

```css
@media [媒体类型] [and/not/only] (条件) {
  /* 样式规则 */
}

@media (max-width: 768px) { .nav { display: none; } }
@media (min-width: 769px) and (max-width: 1024px) { /* 平板 */ }
@media (min-width: 1025px) { /* PC */ }
```

### 移动端优先 vs PC 端优先

```css
/* ✅ 移动端优先：用 min-width 向上覆盖 */
.container { width: 100%; }
@media (min-width: 768px)  { .container { width: 750px; } }
@media (min-width: 1200px) { .container { width: 1170px; } }

/* PC 端优先：用 max-width 向下覆盖 */
.container { width: 1170px; }
@media (max-width: 1199px) { .container { width: 750px; } }
@media (max-width: 767px)  { .container { width: 100%; } }
```

### 常用断点（参考 Bootstrap）

| 断点 | 宽度区间 | 典型设备 |
|------|---------|--------|
| xs | `< 576px` | 手机竖屏 |
| sm | `≥ 576px` | 手机横屏 |
| md | `≥ 768px` | 平板 |
| lg | `≥ 992px` | 小屏 PC |
| xl | `≥ 1200px` | 大屏 PC |

### 其他响应式方案

```css
/* viewport 单位 */
.hero { height: 100vh; }
h1   { font-size: clamp(16px, 4vw, 32px); }

/* rem 相对根元素 */
html { font-size: 16px; }
.box { width: 20rem; /* = 320px */ }

/* clamp() 流式响应 */
.title { font-size: clamp(1rem, 2.5vw, 2rem); }
```

---

## Q: CSS 自定义属性（CSS 变量）有什么优势？

**A:**

### 基本语法

```css
:root {
  --primary-color: #3498db;
  --spacing-md: 16px;
}

.btn {
  background-color: var(--primary-color);
  padding: var(--spacing-md);
  font-size: var(--font-size, 14px); /* 第二个参数为兜底默认值 */
}
```

### 局部覆盖（遵循 DOM 继承）

```css
:root        { --color: blue; }
.dark-theme  { --color: white; }   /* 在深色主题下覆盖 */
.text        { color: var(--color); }
```

### JS 动态修改 → 实现主题切换

```css
:root            { --bg: #fff; --text: #333; }
[data-theme="dark"] { --bg: #1a1a1a; --text: #f0f0f0; }
body             { background: var(--bg); color: var(--text); }
```

```js
// 读取
const value = getComputedStyle(document.documentElement)
  .getPropertyValue('--primary-color').trim();

// 修改 / 切换主题
document.documentElement.style.setProperty('--primary-color', '#e74c3c');
document.documentElement.setAttribute('data-theme', 'dark');
```

### CSS 变量 vs Sass/Less 变量

| 对比 | CSS 变量 | Sass/Less 变量 |
|------|---------|--------------|
| 作用域 | 动态，遵循 DOM 层级 | 静态，编译时确定 |
| 运行时修改 | ✅ 可以（JS 修改） | ❌ 不能（编译期） |
| 浏览器支持 | IE11 不支持 | 编译后全支持 |
| 继承 | ✅ 随 DOM 继承 | ❌ 不继承 |

---

## Q: 伪类与伪元素的区别？常见有哪些？

**A:**

### 核心区别

| 维度 | 伪类 `:` | 伪元素 `::` |
|------|---------|-----------|
| 语法 | 单冒号 `:` | 双冒号 `::` |
| 作用 | 描述元素**已存在的特定状态** | 创建 DOM 中**不存在的虚拟元素** |
| DOM 中是否存在 | ✅ 元素真实存在 | ❌ 不存在 DOM 中 |
| 示例 | `:hover` / `:nth-child()` | `::before` / `::after` |

### 常见伪类

```css
/* 状态类 */
a:hover   { color: red; }
a:active  { color: blue; }
a:visited { color: purple; }
input:focus    { outline: 2px solid blue; }
input:disabled { opacity: 0.5; }
input:checked  { /* 复选框选中 */ }

/* 结构类 */
li:first-child       { font-weight: bold; }
li:last-child        { margin-bottom: 0; }
li:nth-child(2n)     { background: #f5f5f5; }
li:nth-child(2n+1)   { background: white; }
li:nth-child(-n+3)   { color: red; }       /* 前 3 个 */
li:nth-last-child(-n+3) { color: blue; }   /* 后 3 个 */
p:not(.special)      { color: gray; }
```

### 常见伪元素

```css
.btn::before { content: '→ '; }

.clearfix::after {
  content: '';
  display: block;
  clear: both;
}

input::placeholder { color: #aaa; }
::selection        { background: #3498db; color: white; }
p::first-letter    { font-size: 2em; float: left; }
p::first-line      { font-weight: bold; }
```

---

## Q: CSS 浮动是什么？如何清除？

**A:**

### 浮动是什么

`float` 最初设计用于**文字环绕图片**，后被广泛用于布局。设置 `float` 的元素**脱离正常文档流**，向左或向右浮动直到遇到父容器边界或另一个浮动元素。

### 浮动带来的问题

1. **父元素高度塌陷**（最常见，子元素脱离流，父元素感知不到高度）
2. **影响后续兄弟块级元素**（占据浮动元素原本的位置）
3. **行内元素围绕浮动元素排列**（文字环绕效果）

### 清除浮动的方法

#### 方法一：clearfix 伪元素（✅ 最主流）

```css
.clearfix::after {
  content: '';
  display: block;
  clear: both;
  height: 0;
  visibility: hidden;
}
```

#### 方法二：触发 BFC（✅ 推荐）

```css
.parent {
  overflow: hidden;   /* 最常用，但会裁剪溢出 */
  /* 或 */
  display: flow-root; /* CSS3 专设，无副作用 */
}
```

#### 方法三：父元素固定高度（❌ 不推荐）

内容动态时不可控。

#### 方法四：末尾空标签 `<div style="clear:both"></div>`（❌ 不推荐）

语义差。

### clear 属性

| 值 | 说明 |
|----|------|
| `left` | 左侧不允许浮动元素 |
| `right` | 右侧不允许浮动元素 |
| `both` | 两侧都不允许（最常用） |
| `none` | 默认 |

---

## Q: Sass 和 Less 有什么区别？

**A:**

| 对比维度 | Sass / SCSS | Less |
|---------|-------------|------|
| 语法 | SCSS（类 CSS）+ Sass（缩进语法） | 类 CSS，学习成本更低 |
| 编译环境 | Ruby（早期）/ Node.js（Dart Sass） | Node.js |
| 功能丰富度 | ✅ 更强（控制指令、自定义函数完整） | 较基础 |
| 社区活跃度 | ✅ 更活跃（Bootstrap 5、Vue3 默认） | Bootstrap 3 / 4、Ant Design 使用 |
| 与 CSS 兼容 | SCSS 语法完全兼容 CSS | 语法更接近 CSS |
| 变量前缀 | `$primary` | `@primary` |

> 💡 **推荐选择 SCSS**：功能更完整，生态更好，大多数现代项目使用。

---

## Q: Sass 中常用的函数和指令有哪些？

**A:**

### 颜色函数

```scss
$color: #3498db;
.light { color: lighten($color, 20%); }
.dark  { color: darken($color, 20%); }
.mix   { color: mix(#ff0000, #0000ff, 50%); }
.alpha { background: rgba($color, 0.5); }
```

### 数学 / 字符串函数

```scss
.half { width: percentage(1/2); }   // 50%
$size: round(3.7px);                // 4px
$max:  max(10px, 20px, 30px);       // 30px
unquote("Arial");                   // Arial（去引号）
to-upper-case("hello");             // "HELLO"
```

### 控制指令（Sass 独有，Less 较弱）

```scss
// @each 遍历
@each $color in red, green, blue {
  .text-#{$color} { color: $color; }
}

// @for 循环
@for $i from 1 through 5 {
  .col-#{$i} { width: 20% * $i; }
}

// @if 条件
@mixin theme($mode) {
  @if $mode == dark { background: #333; color: #fff; }
  @else            { background: #fff; color: #333; }
}
```

### Mixin vs Function

```scss
// mixin：生成 CSS 代码块
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}
.container { @include flex-center; }

// function：返回一个值
@function rem($px, $base: 16px) {
  @return $px / $base * 1rem;
}
.title { font-size: rem(24px); } // 1.5rem
```

---

## Q: Less 有哪些常用语法？

**A:**

### 变量与混入

```less
@primary-color: #3498db;
@font-size: 16px;

.flex-center() {
  display: flex;
  justify-content: center;
  align-items: center;
}

.container { .flex-center(); }

// 带参数 Mixin
.border-radius(@r: 4px) {
  -webkit-border-radius: @r;
  border-radius: @r;
}
.btn { .border-radius(8px); }
```

### 颜色函数

```less
@primary: #3498db;
.light  { color: lighten(@primary, 20%); }
.dark   { color: darken(@primary, 20%); }
.faded  { color: fade(@primary, 50%); }
.rotate { color: spin(@primary, 30); }   // 色相旋转 30°
```

### & 引用父选择器（与 Sass 一致）

```less
.button {
  color: blue;
  &:hover     { color: darkblue; }     /* .button:hover */
  &-primary   { background: blue; }    /* .button-primary（BEM） */
  .disabled & { opacity: 0.5; }        /* .disabled .button */
}
```

### 命名空间（Less 独有）

```less
#utils() {
  .clearfix() {
    &::after { content: ''; display: block; clear: both; }
  }
}
.container { #utils.clearfix(); }
```

---

## Q: 如何选择前 N 个或后 N 个元素？

**A:**

```css
/* 前 20 个 li */
ul li:nth-child(-n+20) { background: yellow; }

/* 后 20 个 li */
ul li:nth-last-child(-n+20) { background: yellow; }

/* 前 20 个特定类型的 div（跳过其他类型兄弟节点） */
div:nth-of-type(-n+20) { background: yellow; }
```

**`-n+20` 含义**：`n` 取 0,1,2,...，公式结果为 20,19,18,...,1，即匹配前 20 个。当 `n ≥ 20` 时结果 ≤ 0，超出有效范围，停止匹配。

---

## Q: CSS 中常见的符号都有什么含义？

**A:**

| 符号 | 含义 | 示例 |
|------|------|------|
| `>` | 直接子元素 | `ul > li` |
| `+` | 紧邻的下一个兄弟元素 | `h1 + p` |
| `~` | 后面所有兄弟元素 | `h1 ~ p` |
| ` `（空格） | 后代元素 | `div span` |
| `,` | 群组选择器 | `div, p` |
| `*` | 通配符 | `* { margin: 0 }` |
| `&` | Sass/Less 父选择器引用 | `&:hover` |
| `:` | 伪类 | `:hover` / `:nth-child()` |
| `::` | 伪元素 | `::before` / `::after` |
| `#` | ID 选择器 | `#main` |
| `.` | 类选择器 | `.btn` |
| `[attr]` | 属性选择器 | `input[type="text"]` |
| `[attr=value]` | 属性值精确匹配 | `a[href="#top"]` |

---

## Q: DOCTYPE 声明的作用是什么？

**A:**

`<!DOCTYPE html>` 声明文档类型，告诉浏览器使用哪种规范解析文档。

- **`<!DOCTYPE html>`**（HTML5）：触发**标准模式**（Standards Mode）
- **缺失或非法 DOCTYPE**：触发**怪异模式**（Quirks Mode），盒模型变为 IE 怪异盒模型，CSS 行为兼容老 IE

> 📌 DOCTYPE 必须放在文档**第一行**，否则可能仍触发怪异模式。
