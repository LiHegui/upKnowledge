/**|
 * 老版配置
 */
// import { defineUserConfig } from 'vuepress'
// import { defaultTheme } from '@vuepress/theme-default'
// import { searchPlugin } from '@vuepress/plugin-search'
// import { getDirname, path } from '@vuepress/utils'

// export default defineUserConfig({
//   lang: 'zh-CN',
//   charset: 'utf-8',
//   title: '升级打怪🎯',
//   description: '升职加薪',
//   port: 9000,
//   theme: defaultTheme({
//     navbar: [
//       {
//         text: '实用工具链接',
//         link: 'https://app.postdrop.io/',
//       },
//       {
//         text: 'WebAPI',
//         children: ['https://webapis-playground.vercel.app'],
//       },
//       '暂无',
//     ],
//   }),
//   plugins: [
//     searchPlugin({
//     }),
//   ],
// })


/**
 * 新版升级配置
 */

import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress/cli'
import { viteBundler } from '@vuepress/bundler-vite'
import { searchPlugin } from '@vuepress/plugin-search'
import { mdEnhancePlugin } from "vuepress-plugin-md-enhance";

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
        children: ['https://webapis-playground.vercel.app'],
      },
    ],
  }),

  bundler: viteBundler(),
  plugins: [
    ['@vuepress/search', {
      searchMaxSuggestions: 10
    }],
    searchPlugin({
      getExtraFields: (page) => page.frontmatter.tags ?? [],
    }),
    mdEnhancePlugin({
      // 启用代码演示
      demo: true,
    }),
  ]
})
