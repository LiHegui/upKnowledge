## Fiber

js引擎和页面渲染引擎是在同一个渲染线程之内，两者是互斥关系。如果在某个阶段执行任务特别长，例如在定时器阶段或Begin Frame阶段执行时间非常长，时间已经明显超过了16ms，那么就会阻塞页面的渲染，从而出现卡顿现象。

>在 react16 引入 Fiber 架构之前，react 会采用递归对比虚拟DOM树，找出需要变动的节点，然后同步更新它们，这个过程 react 称为reconcilation（协调）。在reconcilation期间，react 会一直占用浏览器资源，会导致用户触发的事件得不到响应。实现的原理如下所示：

### Vue 是没有 Fiber

Vue 是基于 template 和 watcher 的组件级更新，把每个更新任务分割得足够小，不需要使用到 Fiber 架构，将任务进行更细粒度的拆分
React 是不管在哪里调用 setState，都是从根节点开始更新的，更新任务还是很大，需要使用到 Fiber 将大任务分割为多个小任务，可以中断和恢复，不阻塞主进程执行高优先级的任务

### fiber是一种新的数据结构

Fiber 可以理解为是一个执行单元，也可以理解为是一种数据结构

每执行一个执行单元, react就会检查还剩余多长时间， 如果没有将会把控制权让出去。

**fiber链表数据结构**

Fiber是链表数据结构，fiber tree 是单链表结构

### fiber执行原理

从根节点开始渲染和调度的过程可以分为两个阶段：render 阶段、commit 阶段

1. render 阶段
    这个阶段是可中断的，找出所有节点的变更
    1. React Fiber首先是将虚拟DOM树转化为Fiber tree，因此每个节点都有child、sibling、return属性
    2. 
2. commit 阶段
    这个阶段是不可中断的，会执行所有的变更

    

