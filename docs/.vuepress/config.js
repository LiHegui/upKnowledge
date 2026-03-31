/**
 * 新版升级配置
 */
import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress/cli'
import { viteBundler } from '@vuepress/bundler-vite'
import { mdEnhancePlugin } from "vuepress-plugin-md-enhance";
import { searchPlugin } from '@vuepress/plugin-search'

export default defineUserConfig({
  lang: 'zh-CN',
  charset: 'utf-8',
  title: '升级打怪🎯',
  description: '升职加薪',
  base: "/upKnowledge/",
  theme: defaultTheme({
    navbar: [
      {
        text: '面试题',
        link: '/interview/',
      },
      {
        text: '知识库',
        link: '/interview/AnTd/',
      },
      {
        text: '工具合集',
        link: '/tools/routed',
      },
      {
        text: '外部资源',
        children: [
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
          text: '🎯 导航',
          collapsible: false,
          children: [
            '/interview/index.md',
            '/interview/自测系列.md',
            '/interview/必问面试题系列/index.md',
          ],
        },
        {
          text: '🤖 AI × 前端',
          collapsible: true,
          children: [
            '/interview/AI/index.md',
          ],
        },
        {
          text: '基础三件套',
          collapsible: true,
          children: [
            '/interview/HTML/html相关.md',
            '/interview/CSS/index.md',
            '/interview/CSS/sass和less.md',
            '/interview/CSS/style-components.md',
            '/interview/JavaScript/index.md',
            '/interview/ES6/router.md',
          ],
        },
        {
          text: 'TypeScript',
          collapsible: true,
          children: [
            '/interview/Ts/index.md',
            '/interview/Ts/类型/index.md',
            '/interview/Ts/接口/index.md',
            '/interview/Ts/类/index.md',
            '/interview/Ts/函数/index.md',
          ],
        },
        {
          text: 'Vue 生态',
          collapsible: true,
          children: [
            '/interview/Vue/vue.md',
            '/interview/Vue/AuthorityManagement.md',
            '/interview/Vue3/index.md',
            '/interview/Vue3/diff/index.md',
            '/interview/Vue3/性能提升/index.md',
            '/interview/Vue3/Treeshaking/index.md',
          ],
        },
        {
          text: 'React 生态',
          collapsible: true,
          children: [
            '/interview/React/index.md',
            '/interview/React/虚拟DOM/index.md',
            '/interview/React/DIff/index.md',
            '/interview/React/Redux/index.md',
            '/interview/React/知识库/Hooks/index.md',
            '/interview/React/知识库/React高阶组件/PureComponent.md',
            '/interview/React/Memo.md',
            '/interview/React/useEffect.md',
            '/interview/React/内置类型.md',
            '/interview/React/useContext.md',
            '/interview/React/useReducer.md',
            '/interview/React/unstated-next.md',
          ],
        },
        {
          text: '工程化',
          collapsible: true,
          children: [
            '/interview/Webpack/index.md',
            '/interview/Webpack/webpack基础配置.md',
            '/interview/Webpack/模块化/history.md',
            '/interview/Webpack/模块化/Rollup.md',
            '/interview/Webpack/模块化/进阶-搭建组件库.md',
            '/interview/Vite/index.md',
            '/interview/git/index.md',
            '/interview/git/知识库/git.md',
          ],
        },
        {
          text: '服务端 & 运维',
          collapsible: true,
          children: [
            '/interview/Node/index.md',
            '/interview/Node/nodemailer.md',
            '/interview/Node/server-准备工作.md',
            '/interview/Node/server-deploy.md',
            '/interview/Nginx/index.md',
            '/interview/Linux/index.md',
          ],
        },
        {
          text: '浏览器 & 网络',
          collapsible: true,
          children: [
            '/interview/网络/index.md',
            '/interview/浏览器/index.md',
            '/interview/浏览器/浏览器缓存.md',
            '/interview/操作系统/index.md',
          ],
        },
        {
          text: '深入专题',
          collapsible: true,
          children: [
            '/interview/性能优化/index.md',
            '/interview/设计模式/index.md',
            '/interview/算法Code/index.md',
            '/interview/前端登录/登录的实现.md',
          ],
        },
        {
          text: '解决方案',
          collapsible: true,
          children: [
            '/interview/解决方案/大文件断点续传/index.md',
            '/interview/解决方案/JWT登录方案/index.md',
            '/interview/解决方案/移动端适配/index.md',
            '/interview/解决方案/前端工程化/index.md',
          ],
        },
        // ────────── 进阶专题 ──────────
        {
          text: 'AnTd 组件库',
          collapsible: true,
          children: [
            '/interview/AnTd/index.md',
            '/interview/AnTd/Button.md',
          ],
        },
        {
          text: '微前端',
          collapsible: true,
          children: [
            '/interview/微前端/index.md',
          ],
        },
        {
          text: '微信小程序（原生）',
          collapsible: true,
          children: [
            '/interview/微信小程序（原生）/route.md',
            '/interview/微信小程序（原生）/media.md',
            '/interview/微信小程序（原生）/权限.md',
          ],
        },
        {
          text: 'Gatsby',
          collapsible: true,
          children: [
            '/interview/Gastby/Gastby.md',
            '/interview/Gastby/GraphQL.md',
            '/interview/Gastby/QueryingData.md',
            '/interview/Gastby/route.md',
            '/interview/Gastby/ImagesAndMedia.md',
            '/interview/Gastby/plugin.md',
            '/interview/Gastby/Router_20230802.md',
            '/interview/Gastby/API/built_in_api.md',
            '/interview/Gastby/API/CreatePage.md',
            '/interview/Gastby/plugins/gatsby-source-filesystem.md',
          ],
        },
        {
          text: 'Web3D / Three.js',
          collapsible: true,
          children: [
            '/interview/Web3D/three.md',
          ],
        },
      ],

      // ────────── 工具合集模块 ──────────
      '/tools/': [
        {
          text: '🔧 工具合集',
          collapsible: false,
          children: [
            '/tools/routed.md',
          ],
        },
      ],

      // ────────── 性能优化模块 ──────────
      '/optimization/': [
        {
          text: '⚡ 性能优化',
          collapsible: false,
          children: [
            '/optimization/加载图片优化策略.md',
          ],
        },
      ],
    },
  }),

  bundler: viteBundler(),
  plugins: [
    searchPlugin({
      hotKeys: ['s', '/'],
      maxSuggestions: 10,
      locales: {
        '/': {
          placeholder: '🔍 搜索',
        },
      },
    }),
    mdEnhancePlugin({
      // 启用代码演示
      demo: true,
    }),
  ]
})
