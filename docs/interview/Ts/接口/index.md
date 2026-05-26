# 说说你对 TypeScript 中接口的理解？应用场景？
类是面向对象程序设计实现信息封装的基础
ES6之后，就有了class关键字，虽然本质依然是构造函数

## Q: interface 与 type 的区别？

**A:**

| 能力 | `interface` | `type` |
|------|-------------|--------|
| 描述对象/类结构 | ✅ | ✅ |
| 联合类型 | ❌ | ✅ `type A = B \| C` |
| 交叉类型 | 用 `extends` | ✅ `type A = B & C` |
| 声明合并（重复声明叠加） | ✅ 同名自动合并 | ❌ 报错 |
| 映射类型 | ❌ | ✅ |
| 可被 `class implements` | ✅ | ✅（对象类型时）|

```typescript
// interface：声明合并（适合开放 API / 第三方库扩展）
interface Window {
  myCustomProp: string  // 合并到内置 Window 类型
}

// type：联合、交叉、映射
type ID = string | number
type Admin = User & { role: 'admin' }

// 映射类型（只能用 type）
type Optional<T> = { [K in keyof T]?: T[K] }
```

**选择建议：**
- 描述**对象/类结构**，优先 `interface`（可声明合并、语义更清晰）
- 需要**联合类型、映射类型、条件类型**时，用 `type`
- 公共库 API 首选 `interface`，让使用者可以扩展
- 组件 Props 类型可以用 `interface`（便于声明合并扩展）
