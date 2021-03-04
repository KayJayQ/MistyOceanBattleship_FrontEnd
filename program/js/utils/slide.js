import Sprite from "../base/sprite"
import Databus from "../databus"

const databus = new Databus()
const screenWidth = window.innerWidth
const screenHeight = window.innerHeight

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

export default class Slide extends Sprite{
  //可切换对象

  //设定初始屏幕
  static currentScreen = -1
  
  constructor(imgsrc="",width=0,height=0,x=0,y=0,master=true,alter=true,text=""){
    super(imgsrc,width,height,x,y)
    if(text == ""){
      this.isText = false
    }else{
      this.text = text
      this.isText = true
      this.color = "#ffffff"
      this.font = "20px Arial"
    }

    //切换相关

    //在主屏、副屏是否显示
    this.master = master
    this.alter = alter

    //正在移动
    this.isMoving = false
    //移动进度
    this.step = 0
    //移动速度
    this.speed = 30
    //移动阶段
    this.stage = 0 //0中立位，无意义。-1向左消失，-2向左出现。1向右消失，2向右出现。

    

    //原始位置储存
    this.originX = this.x
    this.originY = this.y

  }

  static switch(){
    //开始切换
    if(Slide.currentScreen == -1){
      //切换到副屏
      databus.slides.forEach((slide)=>{
        slide.isMoving = true
        slide.step = 0
        slide.stage = -1
      })
      databus.clouds.forEach((slide)=>{
        slide.isMoving = true
        slide.step = 0
        slide.stage = -1
      })
      databus.ships.forEach((slide)=>{
        slide.isMoving = true
        slide.step = 0
        slide.stage = -1
      })
    }else{
      //切换到主屏
      databus.slides.forEach((slide)=>{
        slide.isMoving = true
        slide.step = 0
        slide.stage = 1
      })
      databus.clouds.forEach((slide)=>{
        slide.isMoving = true
        slide.step = 0
        slide.stage = 1
      })
      databus.ships.forEach((slide)=>{
        slide.isMoving = true
        slide.step = 0
        slide.stage = 1
      })
    }

  }

  textStyle(size=20,color="#ffffff",font="Arial"){
    this.color = color
    this.font = size + "px " + font
  }

  renderStatic(ctx){
    let goon = false
    if(Slide.currentScreen == -1 && this.master){
      goon = true
    }
    if (Slide.currentScreen == 1 && this.alter){
      goon = true
    }
    if(!goon){return}
    if(!this.isText){
      this.drawToCanvas(ctx)
    }else{
      var tempColor = ctx.fillStyle
      var tempFont = ctx.font
      ctx.fillStyle = this.fillStyle
      ctx.font = this.font
      ctx.fillText(this.text,this.x,this.y)
      ctx.fillStyle = tempColor
      ctx.font = tempFont
    }
  }

  render(ctx){
    if(!this.isMoving){
      //不在切换中就直接渲染
      this.renderStatic(ctx)
      return
    }
    //否则就渲染滑动
    if(this.stage <= -1){
      //处理切换到副屏
      if(this.stage == -1){
        this.step++
        this.x = this.x - (screenWidth/this.speed)*this.step
        this.renderStatic(ctx)
        if(this.x < -1 * screenWidth){
          this.step = 0
          this.stage = -2
          Slide.currentScreen = 1
        }
      }else{
        this.step++
        this.x = this.originX + screenWidth - (screenWidth/this.speed)*this.step
        this.renderStatic(ctx)
        if(Math.abs(this.originX-this.x) < 10){
          this.step = 0
          this.stage = 0
          this.x = this.originX
          this.y = this.originY
          this.isMoving = false
        }
      }
    }else{
      //处理滑动到主屏
      if(this.stage == 1){
        this.step++
        this.x = this.x + (screenWidth/this.speed)*this.step
        this.renderStatic(ctx)
        if(this.x > screenWidth){
          this.step = 0
          this.stage = 2
          Slide.currentScreen = -1
        }
      }else{
        this.step++
        this.x = this.originX - screenWidth + (screenWidth/this.speed)*this.step
        this.renderStatic(ctx)
        if(Math.abs(this.originX-this.x) < 10){
          this.step = 0
          this.stage = 0
          this.x = this.originX
          this.y = this.originY
          this.isMoving = false
        }
      }
    }

  }



}
