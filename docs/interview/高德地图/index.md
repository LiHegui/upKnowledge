# 高德地图（AMap JS API 2.0）技术要点

> 覆盖高德地图的整体认知、渲染机制、性能优化、常见功能实现、坑点与框架集成，附带可运行的真实代码。

---

## 一、整体认知

### 1.1 API 版本对比

| 维度 | 1.4.x（旧）| 2.0（现行）|
|------|-----------|----------|
| 渲染引擎 | Canvas 2D | WebGL（JSAPI 2.0 全面升级）|
| 加载方式 | `<script>` 同步引入 | `AMapLoader` 异步加载 |
| 大数据性能 | 差 | ✅ 显著提升（GPU 渲染）|
| 3D 能力 | ❌ | ✅ 支持楼块、倾斜摄影 |
| 安全密钥 | 无 | ✅ 需配置 `securityJsCode` |
| 推荐程度 | ❌ 已淘汰 | ✅ 新项目必须用 |

> ⚠️ **注意**：2021 年后高德要求所有项目同时配置 `key` 和 `securityJsCode`，少一个会报错。

---

### 1.2 核心概念层次图

```
Map（地图实例）
├── Layer（图层）            — TileLayer / WMS / 自定义图层
│   ├── 底图图层             — 默认瓦片图层
│   ├── 卫星图层             — SatelliteLayer
│   └── 路网图层             — RoadNetLayer
├── Overlay（覆盖物）        — 绘制在地图上的元素
│   ├── Marker               — 点标注
│   ├── Polyline             — 折线
│   ├── Polygon              — 多边形
│   ├── Circle               — 圆形
│   └── InfoWindow           — 信息窗体
└── Plugin（插件）           — 功能扩展
    ├── AMap.Scale           — 比例尺
    ├── AMap.ToolBar         — 工具条
    ├── AMap.MarkerClusterer — 点聚合
    └── AMap.HeatMap         — 热力图
```

---

### 1.3 坐标系（高频坑点）

国内有三种坐标系，混用必偏移：

| 坐标系 | 使用场景 | 说明 |
|--------|---------|------|
| **WGS84** | GPS 设备、Google Maps 国际版 | 国际标准 |
| **GCJ-02（火星坐标）** | 高德、腾讯地图 | 国家标准，有加密偏移 |
| **BD-09** | 百度地图 | 百度自有，再次偏移 |

```js
// 高德地图使用 GCJ-02，GPS 定位是 WGS84 → 必须转换
// 高德提供官方转换工具
AMap.convertFrom(
  [116.3, 39.9],      // WGS84 坐标
  'gps',              // 来源：gps / baidu / mapbar
  (status, result) => {
    if (status === 'complete') {
      const lnglat = result.locations[0]  // GCJ-02 坐标
      console.log(lnglat.lng, lnglat.lat)
    }
  }
)

// 如果后端存的是 WGS84（GPS原始坐标），展示前必须转换
// 否则标注会偏移几百米
```

---

## 二、初始化与基础配置

### 2.1 标准初始化流程

```bash
npm install @amap/amap-jsapi-loader
```

```typescript
// map.ts — 推荐封装成单例
import AMapLoader from '@amap/amap-jsapi-loader'

// 必须在 load 之前设置（安全密钥）
window._AMapSecurityConfig = {
  securityJsCode: import.meta.env.VITE_AMAP_SECURITY_CODE,
}

let amapInstance: typeof AMap | null = null

export async function loadAMap(): Promise<typeof AMap> {
  if (amapInstance) return amapInstance

  amapInstance = await AMapLoader.load({
    key: import.meta.env.VITE_AMAP_KEY,
    version: '2.0',
    plugins: [
      'AMap.Scale',
      'AMap.ToolBar',
      'AMap.MarkerClusterer',
      'AMap.HeatMap',
      'AMap.Geocoder',
      'AMap.AutoComplete',
      'AMap.PlaceSearch',
      'AMap.Driving',
      'AMap.Walking',
    ],
  })

  return amapInstance
}
```

```typescript
// 创建地图
export async function createMap(container: string | HTMLElement, options = {}) {
  const AMap = await loadAMap()

  const map = new AMap.Map(container, {
    zoom: 12,                           // 初始缩放级别（3~20）
    center: [116.397428, 39.90923],     // 初始中心点（北京）
    mapStyle: 'amap://styles/normal',   // 地图样式
    resizeEnable: true,                 // 自适应容器大小变化
    rotateEnable: false,                // 禁止旋转（防止误操作）
    pitchEnable: false,                 // 禁止倾斜
    // viewMode: '3D',                  // 开启 3D 视图
    ...options,
  })

  return map
}
```

---

### 2.2 常用 Map 配置项速查

```typescript
new AMap.Map('container', {
  // ── 视野 ──
  zoom: 12,                     // 缩放级别
  zooms: [3, 18],               // 允许的缩放范围
  center: [lng, lat],           // 中心点
  rotation: 0,                  // 旋转角度（0~360）
  pitch: 0,                     // 俯仰角（0~83，仅 3D 模式）

  // ── 交互 ──
  dragEnable: true,             // 是否允许拖拽
  zoomEnable: true,             // 是否允许缩放
  doubleClickZoom: true,        // 双击缩放
  scrollWheel: true,            // 滚轮缩放
  touchZoom: true,              // 触摸缩放（移动端）

  // ── 显示 ──
  mapStyle: 'amap://styles/dark', // 暗色主题
  showLabel: true,              // 显示路网标签
  showBuildingBlock: false,     // 显示楼块（3D 模式）
  showIndoorMap: false,         // 显示室内图

  // ── 性能 ──
  resizeEnable: true,           // 自动监听容器尺寸变化
})
```

---

## 三、渲染机制

### 3.1 AMap 2.0 渲染架构

```
用户代码（JS）
   │
   ▼
高德渲染引擎（WebGL）
   ├── 瓦片图层          → GPU 渲染矩形瓦片贴图
   ├── Overlay 图层      → WebGL 绘制几何图形
   └── Canvas 标注层     → Canvas 2D 绘制 Marker 文字
```

**为什么 2.0 比 1.4 快？**

- 1.4：所有渲染走 Canvas 2D，大量标注时主线程阻塞
- 2.0：瓦片和几何图形走 WebGL（GPU 并行），只有文字标注走 Canvas 2D

**缩放级别与瓦片加载：**

```
缩放级别 zoom 每变化 1 级
→ 显示面积变化 4 倍（2^2）
→ 瓦片数量变化 4 倍
→ 网络请求数量和渲染压力同步放大
```

### 3.2 图层叠加顺序（zIndex）

```js
// 覆盖物通过 zIndex 控制层叠顺序，数值越大越靠上
const marker = new AMap.Marker({
  position: [116.4, 39.9],
  zIndex: 100,    // 默认值约 12
})

// 图层也有 zIndex
const satelliteLayer = new AMap.TileLayer.Satellite({ zIndex: 2 })
const roadLayer = new AMap.TileLayer.RoadNet({ zIndex: 3 })

map.add([satelliteLayer, roadLayer])
```

---

## 四、性能优化

### 4.1 大量点标注 —— 必须用聚合

**问题：** 直接 `new AMap.Marker()` 创建超过 1000 个点，页面必卡。

**原因：** 每个 Marker 是一个独立 DOM 节点 + Canvas 绘制，节点数量线性增长。

**解决：MarkerClusterer（点聚合）**

```typescript
import { loadAMap } from './map'

async function renderClusteredMarkers(map: AMap.Map, points: { lng: number; lat: number; id: string }[]) {
  const AMap = await loadAMap()

  // 创建所有原始 Marker（此时不直接加到地图，交给 Clusterer 管理）
  const markers = points.map(p =>
    new AMap.Marker({
      position: new AMap.LngLat(p.lng, p.lat),
      extData: p,  // 存储原始数据，点击时取出
    })
  )

  // 创建聚合器
  const cluster = new AMap.MarkerClusterer(map, markers, {
    gridSize: 80,           // 聚合格子大小（像素），越大聚合越多
    maxZoom: 14,            // 超过此 zoom 级别不再聚合
    renderClusterMarker(context) {
      // 自定义聚合点样式
      const { count, marker } = context
      const div = document.createElement('div')
      div.className = 'cluster-marker'
      div.innerHTML = `<span>${count}</span>`
      marker.setContent(div)
    },
    renderMarker(context) {
      // 单个点的自定义样式
      const { data, marker } = context
      marker.setIcon(new AMap.Icon({
        size: new AMap.Size(24, 24),
        image: data[0].extData.isHot ? '/icons/hot.png' : '/icons/normal.png',
      }))
    },
  })

  return cluster
}
```

**效果对比：**

| 方式 | 1000个点 FPS | 10000个点 FPS |
|------|------------|-------------|
| 直接 Marker | ~15 fps（卡顿）| 页面崩溃 |
| MarkerClusterer | ~55 fps | ~45 fps |

---

### 4.2 海量点 —— MassMarks（更快）

当点只需要展示图标、不需要自定义 DOM 时，用 `MassMarks`，性能是 Marker 的 10 倍以上：

```typescript
// MassMarks：纯 Canvas 绘制，无 DOM 节点，支持百万级数据
const massMarks = new AMap.MassMarks(points, {
  zIndex: 111,
  zooms: [3, 19],    // 在哪些缩放级别显示
  style: {
    url: '/icons/dot.png',
    size: new AMap.Size(11, 11),
    anchor: new AMap.Pixel(5, 5),
  },
})

massMarks.setMap(map)

// 点击事件（通过碰撞检测，不是 DOM 事件）
massMarks.on('click', (e) => {
  const point = e.data  // 被点击的数据点
  console.log(point)
})
```

---

### 4.3 覆盖物批量操作

```typescript
// ❌ 错误：每次 add 都触发重绘
markers.forEach(m => map.add(m))

// ✅ 正确：一次性批量添加（只触发一次重绘）
map.add(markers)

// 批量删除同理
map.remove(markers)

// 清空所有覆盖物
map.clearMap()
```

---

### 4.4 视口裁剪 —— 只渲染可视区域内的点

```typescript
// 监听地图移动/缩放，动态更新可视区域内的点
function renderVisibleMarkers(map: AMap.Map, allPoints: Point[]) {
  let visibleMarkers: AMap.Marker[] = []

  function update() {
    const bounds = map.getBounds()  // 获取当前可视区域

    // 过滤出在视口内的点
    const visiblePoints = allPoints.filter(p =>
      bounds.contains(new AMap.LngLat(p.lng, p.lat))
    )

    // 清除旧的，渲染新的
    map.remove(visibleMarkers)
    visibleMarkers = visiblePoints.map(p => new AMap.Marker({ position: [p.lng, p.lat] }))
    map.add(visibleMarkers)
  }

  // 节流：移动结束后才更新（不要监听 move，那个触发太频繁）
  map.on('moveend', update)
  map.on('zoomend', update)
  update()  // 初始化执行一次
}
```

---

### 4.5 事件监听的节流与销毁

```typescript
import { throttle } from 'lodash-es'

// 地图 mousemove 是高频事件，必须节流
const handleMouseMove = throttle((e: AMap.MapsEvent) => {
  console.log(e.lnglat)
}, 100)

map.on('mousemove', handleMouseMove)

// 组件销毁时必须移除监听器
onUnmounted(() => {
  map.off('mousemove', handleMouseMove)
  map.destroy()   // ← 非常重要！销毁地图实例，释放 WebGL 上下文
})
```

> ⚠️ **最常见内存泄漏原因：组件销毁后没有调用 `map.destroy()`，WebGL 上下文不释放，越用越卡。**

---

### 4.6 瓦片加载优化

```typescript
new AMap.Map('container', {
  // 使用高德 CDN（默认已启用）
  // 如果是内网部署，可以配置离线瓦片
  WebGLParams: {
    preserveDrawingBuffer: false,  // 默认关闭，开启会降低性能
  },
})

// 预加载周边瓦片（提前加载用户可能移动到的区域）
map.setZoomAndCenter(14, [116.4, 39.9])  // 缩放+移动同时执行，只触发一次瓦片加载
```

---

## 五、常见功能实现

### 5.1 Marker 标注（自定义样式）

```typescript
// 方式一：自定义图标
const marker = new AMap.Marker({
  position: [116.4, 39.9],
  icon: new AMap.Icon({
    size: new AMap.Size(40, 50),
    image: '/icons/marker-red.png',
    imageSize: new AMap.Size(40, 50),
    imageOffset: new AMap.Pixel(0, 0),
  }),
  offset: new AMap.Pixel(-20, -50),  // 锚点偏移（使底部中心对准坐标点）
  title: '悬停提示文字',
  cursor: 'pointer',
  zIndex: 100,
  extData: { id: 'poi-001', name: '目标位置' },  // 自定义数据，点击时取出
})

// 方式二：完全自定义 HTML（DOM Marker）
const customMarker = new AMap.Marker({
  position: [116.4, 39.9],
  content: `
    <div class="custom-marker">
      <img src="/icons/store.svg" />
      <span>星巴克</span>
    </div>
  `,
  offset: new AMap.Pixel(-30, -40),
})

map.add([marker, customMarker])

// 点击事件
marker.on('click', (e) => {
  const data = e.target.getExtData()
  console.log('点击了：', data.name)
})
```

---

### 5.2 InfoWindow 信息窗体

```typescript
// 创建信息窗体（可以是纯 HTML）
const infoWindow = new AMap.InfoWindow({
  content: `
    <div class="info-window">
      <h3>北京故宫</h3>
      <p>北京市东城区景山前街4号</p>
      <button onclick="window.handleNavigate()">导航到这里</button>
    </div>
  `,
  offset: new AMap.Pixel(0, -30),  // 相对 Marker 的偏移
  anchor: 'bottom-center',          // 锚点位置
  closeWhenClickMap: true,          // 点击地图时关闭
})

// 在指定坐标打开
infoWindow.open(map, [116.4, 39.9])

// 也可以绑定到 Marker 上
marker.on('click', () => {
  infoWindow.open(map, marker.getPosition())
})

// 关闭
infoWindow.close()
```

---

### 5.3 地理编码 / 逆地理编码

```typescript
// 地理编码：地址 → 坐标
async function geocode(address: string): Promise<AMap.LngLat | null> {
  return new Promise(resolve => {
    const geocoder = new AMap.Geocoder({ city: '全国' })
    geocoder.getLocation(address, (status, result) => {
      if (status === 'complete' && result.geocodes.length > 0) {
        resolve(result.geocodes[0].location)
      } else {
        resolve(null)
      }
    })
  })
}

// 逆地理编码：坐标 → 地址
async function reverseGeocode(lnglat: [number, number]): Promise<string> {
  return new Promise(resolve => {
    const geocoder = new AMap.Geocoder()
    geocoder.getAddress(lnglat, (status, result) => {
      if (status === 'complete') {
        resolve(result.regeocode.formattedAddress)
      } else {
        resolve('未知地址')
      }
    })
  })
}

// 使用示例
const lnglat = await geocode('北京市朝阳区三里屯太古里')
// → LngLat { lng: 116.xxx, lat: 39.xxx }

const address = await reverseGeocode([116.454, 39.924])
// → "北京市朝阳区三里屯路"
```

---

### 5.4 地点搜索（自动补全）

```typescript
// 自动补全：输入关键词，返回候选地点列表
function initAutoComplete(inputEl: HTMLInputElement, onSelect: (poi: any) => void) {
  const autoComplete = new AMap.AutoComplete({
    input: inputEl,       // 绑定到 input 元素
    city: '全国',
    citylimit: false,
  })

  autoComplete.on('select', (e) => {
    const poi = e.poi
    onSelect(poi)

    // 定位到选中的地点
    if (poi.location) {
      map.setCenter(poi.location)
      map.setZoom(16)
    }
  })
}

// 周边搜索（搜索附近的 POI）
async function searchNearby(keyword: string, center: [number, number], radius = 1000) {
  return new Promise((resolve) => {
    const placeSearch = new AMap.PlaceSearch({
      type: '餐饮服务',    // POI 类型
      pageSize: 10,
      pageIndex: 1,
    })

    placeSearch.searchNearBy(keyword, center, radius, (status, result) => {
      if (status === 'complete') {
        resolve(result.poiList.pois)
      } else {
        resolve([])
      }
    })
  })
}
```

---

### 5.5 路线规划（驾车 / 步行 / 骑行）

```typescript
// 驾车路线规划
async function planDrivingRoute(
  origin: [number, number],
  destination: [number, number],
  map: AMap.Map
) {
  return new Promise((resolve) => {
    const driving = new AMap.Driving({
      map,                      // 自动在地图上绘制路线
      panel: 'route-panel',     // 路线详情面板容器 id（可选）
      policy: AMap.DrivingPolicy.LEAST_TIME,  // 策略：最短时间
      // policy: AMap.DrivingPolicy.LEAST_FEE,  // 策略：避免收费
    })

    driving.search(
      new AMap.LngLat(...origin),
      new AMap.LngLat(...destination),
      (status, result) => {
        if (status === 'complete') {
          const route = result.routes[0]
          resolve({
            distance: route.distance,     // 米
            time: route.time,             // 秒
            steps: route.steps,           // 路线步骤
          })
        }
      }
    )
  })
}

// 步行规划（逻辑类似，换成 AMap.Walking）
// 骑行规划（AMap.Riding）
// 公交规划（AMap.Transfer）
```

---

### 5.6 热力图

```typescript
// 展示某区域的数据密度（如用户分布、订单热度）
async function renderHeatMap(map: AMap.Map, data: { lng: number; lat: number; count: number }[]) {
  const heatmapData = data.map(p => ({
    lng: p.lng,
    lat: p.lat,
    count: p.count,
  }))

  const heatmap = new AMap.HeatMap(map, {
    radius: 25,            // 热点半径（像素）
    opacity: [0, 0.8],     // [最小透明度, 最大透明度]
    gradient: {            // 颜色梯度
      0.4: 'blue',
      0.65: 'lime',
      1: 'red',
    },
  })

  heatmap.setDataSet({
    data: heatmapData,
    max: 100,              // 最大值（用于归一化颜色）
  })

  return heatmap
}
```

---

### 5.7 绘制工具（让用户在地图上画图形）

```typescript
// 让用户手动圈选区域（电子围栏、配送范围等场景）
function initDrawTool(map: AMap.Map, onComplete: (path: AMap.LngLat[]) => void) {
  const mouseTool = new AMap.MouseTool(map)

  // 画矩形
  // mouseTool.rectangle()

  // 画圆形
  // mouseTool.circle()

  // 画多边形（最常用）
  mouseTool.polygon({
    strokeColor: '#3498db',
    strokeWeight: 3,
    strokeOpacity: 0.8,
    fillColor: '#3498db',
    fillOpacity: 0.2,
  })

  // 绘制完成回调
  mouseTool.on('draw', (e) => {
    const path = e.obj.getPath()  // 顶点坐标数组
    onComplete(path)
    mouseTool.close(true)  // 关闭绘制工具（true = 保留已画图形）
  })
}
```

---

### 5.8 实时轨迹播放（外卖/快递跑腿场景）

```typescript
// 骑手实时位置轨迹播放
function playTrack(map: AMap.Map, trackPoints: [number, number][]) {
  // 画出完整轨迹线（灰色）
  const trackLine = new AMap.Polyline({
    path: trackPoints,
    strokeColor: '#999',
    strokeWeight: 4,
    strokeOpacity: 0.5,
  })
  map.add(trackLine)

  // 已走过的路线（蓝色）
  const passedLine = new AMap.Polyline({
    path: [],
    strokeColor: '#3498db',
    strokeWeight: 4,
  })
  map.add(passedLine)

  // 骑手 Marker
  const riderMarker = new AMap.Marker({
    position: trackPoints[0],
    icon: '/icons/rider.png',
    offset: new AMap.Pixel(-15, -30),
  })
  map.add(riderMarker)

  // 逐帧播放
  let index = 0
  const timer = setInterval(() => {
    if (index >= trackPoints.length) {
      clearInterval(timer)
      return
    }

    const current = trackPoints[index]
    riderMarker.setPosition(current)

    // 更新已走路线
    const passedPath = trackPoints.slice(0, index + 1)
    passedLine.setPath(passedPath)

    // 地图跟随（可选）
    map.setCenter(current)

    index++
  }, 300)  // 每 300ms 移动一个点，调整此值控制播放速度

  return () => clearInterval(timer)  // 返回停止函数
}
```

---

### 5.9 自定义地图样式

```typescript
// 使用高德编辑器的自定义样式（暗色、个性化）
new AMap.Map('container', {
  mapStyle: 'amap://styles/dark',           // 内置暗色
  // mapStyle: 'amap://styles/whitesmoke',  // 内置灰白
  // mapStyle: 'amap://styles/grey',        // 内置灰色
  // mapStyle: 'amap://styles/your-custom-style-id', // 你在高德控制台自定义的样式
})

// 动态切换样式
map.setMapStyle('amap://styles/dark')
```

---

## 六、框架集成

### 6.1 Vue3 组合式封装（完整版）

```typescript
// composables/useAMap.ts
import { ref, onMounted, onUnmounted, shallowRef } from 'vue'
import { loadAMap } from '@/utils/map'

export function useAMap(containerId: string, options = {}) {
  // shallowRef：地图实例不需要深度响应，用 shallowRef 避免性能损耗
  const map = shallowRef<AMap.Map | null>(null)
  const AMap = shallowRef<typeof window.AMap | null>(null)
  const isReady = ref(false)

  onMounted(async () => {
    AMap.value = await loadAMap()

    map.value = new AMap.value.Map(containerId, {
      zoom: 12,
      center: [116.397428, 39.90923],
      resizeEnable: true,
      ...options,
    })

    isReady.value = true
  })

  onUnmounted(() => {
    if (map.value) {
      map.value.destroy()   // ← 必须销毁！
      map.value = null
    }
  })

  return { map, AMap, isReady }
}
```

```vue
<!-- MapContainer.vue -->
<template>
  <div id="map-container" style="width: 100%; height: 600px;" />
  <div v-if="!isReady" class="loading">地图加载中...</div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useAMap } from '@/composables/useAMap'

const props = defineProps<{
  markers: { lng: number; lat: number; id: string }[]
}>()

const { map, AMap, isReady } = useAMap('map-container', {
  zoom: 13,
  center: [116.4, 39.9],
})

// 监听 markers 数据变化，动态更新标注
let markerInstances: AMap.Marker[] = []

watch([isReady, () => props.markers], ([ready, newMarkers]) => {
  if (!ready || !map.value) return

  // 清除旧标注
  map.value.remove(markerInstances)

  // 创建新标注
  markerInstances = newMarkers.map(m =>
    new AMap.value!.Marker({
      position: [m.lng, m.lat],
      extData: m,
    })
  )

  map.value.add(markerInstances)
}, { immediate: false })
</script>
```

---

### 6.2 React Hook 封装

```typescript
// hooks/useAMap.ts
import { useEffect, useRef, useState } from 'react'
import { loadAMap } from '@/utils/map'

export function useAMap(containerId: string, options = {}) {
  const mapRef = useRef<AMap.Map | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let mounted = true

    loadAMap().then(AMap => {
      if (!mounted) return  // 组件已卸载，不初始化

      mapRef.current = new AMap.Map(containerId, {
        zoom: 12,
        center: [116.397428, 39.90923],
        resizeEnable: true,
        ...options,
      })

      setIsReady(true)
    })

    return () => {
      mounted = false
      mapRef.current?.destroy()   // cleanup：销毁地图
      mapRef.current = null
    }
  }, [containerId])

  return { mapRef, isReady }
}

// 使用
function MapComponent({ markers }) {
  const { mapRef, isReady } = useAMap('map-container')

  useEffect(() => {
    if (!isReady || !mapRef.current) return

    const instances = markers.map(m => new AMap.Marker({ position: [m.lng, m.lat] }))
    mapRef.current.add(instances)

    return () => mapRef.current?.remove(instances)  // 清理
  }, [isReady, markers])

  return <div id="map-container" style={{ width: '100%', height: '600px' }} />
}
```

---

## 七、常见问题与解决方案

### 7.1 地图白屏

**原因排查：**

```
① key 或 securityJsCode 配置错误
   → 打开控制台，看是否有 "INVALID_USER_KEY" 错误

② 容器高度为 0
   → #container 的 height 必须是具体数值，不能是 100%（父容器未撑开）

③ AMap 还没加载完就初始化
   → 确保在 await AMapLoader.load() 之后再 new AMap.Map()

④ 同一个 key 同时在多个域名使用
   → 高德控制台检查 key 的绑定域名配置
```

```css
/* 最常见的白屏原因：高度未设置 */
#map-container {
  width: 100%;
  height: 600px;   /* 必须是固定高度或绝对高度 */
}
```

---

### 7.2 移动端高度适配

```typescript
// 移动端 100vh 在某些浏览器不准确（地址栏影响）
function setMapHeight(containerId: string) {
  const el = document.getElementById(containerId)
  if (!el) return

  // 使用 window.innerHeight 而不是 100vh
  el.style.height = `${window.innerHeight}px`

  // 监听屏幕旋转和窗口大小变化
  window.addEventListener('resize', () => {
    el.style.height = `${window.innerHeight}px`
    map.resize()   // 通知地图重新计算尺寸
  })
}
```

---

### 7.3 多实例冲突

```typescript
// ❌ 错误：同一个容器重复创建地图
const map1 = new AMap.Map('container')  // 第一次
const map2 = new AMap.Map('container')  // 第二次，会覆盖第一次，但第一次的 WebGL 上下文没释放

// ✅ 正确：用单例或创建前先销毁
let mapInstance: AMap.Map | null = null

function getOrCreateMap(container: string) {
  if (mapInstance) {
    mapInstance.destroy()
    mapInstance = null
  }
  mapInstance = new AMap.Map(container)
  return mapInstance
}
```

---

### 7.4 组件切换后重复初始化（Vue keep-alive 场景）

```typescript
// 使用 keep-alive 缓存地图组件时，地图不会被销毁
// 用 onActivated/onDeactivated 控制地图的刷新
import { onActivated, onDeactivated } from 'vue'

onActivated(() => {
  // 组件被激活：刷新地图尺寸（容器可能在隐藏期间尺寸变了）
  map.value?.resize()
})

onDeactivated(() => {
  // 组件被缓存：暂停地图的瓦片加载（节省带宽）
  // 高德暂无官方暂停 API，可以移除事件监听减少计算
})
```

---

### 7.5 标注点击无响应

```typescript
// 原因：Marker 被其他覆盖物遮挡，或 zIndex 太低
// 解决：提高 zIndex，或检查是否有 transparent 区域捕获了点击
const marker = new AMap.Marker({
  position: [116.4, 39.9],
  zIndex: 120,       // ← 提高层级
  cursor: 'pointer', // ← 鼠标样式提示
})

// 也要确保事件正确绑定（注意不要误用 .on 的 DOM 版本）
marker.on('click', handler)   // ✅ AMap 事件
// marker.addEventListener('click', handler)  // ❌ 这是 DOM 事件，对 Marker 无效
```

---

### 7.6 坐标系问题（标注偏移几百米）

```typescript
// 场景：后端存的是 GPS 原始坐标（WGS84），高德显示偏移
// 解决：在渲染前统一转换

async function convertWGS84ToGCJ02(points: { lng: number; lat: number }[]) {
  return new Promise<AMap.LngLat[]>((resolve) => {
    const lnglats = points.map(p => new AMap.LngLat(p.lng, p.lat))

    AMap.convertFrom(lnglats, 'gps', (status, result) => {
      if (status === 'complete') {
        resolve(result.locations)
      } else {
        // 转换失败，用原始坐标（会有偏移，但不至于崩溃）
        resolve(lnglats)
      }
    })
  })
}

// 使用：渲染前先转换
const gcjPoints = await convertWGS84ToGCJ02(rawPoints)
gcjPoints.forEach(lnglat => map.add(new AMap.Marker({ position: lnglat })))
```

---

## 八、性能问题排查工具

```typescript
// 1. 查看当前地图的覆盖物数量
console.log(map.getAllOverlays().length)

// 2. 开启高德内置性能面板（开发环境）
// 在 URL 后加 ?amap_debug=1

// 3. Chrome Performance 面板
// 录制地图操作过程，查看：
//   - Long Tasks（超过 50ms 的任务）
//   - GPU Memory（WebGL 内存使用）
//   - Canvas（绘制调用次数）

// 4. 监控 FPS（自己写）
let lastTime = performance.now()
let frameCount = 0

function measureFPS() {
  frameCount++
  const now = performance.now()
  if (now - lastTime >= 1000) {
    console.log(`FPS: ${frameCount}`)
    frameCount = 0
    lastTime = now
  }
  requestAnimationFrame(measureFPS)
}
measureFPS()
```

---

## 九、快速参考卡

| 场景 | 推荐方案 | 性能 |
|------|---------|------|
| < 100 个点 | 直接 `AMap.Marker` | ✅ |
| 100 ~ 5000 个点 | `MarkerClusterer` 聚合 | ✅✅ |
| > 5000 个点（纯图标，无交互）| `MassMarks` | ✅✅✅ |
| 数据密度可视化 | `HeatMap` 热力图 | ✅✅ |
| 路线轨迹 | `Polyline` | ✅ |
| 用户圈选区域 | `MouseTool` 绘制工具 | ✅ |
| 地址输入提示 | `AutoComplete` | ✅ |
| 导航路线规划 | `Driving / Walking` | ✅ |
