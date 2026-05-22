# 类
类的成员
- 字段
- 构造函数
    类实例化时调用，可以为类的对象分配内存。
- 方法
## 继承
    使用extends关键字，类继承后子类可以对父类进行重写，super关键字是对父类的引用，可以调用父类的属性和方法    
## 修饰符
- 公共
    关键字public,可以自用的访问类的属性
- private
    私有属性，无法被继承，实例对象不能访问该属性，继承的子类也不能访问
- protect
    受保护修饰符，实例对象不能访问该属性，但是在其子类中能够使用该属性
- readonly
    只读修饰符，实例中不能修改该值，只读属性必须在声明时和构造函数里初始化
## 静态属性
关键字static 可以通过类名直接调用
## 抽象类

抽象类一般不会去实例化对象，只能被类去实现，关键字 `abstract`。`abstract` 关键字用于定义抽象类和在抽象类内部定义抽象方法。

```typescript
abstract class Shape {
  // 抽象方法：子类必须实现，不提供具体实现
  abstract getArea(): number

  // 普通方法：子类继承
  toString() {
    return `面积：${this.getArea()}`
  }
}

class Circle extends Shape {
  constructor(private radius: number) { super() }
  getArea() {
    return Math.PI * this.radius ** 2
  }
}

class Rectangle extends Shape {
  constructor(private width: number, private height: number) { super() }
  getArea() {
    return this.width * this.height
  }
}

// const s = new Shape()  // ❌ 错误：抽象类不能实例化
const circle = new Circle(5)
console.log(circle.toString())  // 面积：78.54...
```

**抽象类 vs 接口对比：**

| 维度 | 抽象类（abstract class）| 接口（interface）|
|------|----------------------|-----------------|
| 实现代码 | ✅ 可以有具体方法 | ❌ 只有声明 |
| 构造函数 | ✅ 有 | ❌ 无 |
| 多继承 | ❌ 只能继承一个 | ✅ 可实现多个 |
| 访问修饰符 | ✅ 可以用 private/protected | 默认 public |
| 使用场景 | 有共享实现逻辑的父类 | 只需类型约束 |

