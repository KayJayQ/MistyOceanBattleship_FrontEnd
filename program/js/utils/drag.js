import Label from "./label"
import Databus from "../databus"

const databus = new Databus()
const screenWidth = window.innerWidth
const screenHeight = window.innerHeight

//拖拽类，默认位船、卡牌使用

export default class Drag extends Label{

  constructor(ctx,src,width,height,x,y){
    super(ctx,src,width,height,x,y,false,"")
    this.originX = x
    this.originY = y
    //记录触摸相对位置
    this.rx = 0
    this.ry = 0
    this.ismoving = false
  }

  start(x,y){
    this.ismoving = true
    //当点击到对象
    this.rx = (x - this.x) / this.width
    this.ry = (y - this.y) / this.height
  }

  moving(x,y){
    //拖动中
    this.x = x - this.rx * this.width
    this.y = y - this.ry * this.height
  }

  stop(x,y){
    this.ismoving = false
    //待重载，判断释放条件
    this.x = this.originX
    this.y = this.originY
  }

  render(ctx){
    ctx.drawImage(this.img,this.x,this.y,this.width,this.height)
  }

}