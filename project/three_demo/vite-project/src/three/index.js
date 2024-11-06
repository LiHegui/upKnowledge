import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
export default class Core {
    scene = null;
    acimationId = 0;
    renderer = null;
    camera = null;
    renderScene = null;
    composer = null;
    bloomComposer = null;
    BLOOM_SCENE = 1;
    params = {
        threshold: 0,
        strength: 1,
        radius: 0.5,
        exposure: 1
    };
    bloomLayer = null;
    materials = {};
    darkMaterial = null;
    finalComposer = null;
    stats = null;
    constructor() {
        this.init_scene();
        this.init_stats()
        // 创建图层实例
        this.bloomLayer = new THREE.Layers();
        // 设置图层为1
        this.bloomLayer.set(this.BLOOM_SCENE)
        this.darkMaterial = new THREE.MeshBasicMaterial({ color: 'black' });
        this.init_renderer();
        this.init_camera();
        this.init_renderPass()
        this.init_control();
        this.setupScene()
        this.reize()
    }
    init_scene() {
        this.scene = new THREE.Scene();
    }
    init_renderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
    }
    init_camera() {
        this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 200);
        this.camera.position.set(0, 0, 20);
        this.camera.lookAt(0, 0, 0);
        this.scene.add(this.camera)
    }
    init_control() {
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.maxPolarAngle = Math.PI * 0.5;
        controls.minDistance = 1;
        controls.maxDistance = 100;
        controls.addEventListener('change', this.render.bind(this))
    }
    // 性能检测
    init_stats() {
        this.stats = new Stats();
        document.body.appendChild(this.stats.dom);
    }
    init_renderPass() {
        // 1.创建后处理对象EffectComposer，WebGL渲染器renderer作为参数
        this.bloomComposer = new EffectComposer(this.renderer);
        this.bloomComposer.renderToScreen = false; // 不渲染到屏幕
        // 2.渲染器通道renderScene
        this.renderScene = new RenderPass(this.scene, this.camera);
        this.bloomComposer.addPass(this.renderScene);
        // 3.辉光通道bloomComposer 
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
        bloomPass.threshold = this.params.threshold;  // 阈值
        bloomPass.strength = this.params.strength;  // 强度
        bloomPass.radius = this.params.radius; // 半径
        this.bloomComposer.addPass(bloomPass);
        const mixPass = new ShaderPass(
			new THREE.ShaderMaterial({
				uniforms: {
					baseTexture: { value: null },  // 基础纹理
					bloomTexture: { value: this.bloomComposer.renderTarget2.texture } // Bloom纹理
				},
                // 定义顶点着色器和片元着色器
				vertexShader: 
                `varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }
                `,
                // 定义片元着色器，实现基础纹理和辉光纹理的混合
				fragmentShader: `
                uniform sampler2D baseTexture;
                uniform sampler2D bloomTexture;
                varying vec2 vUv;
                void main() {
                    gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );

                }`,
				defines: {}
			}), 'baseTexture'
		);
		mixPass.needsSwap = true;
		
        // 1.将渲染器通道renderScene添加到后处理对象finalComposer中
		this.finalComposer = new EffectComposer(this.renderer);
		this.finalComposer.addPass(this.renderScene);
		this.finalComposer.addPass(mixPass);
        // 2.输出通道outputPass
        const outputPass = new OutputPass();
		this.finalComposer.addPass(outputPass);

        window.addEventListener( 'pointerdown', onPointerDown.bind(this));
        const gui = new GUI();
        const bloomFolder = gui.addFolder( 'bloom' );
        bloomFolder.add( this.params, 'threshold', 0.0, 1.0 ).onChange(( value )=> {
            bloomPass.threshold = Number( value );
            this.render();
        });
        bloomFolder.add( this.params, 'strength', 0.0, 3 ).onChange(( value )=>{
            bloomPass.strength = Number( value );
            this.render();
        });
        bloomFolder.add( this.params, 'radius', 0.0, 1.0 ).step( 0.01 ).onChange(( value )=> {
            bloomPass.radius = Number( value );
            this.render();
        });
        const toneMappingFolder = gui.addFolder( 'tone mapping' );
        toneMappingFolder.add( this.params, 'exposure', 0.1, 2 ).onChange(( value )=> {
            this.renderer.toneMappingExposure = Math.pow( value, 4.0 );
            this.render();
        });
        
        function onPointerDown( event ) {
            const mouse = new THREE.Vector2();
            mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera( mouse, this.camera );
            const intersects = raycaster.intersectObjects( this.scene.children, false );
            if ( intersects.length > 0 ) {
                const object = intersects[ 0 ].object;
                // 切换对象在该图层的可见性
                object.layers.toggle( this.BLOOM_SCENE );
                this.render();
            }
        }
    }
    
    disposeMaterial(obj) {
        if (obj.material) {
            obj.material.dispose();
        }
    }
    reize() {
        window.addEventListener("resize", () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize( width, height );
            this.bloomComposer.setSize( width, height );
            this.finalComposer.setSize( width, height );
            this.render();
        })
    }
    setupScene() {
        this.scene.traverse(this.disposeMaterial);
        this.scene.children.length = 0;
        // 创建50球，颜色随机，位置随机，大小随机
        const geometry = new THREE.IcosahedronGeometry(1, 15);
        for (let i = 0; i < 50; i++) {
            const color = new THREE.Color();
            color.setHSL(Math.random(), 0.7, Math.random() * 0.2 + 0.05);
            const material = new THREE.MeshBasicMaterial({ color: color });
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.x = Math.random() * 10 - 5;
            sphere.position.y = Math.random() * 10 - 5;
            sphere.position.z = Math.random() * 10 - 5;
            // 球体的位置向量归一化，然后乘以一个随机数，这个随机数的范围是在2.0到6.0之间
            sphere.position.normalize().multiplyScalar(Math.random() * 4.0 + 2.0);
            // 设置球体的缩放值，这个值是一个随机数乘以一个随机数加上0.5，这个值的范围是在0.5到1.0之间
            sphere.scale.setScalar(Math.random() * Math.random() + 0.5);
            this.scene.add(sphere);
            if (Math.random() < 0.25) sphere.layers.enable(this.BLOOM_SCENE);
        }
        this.render();
    }
    render() {
        this.stats.update();
        this.scene.traverse(this.darkenNonBloomed.bind(this));
        this.bloomComposer.render();
        this.scene.traverse(this.restoreMaterial.bind(this));
        this.finalComposer.render();
    }
    darkenNonBloomed(obj) {
        if (obj.isMesh && this.bloomLayer.test(obj.layers) === false) {
            this.materials[obj.uuid] = obj.material;
            obj.material = this.darkMaterial;
        }
    }
    restoreMaterial(obj) {
        if (this.materials[obj.uuid]) {
            obj.material = this.materials[obj.uuid];
            delete this.materials[obj.uuid];
        }
    }

    destory() {
        this.renderer.domElement.remove()
        this.renderer.dispose();
    }
}