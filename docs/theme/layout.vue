<script>
import ParentLayout from '@vuepress/theme-default/layouts/Layout.vue'
import SearchBox from '@SearchBox'

export default {
  components: { SearchBox }
}

</script>

<template>
  <ParentLayout>
    <template #page-bottom>
      <header>
        <SearchBox />
      </header>
    </template>
  </ParentLayout>
</template>

<style lang="css">
.my-footer {
  text-align: center;
}
</style>