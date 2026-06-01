// ============================================================
// 第 01 阶段：基础类型（15 题）
// 目标：熟悉字面量、联合、元组、可选、只读、字面量类型推断
// ============================================================
import type { Expect, Equal, NotEqual } from './_utils'

// ------------------------------------------------------------
// Q1. 把 any 替换成"只接受字符串 'red' | 'green' | 'blue' 的类型"
// ------------------------------------------------------------
type Q1 = any
type case_Q1 = Expect<Equal<Q1, 'red' | 'green' | 'blue'>>


// ------------------------------------------------------------
// Q2. 写一个元组类型 [string, number, boolean]
// ------------------------------------------------------------
type Q2 = any
type case_Q2 = Expect<Equal<Q2, [string, number, boolean]>>


// ------------------------------------------------------------
// Q3. 写一个对象类型：name 必填 string，age 可选 number
// ------------------------------------------------------------
type Q3 = any
type case_Q3_1 = Expect<Equal<Q3, { name: string; age?: number }>>


// ------------------------------------------------------------
// Q4. 把下面这个对象的所有字段都改成 readonly
// 原始：{ id: number; title: string }
// ------------------------------------------------------------
type Q4 = any
type case_Q4 = Expect<Equal<Q4, { readonly id: number; readonly title: string }>>


// ------------------------------------------------------------
// Q5. 类型 Q5 必须满足：要么是 string，要么是 string[]
// ------------------------------------------------------------
type Q5 = any
type case_Q5_1 = Expect<Equal<Q5, string | string[]>>


// ------------------------------------------------------------
// Q6. 给定值 const obj = { a: 1, b: 'hi' } as const
//     写出 Q6 等价于 typeof obj 的类型
// ------------------------------------------------------------
const obj_q6 = { a: 1, b: 'hi' } as const
type Q6 = any
type case_Q6 = Expect<Equal<Q6, { readonly a: 1; readonly b: 'hi' }>>


// ------------------------------------------------------------
// Q7. 联合类型去除 null / undefined
// 输入：string | number | null | undefined
// 输出：string | number
// ------------------------------------------------------------
type Input_Q7 = string | number | null | undefined
type Q7 = any  // 不要直接写 string | number，要从 Input_Q7 派生
type case_Q7 = Expect<Equal<Q7, string | number>>


// ------------------------------------------------------------
// Q8. 元组转联合类型
// 输入：['a', 'b', 'c']
// 输出：'a' | 'b' | 'c'
// ------------------------------------------------------------
type Input_Q8 = ['a', 'b', 'c']
type Q8 = any
type case_Q8 = Expect<Equal<Q8, 'a' | 'b' | 'c'>>


// ------------------------------------------------------------
// Q9. 元组长度
// 输入：[string, number, boolean]
// 输出：3
// ------------------------------------------------------------
type Input_Q9 = [string, number, boolean]
type Q9 = any
type case_Q9 = Expect<Equal<Q9, 3>>


// ------------------------------------------------------------
// Q10. 元组首元素
// 输入：[1, 2, 3]
// 输出：1
// ------------------------------------------------------------
type Q10<T extends readonly any[]> = any
type case_Q10_1 = Expect<Equal<Q10<[1, 2, 3]>, 1>>
type case_Q10_2 = Expect<Equal<Q10<['x', 'y']>, 'x'>>
type case_Q10_3 = Expect<Equal<Q10<[]>, never>>  // 空元组返回 never


// ------------------------------------------------------------
// Q11. 元组末元素
// ------------------------------------------------------------
type Q11<T extends readonly any[]> = any
type case_Q11_1 = Expect<Equal<Q11<[1, 2, 3]>, 3>>
type case_Q11_2 = Expect<Equal<Q11<['a']>, 'a'>>


// ------------------------------------------------------------
// Q12. 数组类型 → 元素类型
// 输入：string[]    输出：string
// 输入：(number | boolean)[]    输出：number | boolean
// ------------------------------------------------------------
type Q12<T> = any
type case_Q12_1 = Expect<Equal<Q12<string[]>, string>>
type case_Q12_2 = Expect<Equal<Q12<(number | boolean)[]>, number | boolean>>


// ------------------------------------------------------------
// Q13. 判断类型是否为 string
// ------------------------------------------------------------
type IsString<T> = any
type case_Q13_1 = Expect<Equal<IsString<'hello'>, true>>
type case_Q13_2 = Expect<Equal<IsString<123>, false>>


// ------------------------------------------------------------
// Q14. If<C, T, F>：条件 C 为 true 返回 T，否则返回 F
// 约束：C 只能传 boolean
// ------------------------------------------------------------
type If<C extends boolean, T, F> = any
type case_Q14_1 = Expect<Equal<If<true, 'a', 'b'>, 'a'>>
type case_Q14_2 = Expect<Equal<If<false, 'a', 'b'>, 'b'>>
// @ts-expect-error  C 不能是 null
type case_Q14_3 = If<null, 'a', 'b'>


// ------------------------------------------------------------
// Q15. Concat：拼接两个元组
// Concat<[1, 2], [3, 4]>  =>  [1, 2, 3, 4]
// ------------------------------------------------------------
type Concat<A extends readonly any[], B extends readonly any[]> = any
type case_Q15_1 = Expect<Equal<Concat<[1, 2], [3, 4]>, [1, 2, 3, 4]>>
type case_Q15_2 = Expect<Equal<Concat<[], ['a']>, ['a']>>
