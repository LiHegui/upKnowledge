import{_ as e,o as t,c as o,e as n}from"./app-DHLwyd6l.js";const p={},a=n('<h1 id="purecomponent" tabindex="-1"><a class="header-anchor" href="#purecomponent"><span>PureComponent</span></a></h1><p>新版本已经废弃但是还是可以用的</p><blockquote><p>React.PureComponent 与 React.Component 很相似。两者的区别在于 React.Component 并未实现 shouldComponentUpdate()，而 React.PureComponent 中以浅层对比 prop 和 state 的方式来实现了该函数。</p></blockquote><p><strong>原理</strong></p><p>当组件更新时，如果组件的 props 和state 都没发生改变， render 方法就不会触发，省去 Virtual DOM 的生成和比对过程，达到提升性能的目的。 这里需要注意的是，这里的对比都是浅层对比</p><p><strong>摘自官网</strong> React.PureComponent 中的 shouldComponentUpdate() 仅作对象的浅层比较。如果对象中包含复杂的数据结构，则有可能因为无法检查深层的差别，产生错误的比对结果。仅在你的 props 和 state 较为简单时，才使用 React.PureComponent，或者在深层数据结构发生变化时调用 forceUpdate() 来确保组件被正确地更新。你也可以考虑使用 immutable 对象加速嵌套数据的比较。</p><p>此外，React.PureComponent 中的 shouldComponentUpdate() 将跳过所有子组件树的 prop 更新。因此，请确保所有子组件也都是“纯”的组件。</p>',7),r=[a];function c(s,m){return t(),o("div",null,r)}const l=e(p,[["render",c],["__file","PureComponent.html.vue"]]),d=JSON.parse('{"path":"/tools/docs/interview/React/%E7%9F%A5%E8%AF%86%E5%BA%93/React%E9%AB%98%E9%98%B6%E7%BB%84%E4%BB%B6/PureComponent.html","title":"PureComponent","lang":"zh-CN","frontmatter":{},"headers":[],"git":{},"filePathRelative":"tools/docs/interview/React/知识库/React高阶组件/PureComponent.md"}');export{l as comp,d as data};