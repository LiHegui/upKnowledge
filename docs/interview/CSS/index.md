# CSS面试题

## 说说你对盒子模型的理解?

一个盒子由四个部分组成：content、padding、border、margin

切换方式 box-sizing: content-box(标准)|border-box(怪异盒子)|inherit(父元素继承)

- 标准盒子模型
    - 宽度 = content
- IE怪异盒子模型
    - 宽度 =  content + padding + border

## 回流与重绘

- 回流
  是指当 DOM 元素的布局或几何属性发生改变时，浏览器需要重新计算元素的大小和位置，然后重新排列页面上受影响的元素的过程。这个过程是非常消耗性能的，因为它会触发多次的计算和布局，可能会导致页面的卡顿和响应延迟。
- 重绘
  是指当 DOM 元素的样式属性发生改变时，浏览器需要重新绘制元素的外观，但不会影响元素的布局和位置。这个过程比回流消耗的性能要少一些，但仍然需要一定的计算和绘制。
- 措施
    - 避免在布局完成后修改元素的样式，因为这会触发回流和重绘。
    - 将需要多次访问的 DOM 元素缓存起来，避免重复的计算和布局。
    - 使用 CSS3 的 transform 属性来代替修改元素的位置和大小，因为这不会触发回流。
    - 合并多次修改样式的操作，避免多次触发回流和重绘。
    - 尽可能减少页面中的 DOM 元素数量，因为更少的元素意味着更少的计算和布局。


## DOCTYPE声明
声明文档类型（DOCTYPE）可以告诉浏览器使用哪种 HTML 或 XHTML 规范解析文档

## <span style="color:red;">CSS样式优先级</span>
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

在CSS中，每个选择器的优先级是相互独立的，不会因为多个相同类型的选择器而产生进位。每个类选择器都有一个固定的权重，即10。因此，无论您在同一个元素上使用多少个相同的类选择器，它们的总权重仍然是10。

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
## 元素水平垂直居中？
- 定位
- margin
    上面加上transform,或者自己搭配目的就是自身元素左上角在中间，然后就行自身偏移。
- flex
## css动画
详细例子见animation.html
- transition
    实现渐变动画
- transform
    转变动画
- animation
    - @keyframes 关键字定义动画0
      - from 开始状态
      - [number]% 中间状态
      - to 终结状态
    - 关键属性
      - 
    实现自定义动画,可以定义一个动画的关键帧（即动画的起始状态、中间状态和结束状态），以及动画的持续时间、重复次数、延迟时间和动画效果等参数。
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