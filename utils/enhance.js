

/**
 * 给原生的page对象添加扩展功能。
 * 1. $route
 * 2. $addListener,$removeListener,$removeAllListener,$emit 所有在当前页面绑定的事件都会在page.unLoad中自动卸载
 * 3. 给page添加mixin特性
 * 4. this.__query 缓存页面参数
 * 5. this.__pageKey ,this.__pageData //跳转页面携带的数据，数组类型，按照$route()方法中的参数顺序
 */

import emitter from './event-emitter'
const originPage = Page

const routers = {
  go: wx.navigateTo,
  back: wx.navigateBack,
  tab: wx.switchTab,
  redirect: wx.redirectTo,
  relaunch: wx.reLaunch
}
let routeLock = false

function route(url, type = 'go', ...argu) {
  if (routeLock) {
    return Promise.reject('fail:running')
  }
  routeLock = true
  return new Promise((resolve, reject) => {
    let conf = {
      success: resolve,
      fail: reject,
      complete: () => routeLock = false
    }
    if (/^back/.test(url)) {
      let [delta = 1] = url.match(/\d/) || []

      type = 'back'
      conf.delta = delta
    } else {
      if (!routers[type]) {
        type = 'redirect'
      }
      conf.url = url
    }
    // 存储传递给跳转页面的数据
    let key = Date.now() // 使用时间作为uuid 
    storeData(key, argu)
    routers[type](conf)
  })
}

function _Page(config) {
  // type: back,tab,redirect
  // url = "back4" 可以返回到页面栈前面四个
  config.$route = route
  /**
   * 方便类似,不想覆盖form对象，针对多个属性的赋值
   * this.setData({
   * 'form.a': a,
   * 'form.b': b,
   * 'form.c': c
   * })
   *  =>
   * this.$setData('form', { a, b, c })
   */
  config.$setData = function(prefix, data) {
    if (typeof prefix === 'string') {
      var props = {}
      for (let attr in data) {
        if (data.hasOwnProperty(attr)) {
          props[prefix + '.' + attr] = data[attr]
        }
      }
      return this.setData(props)
    } else if (typeof data === 'object' && !!object) {
      return this.setData(prefix)
    }
  }

  // Extends Event Emitter
  /**
   * 给当前页面绑定事件，通过此方法绑定的事件会在页面 unload 时自动解绑
   * @param {...[type]} argu [description]
   */
  config.$addListener = function(...argu) {
    this.$$events = this.$$events || []
    this.$$events.push([...argu])
    return emitter.addListener(...argu)
  }

  config.$removeAllListeners = function() {
    if (!this.$$events) return
    this.$$events.forEach(arr => emitter.removeListener(...arr))
    this.$$events = null
  }
  config.$removeListener= function(...argu){
    if(!this.$$events) return 
    emitter.removeListener(...argu)
  }

  /**
   * 给当前页面添加$emit，页面可以直接通过this.$emit来发布事件
   */
  config.$emit = emitter.emit

  // 给page 添加mixin
  let mixin = config.mixin
  if (mixin instanceof Array) {
    _addMixin(config, mixin)
  }else{
    _addMixin(config, [mixin])
  }

  let { onUnload, onLoad } = config

  config.onUnload = function(...argu) {
    onUnload && onUnload.call(this, ...argu)
    this.$removeAllListeners()
    // 销毁接收到页面数据
    clearData(this.__pageKey)
  }

  config.onLoad = function(query, ...argu) {
    this.__query = query
    // 接受跳转前页面传递的数据
    let { key, data} = getData()
    this.__pageKey = key
    this.__pageData = data
    onLoad && onLoad.call(this, query, ...argu)
  }

  return originPage(config)
}
/*
  将mixin 里面的方法和config里面方法合并。
  如果是一般的方法，config里面的覆盖mixin里面的方法，
  如果是page 的lifecycle 方法，则先执行mixin的声明周期方法，再执行config里面的声明周期方法。
*/
const pagelife = ['onLoad', 'onReady', 'onShow', 'onHide', 'onUnload', 'onPullDownRefresh', 'onReachBottom', 'onShareAppMessage', 'onPageScroll', 'onTabItemTap']

function _addMixin(config, mixin) {
  mixin.forEach((item) => {
    for (let key in item) {
      if (!item.hasOwnProperty(key)) continue
      if (pagelife.findIndex(item => item === key) === -1) {
        // 不是生命周期方法
        if (!config[key]) config[key] = item[key]
      } else {
        let life = config[key]
        if (!life) {
          // config 里面没有mixin对应的生命周期方法
          config[key] = item[key]
        } else {
          // 需要混合
          let mixinlife = item[key]
          config[key] = function () {
            //先执行mixin的lifecycle function
            let obj1 = mixinlife.apply(this, arguments)
            //再执行config的lifecycle function
            let obj2 = life.apply(this, arguments)
            if (key === 'onShareAppMessage') {
              return Object.assign({}, obj1, obj2)
            }
          }
        }
      }
    }
  })
}

let cacheKey = 0 //刚刚跳转页面对应的app.$$cacheData的key

function storeData(key, data){
  let app = getApp()
  app.$$cachaData = app.$$cachaData || {}
  app.$$cachaData[key] = data
  cacheKey = key
}

// 返回刚刚跳转页面的数据
function getData(){
  let app = getApp(),
    cacheData = app.$$cachaData || {}
  return { key: cacheKey, data: cacheData[cacheKey] }
}

function clearData(key){
  if(key === undefined || key === null || key === NaN) return 
  let app = getApp(),
    cacheData = app.$$cachaData || {}
  delete cacheData[key]
}
// 重新定义微信内置的Page
Page = function(config) {
  return _Page(config)
}

Page.originPage = originPage


// component enhance

// 重新定义微信内置的Component
let originComponent = Component

function _Component(config) {
  //当前的组件实例挂载到页面栈最顶层的页面实例下面
  let pro = {
    ref: {
      type: String,
      value: ''
    }
  }
  config.properties = Object.assign(config.properties, pro)
  config.methods = config.methods || {}
  // Extends Event Emitter
  /**
   * 给当前页面绑定事件，通过此方法绑定的事件会在页面 unload 时自动解绑
   * @param {...[type]} argu [description]
   */
  config.methods.$addListener = function (...argu) {
    this.$$events = this.$$events || []
    this.$$events.push([...argu])
    return emitter.addListener(...argu)
  }

  config.methods.$removeListener = function (...arr) {
    if (!this.$$events) return
    emitter.removeListener(...arr)
  }

  config.methods.$removeAllListeners = function () {
    if (!this.$$events) return
    this.$$events.forEach(arr => emitter.removeListener(...arr))
    this.$$events = null
  }

  // 在组件内也能使用$route
  config.methods.$route = route

  /**
   * 给当前页面添加$emit，页面可以直接通过this.$emit来发布事件
   */
  config.methods.$emit = emitter.emit
  let { detached, ready } = config

  config.ready = function(){
    let pages = getCurrentPages(),
      topPage = pages[pages.length - 1],
      ref = this.properties.ref
    if(ref){
      topPage.$refs = topPage.$refs || {}
      let comp = topPage.$refs[ref]
      if(comp instanceof Array){
        comp.push(this)
        this.$$refIndex = comp.length - 1
      }else if (!comp){
        comp = this
      }else {
        comp = [comp]
        comp.push(this)
        this.$$refIndex = comp.length - 1
      }
      topPage.$refs[ref] = comp
    }
    ready && ready.apply(this.arguments)
  }

  config.detached = function () {
    //动态卸载组件的时候，去除page对其的ref引用
    let ref = this.properties.ref
    if(ref){
      let pages = getCurrentPages(),
        topPage = pages[pages.length -1],
        comp = topPage.$refs[ref]
      if(this.$$refIndex === undefined){
        comp = null
      }else{
        comp.splice(this.$$refIndex,1)
      }
      topPage.$refs[ref] = comp

    }
    this.$removeAllListeners()
    detached && detached.apply(this, arguments)
  }

  return originComponent(config)
}


Component = function (config) {
  return _Component(config)
}

Component.originComponent = originComponent
