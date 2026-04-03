import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: '升级打怪🎯',
  description: '升职加薪',
  base: '/upKnowledge/',
  ignoreDeadLinks: true,

  themeConfig: {
    nav: [
      { text: '面试题', link: '/interview/' },
      { text: '知识库', link: '/interview/AnTd/' },
      { text: '工具合集', link: '/tools/routed' },
      {
        text: '外部资源',
        items: [
          { text: '邮件测试 Postdrop', link: 'https://app.postdrop.io/' },
          { text: 'WebAPIs Playground', link: 'https://webapis-playground.vercel.app' },
          { text: 'Vue3 面试题参考', link: 'https://vue3js.cn/interview/' },
          { text: '阮一峰文档', link: 'https://www.wangdoc.com/' },
        ],
      },
    ],

    sidebar: {
      // ────────── 面试题模块 ──────────
      '/interview/': [
        {
          text: '📝 必刷特辑',
          collapsed: false,
          items: [
            { text: '手撕代码系列', link: '/interview/自测系列' },
          ],
        },
        {
          text: '🤖 AI × 前端',
          collapsed: true,
          items: [
            { text: 'AI × 前端面试题', link: '/interview/AI/' },
          ],
        },
        {
          text: '基础三件套',
          collapsed: true,
          items: [
            { text: 'HTML', link: '/interview/HTML/html相关' },
            { text: 'CSS', link: '/interview/CSS/' },
            { text: 'Sass & Less', link: '/interview/CSS/sass和less' },
            { text: 'styled-components', link: '/interview/CSS/style-components' },
            { text: 'JavaScript', link: '/interview/JavaScript/' },
          ],
        },
        {
          text: 'TypeScript',
          collapsed: true,
          items: [
            { text: 'TypeScript 概览', link: '/interview/Ts/' },
            { text: '类型', link: '/interview/Ts/类型/' },
            { text: '接口', link: '/interview/Ts/接口/' },
            { text: '类', link: '/interview/Ts/类/' },
            { text: '函数', link: '/interview/Ts/函数/' },
          ],
        },
        {
          text: 'Vue 生态',
          collapsed: true,
          items: [
            { text: 'Vue2', link: '/interview/Vue/vue' },
            { text: '权限管理', link: '/interview/Vue/AuthorityManagement' },
            { text: 'Vue3', link: '/interview/Vue3/' },
            { text: 'Vue3 Diff 算法', link: '/interview/Vue3/diff/' },
            { text: 'Vue3 性能提升', link: '/interview/Vue3/性能提升/' },
            { text: 'Tree-shaking', link: '/interview/Vue3/Treeshaking/' },
          ],
        },
        {
          text: 'React 生态',
          collapsed: true,
          items: [
            { text: 'React', link: '/interview/React/' },
          ],
        },
        {
          text: '工程化',
          collapsed: true,
          items: [
            { text: 'Webpack', link: '/interview/Webpack/' },
            { text: 'Webpack 基础配置', link: '/interview/Webpack/webpack基础配置' },
            { text: '模块化 History', link: '/interview/Webpack/模块化/history' },
            { text: 'Rollup', link: '/interview/Webpack/模块化/Rollup' },
            { text: '进阶-搭建组件库', link: '/interview/Webpack/模块化/进阶-搭建组件库' },
            { text: 'Vite', link: '/interview/Vite/' },
            { text: 'Git', link: '/interview/git/' },
          ],
        },
        {
          text: '服务端 & 运维',
          collapsed: true,
          items: [
            { text: 'Node.js', link: '/interview/Node/' },
            { text: 'Nodemailer', link: '/interview/Node/nodemailer' },
            { text: 'Server 准备工作', link: '/interview/Node/server-准备工作' },
            { text: 'Server 部署', link: '/interview/Node/server-deploy' },
            { text: 'Nginx', link: '/interview/Nginx/' },
            { text: 'Linux', link: '/interview/Linux/' },
          ],
        },
        {
          text: '浏览器 & 网络',
          collapsed: true,
          items: [
            { text: '网络', link: '/interview/网络/' },
            { text: '浏览器', link: '/interview/浏览器/' },
            { text: '浏览器缓存', link: '/interview/浏览器/浏览器缓存' },
            { text: '操作系统', link: '/interview/操作系统/' },
          ],
        },
        {
          text: '深入专题',
          collapsed: true,
          items: [
            { text: '性能优化', link: '/interview/性能优化/' },
            { text: '设计模式', link: '/interview/设计模式/' },
            { text: '算法 Code', link: '/interview/算法Code/' },
            { text: '前端登录', link: '/interview/前端登录/登录的实现' },
          ],
        },
        {
          text: '解决方案',
          collapsed: true,
          items: [
            { text: '大文件断点续传', link: '/interview/解决方案/大文件断点续传/' },
            { text: 'JWT 登录方案', link: '/interview/解决方案/JWT登录方案/' },
            { text: '移动端适配', link: '/interview/解决方案/移动端适配/' },
            { text: '前端工程化', link: '/interview/解决方案/前端工程化/' },
          ],
        },
        {
          text: 'AnTd 组件库',
          collapsed: true,
          items: [
            { text: 'AnTd 概览', link: '/interview/AnTd/' },
            { text: 'Button', link: '/interview/AnTd/Button' },
          ],
        },
        {
          text: '微前端',
          collapsed: true,
          items: [
            { text: '微前端', link: '/interview/微前端/' },
          ],
        },
        {
          text: '微信小程序（原生）',
          collapsed: true,
          items: [
            { text: '路由', link: '/interview/微信小程序（原生）/route' },
            { text: '媒体', link: '/interview/微信小程序（原生）/media' },
            { text: '权限', link: '/interview/微信小程序（原生）/权限' },
          ],
        },
        {
          text: 'Gatsby',
          collapsed: true,
          items: [
            { text: 'Gatsby', link: '/interview/Gastby/Gastby' },
            { text: 'GraphQL', link: '/interview/Gastby/GraphQL' },
            { text: 'Querying Data', link: '/interview/Gastby/QueryingData' },
            { text: 'Route', link: '/interview/Gastby/route' },
            { text: 'Images & Media', link: '/interview/Gastby/ImagesAndMedia' },
            { text: 'Plugin', link: '/interview/Gastby/plugin' },
            { text: 'Router 2023', link: '/interview/Gastby/Router_20230802' },
            { text: 'Built-in API', link: '/interview/Gastby/API/built_in_api' },
            { text: 'CreatePage', link: '/interview/Gastby/API/CreatePage' },
            { text: 'gatsby-source-filesystem', link: '/interview/Gastby/plugins/gatsby-source-filesystem' },
          ],
        },
        {
          text: 'Web3D / Three.js',
          collapsed: true,
          items: [
            { text: 'Three.js', link: '/interview/Web3D/three' },
          ],
        },
      ],

      // ────────── 工具合集模块 ──────────
      '/tools/': [
        {
          text: '🔧 工具合集',
          collapsed: false,
          items: [
            { text: '路由工具', link: '/tools/routed' },
          ],
        },
      ],

      // ────────── 性能优化模块 ──────────
      '/optimization/': [
        {
          text: '⚡ 性能优化',
          collapsed: false,
          items: [
            { text: '加载图片优化策略', link: '/optimization/加载图片优化策略' },
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

    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
  },
})
