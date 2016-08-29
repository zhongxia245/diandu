/**
 * 时间:2016-04-19 23:05:36
 * 作者:zhongxia
 * 功能:记录日志
 */
"use strict";
window.Logger = (function (Logger) {
  Logger = {
    show: false,   //是否显示日志
    pre: '',
    log: function () {
      var args = this.args2arr(arguments);
      this.show && console.log(this.pre, args)
    },
    info: function () {
      var args = this.args2arr(arguments);
      this.show && console.info(this.pre, args)
    },
    debug: function () {
      var args = this.args2arr(arguments);
      this.show && console.debug(this.pre, args)
    },
    error: function () {
      var args = this.args2arr(arguments);
      this.show && console.error(this.pre, args)
    },
    /**
     * 把参数[非数组]变成数组
     * @param args
     * @returns {Array}
     */
    args2arr: function (args) {
      var arr = [];
      for (var i = 0; i < args.length; i++) {
        var item = args[i];
        arr.push(item);
      }
      return arr;
    }
  }
  return Logger;
})(window.Logger || {})