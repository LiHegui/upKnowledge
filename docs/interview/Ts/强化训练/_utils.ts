// ============================================================
// 类型断言工具（type-challenges 同款）
// 用法：type case = Expect<Equal<你的答案, 期望类型>>
// 答案正确 → tsc 通过；答案错误 → 立刻报错
// ============================================================

export type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2)
    ? true
    : false

export type NotEqual<X, Y> = Equal<X, Y> extends true ? false : true

export type Expect<T extends true> = T
export type ExpectFalse<T extends false> = T

export type IsAny<T> = 0 extends 1 & T ? true : false
export type IsNever<T> = [T] extends [never] ? true : false
export type IsUnion<T, U = T> = T extends U ? ([U] extends [T] ? false : true) : never

// 调试时使用：把它放在某个位置看推导结果
export type Debug<T> = { [K in keyof T]: T[K] }
