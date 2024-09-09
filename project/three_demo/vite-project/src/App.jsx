import { useEffect } from 'react'
import * as THREE from 'three'
import './App.css'
import setLight from './utils/light'
import setEnvironment from './utils/environment'
import setCamera from './utils/render'
import setSprite from './utils/sprite'

function App() {
  useEffect(() => {
    // 创建场景
    const scene = new THREE.Scene()
    const loader = new THREE.TextureLoader();
    loader.load('/hdr/sky.jpg', function (texture) {
      scene.background = texture
    })
    // 创建渲染器
    const renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)
    // 创建立方体
    const geometry = new THREE.BoxGeometry(10, 10, 10)
    const material = new THREE.MeshBasicMaterial({ color: 0xab9c9c })
    const cube = new THREE.Mesh(geometry, material)
    cube.position.x = 0.5
    cube.position.y = 0.5
    cube.position.z = 0.5
    // scene.add(cube)
    // 创建相机--------------------------------fov,  宽高比，  近距离，  远距离
    setCamera(scene, renderer)
    // 设置灯光
    setLight(scene)
    // 设置环境
    setEnvironment(scene)
    // 增加精灵图
    setSprite(scene, {})
  }, [])
  return (
    <>
      <div></div>
    </>
  )
}

export default App
