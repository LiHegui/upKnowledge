# TypeScript面试题

## 说说你对 TypeScript 的理解？与 JavaScript 的区别？


TypeScript 是 JavaScript 的类型的超集，支持ES6语法，支持面向对象编程的概念，如类、接口、继承、泛型等。


其是一种静态类型检查的语言，提供了类型注解，在代码编译阶段就可以检查出来数据类型的错误。

**特性：**

1. 类型批注和编译时类型检查 ：在编译时批注变量类型
2. 类型推断：ts 中没有批注变量类型会自动推断变量的类型
3. 类型擦除：在编译过程中批注的内容和接口会在运行时利用工具擦除 <span style="color: red;">(在 TypeScript 中，类型擦除指的是在编译过程中，类型批注和接口等类型信息会被移除，不会出现在生成的 JavaScript 代码中。这是因为 JavaScript 是动态类型语言，运行时不需要这些类型信息)</span>
4. 接口：ts 中用接口来定义对象类型
5. 枚举：用于取值被限定在一定范围内的场景
6. Mixin：可以接受任意类型的值
7. 泛型编程：写代码时使用一些以后才指定的类型
8. 名字空间：名字只在该区域内有效，其他区域可重复使用该名字而不冲突
9. 元组：元组合并了不同类型的对象，相当于一个可以装不同类型数据的数组

## 说说 typescript 的数据类型有哪些？

除JavaScript类型之外

- 枚举
- void
- never
- 元组tuple
    允许一个已知的数据
    ```javascript
      let tupleArr:[number, string, boolean];
      tupleArr = [12, '34', true]; //ok
      typleArr = [12, '34'] // no ok
    ```
1. boolean

2. number
3. string
4. array
5. tuple
6. enum
7. any
8. null
9.  void
10. never
11. object 
## 说说你对 TypeScript 中枚举类型的理解？应用场景？



## 说说你对 TypeScript 中接口的理解？应用场景

接口是一系列抽象方法的声明，这些方法都是抽象的，需要具体的类去实现。

简单来讲，一个接口所描述的是一个对象相关的属性和方法，但并不提供具体创建此对象实例的方法

定义一个对象，属性及其方法，只负责描述，不负责具体实现

```typescript
interface Person {
  name: string,
  age?: number,
  readonly gender: string,
  [propsName:string]: any
}
```

接口继承 extends 继承多个，逗号隔开

```js
interface Father {
    color: String
}
interface Mother {
    height: Number
}
interface Son extends Father,Mother{
    name: string
    age: Number
}
```

## 说说你对 TypeScript 中类的理解？应用场景？

- 字段 ： 字段是类里面声明的变量。字段表示对象的有关数据。
    **直接声明和在构造函数里面声明变量的区别**
    初始化时机：直接写属性的值在类定义时就会初始化，而构造函数中写属性的值将在每次创建类的实例时初始化。
    共享性：直接写属性的值在所有实例之间共享，而构造函数中写属性的值是每个实例独立的。
    访问权限：直接写属性的值是公共的，可以从实例或类的任何地方访问。而构造函数中写属性的值可以使用 this 关键字限定为实例的私有属性。
- 构造函数： 类实例化时调用，可以为类的对象分配内存。
- 方法： 方法为对象要执行的操作
- 关键字
  - public: 公共成员可以从类的任何位置访问，包括类的外部。
  - private: 私有成员只能从类的内部访问，不能从类的外部直接访问。
  - protected: 保护成员可以从类的内部和派生自该类的子类中访问。
  - static 静态属性
  - readOnly 只读

类之间可以继承，可以实现接口`interface`

## 说说你对 TypeScript 中泛型的理解？应用场景？

泛型程序设计是程序设计语言的一种风格和范式

泛型允许我们在强类型程序设计语言中编写代码时使用一些以后才指定的类型

```typescript
function returnItem<T>(para: T): T {
  return para
}
```

复用性很高
- 泛型约束
  - 多类型（继承接口interface）

## `keyof`如何使用？
首先`keyof`是用来获取一个类型的所有键的联合类型
```typescript
interface Person {
    name: string；
    age: number;
    gender: string;
}
type PerosonType = keyof Perosn; 
```
上面的PerosonType相当于 "name"|"age"|"gender"

keyof操作符常用于获取类型中的属性名，例如可以使用它来获取对象的属性值：

```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K) {
  return obj[key];
}
let person = { name: "Alice", age: 30 };
let name = getProperty(person, "name"); // 等同于 person.name
let age = getProperty(person, "age"); // 等同于 person.age
```
上面的keyof T为 'name'|'age'|'gender',保证了属性必须是其中的一中，也就是只能是这三个值
在编程中，Interface 和 Type 都是用来定义和描述数据结构的。但是它们的用法和语法有所不同。
## Interface和type的区别
Interface 是一种抽象的数据类型，它定义了一组方法和属性的契约，以描述一个对象应该具有的行为。在 TypeScript 中，Interface 可以用来描述对象的形状，或者是类的实现。Interface 声明了对象应该具有哪些方法和属性，但并不提供具体的实现代码。

Type 是一个类型别名，它是对某个类型的另一个名称。Type 可以用来定义基本类型、联合类型、元组类型、对象类型等等。Type 可以为类型命名，这样可以提高代码的可读性和可维护性。Type 可以将一个复杂的类型定义为一个简单易懂的名称，从而简化代码。

在 TypeScript 中，Interface 和 Type 有许多相似之处，但是也有一些区别。Interface 可以被扩展，而 Type 不能。Interface 可以描述某个类的实现，而 Type 不能。Type 可以定义联合类型和交叉类型，而 Interface 不能。因此，在使用时需要根据具体的情况选择合适的方式来定义数据结构。

## ts装饰器

TypeScript装饰器是一种特殊类型的声明，可以用来给类、方法、属性等元素添加额外的元数据。装饰器以@符号开始，后面跟着一个装饰器工厂函数。

```typescript
function MyDecorator(target: any) {
  console.log("MyDecorator was called");
}

@MyDecorator
class MyClass {
  // 类定义
}
```
类的装饰器可以装饰：
- 类
    
- 方法/属性
- 参数
- 访问器

## 命名空间