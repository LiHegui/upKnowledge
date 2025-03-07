let activeEffect;
// 依赖收集器 Dep
class Dep {
    subscribers = new Set()  // set 存储这些依赖
    depend() {
        if (activeEffect) {
            this.subscribers.add(activeEffect)
        }
    }
    notify() {
        this.subscribers.forEach(effect => {
            effect()
        })
    }
}
function watchEffect(effect) {
    activeEffect = effect
    effect()
    activeEffect = null
}

const targetMap = new WeakMap()

// 该函数的功能是返回target[key]的依赖收集器
function getTarget(target, key) {
    // depsMap为Map类型 里面存储要响应的对象的Map
    /**
     * {
     *  [target]: Map()
     *}
     */
    let depsMap = targetMap.get(target)
    if (!depsMap) {
        depsMap = new Map()
        targetMap.set(target, depsMap)
    }

    // 为每一个key设置Dep监听类
    let dep = depsMap.get(key)

    if (!dep) {
        dep = new Dep()
        depsMap.set(key, dep)
    }
    return dep
}
function reactive(raw) {
    return new Proxy(raw, reactiveHandler)
}
const reactiveHandler = {
    get(target, key, receiver) {
        const dep = getTarget(target, key)
        // 收集依赖
        dep.depend()
        return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
        const dep = getTarget(target, key)
        const result = Reflect.set(target, key, value, receiver)
        dep.notify()
        return result
    }
}

const state = reactive({
    count: 0
})
watchEffect(() => {
    console.log('count is :', state.count)
})
