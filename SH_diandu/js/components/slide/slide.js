/*
 * 进度条组件[支持PC,移动端,使用 zepto]
 * 单纯的滑块组件，不包含具体业务
 * */

// 构造函数
function Slide(data) {
  var that = this
  this.data = data

  this.progressVal = data.progressVal
  this.progressBar = data.progressBar
  this.value = data.value || 0
  this.callback = data.callback

  that.setValue(this.value)
  this.touchDrag()
  this.drag()

  // 是否允许点击进度条跳转到指定进度
  if (data.allowClick) {
    this.allowClick()
  }
}

Slide.prototype = {
  /**
   * 鼠标按着拖动滑动条
   */
  drag: function () {
    var that = this
    var progressVal = $(that.progressVal)[0]
    if (progressVal) {
      progressVal.onmousedown = function (e) {
        e.stopPropagation()
        e = e || event
        var target = e.currentTarget
        var thisVal = this
        var disX = event.clientX - target.offsetLeft

        document.onmousemove = function (e) {
          e.stopPropagation()
          e = e || event
          var moveX = e.clientX - disX
          if (moveX < 0) moveX = 0
          if (moveX > target.parentNode.offsetWidth - target.offsetWidth) moveX = target.parentNode.offsetWidth - target.offsetWidth

          thisVal.style.left = moveX + 'px'

          var val = moveX / ($(that.progressBar).width() - $(that.progressVal).width())
          that.callback && that.callback(val)
        }

        document.onmouseup = function () {
          e.stopPropagation()
          document.onmousemove = document.onmouseup = null
        }
      }
    }
  },
  touchDrag: function () {
    var that = this
    var moveX, startX
    $(document)
      .on('touchstart', that.data.progressVal, function (e) {
        e.stopPropagation()
        // 验证点击的不是滑块
        if ($(e.currentTarget).attr('id') == that.getValId()) {
          var touchPros = e.touches[0]
          startX = touchPros.clientX - e.currentTarget.offsetLeft
        }
      })
      .on('touchmove', that.progressVal, function (e) {
        e.stopPropagation()
        if ($(e.currentTarget).attr('id') == that.getValId()) {
          var allLength = $(that.progressBar).width() - $(that.progressVal).width();
          var target = e.currentTarget
          var touchPros = e.touches[0]
          moveX = touchPros.clientX - startX

          if (moveX < 0) moveX = 0
          if (moveX > allLength) moveX = allLength

          $(that.progressVal).css('left', moveX)

          var val = moveX / allLength

          that.callback && that.callback(val)
        }
      })
  },
  /**
   * 允许点击进度条，跳转到指定位置
   */
  allowClick: function () {
    var that = this
    $(that.progressBar).on('click', function (e) {
      var $cTar = $(e.currentTarget)
      var $val = $(that.progressVal)
      if ($(e.target).attr('id') !== that.getValId()) {
        var allLength = $cTar.width() - $val.width();
        var offsetX = e.offsetX
        var left = offsetX - $val.width() / 2
        if (left < 0) left = 0
        if (left > allLength) left = allLength
        $val.css('left', left)

        var val = left / ($cTar.width() - $val.width())
        if (that.callback) that.callback(val)
      }
    })
  },
  setValue: function (val) {
    if (val) {
      var $val = $(this.progressVal)
      var $bar = $(this.progressBar)

      var _left = $bar.width() * val
      $val.css('left', _left)

      this.callback && this.callback(val)
    }
  },
  getValId: function () {
    return this.progressVal.replace('#', '')
  }
}
