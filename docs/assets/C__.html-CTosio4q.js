import{_ as n,o as e,c as s,e as a}from"./app-BzfR_7FA.js";const t={},i=a(`<h2 id="js跟c-应用程序通信" tabindex="-1"><a class="header-anchor" href="#js跟c-应用程序通信"><span>JS跟C++ 应用程序通信</span></a></h2><blockquote><p>QWebChannel 填补了 C++ 应用程序和 HTML/JavaScript 应用程序之间的空白。通过将 QObject 派生对象发布到 QWebChannel 并在 HTML 端使用 qwebchannel.js，可以透明地访问 QObject 的属性、公共槽和方法。不需要手动消息传递和数据序列化，C++ 端的属性更新和信号发射会自动传输到可能远程运行的 HTML 客户端。在客户端，将为任何已发布的 C++ QObject 创建 JavaScript 对象。它反映了 C++ 对象的 API，因此可以直观地使用</p></blockquote><div class="language-javascript line-numbers-mode" data-ext="js" data-title="js"><pre class="language-javascript"><code><span class="token keyword">import</span> QWebChannel <span class="token keyword">from</span> <span class="token string">&#39;./qwebchannel.js&#39;</span>

<span class="token doc-comment comment">/**
 * <span class="token keyword">@description</span> window.qt.webChannelTransport 可用 WebSocket 实例代替。
 * 经实践发现，Qt 向全局注入的 window.qt 仅有属性 webChannelTransport，并且该对象仅有
 * 两个属性方法：send 和 onmessage
 * send 方法用于 js 端向 Qt 端传输 \`JSON\` 信息
 * onmessage 用于接受 \`Qt\` 端发送的 \`JSON\` 信息
 */</span>
<span class="token keyword">new</span> <span class="token class-name">QWebChannel</span><span class="token punctuation">(</span>window<span class="token punctuation">.</span>qt<span class="token punctuation">.</span>webChannelTransport<span class="token punctuation">,</span> initCallback<span class="token punctuation">)</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,3),c=[i];function l(o,r){return e(),s("div",null,c)}const p=n(t,[["render",l],["__file","C__.html.vue"]]),m=JSON.parse('{"path":"/tools/repository/%E8%B7%A8%E7%AB%AF%E5%BC%80%E5%8F%91%EF%BC%88%E9%80%9A%E4%BF%A1%EF%BC%89/C__.html","title":"","lang":"zh-CN","frontmatter":{},"headers":[{"level":2,"title":"JS跟C++ 应用程序通信","slug":"js跟c-应用程序通信","link":"#js跟c-应用程序通信","children":[]}],"git":{"updatedTime":1724126230000,"contributors":[{"name":"LiHegui","email":"1487647822@qq.com","commits":1}]},"filePathRelative":"tools/repository/跨端开发（通信）/C++.md"}');export{p as comp,m as data};