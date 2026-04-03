import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import FontSwitcher from '../components/FontSwitcher.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('FontSwitcher', FontSwitcher)
  },
}
