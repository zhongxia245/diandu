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
  this.maxVaule = config.maxValue || 200;   //最大比例
  this.minValue = config.minValue || 25;    //最小比例
  this.defaultValue = config.defaultValue || 100;  //默认值
  this.val = config.val; //当前值
  this.step = config.step || 25; //步长
  this.pointSelector = config.pointSelector || ''; //关联的点读点选择器
  this.flag = config.flag || false;  //是否需要添加修改的标识
  this.canInput = config.canInput || false; //是否可以双击手动输入

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

  if (this.flag) {
    this.setFlag();
  }
}

/**
 * 初始化HTML页面
 */
CNumber.prototype.initHTML = function () {
  var html = "";
  html += '<div class="c-number">'
  html += '  <div class="c-number-val">' + (this.val || this.defaultValue) + '</div>'
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
  this.$pointSelector = $(this.pointSelector);


  if (this.canInput) {
    //双击,可以输入值
    this.$val.on('click', function (e) {
      that.$val.attr('contenteditable', true);
    })
    this.$val.on('keydown', function (e) {
      if (e.keyCode === 13) {
        var val = parseInt(that.$val.text());
        that.setVal(val);
        that.$val.removeAttr('contenteditable');
        that.callback && that.callback(val);
      }
    })
    this.$val.on('blur', function () {
      var val = parseInt(that.$val.text());
      that.setVal(parseInt(that.$val.text()));
      that.$val.removeAttr('contenteditable');
      that.callback && that.callback(val);
    })
  }


  //点击加号处理
  this.$plus.on('click', function (e) {
    e.stopPropagation();
    that.val = parseInt(that.$val.text()) || that.defaultValue;
    that.val += that.step;
    that.val = that.val >= that.maxVaule ? that.maxVaule : that.val;

    that.callback && that.callback(that.val)
    that.setColor();
    that.setFlag();
  })

  //点击减号处理
  this.$sub.on('click', function (e) {
    e.stopPropagation();
    that.val = parseInt(that.$val.text()) || that.defaultValue;
    that.val -= that.step;
    that.val = that.val <= that.minValue ? that.minValue : that.val;

    that.callback && that.callback(that.val)
    that.setColor();
    that.setFlag();
  })
}

/**
 * 设置数值的颜色和值
 */
CNumber.prototype.setColor = function () {
  this.setVal(this.val);
}

/**
 * 设置数值的颜色, 绿色为- , 橙色为+
 */
CNumber.prototype.setVal = function (val) {

  val = val > this.maxVaule ? this.maxVaule : val;
  val = val < this.minValue ? this.minValue : val;
  this.val = val;

  this.$val.text(val)
  this.$val
    .removeClass('val-sub')
    .removeClass('val-default')
    .removeClass('val-plus');

  if (val > this.defaultValue) {
    this.$val.addClass('val-plus')
  }
  else if (val == this.defaultValue) {
    this.$val.addClass('val-default')
  }
  else {
    this.$val.addClass('val-sub')
  }
}


/**
 * [提供给外部使用]
 * 设置数值的颜色, 绿色为- , 橙色为+
 * @param $selector 展示值的div
 * @param val 值
 */
CNumber.prototype.setColorOut = function ($selector, val) {
  var defaultValue = 100;

  $selector.text(val);
  $selector
    .removeClass('val-sub')
    .removeClass('val-default')
    .removeClass('val-plus');

  if (val > defaultValue) {
    $selector.addClass('val-plus')
  }
  else if (val == defaultValue) {
    $selector.addClass('val-default')
  }
  else {
    $selector.addClass('val-sub')
  }
}

/**
 * 设置标识, 标识已经对单个点读点修改过了
 */
CNumber.prototype.setFlag = function () {
  this.$pointSelector && this.$pointSelector.attr('data-change', 1)  //标记已经修改单个点读点的大小
  this.$val && this.$val.attr('data-change', 1);//显示值的div,也加上标识
}

