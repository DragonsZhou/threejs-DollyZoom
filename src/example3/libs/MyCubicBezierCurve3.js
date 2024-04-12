import * as THREE from 'three';
export class MyCubicBezierCurve3 {
    startPoint
    onePoint
    twoPoint
    endPoint
    targetPoint
    startFov
    
    constructor(startPoint, onePoint, twoPoint, ePoint, targetPoint, startFov) {
        this.startPoint = startPoint
        this.onePoint = onePoint
        this.twoPoint = twoPoint
        this.endPoint = ePoint
        this.targetPoint = targetPoint
        this.startFov = startFov
        this._init()
    }
    _curve
    _x
    _init() {
        this.curve = new THREE.CubicBezierCurve3(
            this.startPoint,
            this.onePoint,
            this.twoPoint,
            this.endPoint,
        );
   
        let line = new THREE.Line3(this.startPoint, this.targetPoint);
        let radFov = this.startFov /2 / 180 * Math.PI;
        this._x= Math.tan(radFov) * line.distance();
    }
    getCurrent(curProgress) {
        let curPoint = this.curve.getPointAt(curProgress)
        let distance =new THREE.Line3(curPoint,this.targetPoint).distance()
        let curFov=Math.atan(this._x/distance)/Math.PI * 180 *2
        return {
            currentPoint: curPoint,
            curFov: curFov - 2,
            // -2是为了修正偏差
            lookat: this.targetPoint,
        }
    }
}
