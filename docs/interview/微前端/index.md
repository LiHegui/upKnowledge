# 微前端完全指南

> 微前端（Micro-Frontends）是一种前端架构模式，将单体前端应用拆分为多个可以独立开发、独立部署、独立运行的小型应用，再通过**主应用（基座）** 将它们组合成一个整体。

---

## 目录

- [什么是微前端？](#什么是微前端)
  - [微前端的起源](#微前端的起源)
  - [微前端的核心原则](#微前端的核心原则)
  - [微前端与微服务的类比](#微前端与微服务的类比)
- [微前端的实现方案](#微前端的实现方案)
  - [方案对比总览](#方案对比总览)
  - [Iframe 方案](#iframe-方案)
  - [Web Components 方案](#web-components-方案)
  - [运行时集成（Single-SPA / qiankun）](#运行时集成single-spa--qiankun)
  - [构建时集成（Module Federation）](#构建时集成module-federation)
  - [边缘侧集成（Edge-Side Includes）](#边缘侧集成edge-side-includes)
- [主流框架深度解析](#主流框架深度解析)
  - [qiankun](#qiankun)
  - [micro-app](#micro-app)
  - [wujie（无界）](#wujie无界)
  - [Module Federation（Webpack 5 / Rspack）](#module-federationwebpack-5--rspack)
  - [主流框架对比总结](#主流框架对比总结)
  - [框架选择指南](#框架选择指南)
- [核心技术挑战](#核心技术挑战)
  - [JS 沙箱（Sandbox）](#js-沙箱sandbox)
  - [样式隔离（CSS Isolation）](#样式隔离css-isolation)
  - [应用间通信机制](#应用间通信机制)
  - [路由管理](#路由管理)
  - [公共依赖加载](#公共依赖加载)
  - [构建与部署策略](#构建与部署策略)
- [微前端的适用场景与误区](#微前端的适用场景与误区)
  - [什么时候该用微前端](#什么时候该用微前端)
  - [什么时候不该用微前端](#什么时候不该用微前端)
  - [常见误区](#常见误区)
- [🎤 面试回答完整版（10分版）](#面试回答完整版10分版)

---

## 什么是微前端？

**微前端**是一种将前端应用分解为更小、更简单的独立应用，并在运行时将它们组合成一个整体的架构模式。每个子应用可以：

- 由不同团队独立开发和维护
- 使用不同的技术栈（React、Vue、Angular 等）
- 独立构建和部署
- 拥有自己的路由状态和业务逻辑

> 一句话定义：微前端 = 前端领域的微服务。把一个大前端拆成多个小前端，每个小前端独立开发、测试、部署，最后通过一个"容器"应用组合在一起。

**微前端架构概览：**

```
主应用（基座）
├─ 子应用 A（React）    —— 团队 A 独立开发/部署
├─ 子应用 B（Vue）      —— 团队 B 独立开发/部署
└─ 子应用 C（Angular）  —— 团队 C 独立开发/部署
```

> 💡 主应用负责：路由分发、子应用生命周期管理、公共服务（登录/权限/布局）。每个子应用拥有独立的技术栈、代码库和 CI/CD。

---

### 微前端的起源

微前端的思路最早在 2016 年由 ThoughtWorks 技术雷达提出。它的出现源于几个现实需求：

- **前端应用越来越庞大**：中后台系统、电商后台、企业级 SaaS 等单页应用（SPA）复杂性急剧上升
- **团队规模扩大**：多人协作同一代码库带来的冲突和耦合问题
- **技术栈迁移困难**：老项目想从旧框架迁移到新框架，需要一种渐进方式
- **独立部署诉求**：不同模块的发布频率不同，希望可以单独上线

| 时间 | 里程碑 | 说明 |
|------|--------|------|
| 2016 | ThoughtWorks 技术雷达提出概念 | 正式命名 "Micro-Frontends" |
| 2018 | single-spa 初版 | 最早的微前端框架之一 |
| 2019 | qiankun 发布 | 基于 single-spa，由蚂蚁金服开源 |
| 2020 | Webpack 5 Module Federation 发布 | 构建时微前端方案，运行时共享模块 |
| 2021 | micro-app 发布 | 京东开源，基于 Web Components |
| 2022 | wujie（无界）发布 | 腾讯开源，基于 Web Components + iframe 沙箱 |
| 2023+ | 模块联邦 1.1 / Rspack 支持 | Module Federation 进一步成熟 |

---

### 微前端的核心原则

微前端架构需要遵循以下原则：

1. **技术无关性**：每个子应用可以自由选择技术栈，不应强制统一
2. **独立开发**：团队间互不干扰，每个团队的 CI/CD 管道独立
3. **独立部署**：子应用可以独立发布，不需要等主应用或其他子应用同步上线
4. **独立运行**：子应用间的状态、副作用互相隔离，不产生冲突
5. **统一集成**：最终用户看到的是一个完整的、无缝的应用，感受不到多个应用的拼接痕迹
6. **自治性**：每个子应用拥有自己的数据、路由、样式自主权

> ⚠️ **注意**：以上是理想目标，实际工程中各个原则之间存在 trade-off。比如"技术无关性"和"性能优化"之间需要平衡——如果子应用都加载两套 UI 库，体积会失控。

---

### 微前端与微服务的类比

> "微前端就是把后端微服务的思路搬到前端。"

| 维度 | 微服务 | 微前端 |
|------|--------|--------|
| 拆分粒度 | 按业务功能拆分为独立服务 | 按业务功能拆分为独立应用 |
| 独立部署 | 每个服务独立部署 | 每个子应用独立部署 |
| 技术栈 | 服务可选用不同语言/框架 | 子应用可选用不同前端框架 |
| 通信方式 | 轻量级 API 调用（HTTP/gRPC） | 自定义事件 / 发布订阅 / props |
| 数据存储 | 每个服务拥有独立数据库 | 每个子应用拥有独立状态 |
| 统一入口 | API 网关 | 主应用（基座） |
| 团队自治 | 不同团队维护不同服务 | 不同团队维护不同子应用 |

---

## 微前端的实现方案

实现微前端有多种技术路径，核心差异在于**集成时机**：是在运行时组合，还是在构建时组合？

---

### 方案对比总览

| 方案 | 集成时机 | 隔离性 | 通信难度 | 性能 | 适用场景 |
|------|---------|--------|---------|------|---------|
| Iframe | 运行时 | 极高（完全隔离） | 困难（postMessage） | 较差（每次加载成本高） | 第三方嵌入、遗留系统快速集成 |
| Web Components | 运行时 | 中等（Shadow DOM） | 中等 | 中等 | 跨框架组件库 |
| Single-SPA / qiankun | 运行时 | 高（JS 沙箱 + CSS 隔离） | 简单 | 较好 | 企业级中后台微前端 |
| micro-app | 运行时（Web Components） | 高 | 简单 | 较好 | 快速接入微前端 |
| wujie（无界） | 运行时（Web Components + iframe） | 极高 | 简单 | 好 | 对隔离性要求极高的场景 |
| Module Federation | 构建时 / 运行时 | 低（不提供内置隔离） | 原生 JS 模块机制 | 极好（共享依赖） | 大型应用模块共享、插件化架构 |
| Edge-Side Includes | 服务端 | 高 | 简单 | 好（缓存友好） | 内容型网站、电商详情页 |

---

### Iframe 方案

Iframe 是最早也最简单的"微前端"方案——把不同应用放到 `<iframe>` 中加载。

```html
<!-- 主应用 -->
<iframe src="https://app1.example.com/orders"></iframe>
<iframe src="https://app2.example.com/dashboard"></iframe>
```

**优点：**
- 天然的 JS 和 CSS 隔离——浏览器级别的隔离，最强隔离方案
- 子应用独立域名，资源加载不受主应用影响
- 子应用可以用任何技术栈
- 实现简单，几乎零改造成本

**缺点：**
- 样式隔离太"彻底"，弹窗、遮罩层无法覆盖到主应用范围
- 通信仅靠 postMessage，复杂交互场景开发体验差
- 每次导航 iframe 需要重新加载（除非隐藏 + 显示策略）
- URL 不同步，浏览器前进/后退行为难以统一管理
- 性能开销大（每个 iframe 都是独立的浏览器上下文）
- 响应式布局困难，难以做到无缝的 UI 拼接体验

> 结论：Iframe 最好用于**自身独立、与主应用交互少**的功能模块（如嵌入第三方报表、低代码编辑器），不适合需要深度交互的微前端场景。

---

### Web Components 方案

利用浏览器原生 Custom Elements + Shadow DOM 技术，将子应用封装为自定义 HTML 元素。

```html
<!-- 主应用 -->
<micro-app-myapp></micro-app-myapp>
<script>
  customElements.define('micro-app-myapp', MyAppWrapper);
</script>
```

**优点：**
- 浏览器原生标准，无框架依赖
- Shadow DOM 提供天然的 CSS 和 DOM 隔离
- 理论上可以跨任何框架使用

**缺点：**
- Shadow DOM 的样式隔离带来了弹窗、全局样式的穿透困难
- 目前缺乏完善的生命周期管理（挂载/卸载/更新）
- 浏览器兼容性问题（Shadow DOM v1 在部分浏览器支持有限）
- 框架集成不够完美（React 对 Shadow DOM 事件处理不够友好）
- 单靠 Web Components 无法独立解决完整的微前端方案（缺少沙箱、通信等）

> micro-app 和 wujie 都利用了 Web Components 作为"容器"技术，但在此基础上补充了 JS 沙箱、通信机制等能力，不是纯 Web Components 方案。

---

### 运行时集成（Single-SPA / qiankun）

运行时集成是目前国内最主流的微前端方案。核心思路是**用一个"主应用"作为基座**，在运行时根据路由加载/卸载不同的子应用。

```js
// Single-SPA 注册子应用示例
import { registerApplication, start } from 'single-spa';

registerApplication({
  name: 'app1',
  app: () => import('app1/main.js'),  // 懒加载子应用入口
  activeWhen: '/app1',                 // 路由匹配时激活
});

start();
```

子应用需要暴露约定的生命周期钩子：

```js
// 子应用入口
export async function bootstrap(props) { /* 初始化 */ }
export async function mount(props) { /* 挂载：渲染 DOM */ }
export async function unmount(props) { /* 卸载：清理 DOM 和副作用 */ }
```

**优点：**
- 主流方案，社区成熟度高
- 支持多种框架混合使用
- 子应用可以独立开发构建

**缺点：**
- 需要子应用改造（暴露生命周期）
- 依赖主应用协调路由
- 子应用间通信需要借用主应用

> qiankun 在 Single-SPA 基础上增加了 JS 沙箱和样式隔离等能力，是这套方案的集大成者。

---

### 构建时集成（Module Federation）

Module Federation 是 **Webpack 5 的核心功能**，它允许一个 JavaScript 应用在运行时动态加载另一个应用的代码模块——更像是"运行时共享代码"，而不是"组合多个应用"。

```js
// 主应用 webpack.config.js
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      remotes: {
        app1: 'app1@http://cdn.example.com/app1/remoteEntry.js',
      },
    }),
  ],
};
```

```js
// 子应用（暴露远程模块）
new ModuleFederationPlugin({
  name: 'app1',
  filename: 'remoteEntry.js',
  exposes: {
    './MyComponent': './src/MyComponent',
    './store': './src/store',
  },
  shared: {
    react: { singleton: true },    // 共享 React，只加载一次
    'react-dom': { singleton: true },
  },
});
```

**优点：**
- 完美共享依赖——多个子应用使用同一份 React/Vue，避免重复加载
- 不需要额外运行时框架
- 可以共享组件、模块、状态等任意粒度
- 性能最佳（无沙箱开销）

**缺点：**
- 不提供 JS 沙箱和 CSS 隔离（需要自行处理）
- 强依赖 Webpack 5（Rspack 已开始支持，Vite 支持有限）
- 配置较为复杂
- 子应用间耦合相对运行时方案更高

---

### 边缘侧集成（Edge-Side Includes）

ESI 是一种在 CDN 边缘节点组装 HTML 片段的技术：

```html
<html><body>
  <esi:include src="http://app1.example.com/header" />
  <esi:include src="http://app2.example.com/content" />
</body></html>
```

**优点：** 服务端组合，CDN 缓存友好，对客户端透明。
**缺点：** 需要 CDN 支持 ESI，不适合 SPA，片段间通信有限。

> ESI 方案更适用于**内容类、电商类**网站，不适合 SPA 企业应用。

---

## 主流框架深度解析

目前国内最主流的三个运行时微前端框架是 **qiankun**、**micro-app** 和 **wujie**。构建时则主要是 **Module Federation**。

---

### qiankun

> qiankun = single-spa（路由管理）+ 自研 JS 沙箱 + 样式隔离方案

**基本原理：**

qiankun 采用"基座 + 微应用"架构。当用户访问特定路由时，qiankun 通过 URL 变化触发子应用的挂载/卸载。

**核心工作流程：**

1. 主应用注册子应用（指定名称、入口、路由规则）
2. 浏览器导航到 `/app1` 路径
3. qiankun 通过 fetch 获取子应用的 HTML 入口文件
4. 解析 HTML 中的 `<script>` 和 `<link>` 标签，拉取 JS 和 CSS
5. 执行 JS 代码前创建 JS 沙箱（Proxy 沙箱 / Snapshot 沙箱）
6. JS 执行完成后，挂载子应用的 DOM 到指定的容器节点
7. 通过手动管理 `<style>` 标签实现 CSS 隔离
8. 路由变化时，卸载旧子应用（清理沙箱、DOM 和副作用），挂载新子应用

**qiankun 子应用加载流程：**

```
① 路由匹配        ② fetch HTML      ③ 解析资源       ④ 创建沙箱          ⑤ 挂载 DOM
activeRule 命中 → 拉取子应用入口 → 提取 JS / CSS → Proxy / Snapshot → 渲染到容器节点
```

> 🔑 路由变化时，先卸载旧子应用（清理沙箱 + DOM + 副作用），再重复以上流程挂载新子应用。

**HTML 入口机制：**

```js
import { registerMicroApps, start } from 'qiankun';

registerMicroApps([
  {
    name: 'react-app',
    entry: '//localhost:3000',
    container: '#sub-app-container',
    activeRule: '/app-react',
  },
]);

start();
```

JS 沙箱的 Proxy 方案（qiankun 的核心创新）：

```js
class ProxySandbox {
  constructor() {
    const rawWindow = window;
    const fakeWindow = Object.create(null);
    const proxy = new Proxy(fakeWindow, {
      set: (target, prop, value) => {
        target[prop] = value;
        return true;
      },
      get: (target, prop) => {
        if (prop === 'window' || prop === 'self') return proxy;
        return target[prop] || rawWindow[prop];
      },
    });
    this.proxy = proxy;
  }
}
```

**qiankun 的限制：**
- 子应用必须支持 fetch 拉取 HTML 入口，跨域时需配置 CORS
- 对 Vite 开发服务器不友好（Vite 使用 ESM）
- 沙箱性能：Proxy 沙箱在频繁操作 window 时有额外开销

> qiankun 的优势在于**生态最成熟**——踩坑案例最多，社区解决方案也最丰富。如果你需要稳定的生产方案，qiankun 是首选。

---

### micro-app

> micro-app = Web Components（容器）+ Custom Elements（生命周期）+ 自研 JS 沙箱

京东开源，核心思路是利用 Custom Elements 机制，将微前端降级为"使用一个自定义标签"那么简单。

```html
<!-- 主应用使用 -->
<micro-app name="app1" url="http://localhost:3001/" baseroute="/app1"></micro-app>
```

**核心原理：**

1. 使用 `<micro-app>` 自定义元素作为子应用的**容器**
2. 当自定义元素连接到 DOM 时（connectedCallback），触发子应用的加载
3. 通过 fetch 获取子应用的 HTML 入口
4. 提取并执行 JS（在沙箱中），渲染子应用的 DOM
5. 利用 Custom Elements 的生命周期（disconnectedCallback）触发卸载

**关键特性：**
- **低侵入性**：对子应用改造成本最低，通常只需修改资源路径
- **组件级微前端**：一个页面内可以加载多个 `<micro-app>`
- **数据通信**：通过 `data` 属性和 `window.microApp` API

```html
<micro-app name="app1" url="http://localhost:3001/" data="{userId: 123}"></micro-app>
```

```js
// 子应用
window.microApp?.getData()                           // { userId: 123 }
window.microApp?.dispatch({ type: 'orderCompleted' }) // 向主应用发消息
```

与 qiankun 的主要区别：

| 维度 | qiankun | micro-app |
|------|---------|-----------|
| 技术基础 | single-spa + 自定义沙箱 | Web Components + 自定义沙箱 |
| 子应用改造成本 | 较高（需暴露生命周期） | 较低（通常只需改资源路径） |
| 组件级使用 | ❌ 不支持 | ✅ 支持 |
| 使用难度 | 中 | 低 |

---

### wujie（无界）

> wujie = Web Components（容器）+ iframe（JS 沙箱）+ Proxy（通信桥接）

腾讯开源，最独特的设计是**用 iframe 做 JS 沙箱，而不是 Proxy**。

**为什么用 iframe 做沙箱？**

传统 Proxy 沙箱有隐蔽的问题：某些浏览器 API 无法被 Proxy 完美拦截。例如 `Object.defineProperty(window, ...)` 仍然会修改真实 window。iframe 沙箱是浏览器原生级别的——JS 在 iframe 上下文中执行，所有全局副作用只影响 iframe 的 window。

**wujie 的工作方式：**

1. **JS 在 iframe 中执行**——隐藏的 `<iframe>` 加载子应用的 HTML 和 JS
2. **DOM 在主应用中渲染**——子应用的 DOM 节点从 iframe 复制到主应用的 `<wujie-app>` 标签下
3. **虚拟 document**——通过 Proxy 拦截对 document 的访问，指向主应用的 document，保证弹窗等正常
4. **路由同步**——主应用 URL 变化自动同步到 iframe，反之亦然

**wujie 架构 — JS 与 DOM 分离：**

| 隐藏 iframe（JS 沙箱） | 主应用（DOM 渲染） |
|----------------------|-------------------|
| 加载子应用 HTML 和 JS | 子应用 DOM 渲染到 `<wujie-app>` 中 |
| 所有 JS 在 iframe window 上执行 | 弹窗/遮罩层在主应用 document 中 |
| 全局变量完全隔离于主应用 | Proxy 桥接 document 访问 |
| 浏览器级沙箱，无法逃逸 | 路由双向同步 |

> 💡 核心创新：JS 执行环境和 DOM 渲染环境分离——iframe 只负责 JS 隔离，UI 渲染仍在主应用中，兼顾了隔离性和用户体验。

```html
<wujie-app name="app1" url="http://localhost:3001/" sync="true"></wujie-app>
```

| 维度 | Proxy 沙箱（qiankun / micro-app） | iframe 沙箱（wujie） |
|------|----------------------------------|---------------------|
| 隔离程度 | 中（99% 场景够用） | 极高（浏览器级隔离） |
| 兼容性 | window 特殊属性可能泄漏 | 完全隔离 |
| 性能 | 好（Proxy 有少量开销） | 好（iframe 仅用于 JS 执行） |
| 通信复杂度 | 直接桥接 | 通过 Proxy + postMessage |

---

### Module Federation（Webpack 5 / Rspack）

Module Federation 是另一种思路——不追求隔离，而是追求**共享**。

**核心概念：**
- **Host（宿主）**：消费远程模块的应用
- **Remote（远程）**：暴露模块供其他应用消费的应用
- **Shared（共享依赖）**：共享的第三方库，只加载一次

```js
// Remote 应用配置
new ModuleFederationPlugin({
  name: 'shop',
  filename: 'remoteEntry.js',
  exposes: {
    './ProductList': './src/products/ProductList',
  },
  shared: {
    react: { singleton: true, requiredVersion: '^18.0.0' },
    'react-dom': { singleton: true },
  },
});
```

```jsx
// Host 中消费远程组件
const ProductList = React.lazy(() => import('shop/ProductList'));

function App() {
  return <React.Suspense fallback="Loading..."><ProductList /></React.Suspense>;
}
```

**shared 的 singleton 机制：**

当多个应用共享 React 时，Federation 保证页面只加载一份 React 代码。版本冲突时使用满足所有应用需求的最高版本，无法满足时在控制台告警。

> Module Federation 和运行时微前端可以结合使用：运行时框架处理应用级别的隔离和路由，Federation 处理模块级别的共享和依赖管理。

---

### 主流框架对比总结

| 维度 | qiankun | micro-app | wujie | Module Federation |
|------|---------|-----------|-------|-----------------|
| 开源方 | 蚂蚁金服 | 京东 | 腾讯 | Webpack 团队 |
| 技术基础 | single-spa + Proxy 沙箱 | Web Components + Proxy 沙箱 | Web Components + iframe 沙箱 | Webpack 5 Plugin |
| 集成方式 | 运行时（HTML 入口） | 运行时（HTML 入口） | 运行时（HTML 入口） | 构建时 + 运行时 |
| JS 隔离 | ✅ Proxy 沙箱 | ✅ Proxy 沙箱 | ✅ iframe 沙箱（最强） | ❌ 无内置隔离 |
| CSS 隔离 | ✅ 样式管理 | ✅ Scope + Shadow DOM | ✅ Shadow DOM | ❌ 需自行处理 |
| 子应用改造成本 | 较高 | 最低 | 低 | 中 |
| 组件级微前端 | ❌ | ✅ | ✅ | ✅ |
| Vite 支持 | ❌ | ❌ | ❌ | ⚠️ 需插件 |
| 性能 | 好 | 好 | 好 | 极好 |
| 生态成熟度 | 最高 | 高 | 较高 | 高 |

---

### 框架选择指南

```
你的场景是什么？
│
├─ 需要极强隔离（第三方不安全代码嵌入）
│  └→ wujie（iframe 沙箱方案）
│
├─ 需要快速、低成本接入微前端
│  └→ micro-app（对子应用侵入性最低）
│
├─ 需要高稳定性、最成熟的方案
│  └→ qiankun（社区最大，踩坑案例最多）
│
├─ 需要模块级共享（非应用级）
│  └→ Module Federation（适合插件化架构）
│
└─ 所有子应用都用同一框架
   └→ Module Federation（共享依赖，性能最佳）
```

---

## 核心技术挑战

无论选择哪个框架，微前端都需要解决几个核心技术问题。

---

### JS 沙箱（Sandbox）

JS 沙箱的目的：**让子应用在独立的全局环境中运行，不污染主应用或其他子应用的全局变量。**

**方案一：Proxy 沙箱（qiankun / micro-app）**

```js
// Proxy 沙箱核心逻辑（简化版）
class ProxySandbox {
  constructor() {
    const rawWindow = window;
    const fakeWindow = Object.create(null);
    const proxy = new Proxy(fakeWindow, {
      set: (_, prop, value) => { fakeWindow[prop] = value; return true; },
      get: (_, prop) => {
        if (prop === "window" || prop === "self" || prop === "globalThis") return proxy;
        return fakeWindow[prop] || rawWindow[prop];
      },
      has: (_, prop) => prop in fakeWindow || prop in rawWindow,
    });
    this.proxy = proxy;
  }
}
```

**方案二：Snapshot 沙箱（qiankun 降级方案）**

不支持 Proxy 时使用，激活前快照 window 状态，卸载时恢复：

```js
class SnapshotSandbox {
  active() {
    // 快照当前 window
    for (const prop in window) {
      if (window.hasOwnProperty(prop)) {
        this.windowSnapshot[prop] = window[prop];
      }
    }
  }
  inactive() {
    // 恢复快照
    for (const prop in window) {
      if (window.hasOwnProperty(prop)) {
        if (window[prop] !== this.windowSnapshot[prop]) {
          this.modifyPropsMap[prop] = window[prop];
          window[prop] = this.windowSnapshot[prop];
        }
      }
    }
  }
}
```

**方案三：iframe 沙箱（wujie）**

利用 iframe 创建独立的 JS 执行上下文，JS 在其中执行，DOM 桥接到主应用。

**各方案对比：**

| 方案 | 隔离级别 | 兼容性 | 性能 | 典型框架 |
|------|---------|--------|------|---------|
| Proxy 沙箱 | 高（99% 场景） | 好（IE 不支持） | 快 | qiankun, micro-app |
| Snapshot 沙箱 | 中 | 极好 | 中 | qiankun 降级 |
| iframe 沙箱 | 极高（浏览器级） | 极好 | 好 | wujie |

> Proxy 沙箱有一个无法解决的边界——子应用可以通过特殊方式绕过。iframe 沙箱在理论上是唯一能做到完全隔离的方案。

---

### 样式隔离（CSS Isolation）

**方案一：CSS Modules / CSS-in-JS（首选）**

构建时自动为 class 名生成唯一哈希，从根本上避免冲突，无运行时开销。

```css
/* 构建前 */ .header { color: red; }
/* 构建后 */ ._header_1a2b3 { color: red; }
```

**方案二：动态样式管理（qiankun 方案）**

子应用挂载时样式追加到 DOM，卸载时移除。

**方案三：Shadow DOM**

浏览器原生隔离，但弹窗组件会逃逸到 document.body，需额外处理。

**方案四：PostCSS 自动 scoping**

构建时自动为选择器加属性选择器 `[data-app-id="app1"] .header { ... }`。

| 方案 | 隔离效果 | 运行时开销 | 推荐度 |
|------|---------|-----------|--------|
| CSS Modules | 高 | 无 | ✅ 首选 |
| 动态样式管理 | 中 | 低 | ✅ 兜底 |
| Shadow DOM | 极高 | 低 | ⚠️ 弹窗问题 |
| PostCSS scoping | 高 | 无 | ✅ 推荐 |

> **最佳实践**：CSS Modules + 动态样式管理组合使用。

---

### 应用间通信机制

**方案一：Custom Events**

```js
// 主应用监听
window.addEventListener("app-event", (e) => console.log(e.detail));
// 子应用发送
window.dispatchEvent(new CustomEvent("app-event", { detail: { type: "orderPlaced" } }));
```

**方案二：框架内置通信**

- **qiankun**：`initGlobalState` → `onGlobalStateChange` / `setGlobalState`
- **micro-app**：`data` 属性 + `window.microApp` API
- **wujie**：`window.$wujie` bus / props

```js
// qiankun 通信示例
// 主应用
const actions = initGlobalState({ user: { id: 123 } });
actions.setGlobalState({ user: { id: 456 } });
// 子应用
export function mount(props) {
  props.onGlobalStateChange((state, prev) => { /* 监听 */ });
}
```

> **原则**：通信应尽量少。过度通信意味着耦合过深，不该拆。

---

### 路由管理

用户访问 `/app1/orders` 的流程：

```
1. 主应用 activeRule: "/app1" → 匹配 → 激活子应用
2. 子应用收到 baseroute = "/app1"
3. 子应用路由 "/orders" → 完整路径 "/app1/orders"
4. 子应用渲染订单页面
```

```js
// 子应用 Vue Router
const router = new VueRouter({
  base: window.__POWERED_BY_QIANKUN__ ? "/app1" : "/",
  mode: "history",
  routes: [...],
});
```

常见问题：子应用路由刷新 404，需要 Nginx 配置 SPA 回退。

```nginx
location /app1 { try_files $uri $uri/ /app1/index.html; }
```

---

### 公共依赖加载

- **CDN + externals**：子应用将 React、Vue 等声明为 external，由主应用统一加载
- **Module Federation shared**：Federation 保证 shared 库只加载一次
- **qiankun excludeAssetFilter**：配置哪些资源不经过沙箱

---

### 构建与部署策略

**独立部署（推荐）**：每个子应用独立 CI/CD，部署到独立 CDN 路径。

```
app1 → 部署到 https://cdn.example.com/app1/1.0.0/
app2 → 部署到 https://cdn.example.com/app2/2.1.0/
```

**统一部署**：monorepo + 统一构建（Nx、Turborepo），效率更高但牺牲了独立部署能力。

---

## 微前端的适用场景与误区

### 什么时候该用微前端

- **多团队协作**：不同团队负责不同业务模块，需要独立迭代
- **大型企业级应用**：CRM、ERP、低代码平台等
- **渐进式技术栈迁移**：从旧框架逐步迁移到 Vue/React
- **独立部署诉求强烈**：部分模块需要高频上线
- **代码库规模过大**：编译时间过长、git 冲突频繁

---

### 什么时候不该用微前端

- **小团队（< 10人）**：单体完全够用
- **简单应用**：几个页面不需要架构拆分
- **缺乏基建能力**：需要完善的 CI/CD 和监控体系
- **临时性项目**：不值得做架构拆分
- **对性能敏感**：C 端高并发页面需慎重

---

### 常见误区

**误区一：微前端 = qiankun**
> 微前端是架构模式，qiankun 只是实现之一。

**误区二：微前端能解决所有问题**
> 微前端解决多团队协作和独立部署的问题，同时引入性能开销和复杂度。

**误区三：用了微前端就不耦合了**
> 频繁通信的微前端本质仍是耦合的。合理拆分应是业务域内自治。

**误区四：技术栈可以完全随意**
> 完全不一致有共享成本。实践中通常在 2-3 个框架范围内选择。

**误区五：微前端首屏性能一定差**
> 通过预加载、预执行、缓存等策略可以优化，开销通常在几十到几百毫秒。

> **核心判断**：没有感受到单体应用的痛苦，就不要用微前端。

---

## 面试回答完整版（10分版）

### 第一段：先定性——什么是微前端

微前端是一种将前端应用拆分为多个独立开发、独立部署、独立运行的小型应用的架构模式，通过主应用（基座）在运行时组合成一个整体。源自微服务思想，每个子应用可用不同技术栈，拥有独立 CI/CD。

微前端需解决几个核心问题：**JS 隔离**、**样式隔离**、**路由管理**、**应用间通信**、**公共依赖**。

---

### 第二段：实现方案分类

按集成时机分为三类：

**运行时集成**：主应用在浏览器端加载子应用资源。代表：qiankun、micro-app、wujie。优势是独立部署，缺点是有运行时开销。

**构建时集成**：通过构建工具共享模块。代表：Module Federation。性能最好，但无内置隔离。

**服务端集成**：CDN 边缘节点组合 HTML。适合内容网站，不适合 SPA。

| 方案 | 集成时机 | 代表框架 | 隔离程度 | 性能 |
|------|---------|---------|---------|------|
| 运行时集成 | 运行时 | qiankun, micro-app, wujie | 高 | 中 |
| 构建时集成 | 构建时 | Module Federation | 低 | 最高 |
| 服务端集成 | CDN 边缘 | ESI | 高 | 高（缓存） |

---

### 第三段：三大运行时框架对比

**qiankun（蚂蚁金服）**——基于 single-spa + Proxy/Snapshot 沙箱。子应用需暴露生命周期。方案最成熟。

**micro-app（京东）**——基于 Web Components。对子应用侵入性最低。支持组件级微前端。

**wujie（腾讯）**——Web Components（容器）+ iframe（JS 沙箱）+ Proxy（通信）。iframe 沙箱实现浏览器级隔离，同时 DOM 渲染到主应用保证体验。隔离性最强。

| 维度 | qiankun | micro-app | wujie |
|------|---------|-----------|-------|
| 技术基础 | single-spa | Web Components | Web Components + iframe |
| JS 隔离 | Proxy 沙箱 | Proxy 沙箱 | iframe 沙箱（最强） |
| 子应用改造 | 较高 | 最低 | 低 |
| 组件级使用 | ❌ | ✅ | ✅ |

---

### 第四段：核心技术——JS 沙箱

**Proxy 沙箱**：通过 `new Proxy(fakeWindow, handler)` 创建代理。子应用的 `window.xxx = value` 写入 fakeWindow，读取时优先从 fakeWindow 取，取不到从真实 window 取。激活时创建，卸载时清理。

**Snapshot 沙箱**：激活前快照 window，卸载时恢复。不支持 Proxy 时的降级方案。

**iframe 沙箱**：JS 在隐藏 iframe 中执行，天然拥有独立 window。理论上完全隔离，但 DOM 需桥接到主应用。

| 沙箱 | 隔离程度 | 边界 | 性能 |
|------|---------|------|------|
| Proxy 沙箱 | 99% | 特殊 API 可绕过 | 良好 |
| Snapshot 沙箱 | 99% | 可能有残留 | 中 |
| iframe 沙箱 | 100% | 无 | 良好 |

---

### 第五段：核心技术——样式隔离

推荐组合使用：

1. **CSS Modules**：构建时自动哈希类名，无运行时开销，首选方案
2. **动态样式管理**：挂载时追加样式，卸载时移除，作为兜底
3. **PostCSS scoping**：自动加 `[data-app-id]` 属性选择器
4. **Shadow DOM**：浏览器原生，但弹窗需额外处理

> **组合拳**：CSS Modules（设计时）+ 动态管理（运行时兜底）+ 团队约定。

---

### 第六段：Module Federation 详解

Module Federation 不追求隔离，追求**共享**。

核心能力：Remote 暴露模块 → Host 消费模块 → Singleton 共享依赖。

无沙箱开销、无运行时钩子，性能最好。shared 机制保证第三方库只加载一次。

典型用法：运行时微前端处理应用级隔离和路由，Federation 处理模块级共享。

---

### 第七段：收尾——什么时候用和不用

**适合用**：
- 多团队独立开发部署不同模块
- 大型中后台系统（CRM、ERP、低代码平台）
- 渐进式技术栈迁移
- 代码库过于庞大

**不适合用**：
- 小团队或简单应用
- 对首屏性能有极致要求
- 团队缺乏基建能力

**三个原则**：
1. 拆分要有边界——频繁通信说明不该拆
2. 先有痛点再上方案
3. 架构是渐进的过程——从单体自然演进

> 微前端的核心价值：**让大型前端团队能像后端微服务团队一样，独立开发、独立部署、各自演进。** 如果不能带来这些好处，微前端就只是增加了系统复杂度的累赘。
