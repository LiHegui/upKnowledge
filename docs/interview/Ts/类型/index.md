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

## 非空断言与可选链

**非空断言 `!`**：告诉 TypeScript "此处一定不为 null/undefined"（编译期，无运行时检查）：

```typescript
const el = document.getElementById('app')!  // 断言不为 null
el.innerHTML = 'hello'

// 建议：优先使用类型守卫或可选链代替
const el2 = document.getElementById('app')
if (el2) el2.innerHTML = 'hello'  // 更安全
```

**可选链 `?.`** 与 **空值合并 `??`**：

```typescript
const user = { profile: { name: 'Alice' } } as any

// 可选链：避免 Cannot read property of null 报错
const name = user?.profile?.name          // 'Alice' 或 undefined

// 空值合并：只对 null/undefined 提供默认值（不对 0、''、false 生效）
const display = name ?? '匿名'             // 'Alice'（有值则用原值）

// 与 || 的区别
const v1 = 0 || '默认'   // '默认'（0 被视为 falsy）
const v2 = 0 ?? '默认'   // 0（0 不是 null/undefined）
```