## GraphQL
- GraphQL是一种数据查询语言，是REST API的替代品。
- 
[GraphQL官网](https://graphql.org/code/#javascript)
```shell
npm install graphql
```
**特点**
- 请求需要的数据，不多不少
- 获取多个资源，只用一个请求
- 描述所有可能类型的系统，便于维护，根据需求平滑演进，添加或者隐藏字段
    1. graphql可以获取多个资源。

## 页面查询（pageQuery）

每页可以有一个页面查询,它可以将 GraphQL 参数用作查询中的变量（此处是跟静态查询的一点区别）

>页面是通过文件夹中的任何 React 组件创建的，或者src/pages通过调用操作createPage生成的。pageQuery不能在任何组件（不满足前提）中使用

## 查询结构



## API

### useStaticQuery

>useStaticQuery提供在构建时使用React Hook查询 Gatsby 的 GraphQL 数据层的能力。它允许您的 React 组件通过 GraphQL 查询检索数据，该查询将被解析、评估并注入到组件中。

```javascript
import React from "react"
import { useStaticQuery, graphql } from "gatsby"

export default function Header() {
  const data = useStaticQuery(graphql`
    query HeaderQuery {
        ...
    }
  `)

  return (
    <header>
      <h1>{data...}</h1>
    </header>
  )
}
```

**限制:useStaticQuery必须在嵌套在站点顶级src目录下的文件中使用**



### 页面查询和静态查询的区别

>静态查询在很多方面与 Gatsby 页面查询不同。对于页面，Gatsby 能够处理带有变量的查询，因为它了解页面上下文。但页面查询只能在顶级页面组件中进行。
相反，静态查询不带变量。这是因为静态查询在特定组件内部使用，并且可能出现在组件树的较低位置。使用静态查询获取的数据不会是动态的（即它们不能使用变量，因此称为“静态”查询），但可以在组件树中的任何级别调用它们。
因此，静态查询具有以下限制：
useStaticQuery不接受变量（因此称为“静态”），但可以在任何组件中使用，包括页面
由于查询当前在 Gatsby 中的工作方式，Gatsby 仅支持useStaticQuery文件中的单个实例

## 推荐文章

[官方文档](https://www.gatsbyjs.com/docs/how-to/querying-data/use-static-query/)