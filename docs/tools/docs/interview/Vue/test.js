let activeEffect = null

class Dep {
    subscribe = new Set()
    depend() {
        if (activeEffect) {
            this.subscribe.add(activeEffect)
        }
    }
    notify() {
        this.subscribe.forEach(item => {
            item()
        })
    }
}

const targetMap = new Map()

function getTarget(target, key) {
    let depsMap = targetMap.get(target)
    if (!depsMap) {
        depsMap = new Map()
        targetMap.set(target, depsMap)
    }
    let dep = depsMap.get(key)
    if (!dep) {
        dep = new Dep()
        depsMap.set(key, dep)
    }
    return dep
}

function watchEffect(effect) {
    activeEffect = effect
    effect()
    activeEffect = null
}

function reactive(raw) {
    return new Proxy(raw, reactiveHandler)
}
const reactiveHandler = {
    get(target, key, receiver) {
        const dep = getTarget(target, key)
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
    count: 1
})
watchEffect(() => {
    console.log("count is : ", state.count);
})
setTimeout(() => {
    state.count++
}, 3000)