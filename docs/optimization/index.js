const PENDING = 'pending'
const FULLFILLED = 'fullfilled'
const REJECTED = 'rejected'
class Promise{
  constructor(executor){
    this.value = ''
    this.reason = ''
    this.state = PENDING
    this.fullArr = []
    this.rejectArr = []
    let resolve = (value)=>{
      if(this.state === PENDING){
        this.state = FULLFILLED
        this.value = value
        this.fullArr.forEach(item=>item())
      }
    }
    let reject = (value)=>{
      if(this.state === PENDING){
        this.state = REJECTED
        this.reason = value
        this.rejectArr.forEach(item=>{
            console.log("reject")
            item()
        })
      }
    }
    executor(resolve, reject)
  }
  then(onFull, onReject){
    if(this.state === FULLFILLED) onFull(this.value)
    if(this.state === REJECTED) {
        console.log("走着")
        onReject(this.reason)
    }
    if(this.state === PENDING) {
      this.fullArr.push(() => onFull(this.value))
      this.rejectArr.push(() => onReject(this.reason))
    }
  }
}
let p = new Promise((resolve, reject)=>{
//   setTimeout(()=>reject(1), 1000)
reject(1)
})
p.then(res=>{
  console.log("解决",res)
}, err=>{
  console.log("拒绝", err)
})