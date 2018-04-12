const MILLISECONDS_PER_DAY = 86400000

function isEmptyObject(e) {
  return !Object.keys(e).length
}

function formatDate(date, splitter = '/') {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  return [year, month, day].map(formatNumber).join(splitter)
}

function formatTime(date, splitter = '/') {
  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()

  return formatDate(date, splitter) + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

/**
 * 人性化时间显示
 * @param  {Date} date 日期对象,或能转为日期的数值
 * @return {String}    人性化时间
 */
function humanizeTime(date) {
  date = new Date(date)
  let hour = date.getHours()
  let minute = date.getMinutes()
  let str = [hour, minute].map(formatNumber).join(':')

  if (isToday(date)) {
    return `今天${ str }`
  } else if (isYesterday(date)) {
    return `昨天${ str }`
  } else {
    return formatDate(date)
  }
}

function formatTimeStamp($time) {
  let interval = Math.ceil((new Date().getTime() - $time * 1000) / 1000)
  let referenceArr = ['86400', '3600', '60', '1']
  let reference = {
    '86400': '天',
    '3600': '小时',
    '60': '分钟',
    '1': '秒'
  }
  for (let i = 0; i < referenceArr.length; i++) {
    let attr = referenceArr[i]
    let tempResult = Math.floor(interval / Number(attr))
    if (tempResult !== 0) {
      if (attr === '86400') {
        if (tempResult === 1) {
          return '昨天'
        } else {
          return formatDate(new Date($time * 1000), '-')
        }
      }
      return tempResult + reference[attr] + '前'
    }
  }

}

/**
 * 判断日期对象，时间戳，时间字符串是否今天
 * @param  {Date|String|Number}  date 日期
 * @return {Boolean}      是否
 */
function isToday(date) {
  var today = new Date()
  date = new Date(date)
  return today.setHours(0, 0, 0, 0) === date.setHours(0, 0, 0, 0)
}

/**
 * 判断日期对象，时间戳，时间字符串是否昨天
 * @param  {Date|String|Number}  date 日期
 * @return {Boolean}      是否
 */
function isYesterday(date) {
  var today = new Date()
  var yesterday = new Date(today.getTime() - MILLISECONDS_PER_DAY)
  date = new Date(date)
  return yesterday.setHours(0, 0, 0, 0) === date.setHours(0, 0, 0, 0)
}


//  format : y年m月d日 h:m:s
function formatLocalDate(time, format = 'Y年M月D日 h:m:s') {
  var date = new Date(time * 1000)
  var args = {
    Y: date.getFullYear(),
    M: formatNumber(date.getMonth() + 1),
    D: formatNumber(date.getDate()),

    h: formatNumber(date.getHours()),
    m: formatNumber(date.getMinutes()),
    s: formatNumber(date.getSeconds())
  }

  return format.replace(/Y|M|D|h|m|s/g, (match) => {
    return args[match]
  })
}
function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function convertNumber(n) {
  if (n === null || n === undefined) {
    return 0
  }
  n = n.toString()
  if (n.length >= 5) {
    return n.slice(0, -3) + 'k+'
  }
  return n
}

function formatDecimal(val = '') {
  val = '' + val
  val = val.replace(/^\./g, '0.')
  val = val.replace(/\.{2,}/g, '.') // 只保留第一个. 清除多余的
  return val.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.')
}

function isVerifyCode(val) {
  return /^\d{4}$/.test(val)
}

// String
function isMobile(str) {
  return /^1\d{10}$/.test(str)
}

function isEmail(str) {
  return /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/.test(str)
}

function isNum(value) {
  return /^[0-9-]*$/.test(value)
}

function isTel(str) {
  let re = /^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/
  // let re = /^((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)$/
  return re.test(str)
}
function isChn(str) {
  return /^[\u4E00-\u9FA5]+$/.test(str)
}
function isPrice(str) {
  return /(^[1-9](\d+)?(\.\d{1,2})?$)|(^(0){1}$)|(^\d\.\d{1,2}?$)/.test(str)
}
function isPositiveInt(str) {
  return /^[1-9][0-9]*$/.test(str)
}
function formatMobile(mobile, splitter = '-') {
  return `${ mobile.slice(0, 3) }${ splitter }${ mobile.slice(3, 7) }${ splitter }${ mobile.slice(7) }`
}
function formatInputMobile(mobile, split = ' ') {
  let len = mobile.length
  let mArr = [mobile.slice(0, 3)]
  if (len > 3) {
    mArr.push(mobile.slice(3, 7))
  }
  if (len > 7) {
    mArr.push(mobile.slice(7))
  }
  // console.log('mArr', mArr)
  return mArr.join(split)
}

/**
 * 获取字符串的字节数
 * @param  {String} str    字符串
 * @return {Number}        字节数
 */
function getByteLength(b) {
  if (typeof b === 'undefined') {
    return 0
  }
  /* eslint-disable */
  var a = b.match(/[^\x00-\x80]/g)
  /* eslint-enable */
  return (b.length + (!a ? 0 : a.length))
}

/**
 * 按字节数截取字符串
 * @param  {String} str    字符串
 * @param  {Number} length 要截取的长度，按中文长度算
 * @return {String}        字符串
 */
function sliceByByte(str, length) {
  var ret = ''
  var byteLength = 0
  for (let i = 0, len = str.length; i < len; i++) {
    if (byteLength / 2 >= length) break
    ret += str[i]
    byteLength = getByteLength(ret)
  }
  return ret
}

/**
 * 过滤掉字符串中包含的 Emoji
 * @param  {String} str 字符串
 * @return {String}     过滤后的字符串
 */
function filterEmoji(str) {
  // NOTE: https://medium.com/reactnative/emojis-in-javascript-f693d0eb79fb
  /* eslint-disable */
  var reg = new RegExp('(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])', 'g')
  /* eslint-enable */
  return str.replace(reg, '')
}

// 系列化对象为 search 参数
// @todo 目前只实现了最简单的系列化，不包括递归及对象处理
function serializeParams(obj) {
  var result = ''
  // var searchParams = new URLSearchParams()
  // return searchParams.toString()
  for (let i in obj) {
    if (obj.hasOwnProperty(i)) {
      result += (result ? '&' : '') + (i + '=' + obj[i])
    }
  }
  return result
}


/**
 * 将字符串转首字母大写
 * @param  {String} str  源字符串
 * @return {String}      转化后的字符串
 */
function ucFirst(str) {
  if (typeof str === 'string') {
    return str.slice(0, 1).toUpperCase() + str.slice(1)
  }
  return str
}


/**
 * 将数据按指定数目分成二维数组
 * @param  {Array} arr    源数组
 * @param  {Number} count 每数组长度
 * @return {Array}        二维数组
 */
function chunk(arr, count = 3) {
  if (!arr || !arr.length) return []
  let ret = []
  let i = 0
  for (; i <= arr.length; i += count) {
    ret.push(arr.slice(i, i + count))
  }
  return ret
}

/**
 * 目前小程序官方 PHP-SDK 存在一些问题，当返回的 JSON 数据里有 BOM 头时，在安卓下会解析报错
 * 此方法用于判断是否有 BOM 头并处理成正确的 JSON
 * @param  {Object|String} res 后端返回的数据
 * @return {Object}        经过正确解析后的数据
 */
function clearBOMAndParseJson(res) {
  if (typeof res === 'string') {
    try {
      return JSON.parse(res.trim())
    } catch (e) {
      return {}
    }
  }
  return res
}

/* eslint-disable */
// Is a given variable an object?
var isObject = function(obj) {
  var type = typeof obj
  return type === 'function' || type === 'object' && !!obj
}

var allKeys = function(obj) {
  if (!isObject(obj)) return []
  var keys = []
  for (var key in obj) keys.push(key)
  return keys
}

// An internal function for creating assigner functions.
var createAssigner = function(keysFunc, undefinedOnly) {
  return function(obj) {
    var length = arguments.length
    if (length < 2 || obj == null) return obj
    for (var index = 1; index < length; index++) {
      var source = arguments[index],
        keys = keysFunc(source),
        l = keys.length
      for (var i = 0; i < l; i++) {
        var key = keys[i]
        if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key]
      }
    }
    return obj
  }
}

var extend = createAssigner(allKeys)
/* eslint-enable */

function groupByKey(list, groupKey, cb) {
  var groupedList = {}

  list.forEach((item) => {
    let key = item[groupKey]
    cb && cb(key, item)
    groupedList[key] = groupedList[key] || []
    groupedList[key].push(item)
  })

  return {
    groupedList: groupedList,
    groupedKeys: Object.keys(groupedList).sort()
  }
}

/**
 * 字母索引分组，此处的特殊处理是将非字母的排到后面
 * @param  {Array}  list  列表
 * @param  {String} groupKey   排序依据字段，该字段必须是一个以秒为单位的时间戳
 * @return {Object}       {groupedKeys, groupedList}  groupedKeys 组名列表，groupedList 分组数据
 */
function groupByLetterKey(list, groupKey, cb) {
  let result = groupByKey(list, groupKey, cb)
  // let groupedKeys = result.groupedKeys

  // if( groupedKeys[0] == '#' ){
  //   groupedKeys.push( groupedKeys.shift() );
  // }

  return result
}

/**
 * 将列表按时间倒序分组
 * @param  {Array}  list  列表
 * @param  {String} key   排序依据字段，该字段必须是一个以秒为单位的时间戳
 * @return {Object}       {groupedKeys, groupedList}  groupedKeys 组名列表，groupedList 分组数据
 */
function groupByTimestampDesc(list, groupkey) {
  var groupedKeys = [], groupedList = {}
  var sortedList = extend([], list)

  sortedList.sort((itemA, itemB) => {
    return itemA[groupkey] < itemB[groupkey] ? 1 : -1
  })

  sortedList.forEach((item) => {
    let date = new Date(item[groupkey] * 1000)
    let key

    if (isToday(date)) {
      key = '今天'
    } else if (isYesterday(date)) {
      key = '昨天'
    } else {
      key = formatDate(date, '-')
    }

    if (!groupedList[key]) {
      groupedList[key] = []
      groupedKeys.push(key)
    }

    groupedList[key].push(item)
  })

  return {
    groupedKeys: groupedKeys,
    groupedList: groupedList
  }
}


/**
 * 简单版本 modal 提示，类 alert 效果
 * @param  {string} content 提示内容
 * @param  {string} title   提示标题
 * @return {object}
 */
function qAlert(content = '', title = '', confirmText = '确定') {
  return wx.showModal({
    title,
    content,
    confirmText,
    showCancel: false
  })
}

function requestFailTip(e, title, content = '网络不稳定，请尝试下拉页面刷新') {
  let ignoreErrMsg = [
    'request:fail:interrupted',
    'request:fail interrupted',
    'request:fail createRequestTask:fail:interrupted'
  ]
  // 退出小程序会引起连接中断从而导致报错，这里处理一下中断的情况
  if (e && ignoreErrMsg.indexOf(e.errMsg) !== -1) {
    console.log('由小程序退出而引起的网络中退')
  } else {
    qAlert(content, title)
  }
}

function successTip(tip, success) {
  wx.showToast({
    title: `${ tip }成功`,
    duration: 500,
    success
  })
}

// 显示提示窗
function showTips(conf) {
  wx.showModal(Object.assign({}, conf, {
    success: (res) => {
      if (res.confirm) {
        conf.success && conf.success()
      }
    }
  }))
}

/**
 * 解析url中的参数
 * @param  {String} href 路径，小程序页面路径或URL
 * @return {Object}      { url, query }
 */
function parseUrl(href = '') {
  // 处理掉如 /pages/index 这类路径的第一个斜杆
  href = href.substr(href.charAt(0) === '/' ? 1 : 0)

  let query = {}
  let [url, params] = href.split('?')

  if (params) {
    params.split('&').forEach((item) => {
      let [key, value] = item.split('=')
      query[key] = value
    })
  }

  return {
    url,
    query
  }
}

/**
 * 截取字符串
 * @param {*} name
 * @param {*} len
 * @param {*} suffix
 */
function sliceStr(name = '', len = 10, suffix = '...') {
  return name.length > len ? name.slice(0, len) + suffix : name
}

/**
 * 获得文件后缀名
 * @param  {string}     str  文件名
 * @return {string}      文件后缀名
 */
function getExtname(str) {
  str = str + ''
  let lastIndex = str.lastIndexOf('.')
  return lastIndex !== -1 ? str.slice(lastIndex + 1) : ''
}

/**
 * 获得文件的类型
 * [parseUrl description]
 * @param  {[name]} href [description]
 * @return {[fileType]}      [description]
 */
function getFileType(name) {
  let fileType = ''
  name = getExtname(name)

  if (/pdf/.test(name)) {
    fileType = 'pdf'
  } else if (/doc|docx/.test(name)) {
    fileType = 'doc'
  } else if (/ppt|pps|pptx/.test(name)) {
    fileType = 'ppt'
  } else if (/xls|xlsx|xlsm|xlt|xltx|xltm/.test(name)) {
    fileType = 'xls'
  }
  return fileType
}

/**
 * 转换文件的大小
 */
function getFileSize(size) {
  let bytes = 1024
  let unitArray = ['Byte', 'K', 'M', 'G']
  let unitIdx = 0

  size = Math.max(parseInt(size, 10) || 0, 0)

  while (size >= bytes && unitIdx < unitArray.length - 1) {
    size /= bytes
    unitIdx++
  }

  return +size.toFixed(1) + unitArray[unitIdx]
}

/**
 * 字符串转驼峰
 * @param {*} str
 */
function transformCamel(str, symbol = '-') {
  var re = new RegExp(`${ symbol }(\\w)`, 'g')
  return str.replace(re, ($0, $1) => {
    return $1.toUpperCase()
  })
}

/**
 * 对 onLaunch 参数做兼容处理
 * 微信低版本安卓里的 e.query 有可能出现格式如“{uid=3}”的字符串，这里做兼容
 * @method  parseLaunchQueryString
 * @param   {string}  query  参数对（可能出现字符串）
 * @return  {object}  参数对
 */
function parseLaunchQueryString(query) {
  if (typeof query === 'object') {
    return query

  } else if (typeof query === 'string') {
    query = query.replace(/[{}]/g, '')
    let result = {}
    let fields = query.split(',')

    fields.forEach((field) => {
      let [key, value] = field.split('=')
      result[key] = value
    })

    return result
  }
  return {}
}

export default {
  isEmptyObject,
  extend,
  formatNumber,
  formatDate,
  formatTime,
  formatLocalDate,
  formatDecimal,
  humanizeTime,
  isVerifyCode,
  isToday,
  isYesterday,
  isMobile,
  isEmail,
  isChn,
  isNum,
  isTel,
  isPrice,
  isPositiveInt,
  chunk,
  clearBOMAndParseJson,
  formatMobile,
  formatInputMobile,
  ucFirst,
  serializeParams,
  groupByKey,
  groupByLetterKey,
  groupByTimestampDesc,
  isObject,
  allKeys,
  qAlert,
  requestFailTip,
  convertNumber,
  filterEmoji,
  getByteLength,
  sliceByByte,
  formatTimeStamp,
  successTip,
  showTips,
  parseUrl,
  sliceStr,
  getExtname,
  getFileType,
  getFileSize,
  transformCamel,
  parseLaunchQueryString
}
