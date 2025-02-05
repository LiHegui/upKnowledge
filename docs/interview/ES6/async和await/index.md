## 什么是async await?
*  async/await是ES2017（ECMAScript 7）引入的，是一种用于简化JavaScript中异步编程的语法。是基于Promise的语法糖，提供了一种更方便、更易理解的方式来处理异步操作。
* async是一个放在函数声明前的关键字，表示该函数是一个异步函数。这个函数总是返回一个Promise。如果函数内部返回了一个非Promise值，async函数会自动把这个值用Promise.resolve()封装成一个解决（resolved）状态的Promise。
* async是一个放在函数声明前的关键字，表示该函数是一个异步函数。这个函数总是返回一个Promise。如果函数内部返回了一个非Promise值，async函数会自动把这个值用Promise.resolve()封装成一个解决（resolved）状态的Promise。
* async/await能够使用传统的try/catch结构来捕获异常，这使得异步代码的错误处理更加直观和方便。
* 代码可读性提高，更接近同步代码的书写方式。减少了使用.then和.catch链式调用的复杂性并避免了"回调地狱"。
* 最后可以再补充一下在项目中的使用
## 一次性发送多个请求，保证他们的顺序？
* 可以通过使用async/await在for循环中按序发送请求，并确保每个请求完成后再发送下一个请求。
```
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
```
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

## 如果是await一个非promise会发生什么
如果函数内部返回了一个非Promise值，async函数会自动把这个值用Promise.resolve()封装成一个解决（resolved）状态的Promise。