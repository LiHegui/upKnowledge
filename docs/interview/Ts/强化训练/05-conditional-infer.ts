// ============================================================
// 第 05 阶段：条件类型与 infer（15 题）
// 目标：彻底掌握 infer / 分布式条件类型 / 协变逆变
// 这是 TS 面试手写题的最大重灾区！
// ============================================================
import type { Expect, Equal } from './_utils'

// ------------------------------------------------------------
// Q66. 判断 T 是不是数组
// ------------------------------------------------------------
type IsArray<T> = T extends any[] ? true : false
type case_Q66_1 = Expect<Equal<IsArray<number[]>, true>>
type case_Q66_2 = Expect<Equal<IsArray<string>, false>>


// ------------------------------------------------------------
// Q67. 提取数组元素类型（用 infer）
// ------------------------------------------------------------
type ArrayItem<T> = T extends (infer L)[] ? L : never
type case_Q67_1 = Expect<Equal<ArrayItem<number[]>, number>>
type case_Q67_2 = Expect<Equal<ArrayItem<(string | boolean)[]>, string | boolean>>


// ------------------------------------------------------------
// Q68. First：取元组首元素（用 infer）
// ------------------------------------------------------------
type First<T extends readonly any[]> = T extends readonly [infer F, ...infer _Rest] ? F : never
type case_Q68_1 = Expect<Equal<First<[1, 2, 3]>, 1>>
type case_Q68_2 = Expect<Equal<First<[]>, never>>


// ------------------------------------------------------------
// Q69. Last：取元组末元素（用 infer + rest）
// ------------------------------------------------------------
type Last<T extends readonly any[]> = T extends [...infer F, infer L] ? L : never
type case_Q69_1 = Expect<Equal<Last<[1, 2, 3]>, 3>>
type case_Q69_2 = Expect<Equal<Last<['a']>, 'a'>>


// ------------------------------------------------------------
// Q70. Pop：去掉元组末元素
// ------------------------------------------------------------
type Pop<T extends readonly any[]> = T extends [...infer R, any] ? R : []
type case_Q70 = Expect<Equal<Pop<[1, 2, 3]>, [1, 2]>>


// ------------------------------------------------------------
// Q71. Shift：去掉元组首元素
// ------------------------------------------------------------
type Shift<T extends readonly any[]> = T extends [infer F, ...infer R] ? R : []
type case_Q71 = Expect<Equal<Shift<[1, 2, 3]>, [2, 3]>>


// ------------------------------------------------------------
// Q72. Reverse：反转元组（递归）
// ------------------------------------------------------------
type Reverse<T extends readonly any[]> = T extends [infer F, ...infer R] ? [...Reverse<R>, F] : []
type case_Q72 = Expect<Equal<Reverse<[1, 2, 3]>, [3, 2, 1]>>


// ------------------------------------------------------------
// Q73. Length<T>：取元组长度
// ------------------------------------------------------------
type Length<T extends readonly any[]> = T['length']
type case_Q73 = Expect<Equal<Length<['a', 'b', 'c', 'd']>, 4>>


// ------------------------------------------------------------
// Q74. UnionToIntersection<U>：联合 → 交叉
// 'a' | 'b'  →  'a' & 'b'   （高级用法，面试常考）
// 提示：函数参数逆变 + infer
// ------------------------------------------------------------
type UnionToIntersection<U> =
  (U extends any ? (x: U) => any : never) extends (x: infer R) => any ? R : never
type case_Q74 = Expect<Equal<
  UnionToIntersection<{ a: string } | { b: number }>,
  { a: string } & { b: number }
>>


// ------------------------------------------------------------
// Q75. 分布式条件类型陷阱
// 用 [T] extends [U] 包裹可以"禁用"分布
// 写一个 IsNever<T>：T 是 never 时返回 true
// 错误写法：T extends never ? true : false  →  会得到 never
// ------------------------------------------------------------
type MyIsNever<T> = [T] extends [never] ? true : false
type case_Q75_1 = Expect<Equal<MyIsNever<never>, true>>
type case_Q75_2 = Expect<Equal<MyIsNever<string>, false>>


// ------------------------------------------------------------
// Q76. IsAny<T>：判断是否为 any
// 提示：any 的特性：0 extends (1 & T) ? true : false
// ------------------------------------------------------------
type MyIsAny<T> = 0 extends (1 & T) ? true : false
type case_Q76_1 = Expect<Equal<MyIsAny<any>, true>>
type case_Q76_2 = Expect<Equal<MyIsAny<unknown>, false>>
type case_Q76_3 = Expect<Equal<MyIsAny<string>, false>>


// ------------------------------------------------------------
// Q77. TupleToUnion<T>：元组转联合
// ------------------------------------------------------------
type TupleToUnion<T extends readonly any[]> = T[number]
type case_Q77 = Expect<Equal<TupleToUnion<['a', 'b', 'c']>, 'a' | 'b' | 'c'>>


// ------------------------------------------------------------
// Q78. Includes<T, U>：判断元组中是否包含 U（要严格相等）
// ------------------------------------------------------------
type Includes<T extends readonly any[], U> =
  T extends [infer F, ...infer R] ? Equal<F, U> extends true ? true : Includes<R, U> : false
type case_Q78_1 = Expect<Equal<Includes<[1, 2, 3], 2>, true>>
type case_Q78_2 = Expect<Equal<Includes<[1, 2, 3], 4>, false>>
type case_Q78_3 = Expect<Equal<Includes<[boolean], true>, false>>  // 严格相等！


// ------------------------------------------------------------
// Q79. Flatten<T>：浅层展开元组（一层）
// [1, [2, 3], [4]]  →  [1, 2, 3, 4]
// ------------------------------------------------------------
type Flatten<T extends readonly any[]> =
  T extends [infer F, ...infer R]
    ? F extends readonly any[]
      ? [...F, ...Flatten<R>]
      : [F, ...Flatten<R>]
    : []
type case_Q79 = Expect<Equal<Flatten<[1, [2, 3], [4]]>, [1, 2, 3, 4]>>


// ------------------------------------------------------------
// Q80. PromiseValue<T>：递归解包嵌套的 Promise
// 自己实现一个完整的 Awaited
// ------------------------------------------------------------
type PromiseValue<T> = T extends Promise<infer P> ? PromiseValue<P> : T
type case_Q80_1 = Expect<Equal<PromiseValue<Promise<Promise<Promise<string>>>>, string>>
type case_Q80_2 = Expect<Equal<PromiseValue<number>, number>>
