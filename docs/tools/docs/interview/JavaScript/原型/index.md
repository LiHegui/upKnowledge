# Javascript原型面试题
## JavaScript原型，原型链 ? 有什么特点？

每个函数都有一个属性叫做prototype,指向实例的原型对象,每个实例对象都会有个__proto__指向原型对象
原型对象都有一个constructor对象,指向构造函数。
当我们当问一个对象的属性时，JS会在这个对象的属性中进行查找，如果没有找到，就会沿着__proto__这个隐式
原型关联起来的链条向上一个对象查找

## 原型链

原型对象也可能拥有原型，并从中继承方法和属性，一层一层、以此类推。这种关系常被称为原型链 (prototype chain)，它解释了为何一个对象会拥有定义在其他对象中的属性和方法
直到Object.prototype为{}空对象，但不是null

## Javascript如何实现继承？
- 原型链继承
    直接进行原型指向，函数的原型prototype是另一个函数的实例
    - 缺点
        造成实例的原型共享，会造成污染
    ```javascript
    function Parent() {
        this.name = 'parent1';
        this.play = [1, 2, 3]
    }
    function Child() {
        this.type = 'child2';
    }
    Child1.prototype = new Parent();
    console.log(new Child())
    ```
- 寄生组合式继承 只记这一种就行
    ```javascript
        function clone (parent, child) {
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
    ```
## 谈谈this对象的理解
函数的this关键字在JavaScript中的表现略有不同，在严格模式和非严格模式之间也会有一些差别
通过构造函数 new关键字来生成一个实例对象，此时this指向这个实例对象
默认绑定，加入全局作用域下，声明一个函数，函数内部调输出this，指向该函数，可以看出this指向window
隐式绑定 声明一个函数，该函数作为另一个对象的属性，则该函数中this指向该对象
显示绑定 apply call bind


## JavaScript中执行上下文和执行栈是什么？


