/**
 * 提供一些常用工具
 * @type {{getImageWH, getQueryStringByName}}
 */
window.Util = (function () {
  /**
   * 根据URL,获取文件的宽高
   * @param  {[type]}   src      [description]
   * @param  {[type]}   param    需要传到方法里面的参数
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  function getImageWH(src, param, callback) {
    var image = new Image();
    image.src = src;
    image.onload = function () {
      var obj = {
        w: image.width,
        h: image.height
      }
      callback && callback(obj, param);
    };
  }

  /**
   * 根据QueryString参数名称获取值
   * @param  {[type]} key [key]
   * @return {[type]}      [description]
   */
  function getQueryStringByName(key) {
    var result = location.search.match(new RegExp("[\?\&]" + key + "=([^\&]+)", "i"));
    if (result == null || result.length < 1) {
      return "";
    }
    return result[1];
  }

  /**
   * 关闭浏览器窗口
   * @constructor
   */
  function closeWebPage() {
    var userAgent = navigator.userAgent;
    if (userAgent.indexOf("Firefox") != -1 || userAgent.indexOf("Chrome") != -1) {
      window.location.href = "about:blank";
      window.opener = null;
      window.open("", "_self");
      window.close();
    } else {
      window.opener = null;
      window.open("", "_self");
      window.close();
    }
  }

  /**
   * 鼠标是点击或者移动
   * @param selector
   * @param cb_tap
   * @param cb_move
   */
  function Moblie_MoveOrTap($selector, cb_tap, cb_move) {
    var flag = false;
    $selector.off().on('touchstart touchmove touchend', function (event) {
      switch (event.type) {
        case 'touchstart':
          flag = false;
          break;
        case 'touchmove':
          flag = true;
          break;
        case 'touchend':
          if (!flag) {
            cb_tap && cb_tap(event);
          } else {
            cb_move && cb_move(event);
          }
          break;
      }
    })
  }


  /**
   * 判断是否是ＰＣ端
   */
  function IsPC() {
    var userAgentInfo = navigator.userAgent;
    var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
      if (userAgentInfo.indexOf(Agents[v]) > 0) {
        flag = false;
        break;
      }
    }
    return flag;
  }

  return {
    getImageWH: getImageWH,
    getQueryStringByName: getQueryStringByName,
    closeWebPage: closeWebPage,
    Moblie_MoveOrTap: Moblie_MoveOrTap,
    IsPC: IsPC
  }
})()