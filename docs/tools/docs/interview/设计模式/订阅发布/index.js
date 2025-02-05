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
