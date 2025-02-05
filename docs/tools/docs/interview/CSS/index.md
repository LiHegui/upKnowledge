# CSS面试题

## 说说你对盒子模型的理解?

二者就行切换 box-sizing: content-box(标准)|border-box(怪异盒子)|inherit(父元素继承)

- 盒子模型
    - 宽度 content + padding + border
- IE盒子模型
    - 宽度 content

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
## 介绍盒模型
盒子模型
content + padding + border + margin
标准盒子模型宽度为content
IE怪异盒子模型宽度为 content + padding + border
二者之间的转换：
在使用 CSS 时，可以通过 box-sizing 属性来改变盒模型的解释方式，可以选择 content-box（W3C 盒模型）或 border-box
## DOCTYPE声明
声明文档类型（DOCTYPE）可以告诉浏览器使用哪种 HTML 或 XHTML 规范解析文档

## CSS优先级
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

## 谈谈你对BFC的理解？
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

<a href="./triangle.html">demo</a>
