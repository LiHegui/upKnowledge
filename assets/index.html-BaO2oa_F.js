import{_ as s,e as a,f as p,o as e}from"./app-BeRZjn83.js";const l={};function t(c,n){return e(),a("div",null,n[0]||(n[0]=[p(`<h1 id="vue3面试题" tabindex="-1"><a class="header-anchor" href="#vue3面试题"><span>Vue3面试题</span></a></h1><h2 id="生命周期" tabindex="-1"><a class="header-anchor" href="#生命周期"><span>生命周期</span></a></h2><h2 id="ref" tabindex="-1"><a class="header-anchor" href="#ref"><span>ref</span></a></h2><h2 id="reactive" tabindex="-1"><a class="header-anchor" href="#reactive"><span>reactive</span></a></h2><div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js" data-title="js"><pre><code><span class="line"> <span class="token comment">// --------------- reactive 模块 --------------- </span></span>
<span class="line">    <span class="token doc-comment comment">/**</span>
<span class="line">     * 收集所有依赖的 WeakMap 实例：</span>
<span class="line">     * 1. \`key\`：响应性对象</span>
<span class="line">     * 2. \`value\`：\`Map\` 对象</span>
<span class="line">     * 		1. \`key\`：响应性对象的指定属性</span>
<span class="line">     * 		2. \`value\`：指定对象的指定属性的 执行函数</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">const</span> targetMap <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">WeakMap</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span>
<span class="line"></span>
<span class="line">    <span class="token doc-comment comment">/**</span>
<span class="line">     * 收集依赖</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">function</span> <span class="token function">track</span><span class="token punctuation">(</span><span class="token parameter">target<span class="token punctuation">,</span> key</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">// 如果当前不存在执行函数，则直接 return</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>activeEffect<span class="token punctuation">)</span> <span class="token keyword">return</span></span>
<span class="line">        <span class="token comment">// 尝试从 targetMap 中，根据 target 获取 map</span></span>
<span class="line">        <span class="token keyword">let</span> depsMap <span class="token operator">=</span> targetMap<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>target<span class="token punctuation">)</span></span>
<span class="line">        <span class="token comment">// 如果获取到的 map 不存在，则生成新的 map 对象，并把该对象赋值给对应的 value</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>depsMap<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            targetMap<span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span>target<span class="token punctuation">,</span> <span class="token punctuation">(</span>depsMap <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Map</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">        <span class="token comment">// 获取指定 key 的 dep</span></span>
<span class="line">        <span class="token keyword">let</span> dep <span class="token operator">=</span> depsMap<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>key<span class="token punctuation">)</span></span>
<span class="line">        <span class="token comment">// 如果 dep 不存在，则生成一个新的 dep，并放入到 depsMap 中</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>dep<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            depsMap<span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span>key<span class="token punctuation">,</span> <span class="token punctuation">(</span>dep <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Set</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">        <span class="token comment">// 把所有的 activeEffect 方法加入到 dep 中</span></span>
<span class="line">        dep<span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span>activeEffect<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token doc-comment comment">/**</span>
<span class="line">     * 触发依赖</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">function</span> <span class="token function">trigger</span><span class="token punctuation">(</span><span class="token parameter">target<span class="token punctuation">,</span> key</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">// 依据 target 获取存储的 map 实例</span></span>
<span class="line">        <span class="token keyword">const</span> depsMap <span class="token operator">=</span> targetMap<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>target<span class="token punctuation">)</span></span>
<span class="line">        <span class="token comment">// 如果 map 不存在，则直接 return</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>depsMap<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token keyword">return</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">        <span class="token comment">// 依据指定的 key，获取 dep 实例</span></span>
<span class="line">        <span class="token keyword">let</span> dep <span class="token operator">=</span> depsMap<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>key<span class="token punctuation">)</span></span>
<span class="line">        <span class="token comment">// dep 不存在则直接 return</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>dep<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token keyword">return</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">        <span class="token comment">// 触发 dep</span></span>
<span class="line">        <span class="token function">triggerEffects</span><span class="token punctuation">(</span>dep<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token doc-comment comment">/**</span>
<span class="line">     * 依次触发 dep 中保存的依赖</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">function</span> <span class="token function">triggerEffects</span><span class="token punctuation">(</span><span class="token parameter">dep</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">// 把 dep 构建为一个数组</span></span>
<span class="line">        <span class="token keyword">const</span> effects <span class="token operator">=</span> Array<span class="token punctuation">.</span><span class="token function">isArray</span><span class="token punctuation">(</span>dep<span class="token punctuation">)</span> <span class="token operator">?</span> dep <span class="token operator">:</span> <span class="token punctuation">[</span><span class="token operator">...</span>dep<span class="token punctuation">]</span></span>
<span class="line">        <span class="token comment">// 依次触发</span></span>
<span class="line">        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">const</span> effect <span class="token keyword">of</span> effects<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            effect<span class="token punctuation">.</span><span class="token function">run</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token doc-comment comment">/**</span>
<span class="line">     * proxy 的 handler</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">const</span> baseHandlers <span class="token operator">=</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function-variable function">get</span><span class="token operator">:</span> <span class="token punctuation">(</span><span class="token parameter">target<span class="token punctuation">,</span> key<span class="token punctuation">,</span> receiver</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">// 利用 Reflect 得到返回值</span></span>
<span class="line">            <span class="token keyword">const</span> res <span class="token operator">=</span> Reflect<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>target<span class="token punctuation">,</span> key<span class="token punctuation">,</span> receiver<span class="token punctuation">)</span></span>
<span class="line">            <span class="token comment">// 收集依赖</span></span>
<span class="line">            <span class="token function">track</span><span class="token punctuation">(</span>target<span class="token punctuation">,</span> key<span class="token punctuation">)</span></span>
<span class="line">            <span class="token keyword">return</span> res</span>
<span class="line">        <span class="token punctuation">}</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token function-variable function">set</span><span class="token operator">:</span> <span class="token punctuation">(</span><span class="token parameter">target<span class="token punctuation">,</span> key<span class="token punctuation">,</span> value<span class="token punctuation">,</span> receiver</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">// 利用 Reflect.set 设置新值</span></span>
<span class="line">            <span class="token keyword">const</span> result <span class="token operator">=</span> Reflect<span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span>target<span class="token punctuation">,</span> key<span class="token punctuation">,</span> value<span class="token punctuation">,</span> receiver<span class="token punctuation">)</span></span>
<span class="line">            <span class="token comment">// 触发依赖</span></span>
<span class="line">            <span class="token function">trigger</span><span class="token punctuation">(</span>target<span class="token punctuation">,</span> key<span class="token punctuation">)</span></span>
<span class="line">            <span class="token keyword">return</span> result</span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">function</span> <span class="token function">reactive</span><span class="token punctuation">(</span><span class="token parameter">target</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">const</span> proxy <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Proxy</span><span class="token punctuation">(</span>target<span class="token punctuation">,</span> baseHandlers<span class="token punctuation">)</span></span>
<span class="line">        <span class="token keyword">return</span> proxy</span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// --------------- ref 模块 --------------- </span></span>
<span class="line">    <span class="token keyword">class</span> <span class="token class-name">RefImpl</span> <span class="token punctuation">{</span></span>
<span class="line">        _rawValue</span>
<span class="line">        _value</span>
<span class="line">        dep</span>
<span class="line"></span>
<span class="line">        <span class="token function">constructor</span><span class="token punctuation">(</span><span class="token parameter">value</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">// 原始数据</span></span>
<span class="line">            <span class="token keyword">this</span><span class="token punctuation">.</span>_rawValue <span class="token operator">=</span> value</span>
<span class="line">            <span class="token keyword">this</span><span class="token punctuation">.</span>_value <span class="token operator">=</span> value</span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token doc-comment comment">/**</span>
<span class="line">         * get 语法将对象属性绑定到查询该属性时将被调用的函数。</span>
<span class="line">         * 即：xxx.value 时触发该函数</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token keyword">get</span> <span class="token function">value</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">// 收集依赖</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>activeEffect<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token keyword">const</span> dep <span class="token operator">=</span> ref<span class="token punctuation">.</span>dep <span class="token operator">||</span> <span class="token punctuation">(</span>ref<span class="token punctuation">.</span>dep <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Set</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">                dep<span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span>activeEffect<span class="token punctuation">)</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">            <span class="token keyword">return</span> <span class="token keyword">this</span><span class="token punctuation">.</span>_value</span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">set</span> <span class="token function">value</span><span class="token punctuation">(</span><span class="token parameter">newVal</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token doc-comment comment">/**</span>
<span class="line">             * newVal 为新数据</span>
<span class="line">             * this._rawValue 为旧数据（原始数据）</span>
<span class="line">             * 对比两个数据是否发生了变化</span>
<span class="line">             */</span></span>
<span class="line">            <span class="token comment">// 更新原始数据</span></span>
<span class="line">            <span class="token keyword">this</span><span class="token punctuation">.</span>_rawValue <span class="token operator">=</span> newVal</span>
<span class="line">            <span class="token keyword">this</span><span class="token punctuation">.</span>_value <span class="token operator">=</span> newVal</span>
<span class="line">            <span class="token comment">// 触发依赖</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>ref<span class="token punctuation">.</span>dep<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token function">triggerEffects</span><span class="token punctuation">(</span>ref<span class="token punctuation">.</span>dep<span class="token punctuation">)</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token doc-comment comment">/**</span>
<span class="line">     * ref 函数</span>
<span class="line">     * <span class="token keyword">@param</span> <span class="token parameter">value</span> unknown</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">function</span> <span class="token function">ref</span><span class="token punctuation">(</span><span class="token parameter">value</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">return</span> <span class="token keyword">new</span> <span class="token class-name">RefImpl</span><span class="token punctuation">(</span>value<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// --------------- effect 模块 --------------- </span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 当前需要执行的 effect</span></span>
<span class="line">    <span class="token keyword">let</span> activeEffect</span>
<span class="line"></span>
<span class="line">    <span class="token doc-comment comment">/**</span>
<span class="line">     * 响应性触发依赖时的执行类</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">class</span> <span class="token class-name">ReactiveEffect</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">constructor</span><span class="token punctuation">(</span><span class="token parameter">fn</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token keyword">this</span><span class="token punctuation">.</span>fn <span class="token operator">=</span> fn</span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token function">run</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">// 为 activeEffect 赋值</span></span>
<span class="line">            activeEffect <span class="token operator">=</span> <span class="token keyword">this</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">// 执行 fn 函数</span></span>
<span class="line">            <span class="token keyword">return</span> <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">fn</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token doc-comment comment">/**</span>
<span class="line">     * effect 函数</span>
<span class="line">     * <span class="token keyword">@param</span> <span class="token parameter">fn</span> 执行方法</span>
<span class="line">     * <span class="token keyword">@returns</span> 以 ReactiveEffect 实例为 this 的执行函数</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">function</span> <span class="token function">effect</span><span class="token punctuation">(</span><span class="token parameter">fn</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">// 生成 ReactiveEffect 实例</span></span>
<span class="line">        <span class="token keyword">const</span> _effect <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">ReactiveEffect</span><span class="token punctuation">(</span>fn<span class="token punctuation">)</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 执行 run 函数</span></span>
<span class="line">        _effect<span class="token punctuation">.</span><span class="token function">run</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"></span>
<span class="line">    <span class="token comment">//  --------------- 测试 ref --------------- </span></span>
<span class="line">    <span class="token keyword">const</span> name <span class="token operator">=</span> <span class="token function">ref</span><span class="token punctuation">(</span><span class="token string">&#39;张三&#39;</span><span class="token punctuation">)</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 调用 effect 方法</span></span>
<span class="line">    <span class="token function">effect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span></span>
<span class="line">        document<span class="token punctuation">.</span><span class="token function">querySelector</span><span class="token punctuation">(</span><span class="token string">&#39;#app&#39;</span><span class="token punctuation">)</span><span class="token punctuation">.</span>innerText <span class="token operator">=</span> name<span class="token punctuation">.</span>value</span>
<span class="line">    <span class="token punctuation">}</span><span class="token punctuation">)</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">setTimeout</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span></span>
<span class="line">        name<span class="token punctuation">.</span>value <span class="token operator">=</span> <span class="token string">&#39;李四&#39;</span></span>
<span class="line">    <span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token number">2000</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="最长递增子序列" tabindex="-1"><a class="header-anchor" href="#最长递增子序列"><span>最长递增子序列</span></a></h2><div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js" data-title="js"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * 获取最长递增子序列下标</span>
<span class="line"> * 维基百科：https://en.wikipedia.org/wiki/Longest_increasing_subsequence</span>
<span class="line"> * 百度百科：https://baike.baidu.com/item/%E6%9C%80%E9%95%BF%E9%80%92%E5%A2%9E%E5%AD%90%E5%BA%8F%E5%88%97/22828111</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">function</span> <span class="token function">getSequence</span><span class="token punctuation">(</span><span class="token parameter">arr</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">// 获取一个数组浅拷贝。注意 p 的元素改变并不会影响 arr</span></span>
<span class="line">    <span class="token comment">// p 是一个最终的回溯数组，它会在最终的 result 回溯中被使用</span></span>
<span class="line">    <span class="token comment">// 它会在每次 result 发生变化时，记录 result 更新前最后一个索引的值</span></span>
<span class="line">    <span class="token keyword">const</span> p <span class="token operator">=</span> arr<span class="token punctuation">.</span><span class="token function">slice</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token comment">// 定义返回值（最长递增子序列下标），因为下标从 0 开始，所以它的初始值为 0</span></span>
<span class="line">    <span class="token keyword">const</span> result <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span></span>
<span class="line">    <span class="token keyword">let</span> i<span class="token punctuation">,</span> j<span class="token punctuation">,</span> u<span class="token punctuation">,</span> v<span class="token punctuation">,</span> c</span>
<span class="line">    <span class="token comment">// 当前数组的长度</span></span>
<span class="line">    <span class="token keyword">const</span> len <span class="token operator">=</span> arr<span class="token punctuation">.</span>length</span>
<span class="line">    <span class="token comment">// 对数组中所有的元素进行 for 循环处理，i = 下标</span></span>
<span class="line">    <span class="token keyword">for</span> <span class="token punctuation">(</span>i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> len<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">// 根据下标获取当前对应元素</span></span>
<span class="line">        <span class="token keyword">const</span> arrI <span class="token operator">=</span> arr<span class="token punctuation">[</span>i<span class="token punctuation">]</span></span>
<span class="line">        <span class="token comment">// </span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>arrI <span class="token operator">!==</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">// 获取 result 中的最后一个元素，即：当前 result 中保存的最大值的下标</span></span>
<span class="line">            j <span class="token operator">=</span> result<span class="token punctuation">[</span>result<span class="token punctuation">.</span>length <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">]</span></span>
<span class="line">            <span class="token comment">// arr[j] = 当前 result 中所保存的最大值</span></span>
<span class="line">            <span class="token comment">// arrI = 当前值</span></span>
<span class="line">            <span class="token comment">// 如果 arr[j] &lt; arrI 。那么就证明，当前存在更大的序列，那么该下标就需要被放入到 result 的最后位置</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>arr<span class="token punctuation">[</span>j<span class="token punctuation">]</span> <span class="token operator">&lt;</span> arrI<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                p<span class="token punctuation">[</span>i<span class="token punctuation">]</span> <span class="token operator">=</span> j</span>
<span class="line">                <span class="token comment">// 把当前的下标 i 放入到 result 的最后位置</span></span>
<span class="line">                result<span class="token punctuation">.</span><span class="token function">push</span><span class="token punctuation">(</span>i<span class="token punctuation">)</span></span>
<span class="line">                <span class="token keyword">continue</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">            <span class="token comment">// 不满足 arr[j] &lt; arrI 的条件，就证明目前 result 中的最后位置保存着更大的数值的下标。</span></span>
<span class="line">            <span class="token comment">// 但是这个下标并不一定是一个递增的序列，比如： [1, 3] 和 [1, 2] </span></span>
<span class="line">            <span class="token comment">// 所以我们还需要确定当前的序列是递增的。</span></span>
<span class="line">            <span class="token comment">// 计算方式就是通过：二分查找来进行的</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">// 初始下标</span></span>
<span class="line">            u <span class="token operator">=</span> <span class="token number">0</span></span>
<span class="line">            <span class="token comment">// 最终下标</span></span>
<span class="line">            v <span class="token operator">=</span> result<span class="token punctuation">.</span>length <span class="token operator">-</span> <span class="token number">1</span></span>
<span class="line">            <span class="token comment">// 只有初始下标 &lt; 最终下标时才需要计算</span></span>
<span class="line">            <span class="token keyword">while</span> <span class="token punctuation">(</span>u <span class="token operator">&lt;</span> v<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token comment">// (u + v) 转化为 32 位 2 进制，右移 1 位 === 取中间位置（向下取整）例如：8 &gt;&gt; 1 = 4;  9 &gt;&gt; 1 = 4; 5 &gt;&gt; 1 = 2</span></span>
<span class="line">                <span class="token comment">// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Right_shift</span></span>
<span class="line">                <span class="token comment">// c 表示中间位。即：初始下标 + 最终下标 / 2 （向下取整）</span></span>
<span class="line">                c <span class="token operator">=</span> <span class="token punctuation">(</span>u <span class="token operator">+</span> v<span class="token punctuation">)</span> <span class="token operator">&gt;&gt;</span> <span class="token number">1</span></span>
<span class="line">                <span class="token comment">// 从 result 中根据 c（中间位），取出中间位的下标。</span></span>
<span class="line">                <span class="token comment">// 然后利用中间位的下标，从 arr 中取出对应的值。</span></span>
<span class="line">                <span class="token comment">// 即：arr[result[c]] = result 中间位的值</span></span>
<span class="line">                <span class="token comment">// 如果：result 中间位的值 &lt; arrI，则 u（初始下标）= 中间位 + 1。即：从中间向右移动一位，作为初始下标。 （下次直接从中间开始，往后计算即可）</span></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>arr<span class="token punctuation">[</span>result<span class="token punctuation">[</span>c<span class="token punctuation">]</span><span class="token punctuation">]</span> <span class="token operator">&lt;</span> arrI<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    u <span class="token operator">=</span> c <span class="token operator">+</span> <span class="token number">1</span></span>
<span class="line">                <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token comment">// 否则，则 v（最终下标） = 中间位。即：下次直接从 0 开始，计算到中间位置 即可。</span></span>
<span class="line">                    v <span class="token operator">=</span> c</span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">            <span class="token comment">// 最终，经过 while 的二分运算可以计算出：目标下标位 u</span></span>
<span class="line">            <span class="token comment">// 利用 u 从 result 中获取下标，然后拿到 arr 中对应的值：arr[result[u]]</span></span>
<span class="line">            <span class="token comment">// 如果：arr[result[u]] &gt; arrI 的，则证明当前  result 中存在的下标 《不是》 递增序列，则需要进行替换</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>arrI <span class="token operator">&lt;</span> arr<span class="token punctuation">[</span>result<span class="token punctuation">[</span>u<span class="token punctuation">]</span><span class="token punctuation">]</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>u <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    p<span class="token punctuation">[</span>i<span class="token punctuation">]</span> <span class="token operator">=</span> result<span class="token punctuation">[</span>u <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">]</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line">                <span class="token comment">// 进行替换，替换为递增序列</span></span>
<span class="line">                result<span class="token punctuation">[</span>u<span class="token punctuation">]</span> <span class="token operator">=</span> i</span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token comment">// 重新定义 u。此时：u = result 的长度</span></span>
<span class="line">    u <span class="token operator">=</span> result<span class="token punctuation">.</span>length</span>
<span class="line">    <span class="token comment">// 重新定义 v。此时 v = result 的最后一个元素</span></span>
<span class="line">    v <span class="token operator">=</span> result<span class="token punctuation">[</span>u <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">]</span></span>
<span class="line">    <span class="token comment">// 自后向前处理 result，利用 p 中所保存的索引值，进行最后的一次回溯</span></span>
<span class="line">    <span class="token keyword">while</span> <span class="token punctuation">(</span>u<span class="token operator">--</span> <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        result<span class="token punctuation">[</span>u<span class="token punctuation">]</span> <span class="token operator">=</span> v</span>
<span class="line">        v <span class="token operator">=</span> p<span class="token punctuation">[</span>v<span class="token punctuation">]</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token keyword">return</span> result</span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,7)]))}const o=s(l,[["render",t],["__file","index.html.vue"]]),u=JSON.parse('{"path":"/interview/Vue3/","title":"Vue3面试题","lang":"zh-CN","frontmatter":{},"headers":[{"level":2,"title":"生命周期","slug":"生命周期","link":"#生命周期","children":[]},{"level":2,"title":"ref","slug":"ref","link":"#ref","children":[]},{"level":2,"title":"reactive","slug":"reactive","link":"#reactive","children":[]},{"level":2,"title":"最长递增子序列","slug":"最长递增子序列","link":"#最长递增子序列","children":[]}],"git":{"updatedTime":1740721153000,"contributors":[{"name":"LiHegui","username":"LiHegui","email":"1487647822@qq.com","commits":2,"url":"https://github.com/LiHegui"}]},"filePathRelative":"interview/Vue3/index.md"}');export{o as comp,u as data};
