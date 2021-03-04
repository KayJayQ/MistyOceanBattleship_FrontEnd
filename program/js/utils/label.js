import Sprite from  "../base/sprite"

const screenWidth  = window.innerWidth
const screenHeight = window.innerHeight

export default class Label extends Sprite{

  constructor(ctx,src="",width=0,height=0,x=0,y=0,isText=false,text=""){
    super(src,width,height,x,y)
    this.ctx = ctx
    if (isText){
      this.isText = true
      this.text = text
      ctx.fillStyle = "#ffffff"
      ctx.font      = "20px Arial"
      this.font = ctx.font
      this.fillStyle = ctx.fillStyle
    }else{
      this.isText = false
      this.text = text
    }
    this.cx = -1
  }

  clip(x,y,width,height){
    this.cx = x
    this.cy = y
    this.cw = width
    this.ch = height
  }

  textStyle(size=20,color="#ffffff",font="Arial"){
    this.color = color
    this.font = size + "px " + font
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

}