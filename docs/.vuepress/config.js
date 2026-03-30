/**
 * 新版升级配置
 */
import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress/cli'
import { viteBundler } from '@vuepress/bundler-vite'
import { mdEnhancePlugin } from "vuepress-plugin-md-enhance";
import { searchProPlugin } from 'vuepress-plugin-search-pro'

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
        link: '/repository/React/',
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
          text: '基础三件套',
          collapsible: true,
          children: [
            '/interview/HTML/html相关.md',
            '/interview/CSS/index.md',
            '/interview/CSS/sass和less.md',
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
          ],
        },
        {
          text: '工程化',
          collapsible: true,
          children: [
            '/interview/Webpack/index.md',
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
      ],

      // ────────── 知识库模块 ──────────
      '/repository/': [
        {
          text: 'React 生态',
          collapsible: true,
          children: [
            '/repository/React/index.md',
            '/repository/React/Memo.md',
            '/repository/React/PureComponent.md',
            '/repository/React/useEffect.md',
            '/repository/React/内置类型.md',
            '/repository/React/React基础知识/index.md',
            '/repository/React/React基础知识/ReactHooks.md',
            '/repository/React/国际化方案/i18n.md',
            '/repository/React/状态管理/unstated-next.md',
            '/repository/API/useContext.md',
            '/repository/API/useReducer.md',
            '/repository/AnTd/index.md',
            '/repository/AnTd/Button.md',
            '/repository/redux源码解析/index.md',
          ],
        },
        {
          text: 'Vue 生态',
          collapsible: true,
          children: [
            '/repository/Vue/route.md',
            '/repository/Vue/AuthorityManagement.md',
          ],
        },
        {
          text: 'CSS 进阶',
          collapsible: true,
          children: [
            '/repository/Css/routed.md',
            '/repository/Css/style-components.md',
          ],
        },
        {
          text: '模块化 & 工程化',
          collapsible: true,
          children: [
            '/repository/模块化/history.md',
            '/repository/模块化/Rollup.md',
            '/repository/模块化/route.md',
            '/repository/模块化/进阶-搭建组件库.md',
            '/repository/Webpack/index.md',
            '/repository/Webpack/webpack学习（一）基本配置.md',
          ],
        },
        {
          text: '微前端 & 小程序',
          collapsible: true,
          children: [
            '/repository/微前端/routed.md',
            '/repository/微信小程序（原生）/route.md',
            '/repository/微信小程序（原生）/media.md',
            '/repository/微信小程序（原生）/权限.md',
          ],
        },
        {
          text: 'Node & 服务端',
          collapsible: true,
          children: [
            '/repository/Node/中间件/nodemailer.md',
            '/repository/server/准备工作.md',
            '/repository/server/deploy.md',
            '/repository/server/route.md',
          ],
        },
        {
          text: 'Linux',
          collapsible: true,
          children: [
            '/repository/Linux/快速掌握基础.md',
            '/repository/Linux/route.md',
          ],
        },
        {
          text: 'Gatsby',
          collapsible: true,
          children: [
            '/repository/Gastby/Gastby.md',
            '/repository/Gastby/GraphQL.md',
            '/repository/Gastby/QueryingData.md',
            '/repository/Gastby/route.md',
            '/repository/Gastby/ImagesAndMedia.md',
            '/repository/Gastby/plugin.md',
            '/repository/Gastby/Router_20230802.md',
            '/repository/Gastby/API/built_in_api.md',
            '/repository/Gastby/API/CreatePage.md',
            '/repository/Gastby/plugins/gatsby-source-filesystem.md',
          ],
        },
        {
          text: 'Web3D',
          collapsible: true,
          children: [
            '/repository/Web3D/three.md',
          ],
        },
        {
          text: '📥 待整理',
          collapsible: true,
          children: [
            '/repository/需要整理的资料/index.md',
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
    searchProPlugin({
      // 索引全部内容（包括正文）
      indexContent: true,
      // 搜索热键
      hotKeys: [{ key: 'k', ctrl: true }, '/'],
      // 自定义搜索项目
      customFields: [
        {
          // 索引 frontmatter 中的 tag 字段
          getter: (page) => page.frontmatter.tag,
          formatter: '标签：$content',
        },
      ],
      locales: {
        '/': {
          placeholder: '🔍 搜索文档（Ctrl+K）',
        },
      },
    }),
    mdEnhancePlugin({
      // 启用代码演示
      demo: true,
    }),
  ]
})
