<script setup>
import DefaultThemeLayout from '@vuepress/theme-default/lib/client/layouts/Layout.vue'
</script>

<template>
  <DefaultThemeLayout>
    <template #navbar-after>
      <FontSwitcher />
    </template>
  </DefaultThemeLayout>
</template>
