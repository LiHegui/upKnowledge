# React知识 库

## 理解useEffect

  允许函数组件执行副作用操作
  在一定程度上充当生命周期的缺席
  useEffect能够为函数组件引入副作用
  componentDidMount、componentDidUpdate、ComponentWillUnmount
  都可以放在这里做

### 更加深入的理解useEffect

>前情提示： useEffect 在执行时是有顺序的！！！ 如果useEffect 不传第二个参数(不传依赖项) ，不仅 初次渲染 会执行，并且只要设置的 任一 state 值改变 都会 触发 useEffect执行！！！ 也就是 React初次渲染和之后的每次更新渲染都会调用一遍useEffect函数

```javascript
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `You clicked ${count} times`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```
effect如何获取最新的count的状态值

### 连接到外部系统
  >你需要向 useEffect 传递两个参数：
  >一个 setup 函数 ，其 setup 代码 用来连接到该系统。
  >它应该返回一个 清理函数（cleanup），其 cleanup 代码 用来与该系统断开连接。
  >一个 依赖项列表，包括这些函数使用的每个组件内的值。

  >React 在必要时会调用 setup 和 cleanup，这可能会发生多次：
  >1. 将组件挂载到页面时，将运行 setup 代码。
  >2. 重新渲染 依赖项 变更的组件后：
  >    - 首先，使用旧的 props 和 state 运行 cleanup 代码。
  >    - 然后，使用新的 props 和 state 运行 setup 代码。
  >3. 当组件从页面卸载后，cleanup 代码 将运行最后一次。

### 自定义Hook

官网上有个比较好的例子 - 定制 useChatRoom Hook

```javascript
import { useEffect } from 'react';
import { createConnection } from './chat.js';

function ChatRoom({ roomId }) {
  const [serverUrl, setServerUrl] = useState('https://localhost:1234');

  useEffect(() => {
  	const connection = createConnection(serverUrl, roomId);
    connection.connect();
  	return () => {
      connection.disconnect();
  	};
  }, [serverUrl, roomId]);
  // ...
}
```

我们可以把useEffect那一段拆离出来做自定义Hook

```javascript
import { useEffect } from 'react';
import { createConnection } from './chat.js';

export function useChatRoom({ serverUrl, roomId }) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => {
      connection.disconnect();
    };
  }, [roomId, serverUrl]);
}

```
我们直接导入使用即可

```javascript
 useChatRoom({
    roomId: roomId,
    serverUrl: serverUrl
  });
```

对于庞大，可分离、可复用的逻辑，拆离出来做自定义Hook是个很好的选择

#### 在自定义Hook中封装Effect

>Effect 是一个 “逃生出口”：当你需要“走出 React 之外”或者当你的使用场景没有更好的内置解决方案时，你可以使用它们。
如果你发现自己经常需要手动编写 Effect，那么这通常表明你需要为组件所依赖的通用行为提取一些 **自定义 Hook**

### 控制非React小部件

## 探究 useEffect 原理

### 每次渲染都有它自己的Effects


## 资料

[推荐资料](https://overreacted.io/zh-hans/a-complete-guide-to-useeffect/)

[React-Hooks 初识 （二）：useEffect代替常用生命周期函数：useEffect 处理副作用](https://juejin.cn/post/7039526242407677983?searchId=2023101314251286A16AFC4C8A37BF82C2)