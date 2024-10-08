# React面试题
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
## 说说React render方法的原理？在什么时候会被触发？
render函数在react里面有两种形式。
- 类式组件
    指的是render方法
- 函数式组件
    指的是函数本身
## 触发时机
- 组件初始构建
- 类组件调用setState修改状态
- 函数组件通过useState hook改变状态
- 类组件重新渲染
- 函数组件重新渲染

## 常用的Hooks

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