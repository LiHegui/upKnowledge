// ============================================================
// 100 题参考答案 —— 卡住再看，每题至少自己想 10 分钟
// ============================================================

/* ===== 第 01 阶段 基础类型 ===== */

// Q1
type S_Q1 = 'red' | 'green' | 'blue'

// Q2
type S_Q2 = [string, number, boolean]

// Q3
type S_Q3 = { name: string; age?: number }

// Q4
type S_Q4 = { readonly id: number; readonly title: string }

// Q5
type S_Q5 = string | string[]

// Q6  —— typeof + as const
type S_Q6 = { readonly a: 1; readonly b: 'hi' }

// Q7  —— Exclude / NonNullable 思路
type S_Q7 = Exclude<string | number | null | undefined, null | undefined>
// 等价：type S_Q7 = NonNullable<string | number | null | undefined>

// Q8  —— 元组 T[number] 转联合
type S_Q8 = ['a', 'b', 'c'][number]

// Q9  —— 'length' 属性
type S_Q9 = [string, number, boolean]['length']

// Q10  —— 索引取首
type S_Q10<T extends readonly any[]> = T extends readonly [infer F, ...any[]] ? F : never

// Q11  —— rest + infer
type S_Q11<T extends readonly any[]> = T extends readonly [...any[], infer L] ? L : never

// Q12  —— 数组元素提取
type S_Q12<T> = T extends (infer U)[] ? U : never

// Q13
type S_IsString<T> = T extends string ? true : false

// Q14
type S_If<C extends boolean, T, F> = C extends true ? T : F

// Q15  —— 扩展运算符
type S_Concat<A extends readonly any[], B extends readonly any[]> = [...A, ...B]


/* ===== 第 02 阶段 函数与泛型 ===== */

// Q16  —— 泛型函数类型
type S_Identity = <T>(arg: T) => T

// Q17  —— 约束 length
type S_HasLength = { length: number }
// declare function logLen_q17<T extends S_HasLength>(arg: T): void

// Q18  —— 默认值
// type Box_Q18<T = string> = { value: T }

// Q19
type S_MyParameters<T> = T extends (...args: infer P) => any ? P : never

// Q20
type S_MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never

// Q21  —— 递归 Awaited
type S_MyAwaited<T> = T extends Promise<infer U> ? S_MyAwaited<U> : T

// Q22  —— ThisParameterType 思路
type S_ThisType<T> = T extends (this: infer U, ...args: any[]) => any ? U : never

// Q23  —— TS 重载推导默认取最后一个
type S_Q23 = ReturnType<typeof q23_decl>
declare function q23_decl(): void
declare function q23_decl(x: string): string

// Q24
type S_Curry2<F> = F extends (a: infer A, b: infer B) => infer R
  ? (a: A) => (b: B) => R
  : never

// Q25  —— PromiseAll
// declare function promiseAll_q25<T extends readonly any[]>(
//   values: readonly [...T]
// ): Promise<{ [K in keyof T]: T[K] extends Promise<infer U> ? U : T[K] }>

// Q26
type S_Compose2<F, G> = F extends (b: infer B) => infer C
  ? G extends (a: infer A) => B
    ? (a: A) => C
    : never
  : never

// Q27
type S_TupleToFn<T extends readonly any[]> = (...args: [...T]) => void

// Q28
type S_MethodKeys<T> = {
  [K in keyof T]: T[K] extends (...args: any) => any ? K : never
}[keyof T]

// Q29
type S_MyCapitalize<S extends string> =
  S extends `${infer First}${infer Rest}` ? `${Uppercase<First>}${Rest}` : S

// Q30
type S_AppendArgument<F, A> = F extends (...args: infer P) => infer R
  ? (user: A, ...args: P) => R
  : never


/* ===== 第 03 阶段 keyof / typeof ===== */

// Q31
type S_Q31 = keyof { id: number; name: string; age: number; email?: string }

// Q32
type S_Q32 = { id: number; name: string; age: number; email?: string }[
  keyof { id: number; name: string; age: number; email?: string }
]

// Q33
type S_Q33 = { a: string; b: { c: number } }['b']['c']

// Q34
type S_Q34 = (typeof q34_arr)[number]
const q34_arr = ['red', 'green', 'blue'] as const

// Q35
type S_Q35 = { port: number; host: string }

// Q36
type S_Q36 = 'circle'

// Q37
type S_MyPick<T, K extends keyof T> = { [P in K]: T[P] }

// Q38
type S_MyOmit<T, K extends keyof any> = { [P in keyof T as P extends K ? never : P]: T[P] }

// Q39
type S_StringKeys<T> = { [K in keyof T]: T[K] extends string ? K : never }[keyof T]

// Q40
type S_FilterStringProps<T> = { [K in keyof T as T[K] extends string ? K : never]: T[K] }

// Q41
type S_UppercaseKeys<T> = { [K in keyof T as K extends string ? Uppercase<K> : K]: T[K] }

// Q42
type S_Flip<T extends Record<string, string>> = { [K in keyof T as T[K]]: K }

// Q43
type S_Eventify<T> = {
  [K in keyof T as K extends string ? `on${Capitalize<K>}` : never]: T[K]
}

// Q44
type S_MyInstanceType<T extends abstract new (...args: any) => any> =
  T extends abstract new (...args: any) => infer R ? R : never

// Q45
type S_MyConstructorParameters<T extends abstract new (...args: any) => any> =
  T extends abstract new (...args: infer P) => any ? P : never


/* ===== 第 04 阶段 内置工具类型 ===== */

// Q46
type S_MyPartial<T> = { [K in keyof T]?: T[K] }

// Q47
type S_MyRequired<T> = { [K in keyof T]-?: T[K] }

// Q48
type S_MyReadonly<T> = { readonly [K in keyof T]: T[K] }

// Q49
type S_Mutable<T> = { -readonly [K in keyof T]: T[K] }

// Q50
type S_MyRecord<K extends keyof any, V> = { [P in K]: V }

// Q51  —— 分布式条件类型
type S_MyExclude<T, U> = T extends U ? never : T

// Q52
type S_MyExtract<T, U> = T extends U ? T : never

// Q53
type S_MyNonNullable<T> = T extends null | undefined ? never : T

// Q54  —— 同 Q19

// Q55  —— 同 Q20

// Q56  —— 同 Q21

// Q57  DeepReadonly
type S_DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? S_DeepReadonly<T[K]> : T[K]
}

// Q58  DeepPartial
type S_DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? S_DeepPartial<T[K]> : T[K]
}

// Q59  PickByValue
type S_PickByValue<T, V> = { [K in keyof T as T[K] extends V ? K : never]: T[K] }

// Q60  OmitByValue
type S_OmitByValue<T, V> = { [K in keyof T as T[K] extends V ? never : K]: T[K] }

// Q61  RequiredKeys —— 关键技巧：用 {} 测试可选性
type S_RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K
}[keyof T]

// Q62  OptionalKeys
type S_OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never
}[keyof T]

// Q63  Merge —— 后者覆盖前者
type S_Merge<A, B> = {
  [K in keyof A | keyof B]: K extends keyof B
    ? B[K]
    : K extends keyof A
      ? A[K]
      : never
}

// Q64  PartialByKeys —— & 合并后用展开规整
type Compute_<T> = { [K in keyof T]: T[K] } & {}
type S_PartialByKeys<T, K extends keyof T = keyof T> = Compute_<
  Omit<T, K> & Partial<Pick<T, K>>
>

// Q65  RequiredByKeys
type S_RequiredByKeys<T, K extends keyof T = keyof T> = Compute_<
  Omit<T, K> & Required<Pick<T, K>>
>


/* ===== 第 05 阶段 条件类型与 infer ===== */

// Q66
type S_IsArray<T> = T extends any[] ? true : false

// Q67
type S_ArrayItem<T> = T extends (infer U)[] ? U : never

// Q68
type S_First<T extends readonly any[]> = T extends readonly [infer F, ...any[]] ? F : never

// Q69
type S_Last<T extends readonly any[]> = T extends readonly [...any[], infer L] ? L : never

// Q70
type S_Pop<T extends readonly any[]> = T extends readonly [...infer Head, any] ? Head : []

// Q71
type S_Shift<T extends readonly any[]> = T extends readonly [any, ...infer Tail] ? Tail : []

// Q72  递归 Reverse
type S_Reverse<T extends readonly any[]> =
  T extends readonly [infer First, ...infer Rest]
    ? [...S_Reverse<Rest>, First]
    : []

// Q73
type S_Length<T extends readonly any[]> = T['length']

// Q74  UnionToIntersection —— 函数参数逆变
type S_UnionToIntersection<U> =
  (U extends any ? (x: U) => void : never) extends (x: infer I) => void ? I : never

// Q75  IsNever —— 用 [T] 包裹防止分布
type S_MyIsNever<T> = [T] extends [never] ? true : false

// Q76  IsAny
type S_MyIsAny<T> = 0 extends 1 & T ? true : false

// Q77
type S_TupleToUnion<T extends readonly any[]> = T[number]

// Q78  Includes —— 严格相等需要用 Equal
type S_Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false
type S_Includes<T extends readonly any[], U> =
  T extends readonly [infer F, ...infer R]
    ? S_Equal<F, U> extends true
      ? true
      : S_Includes<R, U>
    : false

// Q79  Flatten 一层
type S_Flatten<T extends readonly any[]> =
  T extends readonly [infer F, ...infer R]
    ? F extends readonly any[]
      ? [...F, ...S_Flatten<R>]
      : [F, ...S_Flatten<R>]
    : []

// Q80  PromiseValue 递归
type S_PromiseValue<T> = T extends Promise<infer U> ? S_PromiseValue<U> : T


/* ===== 第 06 阶段 映射类型 + 模板字面量 ===== */

// Q81
type S_GettersOfShape<T> = {
  [K in keyof T as K extends string ? `get${Capitalize<K>}` : never]: T[K]
}

// Q82
type S_Getters<T> = {
  [K in keyof T as K extends string ? `get${Capitalize<K>}` : never]: () => T[K]
}

// Q83
type S_RemoveKeys<T, K extends keyof any> = {
  [P in keyof T as P extends K ? never : P]: T[P]
}

// Q84
type S_StartsWith<S extends string, P extends string> =
  S extends `${P}${string}` ? true : false

// Q85
type S_EndsWith<S extends string, P extends string> =
  S extends `${string}${P}` ? true : false

// Q86  Replace 单次
type S_Replace<S extends string, From extends string, To extends string> =
  From extends ''
    ? S
    : S extends `${infer A}${From}${infer B}`
      ? `${A}${To}${B}`
      : S

// Q87  ReplaceAll 递归
type S_ReplaceAll<S extends string, From extends string, To extends string> =
  From extends ''
    ? S
    : S extends `${infer A}${From}${infer B}`
      ? `${A}${To}${S_ReplaceAll<B, From, To>}`
      : S

// Q88  Trim —— 先 TrimLeft 再 TrimRight
type Whitespace = ' ' | '\n' | '\t'
type S_TrimLeft<S extends string> =
  S extends `${Whitespace}${infer R}` ? S_TrimLeft<R> : S
type S_TrimRight<S extends string> =
  S extends `${infer R}${Whitespace}` ? S_TrimRight<R> : S
type S_Trim<S extends string> = S_TrimLeft<S_TrimRight<S>>

// Q89  Split
type S_Split<S extends string, Sep extends string> =
  Sep extends ''
    ? S extends `${infer A}${infer B}`
      ? B extends ''
        ? [A]
        : [A, ...S_Split<B, ''>]
      : []
    : S extends `${infer A}${Sep}${infer B}`
      ? [A, ...S_Split<B, Sep>]
      : [S]

// Q90  Join
type S_Join<T extends readonly string[], Sep extends string> =
  T extends readonly [infer A extends string, ...infer R extends string[]]
    ? R['length'] extends 0
      ? A
      : `${A}${Sep}${S_Join<R, Sep>}`
    : ''

// Q91  CamelCase
type S_CamelCase<S extends string> =
  S extends `${infer A}-${infer B}${infer C}`
    ? `${A}${Uppercase<B>}${S_CamelCase<C>}`
    : S

// Q92  KebabCase
type S_KebabCase<S extends string> =
  S extends `${infer A}${infer B}`
    ? B extends Uncapitalize<B>
      ? `${Uncapitalize<A>}${S_KebabCase<B>}`
      : `${Uncapitalize<A>}-${S_KebabCase<B>}`
    : S


/* ===== 第 07 阶段 综合体操 ===== */

// Q93  Chainable
type S_Chainable<O = {}> = {
  option<K extends string, V>(
    key: K extends keyof O ? never : K,
    value: V
  ): S_Chainable<O & { [P in K]: V }>
  get(): { [K in keyof O]: O[K] }
}

// Q94  DeepGet
type S_DeepGet<T, Path extends string> =
  Path extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? S_DeepGet<T[K], Rest>
      : never
    : Path extends keyof T
      ? T[Path]
      : never

// Q95  ParseURLParams
type S_ParseURLParams<S extends string> =
  S extends `${string}:${infer P}/${infer Rest}`
    ? P | S_ParseURLParams<`/${Rest}`>
    : S extends `${string}:${infer P}`
      ? P
      : never

// Q96  EventBus
type S_EventBus<E extends Record<string, any[]>> = {
  on<K extends keyof E>(event: K, handler: (...args: E[K]) => void): void
  emit<K extends keyof E>(event: K, ...args: E[K]): void
}

// Q97  CamelCaseKeys
type S_CamelCaseKeys<T> = {
  [K in keyof T as K extends string ? S_CamelCase<K> : K]: T[K]
}

// Q98  Add —— 用元组长度做加法
type BuildTuple<L extends number, R extends any[] = []> =
  R['length'] extends L ? R : BuildTuple<L, [any, ...R]>
type S_Add<A extends number, B extends number> =
  [...BuildTuple<A>, ...BuildTuple<B>]['length']

// Q99  ObjectEntries
type S_ObjectEntries<T> = { [K in keyof T]-?: [K, T[K]] }[keyof T]

// Q100  JSONValue
type S_JSONValue =
  | string
  | number
  | boolean
  | null
  | S_JSONValue[]
  | { [key: string]: S_JSONValue }
