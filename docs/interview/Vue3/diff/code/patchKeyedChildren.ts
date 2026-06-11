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
