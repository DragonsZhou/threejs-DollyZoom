"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = init;

var THREE = _interopRequireWildcard(require("three"));

var _PLYLoader = require("three/examples/jsm/loaders/PLYLoader.js");

var _EXRLoader = require("three/examples/jsm/loaders/EXRLoader.js");

var _DollyZoom = require("./libs/DollyZoom.js");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var renderer, scene, camera;
var widthC, heightC;
var dizo = new _DollyZoom.DollyOutZoomIn(new THREE.Vector3(0, 5, 5), new THREE.Vector3(0, 5, 30), new THREE.Vector3(0, 0, 0), 120);
dizo.reset();

function render() {
  dizo.defaultDollyOutZoomIn(camera);
  renderer.render(scene, camera);
}

function init(el, width, height) {
  widthC = width;
  heightC = height; // 创建渲染器
  // antialias - 是否执行抗锯齿。默认为false.

  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height); // 如果设置开启，允许在场景中使用阴影贴图。默认是 false。

  renderer.shadowMap.enabled = true; // 定义阴影贴图类型 (未过滤, 关闭部分过滤, 关闭部分双线性过滤), 

  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; // 色调映射的曝光级别。默认是1

  renderer.toneMappingExposure = 1;
  el.appendChild(renderer.domElement);
  scene = new THREE.Scene(); // const axesHelper = new THREE.AxesHelper(5);
  // scene.add(axesHelper);
  // const size = 10;
  // const divisions = 10;
  // const gridHelper = new THREE.GridHelper(size, divisions);
  // scene.add(gridHelper);
  // 球形环境贴图
  //创建edr格式图像的加载器

  var textLoader = new _EXRLoader.EXRLoader();
  textLoader.load('example2/envtexture/086_hdrmaps_com_free_4K.exr', function (texture, textureData) {
    texture.minFilter = THREE.NearestFilter; //当一个纹素覆盖小于一个像素时，贴图将如何采样

    texture.magFilter = THREE.NearestFilter; //当一个纹素覆盖大于一个像素时，贴图将如何采样

    var material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide
    });
    var geo = new THREE.SphereGeometry(300);
    var mesh = new THREE.Mesh(geo, material);
    scene.add(mesh);
  }); // TODO

  camera = new THREE.PerspectiveCamera(20, widthC / heightC, 0.1, 650); // camera.position.set(0, 7, 20);

  dizo.defaultDollyOutZoomIn(camera);
  camera.updateProjectionMatrix(); // 半球光

  var ambient = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 0.5);
  scene.add(ambient); //加载模型

  var loaderM = new _PLYLoader.PLYLoader();
  loaderM.load('example2/temple.ply', function (geometry) {
    geometry.scale(1.2, 1.2, 1); // 通过面片法向量的平均值计算每个顶点的法向量。

    geometry.computeVertexNormals(); // 漫反射材质

    var material = new THREE.MeshLambertMaterial();
    var mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.z = -Math.PI * 0.2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    loaderM.load('example2/Lucy100k.ply', function (geometry) {
      geometry.scale(0.005, 0.005, 0.005); // 通过面片法向量的平均值计算每个顶点的法向量。

      geometry.computeVertexNormals(); // 漫反射材质

      var material = new THREE.MeshLambertMaterial();
      var mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.y = -Math.PI / 1.3;
      mesh.position.y = 5;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      renderer.render(scene, camera);
      setTimeout(function () {
        // callback — 每个可用帧都会调用的函数。 如果传入‘null’,所有正在进行的动画都会停止。
        renderer.setAnimationLoop(render);
      }, 3000);
    });
  });
  window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
  camera.aspect = widthC / heightC;
  camera.updateProjectionMatrix();
  renderer.setSize(widthC, heightC);
}