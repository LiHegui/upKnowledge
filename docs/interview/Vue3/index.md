# Vue3 技术要点

## 基础认知篇

## Q: Vue3 相比 Vue2 的核心变化有哪些？

**A:**

1. 响应式从 `Object.defineProperty` 升级为 `Proxy`。
2. 新增 Composition API（`setup`、`ref`、`reactive`）。
3. 编译优化更激进（静态提升、PatchFlags、Block Tree）。
4. 支持 Fragment、Teleport、Suspense。
5. 更完善的 TypeScript 支持与更好的类型推导。
6. 新的 SFC 语法糖：`<script setup>`。

---

## Q: `setup()` 的执行时机是什么？为什么不能用 `this`？

**A:**

`setup()` 在组件创建早期执行（早于 `beforeCreate/created` 逻辑语义），此时组件实例还未完全建立，所以不能使用组件实例 `this`。

可以使用：

1. `props`
2. `emit`
3. `attrs` / `slots` / `expose`

```ts
import { ref, onMounted } from 'vue'

export default {
  setup(props, { emit }) {
    const count = ref(0)
    onMounted(() => console.log('mounted'))
    return { count }
  }
}
```

---

## Q: `<script setup>` 为什么开发体验更好？

**A:**

1. 顶层变量可直接给模板使用，不需要 `return`。
2. 样板代码更少，逻辑更聚合。
3. `defineProps/defineEmits` 类型推导友好。
4. 编译期处理，运行时开销更低。

---

## 响应式与副作用篇

## Q: ref vs reactive

**A:**

1. `ref`：适合基本类型，也可包对象；在 JS 中通过 `.value` 访问。
2. `reactive`：适合对象/数组，直接访问属性。
3. 团队实践通常是：基本类型优先 `ref`，对象状态优先 `reactive`。

```ts
const count = ref(0)
const state = reactive({ user: { name: 'Tom' } })
```

---

## Q: `watch` 和 `watchEffect` 的区别是什么？

**A:**

1. `watch`：显式指定监听源，可拿到新旧值，适合“精准监听”。
2. `watchEffect`：自动收集依赖，默认立即执行，适合“快速副作用联动”。
3. 异步场景下，`watchEffect` 只追踪同步阶段访问到的依赖。

```ts
watch(source, (newVal, oldVal) => {
  // 精准监听
})

watchEffect(() => {
  // 自动依赖收集
})
```

---

## Q: computed vs watch

**A:**

1. 需要“派生状态”时用 `computed`（有缓存、应保持纯函数）。
2. 需要“副作用处理”时用 `watch`（请求、缓存、日志、DOM 操作）。

---

## Q: `nextTick` 的作用是什么？

**A:**

Vue 会把同一轮状态变更合并到异步更新队列。`nextTick` 用于等待这轮 DOM 更新完成后再执行逻辑。

```ts
show.value = true
await nextTick()
inputRef.value?.focus()
```

---

## 生命周期与组件篇

## Q: Vue3 生命周期与 Vue2 的主要映射关系是什么？

**A:**

1. `beforeDestroy` -> `beforeUnmount`
2. `destroyed` -> `unmounted`
3. 组合式 API 对应为 `onMounted`、`onUpdated`、`onUnmounted` 等。

父子挂载顺序（常见）：

父 `beforeMount` -> 子 `beforeMount` -> 子 `mounted` -> 父 `mounted`

---

## Q: Vue3 的 `v-model` 有哪些升级？

**A:**

1. 默认从 `value/input` 改为 `modelValue/update:modelValue`。
2. 支持多个 `v-model`：`v-model:title`、`v-model:visible`。
3. 自定义修饰符能力更清晰。

```vue
<UserForm v-model:name="name" v-model:age="age" />
```

## Q: Vue3 项目中如何更好地结合 TypeScript？

**A:**

核心思路是先约束组件边界，再约束工程链路：组件层保证 Props、Emits、v-model、Store 都有明确类型；工程层用严格配置和持续类型检查兜底。

**推荐落地顺序：**

1. 统一使用 `<script setup lang="ts">`，减少 `this` 推断问题。
2. 先定义组件边界类型：`defineProps`、`defineEmits`、`defineModel`、`defineExpose`。
3. 组合式函数使用泛型（如 `useRequest<T>()`），让复用逻辑天然类型安全。
4. 状态管理（Pinia）显式声明 `state/getters/actions` 类型，避免隐式 `any`。
5. 构建链路中强制执行 `vue-tsc`，把类型检查纳入 CI。

**组件类型示例：**

```vue
<script setup lang="ts">
interface User {
    id: number
    name: string
}

const props = withDefaults(defineProps<{
    list: User[]
    pageSize?: number
}>(), {
    pageSize: 10
})

const emit = defineEmits<{
    change: [id: number]
    remove: [user: User]
}>()

const onSelect = (id: number) => emit('change', id)
</script>
```

| 维度 | 不推荐 | 推荐 |
|------|--------|------|
| Props 定义 | 运行时对象 + 弱约束 | `defineProps<T>()` + `withDefaults` |
| 事件定义 | 字符串随意触发 | `defineEmits` 元组类型 |
| 复用逻辑 | 返回 `any` | 泛型 `useXxx<T>()` |
| 类型检查 | 仅依赖 IDE | `vue-tsc --build` + CI |

> ⚠️ **注意**：TypeScript 只能保证编译期安全，服务端返回数据仍可能不可信；接口边界建议配合运行时校验（如 Zod）。

---

## Q: Vue3 有哪些新特性？

**A:**

Vue3 的核心升级可以从**响应式、API 设计、编译器、组件能力、工程支持**五个维度来梳理：

**1. 响应式系统重写：Proxy 替代 Object.defineProperty**

| 能力 | Vue 2（defineProperty）| Vue 3（Proxy）|
|------|----------------------|--------------|
| 监听新增属性 | ❌ 需要 `Vue.set` | ✅ 自动拦截 |
| 监听数组索引/length | ❌ 需要重写数组方法 | ✅ 原生支持 |
| 性能 | 初始化时递归遍历 | 懒代理，访问时才处理 |

**2. Composition API（组合式 API）**

```vue
<script setup>
import { ref, computed, onMounted } from 'vue'

const count = ref(0)
const double = computed(() => count.value * 2)

onMounted(() => console.log('挂载完成'))
</script>
```

- `setup()` / `<script setup>`：取代 Options API 的生命周期和 data/methods
- `ref` / `reactive`：响应式数据
- `computed` / `watch` / `watchEffect`：衍生状态与副作用
- 逻辑可抽为**组合函数（composable）**，比 mixin 更清晰无冲突

**3. 新组件：Fragment、Teleport、Suspense**

```vue
<!-- Fragment：模板不再需要单个根节点 -->
<template>
  <h1>标题</h1>
  <p>内容</p>
</template>

<!-- Teleport：将内容渲染到 DOM 树的任意位置 -->
<Teleport to="body">
  <Modal />
</Teleport>

<!-- Suspense：异步组件加载时的占位 -->
<Suspense>
  <template #default><AsyncComponent /></template>
  <template #fallback><Loading /></template>
</Suspense>
```

**4. 编译器优化（性能大幅提升）**

| 优化手段 | 说明 |
|---------|------|
| 静态提升（Static Hoisting） | 不含响应式依赖的节点提升到 render 外，只创建一次 |
| Patch Flags | 给动态节点打标记，diff 时只对比有标记的部分 |
| Block Tree | 按动态块组织 VNode，跳过静态节点 |
| Tree-shaking | 运行时模块化，按需引入（`createApp` 等），核心仅 ~10KB gzip |

**5. 更好的 TypeScript 支持**

- 完全用 TypeScript 重写，内置类型定义更精确
- `defineProps<T>()` / `defineEmits<T>()` 支持泛型
- `<script setup lang="ts">` 配合 `vue-tsc` 实现编译期类型检查

**6. 其他重要变化**

- `v-model` 升级：支持多个 `v-model:xxx`，默认 prop 由 `value` 改为 `modelValue`
- 状态管理推荐 **Pinia**（轻量、无 mutation、更好的 TS 支持）
- 生命周期重命名：`beforeDestroy` → `onBeforeUnmount`，`destroyed` → `onUnmounted`
- `emits` 选项显式声明组件事件，避免与原生事件冲突

---

## Q: Vue3 组件通信方式有哪些？

**A:**

1. 父子：`props` / `emit`。
2. 跨层：`provide` / `inject`。
3. 组件暴露：`defineExpose`。
4. 全局共享：Pinia。

---

## 渲染优化篇

## Q: Vue3 Diff 做了哪些关键优化？

**A:**

1. 静态提升（`hoistStatic`）：静态节点只创建一次。
2. PatchFlags：只追踪动态部分，减少无效比对。
3. Block Tree：按动态块组织，缩小 diff 范围。
4. keyed diff 中使用最长递增子序列（LIS）减少 DOM 移动。

> ⚠️ **注意**：列表渲染要使用稳定、唯一的 `key`，避免复用错误。

---

## Q: 为什么 Vue3 在性能上通常优于 Vue2？

**A:**

1. 响应式代理能力更完整（对象新增属性、数组场景处理更自然）。
2. 编译器能在构建期标记静态与动态边界。
3. 运行时 patch 更精准，减少不必要更新。

---

## 工程实践篇

## Q: Pinia vs Vuex和 Vuex 的区别是什么？

**A:**

1. API 更轻量：没有强制 mutation 层。
2. 与 Composition API 更贴合。
3. TypeScript 推导体验更好。
4. store 拆分更自然，心智负担更低。

---

## Q: 在 Vue3 项目里常见的最佳实践有哪些？

**A:**

1. 优先使用 `<script setup>` + TypeScript。
2. 业务状态放到 Pinia，组件内部状态放局部。
3. 可复用逻辑抽成组合函数（`useXxx`）。
4. 列表必须使用稳定 `key`，避免 `index` 作为唯一标识。
5. 副作用逻辑（请求、埋点）集中在 `watch`/hooks，保持 `computed` 纯净。

---
