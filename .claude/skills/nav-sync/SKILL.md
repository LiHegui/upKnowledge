---
name: nav-sync
description: "导航同步 / nav sync — 确保首页（docs/index.md，VitePress home 布局）与三套侧边栏（docs/.vitepress/config.js 中 /frontend/、/backend/、/面经/）保持一致。新增、删除或重组导航条目时自动同步。Use when: 用户说「同步导航」「同步目录」「同步首页」「同步侧边栏」，或在 kb-inject / dev-mode 新增内容后涉及导航变更。"
argument-hint: "可选：指定同步方向，如「以侧边栏为准」「以首页为准」"
---

# 导航同步（nav-sync）

保持 **首页**（`docs/index.md`）与 **侧边栏配置**（`docs/.vitepress/config.js` 的 `sidebar`）一致。

> ⚠️ **站点已前后端分家**（2026-07）。导航分三大板块，各有独立侧边栏：
>
> | 路径前缀 | 侧边栏变量 | 板块 |
> |---------|-----------|------|
> | `/frontend/` | `frontendSidebar` | 前端知识库 |
> | `/backend/` | `backendSidebar` | 后端 & 全栈知识库 |
> | `/面经/` | 内联数组 | 面经台账（按人分档，前后端共用） |
>
> `/optimization/` 复用 `frontendSidebar`。`/backend/` 前缀自动覆盖所有子路径，新增后端子目录无需单独注册 key。

---

## 首页是 home 布局，不是链接列表

> ⚠️ **重要**：`docs/index.md` 使用 VitePress `layout: home`，导航体现在 **frontmatter 的 `hero.actions` 与 `features` 卡片**里，**不是** Markdown 的 `[文本](链接)` 列表。同步首页 = 增删/校对这些卡片，不要去找正文里的链接段落。

首页结构：

```yaml
hero:
  actions:
    - text: ⚡ 前端技术要点   → link: /frontend/
    - text: 🖥️ 后端 & 全栈    → link: /backend/
    - text: 📝 面经记录       → link: /面经/
features:
  - 每张卡片 = 一个大方向入口（title / details / link）
```

首页 `features` 是**大方向概览卡**（一个板块一张，如「Vue 生态」「后端 & 全栈」），**不是**逐文件链接——它比侧边栏粗粒度。因此：

- **新增/删除一个大方向**（整块目录）→ 首页要加/删一张 feature 卡片
- **仅在已有方向下新增一篇文档** → 只更新侧边栏，首页卡片通常不动（除非该方向此前没有卡片）

---

## 执行流程

### Step 1：读取两端数据

1. `docs/.vitepress/config.js` — 读取 `frontendSidebar`、`backendSidebar`、`sidebar['/面经/']` 三套结构与 `nav`
2. `docs/index.md` — 解析 frontmatter 的 `hero.actions` 与 `features`

### Step 2：判定同步范围

先确认这次变更落在哪个板块（frontend / backend / 面经），只同步该板块，避免跨板块误改：

| 变更 | 侧边栏动作 | 首页动作 |
|------|-----------|---------|
| 前端新增一篇文档 | `frontendSidebar` 对应分组 `items` 加一条 | 一般不动 |
| 后端新增一篇文档 | `backendSidebar` 对应分组 `items` 加一条 | 一般不动 |
| 新增一个大方向目录 | 对应侧边栏加一个分组 | `features` 加一张卡片 |
| 新增一个板块（罕见） | 加一套侧边栏 + `nav` 加入口 | `hero.actions` 加一个按钮 |
| 面经新增一个人 | `sidebar['/面经/']` 分组 `items` 加一条 | 不动（见下方专规） |

### Step 3：确认同步方向

用户未指定时：

1. **侧边栏是权威源**——它是 VitePress 实际渲染依据，首页跟随
2. 以内容更完整的一方为准补齐另一方
3. 用户明确指定则遵循

### Step 4：执行同步

- 用 `Edit` 精准修改（多处则多次调用），新增条目插入对应分组末尾
- 链接格式：**侧边栏用绝对路径** `/frontend/xxx`、`/backend/xxx`；**首页 home 布局的 link 也用绝对路径** `/frontend/xxx`（与旧版「首页用相对路径」不同——home 布局的 hero/feature link 是站点绝对路径）
- 中文路径段（`/面经/`、`/frontend/浏览器/`）直接用中文，不做 URL 编码

### Step 5：确认结果

汇报：改了哪个板块、新增/删除了哪些条目、两端是否一致。

---

## 面经专规（按人分档）

面经在 `docs/面经/`，**按人一个文件**（`LHG.md` / `SLP.md` …），`index.md` 是简约总览。新增一个人时：

1. 建 `docs/面经/{姓名}.md`（模板见 `docs/面经/index.md`）
2. `docs/面经/index.md` 的「档案」列表加一行 `- [{姓名}](./{姓名}.md)`
3. `config.js` 的 `sidebar['/面经/']` 分组 `items` 加一条 `{ text: '{姓名}', link: '/面经/{姓名}' }`

首页不为单个人加卡片；面经整体入口已在 `hero.actions` 与「面经」nav 里。

---

## 校验（可选，推荐）

改完可跑一次 `yarn docs:build`（`ignoreDeadLinks: true`，死链不会报错，但能确认结构不崩），或用 grep 核对侧边栏 link 与实际文件是否对得上。

---

## 注意事项

- **只增补、不删已有**：除非用户明确要求删除，只补齐缺失条目
- **分板块处理**：前端变更不要动 backend 侧边栏，反之亦然
- **不硬编码全量快照**：本 Skill 不再维护「基准快照大表」（易腐烂）——每次都**实时读取** config.js 与 index.md 现状再对比
- **幂等性**：多次执行结果一致，不产生重复条目
- **中文回复**：所有说明使用中文
