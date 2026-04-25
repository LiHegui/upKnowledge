# Vue3面试题

## 生命周期

Vue3 的生命周期与 Vue2 基本对应，但名称有变化，且支持在 `setup()` 中使用组合式 API 形式调用。

| Vue2 | Vue3（Options API）| Vue3（Composition API）|
|------|-------------------|------------------------|
| `beforeCreate` | `beforeCreate` | — （用 `setup()` 替代）|
| `created` | `created` | — （用 `setup()` 替代）|
| `beforeMount` | `beforeMount` | `onBeforeMount` |
| `mounted` | `mounted` | `onMounted` |
| `beforeUpdate` | `beforeUpdate` | `onBeforeUpdate` |
| `updated` | `updated` | `onUpdated` |
| `beforeDestroy` | `beforeUnmount` | `onBeforeUnmount` |
| `destroyed` | `unmounted` | `onUnmounted` |

```js
import { onMounted, onUpdated, onUnmounted } from 'vue'

setup() {
  onMounted(() => {
    console.log('组件挂载完成')
  })
  onUnmounted(() => {
    console.log('组件卸载，清除定时器/监听器')
  })
}
```

**执行顺序（父子组件）**：
```
父 beforeCreate -> 父 created -> 父 beforeMount
  -> 子 beforeCreate -> 子 created -> 子 beforeMount -> 子 mounted
父 mounted
```

## ref

`ref` 用于创建一个**响应式的引用**，可以持有任意类型的值（基本类型或对象）。

```js
import { ref } from 'vue'

const count = ref(0)
console.log(count.value) // 0，JS 中通过 .value 访问
// 模板中自动解包，不需要 .value
```

**ref vs reactive：**

| 对比 | `ref` | `reactive` |
|------|-------|------------|
| 适用类型 | 任意类型 | 对象/数组 |
| 访问方式 | `.value` | 直接访问 |
| 解构 | 需 `toRefs` | 需 `toRefs` |
| 模板自动解包 | ✅ | ✅ |

## reactive

`reactive` 基于 `Proxy` 实现，返回对象的响应式代理。

```js
import { reactive } from 'vue'

const state = reactive({
  count: 0,
  user: { name: 'Tom' }
})
// 直接访问和修改
state.count++
state.user.name = 'Jerry'
```

**响应式原理（核心代码）：**

```js
// --------------- reactive 模块 ---------------
/**
 * 收集所有依赖的 WeakMap 实例：
 * 1. key：响应性对象
 * 2. value：Map 对象
 *    1. key：响应性对象的指定属性
 *    2. value：指定对象的指定属性的执行函数
 */
const targetMap = new WeakMap()

function track(target, key) {
  if (!activeEffect) return
  let depsMap = targetMap.get(target)
  if (!depsMap) targetMap.set(target, (depsMap = new Map()))
  let dep = depsMap.get(key)
  if (!dep) depsMap.set(key, (dep = new Set()))
  dep.add(activeEffect)
}

function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  const dep = depsMap.get(key)
  if (dep) triggerEffects(dep)
}
```

## Composition API vs Options API

| 对比 | Options API | Composition API |
|------|-------------|-----------------|
| 逻辑组织 | 按选项分散（data/methods/computed）| 按功能聚合 |
| 逻辑复用 | Mixin（有命名冲突风险）| 自定义 Hook（`useXxx`）|
| TypeScript | 较弱 | 完整支持 |
| 学习曲线 | 平缓 | 稍陡 |

```js
// 自定义 Hook 示例：useCounter
export function useCounter(initial = 0) {
  const count = ref(initial)
  const increment = () => count.value++
  const decrement = () => count.value--
  return { count, increment, decrement }
}

// 在组件中使用
const { count, increment } = useCounter(10)
```

## Vue3 有哪些新特性？

1. **Composition API** — `setup()`、`ref`、`reactive`、`computed`、`watch`
2. **Teleport** — 将组件渲染到任意 DOM 位置（如模态框传送到 body）
3. **Fragment** — 组件支持多根节点
4. **Suspense** — 异步组件加载时的 fallback 内容
5. **`<script setup>`** — 更简洁的 SFC 写法，编译时语法糖
6. **v-model 升级** — 支持多个 v-model，自定义修饰符
7. **Proxy 响应式** — 替代 `Object.defineProperty`，支持新增属性、数组变化
8. **TypeScript** — 源码全部用 TS 重写，类型支持更完整


    /**
     * 收集依赖
     */
    function track(target, key) {
        // 如果当前不存在执行函数，则直接 return
        if (!activeEffect) return
        // 尝试从 targetMap 中，根据 target 获取 map
        let depsMap = targetMap.get(target)
        // 如果获取到的 map 不存在，则生成新的 map 对象，并把该对象赋值给对应的 value
        if (!depsMap) {
            targetMap.set(target, (depsMap = new Map()))
        }
        // 获取指定 key 的 dep
        let dep = depsMap.get(key)
        // 如果 dep 不存在，则生成一个新的 dep，并放入到 depsMap 中
        if (!dep) {
            depsMap.set(key, (dep = new Set()))
        }
        // 把所有的 activeEffect 方法加入到 dep 中
        dep.add(activeEffect)
    }

    /**
     * 触发依赖
     */
    function trigger(target, key) {
        // 依据 target 获取存储的 map 实例
        const depsMap = targetMap.get(target)
        // 如果 map 不存在，则直接 return
        if (!depsMap) {
            return
        }
        // 依据指定的 key，获取 dep 实例
        let dep = depsMap.get(key)
        // dep 不存在则直接 return
        if (!dep) {
            return
        }
        // 触发 dep
        triggerEffects(dep)
    }

    /**
     * 依次触发 dep 中保存的依赖
     */
    function triggerEffects(dep) {
        // 把 dep 构建为一个数组
        const effects = Array.isArray(dep) ? dep : [...dep]
        // 依次触发
        for (const effect of effects) {
            effect.run()
        }
    }

    /**
     * proxy 的 handler
     */
    const baseHandlers = {
        get: (target, key, receiver) => {
            // 利用 Reflect 得到返回值
            const res = Reflect.get(target, key, receiver)
            // 收集依赖
            track(target, key)
            return res
        },
        set: (target, key, value, receiver) => {
            // 利用 Reflect.set 设置新值
            const result = Reflect.set(target, key, value, receiver)
            // 触发依赖
            trigger(target, key)
            return result
        }
    }

    function reactive(target) {
        const proxy = new Proxy(target, baseHandlers)
        return proxy
    }

    // --------------- ref 模块 --------------- 
    class RefImpl {
        _rawValue
        _value
        dep

        constructor(value) {
            // 原始数据
            this._rawValue = value
            this._value = value
        }

        /**
         * get 语法将对象属性绑定到查询该属性时将被调用的函数。
         * 即：xxx.value 时触发该函数
         */
        get value() {
            // 收集依赖
            if (activeEffect) {
                const dep = ref.dep || (ref.dep = new Set())
                dep.add(activeEffect)
            }
            return this._value
        }

        set value(newVal) {
            /**
             * newVal 为新数据
             * this._rawValue 为旧数据（原始数据）
             * 对比两个数据是否发生了变化
             */
            // 更新原始数据
            this._rawValue = newVal
            this._value = newVal
            // 触发依赖
            if (ref.dep) {
                triggerEffects(ref.dep)
            }
        }
    }

    /**
     * ref 函数
     * @param value unknown
     */
    function ref(value) {
        return new RefImpl(value)
    }

    // --------------- effect 模块 --------------- 

    // 当前需要执行的 effect
    let activeEffect

    /**
     * 响应性触发依赖时的执行类
     */
    class ReactiveEffect {
        constructor(fn) {
            this.fn = fn
        }

        run() {
            // 为 activeEffect 赋值
            activeEffect = this

            // 执行 fn 函数
            return this.fn()
        }
    }

    /**
     * effect 函数
     * @param fn 执行方法
     * @returns 以 ReactiveEffect 实例为 this 的执行函数
     */
    function effect(fn) {
        // 生成 ReactiveEffect 实例
        const _effect = new ReactiveEffect(fn)

        // 执行 run 函数
        _effect.run()
    }



    //  --------------- 测试 ref --------------- 
    const name = ref('张三')

    // 调用 effect 方法
    effect(() => {
        document.querySelector('#app').innerText = name.value
    })

    setTimeout(() => {
        name.value = '李四'
    }, 2000);
```


## 最长递增子序列


```js
/**
 * 获取最长递增子序列下标
 * 维基百科：https://en.wikipedia.org/wiki/Longest_increasing_subsequence
 * 百度百科：https://baike.baidu.com/item/%E6%9C%80%E9%95%BF%E9%80%92%E5%A2%9E%E5%AD%90%E5%BA%8F%E5%88%97/22828111
 */
function getSequence(arr) {
    // 获取一个数组浅拷贝。注意 p 的元素改变并不会影响 arr
    // p 是一个最终的回溯数组，它会在最终的 result 回溯中被使用
    // 它会在每次 result 发生变化时，记录 result 更新前最后一个索引的值
    const p = arr.slice()
    // 定义返回值（最长递增子序列下标），因为下标从 0 开始，所以它的初始值为 0
    const result = [0]
    let i, j, u, v, c
    // 当前数组的长度
    const len = arr.length
    // 对数组中所有的元素进行 for 循环处理，i = 下标
    for (i = 0; i < len; i++) {
        // 根据下标获取当前对应元素
        const arrI = arr[i]
        // 
        if (arrI !== 0) {
            // 获取 result 中的最后一个元素，即：当前 result 中保存的最大值的下标
            j = result[result.length - 1]
            // arr[j] = 当前 result 中所保存的最大值
            // arrI = 当前值
            // 如果 arr[j] < arrI 。那么就证明，当前存在更大的序列，那么该下标就需要被放入到 result 的最后位置
            if (arr[j] < arrI) {
                p[i] = j
                // 把当前的下标 i 放入到 result 的最后位置
                result.push(i)
                continue
            }
            // 不满足 arr[j] < arrI 的条件，就证明目前 result 中的最后位置保存着更大的数值的下标。
            // 但是这个下标并不一定是一个递增的序列，比如： [1, 3] 和 [1, 2] 
            // 所以我们还需要确定当前的序列是递增的。
            // 计算方式就是通过：二分查找来进行的

            // 初始下标
            u = 0
            // 最终下标
            v = result.length - 1
            // 只有初始下标 < 最终下标时才需要计算
            while (u < v) {
                // (u + v) 转化为 32 位 2 进制，右移 1 位 === 取中间位置（向下取整）例如：8 >> 1 = 4;  9 >> 1 = 4; 5 >> 1 = 2
                // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Right_shift
                // c 表示中间位。即：初始下标 + 最终下标 / 2 （向下取整）
                c = (u + v) >> 1
                // 从 result 中根据 c（中间位），取出中间位的下标。
                // 然后利用中间位的下标，从 arr 中取出对应的值。
                // 即：arr[result[c]] = result 中间位的值
                // 如果：result 中间位的值 < arrI，则 u（初始下标）= 中间位 + 1。即：从中间向右移动一位，作为初始下标。 （下次直接从中间开始，往后计算即可）
                if (arr[result[c]] < arrI) {
                    u = c + 1
                } else {
                    // 否则，则 v（最终下标） = 中间位。即：下次直接从 0 开始，计算到中间位置 即可。
                    v = c
                }
            }
            // 最终，经过 while 的二分运算可以计算出：目标下标位 u
            // 利用 u 从 result 中获取下标，然后拿到 arr 中对应的值：arr[result[u]]
            // 如果：arr[result[u]] > arrI 的，则证明当前  result 中存在的下标 《不是》 递增序列，则需要进行替换
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1]
                }
                // 进行替换，替换为递增序列
                result[u] = i
            }
        }
    }
    // 重新定义 u。此时：u = result 的长度
    u = result.length
    // 重新定义 v。此时 v = result 的最后一个元素
    v = result[u - 1]
    // 自后向前处理 result，利用 p 中所保存的索引值，进行最后的一次回溯
    while (u-- > 0) {
        result[u] = v
        v = p[v]
    }
    return result
}

```

---

## Vue3 高频补充篇

## Q: `setup()` 的执行时机是什么？为什么不能使用 `this`？

**A:**

`setup()` 会在组件 `beforeCreate` 之前执行，而且只执行一次。此时组件实例还没有创建完成，因此拿不到组件实例上的 `this`。

```ts
import { ref, onMounted } from 'vue'

export default {
    setup(props, { emit, attrs, slots, expose }) {
        const count = ref(0)
        onMounted(() => {
            console.log('mounted')
        })
        return { count }
    }
}
```

| 可用能力 | `setup` 中是否可用 |
|------|------|
| `props` | ✅ |
| `emit` | ✅ |
| `attrs/slots/expose` | ✅ |
| `this` | ❌ |

---

## Q: `watch` 和 `watchEffect` 有什么区别？

**A:**

| 对比维度 | `watch` | `watchEffect` |
|------|------|------|
| 依赖收集 | 显式指定监听源 | 自动收集回调中依赖 |
| 是否拿到新旧值 | ✅ 可拿 `newVal/oldVal` | ❌ 默认拿不到 |
| 是否立即执行 | 默认不立即（可 `immediate`） | ✅ 默认立即执行 |
| 适用场景 | 精准监听某个源并对比变化 | 副作用逻辑、快速联动 |

```ts
const keyword = ref('')
const page = ref(1)

watch([keyword, page], ([k, p], [oldK, oldP]) => {
    console.log('search changed', k, p, oldK, oldP)
})

watchEffect(() => {
    console.log('auto track', keyword.value, page.value)
})
```

> ⚠️ **注意**：异步回调里，`watchEffect` 只会收集同步阶段访问到的依赖。

---

## Q: `computed` 和 `watch` 如何选择？

**A:**

`computed` 适合“基于已有状态推导新状态”；`watch` 适合“状态变化后执行副作用”。

| 场景 | 推荐 |
|------|------|
| 派生数据（过滤列表、格式化展示） | `computed` ✅ |
| 请求接口、写本地缓存、手动操作 DOM | `watch` ✅ |

```ts
const list = ref([1, 2, 3])
const doubleList = computed(() => list.value.map(i => i * 2))

watch(doubleList, () => {
    localStorage.setItem('doubleList', JSON.stringify(doubleList.value))
})
```

---

## Q: `nextTick` 的作用是什么？什么时候必须用？

**A:**

Vue 的 DOM 更新是异步批量执行的。`nextTick` 用于等待本轮 DOM 更新完成后再执行回调。

```ts
const show = ref(false)

async function open() {
    show.value = true
    await nextTick()
    // 此时 DOM 已更新，可安全获取元素尺寸/聚焦
    document.querySelector('#input')?.focus()
}
```

常见使用场景：

1. 更新状态后立即读取最新 DOM
2. 列表变更后计算滚动高度
3. 弹窗打开后自动聚焦输入框

---

## Q: Vue3 的 `v-model` 相比 Vue2 有哪些变化？

**A:**

Vue3 支持多个 `v-model`，默认绑定从 `value/input` 改为 `modelValue/update:modelValue`。

```vue
<!-- 父组件 -->
<UserForm v-model:name="name" v-model:age="age" />

<!-- 子组件 -->
<script setup lang="ts">
const props = defineProps<{ name: string; age: number }>()
const emit = defineEmits<{
    (e: 'update:name', v: string): void
    (e: 'update:age', v: number): void
}>()
</script>
```

| 对比 | Vue2 | Vue3 |
|------|------|------|
| 默认 prop | `value` | `modelValue` |
| 默认事件 | `input` | `update:modelValue` |
| 多个 v-model | ❌ | ✅ `v-model:xxx` |

---

## Q: Vue3 Diff 做了哪些优化？

**A:**

Vue3 编译器 + 运行时协同优化，核心包括：

1. **静态提升（hoistStatic）**：静态节点提升到 render 外，只创建一次
2. **PatchFlags**：为动态节点打标，更新时只比对必要部分
3. **Block Tree**：把模板切成动态区块，减少无关遍历
4. **最长递增子序列（LIS）**：减少 keyed diff 的 DOM 移动次数

```ts
// 概念示意：仅带动态标记的节点参与精准 patch
// patchFlag: TEXT / CLASS / STYLE / PROPS ...
```

> ⚠️ **注意**：列表渲染务必使用稳定且唯一的 `key`，否则会导致复用错误和额外重排。

---

## Q: `script setup` 为什么性能和开发体验更好？

**A:**

`script setup` 是编译时语法糖，核心优势：

1. 模板可直接访问顶层变量，无需手动 `return`
2. 更少样板代码，逻辑更聚合
3. 更好的 TypeScript 推断（`defineProps/defineEmits`）
4. 编译后更轻量，运行时开销更低

```vue
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
const props = defineProps<{ title: string }>()

const inc = () => count.value++
</script>

<template>
    <h3>{{ props.title }}: {{ count }}</h3>
    <button @click="inc">+1</button>
</template>
```

---

## Q: Vue3 为什么推荐 Pinia？与 Vuex 有什么区别？

**A:**

Pinia 是 Vue 官方推荐状态管理方案（Vuex 5 方向），与 Composition API 更契合。

| 对比维度 | Vuex | Pinia |
|------|------|------|
| API 设计 | `state/mutations/actions` 较重 | `state/getters/actions` 更简洁 |
| TS 支持 | 一般 | ✅ 更好，类型推导更自然 |
| 模块化 | 复杂命名空间 | 天然 store 拆分 |
| 修改状态 | 必须 mutation | 可直接改 state（仍可跟踪） |

```ts
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({ token: '', profile: null as null | { name: string } }),
    getters: {
        isLogin: (s) => !!s.token
    },
    actions: {
        setToken(token: string) {
            this.token = token
        }
    }
})
```

---
