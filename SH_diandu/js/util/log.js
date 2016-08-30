/**
 * 时间:2016-04-19 23:05:36
 * 作者:zhongxia
 * 功能:记录日志
 */
"use strict";
window.Logger = (function (Logger) {
  Logger = {
    show: true,   //是否显示日志
    log: function () {
      this.show && console.log.apply(null, arguments)
    },
    info: function () {
      this.show && console.info.apply(null, arguments)
    },
    debug: function () {
      this.show && console.debug.apply(null, arguments)
    },
    error: function () {
      this.show && console.error.apply(null, arguments)
    }
  }
  return Logger;
})(window.Logger || {})