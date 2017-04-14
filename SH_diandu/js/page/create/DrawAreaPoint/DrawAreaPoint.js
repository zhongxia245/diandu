var currentScriptSrc = Util.getBasePath(document.currentScript.src);

(function () {
  Util.loadCSS(currentScriptSrc + '/style.css')
})()

window.DrawAreaPoint = (function () {
  /**
   * 点读点类型弹窗
   * @param {any} selector 弹窗对应的点读点
   * @param {any} selectedType  选中的类型 
   */
  function DrawAreaPoint(options) {
    var that = this

    // 根据模板引擎生成页面
    Util.getTpl(currentScriptSrc + '/tpl.html', function (tpl) {
      var tpls = Handlebars.compile(tpl)
      $(options.id).append(tpls({ index: 4, type: '3dobj' }))
      that.bindEvent()
    })

  }

  // 绑定事件
  DrawAreaPoint.prototype.bindEvent = function () {
    $('.js-da-point-setting').on('click', function (e) {
      Util.getTpl(currentScriptSrc + '/tpl_modal.html', function (tpl) {
        var div = document.createElement('div')
        div.setAttribute('id', '__drawAreaSetting__')
        document.body.append(div)

        var tpls = Handlebars.compile(tpl)
        $(div).append(tpls({ title: '区域设置' }))

        _layer = layer.open({
          type: 1,
          scrollbar: false,
          area: ['600px', '550px'],
          title: false,
          shadeClose: false,
          content: $(div),
          cancel: function () {
            that.close();
          }
        })
      })
    })
  }

  /**
   * 关闭弹窗
   */
  DrawAreaPoint.prototype.close = function () {
    layer.closeAll()
    this.$container.remove()
  }


  return DrawAreaPoint
})()