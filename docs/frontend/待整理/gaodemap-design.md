# 高德地图模块设计说明

## 目录

1. [模块文件总览](#模块文件总览)
2. [完整数据链路（车辆位置）](#完整数据链路车辆位置)
3. [完整数据链路（导航信息）](#完整数据链路导航信息)
4. [完整数据链路（SDRoute 导航路线）](#完整数据链路sdroute-导航路线)
5. [地图初始化与生命周期](#地图初始化与生命周期)
6. [车辆标记与方向渲染](#车辆标记与方向渲染)
7. [历史轨迹绘制](#历史轨迹绘制)
8. [视角自动跟踪](#视角自动跟踪)
9. [导航引导面板（NavGuidanceInfo）](#导航引导面板navguidanceinfo)
10. [点击测距](#点击测距)
11. [数据源开关](#数据源开关)
12. [性能优化汇总](#性能优化汇总)
13. [设计权衡说明](#设计权衡说明)

---

## 模块文件总览

```
src/
├── views/viz/components/
│   └── gnssData.vue              ← ① WebSocket 订阅层（8 个 ROS topic）
│
└── components/VvpComponent/GaoDeMap/
    ├── index.vue                 ← ② 地图主组件（渲染、轨迹、视角）
    └── NavGuidanceInfo.vue       ← ③ 导航引导信息面板（覆盖层）
```

| 文件 | 职责边界 |
|------|---------|
| `gnssData.vue` | 建立 socket 连接、解析 ROS 消息、坐标去重、通过 props/emit 向上传递 |
| `GaoDeMap/index.vue` | 地图实例管理、车标/轨迹/路线渲染、视角控制、测距交互 |
| `NavGuidanceInfo.vue` | 纯展示组件，接收 `navInfoBeta` prop，computed 分层解析导航数据 |

---

## 完整数据链路（车辆位置）

以 `sensor`（GNSS RTK）数据源为例，从 ROS topic 到地图上车标移动的完整链路共 **11 步**：

```
① ROS topic: /sensor/gnss_rtk
        │  后端 socket.io 转发
        ▼
② gnssData.vue — socket.on('sensor_gnss_rtk_data', msg)
        │  解析: lng = msg.data.longitude, lat = msg.data.latitude
        │  坐标系: WGS84 → GCJ-02（后端已转换，前端直接使用）
        │  [去重] cur = formattedSensorData[0]
        │         if cur.lng === lng && cur.lat === lat → return（跳过）
        │  formattedSensorData = [{ lng, lat, sensor: 'sensor' }]
        ▼
③ Vue 响应系统 — formattedSensorData 引用变化
        │  gnssData 父组件将 formattedSensorData 作为 prop 传入 GaoDeMap
        ▼
④ GaoDeMap/index.vue — watch: formattedSensorData(newVal)
        │  调用 enqueueVehicleData(newVal)
        ▼
⑤ enqueueVehicleData(data)
        │  遍历 data 数组（通常只有 1 条）
        │  carPositionStore['sensor'] = { lng, lat, rawLng, rawLat, timestamp }
        │  调用 updateCarPositionsDisplay()  ← 更新右上角坐标展示
        │  调用 scheduleMapRender()
        ▼
⑥ scheduleMapRender()  ← 节流核心（vehicleThrottleMs = 200ms）
        │  elapsed = now - lastVehicleFlushTime
        ├─ elapsed >= 200ms → 立即调用 renderMapMarkers()
        └─ elapsed < 200ms  → 若无定时器则设置尾部定时器（保证最后一帧不丢）
        ▼
⑦ renderMapMarkers()
        │  从 carPositionStore 读取所有数据源的最新坐标
        │  跳过无效坐标（0,0 / NaN / 超出范围）
        │  enabledSources.sensor === false → return（数据源已关闭）
        │  调用 updateCarMarker('sensor', [position])
        ▼
⑧ updateCarMarker('sensor') → getNowCarSensor(positions)
        │  position = positions[0]
        │  [首次] 创建 AMap.Marker（SVG 车辆图标），记录 sensorStartMarker 起点标记
        │  [后续] sensor_maker.setPosition(position)
        │
        │  追加轨迹点（去重判断）:
        │    lastPoint = sensorHistoryPath[末尾]
        │    if lastPoint !== position → sensorHistoryPath.push(position)
        │    if length > 500 → sensorHistoryPath.shift()  ← O(1) 滑动窗口
        │
        │  更新 Polyline:
        │    if length !== _lastSensorPathLen →
        │      _lastSensorPathLen = length
        │      passedPolyline.setPath(sensorHistoryPath)  ← 仅点数变化时调用
        ▼
⑨ _calcBearing(lng1, lat1, lng2, lat2)
        │  取轨迹最后两点，球面三角学计算真北方位角（0°=北，顺时针）
        │  return angle ∈ [0, 360)
        ▼
⑩ _applyAngle(sensor_maker, newAngle, 'sensor', threshold=10)
        │  diff = 角度差（处理 359°→1° 跨越）
        │  if diff < 10° → return（跳过，避免车标抖动旋转）
        │  sensor_maker.setAngle(newAngle)
        │  lastAngle['sensor'] = newAngle  ← 本地缓存，不调 getAngle() API
        ▼
⑪ requestViewAdjustment()
        │  if |lng - lastAdjustPositions.sensor[0]| < 0.00005°（≈5m）→ return
        │  debouncedViewAdjust()  ← 300ms 防抖
        │  adjustMapView()
        │    单车: map.panTo(position, 500)
        │    多车: O(n) bounding box → map.setBounds(bounds, false, [80,80,80,80])
        ▼
        🗺️ 地图上车标平滑移动到新位置，轨迹线延伸，视角自动跟随
```

**四路数据源对照表：**

| 数据源 | ROS Topic | 颜色 | watch 名 | store key | Marker 变量 | Polyline 变量 |
|--------|-----------|------|---------|-----------|------------|--------------|
| sensor | `/sensor/gnss_rtk` | 橙 `#F95D00` | `formattedSensorData` | `'sensor'` | `sensor_maker` | `passedPolyline` |
| mb | `/mb/sensor/gnss_rtk` | 绿 `#00ad7c` | `formattedMbData` | `'mb'` | `mb_maker` | `passedPolylineMb` |
| insd | `/mb/sensor/navi` | 蓝 `#1890ff` | `formattedInsdData` | `'insd'` | `insd_maker` | `passedPolylineInsd` |
| hmi | `/hmi_service/message/record` | 紫 `#e883fc` | `formattedHmiData` | `'hmi'` | `hmi_maker` | `passedPolylineHmi` |

---

## 完整数据链路（导航信息）

```
① ROS topic: /navigation/info/beta
        │  后端 socket.io 转发
        ▼
② gnssData.vue — socket.on('nav_info_beta', msg)
        │  [去重] if navInfoBeta && navInfoBeta.data.frame_id === msg.data.frame_id
        │          → return（frame_id 未变，跳过）
        │  this.navInfoBeta = msg
        ▼
③ Vue 响应系统 — navInfoBeta 引用变化
        │  gnssData 父组件将 navInfoBeta 作为 prop 传入 GaoDeMap
        │  GaoDeMap 再传入 NavGuidanceInfo（:navInfoBeta="navInfoBeta"）
        ▼
④ NavGuidanceInfo.vue — computed: parsedNavInfo
        │  raw = navInfoBeta.data.frame_id  ← JSON 字符串
        │  try { return JSON.parse(raw) } catch { return null }
        │  ⚠️ 只执行一次，后续所有 computed 复用此结果
        ▼
⑤ computed: hasNavData
        │  检查 parsedNavInfo 是否有 guide_action_data / tts_text 等关键字段
        │  false → 面板隐藏，链路结束
        ▼
⑥ computed: vehicleGuidance（核心解析，读 parsedNavInfo，无重复 parse）
        │
        ├── guideAction    ← guide_action_data.guide_action.value（枚举 0~10）
        ├── nextGuideAction← next_guide_action_data.guide_action.value
        ├── distanceToNext ← distance_to_next_guidance_data.distance_to_next_guidance（米）
        ├── ttsText        ← tts_text（string 或 string[]，拼接）
        │
        ├── highlightLaneList ← next_intersection.lane_guidance_list
        │     与 highlight_lane_list 对比生成 { action, hl } 列表
        │     过滤: action !== 255（无效）且 action !== 0（无方向）
        │     hl > 0 → 高亮样式；hl == 0 → 普通样式（均显示）
        │
        ├── recommendLaneList ← next_intersection.recommend_lane_list（过滤 255）
        │
        ├── aheadIntersections ← 合并 next_intersection + ahead_intersections
        │     按 segment_index/link_index 去重
        │     每个路口包含完整 lanes 列表
        │
        └── relLoc         ← relative_location_on_route（7 个字段）
        ▼
⑦ computed: guideActionInfo / nextGuideActionInfo / formattedGuidanceDistance
        │  查 actionMap 表 → { icon: SVG, text: '左转', color: '#409eff' }
        │  距离格式化: >= 1000m 显示 km，否则显示 m（整数）
        ▼
⑧ 模板渲染
        │  主引导区: 距离 + 动作图标 + TTS 文本
        │  车道引导区: v-for highlightLaneList → 图标 + :class="{ '--hl': hl > 0 }"
        │  推荐车道: recommend_lane_list 高亮框
        │  前方路口: v-for aheadIntersections → 路口标签 + lanes
        │  Ego 位置: 7 个字段数值展示
        ▼
        🗺️ 右下角导航面板实时更新
```

---

## 完整数据链路（SDRoute 导航路线）

```
① ROS topic: /system_manager/map_manager/sdroute_request
        │  后端 socket.io 转发
        ▼
② gnssData.vue — socket.on('sdroute_data', msg)
        │  this.sdRouteData = msg（直接传递，不预解析）
        ▼
③ Vue 响应系统 — sdRouteData prop 传入 GaoDeMap
        ▼
④ GaoDeMap/index.vue — watch: sdRouteData(newVal)
        │  调用 drawSdroute(newVal)
        ▼
⑤ drawSdroute(data)
        │  frame = JSON.parse(data.data.frame_id)  ← 路径较大（数百点），parse 一次
        │  path = frame.sdroute_list[0].pnts.map(p => [p.x, p.y])
        │    p.x = 经度（GCJ-02），p.y = 纬度
        │
        ├─ sdRoutePolyline 已存在 → sdRoutePolyline.setPath(path)  ← 复用，避免重建
        └─ 首次 → new AMap.Polyline({
              path,
              strokeColor: '#00dd44',  ← 亮绿，与轨迹线（橙/绿/蓝/紫）明显区分
              strokeWeight: 8,         ← 8px vs 轨迹线 4px，视觉优先级更高
              strokeOpacity: 0.9,
              showDir: true,
              dirColor: '#fff',
              zIndex: 50               ← 在轨迹线上层渲染
           })
        ▼
        🗺️ 地图上绘制/更新导航规划路线（亮绿粗线）
```

---

## 地图初始化与生命周期

```
组件 mounted()
    │
    ├── 检查 isMapReady → false，所有后续渲染操作均 guard
    │
    └── AMapLoader.load({ key, version: '2.0', plugins: [...] })
            │  [进度 30%] 创建 AMap.Map('container', { zoom:18, viewMode:'2D' })
            │  [进度 30%] 绑定 map.on('click', handleMapClick)
            │  [进度 30%] 创建 4 条 AMap.Polyline（轨迹线，暂无路径）
            │
            │  [进度 50%] 监听 tiles_loaded / mapmove 更新瓦片加载进度条
            │
            └── map.on('complete')  ← 瓦片全部加载完成
                    │  [进度 95%] this.$nextTick → map.setZoom(getZoom())（容器尺寸重算）
                    │  setTimeout(200ms) → [进度 100%]
                    │  setTimeout(300ms) →
                    │      isMapReady = true  ← 解除所有 guard
                    │      enqueueVehicleData(formattedInsdData)
                    │      enqueueVehicleData(formattedSensorData)   ← 回放已缓存的初始数据
                    │      enqueueVehicleData(formattedMbData)
                    │      enqueueVehicleData(formattedHmiData)
                    ▼
                🗺️ 地图就绪，开始正常渲染

组件 beforeDestroy()
    ├── 清除 vehicleFlushTimer / viewAdjustTimer（防止内存泄漏）
    ├── 销毁所有 AMap.Marker（4 个车标 + 4 个起点标记 + 测距标记）
    ├── 销毁所有 AMap.Polyline（4 条轨迹 + 1 条 SDRoute + 测距线）
    └── map.destroy()  ← 释放高德地图实例
```

**isMapReady 防护**：所有 `renderMapMarkers()` / `setPath()` / `setPosition()` 调用前均检查：

```js
if (!this.isMapReady || !this.map) return
```

确保地图未就绪时的 WebSocket 数据不会触发 API 调用报错，数据被 `carPositionStore` 缓存，待就绪后通过 `enqueueVehicleData` 回放。

---

## 车辆标记与方向渲染

### 车标图标

使用 SVG 内联 Base64 编码的 `AMap.Icon`，四路数据源各用独立颜色的车辆轮廓图标：

```js
new AMap.Marker({
  position: [lng, lat],
  icon: new AMap.Icon({
    size: new AMap.Size(40, 40),
    image: 'data:image/svg+xml;base64,' + btoa(svgString),
    imageSize: new AMap.Size(40, 40)
  }),
  offset: new AMap.Pixel(-20, -20),  // 图标中心对齐坐标点
  zIndex: 100,
  angle: 0
})
```

### 方位角算法

基于球面三角学（Haversine 变形），计算从上一帧到当前帧的真北方位角：

```js
_calcBearing(lng1, lat1, lng2, lat2) {
  const toRad = d => d * Math.PI / 180
  const dLon = toRad(lng2 - lng1)
  const y = Math.sin(dLon) * Math.cos(toRad(lat2))
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2))
          - Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon)
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360  // [0, 360)
}
```

取轨迹数组倒数第二点和最后一点作为输入（至少 2 点时才计算）。

### 角度阈值过滤

```js
_applyAngle(marker, newAngle, key, threshold = 10) {
  const cur = this.lastAngle[key]       // 读本地缓存，不调 marker.getAngle()
  if (cur === null) {                    // 首次，直接设置
    marker.setAngle(newAngle)
    this.lastAngle[key] = newAngle
    return
  }
  // 处理 359°→1° 跨越（差值不超过 180°）
  const diff = Math.abs(((newAngle - cur + 540) % 360) - 180)
  if (diff >= threshold) {
    marker.setAngle(newAngle)
    this.lastAngle[key] = newAngle
  }
  // diff < 10° → 静默跳过，车标不抖动
}
```

---

## 历史轨迹绘制

### 四条轨迹线参数

| 轨迹 | 颜色 | 线宽 | 透明度 | 方向箭头 |
|------|------|------|--------|---------|
| sensor | `#F95D00` 橙 | 4px | 0.75 | ✅ 白色 |
| mb | `#00ad7c` 绿 | 4px | 0.75 | ✅ 白色 |
| insd | `#1890ff` 蓝 | 4px | 0.75 | ✅ 白色 |
| hmi | `#e883fc` 紫 | 4px | 0.75 | ✅ 白色 |

导航路线（SDRoute）线宽 8px、透明度 0.9，与轨迹线形成明显视觉层次对比。

### 轨迹点管理策略

```
新坐标到达
    │
    ├─ 与轨迹末点相同？→ 跳过（上游去重后此处几乎不触发）
    │
    ├─ push 到 sensorHistoryPath
    │
    ├─ length > 500？→ shift()  ← O(1) 原地滑动窗口
    │
    └─ length !== _lastSensorPathLen？
          ├─ YES → _lastSensorPathLen = length; passedPolyline.setPath(path)
          └─ NO  → 跳过（点数未变，无需重绘）
```

**起点标记**：首次 push 时在轨迹起始点放置颜色对应的圆点 SVG 标记，记录轨迹起点，组件销毁时一并清除。

### 路径显隐控制

```js
// showPath 开关一键控制全部 4 条轨迹线
togglePathVisibility(visible) {
  [passedPolyline, passedPolylineMb, passedPolylineInsd, passedPolylineHmi]
    .forEach(p => p[visible ? 'show' : 'hide']())
}
```

---

## 视角自动跟踪

```
renderMapMarkers() 完成后
    └── requestViewAdjustment()
            │
            │  [过滤] |lng - lastPos.lng| < 0.00005° (≈5m)
            │         && |lat - lastPos.lat| < 0.00005°
            │         → return（位移太小，不触发）
            │
            └── debouncedViewAdjust()  ← 300ms 防抖
                    └── adjustMapView()
                            │
                            │  [过滤] isMouseOverMap === true
                            │         → pendingViewAdjustment = true; return
                            │         （用户正在操作地图，挂起）
                            │
                            │  [过滤] track === false → return
                            │
                            │  收集所有 enabledSources 中的有效坐标
                            │
                            ├─ positions.length === 1
                            │    map.panTo(position, 500)
                            │    if getZoom() < 18 → map.setZoom(18)
                            │
                            └─ positions.length > 1
                                 O(n) bounding box:
                                   minLng/maxLng/minLat/maxLat
                                 map.setBounds(bounds, false, [80,80,80,80])

onMouseLeave()
    └── adjustMapView()  ← 鼠标离开后立即补执行一次挂起的调整
```

---

## 导航引导面板（NavGuidanceInfo）

### 面板结构

```
NavGuidanceInfo（右下角覆盖层）
├── 主引导区
│   ├── 距离标签（formattedGuidanceDistance）
│   ├── 当前动作图标 + 文字（guideActionInfo）
│   ├── 下一动作图标（nextGuideActionInfo）
│   └── TTS 文本
├── 车道引导区（highlightLaneList）
│   └── 每条车道: 动作图标 + 高亮/普通样式
├── 推荐车道（recommendLaneList）
├── 前方路口列表（aheadIntersections）
│   └── 每个路口: label(seg/lnk) + lanes
└── Ego 位置（relLoc 7 字段）
```

### 动作枚举（guide_action）

| 值 | 动作 | 颜色 | 图标 |
|----|------|------|------|
| 0 | 直行 | 绿 `#67c23a` | zhihang.svg |
| 1 | 右转 | 蓝 `#409eff` | youzhuan.svg |
| 2 | 左转 | 蓝 `#409eff` | zuozhuan.svg |
| 3 | 向右前方 | 蓝 | youqianfang.svg |
| 4 | 向左前方 | 蓝 | zuoqianfang.svg |
| 5 | 掉头 | 橙 `#e6a23c` | zuodiaotou.svg |
| 6 | 到达终点 | 绿 | zhongdian.svg |
| 7 | 进入环岛 | 蓝 | huandao.svg |
| 8 | 离开环岛 | 蓝 | youdiaotou.svg |
| 9 | 到达途经点 | 绿 | tujingdian.svg |
| 10 | 进入收费站 | 橙 | shoufeizhan.svg |

### 车道引导枚举（lane_guidance）

| 值 | 含义 | 值 | 含义 |
|----|------|----|------|
| 0 | 无方向（过滤不展示）| 9 | 左后方 |
| 1 | 直行 | 10 | 直行或左转 |
| 2 | 左转 | 11 | 直行或右转 |
| 3 | 右转 | 12 | 左转或掉头 |
| 4 | 右前方 | 13 | 掉头 |
| 5 | 左前方 | 14 | 直行或掉头 |
| 6/7 | 直行（扩展值）| 15 | 直行或左前 |
| 8 | 右后方 | 16 | 直行或右前 |

### 路线位置字段（relLoc）

| 字段 | 含义 |
|------|------|
| `valid` | 位置是否有效 |
| `offset` | 在当前 link 上的偏移（米）|
| `link_index` | 当前所在 link 序号 |
| `available` | 数据是否可用 |
| `ori_link_offset` | 原始 link 偏移 |
| `ori_cur_step_id` | 原始当前步骤 ID |
| `ori_cur_link_id_in_step` | 步骤内的原始 link ID |

---

## 点击测距

```
用户点击"测距"按钮
    └── toggleClickMeasure()
            track = false（关闭跟踪，防止地图跳动干扰测距）
            clickMeasureEnabled = !clickMeasureEnabled
            disabled → resetClickMeasure()（清除所有标记）

用户点击地图（clickMeasureEnabled = true）
    └── handleMapClick(e)
            │  提取 e.lnglat.lng / lat
            │  有效性校验（非 NaN，范围合法）
            │
            ├─ clickPoints.length >= 2 → resetClickMeasure()（第三次点击重置）
            │
            ├─ push 蓝色圆点 Marker
            │
            └─ clickPoints.length === 2？
                  YES:
                    p1.distance(p2)  ← 高德 AMap.LngLat 椭球模型测距（米）
                    clickDistanceMeters = 结果
                    clickLine.setPath([p1, p2])  ← 更新/创建连线
                  NO:
                    clickDistanceMeters = null
                    clickLine.setPath([])

距离展示格式:
    < 1000m  →  "xxx.xx m"
    ≥ 1000m  →  "x.xxx km"
```

---

## 数据源开关

右上角四个 Checkbox，每个对应一路数据源：

| 操作 | 效果 |
|------|------|
| 关闭 | polyline.hide() + marker.hide() + startMarker.hide() |
| 开启 | polyline.show() + marker.show() + startMarker.show() + 清除 lastAdjustPositions[source] + debouncedViewAdjust()（重新计算视角）|

右侧实时显示该数据源当前经纬度坐标（6 位小数精度，约 0.1m 分辨率）。

---

## 性能优化汇总

| 优化点 | 位置 | 手段 | 效果 |
|--------|------|------|------|
| WebSocket 坐标去重 | gnssData.vue | 比对 `cur.lng === lng` | 减少 50~80% 无效 Vue 响应 |
| nav_info_beta frame_id 去重 | gnssData.vue | 比对 `frame_id` 字符串引用 | 减少 NavGuidanceInfo computed 重算 |
| 渲染节流 200ms | scheduleMapRender | 时间戳比对 + 尾部定时器 | 最高 5 帧/秒，尾帧不丢 |
| watch 不使用 deep:true | GaoDeMap watch | 简写形式，浅比较引用 | 避免 4 个 prop 深度遍历 |
| setPath 按需调用 | 轨迹追加逻辑 | `_lastSensorPathLen` 点数对比 | 坐标未变时不触发 Polyline 重算 |
| shift() 滑动窗口 | 轨迹追加逻辑 | 原地 shift，O(1) | 避免 slice() 每次重建数组产生 GC |
| parsedNavInfo 单次解析 | NavGuidanceInfo computed | computed 分层，一次 parse 多次用 | JSON.parse 只执行一次 |
| 角度本地缓存 | _applyAngle | `lastAngle[key]` | 不调 getAngle() API |
| 角度阈值过滤 10° | _applyAngle | 差值判断 | 车标旋转调用减少约 80% |
| 视角位移阈值 ≈5m | requestViewAdjustment | 经纬度差值 < 0.00005° | panTo/setBounds 调用频率大幅降低 |
| 视角防抖 300ms | debouncedViewAdjust | 标准 debounce | 快速移动时只触发最后一次 |
| O(n) bounding box | adjustMapView | min/max 遍历替代两两距离 | O(n²) → O(n)，n ≤ 4 |
| isMapReady guard | 全部渲染函数 | 前置条件检查 | 初始化期间不调 API 报错 |
| Polyline 复用 | drawSdroute | setPath 替代重新 new | 避免频繁创建/销毁 DOM 对象 |

---

## 设计权衡说明

### 1. Polyline 全量 setPath

高德 JS API v2 无官方增量接口（无 `addPoint()`），只有 `setPath(array)`。  
已通过 `_lastSensorPathLen` 对比点数，**仅在点数变化时才调 `setPath()`**，结合上游去重，实际调用频率与"有新坐标到来"等价，无额外损耗。

### 2. sdroute JSON.parse 时机

sdroute frame_id 含数百个路径点，体积较大。当前在 `drawSdroute()` 内 parse，若 gnssData 侧已做 frame_id 引用比对去重，路径不变时 watch 不触发，parse 调用次数极少，可忽略。若未来需要进一步优化，可在 gnssData 侧预 parse 后传递对象。

### 3. map.complete 中的 setZoom

`setZoom(getZoom())` 是高德官方推荐的容器尺寸重算触发手段（DOM resize 后地图瓦片不自动重绘）。v2 已提供 `map.resize()` API 语义更清晰，可等价替换：

```js
this.$nextTick(() => {
  this.map.resize()   // 语义等价于 setZoom(getZoom())
})
```

### 4. vehicleThrottleMs = 200ms

WebSocket 推送频率 10~20 Hz，200ms 节流限制渲染 5 帧/秒，视觉流畅且不产生 DOM 压力。推送频率低于 5 Hz 时，节流器自动退化为直通（`elapsed >= 200ms` 始终成立），不引入额外延迟。

### 5. 视角跟踪与测距的互斥

开启测距时强制关闭跟踪（`track = false`），防止视角自动调整打断用户的测距操作。这是唯一一个主动修改 `track` 状态的入口，其余地方只读取。
