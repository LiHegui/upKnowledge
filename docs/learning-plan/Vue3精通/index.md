# Vue3 精通学习计划（五天速通版）

> 开始日期：2026-06-08
> 预计周期：5 天
> 每日时长：2 ~ 2.5 小时
> 当前阶段：Day 1
> 基础情况：会用 Vue（组件 / 模板语法），目标深入原理 + 工程实战，达到「精通」
> 学习方式：**面试题驱动** —— 面试官抛题 → 我作答 → 追问 / 纠正 / 讲解，逐题攻克

---

## 学习方式说明（面试驱动）

本计划采用「以考代学」：每天的知识点拆成一串**由浅入深的面试题**，流程为：

1. 面试官提问（从基础概念到原理追问）
2. 我口述/手写作答
3. 面试官针对答案**追问薄弱点**、纠正错误、补充标准答案
4. 答对则进入下一题，答错则讲解后回炉

> 每题答完后，把「我的答案 + 标准答案差距」记录到当天笔记区，形成错题本。

---

## 学习路线图

| 天数  | 主题                         | 定位            |
| ----- | ---------------------------- | --------------- |
| Day 1 | 响应式系统原理               | 地基 · 原理     |
| Day 2 | Composition API & 组合逻辑   | 核心 · 用法     |
| Day 3 | 编译优化 & 渲染机制          | 进阶 · 原理     |
| Day 4 | 状态管理 · 路由 · TS 工程化  | 生态 · 实战     |
| Day 5 | 性能优化 & 综合实战 + 复盘   | 综合 · 决策     |

---

### Day 1 — 响应式系统原理（reactivity）

**目标**：彻底打通「数据变化 → 视图更新」的链路，能手写一个最小响应式

**面试题清单（由浅入深，逐题攻克）：**

- [x] Q1：Vue3 响应式核心用了什么？相比 Vue2 的 `Object.defineProperty` 强在哪？ ✅ 7.5
- [x] Q2：Proxy 的 get 里为什么要用 `Reflect.get(target, key, receiver)` 而不是 `target[key]`？ ✅ 追问中覆盖
- [x] Q3：依赖收集的数据结构是怎样的？为什么最外层用 `WeakMap`？ ✅ 7
- [x] Q4：`activeEffect` 是干嘛的？依赖是在什么时机被收集进去的？ ✅ 追问中覆盖
- [ ] Q5：`ref` 为什么要 `.value`？模板里为什么又不用写？ 📖 讲解模式，待回炉
- [x] Q6：`reactive` 有哪三大坑？分别怎么解决？ ✅ 6.5（漏了基本类型）
- [ ] Q7：`computed` 的缓存是怎么实现的？`dirty` 标志位的作用？ 📖 讲解模式，待回炉
- [ ] Q8：手写题 —— 实现最小 `reactive` + `effect`，跑通自动更新 ✉️ 未开始

> 参考：知识库 [docs/interview/Vue3/index.md](../../interview/Vue3/index.md)、[docs/interview/JavaScript/index.md](../../interview/JavaScript/index.md) 的 Proxy 响应式实现章节

---

### Day 2 — 回炉 Day1 薄弱点 + Composition API

**目标**：先补欠再推新。上半场回炉 Day1 讲解模式的题，下半场进 Composition API

**面试题清单（由浅入深，逐题攻克）：**

「回炉篇」—— Day1 讲解模式的题，这次你来答：

- [ ] Q1（回炉）：`ref` 为什么要 `.value`？模板里为什么不用写？自动解包对哪些场景生效？
- [ ] Q2（回炉）：computed 的缓存是怎么实现的？说出 dirty 三步走
- [ ] Q3（回炉）：reactive 三大坑 + 解决方案，一个不漏

「Composition API 篇」—— 新内容：

- [ ] Q4：`setup()` 的执行时机是什么？为什么不能用 `this`？
- [ ] Q5：`<script setup>` 是什么？`defineProps`/`defineEmits` 为什么不用 import？
- [ ] Q6：`watch` vs `watchEffect` 的区别？分别适合什么场景？
- [ ] Q7：`provide`/`inject` 怎么保持响应式？传 ref 还是传 .value？
- [ ] Q8：组合式函数（composable）vs mixin，为什么 Vue3 废弃了 mixin？

> 参考：知识库 Vue3 的 `<script setup>`、`setup()` 执行时机、组件通信章节

---

### Day 3 — 编译优化 & 渲染机制（Vue3 为什么快）

**目标**：理解 Vue3 编译时优化策略，能解释「为什么比 Vue2 快」

| 时间  | 内容                                                                  |
| ----- | --------------------------------------------------------------------- |
| 30min | 模板编译流程：template → AST → transform → render 函数                |
| 40min | 静态提升（hoistStatic）、PatchFlag 靶向更新、Block Tree              |
| 30min | Diff 算法：双端 diff + 最长递增子序列（带 key 的列表更新）            |
| 30min | Tree-shaking 友好设计、`Fragment` / `Teleport` / `Suspense`        |
| 20min | 动手：在 Vue SFC Playground 看编译产物，观察 PatchFlag                |

- [ ] 能解释静态提升如何减少重复创建 vnode
- [ ] 理解 PatchFlag 如何让 diff「只比对动态部分」
- [ ] 知道 Block Tree 如何跳过静态节点，把 diff 复杂度从树降到扁平数组
- [ ] 能说出最长递增子序列在 diff 中的作用（最小化 DOM 移动）
- [ ] 动手练习：在 [Vue SFC Playground](https://play.vuejs.org/) 观察 `_hoisted` 和 patchFlag

> 参考：知识库 Vue3「为什么比 Vue2 快」、`diff/`、`性能提升/`、`Treeshaking/` 目录

---

### Day 4 — 状态管理 · 路由 · TS 工程化

**目标**：打通 Vue3 生态，能搭建一个工程化项目骨架

| 时间  | 内容                                                            |
| ----- | --------------------------------------------------------------- |
| 30min | Pinia：`defineStore`、state/getters/actions、对比 Vuex        |
| 30min | Vue Router 4：动态路由、导航守卫、路由懒加载                    |
| 40min | Vue3 + TypeScript：`defineComponent`、props/emits 类型、泛型组件 |
| 20min | Vite 工程化：别名、环境变量、按需引入、构建优化                 |
| 20min | 动手：搭一个 Vite + Vue3 + TS + Pinia + Router 项目骨架         |

- [ ] 能用 Pinia 写一个带 getters 和异步 action 的 store
- [ ] 掌握路由全局守卫做登录拦截
- [ ] 能为组件 props/emits 标注类型，理解 `withDefaults`
- [ ] 动手练习：初始化工程骨架并跑通

> 参考：知识库 Vue3 `pinia/` 目录、Vite、Ts「与项目结合」章节

---

### Day 5 — 性能优化 & 综合实战 + 复盘

**目标**：能做性能决策，串联前四天知识完成一个完整小功能

| 时间  | 内容                                                          |
| ----- | ------------------------------------------------------------- |
| 30min | 性能优化：`v-once`/`v-memo`、`shallowRef`/`shallowReactive`、异步组件 |
| 30min | 大列表优化：虚拟列表、`keep-alive` 缓存策略                   |
| 60min | 综合实战：完成一个待办 / 数据看板小应用（响应式 + 组合函数 + Pinia + 路由）|
| 20min | 复盘：用自己的话讲清「Vue3 一次更新的完整流程」               |

- [ ] 知道何时该用 `shallowRef`，理解深响应式的性能代价
- [ ] 掌握 `v-memo` 的使用场景和限制
- [ ] 完成综合实战小应用并自测
- [ ] 复盘练习：口述「响应式触发 → 重新渲染 → diff → patch」全链路

> 参考：知识库 Vue3「性能提升」、`性能优化/`、`解决方案/虚拟列表/` 目录

---

## 进度追踪

| 阶段                            | 状态       | 完成日期 |
| ------------------------------- | ---------- | -------- |
| Day 1：响应式系统原理           | 🔄 进行中  | -        |
| Day 2：Composition API          | ⏳ 未开始  | -        |
| Day 3：编译优化 & 渲染机制      | ⏳ 未开始  | -        |
| Day 4：状态管理 · 路由 · TS     | ⏳ 未开始  | -        |
| Day 5：性能优化 & 综合实战      | ⏳ 未开始  | -        |

---

## 每日学习记录

### Day 1 — 2026-06-08

**📌 今日目标**：打通响应式原理，手写最小 `reactive` + `effect`，理解依赖收集三层结构

**✏️ 学习笔记**：

<!-- 手动填写：核心概念、知识点总结 -->

**💻 代码练习**：

```js
// 手动填写：手写最小响应式（reactive + effect + track + trigger）
```

**❓ 疑问记录**：

<!-- 学习中遇到的疑问，下次对话时一起解决 -->

**⭐ 总结**：

<!-- 一句话总结今天学到的最重要的东西 -->

---

### Day 2 — 2026-06-09

**📌 今日目标**：掌握 `<script setup>` 全套写法，封装一个可复用 composable

**✏️ 学习笔记**：

<!-- 手动填写 -->

**💻 代码练习**：

```js
// 手动填写：useMouse composable
```

**❓ 疑问记录**：

**⭐ 总结**：

---

### Day 3 — 2026-06-10

**📌 今日目标**：理解编译时优化（静态提升 / PatchFlag / Block Tree），能解释 Vue3 为什么快

**✏️ 学习笔记**：

<!-- 手动填写 -->

**💻 代码练习**：

```js
// 手动填写：Playground 编译产物观察记录
```

**❓ 疑问记录**：

**⭐ 总结**：

---
