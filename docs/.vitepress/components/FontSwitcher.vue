<template>
  <div class="font-switcher" ref="switcherRef">
    <button class="font-switcher__trigger" @click="toggleMenu" :title="current.label">
      <span class="font-switcher__icon">字</span>
      <span class="font-switcher__name">{{ current.label }}</span>
      <span class="font-switcher__arrow" :class="{ open: menuOpen }">▾</span>
    </button>
    <transition name="font-menu">
      <ul v-if="menuOpen" class="font-switcher__menu">
        <li
          v-for="font in fonts"
          :key="font.value"
          class="font-switcher__item"
          :class="{ active: font.value === currentFont }"
          :style="{ fontFamily: font.preview }"
          @click="selectFont(font.value)"
        >
          {{ font.label }}
          <span v-if="font.value === currentFont" class="font-switcher__check">✓</span>
        </li>
      </ul>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const fonts = [
  { value: 'system',    label: '系统默认', preview: '-apple-system, BlinkMacSystemFont, sans-serif' },
  { value: 'fangsong',  label: '仿宋',     preview: 'FangSong, STFangSong, 仿宋, fangsong, serif' },
  { value: 'songti',    label: '宋体',     preview: 'SimSun, STSong, 宋体, serif' },
  { value: 'heiti',     label: '黑体',     preview: 'SimHei, STHeiti, 黑体, sans-serif' },
  { value: 'kaiti',     label: '楷体',     preview: 'KaiTi, STKaiti, 楷体, cursive' },
  { value: 'yahei',     label: '微软雅黑', preview: '"Microsoft YaHei", "PingFang SC", sans-serif' },
  { value: 'mono',      label: '等宽',     preview: '"JetBrains Mono", "Fira Code", Consolas, monospace' },
]

const STORAGE_KEY = 'upknowledge-font'
const currentFont = ref('fangsong')
const menuOpen = ref(false)
const switcherRef = ref(null)

const current = computed(() => fonts.find(f => f.value === currentFont.value) || fonts[0])

const fontMap = {
  system:   '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fangsong: 'FangSong, STFangSong, 仿宋, FangSong_GB2312, fangsong, serif',
  songti:   'SimSun, STSong, 宋体, NSimSun, serif',
  heiti:    'SimHei, STHeiti, 黑体, sans-serif',
  kaiti:    'KaiTi, STKaiti, 楷体, KaiTi_GB2312, cursive',
  yahei:    '"Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", sans-serif',
  mono:     '"JetBrains Mono", "Fira Code", Consolas, "Courier New", monospace',
}

function applyFont(value) {
  document.documentElement.style.setProperty('--custom-font-family', fontMap[value] || fontMap.fangsong)
}

function selectFont(value) {
  currentFont.value = value
  applyFont(value)
  localStorage.setItem(STORAGE_KEY, value)
  menuOpen.value = false
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function handleClickOutside(e) {
  if (switcherRef.value && !switcherRef.value.contains(e.target)) {
    menuOpen.value = false
  }
}

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY) || 'fangsong'
  currentFont.value = saved
  applyFont(saved)
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.font-switcher {
  position: relative;
  display: inline-flex;
  align-items: center;
  margin: 0 8px;
}

.font-switcher__trigger {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: 1px solid var(--vp-c-border, #ddd);
  border-radius: 6px;
  background: var(--vp-c-bg, #fff);
  color: var(--vp-c-text-1, #333);
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  transition: border-color 0.2s, background 0.2s;
}

.font-switcher__trigger:hover {
  border-color: var(--vp-c-brand-1, #3eaf7c);
  color: var(--vp-c-brand-1, #3eaf7c);
}

.font-switcher__icon {
  font-size: 15px;
  font-weight: bold;
}

.font-switcher__arrow {
  font-size: 11px;
  transition: transform 0.2s;
  display: inline-block;
}
.font-switcher__arrow.open {
  transform: rotate(180deg);
}

.font-switcher__menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  min-width: 130px;
  background: var(--vp-c-bg, #fff);
  border: 1px solid var(--vp-c-border, #ddd);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  padding: 4px 0;
  list-style: none;
  margin: 0;
  z-index: 9999;
}

.font-switcher__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  font-size: 14px;
  cursor: pointer;
  color: var(--vp-c-text-1, #333);
  transition: background 0.15s;
  white-space: nowrap;
}

.font-switcher__item:hover {
  background: var(--vp-c-bg-soft, #f5f5f5);
}

.font-switcher__item.active {
  color: var(--vp-c-brand-1, #3eaf7c);
  font-weight: bold;
}

.font-switcher__check {
  font-size: 12px;
  margin-left: 8px;
}

/* 下拉动画 */
.font-menu-enter-active,
.font-menu-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}
.font-menu-enter-from,
.font-menu-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
