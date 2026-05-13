# upKnowledge 项目架构文档

> 本文档用于描述 upKnowledge 项目的整体架构，供 AI 辅助完善本项目时参考。
> 在线地址：[升级打怪🎯](https://lihegui.github.io/upKnowledge/)

---

## 一、项目定位

**upKnowledge** 是一个前端工程师的个人知识库 + 文档站点，核心价值在于：

- 系统整理前端技术要点，覆盖 CSS / HTML / JS / TS / React / Vue / 工程化 / 网络 / 算法等核心方向
- 沉淀实战解决方案（大文件上传、移动端适配、JWT 登录等）
- 包含若干 demo 练习项目作为技术验证

**目标读者**：自己复习 + 博客输出 + AI 协作完善

---

## 二、技术栈总览

| 层级 | 技术选型 | 版本 |
|------|----------|------|
| 文档站框架 | VuePress 2.x | `^2.0.0-rc.19` |
| 构建器 | `@vuepress/bundler-vite` | 最新 rc |
| 默认主题 | `@vuepress/theme-default` | `^2.0.0-rc.74` |
| 全文搜索插件 | `@vuepress/plugin-search` | — |
| 代码演示插件 | `vuepress-plugin-md-enhance` | — |
| CSS 预处理器 | Sass (`sass-embedded`) | `^1.83.4` |
| **[demo] 聊天室** | Node.js + Express + Socket.io | Express 4.x / Socket.io 4.x |
| **[demo] RTC** | Vue 3 + Vite + TypeScript | Vue 3.5 / Vite 6.2 |
| **[demo] 原生 JS** | 无框架纯 JS + CSS | — |
| 包管理器 | yarn（主站） / npm（子项目） | — |
| 部署方式 | GitHub Pages（`deploy.sh` 自动化脚本） | — |

---

## 三、目录结构详解

```
upKnowledge/
│
├── ARCHITECTURE.md          ← 本文件（架构文档）
├── markdown.md              ← 项目说明、Git 规范、目录说明
├── package.json             ← 主站依赖（VuePress 2.x）
│
├── docs/                    ← VuePress 文档站源码（主体）
│   ├── .vuepress/
│   │   ├── config.js        ← 站点核心配置（导航栏/插件/主题/base）
│   │   ├── styles/          ← 自定义全局样式
│   │   └── dist/            ← 构建产物（git 忽略，部署用）
│   ├── README.md            ← 站点首页（技术要点导航入口）
│   ├── deploy.sh            ← GitHub Pages 部署脚本
│   │
│   ├── interview/           ← 技术要点模块（核心内容）
│   │   ├── index.md         ← 技术要点总目录
│   │   ├── 自测系列.md
│   │   ├── 必问技术要点系列/index.md
│   │   ├── CSS/             ← CSS 技术要点 + Demo HTML
│   │   ├── HTML/            ← HTML 语义化、存储等
│   │   ├── JavaScript/      ← JS 核心原理
│   │   ├── ES6/             ← ES6+ 新特性（Promise、Map/Set 等）
│   │   ├── Ts/              ← TypeScript 系列
│   │   ├── React/           ← React 原理（虚拟 DOM、Diff、Redux）
│   │   ├── Vue/             ← Vue 2 相关
│   │   ├── Vue3/            ← Vue 3 新特性（diff、Tree-shaking、性能）
│   │   ├── Webpack/         ← 构建工具 Webpack
│   │   ├── Vite/            ← 构建工具 Vite
│   │   ├── Node/            ← Node.js + 中间件
│   │   ├── Nginx/           ← Nginx 配置
│   │   ├── Linux/           ← Linux 常用命令
│   │   ├── git/             ← Git 操作知识库
│   │   ├── 网络/            ← HTTP/HTTPS/TCP/UDP
│   │   ├── 浏览器/          ← 浏览器原理、缓存
│   │   ├── 操作系统/        ← 基础操作系统知识
│   │   ├── 性能优化/        ← 前端性能优化
│   │   ├── 设计模式/        ← 设计模式（观察者、发布订阅）
│   │   ├── 算法Code/        ← 算法实现（二分、排序、Stack 等）
│   │   ├── 前端登录/        ← 登录实现方案
│   │   └── 解决方案/        ← 实战解决方案集合
│   │       ├── 大文件断点续传/
│   │       ├── 前端工程化/
│   │       ├── 移动端适配/
│   │       └── JWT登录方案/
│   │
│   ├── repository/          ← 知识库/工具库（进阶专题）
│   │   ├── 模块化/          ← Rollup + 组件库搭建
│   │   ├── 微前端/          ← 微前端架构
│   │   ├── 微信小程序（原生）/← 小程序权限、路由、媒体
│   │   ├── AnTd/            ← Ant Design 实践
│   │   ├── API/             ← useContext、useReducer
│   │   ├── Css/             ← styled-components
│   │   ├── Gastby/          ← Gatsby + GraphQL
│   │   ├── Linux/           ← Linux 进阶
│   │   ├── Node/            ← Node 进阶（中间件）
│   │   ├── React/           ← React 进阶实践
│   │   ├── redux源码解析/   ← Redux 源码逐行解析
│   │   ├── server/          ← 服务端相关（SSR/BFF 等）
│   │   ├── Vue/             ← Vue 进阶实践
│   │   ├── Web3D/           ← Three.js / WebGL 等
│   │   ├── Webpack/         ← Webpack 进阶配置
│   │   └── 需要整理的资料/  ← 待整理 Backlog
│   │
│   ├── optimization/        ← 性能优化专题
│   │   ├── index.js
│   │   └── 加载图片优化策略.md
│   │
│   └── tools/               ← 实用工具合集
│       ├── routed.md
│       ├── 纯css瀑布流布局/
│       ├── formData/
│       └── repository/
│
├── vuepress-starter/        ← 独立 VuePress 脚手架参考模板（与主站分离）
│   ├── package.json         ← 含 vp-update 脚本，type: "module"
│   └── docs/
│       ├── README.md        ← VuePress 默认主题首页模板
│       └── get-started.md  ← VuePress 基础使用教程
│
└── project/                 ← 练习/Demo 项目集合（可随意修改）
    ├── 聊天室demo/          ← Express + Socket.io 实时聊天
    ├── rtc-demo/            ← Vue 3 + Vite + WebRTC P2P 通话
    ├── 练习算法/            ← LeetCode 类算法题 JS 实现
    └── 原生JS/              ← 纯 JS 实践（轮播、表单验证等）
```

---

## 四、核心模块说明

### 4.1 文档站配置（`docs/.vuepress/config.js`）

```js
// 关键配置项
{
  lang: 'zh-CN',
  title: '升级打怪🎯',
  base: "/upKnowledge/",          // GitHub Pages 路径前缀
  theme: defaultTheme({
    navbar: [ /* 导航栏：实用工具链接 + WebAPI 下拉 */ ]
  }),
  plugins: [
    searchPlugin({ hotKeys: ['s', '/'], maxSuggestions: 10 }),
    mdEnhancePlugin({ demo: true }),  // 支持代码演示块
  ]
}
```

**✅ 已完善**：sidebar 已全面配置，覆盖 interview / repository / tools / optimization 四大模块所有文档。navbar 已增加技术要点、知识库、工具合集三个主入口。

### 4.2 interview/ — 技术要点模块（核心）

每个技术方向对应一个子目录，通常包含：
- `index.md`：该方向的题目汇总（Q&A 格式）
- `code/`：对应的代码实现（`.js` / `.ts`）
- `img/`：图片资源

**内容组织规范**：Markdown 格式，Q&A 结构，支持 `:::demo` 代码演示块。

### 4.3 repository/ — 进阶知识库

面向更深入的原理解析和实战方案。相比 `interview/` 更注重深度而非广度。
部分目录内容尚未整理完整（见 `需要整理的资料/`）。

### 4.4 project/rtc-demo/（最复杂的 Demo）

```
src/
├── main.ts           # 创建 Vue 应用
├── App.vue           # 根组件（仅包含 <RouterView />）
├── router/index.ts   # 路由：/ → HomeView，/about → AboutView（懒加载）
├── stores/counter.ts # Pinia 计数器 Store（示例）
├── views/
│   ├── HomeView.vue
│   └── AboutView.vue
└── components/       # 公共组件
```

技术栈：Vue 3.5 / Vue Router 4 / Pinia 3 / TypeScript 5.8 / Vite 6.2

---

## 五、开发与部署流程

### 5.1 本地开发

```bash
# 安装依赖
yarn

# 启动文档站开发服务器（热重载）
yarn docs:dev
# 等价于：npx vuepress dev docs

# 构建生产版本
yarn docs:build
# 等价于：npx vuepress build docs
```

### 5.2 部署到 GitHub Pages

```bash
# 执行部署脚本（bash 环境）
bash docs/deploy.sh
```

脚本逻辑：构建 → 进入 `dist/` → git init → force push 到 `gh-pages` 分支。

### 5.3 Git 工作流

```
个人分支（feature/xxx）
  ↓ commit
  ↓ 切换到 master，git pull
  ↓ 切回个人分支，git rebase master
  ↓ 切回 master，git merge 个人分支
  ↓ git push origin master
```

**Commit 规范**：

| 类型 | 说明 |
|------|------|
| `fix` | 修复错误 |
| `feature` | 新模块/新功能 |
| `style` | 样式修改 |
| `docs` | 文档修改 |

---

## 六、当前已知问题 & 待完善清单

以下是项目当前存在的明显缺口，供 AI 协作时优先处理：

### 6.1 高优先级

| 状态 | 问题 | 说明 |
|------|------|------|
| ✅ 已解决 | ~~侧边栏（sidebar）未配置~~ | 已补全，覆盖 interview / repository / tools / optimization 全部文档 |
| ✅ 已解决 | ~~大量目录未注册路由~~ | 已全部注册到 sidebar，含深层子目录 |
| ✅ 已解决 | ~~首页（README.md）导航链接不完整~~ | 已补全所有方向链接，新增知识库/性能优化分区 |
| 🟡 待处理 | `需要整理的资料/` | `repository/需要整理的资料/index.md` 中积压了待整理内容 |

### 6.2 中优先级

| 问题 | 说明 |
|------|------|
| RTC Demo 功能未实现 | `rtc-demo/` 仅为 Vue 3 脚手架初始代码，WebRTC 功能未实现 |
| 聊天室 Demo 缺少文档 | `project/聊天室demo/` 无 README，无使用说明 |
| `optimization/` 内容较少 | 只有一个图片优化 md，模块内容单薄 |
| `tools/` 缺少总索引 | 各工具缺少统一入口页 |

### 6.3 低优先级

| 问题 | 说明 |
|------|------|
| `vuepress-starter/` 与主站重叠 | 该目录仅作为学习参考，可考虑移除或明确边界 |
| 算法题缺少题目描述 | `算法Code/` 中的 `.js` 文件无对应题目说明 |
| CSS Demo 文件散落 | `interview/CSS/` 中有多个 `.html` demo 文件未集成到文档 |

---

## 七、内容覆盖矩阵

| 技术方向 | interview/ | repository/ | 完整度评估 |
|----------|:----------:|:-----------:|:--------:|
| CSS | ✅ | ✅ | 中 |
| HTML | ✅ | — | 低 |
| JavaScript | ✅ | — | 中 |
| ES6+ | ✅ | — | 中 |
| TypeScript | ✅ | — | 中 |
| React | ✅ | ✅ | 中 |
| Vue 2 | ✅ | ✅ | 中 |
| Vue 3 | ✅ | — | 低 |
| Webpack | ✅ | ✅ | 中 |
| Vite | ✅ | — | 低 |
| Node.js | ✅ | ✅ | 低 |
| 网络/HTTP | ✅ | — | 低 |
| 浏览器原理 | ✅ | — | 低 |
| 算法 | ✅ | — | 低 |
| 设计模式 | ✅ | — | 低 |
| 性能优化 | ✅ | ✅ | 低 |
| 微前端 | — | ✅ | 低 |
| 小程序 | — | ✅ | 低 |
| Web3D | — | ✅ | 低 |

---

## 八、AI 协作指引

当 AI 参与完善本项目时，请遵循以下原则：

### 内容规范
1. **Markdown 格式**：所有文档使用标准 Markdown，标题层级清晰（H1 → H2 → H3）
2. **Q&A 结构**：题目用 `## Q: 问题` + `A:` 段落格式，方便阅读
3. **代码块**：所有代码必须指定语言（```js / ```ts / ```bash）
4. **代码演示**：需要可交互演示时使用 `:::demo ... :::` 语法（md-enhance 插件支持）
5. **图片**：存放在对应目录的 `img/` 子目录，使用相对路径引用

### 路由注册规范
新增文档时需同步更新 `docs/.vuepress/config.js` 的侧边栏配置（`sidebar`），格式参考：
```js
sidebar: {
  '/interview/CSS/': [{ text: 'CSS', children: ['/interview/CSS/index.md'] }],
  // ...
}
```

### 文件命名规范
- 文档：小写 + 中文均可，与现有风格保持一致
- 代码文件：小驼峰命名（`sortAlgorithm.js`）或 PascalCase 组件（`MyComponent.vue`）

### 提交规范
- `docs: 完善 vue3 技术要点`
- `feature: 新增 WebRTC demo 功能`
- `fix: 修复侧边栏路由配置`

### 优先建议完善的内容
1. ~~补全 `config.js` 中的 `sidebar` 配置~~ ✅ 已完成
2. 完善"完整度低"的技术方向（Vue3、Vite、Node、网络等）
3. 实现 `rtc-demo/` 的 WebRTC 核心功能（房间创建/加入、音视频通话）
4. 整理 `repository/需要整理的资料/` 中的 Backlog 内容
5. 完善 `optimization/` 模块内容（目前仅有图片优化一篇）

---

## 九、相关链接

| 资源 | 地址 |
|------|------|
| 线上文档站 | https://lihegui.github.io/upKnowledge/ |
| VuePress 2.x 官方文档 | https://v2.vuepress.vuejs.org/zh/ |
| md-enhance 插件文档 | https://plugin-md-enhance.vuejs.press/zh/ |
| @vuepress/plugin-search | https://v2.vuepress.vuejs.org/zh/reference/plugin/search.html |
