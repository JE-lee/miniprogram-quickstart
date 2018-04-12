import util from './util'
import emitter from './event-emitter'

const originPage = Page
let channel = {}

const routers = {
  go: wx.navigateTo,
  back: wx.navigateBack,
  tab: wx.switchTab,
  redirect: wx.redirectTo,
  relaunch: wx.reLaunch
}
let routeLock = false

function _Page(config) {
  // type: back,tab,redirect
  config.$route = function(url, type = 'go') {
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
      routers[type](conf)
    })
  }

  config.$put = function(key, val) {
    channel[key] = val
  }
  config.$take = function(key) {
    var v = channel[key]
    // 释放引用
    channel[key] = null
    return v
  }

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
    } else if (util.isObject(prefix)) {
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
  }

  /**
   * 给当前页面添加$emit，页面可以直接通过this.$emit来发布事件
   */
  config.$emit = emitter.emit

  let { onUnload, onLoad } = config

  config.onUnload = function(...argu) {
    onUnload && onUnload.call(this, ...argu)
    this.$removeAllListeners()
  }

  config.onLoad = function(query, ...argu) {
    onLoad && onLoad.call(this, query, ...argu)
    this.__query = query
  }

  return originPage(config)
}

// 重新定义微信内置的Page
Page = function(config) {
  return _Page(config)
}

Page.originPage = originPage
