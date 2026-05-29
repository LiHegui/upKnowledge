// ============================================================
// 第 06 阶段：映射类型 + 模板字面量类型（12 题）
// 目标：as 重映射、模板字面量的 infer、字符串级别的类型操作
// ============================================================
import type { Expect, Equal } from './_utils'

// ------------------------------------------------------------
// Q81. 把所有 key 加上 'get' 前缀并首字母大写
// { name: string; age: number }
// → { getName: string; getAge: number }
// ------------------------------------------------------------
type GettersOfShape<T> = any
type case_Q81 = Expect<Equal<
  GettersOfShape<{ name: string; age: number }>,
  { getName: string; getAge: number }
>>


// ------------------------------------------------------------
// Q82. Getters<T>：把每个属性变成对应的 getter 函数
// { name: string; age: number }
// → { getName: () => string; getAge: () => number }
// ------------------------------------------------------------
type Getters<T> = any
type case_Q82 = Expect<Equal<
  Getters<{ name: string; age: number }>,
  { getName: () => string; getAge: () => number }
>>


// ------------------------------------------------------------
// Q83. 移除某些 key（as 重映射 + never 过滤）
// 移除 key 'a' 和 'b'
// ------------------------------------------------------------
type RemoveKeys<T, K extends keyof any> = any
type case_Q83 = Expect<Equal<
  RemoveKeys<{ a: 1; b: 2; c: 3 }, 'a' | 'b'>,
  { c: 3 }
>>


// ------------------------------------------------------------
// Q84. StartsWith<S, P>：S 是否以 P 开头
// ------------------------------------------------------------
type StartsWith<S extends string, P extends string> = any
type case_Q84_1 = Expect<Equal<StartsWith<'hello world', 'hello'>, true>>
type case_Q84_2 = Expect<Equal<StartsWith<'hello world', 'world'>, false>>


// ------------------------------------------------------------
// Q85. EndsWith<S, P>：S 是否以 P 结尾
// ------------------------------------------------------------
type EndsWith<S extends string, P extends string> = any
type case_Q85 = Expect<Equal<EndsWith<'hello world', 'world'>, true>>


// ------------------------------------------------------------
// Q86. Replace<S, From, To>：替换第一次出现
// Replace<'abc', 'b', 'X'>  →  'aXc'
// ------------------------------------------------------------
type Replace<S extends string, From extends string, To extends string> = any
type case_Q86_1 = Expect<Equal<Replace<'abc', 'b', 'X'>, 'aXc'>>
type case_Q86_2 = Expect<Equal<Replace<'abc', '', 'X'>, 'abc'>>


// ------------------------------------------------------------
// Q87. ReplaceAll<S, From, To>：替换所有出现
// ReplaceAll<'abab', 'a', 'X'>  →  'XbXb'
// ------------------------------------------------------------
type ReplaceAll<S extends string, From extends string, To extends string> = any
type case_Q87 = Expect<Equal<ReplaceAll<'abab', 'a', 'X'>, 'XbXb'>>


// ------------------------------------------------------------
// Q88. Trim<S>：删除两侧空白（空格、\n、\t）
// ------------------------------------------------------------
type Trim<S extends string> = any
type case_Q88_1 = Expect<Equal<Trim<'  hello  '>, 'hello'>>
type case_Q88_2 = Expect<Equal<Trim<'\n\t foo \t\n'>, 'foo'>>


// ------------------------------------------------------------
// Q89. Split<S, Sep>：按分隔符切分成元组
// Split<'a,b,c', ','>  →  ['a', 'b', 'c']
// ------------------------------------------------------------
type Split<S extends string, Sep extends string> = any
type case_Q89_1 = Expect<Equal<Split<'a,b,c', ','>, ['a', 'b', 'c']>>
type case_Q89_2 = Expect<Equal<Split<'abc', ''>, ['a', 'b', 'c']>>


// ------------------------------------------------------------
// Q90. Join<T, Sep>：把元组用 Sep 拼接成字符串
// Join<['a', 'b', 'c'], '-'>  →  'a-b-c'
// ------------------------------------------------------------
type Join<T extends readonly string[], Sep extends string> = any
type case_Q90_1 = Expect<Equal<Join<['a', 'b', 'c'], '-'>, 'a-b-c'>>
type case_Q90_2 = Expect<Equal<Join<['hello'], ','>, 'hello'>>


// ------------------------------------------------------------
// Q91. CamelCase<S>：连字符 → 驼峰
// CamelCase<'foo-bar-baz'>  →  'fooBarBaz'
// ------------------------------------------------------------
type CamelCase<S extends string> = any
type case_Q91_1 = Expect<Equal<CamelCase<'foo-bar-baz'>, 'fooBarBaz'>>
type case_Q91_2 = Expect<Equal<CamelCase<'foo'>, 'foo'>>


// ------------------------------------------------------------
// Q92. KebabCase<S>：驼峰 → 连字符
// KebabCase<'fooBarBaz'>  →  'foo-bar-baz'
// ------------------------------------------------------------
type KebabCase<S extends string> = any
type case_Q92 = Expect<Equal<KebabCase<'fooBarBaz'>, 'foo-bar-baz'>>
