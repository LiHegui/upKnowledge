import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
export default class Core {
    camera = null;
    controls = null;
    light = null;
    renderer = null
    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x474747);
        this.init_renderer()
        this.init_camera()
        this.init_control()
        this.init_light()
        this.init_grid()
        this.init_box()
    }
    init_grid() {
        const grid = new THREE.GridHelper(20, 20, 0xc1c1c1, 0x8d8d8d);
        this.scene.add(grid);
        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);
    }
    init_box() {
        const box = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const mesh = new THREE.Mesh(box, material);
        this.scene.add(mesh);
    }
    init_camera() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(10, 10, 10)
        this.camera.lookAt(new THREE.Vector3(0, 0, 0))
        this.scene.add(this.camera)
    }
    init_control() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.controls.enableDamping = true
        this.controls.target.set(0, 0, 0)
    }
    init_light() {
        this.light = new THREE.DirectionalLight(0xffffff, 1)
        this.light.position.set(10, 10, 10)
        this.scene.add(this.light)
    }
    init_renderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        window.addEventListener("resize", () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(window.devicePixelRatio);
        });
    }
    render() {
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render.bind(this));
    }
}