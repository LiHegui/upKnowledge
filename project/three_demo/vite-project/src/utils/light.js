import * as THREE from 'three';
export default function setLight(scene) {
    // 直行光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);
}