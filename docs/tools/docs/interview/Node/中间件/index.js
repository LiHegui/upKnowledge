// 中间件
//
// 中间件本质是一个回调函数，参数包含请求对象，响应对象和执行下一个中间件
// Koa中间件采用的是洋葱模型，每次执行下一个中间件传入两个参数
// ctx 封装了request和response的变量
// next 进入下一个要执行的中间件函数

// koa2 中间件都是遇到next或者await next就中断中间件的代码执行，跳转到对应的下一个中间件
// 执行期的代码，一直到最后的一个中间件，然后逆序回退到倒数第二个中间件await next 或者next
// 下部分的代码执行，一直回退，直到第一个中间件next下的代码执行完毕
const http = require('http')

// 组合中间件
function compose(middlewareList) {
    return function (ctx) {
        function dispatch(i) {
            const fn = middlewareList[i]
            try {
                return Promise.resolve(
                    // fn 因为是个async函数本来返回一个promise,但是外面为什么还要包一
                    // 层Promise.resolve呢，是因为为了防止用户传的中间件没有用async开
                    // 头，那就不能用await next()
                    fn(ctx, dispatch.bind(null, i + 1))
                )
            } catch (err) {
                return Promise.reject(err)
            }
        }
        dispatch(0)
    }
}

class LikeKoa2 {
    constructor() {
        this.middlewareList = []
    }

    use(fn) {
        this.middlewareList.push(fn)
        return this
    }

    // 把req, res封装到ctx里面
    createContext(req, res) {
        const ctx = {
            req,
            res
        }
        ctx.query = req.query
        return ctx
    }

    callback() {
        const fn = compose(this.middlewareList)
        return (req, res) => {
            const ctx = this.createContext(req, res)
            fn(ctx)
        }
    }

    listen(...args) {
        const server = http.createServer(this.callback())
        server.listen(...args)
    }
}


async function fn1(ctx, next) {
    console.log('first: start')
    await next()
    console.log('first: end')
}

async function fn2(ctx, next) {
    console.log('second: start')
    await next()
    console.log('second: end')
}
