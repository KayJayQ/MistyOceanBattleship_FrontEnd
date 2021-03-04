import { canvas } from "../libs/weapp-adapter"

const screenWidth = window.innerWidth
const screenHeight = window.innerHeight

/**
 * 主页案件
 */
export default class Button {
  constructor(that,width,height,x,y,text="Default") {
    //注意！把调用源用that存起来！不然找不到
    this.that = that
    this.text = text
    this.width = width
    this.height = height
    this.x = x
    this.y = y
  }

  render(ctx) {
    ctx.fillStyle = "#ffffff"
    let fontsize = Math.floor(screenHeight/50+4)
    ctx.font      = fontsize + "px Arial"
    ctx.fillText(this.text,this.x+5,this.y+this.height*0.7)
  }

  isOn(x,y){
    //判断点击是否在区域内
    if(this.x <= x && x <= this.x+this.width && this.y <= y && y <= this.y+this.height){
      return true
    }else{
      return false
    }
  }

  action(){
    console.log("Undefined Action",this.that)
  }

}
 