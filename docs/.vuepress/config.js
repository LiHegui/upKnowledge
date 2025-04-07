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
        text: '实用工具链接',
        link: 'https://app.postdrop.io/',
      },
      {
        text: 'WebAPI',
        children: [
          'https://webapis-playground.vercel.app', 
          'https://vue3js.cn/interview/',
          'https://www.wangdoc.com/'
        ],
      },
    ],
  }),

  bundler: viteBundler(),
  plugins: [
    searchPlugin({
      // 基础配置
      placeholder: '搜索文档',
      hotKeys: ['s', '/'], // 触发搜索的快捷键
      maxSuggestions: 10, // 最大建议数
      locales: {
        '/': { placeholder: 'Search' },
        '/zh/': { placeholder: '搜索' },
      },
    }),
    mdEnhancePlugin({
      // 启用代码演示
      demo: true,
    }),
  ]
})
