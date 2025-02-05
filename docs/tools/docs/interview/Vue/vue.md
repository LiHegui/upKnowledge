# Vue 面试题
## 谈谈你所知道的Vue

Vue是一款构建用户界面的JavaScript框架

特点： 
- MVVM 数据驱动
    model 模型层，负责处理业务逻辑以及和服务器端进行交互
    view 视图层， 负责将数据模型转化为UI展示出来，可以简单的理解为HTML页面
    v-model 视图模型层，用来连接Model和View，是Model和View之间的通信桥梁
- 组件化
    
- 指令系统

    **如何实现自定义指令**
    ```javascript
        // 在 Vue 实例中注册全局自定义指令
        Vue.directive('highlight', {
        // 当绑定元素插入到 DOM 中时被调用
        inserted: function (el) {
            el.style.backgroundColor = 'yellow';
        }
        });
    ```

## v-if和v-show的区别
首先二者都是控制元素的显示与隐藏
v-show是利用css中的display:none;来做的，隐藏元素后，但是其dom元素依旧存在
v-if 是真实安装卸载元素，隐藏元素dom结构不存在，并且能触发元素的生命周期
使用场景

v-show用户切换状态比较频繁的场景，v-show初始渲染消耗性能比较大
v-if则是用于初始渲染

## 你对SPA单页面的理解，它的优缺点分别是什么？如何实现SPA应用呢

**如何实现一个SPA**

监听hash或者pushState变化 => 以当前的hash为索引，加载对应的资源 => 加载完成之后，隐藏之前的页面 =>显示当前页面

路由分为两种模式
- hash模式
    使用URL的锚点（Hash）来模拟整个页面的导航。例如：http://your-app/#/user
    #后面的内容后并不会导致页面刷新
```javascript
class Router {
    constructor () {
        this.routes = {}
        this.currentUrl = '';  // 当页面加载或 URL 中的哈希值发生变化时，会触发 refresh 方法。在 refresh 方法中，会更新 currentUrl 属性的值，以便在后续的处理中可以使用当前的 URL。

        window.addEventListener('load', this.refresh, false);  // 将在页面加载时触发 refresh 方法，用于执行相应的回调函数
        window.addEventListener('hashchange', this.refresh, false);  // 监听hash的变化
    }
    route(path, callback) {
        this.routes[path] = callback
    }
    push() {
        this.routes[path] && this.routes[path]()
    }
}

window.miniRouter = new Router();  
miniRouter.route('/', () => console.log('page1'))  
miniRouter.route('/page2', () => console.log('page2'))  
  
miniRouter.push('/') // page1  
miniRouter.push('/page2') // page2  
```
- history
    history.pushState 浏览器历史纪录添加记录
    history.replaceState修改浏览器历史纪录中当前纪录
    history.popState 当 history 发生变化时触发
这些都不会让页面进行刷新
```javascript

```
## Vue实例挂载的过程？




## 请描述下你对vue生命周期的理解？

- Vue2
  - beforeCreate
      组件创建之初
  - Created
      组将创建之后，此时页面结构还没好，data里面的数据已经可以用了
  - BeforeMounte
      组件挂载之前
  - Mouted
      组件挂载之后，此时页面结构都已存在
  - beforeUpdate
      组件更新之前
  - Updated
      组件更新之后
  - beforeDestory
      组件销毁之前
  - destoryed
      组件销毁之后
  - activated
      keep-live组件激活时触发
  - deactivated
      keep-alive 缓存的组件停用时调用
- Vue3
  - onBeforeMount – 在挂载开始之前被调用：相关的 render 函数首次被调用。
  - onMounted – 组件挂载时调用
  - onBeforeUpdate  – 数据更新时调用，发生在虚拟 DOM 打补丁之前。这里适合在更新之前访问现有的 DOM，比如手动移除已添加的事件监听器。
  - onUpdated  –  由于数据更改导致的虚拟 DOM 重新渲染和打补丁，在这之后会调用该钩子。
  - onBeforeUnmount –  在卸载组件实例之前调用。在这个阶段，实例仍然是完全正常的。
  - onUnmounted – 卸载组件实例后调用。调用此钩子时，组件实例的所有指令都被解除绑定，所有事件侦听器都被移除，所有子组件实例被卸载。
  - onActivated  –  被 keep-alive 缓存的组件激活时调用。
  - onDeactivated – 被 keep-alive 缓存的组件停用时调用。
  - onErrorCaptured – 当捕获一个来自子孙组件的错误时被调用。此钩子会收到三个参数：错误对象、发生错误的组件实例以及一个包含错误来源信息的字符串。此钩子可以返回 false 以阻止该错误继续向上传播。

### 父子组件发生更新，生命周期的情况
父组件的beforeUpdate钩子函数被调用。
子组件的beforeUpdate钩子函数被调用。
子组件的updated钩子函数被调用。
父组件的updated钩子函数被调用。
### 父子组件初始渲染的时生命周期执行情况
父组件的beforeCreate钩子函数被调用。
父组件的created钩子函数被调用。
父组件的beforeMount钩子函数被调用。
子组件的beforeCreate钩子函数被调用。
子组件的created钩子函数被调用。
子组件的beforeMount钩子函数被调用。
子组件的mounted钩子函数被调用。
父组件的mounted钩子函数被调用。
在这个过程中，父组件首先被创建并挂载，然后子组件被创建并挂载。在每个组件的生命周期函数中，可以进行一些初始化操作，例如获取数据或准备组件的状态。
需要注意的是，在组件渲染之前，beforeCreate和created钩子函数被调用，而在组件渲染之后，beforeMount和mounted钩子函数被调用。在这些钩子函数中，可以执行一些在组件渲染之前或之后需要进行的操作。
另外，在每个组件的destroyed钩子函数中，可以执行一些在组件被销毁时需要进行的操作，例如清理定时器或取消事件监听器。
### 异步生命周期

async created 

async mounted

## keep-live组件
keep-alive 是 Vue.js 内置的一个抽象组件，用于缓存具有相同组件标签 component 的组件实例，以避免在组件切换时频繁地销毁和重新创建组件实例，从而提高应用程序的性能。
## v-if和v-for的优先级是什么？
v-if 是控制元素显示与隐藏
v-for 是遍历组件
v-if和v-for作用于同一组件
Vue2中v-for的优先级更高
Vue3中v-if优先级更高
## 为什么data属性是一个函数而不是一个对象？
在Vue中，data属性可以是对象或者函数
当data属性为一个对象时，这个对象会被组件实例共享，因为引用的都是同一个对象地址，这可能会导致不同组件之间的数据相互影响，从而引起一些难以调试的东西。
当data属性为一个函数时，通过函数return出来的对象，都是一个全新的数据对象，每个组件都拥有独立的数据对象，不会相互影响。
## 动态给vue的data添加一个新的属性时会发生什么？怎样解决？
动态的给data添加一个新的属性，并不会触发数据的响应式操作，也就是或新加入的属性改变时，不会触发响应式，不会触发页面刷新。
也就是说你可以使用强制刷新方法。
- Vue.$set(),向响应式对象中添加一个property,并确保这个新的peoperty也是响应式的且触发视图刷新。
    ```
        Vue.$set(this.someObj,perporty,newPerportyValue)
    ```
- Object.assign() 进行合并对象
    混入原有的对象
    ```
        this.someObj = Object.assign({},this.someObj,{newProperty:newPropertyValue})
    ```
## Vue中组件和插件有什么区别？
在Vue中，组件和插件都是可重用的代码模块，但它们有一些区别。
- 组件
组件是Vue中的基本概念，它是一个可重用的Vue实例，用于封装可复用的HTML元素和相关的JavaScript代码和CSS样式。组件可以拥有自己的状态和生命周期钩子，可以接收父组件传递的数据，也可以向父组件发送事件。
组件通常用于封装具有某种特定功能的UI元素，例如按钮、表单、对话框等。组件可以在应用程序的不同部分中重复使用，从而提高了代码的复用性和可维护性。
- 插件
插件是Vue的扩展机制，通过为Vue添加全局功能或功能库，来扩展Vue的能力。插件通常会为Vue添加全局的方法、指令、过滤器、组件等，或者添加全局的功能库，例如路由器、状态管理器等。
插件通常是通过Vue的Vue.use()方法安装到Vue中的。在安装插件时，我们可以为插件传递一些参数或选项，从而定制插件的行为。
需要注意的是，插件通常是全局的，它们会影响到整个Vue应用程序，因此在使用插件时需要谨慎，避免产生不必要的影响和冲突。一般来说，只有在需要全局添加某些功能或库时，才需要使用插件。
## Vue组件之间的通信方式都有哪些？
 - 父子组件通信
    父组件通过props传递参数给子组件
    子组件通过emit事件，传递数据给父组件
    父组件可以$children来获取子组件的数据以及调用其函数
    子组件也可以通过$parent来获取父组件的数据以及调用函数
- 爷孙组件通信
    vue中还提供了inject和provide两个选项，可以用于爷孙组件之间的数据传递。这种方式与向下传递prop和向上触发事件的方式不同，它提供了一种在父组件和子孙组件之间建立依赖关系的方式，从而实现跨层级的数据传递。
    具体来说，爷组件可以通过provide选项提供数据，然后孙组件可以通过inject选项注入该数据。这样，孙组件就可以在不需要显式的prop和事件传递的情况下，访问爷组件提供的数据。
    ```
        <!-- Grandparent.vue -->
        <template>
        <div>
            <parent></parent>
        </div>
        </template>

        <script>
        import Parent from './Parent.vue';

        export default {
        components: {
            Parent
        },
        provide: {
            message: 'Hello from Grandparent'
        }
        }
        </script>
    ```
- 通过Vuex进行通信
    vuex详解：

- 通过浏览器存储
- 通过事件总线或订阅发布进行通信
## Vue响应式原理
数据劫持+订阅发布
Dep reactive watchEffect
Dep负责订阅发布功能
Vue2的响应式是基于Object.defineProperty实现的
Vue3的响应式是基于ES6的Proxy来实现的
弊端就是：Object.defineProperty只对初始对象里的属性有监听作用，而对新增的属性无效。这也是为什么Vue2中对象新增属性的修
改需要使用Vue.$set来设值的原因。
## 双向数据绑定是什么？

## Vue中的$nextTick有什么作用？
Vue的响应式不是发生数据后立即变化的，而是按照一定的策略进行DOM更新，这样的好处是可以避免一些不必要的操作，提高渲染性能。
在Vue官方文档中是这样说明的：
Vue异步执行DOM更新。只要观察到数据变化，Vue将开启一个队列，
并缓冲在同一事件循环中发生的所有数据改变。
如果同一个watcher被多次触发，只会被推入到队列中一次。这种在缓冲时去除重复数据对于避免不必要的计算和DOM操作上非常重要。
然后，在下一个的事件循环“tick”中，Vue刷新队列并执行实际 (已去重的) 工作。
总之就是放在nextTick中的操作会再DOM更新之后执行
使用:作为参数的函数会进入异步任务中的异步任务队列中
```
    this.$nextTick(()=>{

    })
```
使用场景：
在Created里面想要获取DOM操作。
## 说说你对vue的mixin的理解，有什么应用场景？
mixin就是混入，就是把一些可复用的功能分发下去。
```
    // src/mixin/index.js
    export const mixins = {
    data() {
        return {};
    },
    computed: {},
    created() {},
    mounted() {},
    methods: {},
    };
```
- 选项合并
    相同类型（如生命周期），先执行mixin混入的代码，再执行组件本身的代码
    组件数据冲突，组件本身的数据会覆盖minxin中data的相同属性名的数据
    方法冲突也是如此
- 优缺点
    提高代码复用性、无需传递状态、维护方便
    命名冲突、滥用的话难以维护、不好溯源   
## 说说你对slot的理解？slot使用场景有哪些？
- 介绍：它是vue中一种非常重要的机制，主要用于父组件向子组件传递内容的一种方式
- 使用：在子组件中定义一些具有特定意义的slot插槽用来占位，父组件在使用子组件的时候，通过插入内容来覆盖子组件中的这些插槽，实现组件的高灵活性
- 类型
    1. 默认插槽
    2. 具名插槽
    3. 作用于插槽
- 使用场景：
    - 插入自定义内容：静态内容和动态内容
    - 插入组件：按钮、弹窗、提示框
    - 复杂组件的拆分
## Vue.observable你有了解过吗？说说看
## 说说你对keep-alive的理解是什么？
- 介绍：它是vue中的内置组件，能够在组件切换的过程中将状态保留在内存中，防止重复渲染dom，实质是缓存组件实例，不进行销毁
- 生命周期：使用keep-alive包裹的组件，会多出两个生命周期钩子activated和deactivated
- 可以设置的props属性：include=>名称匹配的组件才会被缓存；exclude=>名称匹配的组件不会被缓存；max=>组件的最大缓存数量
- 使用场景：
    - 频繁使用的路由
    - 频繁使用的组件
    - 带有状态的组件
## Vue常用的修饰符有哪些有什么应用场景
- 表单
    1. lazy：当光标离开时触发同步
    2. trim：自动过滤用户输入字符的前置空格
    3. number：将输入的数据转换成数值类型
- 事件
    1. stop:阻止事件冒泡
    2. prevent：阻止事件默认行为
    3. self：只在自身触发事件
    4. once：只触发一次事件
    5. caption：从顶层开始往下触发事件
    6. passive：监听鼠标滚动
    7. native：监听原生事件
- 鼠标
    - left
    - right
    - middle
- 键盘
- v-bing
    1. async
    2. prop
    3. camel
## 你有写过自定义指令吗？自定义指令的应用场景有哪些？
- 介绍：vue中提供了很多数据驱动视图更加方便的操作，这些操作也被称为指令。我们常见的v-开头的行内属性就是指令，不同指令完成不同的功能
- 如何实现：
    - 全局注册：通过Vue.directive（）方法注册：第一个参数的指令名称，第二个参数是一个数据对象，也可以是一个指令函数
    - 局部注册：就是在组件的options选项中设置directive属性，参数类型和全局注册一样
- 常见场景：
    - 输入框自动聚焦
    - 表单限制输入
    - 图片懒加载
    - 滚动加载
    - 绑定节流
## Vue中的过滤器了解吗？过滤器的应用场景有哪些？
## 什么是虚拟DOM？如何实现一个虚拟DOM？说说你的思路
[参考文章](https://juejin.cn/post/7173809965772046350#heading-13)
虚拟DOM就是用对象来模拟dom对象
前端性能优化一个重要的方向就是尽可能少的减少操作DOM,不仅仅是DOM相对比较慢。因为频繁的变动DOM会造成
浏览器的回流与重绘。
## 用JS对象来描述DOM

## 虚拟DOM更新视图流程
用JavaScript对象来表示真实的DOM,DOM与DOM节点之间形成一个DOM树
数据发生改变，需要更新视图，会采用diff算法比较新旧DOM树
最终只会更新差异的部分在真实的DOM树上
## 你了解vue的diff算法吗？说说看
我们在Vue中尝尝写一些模板template => ast => render()形成虚拟DOM =>真是DOM
数据发生改变时，需要必将这一次与上一次的渲染结果，也就是比较两次的虚拟DOM树
比较过程：
patch是一个递归过程、深度优先、同层比较的策略
- 新旧节点进行比较是否相同，相同就就行下一步，不相同就进行节点的替换或者插入操作
- 对相同节点的属性进行判断，如果属性发生变化，就进行更新
- 对子节点进行递归比较，如果子节点有变化就进行更新或者删除
- 对旧节点剩余的节点进行删除操作

## diff算法的优化
- 避免使用index作为唯一的key，尽可能使用具有唯一性的标识符作为key
- 尽可能减少dom的嵌套层级和节点的数量，较少diff算法的计算
- 尽量减少频繁增删节点，适当使用vshow和vif控制节点的显示和隐藏
## 你知道vue中key的原理吗？说说你对它的理解
在Vue中，key是用来帮助Vue识别节点的优化手段，v-for或者diff算法中同层比较的时候，都是会利用key
来比较新旧元素，尽可能复用已有的元素。
key是给每一个vnode的唯一id，也是diff的一种优化策略，可以根据key，更准确， 更快的找到对应的vnode节点

## Vue项目中有封装过axios吗？主要是封装哪方面的？



## 你了解axios的原理吗？有看过它的源码吗？



## SSR解决了什么问题？有做过SSR吗？你是怎么做的？
## 说下你的vue项目的目录结构，如果是大型项目你该怎么划分结构和划分组件呢？
## vue要做权限管理该怎么做？如果控制到按钮级别的权限怎么做？
## Vue项目中你是如何解决跨域的呢？
## vue项目本地开发完成后部署到服务器后报404是什么原因呢？
## 你是怎么处理vue项目中的错误的？
## vue3有了解过吗？能说说跟vue2的区别吗？
## 选项式API与组合式API
## ref和reactive
    - 作用
    - 源码实现
        - ref
            
        - reactive
## 生命周期
## watch和computed
## 组件通信
## 路由
## 快速上手Vuex 到 手写简易 Vuex
使用VueX的好处
- 能够在VueX集中管理数据，易于开发和后期维护
- 能够高效地实现组件之间的数据共享，提高开发效率
- 在 vuex 中的数据都是响应式的
VueX的基础使用
- state
    存放数据
    取state两种方式:
    - 方式一
    ```
        this.$store.state.perportyName
    ```
    - 方式二
    ```
        ...mapState([perpoetyName1,perportyName2])
    ```
- mutation
    Store 中的状态不能直接对其进行操作，我们得使用 Mutation 来对 Store 中的状态进行修改，虽然看起来有些繁琐，但是方便集中监控数据的变化
    state的更新必须是Mutation来处理
    两种触发方式
    - 方式一
        ```
            this.$store.commit(funName)
        ```
    - 方式二
        ```
            ...mapMutations([funName1,funName2])
        ```
- action
    异步调用的方式
    action => mutation => state
    调用方式
    ```
        this.$store.dispatch()
    ```
    方式二
    ```
        mapAction([actionFun1,actionFun2])
    ```
- getter
    Getter类似于计算属性，但是我们的数据来源是state
    ```
        state: {
            name:'xxx',
            getter:{
                // state作为第一个参数，可调用上面的state里面的数据
                myname(state){
                    return "我的名字是"+state.name
                }
            }
        }
    ```
    组件引入方式
    ```
        this.$store.getters.myname
    ```
    第二种
    ```
        mapGetters(['myname'])
    ```
- module
    state数据过多时，就会变得难以管理，VueX允许将store分成不同的模块，每个模块都有属于自己的state等
    ```
        const state = {}
        const mutations = {}
        const actions = {}
        const getter = {}
        export default {
            state,
            mutations,
            actions,
            getter
        }
    ```    
    index.js
    ```
        import Home from './Home'
        import Search from './Search'
        export default new Vuex.Store({
        state: {
        },
        mutations: {
        },
        actions: {
        },
        modules: {
            Home,      //
            Search
        }
        })
    ```
## v-if和v-show的区别
首先二者都是控制元素的显示与隐藏
v-show是利用css中的display:none;来做的，隐藏元素后，但是其dom元素依旧存在
v-if 是真实安装卸载元素，隐藏元素dom结构不存在，并且能触发元素的生命周期
使用场景
v-show用户切换状态比较频繁的场景，v-show初始渲染消耗性能比较大
v-if则是用于初始渲染
## Vue实例挂载的过程？
## 请描述下你对vue生命周期的理解？
- beforeCreate
    组件创建之初
- Created
    组将创建之后，此时页面结构还没好，data里面的数据已经可以用了
- BeforeMounte
    组件挂载之前
- Mouted
    组件挂载之后，此时页面结构都已存在
- beforeUpdate
    组件更新之前
- Updated
    组件更新之后
- beforeDestory
    组件销毁之前
- destoryed
    组件销毁之后
- activated
    keep-live组件激活时触发
- deactivated
    keep-alive 缓存的组件停用时调用
## 父子组件发生更新，生命周期的情况
父组件的beforeUpdate钩子函数被调用。
子组件的beforeUpdate钩子函数被调用。
子组件的updated钩子函数被调用。
父组件的updated钩子函数被调用。
## 父子组件初始渲染的时生命周期执行情况
父组件的beforeCreate钩子函数被调用。
父组件的created钩子函数被调用。
父组件的beforeMount钩子函数被调用。
子组件的beforeCreate钩子函数被调用。
子组件的created钩子函数被调用。
子组件的beforeMount钩子函数被调用。
子组件的mounted钩子函数被调用。
父组件的mounted钩子函数被调用。
在这个过程中，父组件首先被创建并挂载，然后子组件被创建并挂载。在每个组件的生命周期函数中，可以进行一些初始化操作，例如获取数据或准备组件的状态。
需要注意的是，在组件渲染之前，beforeCreate和created钩子函数被调用，而在组件渲染之后，beforeMount和mounted钩子函数被调用。在这些钩子函数中，可以执行一些在组件渲染之前或之后需要进行的操作。
另外，在每个组件的destroyed钩子函数中，可以执行一些在组件被销毁时需要进行的操作，例如清理定时器或取消事件监听器。
## keep-live组件
keep-alive 是 Vue.js 内置的一个抽象组件，用于缓存具有相同组件标签 component 的组件实例，以避免在组件切换时频繁地销毁和重新创建组件实例，从而提高应用程序的性能。
## v-if和v-for的优先级是什么？
v-if 是控制元素显示与隐藏
v-for 是遍历组件
v-if和v-for作用于同一组件
Vue2中v-for的优先级更高
Vue3中v-if优先级更高
## 为什么data属性是一个函数而不是一个对象？
在Vue中，data属性可以是对象或者函数
当data属性为一个对象时，这个对象会被组件实例共享，因为引用的都是同一个对象地址，这可能会导致不同组件之间的数据相互影响，从而引起一些难以调试的东西。
当data属性为一个函数时，通过函数return出来的对象，都是一个全新的数据对象，每个组件都拥有独立的数据对象，不会相互影响。
## 动态给vue的data添加一个新的属性时会发生什么？怎样解决？
动态的给data添加一个新的属性，并不会触发数据的响应式操作，也就是或新加入的属性改变时，不会触发响应式，不会触发页面刷新。
也就是说你可以使用强制刷新方法。
- Vue.$set(),向响应式对象中添加一个property,并确保这个新的peoperty也是响应式的且触发视图刷新。
    ```
        Vue.$set(this.someObj,perporty,newPerportyValue)
    ```
- Object.assign() 进行合并对象
    混入原有的对象
    ```
        this.someObj = Object.assign({},this.someObj,{newProperty:newPropertyValue})
    ```
## Vue中组件和插件有什么区别？
在Vue中，组件和插件都是可重用的代码模块，但它们有一些区别。
- 组件
组件是Vue中的基本概念，它是一个可重用的Vue实例，用于封装可复用的HTML元素和相关的JavaScript代码和CSS样式。组件可以拥有自己的状态和生命周期钩子，可以接收父组件传递的数据，也可以向父组件发送事件。
组件通常用于封装具有某种特定功能的UI元素，例如按钮、表单、对话框等。组件可以在应用程序的不同部分中重复使用，从而提高了代码的复用性和可维护性。
- 插件
插件是Vue的扩展机制，通过为Vue添加全局功能或功能库，来扩展Vue的能力。插件通常会为Vue添加全局的方法、指令、过滤器、组件等，或者添加全局的功能库，例如路由器、状态管理器等。
插件通常是通过Vue的Vue.use()方法安装到Vue中的。在安装插件时，我们可以为插件传递一些参数或选项，从而定制插件的行为。
需要注意的是，插件通常是全局的，它们会影响到整个Vue应用程序，因此在使用插件时需要谨慎，避免产生不必要的影响和冲突。一般来说，只有在需要全局添加某些功能或库时，才需要使用插件。
## Vue组件之间的通信方式都有哪些？
 - 父子组件通信
    父组件通过props传递参数给子组件
    子组件通过emit事件，传递数据给父组件
    父组件可以$children来获取子组件的数据以及调用其函数
    子组件也可以通过$parent来获取父组件的数据以及调用函数
- 爷孙组件通信
    ue中还提供了inject和provide两个选项，可以用于爷孙组件之间的数据传递。这种方式与向下传递prop和向上触发事件的方式不同，它提供了一种在父组件和子孙组件之间建立依赖关系的方式，从而实现跨层级的数据传递。
    具体来说，爷组件可以通过provide选项提供数据，然后孙组件可以通过inject选项注入该数据。这样，孙组件就可以在不需要显式的prop和事件传递的情况下，访问爷组件提供的数据。
    ```
        <!-- Grandparent.vue -->
        <template>
        <div>
            <parent></parent>
        </div>
        </template>

        <script>
        import Parent from './Parent.vue';

        export default {
        components: {
            Parent
        },
        provide: {
            message: 'Hello from Grandparent'
        }
        }
        </script>
    ```
- 通过Vuex进行通信
    vuex详解：

- 通过浏览器存储
- 通过事件总线或订阅发布进行通信
## Vue响应式原理
数据劫持+订阅发布
Dep reactive watchEffect
Dep负责订阅发布功能
Vue2的响应式是基于Object.defineProperty实现的
Vue3的响应式是基于ES6的Proxy来实现的
弊端就是：Object.defineProperty只对初始对象里的属性有监听作用，而对新增的属性无效。这也是为什么Vue2中对象新增属性的修
改需要使用Vue.$set来设值的原因。

## 指令v-clock

用来隐藏未完成编译的DOM模板

原理是先加上display:none; 等待组件实例挂载结束后移除

## 