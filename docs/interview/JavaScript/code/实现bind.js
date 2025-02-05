/**
 * 实现一个bind
 * @param {*} context 
 */
Function.prototype.myBind = function (context) {
    // 判断调用对象是否为函数
    if (typeof this !== "function") {
        throw new TypeError("Error");
    }
    const args = [...arguments].slice(1),
        fn = this;
    return function Fn() {
        // 根据调用方式，传入不同绑定值
        // 就是防止生成的函数，被当作构造函数用
        return fn.apply(this instanceof Fn ? new fn(...arguments) : context, args.concat(...arguments));
    }
}



function fn(...args) {
    console.log(this, args);
}
const obj = {
    name: "张三"
}
const temp_fn = fn.myBind(obj, 1, 2, 3)
temp_fn(4, 5, 6)
fn(1, 2, 3)
// const temp = new temp_fn()