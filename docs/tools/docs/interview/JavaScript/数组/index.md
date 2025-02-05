# 数组
## 数组的相关方法
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
    ```
        console.log(array.reduce((accumulator, currentValue, index, array) => {
            return accumulator + currentValue;
        }));
    ```
    callback接受四个参数，累计数，当前值，序号，原数组
    返回为累计值
- filter
    过滤，不会改变原函数
    ```
        console.log('过滤掉2的倍数');
        console.log(array.filter((item) => item % 2));
        console.log('不改变原数组', array);
    ```
    返回值一个过滤后的新数组
- sort
    排序
    - 正序sort(a,b)=>a-b
    - 倒叙sort(a,b)=>b-a
## 为什么会出现这种情况？
# for in和 for of 的区别？
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

