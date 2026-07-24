# 大文件断点续传

> 面试高频题：前端如何处理大文件上传？如何实现断点续传？

---

## Q: 大文件上传的核心思路是什么？

**A:**

大文件上传的核心是**分片（Chunking）**：将大文件分割为若干小块，并发上传各分片，全部上传完成后服务器合并。

**基本流程：**

```
大文件
  ↓ 切片（Blob.slice）
分片列表 [chunk0, chunk1, chunk2, ...]
  ↓ 并发上传（FormData）
服务器逐片接收 → 临时存储
  ↓ 全部上传完成
服务器合并 → 完整文件
```

---

## Q: 前端如何实现文件切片？

**A:**

使用 `File.slice()` 方法（File 继承自 Blob）将文件切成固定大小的块：

```js
const CHUNK_SIZE = 5 * 1024 * 1024  // 5MB 一片

function createChunks(file) {
  const chunks = []
  let start = 0

  while (start < file.size) {
    const end = Math.min(start + CHUNK_SIZE, file.size)
    chunks.push({
      chunk: file.slice(start, end),  // Blob.slice
      index: chunks.length,
      start,
      end,
    })
    start = end
  }

  return chunks
}
```

---

## Q: 如何实现断点续传？

**A:**

**断点续传**的核心是：页面刷新或上传中断后，重新上传时能**跳过已上传的分片**，只上传剩余部分。

**实现步骤：**

**1. 计算文件唯一标识（Hash）**

用文件内容的 Hash 作为唯一 ID，避免同名文件相互干扰：

```js
// 使用 spark-md5 计算文件 hash（在 Web Worker 中执行，避免阻塞主线程）
import SparkMD5 from 'spark-md5'

async function calcFileHash(file) {
  return new Promise((resolve) => {
    const spark = new SparkMD5.ArrayBuffer()
    const reader = new FileReader()
    const SLICE = 2 * 1024 * 1024  // 每次读 2MB

    let cur = 0
    reader.onload = (e) => {
      spark.append(e.target.result)
      cur += SLICE
      if (cur < file.size) {
        reader.readAsArrayBuffer(file.slice(cur, cur + SLICE))
      } else {
        resolve(spark.end())  // 最终 hash 值
      }
    }
    reader.readAsArrayBuffer(file.slice(0, SLICE))
  })
}
```

**2. 上传前询问服务器已上传了哪些分片**

```js
async function checkUploadedChunks(fileHash) {
  const res = await fetch(`/api/upload/check?hash=${fileHash}`)
  const { uploadedChunks } = await res.json()
  // uploadedChunks: [0, 1, 3] 表示第 0、1、3 片已上传
  return uploadedChunks
}
```

**3. 过滤已上传分片，只上传剩余的**

```js
async function uploadFile(file) {
  const hash = await calcFileHash(file)
  const chunks = createChunks(file)
  const uploadedChunks = await checkUploadedChunks(hash)

  // 过滤掉已上传的分片
  const pendingChunks = chunks.filter(c => !uploadedChunks.includes(c.index))

  // 并发上传（控制并发数量，避免占满带宽）
  await uploadChunksConcurrently(pendingChunks, hash, concurrency = 3)

  // 全部上传完成后通知服务器合并
  await fetch('/api/upload/merge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hash, filename: file.name, total: chunks.length }),
  })
}
```

**4. 并发控制上传**

```js
async function uploadChunksConcurrently(chunks, fileHash, concurrency = 3) {
  const queue = [...chunks]
  const workers = Array.from({ length: concurrency }, async () => {
    while (queue.length > 0) {
      const chunk = queue.shift()
      if (!chunk) return

      const formData = new FormData()
      formData.append('chunk', chunk.chunk)
      formData.append('hash', fileHash)
      formData.append('index', chunk.index)

      await fetch('/api/upload/chunk', { method: 'POST', body: formData })
    }
  })

  await Promise.all(workers)
}
```

---

## Q: 如何实现上传进度显示和暂停/恢复？

**A:**

**进度计算：**

```js
// 已上传分片数 / 总分片数 = 整体进度
const progress = (uploadedCount / totalChunks) * 100
```

**暂停与恢复（AbortController）：**

```js
const controllers = new Map()  // index → AbortController

async function uploadChunk(chunk, fileHash) {
  const controller = new AbortController()
  controllers.set(chunk.index, controller)

  const formData = new FormData()
  formData.append('chunk', chunk.chunk)
  formData.append('hash', fileHash)
  formData.append('index', chunk.index)

  try {
    await fetch('/api/upload/chunk', {
      method: 'POST',
      body: formData,
      signal: controller.signal,  // 关联取消信号
    })
    controllers.delete(chunk.index)
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log(`分片 ${chunk.index} 已暂停`)
    }
  }
}

// 暂停：取消所有正在进行的请求
function pauseUpload() {
  for (const [, controller] of controllers) {
    controller.abort()
  }
}

// 恢复：重新上传未完成的分片
async function resumeUpload(file, fileHash) {
  const uploadedChunks = await checkUploadedChunks(fileHash)
  const chunks = createChunks(file)
  const pending = chunks.filter(c => !uploadedChunks.includes(c.index))
  await uploadChunksConcurrently(pending, fileHash)
}
```

---

## 方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 直接上传 | 简单 | 文件大时容易超时/失败 | 小文件 < 10MB |
| 分片上传 | 并发快、失败可重试 | 需服务端合并逻辑 | 大文件 |
| 断点续传 | 网络中断后可恢复 | 需 hash 计算、服务端查询 | 超大文件、网络不稳定场景 |

> ⚠️ **注意**：计算大文件 MD5 hash 是 CPU 密集操作，应在 **Web Worker** 中执行，避免阻塞主线程导致页面卡顿。
