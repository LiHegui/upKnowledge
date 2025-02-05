## 说说new操作符具体干了什么？
- 开辟一个内存空间
- 继承类上面的原型
- 改变this指向，this指向这个新对象
- 执行函数体中的代码，如果函数中有返回值并且返回值是一个对象类型，那么这个对象就作为 new 操作符的返回值；否则，返回第一步中创建的新对象。
## 实现new关键字    
```javascript
function myNew(Func,...args){
    let obj = Object.create(Func.prototype)
    // let result = Func.apply(args)
    let result = Func.call(obj,...args)
    return result intanceof Object? result:obj
}
```
## call apply bind
都可以改变this的指向，改变函数执行上下文的函数
- call
    第一个参数为this指向,接受单个参数，只是单纯改变一次指向，并且调用时并且运行
- apply
    第一个参数为this指向，接受一组参数，只是单纯改变一次指向，并且调用时并且运行
- bind
    第一个参数为this,接受单个参数，指向永久改变,调用时不运行
## 遍历对象
- Object.entries()
    JavaScript 中一个用来返回给定对象可枚举属性的键值对数组的方法，它返回一个由 [key, value] 数组构成的新数组，其中每个键值对对应于对象的一个可枚举属性。
    Object.entries() 方法会遍历对象自身的可枚举属性，但不会遍历对象原型链上的属性。
- for in 
    如果要遍历对象的所有属性，可以使用 for...in 循环。for...in 循环会遍历对象所有可枚举的属性，包括对象自身的属性和原型链上的属性。
- Object.hasOwnProperty()
    Object.hasOwnProperty() 方法来判断一个属性是否是对象自身的属性