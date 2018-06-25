
import CONFIG from './config'

/**
 * 清除参数中的undefined和null
 *
 * @param {Object} obj
 */
function clean(obj) {
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null) {
      if (obj.hasOwnProperty(k)) { delete obj[k] }
    }
  })
}

/**
 * 构建api对象
 *
 * @param {(Object|any[])} config
 * @param {string} [route=HOST]
 * @returns {Object}
 */
function build(config, route = CONFIG.HOST) {
  if (config instanceof Array) {
    return buildMethod(config, route)
  } else {
    const api = {}
    Object.keys(config).forEach((k) => {
      api[k] = build(config[k], `${ route }/${ k }`)
    })
    return api
  }
}

/**
 * 生成api方法
 *
 * @param {any[]} config
 * @param {string} route
 * @returns {function}
 */
function buildMethod(config, route) {
  const [method = 'GET'] = config

  const download = async(query = {}) => {
    const params = Object.entries(query)
      .map(([k, v]) => `${ k }=${ v }`).join('&')
    const res = await wxp.downloadFile({
      url: `${ route }?${ params }`
    })
    if (res.statusCode === 200) {
      return res.tempFilePath
    } else {
      console.warn('下载失败', res.statusCode)
      throw res
    }
  }

  const apiRequest = async({
    data = {},
    query = {},
    complete = noop,
    desc
  } = {}) => {
    clean(data)
    clean(query)

    const params = Object.entries(query)
      .map(([k, v]) => `${ k }=${ v }`).join('&')

    if (desc) {
      const _complete = complete
      // NOTE: 注意complete的代码会在await的代码之后才执行
      complete = function() {
        wx.hideLoading()
        return _complete.apply(this, arguments)
      }
      wx.showLoading({
        title: `${ desc }中`,
        mask: true
      })
    }

    let res = await wxp.request({
      url: `${ route }?${ params }`,
      method,
      data,
      complete
    })
    if (res.statusCode !== 200) {
      return Promise.reject()
    }

    return res.data
  }

  switch (method) {
    case 'DOWNLOAD':
      return download
    default:
      return apiRequest
  }
}

export default build(CONFIG.APICONFIG)

