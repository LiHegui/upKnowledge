import{_ as a,r as t,o as e,c as p,a as n,b as o,d as l,e as i}from"./app-DHLwyd6l.js";const c={},r=i(`<h2 id="basic" tabindex="-1"><a class="header-anchor" href="#basic"><span>BASIC</span></a></h2><h3 id="插值" tabindex="-1"><a class="header-anchor" href="#插值"><span>插值</span></a></h3><p>可以将函数（“插值”）传递给样式化组件的模板文字，以根据其属性对其进行调整。</p><div class="language-typescript line-numbers-mode" data-ext="ts" data-title="ts"><pre class="language-typescript"><code><span class="token keyword">const</span> Button <span class="token operator">=</span> styled<span class="token punctuation">.</span>button<span class="token operator">&lt;</span><span class="token punctuation">{</span> $primary<span class="token operator">?</span><span class="token operator">:</span> <span class="token builtin">boolean</span><span class="token punctuation">;</span> <span class="token punctuation">}</span><span class="token operator">&gt;</span><span class="token template-string"><span class="token template-punctuation string">\`</span><span class="token string">
  /* Adapt the colors based on primary prop */
  background: </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">\${</span>props <span class="token operator">=&gt;</span> props<span class="token punctuation">.</span>$primary <span class="token operator">?</span> <span class="token string">&quot;#BF4F74&quot;</span> <span class="token operator">:</span> <span class="token string">&quot;white&quot;</span><span class="token interpolation-punctuation punctuation">}</span></span><span class="token string">;
  color: </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">\${</span>props <span class="token operator">=&gt;</span> props<span class="token punctuation">.</span>$primary <span class="token operator">?</span> <span class="token string">&quot;white&quot;</span> <span class="token operator">:</span> <span class="token string">&quot;#BF4F74&quot;</span><span class="token interpolation-punctuation punctuation">}</span></span><span class="token string">;

  font-size: 1em;
  margin: 1em;
  padding: 0.25em 1em;
  border: 2px solid #BF4F74;
  border-radius: 3px;
</span><span class="token template-punctuation string">\`</span></span><span class="token punctuation">;</span>

<span class="token function">render</span><span class="token punctuation">(</span>
  <span class="token operator">&lt;</span>div<span class="token operator">&gt;</span>
    <span class="token operator">&lt;</span>Button<span class="token operator">&gt;</span>Normal<span class="token operator">&lt;</span><span class="token operator">/</span>Button<span class="token operator">&gt;</span>
    <span class="token operator">&lt;</span>Button $primary<span class="token operator">&gt;</span>Primary<span class="token operator">&lt;</span><span class="token operator">/</span>Button<span class="token operator">&gt;</span>
  <span class="token operator">&lt;</span><span class="token operator">/</span>div<span class="token operator">&gt;</span>
<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>prop 不是如何传递到 DOM 的，而是type如何传递到defaultValueDOM(原有的默认属性) 的？该styled功能足够智能，可以自动为您过滤非标准属性。</p></blockquote><h3 id="扩展样式-设计任何组件的样式" tabindex="-1"><a class="header-anchor" href="#扩展样式-设计任何组件的样式"><span>扩展样式(设计任何组件的样式)</span></a></h3><p>我们可以对antd组件进行“继承”, 并加以改造。可以很容易形成自己风格的组件。 当然，我们也可以“继承”我们自己写的组件。</p><div class="language-typescript line-numbers-mode" data-ext="ts" data-title="ts"><pre class="language-typescript"><code><span class="token keyword">const</span> Button <span class="token operator">=</span> styled<span class="token punctuation">.</span>button<span class="token template-string"><span class="token template-punctuation string">\`</span><span class="token string">
  color: #BF4F74;
  font-size: 1em;
  margin: 1em;
  padding: 0.25em 1em;
  border: 2px solid #BF4F74;
  border-radius: 3px;
</span><span class="token template-punctuation string">\`</span></span><span class="token punctuation">;</span>

<span class="token comment">// A new component based on Button, but with some override styles</span>
<span class="token keyword">const</span> TomatoButton <span class="token operator">=</span> <span class="token function">styled</span><span class="token punctuation">(</span>Button<span class="token punctuation">)</span><span class="token template-string"><span class="token template-punctuation string">\`</span><span class="token string">
  color: tomato;
  border-color: tomato;
</span><span class="token template-punctuation string">\`</span></span><span class="token punctuation">;</span>

<span class="token function">render</span><span class="token punctuation">(</span>
  <span class="token operator">&lt;</span>div<span class="token operator">&gt;</span>
    <span class="token operator">&lt;</span>Button<span class="token operator">&gt;</span>Normal Button<span class="token operator">&lt;</span><span class="token operator">/</span>Button<span class="token operator">&gt;</span>
    <span class="token operator">&lt;</span>TomatoButton<span class="token operator">&gt;</span>Tomato Button<span class="token operator">&lt;</span><span class="token operator">/</span>TomatoButton<span class="token operator">&gt;</span>
  <span class="token operator">&lt;</span><span class="token operator">/</span>div<span class="token operator">&gt;</span>
<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>直接继承antd, 该styled方法适用于您自己的所有组件或任何第三方组件，只要它们将传递的classNameprop 附加到 DOM 元素即可</p><div class="language-typescript line-numbers-mode" data-ext="ts" data-title="ts"><pre class="language-typescript"><code><span class="token keyword">import</span> <span class="token punctuation">{</span> Tabs <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&#39;antd&#39;</span>

<span class="token keyword">export</span> <span class="token keyword">const</span> Tabs <span class="token operator">=</span> <span class="token function">styled</span><span class="token punctuation">(</span>Tab<span class="token punctuation">)</span><span class="token template-string"><span class="token template-punctuation string">\`</span><span class="token string">
    color: white;
    ...
</span><span class="token template-punctuation string">\`</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="导入导出" tabindex="-1"><a class="header-anchor" href="#导入导出"><span>导入导出</span></a></h3><p>这个都是变量，直接按照变量处理即可</p><h3 id="附加额外处理" tabindex="-1"><a class="header-anchor" href="#附加额外处理"><span>附加额外处理</span></a></h3><p>为了避免不必要的包装器仅将一些传递渲染的组件和元素，可以使用.atters构造函数。</p><div class="language-typescript line-numbers-mode" data-ext="ts" data-title="ts"><pre class="language-typescript"><code><span class="token keyword">const</span> Input <span class="token operator">=</span> styled<span class="token punctuation">.</span>input<span class="token punctuation">.</span><span class="token generic-function"><span class="token function">attrs</span><span class="token generic class-name"><span class="token operator">&lt;</span><span class="token punctuation">{</span> $size<span class="token operator">?</span><span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">;</span> <span class="token punctuation">}</span><span class="token operator">&gt;</span></span></span><span class="token punctuation">(</span>props <span class="token operator">=&gt;</span> <span class="token punctuation">(</span><span class="token punctuation">{</span>
  <span class="token comment">// we can define static props</span>
  type<span class="token operator">:</span> <span class="token string">&quot;text&quot;</span><span class="token punctuation">,</span>

  <span class="token comment">// or we can define dynamic ones</span>
  $size<span class="token operator">:</span> props<span class="token punctuation">.</span>$size <span class="token operator">||</span> <span class="token string">&quot;1em&quot;</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token template-string"><span class="token template-punctuation string">\`</span><span class="token string">
  color: #BF4F74;
  font-size: 1em;
  border: 2px solid #BF4F74;
  border-radius: 3px;

  /* here we use the dynamically computed prop */
  margin: </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">\${</span>props <span class="token operator">=&gt;</span> props<span class="token punctuation">.</span>$size<span class="token interpolation-punctuation punctuation">}</span></span><span class="token string">;
  padding: </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">\${</span>props <span class="token operator">=&gt;</span> props<span class="token punctuation">.</span>$size<span class="token interpolation-punctuation punctuation">}</span></span><span class="token string">;
</span><span class="token template-punctuation string">\`</span></span><span class="token punctuation">;</span>

<span class="token function">render</span><span class="token punctuation">(</span>
  <span class="token operator">&lt;</span>div<span class="token operator">&gt;</span>
    <span class="token operator">&lt;</span>Input placeholder<span class="token operator">=</span><span class="token string">&quot;A small text input&quot;</span> <span class="token operator">/</span><span class="token operator">&gt;</span>
    <span class="token operator">&lt;</span>br <span class="token operator">/</span><span class="token operator">&gt;</span>
    <span class="token operator">&lt;</span>Input placeholder<span class="token operator">=</span><span class="token string">&quot;A bigger text input&quot;</span> $size<span class="token operator">=</span><span class="token string">&quot;2em&quot;</span> <span class="token operator">/</span><span class="token operator">&gt;</span>
  <span class="token operator">&lt;</span><span class="token operator">/</span>div<span class="token operator">&gt;</span>
<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="动画" tabindex="-1"><a class="header-anchor" href="#动画"><span>动画</span></a></h3><div class="language-javascript line-numbers-mode" data-ext="js" data-title="js"><pre class="language-javascript"><code><span class="token keyword">import</span> styled  <span class="token keyword">from</span> <span class="token string">&#39;styled-components&#39;</span>
<span class="token keyword">const</span> rotate <span class="token operator">=</span> keyframes<span class="token template-string"><span class="token template-punctuation string">\`</span><span class="token string">
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
</span><span class="token template-punctuation string">\`</span></span><span class="token punctuation">;</span>

<span class="token comment">// Here we create a component that will rotate everything we pass in over two seconds</span>
<span class="token keyword">const</span> Rotate <span class="token operator">=</span> styled<span class="token punctuation">.</span>div<span class="token template-string"><span class="token template-punctuation string">\`</span><span class="token string">
  display: inline-block;
  animation: </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">\${</span>rotate<span class="token interpolation-punctuation punctuation">}</span></span><span class="token string"> 2s linear infinite;
  padding: 2rem 1rem;
  font-size: 1.2rem;
</span><span class="token template-punctuation string">\`</span></span><span class="token punctuation">;</span>

<span class="token function">render</span><span class="token punctuation">(</span>
  <span class="token operator">&lt;</span>Rotate<span class="token operator">&gt;</span><span class="token operator">&amp;</span>lt<span class="token punctuation">;</span> 💅🏾 <span class="token operator">&amp;</span>gt<span class="token punctuation">;</span><span class="token operator">&lt;</span><span class="token operator">/</span>Rotate<span class="token operator">&gt;</span>
<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="使用自定义函数" tabindex="-1"><a class="header-anchor" href="#使用自定义函数"><span>使用自定义函数</span></a></h3><h2 id="level-up" tabindex="-1"><a class="header-anchor" href="#level-up"><span>LEVEL！ UP！</span></a></h2><h3 id="主题化" tabindex="-1"><a class="header-anchor" href="#主题化"><span>主题化</span></a></h3><blockquote><p>styled-components 通过导出包装组件来提供完整的主题支持ThemeProvider。该组件通过 context API 为自身下面的所有 React 组件提供一个主题。 在渲染树中，所有样式组件都可以访问提供的主题，即使它们是多个级别的深度</p></blockquote><h2 id="参考资料" tabindex="-1"><a class="header-anchor" href="#参考资料"><span>参考资料</span></a></h2>`,22),d={id:"官网",tabindex:"-1"},u={class:"header-anchor",href:"#官网"},k={href:"https://styled-components.com/docs",target:"_blank",rel:"noopener noreferrer"};function v(m,b){const s=t("ExternalLinkIcon");return e(),p("div",null,[r,n("h3",d,[n("a",u,[n("span",null,[n("a",k,[o("官网"),l(s)])])])])])}const h=a(c,[["render",v],["__file","style-components.html.vue"]]),y=JSON.parse('{"path":"/repository/Css/style-components.html","title":"","lang":"zh-CN","frontmatter":{},"headers":[{"level":2,"title":"BASIC","slug":"basic","link":"#basic","children":[{"level":3,"title":"插值","slug":"插值","link":"#插值","children":[]},{"level":3,"title":"扩展样式(设计任何组件的样式)","slug":"扩展样式-设计任何组件的样式","link":"#扩展样式-设计任何组件的样式","children":[]},{"level":3,"title":"导入导出","slug":"导入导出","link":"#导入导出","children":[]},{"level":3,"title":"附加额外处理","slug":"附加额外处理","link":"#附加额外处理","children":[]},{"level":3,"title":"动画","slug":"动画","link":"#动画","children":[]},{"level":3,"title":"使用自定义函数","slug":"使用自定义函数","link":"#使用自定义函数","children":[]}]},{"level":2,"title":"LEVEL！ UP！","slug":"level-up","link":"#level-up","children":[{"level":3,"title":"主题化","slug":"主题化","link":"#主题化","children":[]}]},{"level":2,"title":"参考资料","slug":"参考资料","link":"#参考资料","children":[{"level":3,"title":"官网","slug":"官网","link":"#官网","children":[]}]}],"git":{},"filePathRelative":"repository/Css/style-components.md"}');export{h as comp,y as data};
