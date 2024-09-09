// 控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function setControls(scene, camera, renderer) {
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.addEventListener('change', () => {
        renderer.render(scene, camera)
    })
    return controls
}