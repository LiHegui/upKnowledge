# React知识库

## redux工作流程

Redux时JavaScriptz状态容器
- store 单一数据源
- action 是对变化的描述
    通知reducer，让state发生改变，返回新的state
- reducer 负责对变化进行分发和处理
    是将新的state返回store

在Redux的整个工作过程中，数据流是严格单向的

## React Hooks



- 类组件
    
- 函数组件
    函数组件会捕捉render内部的状态
  
Hooks
- useState
    为函数组件引入状态
- useEffect
    允许函数组件执行副作用操作
    在一定程度上充当生命周期的缺席
    useEffect能够为函数组件引入副作用
    componentDidMount、componentDidUpdate、ComponentWillUnmount
    都可以放在这里做
- 
 

## 推荐文章
[学习 redux 源码整体架构，深入理解 redux 及其中间件原理](https://juejin.cn/post/6844904191228411911)