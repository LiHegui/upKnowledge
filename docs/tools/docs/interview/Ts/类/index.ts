// 类
class Car {
    // 属性
    engine: string = '默认引擎';
    // 静态属性
    static moren = '我是默认值';
    private name = 'lihegui'
    // 构造函数
    constructor(props) {   // 类实例化时调用，可以为类的对象分配内存。
        this.engine = props.engine
    }
    // 方法
    display(): void {
        console.log("发动机为" + this.engine)
    }
}
class bus extends Car{
    run(){
        // super.name; //error:不能再子类中访问
        // console.log(this.name); //error:不能再子类中访问
    }
}
// 抽象类
abstract class Animal {
    abstract makeSound(): void
    move() {
        console.log("可以移动")
    }
}
console.log(Car.moren)
