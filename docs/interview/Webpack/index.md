# `Webpack`面试题

## 说说你对`webpack`的理解？解决了什么问题？

**`webpack` 是一个用于现代JavaScript应用程序的静态模块打包工具**

**`webapck`的最初目标是实现前端的模块化，旨在更高效地管理和维护项目中的每一个资源。**

当 webpack处理应用程序时，它会在内部构建一个依赖图，此依赖图对应映射到项目所需的每个模块（不再局限js文件），并生成一个或多个 bundle

解决问题

- 模块化
    多个模块 => bundle.js
- 资源管理
    处理不局限于JavaScript文件时，处理其它资源时，也作为资源管理，并将其打包到最终的bundle中
- 代码分割与懒加载
    - 代码分割
    - 懒加载
- 开发环境优化
    - 热更新HMR
    - 开发服务器（webpack-dev-server） -> 发过程中提供一个本地服务器，并自动重新加载页面
- 生产环境优化
    - Tree Shaking => 去除多余代码
    - 代码压缩


## 说说webpack的构建流程?

Webpack 的运行流程是一个串行的过程，从启动到结束会依次执行以下流程：

  1. 初始化参数：从配置文件和shell语句读取与合并参数，并初始化需要的内置的和配置的插件以及执行环境所需要的参数, 得出最终的参数；

  2. 开始编译：用上一步得到的参数初始化 `Compiler` 对象，加载所有配置的插件，执行对象的 `run`方法开始执行编译；

  3. 确定入口：根据配置中的 `entry` 找出所有的入口文件；

  4. 编译模块：从入口文件出发，调用所有配置的 `Loader` 对模块进行翻译，再找出该模块依赖的模块，再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理；

  5. 完成模块编译：在经过第4步使用 Loader 翻译完所有模块后，得到了每个模块被翻译后的最终内容以及它们之间的依赖关系；

  6. 输出资源：根据入口和模块之间的依赖关系，组装成一个个包含多个模块的 `Chunk`，再把每个 `Chunk` 转换成一个单独的文件加入到输出列表，这步是可以修改输出内容的最后机会；

  7. 输出完成：在确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统。

在以上过程中，`Webpack` 会在特定的时间点广播出特定的事件，插件在监听到感兴趣的事件后会执行特定的逻辑，并且插件可以调用 `Webpack` 提供的 `API` 改变 `Webpack` 的运行结果。

## 说说webpack的热更新是如何做到的？原理是什么？
热更新的配置项为HMR默认就是为true
指在应用程序中，替换、添加、删除模块，无需重新刷新整个应用。
```javascript
module.exports = {
    devServer: {
        // 开启 HMR 特性
        hot: true
        // hotOnly: true
    }
}
```
## 实现原理
Webpack 热更新的原理是通过在客户端（浏览器）和服务器之间建立一个 WebSocket 连接，通过这个连接来实现实时的模块更新。

Webpack Dev Server
webpack compiler => bundle server和hmr serve
- bundle server 静态资源文件服务器，提供文件访问路径
- 用来将热更新的文件输出给 HMR Runtime
Browser会有HMR runtime => socket服务器，会被注入到浏览  器，更新文件的变化

在HMR Runtime 和 HMR Server之间建立 websocket，即图上4号线，用于实时更新文件变化。

当启用热更新时，Webpack 会将一个 HMR 运行时文件添加到打包后的输出文件中。这个 HMR 运行时文件会在浏览器中运行，并与服务器建立 WebSocket 连接。当一个模块发生更改时，Webpack 会将新模块发送到浏览器，并通过 WebSocket 将新模块的代码注入到已加载的模块中。

同时，Webpack 会在开发过程中生成一个 manifest 文件，用于跟踪每个模块的 ID 和哈希值。在模块更改时，Webpack 会生成一个新的哈希值，并将其与 manifest 文件进行比较，以确定哪些模块已更改。然后，Webpack 会使用新的模块代码更新这些已更改的模块，从而实现热更新。

需要注意的是，热更新只能更新模块的代码，而不能更新模块的状态。因此，在使用热更新时，需要特别注意模块状态的处理，以避免出现不可预料的情况。

## webpack的新特性讲一下，五大模块讲一下
- entry 
    表示打包的入口文件，是指webpack是从那个模块进行构建内部依赖图。
    ```javascript
    module.exports = {
        entry: 'index.js'
    }
    ```
- output
    表示文件打包后的输出文件
    ```javascript
    module.exports = {
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'bundle.js'
        }
    };
    ```
- loader
    loader用来处理非js文件，用来处理css,图片和文件等,style-loader,css-loader
    ```javascript
        module.exports = {
            module: {
                rules: [
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader']
                },
                {
                    test: /\.(png|svg|jpg|gif)$/,
                    use: ['file-loader']
                }
                ]
            }
        };
    ```
- plugin
    plugin模块用来扩展webpack的功能
    - HtmlWebpackPlugin 以html为模板，最终打包进入html
    - CleanWebpackPlugin 抽离成单独的css文件
    ```javascript
        module.exports = {
            plugins: [
                new HtmlWebpackPlugin({
                    template: './src/index.html' 
                }),
                new MiniCssExtractPlugin({
                    filename: '[name].css'
                })
            ]
        };
    ```
- mode
Mode 模块用于指定 Webpack 的打包模式，它有 development、production 和 none 三个选项。
这个配置指定了使用 development 模式打包。在 development 模式下，Webpack 会开启一些调试工具，同时不会进行代码压缩，以便于开发和调试。在 production 模式下，Webpack 会进行代码压缩和性能优化，以便于部署到生产环境。

## webpack生命周期简述一下
Webpack 工作过程中，有一些关键的生命周期函数，它们是插件和 Loader 可以使用的钩子函数，可以在这些函数中执行一些自定义的逻辑，从而实现对打包过程的控制和优化。
下面是 Webpack 的生命周期函数和它们的作用：
- beforeRun：在 Webpack 开始读取配置时执行。
- run：在 Webpack 开始构建 bundle 之前执行。
- beforeCompile：在 Webpack 开始编译模块之前执行。
- compile：在 Webpack 编译模块时执行。
- thisCompilation：在 Webpack 开始一个新的 compilation 时执行。
- compilation：在 Webpack 构建 compilation 对象时执行。
- emit：在 Webpack 开始输出文件之前执行。
- afterEmit：在 Webpack 输出文件完成之后执行。
- done：在 Webpack 完成构建之后执行，可以在这里执行一些清理工作。
这些生命周期函数可以在插件中使用，通过在对应的钩子函数中添加自定义的处理逻辑，来实现对打包过程的控制和优化。例如，在 beforeCompile 阶段，一个插件可以动态地修改 Webpack 配置，以更好地适应不同的场景。在 emit 阶段，另一个插件可以对输出的文件进行一些自定义的处理，例如压缩代码、添加注释等。

除了这些生命周期函数之外，Webpack 还提供了许多其他的钩子函数，例如 normalModuleFactory、optimize、afterOptimize 等，可以在具体的场景中使用。插件和 Loader 可以使用这些钩子函数来实现更加细粒度的控制和优化。

## 如何利用webpack来优化前端性能
随着前端项目的逐渐扩大，必然也会带来一个问题就是性能
在复杂的大型项目中，可能一个小小的数据依赖就可能带来页面的卡顿甚至崩溃
所以在打包的时候，利用webpack对前端项目性能优化是一个十分重要的环节
通过webpack优化前端的手段有:
- js代码压缩：terser是一个js的解释、绞肉机、压缩机的工具集，可以帮助我们压缩、丑化我们的代码，让bundle更小
- css代码压缩：通常去除无用的空格等、因为很难去修改选择器、属性的名称、值等
- html文件代码压缩：使用htmlwebpackplugin插件来生成html模板的时候，通过配置minify进行html优化
- 文件大小压缩：对文件进行压缩、减少http传输过程中宽带的损耗
- 图片压缩：一般图片文件大小要远远大于js或者css文件，所以图片压缩较为重要
- Tree shaking:清除代码中的死代码，依赖es module的静态语法分析（不执行任何的代码，可以明确知道模块的依赖关系）
- 代码分离：将代码分离到不同的bundle中，之后再按需加载，或者并行加载这些文件
- 内联chunk：可以通过inlinechunkhtmlplugin插件将一些chunk的模块内联到html，比如runtime的代码（对模块进行解析、加载、模块信息相关的代码），这些代码量并不大，但是必须加载的模块

关于webpack对前端性能的优化，可以通过文件体积大小入手，其次还可以通过分包的形式、减少http请求等方式，实现对前端性能的优化

## 如何提高webpack的构建速度
随着项目涉及的页面越来越多、功能和业务越来越多，相应的webpack的构建时间也越来越久，所以优化webpack构建速度十分重要。主要可以从优化搜索时间、缩小文件搜索范围、减少不必要的编译的等方面入手，比如：
- 优化loader配置
- 合理使用resolve.extensions
- 优化resolve.alias
- 使用DLLPlugin插件
- 使用cache-loader
- terser启动多线程
- 合理使用sourceMap
    

## 如何实现一个loader、plugin？
实现一个loader：
loader模块如下：
```js
module.exports = function (source) {
    const options = this.getOptions() // 获取 webpack 配置中传来的 option
    this.callback(null, addSign(source, options.sign))
    return
}

function addSign(content, sign) {
    return `/** ${sign} */\n${content}`
}
```

配置如下：
```js
module: {
    rules: [
        {
        test: /\.js$/,
        use: [
            'console-loader',
            {
            loader: 'name-loader',
            options: {
                sign: 'we-doctor@2021',
            },
            },
        ],
        },
    ],
}，
```

实现一个plugin：
    class MyPlugin {//定义一个插件类
    constructor(options) {
        // 保存插件选项
        this.options = options;
    }

    apply(compiler) {//定义一个apply方法
        // 注册插件
        compiler.hooks.emit.tapAsync('MyPlugin', (compilation, callback) => {
        // 在emit阶段处理资源
        compilation.chunks.forEach((chunk) => {
            chunk.files.forEach((file) => {
            // 处理资源
            const source = compilation.assets[file].source();
            const result = source.replace(/hello/g, 'world');
            compilation.assets[file] = {
                source: () => result,
                size: () => result.length
            };
            });
        });
        // 调用回调函数
        callback();
        });
    }
    }

    module.exports = MyPlugin;//导出插件


## 常见的loader和如何手写一个loader

- babel-loader 处理JS代码
- style-loader csS注入到index.html中




### 如何手写一个loader



## 常见的plugin

- HtmlWebpackPlugin --> 打包生成的js 模块引⼊到该 html 中
- clean-webpack-plugin --> 删除（清理）构建目录
- mini-css-extract-plugin --> 分离css成多个文件

## webpack 如何进行性能优化



