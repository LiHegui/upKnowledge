# 开环验证模块设计说明（SpecialVerification）

## 目录

1. [模块定位与文件位置](#模块定位与文件位置)
2. [完整执行链路](#完整执行链路)
3. [数据结构说明](#数据结构说明)
4. [Case 状态机](#case-状态机)
5. [指令构建与下发](#指令构建与下发)
6. [实时数据采集](#实时数据采集)
7. [图表系统（ECharts）](#图表系统echarts)
8. [标记线与差值计算](#标记线与差值计算)
9. [阈值判定与结果着色](#阈值判定与结果着色)
10. [系数面板](#系数面板)
11. [车速监控与等待机制](#车速监控与等待机制)
12. [提交与数据持久化](#提交与数据持久化)
13. [辅助功能](#辅助功能)
14. [断点续跑机制](#断点续跑机制)
15. [生命周期与资源清理](#生命周期与资源清理)
16. [性能优化汇总](#性能优化汇总)
17. [设计权衡说明](#设计权衡说明)

---

## 模块定位与文件位置

```
src/views/vvp/vehicle2.0/down/components/SpecialVerification.vue
```

**用途**：车辆开环验证（Special Verification）的执行和标注界面。

在整车测试流程中，开环验证是指向车辆下发预设的控制指令序列（如转向、刹车等），同时采集车辆反馈信号，通过对比**控制指令时序曲线**和**反馈信号曲线**，手动标注两条曲线上的特征点（L1/L2），计算时间差（Δx）和幅值差（Δy），与预设阈值比对，判断车辆响应是否合格。

### 涉及 API

| API 函数 | 接口 | 作用 |
|----------|------|------|
| `get_vvp_detail` | GET `/vvp_prerun/detail` | 获取 Case 列表 |
| `vehicleOpenContinue` | POST `/vvp_prerun/open_continue` | 断点续跑模式获取列表 |
| `configSyncDb` | POST `/vvp_prerun/sync_db` | 同步云端配置到本地 DB |
| `startRecordOpenloop` | POST `/vvp_v1/record/start_openloop` | 开始录制 ROS bag |
| `stopRecordOpenloop` | POST `/vvp_v1/record/stop_openloop` | 停止录制 ROS bag |
| `getRecordOpenloop` | GET `/vvp_v1/record/get_openloop` | 获取需要录制的 topic 列表 |
| `upload_file` | POST `/vvp_v1/upload_file` | 上传信号数据 JSON |
| `post_check_result` | POST `/vvp_v1/check_result/:vid` | 提交验证结果 |
| `getCoefficient` | GET `/vvp_v1/coefficient` | 获取信号系数配置 |

### 通信方式

| 方式 | 用途 |
|------|------|
| `socket.io` (`IO`) | 订阅 ROS topic 实时数据（viz_rosbridge_msg）|
| `WebSocket` (`socket`) | 向车辆下发控制指令（port 7650）|
| `WebSocket` (`vehicleSpeedSocket`) | 接收实时车速（/vvp_ws/topic/visual/speed）|

---

## 完整执行链路

以执行一个开环验证 Case 为例，从点击"开始执行"到提交结果的完整流程：

```
① 用户点击"▶ 开始执行"按钮（或"↺ 重新执行"）
        │  isRunning === true → 拦截，提示"存在case正在运行"
        │  submitFlag.submitIndex = index
        │  submitFlag.flag = false
        │  所有非 Finish 行重置为 NotAction
        │  当前行更新为 Running
        ▼
② actionExePre(row, index)
        │  startRecordOpenloop({session_id, vid, topics})  ← 开始录制 ROS bag
        │  setTimeout 2000ms → actionExe(row, index)  ← 延迟 2s 等录制就绪
        ▼
③ actionExe(row, index)  ← 核心执行函数
        │
        ├── 重置所有采集数据（collect_t1_value, collect_t2_t1, contolData 等）
        │
        ├── 断开并重建 socket.io（IO）
        │
        ├── getAddLinesData(row)  ← 订阅反馈信号
        │     viz_args 中每个 topic → IO.emit('viz_rosbridge_msg', ...)
        │     IO.on('test_N') → othersLines[N][key].data.push([timestamp, value])
        │
        ├── resetChartData()  ← 重置图表（区分 default/other 信号线）
        │
        └── 建立指令 WebSocket（port 7650）
                │
                │  预处理阶段（在 onopen 之前，避免运行时计算）:
                │    1. 克隆 args 并展平（每个值重复2次）
                │    2. 分类 template → template_send / template_kill
                │    3. 计算发送次数 = minLength + kill阶段5帧
                │    4. 预构建所有指令帧（prebuiltCommands[]）
                │
                └── socket.onopen()
                        │
                        │  [车速阈值检查] row.test_data.threshold !== 0？
                        │    threshold > 0 → waitForSpeed('>=', threshold)  ← 等车速达到
                        │    threshold < 0 → waitForSpeed('<=', |threshold|) ← 等车速降到
                        │    0/null/undefined → 直接跳过（无需等待）
                        │
                        ↓（车速满足后，或无阈值直接执行）
④ sendMessage(prebuiltCommands, index)  ← 下发指令
        │  立即发送第一帧（零延迟）
        │  setInterval 10ms → 逐帧发送后续指令（10ms/帧 = 100Hz）
        │  全部帧发送完毕 → setTimeout 10000ms → endDataCollection(index)
        │  ⚠️ 10s 窗口：给车辆足够时间响应，确保反馈曲线数据点充足
        ▼
⑤ 并行数据采集（IO.on 事件监听）
        │
        ├── IO.on('t1_value1') → collect_t1_value.push({ t1, value1 })
        │     订阅控制指令 topic，采集 [时间戳, 控制值]
        │
        └── IO.on('t2_t1') → collect_t2_t1.push({ t1, t2 })
              订阅 /msd/endpoint/vs_debug，采集 [发送时间, 接收时间]
        ▼
⑥ setInterval 2000ms（t2_value_timer）  ← 实时图表更新
        │  calculateControlData()  ← 合并 t1/t2 数据，计算控制曲线
        │  myChart.setOption({ series: [control_signal, feedbackData, ...others] })
        ▼
⑦ endDataCollection(index)  ← 10s后自动触发（或手动紧急停止）
        │  断开 IO（socket.io）
        │  关闭 WebSocket（port 7650）
        │  清除所有定时器
        │  stopRecordOpenloop()  ← 停止录制
        │  tableData[index].status = 'WaitingSubmit'
        │  submitFlag.flag = true  ← 显示提交区域、标记线操作区
        │
        │  processTestItems() ← 计算 computedMax（基于Control_value_max）
        │  保存 origin_options（系数调整的基准数据）
        │  getCoefficientPanelData()  ← 拉取系数配置
        ▼
⑧ 用户手动标注（L1/L2 标记线操作）
        │  点击图表 → bindChartEvents → moveMarkline(xValue)
        │    找最近数据点 → 更新 markLine.data[0].xAxis
        │    两条线都标注完 → 自动计算 Δx（ms）和 Δy
        │    com_test_result[current_test_result].value = { abs_x, abs_y, select_value }
        │  底部实时结果区: 绿色（通过）/ 红色（不通过）
        ▼
⑨ 用户点击"提交数据"
        └── submit()
                │  getUpDataLink() → 上传 JSON 到 /vvp_v1/upload_file
                │    包含: control_signal + 所有 vehicle_signal
                │  post_check_result(vid, { attachment, target, data, result })
                │  tableData[index].status = 'Finish'
                │  submitFlag.flag = false
                ▼
                ✅ Case 完成
```

---

## 数据结构说明

### Case 列表项（tableData）

```js
{
  vid: 'SV_001',                    // Case 唯一标识
  info: '转向响应测试',              // 描述信息
  category: '转向',                  // 功能分类（vehicle_fun）
  config: 'https://...',            // 云端配置链接
  status: 'NotAction',             // 状态（见状态机）
  target: '[...]',                  // 判定目标 JSON 字符串
  test_data: {
    args: {                         // 控制参数，key: value[]
      var: [0, 10, 20, 30],
      var1: [100, 200, 300, 400]
    },
    template: {                     // 指令模板，key 为 topic.field
      '/chassis/steering.angle': '{var}',
      '/chassis/steering_tear_down.angle': 0    // _tear_down 后缀 → kill 阶段
    },
    viz_args: [{                    // 反馈信号订阅配置
      topic: '/chassis/feedback',
      pattern: { feedback_angle: 'angle', feedback_speed: 'speed' },
      timestamp: 'header.stamp'
    }],
    default: ['feedback_angle'],    // 主反馈信号（右侧 y 轴）
    threshold: 25                   // 车速阈值（km/h）
  }
}
```

### com_test_result（实时标注计算结果）

```js
[{
  test_item: 'response_time',       // 测试项名称
  test_threshold: {
    max: 500,                       // 静态最大值（ms 或其他单位）
    min: 0,
    // 或动态计算：
    max: [{ operation: 'percentage', params: [null, 0.1] }]  // max = Control_value_max * 10%
  },
  value: {
    abs_x: 120,                     // Δx（时间差，ms）
    abs_y: 5.3,                     // Δy（幅值差）
    select_value: 120               // 用户选择用于判定的值
  }
}]
```

---

## Case 状态机

```
           用户点击执行
               │
          NotAction ──────────────────────────────┐
               │                                  │ 重新执行（任意状态均可触发）
               ▼                                  │
           Running                                │
               │                                  │
         10s 后自动结束                            │
         或紧急停止                                │
               │                                  │
               ▼                                  │
       WaitingSubmit ──── 用户提交 ──→ Finish ──────┘
               │
          紧急停止
               ▼
          NotAction（重置）
```

| 状态 | 含义 | 行样式 | Tag 颜色 |
|------|------|--------|---------|
| NotAction | 未执行 | 默认 | info（灰）|
| Running | 正在下发指令并采集数据 | 高亮黄 | warning（橙）|
| WaitingSubmit | 采集完成，等待用户标注并提交 | 蓝色边框 | 默认 |
| Finish | 已提交结果 | 绿色背景 | success（绿）|

**互斥保护**：`isRunning` computed 检查 `submitFlag.submitIndex !== -1 && tableData[idx].status === 'Running'`，运行中禁止启动其他 Case。

---

## 指令构建与下发

### 模板展开规则

`test_data.template` 中每个字段对应一条控制指令：

- key 格式：`topic_path.field_path`（如 `/chassis/steering.angle`）
- value：固定值 或 `{var}` 占位符（引用 args 中的数组）
- `_tear_down` 后缀：归入 kill 阶段（指令序列末尾的5帧，用于恢复初始状态）

### 预构建优化

```
传统方式（运行时计算）：每个 setInterval 触发时临时拼接指令 → 频繁字符串操作
当前方式（预构建）：onopen 之前一次性构建 prebuiltCommands[] → 运行时只做数组索引
```

**发送次数计算**：
```
minLength = min(所有 args 数组的长度) × 2  ← 每个值重复发送2次
times = minLength + (有kill指令 ? 5 : 0)
```

### 发送节奏

```
立即发送第一帧
setInterval 10ms → 发送后续帧（100 帧/秒）
全部发送完毕 → setTimeout 10s → 自动结束采集
```

---

## 实时数据采集

### 两路 socket.io 订阅

**控制信号（t1_value1）**：

```js
IO.emit('viz_rosbridge_msg', {
  topic: topic_1,          // 控制指令 topic
  pattern: {
    value1: path,           // 控制值字段路径（来自 template key 的 field 部分）
    t1: 'header.stamp.[to_string(secs), to_nsecs(nsecs)] | join("", @)'
    //  ↑ 特殊 topic /mff/vs/eb_control_command 使用 stamp 而非 header.stamp
  },
  sample: 1,
  event: 't1_value1'
})
// 收集: collect_t1_value.push({ t1: Number(t1), value1 })
```

**时延数据（t2_t1）**：

```js
IO.emit('viz_rosbridge_msg', {
  topic: '/msd/endpoint/vs_debug',
  pattern: {
    t2: 'frame_id | json_loads(@) | vsap_command_meta_timestamp_us',  // 接收时间(us)
    t1: 'frame_id | json_loads(@) | "/msd/endpoint/control_command.header.stamp"'
    //  ↑ 特殊 topic /mff/vs/eb_control_command 使用不同的 t1 路径
  },
  event: 't2_t1'
})
// 收集: collect_t2_t1.push({ t1: Number(t1), t2 })
```

**特殊 Topic 处理（`/mff/vs/eb_control_command`）**：

该 topic 的时间戳不在标准 `header.stamp` 路径下，需要特殊处理：
- t1 路径改为 `stamp.[to_string(secs), to_nsecs(nsecs)] | join('', @)`
- value1 路径中的 `frame_id` 需先经过 `json_loads()` 解析
- t2_t1 的 t1 路径改为 `frame_id | json_loads(@) | "/mff/vs/eb_control_command" | stamp`

### 控制曲线计算（calculateControlData）

两路数据通过 **t1 时间戳作为关联键** 合并，消除控制指令发出时间与车端接收时间的不对齐问题：

```
collect_t1_value: [{ t1: 1000123456, value1: 10 }, ...]    // 控制值，t1=发送时间戳(ns)
collect_t2_t1:    [{ t1: 1000123456, t2: 1000150789 }, ...] // t2=车端接收时间(us)

合并逻辑（O(n) Map 查找）:
  t1ValueMap = Map(t1 → value1)           ← 一次遍历建索引，O(n)
  对每个 t2_t1 项:
    t1Value = t1ValueMap.get(item.t1)     ← O(1) 查找
    if t1Value !== undefined:
      push [Number((t2 / 1000).toFixed(0)), t1Value]  // t2: us → ms，保留整数

结果: contolData = [[车端接收时间戳ms, 控制值], ...]
```

**为什么以接收时间（t2）为 X 轴**：t2 是车端实际收到指令的时间，与反馈信号的时间轴同源，Δx 才能准确反映响应延迟，而不是包含了网络传输延迟的混合数据。

**每 2s 批量更新一次图表**（`t2_value_timer`）：socket.io 事件频率远高于人眼刷新需求，2s 批量合并后再调 `setOption`，避免 ECharts 被高频 setOption 阻塞主线程。

### 反馈信号采集（viz_args）

对 `test_data.viz_args` 中每个 topic 独立订阅：

```js
// 每个 viz_arg 对应 othersLines[i] 下的多条信号
othersLines[i][j] = {
  name: pattern_key,       // 信号名
  data: [[timestamp, value], ...],
  default: true/false      // 是否为主反馈信号
}
```

`default: true` 的信号作为主反馈曲线（右侧 y 轴），其他信号作为附加曲线。

---

## 图表系统（ECharts）

### 图表结构

```
xAxis: time（毫秒时间戳）
yAxis[0]: control_signal（左轴，红色 #FF6384）
yAxis[1]: 反馈信号（右轴，蓝色 #36A2EB）

series:
  [0] control_signal      ← 左轴，含 markLine L1（黄色）
  [1] {feedbackData.name} ← 右轴，含 markLine L2（绿色）
  [2+] 其他信号           ← 右轴，随机颜色

dataZoom:
  - slider（X 轴）
  - slider（Y 轴）
  - inside（X 轴，鼠标滚轮）
  - inside（Y 轴，鼠标滚轮）
```

### 图表更新时机

| 时机 | 操作 |
|------|------|
| `actionExe` 开始时 | `resetChartData()` 全量重建（notMerge:true）|
| 每 2s 定时 | `setOption` 只更新 series.data（增量合并）|
| 用户移动 markLine | `setOption` 只更新 markLine.data[0].xAxis |
| 系数调整后 | `setOption` 批量更新所有 series.data（乘以系数）|

### Preview 弹窗

点击 Case 列表中的"预览"图标，弹出 `Preview Chart` 对话框：

- 展示 `test_data.args` 中的参数曲线（x = 时间序列，10ms/点）
- 每个 args key 对应一个可切换的系列按钮
- 时间轴为虚拟序列，仅供参考（非真实时间）

---

## 标记线与差值计算

### 操作入口

```
左侧操作区（submitFlag.flag = true 后显示）:
  L1 / L2 按钮    → 设置 activeMarkline（当前操作哪条标记线）
  control_signal 按钮 → operationSignalLine = 0（L1/L2 吸附到控制曲线）
  反馈信号 按钮    → operationSignalLine = 1（L1/L2 吸附到反馈曲线）
```

### 点击图表触发标记

```
myChart.getZr().on('click', e)
    │  submitFlag.flag === false → return（未进入标注模式则忽略）
    │  convertFromPixel([e.offsetX, e.offsetY]) → xValue（时间戳）
    └── moveMarkline(xValue)
            │  在目标曲线（operationSignalLine 决定）上找最近数据点
            │  更新 marklinePositions[activeMarkline]
            │  更新 initialMarkline1Pos / initialMarkline2Pos
            │  collectMarkPoints[activeMarkline] = closestPoint
            │
            │  两条线均已标注？
            └── 自动计算:
                  Δx = |point1[0] - point2[0]| / 1000  (ms)
                  Δy = |point1[1] - point2[1]|
                  com_test_result[current_test_result].value = { abs_x, abs_y, select_value: abs_x }
```

### 底部实时结果区

每个测试项显示为一个色块：

- 用户可在 `Δx` 和 `Δy` 两个 radio 中选择用于判定的值（`select_value`）
- `getComputedColorByTest(item)` 根据 `select_value` 与阈值比对：

```js
绿色 #73F0C1 → min <= select_value <= max（或 computedMax）  // 通过
红色 #F7A7A7 → 超出范围                                       // 不通过
空白          → 未标注（select_value 为空字符串）
```

---

## 阈值判定与结果着色

### 静态阈值

```
test_threshold: { max: 500, min: 0 }
判定: min <= select_value <= max
```

### 动态阈值（基于控制曲线最大值）

```
test_threshold.max = [{ operation: 'percentage', params: [null, 0.1] }]
计算: computedMax = Control_value_max × 0.1

Control_value_max = max(...control_signal 所有 value) 在 endDataCollection 时计算
判定: min <= select_value <= computedMax
```

支持的 operation：

| operation | 含义 |
|-----------|------|
| `percentage` | `computedValue *= params[1]` |
| `max` | `computedValue = Math.max(Control_value_max, params[1])` |

### Threshold 列展示规则

| 值 | 展示 |
|----|------|
| 0 / 空 | `--` |
| 正数 | `≥25`（等待车速达到该值）|
| 负数 | `≤25`（等待车速低于该值）|

---

## 系数面板

点击"Coefficient"按钮弹出系数调整表单，可对各信号曲线乘以系数后重绘：

```
getCoefficientPanelData():
  1. 从 viz_args.pattern 中提取所有信号 key（如 'angle', 'speed'）
  2. GET /vvp_v1/coefficient → 获取云端系数配置
  3. 合并得到 coefficient_form_data: { control_signal: 1, angle: 0.5, speed: 3.6 }

updateChartByCoefficient():
  验证表单 → 对每个 series:
    updatedData = origin_options[name].map(([t, v]) => [t, v * coefficient])
  同步更新 collectMarkPoints 中的 y 值（同样乘以系数，保持标注一致性）
  myChart.setOption({ series: updatedOptions })
```

`origin_options` 在 `endDataCollection` 时快照保存，系数调整始终基于原始数据，避免多次乘系数造成累积误差。

---

## 车速监控与等待机制

### 数据来源

- `isPrerun = true`：使用 WebSocket `/vvp_ws/topic/visual/speed` 实时车速
- `isPrerun = false`：使用 prop `chassisData.chassis_speed`

### 单位转换

右上角 radio 切换：

| 模式 | 处理 |
|------|------|
| `m/s → km/h` | `rawSpeed × 3.6` |
| `km/h → km/h` | 直接使用 `rawSpeed` |

### waitForSpeed 机制

```
waitForSpeed(operator, threshold) → Promise
    │  立即检测一次 → 满足 → resolve（无延迟）
    │
    └── 未满足 → setInterval 20ms（50Hz）轮询
            │  实时更新 waitingMessage: "等待车速 >= 25 km/h (当前: 18.3 km/h, 已等待: 3.2s)"
            └── 满足 → clearInterval → resolve
```

**轮询频率 50Hz（20ms）**，匹配常见车载传感器上报频率，确保检测延迟 ≤ 20ms。

---

## 提交与数据持久化

### 数据上传

```
getUpDataLink():
  构造 JSON:
    signal_data.control_signal = contolData（[[t,v], ...]）
    signal_data.vehicle_signal = othersLines.flat().map → { signal_name, data, default_show }
    coefficient_key_arr = viz_args.pattern 中所有 value（信号路径）
  Blob → FormData → upload_file('special_vehicle', form)
  返回: 文件 URL
```

### 结果提交

```
post_check_result(vid, {
  attachment: {
    url: '上传的 JSON 文件 URL',
    bag_url: '/TestData/rosbags/{session_id}/{vid}.bag'  // 录制的 bag 文件路径
  },
  target: JSON.parse(currentRow.target),   // 原始判定目标
  data: com_test_result,                   // 含标注值和阈值的完整数组
  result: true
})
```

### Bag 下载

`submitFlag.flag = true` 后右上角显示"Bag"按钮，点击直接下载 `/TestData/rosbags/{session_id}/{vid}.bag`。

---

## 辅助功能

### 同步 DB（syncDb）

```
configSyncDb() → 同步云端最新 Case 配置到本地 DB
→ 10s 后自动重新拉取 getList()
```

仅在无 Case 运行时允许操作（`!isRunning`）。同步完成后等待 10s 再刷新列表，给后端 DB 写入留出缓冲时间。

### 预览 Case 参数曲线（previewLine）

点击列表中 Preview（👁）图标：

- 读取 `test_data.args` 中所有数组参数
- 每个 value 重复两次（模拟指令的"保持"特性），以 10ms 为间隔构建虚拟时间轴
- 多组参数可通过按钮切换查看
- 提示语"The timeline is virtual and for reference only"

### 查看 Template（showTemplate）

点击列表中 Template（📄）图标，弹出 Code Editor（只读，Monokai 主题），展示完整的 `test_data.template` JSON。

### 搜索过滤（filter_form）

支持三个维度同时过滤（AND 逻辑）：

| 维度 | 字段 |
|------|------|
| 功能分类 | `category` 精确匹配 |
| Key 搜索 | `info` 包含匹配 |
| 状态过滤 | `status` 精确匹配 |

### 紧急停止（emergencyStop）

```
isRunning → endDataCollection(index)（正常走提交流程的数据整理）
!isRunning → 直接重置 submitFlag（清除误判状态）
清除所有定时器: send_message_timer / protect_timer / checkInterval
waitingMessage = ''
```

---

## 断点续跑机制

当测试中途中断（页面刷新/网络断开）需要继续未完成的 Case 时，使用断点续跑模式：

```
触发条件: sessionStorage 中存在 vehicle_open_continue_params
  {
    session_id: 'xxx',   // 已有的测试 session
    ...其他参数
  }

getList() 逻辑:
  vehicleParams.session_id 存在
      → vehicleOpenContinue(vehicleParams)  ← 获取含执行历史的列表
      → tableData = response.map(item => ({
            ...item,
            status: item.executed ? 'Finish' : 'NotAction'  // 已执行的标为 Finish
          }))
  vehicleParams.session_id 不存在（首次进入）
      → get_vvp_detail({ step: 'vehicleSpecial' })  ← 全新列表，全部 NotAction
```

**已完成的 Case 标记为 Finish 后不可被误操作重置**，未执行的继续按正常流程推进，保证同一 session 内测试数据的完整性和唯一性。

---

## 生命周期与资源清理

### created

- `getList()`：拉取 Case 列表（断点续跑模式读 sessionStorage 中的 `vehicle_open_continue_params`）
- `getRecordOpenloop()`：获取需要录制的 topic 列表

### mounted

- `initChart()`：初始化 ECharts 实例 + 绑定点击事件
- `window.addEventListener('resize', handleResize)`：响应窗口大小变化
- `isPrerun = true` → `connectVehicleSpeedWebSocket()`：连接车速 WebSocket

### beforeDestroy

```
emergencyStop()                 ← 确保正在运行的 Case 被中止
clearInterval(t2_value_timer)
socket.close()                  ← 关闭指令 WebSocket
IO.disconnect()                 ← 断开 socket.io
vehicleSpeedInterval 清除
vehicleSpeedSocket.close()
myChart.dispose()               ← 销毁 ECharts 实例（防内存泄漏）
window.removeEventListener('resize', handleResize)
```

---

## 性能优化汇总

| 优化点 | 手段 | 效果 |
|--------|------|------|
| 指令预构建 | `onopen` 之前一次性构建 `prebuiltCommands[]` | 运行时 100Hz 发帧只做数组索引，无字符串拼接 |
| 控制曲线合并 O(n) | `Map(t1 → value1)` 一次建索引，O(1) 查找 | 替代 O(n²) 双重遍历 |
| 图表更新节流 2s | `t2_value_timer` 批量调 `setOption` | 避免高频 setOption 阻塞主线程 |
| ECharts 按需重建 | 切换 Case 时 `notMerge: true` 全量重建；运行中只增量更新 `series.data` | 最小化 DOM 操作次数 |
| 系数无累积误差 | `origin_options` 快照，系数调整始终乘原始数据 | 多次调整不累积浮点误差 |
| 车速等待零延迟 | `waitForSpeed` 首次同步检查，满足则直接 resolve | 车速已满足时无等待 |
| 车速轮询自清理 | 满足条件后立即 `clearInterval(checkInterval)` | 不留孤儿定时器 |
| 录制延迟缓冲 | `startRecordOpenloop` 后 2s 再下发指令 | 确保 rosbag 录制就绪，不丢开头数据 |
| beforeDestroy 完整清理 | `emergencyStop` → 清所有定时器 → 断连接 → `dispose` | 切页不留内存泄漏和悬空连接 |

---

## 设计权衡说明

### 1. 指令下发后等待 10s 再结束采集

指令序列本身发完只需数百毫秒（100 帧 × 10ms），但车辆响应有机械延迟（转向/制动通常 200~800ms），加上反馈信号通过 ROS topic 回传还有网络延迟。10s 窗口确保反馈曲线有足够的数据点，让用户能准确标注 L2。若实际需要更长或更短的窗口，可通过 Case 配置扩展（当前为硬编码 10000ms）。

### 2. 每个 value 重复发送 2 次

`args` 中每个值 `flatMap(item => [item, item])` 展平后重复发送，目的是让每个控制状态在车端"保持"一段时间（10ms × 2 = 20ms），避免单帧发送因网络抖动丢失后车端未响应。

### 3. t1/t2 双路采集而非单路时间戳

直接用指令发出时间（t1）作为 X 轴存在问题：前端时钟与车端时钟可能存在偏差。通过 `/msd/endpoint/vs_debug` 的 `vsap_command_meta_timestamp_us` 获取车端接收时间（t2），以 t2 为 X 轴后，控制曲线与反馈曲线时钟对齐，Δx 才准确代表响应延迟而非混入了网络传输时间。

### 4. 反馈信号 default 区分双 Y 轴

`viz_args` 中标记 `default: true` 的信号放右轴（主反馈），其他信号叠加在右轴作参考。主反馈信号与控制信号量纲往往不同（如控制角度 0~360°、反馈扭矩 0~1000N·m），共用一轴会导致曲线比例失真，分轴后用户更容易判断时序关系。

### 5. 系数快照（origin_options）时机选择

快照在 `endDataCollection` 时保存（采集结束、数据稳定后），而非在 `actionExe` 开始时。原因：采集过程中 `othersLines` 和 `contolData` 持续增长，过早快照会丢失后续数据；采集结束后数据固定，此时快照是唯一正确时机。

### 6. checkInterval 轮询频率 50Hz（20ms）

车速 WebSocket 上报频率约 20~50Hz，20ms 轮询与其匹配，检测延迟最坏情况为 20ms（约 0.02s），对于"等待车速达到 X km/h"这类场景完全足够，同时不会因过高频率（如 1ms）白白消耗 CPU。
