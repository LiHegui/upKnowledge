# Sass 与 Less

## Q: Sass 和 Less 有什么区别？如何选择？

**A:**

| 对比维度 | Sass/SCSS | Less |
|---------|-----------|------|
| 语法 | SCSS（类 CSS）+ Sass（缩进语法）| 类 CSS，学习成本更低 |
| 编译环境 | Ruby（早期）/ Node.js（Dart Sass）| Node.js |
| 功能丰富度 | ✅ 更强（内置函数多、控制指令完整）| 较基础 |
| 社区活跃度 | ✅ 更活跃，Bootstrap 5 使用 | Bootstrap 3/4 使用 |
| 与 CSS 兼容 | SCSS 语法完全兼容 CSS | ✅ 语法更接近 CSS |

> **推荐选择 SCSS**：功能更完整、生态更好，大多数现代项目使用 SCSS。

---

## sass中的函数

Sass 内置了丰富的函数，分为颜色、字符串、数学、列表等几类：

### 颜色函数

```scss
// lighten / darken：调整亮度
$color: #3498db;
.light { color: lighten($color, 20%); }   // 更亮
.dark  { color: darken($color, 20%); }    // 更暗

// mix：混合颜色
$mixed: mix(#ff0000, #0000ff, 50%); // 红蓝各50% → 紫色

// rgba：添加透明度
.overlay { background: rgba($color, 0.5); }
```

### 数学函数

```scss
// percentage / round / ceil / floor / abs / max / min
$width: 500px;
.half { width: percentage(1/2); }  // 50%
$size: round(3.7px);               // 4px
$max: max(10px, 20px, 30px);       // 30px
```

### 字符串函数

```scss
$font: "Arial, sans-serif";
unquote($font)   // Arial, sans-serif（去掉引号）
quote(Arial)     // "Arial"（加引号）
str-length($font)  // 字符串长度
to-upper-case("hello") // "HELLO"
```

### 控制指令（Sass 独有）

```scss
// @each 遍历列表
$colors: red, green, blue;

@each $color in $colors {
  .text-#{$color} {
    color: $color;
  }
}

// @for 循环
@for $i from 1 through 5 {
  .col-#{$i} {
    width: 20% * $i;
  }
}

// @if 条件
@mixin theme($mode) {
  @if $mode == dark {
    background: #333;
    color: #fff;
  } @else {
    background: #fff;
    color: #333;
  }
}

// 自定义函数（@function）
@function rem($px, $base: 16px) {
  @return $px / $base * 1rem;
}

.title { font-size: rem(24px); } // 1.5rem
```

### 混入（Mixin）vs 函数（Function）

```scss
// mixin：生成 CSS 代码块
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.container { @include flex-center; }

// function：返回一个值
@function half($n) { @return $n / 2; }
.box { width: half(100px); } // 50px
```

---

## less中的函数

Less 也内置了颜色处理、数学、字符串等函数：

### 颜色函数

```less
@primary: #3498db;

.light  { color: lighten(@primary, 20%); }
.dark   { color: darken(@primary, 20%); }
.faded  { color: fade(@primary, 50%); }     // 设置透明度
.mix    { color: mix(@primary, #ff0000, 50%); }

// spin：旋转色相
.rotate { color: spin(@primary, 30); }  // 色相偏转 30°
```

### 数学函数

```less
@base: 100px;
.width { width: percentage(0.5); }    // 50%
.ceil  { width: ceil(3.1px); }        // 4px
.floor { width: floor(3.9px); }       // 3px
.round { width: round(3.5px); }       // 4px
.abs   { margin: abs(-10px); }        // 10px
.max   { width: max(10px, 20px); }    // 20px
```

### 变量与混入

```less
// 变量（@ 前缀）
@primary-color: #3498db;
@font-size: 16px;

// 混入（Mixin）
.flex-center() {
  display: flex;
  justify-content: center;
  align-items: center;
}

.container {
  .flex-center();
}

// 带参数的 Mixin
.border-radius(@r: 4px) {
  -webkit-border-radius: @r;
  border-radius: @r;
}

.btn { .border-radius(8px); }
```

### Less 的 & 引用父选择器

```less
.button {
  color: blue;
  
  &:hover {          // .button:hover
    color: darkblue;
  }
  
  &-primary {        // .button-primary（BEM 风格）
    background: blue;
  }
  
  .disabled & {      // .disabled .button
    opacity: 0.5;
  }
}
```

### 命名空间

```less
// Less 支持命名空间（Sass 无对应概念）
#utils() {
  .clearfix() {
    &::after {
      content: '';
      display: block;
      clear: both;
    }
  }
}

.container {
  #utils.clearfix();
}
```

