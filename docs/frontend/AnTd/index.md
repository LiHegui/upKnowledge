# Ant Design

## 源码解析篇

🌊[Button](./Button.md)

## 常见问题

### antd - 更好的兼容低版本浏览器方案

[官方阐述](https://ant-design.antgroup.com/docs/react/compatible-style-cn)

>Ant Design 支持最近 2 个版本的现代浏览器。如果你需要兼容旧版浏览器，请根据实际需求进行降级处理：

**StyleProvider**

```javascript
import { StyleProvider } from '@ant-design/cssinjs';

// `hashPriority` 默认为 `low`，配置为 `high` 后，
// 会移除 `:where` 选择器封装
export default () => (
  <StyleProvider hashPriority="high">
    <MyApp />
  </StyleProvider>
);
```