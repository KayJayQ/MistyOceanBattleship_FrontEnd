import Drag from "../utils/drag"
import Databus from "../databus"

const databus = new Databus()
const screenWidth = window.innerWidth
const screenHeight = window.innerHeight

//卡牌拖动
const PREFIX = "image/skill"
const NORMPOST = ".png"
const LITPOST = "_lit.png"
const WIDTH = (0.841-0.741)*screenHeight*0.666
const HEIGHT = (0.841-0.741)*screenHeight

export default class Card extends Drag{
  constructor(id){
    super(null,PREFIX+id+NORMPOST,WIDTH,HEIGHT,(screenWidth-5*WIDTH)/6*id+(id-1)*WIDTH,0.741*screenHeight)
    this.cardID = id
    this.amount = 0
  }

  updateAmount(number){
    this.amount = number
    if(this.amount > 0){
      this.img.src = PREFIX+this.cardID+LITPOST
    }else{
      this.img.src = PREFIX+this.cardID+NORMPOST
    }
  }

  render(ctx){
    super.render(ctx)
    if(this.amount == 0){
      return
    }
    ctx.font = "10px Arial"
    ctx.fillText(this.amount,this.x+0.8*this.width,this.y+10)
  }

  start(x,y){
    if(this.amount == 0){
      return
    }
    super.start(x,y)
  }

  stop(x,y){
    let value = {res:false}
    let cardID = this.cardID
    databus.ships.forEach((ship)=>{
      if(ship.id < 20 && ship.displayShip && ship.isOn(x,y)){
        value.res = true
        value.id = ship.id
        value.type = cardID
      }
    })
    super.stop(x,y)
    return value
  }

}