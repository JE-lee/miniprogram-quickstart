/**
 * @file 自定义的polyfill。跨平台兼容代码
 */

if (!Object.entries)
  Object.entries = function( obj ){
    var ownProps = Object.keys( obj ),
      i = ownProps.length,
      resArray = new Array(i); // preallocate the Array
    while (i--)
      resArray[i] = [ownProps[i], obj[ownProps[i]]];

    return resArray;
  };

if (!Object.values)
  Object.values = function(obj) {
    if (obj !== Object(obj))
      throw new TypeError('Object.values called on a non-object');
    var val=[],key;
    for (key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj,key)) {
        val.push(obj[key]);
      }
    }
    return val;
  }

// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
if (!String.prototype.padStart) {
  String.prototype.padStart = function padStart(targetLength,padString) {
      targetLength = targetLength>>0; //floor if number or convert non-number to 0;
      padString = String(padString || ' ');
      if (this.length > targetLength) {
          return String(this);
      }
      else {
          targetLength = targetLength-this.length;
          if (targetLength > padString.length) {
              padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
          }
          return padString.slice(0,targetLength) + String(this);
      }
  };
}
