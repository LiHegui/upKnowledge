---
name: nav-sync
description: "导航同步 / nav sync — 确保首页目录（docs/index.md）与侧边栏配置（docs/.vitepress/config.js sidebar）保持一致。新增、删除或重组导航条目时自动双向同步。Use when: 用户说「同步导航」「同步目录」「同步首页」「同步侧边栏」，或在 kb-inject / dev-mode 新增内容后涉及导航变更。"
argument-hint: "可选：指定同步方向，如「以侧边栏为准」「以首页为准」"
---

# 导航同步（nav-sync）

确保 **首页目录**（`docs/index.md`）与 **侧边栏配置**（`docs/.vitepress/config.js` 的 `sidebar['/interview/']`）始终一致。

---

## 触发规则

### 被动触发（用户主动说）

| 关键词 | 示例 |
|--------|------|
| 「同步导航」「同步目录」 | 「帮我同步一下导航」 |
| 「同步首页」「同步侧边栏」 | 「首页和侧边栏对一下」 |
| 「检查导航」「导航对齐」 | 「看看首页和侧边栏有没有差异」 |

### 自动触发（其他 Skill 联动）

> ⚠️ **核心原则**：任何导致导航条目变更的操作完成后，**必须自动执行本 Skill**。

| 场景 | 说明 |
|------|------|
| `kb-inject` 新增了文件或章节 | 注入完成后检查是否需要在首页/侧边栏新增链接 |
| `dev-mode` 新增了文档页面 | 开发完成后同步导航 |
| 手动修改了 `config.js` sidebar | 同步更新 `docs/index.md` |
| 手动修改了 `docs/index.md` 目录 | 同步更新 `config.js` sidebar |

---

## 执行流程

### Step 1：读取两端数据

同时读取：
1. `docs/index.md` — 提取所有 `[文本](链接)` 条目，按章节分组
2. `docs/.vitepress/config.js` — 提取 `sidebar['/interview/']` 的所有分组和 `items`

### Step 2：对比差异

逐组对比，找出：

| 差异类型 | 说明 |
|---------|------|
| **侧边栏有、首页无** | 需要在 `docs/index.md` 对应章节补上链接 |
| **首页有、侧边栏无** | 需要在 `config.js` 对应分组补上条目 |
| **分组名称不一致** | 统一名称（以最新修改为准） |
| **条目顺序不一致** | 保持同步（以侧边栏为基准，首页跟随） |

### Step 3：确认同步方向

若用户未指定方向，按以下优先级自动判断：

1. **以更完整的一方为准** — 条目更多的一方作为源
2. **若条目数相同** — 以 `config.js`（侧边栏）为准，因为它是 VitePress 的权威配置
3. **用户明确指定** — 遵循用户指令

### Step 4：执行同步

- 使用 `replace_string_in_file` 或 `multi_replace_string_in_file` 精准更新
- 新增条目插入到对应分组的末尾
- 保持两端的分组结构和排列顺序一致

### Step 5：确认结果

同步完成后，简要汇报：
- 新增了哪些条目（列出文件和位置）
- 修改了哪些分组名
- 两端当前条目数是否一致

---

## 分组对应关系（当前基准快照）

> 以下为 2026-05-13 确认的最新对应关系，每次同步以此为参照。

### 1. 📝 必刷特辑

| 侧边栏（`config.js`） | 首页（`docs/index.md`） |
|----------------------|----------------------|
| 笔试系列 → `/interview/笔试系列` | 笔试系列 → `./interview/笔试系列.md` |
| — | 算法练习：经典 150 题（外部链接，仅首页） |

### 2. 🤖 AI × 前端

| 侧边栏 | 首页 |
|--------|------|
| AI × 前端技术要点 → `/interview/AI/` | AI × 前端技术要点 → `./interview/AI/index.md` |

### 3. 基础三件套

| 侧边栏 | 首页 |
|--------|------|
| HTML → `/interview/HTML/html相关` | HTML → `./interview/HTML/html相关.md` |
| CSS → `/interview/CSS/` | CSS → `./interview/CSS/index.md` |
| Sass & Less → `/interview/CSS/sass和less` | Sass & Less → `./interview/CSS/sass和less.md` |
| styled-components → `/interview/CSS/style-components` | styled-components → `./interview/CSS/style-components.md` |
| JavaScript → `/interview/JavaScript/` | JavaScript → `./interview/JavaScript/index.md` |

### 4. TypeScript

| 侧边栏 | 首页 |
|--------|------|
| TypeScript 概览 → `/interview/Ts/` | TypeScript 总览 → `./interview/Ts/index.md` |
| 类型 → `/interview/Ts/类型/` | 类型系统 → `./interview/Ts/类型/index.md` |
| 接口 → `/interview/Ts/接口/` | 接口 → `./interview/Ts/接口/index.md` |
| 类 → `/interview/Ts/类/` | 类 → `./interview/Ts/类/index.md` |
| 函数 → `/interview/Ts/函数/` | 函数 → `./interview/Ts/函数/index.md` |

### 5. Vue 生态

| 侧边栏 | 首页 |
|--------|------|
| Vue2 → `/interview/Vue/vue` | Vue2 → `./interview/Vue/vue.md` |
| 权限管理 → `/interview/Vue/AuthorityManagement` | 权限管理 → `./interview/Vue/AuthorityManagement.md` |
| Vue3 → `/interview/Vue3/` | Vue3 → `./interview/Vue3/index.md` |
| Vue3 Diff 算法 → `/interview/Vue3/diff/` | Diff 算法 → `./interview/Vue3/diff/index.md` |
| Vue3 性能提升 → `/interview/Vue3/性能提升/` | 性能提升 → `./interview/Vue3/性能提升/index.md` |
| Tree-shaking → `/interview/Vue3/Treeshaking/` | Tree-shaking → `./interview/Vue3/Treeshaking/index.md` |

### 6. React 生态

| 侧边栏 | 首页 |
|--------|------|
| React → `/interview/React/` | React 技术要点 → `./interview/React/index.md` |
| React 渲染行为完全指南 → `/interview/React/react-rendering-behavior` | 同左 |
| Fiber 架构与 Diff 算法深度解析 → `/interview/React/fiber-diff` | 同左 |

### 7. 工程化

| 侧边栏 | 首页 |
|--------|------|
| Webpack → `/interview/Webpack/` | Webpack → `./interview/Webpack/index.md` |
| Webpack 基础配置 → `/interview/Webpack/webpack基础配置` | 同左 |
| 模块化 History → `/interview/Webpack/模块化/history` | 模块化历史 → `./interview/Webpack/模块化/history.md` |
| Rollup → `/interview/Webpack/模块化/Rollup` | 同左 |
| 进阶-搭建组件库 → `/interview/Webpack/模块化/进阶-搭建组件库` | 搭建组件库 → 同左 |
| Vite → `/interview/Vite/` | 同左 |
| Git → `/interview/git/` | 同左 |

### 8. 服务端 & 运维

| 侧边栏 | 首页 |
|--------|------|
| Node.js → `/interview/Node/` | Node.js → `./interview/Node/index.md` |
| Nodemailer → `/interview/Node/nodemailer` | nodemailer 邮件 → `./interview/Node/nodemailer.md` |
| Server 准备工作 → `/interview/Node/server-准备工作` | 同左 |
| Server 部署 → `/interview/Node/server-deploy` | 同左 |
| Nginx → `/interview/Nginx/` | 同左 |
| Linux → `/interview/Linux/` | Linux 常用命令 → `./interview/Linux/index.md` |

### 9. 浏览器 & 网络

| 侧边栏 | 首页 |
|--------|------|
| 网络 → `/interview/网络/` | 网络（HTTP / TCP / WebSocket） → `./interview/网络/index.md` |
| 浏览器 → `/interview/浏览器/` | 浏览器原理 → `./interview/浏览器/index.md` |
| 浏览器缓存 → `/interview/浏览器/浏览器缓存` | 同左 |
| 操作系统 → `/interview/操作系统/` | 同左 |

### 10. 深入专题 & 解决方案

| 侧边栏 | 首页 |
|--------|------|
| 性能优化 → `/interview/性能优化/` | 性能优化 → `./interview/性能优化/index.md` |
| 图片加载优化策略 → `/optimization/加载图片优化策略` | 同左（`./optimization/加载图片优化策略.md`） |
| 设计模式 → `/interview/设计模式/` | 同左 |
| 前端登录 → `/interview/前端登录/登录的实现` | 前端登录方案 → 同左 |
| 大文件断点续传 → `/interview/解决方案/大文件断点续传/` | 同左 |
| JWT 登录方案 → `/interview/解决方案/JWT登录方案/` | 同左 |
| 移动端适配 → `/interview/解决方案/移动端适配/` | 同左 |
| 前端工程化 → `/interview/解决方案/前端工程化/` | 前端工程化方案 → 同左 |
| 实时协同系统 → `/interview/解决方案/实时协同系统/` | 同左 |
| 虚拟列表 → `/interview/解决方案/虚拟列表/` | 同左 |

### 11. 进阶专题（首页）↔ 多个独立分组（侧边栏）

首页「进阶专题」对应侧边栏以下独立分组：

| 侧边栏分组 | 首页条目 |
|-----------|---------|
| AnTd 组件库（AnTd 概览、Button） | Ant Design 组件库 |
| 微前端 | 微前端 |
| 微信小程序（原生）（路由、媒体、权限） | 微信小程序 + 权限 + 媒体 |
| Gatsby（含 GraphQL、Route 等 10 子项） | Gatsby |
| Web3D / Three.js | Web3D / Three.js |

> 若新增分组，两端必须同时创建。

---

## 注意事项

- **不改变已有内容**：只增补缺失条目，不删除任何一方已有的链接
- **链接格式统一**：首页用相对路径 `./interview/xxx`，侧边栏用绝对路径 `/interview/xxx`
- **中文回复**：所有说明使用中文
- **幂等性**：多次执行结果一致，不产生重复条目
