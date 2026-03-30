# upKnowledge — GitHub Copilot 全局指令

本文件为 upKnowledge 项目的 Copilot 全局行为规范，适用于所有对话。

---

## 主入口规则

**当用户说以下关键词时，必须切换到「主菜单」Agent，展示模式选择菜单：**

- `开始` / `开始吧` / `start`
- `你好` / `hello` / `hi`
- `帮我` / `帮助` / `help`
- `菜单` / `选择模式` / `切换模式` / `返回菜单`

详细行为定义见 `.github/agents/main.agent.md`。

---

## 可用模式一览

| 模式 | Agent 文件 | 适用场景 |
|------|-----------|---------|
| 🛠️ 开发模式 | `.github/agents/dev-mode.agent.md` | 开发功能、新增内容、修复问题 |
| 🎤 面试官模式 | `.github/agents/interviewer.agent.md` | 模拟面试、练习题库 |
| 📚 题库维护模式 | `.github/agents/qa-maintain.agent.md` | 维护题目、更新答案 |

---

## 项目背景

- 项目名：**upKnowledge** — 前端工程师个人知识库 + 文档站
- 技术栈：VuePress 2.x + GitHub Pages
- 架构文档：`ARCHITECTURE.md`（每次开发任务前必须先读取）
- 面试题库：`docs/interview/` 目录下各技术方向 Markdown 文件

---

## 通用规范

- 所有回复使用**中文**
- 代码块必须标注语言类型
- 不得删除或覆盖已有内容（除非用户明确要求）
