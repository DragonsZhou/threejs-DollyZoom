export  class MinMaxGUIHelper {
  constructor(obj, minProp, maxProp, minDif) {
    this.obj = obj;
    this.minProp = minProp;
    this.maxProp = maxProp;
    this.minDif = minDif;
  }
  get min() {
    return this.obj[this.minProp];
  }
  set min(v) {
    if(this.obj[this.maxProp]>v + this.minDif)
      this.obj[this.minProp] = v;
  }
  get max() {
    return this.obj[this.maxProp];
  }
  set max(v) {
    if(this.obj[this.minProp]< v - this.minDif)
      this.obj[this.maxProp] = v;
  }
}
