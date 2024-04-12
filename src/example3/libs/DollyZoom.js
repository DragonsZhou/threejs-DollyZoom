import * as THREE from 'three';
export class DollyZoom {
    // nearPoint, farPoint,targetPos: Vector3
    // targetPos为被观察物体的坐标
    nearPoint
    farPoint
    targetPos
    nearFov    // nearFov[0,90]

    constructor(nPoint, fPoint, tPos, nFov) {
        this.nearPoint = nPoint;
        this.farPoint = fPoint;
        this.targetPos = tPos;
        this.nearFov = nFov;
        this._init()
    }

    _line1
    _targetPoint
    _distance2
    _x
    _init() {
        this._line1 = new THREE.Line3(this.nearPoint, this.farPoint);
        let targetPosProgress = this._line1.closestPointToPointParameter(this.targetPos)
        this._targetPoint = this._line1.at(targetPosProgress, new THREE.Vector3())
        let line2 = new THREE.Line3(this.nearPoint, this._targetPoint)
        this._distance2 = line2.distance()

        let radFov = this.nearFov / 2 * Math.PI / 180
        this._x= Math.tan(radFov) * this._distance2
    }

    // 外退内进（Dolly-out & Zoom-in）  curProgress: 0->1
    // 外进内退（Dolly-in & Zoom-out）  curProgress: 1->0
    // curProgress [0,1]
    getCurrent(curProgress) {
        let currentPoint = this._line1.at(curProgress, new THREE.Vector3())
        let line3 = new THREE.Line3(currentPoint, this._targetPoint)
        let distance3 = line3.distance()
        
        let curFov = Math.atan(this._x/distance3) / Math.PI * 180 * 2
        return {
            currentPoint: currentPoint,
            curFov: curFov - 3,
            // -3是为了修正偏差
            lookat: this._targetPoint,
        }
    }
}

export class DollyOutZoomIn extends DollyZoom{
    curPos= 0
    spead = 0.005
    constructor(nPoint, fPoint, tPos, nFov){
        super(nPoint, fPoint, tPos, nFov)
    }
    reset(){
        this.curPos= 0
        this.spead = 0.005
    }
    defaultDollyOutZoomIn(camera) {
        if (this.curPos <= 1) {
            this.curPos += this.spead
            let tmp = this.getCurrent(this.curPos)
            camera.position.set(tmp.currentPoint.x, tmp.currentPoint.y, tmp.currentPoint.z)
            camera.fov = tmp.curFov
            camera.lookAt(tmp.lookat);
            camera.updateProjectionMatrix()
        }
    }
}
export class DollyInZoomOut extends DollyZoom{
    curPos= 1
    spead = 0.005
    constructor(nPoint, fPoint, tPos, nFov){
        super(nPoint, fPoint, tPos, nFov)
    }
    reset(){
        this.curPos= 1
        this.spead = 0.005
    }
    defaultDollyInZoomOut(camera) {
        if (this.curPos >= 0) {
            this.curPos -= this.spead
            let tmp = this.getCurrent(this.curPos)

            camera.position.set(tmp.currentPoint.x, tmp.currentPoint.y, tmp.currentPoint.z)
            camera.fov = tmp.curFov
            camera.lookAt(tmp.lookat);
            camera.updateProjectionMatrix()
        }
    }
}