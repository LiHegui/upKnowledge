# 信号实时可视化模块设计说明（SignalView）

## 目录

1. [模块定位与文件位置](#模块定位与文件位置)
2. [完整数据链路（Topic 模式）](#完整数据链路topic-模式)
3. [完整数据链路（DBC 模式）](#完整数据链路dbc-模式)
4. [核心数据结构](#核心数据结构)
5. [图表管理机制](#图表管理机制)
6. [Socket 订阅管理](#socket-订阅管理)
7. [渲染节流（RAF 机制）](#渲染节流raf-机制)
8. [时间戳处理](#时间戳处理)
9. [节点添加校验](#节点添加校验)
10. [图表聚焦与多线叠加](#图表聚焦与多线叠加)
11. [删除图表与信号线](#删除图表与信号线)
12. [DBC 文件管理（Vuex 持久化）](#dbc-文件管理vuex-持久化)
13. [Socket 断线重连](#socket-断线重连)
14. [signalChart 组件内部机制](#sigcalchart-组件内部机制)
15. [JsonChange 组件（DBC 树形）](#jsonchange-组件dbc-树形)
16. [JsonViewer 组件（Topic 树形）](#jsonviewer-组件topic-树形)
17. [cancelFetchDataSocket 边界处理](#cancelfetchdatasocket-边界处理)
18. [性能优化汇总](#性能优化汇总)
19. [设计权衡说明](#设计权衡说明)

---

## 模块定位与文件位置

```
src/views/viz/signal.vue                        ← 主页面（本文档描述对象）
src/views/viz/components/
    ├── JsonViewer.vue                          ← Topic 数据树形展示（vue-json-pretty 封装）
    ├── JsonChange.vue                          ← DBC 数据两级树形展示（含搜索过滤）
    ├── signalChart.vue                         ← 单个 ECharts 折线图组件
    └── dbcDialog.vue                           ← DBC 文件上传弹窗
src/api/vvp_viz.js                              ← 所有 HTTP 接口定义
src/store/modules/monitor_fusion.js             ← Vuex 模块（DBC 持久化）
```

**用途**：对车端 ROS topic 信号或 CAN DBC 信号进行实时折线图可视化。用户从左侧树形结构中选择感兴趣的数值字段，点击后自动创建折线图，支持多条信号叠加在同一张图中对比分析。

### 涉及 API / 通信

| 类型 | 接口 / 事件 | 方法 | 作用 |
|------|------------|------|------|
| HTTP | `/vvp_api/config/signal/ros/topics` | GET | 获取所有可订阅的 topic 列表 |
| HTTP | `/vvp_api/config/signal/dbcfiles` | POST multipart | 上传 DBC 原始文件到服务端 |
| HTTP | `/vvp_api/config/signal/dbc/tree?file_name=xxx` | GET | 获取解析后的 DBC 树形结构 |
| socket.io emit | `viz_rosbridge_msg` | — | 订阅 ROS topic 实时数据 |
| socket.io emit | `cancel_topic` | — | 取消订阅指定 topic/pattern |
| socket.io emit | `viz_can_msg` | — | 订阅 CAN DBC 信号 |
| socket.io on | `{topic}_all` | — | 接收 topic 全量数据（树形展示） |
| socket.io on | `{topic}` | — | 接收 topic 过滤数据（图表更新） |
| socket.io on | `can_handle` | — | 接收 DBC 信号数据 |
| Vuex getter | `monitor_fusion/getDbcData` | — | 读取持久化的 DBC 配置 |
| Vuex action | `monitor_fusion/updateDbcData` | — | 写入持久化的 DBC 配置 |

---

## 完整数据链路（Topic 模式）

以用户选择一个 topic、点击字段节点添加到图表为例，完整链路共 **12 步**：

```
① 页面加载（created）
        │  fetchSearchTopics()
        │    → GET /vvp_api/config/signal/ros/topics
        │    → allSearchTopics = ['topic1', 'topic2', ...]
        │  initSocket()  ← 建立 socket.io 连接（见断线重连章节）
        │  startRafLoop()  ← 启动 RAF 渲染循环（见渲染节流章节）
        ▼
② 用户在下拉框选择 topic（handleTopicChange）
        │  cancelFetchDataSocket(oldTopic, { value: '@' }, isAll=true)
        │    ← socket.off(`${oldTopic}_all`) + emit('cancel_topic')
        │  rawData = {}  ← 清空左侧树形
        │  previousTopic = searchTopic  ← 记录旧 topic
        │  fetchDataSocket(newTopic, { value: '@' }, isFilter=false)
        ▼
③ fetchDataSocket(topic, { value: '@' }, false)
        │  handelUnChangePatterns({ value: '@' }) → { value: '@' }（无 '.' 无需转义）
        │  eventKey = `${topic}_all`（isFilter=false）
        │  socket.emit('viz_rosbridge_msg', {
        │    topic,
        │    pattern: { value: '@' },
        │    throttle_rate: 1000,
        │    sample: 1,
        │    event: `${topic}_all`
        │  })
        │  hasListeners(eventKey) → removeAllListeners(eventKey)  ← 防重复绑定
        │  socket.on(`${topic}_all`, handler)
        ▼
④ socket.on(`${topic}_all`) 回调
        │  搜索条件 this.searchTopic === topic && !isFilter → true
        │  rawData = { ...data.value }  ← 更新左侧 JsonViewer 展示
        │  handleTimeChoice(topic, data.value)
        │    timeChoices.has(topic)? → 已检测过则跳过
        │    data.value.header.stamp 存在 → timeChoices.set(topic, 'header.stamp')
        │    data.value.stamp 存在       → timeChoices.set(topic, 'stamp')
        │    两者均无                    → timeChoices.set(topic, null)
        ▼
⑤ 用户点击 JsonViewer 树形节点（handleNodeClick, tab='topic'）
        │  [前置校验] timeChoices.get(searchTopic) 为 null
        │    → $message.warning('当前 Topic 数据中未检测到可用的时间戳字段...') + return
        │
        │  isValidNumericNode(node, 'topic'):
        │    node.path 含 '[N]'（数组节点）→ $message.warning + return false
        │    node.content 非 number       → $message.warning + return false
        │    node.path 含 'stamp'         → $message.warning + return false
        │    node.key 为非空字符串        → return true
        │
        │  path = node.path.slice(node.path.indexOf('.') + 1)  ← 去掉 topic 前缀
        │  lineKey = `${searchTopic}/${path}`
        │  key = `chart-${Date.now()}`
        ▼
⑥ 聚焦判断（selectedChart）
        ├─ selectedChart 存在（聚焦某图表）
        │    lineKey 已在 selectedChart.lines → $message.info '已存在' + return
        │    不在 → selectedChart.lines.push(lineKey)
        │            $message.success '已添加该节点到选中图表中'
        └─ 未聚焦
             chartTypeList.push({ name: key, key, lines: [lineKey] })
             $message.success `已添加: ${node.key}`
        │
        │  lineAllData[lineKey] 不存在 → addLineData(lineKey, searchTopic, path)
        ▼
⑦ addLineData(lineKey, topic, path)
        │  this.$set(lineAllData, lineKey, {
        │    name: lineKey, topic, path, lineKey,
        │    series: [{ type: 'line', showSymbol: false, data: [] }]
        │  })
        │
        │  topicChartList.has(topic)?
        ├─ 无 → 新建条目
        │    patterns = timeChoices.get(topic)
        │      ? { [timeField]: timeField }  ← 以时间戳字段为初始 pattern
        │      : {}
        │    topicChartList.set(topic, { topic, eventKey: topic, patterns })
        └─ 有 → 读取已有 patterns
        │
        │  patterns[path] 已存在？
        ├─ 已存在 → return（复用已有订阅，无需重发请求）
        └─ 不存在 →
              cancelFetchDataSocket(topic, patterns, isAll=false)
                ← socket.off(topic) + emit('cancel_topic', { topic, pattern: encodedPatterns })
              patterns[path] = path  ← 追加新字段
              fetchDataSocket(topic, patterns, isFilter=true)
        ▼
⑧ fetchDataSocket(topic, patterns, true)
        │  handelUnChangePatterns(patterns):
        │    { 'header.stamp': 'header.stamp', 'seq': 'seq' }
        │    → { 'header__stamp': 'header__stamp', 'seq': 'seq' }
        │  eventKey = topic（isFilter=true）
        │  socket.emit('viz_rosbridge_msg', {
        │    topic,
        │    pattern: { 'header__stamp': 'header__stamp', 'seq': 'seq' },
        │    throttle_rate: 1000,
        │    sample: 1,
        │    event: topic
        │  })
        │  hasListeners(topic) → removeAllListeners(topic)
        │  socket.on(topic, handler)
        ▼
⑨ socket.on(topic) 回调 → updateCharts(data, eventKey=topic)
        │  isDbc = false
        │  timeStamp = gettimeStamp(data, topic)（见时间戳处理章节）
        │  for each [unChangeKey, value] in Object.entries(data):
        │    跳过 unChangeKey === timeChoices.get(topic)（时间戳字段）
        │    key = unChangeKey.split('__').join('.')  ← 还原路径
        │    lineKey = `${topic}/${key}`
        │    lineAllData[lineKey] 存在？
        │      → series[0].data.push([timeStamp, value])
        │      → length > 1500 → series[0].data.shift()  ← O(1) 滑动窗口
        │  needsRender = true  ← 标记脏位
        ▼
⑩ RAF 渲染循环（startRafLoop）
        │  rafId = requestAnimationFrame(loop)
        │  loop(timestamp):
        │    needsRender && (timestamp - lastRenderTime) >= 500ms？
        │      needsRender = false
        │      lastRenderTime = timestamp
        │      flushChartsToUI()
        │    rafId = requestAnimationFrame(loop)  ← 持续循环
        ▼
⑪ flushChartsToUI()
        │  for each chartItem in chartTypeList:
        │    refArr = this.$refs['chart_' + chartItem.key]
        │    chartComp = refArr && refArr[0]
        │    chartComp.manualUpdate 存在？
        │      seriesData = buildseries(chartItem)
        │      chartComp.manualUpdate(seriesData)
        ▼
⑫ signalChart.manualUpdate(seriesData)
        │  !this.isVisible → return（IntersectionObserver 判定不在视口，跳过渲染）
        │  series = seriesData.map(item => ({ ...item, showSymbol: false, symbol: 'none' }))
        │  !hasInitOption？
        │    chart.setOption({ ...this.options, series })  ← 首次：完整 option
        │    hasInitOption = true
        │  else
        │    chart.setOption({ series })  ← 后续：仅更新 series，开销最小
        ▼
        📈 折线图实时更新
```

---

## 完整数据链路（DBC 模式）

### 阶段一：DBC 文件上传与树形加载

```
① 用户点击"添加DBC文件"按钮（handleAddDbcFile）
        │  dbcDialogVisible = true → 弹出 dbcDialog 组件
        ▼
② dbcDialog.vue 前置校验（beforeUpload）
        │  file.name.endsWith('.dbc') 校验格式
        │  file.size < 5MB 校验大小
        │  isUploading = true（防重复提交）
        ▼
③ dbcDialog.vue 上传（customUpload）
        │  POST /vvp_api/config/signal/dbcfiles  (multipart/form-data)
        │  response.data.code === 100 || msg === 'ok' → onSuccess
        ▼
④ dbcDialog.vue handleUploadSuccess
        │  GET /vvp_api/config/signal/dbc/tree?file_name=${file.name}
        │  res.data.data = [
        │    { label: '0x123', children: [{ label: 'Signal_A' }, { label: 'Signal_B' }] },
        │    ...
        │  ]
        │  filteredDbcData = data.map(item => ({
        │    label: item.label,
        │    children: item.children.map(c => ({ label: c.label }))
        │  }))
        │  emit('upload-success', filteredDbcData)
        │  isUploading = false
        │  handleClose()（关闭弹窗，重置 uploadKey 强制刷新上传组件）
        ▼
⑤ signal.vue handleDbcUploadSuccess(data)
        │  清除 lineAllData 中所有 topic==='dbc' 的条目（$delete 逐一删除）
        │  topicChartList.has('dbc') → topicChartList.delete('dbc')
        │  socket.hasListeners('can_handle') → socket.off('can_handle')
        │  updateDbcData(data)  ← Vuex action
        │    → commit('UPDATE_DBC_DATA', data)
        │    → state.signal.dbcData = data
        │    → localStorage.setItem('monitor_fusion_signal', JSON.stringify(state.signal))
        │  computed.dbcData = getDbcData → JsonChange 自动重新渲染
```

### 阶段二：信号节点选择与订阅

```
⑥ 用户点击 JsonChange 中的叶子节点（handleNodeClick, tab='dbc'）
        │  isValidNumericNode(node, 'dbc'):
        │    node.path.includes('children') → return true（叶子节点判断）
        │    否则 → return false
        │
        │  label1 = getFirstLabel(node.path)
        │    node.path 如 'root[2].children[0]'
        │    → 提取 '2' → dbcData[2].label（msg ID，如 '0x123'）
        │  path = `${label1}.${node.content}`  ← 如 '0x123.Signal_A'
        │  lineKey = path（DBC 不需要 topic 前缀）
        ▼
⑦ 聚焦判断（同 Topic 模式 ⑥，略）
        │  lineAllData[lineKey] 不存在 → addLineData(lineKey, 'dbc', path)
        ▼
⑧ addLineData(lineKey, 'dbc', path)
        │  this.$set(lineAllData, lineKey, { name:lineKey, topic:'dbc', path, ... })
        │
        │  topicChartList.has('dbc')?
        ├─ 无 → topicChartList.set('dbc', { topic:'dbc', eventKey:'dbc', patterns:{} })
        └─ 有 → 读取 patterns
        │
        │  label1 = path.split('.')[0]  ← '0x123'
        │  label2 = path.split('.')[1]  ← 'Signal_A'
        │  patterns[label1] 存在？
        ├─ 有 → patterns[label1].push(label2)
        └─ 无 → patterns[label1] = [label2]
        │  fetchDataSocketDbc()
        ▼
⑨ fetchDataSocketDbc()
        │  can_msg_fields = topicChartList.get('dbc').patterns
        │    = { '0x123': ['Signal_A', 'Signal_B'], '0x456': ['Signal_C'] }
        │  socket.emit('viz_can_msg', {
        │    throttle_rate: 1000,
        │    can_msg_fields,
        │    sample: 1,
        │    event: 'can_handle'
        │  })
        │  hasListeners('can_handle') → removeAllListeners('can_handle')  ← 整体替换
        │  socket.on('can_handle', handler)
        ▼
⑩ socket.on('can_handle', data)
        │  原始 data 结构:
        │    { ts: 1234567890.123, '0x123': [val_A, val_B], '0x456': [val_C] }
        │
        │  构造 filteredData:
        │    filteredData['ts'] = data['ts']
        │    for [msgId, keyArray] of Object.entries(can_msg_fields):
        │      values = data[msgId]  ← 如 [1.23, 4.56]
        │      keyArray.forEach((key, i) → filteredData[`${msgId}.${key}`] = values[i])
        │  filteredData = { ts: ..., '0x123.Signal_A': 1.23, '0x123.Signal_B': 4.56 }
        │  updateCharts(filteredData, 'dbc')
        ▼
⑪ updateCharts(filteredData, 'dbc')
        │  isDbc = true
        │  timeStamp = gettimeStamp(data, 'dbc')
        │    isNowTime=true  → Date.now()
        │    isNowTime=false → data['ts'] * 1000（s → ms）
        │  for [key, value] of Object.entries(filteredData):
        │    跳过 key === 'ts'
        │    lineKey = key（如 '0x123.Signal_A'）
        │    lineAllData[lineKey].series[0].data.push([timeStamp, value])
        │    length > 1500 → shift()
        │  needsRender = true
        ▼
        📈 RAF → flushChartsToUI → signalChart.manualUpdate（同 Topic 模式 ⑩⑪⑫）
```

---

## 核心数据结构

### topicChartList（Map）

跟踪每个 topic 当前订阅的所有 pattern：

```js
topicChartList = Map {
  '/adas/planning/status' => {
    topic: '/adas/planning/status',
    eventKey: '/adas/planning/status',
    patterns: {
      'header.stamp': 'header.stamp',   // 时间戳字段（必含，原始形式存储）
      'seq': 'seq',                      // 用户添加的信号字段
      'velocity': 'velocity'
      // 发送给后端时通过 handelUnChangePatterns 转义为 '__'
    }
  },
  'dbc' => {
    topic: 'dbc',
    eventKey: 'dbc',
    patterns: {
      '0x123': ['Signal_A', 'Signal_B'],
      '0x456': ['Signal_C']
    }
  }
}
```

> **注意**：Topic patterns 中存储的是原始路径（含 `.`），发送 socket 前才通过 `handelUnChangePatterns` 转义为 `__`。

### lineAllData（Object）

每条信号线的数据缓冲区（通过 `this.$set` 初始化 key，后续直接 push）：

```js
lineAllData = {
  '/adas/planning/status/seq': {
    name: '/adas/planning/status/seq',
    topic: '/adas/planning/status',
    path: 'seq',
    lineKey: '/adas/planning/status/seq',
    series: [{
      type: 'line',
      showSymbol: false,
      data: [[timestamp1, val1], [timestamp2, val2], ...]  // 最多 1500 点滑动窗口
    }]
  },
  '0x123.Signal_A': {
    name: '0x123.Signal_A',
    topic: 'dbc',
    path: '0x123.Signal_A',
    lineKey: '0x123.Signal_A',
    series: [{ type: 'line', showSymbol: false, data: [] }]
  }
}
```

### chartTypeList（Array）

图表列表，每项对应一个 `signalChart` 实例，通过 `v-for :key` 和 `$refs` 索引：

```js
chartTypeList = [
  {
    name: 'chart-1748000000000',
    key:  'chart-1748000000000',
    lines: [
      '/adas/planning/status/seq',
      '/adas/planning/status/velocity'   // 多线叠加
    ]
  },
  {
    name: 'chart-1748000000001',
    key:  'chart-1748000000001',
    lines: ['0x123.Signal_A']
  }
]
```

---

## 图表管理机制

### buildseries（按需构建）

`buildseries(chartItem)` 在 `flushChartsToUI` 中被调用，从 `lineAllData` 读取当前数据组装 ECharts series，不修改任何数据：

```js
buildseries(chartItem) {
  return chartItem.lines.map(lineKey => {
    const lineData = this.lineAllData[lineKey]
    return {
      name: lineKey,
      type: 'line',
      data: lineData ? lineData.series[0].data : []
    }
  })
}
```

### 数据点上限（maxPoints = 1500）

```
每条线写入新数据点时（updateCharts）:
  series[0].data.push([timestamp, value])
  if (series[0].data.length > 1500) series[0].data.shift()  ← O(1) 原地滑动窗口
```

1500 点 × 1s 推送频率 ≈ 约 25 分钟历史数据。

---

## Socket 订阅管理

### 事件命名规则

| 场景 | event 名 | pattern 结构 |
|------|----------|-------------|
| 全量数据（树形展示）| `{topic}_all` | `{ value: '@' }` |
| 过滤数据（图表更新）| `{topic}` | `{ path__key: path__key, ts__field: ts__field }` |
| DBC 数据 | `can_handle` | 由服务端固定使用 |

### 路径编码规则（`handelUnChangePatterns`）

pattern 的 key 中 `.` 会被 socket.io 解析为事件命名空间分隔符，因此在 emit 前必须转义：

```
存储（patterns）: 'header.stamp'
发送前转义:        'header.stamp' → 'header__stamp'   （'.' → '__'）
收到后还原:        'header__stamp' → 'header.stamp'   （updateCharts 中 split('__').join('.')）
```

### 重复监听保护（先清后绑）

```js
if (this.socket.hasListeners(eventKey)) {
  this.socket.removeAllListeners(eventKey)
}
this.socket.on(eventKey, handler)
```

防止同一 topic 被多次 `on` 导致回调执行多次、数据重复写入。

### cancelFetchDataSocket（边界条件）

```js
cancelFetchDataSocket(topic, patterns, isAll = false):
  // 边界保护：只有时间戳字段（patterns 长度 === 1）且非全量取消时，不发出 cancel
  if (!patterns || (Object.keys(patterns).length === 1 && !isAll)) return

  if (isAll):
    socket.off(`${topic}_all`)
    newPatterns = { value: '@' }
  else:
    socket.off(topic)
    newPatterns = handelUnChangePatterns(patterns)

  socket.emit('cancel_topic', { topic, pattern: newPatterns, sample: 1 })
```

> **边界说明**：当 patterns 中只剩时间戳字段（单 key）且是局部取消时，说明还有其他信号在使用该订阅，不能贸然取消。

---

## 渲染节流（RAF 机制）

### 问题背景

socket.io 数据高频到达，若每次到达就调用 `signalChart.manualUpdate()`，ECharts `setOption` 会每秒调用数十次，阻塞主线程引发卡顿。

### 解决方案：脏标记 + RAF 时间门控

```
数据写入（updateCharts）:
  lineAllData[lineKey].series[0].data.push(point)   ← 纯内存写，不触发 Vue 响应
  needsRender = true                                 ← 标记脏位

RAF 循环（startRafLoop）:
  loop(timestamp):
    needsRender && (timestamp - lastRenderTime) >= renderInterval(500ms)?
      needsRender = false
      lastRenderTime = timestamp
      flushChartsToUI()   ← 批量刷新所有图表
    rafId = requestAnimationFrame(loop)

页面销毁（beforeDestroy）:
  cancelAnimationFrame(rafId)  ← 必须清理，防止内存泄漏
```

**关键设计**：`lineAllData` 的初始 key 通过 `this.$set` 创建（保证 Vue 响应式），但后续 `series[0].data.push()` 直接操作，**不触发 Vue 响应式系统**，彻底避免 Watcher 开销。图表刷新由 RAF 手动控制，与 Vue 渲染完全解耦。

### renderInterval = 500ms

图表刷新频率上限为 2 次/秒，信号分析场景下用户关注趋势而非单点，完全满足需求。

---

## 时间戳处理

### isNowTime 开关（右上角 el-switch）

| 模式 | X 轴时间来源 | 适用场景 |
|------|------------|---------|
| 当前时间（on，默认）| `Date.now()`（本地时钟）| 关注实时性，不在意时钟偏差 |
| 原始时间（off）| 从消息中提取 ROS/CAN 时间戳 | 精确分析信号时序关系 |

### 原始时间提取（gettimeStamp）

```js
gettimeStamp(data, topic):
  if (isNowTime) return Date.now()

  const isDbc = topic === 'dbc'
  const time = isDbc ? data['ts'] : data[timeChoices.get(topic)]

  if (isDbc):
    return time * 1000                       // CAN ts 单位为秒，转 ms
  else if (typeof time === 'object'):
    return time.secs * 1000                  // { secs, nsecs } ROS 标准时间结构
  else if (typeof time === 'string'):
    return Number(time.slice(0, -6)) * 1000  // 字符串纳秒时间戳，截掉末6位(ns)→s→ms
```

### timeChoices 自动检测（handleTimeChoice）

每个 topic 首次收到数据时执行一次：

```
timeChoices.has(topic) → 已检测，直接跳过

data.value['header']['stamp'] 存在 → timeChoices.set(topic, 'header.stamp')
data.value['stamp'] 存在           → timeChoices.set(topic, 'stamp')
两者均无                           → timeChoices.set(topic, null)
                                      ← null 意味着该 topic 所有节点均不可添加
```

---

## 节点添加校验

### isValidNumericNode(node, tab)

| 条件 | Topic 模式 | DBC 模式 |
|------|-----------|---------|
| `node.path` 含 `[N]`（数组节点）| ❌ warning，return false | — |
| `node.content` 非 `number` 类型 | ❌ warning，return false | — |
| `node.path` 含 `stamp` | ❌ warning（时间戳字段）| — |
| `node.path` 含 `children` | — | ✅ return true（叶子节点） |
| 不含 `children` | — | ❌ return false（msg ID 层，非叶子）|
| `node.key` 非空字符串 | ✅ return true | ✅ return true |

### 前置时间戳检查（handleNodeClick 入口）

```
tab === 'topic' && timeChoices.get(searchTopic) === null
  → $message.warning('当前 Topic 数据中未检测到可用的时间戳字段, 无法添加节点到图表中')
  → return（拦截，不进入 isValidNumericNode）
```

---

## 图表聚焦与多线叠加

### 聚焦模式

```
用户点击图表区域（signalChart emit 'select'）
  → handleChartSelect(chartItem)
  → selectedChart = chartItem
  → 图表显示 "已选中" 提示（isActive = true）

用户点击页面空白区域（handleOutsideClick）
  event.target.closest('.signal-chart-item') → null（点在图表外）
  event.target.closest('.left') → null（点在左侧面板外）
  selectedChart !== null → selectedChart = null
  → 图表显示 "点击可选中" 提示
```

### 添加线到已有图表（聚焦模式下）

```
selectedChart 不为 null:
  lineKey 已在 selectedChart.lines → $message.info '该节点图表已存在于选中图表中'
  不在 → selectedChart.lines.push(lineKey)
         若 lineAllData[lineKey] 不存在 → addLineData(...)
         $message.success '已添加该节点到选中图表中'
```

多条线共享同一个 `lineAllData` 条目，`buildseries` 时按需读取，数据不重复存储。

---

## 删除图表与信号线

### 引用计数（collectLineCounts）

```js
collectLineCounts(chartTarget):
  lineCounts = {}
  for chartItem of chartTypeList（跳过 chartTarget 自身）:
    for lineKey of chartItem.lines:
      lineCounts[lineKey] = (lineCounts[lineKey] || 0) + 1
  return lineCounts
```

### 删除图表（handleDeleteChart）

```
handleDeleteChart(chartItem):
  lineCounts = collectLineCounts(chartItem)
  for lineKey of chartItem.lines:
    lineCounts[lineKey] === 0（无其他图表引用）→ deleteLineData(lineKey)

  selectedChart.key === chartItem.key → selectedChart = null
  chartTypeList.splice(index, 1)
  $message.success '已删除图表'
```

### deleteLineData（清理信号线）

```
1. this.$delete(lineAllData, lineKey)  ← 响应式删除

2. topicData = topicChartList.get(deletedLine.topic)

3. DBC 特殊处理:
   label1 = path.split('.')[0], label2 = path.split('.')[1]
   从 topicData.patterns[label1] 中 splice(label2)
   patterns[label1] 为空 → delete patterns[label1]
                            socket.off('can_handle')
                            fetchDataSocketDbc()（整体重订阅）
                            return

4. Topic 处理:
   cancelFetchDataSocket(topic, topicData.patterns)  ← 先取消当前订阅
   delete topicData.patterns[path]                    ← 移除该字段
   Object.keys(topicData.patterns).length > 1
     → fetchDataSocket(topic, topicData.patterns, true)  ← 还有其他字段，重新订阅

5. 清理空 topic:
   patterns 只剩 1 个 key 且该 key === timeChoices.get(topic)
     → topicChartList.delete(topic)（不再订阅该 topic）
```

---

## DBC 文件管理（Vuex 持久化）

### 存储路径

```
Vuex store: monitor_fusion/state.signal.dbcData
localStorage key: 'monitor_fusion_signal'
存储内容: JSON.stringify({ dbcData: [...] })
```

### 数据流

```
上传 DBC 文件
    └── handleDbcUploadSuccess(filteredDbcData)
            │  updateDbcData(filteredDbcData)  ← Vuex action
            │    commit('UPDATE_DBC_DATA', dbcData)
            │    state.signal.dbcData = dbcData
            │    localStorage.setItem('monitor_fusion_signal', JSON.stringify(state.signal))
            ▼
computed: dbcData = this.getDbcData || []
    └── JsonChange 组件 :json-data 绑定，自动渲染新树形结构

页面刷新时:
    loadSignalFromStorage()
      → localStorage.getItem('monitor_fusion_signal')
      → JSON.parse → state.signal.dbcData
    computed.dbcData 仍有值，用户无需重新上传
```

**更换 DBC 文件时**：先清除所有旧 dbc 相关的 `lineAllData` 条目和 `topicChartList['dbc']`，再写入新数据，避免新旧信号混用。

---

## Socket 断线重连

```
initSocket():
  socket = io(WEBSOCKET_HOST, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: Infinity   ← 无限重连
  })

socket.on('connect'):
  resubscribeActiveTopics()
    1. searchTopic 不为空
       → fetchDataSocket(searchTopic, { value: '@' }, false)  ← 恢复树形展示
    2. for [topic, topicData] of topicChartList.entries():
       topic === 'dbc'
         → fetchDataSocketDbc()
       else
         → fetchDataSocket(topic, topicData.patterns, true)  ← 恢复图表订阅

socket.on('disconnect', reason):
  reason === 'io server disconnect'
    → socket.connect()  ← 服务端主动断开，需手动触发重连
  其他原因（网络抖动等）
    → 自动重连（reconnection: true 内置处理）

beforeDestroy():
  socket.removeAllListeners()
  socket.disconnect()
  socket = null
```

---

## signalChart 组件内部机制

### IntersectionObserver（可见性优化）

```js
mounted():
  this._observer = new IntersectionObserver(([entry]) => {
    this.isVisible = entry.isIntersecting
  }, { threshold: 0.1 })
  this._observer.observe(this.$el)

beforeDestroy():
  this._observer.disconnect()
```

**效果**：当图表滚动到视口外时，`manualUpdate` 直接 return，跳过 ECharts `setOption`，大幅降低多图场景下不可见图表的渲染开销。

### manualUpdate（首次 vs 后续区分）

```js
manualUpdate(seriesData):
  if (!this.isVisible) return          // 不可见：跳过

  series = seriesData.map(item => ({
    ...item, showSymbol: false, symbol: 'none'
  }))

  if (!hasInitOption):
    chart.setOption({ ...this.options, series })  // 首次：完整 option（含轴/网格/dataZoom）
    hasInitOption = true
  else:
    chart.setOption({ series })                   // 后续：只更新 series，最小开销
```

### ECharts 配置（options）

```js
options = {
  legend: {},
  tooltip: { trigger: 'axis' },
  grid: { left: 60, right: 20, top: 20, bottom: 60 },
  xAxis: {
    type: 'time',
    axisLabel: { rotate: 25, fontSize: 10, hideOverlap: true }
  },
  yAxis: {
    type: 'value',
    axisLabel: { fontSize: 9, hideOverlap: true },
    splitNumber: 4
  },
  dataZoom: [
    { type: 'slider', height: 15, bottom: '5%' },
    { type: 'inside' }
  ],
  series: []
}
```

---

## JsonChange 组件（DBC 树形）

两级折叠展示结构，内置搜索过滤：

```
数据结构（jsonData prop）:
  [
    { label: '0x123', children: [{ label: 'Signal_A' }, { label: 'Signal_B' }] },
    { label: '0x456', children: [{ label: 'Signal_C' }] }
  ]

搜索（filteredJsonData computed）:
  searchKey 不为空 → filterJsonData()
    1. 一级 label 匹配 → 保留全部 children
    2. 一级 label 不匹配但有 children 匹配 → 只保留匹配的 children
    3. 自动展开所有匹配的一级项（nextTick 设置 expandedItems）
  highlightText() → v-html 高亮关键词（<span class="highlight">）

节点点击（handleChildClick）:
  构造 node 对象:
    node.content = child.label
    node.key = child.label
    node.path = `root[parentIndex].children[childIndex]`
    node.parentLabel = parent.label
  emit('node-click', node)

getFirstLabel(nodePath) in signal.vue:
  nodePath = 'root[2].children[0]'
  → match /\[(\d+)\]/ → '2'
  → dbcData[2].label → '0x123'（msg ID）
```

---

## JsonViewer 组件（Topic 树形）

`vue-json-pretty` 的轻量封装：

```
Props: jsonData (Object|Array)
计算高度: JsonHeight = window.innerHeight - 300（created 时计算一次）
hasData computed: Object.keys(jsonData).length > 0
节点点击: vue-json-pretty @node-click → $emit('node-click', node)
空状态: hasData=false → 显示 el-icon-folder-opened 占位
```

`vue-json-pretty` 节点对象结构（signal.vue 中用到的字段）：
```js
node = {
  path: 'root.header.stamp',  // 完整路径（含 topic 名作为 root）
  key: 'stamp',               // 字段名
  content: 1748000000.123,    // 字段当前值
  level: 3,
  type: 'content'
}
```

---

## cancelFetchDataSocket 边界处理

完整判断逻辑：

```
cancelFetchDataSocket(topic, patterns, isAll = false):

  // 边界1：patterns 为空/null → 直接返回
  if (!patterns) return

  // 边界2：仅含一个 pattern（时间戳字段）且非全量取消
  //   说明此时还没有真正的信号被订阅，或者其他信号还在使用，不取消
  if (Object.keys(patterns).length === 1 && !isAll) return

  if (isAll):
    socket.off(`${topic}_all`)
    newPatterns = { value: '@' }
  else:
    socket.off(topic)
    newPatterns = handelUnChangePatterns(patterns)  ← '.' → '__'

  socket.emit('cancel_topic', { topic, pattern: newPatterns, sample: 1 })
```

---

## 性能优化汇总

| 优化点 | 手段 | 效果 |
|--------|------|------|
| 高频数据不触发 Vue 响应 | `series.data.push()` 直接操作，`$set` 只在创建 key 时用一次 | 避免 Watcher 依赖收集开销 |
| 图表刷新节流 | RAF + 500ms 时间戳门控 + 脏标记 `needsRender` | ECharts setOption ≤ 2 次/秒 |
| 不可见图表跳过渲染 | `IntersectionObserver` 监测可见性，不可见时 `manualUpdate` 直接 return | 多图滚动场景下节省大量渲染开销 |
| 首次 vs 后续 option 区分 | `hasInitOption` 标记，后续只传 `{ series }` | 减少 ECharts diff 计算量 |
| 数据点滑动窗口 | `shift()` O(1) 原地移除，保持 ≤ 1500 点 | 防止数组无限增长，内存可控 |
| 重复订阅保护 | `hasListeners + removeAllListeners` 先清后绑 | 避免同一事件多次回调导致数据重复 |
| 订阅按需合并 | 同一 topic 多个信号共用一个 socket 订阅（patterns 合并）| 减少 socket 事件数量 |
| 信号引用计数 | `collectLineCounts` 确保只有零引用时才取消订阅 | 多图共用同一信号不中断数据 |
| buildseries 纯读取 | 不修改任何数据，RAF 中可随时安全调用 | 无副作用，逻辑简单 |
| timeChoices 一次检测 | 首次 `has(topic)` 判断，后续跳过 | 不重复遍历数据结构检测时间戳 |
| DBC 整体替换订阅 | 每次信号变更重建 `can_msg_fields` 整体 emit | 协议限制，避免增量混用旧订阅 |
| 断线自动重订阅 | `socket.on('connect')` 触发 `resubscribeActiveTopics` | 断线恢复后用户无感知 |
| 节点校验提前拦截 | `isValidNumericNode` + 时间戳前置检查 | 避免无效字段进入图表流程 |
| 页面销毁清理 | `cancelAnimationFrame` + `socket.disconnect` + `removeAllListeners` | 防内存泄漏和事件残留 |

---

## 设计权衡说明

### 1. lineAllData 不使用 Vue 响应式

`lineAllData` 的初始 key 通过 `this.$set` 创建（保证 Vue 响应式），但后续 `series[0].data.push()` 直接操作，不触发任何 Watcher。图表刷新完全由 RAF 手动控制（`manualUpdate`）。

这是一个有意为之的**性能优先**选择：如果用 `this.lineAllData[key].series[0].data = [..., newPoint]`（每次替换数组引用），Vue 会触发 diff 和重渲染，在高频数据流下会严重卡顿。

### 2. throttle_rate = 1000ms（后端节流）

`viz_rosbridge_msg` 的 `throttle_rate: 1000` 让后端每 1s 最多推送一次，已在数据源侧削峰。前端 RAF 的 500ms 门控作为第二道保险，应对后端节流精度不足或短暂突发的情况。

### 3. 全量订阅（`_all`）与过滤订阅（pattern）分离

topic 树形展示需要全量数据（`{ value: '@' }`），图表更新只需要选中的字段（pattern 过滤）。两条订阅独立，互不干扰：

- 切换 topic 时取消旧的 `_all` 订阅，不影响其他 topic 的图表订阅
- 图表订阅使用 `eventKey = topic`，全量订阅使用 `eventKey = topic_all`，两个不同事件名，回调互不混淆

### 4. DBC 信号重新订阅整体替换

每次添加或删除 DBC 信号，都整体重建 `can_msg_fields` 并重新 emit `viz_can_msg`（而非增量添加）。CAN 消息订阅协议不支持增量 pattern，必须全量描述所需字段，整体替换是唯一正确做法。

### 5. 路径 '.' → '__' 编码

socket.io 在事件名和数据 key 中将 `.` 解析为命名空间/路径分隔符，直接传递 `header.stamp` 作为 pattern key 会导致服务端路径解析错误。`__` 是约定的转义符，前后端统一处理，规避这一陷阱。

### 6. DBC dbcDialog 两步上传

上传 DBC 分两步：① `POST /dbcfiles` 将文件存到服务端；② `GET /dbc/tree?file_name=xxx` 获取服务端解析结果。这样前端无需实现 DBC 解析逻辑，由后端统一处理格式兼容问题，返回结构化树形数据后前端只做过滤（保留 `label` 字段，去掉多余属性）。
