# 什么是Reflect?
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
