import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import HomeContributors from './HomeContributors.vue'
import {
  NolebaseGitChangelogPlugin,
} from '@nolebase/vitepress-plugin-git-changelog/client'
import '@nolebase/vitepress-plugin-git-changelog/client/style.css'
import '@catppuccin/vitepress/theme/mocha/green.css'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('HomeContributors', HomeContributors)
    app.use(NolebaseGitChangelogPlugin)
  },
}
