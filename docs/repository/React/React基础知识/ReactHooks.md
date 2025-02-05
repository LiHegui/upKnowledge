## ReactHooks 常用钩子(已发)

### 1.useState

**useState 会返回一个数组**：**一个 state，一个更新 state 的函数**

- 在初始化渲染期间，返回的状态 (state) 与传入的第一个参数值相同
- 你可以在事件处理函数中或其他一些地方调用这个函数。它类似 class 组件的 this.setState，但是它**不会把新的 state 和旧的 state 进行合并，而是直接替换**

例：

```javascript
import React,{useState}from 'react'

export default function App() {
    const [first, setfirst] = useState('second')
  return (
    <div>{first}
    <button onClick={()=>{
        setfirst("three")
    }}>click</button>
    </div>
  )
}
```

**执行机制**



### 2.useEffect

**格式：**

```
useEffect(() => {
      first
      return () => { //清理函数 会在组件卸载时及下一次副作用函数调用之前执行
        second
      }
    }, [third])
```

useEffect 接收一个函数，该函数会在组件渲染到屏幕之后才执行，该函数有要求：**要么返回一个能清除副作用的函数，要么就不返回任何内容**，所以 return 是可选的

useEffect 第一个参数 callback, 返回的 second， second 作为下一次 callback 执行之前调用，用于清除上一次 callback 产生的副作用。

第二个参数作为依赖项，是一个数组，可以有多个依赖项，依赖项改变，执行上一次 callback 返回的 second，和执行新的 effect 第一个参数 callback 。

对于 useEffect 执行， React 处理逻辑是采用异步调用 ，对于每一个 effect 的 callback， React 会向 setTimeout 回调函数一样，放入任务队列，等到主线程任务完成，DOM 更新，js 执行完成，视图绘制完毕，才执行。所以 effect 回调函数不会阻塞浏览器绘制视图。

### 3.useCallback

记忆函数 防止因为组件重新渲染，导致方法被重新创建 ，起到缓存作用; 只有第二个参数 变化了，才重新声明一次

例：

```
const handleAdd=useCallback(
        ()=>{
            setlist([...list,text])
            settext("")
        },
      [list,text],
    )
```

比如上面的例子，当第二个参数的 list,text 值发生了变化时，第一个参数就会进行一次更新

### 4.useMemo

useMemo 相当于 vue 中的计算属性 也具有记忆函数功能

与 useCallback 的唯一的区别是：useCallback 不会执行第一个参数函数，而是将它返回给你，

而 useMemo 会执行第一个函数并且将函数执行结果返回给你

```
const cacheSomething = useMemo(create,deps)
```

### 5.useRef

React 的 uesRef 这里我认为和 vue3 的 useRef 非常相似，下面进行一个简单介绍

useRef 可以用来获取元素，缓存状态，接受一个状态 initState 作为初始值，返回一个 ref 对象 cur, cur 上有一个 current 属性就是 ref 对象需要获取的内容。

```js
const cur = React.useRef(initState)
console.log(cur.current)
```


**useRef 基础用法：**

**useRef 获取 DOM 元**素，在 React Native 中虽然没有 DOM 元素，但是也能够获取组件的节点信息（ fiber 信息 ）。

```js
const DemoUseRef = () => {
  const dom = useRef(null)
  const handerSubmit = () => {
    /*  <div >表单组件</div>  dom 节点 */
    console.log(dom.current)
  }
  return (
    <div>
      {/* ref 标记当前dom节点 */}
      <div ref={dom}>表单组件</div>
      <button onClick={() => handerSubmit()}>提交</button>
    </div>
  )
}
```

如上通过 useRef 来获取 DOM 节点。

**useRef 保存状态，** 可以利用 useRef 返回的 ref 对象来保存状态，只要当前组件不被销毁，那么状态就会一直存在。

```js
const status = useRef(false)
/* 改变状态 */
const handleChangeStatus = () => {
  status.current = true
}
```

**注意**
>函数组件通常使用useRef,用来获取元素，createRef 主要用于 class 组件。而函数组件通常使用 useRef
- createRef,返回一个对象。createRef不接受任何参数
  - 返回的对象只有一个属性current,如果你把 ref 对象作为 JSX 节点的 ref 属性传递给 React，React 将设置其 current 属性。
  - 相当于
    ```javascript
      const ref = useRef() 等同于 const [ref, _] = useState(() => createRef(null))
    ```

demo

```javascript
import { Component, createRef } from 'react';

class Form extends Component {
  inputRef = createRef();

  // ...
} 
```
React 将把 input 的 DOM 节点赋值给 this.inputRef.current

### 6.useContext

useContext ，来获取父级组件传递过来的 context 值，这个当前值就是最近的父级组件 Provider 设置的 value 值，useContext 参数一般是由 createContext 方式创建的 ,也可以父级上下文 context 传递的 ( 参数为 context )。useContext 可以代替 context.Consumer 来获取 Provider 中保存的 value 值。

所以我是这样理解的**useContext 就是上下文**

```js
const contextValue = useContext(context)
```

useContext 接受一个参数，一般都是 context 对象，返回值为 context 对象内部保存的 value 值。

**useContext 基础用法：**

```js
//使用createContext创建并初始化
const Context = createContext(null)
/* 用useContext方式 */
const DemoContext = () => {
  const value: any = useContext(Context)
  /* my name is alien */
  return <div> my name is {value.name}</div>
}

/* 用Context.Consumer 方式 */
const DemoContext1 = () => {
  return (
    <Context.Consumer>
      {/*  my name is alien  */}
      {(value) => <div> my name is {value.name}</div>}
    </Context.Consumer>
  )
}

export default () => {
  return (
    <div>
      <Context.Provider value={{ name: "alien", age: 18 }}>
        <DemoContext />
        <DemoContext1 />
      </Context.Provider>
    </div>
  )
}
```

### 7.useReducer

useReducer 是 react-hooks 提供的能够在无状态组件中运行的类似 redux 的功能 api 。

**useReducer 基础介绍：**

```js
const [ ①state , ②dispatch ] = useReducer(③reducer)
复制代码
```

① 更新之后的 state 值。

② 派发更新的 dispatchAction 函数, 本质上和 useState 的 dispatchAction 是一样的。

③ 一个函数 reducer ，我们可以认为它就是一个 redux 中的 reducer , reducer 的参数就是常规 reducer 里面的 state 和 action, 返回改变后的 state, 这里有一个需要注意的点就是：**如果返回的 state 和之前的 state ，内存指向相同，那么组件将不会更新。**

**useReducer 基础用法：**

```js
const DemoUseReducer = () => {
  /* number为更新后的state值,  dispatchNumbner 为当前的派发函数 */
  const [number, dispatchNumbner] = useReducer((state, action) => {
    const { payload, name } = action
    /* return的值为新的state */
    switch (name) {
      case "add":
        return state + 1
      case "sub":
        return state - 1
      case "reset":
        return payload
    }
    return state
  }, 0)
  return (
    <div>
      当前值：{number}
      {/* 派发更新 */}
      <button onClick={() => dispatchNumbner({ name: "add" })}>增加</button>
      <button onClick={() => dispatchNumbner({ name: "sub" })}>减少</button>
      <button onClick={() => dispatchNumbner({ name: "reset", payload: 666 })}>
        赋值
      </button>
      {/* 把dispatch 和 state 传递给子组件  */}
      <MyChildren dispatch={dispatchNumbner} State={{ number }} />
    </div>
  )
}
```
