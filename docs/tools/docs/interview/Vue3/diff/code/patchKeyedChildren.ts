import { VNode, isSameVNodeType } from './isSameVNodeType';
const normalizeVNode: Function = (node: VNode) => node; // 这里有有一步处理操作，我在这省略了
const patch: Function = (oldVNode: VNode, container: any, temp: any):void =>{};
const patchKeyChildren = (oldChildren: Array<VNode>, newChildren: Array<VNode>,container:any) => {
    let i = 0;
    // 确定最后一个坐标
    const newChildrenEnd = newChildren.length - 1;
    const oldChildrenEnd = newChildren.length - 1;
    while (i <= oldChildrenEnd && i <= newChildrenEnd) {
        const oldVNode = oldChildren[i];
        const newVNode = normalizeVNode(newChildren[i])
        if (isSameVNodeType(oldVNode, newVNode)) {
            patch(oldVNode, newVNode, container, null)
        }
        // 如果不被认为是同一个 vnode，则直接跳出循环
        else {
            break
        }
        // 下标自增
        i++
    }
}
