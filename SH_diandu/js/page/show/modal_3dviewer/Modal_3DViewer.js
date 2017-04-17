(function () {
  var currentScriptSrc = Util.getBasePath(document.currentScript.src);
  Util.loadCSS(Util.getBasePath(document.currentScript.src) + '/style.css')
})()

window.Modal_3DViewer = (function () {

  var currentScriptSrc = Util.getBasePath(document.currentScript.src);
  /**
   * 点读点类型弹窗
   * @param {any} selector 弹窗对应的点读点
   * @param {any} selectedType  选中的类型 
   */
  function Modal_3DViewer(options) {
    var that = this
    that.options = options || {}

    // 区域点读点设置
    Util.getTpl(currentScriptSrc + '/tpl.html', function (tpl) {
      var div = document.createElement('div')
      div.setAttribute('id', '__modal_3dviewer__')
      $('body').append(div)

      var tpls = Handlebars.compile(tpl)
      $(div).append(tpls({}))

      that.initVar();
      that.bindEvent();
      that.initData();
    })
  }

  Modal_3DViewer.prototype.initVar = function () {
    this.$container = $('#__modal_3dviewer__')
  }

  Modal_3DViewer.prototype.initData = function () {
  }

  /**
   * 关闭弹窗
   */
  Modal_3DViewer.prototype.bindEvent = function () {
    var that = this
    new ObjViewer('scene', { url: this.options.url, width: 300, height: 400 })

    $('.js-viewer3d-wrapper').on('touchstart', function (e) {
      if ($(e.target).hasClass('js-viewer3d-wrapper')) {
        that.close()
      }
    })
  }

  /**
   * 关闭弹窗
   */
  Modal_3DViewer.prototype.close = function () {
    $('#__modal_3dviewer__').remove()
  }

  return Modal_3DViewer
})()