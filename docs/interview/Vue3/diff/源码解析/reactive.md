# reactive 源码实现（手写简化版）

> Vue3 响应式核心之一：`reactive` 基于 **Proxy** 代理目标对象，在 `get` 时收集依赖，在 `set` 时派发更新。

## 整体结构

```
                      ┌─────────────────────────────────┐
                      │  targetMap (WeakMap)            │
                      │  ┌─────────┐                    │
   reactive(obj) ───► │  │ target  │──► Map<key, dep>   │
                      │  └─────────┘                    │
                      └─────────────────────────────────┘
                                  ▲ track   ▲ trigger
                                  │         │
        obj.name (get) ───────────┘         │
        obj.name = xx (set) ────────────────┘
                                  │
                                  ▼
                      triggerEffects(dep) → effect.run()
```

## 完整源码

```js
// --------------- reactive 模块 ---------------
/**
 * 收集所有依赖的 WeakMap 实例：
 * 1. key：响应性对象
 * 2. value：Map 对象
 *    1. key：响应性对象的指定属性
 *    2. value：指定对象的指定属性的 执行函数 (dep, 用 Set 去重)
 */
const targetMap = new WeakMap()

/**
 * 收集依赖
 */
function track(target, key) {
  if (!activeEffect) return
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  dep.add(activeEffect)
}

/**
 * 触发依赖
 */
function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  let dep = depsMap.get(key)
  if (!dep) return
  triggerEffects(dep)
}

/**
 * 依次触发 dep 中保存的依赖
 */
function triggerEffects(dep) {
  const effects = Array.isArray(dep) ? dep : [...dep]
  for (const effect of effects) {
    effect.run()
  }
}

/**
 * Proxy 的 handler
 */
const baseHandlers = {
  get: (target, key, receiver) => {
    const res = Reflect.get(target, key, receiver)
    track(target, key)            // 收集依赖
    return res
  },
  set: (target, key, value, receiver) => {
    const result = Reflect.set(target, key, value, receiver)
    trigger(target, key)          // 触发依赖
    return result
  }
}

function reactive(target) {
  return new Proxy(target, baseHandlers)
}

// --------------- effect 模块 ---------------
let activeEffect

class ReactiveEffect {
  constructor(fn) {
    this.fn = fn
  }
  run() {
    activeEffect = this           // 标记当前正在收集的副作用
    return this.fn()              // 执行 fn，触发 proxy 的 get → track
  }
}

function effect(fn) {
  const _effect = new ReactiveEffect(fn)
  _effect.run()
}

// --------------- 测试 reactive ---------------
const obj = reactive({
  name: '张三'
})

effect(() => {
  document.querySelector('#app').innerText = obj.name
})

setTimeout(() => {
  obj.name = '李四'                // 2 秒后视图自动更新为「李四」
}, 2000)
```

## 关键点

1. **三层依赖结构**：`WeakMap → Map → Set`
   - `WeakMap` 的 key 是目标对象（弱引用，方便 GC）
   - `Map` 的 key 是对象的属性名
   - `Set` 存储依赖该属性的副作用函数（自动去重）

2. **`Proxy` 拦截 13 种操作**（这里只演示 `get` / `set`）
   - 真实源码还有 `has`、`deleteProperty`、`ownKeys` 等

3. **`Reflect` 配合 `Proxy`**：保证 `this` 指向正确（`receiver` 是代理对象本身）

4. **依赖收集时机**：`effect(fn)` 首次执行 → 触发 `get` → `track` 把当前 `activeEffect` 收集到对应 dep

5. **派发更新时机**：修改属性 → 触发 `set` → `trigger` 取出 dep 逐个执行 `effect.run()`

## reactive 的局限性（源码层面解释）

| 现象 | 源码原因 |
| --- | --- |
| 解构丢响应式 | `const { name } = obj` 得到的是值，不再走 Proxy 的 get |
| 不能整体替换 | `obj = {...}` 让变量指向新对象，旧 Proxy 失效 |
| 不接受基本类型 | `new Proxy(0, ...)` 直接报错，Proxy 必须代理对象 |
