/***************************************************
 * 时间: 2016-11-27 09:38:00
 * 作者: zhongxia
 * 说明: 设置超链接点读点
 ***************************************************/

// 加载依赖的脚本和样式
;(function () {
  function getBasePath() {
    // 兼容Chrome 和 FF
    var currentPath = document.currentScript && document.currentScript.src || ''
    var paths = currentPath.split('/')
    paths.pop()
    return paths.join('/')
  }

  Util.loadCSS(getBasePath() + '/urlPoint.css')
})()

//======================================MAIN==============================================

var UrlPoint = function (selector, val, submitCallback) {
  this.selector = selector || 'body'
  this.submitCallback = submitCallback

  this.tpl = [
    '<div class="url-point-modal">',
    '   <div class="url-point-mask"></div>',
    '   <div class="url-point">',
    '       <div class="url-point-top">',
    '           <span>设置超链接</span>',
    '           <span class="glyphicon glyphicon-remove url-point-close" aria-hidden="true"></span>',
    '       </div>',
    '       <div class="url-point-content">',
    '       <input type="text" placeholder="设置超链接网址"/>',
    '       <span class="glyphicon glyphicon-ok url-point-ok" aria-hidden="true"></span>',
    '       </div>',
    '   </div>',
    '</div>'
  ].join('')

  this.init()
  this.setData(val)
}


/**
 * 初始化模板
 */
UrlPoint.prototype.initTpl = function () {
  var tpl = this.tpl
  var tpls = Handlebars.compile(tpl)
  return tpls(this.data)
}

/**
 * 初始化组件
 * @returns {OnOffImg}
 */
UrlPoint.prototype.init = function () {
  this.$container = $(this.selector)
  this.$container.append(this.initTpl())

  this.bindEvent()
  this.setData();
  return this
}


/**
 * 绑定事件
 */
UrlPoint.prototype.bindEvent = function () {
  var that = this;
  this.$urlModal = this.$container.find('.url-point-modal')
  this.$btnClose = this.$urlModal.find('.url-point-close')
  this.$btnOk = this.$urlModal.find('.url-point-ok')
  this.$input = this.$urlModal.find('input')

  //关闭
  this.$btnClose.on('click', function () {
    that.$urlModal.remove()
  })

  //提交的回调
  this.$btnOk.on('click', function () {
    var val = that.$input.val()
    that.submitCallback && that.submitCallback(val)
    that.$urlModal.remove()
  })
}

/**
 * 设置数据
 */
UrlPoint.prototype.setData = function (newVal) {
  this.$input.val(newVal)
}

