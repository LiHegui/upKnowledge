// function getProperty<T, K extends keyof T>(obj: T, key: K) {
//     return obj[key];
// }
// let person = { name: 'tom', age: 0 }
// console.log(typeof getProperty(person, 'name'));
var a1 = true;
var a2 = [1];
var a3 = ['1', 2];
var A4;
(function (A4) {
    A4[A4["top"] = 1] = "top";
    A4["left"] = "123";
    A4[A4["bottom"] = void 0] = "bottom";
    A4[A4["right"] = void 0] = "right";
})(A4 || (A4 = {}));
var a5 = A4.top;
var a6 = function () {
    console.log('无返回值');
};
console.log(A4.right);
