import { defineConfig } from 'vitepress'
import { GitChangelog } from '@nolebase/vitepress-plugin-git-changelog/vite'

// ────────── 后端侧边栏（复用于 /backend/ 及后端专属的 /frontend/xxx/ 路径）──────────
const backendSidebar = [
  {
    text: '🗄️ 数据库',
    collapsed: false,
    items: [
      { text: 'MySQL', link: '/backend/MySQL/' },
    ],
  },
  {
    text: '⚡ 缓存',
    collapsed: false,
    items: [
      { text: 'Redis 速通', link: '/backend/Redis/' },
    ],
  },
  {
    text: '🟢 Node.js 服务端',
    collapsed: false,
    items: [
      { text: 'Node.js 核心', link: '/backend/Node/' },
      { text: 'Nodemailer', link: '/backend/Node/nodemailer' },
      { text: 'Server 准备工作', link: '/backend/Node/server-准备工作' },
      { text: 'Server 部署实战', link: '/backend/Node/server-deploy' },
    ],
  },
  {
    text: '🌐 网络 & 协议',
    collapsed: false,
    items: [
      { text: '网络', link: '/backend/网络/' },
      { text: 'WebSocket 专题', link: '/backend/网络/WebSocket' },
    ],
  },
  {
    text: '🖥️ 运维 & 基础设施',
    collapsed: false,
    items: [
      { text: 'Linux 常用命令', link: '/backend/Linux/' },
      { text: 'Nginx', link: '/backend/Nginx/' },
      { text: 'Docker 速通', link: '/backend/Docker/' },
      { text: 'CI/CD', link: '/backend/CICD/' },
      { text: '操作系统', link: '/backend/操作系统/' },
    ],
  },
]

// ────────── 前端侧边栏（仅前端相关内容）──────────
const frontendSidebar = [
  // {
  //   text: '📝 必刷特辑',
  //   collapsed: false,
  //   items: [
  //     { text: '笔试系列', link: '/frontend/笔试系列' },
  //     { text: '📌 待复习（10题）', link: '/frontend/待整理/面试题整理-待复习' },
  //     { text: '📌 待复习 II（4题）', link: '/frontend/待整理/面试题整理-待复习2' },
  //     { text: '📌 高德地图模块设计', link: '/frontend/待整理/gaodemap-design' },
  //     { text: '📌 信号实时可视化设计', link: '/frontend/待整理/signal-view-design' },
  //     { text: '📌 开环验证模块设计', link: '/frontend/待整理/special-verification-design' },
  //   ],
  // },
  {
    text: '🤖 AI × 前端',
    collapsed: true,
    items: [
      { text: 'AI × 前端技术要点', link: '/frontend/AI/' },
      { text: '构建 AI Agent', link: '/frontend/AI/agent' },
      { text: '构建 AI Workflow', link: '/frontend/AI/workflow' },
    ],
  },
  {
    text: '基础三件套',
    collapsed: true,
    items: [
      { text: 'HTML', link: '/frontend/HTML/html相关' },
      { text: 'CSS', link: '/frontend/CSS/' },
      { text: 'styled-components', link: '/frontend/CSS/style-components' },
      { text: 'JavaScript', link: '/frontend/JavaScript/' },
    ],
  },
  {
    text: 'TypeScript',
    collapsed: true,
    items: [
      { text: 'TypeScript 概览', link: '/frontend/Ts/' },
      { text: 'TS 与项目结合', link: '/frontend/Ts/与项目结合/' },
      { text: '类型体操 100 题', link: '/frontend/Ts/强化训练-100题' },
    ],
  },
  {
    text: 'Vue 生态',
    collapsed: true,
    items: [
      {
        text: 'Vue2',
        collapsed: true,
        items: [
          { text: 'Vue2 核心', link: '/frontend/Vue/vue' },
          { text: '权限管理', link: '/frontend/Vue/AuthorityManagement' },
        ],
      },
      {
        text: 'Vue3',
        collapsed: true,
        items: [
          { text: 'Vue3 核心', link: '/frontend/Vue3/' },
          { text: 'Diff 算法', link: '/frontend/Vue3/diff/' },
          { text: 'Tree-shaking', link: '/frontend/Vue3/Treeshaking/' },
          { text: 'Pinia 完全指南', link: '/frontend/Vue3/pinia/' },
        ],
      },
    ],
  },
  {
    text: 'React 生态',
    collapsed: true,
    items: [
      { text: 'React', link: '/frontend/React/' },
      { text: 'React 渲染行为完全指南', link: '/frontend/React/react-rendering-behavior' },
      { text: 'Fiber 架构与 Diff 算法深度解析', link: '/frontend/React/fiber-diff' },
      { text: 'React 性能优化完全指南', link: '/frontend/React/react-性能优化' },
      { text: 'Redux 完全指南', link: '/frontend/React/redux' },
      { text: 'MobX 完全指南', link: '/frontend/React/mobx' },
    ],
  },
  {
    text: '工程化',
    collapsed: true,
    items: [
      { text: 'Webpack', link: '/frontend/Webpack/' },
      { text: 'Webpack 基础配置', link: '/frontend/Webpack/webpack基础配置' },
      { text: '模块化 History', link: '/frontend/Webpack/模块化/history' },
      { text: 'Rollup', link: '/frontend/Webpack/模块化/Rollup' },
      { text: '进阶-搭建组件库', link: '/frontend/Webpack/模块化/进阶-搭建组件库' },
      { text: 'Vite', link: '/frontend/Vite/' },
      { text: 'Git', link: '/frontend/git/' },
    ],
  },
  {
    text: '浏览器',
    collapsed: true,
    items: [
      { text: '浏览器', link: '/frontend/浏览器/' },
    ],
  },
  {
    text: '深入专题 & 解决方案',
    collapsed: true,
    items: [
      { text: '性能优化', link: '/frontend/性能优化/' },
      { text: '设计模式', link: '/frontend/设计模式/' },
      { text: '前端登录', link: '/frontend/前端登录/登录的实现' },
      { text: '大文件断点续传', link: '/frontend/解决方案/大文件断点续传/' },
      { text: 'JWT 登录方案', link: '/frontend/解决方案/JWT登录方案/' },
      { text: '移动端适配', link: '/frontend/解决方案/移动端适配/' },
      { text: '前端工程化', link: '/frontend/解决方案/前端工程化/' },
      { text: '实时协同系统', link: '/frontend/解决方案/实时协同系统/' },
      { text: '虚拟列表', link: '/frontend/解决方案/虚拟列表/' },
    ],
  },
  {
    text: 'ECharts 可视化',
    collapsed: true,
    items: [
      { text: 'ECharts 技术要点', link: '/frontend/ECharts/' },
    ],
  },
  {
    text: 'AnTd 组件库',
    collapsed: true,
    items: [
      { text: 'AnTd 概览', link: '/frontend/AnTd/' },
      { text: 'Button', link: '/frontend/AnTd/Button' },
    ],
  },
  {
    text: '微前端',
    collapsed: true,
    items: [
      { text: '微前端', link: '/frontend/微前端/' },
    ],
  },
  {
    text: '微信小程序（原生）',
    collapsed: true,
    items: [
      { text: '路由', link: '/frontend/微信小程序（原生）/route' },
      { text: '媒体', link: '/frontend/微信小程序（原生）/media' },
      { text: '权限', link: '/frontend/微信小程序（原生）/权限' },
    ],
  },
  {
    text: '🎨 可视化 & 图形',
    collapsed: true,
    items: [
      { text: 'Canvas 技术要点', link: '/frontend/Canvas/' },
      { text: 'Canvas · 点云大数据渲染', link: '/frontend/Canvas/点云大数据渲染' },
      { text: 'ECharts 技术要点', link: '/frontend/ECharts/' },
      { text: '高德地图 技术要点', link: '/frontend/高德地图/' },
      { text: 'Three.js', link: '/frontend/Web3D/three' },
    ],
  },
]

export default defineConfig({
  lang: 'zh-CN',
  title: '升级打怪🎯',
  description: '升职加薪',
  base: '/upKnowledge/',
  ignoreDeadLinks: true,
  lastUpdated: true,

  vite: {
    plugins: [
      GitChangelog({
        // 仓库地址，用于头像与提交链接跳转
        repoURL: () => 'https://github.com/LiHegui/upKnowledge',
        // git 作者名 → GitHub 用户名映射（命中后显示 GitHub 头像并跳转）
        mapAuthors: [
          { name: 'Hegui Li', username: 'LiHegui', mapByNameAliases: ['Hegui L', 'LiHegui'] },
        ],
      }),
    ],
  },

  markdown: {
    theme: {
      light: 'catppuccin-latte',
      dark: 'catppuccin-mocha',
    },
  },

  themeConfig: {
    nav: [
      { text: '前端知识库', link: '/frontend/' },
      { text: '后端知识库', link: '/backend/' },
      { text: '面经', link: '/面经/' },
      { text: '更新日志', link: '/changelog' },
      {
        text: '外部资源',
        items: [
          { text: '邮件测试 Postdrop', link: 'https://app.postdrop.io/' },
          { text: 'WebAPIs Playground', link: 'https://webapis-playground.vercel.app' },
          { text: 'Vue3 面试题参考', link: 'https://vue3js.cn/frontend/' },
          { text: '阮一峰文档', link: 'https://www.wangdoc.com/' },
        ],
      },
    ],

    sidebar: {
      // ────────── 后端专属路径 → 后端侧边栏 ──────────
      '/backend/': backendSidebar,

      // ────────── 前端路径 → 前端侧边栏 ──────────
      '/frontend/': frontendSidebar,
      '/optimization/': frontendSidebar,

      // ────────── 面经（前后端共用，独立台账）──────────
      '/面经/': [
        {
          text: '📝 面经',
          collapsed: false,
          items: [
            { text: '总览', link: '/面经/' },
            { text: 'LHG', link: '/面经/LHG' },
            { text: 'SLP', link: '/面经/SLP' },
          ],
        },
      ],


      '/tools/': [
        {
          text: '🔧 工具合集',
          collapsed: false,
          items: [
            { text: '路由工具', link: '/tools/routed' },
          ],
        },
      ],
    },

    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '🔍 搜索',
                buttonAriaLabel: '搜索',
              },
              modal: {
                noResultsText: '未找到相关结果',
                resetButtonTitle: '清除搜索条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭',
                },
              },
            },
          },
        },
      },
    },

    outline: {
      level: [2, 3],
      label: '本页目录',
    },

    docFooter: {
      prev: '上一页',
      next: '下一页',
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short',
      },
    },

    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
  },
})
