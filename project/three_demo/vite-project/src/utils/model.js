import * as THREE from 'three'
// 引入gltf模型加载库GLTFLoader.js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const loader = new GLTFLoader();
export default function setCube(scene) {
    // 划分组
    const group = new THREE.Group();
    group.name = 'su7';
    // 创建立方体
    loader.load('/model/SU7.glb', function (gltf) {
        group.add(gltf.scene);
        group.position.set(-50, 0, 0);
        group.scale.set(10, 10, 10);
        group.rotation.y = -Math.PI / 2;
        gltf.scene.traverse((obj) => {
            obj.layers.set(1)
        })
        scene.add(group);
    })
    const group2 = new THREE.Group();
    group2.name = 'su7-2';
    // 创建立方体
    loader.load('/model/SU7.glb', function (gltf) {
        group2.add(gltf.scene);
        group2.position.set(50, 0, 0);
        group2.scale.set(10, 10, 10);
        group2.rotation.y = -Math.PI / 2;
        scene.add(group2);
    })
}