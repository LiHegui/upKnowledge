import { useEffect} from 'react'
import * as THREE from 'three'
import './App.css'

function App() {
  useEffect(() => {
    // 创建场景
    const scene = new THREE.Scene()
    // 创建相机--------------------------------fov,  宽高比，  近距离，  远距离
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    // 创建渲染器
    const renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)
    // 创建立方体
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    // 创建立方体的材质
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    // 把立方体和材质添加到场景中
    const cube = new THREE.Mesh(geometry, material)
    // 设置立方体的位置
    cube.position.x = 0.5
    cube.position.y = 0.5
    cube.position.z = 0.5
    // 把立方体添加到场景中
    scene.add(cube)
    // 设置相机的位置
    camera.position.z = 5
    camera.lookAt(0, 0, 0)
    // 渲染函数
    function render() {
      requestAnimationFrame(render)
      cube.rotation.x += 0.01
      cube.rotation.y += 0.01
      renderer.render(scene, camera)
    }
    render()
  }, [])
  return (
    <>
      <div></div>
    </>
  )
}

export default App
