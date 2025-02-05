// // 如何实现一个axios
// class Axios {
//     static request(config) {
//         return new Promise((resolve, reject) => {
//             const { url = '', method = '', data = {} } = config
//             // 发送xhr请求
//             const xhr = new XMLHttpRequest()
//             xhr.open(method, url, true)
//             xhr.onload = function () {
//                 resolve(xhr.responseText)
//             }
//             xhr.send(data)
//         })
//     }
// }

// function CreateAxiosFn() {
//     let axios = new Axios();
//     let req = axios.request.bind(axios);
//     return req;
// }

// // 得到最后的全局变量axios
// let axios = CreateAxiosFn();
