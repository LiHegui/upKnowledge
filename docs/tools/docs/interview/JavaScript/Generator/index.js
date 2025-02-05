function* fun(){
    console.log(1)
    yield 1
    console.log(2)
    return 2
}
let tempFun = fun()
let status = tempFun.next()
console.log(status)
