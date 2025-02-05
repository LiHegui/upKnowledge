# React面试题

## 谈谈你对React的理解

React是构建用户界面的JavaScript库，只提供了UI层面的解决方案

特点： 
- JSX的语法
    
- 单向数据绑定
    速度更快
- 虚拟DOM
- 声明式编程
- component 更注重抽离和组件化
    组件式开发，提高代码复用率
    应该具有的特点：可组合，可重用，可维护

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


虚拟DOM

组件更新 -> render方法 ->  生成新的虚拟DOM -> diff算法 -> 定位两次的差异 -> 渲染真实DOM

## 说说对React中类组件和函数组件的理解？有什么区别？
## 类式组件

## 函数式组件
## 说说对React Hooks的理解？解决了什么问题？



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
我们先来了解一下setState过程
代码中调用了setState函数之后，React会将传入的参数对象与组件进行合并。然后触发调和过程。经过调和过程，
React会以相对高效的方式根据新的状态构建React元素树，并且着手重新渲染整个UI界面。
- setState是同步还是异步
    setState并不是单纯异步还是同步，具体情况具体分析
    - state完全替换
    - React控制不到的地方，比如原生事件
## setState一定会合并吗
其实不然，完全替换的时候，就不会合并。合并只是一种优化策略。
## React 高阶组件、Render props、hooks 有什么区别，为什么要不断迭代?
## React Hooks的使用限制有哪些？
## React fiber是什么？有什么用？

Fiber会将一个额大的更新任务拆解为许多个小任务

Fiber架构的重要特征就是可以被打断的异步渲染方式

生命周期工作流

**render阶段在执行过程中允许被打断，而commit阶段总是同步执行的**



## React18和之前版本的区别





