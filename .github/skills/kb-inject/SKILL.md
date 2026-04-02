---
name: kb-inject
description: "知识点注入 / knowledge inject — 用户提供知识点内容，自动判断归属类别，找到 docs/interview/ 对应文件，智能决策：丰富已有面试题答案 或 新增一道 Q&A 题目。Use when: 用户说「加进去」「补充到对应位置」「加一个问题」「融合进来」「写进知识库」「把这个加进去」「更新知识库」。"
argument-hint: "粘贴知识点内容，例如：关于 Vue3 响应式原理的补充说明..."
---

# 知识点注入（kb-inject）

用户提供知识点，自动归类并精准注入到 `docs/interview/` 对应文件中。

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
- 找到对应「篇」章节（如「基础概念篇」「手写实现篇」）
- 若无合适分组，不新建章节，直接插到最相关的位置之后
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

### Step 4：执行写入

- **丰富已有题**：用 `replace_string_in_file` 在原答案中精准插入，包含足够上下文避免误匹配
- **新增题目**：插入到对应章节末尾（该章节最后一道 `---` 之后）

写入后确认文件更新成功，简要告知用户：
- 插入到哪个文件的哪个位置（题目名 or 章节名）
- 是「丰富」还是「新增」操作

---

## 注意事项

- **不简单堆叠**：新增内容要与原有内容互补，避免重复表述
- **不破坏原有格式**：只增不改，除非丰富已有答案需要重构结构
- **不改变题目顺序**：按已有章节顺序插入，不随意调整
- **中文回复**：所有说明和注释使用中文
