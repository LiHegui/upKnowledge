// function Person() {
//     this.name = "Li"
// }
//
// let per = new Person()
//
// function Student() {
//     this.duty = '学习'
// }
//
// 每个函数都有一个属性叫做prototype,指向实例的原型对象,每个实例对象都会有个__proto__，指向原型对象
// 原型对象都有一个constructor对象,而实例都包含一个指向原型对象的内部指针
// 当我们当问一个对象的属性时，JS会在这个对象的属性中进行查找，如果没有找到，就会沿着__proto__这个隐式
// 原型关联起来的链条向上一个对象查找
// Student.prototype = per
// console.log(per.constructor == Student)
// let stu = new Student()
// 当试图访问一个对象的属性时，它不仅仅会在对象上找还会再对象的原型上找，层层搜索，直到找到同名属性
// + 字符串拼接
// console.log(typeof 1)
// console.log(typeof true)
// console.log(typeof [])
// console.log([] instanceof Array)
// let arr = []
// console.log(Object.prototype.toString.call(arr))

// 寄生组合式继承
function clone(parent, child) {
    // 这里改用 Object.create 就可以减少组合继承中多进行一次构造的过程
    child.prototype = Object.create(parent.prototype);
    child.prototype.constructor = child;
}

function Parent6() {
    this.name = 'parent6';
    this.play = [1, 2, 3];
}
Parent6.prototype.getName = function () {
    return this.name;
}
function Child6() {
    Parent6.call(this);
    this.friends = 'child5';
}

clone(Parent6, Child6);

Child6.prototype.getFriends = function () {
    return this.friends;
}

let person6 = new Child6();
console.log(person6); //{friends:"child5",name:"child5",play:[1,2,3],__proto__:Parent6}
console.log(person6.getName()); // parent6
console.log(person6.getFriends()); // child5