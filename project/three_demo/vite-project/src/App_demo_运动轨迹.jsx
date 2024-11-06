import { useEffect } from "react"
import * as THREE from 'three'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// import { useState } from 'react'


export default function App() {
    useEffect(() => {
        let start = 0
        let interval = Math.PI / 1000
        let surroundTrack = false
        let start_speed = 0
        let speed_flag = false
        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0x474747)
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        camera.position.set(5, 5, 5)
        camera.lookAt(new THREE.Vector3(0, 0, 0))
        scene.add(camera)
        // clock
        const clock = new THREE.Clock();//时钟对象
        // 灯光
        const light = new THREE.DirectionalLight(0xffffff, 1)
        light.position.set(10, 10, 10)
        scene.add(light)
        // 虚拟地面网格
        const grid = new THREE.GridHelper(20, 20, 0xc1c1c1, 0x8d8d8d);
        scene.add(grid);
        // renderer
        const renderer = new THREE.WebGLRenderer({
            antialias: true,  // 抗锯齿
        })
        renderer.render(scene, camera)
        renderer.setSize(window.innerWidth, window.innerHeight)
        // gui
        const gui = new GUI()
        gui.close();//关闭菜单
        const trackFolder = gui.addFolder('相机运动');
        trackFolder.close()
        // 创建一个函数，供按钮点击时调用
        function onClickFunction() {
            surroundTrack = true
        }
        function onCloseFunction() {
            surroundTrack = false
        }
        // 创建一个包含按钮的对象
        const guiControls = {
            clickButton: function () {
                onClickFunction();
            },
            closeButton: function () {
                onCloseFunction();
            },
            angleButton: function () {
                // 获取相机的视线方向
                const dir = new THREE.Vector3();
                camera.getWorldDirection(dir);
                // dis向量表示相机沿着相机视线方向平移1的位移量
                const dis = dir.clone().multiplyScalar(1);
                // 相机沿着视线方向平移
                camera.position.add(dis);
            },
            speedButton: function () {
                speed_flag = true
            },
            closeSpeedButton: function () {
                speed_flag = false
            }
        };
        // 将按钮添加到 GUI 中
        trackFolder.add(guiControls, 'clickButton').name('环绕运动');
        trackFolder.add(guiControls, 'closeButton').name('关闭环绕运动');
        trackFolder.add(guiControls, 'angleButton').name('视角运动');
        trackFolder.add(guiControls, 'speedButton').name('加速运动');
        trackFolder.add(guiControls, 'closeSpeedButton').name('关闭加速运动');
        // 加载模型
        const loader = new GLTFLoader();
        let model = {}
        loader.load('/model/SU7.glb', function (gltf) {
            model = gltf.scene
            gltf.scene.scale.set(1, 1, 1);
            gltf.scene.position.set(0, 0, 0);
            gltf.scene.rotation.y = -Math.PI / 2;
            gltf.scene.scale.set(0.3, 0.3, 0.3);
            scene.add(gltf.scene);
            render()
        })
        // 渲染
        document.body.appendChild(renderer.domElement)
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight
            camera.updateProjectionMatrix()
            renderer.setSize(window.innerWidth, window.innerHeight)
        })
        function render() {
            renderer.render(scene, camera)
            renderTrack()
            renderSpeed()
            requestAnimationFrame(render)
        }
        // 轨迹运动
        function renderTrack() {
            if (surroundTrack) {
                if (start >= Math.PI * 2) start = 0
                start += interval
                camera.position.x = Math.sin(start) * 5;
                camera.position.z = Math.cos(start) * 5;
                camera.lookAt(new THREE.Vector3(0, 0, 0));
            }
        }
        function renderSpeed() {
            if(speed_flag){
                if (model.position.x >= 10) {
                    model.position.x = -10
                    start_speed = 0
                }
                const v = new THREE.Vector3(0.1, 0, 0);
                const interval = clock.getDelta()
                start_speed += interval
                const dis = v.clone().multiplyScalar(start_speed);
                model.position.add(dis);
            }
        }
        // 页面销毁之前清除定时器
        return () => {
            surroundTrack = false
        }
    }, [])
    return (
        <div>
        </div>
    )
}