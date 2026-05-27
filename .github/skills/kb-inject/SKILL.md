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

#### 何时使用 HTML 卡片风格

满足以下任一条件，**优先使用 HTML 卡片**代替纯 Markdown 表格或代码块：

| 场景 | 示例 |
|------|------|
| 多步骤流程 / 生命周期 | Redux 数据流、React 渲染流程、Event Loop |
| 嵌套/分层结构 | 中间件洋葱模型、浏览器渲染层级 |
| 多列横向对比 | 3+ 方案对比、各 API 职责对比 |
| 时间线 / 阶段序列 | 渲染阶段顺序、异步流程步骤 |
| 彩色高亮签名 / 语法分解 | 函数签名着色分析 |

普通 Q&A 的表格和代码块**不需要**用 HTML 风格，保持 Markdown 格式即可。

---

#### CSS 样式模板（在文件首次使用前放置一次 `<style>` 块）

> ⚠️ **要求**：每个 `.md` 文件使用唯一的 CSS 前缀，避免跨页面样式污染。
> - 命名规则：取技术方向缩写，如 `rdx-`（Redux）、`vue-`（Vue）、`net-`（网络）、`js-`（JavaScript）、`rr-`（React渲染）
> - 将 `<style>` 块放在文件中**第一次出现 HTML 卡片之前的 `---` 分隔线后面**

````markdown
<style>
/* 将下方所有 rdx- 替换为当前文件的专属前缀，如 vue- / net- / js- */
.rdx{font-family:'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;font-size:13px;line-height:1.6;color:#e0e4f0}
.rdx-card{background:#1a1d27;border:1px solid #2e3347;border-radius:10px;padding:18px 20px;margin:14px 0}
.rdx-title{font-size:11px;font-weight:700;color:#a8b0cc;text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid #2e3347}
.rdx-tl{position:relative;padding-left:28px}
.rdx-tl::before{content:'';position:absolute;left:10px;top:0;bottom:0;width:2px;background:#2e3347}
.rdx-ti{position:relative;margin-bottom:14px}
.rdx-ti::before{content:'';position:absolute;left:-22px;top:7px;width:10px;height:10px;border-radius:50%;border:2px solid}
.rdx-ti.b::before{border-color:#4f8ef7;background:#4f8ef7}
.rdx-ti.g::before{border-color:#3ddc84;background:#3ddc84}
.rdx-ti.p::before{border-color:#b57bee;background:#b57bee}
.rdx-ti.y::before{border-color:#ffd166;background:#ffd166}
.rdx-ti.o::before{border-color:#ff9f43;background:#ff9f43}
.rdx-ti.c::before{border-color:#48cae4;background:#48cae4}
.rdx-tl-lb{font-size:12px;font-weight:700;margin-bottom:2px}
.rdx-tl-d{color:#8b90a8;font-size:11px}
.rdx-flow{display:flex;align-items:stretch;gap:0;flex-wrap:wrap;margin:10px 0}
.rdx-step{flex:1;padding:12px 10px;text-align:center;font-size:11px;font-weight:600;border-radius:7px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:4px;min-width:88px}
.rdx-step sub{font-weight:400;color:#8b90a8;font-size:10px;display:block;margin-top:2px}
.rdx-arr{color:#555;font-size:18px;padding:0 3px;flex-shrink:0;display:flex;align-items:center}
.rdx-step-b{background:rgba(79,142,247,.12);border:1px solid rgba(79,142,247,.3);color:#7eb3ff}
.rdx-step-g{background:rgba(61,220,132,.10);border:1px solid rgba(61,220,132,.25);color:#6ef5a8}
.rdx-step-p{background:rgba(181,123,238,.10);border:1px solid rgba(181,123,238,.3);color:#d4a8ff}
.rdx-step-y{background:rgba(255,209,102,.10);border:1px solid rgba(255,209,102,.25);color:#ffe599}
.rdx-step-o{background:rgba(255,159,67,.10);border:1px solid rgba(255,159,67,.25);color:#ffbb7a}
.rdx-step-c{background:rgba(72,202,228,.10);border:1px solid rgba(72,202,228,.25);color:#7be0f5}
.rdx-note{padding:9px 13px;border-radius:7px;font-size:12px;margin-top:10px}
.rdx-nb{background:rgba(79,142,247,.1);border-left:3px solid #4f8ef7;color:#7eb3ff}
.rdx-ng{background:rgba(61,220,132,.08);border-left:3px solid #3ddc84;color:#6ef5a8}
.rdx-nr{background:rgba(255,92,92,.08);border-left:3px solid #ff5c5c;color:#ff8f8f}
.rdx-ny{background:rgba(255,209,102,.08);border-left:3px solid #ffd166;color:#ffe599}
.rdx-np{background:rgba(181,123,238,.08);border-left:3px solid #b57bee;color:#d4a8ff}
.rdx-row{display:flex;gap:10px;flex-wrap:wrap;margin:8px 0}
.rdx-box{flex:1;min-width:155px;border-radius:9px;padding:13px 14px;border:1px solid #2e3347}
.rdx-box h5{font-size:12px;font-weight:700;margin:0 0 8px}
.rdx-box ul{list-style:none;padding:0;margin:0}
.rdx-box li{font-size:11px;color:#8b90a8;padding:3px 0 3px 14px;position:relative}
.rdx-box li::before{content:'▸';position:absolute;left:0;color:#555}
.rdx-box-b{border-color:rgba(79,142,247,.35);background:rgba(79,142,247,.05)}
.rdx-box-b h5{color:#7eb3ff}
.rdx-box-g{border-color:rgba(61,220,132,.3);background:rgba(61,220,132,.04)}
.rdx-box-g h5{color:#6ef5a8}
.rdx-box-p{border-color:rgba(181,123,238,.35);background:rgba(181,123,238,.04)}
.rdx-box-p h5{color:#d4a8ff}
.rdx-box-o{border-color:rgba(255,159,67,.3);background:rgba(255,159,67,.04)}
.rdx-box-o h5{color:#ffbb7a}
.rdx-box-y{border-color:rgba(255,209,102,.3);background:rgba(255,209,102,.04)}
.rdx-box-y h5{color:#ffe599}
.rdx-box-c{border-color:rgba(72,202,228,.3);background:rgba(72,202,228,.04)}
.rdx-box-c h5{color:#7be0f5}
.rdx-onion{display:flex;flex-direction:column;gap:6px}
.rdx-ol{border-radius:8px;padding:11px 14px;border:1px solid}
.rdx-ol-inner{margin:8px 0 2px 16px;display:flex;flex-direction:column;gap:6px}
.rdx-ol-lb{font-size:11px;font-weight:700}
.rdx-ol-d{font-size:11px;color:#8b90a8;margin-top:2px}
.rdx-ol-1{border-color:rgba(79,142,247,.4);background:rgba(79,142,247,.06)}
.rdx-ol-1 .rdx-ol-lb{color:#7eb3ff}
.rdx-ol-2{border-color:rgba(61,220,132,.35);background:rgba(61,220,132,.05)}
.rdx-ol-2 .rdx-ol-lb{color:#6ef5a8}
.rdx-ol-3{border-color:rgba(181,123,238,.35);background:rgba(181,123,238,.05)}
.rdx-ol-3 .rdx-ol-lb{color:#d4a8ff}
.rdx-ol-core{border-color:rgba(255,209,102,.4);background:rgba(255,209,102,.07)}
.rdx-ol-core .rdx-ol-lb{color:#ffe599}
.rdx-sig{display:inline-flex;gap:0;border-radius:6px;overflow:hidden;margin:8px 0 4px;font-family:'Cascadia Code','Fira Code',Consolas,monospace;font-size:11px}
.rdx-s1{background:rgba(79,142,247,.2);color:#7eb3ff;padding:5px 10px}
.rdx-sa{background:#1a1d27;color:#555;padding:5px 6px}
.rdx-s2{background:rgba(61,220,132,.15);color:#6ef5a8;padding:5px 10px}
.rdx-s3{background:rgba(181,123,238,.15);color:#d4a8ff;padding:5px 10px}
.rdx-s4{background:rgba(255,209,102,.12);color:#ffe599;padding:5px 10px}
.rdx-tag{display:inline-block;font-size:10px;font-weight:700;padding:1px 6px;border-radius:3px;margin-left:4px}
.rdx-tg-b{background:#4f8ef7;color:#fff}.rdx-tg-g{background:#3ddc84;color:#000}
.rdx-tg-p{background:#b57bee;color:#fff}.rdx-tg-y{background:#ffd166;color:#000}
</style>
````

---

#### 组件速查手册

所有组件都用 `<div class="rdx">...</div>` 包裹（替换 `rdx` 为当前前缀）。

**① 卡片容器 `rdx-card` + 标题 `rdx-title`**

```html
<div class="rdx-card">
  <div class="rdx-title">🔄 标题文字</div>
  <!-- 内容放在这里 -->
</div>
```

---

**② 横向流程图 `rdx-flow`** — 适合展示线性流程（如数据流、编译流程）

```html
<div class="rdx-flow">
  <div class="rdx-step rdx-step-b">步骤一<sub>副标题</sub></div>
  <div class="rdx-arr">→</div>
  <div class="rdx-step rdx-step-g">步骤二<sub>副标题</sub></div>
  <div class="rdx-arr">→</div>
  <div class="rdx-step rdx-step-p">步骤三<sub>副标题</sub></div>
</div>
```

颜色后缀：`-b`蓝 / `-g`绿 / `-p`紫 / `-y`黄 / `-o`橙 / `-c`青

---

**③ 竖向时间线 `rdx-tl` + `rdx-ti`** — 适合展示多步骤流程、生命周期阶段

```html
<div class="rdx-tl">
  <div class="rdx-ti b">
    <div class="rdx-tl-lb" style="color:#7eb3ff">① 步骤标题</div>
    <div class="rdx-tl-d">步骤说明文字</div>
  </div>
  <div class="rdx-ti g">
    <div class="rdx-tl-lb" style="color:#6ef5a8">② 步骤标题</div>
    <div class="rdx-tl-d">步骤说明文字</div>
  </div>
</div>
```

时间线节点颜色：`b`蓝 / `g`绿 / `p`紫 / `y`黄 / `o`橙 / `c`青

---

**④ 多列信息卡 `rdx-row` + `rdx-box`** — 适合 3~4 个并列概念对比

```html
<div class="rdx-row">
  <div class="rdx-box rdx-box-b">
    <h5>概念A</h5>
    <ul>
      <li>特点一</li>
      <li>特点二</li>
    </ul>
  </div>
  <div class="rdx-box rdx-box-g">
    <h5>概念B</h5>
    <ul><li>特点一</li></ul>
  </div>
</div>
```

盒子颜色后缀：`-b`蓝 / `-g`绿 / `-p`紫 / `-o`橙 / `-y`黄 / `-c`青

---

**⑤ 洋葱嵌套层 `rdx-onion`** — 适合展示中间件、包裹关系、嵌套结构

```html
<div class="rdx-onion">
  <div class="rdx-ol rdx-ol-1">
    <div class="rdx-ol-lb">外层</div>
    <div class="rdx-ol-d">说明</div>
    <div class="rdx-ol-inner">
      <div class="rdx-ol rdx-ol-2">
        <div class="rdx-ol-lb">内层</div>
        <div class="rdx-ol-inner">
          <div class="rdx-ol rdx-ol-core">
            <div class="rdx-ol-lb">⭐ 核心</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

层级颜色：`rdx-ol-1`蓝 / `rdx-ol-2`绿 / `rdx-ol-3`紫 / `rdx-ol-core`黄（核心）

---

**⑥ 彩色代码签名 `rdx-sig`** — 适合分解函数签名 / 语法结构

```html
<div class="rdx-sig">
  <div class="rdx-s1">参数1</div>
  <div class="rdx-sa">=></div>
  <div class="rdx-s2">参数2</div>
  <div class="rdx-sa">=></div>
  <div class="rdx-s3">参数3</div>
  <div class="rdx-sa">=></div>
  <div class="rdx-s4">{ 函数体 }</div>
</div>
```

---

**⑦ 注意事项块 `rdx-note`**

```html
<div class="rdx-note rdx-nb">💡 信息提示（蓝）</div>
<div class="rdx-note rdx-ng">✅ 正确做法（绿）</div>
<div class="rdx-note rdx-nr">⚠️ 警告错误（红）</div>
<div class="rdx-note rdx-ny">⚡ 注意事项（黄）</div>
<div class="rdx-note rdx-np">📌 补充说明（紫）</div>
```

---

#### 完整使用模板（可直接复用）

```markdown
<style>
/* 复制上方 CSS 模板，将所有 rdx- 替换为当前文件专属前缀 */
</style>

<div class="rdx">

<div class="rdx-card">
<div class="rdx-title">🔄 流程标题</div>

<!-- 横向流程图 -->
<div class="rdx-flow">
  <div class="rdx-step rdx-step-b">第一步<sub>说明</sub></div>
  <div class="rdx-arr">→</div>
  <div class="rdx-step rdx-step-g">第二步<sub>说明</sub></div>
</div>

<div class="rdx-note rdx-nb">补充说明</div>
</div>

<div class="rdx-card">
<div class="rdx-title">⚙️ 详细时间线</div>
<div class="rdx-tl">
  <div class="rdx-ti b">
    <div class="rdx-tl-lb" style="color:#7eb3ff">① 步骤一</div>
    <div class="rdx-tl-d">说明文字</div>
  </div>
  <div class="rdx-ti g">
    <div class="rdx-tl-lb" style="color:#6ef5a8">② 步骤二</div>
    <div class="rdx-tl-d">说明文字</div>
  </div>
</div>
</div>

</div>
```

---

### Step 4：执行写入

- **丰富已有题**：用 `replace_string_in_file` 在原答案中精准插入，包含足够上下文避免误匹配
- **新增题目**：插入到对应章节末尾（该章节最后一道 `---` 之后）

写入后确认文件更新成功，简要告知用户：
- 插入到哪个文件的哪个位置（题目名 or 章节名）
- 是「丰富」还是「新增」操作

若本次注入涉及**新增文件或新增导航条目**，自动触发 `nav-sync` Skill 同步首页目录与侧边栏配置。

---

## 注意事项

- **不简单堆叠**：新增内容要与原有内容互补，避免重复表述
- **不破坏原有格式**：只增不改，除非丰富已有答案需要重构结构
- **禁止分篇**：领域页不设「某某篇」二级分组，全部平铺为 Q&A 序列
- **按高频排序**：题目顺序以「面试出现频率」为准，高频靠前；重整已有文件时也遵此原则
- **中文回复**：所有说明和注释使用中文
- **主动优先**：技术对话中优先识别知识点，主动询问，不等用户说关键词
