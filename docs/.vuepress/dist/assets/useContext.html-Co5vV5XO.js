import{_ as a,r as t,o as p,c as e,a as n,b as o,d as c,e as l}from"./app-DHLwyd6l.js";const i={},r=l(`<h1 id="usecontext" tabindex="-1"><a class="header-anchor" href="#usecontext"><span>useContext</span></a></h1><p><strong>useContext 是一个传递组件上下文的钩子，提供读取和订阅功能</strong></p><p>useContext是组件Provider传递context过程中的一环</p><blockquote><p>Context 可以让我们无须明确地传遍每一个组件，就能将值深入传递进组件树。</p></blockquote><p>🙋 作用</p><ul><li>向组件树深层传递数据 💨参考下面的<strong>如何使用？</strong></li><li>通过context更新传递的数据 💨参考下面的<strong>通过context更新传递的数据</strong></li><li>指定回退默认值 💨</li></ul><h2 id="如何使用" tabindex="-1"><a class="header-anchor" href="#如何使用"><span>如何使用？</span></a></h2><p>我们用一个例子说明</p><ol><li>根组件植入</li></ol><div class="language-javascript line-numbers-mode" data-ext="js" data-title="js"><pre class="language-javascript"><code>    <span class="token comment">// 我们所说的context是createContext创建的，声明了可以从组件获取</span>
    <span class="token comment">// 或者给提供者信息，在provider中可以传递具体的值</span>
    <span class="token keyword">const</span> ThemeContext <span class="token operator">=</span> <span class="token function">createContext</span><span class="token punctuation">(</span><span class="token keyword">null</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token keyword">function</span> <span class="token function">MyApp</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>
            <span class="token comment">// 我们只提供了一个dark值</span>
            <span class="token operator">&lt;</span>ThemeContext<span class="token punctuation">.</span>Provider value<span class="token operator">=</span><span class="token string">&quot;dark&quot;</span><span class="token operator">&gt;</span>
                <span class="token operator">&lt;</span>Form <span class="token operator">/</span><span class="token operator">&gt;</span>
            <span class="token operator">&lt;</span><span class="token operator">/</span>ThemeContext<span class="token punctuation">.</span>Provider<span class="token operator">&gt;</span>
        <span class="token punctuation">)</span>
    <span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ol start="2"><li>此时我们在子组件树中需要有个接受方，用来获取数据</li></ol><div class="language-javascript line-numbers-mode" data-ext="js" data-title="js"><pre class="language-javascript"><code>    <span class="token keyword">function</span> <span class="token function">Form</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">{</span>
        <span class="token keyword">return</span><span class="token punctuation">(</span>
            <span class="token operator">&lt;</span><span class="token operator">&gt;</span>
                <span class="token operator">...</span><span class="token punctuation">(</span>渲染Form<span class="token punctuation">)</span>
            <span class="token operator">&lt;</span><span class="token operator">/</span><span class="token operator">&gt;</span>
        <span class="token punctuation">)</span>
    <span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>当 Form 中的任何位置的 Button 调用 useContext(ThemeContext) 时，它都将接收 &quot;dark&quot; 作为值</p><blockquote><p>useContext() 总是在调用它的组件 上面 寻找最近的 provider。它向上搜索， 不考虑 调用 useContext() 的组件中的 provider。</p></blockquote><h2 id="通过context更新传递的数据" tabindex="-1"><a class="header-anchor" href="#通过context更新传递的数据"><span>通过context更新传递的数据</span></a></h2><p>官网上有很多例子，我就选一个进行说明</p><p>其实很容易理解，把改变state的方法一起作为context传递下去就可以了</p><p>我们在传递的同时要注意操作同一个context，我们日常在props来改变共享父级的状态，然后改变父级值，通过props再传递给自己，然后更新。</p><p>道理都是差不多，只是Provider层级较深，不用我们来进行一级一级的操作。</p><div class="language-javascript line-numbers-mode" data-ext="js" data-title="js"><pre class="language-javascript"><code><span class="token keyword">import</span> <span class="token punctuation">{</span> createContext<span class="token punctuation">,</span> useContext<span class="token punctuation">,</span> useState <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&#39;react&#39;</span><span class="token punctuation">;</span>

<span class="token keyword">const</span> CurrentUserContext <span class="token operator">=</span> <span class="token function">createContext</span><span class="token punctuation">(</span><span class="token keyword">null</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token keyword">function</span> <span class="token function">MyApp</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> <span class="token punctuation">[</span>currentUser<span class="token punctuation">,</span> setCurrentUser<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">useState</span><span class="token punctuation">(</span><span class="token keyword">null</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token operator">&lt;</span>CurrentUserContext<span class="token punctuation">.</span>Provider
      value<span class="token operator">=</span><span class="token punctuation">{</span><span class="token punctuation">{</span>
        currentUser<span class="token punctuation">,</span>
        setCurrentUser
      <span class="token punctuation">}</span><span class="token punctuation">}</span>
    <span class="token operator">&gt;</span>
      <span class="token operator">&lt;</span>Form <span class="token operator">/</span><span class="token operator">&gt;</span>
    <span class="token operator">&lt;</span><span class="token operator">/</span>CurrentUserContext<span class="token punctuation">.</span>Provider<span class="token operator">&gt;</span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">function</span> <span class="token function">Form</span><span class="token punctuation">(</span><span class="token parameter"><span class="token punctuation">{</span> children <span class="token punctuation">}</span></span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token operator">&lt;</span>Panel title<span class="token operator">=</span><span class="token string">&quot;Welcome&quot;</span><span class="token operator">&gt;</span>
      <span class="token operator">&lt;</span>LoginButton <span class="token operator">/</span><span class="token operator">&gt;</span>
    <span class="token operator">&lt;</span><span class="token operator">/</span>Panel<span class="token operator">&gt;</span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">function</span> <span class="token function">LoginButton</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> <span class="token punctuation">{</span>
    currentUser<span class="token punctuation">,</span>
    setCurrentUser
  <span class="token punctuation">}</span> <span class="token operator">=</span> <span class="token function">useContext</span><span class="token punctuation">(</span>CurrentUserContext<span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">if</span> <span class="token punctuation">(</span>currentUser <span class="token operator">!==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token operator">&lt;</span>p<span class="token operator">&gt;</span>You logged <span class="token keyword">in</span> <span class="token keyword">as</span> <span class="token punctuation">{</span>currentUser<span class="token punctuation">.</span>name<span class="token punctuation">}</span><span class="token punctuation">.</span><span class="token operator">&lt;</span><span class="token operator">/</span>p<span class="token operator">&gt;</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token operator">&lt;</span>Button onClick<span class="token operator">=</span><span class="token punctuation">{</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
      <span class="token function">setCurrentUser</span><span class="token punctuation">(</span><span class="token punctuation">{</span> <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">&#39;Advika&#39;</span> <span class="token punctuation">}</span><span class="token punctuation">)</span>
    <span class="token punctuation">}</span><span class="token punctuation">}</span><span class="token operator">&gt;</span>Log <span class="token keyword">in</span> <span class="token keyword">as</span> Advika<span class="token operator">&lt;</span><span class="token operator">/</span>Button<span class="token operator">&gt;</span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">function</span> <span class="token function">Panel</span><span class="token punctuation">(</span><span class="token parameter"><span class="token punctuation">{</span> title<span class="token punctuation">,</span> children <span class="token punctuation">}</span></span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token operator">&lt;</span>section className<span class="token operator">=</span><span class="token string">&quot;panel&quot;</span><span class="token operator">&gt;</span>
      <span class="token operator">&lt;</span>h1<span class="token operator">&gt;</span><span class="token punctuation">{</span>title<span class="token punctuation">}</span><span class="token operator">&lt;</span><span class="token operator">/</span>h1<span class="token operator">&gt;</span>
      <span class="token punctuation">{</span>children<span class="token punctuation">}</span>
    <span class="token operator">&lt;</span><span class="token operator">/</span>section<span class="token operator">&gt;</span>
  <span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">function</span> <span class="token function">Button</span><span class="token punctuation">(</span><span class="token parameter"><span class="token punctuation">{</span> children<span class="token punctuation">,</span> onClick <span class="token punctuation">}</span></span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token operator">&lt;</span>button className<span class="token operator">=</span><span class="token string">&quot;button&quot;</span> onClick<span class="token operator">=</span><span class="token punctuation">{</span>onClick<span class="token punctuation">}</span><span class="token operator">&gt;</span>
      <span class="token punctuation">{</span>children<span class="token punctuation">}</span>
    <span class="token operator">&lt;</span><span class="token operator">/</span>button<span class="token operator">&gt;</span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>由上，我们可以看出，我们似乎可以进行多个Provider传递，只需进行嵌套即可 我们来看一个官网的例子, 还是很清晰明了的，不再赘述</p><div class="language-javascript line-numbers-mode" data-ext="js" data-title="js"><pre class="language-javascript"><code><span class="token keyword">import</span> <span class="token punctuation">{</span> createContext<span class="token punctuation">,</span> useContext<span class="token punctuation">,</span> useState <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&#39;react&#39;</span><span class="token punctuation">;</span>

<span class="token keyword">const</span> ThemeContext <span class="token operator">=</span> <span class="token function">createContext</span><span class="token punctuation">(</span><span class="token keyword">null</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token keyword">const</span> CurrentUserContext <span class="token operator">=</span> <span class="token function">createContext</span><span class="token punctuation">(</span><span class="token keyword">null</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token keyword">function</span> <span class="token function">MyApp</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> <span class="token punctuation">[</span>theme<span class="token punctuation">,</span> setTheme<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">useState</span><span class="token punctuation">(</span><span class="token string">&#39;light&#39;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">const</span> <span class="token punctuation">[</span>currentUser<span class="token punctuation">,</span> setCurrentUser<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">useState</span><span class="token punctuation">(</span><span class="token keyword">null</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token operator">&lt;</span>ThemeContext<span class="token punctuation">.</span>Provider value<span class="token operator">=</span><span class="token punctuation">{</span>theme<span class="token punctuation">}</span><span class="token operator">&gt;</span>
      <span class="token operator">&lt;</span>CurrentUserContext<span class="token punctuation">.</span>Provider
        value<span class="token operator">=</span><span class="token punctuation">{</span><span class="token punctuation">{</span>
          currentUser<span class="token punctuation">,</span>
          setCurrentUser
        <span class="token punctuation">}</span><span class="token punctuation">}</span>
      <span class="token operator">&gt;</span>
        <span class="token operator">&lt;</span>WelcomePanel <span class="token operator">/</span><span class="token operator">&gt;</span>
        <span class="token operator">&lt;</span>label<span class="token operator">&gt;</span>
          <span class="token operator">&lt;</span>input
            type<span class="token operator">=</span><span class="token string">&quot;checkbox&quot;</span>
            checked<span class="token operator">=</span><span class="token punctuation">{</span>theme <span class="token operator">===</span> <span class="token string">&#39;dark&#39;</span><span class="token punctuation">}</span>
            onChange<span class="token operator">=</span><span class="token punctuation">{</span><span class="token punctuation">(</span><span class="token parameter">e</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
              <span class="token function">setTheme</span><span class="token punctuation">(</span>e<span class="token punctuation">.</span>target<span class="token punctuation">.</span>checked <span class="token operator">?</span> <span class="token string">&#39;dark&#39;</span> <span class="token operator">:</span> <span class="token string">&#39;light&#39;</span><span class="token punctuation">)</span>
            <span class="token punctuation">}</span><span class="token punctuation">}</span>
          <span class="token operator">/</span><span class="token operator">&gt;</span>
          Use dark mode
        <span class="token operator">&lt;</span><span class="token operator">/</span>label<span class="token operator">&gt;</span>
      <span class="token operator">&lt;</span><span class="token operator">/</span>CurrentUserContext<span class="token punctuation">.</span>Provider<span class="token operator">&gt;</span>
    <span class="token operator">&lt;</span><span class="token operator">/</span>ThemeContext<span class="token punctuation">.</span>Provider<span class="token operator">&gt;</span>
  <span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">function</span> <span class="token function">WelcomePanel</span><span class="token punctuation">(</span><span class="token parameter"><span class="token punctuation">{</span> children <span class="token punctuation">}</span></span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> <span class="token punctuation">{</span>currentUser<span class="token punctuation">}</span> <span class="token operator">=</span> <span class="token function">useContext</span><span class="token punctuation">(</span>CurrentUserContext<span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token operator">&lt;</span>Panel title<span class="token operator">=</span><span class="token string">&quot;Welcome&quot;</span><span class="token operator">&gt;</span>
      <span class="token punctuation">{</span>currentUser <span class="token operator">!==</span> <span class="token keyword">null</span> <span class="token operator">?</span>
        <span class="token operator">&lt;</span>Greeting <span class="token operator">/</span><span class="token operator">&gt;</span> <span class="token operator">:</span>
        <span class="token operator">&lt;</span>LoginForm <span class="token operator">/</span><span class="token operator">&gt;</span>
      <span class="token punctuation">}</span>
    <span class="token operator">&lt;</span><span class="token operator">/</span>Panel<span class="token operator">&gt;</span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">function</span> <span class="token function">Greeting</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> <span class="token punctuation">{</span>currentUser<span class="token punctuation">}</span> <span class="token operator">=</span> <span class="token function">useContext</span><span class="token punctuation">(</span>CurrentUserContext<span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token operator">&lt;</span>p<span class="token operator">&gt;</span>You logged <span class="token keyword">in</span> <span class="token keyword">as</span> <span class="token punctuation">{</span>currentUser<span class="token punctuation">.</span>name<span class="token punctuation">}</span><span class="token punctuation">.</span><span class="token operator">&lt;</span><span class="token operator">/</span>p<span class="token operator">&gt;</span>
  <span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">function</span> <span class="token function">LoginForm</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> <span class="token punctuation">{</span>setCurrentUser<span class="token punctuation">}</span> <span class="token operator">=</span> <span class="token function">useContext</span><span class="token punctuation">(</span>CurrentUserContext<span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">const</span> <span class="token punctuation">[</span>firstName<span class="token punctuation">,</span> setFirstName<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">useState</span><span class="token punctuation">(</span><span class="token string">&#39;&#39;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">const</span> <span class="token punctuation">[</span>lastName<span class="token punctuation">,</span> setLastName<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">useState</span><span class="token punctuation">(</span><span class="token string">&#39;&#39;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">const</span> canLogin <span class="token operator">=</span> firstName <span class="token operator">!==</span> <span class="token string">&#39;&#39;</span> <span class="token operator">&amp;&amp;</span> lastName <span class="token operator">!==</span> <span class="token string">&#39;&#39;</span><span class="token punctuation">;</span>
  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token operator">&lt;</span><span class="token operator">&gt;</span>
      <span class="token operator">&lt;</span>label<span class="token operator">&gt;</span>
        First name<span class="token punctuation">{</span><span class="token string">&#39;: &#39;</span><span class="token punctuation">}</span>
        <span class="token operator">&lt;</span>input
          required
          value<span class="token operator">=</span><span class="token punctuation">{</span>firstName<span class="token punctuation">}</span>
          onChange<span class="token operator">=</span><span class="token punctuation">{</span><span class="token parameter">e</span> <span class="token operator">=&gt;</span> <span class="token function">setFirstName</span><span class="token punctuation">(</span>e<span class="token punctuation">.</span>target<span class="token punctuation">.</span>value<span class="token punctuation">)</span><span class="token punctuation">}</span>
        <span class="token operator">/</span><span class="token operator">&gt;</span>
      <span class="token operator">&lt;</span><span class="token operator">/</span>label<span class="token operator">&gt;</span>
      <span class="token operator">&lt;</span>label<span class="token operator">&gt;</span>
        Last name<span class="token punctuation">{</span><span class="token string">&#39;: &#39;</span><span class="token punctuation">}</span>
        <span class="token operator">&lt;</span>input
        required
          value<span class="token operator">=</span><span class="token punctuation">{</span>lastName<span class="token punctuation">}</span>
          onChange<span class="token operator">=</span><span class="token punctuation">{</span><span class="token parameter">e</span> <span class="token operator">=&gt;</span> <span class="token function">setLastName</span><span class="token punctuation">(</span>e<span class="token punctuation">.</span>target<span class="token punctuation">.</span>value<span class="token punctuation">)</span><span class="token punctuation">}</span>
        <span class="token operator">/</span><span class="token operator">&gt;</span>
      <span class="token operator">&lt;</span><span class="token operator">/</span>label<span class="token operator">&gt;</span>
      <span class="token operator">&lt;</span>Button
        disabled<span class="token operator">=</span><span class="token punctuation">{</span><span class="token operator">!</span>canLogin<span class="token punctuation">}</span>
        onClick<span class="token operator">=</span><span class="token punctuation">{</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
          <span class="token function">setCurrentUser</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
            <span class="token literal-property property">name</span><span class="token operator">:</span> firstName <span class="token operator">+</span> <span class="token string">&#39; &#39;</span> <span class="token operator">+</span> lastName
          <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span><span class="token punctuation">}</span>
      <span class="token operator">&gt;</span>
        Log <span class="token keyword">in</span>
      <span class="token operator">&lt;</span><span class="token operator">/</span>Button<span class="token operator">&gt;</span>
      <span class="token punctuation">{</span><span class="token operator">!</span>canLogin <span class="token operator">&amp;&amp;</span> <span class="token operator">&lt;</span>i<span class="token operator">&gt;</span>Fill <span class="token keyword">in</span> both fields<span class="token punctuation">.</span><span class="token operator">&lt;</span><span class="token operator">/</span>i<span class="token operator">&gt;</span><span class="token punctuation">}</span>
    <span class="token operator">&lt;</span><span class="token operator">/</span><span class="token operator">&gt;</span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">function</span> <span class="token function">Panel</span><span class="token punctuation">(</span><span class="token parameter"><span class="token punctuation">{</span> title<span class="token punctuation">,</span> children <span class="token punctuation">}</span></span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> theme <span class="token operator">=</span> <span class="token function">useContext</span><span class="token punctuation">(</span>ThemeContext<span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">const</span> className <span class="token operator">=</span> <span class="token string">&#39;panel-&#39;</span> <span class="token operator">+</span> theme<span class="token punctuation">;</span>
  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token operator">&lt;</span>section className<span class="token operator">=</span><span class="token punctuation">{</span>className<span class="token punctuation">}</span><span class="token operator">&gt;</span>
      <span class="token operator">&lt;</span>h1<span class="token operator">&gt;</span><span class="token punctuation">{</span>title<span class="token punctuation">}</span><span class="token operator">&lt;</span><span class="token operator">/</span>h1<span class="token operator">&gt;</span>
      <span class="token punctuation">{</span>children<span class="token punctuation">}</span>
    <span class="token operator">&lt;</span><span class="token operator">/</span>section<span class="token operator">&gt;</span>
  <span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">function</span> <span class="token function">Button</span><span class="token punctuation">(</span><span class="token parameter"><span class="token punctuation">{</span> children<span class="token punctuation">,</span> disabled<span class="token punctuation">,</span> onClick <span class="token punctuation">}</span></span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> theme <span class="token operator">=</span> <span class="token function">useContext</span><span class="token punctuation">(</span>ThemeContext<span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">const</span> className <span class="token operator">=</span> <span class="token string">&#39;button-&#39;</span> <span class="token operator">+</span> theme<span class="token punctuation">;</span>
  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token operator">&lt;</span>button
      className<span class="token operator">=</span><span class="token punctuation">{</span>className<span class="token punctuation">}</span>
      disabled<span class="token operator">=</span><span class="token punctuation">{</span>disabled<span class="token punctuation">}</span>
      onClick<span class="token operator">=</span><span class="token punctuation">{</span>onClick<span class="token punctuation">}</span>
    <span class="token operator">&gt;</span>
      <span class="token punctuation">{</span>children<span class="token punctuation">}</span>
    <span class="token operator">&lt;</span><span class="token operator">/</span>button<span class="token operator">&gt;</span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>另外还有封装Provider,这里不再多说，就是把传递的对象通过props传递给封装的组件，在进行操作</p><p><strong>我们来重点说一下这个结合Reducer来进行拓展的</strong></p><blockquote><p>之前实习的时候碰见过这种写法,在这里我就是着重说一下</p></blockquote><h2 id="如何进行优化provider-usecontext这种传递方式" tabindex="-1"><a class="header-anchor" href="#如何进行优化provider-usecontext这种传递方式"><span>如何进行优化Provider,useContext这种传递方式</span></a></h2><h2 id="应用场景" tabindex="-1"><a class="header-anchor" href="#应用场景"><span>应用场景</span></a></h2><p>我们可以用来构造封装自己的状态管理</p><h1 id="参考资料" tabindex="-1"><a class="header-anchor" href="#参考资料"><span>参考资料</span></a></h1>`,29),u={href:"https://react.docschina.org",target:"_blank",rel:"noopener noreferrer"};function k(d,v){const s=t("ExternalLinkIcon");return p(),e("div",null,[r,n("p",null,[n("a",u,[o("官网"),c(s)])])])}const b=a(i,[["render",k],["__file","useContext.html.vue"]]),g=JSON.parse('{"path":"/tools/repository/API/useContext.html","title":"useContext","lang":"zh-CN","frontmatter":{},"headers":[{"level":2,"title":"如何使用？","slug":"如何使用","link":"#如何使用","children":[]},{"level":2,"title":"通过context更新传递的数据","slug":"通过context更新传递的数据","link":"#通过context更新传递的数据","children":[]},{"level":2,"title":"如何进行优化Provider,useContext这种传递方式","slug":"如何进行优化provider-usecontext这种传递方式","link":"#如何进行优化provider-usecontext这种传递方式","children":[]},{"level":2,"title":"应用场景","slug":"应用场景","link":"#应用场景","children":[]}],"git":{},"filePathRelative":"tools/repository/API/useContext.md"}');export{b as comp,g as data};
