# CreatePage
gatsby-node.js
```javascript
exports.createPages = async function ({ actions, graphql }) {
  actions.createPage({
    path: "/the-page-path/",
    component: require.resolve("./src/templates/template.js"),
    context: {},
    defer: true,
  })
}
```
defer是决定是否延时