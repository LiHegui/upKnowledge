// ============================================================
// 第 02 阶段：函数与泛型（15 题）
// 目标：泛型约束、默认值、参数推断、重载、函数类型操作
// ============================================================
import type { Expect, Equal } from './_utils'

// ------------------------------------------------------------
// Q16. 写一个 identity 函数类型：输入什么类型，返回什么类型
// 要求：是一个泛型函数类型，不是具体函数
// ------------------------------------------------------------
type Identity = any
declare const id_q16: Identity
type case_Q16_1 = Expect<Equal<ReturnType<typeof id_q16<number>>, number>>
type case_Q16_2 = Expect<Equal<ReturnType<typeof id_q16<'hi'>>, 'hi'>>


// ------------------------------------------------------------
// Q17. 给泛型加约束：T 必须有 length 属性
// ------------------------------------------------------------
type HasLength<T extends any> = any  // 改约束，不是改函数体
declare function logLen_q17<T extends HasLength<T>>(arg: T): void
logLen_q17('abc')          // ✅ string 有 length
logLen_q17([1, 2, 3])      // ✅ array 有 length
logLen_q17({ length: 5 })  // ✅ 对象自带 length
// @ts-expect-error  number 没有 length
logLen_q17(123)


// ------------------------------------------------------------
// Q18. 给泛型 T 加默认值 string
// ------------------------------------------------------------
type Box_Q18<T = any> = { value: T }  // 把 = any 改成默认 string
type case_Q18_1 = Expect<Equal<Box_Q18, { value: string }>>
type case_Q18_2 = Expect<Equal<Box_Q18<number>, { value: number }>>


// ------------------------------------------------------------
// Q19. 提取函数参数类型为元组
// 函数：(a: string, b: number) => void   →   [string, number]
// 注意：不要用内置 Parameters，自己写
// ------------------------------------------------------------
type MyParameters<T> = any
type case_Q19_1 = Expect<Equal<
  MyParameters<(a: string, b: number) => void>,
  [string, number]
>>
type case_Q19_2 = Expect<Equal<MyParameters<() => void>, []>>


// ------------------------------------------------------------
// Q20. 提取函数返回值类型（自己实现 ReturnType）
// ------------------------------------------------------------
type MyReturnType<T> = any
type case_Q20_1 = Expect<Equal<MyReturnType<() => string>, string>>
type case_Q20_2 = Expect<Equal<MyReturnType<(x: number) => number[]>, number[]>>


// ------------------------------------------------------------
// Q21. 提取 Promise 解包后的类型（自己实现 Awaited）
// Awaited<Promise<string>>            → string
// Awaited<Promise<Promise<number>>>   → number  （递归解包）
// ------------------------------------------------------------
type MyAwaited<T> = any
type case_Q21_1 = Expect<Equal<MyAwaited<Promise<string>>, string>>
type case_Q21_2 = Expect<Equal<MyAwaited<Promise<Promise<number>>>, number>>


// ------------------------------------------------------------
// Q22. 函数类型转 this 绑定后的类型
// 输入：(this: { name: string }, age: number) => void
// 提取 this 类型 → { name: string }
// ------------------------------------------------------------
type ThisType_Q22<T> = any
type case_Q22 = Expect<Equal<
  ThisType_Q22<(this: { name: string }, age: number) => void>,
  { name: string }
>>


// ------------------------------------------------------------
// Q23. 函数重载提取最后一个签名
// 重载：function f(): void; function f(x: string): string;
// 取 typeof f 的返回值类型应得到 string（TS 重载推断默认取最后一个）
// ------------------------------------------------------------
declare function f_q23(): void
declare function f_q23(x: string): string
type Q23 = any  // 提取 f_q23 最后一个签名的返回值
type case_Q23 = Expect<Equal<Q23, string>>


// ------------------------------------------------------------
// Q24. 写一个 Curry 化的函数签名
// curry((a: number, b: number) => string)  →  (a: number) => (b: number) => string
// 只考虑 2 参数情况
// ------------------------------------------------------------
type Curry2<F> = any
type case_Q24 = Expect<Equal<
  Curry2<(a: number, b: number) => string>,
  (a: number) => (b: number) => string
>>


// ------------------------------------------------------------
// Q25. PromiseAll 的类型
// promiseAll([1, Promise.resolve(2), 3])  推断为 Promise<[1, 2, 3]>
// ------------------------------------------------------------
declare function promiseAll_q25<T extends readonly any[]>(values: readonly [...T]): Promise<{ [K in keyof T]: T[K] extends Promise<infer R> ? R : T[K] }>
// 修改返回值类型部分
const r_q25 = promiseAll_q25([1, 2, Promise.resolve(3)] as const)
type case_Q25 = Expect<Equal<typeof r_q25, Promise<[1, 2, 3]>>>


// ------------------------------------------------------------
// Q26. 函数组合 Compose（仅 2 个函数）
// compose(f, g)(x) = f(g(x))
// f: (b: B) => C
// g: (a: A) => B
// 返回：(a: A) => C
// ------------------------------------------------------------
type Compose2<F, G> = F extends (b: infer B) => infer C ? G extends (a: infer A) => B ? (a: A) => C : never : never
type case_Q26 = Expect<Equal<
  Compose2<(b: string) => number, (a: boolean) => string>,
  (a: boolean) => number
>>


// ------------------------------------------------------------
// Q27. 把元组转成函数参数
// 输入：[string, number]    输出：(a: string, b: number) => void
// ------------------------------------------------------------
type TupleToFn<T extends readonly any[]> = (...args: T) => void
type case_Q27 = Expect<Equal<
  TupleToFn<[string, number]>,
  (args_0: string, args_1: number) => void
>>


// ------------------------------------------------------------
// Q28. 给定一个对象，提取所有方法名
// 输入：{ a: () => void; b: string; c: () => number; d: number }
// 输出：'a' | 'c'
// ------------------------------------------------------------
type MethodKeys<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never
}[keyof T]
type case_Q28 = Expect<Equal<
  MethodKeys<{ a: () => void; b: string; c: () => number; d: number }>,
  'a' | 'c'
>>


// ------------------------------------------------------------
// Q29. 实现 Capitalize 函数的类型（首字母大写）
// 直接对字符串字面量起效，不依赖内置 Capitalize
// 提示：使用模板字面量 + 内置 Uppercase
// ------------------------------------------------------------
type MyCapitalize<S extends string> = S extends `${infer F}${infer R}` ? `${Uppercase<F>}${R}` : S
type case_Q29_1 = Expect<Equal<MyCapitalize<'hello'>, 'Hello'>>
type case_Q29_2 = Expect<Equal<MyCapitalize<'foo bar'>, 'Foo bar'>>


// ------------------------------------------------------------
// Q30. 函数类型变更：在原参数前追加一个 user: string
// (a: number) => boolean   →   (user: string, a: number) => boolean
// ------------------------------------------------------------
type AppendArgument<F, A> = F extends (...args: infer B) => infer R ? (...args: [A, ...B]) => R : never
type case_Q30 = Expect<Equal<
  AppendArgument<(a: number) => boolean, string>,
  (user: string, a: number) => boolean
>> 
// 注：参数名不参与类型等价，所以下面这种写法也算 Equal
// (args_0: string, a: number) => boolean
