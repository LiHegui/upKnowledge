# Promise
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
# 代码实现Promise
详细见Promise文件
# 手撕promise.all
我们在Promise基础之上进行实现all方法
整体思路就是Promise.all的特征就是接受一组Promise,输出结果为这一组的结果
