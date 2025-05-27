<script setup lang="ts">
import { ref } from 'vue'
// 获取本地音视频流
// async function getLocalStream(constraints: MediaStreamConstraints) {
//   // 获取媒体流
//   const stream = await navigator.mediaDevices.getUserMedia(constraints)
//   // 将媒体流设置到 video 标签上播放
//   playLocalStream(stream)
// }

async function shareScreen() {
  let localStream = await navigator.mediaDevices.getDisplayMedia({
    audio: true,
    video: true,
  })
  // 播放本地视频流
  playStream(localStream)
}

// 播放本地视频流
function playStream(stream: MediaStream) {
  const videoEl = document.getElementById('localVideo') as HTMLVideoElement
  videoEl.srcObject = stream
}

shareScreen()

const imgList = ref<string[]>([])
// 拍照
function takePhoto() {
  const videoEl = document.getElementById('localVideo') as HTMLVideoElement
  const canvas = document.createElement('canvas')
  canvas.width = videoEl.videoWidth
  canvas.height = videoEl.videoHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height)
  imgList.value.push(canvas.toDataURL('image/png'))
  console.log('🚀🚀🚀 / imgList', imgList)

  // 添加滤镜
  const filterList = [
    'blur(5px)', // 模糊
    'brightness(0.5)', // 亮度
    'contrast(200%)', // 对比度
    'grayscale(100%)', // 灰度
    'hue-rotate(90deg)', // 色相旋转
    'invert(100%)', // 反色
    'opacity(90%)', // 透明度
    'saturate(200%)', // 饱和度
    'saturate(20%)', // 饱和度
    'sepia(100%)', // 褐色
    'drop-shadow(4px 4px 8px blue)', // 阴影
  ]

  for (let i = 0; i < filterList.length; i++) {
    ctx.filter = filterList[i]
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height)
    imgList.value.push(canvas.toDataURL('image/png'))
  }
}
</script>

<template>
  <main>
    <video id="localVideo" autoplay playsinline muted></video>
    <button @click="takePhoto">拍照</button>
    <div v-for="(item,index) in imgList" :key="index" class="item">
      <img :src="item" alt="" />
    </div>
  </main>
</template>
<style>
.item {
  display: flex;
}
</style>
