import * as THREE from 'three'
import setControls from './controls'
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 100
camera.lookAt(0, 0, 0)
export default function setCamera(scene, renderer) {
    scene.add(camera)
    const controls = setControls(scene, camera, renderer)
    function render() {
        requestAnimationFrame(render)
        controls.update()
        renderer.render(scene, camera)
    }
    render()
}
export { camera }