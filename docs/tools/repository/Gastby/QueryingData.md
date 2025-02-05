# 查询数据
# 使用GraphQL查询页面中的数据
我们来简单使用一下
1. 添加description到siteMetadata

gatsby-config.js
```javascript
module.exports = {
  siteMetadata: {
    title: "My Homepage",
    description: "This is where I write my thoughts.",
  },
}
```
2. 我们开始添加使用graphql查询
graphql是一个标签函数。Gatsby在幕后完成这些操作
```javascript
import * as React from 'react'
import { graphql } from 'gatsby'

 const HomePage = () => {
 const HomePage = ({data}) => {
  return (
    <div>
        Hello!
        {data.site.siteMetadata.description}
    </div>
  )
}

export const query = graphql`
  query HomePageQuery {
    site {
      siteMetadata {
        description
      }
    }
  }
`

export default HomePage
```

**在Gatsby构建过程中，GraphQL查询从原始源中提取出来进行解析**

3. 如何向页面查询添加查询变量
