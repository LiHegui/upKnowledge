class Subject{
    constructor(){
      this.count = 0
      this.observers = []
    }
    getcount(){
      return this.count
    }
    setCount(newValue){
      this.count = newValue
      this.notify()
    }
    attach(o){
      this.observers.push(o)
    }
    notify(){
      this.observers.map(item=>item.update())
    }
  }
  
  class Watcher{
    constructor(name, sub){
      this.name = name
      this.sub = sub
      this.sub.attach(this)
    }
    update(){
      console.log(this.name ,"更新为", this.sub.getcount())
    }
  }
  
  const sub = new Subject()
  
  const watcher1 = new Watcher("123", sub)
  
  const watcher2 = new Watcher("456", sub)
  
  sub.setCount(100)