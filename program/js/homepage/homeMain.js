import DataBus from "../databus"
import BackGround from "../utils/bg"
import Button from "./button"
import Label from "../utils/label"
import GameMain from "../gamePage/gameMain"
import Radius from "./radius"

import language from "../../language/CN"

const screenWidth  = window.innerWidth
const screenHeight = window.innerHeight

let ctx   = canvas.getContext('2d')
let databus = new DataBus()

wx.cloud.init({
  // env 参数说明：
  //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
  //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
  //   如不填则使用默认环境（第一个创建的环境）
  // env: 'my-env-id',
})
const db = wx.cloud.database()

//主页的主函数
export default class HomeMain{
  constructor(){
    this.aniId = 0
    this.createLoginButton = true
    this.repaint()
  }

  login(){
    //处理登录
    // 获取 openid 以及用户信息
    wx.cloud.callFunction({
      name: 'login',
      success: res => {
        window.openid = res.result.openid
      },
      fail: err => {
        console.error('get openid failed with error', err)
      }
    })

    //最开始获取用户信息
    if (databus.userName == "" && this.createLoginButton){
      this.createLoginButton = false
      let button = wx.createUserInfoButton({
        type: 'text',
        text: databus.textLib.language[1].text,
        style: {
          left: screenWidth * 0.15,
          top: screenWidth * 0.10,
          width: screenWidth * 0.3,
          height: screenWidth * 0.1,
          lineHeight: 40,
          backgroundColor: '#000080',
          color: '#ffffff',
          textAlign: 'center',
          fontSize: 16,
          borderRadius: 4
        }
      })
      
      button.onTap((res) => {
        databus.userName = res.userInfo.nickName
        databus.userAvaterURL = res.userInfo.avatarUrl
        console.log(databus.userName)
        console.log(databus.userAvaterURL)
        button.destroy()
        databus.signedIn = true
        this.addAvater()
      })
    }
  }

  repaint(){
    if(!databus.signedIn){
      this.login()
    }
    databus.reset()
    canvas.removeEventListener(
      'touchstart',
      this.touchHandler
    )
    //依次添加背景及各个元素
    this.bg = new BackGround(screenWidth,screenHeight)
    //开启播放背景
    this.bg.playAnimation(0,true)

    //框架
    let structure = new Label(ctx,"image/HomeMenu.png",screenWidth,screenHeight,0,0,false,"background")
    databus.labels.push(structure)

    //语言切换
    let status = 1
    if(databus.language == 1){status = -1}
    let selectCN = new Radius("image/Common.png",20,20,screenWidth*0.8,screenHeight*0.93,"language",status,0)
    selectCN.action = function(){databus.setLanguage(0);databus.callRepaint = true}
    databus.radiuses.push(selectCN)
    let selectEN = new Radius("image/Common.png",20,20,screenWidth*0.8,selectCN.y+22,"language",status*-1,1)
    selectEN.action = function(){databus.setLanguage(1);databus.callRepaint = true}
    databus.radiuses.push(selectEN)
    Radius.setClip("language",true,173,131,13,13)
    Radius.setClip("language",false,121,131,13,13)
    let textCN = new Label(ctx,"",0,0,selectCN.x+30,selectCN.y+16,true,"中文")
    let textEN = new Label(ctx,"",0,0,selectEN.x+30,selectEN.y+16,true,"ENG")
    textCN.textStyle(15)
    textEN.textStyle(15)
    databus.labels.push(textCN)
    databus.labels.push(textEN)

    //Logo
    let Logo = new Label(ctx,"",0,0,screenWidth*0.1,screenHeight*0.17,true,databus.textLib.language[0].text)
    Logo.textStyle(Math.floor(screenHeight/50+10),"#000000","Yahei")
    databus.labels.push(Logo)

    //buttonsMath.floor()
    let casual = new Button(this,screenWidth*0.27,screenHeight*0.055,screenWidth*0.64,screenHeight*0.205,databus.textLib.language[2].text)
    databus.buttons.push(casual)
    let ranked = new Button(this,screenWidth*0.27,screenHeight*0.055,screenWidth*0.68,screenHeight*0.312,databus.textLib.language[3].text)
    databus.buttons.push(ranked)
    let pve = new Button(this,screenWidth*0.27,screenHeight*0.055,screenWidth*0.72,screenHeight*0.415,databus.textLib.language[4].text)
    pve.action = this.gotoAI
    databus.buttons.push(pve)
    let arsenal = new Button(this,screenWidth*0.27,screenHeight*0.055,screenWidth*0.76,screenHeight*0.525,databus.textLib.language[5].text)
    databus.buttons.push(arsenal)
    
    

    this.bindLoop     = this.loop.bind(this)
    this.hasEventBind = false

    // 清除上一局的动画
    window.cancelAnimationFrame(this.aniId);
    this.aniId = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )
    //监控点击
    wx.onTouchStart(function(e){
      var touch = e.changedTouches[0]
      var x = touch.clientX
      var y = touch.clientY

      databus.buttons.forEach((button)=>{
        if (button.isOn(x,y) && databus.signedIn){
          button.action()
        }
      })

      databus.radiuses.forEach((radius)=>{
        if(radius.isOn(x,y)){
          radius.clickOn()
        }
      })
   })
  }

  addAvater(){
    //添加头像
    let avater = new Label(ctx,databus.userAvaterURL,50/414*screenWidth,50/414*screenWidth,0.1*screenWidth,0.05*screenHeight)
    databus.labels.push(avater)
    let username = new Label(ctx,"",0,0,avater.x+avater.width+10,avater.height+avater.y*0.9,true,databus.userName)
    databus.labels.push(username)
  }

  update(){
    if(databus.callRepaint){
      databus.callRepaint = false
      this.clear()
      this.repaint()
      if(databus.signedIn){
        this.addAvater()
      }
    }
  }

  render(){
    //渲染，先清理整块屏幕
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    //背景
    databus.animations.forEach((ani)=>{
      if(ani.isPlaying){
        ani.aniRender(ctx)
      }
    })
    this.bg.render(ctx)
    
    //用户信息
    databus.labels.forEach((label)=>{
      label.render(ctx)
    })
    //语言选项
    databus.radiuses.forEach((radius)=>{
      radius.render(ctx)
    })
    //选项按钮
    databus.buttons.forEach((button)=>{
      button.render(ctx)
    })
    
  }

  loop(){
    //逻辑循环
    databus.frame++
    
    this.update()
    this.render()

    this.aniId = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )
  }

  clear(){
    //跳转页面前先清空主页
    databus.reset()
    canvas.removeEventListener(
      'touchstart',
      this.touchHandler
    )
    window.cancelAnimationFrame(this.aniId);
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  //-----------------以下为跳转函数------------------------

  gotoAI(){
    //跳转到AI练习，自动申请建立房间，这部分为最先开发
    console.log("Going to AI")
    this.that.clear()
    //清除主页后，跳转到游戏页面
    new GameMain()
  }

}