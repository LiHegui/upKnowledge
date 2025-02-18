# Javascript面试题
## 说说JavaScript中的数据类型？存储上的差别？
- 基本类型
  - number、string、boolean、null（音标：`/ nʌl /`） 、undefined、symbol
  - 存储于栈上
- 引用类型
  - 统称为Object, 又可以细分为Function、Array等
  - 引用类型的对象存储于堆中
  - 引用类型对应的值存储在堆中，在栈中存放的是指向堆内存的地址
  - 引用类型数据存放在堆中，每个堆内存对象都有对应的引用地址指向它，引用地址存放在栈中

## 说说数组的常用方法有哪些？

- push
    数组末尾推进一个元素
    返回数组添加后的长度
- pop
    数组末尾弹出一个元素
    返回弹出元素
- shift
    数组头部弹出一个元素
    返回弹出元素
- unshift
    数组头部加入一个元素
    返回数组添加后的长度
- splice
    替换
    splice(start, deleteCount, ...items)：从数组中删除或插入元素，返回被删除的元素。其中，start 指定了删除或插入的起始位置，deleteCount 指定了删除的元素个数，items 是要插入的元素。例如：
    参数 开始位置 删除个数 添加的元素
- slice
    截取，不会对原数组产生影响
    参数 开始位置 结束位置（不包括结束位置的元素）
    返回被截取的部分
- forEach
    forEach(callback)：对数组中的每个元素执行一次回调函数。其中，callback 是一个接受三个参数的函数，分别为当前元素的值、当前元素的索引和数组本身。
    forEach不可以用break和continue跳出循环，只能通过return跳出当前回调函数
    无返回值
- some
    对数组中的每个元素执行一次回调函数，如果有任意一个元素满足回调函数的条件，返回 true，否则返回 false。
- map
    对数组中的每个元素执行一次回调函数，返回一个新数组，新数组的元素是回调函数的返回值。
    参数 当前值 序号 原数组
    会返回一个新数组，新数组的元素是回调函数的返回值
- every
    对数组中的每个元素执行一次回调函数，如果所有元素都满足回调函数的条件，返回 true，否则返回 false。
- reduce
    累计的效果，不改变原数组
    ```js
        console.log(array.reduce((accumulator, currentValue, index, array) => {
            return accumulator + currentValue;
        }));
    ```
    callback接受四个参数，累计数，当前值，序号，原数组
    返回为累计值
- filter
    过滤，不会改变原函数
    ```js
        console.log('过滤掉2的倍数');
        console.log(array.filter((item) => item % 2));
        console.log('不改变原数组', array);
    ```
    返回值一个过滤后的新数组
- sort
    排序
    - 正序sort(a,b)=>a-b
    - 倒叙sort(a,b)=>b-a

**手写filter方法**

好像手写这个没有什么意思，直接写就行了

## JavaScript字符串的常用方法有哪些？

- chatAt  获取指定位置的字符
- split  拆分为数组
- concat 创建副本成新的字符串
- match 匹配是否有相关字符
- splice 参数说明起始位置， 删除几个 ，插入新元素
- slice 参数说明起始位置 - 结束位置（默认为字符串length）
- trim trimRight trimLeft
- repeat
- includes
- indexOf
- replace 参数说明：匹配元素， 替换元素
- search

## 谈谈 JavaScript 中的类型转换机制？

- 隐式转换
    - 转字符串：除了+有可能把运算子转为字符串，其他运算符都会把运算子自动转成数值
    - 转布尔值：在需要布尔值的地方，就会将非布尔值的参数自动转为布尔值，系统内部会调用Boolean函数
- 强制转换
  - Number()
  - String()
  - parselent()
  - Boolean()




## == 和 ===区别，分别在什么情况使用？

1. == 比较值相等

    **注意:**
    - 两个都为简单类型，字符串和布尔值都会转换成数值，再比较

    - 简单类型与引用类型比较，对象转化成其原始类型的值，再比较

    - 两个都为引用类型，则比较它们是否指向同一个对象

    - null 和 undefined 相等

    - 存在 NaN 则返回 false

2. === 比较值和类型是否都相同

相等操作符（==）会做类型转换，再进行值的比较，全等运算符不会做类型转换

## 深拷贝浅拷贝的区别？如何实现一个深拷贝？
- 浅拷贝
    创建一个新的对象，然后将原始对象的属性值复制到新对象中。但是只复制一层，深层次的数据共享内存，改了新的对象，旧的对象也会受到影响。
    - 拓展运算符
    - Array.prototype.slice 方法返回一个新的数组对象，用于数组
    - Array.prorotype.contact 合并数组， 用于数组
    - Object.assign  const newFoo2 = Object.assign({}, foo)
- 深拷贝
    深拷贝是指创建一个新的对象，该对象包含与原始对象相同的数据，但是在内存中完全独立于原始对象。这意味着修改深拷贝后的对象不会影响原始对象，它们是彼此独立的。
    - Json处理一个简单的深拷贝,
        ```javascript
        const newFoo = JSON.parse(JSON.stringify(foo));
        ```
    - 递归拷贝
        ```javascript
        function deepClone(obj, hash = new WeakMap()) {//引入weakmap是用于存储拷贝过的对象及其对应的拷贝对象，避免循环引用导致无限递归
            if (obj === null) return obj; // 如果是null或者undefined我就不进行拷贝操作
            if (obj instanceof Date) return new Date(obj);
            if (obj instanceof RegExp) return new RegExp(obj);
            // 可能是对象或者普通的值  如果是函数的话是不需要深拷贝
            if (typeof obj !== "object") return obj;
            // 检查是否已经克隆过该对象，防止循环引用
            if (hash.has(obj)) return hash.get(obj);
            let cloneObj = new obj.constructor();
            // 找到的是所属类原型上的constructor,而原型上的 constructor指向的是当前类本身
            hash.set(obj, cloneObj);
            // for in 只能遍历对象上可枚举的string类型属性，采用Reflect.ownKeys比较好
            const keys = Reflect.ownKeys(obj);
            for (let key of keys) {
                cloneObj[key] = deepClone(obj[key], hash);
            }
            
            // 处理symbols
            const symbols = Object.getOwnPropertySymbols(obj);
            for (let key_symbols of symbols) {
                obj[key_symbols] = deepClone(obj[key_symbols])
            }
            return cloneObj;
        }
        ```
**处理循环引用**
1. 一个对象间的循环引用
    
2. 两个对象间的循环引用

注意：

json转换不了的类型
函数：JSON不支持JavaScript中的函数。如果尝试将包含函数的对象转换为JSON字符串，函数将被忽略或转换为null。
undefined：在JSON中，undefined值不被接受。如果尝试序列化一个包含undefined值的对象，undefined值将被忽略或转换为null。
日期对象：JSON不支持原生的JavaScript日期对象。在将对象序列化为JSON字符串时，日期对象会被转换为字符串（通常是ISO 8601格式的日期字符串）。在反序列化时，这个字符串可以被转换回日期对象。
NaN 和 Infinity：在JSON中，NaN（非数字）和Infinity（无穷大）值不被接受。如果尝试序列化一个包含这些值的对象，它们将被转换为null。
正则表达式：JSON不支持JavaScript的正则表达式对象。如果尝试将包含正则表达式的对象转换为JSON字符串，正则表达式将被忽略或转换为null。
特殊字符：在JSON字符串中，某些特殊字符（如换行符、制表符等）必须被转义（使用反斜杠\）。如果不进行转义，这些字符可能会导致解析错误。
循环引用：如果JavaScript对象中存在循环引用（即一个对象直接或间接引用自己），那么尝试将其序列化为JSON字符串将导致错误。

## 说说你对闭包的理解？闭包使用场景

**闭包可以在一个内层函数中访问到其外层函数的作用域**

闭包是指那些引用了另一个函数作用域中变量的函数，通常是在嵌套函数中实现的
闭包让你在一个内层函数中访问其外层函数的变量
原理：作用域链，当前作用域可访问上层作用域
解决的问题：属性私有化，能够让函数作用域的变量在函数执行之后不会销毁，同时也能在函数外部可以访问函数内部的局部变量
带来的问题：内存泄漏

### 使用场景
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

### 函数柯里化
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


## 说说你对作用域链的理解

作用域链，在Javascript中使用一个变量的时候，首先Javascript引擎会尝试在当前作用域下去寻找该变量，如果没找到，再到它的上层作用域寻找，以此类推直到找到该变量或是已经到了全局作用域

作用域我们可以分为块级作用域、函数作用域、全局作用域

存在包含关系

let 块级作用域，const 块级作用域，用于常量  => 也就是大括号之内的范围

var 函数作用域

## JavaScript原型，原型链 ? 有什么特点？

每个函数都有一个属性叫做prototype,指向实例的原型对象,每个实例对象都会有个__proto__指向原型对象
原型对象都有一个constructor对象,指向构造函数。
当我们当问一个对象的属性时，JS会在这个对象的属性中进行查找，如果没有找到，就会沿着__proto__这个隐式
原型关联起来的链条向上一个对象查找

## Javascript如何实现继承？

- 原型链继承
   数据污染
- 寄生组合式继承（最好的）

## 谈谈this对象的理解

函数的调用方式决定了this的值

this 关键字是函数运行时自动生成的一个内部对象，只能在函数内部使用，总指向调用它的对象

- 默认绑定
    全局环境中定义的函数，非严格模式下，this会指向全局
- 隐式绑定
    作为某个对象的方法中使用，会指向这个上级对象
    这一点注意区分箭头函数，this的指向会往上越一级
- new
    指向实例
- 显示绑定
    是指显示确定this的指向
    apply call bind
    
## JavaScript中执行上下文和执行栈是什么？

执行上下文

- 全局上下文
- 函数执行上下文
- eval函数执行上下文


## 说说JavaScript中的事件模型

DOM 是一个树形结构，交互操作常见的鼠标事件，点击事件等

事件流都会经历3个阶段

DOM事件模型中的事件对象常用属性
    - type用于获取事件类型
    - target获取事件目标
    - stopPropagation()阻止事件冒泡
    - preventDefault()阻止事件默认行为
- 捕获阶段
- 目标阶段
- 冒泡阶段

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


## 解释下什么是事件代理？应用场景？

就是把一个元素的响应事件委托到另一个元素

事件委托就是在冒泡阶段完成的

事件流
捕获阶段 -> 目标阶段 -> 冒泡阶段
true                    false  => 对于监听（addEventListener）的第三个参数

事件委托

点击子元素会触发事件冒泡，父组件也能相应这一事件，但是需要从事件哪里获取到是哪个子元素触发的，从而减少事件绑定，较少代码繁琐，优化性能

但是注意的是：

focus、blur这些事件没有事件冒泡机制，所以无法进行委托绑定事件

## 说说new操作符具体干了什么？

在JavaScript中，new操作符用于创建一个给定构造函数的实例对象

- 开辟一个空间
- 创建一个新的对象
- 将对象与构建函数通过原型链连接起来
- 将构建函数中的this绑定到新建的对象obj上
- 根据构建函数返回类型作判断，如果是原始值则被忽略，如果是返回对象，需要正常处理

**如何实现一个new关键字**

```javascript
function new(Func, ...args) {
    let obj = {} // 新建一个对象
    obj.__proto__ = Func.prototype // 原型链链接
    let result = Func.apply(obj, ...args)
    return result instanceof Object? result : obj
}
```

## ajax原理是什么？如何实现？

ajax是通过XmlHttpRequest实现的，可以向服务器发异步请求

实现过程

1. 创建一个XmlHttpRequest对象
2. 通过 XMLHttpRequest 对象的 open() 方法与服务端建立连接
3. 构建请求所需的数据内容，并通过XMLHttpRequest 对象的 send() 方法发送给服务器端
4. 通过 XMLHttpRequest 对象提供的 onreadystatechange 事件监听服务器端你的通信状态
    只要 readyState属性值一变化，就会触发一次 readystatechange 事件
    XMLHttpRequest.responseText属性用于接收服务器端的响应结果
5. 接受并处理服务端向客户端响应的数据结果

**如何实现一个ajax**
```javascript
// 如何实现一个ajax
class Axios {
    request(config) {
        return new Promise((resolve, reject) => {
            const {url = '', method = '', data = {}} = config
            // 发送xhr请求
            const xhr = new XMLHttpRequest()
            xhr.open(method, url, true)
            xhr.onload = function () {
                resolve(xhr.responseText)
            }
            xhr.send(data)
        })
    }
}

function CreateAxiosFn() {
    let axios = new Axios();
    let req = axios.request.bind(axios);
    return req;
}

// 得到最后的全局变量axios
let axios = CreateAxiosFn();

```
**完成版封装ajax**


## bind、call、apply 区别？如何实现一个bind?

改变函数执行时的上下文

- call 
    this指向，参数列表
    ```javascript
        function fn(...args) {
            console.log(this, args);
        }
        let obj = {
            myname: "张三"
        }

        fn.call(obj, 1, 2)
        fn(1, 2)
    ```
- apply
    this指向，一组数据（数组传入）
    ```javascript
        function fn(...args) {
            console.log(this, args);
        }
        const obj = {
            name: "李华"
        }

        fn.apply(obj, [1, 2, 3])
        fn([1, 2, 3])
    ```
- bind
    this指向，参数列表
    ```javascript
        function fn(...args) {
            console.log(this, args);
        }
        const obj = {
            name: "张三"
        }
        const temp_fn = fn.bind(obj, 1, 2, 3)
        temp_fn(4, 5, 6) // 支持多次传入
        fn(1, 2, 3)
    ```
**如何实现一个bind**

```javascript
/**
 * 实现一个bind
 * @param {*} context 
 */
Function.prototype.myBind = function (context) {
    // 判断调用对象是否为函数
    if (typeof this !== "function") {
        throw new TypeError("Error");
    }
    const args = [...arguments].slice(1),
        fn = this;
    return function Fn() {
        // 根据调用方式，传入不同绑定值
        // 就是防止生成的函数，被当作构造函数用
        return fn.apply(this instanceof Fn ? new fn(...arguments) : context, args.concat(...arguments));
    }
}

function fn(...args) {
    console.log(this, args);
}
const obj = {
    name: "张三"
}
const temp_fn = fn.myBind(obj, 1, 2, 3)
temp_fn(4, 5, 6)
fn(1, 2, 3)
// const temp = new temp_fn()
```

## 说说你对事件循环的理解

Javascript是一个单线程的语言

所有的任务都可以分为
- 异步任务
    - 宏任务
    - 微任务
- 同步任务


- 异步事件
  - 异步
  - 微任务
- 同步任务

## DOM常见的操作有哪些？

## 说说你对BOM的理解，常见的BOM对象你了解哪些？

## 说说 JavaScript 中内存泄漏的几种情况？


## 说说你对正则表达式的理解？应用场景？


## for in 和 for of 的区别

for...in 和 for...of 都是 JavaScript 中用于遍历数据结构的循环语句，但它们的作用和用法有所不同。

- for...in 循环语句用于遍历对象的属性，语法如下：
```javascript
for (const key in object) {
  // 遍历对象的属性
}
```
其中，key 是对象的属性名，object 是要遍历的对象。for...in 循环会依次遍历对象的可枚举属性，包括原型链上的属性，但不包括 Symbol 类型的属性。在遍历时，如果对象的属性是一个函数，也会被遍历出来。

for...of 循环语句用于遍历可迭代对象的元素，语法如下：

```javascript
for (const value of iterable) {
  // 遍历可迭代对象的元素
}
```
其中，value 是可迭代对象的元素值，iterable 是要遍历的可迭代对象。for...of 循环会依次遍历可迭代对象的元素，包括数组、字符串、Set、Map 等内置的可迭代对象，也包括自定义的迭代器对象。在遍历时，不会遍历对象的属性，也不会遍历原型链上的属性。
总的来说，for...in 和 for...of 的区别在于它们遍历的对象不同，for...in 遍历对象的属性，for...of 遍历可迭代对象的元素。此外，for...in 循环不能遍历 Symbol 类型的属性，也不适用于遍历数组等有序集合，而 for...of 循环则可以遍历数组、字符串等有序集合，也可以使用自定义的迭代器对象。


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

## 垃圾回收机制
- GC
    
- 垃圾回收策略
    JavaScript有一个概念叫做可达性，就是那种以某种方式可访问可用的值。反之需要释放。
    - 标记清除法
        1. 垃圾收集器在运行时会给内存中的所有变量都加上一个标记，假设内存中所有对象都是垃圾，全标记为0
            然后从各个根对象开始遍历，把不是垃圾的节点改成1
        2. 清理所有标记为0的垃圾，销毁并回收它们所占用的内存空间
        3. 最后，把所有内存中对象标记修改为0，等待下一轮垃圾回收
    - 引用计数法
        1. 当声明了一个变量并且将一个引用类型赋值给该变量的时候这个值的引用次数就为 1
        2. 如果同一个值又被赋给另一个变量，那么引用数加 1
        3. 如果该变量的值被其他的值覆盖了，则引用次数减 1
        4. 当这个值的引用次数变为 0 的时候，说明没有变量在使用，这个值没法被访问了，回收空间，垃圾回收器会在运行的时候清理掉引用次数为 0 的值占用的内存

[推荐视频](https://www.bilibili.com/video/BV1fs4y1Y7DT/?spm_id_from=333.337.search-card.all.click&vd_source=f74fc394a7455cc604f3b6a7c1458e76)
## 说说JavaScript中的数据类型？存储上的差别？
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

## 堆栈的区别

## null和undefine的区别 
null 和 undefined 都表示空值
null 表示一个被明确赋值为 null 的变量或对象属性。null 常用于表示一个不存在的对象，或者将一个对象的值空
undefined 表示一个声明了但未被赋值的变量，或者访问一个不存在的属性或数组元素时返回的值
二者都存在于栈内存

## let const var
var 表示定义变量 为函数作用域，存在变量提升
let 表示定义变量，为块级作用域
const 表示为常量，表示不允许更改，其实只要不改变值的地址就可以了，可以改变对象的属性。块级作用域变量。

## 防抖与节流



## [对象🔍](./Object/index.md)

## [字符串🔍](./String/index.md)

## [原型🔍](./原型/index.md)

## 如何获取元素的位置信息

通过一些获取元素的方法 

自身的属性

- clinetWidth、clientHeight content+padding
- offsetWidth、offsetHeight content+ padding + border
- offsetTop、offsetLeft    距离窗口的距离
- scrollTop 返回元素上边缘与视图之间的距离

快速获取位置的方法
getBoundingClientRect()

```javascript
获取元素的相对位置：
var X = this.getBoundingClientRect().left;
var Y = this.getBoundingClientRect().top;
//再加上滚动出去的距离，就可以得到元素的绝对位置
var X = this.getBoundingClientRect().left + document.documentElement.scrollLeft;
var Y = this.getBoundingClientRect().top + document.docuemtElement.scrollTop;
```


## 文件上传



### 大文件如何上传

- 分块上传
    1. 按照一定的规则对数据进行分块
    2. 按照一定的策略上传，每个分片带有本次上传的唯一标识
    3. 服务端对文件的完整性进行校验，如果完整就会进行合并
- 断点续传
    1. 把上传文件人为的分为几个部分


## 迭代器生成器
::: tip
- 迭代器
    迭代器 其实本质上就是个对象, 只是它实现了特定的协议(约定), 让它能够被叫做 迭代器, 迭代器 其实就一种 设计模式, 它在 JS 中的表现形式就是一个对象定义了一个 next() 方法, 方法返回一个具有 value 和 done 属性的对象
- 生成器
    生成器 是一种特殊的 JS 函数, 它使用 function* 关键字来进行定义, 该函数会返回一个 Generator 对象, 该对象是符合 迭代器协议 的, 所以它本质上就是个 迭代器
:::

### 迭代器

**可迭代协议:**

在 ES6 中, 允许在对象中通过 Symbol.iterator 属性来定义或定制对象的 迭代行为, Symbol.iterator 是一个方法, 该方法返回一个 迭代器, 也只有实现了该协议(规定)的对象才能够被 for...of 给循环遍历

```javascript
const obj = {
  [Symbol.iterator](){
    let i = 0;
    return {
      next(){
        if (i < 3) {
          return { value: i++, done: false }
        }
        return { value: undefined, done: true }
      }
    }
  }
}
```

**循环可迭代对象**

```javascript
// 下面是演示代码: 方法 forOf 模拟了循环 可迭代对象 的流程, 并且打印出了每次迭代的值
// 可迭代对象
const obj = {
  [Symbol.iterator](){
    let i = 0;
    return {
      next(){
        if (i < 3) {
          return { value: i++, done: false }
        }
        return { value: undefined, done: true }
      }
    }
  }
}

// 自定义方法: 循环打印迭代对象的值
const forOf = (obj) => {
  const iterator = obj[Symbol.iterator]()
  let done = false

  while (!done) {
    const current = iterator.next()
    done = current.done
    if (!done){
      console.log('forOf', current.value) 
    }
  }
}

forOf(obj) // 打印: forOf 0、forOf 1、forOf 2
```

1.  先调用Symbol.iterator函数， 生成一个迭代器
2.  循环调用next()

::: tip
其实 for...of 只能用于循环 可迭代对象, 当然除了 for...of 下面这些语法、方法也都必须要求操作对象是一个 可迭代对象

可以使用 for...of 循环数组, 但是不能循环 普通对象, 循环 普通对象 将会提示对象是不可迭代的, 如下代码: for...of 能够正常循环数组、但是不能循环普通对象 obj
:::


### 生成器

**生成器返回一个可迭代迭代器**

```javascript
function* generator(length) {
  let index = 0
  while(index < length) {
    yield index
    index ++ 
  }
}

// 直接循环生成器产物
for (let value of generator(3)) {
  console.log(value); // 0 1 2
}
```