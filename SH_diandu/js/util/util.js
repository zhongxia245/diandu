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
   * 获取当前脚本文件路径
   * @param {any} currentPath 
   * @returns 
   */
  function getBasePath(currentPath) {
    // 兼容Chrome 和 FF
    var currentPath = currentPath || ''
    var paths = currentPath.split('/')
    paths.pop()
    return paths.join('/')
  }

  /**
   * 检查样式里面是否存在某个样式名
   * @param string className 
   * @param array  not_allow_drag_class
   */
  function hasClass(className, not_allow_drag_class) {
    if (!not_allow_drag_class) not_allow_drag_class = []
    if (!className) className = ''

    for (var i = 0; i < not_allow_drag_class.length; i++) {
      if (className.indexOf(not_allow_drag_class[i]) !== -1) {
        return true;
      }
    }
    return false;
  }

  /**
   * 移动端拖动
   * @param selector
   */
  function touchDrag(selector, callback, not_allow_drag_class) {
    var moveX, moveY, startX, startY, left = 0, top = 0;

    $(selector)
      .on("touchstart", function (event) {
        if (!hasClass($(event.target).attr('class'), not_allow_drag_class)) {
          event.preventDefault();
          var touchPros = event.touches[0];
          startX = touchPros.clientX;
          startY = touchPros.clientY;

          if ($(selector).css('left') !== 'auto') {
            left = parseFloat($(selector).css('left').replace('px', '').replace('rem', ''))
            top = parseFloat($(selector).css('top').replace('px', '').replace('rem', ''))
          }
        }
      })
      .on("touchmove", function (event) {
        if (!hasClass($(event.target).attr('class'), not_allow_drag_class)) {
          event.preventDefault();

          var touchPros = event.touches[0];
          moveX = touchPros.clientX - startX + left;
          moveY = touchPros.clientY - startY + top;
          if (callback) callback(event, moveX, moveY)
        }
      })
  }

  /**
   * PC端拖动
   * @param selector
   * @param callback
   * @param not_allow_drag_class 点击selector里面的字节点，一些子节点点击不允许拖动
   */
  function mouseDrag(selector, callback, not_allow_drag_class) {
    var moveX, moveY, startX, startY, left = 0, top = 0, flag = false;

    $(selector)
      .on("mousedown", function (event) {
        if (!hasClass($(event.target).attr('class'), not_allow_drag_class)) {
          event.preventDefault();
          startX = event.clientX;
          startY = event.clientY;

          if ($(selector).css('left') !== 'auto') {
            left = parseFloat($(selector).css('left').replace('px', '').replace('rem', ''))
            top = parseFloat($(selector).css('top').replace('px', '').replace('rem', ''))
          }
          flag = true;

          $(document)
            .on("mousemove", function (event) {
              event.preventDefault();
              if (flag) {
                moveX = event.clientX - startX + left;
                moveY = event.clientY - startY + top;

                callback(event, moveX, moveY)
              }
            })
            .on('mouseup', function () {
              flag = false;
            })
        }
      })
  }

  /**
   * 兼容PC和移动端的拖动
   */
  function drag(selector, callback, not_allow_drag_class) {
    mouseDrag(selector, callback, not_allow_drag_class);
    touchDrag(selector, callback, not_allow_drag_class);
  }

  /**
   * 把图片转换成base64的数据格式
   * gif图会变成静态图
   * @param {any} path 
   * @param {any} callback 
   */
  function getImageBase64(path, callback) {
    var canvas = document.createElement('canvas');

    var ctx = canvas.getContext("2d");
    var img = new Image();
    //指定图片的URL
    img.src = path;
    img.onload = function (e) {
      var width = e.target.width;
      var height = e.target.height;
      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);
      var cropStr = canvas.toDataURL("image/png", 0.7)
      callback(cropStr)
    }
  }

  /**
   * 获取模板
   * @param {any} url 
   * @param {any} callback 
   */
  function getTpl(url, callback) {
    $.ajax({
      url: url,
      success: function (tpl) {
        callback(tpl)
      }
    })
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
    getBasePath: getBasePath,
    touchDrag: touchDrag,
    mouseDrag: mouseDrag,
    drag: drag,
    getImageBase64: getImageBase64,
    getTpl: getTpl
  }
})()

