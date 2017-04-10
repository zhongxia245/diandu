/***************************************************
 * 时间: 7/17/16 10:33
 * 作者: zhongxia
 * 说明: 点读点大小设置
 * 依赖: js/lib/bootstrap-slider 组件
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

  Util.loadCSS(getBasePath() + '/PointSetting.css');

})()


function PointSetting(selector, config) {
  this.selector = selector;

  config = config || {};
  this.callback = config.callback;
  this.data = {
    size: config.size || 100,
    color: config.color || 'rgb(255,255,255)'
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
  html += '        <img style="margin: 0 30% 0 18%;" src="imgs/point_setting/72.png" alt="72px">'
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
  var slideSize = new Slider('#dpsSize', {
    step: 25,
    min: 50,
    max: 200,
    value: that.data.size,
    tooltip: 'hide'
  })

  slideSize.on('slide', function (slideEvt) {
    $("#dpsSize").prev().find('.slider-handle').text(slideEvt.value)
    that.data.size = slideEvt.value;
    that.callback && that.callback(that.data);
  })

  $("#dpsSize").prev().find('.slider-handle').text(that.data.size)


  var tempColor = parseInt(that.data.color.replace('rgb', '').replace('(', '').replace(')', '').split(',')[0]);
  tempColor = 1 - tempColor / 255;

  var slideColor = new Slider('#dpsColor', {
    step: 0.05,
    min: 0,
    max: 1,
    value: tempColor,
    tooltip: 'hide'
  })
  slideColor.on('slide', function (slideEvt) {
    var value = slideEvt.value;
    value = Math.abs(value - 1);

    var colorVal = (value * 255).toFixed(0);
    var color = 'rgb(' + colorVal + ',' + colorVal + ',' + colorVal + ')';

    $('#dpsColor').prev().find('.slider-handle').css('background-color', color)
    that.data.color = color;
    that.callback && that.callback(that.data);
  })

  $("#dpsColor").prev().find('.slider-handle').css('background-color', that.data.color)
}

PointSetting.prototype.getData = function () {
  return this.data;
}