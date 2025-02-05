// 实现一个new关键字
function myNew(Func, ...args) {
    // 创建一个对象,
    const obj = Object.create(Func.prototype)
    let result = Func.apply(obj, args)
    // 判断Func的返回值情况,Func有返回值的话判断返回值是否是一个对象，是否有返回值
    return result instanceof Object ? result : obj
}
// 实现bind关键字
Function.prototype.myBind = function (thisArg, ...args) {
    var fn = this;
    return function (...innerArgs) {
        return fn.apply(thisArg, [...args, ...innerArgs]);
    };
};
