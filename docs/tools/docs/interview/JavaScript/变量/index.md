# 说说JavaScript中的数据类型？存储上的差别？
- 基本类型
    - number
    - boolean
    - undefined
    - string
    - null
    - NAN
    - symbol
        symbol是原始值，且符号实例是唯一的、不可变的。符号的确定是确保对象属性使用唯一表示符，不会发生属性冲突的危险。
- 复杂类型
    - Object
    - Array 
    - Function
## 判断类型

## 堆栈的区别
# null和undefine的区别 
null 和 undefined 都表示空值
null 表示一个被明确赋值为 null 的变量或对象属性。null 常用于表示一个不存在的对象，或者将一个对象的值空
undefined 表示一个声明了但未被赋值的变量，或者访问一个不存在的属性或数组元素时返回的值
二者都存在于栈内存

# let const var
var 表示定义变量 为函数作用域，存在变量提升
let 表示定义变量，为块级作用域
const 表示为常量，表示不允许更改，其实只要不改变值的地址就可以了，可以改变对象的属性。块级作用域变量。
## 作用域
作用域分为块级作用域、函数作用域、还有全局作用域
- 块级作用域
    为{}包含起来的就是块级作用域for循环，if判断等等
- 函数作用域
    函数内部存在的作用域，var声明的都是函数作用域，函数执行结束，不存在引用的话（闭包），就会把函数内部的变量进行回收。
- 全局作用域
    是指在函数外部定义的，全局可以访问到的，浏览器中指的是window，Node中指的是gobal对象
### 作用域链
# 谈谈 JavaScript 中的类型转换机制
- 显示转换
- 隐式转换
# typeof 与 instanceof 区别
- typeof 只能识别简单类型，引用类型都会判定为object
- instanceof 可以判断一个对象是否是某个类的实例，只能判断引用类型，不能判断基本类型。
最好的方案是Object.prototype.toString.call()，用于精准的判断变量的类型，还是需要剪切一下。
当然，还有一些API,比如数组的isArray(),isNaN方法
