import DataBus from "../databus"
import Label from "../utils/label"
import BackGround from "../utils/bg"
import Slide from "../utils/slide"
import Ship from "./ship"
import Cloud from "./cloud"
import ShipDrag from "./shipDrag"
import Drag from "../utils/drag"
import Bubble from "./bubble"
import HomeMain from "../homepage/homeMain"
import MainButton from "./mainButton"
import SlideObject from "./slideObject"
import Explosion from "./explosion"
import Card from "./card"

const screenWidth  = window.innerWidth
const screenHeight = window.innerHeight

let ctx   = canvas.getContext('2d')
let databus = new DataBus()
wx.cloud.init()
const db = wx.cloud.database()

export default class GameMain{
  constructor(){
    //渲染相关变量
    this.aniID = 0

    //连接相关变量
    this.connecting = false
    this.connect = false
    this.serverGameMessage = ""
    this.messageToSend = ""
    this.updateNow = false
    this.clientMsg = ""

    //游戏相关变量
    this.roomNumber = -1
    this.deployed = false
    this.attackMode = 0
    this.awaitExplosion = false
    
    this.repaint()
    
  }

  exit(){
        var dataPack = JSON.stringify({action:"disconnect",id:this.roomNumber})
        if(this.socket != undefined){
        this.socket.send({
          data:dataPack
        })
        this.socket.close()
        console.log(databus.logs)
        this.connect = false
        }
        canvas.removeEventListener(
          'touchstart',
          this.touchHandler
        )
        canvas.removeEventListener(
          'touchend',
          this.touchHandler
        )
        databus.reset()
        window.cancelAnimationFrame(this.aniId);
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        databus.callRepaint = true
        wx.offTouchStart()
        wx.offTouchEnd()
        wx.offTouchMove()
        new HomeMain()
  }

  applyRoom(){
    var that = this
    //申请一个AI房间号
    if(this.connect) return
    this.socket = wx.connectSocket({
      //3.138.211.118
      url: 'ws://3.138.211.118:4400/game',
      success : (res) => {
        console.log("Connected",res)
        that.connect = true
      }
    })

    function apply(){
      var username = databus.userName
      var dataPack = {action:"connect",info:{name:username,init_capital_ship_pos:databus.capitalInit,init_war_ship_1_pos:databus.screenInit1,init_war_ship_2_pos:databus.screenInit2}}
      that.socket.send({
        data:JSON.stringify(dataPack)
      })
    }

    this.socket.onOpen(function (res) {
      apply()
    })

    this.socket.onMessage(function (res) {
      that.handleSocket(res)
    })

  }

  repaint(){
    //开始构建逻辑
    databus.reset()//多多重置没坏处

    //取消所有触摸监听
    canvas.removeEventListener(
      'touchstart',
      this.touchHandler
    )
    canvas.removeEventListener(
      'touchmove',
      this.touchHandler
    )

    //依次添加背景及各个元素
    this.bg = new BackGround(screenWidth,screenHeight)
    //开启播放背景
    this.bg.playAnimation(0,true)

    //以及一直存在的用户状态栏
    var bar = new Label(ctx,"image/shade.png",screenWidth*0.7,screenHeight*0.05,screenWidth*0.15,screenHeight*0.16)
    bar.clip(6,108,55,48)
    databus.labels.push(bar)
    var avater = new Label(ctx,databus.userAvaterURL,screenWidth*0.15,screenWidth*0.15,screenWidth*0.15,screenWidth*0.15)
    databus.labels.push(avater)
    var name = new Label(ctx,"",0,0,screenWidth*0.35,screenWidth*0.2,true,databus.userName)
    databus.labels.push(name)
    //初期把房间号也写上因为实在没得可放

    //退出（临时）
    var quit = new Label(ctx,"image/Exit.png",30,30,10,10,false,"Exit")
    databus.labels.push(quit)

    //添加网格有关
    let grid1 = new Slide("image/square_grid_blue.png",screenWidth*0.8,screenWidth*0.8,screenWidth*0.1,screenHeight*0.25,true,false)
    databus.slides.push(grid1)
    let grid2 = new Slide("image/square_grid_red.png",screenWidth*0.8,screenWidth*0.8,screenWidth*0.1,screenHeight*0.25,false,true)
    databus.slides.push(grid2)

    //客户端信息
    this.ClientMessage = new Label(ctx,"",0,0,screenWidth*0.2,screenHeight*0.19,true,"")
    this.ClientMessage.textStyle(15)
    databus.labels.push(this.ClientMessage)

    //铺上云
    this.addClouds()

    //渲染背景
    //this.loadCharacterPictures()

    //添加等待部署的角色
    this.addDeploy()

    //绑定循环
    this.bindLoop = this.loop.bind(this)
    this.aniId = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )

    //管理触摸
    this.x_start = 0
    this.y_start = 0
    this.x_end = 0
    this.y_end = 0
    var that = this
    wx.onTouchStart(function(e){
      var touch = e.changedTouches[0]
      var x = touch.clientX
      var y = touch.clientY
      that.x_start = x
      that.y_start = y

      //开始检测拖动
      databus.drags.forEach((drag)=>{
        if(drag.isOn(that.x_start,that.y_start)){
          drag.start(that.x_start,that.y_start)
        }
      })
      databus.cards.forEach((drag)=>{
        if(drag.isOn(that.x_start,that.y_start)){
          drag.start(that.x_start,that.y_start)
        }
      })
    })
    wx.onTouchEnd(function(e){
      var touch = e.changedTouches[0]
      var x = touch.clientX
      var y = touch.clientY
      that.x_end = x
      that.y_end = y

      databus.drags.forEach((drag)=>{
        let res = false
        if(drag.isOn(that.x_end,that.y_end)){
          res = drag.stop(that.x_end,that.y_end)
        }
        if(res.res){
          let shipID = res.id
          let position = res.data
          if(shipID == 0)
            databus.capitalInit = position
          if(shipID == 1)
            databus.screenInit1 = position
          if(shipID == 2)
            databus.screenInit2 = position
        }
      })

      databus.cards.forEach((drag)=>{
        if(drag.isOn(that.x_end,that.y_end)){
          let res = drag.stop(that.x_end,that.y_end)
          if(res.res){
            that.messageToSend = {action:"equip","id":that.roomNumber,"unit_index":res.id%10-1,"artillery_type":res.type-1}
          }
        }
      })


      that.handleTouch()
    })
    wx.onTouchMove(function(e){
      //拖动事件处理
      let x = e.touches[0].clientX
      let y = e.touches[0].clientY
      databus.drags.forEach((drag)=>{
        if(drag.isOn(x,y) && drag.ismoving){
          drag.moving(x,y)
        }
      })
      databus.cards.forEach((drag)=>{
        if(drag.isOn(x,y) && drag.ismoving){
          drag.moving(x,y)
        }
      })
    })
  }

  sendPack(){
    //空包就先格式化
    if(this.messageToSend == ""){
      this.messageToSend = {action:"emptyPack",id:this.roomNumber}
    }else{
      console.log("Sent",this.messageToSend)
    }

    this.socket.send({
      data:JSON.stringify(this.messageToSend)
    })
    this.messageToSend = ""
  }

  handleSocket(msg){
    //服务器信息处理
    if(!msg){
      //空消息直接返回
      return
    }
    //字符串转JSON
    var raw = JSON.parse(msg.data)
    //如果没有进入房间，那么监听房间号，并login
    if(this.roomNumber == -1){
      this.roomNumber = raw.id
      databus.inGame = true
      //显示房间号在用户信息上
      let roomStr = ""
      roomStr += databus.textLib.language[6].text + " " + this.roomNumber
      let roomInfo = new Label(ctx,"","","",screenWidth*0.35,screenWidth*0.25,true,roomStr)
      roomInfo.textStyle(15)
      databus.labels.push(roomInfo)
    }

    //一般情况
    if(raw.status_code >= 400){
      //非200开头状态直接失败
      //这部分用于检查链接，现在留空
      return
    }
    var status_code = raw.status_code
    var game = null
    console.log(raw)
    if(raw.is_command_success){
      game = raw.result
    }
    if(this.awaitExplosion){
      if(raw.is_command_success){
        databus.attackHints.forEach((attack)=>{
          let explosion = new Explosion(attack.rx,attack.ry)
          databus.explosions.push(explosion)
        })
        databus.attackHints = []
      }else{
        this.awaitExplosion = false
        databus.attackHints = []
      }
    }
    //更新游戏画面
    if(status_code >= 400){return}
    this.serverGameMessage = game
    this.clientMsg = raw.msg
    if(this.clientMsg.length > 20){
      this.clientMsg = this.clientMsg.slice(0,39) + "\n" + this.clientMsg.slice(39)
    }
    if(game != undefined){this.updateNow = true}
     //写入服务器日志
     databus.logs.push(status_code + ":" + raw.msg)
  }

  handleTouch(){
    //处理点击
    if (Math.abs(this.x_start-this.x_end) < 15 && Math.abs(this.y_start-this.y_end) < 15){
      //按下抬起误差小于15，认为是点击事件

      //退出游戏
      if (this.x_end < 50 && this.y_end < 50){
        this.exit()
      }

      //处理label类的点击事件
      databus.labels.forEach((label)=>{
        if(label.isOn(this.x_start,this.y_start)){
          //主按钮响应
          if(label.text == "mainButton"){
            if(label.status == "next"){
              if(this.messageToSend == ""){
                this.messageToSend = {action:"next","id":this.roomNumber}
              }
            }
            if(label.status == "attack"){
              //如果选择攻击则放弃移动
              if(Slide.currentScreen == -1){
                Slide.switch()
              }
              let id = 0
              databus.ships.forEach((ship)=>{
                ship.moveHint = []
                if(ship.focus){
                  id = ship.id
                }
              })
              this.attackMode = id
            }
          }
          if(label.status == "fire"){
            let target = databus.attackHints[0].ry * 5 + databus.attackHints[0].rx
            let ship = this.attackMode
            this.attackMode = 0
            this.buttonReference.status = "next"
            this.messageToSend = {action:"attack","id":this.roomNumber,"unit_index":ship%10-1,"target_index":target}
            this.awaitExplosion = true
          }
        }
      })

      //创建攻击提示
      if(this.attackMode > 0 && Ship.getShipInstance(this.attackMode).id < 20){
        databus.attackHints = []
        let shipFocused = Ship.getShipInstance(this.attackMode)
        databus.clouds.forEach((cloud)=>{
          if(cloud.isOn(this.x_end,this.y_end) && cloud.id < 0){
            if(shipFocused.art == null){
              //未装备炮
              let cood = [(-1*cloud.id-1)%5,Math.floor((-1*cloud.id-1)/5)]
              let hint = new SlideObject("image/attackHint.png",13,13,cood[0],cood[1],false,true,"")
              databus.attackHints.push(hint)
            }else{
              if(shipFocused.art.indexOf("TypeZero") >= 0){
                //一格
                let cood = [(-1*cloud.id-1)%5,Math.floor((-1*cloud.id-1)/5)]
                let hint = new SlideObject("image/attackHint.png",13,13,cood[0],cood[1],false,true,"")
                databus.attackHints.push(hint)
              }
              if(shipFocused.art.indexOf("TypeOne") >= 0){
                //横二
                let cood = [(-1*cloud.id-1)%5,Math.floor((-1*cloud.id-1)/5)]
                let hint = new SlideObject("image/attackHint.png",13,13,cood[0],cood[1],false,true,"")
                databus.attackHints.push(hint)
                if(cood[0]<4){
                  let hint = new SlideObject("image/attackHint.png",13,13,cood[0]+1,cood[1],false,true,"")
                  databus.attackHints.push(hint)
                }
              }
              if(shipFocused.art.indexOf("TypeTwo") >= 0){
                //竖二
                let cood = [(-1*cloud.id-1)%5,Math.floor((-1*cloud.id-1)/5)]
                let hint = new SlideObject("image/attackHint.png",13,13,cood[0],cood[1],false,true,"")
                databus.attackHints.push(hint)
                if(cood[1]<4){
                  let hint = new SlideObject("image/attackHint.png",13,13,cood[0],cood[1]+1,false,true,"")
                  databus.attackHints.push(hint)
                }
              }
              if(shipFocused.art.indexOf("TypeThree") >= 0){
                //正方
                let cood = [(-1*cloud.id-1)%5,Math.floor((-1*cloud.id-1)/5)]
                let hint = new SlideObject("image/attackHint.png",13,13,cood[0],cood[1],false,true,"")
                databus.attackHints.push(hint)
                if(cood[0]<4){
                  let hint = new SlideObject("image/attackHint.png",13,13,cood[0]+1,cood[1],false,true,"")
                  databus.attackHints.push(hint)
                }
                if(cood[1]<4){
                  let hint = new SlideObject("image/attackHint.png",13,13,cood[0],cood[1]+1,false,true,"")
                  databus.attackHints.push(hint)
                }
                if(cood[0]<4 && cood[1]<4){
                  let hint = new SlideObject("image/attackHint.png",13,13,cood[0]+1,cood[1]+1,false,true,"")
                  databus.attackHints.push(hint)
                }
              }
              if(shipFocused.art.indexOf("TypeFour") >= 0){
                //十字
                let cood = [(-1*cloud.id-1)%5,Math.floor((-1*cloud.id-1)/5)]
                let hint = new SlideObject("image/attackHint.png",13,13,cood[0],cood[1],false,true,"")
                databus.attackHints.push(hint)
                if(cood[0]<4){
                  let hint = new SlideObject("image/attackHint.png",13,13,cood[0]+1,cood[1],false,true,"")
                  databus.attackHints.push(hint)
                }
                if(cood[1]<4){
                  let hint = new SlideObject("image/attackHint.png",13,13,cood[0],cood[1]+1,false,true,"")
                  databus.attackHints.push(hint)
                }
                if(cood[0]>0){
                  let hint = new SlideObject("image/attackHint.png",13,13,cood[0]-1,cood[1],false,true,"")
                  databus.attackHints.push(hint)
                }
                if(cood[1]>0){
                  let hint = new SlideObject("image/attackHint.png",13,13,cood[0],cood[1]-1,false,true,"")
                  databus.attackHints.push(hint)
                }
              }
            }

            //可以开火
            this.buttonReference.status = "fire"
          }
        })
      }


      //处理移动事件
      databus.ships.forEach((ship)=>{
        ship.moveHint.forEach((move)=>{
          if(move.isOn(this.x_end,this.y_end)){
            this.messageToSend = {action:"move",id:this.roomNumber,unit_index:ship.id%10-1,direction:move.text}
          }
        })
      })

      //放被动
      databus.bubbles.forEach((bubble)=>{
        if(bubble.text == "技能" && bubble.isOn(this.x_end,this.y_end)){
          this.messageToSend = {action:"invoke",id:this.roomNumber}
        }
      })

      //移除掉不在焦点的气泡
      Bubble.checkFocus(this.x_end,this.y_end)
      if(this.attackMode == 0){
        this.buttonReference.status = "next"
      }
      

      //添加角色详情气泡
      databus.ships.forEach((ship)=>{
        ship.focus = false
        ship.moveHint = []
        if(ship.isOn(this.x_end,this.y_end) && ship.displayShip){
          if((ship.id < 20 && Slide.currentScreen == -1)||(ship.id > 20 && Slide.currentScreen == 1)){
          this.createCharacterInfoBubble(ship)
          //设置焦点
          ship.focus = true
          ship.updateMove()
          if(ship.id<20){
          this.buttonReference.status = "attack"}
          }
        }
      })



    }else{
      //认为是拖动事件
      if(!databus.allowSlide)
        return
      if(this.x_end - this.x_start > 30 && databus.slides[0].isOn(this.x_start,this.y_start)){
        //向右滑动
        this.clientMsg = databus.textLib.language[7].text
        Slide.switch()
      }
      if(this.x_end - this.x_start < -30 && databus.slides[0].isOn(this.x_start,this.y_start)){
        //向左滑动
        this.clientMsg = databus.textLib.language[8].text
        Slide.switch()
      }
    }
  }

  update(){
    //更新业务逻辑

    //检查是否部署完毕
    if(this.roomNumber == -1){
      if(databus.capitalInit >= 0 && databus.screenInit1 >= 0 && databus.screenInit2 >= 0){
        this.applyRoom()
      }
    }

    //如果部署完就结束部署阶段
    if(this.roomNumber >= 0 && !this.deployed){
      this.finishDeploy()
      this.deployed = true
    }

    //更新游戏页面
    if(this.updateNow && this.serverGameMessage){
      this.updateDisplay(this.serverGameMessage)
      this.updateNow = false
    }

    //定期发包，半秒一次
    if(this.connect && databus.frame % 30 == 0){
      this.sendPack()
    }

    //信息栏更新
    this.ClientMessage.text = this.clientMsg

    //如果失去瞄准禁止开火
    if(this.buttonReference != undefined && databus.attackHints.length == 0 && this.buttonReference.status != "next"){
      this.buttonReference.status = "attack"
    }

  }

  render(){
    //渲染管理（从底向上）
    //渲染，先清理整块屏幕
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    //背景
    databus.animations.forEach((ani)=>{
      if(ani.isPlaying){
        ani.aniRender(ctx)
      }
    })

    //滑动对象
    databus.slides.forEach((slide)=>{
      slide.render(ctx)
    })
    //云
    databus.clouds.forEach((cloud)=>{
      if(cloud.fow)
       cloud.render(ctx)
    })
    //船
    databus.ships.forEach((ship)=>{
      if(ship.displayShip)
        ship.render(ctx)
    })

    //拖动对象
    databus.drags.forEach((drag)=>{
      drag.render(ctx)
    })

    //标签属性对象的渲染
    databus.labels.forEach((label)=>{
      label.render(ctx)
    })

    //卡牌
    databus.cards.forEach((card)=>{
      card.render(ctx)
    })

    //气泡，最上层
    databus.bubbles.forEach((bubble)=>{
      bubble.render(ctx)
    })

    //资源条
    databus.fuel.forEach((fuel)=>{
      if(fuel.text == "true"){
        fuel.render(ctx)
      }
    })
    databus.bank.forEach((bank)=>{
      if(bank.text == "true"){
        bank.render(ctx)
      }
    })


    //攻击提示
    databus.attackHints.forEach((attack)=>{
      attack.render(ctx)
    })

    //爆炸
    databus.explosions.forEach((explosion)=>{
      explosion.render(ctx)
    })
    if(databus.explosions.length > 0 && databus.explosions[0].done){
      databus.explosions = []
    }

  }

  loop(){
    //循环逻辑
    databus.frame++
    
    this.update()
    this.render()

    this.aniId = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )
  }

  //------------------------------------具体细节--------------------------------------


  addClouds(){
    for(var i = 0; i < 25; i++){
      //主视角的云
      let cloud = new Cloud("image/clouds/cloud_5.png",95*((Math.floor(i/5)*0.05)+1),95*((Math.floor(i/5)*0.05)+1),i%5,(i-i%5)/5,true,false,i+1)
      cloud.fow = false
      databus.clouds.push(cloud)
      //敌视角的云
      let cloud1 = new Cloud("image/clouds/cloud_5.png",95*((Math.floor(i/5)*0.05)+1),95*((Math.floor(i/5)*0.05)+1),i%5,(i-i%5)/5,false,true,-(i+1))
      cloud.fow = false
      databus.clouds.push(cloud1)
    }
  }

  loadCharacterPictures(){
    let l1 = new Label(ctx,"image/characterPortrait/爱宕.png",150,150,screenWidth/2+50,screenHeight*0.8,false,"charPic")
    databus.labels.push(l1)
    let l2 = new Label(ctx,"image/characterPortrait/海伦娜.png",150,150,screenWidth/2-125-75,screenHeight*0.8,false,"charPic")
    databus.labels.push(l2)
    let l3 = new Label(ctx,"image/characterPortrait/萨拉托加.png",250,250,screenWidth/2-125,screenHeight*0.75,false,"charPic")
    databus.labels.push(l3)
  }

  addDeploy(){
    //萨拉托加
    let capital =  new ShipDrag(ctx,"image/characterChibi/萨拉托加.png",50,50,screenWidth/4-25,screenHeight*0.65,0)
    databus.drags.push(capital)
    //海伦娜
    let screen1 =  new ShipDrag(ctx,"image/characterChibi/海伦娜.png",50,50,2*screenWidth/4-25,screenHeight*0.65,1)
    databus.drags.push(screen1)
    //爱宕
    let screen2 =  new ShipDrag(ctx,"image/characterChibi/爱宕.png",50,50,3*screenWidth/4-25,screenHeight*0.65,2)
    databus.drags.push(screen2)
  }

  finishDeploy(){
    //完成部署
    databus.drags.splice(0,databus.drags.length)
    for(let i=databus.labels.length-1;i>=0;i--){
      if(databus.labels[i].text === "charPic"){
        databus.labels.splice(i,1);
      }
    }

    //阴影，底部UI
    let bottomShadow = new Label(ctx,"image/shade.png",screenWidth,screenHeight*0.34,0,screenHeight*0.66,false,"bottomShadow")
    databus.labels.push(bottomShadow)
    let baseUI = new Label(ctx,"image/GamePage_fuelBar.png",screenWidth,screenHeight,0,0,false,"baseUI")
    databus.labels.push(baseUI)

    //创建资源条
    for(let i=0;i<3;i++){
      let bank = new Label(ctx,"image/fuelCellTop.png",screenHeight*(0.9275-0.875),screenHeight*(0.9275-0.875),(56*i+404)/828*screenWidth,0.875*screenHeight,false,"true")
      databus.bank.push(bank)
    }
    for(let i=0;i<10;i++){
      let fuel = new Label(ctx,"image/fuelCellBottom.png",screenHeight*(0.986-0.9336),screenHeight*(0.986-0.9336),(56*i+11)/828*screenWidth,screenHeight*0.9336,false,"true")
      databus.fuel.push(fuel)
    }
    //创建卡牌
    for(let i=1;i<=5;i++){
      let card = new Card(i)
      databus.cards.push(card)
    }

    //创建船（不显示）
    let ship11 = new Ship("image/characterChibi/萨拉托加.png",50,50,0,0,true,false,11)
    let ship12 = new Ship("image/characterChibi/海伦娜.png",50,50,0,0,true,false,12)
    let ship13 = new Ship("image/characterChibi/爱宕.png",50,50,0,0,true,false,13)
    let ship21 = new Ship("image/characterChibi/萨拉托加.png",50,50,0,0,false,true,21)
    let ship22 = new Ship("image/characterChibi/海伦娜.png",50,50,0,0,false,true,22)
    let ship23 = new Ship("image/characterChibi/爱宕.png",50,50,0,0,false,true,23)
    ship11.displayShip = false
    ship12.displayShip = false
    ship13.displayShip = false
    ship21.displayShip = false
    ship22.displayShip = false
    ship23.displayShip = false
    databus.ships.push(ship11)
    databus.ships.push(ship12)
    databus.ships.push(ship13)
    databus.ships.push(ship21)
    databus.ships.push(ship22)
    databus.ships.push(ship23)

    databus.allowSlide = true

    //创建结束回合按钮
    let Next = new MainButton()
    this.buttonReference = Next
    databus.labels.push(Next)
    
  }

  updateDisplay(game){
    if(databus.ships.length == 0 || game == "")
      return
    //更新游戏画面
    //更新云
    for(var i=0;i<25;i++){
      if(game.cur_board[i] == "x"){
        databus.clouds[Cloud.getCloud(i+1)].fow = true
      }else{
        databus.clouds[Cloud.getCloud(i+1)].fow = false
      }

      if(game.opp_board[i] == "x"){
        databus.clouds[Cloud.getCloud(-i-1)].fow = true
      }else{
        databus.clouds[Cloud.getCloud(-i-1)].fow = false
      }
    }

    //更新船
    let shipJSON = ["your_capital","your_warship1","your_warship2","opp_capital","opp_warship1","opp_warship2"]
    for(var i=0;i<6;i++){
      databus.ships[i].displayShip = game[shipJSON[i]].curren_hp > 0
      databus.ships[i].updateSoftPosition(game[shipJSON[i]].position%5,Math.floor(game[shipJSON[i]].position/5))
      databus.ships[i].HP = game[shipJSON[i]].curren_hp
      databus.ships[i].MP = game[shipJSON[i]].current_mp
      databus.ships[i].art = game[shipJSON[i]].artillery
      databus.ships[i].baseAP = game[shipJSON[i]].base_attac
      if(i > 2 && databus.clouds[Cloud.getCloud(-1*(game[shipJSON[i]].position+1))].fow){
        //隐藏敌人
        databus.ships[i].displayShip = false
      }else{
        databus.ships[i].displayShip = true
      }
      if(databus.ships[i].HP < 0){
        databus.ships[i].displayShip = false
      }
    }

    //更新资源
    for(let i=0;i<3;i++){
      if(2-i >= game.bank){
        databus.bank[i].text = "false"
      }else{
        databus.bank[i].text = "true"
      }
    }
    for(let i=0;i<10;i++){
      if(9-i >= game.fuel){
        databus.fuel[i].text = "false"
      }else{
        databus.fuel[i].text = "true"
      }
    }

    //更新卡牌
    databus.cards.forEach((card)=>{
      let id = card.cardID-1
      card.updateAmount(game.your_inventory[id])
    })

  }

  //创建角色信息气泡
  createCharacterInfoBubble(ship){
    let background = new Bubble("image/Common.png",200,100,screenWidth*0.1,screenHeight*0.65,false,"底部",ship.id+"Info")
    background.clip(270,126,112,82)
    databus.bubbles.push(background)

    //舰船名先写死
    let shipName = ["CV 萨拉托加","CL 海伦娜","CA 爱宕"]
    let postfix = ""
    if(ship.id%10<2){
      postfix = databus.textLib.language[9].text
    }else{
      postfix = databus.textLib.language[10].text
    }

    let title = new Bubble("",0,0,screenWidth*0.1+5,screenHeight*0.65+12,true,shipName[ship.id%10-1]+" "+postfix,ship.id+"Info")
    title.textStyle(12)
    databus.bubbles.push(title)

    let hp = new Bubble("",0,0,screenWidth*0.1+10,screenHeight*0.7,true,"HP: "+ship.HP,ship.id+"Info")
    hp.textStyle(12)
    databus.bubbles.push(hp)

    let mp = new Bubble("",0,0,screenWidth*0.1+10,screenHeight*0.72,true,"MP: "+ship.MP,ship.id+"Info")
    mp.textStyle(12)
    databus.bubbles.push(mp)

    let ap = new Bubble("",0,0,screenWidth*0.1+10,screenHeight*0.74,true,"Base AP: "+ship.baseAP,ship.id+"Info")
    ap.textStyle(12)
    databus.bubbles.push(ap)

    if(ship.art != null){
      let art = new Bubble("",0,0,screenWidth*0.1+75,screenHeight*0.7,true,"Artillery: "+ship.art,ship.id+"Info")
      art.textStyle(12)
      databus.bubbles.push(art)
    }

    //被动
    if(ship.id % 10 == 1){
      let invoke = new Bubble("image/shield.png",30,30,screenWidth*0.1+100,screenHeight*0.65+50,false,"技能",ship.id+"Info")
      databus.bubbles.push(invoke)
    }
  }

}