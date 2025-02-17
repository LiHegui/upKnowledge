## 订阅发布(源码)

::: tip
发布-订阅是一种消息范式
消息的发送者（称为发布者）不会将消息直接发送给特定的接收者（称为订阅者）。
而是将发布的消息分为不同的类别，无需了解哪些订阅者（如果有的话）可能存在
同样的，订阅者可以表达对一个或多个类别的兴趣，只接收感兴趣的消息，无需了解哪些发布者存在
:::

::: normal-demo
```js
// 订阅发布
class PubSub {
    constructor(props) {
        this.messages = {}
        this.listeners = {}
    }

    // 添加发布者
    publish(type, content) {
        const existContent = this.messages[type]
        if (!existContent) {
            this.messages[type] = [];
        }
        this.messages[type].push(content)
    }

    // 添加订阅者
    subscribe(type, cb) {
        const existListener = this.listeners[type]
        if (!existListener) {
            this.listeners[type] = []
        }
        this.listeners[type].push(cb)
    }

    // 通知
    notify(type) {
        const messages = this.messages[type]
        const subscribers = this.listeners[type] || []
        subscribers.forEach((cb, index) => {
            cb(messages[index])
        })
    }
}

class Publisher {
    constructor(name, context) {
        this.name = name;
        this.context = context;
    }

    publish(type, content) {
        this.context.publish(type, content);
    }
}
class Subscriber {
    constructor(name, context) {
        this.name = name;
        this.context = context;
    }

    subscribe(type, cb) {
        this.context.subscribe(type, cb);
    }
}

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

```
:::


## 观察者模式(源码)
::: tip
观察者模式（Observer Pattern）是一种行为设计模式，主要用于定义对象间的一对多依赖关系，使得当一个对象状态改变时，所有依赖它的对象都会自动收到通知并更新。以下是正确理解观察者模式的关键点：
:::

1. 核心概念

Subject（主题）：被观察的对象，维护一个观察者列表，并提供添加、删除和通知观察者的方法。
Observer（观察者）：依赖主题的对象，当主题状态变化时，观察者会收到通知并更新自身状态。

2. 工作流程

注册观察者：观察者通过主题的注册方法将自己添加到观察者列表中。
状态变化：主题状态发生变化时，调用通知方法。
通知观察者：主题遍历观察者列表，调用每个观察者的更新方法。
更新状态：观察者根据收到的通知更新自身状态。

3. 优点

解耦：主题和观察者之间松耦合，主题无需知道观察者的具体实现。
动态关系：观察者可以随时注册或注销，灵活性高。
广播通信：主题状态变化时，所有观察者都能收到通知。

4. 缺点

性能问题：观察者过多时，通知过程可能耗时。
循环依赖：不当使用可能导致循环调用，引发系统崩溃。
更新顺序：观察者的更新顺序不确定，可能影响系统行为。

5. 应用场景

事件驱动系统：如GUI中的按钮点击事件。
发布-订阅系统：如消息队列、事件总线。
数据同步：如多个视图同步更新

::: normal-demo
```ts
// 观察者模式
// 主题（Subject）
class Subject {
  constructor() {
    this.observers = []; // 存储观察者
  }

  // 添加观察者
  addObserver(observer) {
    this.observers.push(observer);
  }

  // 移除观察者
  removeObserver(observer) {
    this.observers = this.observers.filter(obs => obs !== observer);
  }

  // 通知所有观察者
  notifyObservers(data) {
    this.observers.forEach(observer => observer.update(data));
  }
}

// 观察者（Observer）
class Observer {
  constructor(name) {
    this.name = name;
  }

  // 更新方法，当主题状态变化时调用
  update(data) {
    console.log(`${this.name} received data:`, data);
  }
}

// 客户端代码
const subject = new Subject();

// 创建观察者
const observer1 = new Observer("Observer1");
const observer2 = new Observer("Observer2");

// 注册观察者
subject.addObserver(observer1);
subject.addObserver(observer2);

// 主题状态变化，通知观察者
subject.notifyObservers("State 1");

// 移除一个观察者
subject.removeObserver(observer1);

// 再次通知观察者
subject.notifyObservers("State 2");

```
::: 


## 单点登录

###  SSO单点登录
sso需要一个独立的认证中心，只有认证中心能接受用户的用户名密码等安全信息，其它系统不提供接口，只接受认证中心的间接授权。
间接授权通过令牌实现，sso认证中心验证用户的用户名密码没有问题，创建授权令牌，在接下来的跳转过程中，授权令牌作为参数发送给各个子系统，子系统拿到令牌，即得到了授权，可以创建局部会话模具部会话登录方式与单系统的登录方式相同。
