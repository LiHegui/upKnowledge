import{_ as t,r as p,o,c as l,b as s,d as a,a as c,e as n}from"./app-BzfR_7FA.js";const r="/upKnowledge/assets/render-BcQA-m3J.png",i={},d=n(`<h1 id="react面试题" tabindex="-1"><a class="header-anchor" href="#react面试题"><span>React面试题</span></a></h1><h2 id="谈谈你对react的理解" tabindex="-1"><a class="header-anchor" href="#谈谈你对react的理解"><span>谈谈你对React的理解</span></a></h2><p>React是构建用户界面的JavaScript库，只提供了UI层面的解决方案</p><p>特点：</p><ul><li><p>JSX的语法</p></li><li><p>单向数据绑定 速度更快</p></li><li><p>虚拟DOM</p></li><li><p>声明式编程</p></li><li><p>component 更注重抽离和组件化 组件式开发，提高代码复用率 应该具有的特点：可组合，可重用，可维护</p></li></ul><h2 id="jsx转成真实dom的过程" tabindex="-1"><a class="header-anchor" href="#jsx转成真实dom的过程"><span>JSX转成真实DOM的过程</span></a></h2><p>JSX是JavaScript的一种语法拓展，它和模板语言很像，但是它具备充分的JavaScript的能力</p><p>经过babel的处理</p><ol><li>JSX 会被编译为React.createElement(), React.createElement()将会返回一个叫做React Element的JS对象 这里的编译就是指babel</li></ol><div class="language-javascript line-numbers-mode" data-ext="js" data-title="js"><pre class="language-javascript"><code><span class="token doc-comment comment">/**
* React.createElement
* <span class="token keyword">@param</span> <span class="token class-name"><span class="token punctuation">{</span><span class="token operator">*</span><span class="token punctuation">}</span></span> <span class="token parameter">type</span> 用于标识节点的类型
* <span class="token keyword">@param</span> <span class="token class-name"><span class="token punctuation">{</span><span class="token operator">*</span><span class="token punctuation">}</span></span> <span class="token parameter">config</span> 以对象形式传入，组件所有的属性都会以键值对的形式储存到conig对象中
* <span class="token keyword">@param</span> <span class="token class-name"><span class="token punctuation">{</span><span class="token operator">*</span><span class="token punctuation">}</span></span> <span class="token parameter">children</span> 以对象的形式传入，，它记录的是组件标签之间的嵌套的内容
*/</span>
<span class="token keyword">export</span> <span class="token keyword">function</span> <span class="token function">createElement</span><span class="token punctuation">(</span><span class="token parameter">type<span class="token punctuation">,</span> config<span class="token punctuation">,</span> children</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token operator">...</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>🔨 demo</p><div class="language-javascript line-numbers-mode" data-ext="js" data-title="js"><pre class="language-javascript"><code><span class="token keyword">class</span> <span class="token class-name">ClassComponent</span> <span class="token keyword">extends</span> <span class="token class-name">Component</span> <span class="token punctuation">{</span>     <span class="token comment">// 类式组件</span>
  <span class="token keyword">static</span> defaultProps <span class="token operator">=</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">color</span><span class="token operator">:</span> <span class="token string">&quot;pink&quot;</span>
  <span class="token punctuation">}</span><span class="token punctuation">;</span>
  <span class="token function">render</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>
      <span class="token operator">&lt;</span>div className<span class="token operator">=</span><span class="token string">&quot;border&quot;</span><span class="token operator">&gt;</span>
        <span class="token operator">&lt;</span>h3<span class="token operator">&gt;</span>ClassComponent<span class="token operator">&lt;</span><span class="token operator">/</span>h3<span class="token operator">&gt;</span>
        <span class="token operator">&lt;</span>p className<span class="token operator">=</span><span class="token punctuation">{</span><span class="token keyword">this</span><span class="token punctuation">.</span>props<span class="token punctuation">.</span>color<span class="token punctuation">}</span><span class="token operator">&gt;</span><span class="token punctuation">{</span><span class="token keyword">this</span><span class="token punctuation">.</span>props<span class="token punctuation">.</span>name<span class="token punctuation">}</span><span class="token operator">&lt;</span><span class="token operator">/</span>p <span class="token operator">&gt;</span>
      <span class="token operator">&lt;</span><span class="token operator">/</span>div<span class="token operator">&gt;</span>
    <span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">function</span> <span class="token function">FunctionComponent</span><span class="token punctuation">(</span><span class="token parameter">props</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>      <span class="token comment">// 函数式组件</span>
  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token operator">&lt;</span>div className<span class="token operator">=</span><span class="token string">&quot;border&quot;</span><span class="token operator">&gt;</span>
      FunctionComponent
      <span class="token operator">&lt;</span>p<span class="token operator">&gt;</span><span class="token punctuation">{</span>props<span class="token punctuation">.</span>name<span class="token punctuation">}</span><span class="token operator">&lt;</span><span class="token operator">/</span>p <span class="token operator">&gt;</span>
    <span class="token operator">&lt;</span><span class="token operator">/</span>div<span class="token operator">&gt;</span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">const</span> jsx <span class="token operator">=</span> <span class="token punctuation">(</span>                        
  <span class="token operator">&lt;</span>div className<span class="token operator">=</span><span class="token string">&quot;border&quot;</span><span class="token operator">&gt;</span>
    <span class="token operator">&lt;</span>p<span class="token operator">&gt;</span>xx<span class="token operator">&lt;</span><span class="token operator">/</span>p <span class="token operator">&gt;</span>                   
    <span class="token operator">&lt;</span>a href<span class="token operator">=</span><span class="token string">&quot;#&quot;</span><span class="token operator">&gt;</span>xxx<span class="token operator">&lt;</span><span class="token operator">/</span> a<span class="token operator">&gt;</span>
    <span class="token operator">&lt;</span>FunctionComponent name<span class="token operator">=</span><span class="token string">&quot;函数组件&quot;</span> <span class="token operator">/</span><span class="token operator">&gt;</span>
    <span class="token operator">&lt;</span>ClassComponent name<span class="token operator">=</span><span class="token string">&quot;类组件&quot;</span> color<span class="token operator">=</span><span class="token string">&quot;red&quot;</span> <span class="token operator">/</span><span class="token operator">&gt;</span>
  <span class="token operator">&lt;</span><span class="token operator">/</span>div<span class="token operator">&gt;</span>
<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这里值得注意的是</p><p>JSX -&gt; babel -&gt; React.createElement -&gt; ReactElement -&gt; 虚拟DOM -&gt;ReactDoM.render() -&gt; 真实DOM</p><p>在转化过程中，babel在编译时会判断 JSX 中组件的首字母：</p><p>当首字母为小写时，其被认定为原生 DOM 标签，createElement 的第一个变量被编译为字符串</p><p>当首字母为大写时，其被认定为自定义组件，createElement 的第一个变量被编译为对象</p><p>React.createElement其被调用时会传⼊标签类型type，标签属性props及若干子元素children</p>`,18),u={start:"2"},k=n(`<div class="language-javascript line-numbers-mode" data-ext="js" data-title="js"><pre class="language-javascript"><code>ReactDOM<span class="token punctuation">.</span><span class="token function">render</span><span class="token punctuation">(</span>
  <span class="token comment">// 需要渲染的元素(ReactElement)</span>
  element<span class="token punctuation">,</span>
  <span class="token comment">// 元素挂载的目标容器</span>
  container<span class="token punctuation">,</span>
  <span class="token comment">// 回调函数， 可选参数，， 可以用来处理渲染结束后的逻辑</span>
  callback
<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>整个流程图解</p><p><img src="`+r+`" alt=""></p><h2 id="react-生命周期" tabindex="-1"><a class="header-anchor" href="#react-生命周期"><span>React 生命周期</span></a></h2><p>组件初始化 -&gt; render方法</p><p>渲染工作流 指的是从组件数据改变到组件实际更新发生的过程</p><p>React15</p><p>挂载 -&gt; 更新 -&gt; 卸载</p><ul><li>constructor()</li><li>componentWillReceiveProps() 父组件触发更新时触发（不一定是相关的props）</li><li>componentWillUnmount 组件卸载时触发（组件被移除 ）</li></ul><p>React16</p><p>废弃了componentWillMount</p><ul><li>getDerivedStateFromProps, 替代compponentWillReceiveProps 使用Props来派生/更新state 在更新和挂载两个阶段都会触发</li></ul><h2 id="说说-real-dom-和-virtual-dom-的区别-优缺点" tabindex="-1"><a class="header-anchor" href="#说说-real-dom-和-virtual-dom-的区别-优缺点"><span>说说 Real DOM 和 Virtual DOM 的区别？优缺点？</span></a></h2><p>虚拟DOM</p><p>组件更新 -&gt; render方法 -&gt; 生成新的虚拟DOM -&gt; diff算法 -&gt; 定位两次的差异 -&gt; 渲染真实DOM</p><h2 id="说说对react中类组件和函数组件的理解-有什么区别" tabindex="-1"><a class="header-anchor" href="#说说对react中类组件和函数组件的理解-有什么区别"><span>说说对React中类组件和函数组件的理解？有什么区别？</span></a></h2><h2 id="类式组件" tabindex="-1"><a class="header-anchor" href="#类式组件"><span>类式组件</span></a></h2><h2 id="函数式组件" tabindex="-1"><a class="header-anchor" href="#函数式组件"><span>函数式组件</span></a></h2><h2 id="说说对react-hooks的理解-解决了什么问题" tabindex="-1"><a class="header-anchor" href="#说说对react-hooks的理解-解决了什么问题"><span>说说对React Hooks的理解？解决了什么问题？</span></a></h2><h2 id="state-和-props-有什么区别" tabindex="-1"><a class="header-anchor" href="#state-和-props-有什么区别"><span>state 和 props 有什么区别？</span></a></h2><ul><li>state state是用来保存组件状态、控制以及修改自己状态。 外部不可访问，可以说是组件私有属性</li><li>props 是传递给组件的（类似于函数的传参），只读不可改</li></ul><h2 id="组件中如何验证props" tabindex="-1"><a class="header-anchor" href="#组件中如何验证props"><span>组件中如何验证Props</span></a></h2><p>React为我们提供了PropTypes以供验证使用。如果使用typescript那么就可以直接用接口来定义。</p><div class="language-javascript line-numbers-mode" data-ext="js" data-title="js"><pre class="language-javascript"><code><span class="token keyword">import</span> React <span class="token keyword">from</span> <span class="token string">&quot;react&quot;</span><span class="token punctuation">;</span>
<span class="token keyword">import</span> propTypes <span class="token keyword">from</span> <span class="token string">&#39;prop-types&#39;</span>
<span class="token keyword">class</span> <span class="token class-name">State</span> <span class="token keyword">extends</span> <span class="token class-name">React<span class="token punctuation">.</span>Component</span> <span class="token punctuation">{</span>
    <span class="token function">constructor</span><span class="token punctuation">(</span><span class="token parameter">props</span><span class="token punctuation">)</span><span class="token punctuation">{</span>
        <span class="token keyword">super</span><span class="token punctuation">(</span>props<span class="token punctuation">)</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>state <span class="token operator">=</span> <span class="token punctuation">{</span>
            
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
    <span class="token function">render</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>
            <span class="token operator">&lt;</span>div<span class="token operator">&gt;</span>
                <span class="token punctuation">{</span><span class="token keyword">this</span><span class="token punctuation">.</span>props<span class="token punctuation">.</span>name<span class="token punctuation">}</span>
            <span class="token operator">&lt;</span><span class="token operator">/</span>div<span class="token operator">&gt;</span>
        <span class="token punctuation">)</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
State<span class="token punctuation">.</span>propTypes <span class="token operator">=</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">name</span><span class="token operator">:</span> propTypes<span class="token punctuation">.</span>string
<span class="token punctuation">}</span>
<span class="token keyword">export</span> <span class="token keyword">default</span> State<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h1 id="super-和-super-props-有什么区别" tabindex="-1"><a class="header-anchor" href="#super-和-super-props-有什么区别"><span>super() 和 super(props) 有什么区别？</span></a></h1><p>super()和super(props)都是调用父类构造函数的语句。</p><ul><li>super() 会调用父类的构造函数并将this绑定到子类的实例。如果子类的构造函数中 没有使用this,则可以省略super调用</li><li>super(props) 则是在子类的构造函数中调用父类的构造函数，并将props对象出传递给父类的构造函数。 props对象传递给父类的构造函数，以便在组件中使用this.props访问它。</li></ul><h2 id="super" tabindex="-1"><a class="header-anchor" href="#super"><span>super</span></a></h2><p>在JavaScript中，super是一个关键字，用于调用父类中的构造函数和方法。</p><ul><li>当子类继承父类时，子类必须使用 super 调用父类的构造函数，以便子类可以继承父类的属性和方法。在 constructor 方法中，使用 super 调用父类的构造函数时，可以使用 this 关键字访问子类的属性和方法</li></ul><h1 id="说说-react中的setstate执行机制" tabindex="-1"><a class="header-anchor" href="#说说-react中的setstate执行机制"><span>说说 React中的setState执行机制</span></a></h1><p>类式组件中有setState机制</p><ul><li>组件中多次调用setState()，会进行合并，组件只执行一次更新操作</li><li>流程 1.将setState传入的partialState参数存储在当前组件实例的state暂存队列中。 2.判断当前React是否处于批量更新状态，如果是，将当前组件加入待更新的组件队列中。 3.如果未处于批量更新状态，将批量更新状态标识设置为true，用事务再次调用前一步方法，保证当前组件加入到了待更新组件队列中。 4.调用事务的waper方法，遍历待更新组件队列依次执行更新。 5.执行生命周期componentWillReceiveProps。 6.将组件的state暂存队列中的state进行合并，获得最终要更新的state对象，并将队列置为空。 7.执行生命周期componentShouldUpdate，根据返回值判断是否要继续更新。 8.执行生命周期componentWillUpdate。 9.执行真正的更新，render。 10.执行生命周期componentDidUpdate</li></ul><h2 id="setstate是同步还是异步" tabindex="-1"><a class="header-anchor" href="#setstate是同步还是异步"><span>setState是同步还是异步？</span></a></h2><p>我们先来了解一下setState过程 代码中调用了setState函数之后，React会将传入的参数对象与组件进行合并。然后触发调和过程。经过调和过程， React会以相对高效的方式根据新的状态构建React元素树，并且着手重新渲染整个UI界面。</p><ul><li>setState是同步还是异步 setState并不是单纯异步还是同步，具体情况具体分析 <ul><li>state完全替换</li><li>React控制不到的地方，比如原生事件</li></ul></li></ul><h2 id="setstate一定会合并吗" tabindex="-1"><a class="header-anchor" href="#setstate一定会合并吗"><span>setState一定会合并吗</span></a></h2><p>其实不然，完全替换的时候，就不会合并。合并只是一种优化策略。</p><h2 id="react-高阶组件、render-props、hooks-有什么区别-为什么要不断迭代" tabindex="-1"><a class="header-anchor" href="#react-高阶组件、render-props、hooks-有什么区别-为什么要不断迭代"><span>React 高阶组件、Render props、hooks 有什么区别，为什么要不断迭代?</span></a></h2><h2 id="react-hooks的使用限制有哪些" tabindex="-1"><a class="header-anchor" href="#react-hooks的使用限制有哪些"><span>React Hooks的使用限制有哪些？</span></a></h2><h2 id="react-fiber是什么-有什么用" tabindex="-1"><a class="header-anchor" href="#react-fiber是什么-有什么用"><span>React fiber是什么？有什么用？</span></a></h2><p>Fiber会将一个额大的更新任务拆解为许多个小任务</p><p>Fiber架构的重要特征就是可以被打断的异步渲染方式</p><p>生命周期工作流</p><p><strong>render阶段在执行过程中允许被打断，而commit阶段总是同步执行的</strong></p><h2 id="react18和之前版本的区别" tabindex="-1"><a class="header-anchor" href="#react18和之前版本的区别"><span>React18和之前版本的区别</span></a></h2>`,46);function v(m,h){const e=p("App");return o(),l("div",null,[d,s("ol",u,[s("li",null,[a("最后，React.render会将React Element对象渲染到真实的DOM 最后就是挂载某个节点上 ReactDOM.render("),c(e),a(', document.getElementById("root"));')])]),k])}const g=t(i,[["render",v],["__file","index.html.vue"]]),R=JSON.parse('{"path":"/tools/docs/interview/React/","title":"React面试题","lang":"zh-CN","frontmatter":{},"headers":[{"level":2,"title":"谈谈你对React的理解","slug":"谈谈你对react的理解","link":"#谈谈你对react的理解","children":[]},{"level":2,"title":"JSX转成真实DOM的过程","slug":"jsx转成真实dom的过程","link":"#jsx转成真实dom的过程","children":[]},{"level":2,"title":"React 生命周期","slug":"react-生命周期","link":"#react-生命周期","children":[]},{"level":2,"title":"说说 Real DOM 和 Virtual DOM 的区别？优缺点？","slug":"说说-real-dom-和-virtual-dom-的区别-优缺点","link":"#说说-real-dom-和-virtual-dom-的区别-优缺点","children":[]},{"level":2,"title":"说说对React中类组件和函数组件的理解？有什么区别？","slug":"说说对react中类组件和函数组件的理解-有什么区别","link":"#说说对react中类组件和函数组件的理解-有什么区别","children":[]},{"level":2,"title":"类式组件","slug":"类式组件","link":"#类式组件","children":[]},{"level":2,"title":"函数式组件","slug":"函数式组件","link":"#函数式组件","children":[]},{"level":2,"title":"说说对React Hooks的理解？解决了什么问题？","slug":"说说对react-hooks的理解-解决了什么问题","link":"#说说对react-hooks的理解-解决了什么问题","children":[]},{"level":2,"title":"state 和 props 有什么区别？","slug":"state-和-props-有什么区别","link":"#state-和-props-有什么区别","children":[]},{"level":2,"title":"组件中如何验证Props","slug":"组件中如何验证props","link":"#组件中如何验证props","children":[]},{"level":2,"title":"super","slug":"super","link":"#super","children":[]},{"level":2,"title":"setState是同步还是异步？","slug":"setstate是同步还是异步","link":"#setstate是同步还是异步","children":[]},{"level":2,"title":"setState一定会合并吗","slug":"setstate一定会合并吗","link":"#setstate一定会合并吗","children":[]},{"level":2,"title":"React 高阶组件、Render props、hooks 有什么区别，为什么要不断迭代?","slug":"react-高阶组件、render-props、hooks-有什么区别-为什么要不断迭代","link":"#react-高阶组件、render-props、hooks-有什么区别-为什么要不断迭代","children":[]},{"level":2,"title":"React Hooks的使用限制有哪些？","slug":"react-hooks的使用限制有哪些","link":"#react-hooks的使用限制有哪些","children":[]},{"level":2,"title":"React fiber是什么？有什么用？","slug":"react-fiber是什么-有什么用","link":"#react-fiber是什么-有什么用","children":[]},{"level":2,"title":"React18和之前版本的区别","slug":"react18和之前版本的区别","link":"#react18和之前版本的区别","children":[]}],"git":{"updatedTime":1724126230000,"contributors":[{"name":"LiHegui","email":"1487647822@qq.com","commits":1}]},"filePathRelative":"tools/docs/interview/React/index.md"}');export{g as comp,R as data};