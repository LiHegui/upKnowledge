import { defineClientConfig } from 'vuepress/client'
import FontSwitcher from './components/FontSwitcher.vue'
import Layout from './layouts/Layout.vue'

export default defineClientConfig({
  enhance({ app }) {
    app.component('FontSwitcher', FontSwitcher)
  },
  layouts: {
    Layout,
  },
})
