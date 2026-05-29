# TypeScript 技术要点

> TS 在 Vue / React 项目里的工程化落地，见专题：[TypeScript 与项目结合](./与项目结合/)。

---

## Q: TS 基础踩坑速查（字面量 / 可选 / readonly / 索引访问 / Exclude）

**A:**

> 训练时反复踩到的小坑集合，每条都是面试一句话就能挂的细节。

### 1. 字面量类型 vs 普通类型 —— 看引号

类型位置带不带引号，含义**完全不同**：

```ts
type A = string    // 接受任意字符串
type B = 'hello'   // 只接受 'hello' 这一个值（字面量类型）

const a: A = 'xxx'    // ✅
const b: B = 'xxx'    // ❌ 只能赋 'hello'
const b2: B = 'hello' // ✅
```

**判断技巧**：
- 想限制「只能是某几个具体值」→ 用**字面量联合**：`'red' | 'green' | 'blue'`
- 想表示「任意字符串」→ 用 `string`，**不要加引号**

> ⚠️ 对象字面量上下文里最容易踩：`{ name: 'alice' }` 这里 `'alice'` 是字面量；`{ name: string }` 才是「任意字符串」。

---

### 2. `key?: T` vs `key: T | undefined`

**完全是两回事**：

| 写法 | key 可省略 | 值可为 undefined | `'key' in obj` |
|------|----------|----------------|----------------|
| `age?: number` | ✅ | ✅ | 可能 false |
| `age: number \| undefined` | ❌ **必须存在** | ✅ | 永远 true |

```ts
type A = { age?: number }
type B = { age: number | undefined }

const a: A = {}                     // ✅
const b: B = {}                     // ❌ key 必须存在
const b2: B = { age: undefined }    // ✅ 值可以是 undefined，但 key 必须写
```

**口诀**：`?:` = "key 可以不写"；`: T | undefined` = "key 必须写，值可以是 undefined"。

---

### 3. `readonly` 是**浅只读**，运行时拦不住

```ts
type T = {
  readonly user: { name: string }
}
const t: T = { user: { name: 'alice' } }

t.user = { name: 'bob' }   // ❌ 报错（user 本身只读）
t.user.name = 'bob'        // ✅ 通过！（嵌套属性没加 readonly）
```

要**深只读**需要递归映射类型：

```ts
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K]
}
```

> ⚠️ **运行时陷阱**：`readonly` 只是 TS 编译期检查，**JS 运行时根本拦不住**。要真不可变得用 `Object.freeze()`（浅冻结）或递归 freeze。

---

### 4. `as const` 同时做两件事

| 维度 | 没加 `as const` | 加了 `as const` |
|------|---------------|----------------|
| 可变性 | 可写 | `readonly` |
| 值收窄 | 推断为宽类型 `number / string` | 推断为**字面量** `1 / 'hi'` |
| 数组 | `number[]` | `readonly [...]` **元组** |

```ts
const a = { x: 1 }            // { x: number }
const b = { x: 1 } as const   // { readonly x: 1 }

const c = [1, 2, 3]           // number[]
const d = [1, 2, 3] as const  // readonly [1, 2, 3]
```

**实战 — 单一数据源**：
```ts
const COLORS = ['red', 'green', 'blue'] as const
type Color = typeof COLORS[number]
// → 'red' | 'green' | 'blue'    数组加项类型自动同步
```

---

### 5. 元组转联合：`T[number]`；取长度：`T['length']`

```ts
type Tuple = ['a', 'b', 'c']

type Union = Tuple[number]   // 'a' | 'b' | 'c'    ← 索引访问"任意数字 key"
type Len   = Tuple['length'] // 3                  ← 索引访问 'length' key
```

> ⚠️ **只有元组**才能拿到字面量长度。普通数组：
> ```ts
> type A = string[]
> type LenA = A['length']  // number ← 不是字面量！
> ```

---

### 6. `Exclude` / `Extract` / `NonNullable` 参数语义

| 工具类型 | 含义 | 第二参 |
|---------|------|--------|
| `Exclude<T, U>` | 从 T **剔除** U | **黑名单** |
| `Extract<T, U>` | 从 T **保留** U | **白名单** |
| `NonNullable<T>` | 去掉 null/undefined | 无（只接 1 参） |

```ts
type Input = string | number | null | undefined

type A = NonNullable<Input>                   // string | number ✅
type B = Exclude<Input, null | undefined>     // string | number ✅
type C = Exclude<Input, string | number>      // null | undefined ← 用反了！
```

> ⚠️ **常见错用**：以为第二参是"要保留的"，实际它是"要丢的"。"**Ex**-clude" = 排除。

---

### 7. `typeof`：值空间 → 类型空间

TS 有**两套独立命名空间**：

| 空间 | 谁住在这 | 何时存在 |
|------|---------|---------|
| **值空间** | `const` / `let` / `function` / `class` 实例 | 运行时 |
| **类型空间** | `type` / `interface` / 泛型参数 | 编译期 |

`typeof` 是"值 → 类型"的桥梁，**只有左边是值时才用**：

```ts
// 场景 A：已经是类型 → 不要 typeof
type Input = ['a', 'b', 'c']
type X = Input[number]                  // ✅
type X2 = typeof Input[number]          // ❌ Input 不是值

// 场景 B：是值 → 必须 typeof
const colors = ['a', 'b', 'c'] as const
type Y = typeof colors[number]          // ✅
type Y2 = colors[number]                // ❌ colors 是值，不是类型
```

**判断技巧**：大写 `Input` / `Type` 一般是类型，不用 `typeof`；小写 `colors` / `obj` 这种 `const` 才需要 `typeof`。

---

### 8. `infer` 模式匹配 = JS 解构

`T extends [infer F, ...any[]]` 看着抽象，对应 JS 的 `const [first, ...rest] = arr`：

| JS 值解构 | TS 类型解构 |
|-----------|------------|
| `const [first, ...rest] = arr` | `T extends [infer F, ...any[]]` |
| `first` ← 给值起名 | `infer F` ← 给类型起名 |
| `...rest` ← 接住剩下的值 | `...any[]` ← 接住剩下的类型（不关心） |

```ts
// 取首
type First<T extends readonly any[]> = T extends [infer F, ...any[]] ? F : never

// 取末（镜像）
type Last<T extends readonly any[]> = T extends [...any[], infer L] ? L : never

// 去末（取剩余）
type Pop<T extends readonly any[]> = T extends [...infer Rest, any] ? Rest : []
```

**为什么不直接 `T[0]`？** 因为 `[][0]` 得到 `undefined`，无法优雅处理空元组；用 `infer` 配条件类型，**不匹配直接走 `:never` 分支**，更严谨。

---

## Q: interface vs type 如何选择？

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

## Q: 泛型原理与常见用法

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

### ✨ 类型别名 vs 泛型 — 什么时候用 `<T>`？

很多人卡在「写 `type A = ...` 还是 `type A<T> = ...`」上。**判断标准：你需不需要"输入"？**

| 需求 | 写法 | 类比 JS |
|------|------|---------|
| 描述**一个固定**类型 | `type A = string` | `const a = 123`（变量） |
| **接收输入**，根据输入算出不同类型 | `type A<T> = T[0]` | `function f(x) { ... }`（函数） |

```ts
// 场景 A：描述固定类型 → 别名
type User = { name: string; age: number }
const u: User = { name: 'alice', age: 18 }

// 场景 B：根据输入算出结果 → 必须泛型
type First<T extends readonly any[]> = T extends [infer F, ...any[]] ? F : never
type X = First<[1, 2, 3]>    // 1
type Y = First<['x', 'y']>   // 'x'
```

**完全对应 JS 函数的语法映射**：

| JS 函数 | TS 泛型类型 |
|------|------|
| `function first(arr) { ... }` | `type First<T> = ...` |
| `arr` 形参名 | `T` 形参名 |
| `(arr)` 圆括号 | `<T>` 尖括号 |
| `first([1,2,3])` 调用 | `First<[1,2,3]>` 调用 |
| `arr: number[]`（参数类型注解） | `T extends number[]`（泛型约束） |

> 💡 **`extends` 是约束 `T` 的，`T` 是引用入参的。两者必须搭配，缺一不可。**  
> 没起名字（只写约束）就没法在等号右边引用 —— 就像 JS 里 `function first(number[])` 不写形参名你后面咋写函数体。

**口诀**：**有"输入"就用泛型，没输入就用别名。**

---

## Q: TS 内置工具类型有哪些？

**A:**

TS 提供了一批开箱即用的**泛型工具类型**，高频考点：

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

## Q: any / unknown / never / void 的区别？

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

## Q: 类型操作符 keyof / typeof / in / infer

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

## Q: 条件类型怎么用？

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

### ✨ 分布式条件类型 + `[T]` 禁用分发（必考陷阱）

**「分布式条件类型只对裸（naked）类型参数触发」** —— 这是 TS 最容易踩的隐藏规则。

```ts
type IsString<T> = T extends string ? true : false

// ❗ 联合类型会"自动逐项分发"
type A = IsString<string | number>
// = IsString<string> | IsString<number>
// = true | false
// = boolean   ⚠️ 不是 false！

// ❗ never 会"短路"成 never
type B = IsString<never>   // never（既不是 true 也不是 false）

// ❗ any 同时满足两个分支
type C = IsString<any>     // boolean
```

**禁用分发的诀窍：把 T 包成元组 `[T] extends [U]`**

```ts
type IsString<T> = [T] extends [string] ? true : false

type A = IsString<string | number>   // false ✅（整体判断）
type B = IsString<never>             // false ✅
```

| 写法 | `T = never` | `T = string \| number` | 适用 |
|------|-------------|---------------------|------|
| `T extends X ? Y : N`（裸） | **never** | **boolean**（分发） | 需要逐项处理联合（如 Exclude） |
| `[T] extends [X] ? Y : N`（包起来） | **N** | **N**（整体判断） | 需要把联合当整体看 |

**口诀**：**「需要逐项处理联合 → 裸；要把联合当整体 → 包。」**

**典型应用**：
```ts
// 必须裸：Exclude 要逐项剔除
type Exclude<T, U> = T extends U ? never : T

// 必须包：IsNever 判断永远会被 never 短路
type IsNever<T> = [T] extends [never] ? true : false

// 必须包：判断"是不是 string 联合"
type IsExactString<T> = [T] extends [string] ? true : false
```

### ✨ `infer` 使用规则（3 条必记）

```ts
T extends [infer F, ...any[]] ? F : never
```

**规则 1：`infer X` 只能写在 `extends` 后面的"匹配模式"里**
```ts
// ✅ 合法
type First<T> = T extends [infer F, ...any[]] ? F : never

// ❌ 全部非法
type X<T> = infer U                                    // 不在条件类型里
type Y<T> = T extends [infer F, ...any[]] ? infer F : never  // 结果分支不能 infer
type Z<T> = T extends [F, ...any[]] ? F : never        // F 没声明
```

**规则 2：结果分支只能**引用**名字，不能再 `infer`**
```ts
type First<T> = T extends (infer U)[] ? U : never   // ✅ 直接用 U
//                                      ▲
type First<T> = T extends (infer U)[] ? infer U : never  // ❌
```

**规则 3：`infer X` ≈ JS 解构 + 命名**

| JS 值解构 | TS 类型解构 |
|-----------|------------|
| `const [first, ...rest] = arr` | `T extends [infer F, ...any[]]` |
| `first` ← 给值起名 | `infer F` ← 给类型起名 |
| `...rest` ← 接住剩余值 | `...any[]` ← 接住剩余类型 |
| `const { user } = obj` | `T extends { user: infer U }` |

### ✨ 所有 `infer` 套路一览（背熟即可应付大半题）

| 想拿什么 | 模式 |
|---------|------|
| 数组元素 | `T extends (infer U)[] ? U : never` |
| 元组首 | `T extends [infer F, ...any[]] ? F : never` |
| 元组末 | `T extends [...any[], infer L] ? L : never` |
| 元组除首（尾部） | `T extends [any, ...infer Rest] ? Rest : []` |
| 元组除末（头部） | `T extends [...infer Init, any] ? Init : []` |
| 函数参数 | `T extends (...args: infer P) => any ? P : never` |
| 函数返回 | `T extends (...args: any[]) => infer R ? R : never` |
| Promise 内值 | `T extends Promise<infer U> ? U : never` |
| 对象某属性 | `T extends { a: infer A } ? A : never` |
| 构造函数实例 | `T extends new (...args: any) => infer I ? I : never` |
| 字符串首字符 | `` T extends `${infer F}${string}` ? F : never `` |

### ✨ 泛型约束的"宽窄"原则

很多人把"约束"和"判断"写混：

| 位置 | 作用 | 写什么 |
|------|------|--------|
| `<T extends ???>` | **入口校验**：限制 T 能传啥 | **最宽**（覆盖所有合法输入） |
| `T extends ??? ? A : B` | **结果分支**：精确分类 | **最窄**（具体到字面量） |

```ts
// ❌ 约束太窄
type If<C extends true, T, F> = C extends true ? T : F
If<false, 'a', 'b'>   // ❌ false 都不让传

// ✅ 约束写最宽（boolean），判断写最窄（true）
type If<C extends boolean, T, F> = C extends true ? T : F
```

**口诀**：**"宽进严判"**。约束让能传的都进来，判断在内部精确分类。

### ✨ 元组展开 `[...A, ...B]` 8 种形态

TS 元组类型支持 JS 数组的所有展开语法 + `infer` 配合：

```ts
[...A, ...B]            // 拼接两个元组
[X, ...A]               // 前面追加
[...A, X]               // 后面追加
[X, ...A, Y]            // 首尾包夹
[...A, ...B, ...C]      // 三个拼起来

[infer F, ...infer Rest]    // 首 + 剩余（解构出两个名字）
[...infer Init, infer Last] // 末 + 剩余
[any, ...infer Rest]        // 跳过首个，取剩余
```

实战范例：
```ts
// 反转元组（递归）
type Reverse<T extends any[]> = T extends [infer F, ...infer R] ? [...Reverse<R>, F] : []

// 加法（用元组长度模拟）
type BuildTuple<L extends number, R extends any[] = []> =
  R['length'] extends L ? R : BuildTuple<L, [any, ...R]>
type Add<A extends number, B extends number> = [...BuildTuple<A>, ...BuildTuple<B>]['length']
```

---

## Q: `infer` 怎么用？为什么这么反人类？

**A:**

### 一句话

**`infer X` = 在一个"类型形状"里挖个洞，让 TS 帮你填上对应的部分，起名叫 X。** 本质 = JS 解构 + 起名。

### 为什么看起来反人类

TS 类型层面**没有** `if` / `const` / 多行语句，所有逻辑必须挤进一个表达式 → 于是发明了"在 `extends` 模式匹配的同时偷偷解构"的写法。**接受这个先天残疾**，看 `infer` 就顺眼了。

### 渐进式理解（从已知到未知）

```ts
// Level 1：模板写死，纯判断
T extends [string, number] ? number : never

// Level 2：元组里"留个洞"，把值抠出来
T extends [infer X, number] ? X : never
// 意思：T 是不是"长得像 [?, number]"？是的话第 1 个位置叫 X

// Level 3：模板可以是任何形状（不只元组）
T extends (...args: any[]) => any ? ... : ...   // 函数形状
T extends Promise<any> ? ... : ...               // Promise 形状

// Level 4：在新形状里留洞
T extends (...args: infer P) => any ? P : never  // 抠函数参数
T extends Promise<infer V> ? V : never           // 抠 Promise 值
```

**关键认知**：`extends 模板` 的"模板"可以是任何类型形状 —— 元组、数组、函数、对象、Promise、自定义泛型...

### 必须澄清的 3 个误区

#### 误区 1：T 是参数列表？

❌ **错**。`T` 是**外面传进来的整个东西**，参数列表只是 T 里面的"一小块"，需要 `infer` 抠出来。

```ts
function login(u: string, p: number) { return true }

type T = typeof login
// T = (u: string, p: number) => boolean   ← T 是整个函数，不是参数

type P = MyParameters<T>
// P = [string, number]                    ← P 才是参数列表
```

#### 误区 2：传啥都能抠？

❌ **错**。**T 必须和模板形状对上**才能匹配，对不上直接走 `never`。

```ts
type MyParameters<T> = T extends (...args: infer P) => any ? P : never

MyParameters<(a: string) => void>   // [string] ✅ 函数 vs 函数模板，匹配
MyParameters<[string, number]>      // never ❌ 元组 vs 函数模板，不匹配
MyParameters<number>                // never ❌ 数字 vs 函数模板，不匹配
```

#### 误区 3：`infer` 只能写在数组/元组里？

❌ **错**。`infer` 可以放在**任何泛型位置**：

| 场景 | 写法 |
|------|------|
| 元组 | `T extends [infer X, ...any[]]` |
| 数组 | `T extends (infer X)[]` |
| 函数参数 | `T extends (...args: infer P) => any` |
| 函数返回 | `T extends (...args: any[]) => infer R` |
| Promise | `T extends Promise<infer V>` |
| 对象属性 | `T extends { id: infer I }` |
| Map | `T extends Map<infer K, infer V>` |
| 构造函数 | `T extends new (...args: any) => infer I` |
| 字符串模板 | `` T extends `${infer Head}-${infer Tail}` `` |
| 自定义泛型 | `T extends Box<infer V>` |

### 真实工作流：`Parameters` + `ReturnType` + `typeof`

**核心价值**：函数定义是"真理"，类型抠一次，多处复用。

```ts
// ① 业务函数（写一次，真理源头）
async function fetchUser(id: string) {
  return { id, name: 'mike', age: 25 }
}

// ② 类型抠一次
type FetchUserArgs   = Parameters<typeof fetchUser>     // [string]
type FetchUserReturn = Awaited<ReturnType<typeof fetchUser>>
//                     ━━━━━━━ 用 Awaited 把 Promise 剥掉
// = { id: string; name: string; age: number }

// ③ 多处复用
const formData: FetchUserArgs = ['user-1']           // 表单
const mockData: FetchUserArgs = ['test-id']          // 测试
const cache: FetchUserReturn | null = null           // 缓存
function show(user: FetchUserReturn) { /* ... */ }   // 组件
```

**fetchUser 改签名 → 所有用到类型的地方自动跟着变** ✅

### 三铁律（再背一次）

| 铁律 | 例子 |
|------|------|
| ① 只能写在 `extends` 后面的「模式」里 | `T extends ...infer X... ? ... : ...` ✅ |
| ② 不能写在约束位置 | `<T extends infer X>` ❌ |
| ③ 结果分支只能引用名字，不能再 `infer` | `? X : Y` ✅ ／ `? infer X : Y` ❌ |

### 心法

> **「想抠哪里，就在哪里写 `infer 名字`，真分支再用这个名字。」**

跟 JS 解构 `const { name } = obj` 一模一样的思路 —— **想要 `name` 就在解构模板里写 `name`**。

---

## Q: 类型断言 as / ! / 类型守卫怎么选？

**A:**

### `as` 类型断言

告诉编译器"我比你更清楚当前类型"，只影响编译期，不会做运行时检查。

```ts
const el = document.getElementById('app') as HTMLDivElement
el.innerText = 'hello'
```

### 非空断言 `!`

用于去掉 `null | undefined`，表示"这里一定不为空"。

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

## Q: 可选链 `?.` 与空值合并 `??` 怎么用？和 `||` 有什么区别？

**A:**

两者都是 ES2020 的语言特性，TS 完整支持，用来安全访问深层属性 / 提供默认值，避免冗长的 `&&` 判断。

### 可选链 `?.`

左值为 `null` / `undefined` 时短路返回 `undefined`，不再继续访问，**不会报错**。

```ts
interface User { profile?: { name: string; getAge?: () => number } }

const u: User = {}
u.profile?.name              // undefined，不会抛错
u.profile?.getAge?.()        // 方法调用也可短路
const list: number[] = []
list?.[0]                    // 数组下标访问
```

### 空值合并 `??`

左值为 `null` 或 `undefined` 时取右侧默认值；其他 falsy 值（`0` / `''` / `false`）会保留。

```ts
const pageSize = props.pageSize ?? 10   // 0 也会被保留
const name = data.name ?? '匿名'
```

### `??` vs `||` 对比

| 表达式 | `null` | `undefined` | `0` | `''` | `false` |
| --- | --- | --- | --- | --- | --- |
| `x \|\| 'd'` | `'d'` | `'d'` | `'d'` | `'d'` | `'d'` |
| `x ?? 'd'` | `'d'` | `'d'` | `0` | `''` | `false` |

> ⚠️ **注意**：业务里需要保留 `0` / `''` / `false` 作为合法值时，必须用 `??`，不要用 `||`。

### 工程实践

- TS `strictNullChecks` 开启后，`?.` 可让链路调用类型自动收窄为 `T | undefined`
- `??=`、`||=`、`&&=` 是对应的逻辑赋值运算符，可简化默认值赋值
- 不要把 `?.` 当万能保险，关键链路缺值时仍需显式判空并兜底

---

## Q: as const vs satisfies

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

用于"校验是否满足某类型"，但不改变表达式自身推断结果。

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

## Q: TypeScript 是什么？与 JavaScript 的差异？

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

## Q: TS 数据类型有哪些？

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

## Q: 联合类型 vs 交叉类型

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

## Q: interface 接口怎么用？

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

## Q: 访问修饰符 public / protected / private

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

## Q: 抽象类 vs 接口

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

## Q: 枚举 Enum 怎么用？

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

## Q: 装饰器有哪些类型？

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

## Q: 函数重载和联合类型参数有什么区别？

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

## Q: tsconfig 关键配置有哪些？

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

## Q: 声明文件 .d.ts 怎么用？

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

## Q: 模块化 / import type 有什么作用？

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

## Q: 命名空间 vs ES Module 怎么选？

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
