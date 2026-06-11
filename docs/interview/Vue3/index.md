# Vue3 技术要点

## Q: Vue3 相比 Vue2 有哪些核心变化 / 新特性？

**A:**

一句话：**响应式重写（Proxy）+ Composition API + 编译器优化 + 新组件能力 + 更好的 TS 支持。**

Vue3 的核心升级可以从**响应式、API 设计、编译器、组件能力、工程支持**五个维度来梳理：

**1. 响应式系统重写：Proxy 替代 Object.defineProperty**

| 能力 | Vue 2（defineProperty）| Vue 3（Proxy）|
|------|----------------------|--------------|
| 监听新增属性 | ❌ 需要 `Vue.set` | ✅ 自动拦截 |
| 监听数组索引/length | ❌ 需要重写数组方法 | ✅ 原生支持 |
| 性能 | 初始化时递归遍历 | 懒代理，访问时才处理 |

> ⚠️ **两个易错表述，面试要说准**：
>
> 1. **Proxy 不是「能劫持任何行为」，而是能拦截 13 种基本操作（trap）**：`get` / `set` / `has` / `deleteProperty` / `ownKeys` / `defineProperty` / `getOwnPropertyDescriptor` / `getPrototypeOf` / `setPrototypeOf` / `isExtensible` / `preventExtensions` / `apply` / `construct`。说「13 种 trap」比「任何行为」更严谨。
> 2. **Vue2 数组问题的本质不是「defineProperty 监听不了数组索引」**，而是**出于性能考虑 Vue2 主动放弃了对数组索引/length 的监听**，改为重写 7 个变更方法（`push` / `pop` / `shift` / `unshift` / `splice` / `sort` / `reverse`）来拦截数组变化。所以 `arr[0] = x`、`arr.length = 0` 不会触发更新，需用 `Vue.set` 或 `splice`。

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

## Q: Vue3 为什么比 Vue2 快？Diff 做了哪些关键优化？

**A:**

一句话：**编译期三板斧（静态提升 + PatchFlag + Block Tree）+ 运行时（Proxy 懒代理 + LIS diff + Tree-shaking）。**

### 1. 编译期优化（三板斧）

**① 静态提升（hoistStatic）**

把不含响应式数据的节点提升到 render 函数外面，只创建一次：

```ts
// 没有静态提升（Vue2）：每次渲染都创建所有 vnode
function render() {
  return h('div', [
    h('p', '我是静态文本'),      // 每次都重新创建 ❌
    h('p', dynamicMsg.value),
  ])
}

// 有静态提升（Vue3）：静态节点提到外面，只创建一次
const _hoisted = h('p', '我是静态文本')   // 只创建一次 ✅

function render() {
  return h('div', [
    _hoisted,                              // 直接复用
    h('p', dynamicMsg.value),
  ])
}
```

**② PatchFlag（靶向更新）**

给动态节点打标记，告诉 diff「只有哪部分是动态的」：

```ts
h('p', { class: dynamicClass }, text, PatchFlags.CLASS)
//                                    ↑ 标记：只有 class 是动态的
// diff 时只比对 class，跳过 text、style 等 → 精准更新
```

| PatchFlag 值 | 含义 |
|-------------|------|
| 1 | TEXT — 只有文本是动态的 |
| 2 | CLASS — 只有 class 是动态的 |
| 4 | STYLE — 只有 style 是动态的 |
| 8 | PROPS — 只有特定 props 是动态的 |

**③ Block Tree（扁平化 diff）**

把一个模板按动态块组织，收集所有动态节点到一个扁平数组里：

```
Vue2 diff：整棵树逐层对比（遍历所有节点，包括静态的）
Vue3 diff：只对比 Block 里的动态节点数组（跳过所有静态节点）
```

### 2. 运行时优化

| 优化 | 说明 |
| --- | --- |
| **Proxy 懒代理** | 访问时才递归代理，Vue2 初始化时递归遍历所有属性 |
| **LIS 最长递增子序列** | keyed diff 中用 LIS 算法计算最少 DOM 移动次数 |
| **Tree-shaking** | 没用到的 API 不打包，核心仅 ~10KB gzip |

> ⚠️ **注意**：列表渲染要使用稳定、唯一的 `key`，避免复用错误，否则 Block + LIS 优化都会失效。

---

## Q: Vue3 每次更新都新建 VNode 树，为什么不像 React 用双缓冲 Fiber 树？

**A:**

一句话：**Vue 有响应式 + 编译器优化，能精确定位更新范围，不需要时间切片，也就不需要双缓冲。**

### Vue3 的渲染流程

```
数据变化 → 响应式精确定位到组件 → 该组件 render() → 生成新 VNode 树 → diff → patch DOM
```

每次确实是新建 VNode 树，但只有**变化的组件**才会重新 render。

### React 为什么需要双缓冲？

React 没有响应式系统，`setState` 后**不知道谁用了这个 state**，只能从触发组件开始整个子树重新 render。子树很大时同步 render 会阻塞主线程 → 需要 Fiber 把渲染拆成可中断的小任务（时间切片）→ 中断/恢复需要保存中间状态 → 需要两棵 Fiber 树（current + workInProgress）交替使用。

### Vue 为什么不需要？

| 维度 | React | Vue3 |
|------|-------|------|
| 谁需要更新？ | 不知道，整个子树重新 render | 响应式精确追踪，只更新依赖变化的组件 |
| 更新范围 | 可能很大（子树） | 很小（单个组件） |
| 阻塞风险 | 大 → 需要时间切片 | 小 → 不需要时间切片 |
| 是否需要中断/恢复 | 是 → 需要双缓冲保存中间状态 | 否 → 不需要 |
| VNode 创建开销 | JSX 每次全量创建 | 静态提升复用 + 只创建动态节点 |

> Vue 的 VNode 就是普通 JS 对象，创建成本极低。配合静态提升后，每次真正新建的只有动态节点。维护双缓冲树反而增加内存和复杂度，得不偿失。

---

## Q: Vue3 生命周期与 Vue2 的主要映射关系是什么？

**A:**

1. `beforeDestroy` -> `beforeUnmount`
2. `destroyed` -> `unmounted`
3. 组合式 API 对应为 `onMounted`、`onUpdated`、`onUnmounted` 等。

父子挂载顺序（常见）：

父 `beforeMount` -> 子 `beforeMount` -> 子 `mounted` -> 父 `mounted`

---

## Q: Vue3 响应式的依赖收集是怎么实现的？依赖存在哪里？

**A:**

一句话：**「依赖」就是一个 effect 函数（数据变化后要重跑的副作用），它被存进一个 `WeakMap → Map → Set` 的三层结构里，按「哪个对象的哪个属性」精确隔离；收集时机靠全局指针 `activeEffect` 串起来。**

### 1. 依赖（dep）到底是什么？

**依赖 = 一个 effect 函数**，里面是「数据变化后要做出的反应」（更新视图、重新计算、打日志等）。

```js
effect(() => console.log(state.count))  // 整个回调就是一个依赖（effect）
```

### 2. 依赖存在哪里？—— 三层数据结构

```
targetMap (WeakMap)
   │  key   = 响应式对象 target（如 state）
   │  value = depsMap
   ▼
depsMap (Map)
   │  key   = 具体属性名（如 'count'）
   │  value = dep
   ▼
dep (Set)
   └── effect1, effect2, ...   ← effect 真正存在这里
```

```js
const targetMap = new WeakMap()

function track(target, key) {
  if (!activeEffect) return
  let depsMap = targetMap.get(target)             // 第1层：对象 → depsMap
  if (!depsMap) targetMap.set(target, (depsMap = new Map()))

  let dep = depsMap.get(key)                      // 第2层：属性 → dep(Set)
  if (!dep) depsMap.set(key, (dep = new Set()))

  dep.add(activeEffect)                           // 第3层：Set 里存 effect
}

function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  depsMap.get(key)?.forEach(effect => effect())   // 只触发该属性的依赖
}
```

**为什么要三层，不直接 `WeakMap<target, Set<effect>>`？**

因为依赖收集必须**精确到「哪个对象的哪个属性」**。如果只到对象级别，改 `state.a` 会把只依赖 `state.b` 的 effect 也错误触发。中间的 `Map<key, dep>` 这一层负责**按属性隔离**。

### 3. 为什么最外层用 WeakMap？

WeakMap 的 **key 是 target 对象**，对它是**弱引用**。当某个响应式对象在业务里没人引用了（组件卸载、对象废弃），它能被 GC 回收，对应的 `depsMap` 一起回收，不会内存泄漏。

> ⚠️ **注意**：只有**最外层 targetMap 是 WeakMap**；里层的 `depsMap`(Map) 和 `dep`(Set) 都是普通强引用——它们的生命周期已经挂在 target 身上，target 没了它们自然被一起回收。

### 4. 收集时机：`activeEffect` 全局指针

get 是在 Proxy 内部被触发的，`track` 在 get 里调用，**拿不到 effect 参数**，只能靠一个全局指针 `activeEffect`：

```js
let activeEffect = null

function effect(fn) {
  activeEffect = fn   // ① 运行前：把指针指向当前 effect
  fn()                // ② 执行 fn → 读响应式数据 → 触发 get → track 收集 activeEffect
  activeEffect = null // ③ 运行后：复位，避免误收集
}
```

**完整链路**：`effect(fn)` 先把 `activeEffect = fn` → 执行 `fn()` → 读 `state.count` 触发 Proxy 的 get → get 里调 `track` → `track` 读全局 `activeEffect` 把它存进 dep。所以「谁在读数据，谁就被收集」。

> ⚠️ 真实源码中 `activeEffect` 配合**effect 栈**处理嵌套 effect（父 effect 里嵌子 effect），执行完子 effect 要恢复成父 effect，而不是简单置 null。

---

## Q: ref vs reactive 怎么选？

**A:**

一句话：**ref 啥都能装，靠 `.value` 触发；reactive 只能装对象，靠 Proxy 拦截 —— 解构会丢响应式，所以保守起见统一用 `ref` 心智最低。**

> 📖 源码实现参考（手写简化版）：[ref.md](./diff/源码解析/ref.md) · [reactive.md](./diff/源码解析/reactive.md)

### 1. 底层实现差异

| 维度 | `ref` | `reactive` |
| --- | --- | --- |
| 实现 | `RefImpl` 类，通过 `.value` 的 getter/setter 触发 `track` / `trigger` | 基于 **Proxy** 代理目标对象，拦截 13 种操作 |
| 能装什么 | 任意类型（基本类型、对象、数组…） | 只能对象 / 数组 / Map / Set |
| 对象处理 | 传入对象时内部用 `reactive` 再包一层 | 直接代理 |
| 访问方式 | JS 中要 `.value`；模板里**自动解包**（顶层 ref） | 像普通对象一样直接用 |

### 2. `reactive` 的三大坑（高频考点）

```ts
const state = reactive({ count: 0, user: { name: 'Tom' } })

// ❌ 坑 1：解构会丢失响应式
const { count } = state            // count 不再响应
// ✅ 必须配 toRefs / toRef
const { count } = toRefs(state)

// ❌ 坑 2：不能整体替换，会断开代理
state = { count: 100 }             // 失效
// ✅ 只能改属性或 Object.assign
Object.assign(state, { count: 100 })

// ❌ 坑 3：不接受基本类型
const n = reactive(0)              // 无效
```

### 3. `ref` 的细节

```ts
const obj = ref({ a: 1 })
obj.value.a = 2                    // ✅ 也是响应式（内部用 reactive 包裹）

// 模板里自动解包
// <template>{{ count }}</template>   // 不用写 .value
```

> ⚠️ **注意**：ref 只有作为顶层属性时才自动解包；嵌套在普通对象里访问需要 `.value`。

### 4. 选型策略

- **基本类型** → 必 `ref`
- **对象状态** → 看团队风格：
  - 想省心避坑：**统一全用 `ref`**（业界主流趋势）
  - 想读起来更顺手：用 `reactive`，但要时刻警惕解构 / 替换问题

```ts
const count = ref(0)
const state = reactive({ user: { name: 'Tom' } })
```

---

> ⚠️ **注意**：列表渲染要使用稳定、唯一的 `key`，避免复用错误，否则 Block + LIS 优化都会失效。

---

## Q: `watch` 和 `watchEffect` 的区别是什么？

**A:**

一句话：**watch 手动指定监听谁、能拿新旧值、默认懒执行；watchEffect 自动收集依赖、拿不到新旧值、创建时立即执行一次。**

### 对比

| | `watch` | `watchEffect` |
|--|---------|---------------|
| 监听源 | 手动指定（第一个参数） | 自动收集（回调里读了谁就监听谁） |
| 新旧值 | ✅ `(newVal, oldVal)` | ❌ 拿不到 |
| 首次执行 | ❌ 默认不执行（lazy） | ✅ 立即执行一次（顺便收集依赖） |
| 适合场景 | 精准监听某个值、需要旧值 | 多个依赖联动的副作用 |

### 代码对比

```ts
const count = ref(0)
const name = ref('Tom')

// watch：手动指定监听 count，能拿新旧值
watch(count, (newVal, oldVal) => {
  console.log(`${oldVal} → ${newVal}`)
})

// watchEffect：自动收集，读了谁就监听谁，立即执行一次
watchEffect(() => {
  console.log(`count=${count.value}, name=${name.value}`)
})
// 立即打印：count=0, name=Tom
// count 或 name 变了都会重新打印
```

### 实际场景

```ts
// watch 适合：精准监听 + 需要旧值
watch(() => route.params.id, (newId, oldId) => {
  fetchData(newId)    // 路由参数变了，重新请求
})

// watchEffect 适合：多个依赖联动，不关心谁变的
watchEffect(() => {
  search(keyword.value, page.value)  // keyword 或 page 任一变化都重新搜索
})
```

> ⚠️ **注意**：`watchEffect` 只追踪**同步阶段**访问到的依赖。如果在 `await` 之后才访问某个 ref，那个 ref 不会被收集。

---

## Q: computed vs watch 怎么选？computed 的缓存机制是什么？

**A:**

一句话选型：**需要「派生状态」用 computed（有缓存、纯函数）；需要「副作用」用 watch（请求、日志、DOM 操作）。**

### computed 的缓存原理：dirty 标志位

computed 本质是一个带缓存的 effect，靠 `dirty` 标志位控制「要不要重新算」：

```ts
function computed<T>(getter: () => T) {
  let value: T
  let dirty = true

  // effect 做了三件事：
  // 1. 把 getter 包成 ReactiveEffect，接入响应式系统
  // 2. lazy: true → 现在不执行，等第一次读 .value 才执行
  // 3. scheduler → 依赖变化时不重跑 getter，而是只标脏
  const runner = effect(getter, {
    lazy: true,
    scheduler() {
      dirty = true    // 依赖变了 → 只标脏，不立即重算
    }
  })

  return {
    get value(): T {
      if (dirty) {
        value = runner()   // 脏了才重算（执行 getter + 依赖收集）
        dirty = false
      }
      return value         // 不脏直接返回缓存
    }
  }
}
```

### dirty 三步走

```
① 首次读 .value → dirty=true → 执行 getter → 缓存结果 → dirty=false
② 再读 .value  → dirty=false → 直接返回缓存（不重算，这就是缓存）
③ 依赖变了     → trigger → 调 scheduler → dirty=true → 下次读才重算
```

### 为什么比 method 高效

- **method**：每次调用都重新执行函数体，调 10 次算 10 次
- **computed**：依赖不变时，读 10 次只算 1 次

### 三个关键词

| 关键词 | 一句话 |
|--------|--------|
| **dirty** | true=要算，false=用缓存 |
| **lazy** | 创建时不执行，等第一次读 |
| **scheduler** | 依赖变了只标脏，不立即算 |

> ⚠️ **注意**：不是 computed 主动检查依赖变没变，而是依赖变化时通过 trigger 主动调 scheduler 通知 computed「该标脏了」——推（push）模型，不是拉（pull）模型。

---

## Q: Vue3 响应式系统全局总结（面试串讲用）

**A:**

### 核心机制：track / trigger

```
读数据（get）→ track → 把当前 effect 存进 dep
写数据（set）→ trigger → 遍历 dep，逐个触发
```

### 四个 API 全部复用同一套机制

| API | 本质 | trigger 时的行为 |
|-----|------|-----------------|
| **reactive** | Proxy 拦截 get/set | get→track，set→trigger |
| **ref** | RefImpl 的 `.value` getter/setter | 同上，只是入口不同 |
| **effect** | 把函数接入响应式系统的基础设施 | 依赖变了 → 直接重跑 fn |
| **computed** | effect + dirty 缓存 | 依赖变了 → 跑 scheduler（只标脏） |
| **watch/watchEffect** | 也是 effect 的变体 | 依赖变了 → 跑用户的回调 |

### effect 是基础设施，其他都是上层建筑

```
            effect（基础设施）
           ┌──────┼──────────┐
           │      │          │
       普通 effect  computed    watch/watchEffect
           │      │          │
     无 scheduler  有 scheduler  也有 scheduler
           │      │          │
     依赖变→重跑  依赖变→标脏  依赖变→跑回调
```

> 💡 **面试串讲口诀**：Vue3 响应式的一切都建立在 track/trigger 上。reactive 和 ref 负责拦截读写，effect 负责把函数接入系统，computed 是 effect + dirty 缓存，watch 是 effect + 用户回调——**全家共用同一套依赖收集机制**。

---

## Q: Pinia vs Vuex 的区别是什么？

**A:**

1. API 更轻量：没有强制 mutation 层。
2. 与 Composition API 更贴合。
3. TypeScript 推导体验更好。
4. store 拆分更自然，心智负担更低。

---

## Q: `<script setup>` 为什么开发体验更好？`defineProps`/`defineEmits` 为什么不用 import？

**A:**

一句话：**`<script setup>` 是 `setup()` 的编译时语法糖，顶层变量自动暴露给模板；`defineProps`/`defineEmits` 是编译宏，不是运行时函数，编译完就消失了，所以不需要 import。**

### 编译前后对比

```vue
<!-- 你写的 -->
<script setup>
import { ref } from 'vue'

const props = defineProps<{ msg: string }>()
const emit = defineEmits<{ (e: 'change', val: string): void }>()

const count = ref(0)
</script>
```

```ts
// 编译后自动变成（你不用写这些）
export default {
  props: { msg: String },
  emits: ['change'],
  setup(props, { emit }) {
    const count = ref(0)
    return { count }         // ← 自动 return，不用手写
  }
}
```

### 四个优势

| 优势 | 说明 |
|------|------|
| **不用手动 return** | 顶层声明的变量、函数自动暴露给模板 |
| **更少样板代码** | 不用写 `export default { setup() { ... } }` |
| **更好的类型推导** | `defineProps<T>()` 直接用 TS 泛型定义 props 类型 |
| **编译期优化** | 编译器能做更多优化，运行时开销更低 |

### 编译宏（compiler macros）

`defineProps`/`defineEmits` 不是真正的函数，而是**编译宏**——Vue 编译器在构建时识别它们并转换成 props/emits 选项声明，编译完就不存在了：

- 不用 import（import 了反而报警告）
- 不能赋值给变量传来传去
- 不能在 `<script setup>` 之外使用

> 类似的编译宏还有：`defineExpose`、`defineModel`、`withDefaults`

---

## Q: `setup()` 的执行时机是什么？为什么不能用 `this`？

**A:**

一句话：**setup 在 `beforeCreate` 之前执行，是组件初始化最早的入口，此时组件实例还没创建完成，所以 `this` 是 `undefined`。**

### 执行顺序

```
setup()          ← 最先执行
  ↓
beforeCreate     ← setup 之后（Vue3 中这两个钩子几乎没用了）
  ↓
created
  ↓
onBeforeMount
  ↓
onMounted
```

> ⚠️ **注意**：setup **替代了** `beforeCreate` 和 `created` 这两个钩子，不是「等于 created」——它比 created 还早。在 Composition API 中，直接在 setup 里写的代码就相当于以前 created 里的逻辑。

### 为什么不能用 `this`

Options API 里 `this` 指向组件实例，但 setup 执行时实例还没绑定好。Composition API 的设计意图就是**不依赖 `this`，用函数参数和返回值代替**：

```ts
// Options API：靠 this
export default {
  data() { return { count: 0 } },
  methods: {
    add() { this.count++ }
  }
}

// Composition API：不需要 this
export default {
  setup(props, { emit, attrs, slots, expose }) {
    const count = ref(0)
    const add = () => count.value++
    onMounted(() => console.log('mounted'))
    return { count, add }
  }
}
```

### setup 可以使用的参数

| 参数 | 说明 |
|------|------|
| `props` | 父组件传入的 props（响应式） |
| `context.emit` | 触发事件 |
| `context.attrs` | 未声明为 props 的属性 |
| `context.slots` | 插槽 |
| `context.expose` | 暴露给父组件的方法/属性 |
```

---

## Q: Vue3 的 `v-model` 有哪些升级？

**A:**

1. 默认从 `value/input` 改为 `modelValue/update:modelValue`。
2. 支持多个 `v-model`：`v-model:title`、`v-model:visible`。
3. 自定义修饰符能力更清晰。

```vue
<UserForm v-model:name="name" v-model:age="age" />
```

---

## Q: Vue3 组件通信方式有哪些？

**A:**

1. 父子：`props` / `emit`。
2. 跨层：`provide` / `inject`。
3. 组件暴露：`defineExpose`。
4. 全局共享：Pinia。

---

## Q: `provide`/`inject` 怎么保持响应式？传 ref 还是传 .value？

**A:**

一句话：**必须传 ref 或 reactive 本身，不能传 `.value`——传值就断了响应式。**

### 核心规则

| 传什么 | 子组件响应式？ | 推荐？ |
|--------|---------------|--------|
| `ref` 本身 | ✅ 同步更新 | ✅ 推荐 |
| `ref.value` | ❌ 断了 | ❌ |
| `reactive` 对象 | ✅ 同步更新 | ✅ |
| 普通值 `'hello'` | ❌ 静态的 | 只适合常量 |

```ts
const count = ref(0)
provide('count', count)         // ✅ 传 ref 对象，子组件响应式
provide('count', count.value)   // ❌ 传了 0，断了响应式
```

### 完整示例

```vue
<!-- 父组件 -->
<script setup>
import { ref, provide, readonly } from 'vue'

const theme = ref('dark')
const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
}

provide('theme', readonly(theme))   // 只读，子组件不能直接改
provide('toggleTheme', toggleTheme) // 提供修改方法，保持单向数据流
</script>
```

```vue
<!-- 任意深层子组件 -->
<script setup>
import { inject } from 'vue'

const theme = inject('theme')           // 拿到只读 ref
const toggleTheme = inject('toggleTheme') // 拿到修改方法

// 父组件改了 theme，这里自动更新 ✅
</script>

<template>
  <div>当前主题：{{ theme }}</div>
  <button @click="toggleTheme">切换</button>
</template>
```

> ⚠️ **最佳实践**：provide 时用 `readonly()` 包裹数据，同时 provide 修改方法。避免子组件直接修改父组件状态，保持单向数据流。

---

## Q: 组合式函数（composable）和 mixin 有什么区别？为什么推荐用 composable？

**A:**

一句话：**mixin 有命名冲突、来源不清、隐式依赖三大问题；composable 通过普通函数 + 显式返回值全部解决。**

### mixin 的三大问题

| 问题 | 说明 |
|------|------|
| **命名冲突** | 多个 mixin 都定义了 `data.x`，静默覆盖，很难排查 |
| **来源不清** | 模板里 `this.x`，不知道从哪个 mixin 来的 |
| **隐式依赖** | mixin A 依赖 mixin B 的某个 data，代码里看不出来 |

### composable 怎么解决

```ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  const update = (e: MouseEvent) => {
    x.value = e.pageX
    y.value = e.pageY
  }

  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  return { x, y }    // 明确返回什么
}

// 使用：来源一目了然，命名可自定义
const { x: mouseX, y: mouseY } = useMouse()
```

### 对比

| | mixin | composable |
|--|-------|-----------|
| 命名冲突 | ❌ 静默覆盖 | ✅ 解构时自定义命名 |
| 数据来源 | ❌ `this.x` 不知哪来 | ✅ `useMouse()` 返回，一目了然 |
| 依赖关系 | ❌ 隐式 | ✅ 函数参数和返回值，显式 |
| 类型推导 | ❌ TS 推不动 | ✅ 天然支持泛型 |
| 灵活性 | ❌ 只能整个混入 | ✅ 可传参、条件调用 |

### composable vs React 自定义 Hook

两者思路几乎一样（`use` 命名、函数封装、返回值暴露），区别在底层机制：

| | Vue composable | React Hook |
|--|---------------|------------|
| 执行次数 | **只执行一次**（setup 只跑一次） | **每次渲染都执行** |
| 响应式机制 | Proxy 依赖收集 | 闭包 + setState 触发重渲染 |
| 调用限制 | 无特殊限制 | 不能在条件/循环里调用（Hook 规则） |

> ⚠️ **注意**：Vue3 没有「废弃」mixin（还能用），但官方强烈推荐用 composable 替代。composable 命名规范以 `use` 开头，放在 `composables/` 或 `hooks/` 目录。

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

## Q: 在 Vue3 项目里常见的最佳实践有哪些？

**A:**

1. 优先使用 `<script setup>` + TypeScript。
2. 业务状态放到 Pinia，组件内部状态放局部。
3. 可复用逻辑抽成组合函数（`useXxx`）。
4. 列表必须使用稳定 `key`，避免 `index` 作为唯一标识。
5. 副作用逻辑（请求、埋点）集中在 `watch`/hooks，保持 `computed` 纯净。

---
