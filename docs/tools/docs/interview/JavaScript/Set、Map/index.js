// const arr = [1,2,3,4,5,67,87,3,2,1]
// let set = new Set([...arr])
// let temp = set.keys()
// for(let item of temp){
//     // console.log(item)
// }
// console.log(set.size)
// console.log(temp)
// WeakMap
/**
 * WeakSet的成员只能是引用类型，如果内部成员不在被外部引用
 * 就会被垃圾回收
 */

// const ws =new WeakSet([[1,2],[3,4]])
/**
 * api
 * 没有size属性
 * 没有遍历操作的api
 */
let obj = {
    name:'lihegui'
}
let set = new WeakSet()
set.add(obj)
obj = null
console.log(set.has(obj)) // false
console.log(set)

