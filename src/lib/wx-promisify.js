/**
 * @file 增加全局变量wxp，是原生wx的promise版。实现参考了wepy项目
 */

/** @global */
wxp = {}

function promisify(api) {
  wxp[api] = (options = {}, ...rest) => {
    return new Promise((resolve, reject) => {
      Object.assign(options, {
        success: resolve,
        fail: reject
      })
      wx[api](options, ...rest)
    })
  }
}

Object.keys(wx).filter(k => typeof wx[k] === 'function')
  .forEach(promisify)
