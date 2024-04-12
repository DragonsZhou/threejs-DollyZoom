import * as THREE from 'three';
import { MinMaxGUIHelper } from "./MinMaxGUIHelper"
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
export default function (el) {

    // stats查看threejs渲染帧率
    const stats = new Stats();
    el.appendChild(stats.dom);

    // 渲染器
    // const renderer = new THREE.WebGLRenderer();
    let renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        //想把canvas画布上内容下载到本地，需要设置为true
        preserveDrawingBuffer: true,
        // 设置对数深度缓冲区，优化深度冲突问题
        // 有一点要注意，当两个面间隙过小，或者重合，你设置webgl渲染器对数深度缓冲区也是无效的。
        logarithmicDepthBuffer: true
    });
    // 通过Three.js渲染一个模型的时候，不希望canvas画布有背景颜色，也就是canvas画布完全透明，
    // 可以透过canvas画布看到画布后面叠加的HTML元素图文，
    // 呈现出来一种三维模型悬浮在网页上面的效果。
    renderer.setClearAlpha(0.8); //.setClearAlpha(0)==alpha: true

    // renderer.setSize(800, 800);
    // 设置设备像素比
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color('lightgrey'), 0)

    //4————————设置渲染器，允许光源阴影渲染
    // WebGL的渲染器的阴影贴图属性.shadowMap的属性值是一个对象，.shadowMap具有.enabled、.type等属性。
    // 设置.shadowMap.enabled=true允许WebGL渲染器渲染阴影。
    renderer.shadowMap.enabled = true;





    /* 摄像机 */
    // fov  aspect  near  far
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1, 10);
    window.addEventListener('resize', function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    })
    // 摄像机控件
    function updateCamera() {
        camera.updateProjectionMatrix();
    }


    const gui = new GUI();
    gui.add(camera, 'fov', 1, 180).onChange(updateCamera);
    const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
    gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
    gui.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far').onChange(updateCamera);


    // 相机控件OrbitControls，相机控件轨道控制器OrbitControls，
    // 可以通过相机控件OrbitControls实现旋转缩放预览效果。
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.5, 0);
    controls.enablePan = true;//启用或禁用摄像机平移，默认为true。
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI / 2;
    controls.update();




    // 场景
    const scene = new THREE.Scene();


    // AxesHelper：辅助观察的坐标系
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // 添加一个辅助网格地面
    const gridHelper = new THREE.GridHelper(300, 25, 0x004444, 0x004444);
    scene.add(gridHelper);




    // // 光照
    //  半球光
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 1);
    hemiLight.position.set(0, 20, 0);
    const helper = new THREE.HemisphereLightHelper(hemiLight, 5);
    scene.add(helper);
    scene.add(hemiLight);
    //  平行光
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(- 3, 10, - 10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 2;
    dirLight.shadow.camera.bottom = - 2;
    dirLight.shadow.camera.left = - 2;
    dirLight.shadow.camera.right = 2;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 40;
    scene.add(dirLight);
    const helper1 = new THREE.DirectionalLightHelper(dirLight, 5);
    scene.add(helper1);



    // 模型
    const geometry = new THREE.PlaneGeometry(10, 10);
    // 材质
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    // 网格
    const planeMesh = new THREE.Mesh(geometry, material);
    planeMesh.rotateX(-Math.PI / 2);
    planeMesh.position.set(0, 0, 0)
    planeMesh.receiveShadow = true;
    scene.add(planeMesh);


    // 创建STL加载器
    // let fbxLoader = new FBXLoader();
    // fbxLoader.load('./Branches/Branches in Vases.FBX',
    //     obj => {
    //         obj.scale.set(0.1,0.1,0.1)
    //         scene.add(obj);
    //         console.log(obj);
    //     })





    // 模型解码器
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('jsm/libs/draco/gltf/');
    // dracoLoader.preload(); //初始化_initDecoder 

    // 模型加载器
    let animationMixer;
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader); //gltfloader使用dracoLoader
    loader.load('example1/vase.gltf', function (gltf) {
        const model = gltf.scene;
        // console.log(gltf);
        console.log(model);
        model.traverse(function (obj) {

            if (obj.isMesh) {//判断是否是网格模型
                // 1————————模型阴影投射属性.castShadow设置产生阴影的模型对象
                // 设置产生阴影的模型对象
                obj.castShadow = true
                //3————————模型阴影接收属性.receiveShadow
                // 模型阴影接收属性.castShadow设置接收阴影的模型对象
                obj.receiveShadow = true;
            }
        })
        // model.castShadow = true
        // model.receiveShadow = true;

        // SkeletonHelper会可视化参数模型对象所包含的所有骨骼关节
        const skeletonHelper = new THREE.SkeletonHelper(model);
        model.add(skeletonHelper);



        model.position.set(0, 0, 0);
        model.scale.set(20, 20, 20);
        scene.add(model);
        // console.log(gltf.animations.length); 4
        // animationMixer = new THREE.AnimationMixer(model);
        // animationMixer.clipAction(gltf.animations[3]).play();
        animate();
    }, undefined, function (e) {
        console.error(e);
    });
    
    const clock = new THREE.Clock();
    animate()
    function animate() {
        stats.update();
        requestAnimationFrame(animate);

        const delta = clock.getDelta();
        // animationMixer.update(delta);
        controls.update();
        renderer.render(scene, camera);
    }
    renderer.domElement.style.zIndex = 2
    el.appendChild(renderer.domElement);
}