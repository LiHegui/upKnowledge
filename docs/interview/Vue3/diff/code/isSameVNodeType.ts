export interface VNode {
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