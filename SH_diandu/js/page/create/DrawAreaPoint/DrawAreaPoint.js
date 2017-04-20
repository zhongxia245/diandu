(function () {
  var currentScriptSrc = Util.getBasePath(document.currentScript.src);
  Util.loadCSS(currentScriptSrc + '/style.css')
  Util.loadJS(currentScriptSrc + '/Modal_3DViewer/Modal_3DViewer.js')
})()

window.DrawAreaPoint = (function () {
  var currentScriptSrc = Util.getBasePath(document.currentScript.src);
  /**
   * 点读点类型弹窗
   * @param {any} selector 弹窗对应的点读点
   * @param {any} selectedType  选中的类型 
   */
  function DrawAreaPoint(options) {
    var that = this
    that.options = options;
    that.submitCallback = options.callback;

    that.data = options.data || {}
    // 根据模板引擎生成页面
    Util.getTpl(currentScriptSrc + '/tpl.html', function (tpl) {
      var tpls = Handlebars.compile(tpl)
      $(options.id).append(tpls({ index: options.pointIndex, type: options.type }))
      that.bindEvent()
    })

  }

  // 绑定事件
  DrawAreaPoint.prototype.bindEvent = function () {
    var that = this
    // 区域点读点设置
    $(that.options.id).find('.js-da-point-setting').on('click', function (e) {
      that.options.data = _data.getDDItems(that.options.dataid).drawcustomarea || {}
      new Modal_3DViewer(that.options)
    })
  }

  return DrawAreaPoint
})()