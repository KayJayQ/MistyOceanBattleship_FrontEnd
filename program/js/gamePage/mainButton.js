import Databus from "../databus"
import Label from "../utils/label"

const databus = new Databus()
const screenWidth = window.innerWidth
const screenHeight = window.innerHeight

const attackSrc = "image/attackButton.png"
const fireSrc = "image/fireButton.png"
const nextSrc = "image/nextButton.png"

//主按钮

export default class MainButton extends Label{
  constructor(){
    super(undefined,attackSrc,screenWidth,screenHeight,0,0,false,"mainButton")
    this.status = "next" //attack fire next
  }

  isOn(x,y){
    return y > screenHeight*0.866 && x > screenWidth-(screenHeight*0.133)
  }

  render(ctx){
    if(this.status == "attack") {this.img.src = attackSrc}
    if(this.status == "fire") {this.img.src = fireSrc}
    if(this.status == "next") {this.img.src = nextSrc}
    super.render(ctx)
  }

}