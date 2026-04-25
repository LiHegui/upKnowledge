import{_ as n,o as a,c as e,ag as p}from"./chunks/framework.DHfb4PWj.js";const g=JSON.parse('{"title":"Vue 面试题","description":"","frontmatter":{},"headers":[],"relativePath":"interview/Vue/vue.md","filePath":"interview/Vue/vue.md"}'),t={name:"interview/Vue/vue.md"};function l(o,s,i,c,r,d){return a(),e("div",null,[...s[0]||(s[0]=[p(`<h1 id="vue-面试题" tabindex="-1">Vue 面试题 <a class="header-anchor" href="#vue-面试题" aria-label="Permalink to &quot;Vue 面试题&quot;">​</a></h1><h2 id="vue-响应式原理" tabindex="-1">Vue 响应式原理 <a class="header-anchor" href="#vue-响应式原理" aria-label="Permalink to &quot;Vue 响应式原理&quot;">​</a></h2><h3 id="核心一句话" tabindex="-1">核心一句话 <a class="header-anchor" href="#核心一句话" aria-label="Permalink to &quot;核心一句话&quot;">​</a></h3><blockquote><p><strong>Vue 3 的响应式系统基于 **<strong>ES6 Proxy</strong> 拦截数据的读写操作，配合</strong>依赖收集<strong>和</strong>派发更新**机制，实现数据变化时自动驱动视图更新。</p></blockquote><hr><h3 id="三个核心模块" tabindex="-1">三个核心模块 <a class="header-anchor" href="#三个核心模块" aria-label="Permalink to &quot;三个核心模块&quot;">​</a></h3><p><strong>1. <strong><code>reactive</code></strong> — 数据劫持</strong></p><p>**用 **<code>Proxy</code> 包裹原始对象，拦截 <code>get</code> / <code>set</code> 操作：</p><ul><li><code>get</code> 时：收集依赖（谁用了这个数据）</li><li><code>set</code> 时：派发更新（通知用到这个数据的地方重新执行）</li></ul><p><strong>2. <strong><code>Dep</code></strong> — 依赖管理</strong></p><p>**每个响应式属性都对应一个 **<code>Dep</code> 实例，内部用 <code>Set</code> 存储所有订阅它的副作用函数（<code>effect</code>）：</p><ul><li><code>depend()</code>：收集当前正在运行的 <code>activeEffect</code></li><li><code>notify()</code>：遍历 <code>Set</code>，重新执行所有 <code>effect</code></li></ul><p><strong>3. <strong><code>watchEffect</code></strong> — 副作用调度</strong></p><p>**执行副作用函数前，将其赋值给全局变量 **<code>activeEffect</code>；函数执行时内部访问到响应式数据，自动触发 <code>get</code> → <code>dep.depend()</code>，完成订阅；执行完后清空 <code>activeEffect</code>。</p><h2 id="有使用过vue吗-说说你对vue的理解" tabindex="-1">有使用过vue吗？说说你对vue的理解 <a class="header-anchor" href="#有使用过vue吗-说说你对vue的理解" aria-label="Permalink to &quot;有使用过vue吗？说说你对vue的理解&quot;">​</a></h2><p><strong>Vue是一款构建用户界面的JavaScript框架</strong></p><p>**特点： **</p><ul><li><strong>MVVM 数据驱动</strong> ** <strong>model 模型层，负责处理业务逻辑以及和服务器端进行交互</strong> ** <strong>view 视图层， 负责将数据模型转化为UI展示出来，可以简单的理解为HTML页面</strong> ** **v-model 视图模型层，用来连接Model和View，是Model和View之间的通信桥梁</li><li><strong>组件化</strong></li><li>**指令系统 **<strong>如何实现自定义指令</strong></li></ul><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes catppuccin-latte catppuccin-mocha vp-code" tabindex="0"><code><span class="line"><span>    // 在 Vue 实例中注册全局自定义指令</span></span>
<span class="line"><span>    Vue.directive(&#39;highlight&#39;, {</span></span>
<span class="line"><span>        // 当绑定元素插入到 DOM 中时被调用</span></span>
<span class="line"><span>        inserted: function (el) {</span></span>
<span class="line"><span>            el.style.backgroundColor = &#39;yellow&#39;;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    });</span></span></code></pre></div><h2 id="你对spa单页面的理解-它的优缺点分别是什么-如何实现spa应用呢-需要重新整理" tabindex="-1">你对SPA单页面的理解，它的优缺点分别是什么？如何实现SPA应用呢-----需要重新整理 <a class="header-anchor" href="#你对spa单页面的理解-它的优缺点分别是什么-如何实现spa应用呢-需要重新整理" aria-label="Permalink to &quot;你对SPA单页面的理解，它的优缺点分别是什么？如何实现SPA应用呢-----需要重新整理&quot;">​</a></h2><p><strong>Vue 实例的挂载过程是 Vue.js 应用启动的核心步骤，它涉及从创建 Vue 实例到将模板渲染到 DOM 的整个过程。以下是 Vue 实例挂载的详细过程：</strong></p><hr><ol><li><strong>创建 Vue 实例</strong></li></ol><ul><li>**通过 **<code>new Vue(options)</code> 创建一个 Vue 实例。</li><li><code>options</code> 对象包含数据、方法、生命周期钩子、计算属性等配置。</li><li><strong>示例：</strong></li></ul><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes catppuccin-latte catppuccin-mocha vp-code" tabindex="0"><code><span class="line"><span>const vm = new Vue({</span></span>
<span class="line"><span>  el: &#39;#app&#39;,</span></span>
<span class="line"><span>  data: {</span></span>
<span class="line"><span>    message: &#39;Hello, Vue!&#39;</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  methods: {</span></span>
<span class="line"><span>    showMessage() {</span></span>
<span class="line"><span>      console.log(this.message);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>});</span></span></code></pre></div><hr><ol start="2"><li><strong>初始化生命周期</strong></li></ol><ul><li>**Vue 实例会初始化生命周期钩子函数，并触发 **<code>beforeCreate</code> 钩子。</li><li><strong>此时，实例的数据 (</strong><code>data</code>)、方法 (<code>methods</code>)、计算属性 (<code>computed</code>) 等都还未初始化。</li></ul><hr><ol start="3"><li><strong>初始化数据和方法</strong></li></ol><ul><li>**初始化 **<code>data</code>、<code>methods</code>、<code>computed</code>、<code>watch</code> 等选项。</li><li>**将 **<code>data</code> 对象中的属性转换为响应式数据（通过 <code>Object.defineProperty</code> 或 <code>Proxy</code>）。</li><li>**触发 **<code>created</code> 钩子，此时实例的数据和方法已经初始化完成，但 DOM 还未生成。</li></ul><hr><ol start="4"><li><strong>编译模板</strong></li></ol><ul><li>**Vue 会检查是否有 **<code>template</code> 选项或 <code>el</code> 选项指定的 DOM 元素。 <ul><li>**如果有 **<code>template</code>，则将其编译为渲染函数。</li><li>**如果没有 **<code>template</code>，则将 <code>el</code> 指定的外部 HTML 作为模板。</li></ul></li><li><strong>编译过程包括：</strong><ul><li><strong>将模板解析为抽象语法树（AST）。</strong></li><li><strong>将 AST 转换为渲染函数（</strong><code>render</code> 函数）。</li></ul></li></ul><hr><ol start="5"><li><strong>挂载到 DOM</strong></li></ol><ul><li>**调用 **<code>render</code> 函数生成虚拟 DOM（VNode）。</li><li>**将虚拟 DOM 转换为真实 DOM，并替换 **<code>el</code> 指定的 DOM 元素。</li><li>**触发 **<code>beforeMount</code> 钩子，此时 DOM 还未被渲染。</li><li><strong>将真实 DOM 插入页面，完成挂载。</strong></li><li>**触发 **<code>mounted</code> 钩子，此时实例已经挂载到 DOM 上，可以访问 DOM 元素。</li></ul><hr><ol start="6"><li><strong>更新与重新渲染</strong></li></ol><ul><li><strong>当数据发生变化时，Vue 会触发响应式更新。</strong></li><li>**重新调用 **<code>render</code> 函数生成新的虚拟 DOM。</li><li><strong>通过 Diff 算法对比新旧虚拟 DOM，找出需要更新的部分。</strong></li><li>**更新真实 DOM，触发 **<code>beforeUpdate</code> 和 <code>updated</code> 钩子。</li></ul><hr><ol start="7"><li><strong>销毁实例</strong></li></ol><ul><li>**当调用 **<code>vm.$destroy()</code> 或组件被移除时，Vue 实例会进入销毁阶段。</li><li>**触发 **<code>beforeDestroy</code> 钩子，此时实例仍然可用。</li><li><strong>移除事件监听器、解绑指令、销毁子组件等。</strong></li><li>**触发 **<code>destroyed</code> 钩子，此时实例已经完全销毁。</li></ul><hr><ol start="8"><li><strong>挂载过程的生命周期钩子</strong> ** **以下是挂载过程中触发的生命周期钩子顺序：</li><li><code>beforeCreate</code>：实例初始化，数据和方法还未初始化。</li><li><code>created</code>：数据和方法已初始化，但 DOM 未生成。</li><li><code>beforeMount</code>：模板编译完成，DOM 未渲染。</li><li><code>mounted</code>：实例已挂载到 DOM，可以访问 DOM 元素。</li></ol><hr><ol start="9"><li><strong>代码示例</strong></li></ol><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes catppuccin-latte catppuccin-mocha vp-code" tabindex="0"><code><span class="line"><span>const vm = new Vue({</span></span>
<span class="line"><span>  el: &#39;#app&#39;,</span></span>
<span class="line"><span>  data: {</span></span>
<span class="line"><span>    message: &#39;Hello, Vue!&#39;</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  beforeCreate() {</span></span>
<span class="line"><span>    console.log(&#39;beforeCreate: 实例初始化&#39;);</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  created() {</span></span>
<span class="line"><span>    console.log(&#39;created: 数据和方法已初始化&#39;);</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  beforeMount() {</span></span>
<span class="line"><span>    console.log(&#39;beforeMount: 模板编译完成，DOM 未渲染&#39;);</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  mounted() {</span></span>
<span class="line"><span>    console.log(&#39;mounted: 实例已挂载到 DOM&#39;);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>});</span></span></code></pre></div><hr><ol start="10"><li><strong>总结</strong> ** **Vue 实例的挂载过程主要包括：</li><li><strong>实例初始化。</strong></li><li><strong>数据和方法初始化。</strong></li><li><strong>模板编译。</strong></li><li><strong>挂载到 DOM。</strong></li><li><strong>触发生命周期钩子。</strong></li></ol><p><strong>理解挂载过程有助于更好地掌握 Vue 的生命周期和行为，从而编写更高效的应用。</strong></p><p><strong>如何实现一个SPA</strong></p><p><strong>监听hash或者pushState变化 =&gt; 以当前的hash为索引，加载对应的资源 =&gt; 加载完成之后，隐藏之前的页面 =&gt;显示当前页面</strong></p><p><strong>路由分为两种模式</strong></p><ul><li><strong>hash模式</strong> ** **使用URL的锚点（Hash）来模拟整个页面的导航。例如：<a href="http://your-app/#/user" target="_blank" rel="noreferrer">http://your-app/#/user</a> ** **#后面的内容后并不会导致页面刷新0</li></ul><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes catppuccin-latte catppuccin-mocha vp-code" tabindex="0"><code><span class="line"><span>class Router {</span></span>
<span class="line"><span>    constructor () {</span></span>
<span class="line"><span>        this.routes = {}</span></span>
<span class="line"><span>        this.currentUrl = &#39;&#39;;  // 当页面加载或 URL 中的哈希值发生变化时，会触发 refresh 方法。在 refresh 方法中，会更新 currentUrl 属性的值，以便在后续的处理中可以使用当前的 URL。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        window.addEventListener(&#39;load&#39;, this.refresh, false);  // 将在页面加载时触发 refresh 方法，用于执行相应的回调函数</span></span>
<span class="line"><span>        window.addEventListener(&#39;hashchange&#39;, this.refresh, false);  // 监听hash的变化</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    route(path, callback) {</span></span>
<span class="line"><span>        this.routes[path] = callback</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    push() {</span></span>
<span class="line"><span>        this.routes[path] &amp;&amp; this.routes[path]()</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>window.miniRouter = new Router();  </span></span>
<span class="line"><span>miniRouter.route(&#39;/&#39;, () =&gt; console.log(&#39;page1&#39;))  </span></span>
<span class="line"><span>miniRouter.route(&#39;/page2&#39;, () =&gt; console.log(&#39;page2&#39;))  </span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>miniRouter.push(&#39;/&#39;) // page1  </span></span>
<span class="line"><span>miniRouter.push(&#39;/page2&#39;) // page2</span></span></code></pre></div><ul><li><strong>history</strong> ** <strong>history.pushState 浏览器历史纪录添加记录</strong> ** <strong>history.replaceState修改浏览器历史纪录中当前纪录</strong> ** <strong>history.popState 当 history 发生变化时触发</strong> ** <strong>这些都不会让页面进行刷新</strong></li></ul><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes catppuccin-latte catppuccin-mocha vp-code" tabindex="0"><code><span class="line"><span></span></span></code></pre></div><h2 id="v-if和v-show的区别" tabindex="-1">v-if和v-show的区别 <a class="header-anchor" href="#v-if和v-show的区别" aria-label="Permalink to &quot;v-if和v-show的区别&quot;">​</a></h2><p><strong>首先二者都是控制元素的显示与隐藏</strong> ** <strong>v-show是利用css中的display:none;来做的，隐藏元素后，但是其dom元素依旧存在</strong> ** <strong>v-if 是真实安装卸载元素，隐藏元素dom结构不存在，并且能触发元素的生命周期</strong> ** **使用场景</p><p><strong>v-show用户切换状态比较频繁的场景，v-show初始渲染消耗性能比较大</strong> ** **v-if则是用于初始渲染</p><h2 id="vue实例挂载的过程" tabindex="-1">Vue实例挂载的过程？ <a class="header-anchor" href="#vue实例挂载的过程" aria-label="Permalink to &quot;Vue实例挂载的过程？&quot;">​</a></h2><p><strong>template =&gt; AST =&gt; render函数 =&gt; 虚拟DOM =&gt; (patch,diffd) 真实DOM</strong> ** ** 新旧DOM树 =&gt; ** ** **流程 **</p><ol><li><strong>init(options) 初始化</strong><ol><li><strong>合并属性（判断初始化的是否是组件，这里合并主要是 mixins 或 extends 的方法）</strong></li><li><strong>初始化的时候会创建组件实例、创建组件初始化状态、创建各种响应式数据</strong></li></ol></li><li><strong>在调用vm.$mount方法时 会将template 解析为 抽象语法树 (ast tree) 再将抽象语法树 转换成render语法字符串 最终生成render方法 挂载到vm上后，会再次调用mount方法</strong></li><li><strong>调用mountComponent渲染组件：此时会触发beforeMount钩子函数 ，定义updateComponent来渲染页面视图的方法，监听组件数据，一旦发生变化，触发beforeUpdate生命钩子 最后执行 callHook(vm, &#39;mounted&#39;) 钩子函数 完成挂载</strong> ** **updateComponent方法主要执行在vue初始化时声明的render，update方法</li></ol><p><strong>挂载中最重要的两件事</strong></p><ul><li><strong>初始化</strong></li><li><strong>建立更新机制</strong></li></ul><ol><li><strong>挂载过程中指的是app.mount()过程，这是个初始化过程，整体做了两部分的工作：初始化和建立更新机制</strong></li><li><strong>此时会触发beforeMount钩子函数 ，定义updateComponent来渲染页面视图的方法，监听组件数据，一旦发生变化，触发beforeUpdate生命钩子 最后执行 callHook(vm, &#39;mounted&#39;) 钩子函数 完成挂载</strong> ** **updateComponent方法主要执行在vue初始化时声明的render，update方法</li></ol><p><strong>1.确认挂载节点</strong> ** <strong>2.编译模板为render函数</strong> ** <strong>3.渲染函数转换为Virtual Dom 树</strong> ** **4.创建真实节点</p><h2 id="computed和watch的区别" tabindex="-1">computed和Watch的区别 <a class="header-anchor" href="#computed和watch的区别" aria-label="Permalink to &quot;computed和Watch的区别&quot;">​</a></h2><p><strong>computed和watch的区别？</strong></p><p><strong>computed 计算属性，根据组件的的数据返回新值，会存在依赖，同步执行</strong></p><p><strong>watch 监听，不会首次监听立即执行，除非设置immediate，数据发生更改，会触发回调函数，</strong> ** **watch支持异步，还可以设置deep进行深度监听</p><p><strong>总结关键词：用途|缓存|异步|返回值|首次监听</strong> ** <strong>(1) computed(计算属性): 根据组件数据计算返回派生值</strong> ** ** watch(监听属性): 监听数据, 执行回调函数(比如网络请求、dom操作)** ** <strong>(2) computed能进行缓存，watch没有缓存</strong> ** <strong>(3) computed有返回值，watch没有返回值</strong> ** <strong>(4) computed不支持异步，watch支持异步</strong> ** <strong>(5) computed第一次监听执行，watch不会第一次监听执行(除非设置immediate: true)</strong> ** **(6) 此外watch还有属性deep可以进行深度监听</p><h3 id="watch-和-watcheffect-的区别" tabindex="-1">watch 和 watchEffect 的区别？ <a class="header-anchor" href="#watch-和-watcheffect-的区别" aria-label="Permalink to &quot;watch 和 watchEffect 的区别？&quot;">​</a></h3><h2 id="请描述下你对vue生命周期的理解" tabindex="-1">请描述下你对vue生命周期的理解？ <a class="header-anchor" href="#请描述下你对vue生命周期的理解" aria-label="Permalink to &quot;请描述下你对vue生命周期的理解？&quot;">​</a></h2><ul><li><strong>Vue2 创建-&gt;挂载-&gt;更新-&gt;销毁</strong><ul><li><code>beforeCreate</code> ** **组件创建之初 <ul><li><code>Created</code> ** **组将创建之后，此时页面结构还没好，data里面的数据已经可以用了，（数据劫持已完成）</li><li><code>BeforeMounte</code> ** **组件挂载之前，开始解析 <code>template</code>中的结构， 子组件开始进行解析-&gt;知道子组件进行挂载</li><li><code>Mouted</code> ** **组件挂载之后，此时页面结构都已存在</li><li><code>beforeUpdate</code> ** **组件更新之前</li><li><code>Updated</code> ** **组件更新之后</li><li><code>beforeDestory</code> ** **组件销毁之前, 此时适合清除一些定时器或者监听事件之类的</li><li><code>destoryed</code> ** **组件销毁之后</li><li><code>activated</code> ** **keep-live组件激活时触发</li><li><code>deactivated</code> ** **keep-alive 缓存的组件停用时调用</li></ul></li></ul></li><li><strong>Vue3</strong><ul><li><code>onBeforeMount</code> – 在挂载开始之前被调用：相关的 render 函数首次被调用。</li><li><code>onMounted</code> – 组件挂载时调用</li><li><code>onBeforeUpdate</code> – 数据更新时调用，发生在虚拟 DOM 打补丁之前。这里适合在更新之前访问现有的 DOM，比如手动移除已添加的事件监听器。</li><li><code>onUpdated</code> – 由于数据更改导致的虚拟 DOM 重新渲染和打补丁，在这之后会调用该钩子。</li><li><code>onBeforeUnmount</code> – 在卸载组件实例之前调用。在这个阶段，实例仍然是完全正常的。</li><li><code>onUnmounted</code> – 卸载组件实例后调用。调用此钩子时，组件实例的所有指令都被解除绑定，所有事件侦听器都被移除，所有子组件实例被卸载。</li><li><code>onActivated</code> – 被 keep-alive 缓存的组件激活时调用。</li><li><code>onDeactivated</code> – 被 keep-alive 缓存的组件停用时调用。</li><li><code>onErrorCaptured</code> – 当捕获一个来自子孙组件的错误时被调用。此钩子会收到三个参数：错误对象、发生错误的组件实例以及一个包含错误来源信息的字符串。此钩子可以返回 false 以阻止该错误继续向上传播。</li></ul></li></ul><h3 id="父子组件渲染、销毁、更新生命周期的情况" tabindex="-1">父子组件渲染、销毁、更新生命周期的情况 <a class="header-anchor" href="#父子组件渲染、销毁、更新生命周期的情况" aria-label="Permalink to &quot;父子组件渲染、销毁、更新生命周期的情况&quot;">​</a></h3><p><strong>一句话 自上而下的创建 自下而上的挂载</strong></p><p><strong>渲染</strong> ** **父 <code>beforeCreate</code> -&gt; 父 <code>created</code> -&gt; 父 <code>beforeMount</code> -&gt; 子 <code>beforeCreate</code> -&gt; 子 <code>created</code> -&gt; 子 <code>beforeMount</code> -&gt; 子 <code>mounted</code> -&gt; 父 <code>mounted</code></p><p><strong>销毁</strong> ** **父 <code>beforeDestroy</code> -&gt; 子 <code>beforeDestroy</code> -&gt; 子 <code>destroyed</code> -&gt; 父 <code>destroyed</code></p><p><strong>更新</strong> ** **父 <code>beforeUpdate</code> -&gt; 子 <code>beforeUpdate</code> -&gt; 子 <code>updated</code> -&gt; 父 <code>updated</code></p><h3 id="异步生命周期" tabindex="-1">异步生命周期 <a class="header-anchor" href="#异步生命周期" aria-label="Permalink to &quot;异步生命周期&quot;">​</a></h3><p><code>async created</code></p><ol><li><strong>组件初始化：</strong></li></ol><p><strong>Vue 创建组件实例，初始化 data、computed、methods 等。</strong></p><ol start="2"><li><strong>进入 created 钩子。</strong></li></ol><p><strong>执行 async created：</strong></p><p><strong>console.log(&#39;created hook start&#39;) 立即执行。</strong></p><ol start="3"><li><strong>遇到 await this.fetchData()，fetchData 是一个返回 Promise 的异步函数。</strong></li></ol><p><strong>await 会暂停 created 钩子的执行，等待 fetchData 的 Promise 完成。</strong></p><ol start="4"><li><strong>等待异步操作完成：</strong></li></ol><p><strong>在 fetchData 的 Promise 完成之前，created 钩子不会继续执行。</strong></p><p><strong>其他生命周期钩子（如 mounted）也不会被触发。</strong></p><ol start="5"><li><strong>异步操作完成：</strong></li></ol><p><strong>fetchData 的 Promise 完成，await 恢复执行。</strong></p><p><strong>console.log(&#39;created hook end&#39;, data) 执行。</strong></p><ol start="6"><li><strong>继续生命周期：</strong></li></ol><p><strong>created 钩子执行完毕后，Vue 会继续执行后续的生命周期钩子（如 mounted）。</strong></p><p><strong>async mounted</strong></p><h2 id="keep-live组件" tabindex="-1">keep-live组件 <a class="header-anchor" href="#keep-live组件" aria-label="Permalink to &quot;keep-live组件&quot;">​</a></h2><p><strong>keep-alive 是 Vue.js 内置的一个抽象组件，用于缓存具有相同组件标签 component 的组件实例，以避免在组件切换时频繁地销毁和重新创建组件实例，从而提高应用程序的性能。</strong></p><p><strong>组件切换过程中，将状态保留再内存中，防止重复污染</strong></p><p><strong>直接包裹</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes catppuccin-latte catppuccin-mocha vp-code" tabindex="0"><code><span class="line"><span>&lt;keep-live&gt;</span></span>
<span class="line"><span>    ...Element</span></span>
<span class="line"><span>&lt;/keep-live&gt;</span></span></code></pre></div><h2 id="v-if和v-for的优先级是什么" tabindex="-1">v-if和v-for的优先级是什么？ <a class="header-anchor" href="#v-if和v-for的优先级是什么" aria-label="Permalink to &quot;v-if和v-for的优先级是什么？&quot;">​</a></h2><p><strong>v-if 是控制元素显示与隐藏</strong> ** <strong>v-for 是遍历组件</strong> ** <strong>v-if和v-for作用于同一组件</strong> ** <strong>Vue2中v-for的优先级更高</strong> ** <strong>Vue3中v-if优先级更高</strong></p><h2 id="为什么data属性是一个函数而不是一个对象" tabindex="-1">为什么data属性是一个函数而不是一个对象？ <a class="header-anchor" href="#为什么data属性是一个函数而不是一个对象" aria-label="Permalink to &quot;为什么data属性是一个函数而不是一个对象？&quot;">​</a></h2><p><strong>在Vue中，data属性可以是对象或者函数</strong></p><p><strong>当data属性为一个对象时，这个对象会被组件实例共享（同个组件被多次引用），因为引用的都是同一个对象地址，这可能会导致不同组件之间的数据相互影响，从而引起一些难以调试的东西。</strong></p><p><strong>当data属性为一个函数时，通过函数return出来的对象，都是一个全新的数据对象，每个组件都拥有独立的数据对象，不会相互影响。</strong></p><h2 id="动态给vue的data添加一个新的属性时会发生什么-怎样解决" tabindex="-1">动态给vue的data添加一个新的属性时会发生什么？怎样解决？ <a class="header-anchor" href="#动态给vue的data添加一个新的属性时会发生什么-怎样解决" aria-label="Permalink to &quot;动态给vue的data添加一个新的属性时会发生什么？怎样解决？&quot;">​</a></h2><p><strong>动态的给data添加一个新的属性，并不会触发数据的响应式操作，也就是或新加入的属性改变时，不会触发响应式，不会触发页面刷新。</strong></p><p><strong>Vue2中是使用Object.defineProperty()去实现的，Vue在初始化的时候会进行这个操作，数据中的每个属性的时候触发get或set操作中触发相关依赖，才会导致视图更新</strong></p><p><strong>也就是说你可以使用强制刷新方法。</strong></p><ul><li><strong>Vue.$set(),向响应式对象中添加一个property,并确保这个新的peoperty也是响应式的且触发视图刷新。</strong></li></ul><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes catppuccin-latte catppuccin-mocha vp-code" tabindex="0"><code><span class="line"><span>    Vue.$set(this.someObj,perporty,newPerportyValue)</span></span></code></pre></div><ul><li><strong>Object.assign() 进行合并对象</strong> ** **混入原有的对象</li></ul><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes catppuccin-latte catppuccin-mocha vp-code" tabindex="0"><code><span class="line"><span>    this.someObj = Object.assign({},this.someObj,{newProperty:newPropertyValue})</span></span></code></pre></div><h2 id="vue中组件和插件有什么区别" tabindex="-1">Vue中组件和插件有什么区别？ <a class="header-anchor" href="#vue中组件和插件有什么区别" aria-label="Permalink to &quot;Vue中组件和插件有什么区别？&quot;">​</a></h2><p><strong>在Vue中，组件和插件都是可重用的代码模块，但它们有一些区别。</strong></p><ul><li><strong>组件</strong> ** <strong>组件是Vue中的基本概念，它是一个可重用的Vue实例，用于封装可复用的HTML元素和相关的JavaScript代码和CSS样式。组件可以拥有自己的状态和生命周期钩子，可以接收父组件传递的数据，也可以向父组件发送事件。</strong> ** <strong>组件通常用于封装具有某种特定功能的UI元素，例如按钮、表单、对话框等。组件可以在应用程序的不同部分中重复使用，从而提高了代码的复用性和可维护性。</strong></li><li><strong>插件</strong> ** <strong>插件是Vue的扩展机制，通过为Vue添加全局功能或功能库，来扩展Vue的能力。插件通常会为Vue添加全局的方法、指令、过滤器、组件等，或者添加全局的功能库，例如路由器、状态管理器等。</strong> ** <strong>插件通常是通过Vue的Vue.use()方法安装到Vue中的。在安装插件时，我们可以为插件传递一些参数或选项，从而定制插件的行为。</strong> ** **需要注意的是，插件通常是全局的，它们会影响到整个Vue应用程序，因此在使用插件时需要谨慎，避免产生不必要的影响和冲突。一般来说，只有在需要全局添加某些功能或库时，才需要使用插件。</li></ul><h2 id="vue组件之间的通信方式都有哪些" tabindex="-1">Vue组件之间的通信方式都有哪些？ <a class="header-anchor" href="#vue组件之间的通信方式都有哪些" aria-label="Permalink to &quot;Vue组件之间的通信方式都有哪些？&quot;">​</a></h2><ul><li><strong>父子组件通信</strong> ** <strong>父组件通过props传递参数给子组件</strong> ** ** 子组件通过emit事件，传递数据给父组件** ** ** 父组件可以$ children来获取子组件的数据以及调用其函数** ** 子组件也可以通过 $parent来获取父组件的数据以及调用函数</li><li><strong>爷孙组件通信</strong> ** <strong>vue中还提供了inject和provide两个选项，可以用于爷孙组件之间的数据传递。这种方式与向下传递prop和向上触发事件的方式不同，它提供了一种在父组件和子孙组件之间建立依赖关系的方式，从而实现跨层级的数据传递。</strong> ** <strong>具体来说，爷组件可以通过provide选项提供数据，然后孙组件可以通过inject选项注入该数据。这样，孙组件就可以在不需要显式的prop和事件传递的情况下，访问爷组件提供的数据。</strong> ** **Grandparent.vue</li></ul><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes catppuccin-latte catppuccin-mocha vp-code" tabindex="0"><code><span class="line"><span>    &lt;template&gt;</span></span>
<span class="line"><span>    &lt;div&gt;</span></span>
<span class="line"><span>        &lt;parent&gt;&lt;/parent&gt;</span></span>
<span class="line"><span>    &lt;/div&gt;</span></span>
<span class="line"><span>    &lt;/template&gt;</span></span>
<span class="line"><span>    &lt;script&gt;</span></span>
<span class="line"><span>    import Parent from &#39;./Parent.vue&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    export default {</span></span>
<span class="line"><span>    components: {</span></span>
<span class="line"><span>        Parent</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>    provide: {</span></span>
<span class="line"><span>        message: &#39;Hello from Grandparent&#39;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    &lt;/script&gt;</span></span></code></pre></div><ul><li><strong>通过Vuex进行通信</strong> ** **vuex详解：</li><li><strong>通过浏览器存储</strong></li><li><strong>通过事件总线或订阅发布进行通信</strong></li></ul><h3 id="完整数据流" tabindex="-1">完整数据流 <a class="header-anchor" href="#完整数据流" aria-label="Permalink to &quot;完整数据流&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes catppuccin-latte catppuccin-mocha vp-code" tabindex="0"><code><span class="line"><span>watchEffect(fn)</span></span>
<span class="line"><span>    ↓ activeEffect = fn → fn() 执行 → 访问 state.xxx</span></span>
<span class="line"><span>    ↓ 触发 Proxy get → dep.depend() → fn 被收集到 subscribers</span></span>
<span class="line"><span></span></span>
<span class="line"><span>state.xxx = newValue</span></span>
<span class="line"><span>    ↓ 触发 Proxy set → dep.notify()</span></span>
<span class="line"><span>    ↓ 遍历 subscribers → 重新执行 fn → 视图更新</span></span></code></pre></div><hr><h3 id="与-vue-2-的区别-加分项" tabindex="-1">与 Vue 2 的区别（加分项） <a class="header-anchor" href="#与-vue-2-的区别-加分项" aria-label="Permalink to &quot;与 Vue 2 的区别（加分项）&quot;">​</a></h3><table tabindex="0"><thead><tr><th></th><th><strong>Vue 2</strong></th><th><strong>Vue 3</strong></th></tr></thead><tbody><tr><td><strong>劫持方式</strong></td><td><code>Object.defineProperty</code></td><td><code>Proxy</code></td></tr><tr><td><strong>新增属性</strong></td><td><strong>无法检测，需</strong> <code>$set</code></td><td><strong>自动检测</strong></td></tr><tr><td><strong>数组变化</strong></td><td><strong>需重写 7 个方法</strong></td><td><strong>自动检测</strong></td></tr><tr><td><strong>性能</strong></td><td><strong>初始化递归遍历所有属性</strong></td><td><strong>懒代理，按需收集</strong></td></tr></tbody></table><hr><h3 id="一句话收尾" tabindex="-1">一句话收尾 <a class="header-anchor" href="#一句话收尾" aria-label="Permalink to &quot;一句话收尾&quot;">​</a></h3><blockquote><p><strong>整个响应式系统的本质是****观察者模式</strong>：<code>reactive</code> 是被观察的数据，<code>watchEffect</code> 注册的 <code>fn</code> 是观察者，<code>Dep</code> 是调度中心，数据变了自动通知所有观察者重新执行。</p></blockquote><h2 id="双向数据绑定是什么" tabindex="-1">双向数据绑定是什么？ <a class="header-anchor" href="#双向数据绑定是什么" aria-label="Permalink to &quot;双向数据绑定是什么？&quot;">​</a></h2><p>**Vue是MVVM M VM V **</p><h2 id="vue中的-nexttick有什么作用" tabindex="-1">Vue中的$nextTick有什么作用？ <a class="header-anchor" href="#vue中的-nexttick有什么作用" aria-label="Permalink to &quot;Vue中的$nextTick有什么作用？&quot;">​</a></h2><p><strong>Vue的响应式不是发生数据后立即变化的，而是按照一定的策略进行DOM更新，这样的好处是可以避免一些不必要的操作，提高渲染性能。</strong> ** **在Vue官方文档中是这样说明的：</p><p><strong>Vue异步执行DOM更新。只要观察到数据变化，Vue将开启一个队列，</strong> ** **并缓冲在同一事件循环中发生的所有数据改变。</p><p><strong>如果同一个watcher被多次触发，只会被推入到队列中一次。这种在缓冲时去除重复数据对于避免不必要的计算和DOM操作上非常重要。</strong> ** <strong>然后，在下一个的事件循环“tick”中，Vue刷新队列并执行实际 (已去重的) 工作。</strong> ** <strong>总之就是放在nextTick中的操作会再DOM更新之后执行</strong> ** **使用:作为参数的函数会进入异步任务中的异步任务队列中</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes catppuccin-latte catppuccin-mocha vp-code" tabindex="0"><code><span class="line"><span>    this.$nextTick(()=&gt;{</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    })</span></span></code></pre></div><p><strong>使用场景：</strong></p><ol><li><strong>在Created里面想要获取DOM操作。</strong></li><li><strong>响应式数据变化之后，想要获取最新的DOM结构</strong></li><li></li></ol><h2 id="说说你对vue的mixin的理解-有什么应用场景" tabindex="-1">说说你对vue的mixin的理解，有什么应用场景？ <a class="header-anchor" href="#说说你对vue的mixin的理解-有什么应用场景" aria-label="Permalink to &quot;说说你对vue的mixin的理解，有什么应用场景？&quot;">​</a></h2><p><strong>mixin就是混入，就是把一些可复用的功能分发下去。</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes catppuccin-latte catppuccin-mocha vp-code" tabindex="0"><code><span class="line"><span>    // src/mixin/index.js</span></span>
<span class="line"><span>    export const mixins = {</span></span>
<span class="line"><span>    data() {</span></span>
<span class="line"><span>        return {};</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>    computed: {},</span></span>
<span class="line"><span>    created() {},</span></span>
<span class="line"><span>    mounted() {},</span></span>
<span class="line"><span>    methods: {},</span></span>
<span class="line"><span>    };</span></span></code></pre></div><ul><li><strong>选项合并</strong> ** <strong>相同类型（如生命周期），先执行mixin混入的代码，再执行组件本身的代码</strong> ** <strong>组件数据冲突，组件本身的数据会覆盖minxin中data的相同属性名的数据</strong> ** **方法冲突也是如此</li><li><strong>优缺点</strong> ** <strong>提高代码复用性、无需传递状态、维护方便</strong> ** <strong>命名冲突、滥用的话难以维护、不好溯源</strong></li></ul><h2 id="说说你对slot的理解-slot使用场景有哪些" tabindex="-1">说说你对slot的理解？slot使用场景有哪些？ <a class="header-anchor" href="#说说你对slot的理解-slot使用场景有哪些" aria-label="Permalink to &quot;说说你对slot的理解？slot使用场景有哪些？&quot;">​</a></h2><ul><li><strong>介绍：它是vue中一种非常重要的机制，主要用于父组件向子组件传递内容的一种方式</strong></li><li><strong>使用：在子组件中定义一些具有特定意义的slot插槽用来占位，父组件在使用子组件的时候，通过插入内容来覆盖子组件中的这些插槽，实现组件的高灵活性</strong></li><li><strong>类型</strong><ol><li><strong>默认插槽</strong></li><li><strong>具名插槽</strong></li><li><strong>作用于插槽</strong></li></ol></li><li><strong>使用场景：</strong><ul><li><strong>插入自定义内容：静态内容和动态内容</strong></li><li><strong>插入组件：按钮、弹窗、提示框</strong></li><li><strong>复杂组件的拆分</strong></li></ul></li></ul><h2 id="vue-observable你有了解过吗-说说看" tabindex="-1">Vue.observable你有了解过吗？说说看 <a class="header-anchor" href="#vue-observable你有了解过吗-说说看" aria-label="Permalink to &quot;Vue.observable你有了解过吗？说说看&quot;">​</a></h2><h2 id="说说你对keep-alive的理解是什么" tabindex="-1">说说你对keep-alive的理解是什么？ <a class="header-anchor" href="#说说你对keep-alive的理解是什么" aria-label="Permalink to &quot;说说你对keep-alive的理解是什么？&quot;">​</a></h2><ul><li><strong>介绍：它是vue中的内置组件，能够在组件切换的过程中将状态保留在内存中，防止重复渲染dom，实质是缓存组件实例，不进行销毁</strong></li><li><strong>生命周期：使用keep-alive包裹的组件，会多出两个生命周期钩子activated和deactivated</strong></li><li><strong>可以设置的props属性：include=&gt;名称匹配的组件才会被缓存；exclude=&gt;名称匹配的组件不会被缓存；max=&gt;组件的最大缓存数量</strong></li><li><strong>使用场景：</strong><ul><li><strong>频繁使用的路由</strong></li><li><strong>频繁使用的组件</strong></li><li><strong>带有状态的组件</strong></li></ul></li></ul><h2 id="vue常用的修饰符有哪些有什么应用场景" tabindex="-1">Vue常用的修饰符有哪些有什么应用场景 <a class="header-anchor" href="#vue常用的修饰符有哪些有什么应用场景" aria-label="Permalink to &quot;Vue常用的修饰符有哪些有什么应用场景&quot;">​</a></h2><ul><li><strong>表单</strong><ol><li><strong>lazy：当光标离开时触发同步</strong></li><li><strong>trim：自动过滤用户输入字符的前置空格</strong></li><li><strong>number：将输入的数据转换成数值类型</strong></li></ol></li><li><strong>事件</strong><ol><li><strong>stop:阻止事件冒泡</strong></li><li><strong>prevent：阻止事件默认行为</strong></li><li><strong>self：只在自身触发事件</strong></li><li><strong>once：只触发一次事件</strong></li><li><strong>caption：从顶层开始往下触发事件</strong></li><li><strong>passive：监听鼠标滚动</strong></li><li><strong>native：监听原生事件</strong></li></ol></li><li><strong>鼠标</strong><ul><li><strong>left</strong></li><li><strong>right</strong></li><li><strong>middle</strong></li></ul></li><li><strong>键盘</strong></li><li><strong>v-bing</strong><ol><li><strong>async</strong></li><li><strong>prop</strong></li><li><strong>camel</strong></li></ol></li></ul><h2 id="你有写过自定义指令吗-自定义指令的应用场景有哪些" tabindex="-1">你有写过自定义指令吗？自定义指令的应用场景有哪些？ <a class="header-anchor" href="#你有写过自定义指令吗-自定义指令的应用场景有哪些" aria-label="Permalink to &quot;你有写过自定义指令吗？自定义指令的应用场景有哪些？&quot;">​</a></h2><ul><li><strong>介绍：vue中提供了很多数据驱动视图更加方便的操作，这些操作也被称为指令。我们常见的v-开头的行内属性就是指令，不同指令完成不同的功能</strong></li><li><strong>如何实现：</strong><ul><li><strong>全局注册：通过Vue.directive（）方法注册：第一个参数的指令名称，第二个参数是一个数据对象，也可以是一个指令函数</strong></li><li><strong>局部注册：就是在组件的options选项中设置directive属性，参数类型和全局注册一样</strong></li></ul></li><li><strong>常见场景：</strong><ul><li><strong>输入框自动聚焦</strong></li><li><strong>表单限制输入</strong></li><li><strong>图片懒加载</strong></li><li><strong>滚动加载</strong></li><li><strong>绑定节流</strong></li></ul></li></ul><h2 id="vue中的过滤器了解吗-过滤器的应用场景有哪些" tabindex="-1">Vue中的过滤器了解吗？过滤器的应用场景有哪些？ <a class="header-anchor" href="#vue中的过滤器了解吗-过滤器的应用场景有哪些" aria-label="Permalink to &quot;Vue中的过滤器了解吗？过滤器的应用场景有哪些？&quot;">​</a></h2><h2 id="什么是虚拟dom-如何实现一个虚拟dom-说说你的思路" tabindex="-1">什么是虚拟DOM？如何实现一个虚拟DOM？说说你的思路 <a class="header-anchor" href="#什么是虚拟dom-如何实现一个虚拟dom-说说你的思路" aria-label="Permalink to &quot;什么是虚拟DOM？如何实现一个虚拟DOM？说说你的思路&quot;">​</a></h2><p><a href="https://juejin.cn/post/7173809965772046350#heading-13" target="_blank" rel="noreferrer">参考文章</a></p><p><strong>虚拟DOM本身是JavaScript对象模拟dom对象，通过不同的属性去描述视图结构</strong></p><ol><li><strong>目的是减少操作真实DOM的次数，提高性能</strong></li></ol><p><strong>前端性能优化一个重要的方向就是尽可能少的减少操作DOM,不仅仅是DOM相对比较慢。因为频繁的变动DOM会造成</strong> ** **浏览器的回流与重绘。</p><p><strong>vDom如何形成</strong> ** ** compile编译** ** <strong>template(-&gt; AST -&gt;) =&gt; render Function =&gt; VNode(虚拟DOM) =&gt;（patch过程）真实DOM</strong></p><p><strong>vnode</strong></p><ul><li><strong>tag</strong></li><li><strong>attrs</strong></li><li><strong>childred</strong></li></ul><ol start="2"><li><strong>方便跨平台</strong></li></ol><p><strong>同一vnode节点可以渲染成不同平台上对应的内容</strong></p><h2 id="用js对象来描述dom" tabindex="-1">用JS对象来描述DOM <a class="header-anchor" href="#用js对象来描述dom" aria-label="Permalink to &quot;用JS对象来描述DOM&quot;">​</a></h2><h2 id="虚拟dom更新视图流程" tabindex="-1">虚拟DOM更新视图流程 <a class="header-anchor" href="#虚拟dom更新视图流程" aria-label="Permalink to &quot;虚拟DOM更新视图流程&quot;">​</a></h2><p><strong>用JavaScript对象来表示真实的DOM,DOM与DOM节点之间形成一个DOM树</strong> ** <strong>数据发生改变，需要更新视图，会采用diff算法比较新旧DOM树</strong> ** <strong>最终只会更新差异的部分在真实的DOM树上</strong></p><p><strong>我们在Vue中尝尝写一些模板template =&gt; ast =&gt; render()形成虚拟DOM =&gt;真实DOM</strong> ** <strong>数据发生改变时，需要必将这一次与上一次的渲染结果，也就是比较两次的虚拟DOM树</strong> ** <strong>比较过程：</strong></p><p><strong>patch是一个递归过程、深度优先、同层比较的策略</strong></p><ul><li><strong>新旧节点进行比较是否相同，相同就就行下一步，不相同就进行节点的替换或者插入操作</strong></li><li><strong>对相同节点的属性进行判断，如果属性发生变化，就进行更新</strong></li><li><strong>对子节点进行递归比较，如果子节点有变化就进行更新或者删除</strong></li><li><strong>对旧节点剩余的节点进行删除操作</strong></li></ul><h2 id="你了解vue的diff算法吗-说说看" tabindex="-1">你了解vue的diff算法吗？说说看 <a class="header-anchor" href="#你了解vue的diff算法吗-说说看" aria-label="Permalink to &quot;你了解vue的diff算法吗？说说看&quot;">​</a></h2><p><strong>Vue Diff算法</strong></p><p><strong>组件内响应式数据发生变更触发实例执行其更新函数、更新函数会再次执行render函数获取最新的虚拟DOM</strong> ** **然后执行patch函数，并传入两次的虚拟DOM, 通过Diff算法比较二者变化的地方、最后将其转化为真实DOM</p><p><strong>diff的过程就是调用名为patch的函数，比较新旧节点，一边比较一边给真实的DOM打补丁</strong></p><p><strong>diff算法的优化</strong></p><ul><li><strong>避免使用</strong> <code>index</code>作为唯一的 <code>key</code>，尽可能使用具有唯一性的标识符作为 <code>key</code></li><li><strong>尽可能减少</strong> <code>dom</code>的嵌套层级和节点的数量，较少 <code>diff</code>算法的计算</li><li><strong>尽量减少频繁增删节点，适当使用</strong> <code>v-show</code>和 <code>v-if</code>控制节点的显示和隐藏</li></ul><p><code>Diff</code>** 算法的核心思想是Diff就是将新老虚拟**<code>DOM</code><strong>的不同点找到并生成一个补丁，并根据这个补丁生成更新操作，以最小化对实际 <strong><code>DOM</code></strong> 的操作，提高页面渲染的性能和效率</strong></p><p><strong><code>&lt;!-- 这是一张图片，ocr 内容为： --&gt;</code></strong></p><h2 id="你知道vue中key的原理吗-说说你对它的理解" tabindex="-1">你知道vue中key的原理吗？说说你对它的理解 <a class="header-anchor" href="#你知道vue中key的原理吗-说说你对它的理解" aria-label="Permalink to &quot;你知道vue中key的原理吗？说说你对它的理解&quot;">​</a></h2><p><strong>在</strong> <code>Vue</code>中，<code>key</code>是用来帮助 <code>Vue</code>识别节点的优化手段，<code>v-for</code>或者 <code>diff</code>算法中同层比较的时候，都是会利用 <code>key</code> ** <strong>来比较新旧元素，尽可能复用已有的元素。</strong> ** <code>key</code>是给每一个 <code>vnode</code>的唯一 <code>id</code>，也是diff的一种优化策略，可以根据 <code>key</code>，更准确， 更快的找到对应的 <code>vnode</code>节点</p><h2 id="推荐视频" tabindex="-1">推荐视频 <a class="header-anchor" href="#推荐视频" aria-label="Permalink to &quot;推荐视频&quot;">​</a></h2><p><a href="https://www.bilibili.com/video/BV1JR4y1R7Ln/?spm_id_from=333.337.search-card.all.click&amp;vd_source=47023a100ba46e5d45102053f162239a" target="_blank" rel="noreferrer">6分钟彻底掌握vue的diff算法，前端面试不再怕！</a></p><h2 id="vue项目中有封装过axios吗-主要是封装哪方面的" tabindex="-1">Vue项目中有封装过axios吗？主要是封装哪方面的？ <a class="header-anchor" href="#vue项目中有封装过axios吗-主要是封装哪方面的" aria-label="Permalink to &quot;Vue项目中有封装过axios吗？主要是封装哪方面的？&quot;">​</a></h2><h2 id="你了解axios的原理吗-有看过它的源码吗" tabindex="-1">你了解axios的原理吗？有看过它的源码吗？ <a class="header-anchor" href="#你了解axios的原理吗-有看过它的源码吗" aria-label="Permalink to &quot;你了解axios的原理吗？有看过它的源码吗？&quot;">​</a></h2><h2 id="ssr解决了什么问题-有做过ssr吗-你是怎么做的" tabindex="-1">SSR解决了什么问题？有做过SSR吗？你是怎么做的？ <a class="header-anchor" href="#ssr解决了什么问题-有做过ssr吗-你是怎么做的" aria-label="Permalink to &quot;SSR解决了什么问题？有做过SSR吗？你是怎么做的？&quot;">​</a></h2><h2 id="说下你的vue项目的目录结构-如果是大型项目你该怎么划分结构和划分组件呢" tabindex="-1">说下你的vue项目的目录结构，如果是大型项目你该怎么划分结构和划分组件呢？ <a class="header-anchor" href="#说下你的vue项目的目录结构-如果是大型项目你该怎么划分结构和划分组件呢" aria-label="Permalink to &quot;说下你的vue项目的目录结构，如果是大型项目你该怎么划分结构和划分组件呢？&quot;">​</a></h2><h2 id="vue要做权限管理该怎么做-如果控制到按钮级别的权限怎么做" tabindex="-1">vue要做权限管理该怎么做？如果控制到按钮级别的权限怎么做？ <a class="header-anchor" href="#vue要做权限管理该怎么做-如果控制到按钮级别的权限怎么做" aria-label="Permalink to &quot;vue要做权限管理该怎么做？如果控制到按钮级别的权限怎么做？&quot;">​</a></h2><h2 id="vue项目中你是如何解决跨域的呢" tabindex="-1">Vue项目中你是如何解决跨域的呢？ <a class="header-anchor" href="#vue项目中你是如何解决跨域的呢" aria-label="Permalink to &quot;Vue项目中你是如何解决跨域的呢？&quot;">​</a></h2><p><strong>跨域的本质是浏览器基于同源策略的一种安全手段</strong></p><p><strong>同源策略是指</strong></p><ul><li><strong>协议相同</strong></li><li><strong>主机相同</strong></li><li><strong>端口相同</strong></li></ul><p><strong>跨域的解决办法</strong></p><ol><li><strong>jsonp</strong> ** **但是只能处理get请求</li><li><strong>CROS</strong> ** <strong>CROS是一个系统，它是由一系列传输的HTTP头组成的，这些HTTP请求头决定浏览器是否阻止前端JavaScript代码获取跨域请求的响应</strong> ** ** 也就是让后端实现跨域**</li><li><strong>代理</strong> ** **webpack会起一个本地服务器进行请求代理转发</li></ol><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes catppuccin-latte catppuccin-mocha vp-code" tabindex="0"><code><span class="line"><span>     module.exports = {</span></span>
<span class="line"><span>         devServer: {</span></span>
<span class="line"><span>             host: &#39;127.0.0.1&#39;,</span></span>
<span class="line"><span>             port: 8084,</span></span>
<span class="line"><span>             open: true,// vue项目启动时自动打开浏览器</span></span>
<span class="line"><span>             proxy: {</span></span>
<span class="line"><span>                 &#39;/api&#39;: {</span><span> // &#39;/api&#39;是代理标识，用于告诉node，url前面是/api的就是使用代理的</span></span>
<span class="line"><span>                     target: &quot;http://xxx.xxx.xx.xx:8080&quot;, //目标地址，一般是指后台服务器地址</span></span>
<span class="line"><span>                     changeOrigin: true, //是否跨域</span></span>
<span class="line"><span>                     pathRewrite: { // pathRewrite 的作用是把实际Request Url中的&#39;/api&#39;用&quot;&quot;代替</span></span>
<span class="line"><span>                         &#39;^/api&#39;: &quot;&quot; </span></span>
<span class="line"><span>                     }</span></span>
<span class="line"><span>                 }</span></span>
<span class="line"><span>             }</span></span>
<span class="line"><span>         }</span></span>
<span class="line"><span>     }</span></span></code></pre></div><ol start="4"><li><strong>服务端进行请求转发</strong></li></ol><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes catppuccin-latte catppuccin-mocha vp-code" tabindex="0"><code><span class="line"><span>    var express = require(&#39;express&#39;);</span></span>
<span class="line"><span>    const proxy = require(&#39;http-proxy-middleware&#39;)</span></span>
<span class="line"><span>    const app = express()</span></span>
<span class="line"><span>    app.use(express.static(__dirname + &#39;/&#39;))</span></span>
<span class="line"><span>    app.use(&#39;/api&#39;, proxy({ target: &#39;http://localhost:4000&#39;, changeOrigin: false</span></span>
<span class="line"><span>                        }));</span></span>
<span class="line"><span>    module.exports = app</span></span></code></pre></div><ol start="5"><li><strong>nginx实现代理</strong></li></ol><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes catppuccin-latte catppuccin-mocha vp-code" tabindex="0"><code><span class="line"><span>    server {</span></span>
<span class="line"><span>    listen    80;</span></span>
<span class="line"><span>    # server_name www.josephxia.com;</span></span>
<span class="line"><span>    location / {</span></span>
<span class="line"><span>        root  /var/www/html;</span></span>
<span class="line"><span>        index  index.html index.htm;</span></span>
<span class="line"><span>        try_files $uri $uri/ /index.html;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    location /api {</span></span>
<span class="line"><span>        proxy_pass  http://127.0.0.1:3000;</span></span>
<span class="line"><span>        proxy_redirect   off;</span></span>
<span class="line"><span>        proxy_set_header  Host       $host;</span></span>
<span class="line"><span>        proxy_set_header  X-Real-IP     $remote_addr;</span></span>
<span class="line"><span>        proxy_set_header  X-Forwarded-For  $proxy_add_x_forwarded_for;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="vue项目本地开发完成后部署到服务器后报404是什么原因呢" tabindex="-1">vue项目本地开发完成后部署到服务器后报404是什么原因呢？ <a class="header-anchor" href="#vue项目本地开发完成后部署到服务器后报404是什么原因呢" aria-label="Permalink to &quot;vue项目本地开发完成后部署到服务器后报404是什么原因呢？&quot;">​</a></h2><h2 id="你是怎么处理vue项目中的错误的" tabindex="-1">你是怎么处理vue项目中的错误的？ <a class="header-anchor" href="#你是怎么处理vue项目中的错误的" aria-label="Permalink to &quot;你是怎么处理vue项目中的错误的？&quot;">​</a></h2><h2 id="vue3有了解过吗-能说说跟vue2的区别吗-新特性" tabindex="-1">vue3有了解过吗？能说说跟vue2的区别吗(新特性)？ <a class="header-anchor" href="#vue3有了解过吗-能说说跟vue2的区别吗-新特性" aria-label="Permalink to &quot;vue3有了解过吗？能说说跟vue2的区别吗(新特性)？&quot;">​</a></h2><ol><li><strong>composition API</strong></li><li><strong>SFC ComPosition API 语法糖</strong></li></ol><p><strong>框架层面</strong></p><ol><li><strong>基于Proxy的响应式系统</strong></li><li></li></ol><h2 id="选项式api与组合式api" tabindex="-1">选项式API与组合式API <a class="header-anchor" href="#选项式api与组合式api" aria-label="Permalink to &quot;选项式API与组合式API&quot;">​</a></h2><h2 id="ref和reactive" tabindex="-1">ref和reactive <a class="header-anchor" href="#ref和reactive" aria-label="Permalink to &quot;ref和reactive&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes catppuccin-latte catppuccin-mocha vp-code" tabindex="0"><code><span class="line"><span>- 作用</span></span>
<span class="line"><span>- 源码实现</span></span>
<span class="line"><span>    - ref</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    - reactive</span></span></code></pre></div><h2 id="生命周期" tabindex="-1">生命周期 <a class="header-anchor" href="#生命周期" aria-label="Permalink to &quot;生命周期&quot;">​</a></h2><h2 id="watch和computed" tabindex="-1">watch和computed <a class="header-anchor" href="#watch和computed" aria-label="Permalink to &quot;watch和computed&quot;">​</a></h2><h2 id="组件通信" tabindex="-1">组件通信 <a class="header-anchor" href="#组件通信" aria-label="Permalink to &quot;组件通信&quot;">​</a></h2><ul><li><strong>父子通信</strong> ** **props、emit、ref、$parent</li><li><strong>兄弟组件通信</strong> ** **事件总线、第三方</li><li><strong>边界知识： provide/inject/$attrs</strong></li><li><strong>VueX、浏览器存储（共享信息）</strong></li></ul><p><strong>关于provide注意</strong></p><p><strong>provide的第二个参数作为导出的值可以是任意参数(非相响应式或响应式)</strong> ** <strong>provide只能够向下进行传递数据</strong> ** <strong>在使用provide和inject的时候需从vue中引入</strong></p><h2 id="路由" tabindex="-1">路由 <a class="header-anchor" href="#路由" aria-label="Permalink to &quot;路由&quot;">​</a></h2><h2 id="快速上手vuex-到-手写简易-vuex" tabindex="-1">快速上手Vuex 到 手写简易 Vuex <a class="header-anchor" href="#快速上手vuex-到-手写简易-vuex" aria-label="Permalink to &quot;快速上手Vuex 到 手写简易 Vuex&quot;">​</a></h2><p><strong>使用VueX的好处</strong></p><ul><li><strong>能够在VueX集中管理数据，易于开发和后期维护</strong></li><li><strong>能够高效地实现组件之间的数据共享，提高开发效率</strong></li><li><strong>在 vuex 中的数据都是响应式的</strong> ** **VueX的基础使用</li><li><strong>state</strong> ** <strong>存放数据</strong> ** <strong>取state两种方式:</strong></li></ul><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes catppuccin-latte catppuccin-mocha vp-code" tabindex="0"><code><span class="line"><span>    this.$store.state.perportyName</span></span></code></pre></div><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes catppuccin-latte catppuccin-mocha vp-code" tabindex="0"><code><span class="line"><span>    ...mapState([perpoetyName1,perportyName2])</span></span></code></pre></div><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes catppuccin-latte catppuccin-mocha vp-code" tabindex="0"><code><span class="line"><span>- 方式一</span></span>
<span class="line"><span>- 方式二</span></span></code></pre></div><ul><li><strong>mutation</strong> ** <strong>Store 中的状态不能直接对其进行操作，我们得使用 Mutation 来对 Store 中的状态进行修改，虽然看起来有些繁琐，但是方便集中监控数据的变化</strong> ** <strong>state的更新必须是Mutation来处理</strong> ** **两种触发方式 <ul><li><strong>方式一</strong></li></ul></li></ul><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes catppuccin-latte catppuccin-mocha vp-code" tabindex="0"><code><span class="line"><span>    this.$store.commit(funName)</span></span></code></pre></div><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes catppuccin-latte catppuccin-mocha vp-code" tabindex="0"><code><span class="line"><span>- 方式二</span></span></code></pre></div><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes catppuccin-latte catppuccin-mocha vp-code" tabindex="0"><code><span class="line"><span>    ...mapMutations([funName1,funName2])</span></span></code></pre></div><ul><li><strong>action</strong> ** <strong>异步调用的方式</strong> ** <strong>action =&gt; mutation =&gt; state</strong> ** **调用方式</li></ul><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes catppuccin-latte catppuccin-mocha vp-code" tabindex="0"><code><span class="line"><span>    this.$store.dispatch()</span></span></code></pre></div><p>** 方式二**</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes catppuccin-latte catppuccin-mocha vp-code" tabindex="0"><code><span class="line"><span>    mapAction([actionFun1,actionFun2])</span></span></code></pre></div><ul><li><strong>getter</strong> ** **Getter类似于计算属性，但是我们的数据来源是state</li></ul><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes catppuccin-latte catppuccin-mocha vp-code" tabindex="0"><code><span class="line"><span>    state: {</span></span>
<span class="line"><span>        name:&#39;xxx&#39;,</span></span>
<span class="line"><span>        getter:{</span></span>
<span class="line"><span>            // state作为第一个参数，可调用上面的state里面的数据</span></span>
<span class="line"><span>            myname(state){</span></span>
<span class="line"><span>                return &quot;我的名字是&quot;+state.name</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span></code></pre></div><p>** 组件引入方式**</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes catppuccin-latte catppuccin-mocha vp-code" tabindex="0"><code><span class="line"><span>    this.$store.getters.myname</span></span></code></pre></div><p>** 第二种**</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes catppuccin-latte catppuccin-mocha vp-code" tabindex="0"><code><span class="line"><span>    mapGetters([&#39;myname&#39;])</span></span></code></pre></div><ul><li><strong>module</strong> ** **state数据过多时，就会变得难以管理，VueX允许将store分成不同的模块，每个模块都有属于自己的state等</li></ul><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes catppuccin-latte catppuccin-mocha vp-code" tabindex="0"><code><span class="line"><span>    const state = {}</span></span>
<span class="line"><span>    const mutations = {}</span></span>
<span class="line"><span>    const actions = {}</span></span>
<span class="line"><span>    const getter = {}</span></span>
<span class="line"><span>    export default {</span></span>
<span class="line"><span>        state,</span></span>
<span class="line"><span>        mutations,</span></span>
<span class="line"><span>        actions,</span></span>
<span class="line"><span>        getter</span></span>
<span class="line"><span>    }</span></span></code></pre></div><p>** index.js**</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes catppuccin-latte catppuccin-mocha vp-code" tabindex="0"><code><span class="line"><span>    import Home from &#39;./Home&#39;</span></span>
<span class="line"><span>    import Search from &#39;./Search&#39;</span></span>
<span class="line"><span>    export default new Vuex.Store({</span></span>
<span class="line"><span>    state: {</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>    mutations: {</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>    actions: {</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>    modules: {</span></span>
<span class="line"><span>        Home,      //</span></span>
<span class="line"><span>        Search</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    })</span></span></code></pre></div><h2 id="vue性能优化" tabindex="-1">Vue性能优化 <a class="header-anchor" href="#vue性能优化" aria-label="Permalink to &quot;Vue性能优化&quot;">​</a></h2><h2 id="vue-从template到render发生了什么" tabindex="-1">Vue 从template到render发生了什么？ <a class="header-anchor" href="#vue-从template到render发生了什么" aria-label="Permalink to &quot;Vue 从template到render发生了什么？&quot;">​</a></h2><p><strong>Vue中有个编译模块=&gt; &#39;compiler&#39;, 它的主要作用就是将template编译为js中可执行的render函数</strong></p><p><strong>Vue编辑器会对template先进行解析，这一步成为parse, 结束之后会得到一个JS对象，我们成为抽象语法树AST，然后是对AST进行深加工的转换过程，然后是对AST进行深加工的转换过程，这一步成为transform,最后将得到的AST生成为JS代码，也就是render函数</strong></p><h2 id="v-model原理" tabindex="-1">v-model原理 <a class="header-anchor" href="#v-model原理" aria-label="Permalink to &quot;v-model原理&quot;">​</a></h2><p><strong>v-model是语法糖，用来监听用户事件以更新数据，绑定组件里面的数据</strong></p><p><strong>如果绑定一个不存在的属性，vue会加上这个响应式</strong></p><p><strong>双向绑定</strong></p><h2 id="生命周期-1" tabindex="-1">生命周期 <a class="header-anchor" href="#生命周期-1" aria-label="Permalink to &quot;生命周期&quot;">​</a></h2><h2 id="ref" tabindex="-1">ref <a class="header-anchor" href="#ref" aria-label="Permalink to &quot;ref&quot;">​</a></h2><h2 id="reactive" tabindex="-1">reactive <a class="header-anchor" href="#reactive" aria-label="Permalink to &quot;reactive&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes catppuccin-latte catppuccin-mocha vp-code" tabindex="0"><code><span class="line"><span> // --------------- reactive 模块 --------------- </span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>     * 收集所有依赖的 WeakMap 实例：</span></span>
<span class="line"><span>     * 1. \`key\`：响应性对象</span></span>
<span class="line"><span>     * 2. \`value\`：\`Map\` 对象</span></span>
<span class="line"><span>     * 		1. \`key\`：响应性对象的指定属性</span></span>
<span class="line"><span>     * 		2. \`value\`：指定对象的指定属性的 执行函数</span></span>
<span class="line"><span>     */</span></span>
<span class="line"><span>    const targetMap = new WeakMap()</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>     * 收集依赖</span></span>
<span class="line"><span>     */</span></span>
<span class="line"><span>    function track(target, key) {</span></span>
<span class="line"><span>        // 如果当前不存在执行函数，则直接 return</span></span>
<span class="line"><span>        if (!activeEffect) return</span></span>
<span class="line"><span>        // 尝试从 targetMap 中，根据 target 获取 map</span></span>
<span class="line"><span>        let depsMap = targetMap.get(target)</span></span>
<span class="line"><span>        // 如果获取到的 map 不存在，则生成新的 map 对象，并把该对象赋值给对应的 value</span></span>
<span class="line"><span>        if (!depsMap) {</span></span>
<span class="line"><span>            targetMap.set(target, (depsMap = new Map()))</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        // 获取指定 key 的 dep</span></span>
<span class="line"><span>        let dep = depsMap.get(key)</span></span>
<span class="line"><span>        // 如果 dep 不存在，则生成一个新的 dep，并放入到 depsMap 中</span></span>
<span class="line"><span>        if (!dep) {</span></span>
<span class="line"><span>            depsMap.set(key, (dep = new Set()))</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        // 把所有的 activeEffect 方法加入到 dep 中</span></span>
<span class="line"><span>        dep.add(activeEffect)</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>     * 触发依赖</span></span>
<span class="line"><span>     */</span></span>
<span class="line"><span>    function trigger(target, key) {</span></span>
<span class="line"><span>        // 依据 target 获取存储的 map 实例</span></span>
<span class="line"><span>        const depsMap = targetMap.get(target)</span></span>
<span class="line"><span>        // 如果 map 不存在，则直接 return</span></span>
<span class="line"><span>        if (!depsMap) {</span></span>
<span class="line"><span>            return</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        // 依据指定的 key，获取 dep 实例</span></span>
<span class="line"><span>        let dep = depsMap.get(key)</span></span>
<span class="line"><span>        // dep 不存在则直接 return</span></span>
<span class="line"><span>        if (!dep) {</span></span>
<span class="line"><span>            return</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        // 触发 dep</span></span>
<span class="line"><span>        triggerEffects(dep)</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>     * 依次触发 dep 中保存的依赖</span></span>
<span class="line"><span>     */</span></span>
<span class="line"><span>    function triggerEffects(dep) {</span></span>
<span class="line"><span>        // 把 dep 构建为一个数组</span></span>
<span class="line"><span>        const effects = Array.isArray(dep) ? dep : [...dep]</span></span>
<span class="line"><span>        // 依次触发</span></span>
<span class="line"><span>        for (const effect of effects) {</span></span>
<span class="line"><span>            effect.run()</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>     * proxy 的 handler</span></span>
<span class="line"><span>     */</span></span>
<span class="line"><span>    const baseHandlers = {</span></span>
<span class="line"><span>        get: (target, key, receiver) =&gt; {</span></span>
<span class="line"><span>            // 利用 Reflect 得到返回值</span></span>
<span class="line"><span>            const res = Reflect.get(target, key, receiver)</span></span>
<span class="line"><span>            // 收集依赖</span></span>
<span class="line"><span>            track(target, key)</span></span>
<span class="line"><span>            return res</span></span>
<span class="line"><span>        },</span></span>
<span class="line"><span>        set: (target, key, value, receiver) =&gt; {</span></span>
<span class="line"><span>            // 利用 Reflect.set 设置新值</span></span>
<span class="line"><span>            const result = Reflect.set(target, key, value, receiver)</span></span>
<span class="line"><span>            // 触发依赖</span></span>
<span class="line"><span>            trigger(target, key)</span></span>
<span class="line"><span>            return result</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    function reactive(target) {</span></span>
<span class="line"><span>        const proxy = new Proxy(target, baseHandlers)</span></span>
<span class="line"><span>        return proxy</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // --------------- ref 模块 --------------- </span></span>
<span class="line"><span>    class RefImpl {</span></span>
<span class="line"><span>        _rawValue</span></span>
<span class="line"><span>        _value</span></span>
<span class="line"><span>        dep</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        constructor(value) {</span></span>
<span class="line"><span>            // 原始数据</span></span>
<span class="line"><span>            this._rawValue = value</span></span>
<span class="line"><span>            this._value = value</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        /**</span></span>
<span class="line"><span>         * get 语法将对象属性绑定到查询该属性时将被调用的函数。</span></span>
<span class="line"><span>         * 即：xxx.value 时触发该函数</span></span>
<span class="line"><span>         */</span></span>
<span class="line"><span>        get value() {</span></span>
<span class="line"><span>            // 收集依赖</span></span>
<span class="line"><span>            if (activeEffect) {</span></span>
<span class="line"><span>                const dep = ref.dep || (ref.dep = new Set())</span></span>
<span class="line"><span>                dep.add(activeEffect)</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>            return this._value</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        set value(newVal) {</span></span>
<span class="line"><span>            /**</span></span>
<span class="line"><span>             * newVal 为新数据</span></span>
<span class="line"><span>             * this._rawValue 为旧数据（原始数据）</span></span>
<span class="line"><span>             * 对比两个数据是否发生了变化</span></span>
<span class="line"><span>             */</span></span>
<span class="line"><span>            // 更新原始数据</span></span>
<span class="line"><span>            this._rawValue = newVal</span></span>
<span class="line"><span>            this._value = newVal</span></span>
<span class="line"><span>            // 触发依赖</span></span>
<span class="line"><span>            if (ref.dep) {</span></span>
<span class="line"><span>                triggerEffects(ref.dep)</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>     * ref 函数</span></span>
<span class="line"><span>     * @param value unknown</span></span>
<span class="line"><span>     */</span></span>
<span class="line"><span>    function ref(value) {</span></span>
<span class="line"><span>        return new RefImpl(value)</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // --------------- effect 模块 --------------- </span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 当前需要执行的 effect</span></span>
<span class="line"><span>    let activeEffect</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>     * 响应性触发依赖时的执行类</span></span>
<span class="line"><span>     */</span></span>
<span class="line"><span>    class ReactiveEffect {</span></span>
<span class="line"><span>        constructor(fn) {</span></span>
<span class="line"><span>            this.fn = fn</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        run() {</span></span>
<span class="line"><span>            // 为 activeEffect 赋值</span></span>
<span class="line"><span>            activeEffect = this</span></span>
<span class="line"><span></span></span>
<span class="line"><span>            // 执行 fn 函数</span></span>
<span class="line"><span>            return this.fn()</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>     * effect 函数</span></span>
<span class="line"><span>     * @param fn 执行方法</span></span>
<span class="line"><span>     * @returns 以 ReactiveEffect 实例为 this 的执行函数</span></span>
<span class="line"><span>     */</span></span>
<span class="line"><span>    function effect(fn) {</span></span>
<span class="line"><span>        // 生成 ReactiveEffect 实例</span></span>
<span class="line"><span>        const _effect = new ReactiveEffect(fn)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        // 执行 run 函数</span></span>
<span class="line"><span>        _effect.run()</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>    //  --------------- 测试 ref --------------- </span></span>
<span class="line"><span>    const name = ref(&#39;张三&#39;)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 调用 effect 方法</span></span>
<span class="line"><span>    effect(() =&gt; {</span></span>
<span class="line"><span>        document.querySelector(&#39;#app&#39;).innerText = name.value</span></span>
<span class="line"><span>    })</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    setTimeout(() =&gt; {</span></span>
<span class="line"><span>        name.value = &#39;李四&#39;</span></span>
<span class="line"><span>    }, 2000);</span></span></code></pre></div><h2 id="最长递增子序列" tabindex="-1">最长递增子序列 <a class="header-anchor" href="#最长递增子序列" aria-label="Permalink to &quot;最长递增子序列&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes catppuccin-latte catppuccin-mocha vp-code" tabindex="0"><code><span class="line"><span>/**</span></span>
<span class="line"><span> * 获取最长递增子序列下标</span></span>
<span class="line"><span> * 维基百科：https://en.wikipedia.org/wiki/Longest_increasing_subsequence</span></span>
<span class="line"><span> * 百度百科：https://baike.baidu.com/item/%E6%9C%80%E9%95%BF%E9%80%92%E5%A2%9E%E5%AD%90%E5%BA%8F%E5%88%97/22828111</span></span>
<span class="line"><span> */</span></span>
<span class="line"><span>function getSequence(arr) {</span></span>
<span class="line"><span>    // 获取一个数组浅拷贝。注意 p 的元素改变并不会影响 arr</span></span>
<span class="line"><span>    // p 是一个最终的回溯数组，它会在最终的 result 回溯中被使用</span></span>
<span class="line"><span>    // 它会在每次 result 发生变化时，记录 result 更新前最后一个索引的值</span></span>
<span class="line"><span>    const p = arr.slice()</span></span>
<span class="line"><span>    // 定义返回值（最长递增子序列下标），因为下标从 0 开始，所以它的初始值为 0</span></span>
<span class="line"><span>    const result = [0]</span></span>
<span class="line"><span>    let i, j, u, v, c</span></span>
<span class="line"><span>    // 当前数组的长度</span></span>
<span class="line"><span>    const len = arr.length</span></span>
<span class="line"><span>    // 对数组中所有的元素进行 for 循环处理，i = 下标</span></span>
<span class="line"><span>    for (i = 0; i &lt; len; i++) {</span></span>
<span class="line"><span>        // 根据下标获取当前对应元素</span></span>
<span class="line"><span>        const arrI = arr[i]</span></span>
<span class="line"><span>        // </span></span>
<span class="line"><span>        if (arrI !== 0) {</span></span>
<span class="line"><span>            // 获取 result 中的最后一个元素，即：当前 result 中保存的最大值的下标</span></span>
<span class="line"><span>            j = result[result.length - 1]</span></span>
<span class="line"><span>            // arr[j] = 当前 result 中所保存的最大值</span></span>
<span class="line"><span>            // arrI = 当前值</span></span>
<span class="line"><span>            // 如果 arr[j] &lt; arrI 。那么就证明，当前存在更大的序列，那么该下标就需要被放入到 result 的最后位置</span></span>
<span class="line"><span>            if (arr[j] &lt; arrI) {</span></span>
<span class="line"><span>                p[i] = j</span></span>
<span class="line"><span>                // 把当前的下标 i 放入到 result 的最后位置</span></span>
<span class="line"><span>                result.push(i)</span></span>
<span class="line"><span>                continue</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>            // 不满足 arr[j] &lt; arrI 的条件，就证明目前 result 中的最后位置保存着更大的数值的下标。</span></span>
<span class="line"><span>            // 但是这个下标并不一定是一个递增的序列，比如： [1, 3] 和 [1, 2] </span></span>
<span class="line"><span>            // 所以我们还需要确定当前的序列是递增的。</span></span>
<span class="line"><span>            // 计算方式就是通过：二分查找来进行的</span></span>
<span class="line"><span></span></span>
<span class="line"><span>            // 初始下标</span></span>
<span class="line"><span>            u = 0</span></span>
<span class="line"><span>            // 最终下标</span></span>
<span class="line"><span>            v = result.length - 1</span></span>
<span class="line"><span>            // 只有初始下标 &lt; 最终下标时才需要计算</span></span>
<span class="line"><span>            while (u &lt; v) {</span></span>
<span class="line"><span>                // (u + v) 转化为 32 位 2 进制，右移 1 位 === 取中间位置（向下取整）例如：8 &gt;&gt; 1 = 4;  9 &gt;&gt; 1 = 4; 5 &gt;&gt; 1 = 2</span></span>
<span class="line"><span>                // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Right_shift</span></span>
<span class="line"><span>                // c 表示中间位。即：初始下标 + 最终下标 / 2 （向下取整）</span></span>
<span class="line"><span>                c = (u + v) &gt;&gt; 1</span></span>
<span class="line"><span>                // 从 result 中根据 c（中间位），取出中间位的下标。</span></span>
<span class="line"><span>                // 然后利用中间位的下标，从 arr 中取出对应的值。</span></span>
<span class="line"><span>                // 即：arr[result[c]] = result 中间位的值</span></span>
<span class="line"><span>                // 如果：result 中间位的值 &lt; arrI，则 u（初始下标）= 中间位 + 1。即：从中间向右移动一位，作为初始下标。 （下次直接从中间开始，往后计算即可）</span></span>
<span class="line"><span>                if (arr[result[c]] &lt; arrI) {</span></span>
<span class="line"><span>                    u = c + 1</span></span>
<span class="line"><span>                } else {</span></span>
<span class="line"><span>                    // 否则，则 v（最终下标） = 中间位。即：下次直接从 0 开始，计算到中间位置 即可。</span></span>
<span class="line"><span>                    v = c</span></span>
<span class="line"><span>                }</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>            // 最终，经过 while 的二分运算可以计算出：目标下标位 u</span></span>
<span class="line"><span>            // 利用 u 从 result 中获取下标，然后拿到 arr 中对应的值：arr[result[u]]</span></span>
<span class="line"><span>            // 如果：arr[result[u]] &gt; arrI 的，则证明当前  result 中存在的下标 《不是》 递增序列，则需要进行替换</span></span>
<span class="line"><span>            if (arrI &lt; arr[result[u]]) {</span></span>
<span class="line"><span>                if (u &gt; 0) {</span></span>
<span class="line"><span>                    p[i] = result[u - 1]</span></span>
<span class="line"><span>                }</span></span>
<span class="line"><span>                // 进行替换，替换为递增序列</span></span>
<span class="line"><span>                result[u] = i</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 重新定义 u。此时：u = result 的长度</span></span>
<span class="line"><span>    u = result.length</span></span>
<span class="line"><span>    // 重新定义 v。此时 v = result 的最后一个元素</span></span>
<span class="line"><span>    v = result[u - 1]</span></span>
<span class="line"><span>    // 自后向前处理 result，利用 p 中所保存的索引值，进行最后的一次回溯</span></span>
<span class="line"><span>    while (u-- &gt; 0) {</span></span>
<span class="line"><span>        result[u] = v</span></span>
<span class="line"><span>        v = p[v]</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return result</span></span>
<span class="line"><span>}</span></span></code></pre></div>`,254)])])}const h=n(t,[["render",l]]);export{g as __pageData,h as default};
