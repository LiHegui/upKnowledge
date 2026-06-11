# Vue3 Diff 简化源码

> 以下为 Vue3 快速 Diff 算法的简化 TypeScript 实现，保留核心逻辑，去除边缘处理。

---

## 1. isSameVNodeType — 节点比较

```ts
export interface VNode {
  type: string
  key: string
}

/**
 * 根据 type + key 判断是否为相同类型节点
 * 只有两者都相等，才认为是"同一个节点"，可以复用 DOM
 */
export function isSameVNodeType(node1: VNode, node2: VNode): boolean {
  return node1.type === node2.type && node1.key === node2.key
}
```

---

## 2. patchKeyedChildren — 五步 Diff 核心

```ts
import { VNode, isSameVNodeType } from './isSameVNodeType'
import { getSequence } from './getSequence'

// 简化版工具函数
const patch = (oldVNode: VNode | null, newVNode: VNode, container: any, anchor?: any): void => {}
const unmount = (vnode: VNode): void => {}
const move = (vnode: VNode, container: any, anchor: any): void => {}

/**
 * Vue3 快速 Diff 核心算法（简化版）
 * 步骤：
 *   1. 自前向后对比（跳过相同前缀）
 *   2. 自后向前对比（跳过相同后缀）
 *   3. 新节点多于旧节点 → 挂载
 *   4. 旧节点多于新节点 → 卸载
 *   5. 乱序处理（keyMap + LIS）
 */
const patchKeyedChildren = (
  oldChildren: VNode[],
  newChildren: VNode[],
  container: any,
  parentAnchor?: any
) => {
  let i = 0
  let e1 = oldChildren.length - 1
  let e2 = newChildren.length - 1

  // ======= Step 1: 自前向后 — 跳过相同前缀 =======
  while (i <= e1 && i <= e2) {
    if (isSameVNodeType(oldChildren[i], newChildren[i])) {
      patch(oldChildren[i], newChildren[i], container)
    } else {
      break
    }
    i++
  }

  // ======= Step 2: 自后向前 — 跳过相同后缀 =======
  while (i <= e1 && i <= e2) {
    if (isSameVNodeType(oldChildren[e1], newChildren[e2])) {
      patch(oldChildren[e1], newChildren[e2], container)
    } else {
      break
    }
    e1--
    e2--
  }

  // ======= Step 3: 新多旧少 — 挂载新增节点 =======
  if (i > e1 && i <= e2) {
    const nextPos = e2 + 1
    const anchor = nextPos < newChildren.length
      ? (newChildren[nextPos] as any).el
      : parentAnchor
    while (i <= e2) {
      patch(null, newChildren[i], container, anchor)
      i++
    }
  }

  // ======= Step 4: 旧多新少 — 卸载多余节点 =======
  else if (i > e2 && i <= e1) {
    while (i <= e1) {
      unmount(oldChildren[i])
      i++
    }
  }

  // ======= Step 5: 乱序处理 =======
  else {
    const s1 = i  // 旧中间起点
    const s2 = i  // 新中间起点

    // --- 5a: 建 keyToNewIndexMap ---
    const keyToNewIndexMap = new Map<string, number>()
    for (let j = s2; j <= e2; j++) {
      keyToNewIndexMap.set(newChildren[j].key, j)
    }

    // --- 5b: 遍历旧节点，patch 或 unmount ---
    const toBePatched = e2 - s2 + 1
    let patched = 0
    let moved = false
    let maxNewIndexSoFar = 0
    const newIndexToOldIndexMap = new Array(toBePatched).fill(0)

    for (let j = s1; j <= e1; j++) {
      const oldVNode = oldChildren[j]

      // 提前退出优化：新节点已全部匹配
      if (patched >= toBePatched) {
        unmount(oldVNode)
        continue
      }

      const newIndex = keyToNewIndexMap.get(oldVNode.key)

      if (newIndex === undefined) {
        // 新列表没有这个节点，删除
        unmount(oldVNode)
      } else {
        // 记录旧位置（+1 因为 0 表示新增）
        newIndexToOldIndexMap[newIndex - s2] = j + 1

        // 检测是否需要移动
        if (newIndex >= maxNewIndexSoFar) {
          maxNewIndexSoFar = newIndex
        } else {
          moved = true
        }

        patch(oldVNode, newChildren[newIndex], container)
        patched++
      }
    }

    // --- 5c: 移动和挂载 ---
    const increasingNewIndexSequence = moved
      ? getSequence(newIndexToOldIndexMap)
      : []

    let j = increasingNewIndexSequence.length - 1

    // 倒序遍历：保证后面的节点已处理，可作为锚点
    for (let k = toBePatched - 1; k >= 0; k--) {
      const nextIndex = s2 + k
      const nextChild = newChildren[nextIndex]
      const anchor = nextIndex + 1 < newChildren.length
        ? (newChildren[nextIndex + 1] as any).el
        : parentAnchor

      if (newIndexToOldIndexMap[k] === 0) {
        // 新增节点
        patch(null, nextChild, container, anchor)
      } else if (moved) {
        if (j < 0 || k !== increasingNewIndexSequence[j]) {
          // 不在 LIS 中 → 移动
          move(nextChild, container, anchor)
        } else {
          // 在 LIS 中 → 不动
          j--
        }
      }
    }
  }
}
```

---

## 3. getSequence — 最长递增子序列（LIS）

> 时间复杂度 O(n log n)，贪心 + 二分查找 + 回溯修正。

```ts
/**
 * 获取最长递增子序列的下标数组
 * @param arr - newIndexToOldIndexMap（0 表示新增节点，跳过）
 * @returns 最长递增子序列对应的下标
 *
 * 参考：https://en.wikipedia.org/wiki/Longest_increasing_subsequence
 */
export function getSequence(arr: number[]): number[] {
  // p: 回溯数组，记录每个位置的前驱下标
  const p = arr.slice()
  // result: 存放当前 LIS 的下标
  const result = [0]
  let i, j, u, v, c
  const len = arr.length

  for (i = 0; i < len; i++) {
    const arrI = arr[i]
    // 跳过 0（0 表示新增节点，不参与 LIS）
    if (arrI !== 0) {
      j = result[result.length - 1]

      // 当前值比 result 末尾大 → 直接追加
      if (arr[j] < arrI) {
        p[i] = j              // 记录前驱
        result.push(i)
        continue
      }

      // 否则用二分查找，找到第一个 >= arrI 的位置并替换
      u = 0
      v = result.length - 1
      while (u < v) {
        c = (u + v) >> 1      // 取中间位（向下取整）
        if (arr[result[c]] < arrI) {
          u = c + 1
        } else {
          v = c
        }
      }

      // 替换为更小的值，保持 result 尽可能"矮"
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1] // 记录前驱
        }
        result[u] = i
      }
    }
  }

  // 回溯：从 result 最后一个元素开始，沿 p 链还原真正的 LIS
  u = result.length
  v = result[u - 1]
  while (u-- > 0) {
    result[u] = v
    v = p[v]
  }

  return result
}
```
