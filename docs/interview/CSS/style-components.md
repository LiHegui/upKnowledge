# styled-components

## BASIC

### 插值

可以将函数（“插值”）传递给样式化组件的模板文字，以根据其属性对其进行调整。

```typescript
const Button = styled.button<{ $primary?: boolean; }>`
  /* Adapt the colors based on primary prop */
  background: ${props => props.$primary ? "#BF4F74" : "white"};
  color: ${props => props.$primary ? "white" : "#BF4F74"};

  font-size: 1em;
  margin: 1em;
  padding: 0.25em 1em;
  border: 2px solid #BF4F74;
  border-radius: 3px;
`;

render(
  <div>
    <Button>Normal</Button>
    <Button $primary>Primary</Button>
  </div>
);
```

> prop 不是如何传递到 DOM 的，而是type如何传递到defaultValueDOM(原有的默认属性) 的？该styled功能足够智能，可以自动为您过滤非标准属性。


### 扩展样式(设计任何组件的样式)

我们可以对antd组件进行“继承”, 并加以改造。可以很容易形成自己风格的组件。
当然，我们也可以“继承”我们自己写的组件。

```typescript
const Button = styled.button`
  color: #BF4F74;
  font-size: 1em;
  margin: 1em;
  padding: 0.25em 1em;
  border: 2px solid #BF4F74;
  border-radius: 3px;
`;

// A new component based on Button, but with some override styles
const TomatoButton = styled(Button)`
  color: tomato;
  border-color: tomato;
`;

render(
  <div>
    <Button>Normal Button</Button>
    <TomatoButton>Tomato Button</TomatoButton>
  </div>
);
```

直接继承antd, 该styled方法适用于您自己的所有组件或任何第三方组件，只要它们将传递的classNameprop 附加到 DOM 元素即可

```typescript
import { Tabs } from 'antd'

export const Tabs = styled(Tab)`
    color: white;
    ...
`
```

### 导入导出

这个都是变量，直接按照变量处理即可

### 附加额外处理

为了避免不必要的包装器仅将一些传递渲染的组件和元素，可以使用.atters构造函数。

```typescript
const Input = styled.input.attrs<{ $size?: string; }>(props => ({
  // we can define static props
  type: "text",

  // or we can define dynamic ones
  $size: props.$size || "1em",
}))`
  color: #BF4F74;
  font-size: 1em;
  border: 2px solid #BF4F74;
  border-radius: 3px;

  /* here we use the dynamically computed prop */
  margin: ${props => props.$size};
  padding: ${props => props.$size};
`;

render(
  <div>
    <Input placeholder="A small text input" />
    <br />
    <Input placeholder="A bigger text input" $size="2em" />
  </div>
);
```

### 动画

```javascript
import styled  from 'styled-components'
const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

// Here we create a component that will rotate everything we pass in over two seconds
const Rotate = styled.div`
  display: inline-block;
  animation: ${rotate} 2s linear infinite;
  padding: 2rem 1rem;
  font-size: 1.2rem;
`;

render(
  <Rotate>&lt; 💅🏾 &gt;</Rotate>
);
```

### 使用自定义函数



## LEVEL！ UP！

### 主题化

>styled-components 通过导出包装组件来提供完整的主题支持ThemeProvider。该组件通过 context API 为自身下面的所有 React 组件提供一个主题。
>在渲染树中，所有样式组件都可以访问提供的主题，即使它们是多个级别的深度



## 参考资料

### [官网](https://styled-components.com/docs)

