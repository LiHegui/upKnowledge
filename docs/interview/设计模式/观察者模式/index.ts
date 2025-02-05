// 观察者模式
class Subject {
  count: number
  observers: any[]
  constructor() {
    this.count = 0
    this.observers = []
  }
  getCount() {
    return this.count
  }
  setCount(count: number) {
    // 设置值之后通知更新
    this.count = count
    this.notify()
  }
  notify() {
    this.observers.forEach((o) => {
      o.update()
    })
  }
  push(o:any) {
    this.observers.push(o)
  }
}

class Observer {
  name: string
  subject: Subject
  constructor(name: string, sub: Subject) {
    this.name = name
    this.subject = sub
    this.subject.push(this)
  }
  update() {
    console.log(
      `${this.name} 变了 ${this.subject.getCount()}`
    )
  }
}


const sub = new Subject()
// 观察一号
const observer1 = new Observer('一号', sub)
console.log(observer1);
// 观察二号
const observer2 = new Observer('二号', sub)
console.log(observer2);
console.log(sub);



sub.setCount(1)
// 一号 变了 1
// 二号 变了 1
