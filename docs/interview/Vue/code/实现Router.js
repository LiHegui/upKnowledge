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