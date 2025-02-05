# 已发博客-李和贵
# React.memo
>React 的渲染机制，组件内部的 state 或者 props 一旦发生修改，整个组件树都会被重新渲染一次，即时子组件的参数没有被修改，甚至无状态组件
会造成性能浪费

**React.memo 是 React 官方提供的一个高阶组件，用于缓存我们的需要优化的组件**

>React 中的组件被设计为在状态或 props 值发生变化时重新渲染。但是，这可能会影响应用程序的性能，因为即使更改只是为了影响父组件，附加到父组件的所有其他子组件都将重新呈现。当父组件重新渲染时，其所有子组件也会重新渲染。
React Memo 是一个高阶组件，它包装组件以记忆渲染的输出并避免不必要的渲染。这提高了性能，因为它会记住结果并跳过渲染以重用上次渲染的结果。

**已经记忆化的组件，怎么触发更新**
- 即使一个组件被记忆化了，当它自身的状态发生变化时，它仍然会重新渲染。memoization 只与从父组件传递给组件的 props 有关。
- 即使组件已被记忆化，当其使用的 context 发生变化时，它仍将重新渲染。记忆化只与从父组件传递给组件的 props 有关。
- useMemo
    - 见拓展（下面）
- 自定义比较函数（见Memo参数-第二个参数，下面）
## 两种方式
- 直接创建(类式创建)
    ```javascript
    const myComponent = React.memo((props) => {
        /* render using props */
    });
    export default myComponent;
    ```
- 函数组件
```javascript
    const myComponent = (props) => {
        /* render using props */
    };
    export const MemoizedComponent = React.memo(myComponent);
```
**仅当 props 值发生变化或组件的状态和上下文发生变化时，memo组件才会重新渲染**

## 参数
React.memo(Component, arePropsEqual?)
- Component
    组件
- arePropsRqual
    可选参数，为一个函数
    接受两个参数：
    >一个函数，接受两个参数：组件的前一个 props 和新的 props。如果旧的和新的 props 相等，即组件使用新的 props 渲染的输出和表现与旧的 props 完全相同，则它应该返回 true。否则返回 false。通常情况下，你不需要指定此函数。默认情况下，React 将使用 Object.is 比较每个 prop。
```javascript
function MyComponent(props) {
  /* 使用 props 渲染 */
}
function shouldMemo(prevProps, nextProps) {
  /*
  如果把 nextProps 传入 render 方法的返回结果与
  将 prevProps 传入 render 方法的返回结果一致则返回 true，
  否则返回 false
  */
}
export default React.memo(MyComponent, shouldMemo);
```
## 应用场景
- 当props没有改变时跳过重新渲染
    
- 使用state更新记忆化(memoized)组件

**切记，不可以普遍使用该组件，不能都进行缓存，太多缓存，会造成负优化**
# 拓展
## useMemo
### useMemo(calculateValue, dependencies)
>在组件的顶层调用 useMemo 来缓存每次重新渲染都需要计算的结果，它在每次重新渲染的时候能够缓存计算结果
```
    const cachedValue = useMemo(calculateValue, dependenies)
```
- calculateValue
    要缓存计算的函数。之后组件更新，如果dependenies没有发生变化，React将直接返回相同值。否则，将会再次调用calculateValue并返回最新结果，然后进行缓存以便下次进行使用。
- dependenies
    跟一般钩子的依赖项作用一样
# 参考资料
[官网](https://react.docschina.org/reference/react/memo)
[掘金](https://juejin.cn/post/7188041140963115066?searchId=2023080116574982B3D403AE15790335B3)