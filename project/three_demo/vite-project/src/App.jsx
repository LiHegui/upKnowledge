import { useEffect } from 'react';
import './App.css'
import Core from './three/index'
function App() {
    useEffect(() => {
        console.log('====================================');
        console.log("初始化");
        console.log('====================================');
        const core = new Core()
        core.render()
        return ()=>{
            core.destory()
        }
    }, [])
    return (
        <div>
        </div>
    )
}
export default App;