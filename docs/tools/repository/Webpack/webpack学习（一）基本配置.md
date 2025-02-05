## webpack 学习（一）基本配置

#### webpack 简介

本质上，**webpack** 是一个用于现代 JavaScript 应用程序的 _静态模块打包工具_。当 webpack 处理应用程序时，它会在内部从一个或多个入口点构建一个 依赖图(dependency graph)，然后将你项目中所需的每一个模块组合成一个或多个 _bundles_，它们均为静态资源，用于展示内容。

而在深入了解 webpack 之前，需要先对 webpack 的配置有一定认识

#### 五大核心配置

##### 1.入口（entry)

简单来说就是指示 Webpack 从哪个文件开始打包

详细来说是指示 webpack 应该使用哪个模块，来作为构建其内部依赖图的开始。进入入口起点后，webpack 会找出有哪些模块和库是入口起点（直接和间接）依赖的。

默认值是 `./src/index.js`，但你可以通过在 webpack.config 中配置 `entry` 属性，来指定一个（或多个）不同的入口起点。例如：

**webpack.config.js**

```js
module.exports = {
  // 相对路径和绝对路径都行
  entry: "./path/to/my/entry/file.js",
}
```

##### 2.输入（output）

此部分用来指示 Webpack 打包完的文件输出到哪里去，如何命名等

**output** 属性告诉 webpack 在哪里输出它所创建的 _bundle_，以及如何命名这些文件。主要输出文件的默认值是 `./dist/main.js`，其他生成文件默认放置在 `./dist` 文件夹中。

**例：**

```javascript
const path = require("path")

module.exports = {
  // 入口
  // 相对路径和绝对路径都行
  entry: "./path/to/my/entry/file.js",
  output: {
    // path: 文件输出目录，必须是绝对路径
    // path.resolve()方法返回一个绝对路径
    // __dirname 当前文件的文件夹绝对路径
    path: path.resolve(__dirname, "dist"),
    // filename: 输出文件名
    filename: "my-first-webpack.bundle.js",
  },
}
```

##### 3.加载器（loader）

webpack 只能理解 JavaScript 和 JSON 文件，这是 webpack 开箱可用的自带能力。但其他资源需要借助 loader，Webpack 才能解析。

loader 的作用就是 让 webpack 能够去处理其他类型的文件，并将它们转换为有效 模块，以供应用程序使用，以及被添加到依赖图中。

在更高层面，在 webpack 的配置中，**loader** 有两个属性：

1. `test` 属性，识别出哪些文件会被转换。
2. `use` 属性，定义出在进行转换时，应该使用哪个 loader。

**例：**

```javascript
const path = require("path")

module.exports = {
  output: {
    filename: "my-first-webpack.bundle.js",
  },
  //加载器loader
  module: {
    //使用正则表达式匹配文件时，不能添加引号
    rules: [{ test: /\.txt$/, use: "raw-loader" }],
  },
}
```

以上配置中，对一个单独的 module 对象定义了 `rules` 属性，里面包含两个必须属性：`test` 和 `use`。这相当于给 webpack 编译器(compiler) 传递信息

在编译器打包过程中，碰到「在 `require()`/`import` 语句中被解析为 '.txt' 的路径」时，在对它打包之前，先 **use(使用)** `raw-loader` 转换一下

##### 4.插件（plugins）

简单来说是用来扩展 Webpack 的功能，loader 用于转换某些类型的模块，而插件则可以用于执行范围更广的任务。包括：打包优化，资源管理，注入环境变量。

所以也可以这样说：插件目的在于解决 loader 无法实现的**其他事**

想要使用一个插件，你只需要 `require()` 它，然后把它添加到 `plugins` 数组中。多数插件可以通过选项(option)自定义。你也可以在一个配置文件中因为不同目的而多次使用同一个插件，这时需要通过使用 `new` 操作符来创建一个插件实例。

**例：**

```javascript
const HtmlWebpackPlugin = require("html-webpack-plugin")
const webpack = require("webpack") // 用于访问内置插件

module.exports = {
  module: {
    rules: [{ test: /\.txt$/, use: "raw-loader" }],
  },
  //html-webpack-plugin 为应用程序生成一个 HTML 文件，并自动将生成的所有 bundle 注入到此文件中。
  plugins: [new HtmlWebpackPlugin({ template: "./src/index.html" })],
}
```

##### 5.模式（model）

这部分是用来配置当前的模式是出于开发模式还是生产模式，因为开发环境和打包后要上线的环境不一样，要求也不一样，这个时候就需要根据实际需求来对两个模式进行分别配置

- 开发模式：development
- 生产模式：production

**例：**

```javascript
module.exports = {
  mode: "production", //生成模式
}
```

##### 总体配置模版

```
// Node.js的核心模块，专门用来处理文件路径
const path = require("path");

module.exports = {
  // 入口
  entry: "./src/main.js",
  // 输出
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "main.js",
  },
  // 加载器
  module: {
    rules: [],
  },
  // 插件
  plugins: [],
  // 模式
  mode: "development",
};

```

#### 总结

这部分只是对 webpack 配置做了个简单介绍，后续会更新各个模块的详细应用，以及常用的一些优化方案，或者了解更深一点的运行机制等等，欢迎关注！

**参考**

[webpack 官网](https://www.webpackjs.com)
