// ============================================================
// 第 04 阶段：内置工具类型手写实现（20 题）
// 目标：能闭着眼睛默写 TS 全部内置工具类型 —— 面试手写题重灾区！
// ============================================================
import type { Expect, Equal } from './_utils'

// ------------------------------------------------------------
// Q46. MyPartial<T>：所有属性变可选
// ------------------------------------------------------------
type MyPartial<T> = {
  [K in keyof T]?: T[K]
}
type case_Q46 = Expect<Equal<
  MyPartial<{ a: string; b: number }>,
  { a?: string; b?: number }
>>


// ------------------------------------------------------------
// Q47. MyRequired<T>：所有属性变必填（即使原本可选）
// ------------------------------------------------------------
type MyRequired<T> = {
  [K in keyof T]-?: T[K]
}
type case_Q47 = Expect<Equal<
  MyRequired<{ a?: string; b?: number }>,
  { a: string; b: number }
>>


// ------------------------------------------------------------
// Q48. MyReadonly<T>：所有属性 readonly
// ------------------------------------------------------------
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K]
}
type case_Q48 = Expect<Equal<
  MyReadonly<{ a: string; b: number }>,
  { readonly a: string; readonly b: number }
>>


// ------------------------------------------------------------
// Q49. Mutable<T>：去掉所有 readonly
// 提示：-readonly
// ------------------------------------------------------------
type Mutable<T> = {
  -readonly [K in keyof T]: T[K]
}
type case_Q49 = Expect<Equal<
  Mutable<{ readonly a: string; readonly b: number }>,
  { a: string; b: number }
>>


// ------------------------------------------------------------
// Q50. MyRecord<K, V>：用 K 联合做 key，每个值类型为 V
// ------------------------------------------------------------
type MyRecord<K extends keyof any, V> = {
  [P in K]: V
}
type case_Q50 = Expect<Equal<
  MyRecord<'a' | 'b', number>,
  { a: number; b: number }
>>


// ------------------------------------------------------------
// Q51. MyExclude<T, U>：从联合类型 T 中剔除 U
// ------------------------------------------------------------
type MyExclude<T, U> = T extends U ? never : T
type case_Q51_1 = Expect<Equal<MyExclude<'a' | 'b' | 'c', 'a'>, 'b' | 'c'>>
type case_Q51_2 = Expect<Equal<MyExclude<string | number, string>, number>>


// ------------------------------------------------------------
// Q52. MyExtract<T, U>：从联合类型 T 中保留 U 部分
// ------------------------------------------------------------
type MyExtract<T, U> = T extends U ? T : never
type case_Q52 = Expect<Equal<MyExtract<'a' | 'b' | 1, string>, 'a' | 'b'>>


// ------------------------------------------------------------
// Q53. MyNonNullable<T>：去除 null / undefined
// ------------------------------------------------------------
type MyNonNullable<T> = T extends null | undefined ? never : T
type case_Q53 = Expect<Equal<
  MyNonNullable<string | null | undefined | number>,
  string | number
>>


// ------------------------------------------------------------
// Q54. MyParameters<F>：取函数参数元组
// ------------------------------------------------------------
type MyParameters<F> = F extends (...args: infer P) => any ? P : never
type case_Q54 = Expect<Equal<
  MyParameters<(a: string, b: number) => void>,
  [string, number]
>>


// ------------------------------------------------------------
// Q55. MyReturnType<F>：取函数返回值
// ------------------------------------------------------------
type MyReturnType<F> = F extends (...args: any) => infer R ? R : never
type case_Q55 = Expect<Equal<MyReturnType<() => string[]>, string[]>>


// ------------------------------------------------------------
// Q56. MyAwaited<T>：递归解包 Promise
// MyAwaited<Promise<Promise<string>>> → string
// ------------------------------------------------------------
type MyAwaited<T> = T extends Promise<infer U> ? MyAwaited<U> : T
type case_Q56_1 = Expect<Equal<MyAwaited<Promise<string>>, string>>
type case_Q56_2 = Expect<Equal<MyAwaited<Promise<Promise<number>>>, number>>
type case_Q56_3 = Expect<Equal<MyAwaited<number>, number>>  // 非 Promise 原样返回


// ------------------------------------------------------------
// Q57. DeepReadonly<T>：递归 readonly
// ------------------------------------------------------------
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K]
}
type case_Q57 = Expect<Equal<
  DeepReadonly<{ a: { b: { c: number } } }>,
  { readonly a: { readonly b: { readonly c: number } } }
>>


// ------------------------------------------------------------
// Q58. DeepPartial<T>：递归可选
// ------------------------------------------------------------
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}
type case_Q58 = Expect<Equal<
  DeepPartial<{ a: { b: { c: number } } }>,
  { a?: { b?: { c?: number } } }
>>


// ------------------------------------------------------------
// Q59. PickByValue<T, V>：保留值类型为 V 的属性
// ------------------------------------------------------------
type PickByValue<T, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K]
}
type case_Q59 = Expect<Equal<
  PickByValue<{ a: string; b: number; c: string }, string>,
  { a: string; c: string }
>>


// ------------------------------------------------------------
// Q60. OmitByValue<T, V>：剔除值类型为 V 的属性
// ------------------------------------------------------------
type OmitByValue<T, V> = {
  [K in keyof T as T[K] extends V ? never : K]: T[K]
}
type case_Q60 = Expect<Equal<
  OmitByValue<{ a: string; b: number; c: string }, string>,
  { b: number }
>>


// ------------------------------------------------------------
// Q61. RequiredKeys<T>：取出所有必填属性的 key（联合）
// ------------------------------------------------------------
type RequiredKeys<T> = {
  [K in keyof T]: {} extends Pick<T, K> ? never : K
}[keyof T]
type case_Q61 = Expect<Equal<
  RequiredKeys<{ a: string; b?: number; c: boolean; d?: string }>,
  'a' | 'c'
>>


// ------------------------------------------------------------
// Q62. OptionalKeys<T>：取出所有可选属性的 key
// ------------------------------------------------------------
type OptionalKeys<T> = {
  [K in keyof T]: {} extends Pick<T, K> ? K : never
}[keyof T]
type case_Q62 = Expect<Equal<
  OptionalKeys<{ a: string; b?: number; c?: boolean }>,
  'b' | 'c'
>>


// ------------------------------------------------------------
// Q63. Merge<A, B>：合并对象，B 同名覆盖 A
// ------------------------------------------------------------
type Merge<A, B> = Omit<A, keyof B> & B
type case_Q63 = Expect<Equal<
  Merge<{ a: string; b: number }, { b: string; c: boolean }>,
  { a: string; b: string; c: boolean }
>>


// ------------------------------------------------------------
// Q64. PartialByKeys<T, K>：仅让 K 对应字段变可选，其余保持
// ------------------------------------------------------------
type PartialByKeys<T, K extends keyof T = keyof T> = Omit<T, K> & Partial<Pick<T, K>>
type case_Q64 = Expect<Equal<
  PartialByKeys<{ a: string; b: number; c: boolean }, 'a' | 'b'>,
  { a?: string; b?: number; c: boolean }
>>


// ------------------------------------------------------------
// Q65. RequiredByKeys<T, K>：仅让 K 对应字段变必填，其余保持
// ------------------------------------------------------------
type RequiredByKeys<T, K extends keyof T = keyof T> = Omit<T, K> & Required<Pick<T, K>>
type case_Q65 = Expect<Equal<
  RequiredByKeys<{ a?: string; b?: number; c?: boolean }, 'a'>,
  { a: string; b?: number; c?: boolean }
>>
