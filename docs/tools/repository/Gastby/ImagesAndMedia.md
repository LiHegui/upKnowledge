# Images and Media
我们在使用该框架的时候，可以使用我们平常使用图片等的方式。
- 将资源直接导入到文件中
    使用webpack，我们可以使用import直接在JavaScript模块中创建文件。
    ```javascript
    import React from "react"
    import logo from "./logo.png" // Tell webpack this JS file uses this image

    console.log(logo) // /logo.84287d09.png

    function Header() {
    // Import result is the URL of your image
    return <img src={logo} alt="Logo" />
    }
    export default Header
    ```
- 
同时Gatsby 提供了利用 gatsby-image 创造丰富体验的工具，同时防止性能下降。

## 使用webpack导入资源

> 为了减少对服务器的请求数量，导入小于 10,000 字节的图像会返回 数据 URI而不是路径。

## 导入字体

## gatsby-source-filesystem （GraphQL）

结合GraphQL通过在数据层查询文件来导入文件