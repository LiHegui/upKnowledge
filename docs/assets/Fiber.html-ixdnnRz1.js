import{_ as e,o as i,c as r,e as t}from"./app-BzfR_7FA.js";const a={},l=t('<h2 id="fiber" tabindex="-1"><a class="header-anchor" href="#fiber"><span>Fiber</span></a></h2><p>js引擎和页面渲染引擎是在同一个渲染线程之内，两者是互斥关系。如果在某个阶段执行任务特别长，例如在定时器阶段或Begin Frame阶段执行时间非常长，时间已经明显超过了16ms，那么就会阻塞页面的渲染，从而出现卡顿现象。</p><blockquote><p>在 react16 引入 Fiber 架构之前，react 会采用递归对比虚拟DOM树，找出需要变动的节点，然后同步更新它们，这个过程 react 称为reconcilation（协调）。在reconcilation期间，react 会一直占用浏览器资源，会导致用户触发的事件得不到响应。实现的原理如下所示：</p></blockquote><h3 id="vue-是没有-fiber" tabindex="-1"><a class="header-anchor" href="#vue-是没有-fiber"><span>Vue 是没有 Fiber</span></a></h3><p>Vue 是基于 template 和 watcher 的组件级更新，把每个更新任务分割得足够小，不需要使用到 Fiber 架构，将任务进行更细粒度的拆分 React 是不管在哪里调用 setState，都是从根节点开始更新的，更新任务还是很大，需要使用到 Fiber 将大任务分割为多个小任务，可以中断和恢复，不阻塞主进程执行高优先级的任务</p><h3 id="fiber是一种新的数据结构" tabindex="-1"><a class="header-anchor" href="#fiber是一种新的数据结构"><span>fiber是一种新的数据结构</span></a></h3><p>Fiber 可以理解为是一个执行单元，也可以理解为是一种数据结构</p><p>每执行一个执行单元, react就会检查还剩余多长时间， 如果没有将会把控制权让出去。</p><p><strong>fiber链表数据结构</strong></p><p>Fiber是链表数据结构，fiber tree 是单链表结构</p><h3 id="fiber执行原理" tabindex="-1"><a class="header-anchor" href="#fiber执行原理"><span>fiber执行原理</span></a></h3><p>从根节点开始渲染和调度的过程可以分为两个阶段：render 阶段、commit 阶段</p><ol><li>render 阶段 这个阶段是可中断的，找出所有节点的变更 <ol><li>React Fiber首先是将虚拟DOM树转化为Fiber tree，因此每个节点都有child、sibling、return属性</li><li></li></ol></li><li>commit 阶段 这个阶段是不可中断的，会执行所有的变更</li></ol>',13),n=[l];function c(b,s){return i(),r("div",null,n)}const h=e(a,[["render",c],["__file","Fiber.html.vue"]]),f=JSON.parse('{"path":"/interview/React/Fiber.html","title":"","lang":"zh-CN","frontmatter":{},"headers":[{"level":2,"title":"Fiber","slug":"fiber","link":"#fiber","children":[{"level":3,"title":"Vue 是没有 Fiber","slug":"vue-是没有-fiber","link":"#vue-是没有-fiber","children":[]},{"level":3,"title":"fiber是一种新的数据结构","slug":"fiber是一种新的数据结构","link":"#fiber是一种新的数据结构","children":[]},{"level":3,"title":"fiber执行原理","slug":"fiber执行原理","link":"#fiber执行原理","children":[]}]}],"git":{"updatedTime":1724126230000,"contributors":[{"name":"LiHegui","email":"1487647822@qq.com","commits":1}]},"filePathRelative":"interview/React/Fiber.md"}');export{h as comp,f as data};