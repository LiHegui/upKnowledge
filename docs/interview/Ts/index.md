# TypeScript 面试题

> 涵盖 TypeScript 核心考点：类型系统、泛型、工具类型、类与接口、装饰器、工程实践，从基础到进阶全覆盖。

---

## 基础认知篇

## Q: TypeScript 是什么？与 JavaScript 有何区别？

**A:**

**TypeScript** 是 JavaScript 的**类型超集**，由微软开发。它在 JS 基础上添加了静态类型系统，最终编译为纯 JavaScript 运行。

### 核心差异对比

| 维度 | JavaScript | TypeScript |
|------|-----------|-----------|
| 类型系统 | 动态类型，运行时确定 | 静态类型，编译期检查 |
| 错误发现 | 运行时报错 | 编译时报错 ✅ |
| IDE 支持 | 基础提示 | 完整智能提示、重构 ✅ |
| 学习成本 | 低 | 中（需掌握类型语法） |
| 适用场景 | 小型脚本、快速原型 | 中大型项目、团队协作 |

### TypeScript 核心特性

1. **类型注解**：显式声明变量/参数/返回值类型
2. **类型推断**：未注解时自动推断类型，无需每处都写
3. **类型擦除**：编译产物是纯 JS，类型信息在运行时不存在
4. **接口 / 类型别名**：描述对象结构
5. **泛型**：编写类型安全的通用代码
6. **枚举**：定义有限值域
7. **装饰器**：元数据注解（class/method/property）
8. **命名空间 & 模块**：代码组织与作用域隔离

```ts
// JS：运行时才报错
function add(a, b) { return a + b }
add(1, '2') // => '12'（隐式转换，无警告）

// TS：编译时捕获错误
function add(a: number, b: number): number { return a + b }
add(1, '2') // ❌ Argument of type 'string' is not assignable to parameter of type 'number'
```

---

## Q: TypeScript 有哪些数据类型？

**A:**

### JS 原有类型（TS 完全兼容）

`boolean` / `number` / `string` / `null` / `undefined` / `symbol` / `bigint` / `object`

### TS 新增类型

| 类型 | 说明 | 示例 |
|------|------|------|
| `any` | 跳过类型检查，任意类型 | `let x: any = 1; x = 'str'` |
| `unknown` | 安全的 any，使用前必须类型收窄 | `let x: unknown` |
| `void` | 函数无返回值 | `function log(): void {}` |
| `never` | 永不到达的类型（抛错/死循环） | `function throws(): never { throw new Error() }` |
| `tuple` | 固定长度、固定类型的数组 | `let t: [string, number] = ['a', 1]` |
| `enum` | 枚举，取值限定在固定范围 | `enum Direction { Up, Down }` |

```ts
// 元组：长度和类型都固定
let tuple: [number, string, boolean]
tuple = [1, 'hello', true]  // ✅
tuple = [1, 'hello']        // ❌ 缺少第三个元素

// never：穷举检查
type Shape = 'circle' | 'square'
function check(s: Shape) {
  if (s === 'circle') return
  if (s === 'square') return
  const _exhaustive: never = s // 若新增类型未处理，这里报错 ✅
}
```

---

## Q: any、unknown、never、void 有什么区别？

**A:**

| 类型 | 含义 | 能赋值给其他类型？ | 使用前需检查？ |
|------|------|-----------------|-------------|
| `any` | 关闭类型检查 | ✅ 可以 | ❌ 不需要 |
| `unknown` | 类型未知，安全版 any | ❌ 不可以（需收窄） | ✅ 需要 |
| `void` | 函数无有意义的返回值 | ❌ | — |
| `never` | 不可能存在的类型 | ✅ 可赋值给任何类型 | — |

```ts
// any：危险，绕过所有检查
let a: any = 'hello'
a.toFixed(2) // 运行时报错，编译期不报 ❌

// unknown：安全，使用前必须收窄
let u: unknown = 'hello'
u.toUpperCase()       // ❌ 编译报错
if (typeof u === 'string') {
  u.toUpperCase()     // ✅ 收窄后可用
}

// never：常见于穷举检查和不可达分支
function fail(msg: string): never {
  throw new Error(msg)
}
```

> ⚠️ **注意**：在业务代码中应尽量避免用 `any`，优先用 `unknown` + 类型收窄，保持类型安全。

---

## 类型系统篇

## Q: interface 和 type 有什么区别？如何选择？

**A:**

| 能力 | `interface` | `type` |
|------|-------------|--------|
| 描述对象结构 | ✅ | ✅ |
| 描述函数类型 | ✅ | ✅ |
| 联合类型 | ❌ | ✅ `type A = B \| C` |
| 交叉类型 | ❌ | ✅ `type A = B & C` |
| 声明合并（重复声明叠加） | ✅ | ❌ 报错 |
| 继承语法 | `extends` | 用 `&` 交叉 |
| 实现接口（`implements`） | ✅ | ✅（对象类型） |
| 映射类型 | ❌ | ✅ |

```ts
// interface：声明合并（同名自动合并）
interface User { name: string }
interface User { age: number }
// 等价于 { name: string; age: number } ✅

// type：联合 & 交叉
type ID = string | number           // 联合类型
type Admin = User & { role: string } // 交叉类型

// 继承对比
interface A extends B { }           // interface 继承
type C = B & { extra: string }      // type 交叉实现继承
```

**选择建议：**
- 描述**对象/类结构**，优先 `interface`（可扩展、声明合并）
- 需要**联合类型、映射类型、条件类型**，用 `type`
- 公共库 API 用 `interface`，方便使用者扩展

---

## Q: 联合类型和交叉类型的区别？

**A:**

- **联合类型（Union）`A | B`**：值是 A **或** B 之一，只能访问两者的**公共成员**
- **交叉类型（Intersection）`A & B`**：值同时满足 A **和** B，拥有两者的**全部成员**

```ts
type Cat = { name: string; meow(): void }
type Dog = { name: string; bark(): void }

// 联合类型：是猫或狗
type Pet = Cat | Dog
declare const pet: Pet
pet.name    // ✅ 公共属性
pet.meow()  // ❌ 不确定是猫，需要类型守卫

// 交叉类型：同时具备猫和狗的特征
type CatDog = Cat & Dog
declare const cd: CatDog
cd.meow()   // ✅
cd.bark()   // ✅
```

---

## Q: 类型守卫有哪些方式？

**A:**

类型守卫（Type Guard）用于在联合类型中**收窄**到具体类型，让 TS 知道当前分支的类型。

### 四种方式

**1. `typeof`**（适合原始类型）
```ts
function print(val: string | number) {
  if (typeof val === 'string') {
    console.log(val.toUpperCase()) // val: string
  }
}
```

**2. `instanceof`**（适合类实例）
```ts
function handle(err: Error | TypeError) {
  if (err instanceof TypeError) {
    // err: TypeError
  }
}
```

**3. `in` 操作符**（适合对象结构）
```ts
type Fish = { swim(): void }
type Bird = { fly(): void }
function move(animal: Fish | Bird) {
  if ('swim' in animal) {
    animal.swim() // animal: Fish
  }
}
```

**4. 自定义类型谓词 `is`**（最灵活）
```ts
function isString(val: unknown): val is string {
  return typeof val === 'string'
}

if (isString(input)) {
  input.toUpperCase() // ✅ input: string
}
```

---

## Q: keyof、typeof、in、infer 分别怎么用？

**A:**

### `keyof` — 获取类型的键联合

```ts
interface Person { name: string; age: number }
type Keys = keyof Person  // 'name' | 'age'

// 经典用法：安全取属性
function get<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}
get({ name: 'Alice', age: 18 }, 'name') // ✅ 返回 string
```

### `typeof` — 获取变量/函数的类型

```ts
const config = { host: 'localhost', port: 3000 }
type Config = typeof config  // { host: string; port: number }

function greet(name: string) { return `Hello ${name}` }
type Greet = typeof greet    // (name: string) => string
```

### `in` — 遍历联合类型（映射类型）

```ts
type Readonly<T> = {
  readonly [K in keyof T]: T[K]  // 遍历 T 的每个键
}
type ReadonlyPerson = Readonly<Person>
// { readonly name: string; readonly age: number }
```

### `infer` — 在条件类型中推断类型

```ts
// 提取函数返回类型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never

type R = ReturnType<() => string>  // string

// 提取 Promise 内部类型
type Awaited<T> = T extends Promise<infer U> ? U : T
type A = Awaited<Promise<number>>  // number
```

---

## Q: 什么是条件类型？

**A:**

条件类型形如 `T extends U ? X : Y`，根据类型关系选择不同的类型，类似三元表达式。

```ts
// 基础用法
type IsString<T> = T extends string ? 'yes' : 'no'
type A = IsString<string>  // 'yes'
type B = IsString<number>  // 'no'

// 分布式条件类型（T 为联合类型时逐一分发）
type ToArray<T> = T extends any ? T[] : never
type C = ToArray<string | number>  // string[] | number[]

// 过滤联合类型中的 null/undefined
type NonNullable<T> = T extends null | undefined ? never : T
type D = NonNullable<string | null | undefined>  // string
```

> ⚠️ **注意**：条件类型中 `infer` 只能在 `extends` 子句的右侧使用，不能在其他位置推断。

---

## 泛型篇

## Q: 泛型是什么？有哪些常见用法？

**A:**

**泛型**（Generics）允许在定义函数、类、接口时使用**占位类型参数**，调用时再传入具体类型，实现类型安全的复用。

```ts
// 不用泛型：要么用 any 失去类型，要么重复写多个函数
function identity(arg: any): any { return arg }

// 用泛型：调用时类型自动推断
function identity<T>(arg: T): T { return arg }
const str = identity('hello')  // T 推断为 string ✅
const num = identity(42)       // T 推断为 number ✅
```

### 常见用法

**泛型接口**
```ts
interface ApiResponse<T> {
  code: number
  data: T
  message: string
}
type UserResponse = ApiResponse<{ name: string; age: number }>
```

**泛型类**
```ts
class Stack<T> {
  private items: T[] = []
  push(item: T) { this.items.push(item) }
  pop(): T | undefined { return this.items.pop() }
}
const stack = new Stack<number>()
stack.push(1)
```

**泛型约束（`extends`）**
```ts
// 约束 T 必须有 length 属性
function getLength<T extends { length: number }>(arg: T): number {
  return arg.length
}
getLength('hello')   // ✅
getLength([1, 2, 3]) // ✅
getLength(42)        // ❌ number 没有 length
```

---

## Q: TypeScript 内置工具类型有哪些？

**A:**

TS 提供了一批开箱即用的**泛型工具类型**，面试高频考点：

### 属性修饰类

| 工具类型 | 作用 | 示例 |
|---------|------|------|
| `Partial<T>` | 所有属性变为可选 | `Partial<User>` |
| `Required<T>` | 所有属性变为必选 | `Required<User>` |
| `Readonly<T>` | 所有属性变为只读 | `Readonly<User>` |

### 属性筛选类

| 工具类型 | 作用 | 示例 |
|---------|------|------|
| `Pick<T, K>` | 从 T 中选取指定属性 K | `Pick<User, 'name' \| 'age'>` |
| `Omit<T, K>` | 从 T 中排除属性 K | `Omit<User, 'password'>` |
| `Record<K, V>` | 构造键为 K、值为 V 的对象类型 | `Record<string, number>` |

### 类型提取类

| 工具类型 | 作用 | 示例 |
|---------|------|------|
| `ReturnType<T>` | 提取函数返回类型 | `ReturnType<typeof fn>` |
| `Parameters<T>` | 提取函数参数类型元组 | `Parameters<typeof fn>` |
| `InstanceType<T>` | 提取构造函数实例类型 | `InstanceType<typeof MyClass>` |
| `Awaited<T>` | 提取 Promise resolve 的类型 | `Awaited<Promise<string>>` → `string` |

### 联合类型操作

| 工具类型 | 作用 |
|---------|------|
| `Exclude<T, U>` | 从 T 中排除可赋值给 U 的类型 |
| `Extract<T, U>` | 提取 T 中可赋值给 U 的类型 |
| `NonNullable<T>` | 从 T 中排除 null 和 undefined |

```ts
type User = { name: string; age: number; password: string }

type PublicUser = Omit<User, 'password'>
// { name: string; age: number }

type PartialUser = Partial<User>
// { name?: string; age?: number; password?: string }

type Roles = 'admin' | 'editor' | 'viewer'
type AdminOrEditor = Extract<Roles, 'admin' | 'editor'>  // 'admin' | 'editor'
type NonAdmin = Exclude<Roles, 'admin'>                  // 'editor' | 'viewer'
```

---

## 类与接口篇

## Q: TypeScript 中接口（interface）的作用和应用场景？

**A:**

**接口**描述对象的形状（属性 + 方法），只负责类型约束，不提供实现。

```ts
interface Person {
  name: string
  age?: number          // 可选属性
  readonly id: string   // 只读属性
  [key: string]: any    // 索引签名，允许额外属性
  greet(): void         // 方法声明
}
```

### 接口继承（支持多继承）

```ts
interface Animal { name: string }
interface Flyable { fly(): void }
interface Bird extends Animal, Flyable {
  wingSpan: number
}
```

### 类实现接口

```ts
interface Serializable {
  serialize(): string
  deserialize(data: string): void
}

class User implements Serializable {
  constructor(public name: string) {}
  serialize() { return JSON.stringify(this) }
  deserialize(data: string) { Object.assign(this, JSON.parse(data)) }
}
```

**应用场景：**
- 定义 API 响应数据结构
- 约束类的公共 API
- 描述函数参数对象
- 声明第三方库类型（`.d.ts`）

---

## Q: TypeScript 中类的访问修饰符有哪些？

**A:**

| 修饰符 | 类内部 | 子类 | 类外部 |
|--------|--------|------|--------|
| `public`（默认） | ✅ | ✅ | ✅ |
| `protected` | ✅ | ✅ | ❌ |
| `private` | ✅ | ❌ | ❌ |
| `#`（ES 私有字段） | ✅ | ❌ | ❌ |
| `readonly` | 只读，可与以上组合 | | |
| `static` | 属于类本身，非实例 | | |

```ts
class Animal {
  public name: string
  protected age: number
  private secret: string
  readonly species: string

  constructor(name: string, age: number) {
    this.name = name
    this.age = age
    this.secret = 'hidden'
    this.species = 'mammal'
  }
}

class Dog extends Animal {
  bark() {
    console.log(this.name)   // ✅ public
    console.log(this.age)    // ✅ protected
    console.log(this.secret) // ❌ private，无法访问
  }
}

const dog = new Dog('Rex', 3)
dog.name    // ✅
dog.age     // ❌ protected，外部无法访问
```

### 构造函数参数简写

```ts
// 直接在构造函数参数前加修饰符，自动声明并赋值属性
class User {
  constructor(
    public name: string,
    private password: string,
    readonly id: number
  ) {}
}
```

---

## Q: abstract 抽象类和 interface 接口有什么区别？

**A:**

| 维度 | `abstract class` | `interface` |
|------|-----------------|-------------|
| 能有实现代码 | ✅ 可以有具体方法 | ❌ 只有声明 |
| 构造函数 | ✅ 有 | ❌ 无 |
| 多继承 | ❌ 只能继承一个 | ✅ 可实现多个 |
| 访问修饰符 | ✅ public/protected/private | ❌ 默认 public |
| 实例化 | ❌ 不能直接 new | ❌ 不能直接 new |

```ts
abstract class Shape {
  abstract getArea(): number  // 抽象方法，子类必须实现
  
  toString() {  // 具体方法，子类继承
    return `面积：${this.getArea()}`
  }
}

class Circle extends Shape {
  constructor(private radius: number) { super() }
  getArea() { return Math.PI * this.radius ** 2 }
}
```

**选择建议：**
- 有**共享逻辑实现**时用抽象类
- 只需要**类型约束**，允许多继承时用接口

---

## 枚举与装饰器篇

## Q: TypeScript 枚举类型的理解和应用场景？

**A:**

**枚举**（Enum）用于将一组有语义的常量组织在一起，限定变量只能取这些值。

### 数字枚举（默认，从 0 自增）

```ts
enum Direction {
  Up,    // 0
  Down,  // 1
  Left,  // 2
  Right  // 3
}
console.log(Direction.Up)    // 0
console.log(Direction[0])    // 'Up'（反向映射）
```

### 字符串枚举（推荐）

```ts
enum Status {
  Pending  = 'PENDING',
  Active   = 'ACTIVE',
  Inactive = 'INACTIVE'
}
// 无反向映射，但可读性更好
```

### const 枚举（编译后内联，性能最优）

```ts
const enum Color { Red, Green, Blue }
const c = Color.Red  // 编译为：const c = 0
```

### 应用场景

```ts
// 接口状态码
enum HttpStatus {
  OK = 200,
  NotFound = 404,
  ServerError = 500
}

// 权限控制
enum Permission {
  Read  = 1 << 0,  // 1
  Write = 1 << 1,  // 2
  Admin = 1 << 2   // 4
}

function checkPermission(userPerm: number, required: Permission) {
  return (userPerm & required) !== 0
}
```

> ⚠️ **注意**：字符串枚举不支持反向映射；`const enum` 不能在非 TS 环境（如 Babel 编译）中使用。

---

## Q: TypeScript 装饰器是什么？有哪些类型？

**A:**

**装饰器**是一种特殊语法（`@expression`），用于给类、方法、属性、参数附加**元数据**或修改其行为。本质是一个函数，在声明时被执行。

> ⚠️ **注意**：需在 `tsconfig.json` 中开启 `"experimentalDecorators": true`（TS 5.0 前）。TS 5.0 支持了标准化装饰器提案。

### 装饰器类型

**1. 类装饰器**
```ts
function Sealed(constructor: Function) {
  Object.seal(constructor)
  Object.seal(constructor.prototype)
}

@Sealed
class BugReport {
  type = 'report'
  title: string
  constructor(t: string) { this.title = t }
}
```

**2. 方法装饰器**
```ts
function Log(target: any, key: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value
  descriptor.value = function(...args: any[]) {
    console.log(`调用 ${key}，参数：`, args)
    return original.apply(this, args)
  }
  return descriptor
}

class Calculator {
  @Log
  add(a: number, b: number) { return a + b }
}
```

**3. 属性装饰器**
```ts
function Required(target: any, key: string) {
  // 通常配合 Reflect.metadata 使用
  Reflect.defineMetadata('required', true, target, key)
}
```

**4. 参数装饰器**
```ts
function Validate(target: any, method: string, index: number) {
  console.log(`第 ${index} 个参数需要验证`)
}

class UserService {
  getUser(@Validate id: number) { }
}
```

**应用场景：** Angular 依赖注入、NestJS 路由、Vue Class Component、权限拦截、日志记录、数据验证。

---

## 工程实践篇

## Q: tsconfig.json 有哪些重要配置项？

**A:**

```json
{
  "compilerOptions": {
    // 编译目标
    "target": "ES2020",          // 编译输出的 JS 版本
    "module": "ESNext",          // 模块系统
    "lib": ["ES2020", "DOM"],    // 包含的类型库

    // 严格模式（强烈推荐开启）
    "strict": true,              // 开启所有严格检查
    "noImplicitAny": true,       // 禁止隐式 any
    "strictNullChecks": true,    // null/undefined 需显式处理

    // 模块解析
    "moduleResolution": "bundler",
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }, // 路径别名

    // 输出
    "outDir": "./dist",
    "declaration": true,         // 生成 .d.ts 声明文件
    "sourceMap": true,           // 生成 source map

    // 其他
    "esModuleInterop": true,     // 兼容 CommonJS 默认导出
    "skipLibCheck": true,        // 跳过 node_modules 的类型检查
    "experimentalDecorators": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Q: 声明文件（.d.ts）是什么？如何使用？

**A:**

**声明文件**（`.d.ts`）只包含类型声明，不含任何实现代码，用于为纯 JS 库提供类型信息，让 TS 项目使用时享受类型检查和智能提示。

### 使用方式

**1. 安装社区类型包（最常用）**
```bash
npm i -D @types/lodash  # 为 lodash 安装类型声明
```

**2. 自己编写 `.d.ts`**
```ts
// global.d.ts — 扩展全局类型
declare global {
  interface Window {
    __APP_CONFIG__: { apiBase: string }
  }
}
export {}

// 声明无类型的第三方模块
declare module 'some-js-lib' {
  export function doSomething(val: string): void
}
```

**3. `declare` 关键字**

```ts
// 声明全局变量（来自外部 CDN 等）
declare const __VERSION__: string
declare function fetchData(url: string): Promise<any>
declare class EventBus { on(event: string, fn: Function): void }
```

---

## Q: 命名空间（namespace）是什么？和 ES 模块有何区别？

**A:**

**命名空间**是 TS 早期组织代码的方式，将相关代码包裹在一个具名作用域内，避免全局污染。

```ts
namespace Validation {
  export interface StringValidator {
    isAcceptable(s: string): boolean
  }

  export class LettersOnlyValidator implements StringValidator {
    isAcceptable(s: string) {
      return /^[A-Za-z]+$/.test(s)
    }
  }
}

const validator = new Validation.LettersOnlyValidator()
```

| 维度 | `namespace` | ES Module |
|------|------------|-----------|
| 作用域 | TS 编译时合并 | 文件级别隔离 |
| 现代工程推荐 | ❌ 不推荐 | ✅ 推荐 |
| 适用场景 | 声明文件（`.d.ts`）中 | 所有业务代码 |
| Tree-shaking | ❌ 不支持 | ✅ 支持 |

> ⚠️ **注意**：在现代 TS 项目中，**应使用 ES Module（`import/export`）替代命名空间**。命名空间目前主要用于全局声明文件（如 `@types` 包）中。

---

## 高频补充篇

## Q: TypeScript 中函数重载怎么写？和联合类型参数有什么区别？

**A:**

函数重载的核心是：

1. 写多个重载签名（只声明，不实现）
2. 最后写一个实现签名（参数通常用联合或 unknown）
3. 实现体里做类型收窄

```ts
// 重载签名
function format(input: string): string
function format(input: number): string

// 实现签名
function format(input: string | number): string {
  if (typeof input === 'number') return input.toFixed(2)
  return input.trim()
}

format('  hi  ') // string
format(12.3)    // string
```

### 与联合参数的区别

| 对比维度 | 函数重载 | 联合类型参数 |
|------|------|------|
| 调用提示 | ✅ 可为不同入参给出不同签名 | ❌ 只有一个统一签名 |
| 返回类型表达 | ✅ 可按入参精确区分返回类型 | ⚠️ 往往需要联合返回 |
| 可读性 | ✅ 对外 API 更清晰 | 简单场景更轻量 |

> ⚠️ **注意**：重载签名必须放在实现函数之前；调用方只看到重载签名，看不到实现签名。

---

## Q: 类型断言 `as`、非空断言 `!`、类型守卫分别有什么区别？

**A:**

### `as` 类型断言

告诉编译器“我比你更清楚当前类型”，只影响编译期，不会做运行时检查。

```ts
const el = document.getElementById('app') as HTMLDivElement
el.innerText = 'hello'
```

### 非空断言 `!`

用于去掉 `null | undefined`，表示“这里一定不为空”。

```ts
const btn = document.getElementById('btn')!
btn.addEventListener('click', () => {})
```

### 类型守卫（推荐）

通过 `typeof` / `instanceof` / `in` / 自定义谓词做真实分支收窄，最安全。

```ts
const node = document.getElementById('app')
if (node) {
  node.innerHTML = 'ok' // ✅
}
```

| 方式 | 是否安全 | 是否有运行时校验 | 适用场景 |
|------|---------|------------------|---------|
| `as` | ⚠️ 依赖开发者保证 | ❌ 无 | 明确知道类型时 |
| `!` | ⚠️ 风险更高 | ❌ 无 | 生命周期可控、明确非空时 |
| 类型守卫 | ✅ 最安全 | ✅ 有分支判断 | 大多数业务代码 |

---

## Q: `as const` 和 `satisfies` 有什么用？

**A:**

### `as const`（常量断言）

作用：

1. 字面量不再被拓宽（`'GET'` 不会变成 `string`）
2. 对象属性变为 `readonly`
3. 数组推断为只读元组

```ts
const req = {
  method: 'GET',
  path: '/users'
} as const

// req.method 类型是 'GET'，不是 string
```

### `satisfies`（TS 4.9+）

用于“校验是否满足某类型”，但不改变表达式自身推断结果。

```ts
type Route = {
  path: string
  method: 'GET' | 'POST'
}

const route = {
  path: '/users',
  method: 'GET'
} satisfies Route

// route.method 仍保持字面量 'GET'，同时受 Route 约束
```

| 对比维度 | `as const` | `satisfies` |
|------|------|------|
| 主要目标 | 锁定字面量并只读化 | 校验结构兼容性 |
| 是否改变推断结果 | ✅ 会（更窄） | ❌ 不会（保留原推断） |
| 常见用途 | 配置常量、路由表、状态机 | 配置对象类型校验 |

---

## Q: TS 项目中 ES Module 与 CommonJS 如何选择？`import type` 有什么作用？

**A:**

### ES Module vs CommonJS

| 维度 | ES Module | CommonJS |
|------|-----------|----------|
| 语法 | `import/export` | `require/module.exports` |
| 加载时机 | 静态分析（编译期） | 运行时加载 |
| Tree-shaking | ✅ 支持 | ❌ 较弱 |
| 现代前端工程 | ✅ 主流推荐 | 多见于 Node 历史项目 |

现代 TS 前端项目通常配置：

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler"
  }
}
```

### `import type` / `export type`

只导入/导出类型，不引入运行时代码，能避免打包无效引用与循环依赖问题。

```ts
import type { User } from './types'
export type { User }

const getUserName = (u: User) => u.name
```

> ⚠️ **注意**：在开启 `isolatedModules`、使用 Babel/SWC 单文件转译时，优先使用 `import type` 区分类型导入与值导入。

---
