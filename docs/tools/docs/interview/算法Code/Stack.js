// 模拟一个栈
/**
 * 后进先出（LIFO）：栈中最后一个添加的元素最先被取出。
 * 仅能在栈顶进行插入和删除操作：只能在栈顶添加、删除元素，不能在栈底或中间进行操作。
 * 不支持随机访问：栈中的元素只能按照后进先出的顺序访问，不能根据索引或者关键字进行访问。
 * 可以使用数组或链表实现：栈可以使用数组或链表来实现，数组实现的栈通常比链表实现的栈性能更好。
 */
class Stack {
    constructor() {
        this.items = [];
    }

    push(item) {
        this.items.push(item);
    }

    pop() {
        return this.items.pop();
    }

    peek() {
        return this.items[this.items.length - 1];
    }

    isEmpty() {
        return this.items.length === 0;
    }
}