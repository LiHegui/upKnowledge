// ============================================================
// 第 03 阶段：keyof / typeof / 索引访问（15 题）
// 目标：熟练在对象/数组/常量之间互相提取与组合类型
// ============================================================
import type { Expect, Equal } from './_utils'

interface User_Q3 {
  id: number
  name: string
  age: number
  email?: string
}

// ------------------------------------------------------------
// Q31. 提取 User_Q3 的所有 key（联合）
// ------------------------------------------------------------
type Q31 = any
type case_Q31 = Expect<Equal<Q31, 'id' | 'name' | 'age' | 'email'>>


// ------------------------------------------------------------
// Q32. 提取 User_Q3 的所有 value 类型（联合）
// ------------------------------------------------------------
type Q32 = any
type case_Q32 = Expect<Equal<Q32, string | number | undefined>>


// ------------------------------------------------------------
// Q33. 索引访问取单个属性类型
// 输入对象：{ a: string; b: { c: number } }，要取 b.c → number
// ------------------------------------------------------------
type Obj_Q33 = { a: string; b: { c: number } }
type Q33 = any
type case_Q33 = Expect<Equal<Q33, number>>


// ------------------------------------------------------------
// Q34. 数组 → 元素联合类型（不用 [number]）
// 提示：T[number]
// ------------------------------------------------------------
const arr_q34 = ['red', 'green', 'blue'] as const
type Q34 = any  // 期望：'red' | 'green' | 'blue'
type case_Q34 = Expect<Equal<Q34, 'red' | 'green' | 'blue'>>


// ------------------------------------------------------------
// Q35. typeof 用法：从值倒推类型
// const config = { port: 8080, host: 'localhost' }
// 写出 Q35 = typeof config
// ------------------------------------------------------------
const config_q35 = { port: 8080, host: 'localhost' }
type Q35 = any
type case_Q35 = Expect<Equal<Q35, { port: number; host: string }>>


// ------------------------------------------------------------
// Q36. 字面量精确化
// const obj = { kind: 'circle', radius: 10 } as const
// 提取 kind 类型 → 'circle'（而不是 string）
// ------------------------------------------------------------
const shape_q36 = { kind: 'circle', radius: 10 } as const
type Q36 = any
type case_Q36 = Expect<Equal<Q36, 'circle'>>


// ------------------------------------------------------------
// Q37. 自己实现 Pick<T, K>
// ------------------------------------------------------------
type MyPick<T, K extends keyof T> = any
type case_Q37 = Expect<Equal<
  MyPick<User_Q3, 'id' | 'name'>,
  { id: number; name: string }
>>


// ------------------------------------------------------------
// Q38. 自己实现 Omit<T, K>
// ------------------------------------------------------------
type MyOmit<T, K extends keyof any> = any
type case_Q38 = Expect<Equal<
  MyOmit<User_Q3, 'email' | 'age'>,
  { id: number; name: string }
>>


// ------------------------------------------------------------
// Q39. 提取对象中"值类型为 string"的 key
// 输入：{ a: string; b: number; c: string; d: boolean }
// 输出：'a' | 'c'
// ------------------------------------------------------------
type StringKeys<T> = any
type case_Q39 = Expect<Equal<
  StringKeys<{ a: string; b: number; c: string; d: boolean }>,
  'a' | 'c'
>>


// ------------------------------------------------------------
// Q40. 仅保留对象中"值类型为 string"的属性
// 输入：{ a: string; b: number; c: string }
// 输出：{ a: string; c: string }
// ------------------------------------------------------------
type FilterStringProps<T> = any
type case_Q40 = Expect<Equal<
  FilterStringProps<{ a: string; b: number; c: string }>,
  { a: string; c: string }
>>


// ------------------------------------------------------------
// Q41. 把 key 改为大写
// { name: string; age: number }  →  { NAME: string; AGE: number }
// ------------------------------------------------------------
type UppercaseKeys<T> = any
type case_Q41 = Expect<Equal<
  UppercaseKeys<{ name: string; age: number }>,
  { NAME: string; AGE: number }
>>


// ------------------------------------------------------------
// Q42. 交换 key 和 value（要求 value 是 string 字面量）
// { a: 'x'; b: 'y' }  →  { x: 'a'; y: 'b' }
// 提示：as 重映射
// ------------------------------------------------------------
type Flip<T extends Record<string, string>> = any
type case_Q42 = Expect<Equal<
  Flip<{ a: 'x'; b: 'y' }>,
  { x: 'a'; y: 'b' }
>>


// ------------------------------------------------------------
// Q43. 给对象的所有 key 加前缀 'on'，并首字母大写
// { click: () => void; hover: () => void }
// → { onClick: () => void; onHover: () => void }
// ------------------------------------------------------------
type Eventify<T> = any
type case_Q43 = Expect<Equal<
  Eventify<{ click: () => void; hover: () => void }>,
  { onClick: () => void; onHover: () => void }
>>


// ------------------------------------------------------------
// Q44. 获取 class 实例类型
// class Foo {}    →  Foo 的实例类型
// 输入 typeof Foo，输出 Foo
// 提示：自己实现 InstanceType
// ------------------------------------------------------------
type MyInstanceType<T extends abstract new (...args: any) => any> = any
class Foo_q44 { name = 'foo' }
type case_Q44 = Expect<Equal<MyInstanceType<typeof Foo_q44>, Foo_q44>>


// ------------------------------------------------------------
// Q45. 获取构造函数的参数
// class Person { constructor(name: string, age: number) {} }
// 自己实现 ConstructorParameters
// ------------------------------------------------------------
type MyConstructorParameters<T extends abstract new (...args: any) => any> = any
class Person_q45 { constructor(public name: string, public age: number) {} }
type case_Q45 = Expect<Equal<
  MyConstructorParameters<typeof Person_q45>,
  [string, number]
>>
