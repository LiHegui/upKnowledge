# redux
redux是一个状态容器
- Store里面保存了一颗状态树（state tree）
- 组件改变state的唯一方法是通过调用store的dispatch方法，触发一个action，这个action
    被对应的reducer处理，于是state完成更新。
- 组件可以派发（dispatch）行为action给store，而不是直接通知其它组件。
- 其它组件可以通过订阅store中的状态state来刷新自己的视图

## redux怎么用

- 创建 action
```javascript
// actions.js
export const INCREMENT_COUNTER = 'INCREMENT_COUNTER';
export function incrementCounter() {
  return {
    type: INCREMENT_COUNTER
  };
}
```
- 创建 reducer
```javascript
// reducers.js
import { INCREMENT_COUNTER } from './actions';
const initialState = {
  counter: 0
};
function rootReducer(state = initialState, action) {
  switch (action.type) {
    case INCREMENT_COUNTER:
      return {
        ...state,
        counter: state.counter + 1
      };
    default:
      return state;
  }
}
export default rootReducer;
```
在上面的代码中，我们定义了一个名为 initialState 的变量，它是一个包含 counter 属性的对象，用于存储应用程序的状态。
然后，我们创建了一个名为 rootReducer 的纯函数，该函数接收当前 state 和 action，根据 action 的类型更新 state，并返回一个新的 state。在这个示例中，我们使用了 ES6 的展开语法来创建新的 state 对象，从而避免了直接修改原始 state 对象
- 创建 store
```javascript
// store.js
import { createStore } from 'redux';
import rootReducer from './reducers';
const store = createStore(rootReducer);
export default store;
```
- 组件中使用store
```javascript
// MyComponent.js

import React from 'react';
import { connect } from 'react-redux';
import { incrementCounter } from './actions';

function MyComponent(props) {
  return (
    <div>
      <p>当前计数器的值为：{props.counter}</p>
      <button onClick={props.increment}>增加计数器</button>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    counter: state.counter
  };
}

function mapDispatchToProps(dispatch) {
  return {
    increment: () => dispatch(incrementCounter())
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MyComponent);
```