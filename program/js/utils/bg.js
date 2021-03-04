import Animation from "../base/animation"
import Databus from "../databus"

//船为placeholder 应为静态背景
const SHIP_IMG = "image/characterPortrait/爱宕.png"
const SHIP_WIDTH = 1024
const SHIP_HEIGHT = 944
const OCEAN_PREFIX = "image/ocean_frames/ocean_f"
const OCEAN_COUNT = 10

const __ = {
  timer: Symbol('timer'),
}

const databus = new Databus()

export default class Background extends Animation{
  constructor(screenWidth,screenHeight){
    //加载固定船只
    super(SHIP_IMG,SHIP_WIDTH,SHIP_HEIGHT)
    //加载海洋动画
    this.frames = []
    for(let i=0; i<OCEAN_COUNT; i++){
      this.frames.push(OCEAN_PREFIX+i+".png")
      this.frames.push(OCEAN_PREFIX+i+".png")
      this.frames.push(OCEAN_PREFIX+i+".png")
    }
    this.initFrames(this.frames)
    // 每一帧的时间间隔
    this.interval = 1000 / 60
    this.screenWidth = screenWidth
    this.screenHeight = screenHeight
    //船只坐标
    this.width = SHIP_WIDTH * 0.68 / 414 * screenWidth
    this.height = SHIP_HEIGHT * 0.68 / 414 * screenWidth
    this.x = screenWidth * -0.4
    this.y = screenHeight * 0.34
    //勿动
    this.skip = true
  }

  playAnimation(index = 0, loop = false){
    //重载动画播放，不移除原精灵图
    this.isPlaying = true
    this.loop      = loop

    this.index     = index

    if ( this.interval > 0 && this.count ) {
      this[__.timer] = setInterval(
        this.frameLoop.bind(this),
        this.interval
      )
    }
  }

  aniRender(ctx) {
    //重写帧渲染，铺满屏幕
    ctx.drawImage(
      this.imgList[this.index],
      0,
      0,
      this.screenWidth,
      this.screenHeight
    )
  }

  render(ctx){
    //船渲染
    ctx.drawImage(
      this.img,
      this.x,
      this.y,
      this.width,
      this.height
    )
  }


}

