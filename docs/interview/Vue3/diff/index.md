[参考文章]('https://juejin.cn/post/7190726242042118200#heading-16')
# diff 算法
- diff算法的触发场景
    diff算法本质上是一个对比的方法，核心就是旧的DOM组更新为新DOM组时，如何更新效率才能最高。
- v-for循环时，key的意义
    我们在比较过程中（可以举个ul>li的小例子），要确认两个dom是否有变化，是否相同。
    利用vnode的type和key进行对比，如果两个type和node相同，那就可以认为相同。
    ```typescript
    interface VNode {
    type: string,
    key: string
    }
    /**
    * 根据 key || type 判断是否为相同类型节点
    * @param node1 
    * @param node2 
    * @returns 
    */
    export function isSameVNodeType(node1: VNode, node2: VNode) {
        return node1.type === node2.type && node1.key === node2.key
    }
    ```
- diff算法的五大步
    1. 自前向后对比
        自前向后的diff对比中，会依次获取相同下标oldChildren和newChild。
        如果oldChildren和newChild为相同的Vnode，则直接通过patch进行打补丁即可。
        如果oldChildren和newCHild为不相同的VNode,则会跳出循环。
        通过第一步，我们可以处理相同的node,直到遇见不同的VNode为止。
    2. 自后向前对比
        这一步跟上一步返回来，很好理解，自减一进行比较，也是直到不同的VNode。
    3. 新节点多余旧节点，需要挂载
    4. 旧节点多于新节点，需要卸载
        第一步和第二步节点前提都是节点数量一致，3、4步骤是处理新旧节点
    5. 乱序
        乱序为第二部分
        我们需要知道一个概念，最长递增子序列
        在一个给定的数值序列中，找到一个子序列，使得这个子序列元素的数值依次递增，并且这个子序列的长度尽可能地大。
        最长递增子序列的确定，可以帮助我们减少移动的次数，从而提升性能。
        乱序之下的diff是最复杂的一块情景
            - 创建一个 `<key（新节点的 key）:index（新节点的位置）>` 的 Map 对象 keyToNewIndexMap。通过该对象可知：新的 child（根据 key 判断指定 child） 更新后的位置（根据对应的 index 判断）在哪里
            - 循环 oldChildren ，并尝试进行 patch（打补丁）或 unmount（删除）旧节点
            - 处理 移动和挂载

