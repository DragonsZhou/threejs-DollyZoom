import * as THREE from 'three';

import { GUI } from 'lil-gui';

import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


let renderer, scene, camera;
let spotLight, lightHelper;

let widthC, heightC;
// init();
function render() {
    const time = performance.now() / 3000;
    // console.log(time);
    spotLight.position.x = Math.cos(time) * 2.5;
    spotLight.position.z = Math.sin(time) * 1.5;
    lightHelper.update();
    if(camera.position.z>5)
    {
        camera.position.z-=0.01
        camera.fov=DollyZoom(5,12,0,10,camera.position.z)
        camera.updateProjectionMatrix()
    }
    // oneDo(()=>{console.log(camera.position.z);console.log(camera.fov);}) 
    renderer.render(scene, camera);
    
}
function DollyZoom(nearPoint,farPoint,nearFov,farFov,currentPos){
    let s=(Math.atan(Math.tan(farFov)*farPoint/currentPos)/Math.PI)*90
    // console.log(s);
    return s*2
}

var oneDo = function () {
    let flag = true;
    return function (func, wait = 100) {
        if (flag) {
            flag = false
            func()
            setTimeout(() => {
                flag = true
            }, wait)
        }
    }
}()

function onWindowResize() {
    camera.aspect = widthC / heightC;
    camera.updateProjectionMatrix();
    renderer.setSize(widthC, heightC);
}

export function init(el, width, height) {
    widthC = width;
    heightC = height;

    // antialias - 是否执行抗锯齿。默认为false.
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    el.appendChild(renderer.domElement);

    // 如果设置开启，允许在场景中使用阴影贴图。默认是 false。
    renderer.shadowMap.enabled = true;
    // 定义阴影贴图类型 (未过滤, 关闭部分过滤, 关闭部分双线性过滤), 
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // 色调映射的曝光级别。默认是1
    renderer.toneMappingExposure = 1;

    // callback — 每个可用帧都会调用的函数。 如果传入‘null’,所有正在进行的动画都会停止。
    renderer.setAnimationLoop(render);



    scene = new THREE.Scene();



    // TODO
    camera = new THREE.PerspectiveCamera( 20, widthC / heightC, 0.1, 100 );
    camera.position.set( 0, 2, 12);
    

    // const controls = new OrbitControls(camera, renderer.domElement);
    // controls.minDistance = 2;
    // controls.maxDistance = 10;
    // controls.maxPolarAngle = Math.PI / 2;
    // controls.target.set(0, 1, 0);
    // controls.update();





    const loaderT = new THREE.TextureLoader().setPath('example2/');
    const filenames = ['disturb.jpg', 'colors.png', 'uv_grid_opengl.jpg'];
    const textures = { none: null };
    for (let i = 0; i < filenames.length; i++) {
        const filename = filenames[i];
        const texture = loaderT.load(filename);
        // 纹理的放大缩小
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        // 纹理的颜色空间
        texture.colorSpace = THREE.SRGBColorSpace;
        textures[filename] = texture;
    }



    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
    const size = 10;
    const divisions = 10;
    const gridHelper = new THREE.GridHelper(size, divisions);
    scene.add(gridHelper);


    // 半球光
    // const ambient = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 0.15);
    // scene.add(ambient);

    // 聚光灯
    spotLight = new THREE.SpotLight(0xffffff, 100);
    spotLight.position.set(2.5, 8, 1.5);
    spotLight.angle = Math.PI / 5;
    spotLight.penumbra = 0.3;
    spotLight.decay = 2;
    spotLight.distance = 0;
    spotLight.intensity = 250
    spotLight.map = textures['disturb.jpg'];
    spotLight.castShadow = true;

    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 10;
    spotLight.shadow.focus = 1;
    scene.add(spotLight);

    lightHelper = new THREE.SpotLightHelper(spotLight);
    scene.add(lightHelper);



    //底部面板
    const geometry = new THREE.PlaneGeometry(200, 200);
    const material = new THREE.MeshLambertMaterial({ color: 0xbcbcbc });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, 0);
    mesh.rotation.x = - Math.PI / 2;
    mesh.receiveShadow = true;
    scene.add(mesh);



    //加载模型
    let loaderM = new PLYLoader();
    loaderM.load('example2/dolphins.ply', function (geometry) {

        geometry.computeVertexNormals();
        // geometry.scale(0.004, 0.004, 0.004);

        const material = new THREE.MeshStandardMaterial({ color: 0x009cff, flatShading: true });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 2;
        mesh.position.z = -1;
        mesh.rotation.x = - Math.PI / 2;
        mesh.scale.multiplyScalar(0.004);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);

    });
    loaderM.load('example2/Lucy100k.ply', function (geometry) {

        geometry.scale(0.0024, 0.0024, 0.0024);
        // 通过面片法向量的平均值计算每个顶点的法向量。
        geometry.computeVertexNormals();
        // 漫反射材质
        const material = new THREE.MeshLambertMaterial();

        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.y = - Math.PI / 1.3;
        mesh.position.y = 1.8;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);

    });

    window.addEventListener('resize', onWindowResize);



    // GUI
    const gui = new GUI();

    const params = {
        map: textures['disturb.jpg'],
        color: spotLight.color.getHex(),
        intensity: spotLight.intensity,
        distance: spotLight.distance,
        angle: spotLight.angle,
        penumbra: spotLight.penumbra,
        decay: spotLight.decay,
        focus: spotLight.shadow.focus,
        shadows: true,
        z: 5,
        fov:40,
    };
    gui.add(params, 'z', 5, 10).onChange(function (val) {
        camera.position.z = val
    });
    gui.add(params, 'fov', 20, 60).onChange(function (val) {
        camera.fov=val
        camera.updateProjectionMatrix();
    });

    gui.add(params, 'map', textures).onChange(function (val) {
        spotLight.map = val;
    });
    gui.addColor(params, 'color').onChange(function (val) {
        spotLight.color.setHex(val);
    });
    gui.add(params, 'intensity', 0, 500).onChange(function (val) {
        spotLight.intensity = val;
    });
    gui.add(params, 'distance', 0, 20).onChange(function (val) {
        spotLight.distance = val;
    });
    gui.add(params, 'angle', 0, Math.PI / 3).onChange(function (val) {
        spotLight.angle = val;
    });
    gui.add(params, 'penumbra', 0, 1).onChange(function (val) {
        spotLight.penumbra = val;
    });
    gui.add(params, 'decay', 1, 2).onChange(function (val) {
        spotLight.decay = val;
    });
    gui.add(params, 'focus', 0, 1).onChange(function (val) {
        spotLight.shadow.focus = val;
    });
    gui.add(params, 'shadows').onChange(function (val) {
        renderer.shadowMap.enabled = val;
        scene.traverse(function (child) {
            if (child.material) {
                child.material.needsUpdate = true;
            }
        });
    });
    gui.open();
}



