

class Axios {
    request(config) {
        return new Promise((resolve, reject) => {
            const { url = '', method = 'get', data = {} } = config;
            const xhr = new XMLHttpRequest()
            xhr.open(method, url, true);   // true开启异步
            xhr.onload = function () {
                resolve(xhr.responseText)
            }
            xhr.send(config.data)
        })
    }
}
console.log(Axios.prototype);
console.log(123);
const methodsArr = ['get', 'delete', 'head', 'options', 'put', 'patch', 'post'];
methodsArr.forEach(met => {
    console.log(1223);
    Axios.prototype[met] = function () {
        // 处理单个方法
        if (['get', 'delete', 'head', 'options'].includes(met)) { // 2个参数(url[, config])
            return this.request({
                method: met,
                url: arguments[0],
                ...arguments[1] || {}
            })
        } else { // 3个参数(url[,data[,config]])
            return this.request({
                method: met,
                url: arguments[0],
                data: arguments[1] || {},
                ...arguments[2] || {}
            })
        }

    }
})
console.log(Reflect.ownKeys(Axios.prototype));

const utils = {
    extend(a, b, context) {
        for (let key in b) {
            if (b.hasOwnProperty(key)) {
                if (typeof b[key] === 'function') {
                    a[key] = b[key].bind(context);
                } else {
                    a[key] = b[key]
                }
            }

        }
    }
}

function CreateAxiosFn() {
    let axios = new Axios();

    let req = axios.request.bind(axios);
    // 增加代码
    utils.extend(req, Axios.prototype, axios)

    return req;
}
// axios({})  axios.get()
let axios = CreateAxiosFn();
console.log(axios.get());