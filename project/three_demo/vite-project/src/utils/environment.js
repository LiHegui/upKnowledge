// 处理环境贴图
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
const rgbeLoader = new RGBELoader();
export default function setEnvironment(scene) {
    rgbeLoader.load('/hdr/sky.hdr', function (envMap) {
        scene.environment = envMap;
        // hdr作为环境贴图生效，设置.mapping为EquirectangularReflectionMapping
        envMap.mapping = THREE.EquirectangularReflectionMapping;
    })
}