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

可以将通用样式逻辑提取为函数，在多个组件中复用：

```typescript
// 定义可复用的样式函数
const flexCenter = () => `
  display: flex;
  align-items: center;
  justify-content: center;
`

const truncate = (width: string) => `
  width: ${width};
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`

// 在组件中使用
const Box = styled.div`
  ${flexCenter()}
  height: 200px;
`

const Title = styled.h2`
  ${truncate('300px')}
  font-size: 18px;
`
```

也可以利用 `css` helper 函数（当需要在插值中包含完整 CSS 时）：

```typescript
import styled, { css } from 'styled-components'

// 可复用的 CSS 片段
const activeStyle = css`
  background: #3498db;
  color: white;
  border-color: transparent;
`

const Button = styled.button<{ $active?: boolean }>`
  padding: 8px 16px;
  border: 1px solid #ddd;
  ${props => props.$active && activeStyle}
`
```

## LEVEL！ UP！

### 主题化

styled-components 通过 `ThemeProvider` 组件提供完整的主题支持，通过 context API 向所有子组件注入 theme 对象，无论嵌套多深都可以访问：

```typescript
import styled, { ThemeProvider, DefaultTheme } from 'styled-components'

// 1. 定义主题类型（TypeScript）
declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string
      secondary: string
      background: string
      text: string
    }
    spacing: (n: number) => string
  }
}

// 2. 定义主题对象
const lightTheme: DefaultTheme = {
  colors: {
    primary: '#3498db',
    secondary: '#2ecc71',
    background: '#ffffff',
    text: '#333333',
  },
  spacing: (n: number) => `${n * 8}px`,
}

const darkTheme: DefaultTheme = {
  colors: {
    primary: '#5dade2',
    secondary: '#58d68d',
    background: '#1a1a2e',
    text: '#e8e8e8',
  },
  spacing: (n: number) => `${n * 8}px`,
}

// 3. 组件中访问 theme
const Button = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  border: none;
  border-radius: 4px;
  cursor: pointer;
`

const Page = styled.div`
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  min-height: 100vh;
`

// 4. 在顶层包裹 ThemeProvider
function App() {
  const [isDark, setIsDark] = useState(false)
  
  return (
    <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
      <Page>
        <Button onClick={() => setIsDark(!isDark)}>
          切换主题
        </Button>
      </Page>
    </ThemeProvider>
  )
}
```

> ⚠️ **注意**：在类组件中访问 theme 需要通过 `withTheme` HOC；函数组件可直接用 `useTheme()` hook：
> ```typescript
> import { useTheme } from 'styled-components'
> const theme = useTheme()
> ```

## 参考资料

### [官网](https://styled-components.com/docs)

