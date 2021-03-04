import Databus from "../databus"
import SlideObject from "./slideObject"
import Label from "../utils/label"

const databus = new Databus()
const screenWidth = window.innerWidth
const screenHeight = window.innerHeight

const exampleIMG = "image/characterChibi/萨拉托加.png"

//船只类，可以上下diandang（北京话）

export default class Ship extends SlideObject{
  constructor(imgsrc=exampleIMG,width=50,height=50,x=0,y=0,master=true,alter=true,id=11){
    super(imgsrc,width,height,x,y,master,alter,"")
    //id 第一个数字表示阵营：1为自己，2为敌方 第二个数字表示船号：1为主力舰，2为一号屏卫舰，3为二号屏卫舰
    this.id = id
    //是否沉没
    this.displayShip = true
    //显示细节元素
    this.HP = -1
    this.MP = -1
    this.art = -1
    this.baseAP = -1
    //点击事件
    this.focus = false //是否被选中
    this.moveHint = [] //标签集合，存放移动提示

    //是否增在软移动
    this.isSoftMoving = false
    this.path = []
  }

  updatePosition(rx,ry){
    //后端强制移动船只（没有动画）
    this.rx = rx
    this.ry = ry
    var trans = SlideObject.transform(this.rx,this.ry,this.width,this.height)
    this.x = trans['x'] + this.offx
    this.y = trans['y'] + this.offy
    this.originX = this.x
    this.originY = this.y
  }

  updateSoftPosition(rx,ry){
    //测试功能，软移动
    if(this.isSoftMoving || this.path.length > 0){
      this.updatePosition(rx,ry)
      return
    }
    this.isSoftMoving = true
    this.rx = rx
    this.ry = ry
    var trans = SlideObject.transform(this.rx,this.ry,this.width,this.height)
    let x_diff = trans.x - this.x
    let y_diff = trans.y - this.y
    this.originX = trans.x
    this.originY = trans.y
    for(let i=30; i>=0; i--){
      this.path.push([this.x+(x_diff/30)*i,this.y+(y_diff/30)*i])
    }
  }

  render(ctx){
    if(this.isSoftMoving){
      if(this.path.length == 0){
        this.isSoftMoving = false
        this.x = this.originX
        this.y = this.originY
      }else{
      let cood = this.path.pop()
      this.x = cood[0]
      this.y = cood[1]
      }
    }
    super.render(ctx)
    if(!this.focus || !this.displayShip){
      return
    }
    this.moveHint.forEach((move)=>{
      move.render(ctx)
    })
  }

  updateMove(){
    this.moveHint = []
    if(this.id > 20){
      return
    }
    var candidate = [[this.rx+1,this.ry,"right"],[this.rx,this.ry+1,"down"],[this.rx-1,this.ry,"left"],[this.rx,this.ry-1,"up"]]

    for(var i=candidate.length-1;i>=0;i--){
      if(candidate[i][0] < 0 || candidate[i][1] < 0 || candidate[i][0] > 4 || candidate[i][1] > 4){
        candidate.splice(i,1)
      }
    }
    for(var i=0;i<candidate.length;i++){
      let rx = candidate[i][0]
      let ry = candidate[i][1]
      let cood = SlideObject.transform(rx,ry,25,25)
      
      
      if(Ship.getShipInstance(11).isOn(cood.x,cood.y)){
        continue
      }
      if(Ship.getShipInstance(12).isOn(cood.x,cood.y)){
        continue
      }
      if(Ship.getShipInstance(13).isOn(cood.x,cood.y)){
        continue
      }

      let point = new Label(null,"image/moveHint.png",25,25,cood.x,cood.y,false,candidate[i][2])
      this.moveHint.push(point)
    }
  }

  static getShip(id){
    //通过id获取船只
    for(var i=0;i<databus.ships.length;i++){
      if (databus.ships[i].id == id){
        return i
      }
    }
  }

  static getShipInstance(id){
    for(var i=0;i<databus.ships.length;i++){
      if (databus.ships[i].id == id){
        return databus.ships[i]
      }
    }
  }

}
