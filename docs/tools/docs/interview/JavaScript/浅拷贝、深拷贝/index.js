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
let temp = {
    name: 'ceshi2',
    person: {
        age: 19,
        point: "110"
    }
}
let temp2 = kaoBei(temp)
temp2.name = 'asgdhasgdiuyg'
temp2.person.age = 13
console.log(temp)
console.log(temp2)

//深拷贝
function deepClone(obj, hash = new WeakMap()) {//引入weakmap是用于存储拷贝过的对象及其对应的拷贝对象，避免循环引用导致无限递归
    if (obj === null) return obj; // 如果是null或者undefined我就不进行拷贝操作
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof RegExp) return new RegExp(obj);
    // 可能是对象或者普通的值  如果是函数的话是不需要深拷贝
    if (typeof obj !== "object") return obj;
    // 是对象的话就要进行深拷贝
    if (hash.get(obj)) return hash.get(obj);
    let cloneObj = new obj.constructor();
    // 找到的是所属类原型上的constructor,而原型上的 constructor指向的是当前类本身
    hash.set(obj, cloneObj);
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            // 实现一个递归拷贝
            cloneObj[key] = deepClone(obj[key], hash);
        }
    }
    return cloneObj;
}
let temp0 = {
    name: 'ceshi2',
    person: {
        age: 19,
        point: "110"
    }
}
let temp02 = deepClone(temp0)
temp02.name = 'asgdhasgdiuyg'
temp02.person.age = 13
console.log(temp0)
console.log(temp02)