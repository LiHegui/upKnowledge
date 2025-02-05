# Set 和 Map
- Set
    Set是一种叫做集合的数据结构。特点是里面是无序且不重复（可以利用这个进行简单去重）。
    里面的[value，value]结构
    - add
        添加元素，返回set结构本身
    - delete
        删除元素，返回布尔值
    - has
        判断是否有该元素，返回一个布尔值
    - clear
        清空
- Map
    Map是一种叫做字典的数据结构。里面是[key，value]结构。里面的key是不重复的。
    - size属性
    - set
        set(key,value)
    - get
    - has
    - delete
    - clear
## 遍历Map和Set
都可以使用迭代器（Iterator）来遍历Set和Map数据结构。
可以使用for of 或者 forEach(value,key)
# 如何实现一个Set
见 Set.js
# 如何实现一个Map
见 Map.js
# WeakSet 和 WeakMap
- WeakSet
    WeakSet可以接受一个具有 Iterable接口的对象作为参数
    WeakSet是一种特殊的Set，它只能存储对象类型的值，并且这些对象必须是弱引用。弱引用意味着，如果一个对象没有被其他地方引用，那么它可能会被垃圾回收机制回收。WeakSet中的对象也可能会被回收，因为WeakSet不会阻止垃圾回收机制回收WeakSet中的对象。
    WeakSet没有size属性，也没有forEach、keys、values等迭代器方法。因为WeakSet中的对象可能会被回收，所以无法遍历WeakSet中的对象。
    WeakSet只有add、delete和has方法。
- WeakMap
    WeakMap是一种特殊的Map，它的键必须是对象类型的值，并且这些对象必须是弱引用。WeakMap中的键值对也可能会被回收，因为WeakMap不会阻止垃圾回收机制回收WeakMap中的键值对。
    WeakMap没有size属性，也没有forEach、keys、values等迭代器方法。因为WeakMap中的键值对可能会被回收，所以无法遍历WeakMap中的键值对。
    WeakMap只有set、get、delete和has方法，这些方法与Map的相应方法相似。