/***************************************************
 * 时间: 7/17/16 10:33
 * 作者: zhongxia
 * 说明: 数值加减器
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

  Util.loadCSS(getBasePath() + '/CNumber.css');
})()


function CNumber(selector, config) {
  this.selector = selector;

  config = config || {};
  this.defaultValue = config.defaultValue || 100;  //默认值
  this.val = config.val || 100; //当前值
  this.step = config.step || 25; //步长
  this.callback = config.callback;  //改变值之后  回调

  this.render();
}

/**
 * 渲染页面, 绑定事件,初始化变量
 */
CNumber.prototype.render = function () {
  var html = this.initHTML();
  $(this.selector).html(html);
  this.init();
  this.setColor();
}

/**
 * 初始化HTML页面
 */
CNumber.prototype.initHTML = function () {
  var html = "";
  html += '<div class="c-number">'
  html += '  <div class="c-number-val">' + this.val + '</div>'
  html += '  <div class="c-number-op">'
  html += '     <div class="c-number-op-plus">+</div>'
  html += '     <div class="c-number-op-sub">-</div>  '
  html += '  </div>'
  html += '</div>'
  return html;
}


/**
 * 初始化组件
 */
CNumber.prototype.init = function () {
  var that = this;

  this.$container = $(this.selector);
  this.$val = this.$container.find('.c-number-val')
  this.$plus = this.$container.find('.c-number-op-plus');
  this.$sub = this.$container.find('.c-number-op-sub');

  //点击加号处理
  this.$plus.on('click', function (e) {
    e.stopPropagation();
    that.val += that.step;
    that.val = that.val >= 200 ? 200 : that.val;

    that.callback && that.callback(that.val)
    that.$val.text(that.val)
    that.setColor();
  })

  //点击减号处理
  this.$sub.on('click', function (e) {
    e.stopPropagation();
    that.val -= that.step;
    that.val = that.val <= 50 ? 50 : that.val;

    that.callback && that.callback(that.val)
    that.$val.text(that.val)
    that.setColor();
  })
}

/**
 * 设置数值的颜色, 绿色为- , 橙色为+
 */
CNumber.prototype.setColor = function () {
  this.$val
    .removeClass('val-sub')
    .removeClass('val-default')
    .removeClass('val-plus');

  if (this.val > this.defaultValue) {
    this.$val.addClass('val-plus')
  }
  else if (this.val == this.defaultValue) {
    this.$val.addClass('val-default')
  }
  else {
    this.$val.addClass('val-sub')
  }
}