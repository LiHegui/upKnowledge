# Web3D / Three.js

[掘金同步更新](https://juejin.cn/column/7356517684820197403)

## 基础认知篇

## Q: Three.js 是什么？它与 WebGL 的关系是什么？

**A:**

**Three.js** 是基于 WebGL 封装的 JavaScript 3D 图形库，提供更高层次的抽象 API，让开发者无需直接操作底层 WebGL 即可创建复杂的 3D 场景。

| 维度 | WebGL | Three.js |
|------|-------|----------|
| 层次 | 底层图形 API | 基于 WebGL 的封装库 |
| 难度 | 需要了解 GLSL 着色器、缓冲区 | API 友好，上手快 |
| 控制粒度 | 完全掌控渲染管线 | 适度封装，灵活可扩展 |
| 适用场景 | 极致性能/自定义渲染 | 常规 3D 应用、可视化 |

Three.js 内部仍然调用 WebGL（或 WebGPU）来完成最终的渲染工作，本质上是 WebGL 的上层封装。

---

## Q: Three.js 的三大核心要素是什么？

**A:**

Three.js 构建 3D 场景的三大核心要素：

1. **Scene（场景）** — 3D 世界的容器，所有物体、光源都需要被添加到场景中
2. **Camera（相机）** — 决定从哪个视角观察场景，控制可视范围与投影方式
3. **Renderer（渲染器）** — 将场景和相机的信息绘制（渲染）到 `<canvas>` 元素上

```js
// 最小可运行 Demo
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 渲染循环
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
```

---

## Q: Three.js 使用的坐标系是什么？

**A:**

Three.js 使用**右手坐标系**：
- **X 轴**：向右为正
- **Y 轴**：向上为正
- **Z 轴**：朝向屏幕（面向观察者）为正

```
        Y
        |
        |
        +---- X
       /
      Z
```

> ⚠️ **注意**：部分 3D 工具（如 Blender 默认）使用 Z 轴朝上，导入模型时需注意坐标转换问题。`GLTFLoader` 已自动处理 glTF 格式的坐标系差异。

---

## 相机篇

## Q: PerspectiveCamera 和 OrthographicCamera 的区别？各自适用场景？

**A:**

| 维度 | PerspectiveCamera（透视相机） | OrthographicCamera（正交相机） |
|------|-------------------------------|-------------------------------|
| 投影方式 | 近大远小，模拟人眼透视 | 无透视畸变，等比缩放 |
| 参数 | fov、aspect、near、far | left、right、top、bottom、near、far |
| 适用场景 | 游戏、三维可视化、VR | CAD、2D 游戏、UI 叠加、等距视图 |

```js
// 透视相机：fov=视角(度), aspect=宽高比, near/far=裁剪面
const perspCam = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

// 正交相机：直接定义视锥体的六个面
const orthoCam = new THREE.OrthographicCamera(
  -width / 2, width / 2,   // left, right
  height / 2, -height / 2, // top, bottom
  0.1, 1000                 // near, far
);
```

---

## Q: 如何实现相机跟随目标运动？

**A:**

使用 `camera.lookAt()` 让相机朝向目标点，每帧更新即可：

```js
function animate() {
  requestAnimationFrame(animate);

  // 相机跟随目标（target 是一个 Object3D）
  camera.position.lerp(
    target.position.clone().add(new THREE.Vector3(0, 5, 10)),
    0.05  // 平滑插值系数
  );
  camera.lookAt(target.position);

  renderer.render(scene, camera);
}
```

也可以使用 `OrbitControls` 将 `target` 设置为跟随点：

```js
controls.target.copy(target.position);
controls.update();
```

---

## 几何体篇

## Q: BufferGeometry 和旧版 Geometry 有什么区别？

**A:**

Three.js r125 之后**完全移除了旧版 `Geometry`**，统一使用 `BufferGeometry`。

| 维度 | 旧版 Geometry | BufferGeometry |
|------|---------------|----------------|
| 数据存储 | JS 对象数组（`Vector3[]`） | 类型化数组（`Float32Array`） |
| 内存效率 | 低（装箱开销） | 高（直接映射 GPU 缓冲区） |
| 性能 | 较差 | 优秀 |
| 动态修改 | 方便 | 需手动设置 `needsUpdate = true` |

```js
// 使用 BufferGeometry 手动创建三角形
const geometry = new THREE.BufferGeometry();
const vertices = new Float32Array([
  -1, -1, 0,
   1, -1, 0,
   0,  1, 0,
]);
geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
```

---

## Q: 如何动态修改几何体顶点？

**A:**

```js
const geometry = new THREE.BufferGeometry();
const positions = geometry.attributes.position;

// 修改顶点
for (let i = 0; i < positions.count; i++) {
  positions.setY(i, Math.sin(i + time) * 0.5);
}

// 必须标记为需要更新，否则 GPU 不会刷新
positions.needsUpdate = true;

// 如果变形影响了包围盒，还需重新计算
geometry.computeBoundingSphere();
```

---

## 材质篇

## Q: Three.js 中常见材质类型有哪些？如何选择？

**A:**

| 材质 | 是否受光 | 特点 | 适用场景 |
|------|----------|------|---------|
| `MeshBasicMaterial` | ❌ | 纯色/贴图，无光照计算 | 调试、UI 元素 |
| `MeshLambertMaterial` | ✅ | 漫反射，性能好 | 低多边形风格 |
| `MeshPhongMaterial` | ✅ | 高光反射（Phong 模型） | 塑料、光滑表面 |
| `MeshStandardMaterial` | ✅ | PBR 金属度/粗糙度工作流 | 写实渲染主选 |
| `MeshPhysicalMaterial` | ✅ | 扩展 PBR，支持透明涂层/折射 | 玻璃、汽车漆 |
| `ShaderMaterial` | 自定义 | 完全自定义 GLSL 着色器 | 特效、自定义渲染 |

```js
// PBR 标准材质示例
const material = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  metalness: 0.8,  // 0=非金属, 1=纯金属
  roughness: 0.2,  // 0=光滑, 1=粗糙
  map: colorTexture,
  normalMap: normalTexture,
});
```

---

## Q: MeshStandardMaterial 和 MeshPhysicalMaterial 的区别？

**A:**

`MeshPhysicalMaterial` 继承自 `MeshStandardMaterial`，在其基础上增加了更高级的物理属性：

| 属性 | Standard | Physical |
|------|----------|---------|
| 金属度/粗糙度 | ✅ | ✅ |
| 环境遮蔽 | ✅ | ✅ |
| **透明涂层（Clearcoat）** | ❌ | ✅（汽车漆效果）|
| **折射/透射（Transmission）** | ❌ | ✅（玻璃效果）|
| **光泽（Sheen）** | ❌ | ✅（布料效果）|
| **虹彩（Iridescence）** | ❌ | ✅（肥皂泡效果）|
| 性能开销 | 中 | 较高 |

---

## 光照篇

## Q: Three.js 中有哪些光源类型？各自特点是什么？

**A:**

| 光源 | 特点 | 适用场景 |
|------|------|---------|
| `AmbientLight` | 全局均匀光，无方向，无阴影 | 基础环境光填充 |
| `DirectionalLight` | 平行光（模拟太阳），支持阴影 | 室外场景主光源 |
| `PointLight` | 点光源，向四周发散，有衰减 | 灯泡、火焰 |
| `SpotLight` | 聚光灯，圆锥形，支持阴影 | 舞台、手电筒 |
| `HemisphereLight` | 天空/地面双色渐变光 | 户外补光，模拟天光反弹 |
| `RectAreaLight` | 矩形面光源（需 `RectAreaLightUniformsLib`） | 荧光灯、LED 屏幕 |

```js
// 常用组合：环境光 + 平行光
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 5);
dirLight.castShadow = true;
scene.add(dirLight);
```

---

## Q: 如何在 Three.js 中开启阴影？

**A:**

开启阴影需要三步配置：

```js
// 1. 渲染器开启阴影映射
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 软阴影

// 2. 光源允许投射阴影（仅 DirectionalLight、SpotLight、PointLight 支持）
dirLight.castShadow = true;
// 调整阴影质量
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 500;

// 3. 物体设置投射/接收阴影
mesh.castShadow = true;    // 投射阴影
ground.receiveShadow = true; // 接收阴影
```

> ⚠️ **注意**：`AmbientLight` 和 `HemisphereLight` **不支持**阴影。阴影计算开销较大，线上项目需评估性能影响。

---

## 纹理篇

## Q: Three.js 中如何加载和使用纹理？

**A:**

```js
const textureLoader = new THREE.TextureLoader();

// 异步加载（推荐使用回调或 LoadingManager）
const texture = textureLoader.load(
  '/textures/color.jpg',
  (tex) => console.log('加载完成', tex),
  undefined,
  (err) => console.error('加载失败', err)
);

const material = new THREE.MeshStandardMaterial({
  map: texture,              // 颜色贴图
  normalMap: normalTexture,  // 法线贴图
  roughnessMap: roughTex,    // 粗糙度贴图
  aoMap: aoTexture,          // 环境遮蔽贴图
});
```

**常用纹理属性：**

```js
texture.wrapS = THREE.RepeatWrapping; // 水平方向重复
texture.wrapT = THREE.RepeatWrapping; // 垂直方向重复
texture.repeat.set(4, 4);             // 重复次数
texture.encoding = THREE.sRGBEncoding; // 颜色空间（颜色贴图需设置）
```

---

## Q: 什么是环境贴图（envMap）？如何实现反射效果？

**A:**

环境贴图通过将周围环境的图像投射到物体表面，模拟**镜面反射**或 **IBL（基于图像的照明）**。

```js
// 使用 RGBELoader 加载 HDR 环境贴图（推荐）
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { PMREMGenerator } from 'three';

const pmremGenerator = new PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

new RGBELoader().load('/env/studio.hdr', (texture) => {
  const envMap = pmremGenerator.fromEquirectangular(texture).texture;

  scene.environment = envMap; // 影响所有 PBR 材质的环境反射
  scene.background = envMap;  // 设置为背景（可选）

  texture.dispose();
  pmremGenerator.dispose();
});
```

---

## 加载器篇

## Q: Three.js 中如何加载 3D 模型？常用格式有哪些？

**A:**

| 格式 | 加载器 | 推荐程度 | 特点 |
|------|--------|---------|------|
| `.gltf` / `.glb` | `GLTFLoader` | ⭐⭐⭐⭐⭐ | Web 标准格式，支持动画/材质/骨骼 |
| `.fbx` | `FBXLoader` | ⭐⭐⭐ | 游戏行业通用，体积较大 |
| `.obj` + `.mtl` | `OBJLoader` + `MTLLoader` | ⭐⭐ | 简单模型，无动画支持 |
| `.draco` | `DRACOLoader`（配合 GLTFLoader）| ⭐⭐⭐⭐ | Google 压缩格式，大幅减小体积 |

```js
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/'); // Draco 解码器路径

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

loader.load('/models/character.glb', (gltf) => {
  const model = gltf.scene;
  scene.add(model);

  // 播放动画
  const mixer = new THREE.AnimationMixer(model);
  const action = mixer.clipAction(gltf.animations[0]);
  action.play();
});
```

---

## Q: 如何使用 LoadingManager 统一管理加载进度？

**A:**

```js
const manager = new THREE.LoadingManager(
  // onLoad：全部加载完成
  () => {
    console.log('所有资源加载完成');
    hideLoadingScreen();
  },
  // onProgress：每个资源加载时触发
  (url, loaded, total) => {
    const progress = (loaded / total) * 100;
    updateProgressBar(progress);
  },
  // onError
  (url) => console.error('加载失败:', url)
);

const textureLoader = new THREE.TextureLoader(manager);
const gltfLoader = new GLTFLoader(manager);
```

---

## 动画篇

## Q: Three.js 中如何实现动画？AnimationMixer 的作用是什么？

**A:**

Three.js 动画系统核心：**AnimationMixer（混合器）+ AnimationClip（动画片段）+ AnimationAction（动作）**

```js
// 创建混合器，绑定到模型根节点
const mixer = new THREE.AnimationMixer(model);

// 获取动画片段并创建 Action
const idleClip = THREE.AnimationClip.findByName(gltf.animations, 'idle');
const idleAction = mixer.clipAction(idleClip);
idleAction.play();

// 在渲染循环中更新（delta 是帧间时间差，单位秒）
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  mixer.update(delta); // 驱动动画播放
  renderer.render(scene, camera);
}
```

**动画过渡（crossFade）：**

```js
// 从 idle 平滑切换到 run，过渡时间 0.3 秒
idleAction.crossFadeTo(runAction, 0.3, true);
runAction.play();
```

---

## Q: Three.js 中如何用 Tween 实现补间动画？

**A:**

Three.js 本身不内置 Tween，通常搭配 **GSAP** 或 **tween.js** 使用：

```js
// 使用 GSAP（推荐）
import gsap from 'gsap';

// 让物体在 1 秒内平滑移动到目标位置
gsap.to(mesh.position, {
  x: 5,
  y: 2,
  duration: 1,
  ease: 'power2.out',
  onComplete: () => console.log('移动完成')
});

// 旋转动画
gsap.to(mesh.rotation, { y: Math.PI * 2, duration: 2, repeat: -1 });
```

---

## 交互篇

## Q: 如何在 Three.js 中实现鼠标点击选中 3D 物体（射线拾取）？

**A:**

使用 **`Raycaster`** 从相机投射射线，检测与场景物体的交叉点：

```js
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
  // 将鼠标坐标转换为 NDC（标准化设备坐标）
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // 从相机投射射线
  raycaster.setFromCamera(mouse, camera);

  // 检测交叉的物体（第二参数 true 表示递归检测子对象）
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    const hit = intersects[0]; // 最近的交叉点
    console.log('点击了:', hit.object.name);
    console.log('交叉点坐标:', hit.point);
    console.log('距离:', hit.distance);

    // 高亮选中物体
    hit.object.material.color.set(0xff0000);
  }
});
```

---

## Q: OrbitControls 的常用配置有哪些？

**A:**

```js
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const controls = new OrbitControls(camera, renderer.domElement);

// 启用/禁用
controls.enableDamping = true;  // 开启惯性阻尼（更平滑）
controls.dampingFactor = 0.05;

// 限制旋转角度
controls.minPolarAngle = 0;           // 最小仰角（0=正上方）
controls.maxPolarAngle = Math.PI / 2; // 最大仰角（地平线）

// 限制缩放范围
controls.minDistance = 2;
controls.maxDistance = 100;

// 禁用某些交互
controls.enablePan = false;   // 禁止平移
controls.enableZoom = false;  // 禁止缩放

// ⚠️ 开启 damping 时，必须在渲染循环中调用 update()
function animate() {
  requestAnimationFrame(animate);
  controls.update(); // 必须调用
  renderer.render(scene, camera);
}
```

---

## 性能优化篇

## Q: Three.js 有哪些常用的性能优化手段？

**A:**

**1. 合并几何体（减少 Draw Call）**
```js
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// 将多个相同材质的几何体合并为一个
const mergedGeo = mergeGeometries([geo1, geo2, geo3]);
const mesh = new THREE.Mesh(mergedGeo, sharedMaterial);
```

**2. 实例化渲染（大量相同物体）**
```js
// InstancedMesh 渲染 1000 个立方体只需 1 次 Draw Call
const count = 1000;
const instancedMesh = new THREE.InstancedMesh(geometry, material, count);

const matrix = new THREE.Matrix4();
for (let i = 0; i < count; i++) {
  matrix.setPosition(Math.random() * 100, 0, Math.random() * 100);
  instancedMesh.setMatrixAt(i, matrix);
}
instancedMesh.instanceMatrix.needsUpdate = true;
scene.add(instancedMesh);
```

**3. LOD（细节层次）**
```js
const lod = new THREE.LOD();
lod.addLevel(highDetailMesh, 0);    // 距离 0~50 使用高精度
lod.addLevel(midDetailMesh, 50);   // 距离 50~200 使用中等精度
lod.addLevel(lowDetailMesh, 200);  // 距离 200+ 使用低精度
scene.add(lod);
```

**4. 纹理优化**
- 纹理尺寸使用 2 的幂次（如 512、1024、2048）
- 使用压缩纹理格式（KTX2 + Basis Universal）
- 开启 mipmap：`texture.generateMipmaps = true`

**5. 其他优化**
- 关闭不需要的特性：`renderer.shadowMap.enabled = false`（不需要阴影时）
- 使用 `frustumCulled = true`（默认开启）自动裁剪视锥体外的物体
- 避免每帧创建新对象，复用 Vector3、Matrix4 等（减少 GC）
- 后处理效果按需加载，避免叠加过多 Pass

---

## Q: 如何正确释放 Three.js 资源，避免内存泄漏？

**A:**

Three.js 对象（几何体、材质、纹理）占用 GPU 内存，**GC 无法自动回收**，需要手动调用 `dispose()`：

```js
function disposeMesh(mesh) {
  // 1. 释放几何体
  mesh.geometry.dispose();

  // 2. 释放材质（材质可能被多个 Mesh 共享，注意引用计数）
  const material = mesh.material;
  if (Array.isArray(material)) {
    material.forEach(mat => disposeMaterial(mat));
  } else {
    disposeMaterial(material);
  }

  // 3. 从场景中移除
  scene.remove(mesh);
}

function disposeMaterial(material) {
  material.dispose();
  // 释放材质上的所有纹理
  Object.values(material).forEach((value) => {
    if (value instanceof THREE.Texture) {
      value.dispose();
    }
  });
}

// 销毁渲染器（页面关闭/组件卸载时）
renderer.dispose();
renderer.forceContextLoss(); // 强制释放 WebGL 上下文
```

---

## Shader 与高级篇

## Q: ShaderMaterial 和 RawShaderMaterial 的区别？

**A:**

| 维度 | ShaderMaterial | RawShaderMaterial |
|------|---------------|-------------------|
| 内置 Uniform | ✅ 自动注入（projectionMatrix、modelViewMatrix 等）| ❌ 全部需要手动声明 |
| 内置 Attribute | ✅ position、normal、uv 等自动可用 | ❌ 需要手动声明 |
| 灵活度 | 中等 | 最高 |
| 适用场景 | 大多数自定义 Shader 需求 | 极度优化或自定义渲染管线 |

```js
const material = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(0xff0000) }
  },
  vertexShader: `
    uniform float uTime;
    void main() {
      vec3 pos = position;
      pos.y += sin(pos.x + uTime) * 0.5;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    void main() {
      gl_FragColor = vec4(uColor, 1.0);
    }
  `
});

// 在渲染循环中更新 uniform
material.uniforms.uTime.value = clock.getElapsedTime();
```

---

## Q: 什么是后处理（Post-processing）？如何使用 EffectComposer？

**A:**

后处理是在场景渲染完成后，对最终图像进行额外处理的技术，常见效果有 Bloom（辉光）、SSAO（环境光遮蔽）、景深等。

```js
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const composer = new EffectComposer(renderer);

// 第一步：正常渲染场景
composer.addPass(new RenderPass(scene, camera));

// 第二步：添加 Bloom 效果
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,  // strength 强度
  0.4,  // radius 半径
  0.85  // threshold 阈值
);
composer.addPass(bloomPass);

// 渲染循环中用 composer 替代 renderer
function animate() {
  requestAnimationFrame(animate);
  composer.render(); // 替代 renderer.render(scene, camera)
}
```

---

## Q: 如何处理 Three.js 场景的自适应窗口大小？

**A:**

```js
function onResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  // 更新相机宽高比
  camera.aspect = width / height;
  camera.updateProjectionMatrix(); // 必须调用以使更改生效

  // 更新渲染器尺寸
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 限制 DPR 避免高分屏过度渲染
}

window.addEventListener('resize', onResize);
```
