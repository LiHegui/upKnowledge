# 必须会的算法

## 如何实现一个栈？
见Stack.js
## 排序
## 冒泡排序
见sort.js
## 快速排序
```javascript
function sort (arr){
    let {length} = arr;
    let temp = arr[0]
    for(let i=0;i<;)
}
```
## 递归转成非递归用什么方式？
递归转成非递归算法通常使用堆栈数据结构。
递归的调用可以看作是将函数的参数和局部变量压入堆栈数据结构中。
然后再从堆栈数据结构中去弹出这些参数和变量并执行函数体。
因此，我们可以使用一个显示的堆栈来模拟这个过程。
我们可以举个例子
## 斐波那契数列
```javascript
function fun (n){
    if(n<=1){
        return n;
    }else {
        return fun(n-1)+fun(n-2)
    }
}
```
换用栈来做
```javascript
function fibonacci(n) {
  var stack = [];
  stack.push(n);
  var result = 0;
  while (stack.length > 0) {
    var current = stack.pop();
    if (current <= 1) {
      result += current;
    } else {
      stack.push(current-1);
      stack.push(current-2);
    }
  }
  return result;
}
```
