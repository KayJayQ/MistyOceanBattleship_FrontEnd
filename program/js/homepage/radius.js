import Sprite from "../base/sprite"
import Databus from "../databus"

const databus = new Databus()
const screenWidth = window.innerWidth
const screenHeight = window.innerHeight

//单选按钮类

export default class Radius extends Sprite{
  constructor(imgSrc,width,height,x,y,group="",init=true,id=0){
    //init,status为状态 +1为选择，-1为未选择
    super(imgSrc,width,height,x,y)
    this.group = group
    this.status = init
    this.cuts = [{},{}]
    this.id = id
  }

  action(){
    //留空，用于重载
  }

  static switch(that){
    //同组选项排他性选择
    let group = that.group
    databus.radiuses.forEach((radius)=>{
      if(radius.group == group){
        radius.status = -1
      }
    })
    that.status = 1
  }

  clickOn(){
    //被点击后
    Radius.switch(this)
    this.action()
  }

  static setClip(group,label,x,y,width,height){
    databus.radiuses.forEach((radius)=>{
      if(label){
        radius.cuts[0] = {x:x,y:y,width:width,height:height}
      }else{
        radius.cuts[1] = {x:x,y:y,width:width,height:height}
      }
    })
  }

  render(ctx){
    let i = 0
    if (this.status < 0){i = 1}
    ctx.drawImage(this.img,this.cuts[i].x,this.cuts[i].y,this.cuts[i].width,this.cuts[i].height,this.x,this.y,this.width,this.height)
  }
}