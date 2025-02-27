# ES6面试题

## <span style="color: red;">什么是async await?</span>

* async await是一种用于简化JavaScript中异步编程的语法。<span style="color: red;">是基于Promise的语法糖</span>，提供了一种更方便、更易理解的方式来处理异步操作。

* <span style="color: red;">async是一个放在函数声明前的关键字，表示该函数是一个异步函数。这个函数总是返回一个Promise。如果函数内部返回了一个非Promise值，async函数会自动把这个值用Promise.resolve()封装成一个解决（resolved）状态的Promise。</span>

* <span style="color: red;">async/await能够使用传统的try/catch结构来捕获异常</span>，这使得异步代码的错误处理更加直观和方便。

### 一次性发送多个请求，保证他们的顺序？

* 可以通过使用async/await在for循环中按序发送请求，并确保每个请求完成后再发送下一个请求。
```js
async function sendRequestsSequentially(urls) {
    const results = [];
    for (const url of urls) {
        // 请求将会按urls数组中的顺序依次进行
        const response = await fetch(url);
        const data = await response.json(); // 假设服务器返回的是JSON数据
        results.push(data); // 按相应顺序保存数据
    }
    return results;
}
```
这种方法虽然可以确保顺序，但是请求并不是并发的，后一个请求必须等待前一个请求完成，因此性能可能会受到影响。
* 使用Promise.all维持并发，并确保顺序:如果希望并发发送请求但还想保持结果的顺序，可以使用Promise.all。这个方法接收一个Promise数组，并且只有当所有Promise都解决后，它才会解决，解决的顺序与数组中的Promise顺序相同。
```js
function sendRequestsConcurrently(urls) {
    // 创建一个Promise数组，但由于我们不await这些调用，它们会并发执行
    const promises = urls.map(url => fetch(url).then(response => response.json()));
    // 使用Promise.all按照请求顺序等待所有异步操作完成
    return Promise.all(promises);
}
```
使用Promise.all的好处是，所有请求几乎同一时间发送，从而充分利用了网络及服务器资源，提高了效率。<br>
如果其中一个请求失败了，使用Promise.all会导致全部Promise被拒绝。如果你需要保证即使个别请求失败了，也要保证其他请求的数据被处理，可以考虑Promise.allSettled方法。<br>
最后可以简单提一下Promise.allSettled的特性，表明对不同Promise处理方式的深入了解。

### async await的实现原理

通过生成器`Generator`和 `Promise` 的结合，模拟了 `async/await` 的行为。它的核心思想是利用生成器的暂停和恢复机制，结合 `Promise` 的异步处理能力，实现类似 await 的功能。这种模拟虽然不如原生 `async/await` 高效，但它很好地展示了 `async/await` 的工作原理。

::: normal-demo
```js
function p(num) {
  return Promise.resolve(num * 2)
}
function* generator() {
  const value1 = yield p(1)
  const value2 = yield p(value1)
  return value2
}
function higherOrderFn(generatorFn) {
  return () => {
    return new Promise((resolve, reject) => {
      let gen = generatorFn()
      // 链式处理yield
      const doYield = (val)=>{
        console.log(val)
        let res
        try{
          res = gen.next(val)
        }catch(err){
            reject(err)
        }
        const {value,done} = res
        // done === true 函数结束，resolve结果
        if(done){
          return resolve(value)
        }else{
          // 未结束，处理 value，同时传参
          value.then((val)=>{doYield(val)})
        }
      }
      doYield()
    })
  }
}
const asyncFn = higherOrderFn(generator)()
// undefined
// 2
// 4
```
:::
### 推荐文章

[详解 async/await —— 从入门到实现原理](https://juejin.cn/post/7288963802649608250?searchId=20250224095329E728068825CAB4E955B4)


如果函数内部返回了一个非Promise值，async函数会自动把这个值用Promise.resolve()封装成一个解决（resolved）状态的Promise。

## <span style="color: red;">你知道`Generator`吗？</span>

Generator 函数返回一个迭代器对象（也称为 Generator 对象）。这个迭代器对象可以用于逐步执行 Generator 函数内部的代码



## Set 和 Map
- Set
    Set是一种叫做集合的数据结构。特点是里面是无序且不重复（可以利用这个进行简单去重）。
    里面的[value，value]结构
    - add
        添加元素，返回set结构本身
    - delete
        删除元素，返回布尔值
    - has
        判断是否有该元素，返回一个布尔值
    - clear
        清空
- Map
    Map是一种叫做字典的数据结构。里面是[key，value]结构。里面的key是不重复的。
    - size属性
    - set
        set(key,value)
    - get
    - has
    - delete
    - clear
### 遍历Map和Set
都可以使用迭代器（Iterator）来遍历Set和Map数据结构。
可以使用for of 或者 forEach(value,key)
### 如何实现一个Set

```js
class Set {
    constructor() {
        this.data = [];
    }

    add(value) {
        if (!this.data.has(value)) {
            this.data.push(value);
        }
    }

    delete(value) {
        const index = this.data.indexOf(value);
        if (index !== -1) {
            this.data.splice(index, 1);
        }
    }

    has(value) {
        return this.data.indexOf(value) !== -1;
    }

    clear() {
        this.data = [];
    }

    size() {
        return this.data.length;
    }

    values() {
        return this.data;
    }

    forEach(callback) {
        for (let i = 0; i < this.data.length; i++) {
            callback(this.data[i], this.data[i], this);
        }
    }
}
```

### 如何实现一个Map

```js
// 利用对象来模拟Map
class myMap {
    constructor() {
        this.data = {}
    }
    set(key, value) {
        this.data[key] = value;
    }
    get(key) {
        return this.data[key];
    }
    has(key) {
        return Object.keys(this.data).has(key);
    }
    clear() {
        this.data = {}
    }
    entries() {
        return Object.entries(this.data)
    }
    delete(key) {
        if (this.has(key)) {
            delete this.store[key];
            return true;
        }
        return false;
    }
}
const temp = new Map()
temp.set('key1', 'value1');
console.log(temp.has('key2'));
console.log(temp.has('key1'));
```


### WeakSet 和 WeakMap
- WeakSet
    WeakSet可以接受一个具有 Iterable接口的对象作为参数
    WeakSet是一种特殊的Set，它只能存储对象类型的值，并且这些对象必须是弱引用。弱引用意味着，如果一个对象没有被其他地方引用，那么它可能会被垃圾回收机制回收。WeakSet中的对象也可能会被回收，因为WeakSet不会阻止垃圾回收机制回收WeakSet中的对象。
    WeakSet没有size属性，也没有forEach、keys、values等迭代器方法。因为WeakSet中的对象可能会被回收，所以无法遍历WeakSet中的对象。
    WeakSet只有add、delete和has方法。
- WeakMap
    WeakMap是一种特殊的Map，它的键必须是对象类型的值，并且这些对象必须是弱引用。WeakMap中的键值对也可能会被回收，因为WeakMap不会阻止垃圾回收机制回收WeakMap中的键值对。
    WeakMap没有size属性，也没有forEach、keys、values等迭代器方法。因为WeakMap中的键值对可能会被回收，所以无法遍历WeakMap中的键值对。
    WeakMap只有set、get、delete和has方法，这些方法与Map的相应方法相似。

## 你是怎么理解ES6中Module的？使用场景？
Module就是模块，是能够单独命名且独立完成一定功能的程序语言的集合。
- AMD
    异步模块，采用异步的方式加载模块。所有的依赖模块的语句，都定义在一个回调函数中，等到模块加载完成之后
    这个回调函数才能执行。
    代表库require.js
- CommonJS
    CommonJS是一套JavaScript模块规范，用于服务端。
    - 模块是同步加载的，即只有加载完成，才能执行后面的操作
    - 模块在首次执行后就会缓存，再次加载只返回缓存结果，如果想要再次执行，可清除缓存
    - require返回的值是被输出的值的拷贝，模块内部的变化也不会影响这个值
    - 所有代码都运行在模块作用域，不会污染全局作用域
- ES6
    export 用于规定模块的外接接口。
    import 用于输入其它模块提供的功能。
CommonJS和AMD都是在运行时才能确定需要加载什么，而ES6设计思想是静态化，想在编译阶段就确定模块的依赖关系，以及输入输出的变量。而且是按需加载，只加载所需要的。
### ES6的module使用




## 详细解释一下Promise？
Promise是解决异步的一种方式，传统的如果异步之间存在依赖，形成嵌套。如果很多层的话，就会形成回调地狱。
Promise把这种改变成了链式调用，增加可维护性和可读性。
Promise存在三种状态fulfilled rejected pedding,状态不可逆
- Promise方法
    - reslove
        pedding=>fulfilled
        返回一个以给定值解析后的 Promise 对象。如果传入的是一个 Promise 对象，则直接返回该对象。如果传入的是一个 thenable 对象（即具有 then 方法的对象），则将其转换为 Promise 对象并解析。
    - reject
        pedding=>rejected
        返回一个以给定原因（错误信息）拒绝的 Promise 对象。
    - then
        添加回调函数，用于处理 Promise 对象的状态变化。第一个参数是状态变为 resolved 时的回调函数，第二个参数是状态变为 rejected 时的回调函数。 then 方法返回一个新的 Promise 对象，可以链式调用
    - catch
        添加一个错误处理的回调函数，用于处理 Promise 对象状态变为 rejected 时的错误信息。catch 方法返回一个新的 Promise 对象，可以链式调用
    - All
        接收一个可迭代对象，返回一个 Promise 对象，该 Promise 对象在所有 Promise 对象都成功解析后才会解析。如果其中任何一个 Promise 对象被拒绝，则整个 Promise 对象都会被拒绝。返回的 Promise 对象的结果是一个数组，数组中的元素按照传入的顺序排列。
    - race
        接收一个可迭代对象，返回一个 Promise 对象，该 Promise 对象在可迭代对象中的任何一个 Promise 对象解析或拒绝时立即解析或拒绝。返回的 Promise 对象的结果是第一个解析或拒绝的 Promise 对象的结果。
    - finally
        添加一个 finally 处理函数，无论 Promise 对象的状态如何都会被调用。finally 方法返回一个新的 Promise 对象，可以链式调用。
### 代码实现Promise
详细见Promise文件

::: normal-demo
```js
// 如何实现一个Promise
// 三种状态
const PENDING = 'PENDING';
const FULFILLED = 'FULFILLED';
const REJECTED = 'REJECTED';
class myPromise {
    constructor(executor) {
        this.status = PENDING;
        this.value = undefined;
        this.reason = undefined;
        // 存放成功的回调
        this.onResolvedCallbacks = [];
        // 存放失败的回调
        this.onRejectedCallbacks = [];
        let resolve = (value) => {
            if (this.status === PENDING) {
                this.status = FULFILLED;
                this.value = value;
                // 依次将对应的函数执行
                this.onResolvedCallbacks.forEach(fn => fn());
            }
        }
        let reject = (reason) => {
            if (this.status === PENDING) {
                this.status = REJECTED;
                this.reason = reason;
                // 依次将对应的函数执行
                this.onRejectedCallbacks.forEach(fn => fn());
            }
        }
        try {
            executor(resolve, reject)
        } catch (error) {
            reject(error)
        }
    }
    then(onFulfilled, onRejected) {
        if (this.status === FULFILLED) {
            onFulfilled(this.value)
        }

        if (this.status === REJECTED) {
            onRejected(this.reason)
        }

        if (this.status === PENDING) {
            // 如果promise的状态是 pending，需要将 onFulfilled 和 onRejected 函数存放起来，等待状态确定后，再依次将对应的函数执行
            this.onResolvedCallbacks.push(() => {
                onFulfilled(this.value)
            });

            // 如果promise的状态是 pending，需要将 onFulfilled 和 onRejected 函数存放起来，等待状态确定后，再依次将对应的函数执行
            this.onRejectedCallbacks.push(() => {
                onRejected(this.reason);
            })
        }
    }
}
const promise = new Promise((resolve, reject) => {
    resolve('成功');
}).then(
    (data) => {
        console.log('success', data)
    },
    (err) => {
        console.log('faild', err)
    }
)
```
:::

### 手撕promise.all
我们在Promise基础之上进行实现all方法
整体思路就是Promise.all的特征就是接受一组Promise,输出结果为这一组的结果


::: normal-demo
```js
// 如何实现一个Promise.all
function promiseAll(promises) {
    return new Promise((resolve, reject) => {
        const results = [];
        let count = 0;
        for (let i = 0; i < promises.length; i++) {
            promises[i].then((result) => {
                results[i] = result;
                count++;
                if (count === promises.length) {
                    resolve(results);
                }
            }).catch((error) => {
                reject(error);
            });
        }
    });
}
```
:::
## 说说你知道的Proxy?




## 什么是Reflect?
反射
### deleteProperty
Reflect.deleteProperty(obj, prop) 方法用于删除对象的属性。
参数：
- obj：要删除属性的对象
- prop：要删除的属性的名称
返回值：
- 返回一个布尔值，表示属性是否成功删除。如果成功删除，则返回 true，否则返回 false。
示例代码如下：
```javascript
const obj = {
  name: 'Alice',
  age: 25
};

console.log('Before:', obj);  // Output: { name: 'Alice', age: 25 }

Reflect.deleteProperty(obj, 'age');

console.log('After:', obj);   // Output: { name: 'Alice' }
```
在上述示例中，我们定义了一个对象 obj，包含 name 和 age 属性。然后我们使用 Reflect.deleteProperty 方法删除了 obj 对象的 age 属性。最后输出 obj 对象，发现 age 属性已经被成功删除。
**好处**
- 返回布尔值：Reflect.deleteProperty 方法会返回一个布尔值，表示属性是否成功删除。这使得我们可以在删除属性之后进行相应的逻辑处理。
- 无副作用：Reflect.deleteProperty 方法不会产生副作用，即不会触发对象的任何方法或触发拦截器。
- 兼容性：使用 Reflect.deleteProperty 方法可以提高代码的兼容性，因为此方法是标准的 JavaScript API，而不是对象上的特定方法。
- 支持 Proxy 对象：如果对象是一个 Proxy 对象，Reflect.deleteProperty 方法将调用 Proxy 的 deleteProperty 拦截器，以实现自定义的属性删除逻辑。