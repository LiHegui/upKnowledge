import{_ as n,c as s,a,o as l}from"./app-DPjPDnzl.js";const i={};function p(c,e){return l(),s("div",null,e[0]||(e[0]=[a(`<h1 id="说说你对webpack的理解-解决了什么问题" tabindex="-1"><a class="header-anchor" href="#说说你对webpack的理解-解决了什么问题"><span>说说你对webpack的理解？解决了什么问题？</span></a></h1><p>webapck的最初目标是实现前端的模块化，旨在更高效地管理和维护项目中的每一个资源。</p><h1 id="说说webpack的构建流程" tabindex="-1"><a class="header-anchor" href="#说说webpack的构建流程"><span>说说webpack的构建流程?</span></a></h1><p>webpack的运行流程就是一个串行的过程，它的工作流程就是将各个插件串联起来。</p><ul><li>初始化流程:从配置文件和shell语句读取与合并参数，并初始化需要的内置的和配置的插件以及执行环境所需要的参数</li><li>编译构建流程：从入口文件entry出发，针对每个module模块串行调用loader去编译文件，再找到module依赖的module，递归地进行编译处理 -对编译后地module组合成chunk，把chunk转换成文件，输出到指定出口文件目录</li><li>在整个过程中，webpack会广播各种事件，而插件只需要监听它所关心的事件，就能加入到这条webpack机制中，然后改变webpack的运作，使整个系统的拓展性很好</li></ul><h1 id="说说webpack的热更新是如何做到的-原理是什么" tabindex="-1"><a class="header-anchor" href="#说说webpack的热更新是如何做到的-原理是什么"><span>说说webpack的热更新是如何做到的？原理是什么？</span></a></h1><p>热更新的配置项为HMR默认就是为true 指在应用程序中，替换、添加、删除模块，无需重新刷新整个应用。</p><div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js" data-title="js"><pre><code><span class="line">module<span class="token punctuation">.</span>exports <span class="token operator">=</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token literal-property property">devServer</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">// 开启 HMR 特性</span></span>
<span class="line">        <span class="token literal-property property">hot</span><span class="token operator">:</span> <span class="token boolean">true</span></span>
<span class="line">        <span class="token comment">// hotOnly: true</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="实现原理" tabindex="-1"><a class="header-anchor" href="#实现原理"><span>实现原理</span></a></h2><p>Webpack 热更新的原理是通过在客户端（浏览器）和服务器之间建立一个 WebSocket 连接，通过这个连接来实现实时的模块更新。</p><p>Webpack Dev Server webpack compiler =&gt; bundle server和hmr serve</p><ul><li>bundle server 静态资源文件服务器，提供文件访问路径</li><li>用来将热更新的文件输出给 HMR Runtime Browser会有HMR runtime =&gt; socket服务器，会被注入到浏览 器，更新文件的变化</li></ul><p>在HMR Runtime 和 HMR Server之间建立 websocket，即图上4号线，用于实时更新文件变化。</p><p>当启用热更新时，Webpack 会将一个 HMR 运行时文件添加到打包后的输出文件中。这个 HMR 运行时文件会在浏览器中运行，并与服务器建立 WebSocket 连接。当一个模块发生更改时，Webpack 会将新模块发送到浏览器，并通过 WebSocket 将新模块的代码注入到已加载的模块中。</p><p>同时，Webpack 会在开发过程中生成一个 manifest 文件，用于跟踪每个模块的 ID 和哈希值。在模块更改时，Webpack 会生成一个新的哈希值，并将其与 manifest 文件进行比较，以确定哪些模块已更改。然后，Webpack 会使用新的模块代码更新这些已更改的模块，从而实现热更新。</p><p>需要注意的是，热更新只能更新模块的代码，而不能更新模块的状态。因此，在使用热更新时，需要特别注意模块状态的处理，以避免出现不可预料的情况。</p><h1 id="webpack的新特性讲一下-五大模块讲一下" tabindex="-1"><a class="header-anchor" href="#webpack的新特性讲一下-五大模块讲一下"><span>webpack的新特性讲一下，五大模块讲一下</span></a></h1><ul><li>entry 表示打包的入口文件，是指webpack是从那个模块进行构建内部依赖图。<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">module.exports = {</span>
<span class="line">    entry: &#39;index.js&#39;</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li><li>output 表示文件打包后的输出文件<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">module.exports = {</span>
<span class="line">    output: {</span>
<span class="line">        path: path.resolve(__dirname, &#39;dist&#39;),</span>
<span class="line">        filename: &#39;bundle.js&#39;</span>
<span class="line">    }</span>
<span class="line">};</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li><li>loader loader用来处理非js文件，用来处理css,图片和文件等,style-loader,css-loader<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">    module.exports = {</span>
<span class="line">        module: {</span>
<span class="line">            rules: [</span>
<span class="line">            {</span>
<span class="line">                test: /\\.css$/,</span>
<span class="line">                use: [&#39;style-loader&#39;, &#39;css-loader&#39;]</span>
<span class="line">            },</span>
<span class="line">            {</span>
<span class="line">                test: /\\.(png|svg|jpg|gif)$/,</span>
<span class="line">                use: [&#39;file-loader&#39;]</span>
<span class="line">            }</span>
<span class="line">            ]</span>
<span class="line">        }</span>
<span class="line">    };</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li><li>plugin plugin模块用来扩展webpack的功能 <ul><li>HtmlWebpackPlugin 以html为模板，最终打包进入html</li><li>CleanWebpackPlugin 抽离成单独的css文件</li></ul><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">module.exports = {</span>
<span class="line">    plugins: [</span>
<span class="line">        new HtmlWebpackPlugin({</span>
<span class="line">            template: &#39;./src/index.html&#39; </span>
<span class="line">        }),</span>
<span class="line">        new MiniCssExtractPlugin({</span>
<span class="line">            filename: &#39;[name].css&#39;</span>
<span class="line">        })</span>
<span class="line">    ]</span>
<span class="line">};</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li><li>mode Mode 模块用于指定 Webpack 的打包模式，它有 development、production 和 none 三个选项。 这个配置指定了使用 development 模式打包。在 development 模式下，Webpack 会开启一些调试工具，同时不会进行代码压缩，以便于开发和调试。在 production 模式下，Webpack 会进行代码压缩和性能优化，以便于部署到生产环境。</li></ul><h1 id="webpack生命周期简述一下" tabindex="-1"><a class="header-anchor" href="#webpack生命周期简述一下"><span>webpack生命周期简述一下</span></a></h1><p>Webpack 工作过程中，有一些关键的生命周期函数，它们是插件和 Loader 可以使用的钩子函数，可以在这些函数中执行一些自定义的逻辑，从而实现对打包过程的控制和优化。 下面是 Webpack 的生命周期函数和它们的作用：</p><ul><li>beforeRun：在 Webpack 开始读取配置时执行。</li><li>run：在 Webpack 开始构建 bundle 之前执行。</li><li>beforeCompile：在 Webpack 开始编译模块之前执行。</li><li>compile：在 Webpack 编译模块时执行。</li><li>thisCompilation：在 Webpack 开始一个新的 compilation 时执行。</li><li>compilation：在 Webpack 构建 compilation 对象时执行。</li><li>emit：在 Webpack 开始输出文件之前执行。</li><li>afterEmit：在 Webpack 输出文件完成之后执行。</li><li>done：在 Webpack 完成构建之后执行，可以在这里执行一些清理工作。 这些生命周期函数可以在插件中使用，通过在对应的钩子函数中添加自定义的处理逻辑，来实现对打包过程的控制和优化。例如，在 beforeCompile 阶段，一个插件可以动态地修改 Webpack 配置，以更好地适应不同的场景。在 emit 阶段，另一个插件可以对输出的文件进行一些自定义的处理，例如压缩代码、添加注释等。</li></ul><p>除了这些生命周期函数之外，Webpack 还提供了许多其他的钩子函数，例如 normalModuleFactory、optimize、afterOptimize 等，可以在具体的场景中使用。插件和 Loader 可以使用这些钩子函数来实现更加细粒度的控制和优化。</p><h1 id="如何利用webpack来优化前端性能" tabindex="-1"><a class="header-anchor" href="#如何利用webpack来优化前端性能"><span>如何利用webpack来优化前端性能</span></a></h1><p>随着前端项目的逐渐扩大，必然也会带来一个问题就是性能 在复杂的大型项目中，可能一个小小的数据依赖就可能带来页面的卡顿甚至崩溃 所以在打包的时候，利用webpack对前端项目性能优化是一个十分重要的环节 通过webpack优化前端的手段有:</p><ul><li>js代码压缩：terser是一个js的解释、绞肉机、压缩机的工具集，可以帮助我们压缩、丑化我们的代码，让bundle更小</li><li>css代码压缩：通常去除无用的空格等、因为很难去修改选择器、属性的名称、值等</li><li>html文件代码压缩：使用htmlwebpackplugin插件来生成html模板的时候，通过配置minify进行html优化</li><li>文件大小压缩：对文件进行压缩、减少http传输过程中宽带的损耗</li><li>图片压缩：一般图片文件大小要远远大于js或者css文件，所以图片压缩较为重要</li><li>Tree shaking:清除代码中的死代码，依赖es module的静态语法分析（不执行任何的代码，可以明确知道模块的依赖关系）</li><li>代码分离：将代码分离到不同的bundle中，之后再按需加载，或者并行加载这些文件</li><li>内联chunk：可以通过inlinechunkhtmlplugin插件将一些chunk的模块内联到html，比如runtime的代码（对模块进行解析、加载、模块信息相关的代码），这些代码量并不大，但是必须加载的模块</li></ul><p>关于webpack对前端性能的优化，可以通过文件体积大小入手，其次还可以通过分包的形式、减少http请求等方式，实现对前端性能的优化</p><h1 id="如何提高webpack的构建速度" tabindex="-1"><a class="header-anchor" href="#如何提高webpack的构建速度"><span>如何提高webpack的构建速度</span></a></h1><p>随着项目涉及的页面越来越多、功能和业务越来越多，相应的webpack的构建时间也越来越久，所以优化webpack构建速度十分重要。主要可以从优化搜索时间、缩小文件搜索范围、减少不必要的编译的等方面入手，比如：</p><ul><li>优化loader配置</li><li>合理使用resolve.extensions</li><li>优化resolve.alias</li><li>使用DLLPlugin插件</li><li>使用cache-loader</li><li>terser启动多线程</li><li>合理使用sourceMAP</li></ul><h1 id="如何实现一个loader、plugin" tabindex="-1"><a class="header-anchor" href="#如何实现一个loader、plugin"><span>如何实现一个loader、plugin？</span></a></h1><p>实现一个loader： loader模块如下： module.exports = function (source) { const options = this.getOptions() // 获取 webpack 配置中传来的 option this.callback(null, addSign(source, options.sign)) return }</p><pre><code>function addSign(content, sign) {
 return \`/** \${sign} */\\n\${content}\`
}
配置如下：
module: {
rules: [
  {
    test: /\\.js$/,
    use: [
      &#39;console-loader&#39;,
      {
        loader: &#39;name-loader&#39;,
        options: {
          sign: &#39;we-doctor@2021&#39;,
        },
      },
    ],
  },
],
}，
</code></pre><p>实现一个plugin： class MyPlugin {//定义一个插件类 constructor(options) { // 保存插件选项 this.options = options; }</p><pre><code>apply(compiler) {//定义一个apply方法
    // 注册插件
    compiler.hooks.emit.tapAsync(&#39;MyPlugin&#39;, (compilation, callback) =&gt; {
    // 在emit阶段处理资源
    compilation.chunks.forEach((chunk) =&gt; {
        chunk.files.forEach((file) =&gt; {
        // 处理资源
        const source = compilation.assets[file].source();
        const result = source.replace(/hello/g, &#39;world&#39;);
        compilation.assets[file] = {
            source: () =&gt; result,
            size: () =&gt; result.length
        };
        });
    });
    // 调用回调函数
    callback();
    });
}
}

module.exports = MyPlugin;//导出插件
</code></pre>`,34)]))}const r=n(i,[["render",p],["__file","index.html.vue"]]),d=JSON.parse('{"path":"/tools/docs/interview/Webpack/","title":"说说你对webpack的理解？解决了什么问题？","lang":"zh-CN","frontmatter":{},"headers":[{"level":2,"title":"实现原理","slug":"实现原理","link":"#实现原理","children":[]}],"git":{"updatedTime":1738722167000,"contributors":[{"name":"LiHegui","username":"LiHegui","email":"1487647822@qq.com","commits":1,"url":"https://github.com/LiHegui"}]},"filePathRelative":"tools/docs/interview/Webpack/index.md"}');export{r as comp,d as data};
