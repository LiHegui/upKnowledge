# 构建 AI Agent —— 前端工程师视角全解

> 本文从前端工程师熟悉的概念出发，系统讲解 AI Agent 是什么、为什么要用它、以及如何一步步把它搭建起来。

---

## 一、先搞清楚：Agent 到底是什么？

先别急着背定义。用你最熟悉的东西类比：

**普通 LLM 调用 ≈ 一个纯函数**

```
input（Prompt）→ LLM → output（文本）
```

调用一次，得到一个答案，结束。就像 `const result = formatDate(timestamp)` — 给进去，拿出来，不管后续。

**Agent ≈ 一个带状态的事件循环**

```
while (任务未完成) {
  思考：下一步该做什么？
  行动：调用工具 / 执行操作
  观察：看工具返回了什么
  更新：把结果加入上下文，继续思考
}
```

Agent 不是"问一次答一次"，而是**能自己规划步骤、调用外部能力、根据结果调整方向**，直到任务完成。

---

## 二、Agent 的四个核心组成

把 Agent 拆开，本质就四样东西：

```
┌─────────────────────────────────────────────┐
│                   Agent                      │
│                                              │
│  ┌──────────┐   ┌──────────┐                │
│  │  大脑    │   │  记忆    │                │
│  │  LLM     │   │  Memory  │                │
│  └──────────┘   └──────────┘                │
│                                              │
│  ┌──────────┐   ┌──────────┐                │
│  │  工具    │   │  规划    │                │
│  │  Tools   │   │ Planning │                │
│  └──────────┘   └──────────┘                │
└─────────────────────────────────────────────┘
```

| 组成 | 类比（前端视角）| 作用 |
|------|--------------|------|
| **大脑（LLM）** | 业务逻辑核心 | 理解意图、推理决策、生成下一步行动 |
| **工具（Tools）** | 调用的 API / 工具函数 | 扩展 LLM 能力（搜索、查数据库、发请求）|
| **记忆（Memory）** | 状态管理（useState / Redux）| 保存对话历史、用户偏好、中间结果 |
| **规划（Planning）** | 任务调度逻辑 | 把大目标拆成小步骤，决定执行顺序 |

---

## 三、最核心的运行模式：ReAct 循环

Agent 内部运行的核心模式叫 **ReAct（Reasoning + Acting）**，就三步不断循环：

```
Thought（思考）→ Action（行动）→ Observation（观察）→ 再 Thought → ...
```

**举个具体例子：**

> 用户：帮我查一下明天北京的天气，如果下雨就给我发个提醒

```
[Thought]  用户想知道明天北京的天气，需要调用天气查询工具
[Action]   调用 get_weather({ city: "北京", date: "明天" })
[Observation] { weather: "小雨", temp: "14-18°C" }

[Thought]  天气是小雨，用户说下雨就发提醒，需要调用发送提醒工具
[Action]   调用 send_reminder({ message: "明天北京小雨，记得带伞" })
[Observation] { success: true }

[Thought]  两个任务都完成了，可以回答用户了
[Final]    已查询明天北京天气（小雨 14-18°C），并已为您发送带伞提醒 ✅
```

**关键点：Agent 的"思考"和"行动"是交替进行的，LLM 自己决定要不要调工具、调哪个、调几次。**

---

## 四、工具（Tool）是 Agent 的手和脚

LLM 本身只能"说"，不能"做"。工具让它有了执行能力：

```
没有工具的 LLM：只能凭训练数据说"北京明天可能下雨"（可能是错的）
有工具的 Agent：调用实时天气 API，告诉你准确结果
```

**工具的本质：一个有描述信息的函数**

```typescript
// 工具的两个部分：描述（给 LLM 看）+ 实现（真正执行）

// 1. 描述：告诉 LLM 这个工具是做什么的、参数是什么
const weatherTool = {
  name: 'get_weather',
  description: '获取指定城市的实时天气。当用户询问天气时调用此工具。',
  parameters: {
    type: 'object',
    properties: {
      city: {
        type: 'string',
        description: '城市名称，如：北京、上海',
      },
    },
    required: ['city'],
  },
}

// 2. 实现：真正去执行的函数
async function get_weather({ city }: { city: string }) {
  const res = await fetch(`https://api.weather.com/v1/${city}`)
  return await res.json()
}
```

**LLM 做的事：** 读工具描述 → 判断当前该不该用 → 如果用，生成参数 → 把结果拿回来继续思考。

LLM 自己不执行工具，**它只负责"说要调哪个工具、传什么参数"，真正执行是你的代码**。

---

## 五、手把手：从零构建一个最小 Agent

下面用 TypeScript 写一个能跑通的最小 Agent，带你看清每一步。

### Step 1：定义工具清单

```typescript
// tools.ts

// 工具的 JSON Schema 描述（交给 LLM）
export const toolSchemas = [
  {
    type: 'function',
    function: {
      name: 'get_weather',
      description: '获取城市实时天气，用户问天气时调用',
      parameters: {
        type: 'object',
        properties: {
          city: { type: 'string', description: '城市名称' },
        },
        required: ['city'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_web',
      description: '搜索互联网获取最新信息，用户问实时资讯时调用',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: '搜索关键词' },
        },
        required: ['query'],
      },
    },
  },
]

// 工具的真实实现（你来写）
export const toolHandlers: Record<string, (args: any) => Promise<any>> = {
  get_weather: async ({ city }) => {
    // 真实项目里调天气 API
    return { city, weather: '晴', temp: '22°C', humidity: '45%' }
  },
  search_web: async ({ query }) => {
    // 真实项目里调搜索 API
    return { results: [`关于 "${query}" 的最新搜索结果...`] }
  },
}
```

### Step 2：实现 Agent 主循环

```typescript
// agent.ts
import OpenAI from 'openai'
import { toolSchemas, toolHandlers } from './tools'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

type Message = OpenAI.ChatCompletionMessageParam

async function runAgent(userInput: string): Promise<string> {
  // 消息历史：这就是 Agent 的"工作记忆"
  const messages: Message[] = [
    {
      role: 'system',
      content: '你是一个智能助手，可以使用工具来回答用户的问题。需要工具时主动调用，不要猜测。',
    },
    { role: 'user', content: userInput },
  ]

  // ReAct 循环：最多跑 6 轮，防止死循环
  for (let step = 0; step < 6; step++) {
    console.log(`\n[Step ${step + 1}] 调用 LLM...`)

    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages,
      tools: toolSchemas,       // 告诉 LLM 有哪些工具可用
      tool_choice: 'auto',      // 让 LLM 自己决定要不要用工具
    })

    const message = response.choices[0].message

    // ── 情况一：LLM 决定调用工具 ──
    if (message.tool_calls && message.tool_calls.length > 0) {
      // 把 LLM 的"行动决策"加入历史
      messages.push(message)

      // 逐个执行工具
      for (const toolCall of message.tool_calls) {
        const toolName = toolCall.function.name
        const toolArgs = JSON.parse(toolCall.function.arguments)

        console.log(`[Action] 调用工具: ${toolName}`, toolArgs)

        // 真正执行工具
        const toolResult = await toolHandlers[toolName]?.(toolArgs)
          ?? { error: `未知工具: ${toolName}` }

        console.log(`[Observation] 工具返回:`, toolResult)

        // 把工具结果加入历史（LLM 下一轮会看到这个）
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult),
        })
      }

      // 继续下一轮循环（LLM 会基于工具结果再次思考）
      continue
    }

    // ── 情况二：LLM 不需要工具了，直接给出最终答案 ──
    console.log('[Final] Agent 完成任务')
    return message.content ?? '无法生成回答'
  }

  return '已达到最大执行步数，任务未完成。'
}

// 使用
runAgent('帮我查一下上海今天的天气，以及最近的 AI 大模型新闻').then(console.log)
```

### Step 3：运行流程可视化

跑起来后，控制台输出大概是这样的：

```
[Step 1] 调用 LLM...
[Action] 调用工具: get_weather { city: "上海" }
[Observation] 工具返回: { city: "上海", weather: "多云", temp: "25°C" }

[Step 2] 调用 LLM...
[Action] 调用工具: search_web { query: "AI 大模型 2026 最新新闻" }
[Observation] 工具返回: { results: ["关于 AI 大模型的最新搜索结果..."] }

[Step 3] 调用 LLM...
[Final] Agent 完成任务

上海今天多云，气温 25°C，体感舒适。
关于 AI 大模型的最新动态：... (来自搜索结果)
```

**可以看到：Agent 自己决定了要调用两个工具，调用完成后再汇总回答。整个过程不需要你手动写"先查天气再搜索"的逻辑。**

---

## 六、加入记忆：让 Agent 跨轮次记住信息

上面的 Agent 每次调用都是全新的，没有上下文。真实场景里需要记忆：

```
用户：我叫小明
Agent：你好小明！
用户：我明天要去北京出差
Agent：好的，已记下。
用户：帮我查天气              ← Agent 应该知道查"北京"的天气，而不是问"哪个城市"
```

**记忆分两类：**

```typescript
// 短期记忆：对话历史（已经在 messages 数组里了）
// → 就是上面代码里的 messages，每轮都带着走

// 长期记忆：需要跨会话保存的信息
// → 存到数据库或向量数据库，按需检索
interface LongTermMemory {
  userId: string
  facts: string[]         // 用户说过的关键信息："用户名叫小明"
  preferences: object     // 用户偏好
  sessionHistory: string  // 历史摘要
}
```

**实际上最简单的长期记忆：**

```typescript
// 每次对话结束后，让 LLM 提炼关键信息存到 DB
async function extractAndSaveMemory(messages: Message[], userId: string) {
  const summary = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: '请从对话中提取用户的关键信息（姓名、偏好、计划等），以 JSON 格式返回。',
      },
      { role: 'user', content: JSON.stringify(messages) },
    ],
  })

  const facts = JSON.parse(summary.choices[0].message.content ?? '{}')
  await db.userMemory.upsert({ userId, facts })
}

// 下次对话时，从 DB 取出注入 System Prompt
async function buildSystemPrompt(userId: string) {
  const memory = await db.userMemory.findOne({ userId })
  return `你是智能助手。关于用户的已知信息：${JSON.stringify(memory?.facts ?? {})}`
}
```

---

## 七、工程化必须考虑的三件事

搭出来能跑，和生产可用，差距在这三点：

### 1. 可观测性 —— 知道 Agent 在做什么

```typescript
// 每一步都要记录日志，方便排查问题
interface AgentTrace {
  step: number
  type: 'thought' | 'action' | 'observation' | 'final'
  toolName?: string
  toolArgs?: object
  toolResult?: object
  llmOutput?: string
  latencyMs: number
  tokenUsed: number
}

// 推荐接入：LangFuse（开源）或 LangSmith
// 接入后可以在 Dashboard 看到每一步的执行链路
```

### 2. 失败兜底 —— 工具挂了怎么办

```typescript
async function callToolSafely(name: string, args: object) {
  const MAX_RETRIES = 3

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await Promise.race([
        toolHandlers[name](args),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('工具超时')), 10_000)
        ),
      ])
    } catch (err) {
      if (i === MAX_RETRIES - 1) {
        // 最后一次失败：返回结构化错误，让 LLM 知道工具失败了
        return { error: `工具 ${name} 执行失败: ${err.message}`, fallback: true }
      }
      await sleep(1000 * Math.pow(2, i))  // 指数退避重试
    }
  }
}
```

### 3. 最大步数限制 —— 防止死循环

```typescript
const MAX_STEPS = 6  // 超过就强制停止

for (let step = 0; step < MAX_STEPS; step++) {
  // ... Agent 循环逻辑
}

// 超出时返回友好提示，而不是让用户等到天荒地老
return '该任务较为复杂，已达到本轮最大执行步数，请尝试拆解问题后重试。'
```

---

## 八、前端工程师在 Agent 里能做什么？

Agent 的"大脑"是后端，但前端是整个体验的关键：

```
用户 ───────────────────────────────► 前端（你的主战场）
                                          │
                 ┌────────────────────────┘
                 ▼
         Agent 编排层（后端）
                 │
         ┌───────┴───────┐
         ▼               ▼
      LLM API          工具执行层
```

**前端能做的具体事：**

**① 流式 UI（打字机效果）**

```typescript
// 用 fetch + ReadableStream 接收流式输出
async function streamAgentResponse(userInput: string, onChunk: (text: string) => void) {
  const res = await fetch('/api/agent', {
    method: 'POST',
    body: JSON.stringify({ message: userInput }),
  })

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    onChunk(decoder.decode(value))
  }
}
```

**② 工具调用过程可视化**

```vue
<template>
  <div v-for="step in agentSteps" :key="step.id" class="step">
    <!-- 显示 Agent 的每一步思考和行动 -->
    <div v-if="step.type === 'thinking'" class="thinking">
      💭 正在思考...
    </div>
    <div v-if="step.type === 'tool_call'" class="tool-call">
      🔧 调用工具：{{ step.toolName }}
      <code>{{ JSON.stringify(step.args) }}</code>
    </div>
    <div v-if="step.type === 'tool_result'" class="tool-result">
      ✅ 工具返回：{{ step.result }}
    </div>
    <div v-if="step.type === 'final'" class="final-answer">
      {{ step.content }}
    </div>
  </div>
</template>
```

**③ Human-in-the-loop（人工介入）**

```typescript
// 高风险操作前，让用户确认
async function confirmBeforeAction(action: { tool: string; args: object }) {
  return new Promise<boolean>((resolve) => {
    showConfirmDialog({
      title: `Agent 即将执行：${action.tool}`,
      content: `参数：${JSON.stringify(action.args, null, 2)}`,
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false),
    })
  })
}
```

---

## 九、实战案例：一日游行程规划助手

用一个完整的小案例把前面所有概念串起来。

**需求：** 用户输入目的地，Agent 自动查天气、搜景点、生成行程，返回一份完整的出行计划。

---

### 第一步：定义工具

```typescript
// 三个工具：天气 / 景点搜索 / 路线规划
export const toolSchemas = [
  {
    type: 'function',
    function: {
      name: 'get_weather',
      description: '查询某城市某天的天气，规划出行前必须先查天气',
      parameters: {
        type: 'object',
        properties: {
          city:  { type: 'string', description: '城市名，如：上海' },
          date:  { type: 'string', description: '日期，如：2026-05-24' },
        },
        required: ['city', 'date'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_attractions',
      description: '搜索城市里适合一日游的热门景点列表',
      parameters: {
        type: 'object',
        properties: {
          city:  { type: 'string' },
          limit: { type: 'number', description: '返回景点数量，默认 5' },
        },
        required: ['city'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'generate_route',
      description: '根据景点列表生成合理的游览路线和时间安排',
      parameters: {
        type: 'object',
        properties: {
          city:        { type: 'string' },
          attractions: { type: 'array', items: { type: 'string' }, description: '景点名称列表' },
        },
        required: ['city', 'attractions'],
      },
    },
  },
]

// 工具的真实实现（实际项目里对接真实 API）
export const toolHandlers = {
  get_weather: async ({ city, date }) => ({
    city, date,
    weather: '晴转多云', temp: '22~28°C', suggestion: '适合出行，建议带薄外套',
  }),

  search_attractions: async ({ city, limit = 5 }) => ({
    city,
    attractions: ['外滩', '豫园', '上海博物馆', '田子坊', '东方明珠'].slice(0, limit),
  }),

  generate_route: async ({ city, attractions }) => ({
    city,
    route: [
      { time: '09:00', place: attractions[0], tip: '早晨人少，拍照最佳' },
      { time: '11:00', place: attractions[1], tip: '游览约 1.5 小时' },
      { time: '13:00', place: '午餐',         tip: '推荐附近本帮菜' },
      { time: '14:30', place: attractions[2], tip: '免费参观，建议提前预约' },
      { time: '16:30', place: attractions[3], tip: '文艺街区，适合拍照购物' },
    ],
  }),
}
```

---

### 第二步：跑 Agent，看执行过程

用户输入：**"帮我规划一下这周六（5月24日）去上海的一日游行程"**

```
[Step 1] LLM 思考 → 需要先查天气和景点，同时触发两个工具

[Action] get_weather({ city: "上海", date: "2026-05-24" })
[Result] { weather: "晴转多云", temp: "22~28°C", suggestion: "适合出行" }

[Action] search_attractions({ city: "上海", limit: 4 })
[Result] { attractions: ["外滩", "豫园", "上海博物馆", "田子坊"] }

---

[Step 2] LLM 思考 → 有了天气和景点，现在规划路线

[Action] generate_route({ city: "上海", attractions: ["外滩", "豫园", "上海博物馆", "田子坊"] })
[Result] { route: [ { time: "09:00", place: "外滩" }, ... ] }

---

[Step 3] LLM 思考 → 所有信息都有了，生成最终回答

[Final] ✅ 任务完成
```

**最终输出：**

```
📅 上海一日游行程（5月24日）

🌤 天气：晴转多云，22~28°C，适合出行，建议带薄外套

行程安排：
09:00  外滩          — 早晨人少，拍照最佳
11:00  豫园          — 游览约 1.5 小时
13:00  午餐          — 推荐附近本帮菜
14:30  上海博物馆    — 免费参观，建议提前预约
16:30  田子坊        — 文艺街区，适合拍照购物

祝旅途愉快！🎉
```

---

### 关键点回顾

| 环节 | 在案例里对应的是 |
|------|----------------|
| **工具描述要清晰** | `description` 字段写了"什么时候调"，LLM 才能正确决策 |
| **LLM 自己决定顺序** | Step 1 里 LLM 主动并发触发了两个工具（天气 + 景点），没有硬编码顺序 |
| **工具结果进入记忆** | 每次工具返回都 push 进 messages，LLM 下一轮能看到 |
| **最终由 LLM 汇总** | LLM 把三个工具的数据整合成一份自然语言行程，不是模板拼接 |

---

### 前端如何展示这个过程

```vue
<template>
  <div class="agent-chat">
    <!-- 用户输入 -->
    <input v-model="input" @keyup.enter="send" placeholder="输入目的地和日期..." />

    <!-- Agent 执行步骤（实时流式更新） -->
    <div v-for="step in steps" :key="step.id" class="step-item">
      <span v-if="step.type === 'tool_call'" class="badge tool">
        🔧 {{ step.toolName }}({{ JSON.stringify(step.args) }})
      </span>
      <span v-if="step.type === 'tool_result'" class="badge result">
        ✅ 已获取数据
      </span>
      <div v-if="step.type === 'final'" class="answer">
        {{ step.content }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const input = ref('')
const steps = ref([])

async function send() {
  const res = await fetch('/api/agent/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: input.value }),
  })

  // 后端通过 SSE 推送每一步
  const reader = res.body!.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const lines = decoder.decode(value).split('\n').filter(Boolean)
    for (const line of lines) {
      const step = JSON.parse(line.replace('data: ', ''))
      steps.value.push(step)   // 每一步实时追加到列表
    }
  }
}
</script>
```

用户看到的效果：输入问题后，界面实时出现 "🔧 查询天气... ✅ 已获取 → 🔧 搜索景点... ✅ 已获取 → 最终行程文字逐字出现"，整个过程透明可感知，而不是黑盒转圈。

---

## 十、完整流程图

```
用户输入
   │
   ▼
[前端] 发送请求 → /api/agent
   │
   ▼
[后端] 初始化 messages（注入记忆 + System Prompt）
   │
   ▼
[ReAct 循环开始]──────────────────────────────┐
   │                                          │
   ▼                                          │
调用 LLM（携带 messages + toolSchemas）        │
   │                                          │
   ├─ LLM 返回 tool_calls ──────────────────▶│
   │    │                                     │
   │    ▼                                     │
   │  执行工具（toolHandlers）                 │
   │    │                                     │
   │    ▼                                     │
   │  工具结果加入 messages                    │
   │    │                                     │
   │    └──────────────────────────────────▶ 继续循环
   │
   └─ LLM 返回最终文本（无 tool_calls）
        │
        ▼
[后端] 提取记忆、保存到 DB
        │
        ▼
[前端] 流式展示回答
        │
        ▼
[前端] 渲染工具调用过程时间线
```

---

## 十一、一句话总结

> **Agent = LLM 大脑 × 工具手脚 × 记忆状态 × ReAct 循环**
>
> 前端的职责：把 Agent 执行的每一步"可视化"给用户，让黑盒变透明，让等待变有感知。
