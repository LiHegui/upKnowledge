# sourcemap映射的原理
# Javascript本地存储的方式有哪些？区别及应用场景？
- cookie =>是一种小型文本文件，主要是为了辨别用户身份信息而储存在用户本地的数据，为解决http无状态连接导致的问题。内存很小，通常只有4kb，数据可以在浏览器和服务器之间传递，适用于不同页面之间共享数据的情况。
- localStorage =>html5的新方法，兼容ie8以上浏览器，是一种持久化的储存，除非手动删除，否则一直存在。它只能通过js进行操作，而且之能储存字符串类型的数据，适用于需要在浏览器存储大量数据的情况。
- sessionStorage =>方法和localStorage类似，但是不是持久化存储，当前浏览器窗口关闭时，数据就会删除，适用于一次性登录的情况
# 什么是xss攻击？
# 什么是csrf攻击？
# 对浏览器缓存机制的了解？
当浏览器在请求资源的时候，会先检查本地缓存中是否存在该资源的缓存，如果该缓存存在而且没有过期，就直接从本地缓存中读取资源，而不需要重新请求服务器获取资源，从而提高页面的加载速度和性能

## 什么是协商缓存和强缓存？
- 强缓存：通过http响应头的expires和cache-control字段来控制缓存时间，浏览器在缓存时间内可以直接使用本地缓存资源。expires字段是一个时间戳，表示资源的过期时间；cache-control字段则可以指定缓存时间，是否允许缓存，是否需要验证等。使用强缓存可以减少服务器的负载和网络请求，提高页面的加载速度和性能
  
- 协商缓存：通过http响应头的last-modidied和etag字段来控制缓存验证，服务器会比较资源的修改时间或者唯一标识是否发生了变化，如果没发生变化，就返回一个304 not modified响应，通知浏览器可以使用本地缓存资源。协商缓存可以有效解决缓存过期后的缓存更新问题，减少网络请求，但需要服务器的支持。

## 浏览器的渲染流程

- 浏览器会**解析**三个东西
    1. HTML字符串描述了一个页面的结构，浏览器会把HTML结构字符串解析转换DOM树形结构。构建对应的DOM树
            字节数据 => 字符串 => Token => Node => DOM
    2. CSS 的解析在经历了从字节数据、字符串、标记化后，最终也会形成一颗 CSSOM 树, 不会阻塞构建DOM树
        但是解析了JS脚本，构建CSSOM也会阻塞DOM的构建，解析CSS会产生CSS规则树
    3. javascript脚本, 等到Javascript 脚本文件加载后， 通过 DOM API 和 CSSOM API 来操作 DOM Tree 和 CSS Rule Tree
        如果主线程解析到 script 位置，会停止解析HTML，等待 JS 文件下载好，并将全局代码解析并执行完成后，才能继续解析 HTML
        处理JS
        - 解析JavaScript代码
        - 执行JavaScript代码
        - 修改DOM和样式
        - 异步加载 async defer控制脚本的加载和执行时机
            没有async和defer, JS脚本会立即执行
            1. async 异步加载，异步加载好了就执行
            2. defer 延迟执行， 会放到HTML解析之后，有顺序的加载
- 解析完成之后，浏览器会通过DOM Tree和CSS Rule Tree 来构造 Rendering Tree
- 最后进行绘制
**因为 JS 代码的执行过程可能会修改当前的 DOM 树，所以需要等待js执行完成。这就是 JS 会阻塞 HTML 解析的根本原因。 这也是都建议将 script 标签放在 body 标签底部的原因。**
- DOM 树和 CSSOM 树合并成了一颗带有样式的 DOM 树
- 根据DOM树开始布局
- 分层
- 生成绘制指令
- 分块
    为了提高渲染性能，浏览器会将页面划分成多个块（或称为矩形区域）。每个块都有自己的绘制指令
- 光栅化
    光栅化是将矢量图形转换为位图的过程。浏览器会将每个块的绘制指令转换为位图。
- 绘制


[掘金好文](https://juejin.cn/post/6844903815758479374)

**延申：async defer**
- async 此属性表示脚本应当异步地执行。这意味着，当浏览器遇到async脚本时，它会立即开始下载脚本，而不等待其他页面加载完成。一旦脚本下载完成，浏览器会暂停当前的工作（如解析HTML），执行脚本，然后继续解析剩下的HTML。需要注意的是，使用async属性的脚本可能会在DOMContentLoaded事件触发之前就执行，这可能会导致一些未定义的行为。
- defer 此属性表示脚本将在文档解析完成后，但在DOMContentLoaded事件触发之前执行。这意味着，使用defer属性的脚本将在所有DOM内容都加载完成后执行，但不会阻塞页面的渲染。值得注意的是，使用defer的脚本按照它们在HTML中出现的顺序执行。
- script 这是标准的script标签，没有额外的属性。如果没有使用async或defer属性，那么脚本会在页面加载时同步执行。

## 不同标签页通信

SharedWorker

是一种特殊的Web Worker，可以在多个浏览器上下文中运行，例如多个窗口、iframe或其他worker。与普通worker不同，SharedWorker具有不同的全局作用域，即SharedWorkerGlobalScope。

在多个页面间共享信息时，只要保证创建时的第一个参数相同，就可以在多页签间共享信息。这是因为当在页签的html中创建SharedWorker时，如果第一个参数相同，则视为同一线程。

SharedWorker是一种使多个页面能够共享信息的Web Worker API，它在实现多页签间通信时非常有用

var myWorker = new SharedWorker('worker.js');

self.onmessage = function(event) {  
  console.log('Message received from main script:', event.data);  
  // 返回结果给主页面  
  postMessage('Message received!');  
};

myWorker.postMessage('Hello, worker!');


- postMessage 


## 说说地址栏输入 URL 敲下回车后发生了什么?

1. URL解析
2. DNS查询
3. TCP链接
4. HTTP请求
5. 响应请求
6. 页面渲染

## 说一下你理解的浏览器缓存

[浏览器缓存](./浏览器缓存.md)