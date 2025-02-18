# React面试题

## 谈谈你对React的理解

React是构建用户界面的JavaScript库，只提供了UI层面的解决方案。
遵循组件设计模式，函数式编程的编程概念

特点： 
- JSX的语法
    
- 单向数据流
  > React中的单向数据绑定是指数据流从上至下，从父组件流向子组件。
  > 父组件负责传递数据给子组件，子组件根据这些数据进行渲染。
  >这种数据流方式有助于简化组件间的关系，提高代码的可维护性和可读性。

  子组件不能直接修改父组件的数据，可以选择通知父组件（父组件中写好更新函数）进行修改

- 虚拟DOM

- 声明式编程
- component 更注重抽离和组件化

  组件式开发，提高代码复用率
  应该具有的特点：可组合，可重用，可维护

  注意，React组件首字母要大写，小写的话会被认为是原生DOM标签。（要通过Babel去对JSX进行转化为对应的JS对象，才能让浏览器识别。此时就会有个依据去判断是原生DOM标签，还是React组件，而这个依据就是标签的首字母）

  React.Fragment 等价于<></>

  组件化思想，页面会被切分成一些独立的、可复用的组件

## JSX转成真实DOM的过程

JSX是JavaScript的一种语法拓展，它和模板语言很像，但是它具备充分的JavaScript的能力

经过babel的处理

1. JSX 会被编译为React.createElement(), React.createElement()将会返回一个叫做React Element的JS对象
  这里的编译就是指babel
  ```javascript
  /**
  * React.createElement
  * @param {*} type 用于标识节点的类型
  * @param {*} config 以对象形式传入，组件所有的属性都会以键值对的形式储存到conig对象中
  * @param {*} children 以对象的形式传入，，它记录的是组件标签之间的嵌套的内容
  */
  export function createElement(type, config, children) {
    ...
  }
  ```
  🔨 demo
  ```javascript
  class ClassComponent extends Component {     // 类式组件
    static defaultProps = {
      color: "pink"
    };
    render() {
      return (
        <div className="border">
          <h3>ClassComponent</h3>
          <p className={this.props.color}>{this.props.name}</p >
        </div>
      );
    }
  }

  function FunctionComponent(props) {      // 函数式组件
    return (
      <div className="border">
        FunctionComponent
        <p>{props.name}</p >
      </div>
    );
  }

  const jsx = (                        
    <div className="border">
      <p>xx</p >                   
      <a href="#">xxx</ a>
      <FunctionComponent name="函数组件" />
      <ClassComponent name="类组件" color="red" />
    </div>
  );
  ```
  这里值得注意的是

  JSX ->  babel -> React.createElement -> ReactElement -> 虚拟DOM ->ReactDoM.render() -> 真实DOM

  在转化过程中，babel在编译时会判断 JSX 中组件的首字母：

  当首字母为小写时，其被认定为原生 DOM 标签，createElement 的第一个变量被编译为字符串

  当首字母为大写时，其被认定为自定义组件，createElement 的第一个变量被编译为对象

  React.createElement其被调用时会传⼊标签类型type，标签属性props及若干子元素children

2. 最后，React.render会将React Element对象渲染到真实的DOM
  最后就是挂载某个节点上
  ReactDOM.render(<App />,  document.getElementById("root"));
  ```javascript
  ReactDOM.render(
    // 需要渲染的元素(ReactElement)
    element,
    // 元素挂载的目标容器
    container,
    // 回调函数， 可选参数，， 可以用来处理渲染结束后的逻辑
    callback
  )
  ```

整个流程图解

![](./img/render.png)
 

## 说说 Real DOM 和 Virtual DOM 的区别？优缺点？

虚拟Dom是`React.createElement`创建的对象，是一个虚拟的DOM节点，是一个JS对象，它是一个轻量级的JavaScript对象，用于描述真实DOM的结构和属性。

**对比**
- 在传统的Web应用中，数据的变化会实时地更新到用户界面中，于是每次数据微小的变化都会引起DOM的渲染。

- 虚拟DOM的目地：是将所有的操作聚集到一块，计算出所有的变化后，统一更新一次虚拟DOM

也就是说，一个页面如果有500次变化，没有虚拟DOM的就会渲染500次，而虚拟DOM只需要渲染一次，从这点上来看，页面越复杂，虚拟DOM的优势越大


**核心依据：浏览器在处理DOM的时候会很慢，处理JavaScript会很快**


组件更新 -> render方法 ->  生成新的虚拟DOM -> diff算法 -> 定位两次的差异 -> 渲染真实DOM

推荐文章

[「React深入」一文吃透虚拟DOM和diff算法](https://juejin.cn/post/7116326409961734152?searchId=202502171412563BE24C347D355A9FBD37)

## useRef和useState的区别

**`useRef`**

在整个组件生命周期中存储一个可变的引用，这个引用不会触发组件的重新渲染。useRef返回一个可变的ref对象，其.current属性被初始化为传入的参数（useRef(initValue)）。

  - 获取元素
    useRef 返回一个可变的 ref 对象
  - 保存变量
    保存变量，在组件重新渲染时不会丢失

**`useState`**

使用, 返回两个值，state，和更新函数



```javascript
  const [state, setState] = useState(initialValue)
```

## 说说对React中类组件和函数组件的理解？有什么区别？



## super() 和 super(props) 有什么区别？

在 React 中，`super()` 和 `super(props)` 的区别主要体现在类组件的构造函数中，尤其是在处理 `props` 时。

1. `super()`
- **作用**: 调用父类的构造函数。
- **使用场景**: 如果你在构造函数中没有用到 `this.props`，可以使用 `super()`。
- **示例**:
  ```javascript
  class MyComponent extends React.Component {
    constructor(props) {
      super();
      console.log(this.props); // undefined
    }
  }
  ```
  在这种情况下，`this.props` 是 `undefined`，因为 `super()` 没有传递 `props` 给父类。

2. `super(props)`
- **作用**: 调用父类的构造函数，并将 `props` 传递给父类。
- **使用场景**: 如果你在构造函数中需要访问 `this.props`，必须使用 `super(props)`。
- **示例**:
  ```javascript
  class MyComponent extends React.Component {
    constructor(props) {
      super(props);
      console.log(this.props); // 可以访问 this.props
    }
  }
  ```
  在这种情况下，`this.props` 是可用的，因为 `super(props)` 将 `props` 传递给了父类。

3. 总结
- **`super()`**: 不传递 `props`，构造函数中 `this.props` 为 `undefined`。
- **`super(props)`**: 传递 `props`，构造函数中 `this.props` 可用。

4. 最佳实践
- 如果你在构造函数中需要访问 `this.props`，使用 `super(props)`。
- 如果你不需要访问 `this.props`，可以使用 `super()`。

5. 现代 React 中的变化
在现代 React 中，使用类组件的场景越来越少，函数组件和 Hooks 更为常见。如果你使用函数组件，就不需要关心 `super()` 和 `super(props)` 的问题了。

6. 示例代码
```javascript
class MyComponent extends React.Component {
  constructor(props) {
    super(props); // 传递 props
    console.log(this.props); // 可以访问 this.props
  }
}

class AnotherComponent extends React.Component {
  constructor(props) {
    super(); // 不传递 props
    console.log(this.props); // undefined
  }
}
```

通过理解 `super()` 和 `super(props)` 的区别，你可以更好地控制类组件中的 `props` 访问。

## 说说React的事件机制？

React基于浏览器的事件机制自身实现了一套事件机制，包括事件注册、事件的合成、事件冒泡、事件派发等

在React中这套事件机制被称之为合成事件

React 的事件机制与原生 DOM 事件机制有所不同，它是 React 自己实现的一套**合成事件（Synthetic Event）**系统。这套机制的主要目的是解决跨浏览器兼容性问题，并提供更高效的事件处理方式。以下是 React 事件机制的核心特点和实现原理：

---

1. **合成事件（Synthetic Event）**
React 的事件是合成事件，它是 React 封装的一个跨浏览器的事件对象。合成事件是对原生 DOM 事件的包装，提供了统一的 API 和行为，确保在不同浏览器中表现一致。

- **特点**：
  - 合成事件是跨浏览器的，兼容所有主流浏览器。
  - 合成事件是池化的（pooled），即事件对象会被复用，事件回调执行完毕后，事件对象的属性会被清空。
  - 合成事件通过事件委托机制绑定到根节点（如 `document` 或 `ReactDOM.render` 的容器），而不是直接绑定到具体的 DOM 元素。

---

2. **事件委托**
React 使用了**事件委托**机制，将所有事件绑定到根节点（如 `document`），而不是直接绑定到具体的 DOM 元素。当事件触发时，React 会根据事件的目标（`event.target`）找到对应的组件，并调用相应的事件处理函数。

- **优点**：
  - 减少内存消耗：不需要为每个 DOM 元素绑定事件。
  - 动态绑定：即使组件动态添加或删除，也不需要手动绑定或解绑事件。

---

3. **事件绑定**
在 React 中，事件绑定是通过 JSX 的属性（如 `onClick`、`onChange`）来实现的。React 会自动将这些事件绑定到根节点，并在事件触发时调用相应的事件处理函数。

**示例**：
```jsx
function MyComponent() {
  const handleClick = () => {
    console.log("Button clicked!");
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

在上面的例子中，`onClick` 是一个合成事件，React 会将其绑定到根节点，并在点击按钮时调用 `handleClick` 函数。

---

4. **事件池化（Event Pooling）**
React 的合成事件是池化的，即事件对象会被复用。事件回调执行完毕后，事件对象的属性会被清空，以减少内存分配和垃圾回收的开销。

- **注意事项**：
  - 如果需要异步访问事件对象（如在 `setTimeout` 或 `Promise` 中），需要调用 `event.persist()` 来从池中移除事件对象，否则事件对象的属性会被清空。

**示例**：
```jsx
function MyComponent() {
  const handleClick = (event) => {
    event.persist(); // 从池中移除事件对象
    setTimeout(() => {
      console.log(event.target); // 可以正常访问事件对象
    }, 100);
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

---

5. **事件传播**
React 的事件传播机制与原生 DOM 事件类似，分为三个阶段：
1. **捕获阶段**：从根节点向下传播到目标节点。
2. **目标阶段**：事件到达目标节点。
3. **冒泡阶段**：从目标节点向上传播到根节点。

在 React 中，事件处理函数默认在冒泡阶段触发。如果需要监听捕获阶段的事件，可以使用 `onClickCapture` 这样的属性。

**示例**：
```jsx
function MyComponent() {
  const handleClick = () => {
    console.log("Bubbling phase");
  };

  const handleClickCapture = () => {
    console.log("Capturing phase");
  };

  return (
    <div onClickCapture={handleClickCapture} onClick={handleClick}>
      <button>Click me</button>
    </div>
  );
}
```

---

6. **与原生事件的对比**
| 特性                | 原生 DOM 事件                  | React 合成事件                |
|---------------------|-------------------------------|-------------------------------|
| 事件绑定            | 直接绑定到 DOM 元素            | 绑定到根节点，事件委托         |
| 事件对象            | 原生 `Event` 对象              | 合成事件对象（`SyntheticEvent`）|
| 跨浏览器兼容性      | 需要手动处理                   | 自动处理                       |
| 事件池化            | 无                            | 有                            |
| 事件传播            | 支持捕获和冒泡                 | 支持捕获和冒泡                 |

---

7. **React 17 中的事件委托变化**
在 React 17 之前，合成事件是绑定到 `document` 上的。从 React 17 开始，合成事件改为绑定到 `ReactDOM.render` 的根容器上。这一变化使得 React 应用可以更好地与其他非 React 代码共存。

---

8. **总结**
- React 的事件机制是基于**合成事件**的，提供了跨浏览器兼容性和高效的事件处理。
- 事件通过**事件委托**绑定到根节点，减少了内存消耗和动态绑定的复杂性。
- 合成事件是池化的，事件对象会被复用，需要注意异步访问时调用 `event.persist()`。
- React 17 将事件委托从 `document` 改为根容器，进一步优化了事件机制。

希望这个解释能帮助你更好地理解 React 的事件机制！如果还有疑问，欢迎继续提问！


## 说说对React Hooks的理解？解决了什么问题？

解决函数组件原为无状态组件，成为内部可以进行维护自身状态

- useState
    ```javascript
      const [state, setState] = useState(initialState)
    ```
    注意：
    1. initialState: 你希望 state 初始化的值。它可以是任何类型的值，但对于函数有特殊的行为。在初始渲染后，此参数将被忽略
    2. 严格模式下，React将两次调用初始化函数，
    3. set函数仅更新下一次的渲染的状态变量。如果在调用set函数后读取状态变量。如果在调用 set 函数后读取状态变量，则 仍会得到在调用之前显示在屏幕上的旧值。如果你提供的新值与当前 state 相同（由 Object.is 比较确定），React 将 跳过重新渲染该组件及其子组件。React 会 批量处理状态更新。它会在所有 事件处理函数运行 并调用其 set 函数后更新屏幕。这可以防止在单个事件期间多次重新渲染。
    4. flushSync 允许你强制 React 在提供的回调函数内同步刷新任何更新，这将确保 DOM 立即更新
  React 会存储新状态，使用新值重新渲染组件，并更新 UI
    调用 set 函数 不会 改变已经执行的代码中当前的 state （有一种异步的感觉）
      - **解决办法**： 你可以向 set函数中传递一个 更新函数，而不是下一个状态
      
  更新状态中的对象和数组
    可以通过创建一个新对象来替换整个对象

- useRef
    引入一个不需要渲染的值
    ```javascript
    const ref = useRef(initialValue)
    ```
    initialValue：ref 对象的 current 属性的初始值。可以是任意类型的值。这个参数在首次渲染后被忽略。

    >useRef返回一个对象，ref.current为initialValue.
    >改变 ref.current 属性时，React 不会重新渲染组件。
    >React 不知道它何时会发生改变，因为 ref 是一个普通的 JavaScript 对象。

    1. 使用 useRef 声明 ref。你可以在其中保存任何值，但最常用于保存 DOM 节点。
    2. 使用用 ref 引用一个值
     - 可以在重新渲染之间 存储信息
     - 可以在重新渲染之间 存储信息
     - 
    注意：改变ref不会触发渲染，
- useEffect
- useContext
    useContext, 可以让你读取和订阅组件中的context
    ```javascript
      useContext(SomeContext)
    ```
    SomeContext：先前用 createContext 创建的 context。context 本身不包含信息，它只代表你可以提供或从组件中读取的信息类型。
    **用法：**
     - 向组件深处传递数据
     - 通过context更新传递的数据
    
- useCallback
    
    
- useReducer
  在组件的顶层作用域调用 useReducer 以创建一个用于管理状态的 reducer。

## state 和 props 有什么区别？
- state
    state是用来保存组件状态、控制以及修改自己状态。
    外部不可访问，可以说是组件私有属性
- props
    是传递给组件的（类似于函数的传参），只读不可改
## 组件中如何验证Props
React为我们提供了PropTypes以供验证使用。如果使用typescript那么就可以直接用接口来定义。
```javascript
import React from "react";
import propTypes from 'prop-types'
class State extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            
        }
    }
    render() {
        return (
            <div>
                {this.props.name}
            </div>
        )
    }
}
State.propTypes = {
    name: propTypes.string
}
export default State;
```
# super() 和 super(props) 有什么区别？
super()和super(props)都是调用父类构造函数的语句。
- super()
    会调用父类的构造函数并将this绑定到子类的实例。如果子类的构造函数中
    没有使用this,则可以省略super调用
- super(props)
    则是在子类的构造函数中调用父类的构造函数，并将props对象出传递给父类的构造函数。
    props对象传递给父类的构造函数，以便在组件中使用this.props访问它。
## super
在JavaScript中，super是一个关键字，用于调用父类中的构造函数和方法。
- 当子类继承父类时，子类必须使用 super 调用父类的构造函数，以便子类可以继承父类的属性和方法。在 constructor 方法中，使用 super 调用父类的构造函数时，可以使用 this 关键字访问子类的属性和方法
# 说说 React中的setState执行机制
类式组件中有setState机制
- 组件中多次调用setState()，会进行合并，组件只执行一次更新操作
- 流程
    1.将setState传入的partialState参数存储在当前组件实例的state暂存队列中。
    2.判断当前React是否处于批量更新状态，如果是，将当前组件加入待更新的组件队列中。
    3.如果未处于批量更新状态，将批量更新状态标识设置为true，用事务再次调用前一步方法，保证当前组件加入到了待更新组件队列中。
    4.调用事务的waper方法，遍历待更新组件队列依次执行更新。
    5.执行生命周期componentWillReceiveProps。
    6.将组件的state暂存队列中的state进行合并，获得最终要更新的state对象，并将队列置为空。
    7.执行生命周期componentShouldUpdate，根据返回值判断是否要继续更新。
    8.执行生命周期componentWillUpdate。
    9.执行真正的更新，render。
    10.执行生命周期componentDidUpdate
## setState是同步还是异步？

在 React 中，`setState` 的行为既可以是**异步**的，也可以是**同步**的，具体取决于调用它的上下文。以下是对 `setState` 行为的详细解释：

---

1. **`setState` 的异步行为**
在大多数情况下，`setState` 是**异步**的。React 会将多个 `setState` 调用合并（批处理），然后一次性更新组件状态，以提高性能。

**异步的原因**：
- **性能优化**：React 会将多个状态更新合并，减少不必要的重新渲染。
- **一致性**：确保在事件处理函数或生命周期方法中，状态更新是批处理的，避免中间状态导致的 UI 不一致。

**示例**：
```javascript
class MyComponent extends React.Component {
  state = {
    count: 0,
  };

  handleClick = () => {
    this.setState({ count: this.state.count + 1 });
    console.log(this.state.count); // 输出 0，因为 setState 是异步的
  };

  render() {
    return (
      <div>
        <p>{this.state.count}</p>
        <button onClick={this.handleClick}>Increment</button>
      </div>
    );
  }
}
```

在上面的例子中，`console.log` 输出的仍然是旧的状态值，因为 `setState` 是异步的，状态更新还没有完成。

---

2. **`setState` 的同步行为**
在某些情况下，`setState` 会表现为**同步**更新。例如：
- 在 **`setTimeout`、`Promise`、原生事件** 等异步代码中调用 `setState` 时，React 不会进行批处理，状态会立即更新。

**示例**：
```javascript
class MyComponent extends React.Component {
  state = {
    count: 0,
  };

  handleClick = () => {
    setTimeout(() => {
      this.setState({ count: this.state.count + 1 });
      console.log(this.state.count); // 输出 1，因为 setState 是同步的
    }, 0);
  };

  render() {
    return (
      <div>
        <p>{this.state.count}</p>
        <button onClick={this.handleClick}>Increment</button>
      </div>
    );
  }
}
```

在这个例子中，`setState` 在 `setTimeout` 中调用，因此它是同步的，`console.log` 会输出更新后的状态值。

---

3. **如何获取更新后的状态？**
由于 `setState` 是异步的，如果你需要在状态更新后执行某些操作，可以使用 `setState` 的第二个参数（回调函数）。

**示例**：
```javascript
this.setState({ count: this.state.count + 1 }, () => {
  console.log(this.state.count); // 输出更新后的状态值
});
```

---

4. **函数式 `setState`**
`setState` 还可以接受一个函数作为参数，这个函数会接收当前状态和 `props` 作为参数，并返回一个新的状态对象。这种方式可以避免直接依赖 `this.state`，尤其是在多次调用 `setState` 时。

**示例**：
```javascript
this.setState((prevState, props) => {
  return { count: prevState.count + 1 };
});
```

---

5. **React 18 中的自动批处理**
在 React 18 中，React 引入了**自动批处理**机制，即使在 `Promise`、`setTimeout` 等异步代码中，`setState` 也会被批处理。如果你希望在某些情况下禁用批处理，可以使用 `ReactDOM.flushSync`。

**示例**：
```javascript
import { flushSync } from 'react-dom';

flushSync(() => {
  this.setState({ count: this.state.count + 1 });
});
console.log(this.state.count); // 输出更新后的状态值
```

---

6. **总结**
- **异步**：在 React 事件处理函数和生命周期方法中，`setState` 是异步的，React 会进行批处理。
- **同步**：在 `setTimeout`、`Promise`、原生事件等异步代码中，`setState` 是同步的。
- **获取更新后的状态**：使用 `setState` 的第二个参数（回调函数）或函数式 `setState`。
- **React 18**：引入了自动批处理机制，进一步优化了状态更新的行为。

setState一定会合并吗

其实不然，完全替换的时候，就不会合并。合并只是一种优化策略。
## [React 高阶组件](./高阶组件.md)


## React fiber是什么？有什么用？

**Fiber**

js引擎和页面渲染引擎是在同一个渲染线程之内，两者是互斥关系。如果在某个阶段执行任务特别长，例如在定时器阶段或Begin Frame阶段执行时间非常长，时间已经明显超过了16ms，那么就会阻塞页面的渲染，从而出现卡顿现象。

>在 react16 引入 Fiber 架构之前，react 会采用递归对比虚拟DOM树，找出需要变动的节点，然后同步更新它们，这个过程 react 称为reconcilation（协调）。在reconcilation期间，react 会一直占用浏览器资源，会导致用户触发的事件得不到响应。实现的原理如下所示：

**Vue 是没有 Fiber**

Vue 是基于 template 和 watcher 的组件级更新，把每个更新任务分割得足够小，不需要使用到 Fiber 架构，将任务进行更细粒度的拆分
React 是不管在哪里调用 setState，都是从根节点开始更新的，更新任务还是很大，需要使用到 Fiber 将大任务分割为多个小任务，可以中断和恢复，不阻塞主进程执行高优先级的任务

**fiber是一种新的数据结构**

Fiber 可以理解为是一个执行单元，也可以理解为是一种数据结构

每执行一个执行单元, react就会检查还剩余多长时间， 如果没有将会把控制权让出去。

**fiber链表数据结构**

Fiber是链表数据结构，fiber tree 是单链表结构

**fiber执行原理**

从根节点开始渲染和调度的过程可以分为两个阶段：render 阶段、commit 阶段

1. render 阶段
    这个阶段是可中断的，找出所有节点的变更
    1. React Fiber首先是将虚拟DOM树转化为Fiber tree，因此每个节点都有child、sibling、return属性
    2. 
2. commit 阶段
    这个阶段是不可中断的，会执行所有的变更


## React18和之前版本的区别


## 为什么说React中的props是只读的？

React中props是单项数据流，父组件传进子组件的数据props改变后，子组件也会进行改变，但是子组件不可更改props的值，让变化变得难以预测

## React Fiber它的目的是解决什么问题？

GUI线程和JS线程是互斥的，会导致
- GUI负责绘制
- JS执行脚本


## React组件化



## 面试题：你是怎么理解Redux的？

**对Redux的理解**

Redux 是一个用于 JavaScript 应用的状态管理库，常用于 React 应用中。它的核心思想是将应用的状态集中管理，使状态的变化可预测且易于调试。Redux 特别适合处理复杂应用中的状态管理问题，尤其是当组件之间的状态共享和通信变得复杂时。

**Redux 的核心概念**

1. **Store**：存储应用状态的容器，整个应用只有一个 Store。
2. **State**：应用的状态，存储在 Store 中，是一个普通的 JavaScript 对象。
3. **Action**：描述状态变化的普通对象，通常包含一个 `type` 字段来指示动作类型，还可以包含其他数据。状态只能通过触发 Action 来改变
4. **Reducer**：纯函数，接收当前状态和 Action，返回新的状态。Reducer 定义了状态如何响应 Action 进行变化。
5. **Dispatch**：用于触发 Action 的方法，Store 通过 Dispatch 接收 Action 并更新状态。
6. **Subscribe**：用于监听状态变化的方法，当状态变化时，订阅的回调函数会被调用。

**Redux 的工作原理**

1. **初始化**：创建 Store 时，需要传入一个根 Reducer，Store 会调用 Reducer 获取初始状态。
2. **触发 Action**：当用户交互或其他事件发生时，通过 `dispatch(action)` 触发一个 Action。
3. **处理 Action**：Store 将当前的 State 和 Action 传递给 Reducer，Reducer 根据 Action 的类型和内容计算出新的 State。
4. **更新 State**：Store 更新为新的 State，并通知所有订阅了状态变化的监听器。
5. **视图更新**：监听器（通常是 React 组件）接收到状态变化后，重新渲染视图。

**示例代码**

```javascript
// Action Types
const INCREMENT = 'INCREMENT';
const DECREMENT = 'DECREMENT';

// Actions
const increment = () => ({ type: INCREMENT });
const decrement = () => ({ type: DECREMENT });

// Reducer
const counterReducer = (state = 0, action) => {
  switch (action.type) {
    case INCREMENT:
      return state + 1;
    case DECREMENT:
      return state - 1;
    default:
      return state;
  }
};

// Store
const { createStore } = Redux;
const store = createStore(counterReducer);

// Subscribe
store.subscribe(() => {
  console.log('Current state:', store.getState());
});

// Dispatch
store.dispatch(increment()); // Current state: 1
store.dispatch(increment()); // Current state: 2
store.dispatch(decrement()); // Current state: 1
```

**优点**

1. **单一数据源**：整个应用的状态存储在一个 Store 中，便于管理和调试。
2. **状态只读**：状态只能通过触发 Action 来改变，确保状态变化的可预测性。
3. **纯函数更新**：Reducer 是纯函数，相同的输入总是得到相同的输出，便于测试和调试。

**缺点**

1. **样板代码多**：Redux 需要编写大量的 Action 和 Reducer，增加了代码量。
2. **学习曲线陡峭**：对于初学者来说，理解 Redux 的概念和工作原理可能需要一些时间。

**总结**

Redux 通过集中管理应用状态，使状态变化可预测且易于调试。虽然它引入了额外的复杂性，但在处理复杂应用的状态管理时，Redux 提供了一种清晰和可维护的解决方案。


## super() 和 super(props) 有什么区别？

>super 关键字实现调用父类，super 代替的是父类的构建函数，使用 super(name) 相当于调用 sup.prototype.constructor.call(this,name)

类式组件中会有这种写法

## 说说 React 生命周期有哪些不同阶段？每个阶段对应的方法是？

React组件的生命周期分为三个阶段
- 挂载阶段
    - constructor
        实力过程中自动调用的方法，在方法内部通过super关键字获取来自父组件的props在该方法中，通常的操作
        为初始化state状态或者在this上挂载方法。
    - getDerivedStateFromProps
        静态方法
        getDerivedStateFormProps()在调用render方法之前，在初始化和后续更新都会被调用。
        该方法会返回一个对象来更新state,如果返回null则不更新任何内容。
    - render
        类组件必须要实现的方法，用于渲染DOM结构，可以访问state与prop属性。
    - componentDidMount
        组件挂载实例上之后，就是在render之后执行，用于一些数据获取、事件监听等操作。
- 更新阶段
    - getDerivedStateFromProps
        如上，该方法初始化和更新时都会调用。
    - shouldComponentUpdate
        shouldComponentUpdate() 在组件更新之前调用， 返回true时组件更新， 返回false则不更新
    - render
        类组件必须要实现的方法，用于渲染DOM结构，可以访问state与prop属性。
    - getSnapshotBeforeUpdate
        在最近一次的渲染输出被提交之前调用。在 render 之后，即将对组件进行挂载时调用。
    - componentDidUpdate
        完成更新之后调用
- 卸载阶段
    - componentWillUnmount
        此方法用于组件卸载前，清理一些注册事件是监听事件


## 说说对React Hooks的理解？解决了什么问题？

- useEffect 让函数式组件可以处理副作用(与UI渲染无关的一切代码)，并且可以模拟 componentDidMount，componentDidUpdate、compentWillUnMount等生命周期
    执行机制
    - 触发时机：useEffect 的触发时机依赖于提供的依赖数组。如果依赖数组为空，那么 useEffect 将在每次渲染后执行。如果依赖数组包含变量，那么 useEffect 将在这些变量发生变化时执行。
    - 执行顺序：在每次组件渲染后，React 会按照 useEffect 钩子的出现顺序来执行它们。如果某个 useEffect 依赖于另一个 useEffect 的输出，那么先执行依赖的 useEffect。
    - 清理：当 useEffect 执行完毕后，React 会自动清理其副作用，比如取消订阅、清除定时器等。
    - 错误处理：如果在 useEffect 的执行过程中抛出错误，React 会捕获这个错误并打印一条错误消息。
    - 性能优化：React 会根据 useEffect 的依赖数组来决定是否需要重新执行。如果依赖数组中的变量没有发生变化，那么 React 不会重新执行 useEffect。这有助于减少不必要的操作，提高应用的性能。
    **注意点：尽管 useEffect 在每次组件渲染后都会执行，但 React 不会在每次渲染后都重新创建 useEffect 的回调函数。这意味着如果你在回调函数中使用了闭包，那么这些闭包会在整个组件生命周期内保持不变。因此，在回调函数中使用的所有变量都必须是状态的一部分或者是在组件中不变的。**
- useState 用于设置函数式组件的状态，在状态更新的时候(setXXX)会进行浅比较，当更新的状态值与当前状态值相同的则不会触发更新。
- useRef 主要用于获取dom对象，获取子组件的实例，记录非状态数据用来持久化数据
- useMemo 与vue中的computed相似，接受一个计算函数以及依赖项，只有当依赖项改变的时候才会重新执行计算函数，否则将用上次缓存的结果。
- useReducer 类似Redux
- useLayoutEffect useLayoutEffect与useEffect用法相似，主要区别是它是在渲染前(此时Dom已经根据VDom进行了修改，但是还没有渲染呈现到屏幕上)同步执行的
- useCallback 用于在2次渲染间保存函数实例，防止多次渲染造成的函数重新创建，一般只在需要将函数作为 props 传递给子组件或将其作为依赖项传递给其他 Hook 时，才需要考虑使用 useCallback 进行优化

## 说说React Router有几种模式？实现原理？

React Router 主要支持两种路由模式：

- **BrowserRouter**（基于 HTML5 History API）
- **HashRouter**（基于 URL 的 hash 部分）

**1. BrowserRouter**
- **特点**：使用 HTML5 的 History API（`pushState`、`replaceState` 和 `popstate` 事件）来保持 UI 和 URL 的同步。
- **URL 格式**：`http://example.com/path`
- **优点**：URL 更简洁，没有 `#` 符号，更符合现代 Web 应用的习惯。
- **缺点**：需要服务器配置支持，确保在直接访问或刷新页面时能正确返回应用入口文件。

**2. HashRouter**
- **特点**：使用 URL 的 hash 部分（即 `#` 后面的部分）来保持 UI 和 URL 的同步。
- **URL 格式**：`http://example.com/#/path`
- **优点**：兼容性更好，不需要服务器额外配置，适合不支持 HTML5 History API 的旧浏览器。
- **缺点**：URL 中包含 `#`，不够美观，且 SEO 不友好。

**实现原理**

**1. BrowserRouter 的实现原理**
- **History API**：BrowserRouter 依赖于 HTML5 的 History API，通过 `pushState` 和 `replaceState` 方法来改变 URL，而不刷新页面。
- **监听 URL 变化**：通过监听 `popstate` 事件来响应浏览器的前进和后退操作。
- **路由匹配**：根据当前的 URL 路径，匹配对应的路由组件并渲染。

```javascript
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/about" component={About} />
        <Route path="/" component={Home} />
      </Switch>
    </Router>
  );
}
```

**2. HashRouter 的实现原理**
- **Hash 变化**：HashRouter 使用 URL 的 hash 部分来模拟路由变化，通过 `window.location.hash` 来改变 URL 的 hash 部分。
- **监听 hash 变化**：通过监听 `hashchange` 事件来响应 URL 的 hash 变化。
- **路由匹配**：根据当前的 hash 值，匹配对应的路由组件并渲染。

```javascript
import { HashRouter as Router, Route, Switch } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/about" component={About} />
        <Route path="/" component={Home} />
      </Switch>
    </Router>
  );
}
```

**对比**

| 特性            | BrowserRouter                  | HashRouter                  |
|-----------------|--------------------------------|-----------------------------|
| URL 格式        | `http://example.com/path`      | `http://example.com/#/path` |
| 依赖 API        | HTML5 History API              | URL hash                    |
| 服务器配置      | 需要支持                      | 不需要                      |
| 兼容性          | 现代浏览器                    | 所有浏览器                  |
| SEO             | 友好                          | 不友好                      |
| 使用场景        | 现代 Web 应用                 | 旧版浏览器或简单应用        |

**总结**

- **BrowserRouter**：适合现代 Web 应用，URL 简洁，SEO 友好，但需要服务器支持。
- **HashRouter**：兼容性好，无需服务器配置，适合旧版浏览器或简单应用，但 URL 中包含 `#`，SEO 不友好。

根据应用的需求和运行环境，可以选择合适的路由模式。
    


