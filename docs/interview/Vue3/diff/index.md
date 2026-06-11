# Vue3 Diff 算法（快速 Diff）

> 参考：[Vue3 源码解析 - diff 算法](https://juejin.cn/post/7190726242042118200#heading-16)

---

<style>
.vd{font-family:'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;font-size:13px;line-height:1.6;color:#e0e4f0}
.vd-card{background:#1a1d27;border:1px solid #2e3347;border-radius:10px;padding:18px 20px;margin:14px 0}
.vd-title{font-size:11px;font-weight:700;color:#a8b0cc;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid #2e3347}
.vd-note{padding:9px 13px;border-radius:7px;font-size:12px;margin-top:10px}
.vd-nb{background:rgba(79,142,247,.1);border-left:3px solid #4f8ef7;color:#7eb3ff}
.vd-ng{background:rgba(61,220,132,.08);border-left:3px solid #3ddc84;color:#6ef5a8}
.vd-nr{background:rgba(255,92,92,.08);border-left:3px solid #ff5c5c;color:#ff8f8f}
.vd-ny{background:rgba(255,209,102,.08);border-left:3px solid #ffd166;color:#ffe599}
.vd-np{background:rgba(181,123,238,.08);border-left:3px solid #b57bee;color:#d4a8ff}
.vd-steps{display:flex;flex-direction:column;gap:0}
.vd-step{display:flex;align-items:flex-start;gap:13px;padding:12px 0;border-bottom:1px dashed #2e3347}
.vd-step:last-child{border-bottom:none}
.vd-step-num{min-width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0}
.vd-step-b{background:#4f8ef7;color:#fff}
.vd-step-g{background:#3ddc84;color:#000}
.vd-step-p{background:#b57bee;color:#fff}
.vd-step-y{background:#ffd166;color:#000}
.vd-step-r{background:#ff5c5c;color:#fff}
.vd-step-body{flex:1}
.vd-step-title{font-size:13px;font-weight:700;margin-bottom:3px}
.vd-step-desc{font-size:12px;color:#8b90a8;line-height:1.6}
.vd-flow{display:flex;align-items:center;gap:0;flex-wrap:wrap;margin:8px 0}
.vd-fbox{padding:8px 14px;border-radius:7px;font-size:11px;font-weight:600;text-align:center;min-width:90px}
.vd-fbox-b{background:rgba(79,142,247,.15);border:1px solid rgba(79,142,247,.35);color:#7eb3ff}
.vd-fbox-g{background:rgba(61,220,132,.12);border:1px solid rgba(61,220,132,.28);color:#6ef5a8}
.vd-fbox-p{background:rgba(181,123,238,.12);border:1px solid rgba(181,123,238,.3);color:#d4a8ff}
.vd-fbox-y{background:rgba(255,209,102,.1);border:1px solid rgba(255,209,102,.28);color:#ffe599}
.vd-fbox-r{background:rgba(255,92,92,.1);border:1px solid rgba(255,92,92,.25);color:#ff8f8f}
.vd-farr{color:#555;font-size:14px;padding:0 6px;flex-shrink:0}
.vd-list{display:flex;gap:6px;flex-wrap:nowrap;align-items:center;overflow-x:auto;padding:4px 0}
.vd-li{border-radius:7px;padding:7px 11px;font-size:12px;font-weight:600;font-family:monospace;text-align:center;min-width:44px;flex-shrink:0}
.vd-li-ok{background:rgba(61,220,132,.15);color:#6ef5a8;border:1px solid rgba(61,220,132,.3)}
.vd-li-new{background:rgba(79,142,247,.15);color:#7eb3ff;border:1px solid rgba(79,142,247,.3)}
.vd-li-del{background:rgba(255,92,92,.12);color:#ff8f8f;border:1px solid rgba(255,92,92,.25)}
.vd-li-mv{background:rgba(255,209,102,.1);color:#ffe599;border:1px solid rgba(255,209,102,.28)}
.vd-li-add{background:rgba(181,123,238,.12);color:#d4a8ff;border:1px solid rgba(181,123,238,.3)}
.vd-li-g{background:rgba(255,255,255,.04);color:#555;border:1px dashed #2e3347}
.vd-li-label{font-size:9px;font-weight:400;color:#8b90a8;margin-top:2px}
.vd-ptr{font-size:9px;color:#ffd166;text-align:center;font-weight:700}
.vd code{font-family:'Cascadia Code','Fira Code',Consolas,monospace;background:rgba(255,255,255,.07);padding:1px 5px;border-radius:3px;font-size:11px;color:#e0e4f0}
.vd-diff-row{display:flex;gap:0;border-radius:9px;overflow:hidden;border:1px solid #2e3347}
.vd-diff-col{flex:1;padding:14px}
.vd-diff-hd{font-size:12px;font-weight:700;margin-bottom:9px;display:flex;align-items:center;gap:6px}
.vd-diff-item{font-size:12px;color:#aab0c8;padding:3px 0 3px 16px;position:relative;line-height:1.6}
.vd-diff-item::before{content:'▸';position:absolute;left:0;color:#555;font-size:10px}
.vd-tbl{width:100%;border-collapse:collapse;font-size:12px;margin:8px 0}
.vd-tbl th{background:rgba(79,142,247,.1);color:#7eb3ff;padding:8px 12px;text-align:left;border-bottom:1px solid #2e3347;font-weight:700}
.vd-tbl td{padding:8px 12px;border-bottom:1px solid rgba(255,255,255,.05);color:#aab0c8}
.vd-tbl tr:last-child td{border-bottom:none}
.vd-phase{display:inline-block;font-size:9px;font-weight:700;border-radius:4px;padding:2px 7px;margin-bottom:6px}
.vd-ph-old{background:rgba(255,209,102,.18);color:#ffe599}
.vd-ph-new{background:rgba(79,142,247,.18);color:#7eb3ff}
.vd-ph-result{background:rgba(61,220,132,.18);color:#6ef5a8}
</style>

## 一、什么时候触发 Diff？

当组件重新渲染时，会生成**新的 VNode 树**。Vue 需要对比新旧两棵树的 children，找出**最小的 DOM 操作**来完成更新。

<div class="vd">
<div class="vd-card">
<div class="vd-title">📊 Diff 触发流程</div>
<div class="vd-flow">
  <span class="vd-fbox vd-fbox-y">响应式数据变化</span>
  <span class="vd-farr">→</span>
  <span class="vd-fbox vd-fbox-b">组件 render()</span>
  <span class="vd-farr">→</span>
  <span class="vd-fbox vd-fbox-p">新 VNode 树</span>
  <span class="vd-farr">→</span>
  <span class="vd-fbox vd-fbox-g">patch(旧VNode, 新VNode)</span>
  <span class="vd-farr">→</span>
  <span class="vd-fbox vd-fbox-r">patchKeyedChildren</span>
</div>
<div class="vd-note vd-nb">💡 <code>patchKeyedChildren</code> 就是核心 diff 算法所在。它只处理<strong>同一层级</strong>的子节点列表，不跨层级对比。</div>
</div>
</div>

---

## 二、key 的作用 — 判断「是不是同一个节点」

Diff 的第一步是判断两个 VNode 是否可以复用。判断依据是 **type + key 都相同**：

```ts
function isSameVNodeType(n1: VNode, n2: VNode): boolean {
  return n1.type === n2.type && n1.key === n2.key
}
```

<div class="vd">
<div class="vd-card">
<div class="vd-title">📊 有 key vs 无 key 的 Diff 差异</div>
<div style="display:flex;gap:12px;flex-wrap:wrap">

<div style="flex:1;min-width:230px;border-radius:9px;padding:14px;border:1px solid rgba(255,92,92,.25);background:#1f1416">
<div style="font-size:12px;font-weight:700;color:#ff8f8f;margin-bottom:10px">❌ 无 key / 用 index 做 key</div>
<div class="vd-phase vd-ph-old">旧列表</div>
<div class="vd-list">
  <div class="vd-li vd-li-ok">A<div class="vd-li-label">i=0</div></div>
  <div class="vd-li vd-li-ok">B<div class="vd-li-label">i=1</div></div>
  <div class="vd-li vd-li-ok">C<div class="vd-li-label">i=2</div></div>
</div>
<div class="vd-phase vd-ph-new">新列表（删除 A）</div>
<div class="vd-list">
  <div class="vd-li vd-li-del">B<div class="vd-li-label">i=0</div></div>
  <div class="vd-li vd-li-del">C<div class="vd-li-label">i=1</div></div>
</div>
<div class="vd-note vd-nr" style="font-size:11px">i=0: A≠B → 更新<br>i=1: B≠C → 更新<br>i=2: → unmount<br>结果：<strong>3 个节点全部操作</strong></div>
</div>

<div style="flex:1;min-width:230px;border-radius:9px;padding:14px;border:1px solid rgba(61,220,132,.25);background:#161f1a">
<div style="font-size:12px;font-weight:700;color:#6ef5a8;margin-bottom:10px">✅ 用唯一 id 做 key</div>
<div class="vd-phase vd-ph-old">旧列表</div>
<div class="vd-list">
  <div class="vd-li vd-li-ok">A<div class="vd-li-label">key="a"</div></div>
  <div class="vd-li vd-li-ok">B<div class="vd-li-label">key="b"</div></div>
  <div class="vd-li vd-li-ok">C<div class="vd-li-label">key="c"</div></div>
</div>
<div class="vd-phase vd-ph-new">新列表（删除 A）</div>
<div class="vd-list">
  <div class="vd-li vd-li-new">B<div class="vd-li-label">key="b" 复用</div></div>
  <div class="vd-li vd-li-new">C<div class="vd-li-label">key="c" 复用</div></div>
</div>
<div class="vd-note vd-ng" style="font-size:11px">key=a 消失 → unmount(A)<br>B、C 通过 key 找到 → 复用<br>结果：<strong>仅 1 次删除，状态保留</strong></div>
</div>

</div>
</div>
</div>

---

## 三、核心五步 — 图解全流程

### Diff 的核心思路

当响应式数据变化后，组件重新执行 render，产生一棵**新的虚拟 DOM 树**。现在有两棵树：旧的和新的，需要找出它们的差异，用**最少的真实 DOM 操作**完成更新——这就是 diff 要做的事。

但是两棵完整的树逐个对比太慢了（O(n³)），所以 Vue 做了一个约定：**只在同一层级对比子节点列表**，不跨层级。这样问题就简化为：**给你两个数组（旧 children 和新 children），怎么用最少的操作把旧数组变成新数组？**

Vue3 的策略是分五步，**先处理简单的，最后处理复杂的**：

<div class="vd">
<div class="vd-card">
<div class="vd-title">📊 五步策略总览</div>
<div class="vd-steps">
<div class="vd-step">
  <div class="vd-step-num vd-step-b">1</div>
  <div class="vd-step-body">
    <div class="vd-step-title" style="color:#7eb3ff">从头扫描，跳过相同前缀</div>
    <div class="vd-step-desc"><code>i</code> 从左往右走，新旧相同就 patch 复用，不同就停下</div>
  </div>
</div>
<div class="vd-step">
  <div class="vd-step-num vd-step-b">2</div>
  <div class="vd-step-body">
    <div class="vd-step-title" style="color:#7eb3ff">从尾扫描，跳过相同后缀</div>
    <div class="vd-step-desc"><code>e1</code>、<code>e2</code> 从右往左走，新旧相同就 patch 复用，不同就停下</div>
  </div>
</div>
<div class="vd-step">
  <div class="vd-step-num vd-step-g">3</div>
  <div class="vd-step-body">
    <div class="vd-step-title" style="color:#6ef5a8">旧的扫完了，新的有剩余 → 挂载新增</div>
    <div class="vd-step-desc">条件：<code>i > e1 && i <= e2</code></div>
  </div>
</div>
<div class="vd-step">
  <div class="vd-step-num vd-step-r">4</div>
  <div class="vd-step-body">
    <div class="vd-step-title" style="color:#ff8f8f">新的扫完了，旧的有剩余 → 卸载多余</div>
    <div class="vd-step-desc">条件：<code>i > e2 && i <= e1</code></div>
  </div>
</div>
<div class="vd-step">
  <div class="vd-step-num vd-step-p">5</div>
  <div class="vd-step-body">
    <div class="vd-step-title" style="color:#d4a8ff">都没扫完 → 中间乱序，用 LIS 算法找最少移动方案</div>
    <div class="vd-step-desc">建 key→index 映射 → 遍历旧节点 patch/unmount → LIS 决定谁动谁不动</div>
  </div>
</div>
</div>
<div class="vd-note vd-nb">💡 大部分实际场景在前两步就处理掉了大半节点。只有复杂乱序才需要 Step 5。</div>
</div>
</div>

### 三个关键指针

<div class="vd">
<div class="vd-card">
<div class="vd-title">📊 三个指针的含义</div>
<table class="vd-tbl">
<tr><th>指针</th><th>含义</th><th>初始值</th></tr>
<tr><td><code style="color:#ffd166;font-weight:700">i</code></td><td>头部扫描位置，从左往右走</td><td><code>0</code></td></tr>
<tr><td><code style="color:#ff8f8f;font-weight:700">e1</code></td><td>旧列表尾部扫描位置，从右往左走</td><td><code>oldChildren.length - 1</code></td></tr>
<tr><td><code style="color:#7eb3ff;font-weight:700">e2</code></td><td>新列表尾部扫描位置，从右往左走</td><td><code>newChildren.length - 1</code></td></tr>
</table>
<div class="vd-note vd-ny">⚠️ Step 1/2 结束后，<code>i</code> 到 <code>e1</code>/<code>e2</code> 之间的部分就是「还需要处理的中间地带」。</div>
</div>
</div>

---

### Step 1：自前向后对比（跳过相同前缀）

<div class="vd">
<div class="vd-card">
<div class="vd-title">📊 Step 1 — 从头扫描</div>

<div style="font-size:11px;color:#8b90a8;margin-bottom:4px">初始状态：</div>
<div class="vd-list">
  <div class="vd-ptr">i↓</div>
</div>
<div style="font-size:10px;color:#ff8f8f;margin-bottom:2px">旧：</div>
<div class="vd-list">
  <div class="vd-li vd-li-g">A</div>
  <div class="vd-li vd-li-g">B</div>
  <div class="vd-li vd-li-g">C</div>
  <div class="vd-li vd-li-g">D</div>
  <div class="vd-li vd-li-g">E<div class="vd-li-label">e1↑</div></div>
</div>
<div style="font-size:10px;color:#7eb3ff;margin-bottom:2px">新：</div>
<div class="vd-list">
  <div class="vd-li vd-li-g">A</div>
  <div class="vd-li vd-li-g">B</div>
  <div class="vd-li vd-li-g">X</div>
  <div class="vd-li vd-li-g">Y</div>
  <div class="vd-li vd-li-g">E<div class="vd-li-label">e2↑</div></div>
</div>

<div style="margin-top:12px;padding:12px;background:#191c2a;border-radius:8px;border:1px solid #2e3347">
<div class="vd-steps">
<div class="vd-step" style="padding:6px 0">
  <div class="vd-step-num vd-step-b" style="width:22px;height:22px;font-size:10px">1</div>
  <div class="vd-step-body"><div class="vd-step-desc"><code>i=0</code>：A vs A → 相同 ✅ patch(A,A)，<code>i++</code></div></div>
</div>
<div class="vd-step" style="padding:6px 0">
  <div class="vd-step-num vd-step-b" style="width:22px;height:22px;font-size:10px">2</div>
  <div class="vd-step-body"><div class="vd-step-desc"><code>i=1</code>：B vs B → 相同 ✅ patch(B,B)，<code>i++</code></div></div>
</div>
<div class="vd-step" style="padding:6px 0;border-bottom:none">
  <div class="vd-step-num vd-step-r" style="width:22px;height:22px;font-size:10px">3</div>
  <div class="vd-step-body"><div class="vd-step-desc"><code>i=2</code>：C vs X → <strong style="color:#ff8f8f">不同 ❌ break!</strong></div></div>
</div>
</div>
</div>

<div style="font-size:11px;color:#8b90a8;margin-top:10px;margin-bottom:4px">结束后：<code>i = 2</code></div>
<div style="font-size:10px;color:#ff8f8f;margin-bottom:2px">旧：</div>
<div class="vd-list">
  <div class="vd-li vd-li-ok">A<div class="vd-li-label">✅ 已处理</div></div>
  <div class="vd-li vd-li-ok">B<div class="vd-li-label">✅ 已处理</div></div>
  <div class="vd-li vd-li-g">C<div class="vd-li-label">i↓ 待处理</div></div>
  <div class="vd-li vd-li-g">D</div>
  <div class="vd-li vd-li-g">E</div>
</div>
<div style="font-size:10px;color:#7eb3ff;margin-bottom:2px">新：</div>
<div class="vd-list">
  <div class="vd-li vd-li-ok">A<div class="vd-li-label">✅ 已处理</div></div>
  <div class="vd-li vd-li-ok">B<div class="vd-li-label">✅ 已处理</div></div>
  <div class="vd-li vd-li-g">X<div class="vd-li-label">i↓ 待处理</div></div>
  <div class="vd-li vd-li-g">Y</div>
  <div class="vd-li vd-li-g">E</div>
</div>
</div>
</div>

```ts
while (i <= e1 && i <= e2) {
  if (isSameVNodeType(oldChildren[i], newChildren[i])) {
    patch(oldChildren[i], newChildren[i], container)
  } else {
    break
  }
  i++
}
```

---

### Step 2：自后向前对比（跳过相同后缀）

<div class="vd">
<div class="vd-card">
<div class="vd-title">📊 Step 2 — 从尾扫描（接着 Step 1 的结果 i=2）</div>

<div style="padding:12px;background:#191c2a;border-radius:8px;border:1px solid #2e3347">
<div class="vd-steps">
<div class="vd-step" style="padding:6px 0">
  <div class="vd-step-num vd-step-b" style="width:22px;height:22px;font-size:10px">1</div>
  <div class="vd-step-body"><div class="vd-step-desc"><code>e1=4, e2=4</code>：E vs E → 相同 ✅ patch(E,E)，<code>e1--</code>，<code>e2--</code></div></div>
</div>
<div class="vd-step" style="padding:6px 0;border-bottom:none">
  <div class="vd-step-num vd-step-r" style="width:22px;height:22px;font-size:10px">2</div>
  <div class="vd-step-body"><div class="vd-step-desc"><code>e1=3, e2=3</code>：D vs Y → <strong style="color:#ff8f8f">不同 ❌ break!</strong></div></div>
</div>
</div>
</div>

<div style="font-size:11px;color:#8b90a8;margin-top:10px;margin-bottom:4px">结束后：<code>i=2, e1=3, e2=3</code> — 只剩中间部分需要处理</div>
<div style="font-size:10px;color:#ff8f8f;margin-bottom:2px">旧：</div>
<div class="vd-list">
  <div class="vd-li vd-li-ok">A<div class="vd-li-label">✅</div></div>
  <div class="vd-li vd-li-ok">B<div class="vd-li-label">✅</div></div>
  <div class="vd-li vd-li-mv">C<div class="vd-li-label">i↓</div></div>
  <div class="vd-li vd-li-mv">D<div class="vd-li-label">e1↑</div></div>
  <div class="vd-li vd-li-ok">E<div class="vd-li-label">✅</div></div>
</div>
<div style="font-size:10px;color:#7eb3ff;margin-bottom:2px">新：</div>
<div class="vd-list">
  <div class="vd-li vd-li-ok">A<div class="vd-li-label">✅</div></div>
  <div class="vd-li vd-li-ok">B<div class="vd-li-label">✅</div></div>
  <div class="vd-li vd-li-mv">X<div class="vd-li-label">i↓</div></div>
  <div class="vd-li vd-li-mv">Y<div class="vd-li-label">e2↑</div></div>
  <div class="vd-li vd-li-ok">E<div class="vd-li-label">✅</div></div>
</div>
<div class="vd-note vd-ny">⚠️ 黄色部分就是中间待处理区域。接下来根据 <code>i</code>、<code>e1</code>、<code>e2</code> 三个指针的关系决定走 Step 3/4/5。</div>
</div>
</div>

```ts
while (i <= e1 && i <= e2) {
  if (isSameVNodeType(oldChildren[e1], newChildren[e2])) {
    patch(oldChildren[e1], newChildren[e2], container)
  } else {
    break
  }
  e1--
  e2--
}
```

---

### Step 3：新节点多于旧节点 → 挂载

<div class="vd">
<div class="vd-card">
<div class="vd-title">📊 Step 3 — 旧的扫完了，新的有剩余</div>
<div style="font-size:12px;color:#aab0c8;margin-bottom:10px">
  <strong>条件</strong>：<code>i > e1 && i <= e2</code><br>
  <code>i > e1</code> → 旧列表全部匹配完了<br>
  <code>i <= e2</code> → 新列表还有没处理的 → 新增！
</div>
<div style="font-size:10px;color:#ff8f8f;margin-bottom:2px">旧：</div>
<div class="vd-list">
  <div class="vd-li vd-li-ok">A<div class="vd-li-label">✅</div></div>
  <div class="vd-li vd-li-ok">B<div class="vd-li-label">✅ e1=1</div></div>
</div>
<div style="font-size:10px;color:#7eb3ff;margin-bottom:2px">新：</div>
<div class="vd-list">
  <div class="vd-li vd-li-ok">A<div class="vd-li-label">✅</div></div>
  <div class="vd-li vd-li-ok">B<div class="vd-li-label">✅</div></div>
  <div class="vd-li vd-li-add">C<div class="vd-li-label">🆕 i↓</div></div>
  <div class="vd-li vd-li-add">D<div class="vd-li-label">🆕 e2↑</div></div>
</div>
<div style="margin-top:8px;padding:8px 12px;background:rgba(181,123,238,.08);border-radius:7px;border:1px solid rgba(181,123,238,.2);font-size:11px;color:#d4a8ff">
  <code>i(2) > e1(1)</code> ✅ 旧的处理完了 &nbsp;&&nbsp; <code>i(2) <= e2(3)</code> ✅ 新的还有剩<br>
  → 挂载 <code>newChildren[2..3]</code>，即 C 和 D
</div>
</div>
</div>

```ts
if (i > e1 && i <= e2) {
  while (i <= e2) {
    patch(null, newChildren[i], container)
    i++
  }
}
```

---

### Step 4：旧节点多于新节点 → 卸载

<div class="vd">
<div class="vd-card">
<div class="vd-title">📊 Step 4 — 新的扫完了，旧的有剩余</div>
<div style="font-size:12px;color:#aab0c8;margin-bottom:10px">
  <strong>条件</strong>：<code>i > e2 && i <= e1</code><br>
  <code>i > e2</code> → 新列表全部匹配完了<br>
  <code>i <= e1</code> → 旧列表还有剩 → 多余的，删掉！
</div>
<div style="font-size:10px;color:#ff8f8f;margin-bottom:2px">旧：</div>
<div class="vd-list">
  <div class="vd-li vd-li-ok">A<div class="vd-li-label">✅</div></div>
  <div class="vd-li vd-li-ok">B<div class="vd-li-label">✅</div></div>
  <div class="vd-li vd-li-del">C<div class="vd-li-label">🗑️ i↓</div></div>
  <div class="vd-li vd-li-del">D<div class="vd-li-label">🗑️ e1↑</div></div>
</div>
<div style="font-size:10px;color:#7eb3ff;margin-bottom:2px">新：</div>
<div class="vd-list">
  <div class="vd-li vd-li-ok">A<div class="vd-li-label">✅</div></div>
  <div class="vd-li vd-li-ok">B<div class="vd-li-label">✅ e2=1</div></div>
</div>
<div style="margin-top:8px;padding:8px 12px;background:rgba(255,92,92,.08);border-radius:7px;border:1px solid rgba(255,92,92,.2);font-size:11px;color:#ff8f8f">
  <code>i(2) > e2(1)</code> ✅ 新的处理完了 &nbsp;&&nbsp; <code>i(2) <= e1(3)</code> ✅ 旧的还有剩<br>
  → 卸载 <code>oldChildren[2..3]</code>，即 C 和 D
</div>
</div>
</div>

```ts
if (i > e2 && i <= e1) {
  while (i <= e1) {
    unmount(oldChildren[i])
    i++
  }
}
```

---

### Step 5：乱序（最复杂）— 核心三阶段

**条件**：前 4 步都无法完全处理——`i` 没越过 `e1`，也没越过 `e2`，说明新旧列表中间都还有剩余节点，而且顺序不同。

<div class="vd">
<div class="vd-card">
<div class="vd-title">📊 Step 5 — 进入条件</div>
<div style="font-size:11px;color:#8b90a8;margin-bottom:6px">Step 1 跳过前缀 A,B → i=2 ｜ Step 2 跳过后缀 G → e1=5, e2=5</div>
<div style="font-size:10px;color:#ff8f8f;margin-bottom:2px">旧：</div>
<div class="vd-list">
  <div class="vd-li vd-li-ok">A<div class="vd-li-label">✅</div></div>
  <div class="vd-li vd-li-ok">B<div class="vd-li-label">✅</div></div>
  <div class="vd-li vd-li-mv">C<div class="vd-li-label">i↓</div></div>
  <div class="vd-li vd-li-mv">D</div>
  <div class="vd-li vd-li-mv">E</div>
  <div class="vd-li vd-li-mv">F<div class="vd-li-label">e1↑</div></div>
  <div class="vd-li vd-li-ok">G<div class="vd-li-label">✅</div></div>
</div>
<div style="font-size:10px;color:#7eb3ff;margin-bottom:2px">新：</div>
<div class="vd-list">
  <div class="vd-li vd-li-ok">A<div class="vd-li-label">✅</div></div>
  <div class="vd-li vd-li-ok">B<div class="vd-li-label">✅</div></div>
  <div class="vd-li vd-li-mv">E<div class="vd-li-label">i↓</div></div>
  <div class="vd-li vd-li-mv">C</div>
  <div class="vd-li vd-li-mv">H</div>
  <div class="vd-li vd-li-mv">D<div class="vd-li-label">e2↑</div></div>
  <div class="vd-li vd-li-ok">G<div class="vd-li-label">✅</div></div>
</div>
<div style="margin-top:8px;padding:8px 12px;background:rgba(181,123,238,.08);border-radius:7px;border:1px solid rgba(181,123,238,.2);font-size:11px;color:#d4a8ff">
  黄色部分是乱序中间区域：旧 <code>[C,D,E,F]</code> → 新 <code>[E,C,H,D]</code>
</div>
</div>
</div>

#### 阶段一：建立新节点的 key → index 映射

<div class="vd">
<div class="vd-card">
<div class="vd-title">📊 5a — keyToNewIndexMap</div>
<div style="font-size:12px;color:#aab0c8;margin-bottom:10px">对新列表中间部分建一个 Map，方便 O(1) 查找旧节点在新列表的位置：</div>
<div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start">
<div style="flex:1;min-width:180px">
<div style="font-size:10px;color:#7eb3ff;margin-bottom:4px">新中间节点：</div>
<div class="vd-list">
  <div class="vd-li vd-li-new">E<div class="vd-li-label">索引 2</div></div>
  <div class="vd-li vd-li-new">C<div class="vd-li-label">索引 3</div></div>
  <div class="vd-li vd-li-new">H<div class="vd-li-label">索引 4</div></div>
  <div class="vd-li vd-li-new">D<div class="vd-li-label">索引 5</div></div>
</div>
</div>
<div style="flex:1;min-width:180px">
<table class="vd-tbl">
<tr><th>key</th><th>newIndex</th></tr>
<tr><td style="color:#7eb3ff;font-weight:700">E</td><td>2</td></tr>
<tr><td style="color:#7eb3ff;font-weight:700">C</td><td>3</td></tr>
<tr><td style="color:#7eb3ff;font-weight:700">H</td><td>4</td></tr>
<tr><td style="color:#7eb3ff;font-weight:700">D</td><td>5</td></tr>
</table>
</div>
</div>
</div>
</div>

#### 阶段二：遍历旧节点，patch 或 unmount

<div class="vd">
<div class="vd-card">
<div class="vd-title">📊 5b — 遍历旧中间节点</div>
<div style="font-size:12px;color:#aab0c8;margin-bottom:10px">拿每个旧节点的 key 去 Map 查：找到就 patch 复用，找不到就 unmount 删除。</div>

<div class="vd-steps">
<div class="vd-step">
  <div class="vd-step-num vd-step-g" style="width:24px;height:24px;font-size:10px">C</div>
  <div class="vd-step-body">
    <div class="vd-step-desc"><code>Map.get('C') = 3</code> ✅ → <code>patch(旧C, 新C)</code><br>
    <code>newIndex(3) >= max(0)</code> → max=3，顺序OK</div>
  </div>
</div>
<div class="vd-step">
  <div class="vd-step-num vd-step-g" style="width:24px;height:24px;font-size:10px">D</div>
  <div class="vd-step-body">
    <div class="vd-step-desc"><code>Map.get('D') = 5</code> ✅ → <code>patch(旧D, 新D)</code><br>
    <code>newIndex(5) >= max(3)</code> → max=5，顺序OK</div>
  </div>
</div>
<div class="vd-step">
  <div class="vd-step-num vd-step-y" style="width:24px;height:24px;font-size:10px">E</div>
  <div class="vd-step-body">
    <div class="vd-step-desc"><code>Map.get('E') = 2</code> ✅ → <code>patch(旧E, 新E)</code><br>
    <code style="color:#ffd166">newIndex(2) < max(5)</code> → ⚡ <strong style="color:#ffd166">moved = true!</strong> 顺序变了</div>
  </div>
</div>
<div class="vd-step" style="border-bottom:none">
  <div class="vd-step-num vd-step-r" style="width:24px;height:24px;font-size:10px">F</div>
  <div class="vd-step-body">
    <div class="vd-step-desc"><code>Map.get('F') = undefined</code> ❌ → <strong style="color:#ff8f8f">unmount(F) 🗑️</strong> 新列表没有 F</div>
  </div>
</div>
</div>

<div style="margin-top:14px;font-size:11px;font-weight:700;color:#a8b0cc;margin-bottom:6px">构建 newIndexToOldIndexMap：</div>
<div style="display:flex;gap:0;flex-wrap:nowrap;overflow-x:auto">
<table class="vd-tbl" style="min-width:360px">
<tr><th>新中间位置</th><th>节点</th><th>对应旧索引+1</th><th>含义</th></tr>
<tr><td>0</td><td style="color:#ffd166">E</td><td>5 <span style="color:#555">(旧索引4+1)</span></td><td style="color:#ffd166">需要移动</td></tr>
<tr><td>1</td><td style="color:#6ef5a8">C</td><td>3 <span style="color:#555">(旧索引2+1)</span></td><td style="color:#6ef5a8">在 LIS 中，不动</td></tr>
<tr><td>2</td><td style="color:#d4a8ff">H</td><td>0</td><td style="color:#d4a8ff">0 = 新增节点</td></tr>
<tr><td>3</td><td style="color:#6ef5a8">D</td><td>4 <span style="color:#555">(旧索引3+1)</span></td><td style="color:#6ef5a8">在 LIS 中，不动</td></tr>
</table>
</div>
<div class="vd-note vd-ny">⚠️ 值是<strong>旧索引 + 1</strong>，因为 <code>0</code> 要保留表示「新增节点」。</div>
</div>
</div>

#### 阶段三：LIS 最长递增子序列 — 决定谁动谁不动

<div class="vd">
<div class="vd-card">
<div class="vd-title">📊 5c — LIS + 倒序遍历</div>

<div style="padding:12px;background:#191c2a;border-radius:8px;border:1px solid #2e3347;margin-bottom:12px">
<div style="font-size:11px;font-weight:700;color:#d4a8ff;margin-bottom:6px">LIS 计算：</div>
<div style="font-size:12px;color:#aab0c8">
<code>newIndexToOldIndexMap = [5, 3, 0, 4]</code><br>
跳过 0(新增)，在 [5, <strong style="color:#6ef5a8">3</strong>, <strong style="color:#6ef5a8">4</strong>] 中找递增子序列<br>
<strong style="color:#6ef5a8">LIS = [3, 4]</strong> → 对应索引 <strong>[1, 3]</strong> → 即 <strong>C 和 D 不需要移动</strong>
</div>
</div>

<div style="font-size:11px;font-weight:700;color:#7eb3ff;margin-bottom:8px">倒序遍历（后面的先处理好，可以用作锚点）：</div>
<div class="vd-steps">
<div class="vd-step">
  <div class="vd-step-num vd-step-g" style="width:28px;height:28px;font-size:11px">k=3</div>
  <div class="vd-step-body">
    <div class="vd-step-title" style="color:#6ef5a8">D → 在 LIS 中 ✅ 不动</div>
    <div class="vd-step-desc"><code>k === LIS[j=1] = 3</code> → 跳过，<code>j--</code></div>
  </div>
</div>
<div class="vd-step">
  <div class="vd-step-num vd-step-p" style="width:28px;height:28px;font-size:11px">k=2</div>
  <div class="vd-step-body">
    <div class="vd-step-title" style="color:#d4a8ff">H → 值为 0，新增！🆕</div>
    <div class="vd-step-desc"><code>insertBefore(H, D的DOM)</code> ← D 已在正确位置，用作锚点</div>
  </div>
</div>
<div class="vd-step">
  <div class="vd-step-num vd-step-g" style="width:28px;height:28px;font-size:11px">k=1</div>
  <div class="vd-step-body">
    <div class="vd-step-title" style="color:#6ef5a8">C → 在 LIS 中 ✅ 不动</div>
    <div class="vd-step-desc"><code>k === LIS[j=0] = 1</code> → 跳过，<code>j--</code></div>
  </div>
</div>
<div class="vd-step" style="border-bottom:none">
  <div class="vd-step-num vd-step-y" style="width:28px;height:28px;font-size:11px">k=0</div>
  <div class="vd-step-body">
    <div class="vd-step-title" style="color:#ffd166">E → 不在 LIS 中，移动！🔀</div>
    <div class="vd-step-desc"><code>insertBefore(E, C的DOM)</code> ← C 已在正确位置，用作锚点</div>
  </div>
</div>
</div>

<div style="margin-top:14px;font-size:11px;font-weight:700;color:#a8b0cc;margin-bottom:6px">DOM 变化过程：</div>
<div style="display:flex;flex-direction:column;gap:6px">
<div style="padding:6px 12px;border-radius:6px;background:rgba(255,92,92,.06);border:1px solid rgba(255,92,92,.15);font-size:11px">
  <span style="color:#ff8f8f">① unmount(F)</span>
  <span style="color:#555;margin-left:10px">→</span>
  <span style="color:#8b90a8;margin-left:10px">... [C] [D] [E] ...</span>
</div>
<div style="padding:6px 12px;border-radius:6px;background:rgba(181,123,238,.06);border:1px solid rgba(181,123,238,.15);font-size:11px">
  <span style="color:#d4a8ff">② insert(H) before D</span>
  <span style="color:#555;margin-left:10px">→</span>
  <span style="color:#8b90a8;margin-left:10px">... [C] [<strong style="color:#d4a8ff">H</strong>] [D] [E] ...</span>
</div>
<div style="padding:6px 12px;border-radius:6px;background:rgba(255,209,102,.06);border:1px solid rgba(255,209,102,.15);font-size:11px">
  <span style="color:#ffd166">③ move(E) before C</span>
  <span style="color:#555;margin-left:10px">→</span>
  <span style="color:#8b90a8;margin-left:10px">... [<strong style="color:#ffd166">E</strong>] [C] [H] [D] ...</span>
</div>
</div>

<div class="vd-note vd-ng" style="margin-top:10px">✅ C 和 D 全程没动，只操作了 <strong>3 次</strong>（1 删 + 1 插 + 1 移）。如果没有 LIS，需要移动 4 个节点。</div>
</div>
</div>

#### 为什么用 LIS？

<div class="vd">
<div class="vd-card">
<div class="vd-diff-row">
<div class="vd-diff-col" style="background:#1f1b22;border-right:1px solid #2e3347">
<div class="vd-diff-hd"><span style="color:#ff8f8f">❌ 不用 LIS</span></div>
<div class="vd-diff-item">逐个检查位置，不合适就移动</div>
<div class="vd-diff-item">可能移动 n 次</div>
<div class="vd-diff-item">很多移动是多余的</div>
</div>
<div class="vd-diff-col" style="background:#1b2a1f">
<div class="vd-diff-hd"><span style="color:#6ef5a8">✅ 用 LIS</span></div>
<div class="vd-diff-item">找到最长已有序序列 → 不动</div>
<div class="vd-diff-item">只移动不在序列中的节点</div>
<div class="vd-diff-item">LIS 越长 → 操作越少 → 越快</div>
</div>
</div>
</div>
</div>

#### 倒序遍历的原因

<div class="vd">
<div class="vd-card">
<div style="font-size:12px;color:#aab0c8;margin-bottom:10px">DOM 的 <code>insertBefore(node, anchor)</code> 需要一个<strong>锚点</strong>。倒序保证后面的节点已就位，可以用作锚点：</div>
<div class="vd-flow" style="flex-direction:column;align-items:stretch;gap:4px">
  <div style="padding:6px 12px;border-radius:6px;background:rgba(61,220,132,.06);border:1px solid rgba(61,220,132,.15);font-size:11px">
    <strong style="color:#6ef5a8">k=3 D</strong> 不动（锚点是 G，已确定 ✅）
  </div>
  <div style="padding:6px 12px;border-radius:6px;background:rgba(181,123,238,.06);border:1px solid rgba(181,123,238,.15);font-size:11px">
    <strong style="color:#d4a8ff">k=2 H</strong> 新增，insertBefore(H, <strong>D</strong>) ← D 已在正确位置 ✅
  </div>
  <div style="padding:6px 12px;border-radius:6px;background:rgba(61,220,132,.06);border:1px solid rgba(61,220,132,.15);font-size:11px">
    <strong style="color:#6ef5a8">k=1 C</strong> 不动
  </div>
  <div style="padding:6px 12px;border-radius:6px;background:rgba(255,209,102,.06);border:1px solid rgba(255,209,102,.15);font-size:11px">
    <strong style="color:#ffd166">k=0 E</strong> 移动，insertBefore(E, <strong>C</strong>) ← C 已在正确位置 ✅
  </div>
</div>
<div class="vd-note vd-nr">⚠️ 如果<strong>正序遍历</strong>，后面的节点还没处理好，找不到正确的锚点！</div>
</div>
</div>

#### moved 标记优化

<div class="vd">
<div class="vd-card">
<div style="font-size:12px;color:#aab0c8;margin-bottom:8px">遍历旧节点时，如果新位置一直递增 → 说明顺序没变 → <code>moved = false</code> → <strong>跳过整个 LIS 计算</strong>！</div>
<div style="padding:10px 14px;background:#191c2a;border-radius:8px;border:1px solid #2e3347;font-size:12px;font-family:monospace;color:#8b90a8">
<span style="color:#ffd166">if</span> (newIndex >= maxNewIndexSoFar) maxNewIndexSoFar = newIndex <span style="color:#555">// 递增，OK</span><br>
<span style="color:#ffd166">else</span> moved = <span style="color:#ff8f8f">true</span> <span style="color:#555">// 位置变小了，有移动</span>
</div>
<div class="vd-note vd-ng">💡 大部分更新场景顺序不变，这个优化命中率很高，直接省掉 O(n log n) 的 LIS 计算。</div>
</div>
</div>

#### patched 计数优化

<div class="vd">
<div class="vd-card">
<div style="font-size:12px;color:#aab0c8;margin-bottom:8px">维护 <code>patched</code> 计数器，新节点全部匹配完后，剩余旧节点不用查 Map，直接 unmount：</div>
<div style="font-size:10px;color:#ff8f8f;margin-bottom:2px">旧中间 (6个)：</div>
<div class="vd-list">
  <div class="vd-li vd-li-ok">C<div class="vd-li-label">✅ p=1</div></div>
  <div class="vd-li vd-li-del">D<div class="vd-li-label">❌</div></div>
  <div class="vd-li vd-li-ok">E<div class="vd-li-label">✅ p=2 满了!</div></div>
  <div class="vd-li vd-li-del">F<div class="vd-li-label">直接删</div></div>
  <div class="vd-li vd-li-del">G<div class="vd-li-label">直接删</div></div>
  <div class="vd-li vd-li-del">H<div class="vd-li-label">直接删</div></div>
</div>
<div style="font-size:10px;color:#7eb3ff;margin-bottom:2px">新中间 (2个 toBePatched=2)：</div>
<div class="vd-list">
  <div class="vd-li vd-li-new">E</div>
  <div class="vd-li vd-li-new">C</div>
</div>
<div class="vd-note vd-nb">💡 <code>patched(2) >= toBePatched(2)</code> 后，F/G/H 不用查 Map 直接 unmount，省了 3 次 Map 查找。</div>
</div>
</div>

#### Step 5 完整简化源码

```ts
// ======= Step 5: 乱序处理 =======
const s1 = i  // 旧中间起点
const s2 = i  // 新中间起点

// --- 阶段一：建 keyToNewIndexMap ---
const keyToNewIndexMap = new Map()
for (let j = s2; j <= e2; j++) {
  keyToNewIndexMap.set(newChildren[j].key, j)
}

// --- 阶段二：遍历旧节点 patch/unmount ---
const toBePatched = e2 - s2 + 1
let patched = 0
let moved = false
let maxNewIndexSoFar = 0

// newIndexToOldIndexMap: 新位置 → 旧位置+1（0 表示新增）
const newIndexToOldIndexMap = new Array(toBePatched).fill(0)

for (let j = s1; j <= e1; j++) {
  const oldVNode = oldChildren[j]

  if (patched >= toBePatched) {
    unmount(oldVNode)  // 提前退出优化
    continue
  }

  const newIndex = keyToNewIndexMap.get(oldVNode.key)

  if (newIndex === undefined) {
    unmount(oldVNode)  // 新列表没有这个节点，删除
  } else {
    newIndexToOldIndexMap[newIndex - s2] = j + 1  // 记录旧位置

    if (newIndex >= maxNewIndexSoFar) {
      maxNewIndexSoFar = newIndex
    } else {
      moved = true  // 顺序变了
    }

    patch(oldVNode, newChildren[newIndex], container)
    patched++
  }
}

// --- 阶段三：移动和挂载 ---
const increasingNewIndexSequence = moved
  ? getSequence(newIndexToOldIndexMap)  // 求 LIS
  : []  // 不需要移动，跳过 LIS 计算

let j = increasingNewIndexSequence.length - 1

// 倒序遍历新中间部分
for (let k = toBePatched - 1; k >= 0; k--) {
  const nextIndex = s2 + k
  const nextChild = newChildren[nextIndex]
  const anchor = nextIndex + 1 < newChildren.length
    ? newChildren[nextIndex + 1].el  // 下一个节点的 DOM 作为锚点
    : parentAnchor

  if (newIndexToOldIndexMap[k] === 0) {
    // 新增节点
    patch(null, nextChild, container, anchor)
  } else if (moved) {
    if (j < 0 || k !== increasingNewIndexSequence[j]) {
      // 不在 LIS 中 → 移动
      move(nextChild, container, anchor)
    } else {
      j--  // 在 LIS 中 → 不动，跳过
    }
  }
}
```

---

## 四、完整流程图

<div class="vd">
<div class="vd-card">
<div class="vd-title">📊 patchKeyedChildren 完整流程</div>
<div class="vd-flow" style="flex-direction:column;align-items:stretch;gap:0">

<div style="display:flex;align-items:center;gap:8px;padding:8px 0">
  <span class="vd-fbox vd-fbox-b" style="min-width:200px">Step 1: 从头扫描，跳过相同前缀</span>
  <span style="color:#555;font-size:10px;flex:1">while (i <= e1 && i <= e2 && same) → patch, i++</span>
</div>
<div style="color:#555;padding-left:20px;font-size:12px">↓</div>

<div style="display:flex;align-items:center;gap:8px;padding:8px 0">
  <span class="vd-fbox vd-fbox-b" style="min-width:200px">Step 2: 从尾扫描，跳过相同后缀</span>
  <span style="color:#555;font-size:10px;flex:1">while (i <= e1 && i <= e2 && same) → patch, e1--, e2--</span>
</div>
<div style="color:#555;padding-left:20px;font-size:12px">↓</div>

<div style="display:flex;align-items:center;gap:8px;padding:8px 0">
  <span class="vd-fbox vd-fbox-g" style="min-width:200px">Step 3: i > e1 && i <= e2 ?</span>
  <span style="color:#6ef5a8;font-size:10px;flex:1">YES → 新增节点，逐个 mount</span>
</div>
<div style="color:#555;padding-left:20px;font-size:12px">↓ NO</div>

<div style="display:flex;align-items:center;gap:8px;padding:8px 0">
  <span class="vd-fbox vd-fbox-r" style="min-width:200px">Step 4: i > e2 && i <= e1 ?</span>
  <span style="color:#ff8f8f;font-size:10px;flex:1">YES → 多余节点，逐个 unmount</span>
</div>
<div style="color:#555;padding-left:20px;font-size:12px">↓ NO</div>

<div style="padding:10px 14px;border-radius:8px;background:rgba(181,123,238,.08);border:1px solid rgba(181,123,238,.2)">
  <div style="font-size:12px;font-weight:700;color:#d4a8ff;margin-bottom:6px">Step 5: 乱序处理</div>
  <div class="vd-flow" style="gap:4px">
    <span class="vd-fbox vd-fbox-p" style="font-size:10px;padding:5px 10px">5a: 建 keyToNewIndexMap</span>
    <span class="vd-farr">→</span>
    <span class="vd-fbox vd-fbox-p" style="font-size:10px;padding:5px 10px">5b: 遍历旧节点 patch/unmount</span>
    <span class="vd-farr">→</span>
    <span class="vd-fbox vd-fbox-p" style="font-size:10px;padding:5px 10px">5c: LIS → 倒序移动/挂载</span>
  </div>
</div>

</div>
</div>
</div>

---

## 五、Vue2 vs Vue3 Diff 对比

<div class="vd">
<div class="vd-card">
<div class="vd-title">📊 核心差异对比</div>
<table class="vd-tbl">
<tr><th>维度</th><th>Vue2（双端 Diff）</th><th>Vue3（快速 Diff）</th></tr>
<tr><td>预处理</td><td style="color:#ff8f8f">无</td><td style="color:#6ef5a8">头尾预处理，跳过相同前后缀</td></tr>
<tr><td>核心思路</td><td>4 指针交叉比较</td><td>keyMap + LIS 最少移动</td></tr>
<tr><td>最少移动保证</td><td style="color:#ff8f8f">❌ 不保证</td><td style="color:#6ef5a8">✅ LIS 保证</td></tr>
<tr><td>静态节点</td><td style="color:#ff8f8f">全量参与 diff</td><td style="color:#6ef5a8">Block Tree + PatchFlag 跳过</td></tr>
<tr><td>最坏复杂度</td><td style="color:#ff8f8f">O(n²)</td><td style="color:#6ef5a8">O(n log n)</td></tr>
</table>
</div>
</div>

### Vue2 双端 Diff 详解

<div class="vd">
<div class="vd-card">
<div class="vd-title">📊 Vue2 — 4 指针双端比较</div>

<div style="font-size:12px;color:#aab0c8;margin-bottom:10px">Vue2 用 4 个指针，从新旧两个列表的头和尾同时向中间靠拢：</div>

<div style="font-size:10px;color:#ff8f8f;margin-bottom:2px">旧：</div>
<div class="vd-list">
  <div class="vd-li vd-li-g">A<div class="vd-li-label">os↓</div></div>
  <div class="vd-li vd-li-g">B</div>
  <div class="vd-li vd-li-g">C</div>
  <div class="vd-li vd-li-g">D<div class="vd-li-label">oe↑</div></div>
</div>
<div style="font-size:10px;color:#7eb3ff;margin-bottom:2px">新：</div>
<div class="vd-list">
  <div class="vd-li vd-li-g">D<div class="vd-li-label">ns↓</div></div>
  <div class="vd-li vd-li-g">B</div>
  <div class="vd-li vd-li-g">A</div>
  <div class="vd-li vd-li-g">C<div class="vd-li-label">ne↑</div></div>
</div>

<div style="margin-top:12px">
<table class="vd-tbl">
<tr><th>对比顺序</th><th>比较</th><th>命中后操作</th></tr>
<tr><td style="color:#7eb3ff">① 头头</td><td>os vs ns</td><td>patch, os++, ns++</td></tr>
<tr><td style="color:#6ef5a8">② 尾尾</td><td>oe vs ne</td><td>patch, oe--, ne--</td></tr>
<tr><td style="color:#ffd166">③ 头尾</td><td>os vs ne</td><td>patch + 移动 os 到 oe 后面</td></tr>
<tr><td style="color:#d4a8ff">④ 尾头</td><td>oe vs ns</td><td>patch + 移动 oe 到 os 前面</td></tr>
</table>
</div>

<div style="margin-top:12px;font-size:11px;font-weight:700;color:#a8b0cc;margin-bottom:8px">逐轮图解（D→B→A→C 的变换）：</div>

<div style="display:flex;flex-direction:column;gap:8px">
<div style="padding:10px 14px;border-radius:8px;background:#191c2a;border:1px solid #2e3347">
  <div style="font-size:11px;font-weight:700;color:#d4a8ff;margin-bottom:6px">第 1 轮：④ 尾头命中 D===D</div>
  <div style="font-size:11px;color:#8b90a8">patch(旧D, 新D) → 移动 D 到 A 前面 → oe--, ns++</div>
  <div style="font-size:10px;color:#555;margin-top:4px">DOM: <span class="vd-li vd-li-mv" style="display:inline;padding:2px 6px;font-size:10px">D</span> A B C</div>
</div>
<div style="padding:10px 14px;border-radius:8px;background:#191c2a;border:1px solid #2e3347">
  <div style="font-size:11px;font-weight:700;color:#6ef5a8;margin-bottom:6px">第 2 轮：② 尾尾命中 C===C</div>
  <div style="font-size:11px;color:#8b90a8">patch(旧C, 新C) → 位置不变 → oe--, ne--</div>
  <div style="font-size:10px;color:#555;margin-top:4px">DOM: D A B C（C 没动，只 patch）</div>
</div>
<div style="padding:10px 14px;border-radius:8px;background:#191c2a;border:1px solid #2e3347">
  <div style="font-size:11px;font-weight:700;color:#ffd166;margin-bottom:6px">第 3 轮：③ 头尾命中 A===A</div>
  <div style="font-size:11px;color:#8b90a8">patch(旧A, 新A) → 移动 A 到 oe 后面 → os++, ne--</div>
  <div style="font-size:10px;color:#555;margin-top:4px">DOM: D B <span class="vd-li vd-li-mv" style="display:inline;padding:2px 6px;font-size:10px">A</span> C</div>
</div>
<div style="padding:10px 14px;border-radius:8px;background:#191c2a;border:1px solid #2e3347">
  <div style="font-size:11px;font-weight:700;color:#7eb3ff;margin-bottom:6px">第 4 轮：① 头头命中 B===B</div>
  <div style="font-size:11px;color:#8b90a8">patch(旧B, 新B) → os > oe，结束！</div>
  <div style="font-size:10px;color:#6ef5a8;margin-top:4px">DOM: D B A C ✅</div>
</div>
</div>

<div class="vd-note vd-nr" style="margin-top:12px">
⚠️ <strong>Vue2 双端 Diff 的局限</strong>：<br>
▸ 没有预处理，每次都要做 4 次比较<br>
▸ 4 次都不命中时退化为遍历查找，最坏 O(n²)<br>
▸ 没有 LIS，不能保证最少移动次数<br>
▸ 没有 PatchFlag，无法跳过静态节点
</div>
</div>
</div>

---

## 六、LIS 最长递增子序列 — 算法推演

<div class="vd">
<div class="vd-card">
<div class="vd-title">📊 什么是 LIS？</div>
<div style="font-size:12px;color:#aab0c8;margin-bottom:8px">在一个数组中找到<strong>最长的递增子序列</strong>（不要求连续）：</div>
<div style="padding:8px 14px;background:#191c2a;border-radius:8px;border:1px solid #2e3347;font-size:12px;font-family:monospace;color:#aab0c8">
输入: [3, 1, 4, 1, 5, 9, 2, 6]<br>
LIS: [<span style="color:#6ef5a8">1, 4, 5, 9</span>] 或 [<span style="color:#6ef5a8">1, 4, 5, 6</span>]，长度 = 4
</div>
<div style="margin-top:10px;font-size:12px;color:#aab0c8"><strong>在 diff 中的含义</strong>：LIS 中的节点位置已经递增，<strong>不需要移动</strong>，只移动不在 LIS 中的。</div>
</div>
</div>

<div class="vd">
<div class="vd-card">
<div class="vd-title">📊 Vue3 getSequence 算法推演：getSequence([5, 3, 0, 4])</div>

<div style="font-size:11px;color:#8b90a8;margin-bottom:8px">算法策略：<strong>贪心 + 二分查找 + 回溯</strong>，时间复杂度 O(n log n)</div>

<div class="vd-steps">
<div class="vd-step">
  <div class="vd-step-num vd-step-b" style="width:24px;height:24px;font-size:10px">i=0</div>
  <div class="vd-step-body">
    <div class="vd-step-desc"><code>arrI = 5</code>，result 最后一个值 arr[0]=5<br>
    5 < 5? NO → 不追加，二分查找也不替换<br>
    <code>result = [0]</code></div>
  </div>
</div>
<div class="vd-step">
  <div class="vd-step-num vd-step-y" style="width:24px;height:24px;font-size:10px">i=1</div>
  <div class="vd-step-body">
    <div class="vd-step-desc"><code>arrI = 3</code>，arr[result末尾]=5<br>
    5 < 3? NO → 不追加<br>
    二分查找：3 < 5 → <strong style="color:#ffd166">替换！result[0] = 1</strong>（3 比 5 更适合做开头）<br>
    <code>result = [1]</code></div>
  </div>
</div>
<div class="vd-step">
  <div class="vd-step-num vd-step-g" style="width:24px;height:24px;font-size:10px">i=2</div>
  <div class="vd-step-body">
    <div class="vd-step-desc"><code>arrI = 0</code> → <strong style="color:#6ef5a8">跳过</strong>（0 表示新增节点，不参与 LIS）</div>
  </div>
</div>
<div class="vd-step" style="border-bottom:none">
  <div class="vd-step-num vd-step-p" style="width:24px;height:24px;font-size:10px">i=3</div>
  <div class="vd-step-body">
    <div class="vd-step-desc"><code>arrI = 4</code>，arr[result末尾]=arr[1]=3<br>
    3 < 4? YES → <strong style="color:#d4a8ff">追加！result.push(3)</strong>，记录前驱 p[3]=1<br>
    <code>result = [1, 3]</code> → 对应值 3 和 4（递增 ✅）</div>
  </div>
</div>
</div>

<div style="margin-top:12px;padding:10px 14px;background:rgba(61,220,132,.08);border-radius:8px;border:1px solid rgba(61,220,132,.2)">
<div style="font-size:11px;font-weight:700;color:#6ef5a8;margin-bottom:4px">最终结果（回溯后）：</div>
<div style="font-size:12px;color:#aab0c8">
<code>result = [1, 3]</code> → 索引 1(C) 和 3(D) 不需要移动
</div>
</div>

<div class="vd-note vd-np" style="margin-top:10px">💡 为什么需要 <strong>p 数组回溯</strong>？贪心替换过程中 result 的值可能不是最终 LIS（替换只是为了让 result 保持"可延伸"）。通过 p 记录前驱关系，从后往前回溯才能还原真正的 LIS。</div>
</div>
</div>

<div class="vd">
<div class="vd-card">
<div class="vd-title">📊 三种算法复杂度对比</div>
<table class="vd-tbl">
<tr><th>算法</th><th>复杂度</th><th>说明</th></tr>
<tr><td style="color:#ff8f8f">暴力枚举</td><td>O(2ⁿ)</td><td>检查所有子序列</td></tr>
<tr><td style="color:#ffd166">动态规划</td><td>O(n²)</td><td>dp[i] = 以 i 结尾的 LIS 长度</td></tr>
<tr><td style="color:#6ef5a8">贪心+二分</td><td>O(n log n)</td><td>Vue3 使用，追加 O(1) + 替换 O(log n)</td></tr>
</table>
</div>
</div>

---

## 七、常见陷阱与面试追问

<div class="vd">
<div class="vd-card">
<div class="vd-title">📊 陷阱 1：为什么不能用 index 做 key？</div>
<div style="display:flex;gap:12px;flex-wrap:wrap">
<div style="flex:1;min-width:220px;border-radius:8px;padding:12px;background:#1f1416;border:1px solid rgba(255,92,92,.2)">
<div style="font-size:11px;font-weight:700;color:#ff8f8f;margin-bottom:6px">❌ 用 index 做 key</div>
<div class="vd-phase vd-ph-old">旧</div>
<div class="vd-list" style="margin-bottom:6px">
  <div class="vd-li vd-li-g">A<div class="vd-li-label">key=0</div></div>
  <div class="vd-li vd-li-g">B<div class="vd-li-label">key=1</div></div>
  <div class="vd-li vd-li-g">C<div class="vd-li-label">key=2</div></div>
</div>
<div class="vd-phase vd-ph-new">新（删除 A）</div>
<div class="vd-list">
  <div class="vd-li vd-li-del">B<div class="vd-li-label">key=0</div></div>
  <div class="vd-li vd-li-del">C<div class="vd-li-label">key=1</div></div>
</div>
<div style="font-size:10px;color:#ff8f8f;margin-top:6px">key=0 没变 → patch(A→B) 文本替换<br>key=1 没变 → patch(B→C) 文本替换<br>unmount 最后一个<br><strong>3 次操作，全部错误复用</strong></div>
</div>
<div style="flex:1;min-width:220px;border-radius:8px;padding:12px;background:#161f1a;border:1px solid rgba(61,220,132,.2)">
<div style="font-size:11px;font-weight:700;color:#6ef5a8;margin-bottom:6px">✅ 用唯一 id 做 key</div>
<div class="vd-phase vd-ph-old">旧</div>
<div class="vd-list" style="margin-bottom:6px">
  <div class="vd-li vd-li-g">A<div class="vd-li-label">key="a"</div></div>
  <div class="vd-li vd-li-g">B<div class="vd-li-label">key="b"</div></div>
  <div class="vd-li vd-li-g">C<div class="vd-li-label">key="c"</div></div>
</div>
<div class="vd-phase vd-ph-new">新（删除 A）</div>
<div class="vd-list">
  <div class="vd-li vd-li-ok">B<div class="vd-li-label">key="b" 复用</div></div>
  <div class="vd-li vd-li-ok">C<div class="vd-li-label">key="c" 复用</div></div>
</div>
<div style="font-size:10px;color:#6ef5a8;margin-top:6px">key=a 消失 → unmount(A)<br>B、C 不动<br><strong>1 次操作，精准删除</strong></div>
</div>
</div>
</div>
</div>

<div class="vd">
<div class="vd-card">
<div class="vd-title">📊 更多追问</div>
<div class="vd-steps">
<div class="vd-step">
  <div class="vd-step-num vd-step-b" style="width:24px;height:24px;font-size:10px">2</div>
  <div class="vd-step-body">
    <div class="vd-step-title" style="color:#7eb3ff">key 相同但 type 不同？</div>
    <div class="vd-step-desc"><code>isSameVNodeType</code> 返回 false → 不复用，直接卸载旧的 + 挂载新的</div>
  </div>
</div>
<div class="vd-step">
  <div class="vd-step-num vd-step-y" style="width:24px;height:24px;font-size:10px">3</div>
  <div class="vd-step-body">
    <div class="vd-step-title" style="color:#ffd166">没有 key 的节点怎么处理？</div>
    <div class="vd-step-desc">走 <code>patchUnkeyedChildren</code>，退化为按索引逐个对比：公共长度内逐个 patch，新的多了 mount，旧的多了 unmount</div>
  </div>
</div>
<div class="vd-step">
  <div class="vd-step-num vd-step-p" style="width:24px;height:24px;font-size:10px">4</div>
  <div class="vd-step-body">
    <div class="vd-step-title" style="color:#d4a8ff">diff 只发生在同一层级</div>
    <div class="vd-step-desc">Vue 不跨层级比较。节点从一层移到另一层 → 卸载旧的 + 创建新的（不识别为"移动"）</div>
  </div>
</div>
<div class="vd-step" style="border-bottom:none">
  <div class="vd-step-num vd-step-g" style="width:24px;height:24px;font-size:10px">5</div>
  <div class="vd-step-body">
    <div class="vd-step-title" style="color:#6ef5a8">Fragment 和 Teleport</div>
    <div class="vd-step-desc"><strong>Fragment</strong>：多根节点，作为虚拟容器处理 children<br>
    <strong>Teleport</strong>：<code>to</code> 变了会移动整个内容到新容器，children 在目标容器中 diff</div>
  </div>
</div>
</div>
</div>
</div>

---

## 八、面试回答模板（30 秒版）

<div class="vd">
<div class="vd-card" style="background:#1e1b2e;border-color:rgba(181,123,238,.3)">
<div style="font-size:12px;color:#d4a8ff;font-weight:700;margin-bottom:8px">🎤 面试模板</div>
<div style="font-size:13px;color:#e0e4f0;line-height:1.8">
Vue3 的快速 diff 分五步：<strong style="color:#7eb3ff">① 从头扫描跳过相同前缀 ② 从尾扫描跳过相同后缀</strong>，这两步能处理「头尾不变只是中间变了」的常见场景；然后看指针状态：<strong style="color:#6ef5a8">③ 新多旧少就挂载</strong> <strong style="color:#ff8f8f">④ 旧多新少就卸载</strong>；如果中间还剩乱序部分，<strong style="color:#d4a8ff">⑤ 建 key→index 映射找到对应关系，求 LIS 最长递增子序列确定哪些节点不用动</strong>，只移动剩余的，保证最少 DOM 操作。配合编译期 Block Tree + PatchFlag，静态节点直接跳过不参与 diff。
</div>
</div>
</div>

---

## 九、源码参考

<div class="vd">
<div class="vd-card">
<div class="vd-title">📊 简化源码文件</div>
<table class="vd-tbl">
<tr><th>文件</th><th>说明</th></tr>
<tr><td><a href="./code/" style="color:#7eb3ff">完整源码（整合版）</a></td><td>isSameVNodeType + patchKeyedChildren + getSequence 三合一</td></tr>
</table>
</div>
</div>

