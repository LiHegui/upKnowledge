##  JS跟C++ 应用程序通信
>QWebChannel 填补了 C++ 应用程序和 HTML/JavaScript 应用程序之间的空白。通过将 QObject 派生对象发布到 QWebChannel 并在 HTML 端使用 qwebchannel.js，可以透明地访问 QObject 的属性、公共槽和方法。不需要手动消息传递和数据序列化，C++ 端的属性更新和信号发射会自动传输到可能远程运行的 HTML 客户端。在客户端，将为任何已发布的 C++ QObject 创建 JavaScript 对象。它反映了 C++ 对象的 API，因此可以直观地使用

```javascript
import QWebChannel from './qwebchannel.js'

/**
 * @description window.qt.webChannelTransport 可用 WebSocket 实例代替。
 * 经实践发现，Qt 向全局注入的 window.qt 仅有属性 webChannelTransport，并且该对象仅有
 * 两个属性方法：send 和 onmessage
 * send 方法用于 js 端向 Qt 端传输 `JSON` 信息
 * onmessage 用于接受 `Qt` 端发送的 `JSON` 信息
 */
new QWebChannel(window.qt.webChannelTransport, initCallback)

```