/***************************************************
 * 时间: 8/14/16 08:53
 * 作者: zhongxia
 * 说明: 生成point点的
 * 目前需要支持三种类型的点读点
 * 1. 常规点读点
 * 2. 带有标题的点读点  [PC创建页面,展示页面都使用]
 * 3. 自定义图片的点读点 [PC创建页面,展示页面都使用]
 ***************************************************/
//加载依赖的脚本和样式
(function () {
  /**
   * 获取当前脚本的目录
   * @returns {string}
   */
  function getBasePath() {
    //兼容Chrome 和 FF
    var currentPath = document.currentScript && document.currentScript.src || '';
    var paths = currentPath.split('/');
    paths.pop();
    return paths.join('/');
  }

  Util.loadCSS(getBasePath() + '/CreatePoint.css');
})()


window.CreatePoint = (function () {
  //带有标题的点读点类型样式, 音频,视频,图文, 考试
  var POINTTITLECLASS = {
    audio: 'create-point-title-audio',
    video: 'create-point-title-video',
    imgtext: 'create-point-title-imgtext',
    exam: 'create-point-title-exam'
  }

  /**
   * 生成 point
   * @param type 点读点类型
   * @param data 点读点的数据
   */
  function initPoint(type, data) {
    var html = "";
    var pointId = data.pointId;
    var pointIndex = data.pointId && data.pointId.split('_')[1];
    var left = data.left || "";
    var top = data.top || "";
    var scale = data.scale || 1;  //缩放的比例, 主要在展示页面用
    var className = data.className; //展示页面  添加到点读点的样式

    left = typeof(left) === 'number' ? left : left.replace('px', '');
    top = typeof(top) === 'number' ? top : top.replace('px', '');

    var title = data.title || {};
    var pic = data.pic || {src: '', color: '', colorSize: ''};  //自定义图片需要 图片地址,发光颜色,光圈大小

    var style = "position:absolute; left:" + left + "px; top :" + top + "px;";

    if (scale !== 1) {
      style += 'transform: scale(' + scale + ');';
    }

    switch (type) {
      //常规点读点
      case 1:
        html = initNormalPoint(pointId, pointIndex, style);
        break;
      //带有标题的点读点
      case 2:
        html = initTitlePoint(pointId, style, title);
        break;
      //自定义图片的点读点
      case 3:
        html = initCustomImgPoint(pointId, style, pic)
        break;
      //展示页面  自定义标题
      case 4:
        html = initMTitlePoint(pointId, style, title, className)
        break;
      //展示页面  自定义图片
      case 5:
        html = initMCustomImgPoint(pointId, style, pic, className)
        break;
      default:
        html = initCustomImgPoint(pointId, pointIndex, style);
    }

    return html;
  }

  /**
   * 生成普通Point
   * @param pointId 点读点id
   * @param index 点读点下标
   * @param style 坐标样式
   */
  function initNormalPoint(pointId, pointIndex, style) {
    var html = [];
    html.push('<div data-type="point" id="' + pointId + '"  class="radius" style="' + style + '">');
    html.push('    <div class="radius-in">' + pointIndex + '</div>');
    html.push('</div>');
    return html.join('');
  }

  /**
   * 生成带有标题的point
   */
  function initTitlePoint(pointId, style, titleObj) {
    var title = titleObj.title;
    var pointType = titleObj.pointType || 'audio';
    var className = POINTTITLECLASS[pointType]
    var id = "";
    pointId && (id = 'id="' + pointId + '"')
    var html = [];
    html.push('       <div data-type="point" ' + id + ' style="' + style + '" class="create-point-title">')
    html.push('         <div class="create-point-title-img ' + className + '"></div>')
    html.push('         <div class="create-point-title-line"></div>')
    html.push('         <div class="create-point-title-text">' + title + '</div>')
    html.push('       </div>')
    return html.join('');
  }


  /**
   * 生成自定义图片的point
   */
  function initCustomImgPoint(pointId, style, pic) {
    var html = [];
    var dropFilter = "drop-shadow(0px 0px " + pic.colorSize + "px " + pic.color + ")"

    style += 'background: url(' + pic.src + ') no-repeat ;background-size: contain; background-position:center;';
    style += 'filter:' + dropFilter + ';-webkit-filter:' + dropFilter + ';';

    var id = "";
    pointId && (id = 'id=' + pointId)

    html.push('<div data-type="point" ' + id + '  style="' + style + '" class="create-point-img"></div>)');
    return html.join('');
  }

  /**
   * [展示页面,移动端]生成带有标题的point
   * @param outClassName 外部传进来的样式
   */
  function initMNormalPoint(pointId, style, titleObj, outClassName) {
    var title = titleObj.title;
    var pointType = titleObj.pointType || 'audio';
    var className = POINTTITLECLASS[pointType]

    var id = "";
    pointId && (id = 'data-id="' + pointId + '"')
    var html = [];
    html.push('       <div data-type="point" ' + id + ' style="' + style + '" class="create-point-title ' + outClassName + '">')
    html.push('         <div class="create-point-title-img ' + className + '"></div>')
    html.push('         <div class="create-point-title-line"></div>')
    html.push('         <div class="create-point-title-text">' + title + '</div>')
    html.push('       </div>')
    return html.join('');
  }

  /**
   * [展示页面,移动端]生成带有标题的point
   * @param outClassName 外部传进来的样式
   */
  function initMTitlePoint(pointId, style, titleObj, outClassName) {
    var title = titleObj.title;
    var pointType = titleObj.pointType || 'audio';
    var className = POINTTITLECLASS[pointType]

    var id = "";
    pointId && (id = 'data-id="' + pointId + '"')
    var html = [];
    html.push('       <div data-type="point" ' + id + ' style="' + style + '" class="create-point-title ' + outClassName + '">')
    html.push('         <div class="create-point-title-img ' + className + '"></div>')
    html.push('         <div class="create-point-title-line"></div>')
    html.push('         <div class="create-point-title-text">' + title + '</div>')
    html.push('       </div>')
    return html.join('');
  }

  /**
   * [展示页面,移动端]生成自定义图片的point
   * @param outClassName 外部传进来的样式
   */
  function initMCustomImgPoint(pointId, style, pic, outClassName) {
    var html = [];
    var dropFilter = "drop-shadow(0px 0px " + pic.colorSize + "px " + pic.color + ")"

    style += 'background: url(' + pic.src + ') no-repeat ;background-size: contain; background-position:center;';
    style += 'filter:' + dropFilter + ';-webkit-filter:' + dropFilter + ';';

    var id = "";
    pointId && (id = 'data-id=' + pointId)

    html.push('<div data-type="point" ' + id + '  style="' + style + '" class="create-point-img ' + outClassName + '"></div>)');
    return html.join('');
  }

  return {
    initPoint: initPoint
  }
})();
