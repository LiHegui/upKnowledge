// 说说webpack的热更新是如何做到的？原理是什么？
//
const webpack = require('webpack')
module.exports = {
    // ...
    devServer: {
        // 开启 HMR 特性
        hot: true
        // hotOnly: true
    }
}
