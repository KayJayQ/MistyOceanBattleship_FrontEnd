import Sprite from "../base/sprite"
import Databus from "../databus"

const databus = new Databus()
const screenWidth = window.innerWidth
const screenHeight = window.innerHeight

//弹出气泡的抽象类。创建时根据模板创建一组标签并接受数据。失去焦点时删除所有相同类

export default class Bubble extends Sprite{
  constructor(imgsrc,width,height,x,y,isText,text,sort){
    super(imgsrc,width,height,x,y)
    this.isText = isText
    this.text = text
    this.sort = sort
    this.cx = -1
  }

  textStyle(size=20,color="#ffffff",font="Arial"){
    this.color = color
    this.font = size + "px " + font
  }

  clip(x,y,width,height){
    this.cx = x
    this.cy = y
    this.cw = width
    this.ch = height
  }

  render(ctx){
    if (this.isText){
      var tempColor = ctx.fillStyle
      var tempFont = ctx.font
      ctx.fillStyle = this.fillStyle
      ctx.font = this.font
      ctx.fillText(this.text,this.x,this.y)
      ctx.fillStyle = tempColor
      ctx.font = tempFont
    }else{
      if(this.cx >= 0){
        ctx.drawImage(this.img,this.cx,this.cy,this.cw,this.ch,this.x,this.y,this.width,this.height)
      }else{
        ctx.drawImage(this.img,this.x,this.y,this.width,this.height)
      }
    }
  }

  static checkFocus(x,y){
    //检查在焦点上的气泡类
    var sorts = []
    databus.bubbles.forEach((bubble)=>{
      if(bubble.isOn(x,y)){
        sorts.push(bubble.sort)
      }
    })
    for(var i=0;i<databus.bubbles.length;i++){
      if(sorts.indexOf(databus.bubbles[i].sort) == -1){
        databus.bubbles.splice(i,1)
        i--
      }
    }
  }


}