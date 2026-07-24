# Pinia 完全指南

> Pinia 是 Vue 3 官方推荐的状态管理库，由 Vuex 核心团队打造，被誉为「Vuex 5」。本文涵盖：核心理念、API、与 Vuex 对比、源码原理、最佳实践等核心考点。

---

## 基础认知篇

## Q: Pinia 是什么？为什么 Vue 官方放弃了 Vuex，转而推荐 Pinia？

**A:**

**Pinia** 是 Vue 生态的状态管理库，由 Vue 核心团队成员 Eduardo San Martin Morote 开发，最初是 Vuex 5 的实验性提案，后独立发布并被 Vue 官方推荐为新一代状态管理方案。

**Vue 官方放弃 Vuex 的核心原因：**

| 痛点 | Vuex 4 | Pinia |
|------|--------|-------|
| **TypeScript 支持** | 极差（需大量手动类型声明） | ✅ 完美（类型自动推导） |
| **API 复杂度** | mutations / actions / getters / modules | 只有 state / getters / actions |
| **mutation 必要性** | 同步修改必须走 mutation | ❌ 取消，actions 即可同步/异步 |
| **模块化** | 嵌套 modules 路径长 `store.state.user.profile.name` | 扁平 store，按需引入 |
| **命名空间** | 需 `namespaced: true` + 字符串拼接 | 每个 store 天然独立 |
| **包体积** | ~10 KB | ~1 KB（极致轻量） |
| **DevTools 支持** | ✅ | ✅（且更强大，含 time-travel） |
| **Composition API 适配** | 一般 | ✅ 原生设计 |
| **SSR 支持** | 复杂 | ✅ 简单 |

**一句话定位**：Pinia = Vuex 的简化版 + TS 友好版 + Composition API 原生版。

---

## Q: Pinia 和 Vuex 该如何选择？项目升级时如何迁移？

**A:**

**新项目选择建议：**

- ✅ **Vue 3 项目**：**无脑选 Pinia**（官方推荐，未来唯一方向）
- ⚠️ **Vue 2 项目**：用 Vuex 3.x（Pinia 虽支持 Vue 2，但生态主要在 Vue 3）
- ⚠️ **遗留 Vuex 项目**：评估迁移成本，渐进式迁移

**迁移路径（Vuex → Pinia）：**

```
旧项目 (Vuex 4)
   ↓ 一次性安装 pinia
   ↓ 保留 Vuex 不动，新模块用 Pinia
   ↓ 旧模块逐个改写
   ↓ 全部完成后移除 Vuex
新项目 (Pinia)
```

**对应 API 迁移映射：**

| Vuex 概念 | Pinia 对应 |
|-----------|-----------|
| `state` | `state`（不变） |
| `getters` | `getters`（不变） |
| `mutations` | ❌ 删除 |
| `actions`（同步） | `actions`（合并 mutation 职责） |
| `actions`（异步） | `actions`（保持） |
| `modules` | 多个独立 `defineStore` |
| `mapState` / `mapGetters` | 直接解构 `storeToRefs(store)` |
| `commit('xxx')` | `store.xxx()` 直接调用 |
| `dispatch('xxx')` | `store.xxx()` 直接调用 |

> 💡 **关键提示**：Pinia 中**没有 mutation 概念**，state 可以直接修改（`store.count++`），也可以通过 `$patch` 批量修改、通过 action 封装。

---

## 核心 API 篇

## Q: Pinia 的核心 API 有哪些？两种 store 定义方式有什么区别？

**A:**

Pinia 提供两种定义 Store 的方式，分别对应 Vue 的两种 API 风格：

### 方式 1：Options API 风格（推荐 Vuex 迁移者使用）

```ts
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    name: 'Tom',
  }),
  getters: {
    double: (state) => state.count * 2,
    // 调用其他 getter
    quadruple(): number {
      return this.double * 2
    },
  },
  actions: {
    increment() {
      this.count++
    },
    async fetchData() {
      const data = await api.get()
      this.count = data.count
    },
  },
})
```

### 方式 2：Setup 风格（推荐 Composition API 项目使用）

```ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  // state
  const count = ref(0)
  const name = ref('Tom')

  // getter
  const double = computed(() => count.value * 2)

  // action
  function increment() {
    count.value++
  }
  async function fetchData() {
    const data = await api.get()
    count.value = data.count
  }

  return { count, name, double, increment, fetchData }
})
```

### 两种方式对比

| 维度 | Options 风格 | Setup 风格 |
|------|-------------|-----------|
| **写法** | 配置对象 | 函数返回值 |
| **可读性** | 结构清晰，分类明确 | 灵活，组合自由 |
| **TS 推导** | 良好 | ✅ 更佳 |
| **复用 composable** | ❌ 不能直接用 | ✅ 可直接调用 `useXxx()` |
| **响应式更灵活** | 受限于配置 | ✅ 可用 `ref` / `reactive` / `watch` |
| **适用场景** | 简单 store / Vuex 迁移 | 复杂 store / 需要 composable |

> 💡 **官方推荐**：新项目用 Setup 风格，更贴合 Composition API 思想。

---

## Q: Pinia 中如何在组件里使用 store？为什么需要 `storeToRefs`？

**A:**

**基础用法：**

```vue
<script setup lang="ts">
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()

// 读取
console.log(counter.count)      // 0
console.log(counter.double)     // 0

// 修改
counter.count++                 // ✅ 直接改
counter.$patch({ count: 10 })   // ✅ 批量改
counter.increment()             // ✅ 调用 action
</script>

<template>
  <div>{{ counter.count }} - {{ counter.double }}</div>
  <button @click="counter.increment()">+1</button>
</template>
```

**为什么需要 `storeToRefs`？**

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()

// ❌ 直接解构会失去响应性
const { count, double } = counter

// ✅ 使用 storeToRefs 保持响应性
const { count, double } = storeToRefs(counter)
// actions 不需要 storeToRefs，可以直接解构
const { increment } = counter
</script>

<template>
  <!-- 模板中可以直接用解构出的 count -->
  <div>{{ count }} - {{ double }}</div>
  <button @click="increment">+1</button>
</template>
```

**原理：**

- `useCounterStore()` 返回的 `counter` 是 `reactive` 包裹的对象
- 直接 `const { count } = counter` 会触发 `reactive` 解包，得到普通值，失去响应
- `storeToRefs` 把 store 中的 state 和 getter 转为 `ref`，保留响应性

> ⚠️ **注意**：`storeToRefs` 只转 state 和 getter，不转 actions。actions 是普通函数，直接解构即可。

---

## Q: Pinia 中如何处理 Store 之间的依赖与组合？

**A:**

Pinia **天生支持 store 互相调用**，无需额外配置（Vuex 模块互调要靠 rootState / rootGetters）。

### 1. Setup 风格：直接调用

```ts
// useUserStore.ts
export const useUserStore = defineStore('user', () => {
  const name = ref('Tom')
  const id = ref(1)
  return { name, id }
})

// useOrderStore.ts
export const useOrderStore = defineStore('order', () => {
  const userStore = useUserStore()   // ✅ 直接使用其他 store
  const orders = ref([])

  const userOrders = computed(() =>
    orders.value.filter(o => o.userId === userStore.id)
  )

  async function fetchUserOrders() {
    orders.value = await api.getOrders(userStore.id)
  }

  return { orders, userOrders, fetchUserOrders }
})
```

### 2. Options 风格：在 action / getter 中调用

```ts
export const useOrderStore = defineStore('order', {
  state: () => ({ orders: [] }),
  getters: {
    userOrders(state) {
      const userStore = useUserStore()
      return state.orders.filter(o => o.userId === userStore.id)
    },
  },
  actions: {
    async fetchUserOrders() {
      const userStore = useUserStore()
      this.orders = await api.getOrders(userStore.id)
    },
  },
})
```

### 3. 循环依赖处理

Pinia 通过**惰性初始化**避免循环依赖问题 —— 只有真正调用 `useXxxStore()` 时才创建实例，所以两个 store 互相引用也不会死循环。

> 💡 **设计哲学**：Pinia 鼓励**扁平化 store 设计**，不再有 Vuex 的嵌套 modules，每个 store 都是独立单元，按需组合。

---

## 进阶原理篇

## Q: Pinia 的响应式原理是什么？它是怎么和 Vue 集成的？

**A:**

Pinia 的实现非常薄，几乎是「Vue 的响应式 API + 一层薄封装」。

### 核心实现思路（简化版）

```ts
// 极简版 defineStore
function defineStore(id, setup) {
  return function useStore() {
    const pinia = getActivePinia()  // 拿到当前 Pinia 实例

    // 如果已经创建过，直接返回缓存
    if (pinia._s.has(id)) return pinia._s.get(id)

    // 创建 store：在 effectScope 中执行 setup
    const scope = effectScope(true)
    const store = scope.run(() => {
      if (typeof setup === 'function') {
        return setup()                     // Setup 风格
      } else {
        return createOptionsStore(setup)   // Options 风格
      }
    })

    // 用 reactive 包裹后存入
    const reactiveStore = reactive(store)
    pinia._s.set(id, reactiveStore)
    return reactiveStore
  }
}
```

### 关键技术点

**1. 基于 Vue 3 响应式系统**

- state 用 `ref` / `reactive` 实现 → Proxy 劫持
- getter 用 `computed` 实现 → 自动缓存 + 依赖追踪
- action 是普通函数 → 调用时通过响应式 state 自动触发更新

**2. `effectScope` 隔离副作用**

- 每个 store 在独立的 `effectScope` 中创建
- 卸载 store 时（HMR / SSR 重置）可一次性清理所有 effect

**3. Pinia 实例 = 一个 Map**

```ts
const pinia = {
  _s: new Map(),       // id → store 实例的缓存
  _e: effectScope(),   // 全局 effectScope
  state: ref({}),      // 所有 store 的 state 聚合（DevTools 用）
}
```

**4. 插件系统**

```ts
pinia.use(({ store }) => {
  store.$onAction(({ name, args }) => {
    console.log(`调用 action: ${name}`, args)
  })
})
```

可以监听 action 调用、订阅 state 变化、扩展 store 等。

> 💡 **本质**：Pinia 只是把「Vue 3 响应式 API + DevTools 集成 + 模块化管理」打包成一个轻量库，**1KB 不到**就实现了 Vuex 所有核心功能。

---

## Q: 同一个 Counter 场景，用 Vuex 和 Pinia 分别如何实现？

**A:**

通过同一个「计数器 + 异步加 1」场景对比代码风格。

**场景需求：**
- 状态：`count`、`loading`
- 动作：`increment` 同步加 1、`incrementAsync` 异步加 1
- 派生：`double = count * 2`

---

### 方案 A：Vuex 4

```ts
// store/index.ts
import { createStore } from 'vuex'

export interface RootState {
  count: number
  loading: boolean
}

export default createStore<RootState>({
  state: { count: 0, loading: false },
  mutations: {
    INCREMENT(state) { state.count++ },
    SET_LOADING(state, v: boolean) { state.loading = v },
  },
  getters: {
    double: (state) => state.count * 2,
  },
  actions: {
    increment({ commit }) {
      commit('INCREMENT')
    },
    async incrementAsync({ commit }) {
      commit('SET_LOADING', true)
      await new Promise(r => setTimeout(r, 1000))
      commit('INCREMENT')
      commit('SET_LOADING', false)
    },
  },
})
```

```vue
<!-- Counter.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const count = computed(() => store.state.count)
const loading = computed(() => store.state.loading)
const double = computed(() => store.getters.double)

const increment = () => store.dispatch('increment')
const incrementAsync = () => store.dispatch('incrementAsync')
</script>

<template>
  <div>
    <p>{{ count }} × 2 = {{ double }}</p>
    <button @click="increment">+1</button>
    <button @click="incrementAsync" :disabled="loading">
      {{ loading ? '加载中...' : '异步 +1' }}
    </button>
  </div>
</template>
```

---

### 方案 B：Pinia（Setup 风格）

```ts
// stores/counter.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const loading = ref(false)

  const double = computed(() => count.value * 2)

  function increment() {
    count.value++
  }

  async function incrementAsync() {
    loading.value = true
    await new Promise(r => setTimeout(r, 1000))
    count.value++
    loading.value = false
  }

  return { count, loading, double, increment, incrementAsync }
})
```

```vue
<!-- Counter.vue -->
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCounterStore } from '@/stores/counter'

const store = useCounterStore()
const { count, loading, double } = storeToRefs(store)
const { increment, incrementAsync } = store
</script>

<template>
  <div>
    <p>{{ count }} × 2 = {{ double }}</p>
    <button @click="increment">+1</button>
    <button @click="incrementAsync" :disabled="loading">
      {{ loading ? '加载中...' : '异步 +1' }}
    </button>
  </div>
</template>
```

---

### 代码量与心智模型对比

| 维度 | Vuex 4 | Pinia |
|------|--------|-------|
| **代码行数** | ~40 行 | ~22 行 |
| **概念数** | state / mutation / action / getter / commit / dispatch | state / getter / action |
| **同步修改** | 必须 `commit('XXX')` | 直接 `count++` 或调用 action |
| **TS 类型** | 需手写 `RootState`、`useStore<State>()` | 自动推导，零额外定义 |
| **组件读取** | `computed(() => store.state.xxx)` | `storeToRefs(store)` 一行解构 |
| **DevTools** | ✅ | ✅（更强，含 Setup store 追踪） |

> 💡 **核心差异**：Vuex 强调「状态变更的可追溯性」(mutation 必经)，Pinia 强调「开发效率」(直接改 state + DevTools 仍可追溯)。

---

## 实战篇

## Q: Pinia 项目中如何组织 Store？大型项目的最佳实践是什么？

**A:**

**推荐目录结构：**

```
src/
├── stores/
│   ├── index.ts            ← 导出 pinia 实例
│   ├── modules/
│   │   ├── user.ts         ← 用户模块
│   │   ├── auth.ts         ← 认证模块
│   │   ├── cart.ts         ← 购物车模块
│   │   └── product.ts      ← 商品模块
│   └── types.ts            ← 共享类型
```

**1. 创建 Pinia 实例**

```ts
// stores/index.ts
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)   // 持久化插件

export default pinia
```

```ts
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import pinia from './stores'

createApp(App).use(pinia).mount('#app')
```

**2. 模块化 Store**

```ts
// stores/modules/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as api from '@/api/user'

export const useUserStore = defineStore('user', () => {
  // ===== state =====
  const userInfo = ref<UserInfo | null>(null)
  const token = ref<string>('')

  // ===== getter =====
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => userInfo.value?.name ?? '游客')

  // ===== action =====
  async function login(payload: LoginPayload) {
    const { data } = await api.login(payload)
    token.value = data.token
    userInfo.value = data.user
  }

  function logout() {
    token.value = ''
    userInfo.value = null
  }

  return { userInfo, token, isLoggedIn, userName, login, logout }
}, {
  // 持久化配置
  persist: {
    key: 'user-store',
    storage: localStorage,
    paths: ['token', 'userInfo'],
  },
})
```

**3. 跨 Store 组合**

```ts
// stores/modules/cart.ts
export const useCartStore = defineStore('cart', () => {
  const userStore = useUserStore()
  const items = ref<CartItem[]>([])

  async function checkout() {
    if (!userStore.isLoggedIn) {
      throw new Error('请先登录')
    }
    await api.checkout(items.value, userStore.userInfo!.id)
    items.value = []
  }

  return { items, checkout }
})
```

**4. 重置 Store**

```ts
// 重置单个 store
store.$reset()  // ⚠️ 仅 Options 风格自动支持，Setup 风格需手动实现

// Setup 风格手写 $reset
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  function $reset() { count.value = 0 }
  return { count, $reset }
})
```

---

## Q: Pinia 使用中有哪些常见踩坑点？

**A:**

**1. 解构丢失响应性 → 必须用 `storeToRefs`**

```ts
// ❌ 失去响应
const { count } = useCounterStore()

// ✅ 正确
const { count } = storeToRefs(useCounterStore())
```

**2. 在 `setup` 外使用 store 报错**

```ts
// ❌ 模块顶层调用，Pinia 还没初始化
import { useUserStore } from '@/stores/user'
const userStore = useUserStore()   // 报错：getActivePinia called without active Pinia

// ✅ 在函数内 / setup 内调用
export function useAuth() {
  const userStore = useUserStore()   // 调用时才创建
  return { userStore }
}
```

**3. `$patch` 与直接赋值的取舍**

```ts
// 单字段：直接改即可
store.count++

// 多字段同时改：用 $patch 批量（只触发一次订阅）
store.$patch({ count: 10, name: 'Tom' })

// 复杂逻辑：用函数形式
store.$patch((state) => {
  state.items.push({ id: 1, name: 'apple' })
  state.total = state.items.length
})
```

**4. SSR 中 store 实例隔离**

- SSR 环境下每个请求需独立 Pinia 实例（防止状态污染）
- Nuxt 3 已内置处理，自定义 SSR 需手动 `createPinia()` 注入

**5. 在 setup 风格中实现 `$reset`**

Setup 风格 store 默认**没有 `$reset` 方法**（因为 Pinia 无法自动知道初始值），需手写或用插件。

**6. TypeScript 中获取 store 类型**

```ts
import { useCounterStore } from '@/stores/counter'
type CounterStore = ReturnType<typeof useCounterStore>
```

---

## 总结

> Pinia = **轻量级 Vuex** + **TypeScript 原生友好** + **Composition API 思想**
>
> - **核心 3 概念**：state / getters / actions（删除了 mutations）
> - **两种风格**：Options（Vuex 迁移友好）/ Setup（推荐）
> - **底层原理**：Vue 3 响应式 API（reactive / computed / effectScope）+ Map 缓存
> - **最佳实践**：扁平化模块、按需组合、`storeToRefs` 解构、插件持久化
> - **未来方向**：Vue 3 官方唯一推荐状态管理库，Vuex 进入维护状态

📚 **延伸阅读**：
- [Pinia 官方文档](https://pinia.vuejs.org/zh/)
- [Vue3 核心要点](../index.md)
- [MobX 完全指南（React 生态对应方案）](../../React/mobx.md)
