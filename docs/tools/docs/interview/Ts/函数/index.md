# 说说你对 TypeScript 中函数的理解？与 JavaScript 函数的区别？
- 可选参数：当函数的参数可以不存在时，只需要在参数后面加上？代表参数可能不存在
- 剩余类型：剩余参数和js语法类似，需要用...来表示剩余参数
- 函数重载：关于函数重载，必须把精确的定义放在前面，最后函数实现时，需要使用|操作符或者？，把所有可能的输入类型全部包含进去，用于具体实现。函数重载也只是多个函数的声明，具体的逻辑还需要自己去写，ts并不会真的将你的多个真名function的函数体进行合并。
    // 上边是声明
    function add (arg1: string, arg2: string): string
    function add (arg1: number, arg2: number): number
    // 因为我们在下边有具体函数的实现，所以这里并不需要添加 declare 关键字

    // 下边是实现
    function add (arg1: string | number, arg2: string | number) {
    // 在实现上我们要注意严格判断两个参数的类型是否相等，而不能简单的写一个 arg1 + arg2
    if (typeof arg1 === 'string' && typeof arg2 === 'string') {
        return arg1 + arg2
    } else if (typeof arg1 === 'number' && typeof arg2 === 'number') {
        return arg1 + arg2
    }
    }

区别：
- 从定义的方式而言，ts声明函数需要定义参数类型或者声明返回值的类型
- ts的参数中，添加可选参数供使用者选择
- ts增添函数重载功能，使用者只需要通过查看函数声明的方式，就可以知道函数传递的参数个数以及类型