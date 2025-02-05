#  ts装饰器
TypeScript装饰器是一种特殊类型的声明，可以用来给类、方法、属性等元素添加额外的元数据。装饰器以@符号开始，后面跟着一个装饰器工厂函数。
```typescript
function MyDecorator(target: any) {
  console.log("MyDecorator was called");
}

@MyDecorator
class MyClass {
  // 类定义
}
```
类的装饰器可以装饰：
- 类
    
- 方法/属性
- 参数
- 访问器
