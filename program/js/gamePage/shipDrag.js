import Databus from "../databus"
import Drag from "../utils/drag"

const databus = new Databus()
const screenWidth = window.innerWidth
const screenHeight = window.innerHeight

//拖拽船，部署用

export default class ShipDrag extends Drag{
  constructor(ctx,src,width,height,x,y,id){
    super(ctx,src,width,height,x,y)
    this.id = id
  }

  static getShipDrag(id){
    databus.drags.forEach((drag)=>{
      if (drag.id == id)
        return drag
    })
  }

  stop(x,y){
    this.ismoving = false
    let block = -1
    //检查在哪一朵“虚拟云”上来判断放置格子位置
    databus.clouds.forEach((cloud)=>{
      if (cloud.isOn(x,y)){
        block = Math.abs(cloud.id)-1
      }
    })
    if (block == -1){
      //拖动失败，回到原点
      this.x = this.originX
      this.y = this.originY
      return {res:false}
    }
    if(block == databus.capitalInit || block == databus.screenInit1 || block == databus.screenInit2){
      this.x = this.originX
      this.y = this.originY
      return {res:false}
    }
    return {res:true,data:block,id:this.id}
  }

}