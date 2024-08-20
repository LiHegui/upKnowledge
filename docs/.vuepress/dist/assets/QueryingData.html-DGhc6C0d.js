import{_ as s,o as n,c as a,e}from"./app-DHLwyd6l.js";const t={},p=e(`<h1 id="查询数据" tabindex="-1"><a class="header-anchor" href="#查询数据"><span>查询数据</span></a></h1><h1 id="使用graphql查询页面中的数据" tabindex="-1"><a class="header-anchor" href="#使用graphql查询页面中的数据"><span>使用GraphQL查询页面中的数据</span></a></h1><p>我们来简单使用一下</p><ol><li>添加description到siteMetadata</li></ol><p>gatsby-config.js</p><div class="language-javascript line-numbers-mode" data-ext="js" data-title="js"><pre class="language-javascript"><code>module<span class="token punctuation">.</span>exports <span class="token operator">=</span> <span class="token punctuation">{</span>
  <span class="token literal-property property">siteMetadata</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">title</span><span class="token operator">:</span> <span class="token string">&quot;My Homepage&quot;</span><span class="token punctuation">,</span>
    <span class="token literal-property property">description</span><span class="token operator">:</span> <span class="token string">&quot;This is where I write my thoughts.&quot;</span><span class="token punctuation">,</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ol start="2"><li>我们开始添加使用graphql查询 graphql是一个标签函数。Gatsby在幕后完成这些操作</li></ol><div class="language-javascript line-numbers-mode" data-ext="js" data-title="js"><pre class="language-javascript"><code><span class="token keyword">import</span> <span class="token operator">*</span> <span class="token keyword">as</span> React <span class="token keyword">from</span> <span class="token string">&#39;react&#39;</span>
<span class="token keyword">import</span> <span class="token punctuation">{</span> graphql <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&#39;gatsby&#39;</span>

 <span class="token keyword">const</span> <span class="token function-variable function">HomePage</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
 <span class="token keyword">const</span> <span class="token function-variable function">HomePage</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter"><span class="token punctuation">{</span>data<span class="token punctuation">}</span></span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token operator">&lt;</span>div<span class="token operator">&gt;</span>
        Hello<span class="token operator">!</span>
        <span class="token punctuation">{</span>data<span class="token punctuation">.</span>site<span class="token punctuation">.</span>siteMetadata<span class="token punctuation">.</span>description<span class="token punctuation">}</span>
    <span class="token operator">&lt;</span><span class="token operator">/</span>div<span class="token operator">&gt;</span>
  <span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">export</span> <span class="token keyword">const</span> query <span class="token operator">=</span> graphql<span class="token template-string"><span class="token template-punctuation string">\`</span><span class="token string">
  query HomePageQuery {
    site {
      siteMetadata {
        description
      }
    }
  }
</span><span class="token template-punctuation string">\`</span></span>

<span class="token keyword">export</span> <span class="token keyword">default</span> HomePage
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>在Gatsby构建过程中，GraphQL查询从原始源中提取出来进行解析</strong></p><ol start="3"><li>如何向页面查询添加查询变量</li></ol>`,10),o=[p];function i(l,r){return n(),a("div",null,o)}const d=s(t,[["render",i],["__file","QueryingData.html.vue"]]),u=JSON.parse('{"path":"/tools/repository/Gastby/QueryingData.html","title":"查询数据","lang":"zh-CN","frontmatter":{},"headers":[],"git":{},"filePathRelative":"tools/repository/Gastby/QueryingData.md"}');export{d as comp,u as data};
