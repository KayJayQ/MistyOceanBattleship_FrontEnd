import Databus from "../databus"
import SlideObject from "./slideObject"

const databus = new Databus()
const screenWidth = window.innerWidth
const screenHeight = window.innerHeight

const PREFIX = "image/explosion/explosion_"
const POSTFIX = ".png"

const SPEED = 5 //frame per image
const TOTAL = 8

//爆炸动画

export default class Explosion extends SlideObject{
  constructor(rx,ry){
    super(PREFIX+1+POSTFIX,50,50,rx,ry,false,true,"")
    this.currentFrame = 0
    this.done = false
  }

  render(ctx){
    this.currentFrame++
    let slice = Math.floor(this.currentFrame/SPEED) + 1
    if(slice > TOTAL){
      this.done = true
      return
    }
    this.img.src = PREFIX+slice+POSTFIX
    super.render(ctx)
  }

}