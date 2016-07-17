/***************************************************
 * 时间: 7/17/16 10:33
 * 作者: zhongxia
 * 说明: 点读点大小设置
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


  Util.loadCSS(getBasePath() + '/bootstrap-slider.min.css');
  Util.loadCSS(getBasePath() + '/PointSetting.css');
  Util.loadJS(getBasePath() + '/bootstrap-slider.min.js');
})()


function PointSetting(selector, callback) {
  this.selector = selector;
  this.callback = callback;
  this.data = {
    size: 100,
    color: 'rgb(255,255,255)'
  };
  this.render();
}

/**
 * 渲染页面, 绑定事件,初始化变量
 */
PointSetting.prototype.render = function () {
  var html = this.initHTML();
  $(this.selector).html(html);
  this.init();
}

/**
 * 初始化HTML页面
 */
PointSetting.prototype.initHTML = function () {
  var html = "";
  html += '<div class="dps-container">'
  html += '  <div class="dps-header">点读设置</div>'

  html += '  <div class="dps-content">'

  html += '    <div class="dps-content-size">'
  html += '      <h4>1. 请设置点读点大小的默认比例(%)</h4>'
  html += '      <p>(在点读点页可对点读点单独设置大小)</p>'
  html += '      <div class="dps-content-size-imgs">'
  html += '        <img src="imgs/point_setting/36.png" alt="36px">'
  html += '        <img style="margin:0 24%;" src="imgs/point_setting/72.png" alt="72px">'
  html += '        <img src="imgs/point_setting/144.png" alt="144px">'
  html += '      </div>'
  html += '      <input id="dpsSize" type="text" data-slider-handle="square"/>'
  html += '    </div>'

  html += '    <div class="dps-content-color">'
  html += '      <h4>2. 请设置点读页外空白区域的颜色</h4>'
  html += '      <input id="dpsColor" type="text" data-slider-handle="square"/>'
  html += '    </div>'
  html += '  </div>'
  html += '</div>	'

  return html;
}


/**
 * 初始化组件
 */
PointSetting.prototype.init = function () {
  var that = this;
  //初始化点读点大小滑块
  $("#dpsSize").slider({
      step: 25,
      min: 50,
      max: 200,
      value: 100,
      tooltip: 'hide'
    })
    .on('slide', function (slideEvt) {
      $("#dpsSize").prev().find('.slider-handle').text(slideEvt.value)
      that.data.size = slideEvt.value;
    })

  $("#dpsSize").prev().find('.slider-handle').text(100)

  //初始化颜色大小滑块
  $("#dpsColor").slider({
      step: 0.05,
      min: 0,
      max: 1,
      value: 0,
      tooltip: 'hide'
    })
    .on('slide', function (slideEvt) {
      var value = slideEvt.value;
      value = Math.abs(value - 1);
      var colorVal = value * 255;
      var color = 'rgb(' + colorVal + ',' + colorVal + ',' + colorVal + ')';
      $('#dpsColor').prev().find('.slider-handle').css('background', color)
      that.data.color = color;
    })

  $("#dpsColor").prev().find('.slider-handle').css('background', 'rgb(255,255,255)')
}

PointSetting.prototype.getData = function () {
  return this.data;
}