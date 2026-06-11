# JavaScript & ES6 技术要点

> 涵盖 JS 核心原理、ES6+ 特性、手写实现、异步编程等高频考点，是前端开发的核心方向。

---

## 基础类型篇

## Q: JS 数据类型与存储

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

## Q: null vs undefined

**A:**

| 对比维度 | `null`                                     | `undefined`                        |
| -------- | -------------------------------------------- | ------------------------------------ |
| 含义     | 明确赋值为"空"                               | 声明了但未赋值                       |
| 类型     | `typeof null === 'object'`（历史遗留 Bug） | `typeof undefined === 'undefined'` |
| 常见场景 | 手动清空对象引用                             | 变量未初始化、函数无返回值           |
| 相等比较 | `null == undefined` → `true`            | `null === undefined` → `false`  |

---

## Q: let、const、var 对比

**A:**

| 特性          | `var`                      | `let`                        | `const`                             |
| ------------- | -------------------------- | ---------------------------- | ----------------------------------- |
| 作用域        | 函数作用域                 | 块级作用域                   | 块级作用域                          |
| 变量提升      | ✅ 提升并初始化为 `undefined` | ✅ 提升但**不初始化**（TDZ） | ✅ 提升但**不初始化**（TDZ）        |
| 重复声明      | ✅ 允许                    | ❌ 报错                      | ❌ 报错                             |
| 重新赋值      | ✅ 允许                    | ✅ 允许                      | ❌ 不允许（基本类型）；对象属性可变 |
| 挂载到 window | ✅                         | ❌                           | ❌                                  |

> ⚠️ **注意**：`let`/`const` **也有变量提升**，常见误解是"只有 var 才提升"。区别在于：`var` 提升后初始化为 `undefined`，而 `let`/`const` 提升后**不初始化**，声明语句执行之前的区域称为**暂时性死区（Temporal Dead Zone，TDZ）**，此区间内访问变量会抛出 `ReferenceError`。

```js
// var —— 提升 + 初始化为 undefined
console.log(a)  // undefined（不报错）
var a = 1

// let —— 提升但未初始化，TDZ 触发报错
console.log(b)  // ❌ ReferenceError: Cannot access 'b' before initialization
let b = 1
```

区分报错信息是关键：
- `ReferenceError: x is not defined` → 变量根本不存在，**没有提升**
- `ReferenceError: Cannot access 'x' before initialization` → 变量存在但未初始化，**提升了但在 TDZ 中**

```js
// const 对象属性可以修改，但不能重新赋值
const obj = { name: 'Alice' }
obj.name = 'Bob'   // ✅ 合法
obj = {}           // ❌ TypeError
```

---

## Q: typeof vs instanceof

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

## Q: == vs === 类型转换

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

## Q: 作用域链原理

**A:**

JavaScript 中访问一个变量时，引擎会先在**当前作用域**查找，找不到则沿**作用域链**向上逐层查找，直到全局作用域。

作用域分类：

- **全局作用域**：整个脚本可访问
- **函数作用域**：`var` 声明在其所在函数内可见
- **块级作用域**：`let`/`const` 声明在 `{}` 内可见

---

## Q: 闭包原理与应用

**A:**

**闭包（Closure）** = **函数 + 其定义时的词法环境（Lexical Environment）的引用**。当一个函数能够「记住」并访问其定义时所在的作用域，即便该函数在原作用域之外执行，依然形成闭包。

> ⚠️ **注意**：闭包不是「内层访问外层」这么简单——本质是**外层函数执行结束后，本该销毁的变量环境因被内层函数引用而保留下来**，这个「该销毁却没销毁」才是核心。

**形成条件**：

1. **函数嵌套**：内层函数引用了外层函数的变量
2. **内层函数被外部持有**：通过 `return`、作为参数传出、绑定到事件 / 全局变量等方式，被外层作用域之外的代码所引用

**底层原理（词法作用域）**：

JS 采用**词法（静态）作用域** —— 作用域在**函数定义时**就已确定，与调用位置无关。每个函数对象内部有一个隐藏属性 `[[Environment]]`，指向其定义时所在的作用域链。只要该函数还存活（被引用），它的 `[[Environment]]` 所指向的环境就不会被 GC 回收，从而形成闭包。

> 💡 **内存视角**：正常情况下，函数执行完毕，其变量环境（执行上下文）会随调用栈出栈而销毁；但当内部函数被外部持有引用时，这个**本应销毁的变量环境会从「栈」转移到「堆」上保留**。这个「该销毁却没销毁」才是闭包的本质，而不仅仅是「作用域链向上查找」——查找是所有函数共有的机制，保留环境才是闭包独有的。

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

**4. 模块化（IIFE 模块模式）**

```js
// ES6 模块出现前，靠 IIFE + 闭包模拟模块作用域，避免污染全局
const myModule = (function () {
  let _state = {}
  return {
    get(k) { return _state[k] },
    set(k, v) { _state[k] = v }
  }
})()
```

**5. React Hooks 的实现基础**

`useState`、`useRef`、`useEffect` 内部依赖闭包来「记住」每次渲染对应的状态槽位与依赖数组——Hook 函数本身是普通函数，但因为闭包持有了 Fiber 节点上的状态链表引用，才能在多次调用之间保持状态。

```js
function useState(initial) {
  // 简化示意：闭包持有当前 fiber 上的 state slot
  const slot = getCurrentHookSlot()
  if (slot.value === undefined) slot.value = initial
  const setState = (v) => { slot.value = v; scheduleRerender() }
  return [slot.value, setState]
}
```

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

> 💡 **`let` 为什么能天然隔离？**（规范级原理）
>
> 不是「拷贝了 i 的值」，而是 ES 规范规定 `for (let i ...)` 每轮迭代都会执行 `CreatePerIterationEnvironment`，**创建一个全新的词法环境（新的绑定 binding）**，并把上一轮 `i` 的值传递进来。因此每个 `setTimeout` 回调闭包捕获的是**各自迭代独立的 `i`**，而非同一个变量的副本。`var` 则只有一个函数级绑定，三个回调共享它。

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

## Q: 原型与原型链

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

## Q: JS 继承实现方式

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

| 继承方式              | 优点             | 缺点                       |
| --------------------- | ---------------- | -------------------------- |
| 原型链继承            | 简单             | 引用类型属性共享、无法传参 |
| 构造函数继承          | 可传参、属性独立 | 无法继承原型方法           |
| 组合继承              | 解决上两者问题   | 父构造函数调用两次         |
| **寄生组合** ✅ | 最完善           | 略复杂                     |
| ES6 class extends     | 语法简洁         | 本质是寄生组合的语法糖     |

---

## Q: this 指向规则

**A:**

`this` 的值由**函数的调用方式**决定，而非定义时的位置（箭头函数除外）。

| 调用方式            | this 指向                                        |
| ------------------- | ------------------------------------------------ |
| 普通函数调用        | 全局对象（非严格模式）/`undefined`（严格模式） |
| 对象方法调用        | 该对象                                           |
| `new` 构造函数    | 新创建的实例                                     |
| `call/apply/bind` | 显式传入的对象                                   |
| 箭头函数            | 词法作用域中的 `this`（定义时决定，不可改变）  |

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

## Q: new 优先级综合题（原型链 + 提升 + this + new 优先级）

**A:**

```js
function Foo() {
  getName = function () { console.log(1); };
  return this;
}
Foo.getName = function () { console.log(2); };
Foo.prototype.getName = function () { console.log(3); };
var getName = function () { console.log(4); };
function getName() { console.log(5); }

Foo.getName();       // 2
getName();           // 4
Foo().getName();     // 1
getName();           // 1
new Foo.getName();   // 2
new Foo().getName(); // 3
```

**逐步分析：**

**① 提升阶段（执行前）**

```js
// 引擎实际处理顺序：
function getName() { console.log(5) }  // 函数声明整体提升（最优先）
var getName                             // var 重复声明，忽略
// 执行时：
getName = function () { console.log(4) } // 覆盖掉 5
```

| 调用                    | 结果        | 原因                                                                                                                             |
| ----------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `Foo.getName()`       | **2** | Foo 的静态方法                                                                                                                   |
| `getName()`           | **4** | `var getName = fn4` 执行后覆盖了函数声明 fn5                                                                                   |
| `Foo().getName()`     | **1** | 非 `new` 调用，`this = window`；构造函数内 `getName = fn1` 污染全局；`return this` 返回 `window`，调用全局 `getName` |
| `getName()`           | **1** | 上一步全局 `getName` 已被污染为 fn1                                                                                            |
| `new Foo.getName()`   | **2** | `.` 优先级 > 无参 `new`；等价于 `new (Foo.getName)()`，构造调用静态方法                                                    |
| `new Foo().getName()` | **3** | 有参 `new` 优先级最高；`new Foo()` 创建实例 `{}`，实例无 `getName`，沿原型链找到 `Foo.prototype.getName`               |

**② `new` 运算符优先级说明**

| 写法                 | 优先级 | 等价于            |
| -------------------- | ------ | ----------------- |
| `new Foo()` 带括号 | 19     | 先 new 再访问成员 |
| `new Foo` 不带括号 | 18     | 先访问成员再 new  |
| 成员访问 `.`       | 19     | —                |

所以：

- `new Foo.getName()` → `new (Foo.getName)()` → 输出 **2**
- `new Foo().getName()` → `(new Foo()).getName()` → 输出 **3**

> ⚠️ **注意**：`Foo()` 执行时构造函数内 `getName = fn1` **没有 `this.`**，是对全局变量的赋值，这是一个隐式全局的副作用，与实例无关。

---

## 手写实现篇

## Q: new 操作符实现

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

## Q: bind/call/apply 实现

**A:**

**三者区别：**

| 方法                         | 参数形式 | 执行时机             |
| ---------------------------- | -------- | -------------------- |
| `call(ctx, arg1, arg2)`    | 逐个传参 | 立即执行             |
| `apply(ctx, [arg1, arg2])` | 数组传参 | 立即执行             |
| `bind(ctx, arg1, arg2)`    | 逐个传参 | 返回新函数，延迟执行 |

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

## Q: 深拷贝实现

**A:**

**方案对比：**

| 方案                             | 优点     | 缺点                                                  |
| -------------------------------- | -------- | ----------------------------------------------------- |
| `JSON.parse(JSON.stringify())` | 简单     | 不支持 Function/undefined/Symbol/Date/RegExp/循环引用 |
| 递归 + WeakMap                   | 完整支持 | 代码较多                                              |
| `structuredClone()`（原生）✅  | 原生支持 | 不支持 Function                                       |

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

## Q: 防抖与节流

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

## Q: Ajax 请求实现

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

## Q: Proxy 简易实现与原生 Proxy 有何差异？

**A:**

**核心思路**：利用 `Object.defineProperty` 为目标对象的每个属性定义 `getter` / `setter`，从而模拟 `get` / `set` 拦截行为。

```js
function createProxy(target, handler) {
  const proxy = {};
  const keys = Reflect.ownKeys(target);

  for (const key of keys) {
    Object.defineProperty(proxy, key, {
      configurable: true,
      enumerable: true,
      get() {
        if (handler.get) {
          return handler.get(target, key, proxy);
        }
        return target[key];
      },
      set(value) {
        if (handler.set) {
          const result = handler.set(target, key, value, proxy);
          if (result) target[key] = value;
        } else {
          target[key] = value;
        }
      }
    });
  }

  return proxy;
}
```

**使用示例：**

```js
const target = { name: 'Alice', age: 25 };

const handler = {
  get(target, prop) {
    console.log(`[GET] ${prop}`);
    return Reflect.get(target, prop);
  },
  set(target, prop, value) {
    console.log(`[SET] ${prop} = ${value}`);
    return Reflect.set(target, prop, value);
  }
};

const proxy = createProxy(target, handler);
console.log(proxy.name); // [GET] name → Alice
proxy.age = 30;          // [SET] age = 30
console.log(target.age); // 30
```

**与原生 `Proxy` 的差异：**

| 特性                   | 原生 `Proxy` | 手写实现                    |
| ---------------------- | -------------- | --------------------------- |
| 拦截不存在的属性       | ✅ 支持        | ❌ 直接返回 `undefined`   |
| 拦截数组索引/长度变化  | ✅ 支持        | ❌ 动态新增属性无法预先定义 |
| 拦截 `delete` 操作   | ✅ 支持        | ❌ 无法拦截                 |
| 拦截 `in` 操作符     | ✅ 支持        | ❌ 需要 `has` trap        |
| 拦截 `Object.keys()` | ✅ 支持        | ❌ 只返回预定义属性         |
| 性能                   | 引擎级优化     | 较慢，需遍历定义每个属性    |

> ⚠️ **注意**：手写实现本质上是对**已有属性**的拦截，`Object.defineProperty` 无法感知属性的新增与删除，这也是 Vue 2 响应式系统的同款局限——Vue 3 正是为此改用了原生 `Proxy`。

---

## 异步编程篇

## Q: Promise 原理与方法

**A:**

**Promise** 是处理异步操作的标准方案，解决了回调地狱（Callback Hell）问题，提供链式调用的方式处理异步依赖。

**三种状态**：`pending` → `fulfilled` / `rejected`，状态一旦改变不可逆。

| 方法                               | 说明                                         |
| ---------------------------------- | -------------------------------------------- |
| `Promise.resolve(val)`           | 返回一个已成功的 Promise                     |
| `Promise.reject(err)`            | 返回一个已失败的 Promise                     |
| `.then(onFulfilled, onRejected)` | 注册成功/失败回调，返回新 Promise            |
| `.catch(onRejected)`             | 捕获错误，等价于 `.then(null, onRejected)` |
| `.finally(fn)`                   | 无论成功失败都执行                           |
| `Promise.all(promises)`          | 全部成功才 resolve，一个失败即 reject        |
| `Promise.allSettled(promises)`   | 等待全部结束，返回每个结果（无论成功/失败）  |
| `Promise.race(promises)`         | 第一个完成（成功或失败）就 resolve/reject    |
| `Promise.any(promises)`          | 第一个成功就 resolve，全失败才 reject        |

**.then(onFulfilled, onRejected) 详解：**

`.then` 接收两个参数：第一个 `onFulfilled` 在 Promise **resolve** 时执行，第二个 `onRejected` 在 Promise **reject** 时执行：

```js
p.then(
  (data) => { console.log('fulfilled:', data) },  // resolve 时走这里
  (err)  => { console.log('rejected:', err)  }    // reject 时走这里
)
```

| 情况               | 走哪个回调      |
| ------------------ | --------------- |
| `resolve(value)` | `onFulfilled` |
| `reject(reason)` | `onRejected`  |
| 抛出异常 `throw` | `onRejected`  |

> ⚠️ **与 `.catch()` 的区别**：`.then(onFulfilled, onRejected)` 中的 `onRejected` **捕获不到** `onFulfilled` 内部抛出的错误，而链式 `.catch()` 可以，推荐用后者。

**链式 .then 的传值规则：**

`.then()` 始终返回一个新的 Promise，下一个 `.then` 收到的值取决于上一个回调的返回：

```js
// 情况一：回调有返回值 → 下一个 then 的 onFulfilled 收到该值
p.then(() => 'hello').then((data) => console.log(data))   // → 'hello'

// 情况二：回调返回 Promise → 等该 Promise 决议后再传给下一个 then
p.then(() => fetch('/api')).then((res) => console.log(res))

// 情况三：没有 return → 下一个 then 收到 undefined
p.then(() => { console.log('done') }).then((data) => console.log(data))  // → undefined

// 情况四：回调内部 throw → 下一个 then 走 onRejected
p.then(() => { throw new Error('出错了') })
 .then(null, (err) => console.log(err))   // → Error: 出错了
```

**最容易踩坑的点：**`onRejected` 正常执行并 return 后，异常已被"处理"，后续链会走 `onFulfilled`，而非继续传递错误：

```js
Promise.reject('error')
  .then(null, (err) => {
    console.log('捕获了:', err)   // 执行
    return '已处理'
  })
  .then(
    (data) => console.log(data),  // → '已处理'，走这里！
    (err)  => console.log(err)    // 不走这里
  )
```

**手写 Promise（完整版，含链式调用 / .catch / .finally）：**

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

  // then 返回新 Promise，支持链式调用
  then(onFulfilled, onRejected) {
    // 参数不传时透传到下一个 then
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : val => val
    onRejected  = typeof onRejected  === 'function' ? onRejected  : err => { throw err }

    return new MyPromise((resolve, reject) => {
      const handleFulfilled = () => {
        try { resolve(onFulfilled(this.value)) } catch (e) { reject(e) }
      }
      const handleRejected = () => {
        try { resolve(onRejected(this.reason)) } catch (e) { reject(e) }
      }

      if (this.status === FULFILLED) handleFulfilled()
      if (this.status === REJECTED)  handleRejected()
      if (this.status === PENDING) {
        this.onResolvedCallbacks.push(handleFulfilled)
        this.onRejectedCallbacks.push(handleRejected)
      }
    })
  }

  // catch 是 then(null, onRejected) 的语法糖
  catch(onRejected) {
    return this.then(null, onRejected)
  }

  // finally 无论成功失败都执行 fn，且透传原来的值/原因
  finally(fn) {
    return this.then(
      val => MyPromise.resolve(fn()).then(() => val),
      err => MyPromise.resolve(fn()).then(() => { throw err })
    )
  }

  // 静态方法
  static resolve(value) {
    if (value instanceof MyPromise) return value
    return new MyPromise(resolve => resolve(value))
  }

  static reject(reason) {
    return new MyPromise((_, reject) => reject(reason))
  }
}
```

**关键点说明：**

| 方法         | 实现要点                                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------------- |
| `.then`    | 返回新 Promise；回调结果作为下一个 Promise 的 resolve 值；回调 throw 则 reject                             |
| `.catch`   | 等价于 `.then(null, onRejected)`，本质复用 `then`                                                      |
| `.finally` | 无论状态都执行 `fn`，不改变原来的值/原因向后透传                                                         |
| 参数缺省     | `onFulfilled` 不传默认 `val => val`；`onRejected` 不传默认 `err => { throw err }`，实现值/错误穿透 |

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

## Q: async/await 原理

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

## Q: Generator 生成器

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

## Q: 什么是异步请求的竞态条件（Race Condition）？如何解决？

**A:**

**竞态条件**是指多个异步请求「后发先至」，导致旧响应覆盖新响应，页面显示错误数据的问题。

### 典型场景

用户快速切换下拉选项，触发连续请求：

```
t=0ms   选择 A → 发出请求 R1（慢，1000ms）
t=200ms 改选 B → 发出请求 R2（快，200ms）
t=400ms R2 返回 → 图表显示 B 的数据 ✓
t=1000ms R1 返回 → 图表被覆盖成 A 的数据 ✗  ← 竞态问题
```

用户选的是 B，图表显示的却是 A——**请求顺序 ≠ 响应顺序**。

---

### 方案一：请求版本号（轻量推荐）

用一个模块级计数器作为「世代戳」，响应回来后校验是否仍是最新请求：

```js
let reqId = 0

async function fetchData(params) {
  reqId += 1
  const currentId = reqId   // 快照当前版本

  clearChart()              // 立即清空，同步操作

  const res = await api.query(params)

  if (currentId !== reqId) return  // 已过期，静默丢弃

  renderChart(res)          // 只有最新请求才更新视图
}
```

**关键点：**

- `reqId` 自增表示「作废所有旧请求」
- `currentId` 快照保存本次请求的版本
- 响应回来后比对，过期则直接 `return`，不更新任何状态

---

### 方案二：AbortController 取消请求

发起新请求前主动 abort 旧请求，浏览器层面取消网络请求：

```js
let controller = null

async function fetchData(params) {
  if (controller) controller.abort()  // 取消上一个请求
  controller = new AbortController()

  try {
    const res = await fetch('/api/data', { signal: controller.signal })
    renderChart(await res.json())
  } catch (err) {
    if (err.name === 'AbortError') return  // 主动取消，忽略
    throw err
  }
}
```

---

### 两种方案对比

| 对比维度   | 请求版本号            | AbortController               |
| ---------- | --------------------- | ----------------------------- |
| 实现复杂度 | ✅ 简单，无侵入       | ❌ 需管理 controller 引用     |
| 网络层取消 | ❌ 请求仍会发出并完成 | ✅ 真正取消网络请求，节省带宽 |
| 浏览器缓存 | ✅ 响应可被缓存复用   | ❌ 已取消请求不缓存           |
| 适用场景   | 选项切换、搜索联想    | 大文件请求、流式传输          |

> ⚠️ **注意**：在 Vue/React 组件销毁时（`onUnmounted` / `useEffect` cleanup），也应将 `reqId` 失效或调用 `controller.abort()`，防止组件卸载后异步回调仍操作已销毁的 DOM/状态。

---

## Q: Event Loop 事件循环

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

### `async / await` 怎么参与 Event Loop？

关键机制：`await expr` 会先**同步执行 `expr`**（如果是函数调用 `await fn()`，`fn()` 立即执行），再把「await 之后的剩余代码」包装成 `Promise.resolve(expr).then(剩余代码)` **丢进微任务队列**，同时暂停当前函数。

下面这道题同时覆盖三个高频考点——`await fn()` 中 `fn()` 同步执行、await 续体属于微任务、多个微任务的入队顺序：

```js
async function a() {
  console.log('a-start')
  await b()                 // 先同步执行 b()，再 await 其返回值；a-end 是续体
  console.log('a-end')      // 续体 → 微任务
}
async function b() {
  console.log('b')          // 同步代码，立即执行
}
console.log('script-start')
setTimeout(() => console.log('timeout'), 0)
a()
Promise.resolve().then(() => console.log('promise'))
console.log('script-end')

// 输出：script-start → a-start → b → script-end → a-end → promise → timeout
```

**三个关键点：**

1. **`await b()` 会先「调用」`b()`**，`b` 函数体里的 `console.log('b')` 是同步代码，**立即执行**。`await` 暂停的是「`b()` 返回的 Promise 决议之后的代码（即 `a-end`）」，**不是 `b` 本身**。所以 `b` 紧跟 `a-start`、在 `script-end` 之前打印。

   > 💡 记忆口诀：<span style="color:#c0392b;font-weight:600">await fn() = 先同步执行 fn()，再 await 它的返回值；await 之后的代码 = .then 回调 → 微任务。</span>

2. **`a-end` 在 `promise` 之前**。微任务入队顺序：执行 `a()` 时 `await` 续体（`a-end`）先入队，`Promise.resolve().then`（`promise`）后入队。先进先出 → `a-end` 先于 `promise`。

3. **`timeout` 最后**。`setTimeout` 是宏任务，要等同步代码 + 所有微任务清空后才执行。

**逐步推导：**

| 阶段 | 代码 | 输出 |
|------|------|------|
| 同步 | `console.log('script-start')` | `script-start` |
| 同步 | `setTimeout` 注册宏任务 | — |
| 同步 | `a()` → `console.log('a-start')` | `a-start` |
| 同步 | `await b()` → 先执行 `b()` → `console.log('b')` | `b` |
| 同步 | `b()` 返回 Promise，`await` 暂停，`a-end` 入微任务队列 | — |
| 同步 | `Promise.resolve().then` 入微任务队列 | — |
| 同步 | `console.log('script-end')` | `script-end` |
| 微任务 | 取出 `a-end`（先入队） | `a-end` |
| 微任务 | 取出 `promise`（后入队） | `promise` |
| 宏任务 | `timeout` | `timeout` |

> ⚠️ **注意**：
> 1. `fetch()` 调用本身是同步的，**`.then` 回调才是微任务**；而 XHR 的 `onload` 回调是宏任务。不要笼统地说「请求是宏任务」。
> 2. `await` 后面跟不同类型，调度成本不同：普通值（`await 1`）包装成 `Promise.resolve` 续体入队 1 个微任务；原生 Promise 在 V8 7.2+ 优化后也只 1 个 tick（旧引擎 2~3 个）；thenable（自定义带 `then` 的对象）会多一次 `then` 调用、额外微任务，更慢。

---

## ES6 核心特性篇

## Q: Set 与 Map 集合与 WeakSet/WeakMap 的区别？

**A:**

**Set**：有序不重复的值集合（类似数学中的集合）

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

**底层实现：为什么 Set/Map 是"有序"的？**

你可能会疑惑：*"它们底层是哈希表，哈希表本身不是无序的吗？"*

没错，标准哈希表确实无序。为了实现插入顺序的遍历，JavaScript 引擎底层通常采用 **"哈希表 + 双向链表"** 的复合结构：

| 结构                    | 作用                                                 |
| ----------------------- | ---------------------------------------------------- |
| **哈希部分**      | 实现 O(1) 复杂度的快速查找、去重                     |
| **链表/指针部分** | 每个元素额外记录「前一个」和「后一个」插入的元素是谁 |
| **遍历过程**      | 沿链表从头走到尾，而非扫描整个哈希桶                 |

**特殊细节：删除再重插会改变顺序**

```js
const s = new Set([1, 2, 3])
s.delete(2)   // 剩下 [1, 3]
s.add(2)      // 2 被添加到末尾，顺序变为 [1, 3, 2]
```

> ⚠️ **注意**：重新插入的元素会排到末尾，而不是回到原来的位置。

**Weak 版本的区别：**

| 特性      | Set/Map             | WeakSet/WeakMap                           |
| --------- | ------------------- | ----------------------------------------- |
| 键/值类型 | 任意                | 只能是对象（WeakSet 值、WeakMap 键）      |
| 垃圾回收  | 持有强引用，阻止 GC | **弱引用**，对象无其他引用时可被 GC |
| 可枚举    | ✅ 有 size/forEach  | ❌ 无法遍历、无 size                      |
| 适用场景  | 通用                | 存储 DOM 节点等临时数据，防内存泄漏       |

**手写 Set（简化版）：**

```js
class MySet {
  constructor() {
    this.data = []
  }
  add(value) {
    if (!this.has(value)) this.data.push(value)
    return this
  }
  delete(value) {
    const index = this.data.indexOf(value)
    if (index !== -1) { this.data.splice(index, 1); return true }
    return false
  }
  has(value) {
    return this.data.indexOf(value) !== -1
  }
  get size() { return this.data.length }
  clear() { this.data = [] }
  values() { return this.data }
  forEach(callback) {
    this.data.forEach(v => callback(v, v, this))
  }
}
```

**手写 Map（简化版）：**

```js
class MyMap {
  constructor() {
    this.data = {}
  }
  set(key, value) { this.data[key] = value; return this }
  get(key) { return this.data[key] }
  has(key) { return Object.prototype.hasOwnProperty.call(this.data, key) }
  delete(key) {
    if (this.has(key)) { delete this.data[key]; return true }
    return false
  }
  get size() { return Object.keys(this.data).length }
  clear() { this.data = {} }
  entries() { return Object.entries(this.data) }
  forEach(callback) {
    for (const [k, v] of this.entries()) callback(v, k, this)
  }
}
```

> ⚠️ **注意**：简化版 Map 用对象模拟，键只能是字符串/Symbol，原生 Map 的键可以是任意类型（包括对象），底层实现差异较大。

---

## Q: Proxy 与 Reflect

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

**Proxy 常用拦截器（trap）一览：**

| trap               | 触发时机               | 对应 Reflect 方法          |
| ------------------ | ---------------------- | -------------------------- |
| `get`            | 读取属性               | `Reflect.get`            |
| `set`            | 设置属性               | `Reflect.set`            |
| `has`            | `in` 运算符          | `Reflect.has`            |
| `deleteProperty` | `delete` 操作符      | `Reflect.deleteProperty` |
| `apply`          | 调用函数               | `Reflect.apply`          |
| `construct`      | `new` 操作符         | `Reflect.construct`      |
| `ownKeys`        | `Object.keys` 等枚举 | `Reflect.ownKeys`        |

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

| 对比          | `Object.xxx`     | `Reflect.xxx`          |
| ------------- | ------------------ | ------------------------ |
| 返回值        | 多种形式           | 统一返回布尔值等规范结果 |
| 报错方式      | 部分操作直接抛异常 | 返回 false，不抛出       |
| 与 Proxy 配合 | 不一致             | 完全对应，推荐配合使用   |

---

## Q: Proxy 响应式实现

**A:**

核心思路：通过 `get` 陷阱**收集依赖**，通过 `set` 陷阱**触发更新**，递归代理嵌套对象。

**手写简版响应式（Vue3 reactive 核心逻辑）：**

```js
// 依赖收集容器：WeakMap<target, Map<key, Set<effect>>>
const targetMap = new WeakMap()
let activeEffect = null

// 收集依赖
function track(target, key) {
  if (!activeEffect) return
  let depsMap = targetMap.get(target)
  if (!depsMap) targetMap.set(target, (depsMap = new Map()))
  let dep = depsMap.get(key)
  if (!dep) depsMap.set(key, (dep = new Set()))
  dep.add(activeEffect)
}

// 触发更新
function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  const dep = depsMap.get(key)
  if (dep) dep.forEach(effect => effect())
}

// 创建响应式对象
function reactive(raw) {
  return new Proxy(raw, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver)
      track(target, key)  // 依赖收集
      // 深层对象递归代理
      return typeof res === 'object' && res !== null ? reactive(res) : res
    },
    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver)
      trigger(target, key)  // 触发更新
      return result
    },
    deleteProperty(target, key) {
      const result = Reflect.deleteProperty(target, key)
      trigger(target, key)
      return result
    }
  })
}

// 副作用函数
function effect(fn) {
  activeEffect = fn
  fn()  // 首次执行触发 get → 完成依赖收集
  activeEffect = null
}

// 使用示例
const state = reactive({ count: 0, user: { name: 'Tom' } })
effect(() => {
  console.log('count:', state.count)   // 自动追踪 count
})
state.count++  // 触发 trigger → 重新执行 effect → 打印 count: 1
```

**Proxy vs Object.defineProperty 实现响应式对比：**

| 对比维度     | `Object.defineProperty`   | `Proxy`                 |
| ------------ | --------------------------- | ------------------------- |
| 数组变化监听 | ❌ 需要重写 push/pop 等方法 | ✅ 原生拦截所有操作       |
| 新增属性监听 | ❌ 需要手动 `Vue.set`     | ✅ 自动拦截               |
| 删除属性监听 | ❌ 不支持                   | ✅`deleteProperty` trap |
| 性能         | 初始化时递归遍历所有属性    | 懒代理，访问时才递归      |
| 浏览器兼容   | ✅ IE9+                     | ❌ 不支持 IE              |

> ⚠️ **注意**：`Reflect.set` / `Reflect.get` 中必须传递 `receiver`，确保 `this` 指向正确，避免 getter/setter 继承链中 `this` 错误的 bug。

---

## Q: ES Module vs CommonJS

**A:**

| 对比维度     | CommonJS（CJS）                                  | ES6 Module（ESM）                          |
| ------------ | ------------------------------------------------ | ------------------------------------------ |
| 使用环境     | Node.js 服务端                                   | 浏览器 + Node.js                           |
| 语法         | `require()` / `module.exports`               | `import` / `export`                    |
| 加载时机     | 运行时加载（动态）                               | 编译时静态分析                             |
| 缓存         | 首次加载后缓存，再次 require 返回缓存            | 同模块只加载一次                           |
| 导出值       | 值的**拷贝**（修改原模块不影响已导出的值） | 值的**动态绑定**（原模块修改会同步） |
| Tree Shaking | ❌ 不支持                                        | ✅ 支持（静态分析未使用代码）              |

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

## Q: 数组常用方法

**A:**

**修改原数组：**

| 方法                           | 说明      | 返回值           |
| ------------------------------ | --------- | ---------------- |
| `push(item)`                 | 末尾添加  | 新长度           |
| `pop()`                      | 末尾删除  | 被删除的元素     |
| `unshift(item)`              | 头部添加  | 新长度           |
| `shift()`                    | 头部删除  | 被删除的元素     |
| `splice(start, n, ...items)` | 删除/插入 | 被删除的元素数组 |
| `sort(compareFn)`            | 排序      | 原数组           |
| `reverse()`                  | 反转      | 原数组           |

**不修改原数组：**

| 方法                  | 说明                     | 返回值           |
| --------------------- | ------------------------ | ---------------- |
| `slice(start, end)` | 截取                     | 新数组           |
| `concat(...items)`  | 合并                     | 新数组           |
| `map(fn)`           | 映射                     | 新数组           |
| `filter(fn)`        | 过滤                     | 新数组           |
| `reduce(fn, init)`  | 累计                     | 累计结果         |
| `forEach(fn)`       | 遍历                     | 无（不可 break） |
| `find(fn)`          | 查找第一个满足条件的元素 | 元素或 undefined |
| `findIndex(fn)`     | 查找第一个满足条件的下标 | 下标或 -1        |
| `some(fn)`          | 有一个满足→ true        | 布尔值           |
| `every(fn)`         | 全部满足→ true          | 布尔值           |
| `flat(depth)`       | 展平嵌套数组             | 新数组           |
| `includes(val)`     | 是否包含                 | 布尔值           |

```js
// reduce 实现数组求和
[1, 2, 3, 4].reduce((acc, cur) => acc + cur, 0) // 10

// 数组去重
const arr = [1, 2, 2, 3]
[...new Set(arr)] // [1, 2, 3]
```

---

## Q: 字符串常用方法

**A:**

| 方法                                         | 说明                        |
| -------------------------------------------- | --------------------------- |
| `charAt(i)`                                | 获取指定位置字符            |
| `indexOf(str)` / `lastIndexOf`           | 查找子串位置，未找到返回 -1 |
| `includes(str)`                            | 是否包含                    |
| `startsWith(str)` / `endsWith`           | 以...开头/结尾              |
| `slice(start, end)`                        | 截取子串                    |
| `split(sep)`                               | 分割为数组                  |
| `replace(search, replacement)`             | 替换（支持正则）            |
| `trim()` / `trimStart()` / `trimEnd()` | 去空白                      |
| `padStart(len, fill)` / `padEnd`         | 填充对齐                    |
| `repeat(n)`                                | 重复                        |
| `toUpperCase()` / `toLowerCase()`        | 大小写转换                  |
| `match(reg)`                               | 匹配正则，返回匹配结果      |
| **模板字符串** `` `${expr}` ``         | ES6 插值语法                |

---

## 其他高频考点

## Q: 深拷贝与浅拷贝

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

## Q: 事件委托机制应用场景？

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

## Q: for...in vs for...of

**A:**

| 对比        | `for...in`                               | `for...of`                      |
| ----------- | ------------------------------------------ | --------------------------------- |
| 遍历内容    | 对象的**可枚举属性名**（包括原型链） | **可迭代对象**的元素值      |
| 适用对象    | 普通对象                                   | 数组、字符串、Set、Map、Generator |
| 原型链      | ✅ 会遍历到原型链属性                      | ❌ 不涉及                         |
| Symbol 属性 | ❌ 不遍历                                  | 取决于迭代器实现                  |
| 建议        | 遍历对象属性时用                           | 遍历有序集合时用                  |

```js
const obj = { a: 1, b: 2 }
for (const key in obj) console.log(key)    // 'a', 'b'（键）

const arr = [10, 20, 30]
for (const val of arr) console.log(val)    // 10, 20, 30（值）
```

---

## Q: 迭代器与可迭代协议为什么数组可以被 for...of 遍历？

**A:**

`for...of`、扩展运算符 `...`、`Array.from` 等能工作，是因为背后有两个协议：

**1. 可迭代协议（Iterable Protocol）**

对象必须实现 `[Symbol.iterator]` 方法，调用后返回一个**迭代器对象**。

**2. 迭代器协议（Iterator Protocol）**

迭代器对象必须实现 `next()` 方法，每次调用返回 `{ value, done }`：

- `done: false` — 还有元素，`value` 为当前值
- `done: true` — 遍历结束，`value` 为 `undefined`

**数组内置了 `[Symbol.iterator]`，所以它天然可迭代：**

```js
const arr = ['a', 'b', 'c']

// 数组内置了 Symbol.iterator
console.log(typeof arr[Symbol.iterator])  // "function"

// 手动获取迭代器，逐步调用
const iterator = arr[Symbol.iterator]()
iterator.next()  // { value: 'a', done: false }
iterator.next()  // { value: 'b', done: false }
iterator.next()  // { value: 'c', done: false }
iterator.next()  // { value: undefined, done: true }
```

**内置的可迭代对象：**`Array`、`String`、`Map`、`Set`、`arguments`、`NodeList`、`Generator` 均实现了 `[Symbol.iterator]`。

**自定义对象实现迭代：**

```js
const myObj = {
  data: [1, 2, 3],
  [Symbol.iterator]() {
    let index = 0
    const data = this.data
    return {
      next() {
        if (index < data.length) {
          return { value: data[index++], done: false }
        }
        return { value: undefined, done: true }
      }
    }
  }
}

for (const val of myObj) {
  console.log(val)  // 1, 2, 3
}
```

**整体关系：**

```
可迭代对象（Iterable）
  └── [Symbol.iterator]()
        └── 返回 迭代器对象（Iterator）
              └── next()
                    └── { value, done }
```

> ⚠️ **注意**：普通对象 `{}` 没有实现 `[Symbol.iterator]`，所以不能用 `for...of` 遍历，只能用 `for...in`。

---

## Q: 垃圾回收机制

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

## Q: 类型转换机制

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

---

## 内存管理篇

## Q: 内存泄漏场景如何排查和解决？

**A:**

**内存泄漏**是指程序分配的内存由于某种原因无法被垃圾回收器回收，导致内存持续增长，最终引发页面卡顿甚至崩溃。

### 五大常见场景

**1. 意外的全局变量**

```js
function foo() {
  bar = '全局变量'         // 未声明，挂载到 window
  this.global = '另一个'  // 非严格模式下 this 指向 window
}
```

✅ 解决：始终使用 `const`/`let`/`var` 声明；开启 `'use strict'`。

---

**2. 被遗忘的定时器 / 事件监听器**

```js
// ❌ 泄漏：节点移除后定时器仍引用数据
let data = fetchHugeData()
setInterval(() => {
  document.getElementById('node').innerHTML = JSON.stringify(data)
}, 1000)

// ❌ 泄漏：未移除的事件监听器
element.addEventListener('click', handler)
element.remove() // DOM 移除了，但监听器还在

// ✅ 正确做法
const timer = setInterval(fn, 1000)
clearInterval(timer) // 不需要时清除

element.removeEventListener('click', handler) // 销毁前移除
```

---

**3. 脱离 DOM 的引用**

```js
// ❌ JS 中保留了对已移除 DOM 节点的引用
const cache = { btn: document.getElementById('my-btn') }
document.body.removeChild(document.getElementById('my-btn'))
// btn 虽已从 DOM 移除，但 cache.btn 仍持有引用，无法被 GC

// ✅ 解除引用
cache.btn = null
```

---

**4. 闭包不当使用**

```js
function outer() {
  const bigData = new Array(1_000_000).fill('*')
  return function inner() {
    // 即使不使用 bigData，闭包仍持有 outer 环境引用
    console.log('called')
  }
}
const fn = outer()
// fn = null  // ✅ 不需要时解除引用
```

---

**5. 未清理的 Map / Set（应用 WeakMap / WeakSet）**

```js
// ❌ Map 强引用，obj 无法被 GC
const map = new Map()
let obj = { id: 1 }
map.set(obj, 'value')
obj = null // map 中仍有引用，对象不会被回收

// ✅ WeakMap 弱引用，obj 置空后会自动从 WeakMap 中移除
const weakMap = new WeakMap()
let obj2 = { id: 2 }
weakMap.set(obj2, 'value')
obj2 = null // ✅ 可被 GC
```

### 排查工具

| 工具                                         | 用途                                          |
| -------------------------------------------- | --------------------------------------------- |
| Chrome DevTools →**Memory 面板**      | 拍堆快照（Heap Snapshot），对比前后内存增长   |
| Chrome DevTools →**Performance 面板** | 录制过程中观察 JS Heap 折线是否持续上升不回落 |
| Chrome DevTools →**Coverage 面板**    | 找出未使用的代码                              |

> ⚠️ **注意**：SPA 框架（React/Vue）中，切换路由时务必在组件销毁钩子（`onUnmounted` / `useEffect` cleanup）中清除定时器、取消事件监听和中断异步请求。

---

## Q: 实现最长递增子序列（LIS）算法？

**A:**

**最长递增子序列（Longest Increasing Subsequence）** 是经典算法题，也是 Vue3 Diff 算法第五步的核心——用 LIS 确定哪些节点不需要移动，最大程度减少 DOM 操作。

**思路分级：**

| 方案 | 时间复杂度 | 空间复杂度 | 适用场景 |
|------|-----------|-----------|---------|
| 动态规划（暴力） | O(n²) | O(n) | 理解原理 |
| 贪心 + 二分 + 回溯 | **O(n log n)** | O(n) | 面试 / 工程（Vue3 源码使用此方案） |

### 方案一：动态规划 O(n²)

```js
/**
 * dp[i] = 以 arr[i] 结尾的 LIS 长度
 * 状态转移：dp[i] = max(dp[j] + 1)，其中 j < i && arr[j] < arr[i]
 */
function lengthOfLIS(arr) {
  const n = arr.length
  if (n === 0) return 0
  const dp = new Array(n).fill(1)

  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (arr[j] < arr[i]) {
        dp[i] = Math.max(dp[i], dp[j] + 1)
      }
    }
  }

  return Math.max(...dp)
}

// 测试
console.log(lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18])) // 4 → [2,3,7,101] 或 [2,3,7,18]
```

### 方案二：贪心 + 二分查找 O(n log n)

> 这是 Vue3 `getSequence` 使用的方案。核心思想：维护一个「尽可能矮」的递增序列，遇到更大的追加，遇到更小的用二分查找替换。

```js
/**
 * 返回 LIS 的长度
 * tails[i] = 长度为 i+1 的递增子序列的最小末尾值
 */
function lengthOfLIS(arr) {
  const tails = []

  for (const num of arr) {
    // 二分查找：第一个 >= num 的位置
    let lo = 0, hi = tails.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (tails[mid] < num) {
        lo = mid + 1
      } else {
        hi = mid
      }
    }

    tails[lo] = num  // 替换或追加
  }

  return tails.length
}
```

### 方案三：贪心 + 二分 + 回溯（返回下标数组，Vue3 源码版本）

> Vue3 不仅要知道长度，还要知道**哪些位置不动**，所以必须回溯出真正的 LIS 下标。

```ts
/**
 * 返回最长递增子序列对应的下标数组
 * @param arr - 如 Vue3 中的 newIndexToOldIndexMap（0 表示新增，跳过）
 */
function getSequence(arr: number[]): number[] {
  const p = arr.slice()        // 前驱记录数组
  const result = [0]           // 存放 LIS 对应的下标
  let i, j, u, v, c
  const len = arr.length

  for (i = 0; i < len; i++) {
    const arrI = arr[i]
    if (arrI !== 0) {          // 0 表示新增节点，跳过
      j = result[result.length - 1]

      // 比末尾大 → 直接追加
      if (arr[j] < arrI) {
        p[i] = j               // 记录前驱下标
        result.push(i)
        continue
      }

      // 否则二分查找第一个 >= arrI 的位置，替换
      u = 0
      v = result.length - 1
      while (u < v) {
        c = (u + v) >> 1
        if (arr[result[c]] < arrI) {
          u = c + 1
        } else {
          v = c
        }
      }

      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1] // 记录前驱
        }
        result[u] = i
      }
    }
  }

  // 回溯：沿 p 链还原真正的 LIS 下标
  u = result.length
  v = result[u - 1]
  while (u-- > 0) {
    result[u] = v
    v = p[v]
  }

  return result
}

// 测试
console.log(getSequence([2, 3, 1, 5, 6, 8, 7, 9, 4]))
// [0, 1, 3, 4, 6, 7] → 对应值 [2,3,5,6,7,9]
```

### 推演示例

输入：`[10, 9, 2, 5, 3, 7, 101, 18]`

| 步骤 | 当前值 | tails 状态 | 操作 |
|------|--------|-----------|------|
| 1 | 10 | `[10]` | 追加 |
| 2 | 9 | `[9]` | 替换 tails[0] |
| 3 | 2 | `[2]` | 替换 tails[0] |
| 4 | 5 | `[2, 5]` | 追加 |
| 5 | 3 | `[2, 3]` | 替换 tails[1] |
| 6 | 7 | `[2, 3, 7]` | 追加 |
| 7 | 101 | `[2, 3, 7, 101]` | 追加 |
| 8 | 18 | `[2, 3, 7, 18]` | 替换 tails[3] |

**最终 LIS 长度 = 4**

### Vue3 中的应用

在 `patchKeyedChildren` 第五步中：
1. 建立 `newIndexToOldIndexMap`（新下标 → 旧位置）
2. 对该数组求 LIS → 得到**不需要移动的节点下标**
3. 倒序遍历，在 LIS 中的节点保持不动，不在 LIS 中的执行 `move`

> ⚠️ **注意**：`tails` 数组中间过程**不是**真正的 LIS 序列（如上表步骤 5 中 `[2,3]` 并不是连续选取），只是贪心替换的辅助结构。需要用**回溯数组 `p`** 才能还原真正的子序列——这就是 Vue3 方案三的核心。

---
