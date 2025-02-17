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



## React 生命周期

组件初始化 -> render方法 

渲染工作流
指的是从组件数据改变到组件实际更新发生的过程

React15

挂载 -> 更新 -> 卸载

- constructor()
- componentWillReceiveProps()
  父组件触发更新时触发（不一定是相关的props）
- componentWillUnmount
  组件卸载时触发（组件被移除 ）

React16

废弃了componentWillMount

- getDerivedStateFromProps, 替代compponentWillReceiveProps
  使用Props来派生/更新state
  在更新和挂载两个阶段都会触发
 

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


## React Hooks的使用限制有哪些？


## React fiber是什么？有什么用？

Fiber会将一个额大的更新任务拆解为许多个小任务

Fiber架构的重要特征就是可以被打断的异步渲染方式

生命周期工作流

**render阶段在执行过程中允许被打断，而commit阶段总是同步执行的**



## React18和之前版本的区别


## 为什么说React中的props是只读的？

React中props是单项数据流，父组件传进子组件的数据props改变后，子组件也会进行改变，但是子组件不可更改props的值，让变化变得难以预测

## React Fiber它的目的是解决什么问题？

GUI线程和JS线程是互斥的，会导致
- GUI负责绘制
- JS执行脚本


## React组件化



## Redux

Redux是负责状态管理

- 单一数据源
- state 是只读的
- 使用纯函数来执行修改

### 如何使用

- 创建一个store

```javascript
  import { createStore } from 'redux' // 引入一个第三方的方法
  const store = createStore() // 创建数据的公共存储区域（管理员）
```

- state
    ```javascript
      // 设置默认值
      const initialState = {
        counter: 0
      }

      const reducer = (state = initialState, action) => {  // 也就是reducer
      }
    ```
- action
    改变内部状态的唯一方法是 dispatch 一个 action。
    这些 action 可以被序列化、记录或存储，然后再重放。
    用户派发action, dispatch给store
      - type 代表需要被执行的 action 类别

    ```javascript
      store.dispatch({
        type: "ADD_NUMBER",
        number: 5
      })
    ```
    **异步action**

- reducer
    接受state, action, 处理相关数据，返回state
    reducer是一个纯函数，不需要直接修改state
    ```javascript
      function counterReducer(state = { value: 0 }, action) {
        switch (action.type) {
          case "counter/incremented":
            return { value: state.value + 1 };
          case "counter/decremented":
            return { value: state.value - 1 };
          default:
            return state;
        }
      }
    ```
- 监听state的变化
  ```javascript
  store.subscribe(() => {
    console.log(store.getState());
  })
  ```
Redux Toolkit是推荐的编写Redux逻辑的方法

- 配置redux store
- 创建reducer函数并使用不可更改更新逻辑
- 一次性创建状态的某个片段slice


## React 路由

## React性能优化

