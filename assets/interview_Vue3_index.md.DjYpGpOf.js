import{_ as a,o as n,c as i,ag as p}from"./chunks/framework.ppPvAPr9.js";const o=JSON.parse('{"title":"Vue3面试题","description":"","frontmatter":{},"headers":[],"relativePath":"interview/Vue3/index.md","filePath":"interview/Vue3/index.md"}'),e={name:"interview/Vue3/index.md"};function t(l,s,h,k,r,d){return n(),i("div",null,[...s[0]||(s[0]=[p(`<h1 id="vue3面试题" tabindex="-1">Vue3面试题 <a class="header-anchor" href="#vue3面试题" aria-label="Permalink to &quot;Vue3面试题&quot;">​</a></h1><h2 id="生命周期" tabindex="-1">生命周期 <a class="header-anchor" href="#生命周期" aria-label="Permalink to &quot;生命周期&quot;">​</a></h2><p>Vue3 的生命周期与 Vue2 基本对应，但名称有变化，且支持在 <code>setup()</code> 中使用组合式 API 形式调用。</p><table tabindex="0"><thead><tr><th>Vue2</th><th>Vue3（Options API）</th><th>Vue3（Composition API）</th></tr></thead><tbody><tr><td><code>beforeCreate</code></td><td><code>beforeCreate</code></td><td>— （用 <code>setup()</code> 替代）</td></tr><tr><td><code>created</code></td><td><code>created</code></td><td>— （用 <code>setup()</code> 替代）</td></tr><tr><td><code>beforeMount</code></td><td><code>beforeMount</code></td><td><code>onBeforeMount</code></td></tr><tr><td><code>mounted</code></td><td><code>mounted</code></td><td><code>onMounted</code></td></tr><tr><td><code>beforeUpdate</code></td><td><code>beforeUpdate</code></td><td><code>onBeforeUpdate</code></td></tr><tr><td><code>updated</code></td><td><code>updated</code></td><td><code>onUpdated</code></td></tr><tr><td><code>beforeDestroy</code></td><td><code>beforeUnmount</code></td><td><code>onBeforeUnmount</code></td></tr><tr><td><code>destroyed</code></td><td><code>unmounted</code></td><td><code>onUnmounted</code></td></tr></tbody></table><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { onMounted, onUpdated, onUnmounted } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;vue&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setup</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  onMounted</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;组件挂载完成&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  })</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  onUnmounted</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;组件卸载，清除定时器/监听器&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  })</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>执行顺序（父子组件）</strong>：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>父 beforeCreate -&gt; 父 created -&gt; 父 beforeMount</span></span>
<span class="line"><span>  -&gt; 子 beforeCreate -&gt; 子 created -&gt; 子 beforeMount -&gt; 子 mounted</span></span>
<span class="line"><span>父 mounted</span></span></code></pre></div><h2 id="ref" tabindex="-1">ref <a class="header-anchor" href="#ref" aria-label="Permalink to &quot;ref&quot;">​</a></h2><p><code>ref</code> 用于创建一个<strong>响应式的引用</strong>，可以持有任意类型的值（基本类型或对象）。</p><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { ref } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;vue&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> count</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ref</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(count.value) </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 0，JS 中通过 .value 访问</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 模板中自动解包，不需要 .value</span></span></code></pre></div><p><strong>ref vs reactive：</strong></p><table tabindex="0"><thead><tr><th>对比</th><th><code>ref</code></th><th><code>reactive</code></th></tr></thead><tbody><tr><td>适用类型</td><td>任意类型</td><td>对象/数组</td></tr><tr><td>访问方式</td><td><code>.value</code></td><td>直接访问</td></tr><tr><td>解构</td><td>需 <code>toRefs</code></td><td>需 <code>toRefs</code></td></tr><tr><td>模板自动解包</td><td>✅</td><td>✅</td></tr></tbody></table><h2 id="reactive" tabindex="-1">reactive <a class="header-anchor" href="#reactive" aria-label="Permalink to &quot;reactive&quot;">​</a></h2><p><code>reactive</code> 基于 <code>Proxy</code> 实现，返回对象的响应式代理。</p><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { reactive } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;vue&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> state</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> reactive</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  count: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  user: { name: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Tom&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 直接访问和修改</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">state.count</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">++</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">state.user.name </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;Jerry&#39;</span></span></code></pre></div><p><strong>响应式原理（核心代码）：</strong></p><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// --------------- reactive 模块 ---------------</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/**</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * 收集所有依赖的 WeakMap 实例：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * 1. key：响应性对象</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * 2. value：Map 对象</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> *    1. key：响应性对象的指定属性</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> *    2. value：指定对象的指定属性的执行函数</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> */</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> targetMap</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> WeakMap</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">function</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> track</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">target</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">key</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">activeEffect) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">return</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> depsMap </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> targetMap.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">get</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(target)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">depsMap) targetMap.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">set</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(target, (depsMap </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Map</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()))</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> dep </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> depsMap.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">get</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(key)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">dep) depsMap.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">set</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(key, (dep </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Set</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()))</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  dep.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">add</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(activeEffect)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">function</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> trigger</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">target</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">key</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> depsMap</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> targetMap.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">get</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(target)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">depsMap) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">return</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> dep</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> depsMap.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">get</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(key)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (dep) </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">triggerEffects</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(dep)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h2 id="composition-api-vs-options-api" tabindex="-1">Composition API vs Options API <a class="header-anchor" href="#composition-api-vs-options-api" aria-label="Permalink to &quot;Composition API vs Options API&quot;">​</a></h2><table tabindex="0"><thead><tr><th>对比</th><th>Options API</th><th>Composition API</th></tr></thead><tbody><tr><td>逻辑组织</td><td>按选项分散（data/methods/computed）</td><td>按功能聚合</td></tr><tr><td>逻辑复用</td><td>Mixin（有命名冲突风险）</td><td>自定义 Hook（<code>useXxx</code>）</td></tr><tr><td>TypeScript</td><td>较弱</td><td>完整支持</td></tr><tr><td>学习曲线</td><td>平缓</td><td>稍陡</td></tr></tbody></table><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 自定义 Hook 示例：useCounter</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> function</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> useCounter</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">initial</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> count</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ref</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(initial)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> increment</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> count.value</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">++</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> decrement</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> count.value</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">--</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { count, increment, decrement }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 在组件中使用</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">count</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">increment</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> useCounter</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">10</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span></code></pre></div><h2 id="vue3-有哪些新特性" tabindex="-1">Vue3 有哪些新特性？ <a class="header-anchor" href="#vue3-有哪些新特性" aria-label="Permalink to &quot;Vue3 有哪些新特性？&quot;">​</a></h2><ol><li><p><strong>Composition API</strong> — <code>setup()</code>、<code>ref</code>、<code>reactive</code>、<code>computed</code>、<code>watch</code></p></li><li><p><strong>Teleport</strong> — 将组件渲染到任意 DOM 位置（如模态框传送到 body）</p></li><li><p><strong>Fragment</strong> — 组件支持多根节点</p></li><li><p><strong>Suspense</strong> — 异步组件加载时的 fallback 内容</p></li><li><p><strong><code>&lt;script setup&gt;</code></strong> — 更简洁的 SFC 写法，编译时语法糖</p></li><li><p><strong>v-model 升级</strong> — 支持多个 v-model，自定义修饰符</p></li><li><p><strong>Proxy 响应式</strong> — 替代 <code>Object.defineProperty</code>，支持新增属性、数组变化</p></li><li><p><strong>TypeScript</strong> — 源码全部用 TS 重写，类型支持更完整</p><p>/**</p><ul><li>收集依赖 */ function track(target, key) { // 如果当前不存在执行函数，则直接 return if (!activeEffect) return // 尝试从 targetMap 中，根据 target 获取 map let depsMap = targetMap.get(target) // 如果获取到的 map 不存在，则生成新的 map 对象，并把该对象赋值给对应的 value if (!depsMap) { targetMap.set(target, (depsMap = new Map())) } // 获取指定 key 的 dep let dep = depsMap.get(key) // 如果 dep 不存在，则生成一个新的 dep，并放入到 depsMap 中 if (!dep) { depsMap.set(key, (dep = new Set())) } // 把所有的 activeEffect 方法加入到 dep 中 dep.add(activeEffect) }</li></ul><p>/**</p><ul><li>触发依赖 */ function trigger(target, key) { // 依据 target 获取存储的 map 实例 const depsMap = targetMap.get(target) // 如果 map 不存在，则直接 return if (!depsMap) { return } // 依据指定的 key，获取 dep 实例 let dep = depsMap.get(key) // dep 不存在则直接 return if (!dep) { return } // 触发 dep triggerEffects(dep) }</li></ul><p>/**</p><ul><li>依次触发 dep 中保存的依赖 */ function triggerEffects(dep) { // 把 dep 构建为一个数组 const effects = Array.isArray(dep) ? dep : [...dep] // 依次触发 for (const effect of effects) { effect.run() } }</li></ul><p>/**</p><ul><li>proxy 的 handler */ const baseHandlers = { get: (target, key, receiver) =&gt; { // 利用 Reflect 得到返回值 const res = Reflect.get(target, key, receiver) // 收集依赖 track(target, key) return res }, set: (target, key, value, receiver) =&gt; { // 利用 Reflect.set 设置新值 const result = Reflect.set(target, key, value, receiver) // 触发依赖 trigger(target, key) return result } }</li></ul><p>function reactive(target) { const proxy = new Proxy(target, baseHandlers) return proxy }</p><p>// --------------- ref 模块 --------------- class RefImpl { _rawValue _value dep</p><pre><code> constructor(value) {
     // 原始数据
     this._rawValue = value
     this._value = value
 }

 /**
  * get 语法将对象属性绑定到查询该属性时将被调用的函数。
  * 即：xxx.value 时触发该函数
  */
 get value() {
     // 收集依赖
     if (activeEffect) {
         const dep = ref.dep || (ref.dep = new Set())
         dep.add(activeEffect)
     }
     return this._value
 }

 set value(newVal) {
     /**
      * newVal 为新数据
      * this._rawValue 为旧数据（原始数据）
      * 对比两个数据是否发生了变化
      */
     // 更新原始数据
     this._rawValue = newVal
     this._value = newVal
     // 触发依赖
     if (ref.dep) {
         triggerEffects(ref.dep)
     }
 }
</code></pre><p>}</p><p>/**</p><ul><li>ref 函数</li><li>@param value unknown */ function ref(value) { return new RefImpl(value) }</li></ul><p>// --------------- effect 模块 ---------------</p><p>// 当前需要执行的 effect let activeEffect</p><p>/**</p><ul><li><p>响应性触发依赖时的执行类 */ class ReactiveEffect { constructor(fn) { this.fn = fn }</p><p>run() { // 为 activeEffect 赋值 activeEffect = this</p><pre><code> // 执行 fn 函数
 return this.fn()
</code></pre><p>} }</p></li></ul><p>/**</p><ul><li><p>effect 函数</p></li><li><p>@param fn 执行方法</p></li><li><p>@returns 以 ReactiveEffect 实例为 this 的执行函数 */ function effect(fn) { // 生成 ReactiveEffect 实例 const _effect = new ReactiveEffect(fn)</p><p>// 执行 run 函数 _effect.run() }</p></li></ul><p>// --------------- 测试 ref --------------- const name = ref(&#39;张三&#39;)</p><p>// 调用 effect 方法 effect(() =&gt; { document.querySelector(&#39;#app&#39;).innerText = name.value })</p><p>setTimeout(() =&gt; { name.value = &#39;李四&#39; }, 2000);</p></li></ol><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>## 最长递增子序列</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>\`\`\`js</span></span>
<span class="line"><span>/**</span></span>
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
<span class="line"><span>}</span></span></code></pre></div>`,23)])])}const g=a(e,[["render",t]]);export{o as __pageData,g as default};
