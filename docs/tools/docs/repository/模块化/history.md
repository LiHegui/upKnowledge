## 前端模块的现状

### ES Module
ES Module 是 2015 年颁布的 ES2015（原名 ES6）标准所覆盖的特性之一，设计目标是整合 CommonJS、AMD 等已有模块方案，提供一个标准的、更高效的做法。ES Module 与现有方案的区别主要在以下方面：

- 声明式而非命令式，或者说 import 是声明语句 Declaration 而非表达式 Statement
    CommonJS中的require就是Statement
    ```javascript
        const path = require('path')
    ```
    ES Module中的 import是声明语句
- import 和 export 的值也和 CommonJS 这种以 exports Object 为载体的方式不同
- 默认运行环境为 module ，相当于 script 模式的普通脚本 'use strict' 开启严格模式