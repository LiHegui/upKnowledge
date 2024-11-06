/**
 * 实现router
 * history是整个React-router的核心，里面包括两种路由模式下改变路由的方法，监听路由变化的方法等
 * 1. 两种模式的history对象的api
 *      - createBrowserHistory
 *        - 改变路由 windows.history.pushState() 
 *      - createHashHistory
 * 2. 监听路由变化 popstate onhashchange
 * 3. 改变路由 push replace
 * React-router
 * 1. Router
 * 2. Route
 * 3. Switch
 * 4. Redirect
 * React-router-dom
 * 1. NavLink
 * 2. Link
 * 3. BrowserRouter
 * 4. HashRouter
 */
import { useMemo } from 'react'
import { createBrowerHistory as createHistory } from 'history'
export let rootHistory = null
export default function Router(props) {
    // 缓存history属性
    const history = useMemo(() => {
        rootHistory = createHistory()
        return rootHistory
    }, [])

}