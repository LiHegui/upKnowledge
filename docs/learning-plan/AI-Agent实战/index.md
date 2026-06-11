# AI Agent 实战 学习计划

> 开始日期：2026-06-09  
> 预计周期：7 天  
> 每日时长：1.5-2 小时  
> 当前阶段：阶段一  
> 最终产出：一个可运行的自定义 Agent（带工具调用 + 记忆 + 流式 UI）

---

## 学习路线图

### 阶段一：Agent 核心认知（Day 1 - Day 2）

**目标**：搞懂 Agent 的本质、四大组件、ReAct 循环，能说清楚"Agent 和普通 LLM 调用的区别"

- [ ] Agent vs 普通 LLM 调用（纯函数 vs 事件循环）
- [ ] 四大组件：大脑（LLM）、工具（Tools）、记忆（Memory）、规划（Planning）
- [ ] ReAct 模式：Thought → Action → Observation 循环
- [ ] Tool Calling 机制：JSON Schema 描述 + 函数实现
- [ ] 动手练习：用 OpenAI / 通义千问 API 跑通一次 tool_calls 请求

### 阶段二：从零写一个最小 Agent（Day 3 - Day 4）

**目标**：用 TypeScript / Node.js 手写一个带工具调用的 Agent 主循环，理解每一行代码

- [ ] 搭建 Node.js + TypeScript 项目骨架
- [ ] 定义工具清单（JSON Schema + 真实实现）
- [ ] 实现 Agent 主循环（ReAct loop，最大步数限制）
- [ ] 加入错误兜底（工具超时、重试、结构化错误返回）
- [ ] 动手项目：做一个「天气 + 搜索」双工具 Agent

### 阶段三：进阶能力——记忆 + 流式 + 多工具编排（Day 5 - Day 6）

**目标**：给 Agent 加上短期/长期记忆、流式输出、工具调用过程可视化

- [ ] 短期记忆：对话历史管理 + Token 窗口控制
- [ ] 长期记忆：对话结束后提炼关键信息持久化
- [ ] 流式输出：SSE / ReadableStream 实现打字机效果
- [ ] 前端可视化：展示 Agent 每一步的思考 → 行动 → 观察
- [ ] 可观测性：日志 Trace 记录每步延迟、Token 消耗
- [ ] Human-in-the-loop：高风险操作前弹窗确认

### 阶段四：综合实战——做出你自己的 Agent（Day 7）

**目标**：独立设计并完成一个有实际用途的 Agent 项目

- [ ] 确定 Agent 定位（从下方候选中选一个，或自定义）
- [ ] 设计工具集、System Prompt、记忆策略
- [ ] 完整实现 + 前端界面
- [ ] 部署或本地演示

**候选 Agent 方向（选一个）：**

| 方向 | 描述 | 工具集 |
|------|------|-------|
| 📝 智能周报助手 | 输入本周关键词，自动生成周报 | 日程查询、Git log 提取、文本生成 |
| 🔍 代码 Review Agent | 给代码自动做 Review 并给建议 | 文件读取、ESLint 分析、LLM 审查 |
| 📚 知识库问答 Agent | 基于本地 Markdown 知识库回答问题 | 文件搜索、文本分割、RAG 检索 |
| 🗺️ 行程规划助手 | 输入目的地，自动生成一日游方案 | 天气查询、景点搜索、路线规划 |
| 🤖 MCP Server Agent | 实现一个 MCP 协议的工具服务 | 自定义 MCP 工具集 |

---

## 进度追踪

| 阶段 | 状态 | 完成日期 |
|------|------|---------|
| 阶段一：Agent 核心认知 | 🔄 进行中 | - |
| 阶段二：从零写最小 Agent | ⏳ 未开始 | - |
| 阶段三：记忆 + 流式 + 编排 | ⏳ 未开始 | - |
| 阶段四：综合实战 | ⏳ 未开始 | - |

---

## 每日学习记录

### Day 1 — 2026-06-09

**📌 今日目标**：理解 Agent 本质 —— 和普通 LLM 调用有什么区别？搞懂四大组件

**推荐学习路径**：

1. **30min** — 阅读项目知识库 `docs/interview/AI/agent.md` 前四章（Agent 定义 → 四大组件 → ReAct 循环 → 工具机制）
2. **30min** — 对照代码理解 ReAct 循环：`Thought → Action → Observation` 交替执行的本质
3. **30min** — 动手实验：用任意 LLM API（OpenAI / 通义千问 / 豆包）发一次带 `tools` 参数的请求，观察返回的 `tool_calls` 字段
4. **15min** — 总结：用自己的话写出 "Agent 和普通 LLM 调用的 3 个核心区别"

**✏️ 学习笔记**：

<!-- 手动填写：核心概念、知识点总结 -->

**💻 代码练习**：

```typescript
// 尝试发一次带 tools 的 API 调用，观察 tool_calls 返回结构
```

**❓ 疑问记录**：

<!-- 学习中遇到的疑问，下次对话时一起解决 -->

**⭐ 总结**：

<!-- 一句话总结今天学到的最重要的东西 -->

---

### Day 2 — 2026-06-10

**📌 今日目标**：深入 Tool Calling 机制 + 理解 Workflow vs Agent 的区别

**推荐学习路径**：

1. **30min** — 阅读 `docs/interview/AI/agent.md` 第五章（手把手从零构建最小 Agent），重点看 `toolSchemas` 的 JSON Schema 结构
2. **30min** — 阅读 `docs/interview/AI/workflow.md`，搞清楚 Workflow（固定流程）和 Agent（动态决策）的区别与适用场景
3. **30min** — 动手实验：定义 2 个工具的 JSON Schema，发给 LLM，观察它如何选择工具
4. **15min** — 画一张 Agent vs Workflow 对比脑图

**✏️ 学习笔记**：

<!-- 手动填写 -->

**💻 代码练习**：

```typescript
// 定义一个自定义工具的 JSON Schema，包含 name / description / parameters
```

**❓ 疑问记录**：

<!-- 手动填写 -->

**⭐ 总结**：

<!-- 一句话总结 -->

---

### Day 3 — 2026-06-11

**📌 今日目标**：搭建项目骨架，实现 Agent 主循环

**推荐学习路径**：

1. **20min** — 初始化 Node.js + TypeScript 项目（`npm init -y` + `tsconfig.json` + 安装 `openai` 包）
2. **40min** — 编写 `tools.ts`：定义 2-3 个工具的 Schema 和实现函数
3. **40min** — 编写 `agent.ts`：实现 ReAct 主循环（while 循环 + tool_calls 判断 + 工具执行 + 结果回注）
4. **20min** — 跑通第一个完整 Agent 调用，观察控制台每一步的 Thought / Action / Observation

**✏️ 学习笔记**：

<!-- 手动填写 -->

**💻 代码练习**：

```typescript
// 实现 Agent 主循环核心代码
```

**❓ 疑问记录**：

<!-- 手动填写 -->

**⭐ 总结**：

<!-- 一句话总结 -->

---

### Day 4 — 2026-06-12

**📌 今日目标**：完善 Agent —— 错误兜底 + 最大步数 + 日志追踪

**推荐学习路径**：

1. **30min** — 实现 `callToolSafely()`：超时控制（Promise.race）+ 指数退避重试 + 结构化错误返回
2. **30min** — 加入 AgentTrace 日志：记录每步的 type / toolName / latencyMs / tokenUsed
3. **30min** — 加入最大步数限制（MAX_STEPS = 6），超出后返回友好提示
4. **15min** — 测试各种边界场景：工具不存在、参数错误、API 超时

**✏️ 学习笔记**：

<!-- 手动填写 -->

**💻 代码练习**：

```typescript
// 实现带超时和重试的安全工具调用
```

**❓ 疑问记录**：

<!-- 手动填写 -->

**⭐ 总结**：

<!-- 一句话总结 -->

---

### Day 5 — 2026-06-13

**📌 今日目标**：给 Agent 加上记忆系统（短期 + 长期）

**推荐学习路径**：

1. **30min** — 实现短期记忆：对话历史 messages 数组管理 + Token 窗口截断策略
2. **30min** — 实现长期记忆：对话结束后用 LLM 提炼关键信息 → 存到本地 JSON / SQLite
3. **30min** — 下次对话时注入记忆：从存储读取 → 注入 System Prompt
4. **15min** — 测试跨轮次记忆效果："我叫小明" → 下次直接问天气 → Agent 记得查北京

**✏️ 学习笔记**：

<!-- 手动填写 -->

**💻 代码练习**：

```typescript
// 实现记忆提取和注入
```

**❓ 疑问记录**：

<!-- 手动填写 -->

**⭐ 总结**：

<!-- 一句话总结 -->

---

### Day 6 — 2026-06-14

**📌 今日目标**：流式输出 + 前端可视化 Agent 执行过程

**推荐学习路径**：

1. **30min** — 后端实现 SSE 流式返回：Agent 每一步实时推送给前端
2. **30min** — 前端接收流式数据：`fetch` + `ReadableStream` + 逐 chunk 渲染
3. **30min** — 实现工具调用可视化 UI：💭 思考中 → 🔧 调用工具 → ✅ 返回结果 → 📝 最终回答
4. **15min** — （可选）实现 Human-in-the-loop：高风险操作前弹窗确认

**✏️ 学习笔记**：

<!-- 手动填写 -->

**💻 代码练习**：

```typescript
// 实现 SSE 流式输出 + 前端接收
```

**❓ 疑问记录**：

<!-- 手动填写 -->

**⭐ 总结**：

<!-- 一句话总结 -->

---

### Day 7 — 2026-06-15

**📌 今日目标**：综合实战 —— 完成一个有实际用途的 Agent

**推荐学习路径**：

1. **15min** — 选定 Agent 方向（参考上方候选列表），明确需求
2. **30min** — 设计 Agent：System Prompt + 工具集定义 + 记忆策略 + 最大步数
3. **60min** — 完整实现：后端 Agent 逻辑 + 前端交互界面
4. **15min** — 本地演示 / 录屏 / 写一段 README

**✏️ 学习笔记**：

<!-- 手动填写 -->

**💻 代码练习**：

```typescript
// 你的完整 Agent 代码
```

**❓ 疑问记录**：

<!-- 手动填写 -->

**⭐ 总结**：

<!-- 一句话总结：我做了一个什么 Agent？它能解决什么问题？ -->

---

## 推荐资源

| 资源 | 用途 |
|------|------|
| 项目知识库 `docs/interview/AI/agent.md` | Agent 原理全解（已有，直接读） |
| 项目知识库 `docs/interview/AI/workflow.md` | Workflow 对比（已有，直接读） |
| 项目知识库 `docs/interview/AI/index.md` | LLM 基础 + Prompt 工程 |
| [OpenAI Function Calling 文档](https://platform.openai.com/docs/guides/function-calling) | 官方 Tool Calling 接口规范 |
| [Anthropic Tool Use 文档](https://docs.anthropic.com/en/docs/build-with-claude/tool-use) | Claude Tool Use 接口 |
| [LangChain.js](https://js.langchain.com/) | Agent 框架参考（了解即可，优先手写） |
| [Vercel AI SDK](https://sdk.vercel.ai/) | 前端 AI 集成方案 |
| [MCP 协议文档](https://modelcontextprotocol.io/) | Model Context Protocol 标准 |
