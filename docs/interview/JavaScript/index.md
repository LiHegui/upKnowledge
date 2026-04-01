# JavaScript & ES6 面试题

> 涵盖 JS 核心原理、ES6+ 特性、手写实现、异步编程等高频考点，是前端面试的必考方向。

---

## 基础类型篇

## Q: JavaScript 中的数据类型有哪些？存储上有什么差别？

**A:**

JavaScript 数据类型分为**基本类型**和**引用类型**。

**基本类型（7 种）**

`number`、`string`、`boolean`、`null`、`undefined`、`symbol`、`bigint`

- 存储在**栈（Stack）**中，直接按值访问
- 赋值时复制的是值本身，互不影响

**引用类型**

统称 `Object`，细分为 `Object`、`Array`、`Function`、`Date`、`RegExp` 等

- 对象数据存储在**堆（Heap）**中
- 栈中存放的是指向堆内存的**引用地址**
- 赋值时复制的是引用地址，多个变量可能指向同一个对象

```js
// 基本类型：互不影响
let a = 1
let b = a
b = 2
console.log(a) // 1

// 引用类型：共享同一对象
let obj1 = { name: 'Alice' }
let obj2 = obj1
obj2.name = 'Bob'
console.log(obj1.name) // 'Bob'
```

---

## Q: null 和 undefined 的区别？

**A:**

| 对比维度 | `null` | `undefined` |
|---------|--------|-------------|
| 含义 | 明确赋值为"空" | 声明了但未赋值 |
| 类型 | `typeof null === 'object'`（历史遗留 Bug） | `typeof undefined === 'undefined'` |
| 常见场景 | 手动清空对象引用 | 变量未初始化、函数无返回值 |
| 相等比较 | `null == undefined` → `true` | `null === undefined` → `false` |

---

## Q: let、const、var 的区别？

**A:**

| 特性 | `var` | `let` | `const` |
|------|-------|-------|---------|
| 作用域 | 函数作用域 | 块级作用域 | 块级作用域 |
| 变量提升 | ✅ 有（值为 undefined） | ❌ 暂时性死区（TDZ） | ❌ 暂时性死区 |
| 重复声明 | ✅ 允许 | ❌ 报错 | ❌ 报错 |
| 重新赋值 | ✅ 允许 | ✅ 允许 | ❌ 不允许（基本类型）；对象属性可变 |
| 挂载到 window | ✅ | ❌ | ❌ |

```js
// const 对象属性可以修改，但不能重新赋值
const obj = { name: 'Alice' }
obj.name = 'Bob'   // ✅ 合法
obj = {}           // ❌ TypeError
```

---

## Q: typeof 与 instanceof 的区别？

**A:**

- **`typeof`**：返回变量的基本类型字符串，适用于基本类型判断（`null` 除外返回 `'object'`，是历史 Bug）
- **`instanceof`**：判断对象是否是某个构造函数的实例，基于原型链查找，不适合基本类型
- **`Object.prototype.toString.call()`**：最准确的类型判断方法

```js
typeof 42          // 'number'
typeof 'abc'       // 'string'
typeof null        // 'object' ⚠️ 历史遗留Bug
typeof undefined   // 'undefined'
typeof []          // 'object'
typeof function(){} // 'function'

[] instanceof Array  // true
[] instanceof Object // true（原型链向上查找）

// 推荐：通用类型判断
function getType(obj) {
  const type = typeof obj
  if (type !== 'object') return type
  return Object.prototype.toString.call(obj).replace(/^\[object (\S+)\]$/, '$1')
}
getType([])       // 'Array'
getType(null)     // 'Null'
getType(/abc/)    // 'RegExp'
```

---

## Q: == 和 === 的区别？

**A:**

- `==`（宽松相等）：比较前会做**类型转换**，再比较值
- `===`（严格相等）：值和类型都必须相同，不做类型转换

**`==` 的转换规则（常考）：**

- 两个都是基本类型：字符串、布尔值转为数值比较
- 基本类型与对象比较：对象调用 `valueOf()`/`toString()` 转原始值
- `null == undefined` → `true`，但 `null == 0` → `false`
- 只要有 `NaN`，结果都是 `false`

> ⚠️ **建议**：业务代码统一使用 `===`，只在明确需要 null/undefined 兼容判断时使用 `==`。

---

## 作用域与闭包篇

## Q: 说说 JavaScript 的作用域链？

**A:**

JavaScript 中访问一个变量时，引擎会先在**当前作用域**查找，找不到则沿**作用域链**向上逐层查找，直到全局作用域。

作用域分类：
- **全局作用域**：整个脚本可访问
- **函数作用域**：`var` 声明在其所在函数内可见
- **块级作用域**：`let`/`const` 声明在 `{}` 内可见

---

## Q: 说说你对闭包的理解？闭包有哪些使用场景？

**A:**

**闭包**是指内层函数可以访问其外层函数作用域中的变量，即使外层函数已执行完毕，内层函数仍保留对外层作用域的引用。

**原理**：基于作用域链，变量在外层函数执行结束后不会被销毁，因为内层函数持有引用。

```js
function outer() {
  let count = 0  // 不会被销毁
  return function inner() {
    count++
    return count
  }
}
const counter = outer()
counter() // 1
counter() // 2
```

**解决的问题**：私有化变量、延长变量生命周期
**带来的问题**：如果闭包长期持有大对象引用，可能导致**内存泄漏**

### 使用场景

**1. 私有变量**

```js
const Counter = (function () {
  let privateCount = 0
  function changeBy(val) { privateCount += val }
  return {
    increment() { changeBy(1) },
    decrement() { changeBy(-1) },
    value()     { return privateCount }
  }
})()
Counter.increment()
console.log(Counter.value()) // 1
```

**2. 函数柯里化**

```js
// 柯里化：避免重复传入相同参数
function getArea(width) {
  return height => width * height
}
const getTenWidth = getArea(10)
getTenWidth(20) // 200
getTenWidth(30) // 300
```

**3. 防抖 / 节流**（通过闭包保存 timer 状态，见防抖节流章节）

### 经典闭包输出题

```js
// 题一：var 在 for 循环中
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0)
}
// 输出：3 3 3（var 无块级作用域，共享同一个 i）

// 修复方案一：改用 let
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0)
}
// 输出：0 1 2

// 修复方案二：IIFE 闭包
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(() => console.log(j), 0)
  })(i)
}
// 输出：0 1 2
```

```js
// 题二：闭包与变量共享
var n = 10
function fn() {
  var n = 20
  function f() { n++; console.log(n) }
  f()        // 21
  return f
}
var x = fn()
x()          // 22
x()          // 23
console.log(n) // 10（全局 n 未被修改）
```

---

## Q: 说说 JavaScript 原型与原型链？

**A:**

- 每个**函数**都有 `prototype` 属性，指向原型对象
- 每个**实例对象**都有 `__proto__` 属性，指向其构造函数的 `prototype`
- 原型对象上有 `constructor` 属性，指回构造函数
- 访问属性时，沿 `__proto__` 链向上查找，直到 `Object.prototype`，再往上为 `null`

```js
function Person(name) { this.name = name }
Person.prototype.greet = function() { return `Hi, ${this.name}` }

const p = new Person('Alice')
p.greet()          // 'Hi, Alice'（来自原型）
p.__proto__ === Person.prototype  // true
Person.prototype.__proto__ === Object.prototype  // true
```

---

## Q: JavaScript 如何实现继承？

**A:**

最优方案是**寄生组合式继承**：

```js
function clone(Parent, Child) {
  // Object.create 避免额外调用父构造函数
  Child.prototype = Object.create(Parent.prototype)
  Child.prototype.constructor = Child
}

function Parent(name) {
  this.name = name
  this.play = [1, 2, 3]
}
Parent.prototype.getName = function() { return this.name }

function Child(name) {
  Parent.call(this, name)  // 继承实例属性
  this.type = 'child'
}

clone(Parent, Child)

Child.prototype.getType = function() { return this.type }

const c = new Child('Alice')
console.log(c.getName()) // 'Alice'
console.log(c.getType()) // 'child'
```

| 继承方式 | 优点 | 缺点 |
|---------|------|------|
| 原型链继承 | 简单 | 引用类型属性共享、无法传参 |
| 构造函数继承 | 可传参、属性独立 | 无法继承原型方法 |
| 组合继承 | 解决上两者问题 | 父构造函数调用两次 |
| **寄生组合** ✅ | 最完善 | 略复杂 |
| ES6 class extends | 语法简洁 | 本质是寄生组合的语法糖 |

---

## Q: 谈谈 this 的理解？

**A:**

`this` 的值由**函数的调用方式**决定，而非定义时的位置（箭头函数除外）。

| 调用方式 | this 指向 |
|---------|----------|
| 普通函数调用 | 全局对象（非严格模式）/ `undefined`（严格模式） |
| 对象方法调用 | 该对象 |
| `new` 构造函数 | 新创建的实例 |
| `call/apply/bind` | 显式传入的对象 |
| 箭头函数 | 词法作用域中的 `this`（定义时决定，不可改变） |

```js
const obj = {
  name: 'Alice',
  greet() { console.log(this.name) },           // 'Alice'
  greetArrow: () => { console.log(this.name) }  // undefined（箭头函数）
}
obj.greet()
obj.greetArrow()
```

---

## 手写实现篇

## Q: 如何实现 new 关键字？

**A:**

`new` 的执行步骤：
1. 创建一个空对象，原型链接到构造函数的 `prototype`
2. 将构造函数的 `this` 绑定到新对象，执行构造函数
3. 如果构造函数返回对象类型，返回该对象；否则返回新创建的对象

```js
function myNew(Func, ...args) {
  // 1. 创建对象并链接原型
  const obj = Object.create(Func.prototype)
  // 2. 执行构造函数
  const result = Func.apply(obj, args)
  // 3. 判断返回值
  return result instanceof Object ? result : obj
}

function Person(name) { this.name = name }
const p = myNew(Person, 'Alice')
console.log(p.name) // 'Alice'
```

---

## Q: 如何实现 bind / call / apply？

**A:**

**三者区别：**

| 方法 | 参数形式 | 执行时机 |
|------|---------|---------|
| `call(ctx, arg1, arg2)` | 逐个传参 | 立即执行 |
| `apply(ctx, [arg1, arg2])` | 数组传参 | 立即执行 |
| `bind(ctx, arg1, arg2)` | 逐个传参 | 返回新函数，延迟执行 |

**手写 bind：**

```js
Function.prototype.myBind = function(context, ...args) {
  if (typeof this !== 'function') throw new TypeError('Error')
  const fn = this
  return function Fn(...innerArgs) {
    // 防止被当作构造函数调用时 this 被覆盖
    return fn.apply(
      this instanceof Fn ? this : context,
      [...args, ...innerArgs]
    )
  }
}

function greet(greeting, punct) {
  return `${greeting}, ${this.name}${punct}`
}
const boundGreet = greet.myBind({ name: 'Alice' }, 'Hello')
console.log(boundGreet('!')) // 'Hello, Alice!'
```

---

## Q: 如何实现深拷贝？

**A:**

**方案对比：**

| 方案 | 优点 | 缺点 |
|------|------|------|
| `JSON.parse(JSON.stringify())` | 简单 | 不支持 Function/undefined/Symbol/Date/RegExp/循环引用 |
| 递归 + WeakMap | 完整支持 | 代码较多 |
| `structuredClone()`（原生）✅ | 原生支持 | 不支持 Function |

**手写深拷贝（递归 + WeakMap 处理循环引用）：**

```js
function deepClone(obj, hash = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj)
  if (obj instanceof RegExp) return new RegExp(obj)
  // 处理循环引用
  if (hash.has(obj)) return hash.get(obj)

  const clone = new obj.constructor()
  hash.set(obj, clone)

  // Reflect.ownKeys 包含 Symbol 类型的 key
  for (const key of Reflect.ownKeys(obj)) {
    clone[key] = deepClone(obj[key], hash)
  }
  return clone
}
```

> ⚠️ `JSON.stringify` 无法处理的类型：`Function`、`undefined`、`Symbol`、`Date`（转为字符串）、`RegExp`（转为 `{}`）、循环引用（直接报错）

---

## Q: 如何实现防抖和节流？

**A:**

**防抖（debounce）**：N 毫秒内多次触发只执行最后一次（适合搜索输入、resize）

**节流（throttle）**：N 毫秒内只执行一次（适合滚动、mousemove）

```js
// 防抖
function debounce(fn, delay) {
  let timer = null
  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

// 节流（时间戳版）
function throttle(fn, delay) {
  let lastTime = 0
  return function(...args) {
    const now = Date.now()
    if (now - lastTime > delay) {
      fn.apply(this, args)
      lastTime = now
    }
  }
}

// 使用
const input = document.querySelector('input')
input.addEventListener('input', debounce(e => {
  console.log('搜索：', e.target.value)
}, 300))
```

---

## Q: 如何实现 Ajax？

**A:**

Ajax 基于 `XMLHttpRequest`，允许异步向服务器发起请求：

```js
function ajax(options) {
  const xhr = new XMLHttpRequest()
  const { url, method = 'GET', data = null, success, fail } = options

  xhr.open(method.toUpperCase(), url, true)

  if (method.toUpperCase() === 'POST') {
    xhr.setRequestHeader('Content-Type', 'application/json')
  }

  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status >= 200 && xhr.status < 300) {
        success?.(JSON.parse(xhr.responseText))
      } else {
        fail?.(xhr.status)
      }
    }
  }

  xhr.send(data ? JSON.stringify(data) : null)
}
```

---

## 异步编程篇

## Q: Promise 是什么？有哪些方法？

**A:**

**Promise** 是处理异步操作的标准方案，解决了回调地狱（Callback Hell）问题，提供链式调用的方式处理异步依赖。

**三种状态**：`pending` → `fulfilled` / `rejected`，状态一旦改变不可逆。

| 方法 | 说明 |
|------|------|
| `Promise.resolve(val)` | 返回一个已成功的 Promise |
| `Promise.reject(err)` | 返回一个已失败的 Promise |
| `.then(onFulfilled, onRejected)` | 注册成功/失败回调，返回新 Promise |
| `.catch(onRejected)` | 捕获错误，等价于 `.then(null, onRejected)` |
| `.finally(fn)` | 无论成功失败都执行 |
| `Promise.all(promises)` | 全部成功才 resolve，一个失败即 reject |
| `Promise.allSettled(promises)` | 等待全部结束，返回每个结果（无论成功/失败） |
| `Promise.race(promises)` | 第一个完成（成功或失败）就 resolve/reject |
| `Promise.any(promises)` | 第一个成功就 resolve，全失败才 reject |

**手写 Promise（核心版）：**

```js
const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'

class MyPromise {
  constructor(executor) {
    this.status = PENDING
    this.value = undefined
    this.reason = undefined
    this.onResolvedCallbacks = []
    this.onRejectedCallbacks = []

    const resolve = (value) => {
      if (this.status === PENDING) {
        this.status = FULFILLED
        this.value = value
        this.onResolvedCallbacks.forEach(fn => fn())
      }
    }
    const reject = (reason) => {
      if (this.status === PENDING) {
        this.status = REJECTED
        this.reason = reason
        this.onRejectedCallbacks.forEach(fn => fn())
      }
    }
    try { executor(resolve, reject) } catch (e) { reject(e) }
  }

  then(onFulfilled, onRejected) {
    if (this.status === FULFILLED) onFulfilled(this.value)
    if (this.status === REJECTED)  onRejected(this.reason)
    if (this.status === PENDING) {
      this.onResolvedCallbacks.push(() => onFulfilled(this.value))
      this.onRejectedCallbacks.push(() => onRejected(this.reason))
    }
  }
}
```

**手写 Promise.all：**

```js
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    const results = []
    let count = 0
    promises.forEach((p, i) => {
      Promise.resolve(p).then(val => {
        results[i] = val
        if (++count === promises.length) resolve(results)
      }).catch(reject)
    })
  })
}
```

---

## Q: 什么是 async/await？实现原理是什么？

**A:**

`async/await` 是基于 **Promise** 的语法糖，让异步代码看起来像同步代码，底层由 **Generator + Promise** 模拟实现。

```js
// async 函数始终返回 Promise
async function fetchUser(id) {
  try {
    const res = await fetch(`/api/user/${id}`)  // 等待 Promise resolve
    const user = await res.json()
    return user
  } catch (err) {
    console.error('请求失败', err)
  }
}
```

**并发请求（保持顺序）：**

```js
// 方式一：串行（按顺序，但慢）
async function sequential(urls) {
  const results = []
  for (const url of urls) {
    const res = await fetch(url)
    results.push(await res.json())
  }
  return results
}

// 方式二：并行 + 保持顺序（推荐）
async function concurrent(urls) {
  const promises = urls.map(url => fetch(url).then(r => r.json()))
  return Promise.all(promises)  // 并发，结果顺序与 urls 一致
}
```

**实现原理（Generator + Promise）：**

```js
function p(num) { return Promise.resolve(num * 2) }

function* generator() {
  const v1 = yield p(1)   // v1 = 2
  const v2 = yield p(v1)  // v2 = 4
  return v2
}

// 模拟 async/await 执行器
function runGenerator(genFn) {
  return new Promise((resolve, reject) => {
    const gen = genFn()
    function step(val) {
      let res
      try { res = gen.next(val) } catch (e) { return reject(e) }
      const { value, done } = res
      if (done) return resolve(value)
      value.then(step).catch(reject)
    }
    step()
  })
}

runGenerator(generator).then(console.log) // 4
```

---

## Q: 说说 Generator 函数？

**A:**

Generator 函数执行后返回一个**迭代器对象**，可通过 `yield` 暂停执行，通过 `.next()` 恢复。

```js
function* gen() {
  console.log('start')
  const x = yield 1       // 暂停，返回 { value: 1, done: false }
  console.log('x =', x)  // x 的值来自外部 .next(x) 传入的参数
  yield 2
  return 3                // { value: 3, done: true }
}

const g = gen()
g.next()      // 打印 'start'，返回 { value: 1, done: false }
g.next(10)    // 打印 'x = 10'，返回 { value: 2, done: false }
g.next()      // 返回 { value: 3, done: true }
```

Generator 是 `async/await` 的底层机制，结合 Promise 可模拟完整的异步流程控制。

---

## Q: 说说事件循环（Event Loop）？

**A:**

JavaScript 是**单线程**的，所有任务分为：

- **同步任务**：在调用栈中依次执行
- **异步任务**：
  - **微任务（Microtask）**：`Promise.then`、`queueMicrotask`、`MutationObserver`
  - **宏任务（Macrotask）**：`setTimeout`、`setInterval`、`I/O`、`UI 渲染`

**执行顺序**：

```
执行同步代码（调用栈）
  ↓
清空所有微任务队列（包括微任务产生的新微任务）
  ↓
执行一个宏任务
  ↓
再次清空微任务 → 执行下一个宏任务 → 循环...
```

```js
console.log('1')               // 同步

setTimeout(() => {
  console.log('2')             // 宏任务
}, 0)

Promise.resolve().then(() => {
  console.log('3')             // 微任务
})

console.log('4')               // 同步

// 输出顺序：1 → 4 → 3 → 2
```

---

## ES6 核心特性篇

## Q: Set 和 Map 是什么？与 WeakSet/WeakMap 的区别？

**A:**

**Set**：无序不重复的值集合（类似数学中的集合）

```js
const s = new Set([1, 2, 2, 3])
console.log([...s]) // [1, 2, 3]（自动去重）

s.add(4)       // 添加
s.delete(1)    // 删除
s.has(2)       // true
s.size         // 3
s.clear()      // 清空
```

**Map**：键值对集合，键可以是任意类型（比普通对象更灵活）

```js
const m = new Map()
m.set('key', 'value')
m.set({}, 'obj-key')   // 对象也可以做键
m.get('key')           // 'value'
m.has('key')           // true
m.size                 // 2

// 遍历
for (const [k, v] of m) {
  console.log(k, v)
}
```

**Weak 版本的区别：**

| 特性 | Set/Map | WeakSet/WeakMap |
|------|---------|-----------------|
| 键/值类型 | 任意 | 只能是对象（WeakSet 值、WeakMap 键） |
| 垃圾回收 | 持有强引用，阻止 GC | **弱引用**，对象无其他引用时可被 GC |
| 可枚举 | ✅ 有 size/forEach | ❌ 无法遍历、无 size |
| 适用场景 | 通用 | 存储 DOM 节点等临时数据，防内存泄漏 |

---

## Q: 什么是 Proxy？什么是 Reflect？

**A:**

**Proxy** 用于创建对象的代理，可以拦截并自定义对象的基本操作（读取、赋值、函数调用等）。

```js
const handler = {
  get(target, key) {
    console.log(`读取 ${key}`)
    return key in target ? target[key] : `属性 ${key} 不存在`
  },
  set(target, key, value) {
    if (typeof value !== 'number') throw new TypeError('只能赋值数字')
    target[key] = value
    return true
  }
}

const proxy = new Proxy({}, handler)
proxy.age = 25      // set 拦截
console.log(proxy.age)  // get 拦截 → 25
console.log(proxy.name) // '属性 name 不存在'
```

Vue 3 的响应式系统就是基于 `Proxy` 实现的。

**Reflect** 是一个内置对象，提供与 Proxy handler 一一对应的静态方法，将对象操作规范化。

```js
// 与 Proxy 配合使用，保持默认行为
const handler = {
  set(target, key, value, receiver) {
    console.log(`设置 ${key} = ${value}`)
    return Reflect.set(target, key, value, receiver)  // 确保正确处理 setter
  }
}
```

| 对比 | `Object.xxx` | `Reflect.xxx` |
|------|-------------|---------------|
| 返回值 | 多种形式 | 统一返回布尔值等规范结果 |
| 报错方式 | 部分操作直接抛异常 | 返回 false，不抛出 |
| 与 Proxy 配合 | 不一致 | 完全对应，推荐配合使用 |

---

## Q: ES6 Module 与 CommonJS 有什么区别？

**A:**

| 对比维度 | CommonJS（CJS） | ES6 Module（ESM） |
|---------|----------------|-------------------|
| 使用环境 | Node.js 服务端 | 浏览器 + Node.js |
| 语法 | `require()` / `module.exports` | `import` / `export` |
| 加载时机 | 运行时加载（动态） | 编译时静态分析 |
| 缓存 | 首次加载后缓存，再次 require 返回缓存 | 同模块只加载一次 |
| 导出值 | 值的**拷贝**（修改原模块不影响已导出的值） | 值的**动态绑定**（原模块修改会同步） |
| Tree Shaking | ❌ 不支持 | ✅ 支持（静态分析未使用代码） |

```js
// CommonJS
const { foo } = require('./module')
module.exports = { bar }

// ES6 Module
import { foo } from './module'
export const bar = 42
export default function main() {}
```

---

## 数组与字符串篇

## Q: 数组的常用方法有哪些？

**A:**

**修改原数组：**

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `push(item)` | 末尾添加 | 新长度 |
| `pop()` | 末尾删除 | 被删除的元素 |
| `unshift(item)` | 头部添加 | 新长度 |
| `shift()` | 头部删除 | 被删除的元素 |
| `splice(start, n, ...items)` | 删除/插入 | 被删除的元素数组 |
| `sort(compareFn)` | 排序 | 原数组 |
| `reverse()` | 反转 | 原数组 |

**不修改原数组：**

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `slice(start, end)` | 截取 | 新数组 |
| `concat(...items)` | 合并 | 新数组 |
| `map(fn)` | 映射 | 新数组 |
| `filter(fn)` | 过滤 | 新数组 |
| `reduce(fn, init)` | 累计 | 累计结果 |
| `forEach(fn)` | 遍历 | 无（不可 break） |
| `find(fn)` | 查找第一个满足条件的元素 | 元素或 undefined |
| `findIndex(fn)` | 查找第一个满足条件的下标 | 下标或 -1 |
| `some(fn)` | 有一个满足→ true | 布尔值 |
| `every(fn)` | 全部满足→ true | 布尔值 |
| `flat(depth)` | 展平嵌套数组 | 新数组 |
| `includes(val)` | 是否包含 | 布尔值 |

```js
// reduce 实现数组求和
[1, 2, 3, 4].reduce((acc, cur) => acc + cur, 0) // 10

// 数组去重
const arr = [1, 2, 2, 3]
[...new Set(arr)] // [1, 2, 3]
```

---

## Q: 字符串的常用方法有哪些？

**A:**

| 方法 | 说明 |
|------|------|
| `charAt(i)` | 获取指定位置字符 |
| `indexOf(str)` / `lastIndexOf` | 查找子串位置，未找到返回 -1 |
| `includes(str)` | 是否包含 |
| `startsWith(str)` / `endsWith` | 以...开头/结尾 |
| `slice(start, end)` | 截取子串 |
| `split(sep)` | 分割为数组 |
| `replace(search, replacement)` | 替换（支持正则） |
| `trim()` / `trimStart()` / `trimEnd()` | 去空白 |
| `padStart(len, fill)` / `padEnd` | 填充对齐 |
| `repeat(n)` | 重复 |
| `toUpperCase()` / `toLowerCase()` | 大小写转换 |
| `match(reg)` | 匹配正则，返回匹配结果 |
| **模板字符串** `` `${expr}` `` | ES6 插值语法 |

---

## 其他高频考点

## Q: 深拷贝和浅拷贝的区别？

**A:**

- **浅拷贝**：只复制对象的第一层，深层引用类型仍然共享内存
- **深拷贝**：递归复制所有层级，完全独立

**浅拷贝方案：**

```js
// 扩展运算符
const copy = { ...original }
// Object.assign
const copy = Object.assign({}, original)
// 数组：slice、concat
const arrCopy = arr.slice()
```

详细深拷贝实现见上方「如何实现深拷贝」章节。

---

## Q: 事件委托是什么？应用场景？

**A:**

**事件委托**：将子元素的事件监听委托到父元素上，利用事件冒泡机制处理。

```js
// ❌ 每个 li 都绑定事件（性能差）
document.querySelectorAll('li').forEach(li => {
  li.addEventListener('click', handleClick)
})

// ✅ 只绑定一次（事件委托）
document.querySelector('ul').addEventListener('click', e => {
  if (e.target.tagName === 'LI') {
    handleClick(e.target)
  }
})
```

**优点**：减少事件绑定数量，动态新增子元素无需重新绑定
**注意**：`focus`、`blur` 不冒泡，不适合委托（可用 `focusin`/`focusout` 替代）

---

## Q: for...in 和 for...of 的区别？

**A:**

| 对比 | `for...in` | `for...of` |
|------|-----------|-----------|
| 遍历内容 | 对象的**可枚举属性名**（包括原型链） | **可迭代对象**的元素值 |
| 适用对象 | 普通对象 | 数组、字符串、Set、Map、Generator |
| 原型链 | ✅ 会遍历到原型链属性 | ❌ 不涉及 |
| Symbol 属性 | ❌ 不遍历 | 取决于迭代器实现 |
| 建议 | 遍历对象属性时用 | 遍历有序集合时用 |

```js
const obj = { a: 1, b: 2 }
for (const key in obj) console.log(key)    // 'a', 'b'（键）

const arr = [10, 20, 30]
for (const val of arr) console.log(val)    // 10, 20, 30（值）
```

---

## Q: 垃圾回收机制是什么？

**A:**

JavaScript 通过自动垃圾回收（GC）释放不再使用的内存，主要有两种策略：

**标记清除法（主流）：**
1. GC 运行时，从根对象（全局变量、调用栈中的变量）出发，遍历标记所有可达对象
2. 未被标记的对象视为垃圾，清除并回收内存

**引用计数法（已基本淘汰）：**
- 记录每个值被引用的次数，为 0 时回收
- 缺陷：**循环引用**会导致内存无法释放

**内存泄漏的常见原因：**
- 闭包长期持有不需要的大对象
- 全局变量意外挂载
- 未清除的定时器、事件监听
- DOM 节点已删除但 JS 中仍有引用

---

## Q: 说说 JavaScript 中的类型转换机制？

**A:**

**隐式转换（常见于运算符）：**

```js
// + 号：有字符串则转字符串拼接
1 + '2'        // '12'
true + 1       // 2
null + 1       // 1
undefined + 1  // NaN

// 比较运算符：转数值
'2' > 1        // true（'2' → 2）
null > 0       // false
null == 0      // false（特殊规则）
null == undefined // true
```

**显式转换：**

```js
Number('42')     // 42
Number('')       // 0
Number(null)     // 0
Number(undefined) // NaN
Number(true)     // 1

String(42)       // '42'
Boolean(0)       // false
Boolean('')      // false
Boolean(null)    // false
Boolean([])      // true ⚠️ 空数组是 truthy
Boolean({})      // true ⚠️ 空对象是 truthy
```

