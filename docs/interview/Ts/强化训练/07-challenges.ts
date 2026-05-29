// ============================================================
// 第 07 阶段：综合类型体操（8 题）—— 决战面试场
// 这一阶段题难度较大，每道题都综合了前面所有知识
// 强烈建议：每题至少思考 15 分钟再翻 solutions.ts
// ============================================================
import type { Expect, Equal } from './_utils'

// ------------------------------------------------------------
// Q93. Chainable Options
// 实现一个 option 方法可链式调用，最终 get 返回累积类型
//
// const result = chainable
//   .option('foo', 123)
//   .option('bar', 'hello')
//   .option('name', 'type-challenges')
//   .get()
//
// result 的类型应为：
//   { foo: number; bar: string; name: string }
// ------------------------------------------------------------
type Chainable<O = {}> = any
declare const chainable_q93: Chainable
const result_q93 = chainable_q93
  .option('foo', 123)
  .option('bar', 'hello')
  .option('name', 'type-challenges')
  .get()
type case_Q93 = Expect<Equal<
  typeof result_q93,
  { foo: number; bar: string; name: string }
>>


// ------------------------------------------------------------
// Q94. 深度获取对象路径的值
// 形如 lodash 的 _.get
// type V = DeepGet<{ a: { b: { c: 1 } } }, 'a.b.c'>  →  1
// type V2 = DeepGet<{ a: { b: { c: 1 } } }, 'a.b'>   →  { c: 1 }
// type V3 = DeepGet<{ a: 1 }, 'a.b'>                 →  never
// ------------------------------------------------------------
type DeepGet<T, Path extends string> = any
type case_Q94_1 = Expect<Equal<DeepGet<{ a: { b: { c: 1 } } }, 'a.b.c'>, 1>>
type case_Q94_2 = Expect<Equal<DeepGet<{ a: { b: { c: 1 } } }, 'a.b'>, { c: 1 }>>
type case_Q94_3 = Expect<Equal<DeepGet<{ a: 1 }, 'a.b'>, never>>


// ------------------------------------------------------------
// Q95. ParseURLParams
// 从 URL 路径里提取所有 :param
// ParseURLParams<'/user/:id/post/:postId'>  →  'id' | 'postId'
// ParseURLParams<'/static'>                  →  never
// ------------------------------------------------------------
type ParseURLParams<S extends string> = any
type case_Q95_1 = Expect<Equal<ParseURLParams<'/user/:id/post/:postId'>, 'id' | 'postId'>>
type case_Q95_2 = Expect<Equal<ParseURLParams<'/static'>, never>>


// ------------------------------------------------------------
// Q96. EventEmitter 类型签名
// 实现一个 EventBus 类型，给定事件映射，emit/on 都要类型安全
//
// type Events = {
//   login: [user: string, time: number]
//   logout: []
// }
//
// 写一个 EventBus<Events>，要求：
//   bus.on('login', (user, time) => {})   // user: string, time: number ✅
//   bus.emit('login', 'alice', 123)        // ✅
//   bus.emit('login', 'alice')             // ❌ 缺参数
//   bus.on('xxx', ...)                     // ❌ 未注册事件
// ------------------------------------------------------------
type EventBus<E extends Record<string, any[]>> = any
type Events_Q96 = {
  login: [user: string, time: number]
  logout: []
}
declare const bus_q96: EventBus<Events_Q96>
bus_q96.on('login', (user, time) => {
  type _u = Expect<Equal<typeof user, string>>
  type _t = Expect<Equal<typeof time, number>>
})
bus_q96.emit('login', 'alice', 123)
bus_q96.emit('logout')
// @ts-expect-error  未注册事件
bus_q96.on('hack', () => {})
// @ts-expect-error  参数不足
bus_q96.emit('login', 'alice')


// ------------------------------------------------------------
// Q97. KebabCase 对象 key 全部转驼峰
// { 'foo-bar': string; 'baz-qux': number }
// → { fooBar: string; bazQux: number }
// 提示：as 重映射 + 之前的 CamelCase
// ------------------------------------------------------------
type CamelCase_Q97<S extends string> =
  S extends `${infer A}-${infer B}${infer C}`
    ? `${A}${Uppercase<B>}${CamelCase_Q97<C>}`
    : S
type CamelCaseKeys<T> = any
type case_Q97 = Expect<Equal<
  CamelCaseKeys<{ 'foo-bar': string; 'baz-qux': number }>,
  { fooBar: string; bazQux: number }
>>


// ------------------------------------------------------------
// Q98. 累加运算（类型层面的加法）
// Add<3, 5>  →  8
// 提示：用元组长度
// 限制：仅支持小整数（0 ~ 50 左右），不要追求工业级实现
// ------------------------------------------------------------
type Add<A extends number, B extends number> = any
type case_Q98_1 = Expect<Equal<Add<3, 5>, 8>>
type case_Q98_2 = Expect<Equal<Add<0, 7>, 7>>


// ------------------------------------------------------------
// Q99. ObjectEntries：仿照 Object.entries 的类型
// ObjectEntries<{ a: 1; b: 'hi' }>  →  ['a', 1] | ['b', 'hi']
// ------------------------------------------------------------
type ObjectEntries<T> = any
type case_Q99 = Expect<Equal<
  ObjectEntries<{ a: 1; b: 'hi' }>,
  ['a', 1] | ['b', 'hi']
>>


// ------------------------------------------------------------
// Q100. 终极挑战：JSON 类型
// 实现一个 JSONValue 类型，使得：
//   const j: JSONValue = {
//     a: 1, b: 'x', c: null, d: true, e: [1, '2', { x: 3 }]
//   }   // ✅
//   const k: JSONValue = { f: () => {} }   // ❌ 函数不合法
//   const m: JSONValue = { g: undefined }  // ❌ undefined 不合法
// ------------------------------------------------------------
type JSONValue = any
const j_q100: JSONValue = {
  a: 1,
  b: 'x',
  c: null,
  d: true,
  e: [1, '2', { x: 3 }],
}
// @ts-expect-error  函数不合法
const k_q100: JSONValue = { f: () => {} }
// @ts-expect-error  undefined 不合法
const m_q100: JSONValue = { g: undefined }
