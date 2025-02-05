# gatsby-source-filesystem 
>一个Gatsby插件，用于将数据文件从本地文件系统获取到Gatsby应用程序中。
该插件File从文件创建节点。各种转换器插件可以将File节点转换为其他类型的数据，例如gatsby-transformer-json将 JSON 文件转换为JSON节点并将gatsby-transformer-remarkmarkdown 文件转换为MarkdownRemark节点。

```shell
npm install gatsby-source-filesystem
```

## 配置

在gatsby.config.js中(摘自官网)
```javascript
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        // The unique name for each instance
        name: `pages`,
        // Path to the directory
        path: `${__dirname}/src/pages/`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `data`,
        path: `${__dirname}/src/data/`,
        // Ignore files starting with a dot
        ignore: [`**/\.*`],
        // Use "mtime" and "inode" to fingerprint files (to check if file has changed)
        fastHash: true,
      },
    },
  ],
}
```

**部分解释**
name (required) --> File该名称也将是名为上的键 sourceInstanceName

path (required) --> 来源文件夹的路径。理想情况下是绝对路径

示例

```javascript
{
  allFile(filter: { sourceInstanceName: { eq: "data" } }) {   // 对应上面的name -> sourceInstance
    nodes {
      extension
      dir
      modifiedTime
    }
  }
}
```

## 快速哈希
默认情况下，为gatsby-source-filesystem每个文件创建 MD5 哈希值，以确定文件在来源之间是否已更改。但是，在具有许多大文件的站点上，这可能会导致速度显着减慢。因此，您可以启用该fastHash设置以使用替代哈希机制。

**fastHash**
默认不启用，有缺陷

## createFilePath、createRemoteFileNode、createFileNodeFromBuffer 

gatsby-souece-filesystem 可以导出三个复制函数

1. createFilePath
   
    当从文件构建页面时，您通常希望从文件系统上的文件路径创建 URL

2. createRemoteFileNode
   
    帮助程序可以轻松下载远程文件并将其添加到站点的 GraphQL 架构中

3. createFileNodeFromBuffer
   
    当处理尚未存储在文件中的数据时，例如从数据库查询二进制/blob 字段时，将该数据缓存到文件系统会很有帮助，以便将其与接受文件作为输入的其他转换器一起使用。