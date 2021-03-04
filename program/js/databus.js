//全局设置变量管理
import Pool from "./base/pool"
import CN from "../language/CN"
import EN from "../language/EN"

let instance

/**
 * 全局状态管理器，包括需要渲染的对象管理
 */
export default class DataBus {
  constructor() {
    if ( instance )
      return instance

    instance = this

    //移除的朴素对象请回收到pool里
    this.pool = new Pool()

    this.userName = ""
    this.userAvaterURL = ""

    //语言 0中 1英
    this.language = 1

    this.signedIn = false

    //游戏内变量
    this.inGame = false //是否处于游戏中（与服务器验证）

    //重新渲染
    this.callRepaint = false

    //初始化变量
    this.reset()
  }

  reset() {
    //元素、变量等

    //帧计数器
    this.frame = 0
    //正在播放的动画集合
    this.animations = []

    //加载语言
    if (this.language == 0){
      this.textLib = {language:CN.CN}
    }
    if (this.language == 1){
      this.textLib = {language:EN.EN}
    }

    //主页内容
    //按钮
    this.buttons = []
    //标签集合
    this.labels = []
    //单选
    this.radiuses = []

    //游戏页面内容

    //服务器日志
    this.logs = []

    //拖动物体
    this.drags = []

    //允许滑动
    this.allowSlide = false
    this.slides = []
    //云
    this.clouds = []
    //船
    this.ships = []

    //弹出类
    this.bubbles = []

    //初始船位置
    this.capitalInit = -1
    this.screenInit1 = -1
    this.screenInit2 = -1

    //攻击提示
    this.attackHints = []
    //爆炸
    this.explosions = []

    //油量
    this.fuel = []
    //储量
    this.bank = []

    //卡牌
    this.cards = []

  }

  setLanguage(language){
    this.language = language
    if (this.language == 0){
      this.textLib = {language:CN.CN}
    }
    if (this.language == 1){
      this.textLib = {language:EN.EN}
    }
  }

}