# Vue3 Tree-shaking 特性

## 说说 Vue3 中的 Tree-shaking？

### 什么是 Tree-shaking？

Tree-shaking 是一种通过**静态分析**移除 JavaScript 中未使用代码（dead code）的优化技术。依赖于 ES Module 的静态导入/导出语法。

### Vue3 是如何支持 Tree-shaking 的？

**Vue2 的问题**：全局 API 挂载在 Vue 实例上，无法被 Tree-shaking。

```js
// Vue2：即使不用 nextTick，它也会被打包进去
import Vue from 'vue'
Vue.nextTick(() => {})
```

**Vue3 的解法**：所有 API 改为具名导出，按需引入。

```js
// Vue3：只导入用到的，未用到的不打包
import { ref, computed, nextTick, watch } from 'vue'
```

### 哪些内容可以被 Tree-shaking？

| 类别 | 举例 |
|------|------|
| 全局 API | `nextTick` / `defineComponent` / `h` |
| 内置组件 | `<Transition>` / `<KeepAlive>` / `<Teleport>` |
| 指令 | `v-model`（内部实现模块化）|
| 响应式 API | `ref` / `reactive` / `computed` / `watch` |

### 实际效果

- 一个只用了基础功能的 Vue3 应用，运行时包大小约 **10KB**（gzip）
- Vue2 最小包约 **20KB**
- 项目越大、用到的 API 越少，Tree-shaking 优化效果越显著

### 注意事项

- 必须使用 **ES Module** 格式（`import/export`），CommonJS 不支持 Tree-shaking
- 构建工具（Webpack/Rollup/Vite）需要开启相关优化（生产模式默认开启）
- 有副作用的代码需要在 `package.json` 中用 `"sideEffects"` 字段声明

```json
// package.json
{
  "sideEffects": ["*.css", "./src/polyfills.js"]
}
```
