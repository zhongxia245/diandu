/**
 * 时间:2016-04-19 23:05:36
 * 作者:zhongxia
 * 功能:记录日志
 */
"use strict";
window.LOG = (function (LOG) {
    LOG = {
        pre: 'diandu:',
        log: function (msg) {
            console.log(this.pre + msg, arguments)
        },
        info: function (msg) {
            console.info(this.pre + msg, arguments)
        },
        debug: function (msg) {
            console.debug(this.pre + msg, arguments)
        },
        error: function (msg) {
            console.error(this.pre + msg, arguments)
        }
    }
    return LOG;
})(window.LOG || {})