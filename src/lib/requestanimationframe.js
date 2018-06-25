window = this
/**
 * requestAnimationFrame polyfill v1.0.1
 * requires Date.now
 *
 * © Polyfiller 2015
 * Released under the MIT license
 * github.com/Polyfiller/requestAnimationFrame
 */
window.requestAnimationFrame || function () {

    'use strict';

    window.requestAnimationFrame = window.msRequestAnimationFrame
    || window.mozRequestAnimationFrame
    || window.webkitRequestAnimationFrame
    || function () {

        var fps = 40; // NOTE: 60fps在小米5上会极大影响渲染性能
        var delay = 1000 / fps;
        var animationStartTime = Date.now();
        var previousCallTime = animationStartTime;

        return function requestAnimationFrame(callback) {

            var requestTime = Date.now();
            var timeout = Math.max(0, delay - (requestTime - previousCallTime));
            var timeToCall = requestTime + timeout;

            previousCallTime = timeToCall;

            return window.setTimeout(function onAnimationFrame() {

                callback(timeToCall - animationStartTime);

            }, timeout);
        };
    }();

    window.cancelAnimationFrame = window.mozCancelAnimationFrame
    || window.webkitCancelAnimationFrame
    || window.cancelRequestAnimationFrame
    || window.msCancelRequestAnimationFrame
    || window.mozCancelRequestAnimationFrame
    || window.webkitCancelRequestAnimationFrame
    || function cancelAnimationFrame(id) {
           window.clearTimeout(id);
       };

}();
