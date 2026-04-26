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

## Q: Webpack 和 Vite 的核心区别是什么？面试里怎么回答更完整？

**A:**

可以从“开发阶段、生产构建、生态成熟度、迁移成本”四个维度回答。

| 维度 | Webpack | Vite |
|------|------|------|
| 开发阶段 | 启动前先打包，项目越大越慢 | 基于原生 ESM 按需加载，冷启动更快 |
| HMR 热更新 | 依赖增量打包与模块替换 | 基于模块图精准更新，响应更快 |
| 生产构建 | Webpack 自身构建链路 | 默认走 Rollup，产物更偏库生态优化 |
| 依赖预处理 | 传统 loader/plugin 体系处理 | esbuild 预构建依赖（尤其 CJS 转 ESM） |
| 配置复杂度 | 可定制度极高，但配置成本高 | 开箱即用，配置更轻量 |
| 插件生态 | 历史久、生态最全、兼容场景广 | 插件生态增长快，常见场景已覆盖 |
| 兼容老项目 | ✅ 更稳，尤其复杂历史项目 | 迁移有成本，需要评估插件与构建差异 |

面试高频总结：

1. **Vite 快在开发体验**：No-bundle dev + esbuild 预构建。
2. **Webpack 强在工程可控性**：复杂构建链、老项目兼容、深度定制能力成熟。
3. **生产阶段差异没开发阶段大**：Vite 生产仍要打包（Rollup），并不是“完全不打包”。

> ⚠️ **注意**：不要只说“Vite 比 Webpack 快”，要说明“为什么快、快在哪个阶段、代价是什么”。

---

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

---

## Q: 前端 CI/CD 是什么？一条可落地的流水线应该包含哪些环节？

**A:**

前端 **CI/CD** 的目标是把“代码合并 -> 质量校验 -> 构建发布”标准化、自动化，降低人为失误并提升发布频率。

常见前端流水线（PR 到生产）可以分 7 步：

1. **依赖安装与缓存**：基于 lockfile 安装依赖，并缓存包管理器目录。
2. **静态检查**：ESLint + TypeScript 类型检查。
3. **测试与覆盖率**：单元测试、必要的 E2E 冒烟测试。
4. **构建产物**：执行 `vite build`，产出带 hash 的静态资源。
5. **产物验证**：体积阈值（bundle size budget）、source map 策略、安全扫描。
6. **发布部署**：上传到 CDN/对象存储，执行缓存刷新。
7. **发布后验证**：健康检查、错误监控、性能指标对比。

```yaml
# GitHub Actions 简化示例
name: frontend-ci
on: [pull_request]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test
      - run: npm run build
```

> ⚠️ **注意**：CI 要求“可重复构建”，必须锁定 Node 版本和依赖版本（lockfile 不能漂移）。

---

## Q: 前端 CD 如何做灰度发布、回滚和多环境管理？

**A:**

前端 CD 的核心不是“能发出去”，而是“可控地发、可观测地发、可快速回滚”。

| 关键能力 | 推荐做法 | 价值 |
|------|------|------|
| 多环境隔离 | `dev/staging/prod` 分环境变量与部署目标 | 降低误发风险 |
| 灰度发布 | 按用户比例/白名单逐步放量 | 降低全量故障影响 |
| 版本可追踪 | 构建号 + commit hash 写入产物元信息 | 快速定位问题版本 |
| 快速回滚 | 保留历史静态资源版本，一键切回上个稳定版本 | 缩短故障恢复时间 |
| 缓存策略 | HTML 短缓存，JS/CSS 文件名带 hash 长缓存 | 避免缓存污染 |

前端发布常见策略：

1. **静态资源不可变**：`app.[contenthash].js`，确保新老版本可并存。
2. **入口文件可回滚**：只切换 `index.html` 指向的资源版本。
3. **先发静态资源再切流量**：避免页面引用到尚未上传完成的资源。
4. **监控联动回滚**：当错误率或核心性能指标超阈值时自动触发回滚。

> ⚠️ **注意**：前端回滚不只是“回退代码”，还要保证 CDN 缓存、环境变量和后端接口版本兼容。

---
