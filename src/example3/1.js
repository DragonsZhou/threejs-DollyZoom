import * as THREE from 'three';

import { GUI } from 'lil-gui';

import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let renderer, scene, camera;
let spotLight, lightHelper;
let widthC, heightC;

let curPos=1
function render() {
    const time = performance.now() / 3000;
    // console.log(time);
    spotLight.position.x = Math.cos(time) * 2.5;
    spotLight.position.z = Math.sin(time) * 1.5;
    lightHelper.update();
    if(curPos>=0)
    {
        curPos-=0.001  
        let tmp=DollyZoom(new THREE.Vector3(0,5,5),
            new THREE.Vector3(0,5,12),new THREE.Vector3(0,0,0),120,curPos)
        // oneDo(()=>{console.log(tmp);})
        camera.position.set(tmp.currentPoint.x,tmp.currentPoint.y,tmp.currentPoint.z)
        camera.fov=tmp.curFov
        camera.lookAt(tmp.lookat);
        camera.updateProjectionMatrix()
    }
    // oneDo(()=>{console.log(camera.position.z);console.log(camera.fov);}) 
    renderer.render(scene, camera);
}


// 外退内进（Dolly-out & Zoom-in）  curProgress: 0->1
// 外进内退（Dolly-in & Zoom-out）  curProgress: 1->0
// curProgress [0,1]
// nearFov[0,90]
function DollyZoom(nearPoint, farPoint,targetPos,nearFov,curProgress) {
    let line1=new THREE.Line3(nearPoint,farPoint)

    let targetPosProgress=line1.closestPointToPointParameter(targetPos)
    // console.log(targetPosProgress);
    let targetPoint=line1.at(targetPosProgress,new THREE.Vector3())
    // console.log(targetPoint);
    let line2=new THREE.Line3(nearPoint,targetPoint)
    let distance2=line2.distance()
    // console.log(distance2);

    let currentPoint=line1.at(curProgress,new THREE.Vector3())
    // console.log(currentPoint);
    let line3=new THREE.Line3(currentPoint,targetPoint)
    let distance3=line3.distance()
    // console.log(distance3);

    let radFov= nearFov/2  * Math.PI / 180
    let curFov = Math.atan( Math.tan(radFov) * distance2 /distance3) / Math.PI * 180 *2
    return  {
        currentPoint:currentPoint,
        curFov: curFov-2,
        // -2是为了修正偏差
        lookat:targetPoint,
    }
}



var oneDo = function () {
    let flag = true;
    return function (func, wait = 1000) {
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
    // callback — 每个可用帧都会调用的函数。 如果传入‘null’,所有正在进行的动画都会停止。
    renderer.setAnimationLoop(render);
    el.appendChild(renderer.domElement);



    scene = new THREE.Scene();
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
    const size = 10;
    const divisions = 10;
    const gridHelper = new THREE.GridHelper(size, divisions);
    scene.add(gridHelper);



    // 环境贴图
    //创建edr格式图像的加载器
    var textLoader = new EXRLoader()
    textLoader.load('example2/envtexture/086_hdrmaps_com_free_4K.exr', function (texture, textureData) {
        texture.minFilter = THREE.NearestFilter;//当一个纹素覆盖小于一个像素时，贴图将如何采样
        texture.magFilter = THREE.NearestFilter;//当一个纹素覆盖大于一个像素时，贴图将如何采样
        var material = new THREE.MeshBasicMaterial({
            map: texture,
            side:THREE.DoubleSide,
        });
        var geo = new THREE.SphereGeometry(300);
        var mesh = new THREE.Mesh(geo, material);
        scene.add(mesh)
    });

    

    
    // TODO
    camera = new THREE.PerspectiveCamera(20, widthC / heightC, 0.1, 650);
    camera.position.set(0, 7, 20);
    // camera.lookAt(0, 15, 0)
    camera.updateProjectionMatrix()


    // const controls = new OrbitControls(camera, renderer.domElement);
    // controls.minDistance = 2;
    // controls.maxDistance = 100;
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






    // 半球光
    const ambient = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 0.5);
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



    //加载模型
    let loaderM = new PLYLoader();
    loaderM.load('example2/env.ply', function (geometry) {
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



