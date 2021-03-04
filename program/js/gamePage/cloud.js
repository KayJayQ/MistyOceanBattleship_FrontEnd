import Databus from "../databus"
import SlideObject from "./slideObject"

const databus = new Databus()
const screenWidth = window.innerWidth
const screenHeight = window.innerHeight

//云。因为当初规划失误，导致强行融合动画类，目前代码为shi山状态。

const CLOUD_PREFIX = "image/clouds/cloud_"
const CLOUD_COUNT = 15
const INTERVAL = 10

export default class Cloud extends SlideObject{
  constructor(imgsrc=CLOUD_PREFIX+"1.png",width=65,height=65,x=2,y=2,master=true,alter=true,id=0){
    super(imgsrc,width,height,x,y,master,alter,"")
    //id为格子号，0-24
    this.id = id
    //是否显示
    this.fow = true
    this.setOffset(0,10)
    //动画相关
    this.currentIMG = 1
    this.interval = 5
    
    let src = Math.floor(Math.random()*CLOUD_COUNT) + 1;
    this.img.src = CLOUD_PREFIX+src+".png"
  }

  // render(ctx){
  //   this.interval -= 1
  //   if(this.interval == 0){
  //     this.interval = INTERVAL
  //     this.currentIMG += 1
  //     if(this.currentIMG == CLOUD_COUNT + 1){
  //       this.currentIMG = 1
  //     }
  //   }
  //   this.img.src = CLOUD_PREFIX + this.currentIMG + ".png"
  //   super.render(ctx)
  // }

  static getCloud(id){
    //通过id获取云
    for(var i=0;i<databus.clouds.length;i++){
      if (databus.clouds[i].id == id){
        return i
      }
    }
  }

  isOn(x,y){
    if(this.x+this.width*0.3 <= x && x <= this.x+this.width*0.7 && this.y+this.height*0.3 <= y && y <= this.y+this.height*0.7){
      return true
    }else{
      return false
    }
  }
}