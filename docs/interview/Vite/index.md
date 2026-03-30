# Vite 面试题

## Vite 是什么？为什么它比 Webpack 快？

Vite 是一个现代化的前端构建工具，由 Vue 作者尤雨尿创作，分为两部分：

- **开发服务器**：基于原生 ES Module，不需要预先打包，按需加载模块
- **生产构建**：基于 Rollup 打包，优化静态资源输出

**为什么比 Webpack 快？**

| 对比 | Webpack | Vite |
|------|---------|------|
| 启动方式 | 一次性全量打包 bundle | 按需加载（No bundle）|
| 冷启动速度 | 项目越大越慢 | 任不受项目规模影响 |
| HMR 热更新 | 重新打包受影响的 chunk | 仅更新已改模块，极快 |
| 依赖处理 | Bundle-based | ESM 原生 + esbuild 预构建 |

**底层原理**：现代浏览器原生支持 ES Module（`import` 语法）。Vite 开发模式下起一个本地 HTTP 服务器，浏览器请求哪个模块就编译哪个，不需要打包全部文件。

## Vite 预构建依赖是什么？

首次启动时，Vite 会将项目的裸模块依赖分为两类：

- **预构建依赖**（dependencies）——不会变的第三方库（如 React、lodash）
  - 使用 **esbuild**（Go 语言编写）进行预构建，比 webpack 快 10∼100 倍
  - 将 CommonJS/UMD 转换为 ESM
- **源码**（source code）——项目自身的文件，新就过 HTTP 缪性加载

## Vite HMR 热更新原理

1. 监听文件变化（chokidar）
2. 找到已改模块在 **模块图** 中的所有依赖方
3. 发送 HMR 信息给浏览器（WebSocket）
4. 浏览器仅重新请求已改模块，**不刷新页面**

> Webpack HMR 需要重新打包局部 chunk，开销较大；Vite HMR 直接更新单个模块，几乎无感延迟。

## Vite 和 Webpack 如何选择？

| 场景 | 推荐 |
|------|------|
| 新项目、现代浏览器 | **Vite** |
| 老项目迁移、兼容性要求高 | **Webpack** |
| 工具链成熟、插件丰富 | **Webpack** |
| 追求极致开发体验 | **Vite** |

## Vite 生产构建为什么用 Rollup 而不用 esbuild？

esbuild 不支持以下生产需求：
- 代码分割（code splitting）CSS 重布局
- 调低输出 chunk、灵活的资源公共化策略
- 插件生态不完善

Rollup 在处理库的 Tree-shaking、是否自己把性能重化层面比 esbuild 更成熟。

## Vite 如何处理 CSS？

- **内联引入**：`import './style.css'` 会自动将样式添加到 `<style>` 标签
- **CSS Modules**：`*.module.css` 文件自动开启 CSS Modules
- **预处理器**：安装对应预处理器后即可使用（Sass/Less/Stylus），无需额外配置
- **PostCSS**：配置 `postcss.config.js` 即可生效

## Vite 配置文件常用选项有哪些？

```js
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': '/src' },   // 路径别名
  },
  server: {
    port: 3000,
    proxy: {                  // 开发代理
      '/api': 'http://localhost:8080'
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {          // Rollup 高级配置
      output: {
        chunkFileNames: 'js/[name]-[hash].js'
      }
    }
  }
})
```

## Vite 插件如何开发？

Vite 插件扩展自 Rollup 插件接口，额外提供了 Vite 特有的钉子：

```js
export default function myPlugin() {
  return {
    name: 'my-plugin',
    // Rollup 钉子
    transform(code, id) {
      if (id.endsWith('.custom')) {
        return transformCode(code)
      }
    },
    // Vite 特有钉子
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // 自定义中间件
      })
    }
  }
}
```
