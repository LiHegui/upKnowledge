import { useEffect } from 'react'
import './App.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';
import TWEEN from 'three/examples/jsm/libs/tween.module.js'




function App() {
  useEffect(() => {
    let tween = {}
    let kinematics = {}
    // 起点
    let start = {}
    // 终点
    let end = {}
    // 缓动函数
    const colladaLoader = new ColladaLoader();
    // scene
    const scene = new THREE.Scene();
    // scene.background = new THREE.Color(0x474747);
    // camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(2, 2, 3)
    camera.lookAt(new THREE.Vector3(0, 0, 0))
    scene.add(camera)
    // renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    // light
    const light = new THREE.HemisphereLight(0xfff7f7, 0x494966, 3);
    scene.add(light);
    // 辅助网格
    const grid = new THREE.GridHelper(20, 20, 0xc1c1c1, 0x8d8d8d);
    scene.add(grid);
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
    // controls
    new OrbitControls(camera, renderer.domElement);
    // model
    colladaLoader.load('/model/collada/abb_irb52_7_120.dae', function (collada) {
      const dae = collada.scene;
      kinematics = collada.kinematics;
      console.log(kinematics);

      scene.add(dae);
      dae.traverse(function (child) {
        if (child.isMesh) {
          child.material.flatShading = true
          child.material.color = new THREE.Color(Math.random() * 0xffffff);
        }
      })
      dae.updateMatrix();
      setUpTween()
      render()
    })
    // resize
    window.addEventListener('resize', onResize);
    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    function setUpTween() {
      const duration = THREE.MathUtils.randInt(1000, 5000)
      for (const prop in kinematics.joints) {
        if (!kinematics.joints[prop].static) {
          const joint = kinematics.joints[prop]
          const old = start[prop]
          const position = old ? old : joint.zeroPosition
          start[prop] = position
          end[prop] = THREE.MathUtils.randInt(
            joint.limits.min,
            joint.limits.max
          )
        }
      }
      tween = new TWEEN.Tween(start).to(end, duration).easing(TWEEN.Easing.Quadratic.Out)
      tween.onUpdate(function (object) {
        for (const prop in kinematics.joints) {
          if (!kinematics.joints[prop].static) {
            kinematics.setJointValue(prop, object[prop]);
          }
        }

      });
      tween.start();
      setTimeout(setUpTween, duration);
    }
    function render() {
      renderer.render(scene, camera);
      TWEEN.update();
      requestAnimationFrame(render);
    }
  }, [])
  return (
    <>
      <div></div>
    </>
  )
}

export default App
