/**
 * 提供一些常用工具
 * @type {{getImageWH, getQueryStringByName}}
 */
window.Util = (function () {
  /**
   * 根据URL,获取图片的宽高
   * @param src 图片地址
   * @param callback 回调,返回 w  h 属性
   */
  function getImageWH(src, callback) {
    var image = new Image();
    image.src = src;
    image.onload = function () {
      var obj = {
        w: image.width,
        h: image.height
      }
      callback && callback(obj);
    };
  }

  /**
   * 根据URL,获取视频的宽高
   * @param src 视频地址
   * @param callback 获取后的回调
   */
  function getVideoWH(src, callback) {
    var video = document.createElement('video')
    video.setAttribute('src', src);
    video.oncanplaythrough = function () {
      var obj = {
        w: this.videoWidth,
        h: this.videoHeight
      }
      callback && callback(obj);
      video = null;
    };
  }

  /**
   * 根据QueryString参数名称获取值
   * @param  {[type]} key [key]
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

  /**
   * 根据 ids 获取数据 (ids : 1_1)
   * @param data
   * @param ids
   */
  function getPointDataByIds(data, ids) {
    var _ids = ids.split('_');
    var pages = data.pages;
    var pointsData = pages[_ids[0]]['points'];
    return pointsData[_ids[1]];
  }

  /**
   * 加载样式
   * @param path
   */
  function loadCSS(path) {
    if (!path || path.length === 0) {
      throw new Error('argument "path" is required !');
    }
    var head = document.getElementsByTagName('head')[0];
    var link = document.createElement('link');
    link.href = path;
    link.rel = 'stylesheet';
    link.type = 'text/css';
    head.appendChild(link);
  }

  /**
   * 加载脚本
   * @param path
   */
  function loadJS(path) {
    if (!path || path.length === 0) {
      throw new Error('argument "path" is required !');
    }
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.src = path;
    script.type = 'text/javascript';
    head.appendChild(script);
  }

  /**
   * 移动端拖动
   * @param selector
   */
  function touchDrag(selector, callback) {
    var moveX, moveY, startX, startY;
    $(document).on("touchstart", selector, function (event) {
      var touchPros = event.touches[0];
      startX = touchPros.clientX - event.currentTarget.offsetLeft;
      startY = touchPros.clientY - event.currentTarget.offsetTop;
      //return false;
    }).on("touchmove", selector, function (event) {
      var touchPros = event.touches[0];
      moveX = touchPros.clientX - startX;
      moveY = touchPros.clientY - startY;

      callback(event, moveX, moveY)
    });
  }

  return {
    getImageWH: getImageWH,
    getVideoWH: getVideoWH,
    getQueryStringByName: getQueryStringByName,
    closeWebPage: closeWebPage,
    Moblie_MoveOrTap: Moblie_MoveOrTap,
    IsPC: IsPC,
    getPointDataByIds: getPointDataByIds,
    loadCSS: loadCSS,
    loadJS: loadJS,
    touchDrag: touchDrag
  }
})()

