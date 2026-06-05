import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import FontSwitcher from '../components/FontSwitcher.vue'
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
    app.component('FontSwitcher', FontSwitcher)
    app.use(NolebaseGitChangelogPlugin)
  },
}
