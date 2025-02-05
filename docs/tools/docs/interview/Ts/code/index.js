// function getProperty<T, K extends keyof T>(obj: T, key: K) {
//     return obj[key];
// }
// let person = { name: 'tom', age: 0 }
// console.log(typeof getProperty(person, 'name'));
var Person = /** @class */ (function () {
    function Person() {
    }
    Person.prototype.getName = function () {
        console.log('====================================');
        console.log('Tom');
        console.log('====================================');
    };
    Person.getGender = function () {
        console.log('====================================');
        console.log(123);
        console.log('====================================');
    };
    return Person;
}());
var per = new Person();
per.getName();
Person.getGender();
