/***************************************************
 * 时间: 8/14/16 08:53
 * 作者: zhongxia
 * 说明: 生成point点的
 * 目前需要支持三种类型的点读点
 * 1. 常规点读点
 * 2. 带有标题的点读点
 * 3. 自定义图片的点读点
 ***************************************************/
window.CreatePoint = (function () {
  //带有标题的点读点类型样式, 音频,视频,图文, 考试
  var POINTTITLECLASS = {
    audio: 'cps-point-audio',
    video: 'cps-point-video',
    imgtext: 'cps-point-imgtext',
    exam: 'cps-point-exam'
  }

  /**
   * 生成 point
   * @param type 点读点类型
   * @param data 点读点的数据
   */
  function initPoint(type, data) {
    var html = "";
    var pointId = data.pointId;
    var pointIndex = data.pointIndex;
    var left = data.left;
    var top = data.top;

    var title = data.title;
    var pointType = data.pointType || 'audio';

    var pic = data.pic || {src: '', color: '', colorSize: ''};  //自定义图片需要 图片地址,发光颜色,光圈大小

    var style = "style='position:absolute; left:" + left + "px; top :" + top + "px;'";
    switch (type) {
      //常规点读点
      case 1:
        html = initNormalPoint(pointId, pointIndex, style);
        break;
      //带有标题的点读点
      case 2:
        html = initTitlePoint(pointId, style, pointType, title);
        break;
      //自定义图片的点读点
      case 3:
        html = initCustomImgPoint(pointId, style, pic)
        break;
      default:
        html = initCustomImgPoint(pointId, pointIndex, style, pic);
    }
  }

  /**
   * 生成普通Point
   * @param pointId 点读点id
   * @param index 点读点下标
   * @param style 坐标样式
   */
  function initNormalPoint(pointId, pointIndex, style) {
    var html = [];
    html.push('<div  class="radius" ' + style + '>');
    html.push('    <div data-type="point" id="' + pointId + '" class="radius-in">' + pointIndex + '</div>');
    html.push('</div>');
    return html.join('');
  }

  /**
   * 生成带有标题的point
   */
  function initTitlePoint(pointId, style, pointType, title) {
    var className = POINTTITLECLASS[pointType]
    var html = [];
    html.push('       <div data-type="point" id="' + pointId + '" style="' + style + '" class="point-title">')
    html.push('         <div class="cps-point-img ' + className + '"></div>')
    html.push('         <div class="cps-point-line"></div>')
    html.push('         <div class="cps-point-text">' + title + '</div>')
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

    html.push('<div data-type="point" id="' + pointId + '" style="' + style + '" class="point-img"></div>)');
    return html.join('');
  }

  return {
    initPoint: initPoint
  }
})();
