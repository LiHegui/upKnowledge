# Javascript面试题
## 说说JavaScript中的数据类型？
- 基本类型
  - number、string、boolean、null、undefined、symbol
  - 存储于栈上
- 引用类型
  - 统称为Object, 又可以细分为Function、Array等
  - 引用类型的对象存储于堆中
  - 引用类型对应的值存储在堆中，在栈中存放的是指向堆内存的地址
  - 引用类型数据存放在堆中，每个堆内存对象都有对应的引用地址指向它，引用地址存放在栈中

## 谈谈 JavaScript 中的类型转换机制？

- 隐式转换
    - 转字符串：除了+有可能把运算子转为字符串，其他运算符都会把运算子自动转成数值
    - 转布尔值：在需要布尔值的地方，就会将非布尔值的参数自动转为布尔值，系统内部会调用Boolean函数
- 强制转换
  - Number()
  - String()
  - parselent()
  - Boolean()

## 说说数组的常用方法有哪些？

- 作用于原数组
    - push
    - pop
    - unshift
        原数组开头添加任意个值，然后返回数组的最新长度
    - shift
    - splice
        传入三个参数，分别是开始位置、0（要删除的元素数量）、插入的元素，返回空数组


- 不影响原数组
    - concat
        首先会创建一个当前数组的副本，
    - forEach、map、filter、some、every等遍历方法
    - slice
        一个新数组
    - join 
        拉平成字符串

**手写filter方法**
好像手写这个没有什么意思，直接写就行了

## JavaScript字符串的常用方法有哪些？

- chatAt  获取指定位置的字符
- split  拆分为数组
- concat 创建副本成新的字符串
- match 匹配是否有相关字符
- slice 参数说明起始位置 - 结束位置（默认为字符串length）
- splice 参数说明起始位置， 删除几个 ，插入新元素
- trim trimRight trimLeft
- repeat
- includes
- indexOf
- replace 参数说明：匹配元素， 替换元素
- search

## 深拷贝浅拷贝的区别？如何实现一个深拷贝？

## typeof 与 instanceof 区别

- typeof 
    typeof会返回一个变量的基本类型，instanceof返回的是一个布尔值
    而typeof 也存在弊端，它虽然可以判断基础数据类型（null 除外），但是引用数据类型中，除了function 类型以外，其他的也无法判断
- instanceof
    instanceof 可以准确地判断复杂引用数据类型，但是不能正确判断基础数据类型
- Object.prototype.toString().call() []
    完美的获取类型方法
    ```javascript
        function getType(obj){
            let type  = typeof obj;
            if (type !== "object") {    // 先进行typeof判断，如果是基础数据类型，直接返回
                return type;
            }
            // 对于typeof返回结果是object的，再进行如下的判断，正则返回结果
            return Object.prototype.toString.call(obj).replace(/^\[object (\S+)\]$/, '$1'); 
        }
    ```

## JavaScript原型，原型链 ? 有什么特点？

每个函数都有一个属性叫做prototype,指向实例的原型对象,每个实例对象都会有个__proto__指向原型对象
原型对象都有一个constructor对象,指向构造函数。
当我们当问一个对象的属性时，JS会在这个对象的属性中进行查找，如果没有找到，就会沿着__proto__这个隐式
原型关联起来的链条向上一个对象查找


## for in 和 for of 的区别

for in常用于遍历对象，而for of常用于遍历数组和类似数组的对象

- for in
    for in 语句用于遍历数组或者对象的属性（对数组或者对象的属性进行循环操作）。for in得到对对象的key或数组，字符串的下标。for of和forEach一样，是直接得到值。for of不能用于对象
- for of 
    而for of输出的是数组的每一项的值

## 说说JavaScript中的事件模型
DOM事件模型中的事件对象常用属性
    - type用于获取事件类型
    - target获取事件目标
    - stopPropagation()阻止事件冒泡
    - preventDefault()阻止事件默认行为
- 捕获阶段
- 目标阶段
- 冒泡阶段
## 解释下什么是事件代理？应用场景？

事件流
捕获阶段 -> 目标阶段 -> 冒泡阶段
true                    false  => 对于监听（addEventListener）的第三个参数

事件委托

点击子元素会触发事件冒泡，父组件也能相应这一事件，但是需要从事件哪里获取到是哪个子元素触发的，从而减少事件绑定，较少代码繁琐，优化性能

但是注意的是：

focus、blur这些事件没有事件冒泡机制，所以无法进行委托绑定事件

## 说说你对事件循环的理解
- 异步事件
  - 异步
  - 微任务
- 同步任务

## 说说你对闭包的理解？闭包使用场景

**闭包可以在一个内层函数中访问到其外层函数的作用域**

闭包是指那些引用了另一个函数作用域中变量的函数，通常是在嵌套函数中实现的
闭包让你在一个内层函数中访问其外层函数的变量
原理：作用域链，当前作用域可访问上层作用域
解决的问题：属性私有化，能够让函数作用域的变量在函数执行之后不会销毁，同时也能在函数外部可以访问函数内部的局部变量
带来的问题：内存泄漏

## 使用场景
- 创建私有变量
   ```javascript
    // 模拟私有变量
    // 私有变量是不能获取到的，但是可以通过闭包去获取
    let Counter = (function () {
        let privateCounter = 0;

        function changeBy(val) {
            privateCounter += val;
        }

        return {
            increment: function () {
                changeBy(1);
            },
            decrement: function () {
                changeBy(-1);
            },
            value: function () {
                return privateCounter;
            }
        }
    })();
   ```
- 延长变量的声明周期
闭包的应用：模块化、能够实现柯里化、防抖与节流
## 函数柯里化
柯里化的目的在于避免频繁调用具有相同参数函数的同时，又能够轻松的重用
```javascript
// 假设我们有一个求长方形面积的函数
function getArea(width, height) {
    return width * height
}
// 如果我们碰到的长方形的宽高是10
const area1 = getArea(10, 20)
const area2 = getArea(10, 30)
const area3 = getArea(10, 40)
// 我们可以使用闭包柯里化这个计算面积的函数
function getArea(width) {
    return height => {
        return width * height
    }
}
const getTenWidthArea = getArea(10)
// 之后碰到宽度为10的长方形就可以这样计算面积
const area1 = getTenWidthArea(20)
// 而且如果遇到宽度偶尔变化也可以轻松复用
const getTwentyWidthArea = getArea(20)
```

## 说说JavaScript为什么是单线程?
JavaScript是单线程的，这是由于JavaScript的最初设计和历史原因所决定的。
- Web Worker提供了一个多线程的解决方案。
    Web Workder可以在后台创建一个线程运行JavaScript代码，但是这个线程不能访问DOM和其它浏览器API。

## 实现异步的几种方式
js 语言执行环境是"单线程"
所谓单线程，就是指一次只能完成一件任务。如果有多个任务，就必须排队。前面一个任务完成，再执行后面的一个任务。
- 回调函数
    回调函数就是将函数作为参数，传入一个函数中，就行调用。函数中一般要结合其他的异步函数，才能达到异步函数的效果
    但是回调函数与异步函数并无直接联系，只是回调函数喜欢用回调的方式呈现。
    ```javascript
        // 普通回调函数
        function fun1(callback) {
            callback()
        }
        fun1(() => {
            console.log(1);
        })
        console.log(2);
        // 借助异步函数setTimeout
        function fun2(callback, times) {
            setTimeout(callback, times)
        }
        fun2(() => {
            console.log(3);
        }, 1000)
        console.log(4);
    ```
- 事件监听
    事件总线、发布与订阅中的监听事件
    一方发布，多方接受，接受发布事件并相应
    事件总线实现方式
    ```typescript
        type Callback<T> = (payload: T) => void;
        class EventBus<T> {
            private events: { [event: string]: Array<Callback<T>> } = {};

            on(event: string, callback: Callback<T>): void {
                if (!this.events[event]) {
                    this.events[event] = [];
                }
                this.events[event].push(callback);
            }

            emit(event: string, payload: T): void {
                this.events[event]?.forEach(callback => {
                    callback(payload);
                });
            }

            off(event: string, callback: Callback<T>): void {
                if (this.events[event]) {
                    this.events[event] = this.events[event].filter(cb => cb !== callback);
                }
            }

            clear(): void {
                this.events = {}
            }
        }
    ```
    订阅与发布代码实现

- 定时器
- Promise
  - Promise是什么？
    Promise解决了回调地狱的问题，在传统的异步编程中，如果异步之间存在依赖关系，我们就需要层层嵌套满足这种依赖关系，可读性和可维护性就会变得很差，Promise的出现让其变成链式调用，增强了可读性和可维护性。
    Promise是处理异步的一种方式，Promise常用的有then、catch等方法
    Promise函数内部属于同步任务，.then()属于微任务（异步任务中的微任务），.catch()用来捕捉错误
    - 事件循环
        同步任务，异步任务又分异步任务和微任务
        先执行同步任务，然后去执行微任务，微任务执行完毕后，去执行异步任务，每执行一个异步任务，都会检查有没有同步任务和
        微任务，有就按顺序去执行，再去执行异步任务，一直循环，直到所有任务执行结束。
  - 如何实现一个Promise？
- Generator
- async与await

## [Set、Map](./Set、Map/index.md)

## [对象](./Object/index.md)

## [字符串](./String/index.md)

## [原型](./原型/index.md)

## 迭代器生成器

