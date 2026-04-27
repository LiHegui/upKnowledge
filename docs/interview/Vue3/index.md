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
