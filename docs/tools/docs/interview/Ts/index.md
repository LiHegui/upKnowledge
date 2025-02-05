# TypeScript面试题

## 说说你对 TypeScript 的理解？与 JavaScript 的区别？

- 类型检查
    
- 类型推断
    ts 中没有批注变量类型会自动推断变量的类型
- 接口
- 枚举
- Mixin

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
## 说说你对 TypeScript 中枚举类型的理解？应用场景？
## 说说你对 TypeScript 中接口的理解？应用场景

接口是一系列抽象方法的声明，这些方法都是抽象的，需要具体的类去实现。

```typescript
interface Person {
  name: string,
  age?: number,
  readonly gender: string,
  [propsName:string]: any
}
```

接口继承 extends 继承多个，逗号隔开

## 说说你对 TypeScript 中类的理解？应用场景？

- 字段 ： 字段是类里面声明的变量。字段表示对象的有关数据。
    **直接声明和在构造函数里面声明变量的区别**
    初始化时机：直接写属性的值在类定义时就会初始化，而构造函数中写属性的值将在每次创建类的实例时初始化。
    共享性：直接写属性的值在所有实例之间共享，而构造函数中写属性的值是每个实例独立的。
    访问权限：直接写属性的值是公共的，可以从实例或类的任何地方访问。而构造函数中写属性的值可以使用 this 关键字限定为实例的私有属性。
- 构造函数： 类实例化时调用，可以为类的对象分配内存。
- 方法： 方法为对象要执行的操作
- 方法关键字
  - public: 公共成员可以从类的任何位置访问，包括类的外部。
  - private: 私有成员只能从类的内部访问，不能从类的外部直接访问。
  - protected: 保护成员可以从类的内部和派生自该类的子类中访问。

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

## keyof如何使用？
首先keyof是用来获取一个类型的所有键的联合类型
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