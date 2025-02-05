## 模块化

前置

至少掌握一款模块化构建工具

资源

https://www.cyj.me/programming/2018/05/22/about-module-i/

https://www.cyj.me/programming/2018/05/23/about-module-ii/

https://juejin.cn/post/6844903635453739022

https://rollupjs.org/guide/en/

https://hinammehra.medium.com/build-a-private-react-component-library-cra-rollup-material-ui-github-package-registry-1e14da93e790

https://blog.logrocket.com/build-your-own-component-library-svelte/

目标

了解前端模块化发展过程中产生的模块系统以及遗留的使用方式

学习 Rollup 对比与 Webpack 构建模式的异同

分别构建 React/Svelte 组件库的 umd/cjs 模块，总结输出的文件的异同



## 设计模式

发布/订阅模式-观察者模式对比实现

资料

Pub-Sub pattern
Observer vs Pub-Sub pattern

目标

区别二者的差异

具体应用场景以及实践

用自己的话总结一下

基于TypeScript实现一个类型安全的发布订阅

【观察者模式】和【发布订阅】 区别

### 思考一下邮件系统业务流程

1、观察者模式



组成：

两个角色：观察者与被观察者

实现：

被观察者

class Subject {

  constructor() {
    this.observerList = [];
  }

  addObserver(observer) {
    this.observerList.push(observer);
  }

  removeObserver(observer) {
    const index = this.observerList.findIndex(o => o.name === observer.name);
    this.observerList.splice(index, 1);
  }

  notifyObservers(message) {
    const observers = this.observeList;
    observers.forEach(observer => observer.notified(message));
  }

}

观察者

class Observer {
  constructor(name, subject) {
    this.name = name;
    if (subject) {
      subject.addObserver(this);
    }
  }

  notified(message) {
    console.log(this.name, 'got message', message);
  }

}

使用

const subject = new Subject();
const observerA = new Observer('observerA', subject);
const observerB = new Observer('observerB');
subject.addObserver(observerB);
subject.notifyObservers('Hello from subject');
subject.removeObserver(observerA);
subject.notifyObservers('Hello again');

解析

观察者主动申请加入被观察者的列表

被观察者主动将观察者加入列表

2、发布订阅



组成：

至少三个角色：发布者、订阅者、发布订阅中心

实现：

发布订阅中心

class PubSub {
  constructor() {
    this.messages = {};
    this.listeners = {};
  }
  publish(type, content) {
    const existContent = this.messages[type];
    if (!existContent) {
      this.messages[type] = [];
    }
    this.messages[type].push(content);
  }
  subscribe(type, cb) {
    const existListener = this.listeners[type];
    if (!existListener) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(cb);
  }
  notify(type) {
    const messages = this.messages[type];
    const subscribers = this.listeners[type] || [];
    subscribers.forEach((cb, index) => cb(messages[index]));
  }
}



发布者

class Publisher {
  constructor(name, context) {
    this.name = name;
    this.context = context;
  }
  publish(type, content) {
    this.context.publish(type, content);
  }
}

订阅者

class Subscriber {
  constructor(name, context) {
    this.name = name;
    this.context = context;
  }
  subscribe(type, cb) {
    this.context.subscribe(type, cb);
  }
}

使用

const TYPE_A = 'music';
const TYPE_B = 'movie';
const TYPE_C = 'novel';

const pubsub = new PubSub();

const publisherA = new Publisher('publisherA', pubsub);
publisherA.publish(TYPE_A, 'we are young');
publisherA.publish(TYPE_B, 'the silicon valley');
const publisherB = new Publisher('publisherB', pubsub);
publisherB.publish(TYPE_A, 'stronger');
const publisherC = new Publisher('publisherC', pubsub);
publisherC.publish(TYPE_C, 'a brief history of time');

const subscriberA = new Subscriber('subscriberA', pubsub);
subscriberA.subscribe(TYPE_A, res => {
  console.log('subscriberA received', res)
});
const subscriberB = new Subscriber('subscriberB', pubsub);
subscriberB.subscribe(TYPE_C, res => {
  console.log('subscriberB received', res)
});
const subscriberC = new Subscriber('subscriberC', pubsub);
subscriberC.subscribe(TYPE_B, res => {
  console.log('subscriberC received', res)
});

pubsub.notify(TYPE_A);
pubsub.notify(TYPE_B);
pubsub.notify(TYPE_C);

解析

发布者和订阅者实现比较简单，只需完成各自发布、订阅的任务即可

重点在于二者需要确保在与同一个发布订阅中心进行关联，否则两者之间的通信无从关联。

发布者的发布动作和订阅者的订阅动作相互独立，无需关注对方业务，消息派发由发布订阅中心负责。

实际应用

Node.js中自带的EventEmiter模块

Vue.js中数据响应式的实现



## HTTP

资料

Cache-Control https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control

HTTP缓存控制小结 https://imweb.io/topic/5795dcb6fb312541492eda8c

目标

常见 SPA/SSG 前端方案中所使用的缓存控制策略以及配置细节

## Webpack

资料

Webpack  https://webpack.js.org/concepts/

TypeScript With Babel: A Beautiful Marriage  https://iamturns.com/typescript-babel/

目标

使用 Webpack 搭建支持 TypeScript/React/ESLint 的项目并讲解搭建细节

## 客户端缓存

资料：

MDN : https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Client-side_storage

目标：

介绍客户端缓存，每种缓存的优缺点和特性。

## 路由

资料：

rendering-on-the-web： https://web.dev/articles/rendering-on-the-web?hl=zh-cn

目标：

路由实现原理及优缺点。（spa、ssr）
Gatsby的路由是如何实现的？

## 异步机制

资料

并发模型与事件循环  https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Event_loop

Philip Roberts: Help, I’m stuck in an event-loop  https://vimeo.com/96425312

Asynchronous Recursion with Callbacks, Promises and Async.  https://blog.scottlogic.com/2017/09/14/asynchronous-recursion.html

目标

用简单的几个例子讲解 JavaScript 的并发模型与事件循环

实现 Promise queue 以及简单列举应用场景 

实现 Promise loop 以及简单列举应用场景

实现一个使用 Promise 解决竞态条件的例子

## Gatsby

Gatsby

资料

gatsby  https://www.gatsbyjs.com/

目标

该解决方案有什么特性能解决什么方面的问题

组织以子域名划分/以子路径划分的网站时如何使用 mono repo/multi remo 项目结构实现独立开发，独立构件及部署

## 个人博客搭建分享

博客

Hexo

搭建：https://hexo.io/zh-cn/
优化：https://juejin.cn/post/6884900236427264013

GitHub pages

搭建：https://docs.github.com/cn/pages/getting-started-with-github-pages/creating-a-github-pages-site

GitBook

搭建：https://docs.gitbook.com/getting-started/start-exploring

## useEffect

https://overreacted.io/

阅读《useEffect 完整指南》 并写一篇不少与800字（不强制要求）的读后感，转述给其他人理解


## 浏览器加载流程

https://developer.chrome.com/blog/inside-browser-part3?hl=zh-cn

## 子路径项目部署

前置

完整部署过 Web 应用

了解 Nginx 简单的路径配置指令

资源

https://stackoverflow.com/questions/10631933/nginx-static-file-serving-confusion-with-root-alias

https://webpack.js.org/guides/public-path/

目标

构建两个 Web 应用分别部署在根路径以及 /subdirectory 路径

要求使用 Nginx 作 Web 容器

要求应用都有路由/静态资源文件

子路径部署的项目静态文件能正确访问

## 入门

开发环境/工具链

查阅

MDN https://developer.mozilla.org/zh-CN/

Can I use

Playground

CodeSandBox  https://codesandbox.io/

CodePen https://codepen.io/

终端/环境/Shell

Windows Subsystem for Linux Documentation   https://learn.microsoft.com/en-us/windows/wsl/

Windows Terminal

Oh My Zsh

nvm  https://github.com/nvm-sh/nvm

调试工具

Chrome DevTools

Msic

MDN 建议及早补全 HTML elements reference/CSS key concepts/JavaScript Advanced 这三个章节

Chrome DevTools 至少看完 CSS/Console/Network/Storage/JavaScript 章节

版本管理

推荐阅读

猴子都能懂的GIT入门 https://nulab.com/zh-cn/learn/software-development/git-tutorial/

Gitflow Workflow  https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow

学习 Git 分支 https://learngitbranching.js.org/?locale=zh_CN

推荐工具

GitLens

Lazygit

Oh My Zsh git plugin

Msic

如果是 Window 系统请把忽略大小写设置为 false

git config core.ignorecase false

每次提交前做好 git diff

细化自己的提交粒度

编程风格/规范

推荐阅读

ECNAScript 6 入门 - 编程风格

必备工具/插件

EditorConfig

Prettier

Msic

代码格式化需要强制且自动化，在历史遗留项目中仍然手动去支持

lint 用于规避隐性逻辑错误或者更好的代码风格支持或者学习最佳代码实践，即使项目没有集成也应该本地开启

不要忽略任何控制台的 linter warning，请点击链接查看正确与错误用法