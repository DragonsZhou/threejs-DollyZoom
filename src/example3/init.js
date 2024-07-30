import * as THREE from 'three';


import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { DollyZoom, DollyInZoomOut, DollyOutZoomIn } from './libs/DollyZoom.js';

let renderer, scene, camera;
let widthC, heightC;




let dizo = new DollyOutZoomIn(new THREE.Vector3(0, 5, 5),
    new THREE.Vector3(0, 5, 30), new THREE.Vector3(0, 0, 0), 120)
dizo.reset()
function render() {
    dizo.defaultDollyOutZoomIn(camera)
    renderer.render(scene, camera);
}



export function init(el, width, height) {
    widthC = width;
    heightC = height;

    // 创建渲染器
    // antialias - 是否执行抗锯齿。默认为false.
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    // 如果设置开启，允许在场景中使用阴影贴图。默认是 false。
    renderer.shadowMap.enabled = true;
    // 定义阴影贴图类型 (未过滤, 关闭部分过滤, 关闭部分双线性过滤), 
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // 色调映射的曝光级别。默认是1
    renderer.toneMappingExposure = 1;
    el.appendChild(renderer.domElement);



    scene = new THREE.Scene();

    // const axesHelper = new THREE.AxesHelper(5);
    // scene.add(axesHelper);
    // const size = 10;
    // const divisions = 10;
    // const gridHelper = new THREE.GridHelper(size, divisions);
    // scene.add(gridHelper);



    // 球形环境贴图
    //创建edr格式图像的加载器
    var textLoader = new EXRLoader()
    textLoader.load('example2/envtexture/086_hdrmaps_com_free_4K.exr', function (texture, textureData) {
        texture.minFilter = THREE.NearestFilter;//当一个纹素覆盖小于一个像素时，贴图将如何采样
        texture.magFilter = THREE.NearestFilter;//当一个纹素覆盖大于一个像素时，贴图将如何采样
        var material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
        });
        var geo = new THREE.SphereGeometry(300);
        var mesh = new THREE.Mesh(geo, material);
        scene.add(mesh)
    });


    // TODO
    camera = new THREE.PerspectiveCamera(20, widthC / heightC, 0.1, 650);
    // camera.position.set(0, 7, 20);
    dizo.defaultDollyOutZoomIn(camera)
    camera.updateProjectionMatrix()


    // 半球光
    const ambient = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 0.5);
    scene.add(ambient);


    //加载模型
    let loaderM = new PLYLoader();
    loaderM.load('example2/temple.ply', function (geometry) {
        geometry.scale(1.2, 1.2, 1);
        // 通过面片法向量的平均值计算每个顶点的法向量。
        geometry.computeVertexNormals();

        // 漫反射材质
        const material = new THREE.MeshLambertMaterial();

        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = - Math.PI / 2;
        mesh.rotation.z = -Math.PI * 0.2;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);

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
            renderer.render(scene, camera);
            setTimeout(() => {
                // callback — 每个可用帧都会调用的函数。 如果传入‘null’,所有正在进行的动画都会停止。
                renderer.setAnimationLoop(render);
            }, 3000)
        });
    });
    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    camera.aspect = widthC / heightC;
    camera.updateProjectionMatrix();
    renderer.setSize(widthC, heightC);
}

