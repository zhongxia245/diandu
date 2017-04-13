(function () {
  /**
 * 一些Handlebar的指令
 * 
 * @param {any} src 
 * @param {any} callback 
 */
  Handlebars.registerHelper("equal", function (v1, v2, options) {
    if (v1 == v2) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });
  Util.loadCSS(Util.getBasePath(document.currentScript.src) + '/style.css')
})()

window.PointTypes = (function () {
  var currentScriptSrc = Util.getBasePath(document.currentScript.src)
  // 点读点类型
  var POINTTYPES = {
    types: [
      { label: '视频', type: 'video', text: '点击上传MP4格式的视频文件', tip: '视频须为AVC（h264)编码格式的MP4文件<br/>视频点设置可定制图片和播放区域' },
      { label: '音频', type: 'audio', text: '点击上传MP3格式的音频文件', tip: 'MP3文件音频点设置可定制图片和播放区域' },
      { label: '注解', type: 'imgtext', text: '点击上传图文', tip: '视频须为AVC（h264)编码格式的MP4文件视频点设置可定制图片和播放区域' },
      { label: '测试', type: 'exam', text: '点击上传试卷', tip: '视频须为AVC（h264)编码格式的MP4文件视频点设置可定制图片和播放区域' },
      { label: '开关图', type: 'on-off', text: '点击设置开关', tip: '视频须为AVC（h264)编码格式的MP4文件视频点设置可定制图片和播放区域' },
      { label: '超链接', type: 'set-url', text: '点击设置超级链接', tip: '视频须为AVC（h264)编码格式的MP4文件视频点设置可定制图片和播放区域' },
      { label: '摇摆图', type: 'sway', text: '请直接采用点触发进行设置', tip: '摇摆图是简单的动画，就是点击图片后，图片摆动或者适当缩放，并可配置音效' },
      { label: '3D观察器', type: '3dviewer', text: '上传相关文件', tip: '3D文件限定为obj模型文件，可以进行缩放和旋转操作' },
    ]
  }
  /**
   * 点读点类型弹窗
   * @param {any} selector 弹窗对应的点读点
   * @param {any} selectedType  选中的类型
   */
  function PointTypes(options) {
    var that = this

    Util.getTpl(currentScriptSrc + '/tpl.html', function (tpl) {
      var tpls = Handlebars.compile(tpl)
      var configData = POINTTYPES || { types: [] }
      configData.selected = options.selectedType

      var div = document.createElement('div')
      div.setAttribute('id', '__pointTypes__')
      document.body.append(div)
      $(div).append(tpls(configData))
      $(div).css({ left: options.offset.left - 140, top: options.offset.top - 320 })

      that.initVar(options)
      that.bindEvent()
      that.setData(options)
    })
  }

  // 初始化变量
  PointTypes.prototype.initVar = function (options) {
    options = options || {}
    this.closeCallback = options.closeCallback
    this.$container = $('#__pointTypes__')
    this.$pointTypeItem = this.$container.find('.point-types__item')
    this.$tip = this.$container.find('.js-pt-tip')
  }

  // 绑定点击事件
  PointTypes.prototype.bindEvent = function () {
    var that = this

    // 点读类型点击事件
    this.$pointTypeItem
      .on('click', function (e) {
        var $cTar = $(e.currentTarget)
        $.each(that.$pointTypeItem, function (item, el) {
          $(el).removeClass('pt-selected')
        })
        $cTar.addClass('pt-selected')

        that.data = $.extend(that.data, $cTar.data())

        if (that.closeCallback) {
          that.closeCallback(that.data)
        }
        that.close()
      })
      .on('mouseover', function (e) {
        that.$tip.show()
        var $cTar = $(e.currentTarget)
        var tip = $cTar.data('tip')
        var html = '<p>' + tip + '</p>'
        that.$tip.html(html)
      })
      .on('mouseout', function (e) {
        that.$tip.html('')
        that.$tip.hide()
      })
  }

  // 编辑设置数据
  PointTypes.prototype.setData = function () {
    this.data = {}
  }

  // 编辑设置数据
  PointTypes.prototype.close = function () {
    this.$container.remove()
  }


  return PointTypes
})()