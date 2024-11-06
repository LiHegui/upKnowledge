import { useEffect } from 'react';
import './App.css'
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Water } from 'three/addons/objects/Water.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';



// demo用来联系shader--海平面 
function App() {
    useEffect(() => {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x474747);
        // 透视相机：摄像机视锥体垂直视野角度、 画布宽高比、 近裁剪面、 远裁剪面
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(5, 5, 5);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
        scene.add(camera)
        // renderer, using webglrenderer
        const renderer = new THREE.WebGLRenderer({
            antialias: true,  // 抗锯齿
        })
        renderer.render(scene, camera)
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.5;
        document.body.appendChild(renderer.domElement);
        // light, using directional light
        const light = new THREE.DirectionalLight(0xffffff, 2);
        light.position.set(10, 10, 10);
        scene.add(light);
        // gui
        const gui = new GUI()
        gui.close();
        // stats
        const stats = Stats();
        document.body.appendChild(stats.dom);
        // water
        const waterGeometry = new THREE.PlaneGeometry( 1000, 1000 );
        const water = new Water(waterGeometry, {
            textureWidth: 512, // 纹理宽度
            textureHeight: 512, // 纹理高度
            waterNormals: new THREE.TextureLoader().load( '/img/waternormals.jpg', function ( texture ) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping; // 纹理重复方式
            } ),
            sunDirection: new THREE.Vector3(), // 太阳方向
            sunColor: 0xffffff, // 太阳颜色
            waterColor: 0x001e0f,
            distortionScale: 3.7, // 波纹
            fog: scene.fog !== undefined // 雾
        })
        water.rotation.x = - Math.PI / 2;
        scene.add( water );
        const water_gui = gui.addFolder('water' );
        water_gui.add( water.material.uniforms['time' ], 'value', 0.0, 100.0, 0.01 ).name('时间');
        water_gui.add( water.material.uniforms['distortionScale' ], 'value', 0.0, 10.0, 0.01 ).name('波纹');
        water_gui.add( water.material.uniforms['alpha' ], 'value', 0.0, 1.0, 0.01 ).name('透明度');
        // sky
        const sky = new Sky();
        const sun = new THREE.Vector3();
        sky.scale.setScalar( 10000 );
        scene.add( sky );
        const skyUniforms = sky.material.uniforms;
        skyUniforms[ 'turbidity' ].value = 10; // 粗糙度
        skyUniforms[ 'rayleigh' ].value = 2; // leigh散射系数
        skyUniforms['mieCoefficient' ].value = 0.005; // mie散射系数
        skyUniforms['mieDirectionalG' ].value = 0.8; // mie散射系数
        const parameters = {
            elevation: 2,
            azimuth: 180
        };
        const sky_gui = gui.addFolder('sky' );
        sky_gui.add( parameters, 'elevation', 0, 90, 0.1 ).name('海拔高度').onChange( updateSun );
        sky_gui.add( parameters, 'azimuth', - 180, 180, 0.1 ).name('方位角').onChange( updateSun );
        // pmrem
        const pmremGenerator = new THREE.PMREMGenerator( renderer );
        const sceneEnv = new THREE.Scene();
        let renderTarget;
        function updateSun() {
            const phi = THREE.MathUtils.degToRad( 90 - parameters.elevation );
            const theta = THREE.MathUtils.degToRad( parameters.azimuth );
            sun.setFromSphericalCoords( 1, phi, theta );
            sky.material.uniforms[ 'sunPosition' ].value.copy( sun );
            water.material.uniforms[ 'sunDirection' ].value.copy( sun ).normalize();
            if ( renderTarget !== undefined ) renderTarget.dispose();
            sceneEnv.add( sky );
            renderTarget = pmremGenerator.fromScene( sceneEnv );
            scene.add( sky );
            scene.environment = renderTarget.texture;
        }
        updateSun();
        // controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.maxPolarAngle = Math.PI * 0.495;
        controls.target.set( 0, 0, 0 );
        controls.minDistance = 40.0;
        controls.maxDistance = 200.0;
        // resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();  // 更新透视投影矩阵
            renderer.setSize(window.innerWidth, window.innerHeight);
        })
        function render() {
            stats.update();
            water.material.uniforms["time"].value += 1.0 / 120.0;
            renderer.render(scene, camera);
            requestAnimationFrame(render);
        }
        render();
    }, [])
    return (
        <div>
        </div>
    )
}
export default App;