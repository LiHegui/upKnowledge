/**
 * 模拟map的行为
 */


function myMap() {
    this.keys = []  // 存放键值
    this.data = {}  // 存放数据
    interface jieKou1 {
        key: string,
        value: string
    }

    // 存键值对
    this.put = function (item: jieKou1) {
        if (this.keys[item.key]==null) {
            this.keys.push(item.key)
        }
        this.data[item.key] = item.value
    }
    // 获取对应键值的值
    this.getValue = function (key: string) {
        return this.data[key]
    }
    // 删除一个键值对
    this.delete = function (key: string) {
        if (this.keys[key]) {
            this.keys.remove(key)
            this.data[key] = null
        }
    }
    // 遍历
    this.myMap = (fn: Function) => {
        const res: Function[] = []
        let length = this.keys.length
        for (let i = 0; i < length; i++) {
            let k = this.keys[i]
            res.push(fn(k, this.data[k], i))
        }
        return res
    }
}

let map = new myMap()
map.put({key: "lihegui", value: "wudi"})
map.put({key: "lihegui2", value: "wudi2"})
let res = map.myMap(item=>item+'aaa')
console.log(res)
