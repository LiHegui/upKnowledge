# React的Router如何使用(V6)？
- BrowserRouter 和 HashRouter还是应用的顶层
- Routes包裹Route
    V6版本采用的是Routes包裹Route来规范路由。
- History
## 路由器组件
- BrowserRouter
    使用干净的URL将当前位置存储在浏览器的地址栏中，并使用浏览器的内置历史记录堆栈进行导航。
    - basename
        在特定位置上进行运行, 如/app下运行。
        ```javascript
            <BrowerRouter basename='/app'></BrowerRouter>
        ```
    - future
    - window
- HashRouter
## Route
Route里面有很多可以配置的东西
    -path

    - action
    - errorElement
        错误元素，当在loader、actions或组件渲染抛出异常时起作用。
    - lazy
    - loader
    - shouldRevalidate
## 钩子
- useRoutes
    该钩子的功能相当于`<Routes>`,但是它使用JavaScript对象不是`<Route>`元素来定义路由。
    `<Route>`这些对象具有与普通元素相同的属性，但是他们不需要JSX。
    我们利用该属性可以做抽离路由成路由表（类似于Vue的路由表）
# Router如何进行验证操作？
- 如上 `## Route`
    