// 节流
function throttle(callback, delay) {
    let lastTime = 0;
    return function () {
        let currentTime = Date.now()
        if ((currentTime - lastTime) > delay) {  // 关键就是比较当前时间与上次触发时间相差是否超过delay
            callback().apply(this, arguments);
            lastTime = currentTime;
        }
    }
}
// 防抖
function debounce(callback, delay) {
    let timer = null;
    return function () {
        clearTimeout(timer)
        timer = setTimeout(() => {       // 关键是每次点击需要清空上次的timer定时器，然后重新生成定时任务，如果再次点击
            callback.apply(this, arguments) // 就会清空上次的定时任务，再次重新生成，如果不点击，自然而然会执行。
        }, delay)
    }
}








// 节流

function fn1(callback, delay) {
    let lastTime = 0
    return function () {
        let now = Date.now()
        if ((now - lastTime) > delay) {
            callback.apply(this, arguments)
            lastTime = now
        }
    }
}

// 防抖
function fn2(callback, delay) {
    let timer = null
    return function () {
        clearTimeout(timer)
        timer = setTimeout(() => {       // 关键是每次点击需要清空上次的timer定时器，然后重新生成定时任务，如果再次点击
            callback.apply(this, arguments) // 就会清空上次的定时任务，再次重新生成，如果不点击，自然而然会执行。
        }, delay)
    }
}