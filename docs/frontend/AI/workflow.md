# 构建 AI 流水线（Workflow）—— 前端工程师视角全解

> 上一章讲了 Agent（让 AI 自己决定干什么），本章讲 Workflow（你来决定 AI 按什么顺序干）。两者是 AI 工程化最核心的两种模式，搞清楚各用在哪，才能设计出合理的系统。

---

## 一、什么是 Workflow？

还是先用类比：

**Agent ≈ 你雇了一个员工，告诉他"帮我把这件事搞定"，他自己决定怎么做**

```
你 → 任务描述 → 员工（自主决策）→ 结果
```

**Workflow ≈ 你写了一份 SOP（标准操作流程），每个人按流程执行**

```
触发器 → 步骤1 → 步骤2 → 条件判断 → 步骤3A / 步骤3B → 输出
```

Workflow 是**预先定义好的、确定性的执行链路**。每个步骤做什么、顺序是什么、出错怎么处理，全部在设计阶段就决定好了。

---

## 二、Workflow vs Agent：一张表说清楚

| 维度 | Workflow（流水线）| Agent（智能体）|
|------|-----------------|--------------|
| 执行路径 | 固定，提前定义好 | 动态，LLM 实时决定 |
| 可预测性 | ✅ 高，每次结果一致 | ❌ 低，路径可能变化 |
| 调试难度 | ✅ 低，每个节点独立排查 | ❌ 高，需观察推理链 |
| 适合场景 | 步骤固定、流程稳定 | 步骤不确定、需要探索 |
| 典型例子 | 周报生成、内容审核、数据处理 | 开放式问答、复杂任务规划 |
| 失败处理 | 明确的重试 / 跳过 / 报警规则 | 需要兜底策略（见 Agent 章）|

**选择口诀：**

> 步骤固定用 Workflow，步骤不定用 Agent，两者混搭最常见。

---

## 三、流水线的三个核心要素

任何 Workflow 都由这三样东西组成：

### 1. 节点（Node）—— 流水线上的每一个步骤

```typescript
// 节点类型
type NodeType =
  | 'trigger'      // 触发器：流水线的入口
  | 'llm'          // LLM 调用：调大模型处理文本
  | 'tool'         // 工具调用：调外部 API / 函数
  | 'condition'    // 条件分支：根据结果走不同路径
  | 'transform'    // 数据转换：格式化、过滤、合并数据
  | 'output'       // 输出节点：最终结果

interface Node {
  id: string
  type: NodeType
  name: string
  execute: (input: any, context: WorkflowContext) => Promise<any>
}
```

### 2. 边（Edge）—— 步骤之间的连接关系

```typescript
interface Edge {
  from: string   // 上游节点 id
  to: string     // 下游节点 id
  condition?: (output: any) => boolean  // 条件边（只有满足条件才走这条路）
}

// 例如：情感分析结果为负面 → 走人工审核分支
const edges: Edge[] = [
  { from: 'sentiment_check', to: 'auto_publish',  condition: (r) => r.sentiment === 'positive' },
  { from: 'sentiment_check', to: 'manual_review', condition: (r) => r.sentiment === 'negative' },
]
```

### 3. 上下文（Context）—— 节点间共享的状态

```typescript
// Context 就是流水线的"全局状态"，类似 Vuex/Redux store
// 每个节点从 context 读输入、把输出写回 context
interface WorkflowContext {
  input: any           // 最初的输入
  outputs: Record<string, any>  // 每个节点的输出结果
  status: 'running' | 'completed' | 'failed'
  currentNode: string
}
```

---

## 四、用代码实现一个最小流水线引擎

```typescript
// workflow-engine.ts

interface Node {
  id: string
  execute: (input: any, ctx: WorkflowContext) => Promise<any>
  next?: string | ((output: any) => string)  // 下一个节点（可以是固定值或函数）
}

interface WorkflowContext {
  outputs: Record<string, any>
}

class WorkflowEngine {
  private nodes: Map<string, Node> = new Map()

  // 注册节点
  addNode(node: Node) {
    this.nodes.set(node.id, node)
    return this
  }

  // 执行流水线
  async run(startNodeId: string, input: any): Promise<WorkflowContext> {
    const ctx: WorkflowContext = { outputs: {} }
    let currentId: string | undefined = startNodeId
    let currentInput = input

    while (currentId) {
      const node = this.nodes.get(currentId)
      if (!node) throw new Error(`节点 "${currentId}" 不存在`)

      console.log(`[${currentId}] 执行中...`)

      // 执行当前节点
      const output = await node.execute(currentInput, ctx)
      ctx.outputs[currentId] = output   // 把输出存入 context

      // 决定下一个节点
      currentId = typeof node.next === 'function'
        ? node.next(output)    // 条件分支：由函数决定走哪条路
        : node.next            // 固定路径：直接跳到下一个

      currentInput = output    // 上一步的输出就是下一步的输入
    }

    return ctx
  }
}
```

---

## 五、实战案例：周报自动生成助手

**场景：** 每周五，前端工程师把本周的 Git 提交记录和 Jira 任务列表丢进来，自动生成一份格式规范的周报，发送到企业微信。

**流水线设计：**

```
[输入] Git commits + Jira 任务列表
   │
   ▼
[步骤1] 数据清洗    ── 过滤无意义的提交（merge、chore）
   │
   ▼
[步骤2] LLM 分析    ── 把原始数据转成"本周完成了什么"的摘要
   │
   ▼
[步骤3] 质量检查    ── 检查摘要是否过短、是否有敏感词
   │
   ├─ 不通过 ──▶ [步骤3A] 重新生成（最多重试 2 次）
   │
   └─ 通过   ──▶ [步骤4] 格式化输出  ── 转成企业微信卡片格式
                    │
                    ▼
                [步骤5] 发送通知    ── POST 企业微信 Webhook
```

---

### 完整代码实现

```typescript
// weekly-report-workflow.ts
import OpenAI from 'openai'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// ── 工具函数 ──────────────────────────────────────

// 调 LLM 的通用封装
async function callLLM(systemPrompt: string, userContent: string): Promise<string> {
  const res = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userContent },
    ],
  })
  return res.choices[0].message.content ?? ''
}

// 发企业微信
async function sendWecomMessage(content: string, webhookUrl: string) {
  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ msgtype: 'text', text: { content } }),
  })
}

// ── 各节点定义 ────────────────────────────────────

const engine = new WorkflowEngine()

// 节点1：数据清洗
engine.addNode({
  id: 'clean_data',
  async execute({ commits, tasks }) {
    // 过滤掉 merge commit 和 chore 类型的提交
    const meaningfulCommits = commits.filter(
      (c: string) => !c.startsWith('Merge') && !c.toLowerCase().includes('chore')
    )
    return { commits: meaningfulCommits, tasks }
  },
  next: 'llm_summarize',
})

// 节点2：LLM 分析生成摘要
engine.addNode({
  id: 'llm_summarize',
  async execute({ commits, tasks }) {
    const summary = await callLLM(
      `你是一个技术周报助手，将工作内容整理成简洁专业的周报摘要。
       格式要求：
       - 本周完成事项（3~5 条）
       - 下周计划（1~2 条）
       - 风险 / 阻塞（没有则写"无"）
       语言简洁，每条不超过 30 字。`,
      `Git 提交：\n${commits.join('\n')}\n\nJira 任务：\n${tasks.join('\n')}`
    )
    return { summary, commits, tasks }
  },
  next: 'quality_check',
})

// 节点3：质量检查（条件分支）
engine.addNode({
  id: 'quality_check',
  async execute({ summary }, ctx) {
    const tooShort = summary.length < 50
    const hasSensitiveWords = /密码|token|secret/i.test(summary)
    const retryCount = ctx.outputs['retry_count'] ?? 0

    const passed = !tooShort && !hasSensitiveWords

    return { summary, passed, retryCount, reason: tooShort ? '摘要过短' : hasSensitiveWords ? '含敏感词' : '' }
  },
  // 条件分支：通过则格式化，不通过则重试
  next: ({ passed, retryCount }) => {
    if (passed) return 'format_output'
    if (retryCount < 2) return 'retry_generate'
    return 'format_output'  // 超过重试次数，直接放行（或走人工审核）
  },
})

// 节点3A：重新生成（回到 LLM 节点）
engine.addNode({
  id: 'retry_generate',
  async execute({ summary, retryCount, reason }, ctx) {
    ctx.outputs['retry_count'] = retryCount + 1
    console.log(`[重试 ${retryCount + 1}] 原因：${reason}`)

    const newSummary = await callLLM(
      `你是周报助手。上次生成的内容存在问题：${reason}。请重新生成，避免该问题。`,
      `原摘要：${summary}`
    )
    return { summary: newSummary }
  },
  next: 'quality_check',   // 重新回到质量检查
})

// 节点4：格式化成企业微信消息
engine.addNode({
  id: 'format_output',
  async execute({ summary }) {
    const now = new Date()
    const weekStr = `${now.getFullYear()}年第${getWeekNumber(now)}周`

    const message = `📋 前端团队周报 · ${weekStr}\n${'─'.repeat(20)}\n${summary}\n\n🤖 由 AI 自动生成`
    return { message }
  },
  next: 'send_notification',
})

// 节点5：发送企业微信通知
engine.addNode({
  id: 'send_notification',
  async execute({ message }) {
    await sendWecomMessage(message, process.env.WECOM_WEBHOOK_URL!)
    console.log('✅ 周报已发送')
    return { sent: true, message }
  },
  next: undefined,  // 终点，流水线结束
})

// ── 运行流水线 ────────────────────────────────────

async function generateWeeklyReport(commits: string[], tasks: string[]) {
  const ctx = await engine.run('clean_data', { commits, tasks })
  return ctx.outputs['send_notification']
}

// 调用示例
generateWeeklyReport(
  [
    'feat: 新增商品详情页懒加载',
    'fix: 修复移动端滚动穿透问题',
    'Merge branch feature/login into main',
    'refactor: 重构购物车组件',
    'chore: 更新依赖版本',
  ],
  [
    'JIRA-1024: 首页性能优化（已完成）',
    'JIRA-1031: 用户中心改版（进行中）',
  ]
)
```

**控制台输出：**

```
[clean_data] 执行中...         ← 过滤掉 Merge 和 chore 提交
[llm_summarize] 执行中...      ← LLM 分析生成摘要
[quality_check] 执行中...      ← 检查内容是否合格
[format_output] 执行中...      ← 格式化消息
[send_notification] 执行中...  ← 发送企业微信
✅ 周报已发送
```

**最终发出的企业微信消息：**

```
📋 前端团队周报 · 2026年第21周
────────────────────
本周完成事项：
• 新增商品详情页懒加载，提升首屏性能
• 修复移动端滚动穿透问题
• 首页性能优化专项完成

下周计划：
• 推进用户中心改版（JIRA-1031）

风险 / 阻塞：无

🤖 由 AI 自动生成
```

---

## 六、前端如何展示流水线进度

流水线一步一步执行，前端应该让用户看到每一步的状态，而不是盯着转圈圈：

```vue
<template>
  <div class="workflow-progress">
    <div
      v-for="step in steps"
      :key="step.id"
      class="step-row"
      :class="step.status"
    >
      <!-- 状态图标 -->
      <span class="icon">
        {{ step.status === 'running'   ? '⏳' :
           step.status === 'done'      ? '✅' :
           step.status === 'error'     ? '❌' : '○' }}
      </span>

      <!-- 节点名称 + 耗时 -->
      <span class="name">{{ step.name }}</span>
      <span v-if="step.duration" class="duration">{{ step.duration }}ms</span>

      <!-- 错误信息 -->
      <span v-if="step.error" class="error-msg">{{ step.error }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const steps = ref([
  { id: 'clean_data',        name: '数据清洗',    status: 'pending' },
  { id: 'llm_summarize',     name: 'AI 分析',     status: 'pending' },
  { id: 'quality_check',     name: '质量检查',    status: 'pending' },
  { id: 'format_output',     name: '格式化',      status: 'pending' },
  { id: 'send_notification', name: '发送通知',    status: 'pending' },
])

// 后端通过 SSE 推送每个节点的状态变化
async function runWorkflow(input: object) {
  const res = await fetch('/api/workflow/weekly-report', {
    method: 'POST',
    body: JSON.stringify(input),
  })

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    // 每次收到一条 SSE 事件：{ nodeId, status, duration?, error? }
    const event = JSON.parse(decoder.decode(value).replace('data: ', ''))
    const step = steps.value.find(s => s.id === event.nodeId)
    if (step) Object.assign(step, event)
  }
}
</script>
```

用户看到的界面效果：

```
⏳ 数据清洗    ← 正在执行
○  AI 分析
○  质量检查
○  格式化
○  发送通知

          ↓ 几秒后

✅ 数据清洗    23ms
⏳ AI 分析     ← 正在执行（LLM 比较慢）
○  质量检查
○  格式化
○  发送通知
```

---

## 七、Workflow + Agent 混合：最常见的生产架构

纯 Workflow 太死板，纯 Agent 太不稳定，实际项目里**两者混合**才是最优解：

```
主流程（Workflow，固定可控）
  │
  ├── [节点1] 数据预处理（纯函数，确定性）
  │
  ├── [节点2] 意图识别（LLM，确定性输出）
  │
  ├── [节点3] 复杂任务处理
  │              │
  │              └─► 如果是简单任务 → 直接走 Workflow 固定节点
  │              └─► 如果是复杂任务 → 启动 Agent 子流程（动态）
  │
  └── [节点4] 结果汇总 + 发送（确定性）
```

**代码示例：**

```typescript
// 在 Workflow 节点里内嵌 Agent
engine.addNode({
  id: 'handle_complex_task',
  async execute({ task, complexity }) {
    if (complexity === 'simple') {
      // 简单任务：Workflow 固定节点直接处理
      return processSimpleTask(task)
    } else {
      // 复杂任务：启动 Agent 子流程（动态决策）
      return await runAgent(task)  // Agent 章节里的 runAgent 函数
    }
  },
  next: 'output',
})
```

---

## 八、章节总结

| | Workflow | Agent |
|-|---------|-------|
| **本质** | 你定义流程，AI 按图执行 | AI 自己规划流程，动态执行 |
| **适合** | 步骤明确、重复性高、需要稳定输出 | 开放任务、需要自主探索 |
| **前端价值** | 进度条、节点状态、步骤可视化 | 打字机效果、工具调用时间线 |
| **生产建议** | 先用 Workflow 跑稳，不确定节点换成 Agent | 不要把所有事都交给 Agent |

> **一句话**：Workflow 是流程图，Agent 是会思考的执行者。能用流程图解决的，就别用 Agent。
