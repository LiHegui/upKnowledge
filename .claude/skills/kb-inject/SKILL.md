---
name: kb-inject
description: "知识点注入 / knowledge inject — 用户提供知识点内容，自动判断归属类别，找到 docs/interview/ 对应文件，智能决策：丰富已有面试题答案 或 新增一道 Q&A 题目。Use when: 用户说「加进去」「补充到对应位置」「加一个问题」「融合进来」「写进知识库」「把这个加进去」「更新知识库」。"
argument-hint: "粘贴知识点内容，例如：关于 Vue3 响应式原理的补充说明..."
---

# 知识点注入（kb-inject）

用户提供知识点，自动归类并精准注入到 `docs/interview/` 对应文件中。

---

## 主动识别触发规则

> ⚠️ **核心原则**：不要等待用户主动说「写进知识库」。当用户分享技术内容时，**必须主动询问**是否需要注入文库。

### 触发条件（满足任意一条即触发）

| 场景 | 示例 |
|------|------|
| 用户粘贴了代码片段并附有解释 | 分享 `Proxy` 用法、手写 `debounce` 等 |
| 用户描述某个技术概念或原理 | 解释事件循环、讲 Fiber 架构等 |
| 用户纠正/补充了某道题的答案 | 「其实还应该提到 xxx」 |
| 用户分享了某个踩坑经验或最佳实践 | 「我发现 xxx 情况下需要注意 yyy」 |
| 对话中出现明显的知识点输出 | 技术问答、原理讲解、代码对比 |

### 主动询问话术模板

当检测到上述场景时，在**完成技术回答之后**，附加以下询问：

```
要把这个知识点写入知识库吗？
→ 我会将它注入到 `docs/interview/[对应方向]/index.md` 中。
```

- 语气自然，不打断主要回答
- 明确告知会写入哪个文件
- 用户回复「好」「可以」「写进去」「加一下」等**任何表示同意的回复**，立即执行注入流程
- 用户回复「不用」「算了」「不需要」，跳过，不再询问

---

## 执行流程

### Step 1：识别知识点归属

分析用户提供的内容，判断所属技术方向：

| 关键词 / 特征 | 对应文件 |
|--------------|---------|
| JS 基础、闭包、原型、this、Promise、Event Loop、ES6 | `docs/interview/JavaScript/index.md` |
| Vue2、Vue3、响应式、组合式 API、生命周期 | `docs/interview/Vue3/index.md` 或 `Vue/vue.md` |
| React、hooks、fiber、虚拟 DOM、Redux | `docs/interview/React/index.md` |
| TypeScript、类型体操、泛型、装饰器 | `docs/interview/Ts/index.md` |
| CSS、布局、BFC、动画、选择器 | `docs/interview/CSS/index.md` |
| 网络、HTTP、HTTPS、TCP、WebSocket | `docs/interview/网络/index.md` |
| 浏览器、渲染流程、缓存、安全、跨域 | `docs/interview/浏览器/index.md` |
| Webpack、Vite、打包、构建优化 | `docs/interview/Webpack/index.md` 或 `Vite/index.md` |
| Git、版本控制 | `docs/interview/git/index.md` |
| 性能优化、首屏、懒加载 | `docs/interview/性能优化/index.md` |
| 算法、数据结构、排序、二分 | `docs/interview/算法Code/index.md` |
| Node.js、服务端 | `docs/interview/Node/index.md` |
| 微前端 | `docs/interview/微前端/index.md` |
| AI、大模型、LLM、Prompt | `docs/interview/AI/index.md` |

若无法确定，**先读取目标文件大纲**再决策，不猜测。

---

### Step 2：读取目标文件

读取对应 `index.md`，梳理已有题目列表，判断：

**情况 A：已有相关问题** → 丰富该题的答案
- 补充子点、代码示例、对比表格、注意事项
- 不重复已有内容，只添加增量
- 在合适位置插入，保持答案结构流畅

**情况 B：无相关问题** → 新增一道 Q&A
- **不得新建「篇」或任何分类章节**（如「基础概念篇」「手写实现篇」）——领域页采用**平铺 Q&A** 结构
- **按面试高频顺序插入**：越高频越靠前，低频 / 边缘题靠后
- 若当前文件仍存在旧的「篇」章节，插入时按高频顺序选合适位置，不要为新题创建新分类
- 按统一格式写题目（见 Step 3 格式规范）

---

### Step 3：格式规范（所有注入内容统一为面试题格式）

> ⚠️ **强制要求**：无论用户提供的是什么形式的知识点（概念说明、文章摘录、代码片段），注入时**必须转化为面试题 Q&A 格式**，不允许直接粘贴原文。

严格遵循 `docs/interview/AI/index.md` 的样板风格：

```markdown
## Q: 问题标题（以「？」结尾）

**A:**

核心答案，关键概念**加粗**。

**分点说明 / 代码示例：**

​```js
// 代码块必须标注语言
​```

| 对比维度 | 方案A | 方案B |
|---------|-------|-------|
| xxx | ✅ | ❌ |

> ⚠️ **注意**：注意事项用引用块。

---
```

规则要点：
- **所有内容都是面试题**：知识点 → 提炼出面试官会问的问题 → 写成 `## Q:` + `**A:**`
- 问题句式举例：「什么是 XXX？」「XXX 和 XXX 的区别？」「如何实现 XXX？」「XXX 的原理是什么？」
- 每题结尾加 `---` 分隔线
- 代码块必须标注语言（`js` / `ts` / `bash` / `vue`）
- 多方案对比优先用表格，含 ✅ / ❌ 状态标注
- 注意事项用 `> ⚠️ **注意**：` 引用块

---

### Step 3.5：可视化风格规范（适用于复杂流程图 / 多维对比）

> 参考样本：`docs/interview/React/redux.md`（链路图部分）和 `docs/interview/React/react-rendering-behavior.md`
>
> ⚠️ **强制要求**：**禁止使用 HTML/CSS 卡片图解**。所有可视化必须使用纯 Markdown 格式（表格、ASCII 流程图、树形缩进图、代码块等）。

#### 优先使用纯 Markdown 的场景

满足以下任一条件，**优先使用 Markdown 可视化**（表格 / ASCII 流程图 / 树形缩进）：

| 场景 | 推荐格式 | 示例 |
|------|---------|------|
| 多步骤流程 / 生命周期 | `→` 箭头 ASCII 流程图 | Redux 数据流：`Action → Reducer → Store → View` |
| 嵌套/分层结构 | 树形缩进 ASCII 图 | 中间件洋葱模型：`dispatch → thunk → logger → next → action` |
| 多列横向对比 | Markdown 表格 | 3+ 方案对比、各 API 职责对比 |
| 时间线 / 阶段序列 | 有序列表 + 箭头 | 渲染阶段顺序 |
| 条件判断 / 分支 | 表格 + ✅/❌ 标注 | 方案优劣对比 |

普通 Q&A 用表格和代码块即可，不需要额外图解。

---

#### Markdown 图解示例

**① 箭头流程图（线性流程）**

```
Action（动作）→ Observable State（状态）→ Computed（派生）→ Reaction（反应）
```

**② 树形缩进图（嵌套/分层）**

```
dispatch(action)
  └── 中间件1（日志）
      └── 中间件2（Thunk）
          └── 原始 dispatch
              └── Reducer → newState
```

**③ 表格对比（多维方案）**

| 维度 | 方案A | 方案B |
|------|------|------|
| 性能 | ✅ 优 | ⚠️ 中 |
| 复杂度 | ❌ 高 | ✅ 低 |

**④ ASCII 步骤分解**

```
步骤  节点      操作
 1    App     beginWork → 有 child，走 child
 2    Header  beginWork → 无 child，completeWork → 走 sibling
 3    Main    beginWork → 有 child，走 child
```

---

### Step 4：执行写入

- **丰富已有题**：用 `Edit` 工具在原答案中精准插入，包含足够上下文避免误匹配
- **新增题目**：插入到对应章节末尾（该章节最后一道 `---` 之后）

写入后确认文件更新成功，简要告知用户：
- 插入到哪个文件的哪个位置（题目名 or 章节名）
- 是「丰富」还是「新增」操作

若本次注入涉及**新增文件或新增导航条目**，自动触发 `nav-sync` Skill 同步首页目录与侧边栏配置。

### Step 5：写入统一历史档案（强制）

每次知识点注入完成后，必须同步写入：`docs/interview/.history/{用户名}.json`

- 档案不存在：创建基础结构
- 档案存在：仅追加 `events`，禁止覆盖历史
- 事件建议：
  - `type`: `kb.inject`
  - `topic`: 归属方向（如 `TypeScript` / `React`）
  - `title`: 注入题目或被丰富题目摘要
  - `status`: `done`
  - `details`: 写入文件路径、操作类型（新增/丰富）
  - `createdAt`: ISO 时间

并更新 `summary.totalEvents` 与 `user.updatedAt`。

---

## 注意事项

- **不简单堆叠**：新增内容要与原有内容互补，避免重复表述
- **不破坏原有格式**：只增不改，除非丰富已有答案需要重构结构
- **不改变题目顺序**：按已有章节顺序插入，不随意调整
- **历史机制强关联**：注入行为必须落档到 `docs/interview/.history/{用户名}.json`，不得写入其他临时存档格式
- **中文回复**：所有说明和注释使用中文
- **主动优先**：技术对话中优先识别知识点，主动询问，不等用户说关键词
