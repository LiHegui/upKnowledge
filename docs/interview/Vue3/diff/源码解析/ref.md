# ref 源码实现（手写简化版）

> Vue3 响应式核心之一：`ref` 通过 `RefImpl` 类 + `.value` 的 getter/setter 触发依赖收集与派发。

## 整体结构

```
┌─────────────┐  收集  ┌──────────────┐
│ effect(fn)  │ ─────► │ activeEffect │
└─────────────┘        └──────┬───────┘
                              │ get .value
                              ▼
                       ┌──────────────┐  track   ┌────────┐
                       │  RefImpl     │ ───────► │  dep   │
                       │  _value      │ ◄─────── │ (Set)  │
                       └──────┬───────┘ trigger  └────────┘
                              │ set .value
                              ▼
                        triggerEffects → effect.run()
```

## 完整源码

```js
// --------------- reactive 模块 ---------------
/**
 * 收集所有依赖的 WeakMap 实例：
 * 1. key：响应性对象
 * 2. value：Map 对象
 *    1. key：响应性对象的指定属性
 *    2. value：指定对象的指定属性的 执行函数
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
    track(target, key)
    return res
  },
  set: (target, key, value, receiver) => {
    const result = Reflect.set(target, key, value, receiver)
    trigger(target, key)
    return result
  }
}

function reactive(target) {
  return new Proxy(target, baseHandlers)
}

// --------------- ref 模块 ---------------
class RefImpl {
  _rawValue
  _value
  dep

  constructor(value) {
    this._rawValue = value
    this._value = value
  }

  /**
   * xxx.value 时触发：收集依赖
   */
  get value() {
    if (activeEffect) {
      const dep = ref.dep || (ref.dep = new Set())
      dep.add(activeEffect)
    }
    return this._value
  }

  /**
   * xxx.value = newVal 时触发：派发依赖
   */
  set value(newVal) {
    this._rawValue = newVal
    this._value = newVal
    if (ref.dep) {
      triggerEffects(ref.dep)
    }
  }
}

function ref(value) {
  return new RefImpl(value)
}

// --------------- effect 模块 ---------------
let activeEffect

class ReactiveEffect {
  constructor(fn) {
    this.fn = fn
  }
  run() {
    activeEffect = this
    return this.fn()
  }
}

function effect(fn) {
  const _effect = new ReactiveEffect(fn)
  _effect.run()
}

// --------------- 测试 ref ---------------
const name = ref('张三')

effect(() => {
  document.querySelector('#app').innerText = name.value
})

setTimeout(() => {
  name.value = '李四'
}, 2000)
```

## 关键点

1. **`RefImpl` 类**：用对象包一层基本类型，通过 `get/set value` 拦截读写
2. **依赖收集**：`get` 时把当前 `activeEffect` 加入 `dep`（Set 去重）
3. **派发更新**：`set` 时遍历 `dep` 调用 `effect.run()`
4. **`effect()`**：注册副作用函数，首次执行时把自己挂到 `activeEffect` 上
