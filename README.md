# web-ta
本项目基于vue3+webpack，使用threejs实现了一些效果

## 项目介绍：
1. src/exmaple1、src/exmaple2只是简单的实验;
2. src/example3中实现了Dolly Zoom（希区柯克变焦）(src/example3/libs/DollyZoom.js)，以及三维三次贝塞尔曲线的封装已实现空间环绕（src/example3/libs/MyCubicBezierCurve3.js）；
3. static/* 下面是一些静态文件，例如模型、模型解码器，主要是从网上寻找的，例如：threejs官网。

## 参考：
1. [什么是希区柯克变焦（Dolly Zoom）](https://www.zhihu.com/tardis/zm/art/356522997?source_id=1005)
2. [threejs](https://threejs.org/)


效果：
[在threejs中实现DollyZoom（希区柯克变焦）](https://blog.csdn.net/ztllll007/article/details/137676346)


## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

