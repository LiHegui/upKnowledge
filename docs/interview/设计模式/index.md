## 订阅发布(源码)

::: tip
订阅发布模式是一种消息传递模式，发布者发布消息，订阅者接收消息。
:::

::: demo
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
观察者模式是一种对象间的一对多依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都得到通知并被自动更新。
:::

:::demo
```ts
// 观察者模式
class Subject {
  count: number
  observers: any[]
  constructor() {
    this.count = 0
    this.observers = []
  }
  getCount() {
    return this.count
  }
  setCount(count: number) {
    // 设置值之后通知更新
    this.count = count
    this.notify()
  }
  notify() {
    this.observers.forEach((o) => {
      o.update()
    })
  }
  push(o:any) {
    this.observers.push(o)
  }
}

class Observer {
  name: string
  subject: Subject
  constructor(name: string, sub: Subject) {
    this.name = name
    this.subject = sub
    this.subject.push(this)
  }
  update() {
    console.log(
      `${this.name} 变了 ${this.subject.getCount()}`
    )
  }
}


const sub = new Subject()
// 观察一号
const observer1 = new Observer('一号', sub)
console.log(observer1);
// 观察二号
const observer2 = new Observer('二号', sub)
console.log(observer2);
console.log(sub);



sub.setCount(1)
// 一号 变了 1
// 二号 变了 1

```
::: 


## 单点登录

###  SSO单点登录
sso需要一个独立的认证中心，只有认证中心能接受用户的用户名密码等安全信息，其它系统不提供接口，只接受认证中心的间接授权。
间接授权通过令牌实现，sso认证中心验证用户的用户名密码没有问题，创建授权令牌，在接下来的跳转过程中，授权令牌作为参数发送给各个子系统，子系统拿到令牌，即得到了授权，可以创建局部会话模具部会话登录方式与单系统的登录方式相同。
