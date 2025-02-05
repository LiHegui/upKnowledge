// 说说你对 TypeScript 中接口的理解？应用场景？
// 接口是一些列抽象方法特征和属性的集合，需要具体的类去实现
interface interface_name{
    gender?:string   // 可有可无属性
    say:(word:string)=>string,
    readonly address:string,
    // 不定属性
    [propName:string]:any
}
class Student implements interface_name{
    name:string
    readonly address: string;
    constructor({name}) {
        this.name = name
    }
    say(word: string): string {
        return word;
    }
}
