/**
 * 模拟map的行为
 */
function myMap() {
    var _this = this;
    this.keys = []; // 存放键值
    this.data = {}; // 存放数据
    // 存键值对
    this.put = function (item) {
        if (this.keys[item.key] == null) {
            this.keys.push(item.key);
        }
        this.data[item.key] = item.value;
    };
    // 获取对应键值的值
    this.getValue = function (key) {
        return this.data[key];
    };
    // 删除一个键值对
    this["delete"] = function (key) {
        if (this.keys[key]) {
            this.keys.remove(key);
            this.data[key] = null;
        }
    };
    // 遍历
    this.myMap = function (fn) {
        var res = [];
        var length = _this.keys.length;
        for (var i = 0; i < length; i++) {
            var k = _this.keys[i];
            res.push(fn(k, _this.data[k], i));
        }
        return res;
    };
}
var map = new myMap();
map.put({ key: "lihegui", value: "wudi" });
map.put({ key: "lihegui2", value: "wudi2" });
var res = map.myMap(function (item) { return item + 'aaa'; });
console.log(res);
