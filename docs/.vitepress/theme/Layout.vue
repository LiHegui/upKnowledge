<script setup>
import DefaultTheme from 'vitepress/theme'
import { NolebaseGitContributors } from '@nolebase/vitepress-plugin-git-changelog/client'
const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #nav-bar-content-after>
      <FontSwitcher />
    </template>
    <template #doc-footer-before>
      <div class="upk-contributors">
        <NolebaseGitContributors />
      </div>
    </template>
  </Layout>
</template>
