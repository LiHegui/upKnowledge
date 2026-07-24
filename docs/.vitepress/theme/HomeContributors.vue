<script setup>
import { ref } from 'vue'
import { data as contributors } from './contributors.data.js'

const failed = ref({})
function onErr(name) {
  failed.value = { ...failed.value, [name]: true }
}
</script>

<template>
  <div class="upk-contrib" v-if="contributors.length">
    <h2 class="upk-contrib__title">🛠️ 参与维护</h2>
    <p class="upk-contrib__sub">感谢每一位提交者，一起把这座知识库堆得更高</p>
    <div class="upk-contrib__list">
      <component
        :is="c.link ? 'a' : 'div'"
        v-for="c in contributors"
        :key="c.name"
        class="upk-contrib__item"
        :href="c.link"
        :target="c.link ? '_blank' : undefined"
        rel="noreferrer"
      >
        <img
          v-if="!failed[c.name]"
          class="upk-contrib__avatar"
          :src="c.avatar"
          :alt="c.name"
          loading="lazy"
          @error="onErr(c.name)"
        />
        <span v-else class="upk-contrib__avatar upk-contrib__initial">
          {{ c.name.charAt(0).toUpperCase() }}
        </span>
        <span class="upk-contrib__meta">
          <span class="upk-contrib__name">{{ c.name }}</span>
          <span class="upk-contrib__count">{{ c.count }} commits</span>
        </span>
      </component>
    </div>
  </div>
</template>
