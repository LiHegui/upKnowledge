// 碰撞测试
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
export default class Core {
    camera = null;
    controls = null;
    light = null;
    renderer = null;
    stats = null;
    is_load_finished = false;
    mesh1 = null;
    mixer = null;
    clock = null;
    gui = null;

    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x474747);
        this.init_renderer()
        this.init_camera()
        this.init_gui()
        this.init_control()
        this.init_light()
        this.init_grid()
        this.init_stats()
        this.async_init()
        this.init_animation()
    }
    async async_init() {
        await this.init_box()
        this.is_load_finished = true
    }
    init_grid() {
        const grid = new THREE.GridHelper(20, 20, 0xc1c1c1, 0x8d8d8d);
        this.scene.add(grid);
        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);
    }
    init_box() {
        // eslint-disable-next-line no-unused-vars
        return new Promise((reslove, reject) => {
            const box = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
            this.mesh1 = new THREE.Mesh(box, material);
            this.mesh1.name = "Box"
            this.mesh1.position.set(2, 0, 0)
            this.scene.add(this.mesh1);
            reslove()
        })
    }
    init_animation() {
        const times = [0, 3, 6, 9]
        const values = [0, 0, 0, 10, 0, 0, 0, 0, 10, 0, 0, 0]
        const posKF = new THREE.KeyframeTrack('Box.position', times, values)
        const clip = new THREE.AnimationClip("test", 9, [posKF])
        this.mixer = new THREE.AnimationMixer(this.mesh1)
        const clipAction = this.mixer.clipAction(clip)
        clipAction.loop = THREE.LoopOnce
        clipAction.clampWhenFinished = true
        clipAction.time = 2
        clip.duration = 3
        clipAction.play()
        const guiControls = {
            clickButton: function () {
                console.log("暂停动画");
                clipAction.paused = !clipAction.paused
            },
            stopFunction: function () {
                clipAction.stop()
            },
            resetFunction: function () {
                clipAction.reset()
            },
            playFunction: function () {
                clipAction.play()
            }
        };
        this.gui.add(guiControls, 'clickButton').name('暂停')
        this.gui.add(clipAction, 'timeScale', 1, 5).name('1-5倍速')
        this.gui.add(guiControls, 'stopFunction').name('停止动画回到起点')
        this.gui.add(guiControls, 'playFunction').name('开始动画')
        this.gui.add(guiControls, 'resetFunction').name('重置动画')
        this.clock = new THREE.Clock()
    }
    init_camera() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 10, 10)
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
    init_stats() {
        this.stats = new Stats();
        document.body.appendChild(this.stats.dom);
    }
    init_gui() {
        this.gui = new GUI()
        this.gui.close()
    }
    render() {
        this.stats.update()
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render.bind(this));
        const frameT = this.clock.getDelta()
        this.mixer.update(frameT)
    }
    destory() {
        this.renderer.domElement.remove()
        // 假设我们有一个scene, camera和renderer

        // // 销毁场景中的所有物体
        // while (this.scene.children.length > 0) {
        //     const object = this.scene.children[0];
        //     if (object.geometry) object.geometry.dispose();
        //     if (object.material) {
        //         if (object.material.isMaterial) {
        //             object.material.dispose();
        //         } else {
        //             // 多材质面板
        //             for (const material of object.material) {
        //                 material.dispose();
        //             }
        //         }
        //     }
        //     if (object.texture) object.texture.dispose();
        //     this.scene.remove(object);
        //     object.destroy(); // 调用特定于对象的清理方法，如果有的话
        // }

        // // 清理摄像机和渲染器
        // if (this.camera.geometry) this.camera.geometry.dispose();
        // if (this.camera.material) this.camera.material.dispose();

        // this.renderer.forceContextLoss(); // 强制WebGL上下文丢失
        this.renderer.dispose(); // 销毁渲染器所持有的资源
    }
}