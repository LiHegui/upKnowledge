# useReducer
```javascript
const [state, dispatch] = useReducer(reducer, initialArg, init?)
```
- userReducer(reducer, initalArg, init?)
    在组件的顶层作用域调用useReducer以创建一个用于管理状态的reducer
    - reducer
        >用于更新state的纯函数。参数为state和action,返回值是更新后的state。state与action可以是任意合法值。
    - initalArg
        >用于初始化state的任意值。初始值的计算逻辑取决于接下来的init函数
    - init
        >可选参数：用于计算初始值的函数。如果存在，使用init(initialArg)的执行结果作为初始值，否则使用initialArg
- dispatch函数
    >useReducer 返回的 dispatch 函数允许你更新 state 并触发组件的重新渲染。它需要传入一个 action 作为参数：
    React 会调用 reducer 函数以更新 state，reducer 函数的参数为当前的 state 与传递的 action。
    - action 
        >用户执行的操作。可以是任意类型的值。
        通常来说 action 是一个对象，其中 type 属性标识类型，其它属性携带额外信息。
        ```javascript
            function handleClick(){
                dispatch({type: 'incremented_age'})
            }
        ```

## 用法

```javascript
import { useReducer } from 'react';

function reducer(state, action) {
  if (action.type === 'incremented_age') {
    return {
      age: state.age + 1
    };
  }
  throw Error('Unknown action.');
}

export default function Counter() {
  // 在组件的顶层作用域调用 useReducer 来创建一个用于管理状态（state）的 reducer。
  const [state, dispatch] = useReducer(reducer, { age: 42 });

  return (
    <>
      <button onClick={() => {
        dispatch({ type: 'incremented_age' })
      }}>
        Increment age
      </button>
      <p>Hello! You are {state.age}.</p>
    </>
  );
}
```
## 对比useState

## 实现一个reducer
```javascript

```