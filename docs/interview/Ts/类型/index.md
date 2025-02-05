# 说说 typescript 的数据类型有哪些？
- number
- string
- boolean
- any
- enum
- array
- tuple
- null和undefined
- void
- never
- object
# ts元组和对象的区别 
- tuple
    元组是一个固定长度的数组，其中每个元素都可以是不同类型，可以通过索引来访问元素。
    ```typescript
    let myTuple: [string, number, boolean] = ["hello", 123, true];
    console.log(myTuple[0]); // 输出 "hello"
    console.log(myTuple[1]); // 输出 123
    console.log(myTuple[2]); // 输出 true
    function getPerson(): [string, number] {
        return ["Alice", 30];
    }
    let person: [string, number] = getPerson();
    console.log(person[0]); // 输出 "Alice"
    console.log(person[1]); // 输出 30
    ```
- object
    对象的话，它的值是key,value类型，可以通过属性名来访问

    
# type定义类型
type是用来定义类型别名和联合类型的关键字
```typescript
type TypeName = TypeExpression;
type MyString = string;
// 定义联合类型
type UnionType = Type1|Type2|Type3;
```
type定义函数
```typescript
type TypeFun = {
    (a:number):number
};
```
或者简短一些
```typescript
type TypeFun = (a:number)=>number
```
# 定义一个变量值是nan，ts会推断出什么类型
NaN是number类型有一个特殊值，可是使用isNaN()函数判断一个值是否为NaN
# 断言经常在什么场景?
## 类型断言
类型断言好比其它语言的类型转换，但是不进行特殊的数据检查和结构。它只对编译产生影响。
有两种形式
一种是尖括号的形式
```typescript
let strLength:number = (<string>someValue).length;
```
一种是as
```typescript
let strLength:number = (someValue as string).length;
```
##