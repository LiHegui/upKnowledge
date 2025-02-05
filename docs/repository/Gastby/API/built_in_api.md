# Link
> `<Link>`对于内部导航，Gatsby 包含一个用于在内部页面之间创建链接的内置组件和一个navigate用于编程导航的功能。
> 在任何情况下，如果您想要在同一站点上的页面之间进行链接，请使用该Link组件而不是标签a。href除了now 之外，这两个元素的工作原理大致相同to。

```
-<a href="/blog">Blog</a>
+<Link to="/blog">Blog</Link>
```
完整例子
```javascript
import React from "react"
import { Link } from "gatsby"

const Page = () => (
  <div>
    <p>
      Check out my <Link to="/blog">blog</Link>!
    </p>
    <p>
      {/* Note that external links still use `a` tags. */}
      Follow me on <a href="https://twitter.com/gatsbyjs">Twitter</a>!
    </p>
  </div>
)
```