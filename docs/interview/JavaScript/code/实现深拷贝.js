// 浅拷贝
function kaoBei(obj) {
    const newObj = {}
    for (let prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            newObj[prop] = obj[prop]
        }
    }
    return newObj
}
// let temp = {
//     name: 'ceshi2',
//     person: {
//         age: 19,
//         point: "110"
//     }
// }
// let temp2 = kaoBei(temp)
// temp2.name = 'asgdhasgdiuyg'
// temp2.person.age = 13
// console.log(temp)
// console.log(temp2)

//深拷贝
function deepClone(obj, hash = new WeakMap()) {//引入weakmap是用于存储拷贝过的对象及其对应的拷贝对象，避免循环引用导致无限递归
    if (obj === null) return obj; // 如果是null或者undefined我就不进行拷贝操作
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof RegExp) return new RegExp(obj);
    // 可能是对象或者普通的值  如果是函数的话是不需要深拷贝
    if (typeof obj !== "object") return obj;
    // 检查是否已经克隆过该对象，防止循环引用
    if (hash.get(obj)) return hash.get(obj);
    let cloneObj = new obj.constructor(); // obj/.__proto__.constructor()
    // 找到的是所属类原型上的constructor,而原型上的 constructor指向的是当前类本身
    hash.set(obj, cloneObj);
    // for in 只能遍历对象上可枚举的string类型属性，采用Reflect.ownKeys比较好
    const keys = Reflect.ownKeys(obj);
    for (let key of keys) {
        cloneObj[key] = deepClone(obj[key], hash);
    }
    
    // 处理symbols
    const symbols = Object.getOwnPropertySymbols(obj);
    for (let key_symbols of symbols) {
        obj[key_symbols] = deepClone(obj[key_symbols])
    }
    return cloneObj;
}
// let temp0 = {
//     name: 'ceshi2',
//     person: {
//         age: 19,
//         point: "110"
//     }
// }
// let temp02 = deepClone(temp0)
// temp02.name = 'asgdhasgdiuyg'
// temp02.person.age = 18
// console.log(temp0)
// console.log(temp02)