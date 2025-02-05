// 直接运行即可
// bind、call、apply 区别？如何实现一个bind?
// apply
(function(){
    console.log('-----------apply')
    let obj = {
        name:"李四"
    }
    this.name = '默认名称-王xx'
    function fun(...params){
        console.log(this.name)
    }
    fun.apply(obj,[1,2,3,4])
    fun()
})();
// call
(function (){
    console.log('-----------call')
    let obj = {
        name:"李四"
    }
    this.name = '默认名称-王xx'
    function fun(...params){
        console.log(this.name)
    }
    fun.call(obj,1,2,3,4)
    fun()
})();
// bind
(function (){
    console.log('-----------bind')
    let obj = {
        name:"李四"
    }
    this.name = '默认名称-王xx'
    function fun(...params){
        console.log(this.name)
    }
    const newFun = fun.bind(obj,[1,2,3,4])
    newFun()
    fun()
})()
// 实现一个bind
console.log('-------实现一个bind')

Function.prototype.myBind = function (context) {
    // 判断调用对象是否为函数
    if (typeof this !== "function") {
        throw new TypeError("Error");
    }
    // 获取参数
    const args = [...arguments].slice(1),
        fn = this;
    // 利用闭包，把 args 和 this 都存起来
    return function Fn() {
        // 根据调用方式，传入不同绑定值
        //
        return fn.apply(this instanceof Fn ? new fn(...arguments) : context, args.concat(...arguments));
    }
}
let a = {
    name: "lihegui"
}
function fun(...value) {
    console.log(this.name, value);
}
fun = fun.myBind(a, 1, 2, 3)
fun()
