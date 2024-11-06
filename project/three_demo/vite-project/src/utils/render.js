import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

// eslint-disable-next-line no-unused-vars
export default function render(scene, camera, renderer, bloomComposer, finalComposer) {
    // 创建辉光图层
    const BLOOM_LAYER = 1;
    const bloomLayer = new THREE.Layers();
    bloomLayer.set(BLOOM_LAYER);
    // 
    const darkMaterial = new THREE.MeshBasicMaterial({ color: 'black' })
    camera.position.z = 100
    camera.lookAt(0, 0, 0)
    camera.layers.enable(bloomLayer)
    scene.add(camera)
    // 控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI * 0.5;
    controls.minDistance = 1;
    controls.maxDistance = 100;
    controls.addEventListener('change', render);
    const materials = {}
    //非辉光图层的模型颜色全部变为黑色
    function darkenNonBloomed(obj) {
        if (obj.isMesh && bloomLayer.test(obj.layers) === false) {
            materials[obj.uuid] = obj.material;
            obj.material = darkMaterial;
        }
    }
    //恢复非辉光图层的模型颜色
    function restoreMaterial(obj) {
        if (materials[obj.uuid]) {
            obj.material = materials[obj.uuid];
            delete materials[obj.uuid];
        }
    }
    const mixPass = new ShaderPass(
        new THREE.ShaderMaterial({
            uniforms: {
                baseTexture: { value: null },
                bloomTexture: { value: bloomComposer.renderTarget2.texture }
            },
            vertexShader: '\t\t\tvarying vec2 vUv;\n' +
                '\n' +
                '\t\t\tvoid main() {\n' +
                '\n' +
                '\t\t\t\tvUv = uv;\n' +
                '\n' +
                '\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n' +
                '\n' +
                '\t\t\t}',
            fragmentShader: '\t\t\tuniform sampler2D baseTexture;\n' +
                '\t\t\tuniform sampler2D bloomTexture;\n' +
                '\n' +
                '\t\t\tvarying vec2 vUv;\n' +
                '\n' +
                '\t\t\tvoid main() {\n' +
                '\n' +
                '\t\t\t\tgl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );\n' +
                '\n' +
                '\t\t\t}',
            defines: {}
        }), 'baseTexture'
    );
    mixPass.needsSwap = true;
    finalComposer.addPass(mixPass);
    function render() {
        scene.traverse(darkenNonBloomed)
        bloomComposer.render()
        scene.traverse(restoreMaterial)
        finalComposer.render()
        requestAnimationFrame(render);
    }
    render()
}