let array = [12, 2, 3, 5, 6, 7, 8]
console.log('push返回数组长度：', array.push(1));
console.log('pop返回数组尾部弹出元素', array.pop());
console.log('shift返回头部弹出元素', array.shift());
console.log('unshift返回数组长度', array.unshift(100));
// splice
console.log();
// reduce
console.log(array.reduce((accumulator, currentValue, index, array) => {
    return accumulator + currentValue;
}));
// filter
console.log('过滤掉2的倍数');
console.log(array.filter((item) => item % 2));
console.log('不改变原数组', array);