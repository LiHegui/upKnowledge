## 你知道移动端如何适配吗

达到两种效果：
- 自适应
    屏幕大小变化，来自动调节尺寸大小
- 响应式
    会随着屏幕变动而自动调整

方案：
1. 百分比
    应用较少
2. rem单位+动态html的font-size
    rem是相对于根元素html的font-size来设置的，通过在不同屏幕尺寸下、动态的修改html元素的font-size以此来达到适配效果

    可以使用第三方的插件来实现

    媒体查询
        需要针对不同的屏幕编写大量的媒体查询
        如果动态改变尺寸，不会实时更新，只是一个个区间

3. viewport
    通常viewport是指视窗、视口，即浏览器用来显示网页的那部分区域。在移动端开发中，我们希望页面宽度和设备宽度一致，并把这个viewport称为ideal viewport（理想视口）。我们设置public/index.html添加viewport元数据标签，就是为了得到一个ideal viewport。
    
[推荐文章1](https://juejin.cn/post/7335245199109652516)
[推荐文章2](https://juejin.cn/post/7277875605538226195?searchId=2024022819314355E62BEC97EFBF8B563B#heading-4)