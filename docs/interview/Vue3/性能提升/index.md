# Vue3 性能提升

## Vue3 相比 Vue2 有哪些性能提升？

Vue3 在以下几个维度做了显著性能优化：

### 1. 编译优化

**静态提升（Static Hoisting）**

Vue3 编译器会将静态节点提升到渲染函数外部，只创建一次，重复渲染时直接复用，不再重新创建 VNode。

```js
// Vue2：每次 render 都重新创建静态节点
render() {
  return createVNode('div', null, [
    createVNode('p', null, '静态内容'), // 每次都创建
    createVNode('p', null, this.dynamic)
  ])
}

// Vue3：静态节点提升到渲染函数外
const _hoisted_1 = createVNode('p', null, '静态内容') // 只创建一次
function render() {
  return createVNode('div', null, [
    _hoisted_1,  // 直接复用
    createVNode('p', null, ctx.dynamic)
  ])
}
```

**靶向更新（PatchFlag）**

编译器在编译时标记动态内容，运行时 diff 时只比较标记了的动态部分，跳过静态内容。

```html
<!-- 模板 -->
<div :class="cls" :id="id">{{ text }}</div>
```

```js
// 编译结果：带 PatchFlag
createVNode('div', { class: cls, id: id }, text,
  PatchFlags.CLASS | PatchFlags.PROPS | PatchFlags.TEXT
)
// diff 时只处理 class、props、text，跳过其他一切
```

**Block Tree**

Vue3 引入 Block 的概念，将动态节点收集到一个数组中，diff 时只遍历这个数组，不做完整的树形遍历。

### 2. 响应式系统优化（Proxy vs defineProperty）

| 对比 | Vue2 `Object.defineProperty` | Vue3 `Proxy` |
|------|----------------------------|--------------|
| 新增属性 | 无法监听，需 `$set` | 直接监听 |
| 数组变化 | 只监听7种变异方法 | 完全监听 |
| 性能 | 初始化时递归劫持全部属性 | 懒代理，按需追踪 |
| 代码量 | 需要大量 hack | 更简洁 |

### 3. 体积优化（Tree-shaking）

- Vue3 将内置 API 全部改为**具名导出**（`import { ref, computed } from 'vue'`）
- 未使用的 API 在构建时会被 Tree-shaking 掉
- Vue3 最小运行时 bundle 约 **10KB**（Vue2 约 20KB）

### 4. diff 算法优化（最长递增子序列）

Vue3 使用**最长递增子序列（LIS）**算法处理有 key 的子节点列表，最大程度减少 DOM 移动操作。

Vue2 双端 diff → Vue3 最长递增子序列，减少不必要的 DOM 移动次数。
