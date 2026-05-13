# CSS面试题

## <h1 style="color: #1b73e5;">说说你对盒子模型的理解?</h1>

一个盒子由四个部分组成：`content、padding、border、margin`

切换方式 `box-sizing: content-box(标准)|border-box(怪异盒子)|inherit(父元素继承)`

- 标准盒子模型
    - 宽度 = `content`
- IE怪异盒子模型
    - 宽度 =  `content` + `padding` + `border`

## <h1 style="color: #1b73e5;">回流与重绘</h1>

- 回流
  是指当 `DOM` 元素的布局或几何属性发生改变时，浏览器需要重新计算元素的大小和位置，然后重新排列页面上受影响的元素的过程。这个过程是非常消耗性能的，因为它会触发多次的计算和布局，可能会导致页面的卡顿和响应延迟。
- 重绘
  是指当 `DOM` 元素的样式属性发生改变时，浏览器需要重新绘制元素的外观，但不会影响元素的布局和位置。这个过程比回流消耗的性能要少一些，但仍然需要一定的计算和绘制。
- 措施
    - 避免在布局完成后修改元素的样式，因为这会触发回流和重绘。
    - 将需要多次访问的 `DOM` 元素缓存起来，避免重复的计算和布局。
    - 使用 `CSS3` 的 `transform` 属性来代替修改元素的位置和大小，因为这不会触发回流。
    - 合并多次修改样式的操作，避免多次触发回流和重绘。
    - 尽可能减少页面中的 `DOM` 元素数量，因为更少的元素意味着更少的计算和布局。

## <h1 style="color: #1b73e5;">DOCTYPE声明</h1>

声明文档类型（DOCTYPE）可以告诉浏览器使用哪种 HTML 或 XHTML 规范解析文档

## <h1 style="color: #1b73e5;">CSS样式优先级</h1>

- 内联样式
    1 0 0 0
- id选择器
    0 1 0 0
- 类选择器、属性选择器、伪类选择器
    className、 a[ref='eee']、li:last-child
    0 0 1 0
- 标签选择器、伪元素选择器
    0 0 0 1
- 后代选择器
    #div span 选择id为box元素内部所有的div元素
    0
- 子选择器
    #div>span => 选择以父元素div的子元素span,一层
    0
- 相邻同胞选择器
    h1+p
    #div + #span => 选择紧跟在div后面的span元素
    0
- 群组选择器
    div,p =>选择div、p的所有元素

继承属性
- 字体系列属性
- 文本系列属性
- 元素可见性
- 表格布局属性
- 列表属性
- 光标属性

**延申一：css优先级会产生满10进位吗**

不会的

在 CSS 优先级（Specificity）的计算中，不会产生进位。优先级权重是一个四位的独立系统（A, B, C, D），每一位的取值范围是独立的，不会因为某一位的值超过某个阈值而影响其他位

CSS优先级是通过计算选择器的权重来确定的，并且如果优先级相同，则后面的规则将覆盖前面的规则。这种进位机制确保了选择器的顺序在决定样式应用方面的重要性。

## <span style="color:red;">谈谈你对BFC的理解？</span>

块级格式化上下文，它是页面中一块渲染区域，并且有一套属于自己的渲染规则：
- 内部盒子会在垂直方向上一个接一个的放置，与方向无关。
- BFC就是一个独立的隔离的独立容器，不会影响盒子之外的布局
- 内部的浮动元素也参与高度计算
- BFC的区域不会与float元素产生重叠

## 触发条件

- 浮动元素 float
- display inline-block flex inline-flex grid table
- position absolute fixed

## 应用场景

- 防止margin重叠
- 清除内部浮动
- 自适应多栏布局

# 如何实现单行／多行文本溢出的省略样式？
## 单行省略
```css
div{
  
}
```
## 如何实现多行省略？
见ellipsis.html
- 单行
    ```css
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis; 
    ```
- 多行
    这个可能有兼容性的问题
    ```css
    -webkit-line-clamp: 2;
    display: -webkit-box;
    -webkit-box-orient: vertical;   
    white-space: nowrap;
    text-overflow: ellipsis; 
    ```
## Q: 元素居中方案

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
  transform: translate(-50%, -50%); /* 向左上方偏移自身宽高的 50% */
}
```

### 方案三：绝对定位 + margin: auto（需要知道子元素尺寸）

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

### 方案四：Grid 布局

```css
.parent {
  display: grid;
  place-items: center; /* 等同于 align-items + justify-items */
}
```

### 方案五：绝对定位 + 负 margin（需要确定子元素尺寸）

```css
.parent { position: relative; }

.child {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  height: 100px;
  margin-top: -50px;  /* 高度的一半 */
  margin-left: -50px; /* 宽度的一半 */
}
```

### 方案对比

| 方案 | 是否需要知道子元素尺寸 | 兼容性 | 推荐度 |
|------|---------------------|-------|-------|
| Flex | ❌ 不需要 | ✅ 现代浏览器全支持 | ⭐⭐⭐⭐⭐ |
| 绝对定位 + transform | ❌ 不需要 | ✅ IE9+ | ⭐⭐⭐⭐ |
| Grid place-items | ❌ 不需要 | ✅ 现代浏览器 | ⭐⭐⭐⭐ |
| 绝对定位 + margin:auto | ✅ 需要 | ✅ 全兼容 | ⭐⭐⭐ |
| 绝对定位 + 负margin | ✅ 需要 | ✅ 全兼容 | ⭐⭐ |

---
## Q: CSS 浮动与清除

**A:**

### 浮动是什么

`float` 属性最初设计用于**文字环绕图片**，后来被广泛用于页面布局。设置了 `float` 的元素会**脱离正常文档流**，向左或向右浮动，直到遇到父容器边界或另一个浮动元素为止。

```css
.img { float: left; }
```

### 浮动带来的影响

**1. 父元素高度塌陷（最常见问题）**

子元素浮动后脱离文档流，父元素感知不到子元素高度，导致高度变为 0。

```html
<div class="parent">      <!-- 高度塌陷为 0 -->
  <div class="child" style="float:left;">浮动子元素</div>
</div>
```

**2. 影响后续兄弟元素布局**

浮动元素后面的**块级兄弟元素**会占据浮动元素原本的位置（文字/行内元素则绕行）。

**3. 影响行内元素排列**

行内元素（文字、`inline` 元素）会围绕浮动元素排列，形成文字环绕效果。

---

### 清除浮动的方法

#### 方法一：clearfix 伪元素（✅ 推荐，最主流）

不添加额外 DOM，用 CSS 伪元素在父容器尾部生成一个清除块：

```css
.clearfix::after {
  content: '';
  display: block;
  clear: both;
  height: 0;
  visibility: hidden;
}
/* 兼容 IE6/7（现代项目可忽略） */
.clearfix { *zoom: 1; }
```

```html
<div class="parent clearfix">
  <div class="child" style="float:left;">浮动子元素</div>
</div>
```

#### 方法二：触发 BFC（✅ 推荐）

BFC 容器会包裹内部的浮动元素，计算高度时将浮动元素纳入：

```css
.parent {
  overflow: hidden;   /* 触发 BFC，最常用 */
  /* 或 */
  display: flow-root; /* CSS3 专门用于触发 BFC，无副作用 */
}
```

> ⚠️ **注意**：`overflow: hidden` 会裁剪溢出内容；`display: flow-root` 是更干净的方案，但旧浏览器兼容性稍差。

#### 方法三：父元素固定高度（❌ 不推荐）

```css
.parent { height: 200px; }
```

内容动态变化时高度不可控，不适合生产环境。

#### 方法四：末尾空标签 clear（❌ 不推荐）

```html
<div class="parent">
  <div style="float:left;">浮动子元素</div>
  <div style="clear:both;"></div>  <!-- 空标签，语义差 -->
</div>
```

---

### clear 属性说明

`clear` 属性用于指定元素左侧/右侧不允许有浮动元素：

| 值 | 说明 |
|----|------|
| `left` | 左侧不允许浮动元素 |
| `right` | 右侧不允许浮动元素 |
| `both` | 两侧都不允许，最常用 |
| `none` | 默认，允许两侧浮动 |

---

### 方案对比总结

| 方案 | 优点 | 缺点 |
|------|------|------|
| `clearfix::after` | 无副作用，语义清晰 | 需要额外 class |
| `overflow: hidden` | 一行代码，简洁 | 会裁剪溢出内容 |
| `display: flow-root` | 专为此场景设计，无副作用 | IE 不支持 |
| 固定高度 | 简单 | 不灵活，动态内容失效 |
| 空标签 | 兼容性好 | 增加无意义 DOM，语义差 |

---

## CSS 动画篇

## Q: 动画实现方式各自适用场景是什么？

**A:**

CSS 动画主要有三种实现方式：

| 方式 | 触发方式 | 控制能力 | 适用场景 |
|------|---------|---------|---------|
| `transition` | 状态变化触发（hover/class切换） | 弱，只能定义起止状态 | 简单的状态切换动效 |
| `transform` | 配合 transition/animation 使用 | 变形操作 | 位移、旋转、缩放、倾斜 |
| `animation` + `@keyframes` | 自动播放，可循环 | 强，可定义多个关键帧 | 复杂、自动播放的动画 |

---

## Q: transition 过渡动画有哪些属性？

**A:**

`transition` 用于在元素**状态改变时**（如 hover、class 切换）平滑地过渡 CSS 属性值。

### 语法

```css
transition: property duration timing-function delay;
/* 简写示例 */
transition: all 0.3s ease-in-out 0s;
```

### 属性详解

| 属性 | 说明 | 示例值 |
|------|------|-------|
| `transition-property` | 指定要过渡的 CSS 属性，`all` 表示全部 | `width`, `opacity`, `all` |
| `transition-duration` | 过渡持续时间 | `0.3s`, `300ms` |
| `transition-timing-function` | 缓动函数，控制速度曲线 | `ease`、`linear`、`ease-in-out`、`cubic-bezier()` |
| `transition-delay` | 延迟多久后开始过渡 | `0.2s` |

### 代码示例

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

### 注意事项

> ⚠️ **注意**：`transition` 不支持 `display` 属性的过渡（`none` → `block` 无法渐变）。可以用 `visibility` 或 `opacity` 替代实现渐隐效果。

---

## Q: transform 变形函数

**A:**

`transform` 本身不是动画，而是**变形操作**，配合 `transition` 或 `animation` 才能呈现动画效果。由于 `transform` 不会触发回流，**性能优于直接修改 `top/left/width`**。

### 常用函数

| 函数 | 说明 | 示例 |
|------|------|------|
| `translate(x, y)` | 位移（不脱离文档流） | `translate(50px, 100px)` |
| `translateX(n)` / `translateY(n)` | 单轴位移 | `translateX(-50%)` 常用于居中 |
| `scale(x, y)` | 缩放 | `scale(1.5)` 放大1.5倍 |
| `rotate(deg)` | 旋转 | `rotate(45deg)` |
| `skew(x, y)` | 倾斜 | `skew(20deg, 10deg)` |
| `matrix(...)` | 矩阵变换，综合以上所有 | 较少直接使用 |

### 3D 变换

```css
/* 开启3D空间 */
.parent { perspective: 1000px; }

.card {
  transform: rotateY(180deg);    /* 绕Y轴翻转 */
  transform: translateZ(100px);  /* 在Z轴方向移动 */
  transform: rotate3d(1, 1, 0, 45deg);
}
```

### transform-origin

`transform-origin` 控制变形的基准点，默认是元素中心 `50% 50%`：

```css
.rotate-corner {
  transform-origin: top left;  /* 以左上角为基准旋转 */
  transform: rotate(45deg);
}
```

---

## Q: animation 关键帧动画8 个属性分别是什么？

**A:**

`animation` 配合 `@keyframes` 可以实现完全自定义的动画，无需用户交互触发，支持循环播放。

### @keyframes 定义动画序列

```css
@keyframes slideIn {
  from {                        /* 等同于 0% */
    transform: translateX(-100%);
    opacity: 0;
  }
  50% {                         /* 中间某个时间点 */
    opacity: 0.5;
  }
  to {                          /* 等同于 100% */
    transform: translateX(0);
    opacity: 1;
  }
}
```

### animation 8 个属性详解

```css
.box {
  animation-name: slideIn;              /* 对应 @keyframes 名称 */
  animation-duration: 1s;              /* 一次动画持续时间 */
  animation-timing-function: ease-in-out; /* 缓动函数 */
  animation-delay: 0.5s;               /* 延迟开始时间 */
  animation-iteration-count: infinite; /* 播放次数：数字 或 infinite */
  animation-direction: alternate;      /* 方向：normal / reverse / alternate / alternate-reverse */
  animation-fill-mode: forwards;       /* 结束后状态：none / forwards / backwards / both */
  animation-play-state: running;       /* 播放状态：running / paused */
}
```

| 属性 | 常用值 | 说明 |
|------|-------|------|
| `animation-direction` | `normal` / `alternate` | `alternate` 实现往返动画 |
| `animation-fill-mode` | `forwards` / `backwards` / `both` | `forwards` 让动画停在最后一帧 |
| `animation-play-state` | `running` / `paused` | JS 控制暂停：`el.style.animationPlayState = 'paused'` |

### 简写语法

```css
/* name duration timing-function delay iteration-count direction fill-mode */
animation: slideIn 1s ease-in-out 0.5s infinite alternate forwards;

/* 多个动画用逗号分隔 */
animation: fadeIn 0.5s ease, slideUp 0.8s ease 0.3s;
```

---

## Q: transition vs animation

**A:**

| 对比维度 | `transition` | `animation` |
|---------|-------------|-------------|
| 触发方式 | 需要状态变化触发（hover、class 切换） | 自动执行，无需触发 |
| 关键帧 | 只有起止两个状态 | 可定义多个关键帧（`%` 控制） |
| 循环播放 | ❌ 不支持 | ✅ 支持（`infinite`） |
| 暂停控制 | ❌ 不支持 | ✅ `animation-play-state: paused` |
| 方向控制 | ❌ 不支持 | ✅ `animation-direction: alternate` |
| JS 控制 | 依赖状态切换 | 可直接操控 `animationPlayState` |
| 适用场景 | 简单 hover 效果、状态切换 | 复杂动画、自动播放、loading |

---

## Q: CSS 动画效果实现

**A:**

### 1. 淡入淡出

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.fade-in {
  animation: fadeIn 0.5s ease forwards;
}
```

### 2. 骨架屏加载（Shimmer）

```css
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}

.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

### 3. 旋转 Loading

```css
@keyframes spin {
  to { transform: rotate(360deg); }
}

.loader {
  width: 40px;
  height: 40px;
  border: 4px solid #eee;
  border-top-color: #3498db;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
```

### 4. 弹跳效果

```css
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
    animation-timing-function: ease-in;
  }
  50% {
    transform: translateY(-30px);
    animation-timing-function: ease-out;
  }
}

.bounce {
  animation: bounce 0.8s infinite;
}
```

---

## Q: CSS 动画性能优化

**A:**

### 核心原则：触发 GPU 合成层，避免回流重绘

**✅ 推荐使用（不触发回流）：**
- `transform`（translate / scale / rotate）
- `opacity`
- `filter`

**❌ 避免使用（触发回流）：**
- `top` / `left` / `margin` / `width` / `height`

### will-change 提示浏览器

```css
/* 提前告知浏览器该元素会发生哪种变化，让其提前优化 */
.animated {
  will-change: transform, opacity;
}

/* 动画结束后移除，避免常驻内存占用 */
.animated.done {
  will-change: auto;
}
```

> ⚠️ **注意**：`will-change` 不要滥用，它会占用额外 GPU 内存。只在**确实有性能瓶颈**的元素上使用，且动画结束后及时还原为 `auto`。

### requestAnimationFrame vs CSS 动画

| 方式 | 优点 | 缺点 |
|------|------|------|
| CSS animation | 自动走 GPU 合成层，性能最优 | 逻辑控制弱 |
| JS + `requestAnimationFrame` | 逻辑灵活，可精细控制 | 需手动优化性能 |
| JS + `setTimeout/setInterval` | ❌ 不推荐 | 不与屏幕刷新率同步，卡顿明显 |

### 减少动画层数

合成层虽然性能好，但**层数过多会占用大量 GPU 内存**，导致页面整体变慢。通过 Chrome DevTools → Layers 面板可以查看当前页面的合成层情况。

---
## CSS如何画一个三角形？原理是什么？
见triangle
```javascript
<a href="./triangle.html">demo</a>
```
## css几种隐藏元素的方式的区别

`display: none`

DOM 结构：浏览器不会渲染 display 属性为 none 的元素，会让元素完全从渲染树中消失，渲染的时候不占据任何空间；
事件监听：无法进行 DOM 事件监听，不能点击；
性能：修改元素会造成文档回流（reflow 与 repaint）,读屏器不会读取display: none元素内容，性能消耗较大；
继承：是非继承属性，由于元素从渲染树消失，造成子孙节点消失，即使修改子孙节点属性子孙节点也无法显示，毕竟子类也不会被渲染；
场景：显示出原来这里不存在的结构；
transition：transition 不支持 display。

`visibility: hidden`

DOM 结构：不会让元素从渲染树消失，渲染元素继续占据空间，只是内容不可见；
事件监听：无法进行 DOM 事件监听，不能点击；
性能：修改元素只会造成本元素的重绘（repaint），是重回操作，比回流操作性能高一些，性能消耗较少；读屏器读取visibility: hidden元素内容；
继承：是继承属性，子孙节点消失是由于继承了visibility: hidden，子元素可以通过设置 visibility: visible 来取消隐藏；
场景：显示不会导致页面结构发生变动，不会撑开；
transition：transition 支持 visibility，visibility 会立即显示，隐藏时会延时。

`opacity: 0`

DOM 结构：透明度为 100%，不会让元素从渲染树消失，渲染元素继续占据空间，只是内容不可见；
事件监听：可以进行 DOM 事件监听，可以点击；
性能：提升为合成层，是重建图层，不和动画属性一起则不会产生repaint（不脱离文档流，不会触发重绘），性能消耗较少；
继承：会被子元素继承，且子元素并不能通过 opacity: 1 来取消隐藏；
场景：可以跟transition搭配；
transition：transition 支持 opacity，opacity 可以延时显示和隐藏。
display: none： 从这个世界消失了, 不存在了；
opacity: 0： 视觉上隐身了, 看不见, 可以触摸得到；
visibility: hidden： 视觉和物理上都隐身了, 看不见也摸不到, 但是存在的；

## css 如何获取前20个元素

1. :nth-child()选择器允许你基于元素的父元素中的位置选择元素
选择前20个元素
```css
ul li:nth-child(-n+20) {  
    background-color: yellow;  
}
```
2. :nth-last-child()选择器允许你基于元素的父元素中的位置选择元素
选择后20个元素
```css
ul li:nth-last-child(-n+20) {
    background-color: yellow;
}
3. 如果你的元素不是连续的，或者你需要选择特定类型的元素，你可能需要使用更复杂的`:nth-child()`选择器。例如，如果你只想选择前20个`<div>`元素

```css
div:nth-of-type(-n+20) {  
    background-color: yellow;  
}
```

关于上述的 n 的范围的有效解释

n 的范围是 0 到 19，因为这是公式 -n + 20 能够有效匹配倒数第 20 个到倒数第 1 个元素的区间。
如果 n 超过 19，公式计算结果会小于或等于 0，超出了 CSS 选择器的有效范围。


## <h1 style="color: #1b73e5;">请列举CSS中常见的符号，并说明其含义</h1> 

- `>` 用于选择某个元素的直接子元素
- `+` 用于选择紧接在某个元素后的第一个兄弟元素。
- `~` 用于选择某个元素后的所有兄弟元素。
- `&` 是 Sass 或 Less 等 CSS 预处理器中的特殊符号，用于引用父选择器
- `空格` 用于选择某个元素的所有后代元素。
- `,` 用于选择多个选择器，将它们组合在一起。
- `*` 用于选择所有元素。
- `:` 用于选择伪类，例如 `:hover`、`:active`、`:focus` 等。
- `::` 用于选择伪元素，例如 `::before`、`::after` 等。
- `#` 用于选择具有特定 `ID` 的元素。
- `.` 用于选择具有特定类名的元素。
- `[attr]` 用于选择具有指定属性的元素。
- `[attr=value]` 用于选择具有指定属性和值的元素。

---

## Flex 布局篇

## Q: Flex 布局属性容器和子项分别如何设置？

**A:**

Flex 布局分为**容器属性**和**子项属性**两类。

### 容器属性（父元素）

```css
.container {
  display: flex;               /* 开启 flex 布局 */
  flex-direction: row;         /* 主轴方向：row(默认) | row-reverse | column | column-reverse */
  flex-wrap: nowrap;           /* 是否换行：nowrap(默认) | wrap | wrap-reverse */
  justify-content: flex-start; /* 主轴对齐：flex-start | flex-end | center | space-between | space-around | space-evenly */
  align-items: stretch;        /* 交叉轴对齐（单行）：stretch | flex-start | flex-end | center | baseline */
  align-content: stretch;      /* 交叉轴对齐（多行）：同上，仅在多行时生效 */
  gap: 16px;                   /* 子项间距，等同于 row-gap + column-gap */
}

/* 简写 */
flex-flow: row nowrap; /* flex-direction + flex-wrap */
```

### 子项属性（子元素）

```css
.item {
  flex-grow: 0;    /* 放大比例，0 表示不放大，默认 0 */
  flex-shrink: 1;  /* 缩小比例，1 表示等比缩小，默认 1 */
  flex-basis: auto;/* 主轴初始尺寸，默认 auto（取 width/height 值） */
  flex: 0 1 auto;  /* 简写：grow shrink basis */

  align-self: auto; /* 单独覆盖父容器的 align-items */
  order: 0;         /* 排列顺序，数值越小越靠前 */
}
```

### flex 简写规则

```css
flex: 1       /* 等同于 flex: 1 1 0% — 均匀占满剩余空间（最常用）*/
flex: auto    /* 等同于 flex: 1 1 auto */
flex: none    /* 等同于 flex: 0 0 auto — 不放大不缩小 */
flex: 0 1 200px /* grow shrink basis 完整写法 */
```

### 常见场景速查

```css
/* 水平垂直居中 */
.box { display: flex; justify-content: center; align-items: center; }

/* 左固定，右自适应（两栏布局） */
.sidebar { width: 200px; flex-shrink: 0; }
.main    { flex: 1; }

/* 底部固定（sticky footer） */
.layout  { display: flex; flex-direction: column; min-height: 100vh; }
.content { flex: 1; }
.footer  { /* 高度自适应 */ }
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

## Q: flex:1 含义解析

**A:**

`flex: 1` 是 `flex: 1 1 0%` 的简写，含义是：
- `flex-grow: 1` — 有剩余空间时**等比放大**
- `flex-shrink: 1` — 空间不足时**等比缩小**
- `flex-basis: 0%` — 初始尺寸为 **0**，从零开始分配空间

> ⚠️ **注意**：`flex: 1` 与 `flex: auto`（即 `flex: 1 1 auto`）的区别在于 `flex-basis`。`flex: 1` 忽略子项自身内容宽度，完全按比例分配；`flex: auto` 则先按内容分配，再分配剩余空间。

```css
/* 三列等宽布局 */
.col { flex: 1; }

/* 1:2:1 比例布局 */
.col-a { flex: 1; }
.col-b { flex: 2; }
.col-c { flex: 1; }
```

---

## position 定位篇

## Q: position 定位方式各自有什么区别？

**A:**

### 五种定位方式

| 值 | 是否脱离文档流 | 参照物 | 特点 |
|----|-------------|-------|------|
| `static` | ❌ 不脱离 | 无（正常流） | 默认值，`top/left` 无效 |
| `relative` | ❌ 不脱离（保留占位） | 自身原始位置 | 原位置仍占据空间 |
| `absolute` | ✅ 脱离 | 最近的非 static 祖先 | 找不到则相对 `<html>` |
| `fixed` | ✅ 脱离 | 视口（viewport） | 不随页面滚动 |
| `sticky` | 介于两者之间 | 最近滚动容器 | 到达阈值前 relative，之后 fixed |

### relative —— 相对自身偏移

```css
.box {
  position: relative;
  top: 10px;   /* 向下偏移 10px（原位置仍占据空间） */
  left: 20px;
}
```

### absolute —— 绝对定位

```css
/* 子绝父相：经典用法 */
.parent { position: relative; }

.child {
  position: absolute;
  top: 0;
  right: 0;  /* 贴右上角 */
}
```

> ⚠️ **注意**：`absolute` 会向上查找最近的 `position` 不为 `static` 的祖先元素，若全部都是 `static`，则相对于 `<html>` 根元素定位。

### fixed —— 固定在视口

```css
/* 固定在右下角的按钮 */
.back-to-top {
  position: fixed;
  bottom: 20px;
  right: 20px;
}
```

> ⚠️ **注意**：若父元素有 `transform`、`filter` 或 `perspective` 属性，`fixed` 会失效，改为相对该父元素定位。

### sticky —— 粘性定位

```css
/* 表头吸顶 */
thead th {
  position: sticky;
  top: 0;  /* 距顶部 0px 时固定，必须指定阈值 */
  background: white;
  z-index: 1;
}
```

`sticky` 在未到达阈值时表现为 `relative`，到达阈值后变为 `fixed`，**不脱离文档流，原位置仍保留**。

---

## z-index 与层叠上下文篇

## Q: z-index 失效原因什么是层叠上下文？

**A:**

### z-index 生效条件

`z-index` **只对定位元素**（`position` 不为 `static`）以及 Flex/Grid 子项生效，普通流元素设置 `z-index` 无效。

### 层叠上下文（Stacking Context）

层叠上下文是 CSS 中的 "隔离层"，形成层叠上下文的元素内部 z-index 与外部完全隔离。

**触发层叠上下文的条件：**

| 条件 | 说明 |
|------|------|
| `position: relative/absolute/fixed/sticky` + `z-index` 不为 `auto` | 最常见 |
| `opacity` 值小于 1 | 半透明元素 |
| `transform` 不为 `none` | 含 translate/rotate 等 |
| `filter` 不为 `none` | 含 blur 等 |
| `will-change` 指定上述属性 | 提前声明 |
| `isolation: isolate` | 专门用于创建层叠上下文 |

### 层叠顺序（从低到高）

```
背景和边框 → 负z-index → 块级元素 → 浮动元素 → 行内元素 → z-index:0/auto → 正z-index
```

### z-index 失效的常见原因

**1. 元素不是定位元素**
```css
/* ❌ 无效：普通流元素 */
.box { z-index: 999; }

/* ✅ 有效 */
.box { position: relative; z-index: 999; }
```

**2. 父元素创建了层叠上下文，子元素 z-index 被"隔离"**
```css
.parent { position: relative; z-index: 1; }  /* 创建了层叠上下文 */
.child  { position: relative; z-index: 9999; } /* 再大也被限制在父元素层叠上下文内 */
```

**3. `opacity < 1` 或 `transform` 导致 fixed 失效**
```css
/* fixed 子元素不再相对视口定位 */
.parent { transform: translateX(0); }
.child  { position: fixed; } /* 失效！改为相对 .parent 定位 */
```

---

## 伪类与伪元素篇

## Q: 伪类与伪元素常见的有哪些？

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
a:hover   { color: red; }    /* 悬停 */
a:active  { color: blue; }   /* 激活（点击中） */
a:visited { color: purple; } /* 已访问链接 */
input:focus { outline: 2px solid blue; } /* 聚焦 */
input:disabled { opacity: 0.5; }
input:checked  { /* 复选框选中 */ }

/* 结构类 */
li:first-child  { font-weight: bold; }  /* 第一个子元素 */
li:last-child   { margin-bottom: 0; }
li:nth-child(2n)    { background: #f5f5f5; } /* 偶数行 */
li:nth-child(2n+1)  { background: white; }   /* 奇数行 */
li:nth-child(-n+3)  { color: red; }          /* 前3个 */
p:not(.special) { color: gray; }  /* 排除某类 */
```

### 常见伪元素

```css
/* ::before / ::after — 最常用，必须有 content 属性 */
.btn::before {
  content: '→ ';
}

.clearfix::after {
  content: '';
  display: block;
  clear: both;
}

/* ::placeholder — 输入框占位符样式 */
input::placeholder { color: #aaa; }

/* ::selection — 文字选中样式 */
::selection { background: #3498db; color: white; }

/* ::first-line / ::first-letter */
p::first-letter { font-size: 2em; float: left; margin-right: 4px; }
p::first-line   { font-weight: bold; }
```

---

## 响应式布局篇

## Q: 媒体查询与响应式响应式布局有哪些方案？

**A:**

### 媒体查询语法

```css
/* 基本语法 */
@media [媒体类型] [and/not/only] (条件) {
  /* 样式规则 */
}

/* 常见示例 */
@media (max-width: 768px) {
  /* 小于 768px（移动端）时生效 */
  .nav { display: none; }
}

@media (min-width: 769px) and (max-width: 1024px) {
  /* 平板端 */
}

@media (min-width: 1025px) {
  /* PC 端 */
}
```

### 移动端优先 vs PC 端优先

```css
/* 移动端优先：默认写移动端样式，用 min-width 向上覆盖 ✅ 推荐 */
.container { width: 100%; }

@media (min-width: 768px)  { .container { width: 750px; } }
@media (min-width: 1200px) { .container { width: 1170px; } }

/* PC 端优先：默认写 PC 样式，用 max-width 向下覆盖 */
.container { width: 1170px; }

@media (max-width: 1199px) { .container { width: 750px; } }
@media (max-width: 767px)  { .container { width: 100%; } }
```

### 常用断点（参考Bootstrap）

| 断点名 | 宽度区间 | 典型设备 |
|-------|---------|--------|
| xs | `< 576px` | 手机竖屏 |
| sm | `≥ 576px` | 手机横屏 |
| md | `≥ 768px` | 平板 |
| lg | `≥ 992px` | 小屏 PC |
| xl | `≥ 1200px` | 大屏 PC |

### 其他响应式布局方案

**1. viewport 单位**

```css
/* vw/vh：视口宽/高的百分比（1vw = 视口宽度的 1%） */
.hero { height: 100vh; }             /* 全屏高度 */
h1   { font-size: clamp(16px, 4vw, 32px); } /* 自适应字号，有最小最大限制 */
```

**2. 相对单位 rem / em**

```css
/* rem：相对根元素 font-size（常用于移动端适配） */
html { font-size: 16px; }
.box { width: 20rem; /* = 320px */ }

/* em：相对父元素 font-size */
.parent { font-size: 16px; }
.child  { padding: 1em; /* = 16px */ }
```

**3. clamp() — 流式响应**

```css
/* clamp(最小值, 首选值, 最大值) */
.title {
  font-size: clamp(1rem, 2.5vw, 2rem);  /* 不小于1rem，不大于2rem，中间随视口变化 */
}
.container {
  width: clamp(300px, 80%, 1200px);
}
```

---

## CSS 变量篇

## Q: CSS 自定义属性有什么优势？

**A:**

### 基本语法

```css
/* 定义：变量名必须以 -- 开头，通常定义在 :root（全局作用域） */
:root {
  --primary-color: #3498db;
  --font-size-base: 16px;
  --spacing-md: 16px;
  --border-radius: 8px;
}

/* 使用：var() 函数，第二个参数为默认值 */
.btn {
  background-color: var(--primary-color);
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  font-size: var(--font-size-base, 14px); /* 14px 为兜底默认值 */
}
```

### 局部变量（覆盖作用域）

CSS 变量遵循**级联继承**，子元素会继承父元素的变量，也可在局部覆盖：

```css
:root { --color: blue; }

.dark-theme {
  --color: white;  /* 在深色主题下覆盖 */
}

.text { color: var(--color); } /* 在 .dark-theme 内自动用 white */
```

### JS 动态修改 CSS 变量

```js
// 读取
const value = getComputedStyle(document.documentElement)
  .getPropertyValue('--primary-color').trim();

// 修改（实现主题切换）
document.documentElement.style.setProperty('--primary-color', '#e74c3c');
```

### 实现主题切换

```css
:root { --bg: #fff; --text: #333; }

[data-theme="dark"] {
  --bg: #1a1a1a;
  --text: #f0f0f0;
}

body { background: var(--bg); color: var(--text); }
```

```js
// 切换主题
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
