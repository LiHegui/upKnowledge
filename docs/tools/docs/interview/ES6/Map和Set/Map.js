// 利用对象来模拟Map
class myMap {
    constructor() {
        this.data = {}
    }
    set(key, value) {
        this.data[key] = value;
    }
    get(key) {
        return this.data[key];
    }
    has(key) {
        return Object.keys(this.data).has(key);
    }
    clear(){
        this.data = {}
    }
    entries(){
        return Object.entries(this.data)
    }
}
const temp = new Map()
temp.set('key1', 'value1');
console.log(temp.has('key2'));
console.log(temp.has('key1'));