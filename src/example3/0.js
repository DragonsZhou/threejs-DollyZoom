import * as THREE from 'three';

import { GUI } from 'lil-gui';

import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
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
    // if(camera.position.z>5)
    // {
    //     camera.position.z-=0.01
    //     camera.fov=DollyOutZoomIn(5,12,0,10,camera.position.z)
    //     camera.updateProjectionMatrix()
    // }
    // oneDo(()=>{console.log(camera.position.z);console.log(camera.fov);}) 
    renderer.render(scene, camera);

}
// 外退内进（Dolly-out & Zoom-in）和外进内退（Dolly-in & Zoom-out）
function DollyOutZoomIn(nearPoint, farPoint, nearFov, farFov, currentPos) {
    let s = (Math.atan(Math.tan(farFov) * farPoint / currentPos) / Math.PI) * 90
    // console.log(s);
    return s * 2
}
function DollyInZoomOut(nearPoint, farPoint, nearFov, farFov, currentPos) {
    let s = (Math.atan(Math.tan(farFov) * farPoint / currentPos) / Math.PI) * 90
    // console.log(s);
    return s * 2
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

    // scene.background = new THREE.CubeTextureLoader()
    //     .setPath('example2/sky/')
    //     .load(['dark-s_px.jpg', 'dark-s_nx.jpg', 'dark-s_py.jpg', 
    //     'dark-s_ny.jpg', 'dark-s_pz.jpg', 'dark-s_nz.jpg']);

    //创建hdr格式图像的加载器
    // var textLoader = new RGBELoader()
    //创建edr格式图像的加载器
    var textLoader = new EXRLoader()
    textLoader.load('example2/envtexture/086_hdrmaps_com_free_4K.exr', function (texture, textureData) {
        texture.minFilter = THREE.NearestFilter;//当一个纹素覆盖小于一个像素时，贴图将如何采样
        texture.magFilter = THREE.NearestFilter;//当一个纹素覆盖大于一个像素时，贴图将如何采样
        // texture.flipY = true;//翻转图像的Y轴以匹配WebGL纹理坐标空间,颠倒上下
        // scene.background=texture //也可以,但是看起来不舒服
        // 加载.hdr贴图范围的纹理对象Texture作为.map的属性值
        var material = new THREE.MeshBasicMaterial({
            map: texture,
            side:THREE.DoubleSide,
        });
        // textureData.width / textureData.height表示图像宽高比
        // 矩形几何体宽高比和图形的宽高比保持一致，避免图像显示伸缩
        var geo = new THREE.SphereGeometry(300);
        var mesh = new THREE.Mesh(geo, material);
        scene.add(mesh)
    });



    
    // TODO
    camera = new THREE.PerspectiveCamera(20, widthC / heightC, 0.1, 650);
    camera.position.set(0, 10, 20);
    camera.lookAt(0, 10, 0)
    camera.updateProjectionMatrix()


    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 2;
    controls.maxDistance = 100;
    controls.maxPolarAngle = Math.PI / 2;
    controls.target.set(0, 1, 0);
    controls.update();







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
    const ambient = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 0.15);
    scene.add(ambient);


    // 聚光灯
    spotLight = new THREE.SpotLight(0xffffff, 600);
    spotLight.position.set(2.5, 30, 1.5);
    spotLight.angle = Math.PI / 5;
    spotLight.penumbra = 0.3;
    spotLight.decay = 2;
    spotLight.distance = 0;
    spotLight.intensity = 250
    spotLight.map = textures['none'];
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
    // const geometry = new THREE.PlaneGeometry(200, 200);
    // const material = new THREE.MeshLambertMaterial({ color: 0xbcbcbc });
    // const mesh = new THREE.Mesh(geometry, material);
    // mesh.position.set(0, 0, 0);
    // mesh.rotation.x = - Math.PI / 2;
    // mesh.receiveShadow = true;
    // scene.add(mesh);


    // //背景面板
    // const geometryBG = new THREE.PlaneGeometry(100, 100);
    // let bgTexture = loaderT.load("bg.jpg")
    // // 纹理的放大缩小
    // bgTexture.minFilter = THREE.LinearFilter;
    // bgTexture.magFilter = THREE.LinearFilter;
    // // 纹理的颜色空间
    // bgTexture.colorSpace = THREE.SRGBColorSpace;
    // console.log(bgTexture);
    // const materialBG = new THREE.MeshLambertMaterial({ map: bgTexture });
    // const meshBG = new THREE.Mesh(geometryBG, materialBG);
    // meshBG.position.set(0, 2, -25);
    // // meshBG.rotation.x = - Math.PI / 2;
    // // meshBG.receiveShadow = true;
    // scene.add(meshBG);



    //加载模型
    let loaderM = new PLYLoader();

    // loaderM.load('example2/dolphins.ply', function (geometry) {

    //     geometry.computeVertexNormals();
    //     // geometry.scale(0.004, 0.004, 0.004);

    //     const material = new THREE.MeshStandardMaterial({ color: 0x009cff, flatShading: true });
    //     const mesh = new THREE.Mesh(geometry, material);
    //     mesh.position.y = 2;
    //     mesh.position.z = -3;
    //     mesh.rotation.x = - Math.PI / 2;
    //     mesh.scale.multiplyScalar(0.004);
    //     mesh.castShadow = true;
    //     mesh.receiveShadow = true;
    //     scene.add(mesh);

    // });

    loaderM.load('example2/env.ply', function (geometry) {

        geometry.scale(1.2, 1.2, 1);
        // 通过面片法向量的平均值计算每个顶点的法向量。
        geometry.computeVertexNormals();
        // 漫反射材质
        const material = new THREE.MeshLambertMaterial();

        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = - Math.PI / 2;
        mesh.rotation.z = -Math.PI * 0.2;
        // mesh.scale.multiplyScalar(0.8)
        // mesh.position.y = -0.5;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);

    });

    loaderM.load('example2/Lucy100k.ply', function (geometry) {

        geometry.scale(0.005, 0.005, 0.005);
        // 通过面片法向量的平均值计算每个顶点的法向量。
        geometry.computeVertexNormals();
        // 漫反射材质
        const material = new THREE.MeshLambertMaterial();

        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.y = - Math.PI / 1.3;
        mesh.position.y = 5;
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
        fov: 40,
    };
    gui.add(params, 'z', 30, 100).onChange(function (val) {
        camera.position.z = val
    });
    gui.add(params, 'fov', 20, 60).onChange(function (val) {
        camera.fov = val
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



