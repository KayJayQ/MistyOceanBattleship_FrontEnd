import Sprite from "../base/sprite"
import Databus from "../databus"
import Slide from "../utils/slide"

const databus = new Databus()
const screenWidth = window.innerWidth
const screenHeight = window.innerHeight

//本类为跟随slide网格一起滑动的抽象类，需要进行实时坐标解算

//透视相对坐标算法：
//+----------> x 坐标: [0-1]
//|
//|
//|
//\/
//y 坐标 ：[0-1]
// 已网格左上角为坐标 <0，0> ，右下角为 <1，1>
//设原始正方形网格上的坐标为 <x，y>
//透视后的坐标 <x‘，y’> 为：
// { x'(x,y) = (43 + 355x - 43y) / (441 - 86y)
// { y'(y) = (335y) / (441 - 86y)
//例： 5x5的左上角正方形格子的中心的相对坐标为 <0.1，0.1>， 右上角正方形格子的中心的相对坐标为  <0.9，0.1>
//    透视后的坐标分别为  < x'(0.1,0.1), y'(0.1) >, 与 < x'(0.9,0.1), y'(0.1) > 

export default class SlideObject extends Slide{

  constructor(imgsrc="",width=0,height=0,x=0,y=0,master=true,alter=true,text=""){
    //这里传入的x,y为相对坐标，自动居中。如果对象在中间，那么x，y为2,2。偏移量额外传入
    super(imgsrc,width,height,x,y,master,alter,text)
    this.rx = x
    this.ry = y
    this.offx = 0
    this.offy = 0
    var trans = SlideObject.transform(this.rx,this.ry,this.width,this.height)
    this.x = trans['x']
    this.y = trans['y']
    this.originX = this.x
    this.originY = this.y
    
  }

  setOffset(x,y){
    //设定偏移量
    this.offx = x
    this.offy = y
    this.originX += this.offx
    this.originY += this.offy
    this.x = this.originX
    this.y = this.originY
  }

  static transform(ox,oy,width,height){

    ox = (ox*2+1)/10
    oy = (oy*2+1)/10

    let left = (screenWidth*0.2)/2
    let up = screenHeight*0.25
    let gridlen = screenWidth*0.8

    let tx = (43 + 355*ox - 43*oy) / (441 - 86*oy)
    let ty = (335*oy) / (441 - 86*oy)

    let x = left + gridlen*tx
    let y = up +gridlen*ty

    x = x - width/2
    y = y - height/2

    return {x:x,y:y}
  }

}