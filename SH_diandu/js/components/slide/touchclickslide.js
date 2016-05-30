/*
 * [用于备份]
 * 进度条组件[支持PC,移动端,使用 zepto]
 * */

// 构造函数
function SlideBar(data) {
  var _this = this;
  var oActionBlock = document.getElementById(data.actionBlock);
  var oActionBar = document.getElementById(data.actionBar);

  var barLength = data.barLength;
  var maxNumber = data.maxNumber * 90 / 72;  //底图的比例,超过这个比例,则是关闭自动播放

  var callback = data.callback;

  var oShowArea = null;
  _this.setValue(data.actionBlock, 1, barLength, maxNumber)

  // is show slide value
  if (data.showArea) {
    oShowArea = document.getElementById(data.showArea);

    if (oShowArea) {
      _this.drag(oActionBlock, oActionBar, maxNumber, barLength, oShowArea, callback);
      _this.touchDrag(data.actionBlock, maxNumber, barLength, callback);
    } else {
      _this.drag(oActionBlock, oActionBar, maxNumber, barLength);
      _this.touchDrag(data.actionBlock, maxNumber, barLength, callback);
    }
  }

}

SlideBar.prototype = {
  /*  鼠标按着拖动滑动条   */
  drag: function (actionBlock, actionBar, total, barLength, callback) {
    /*  参数分别是点击滑动的那个块,滑动的距离,滑动条的最大数值,显示数值的地方(输入框)   */
    document.getElementById(actionBlock).onmousedown = function (ev) {
      var ev = ev || event;
      var thisBlock = this;
      var disX = ev.clientX;
      var currentLeft = thisBlock.offsetLeft;

      document.onmousemove = function (ev) {
        var ev = ev || event;
        var left = ev.clientX - disX;

        if (currentLeft + left <= (barLength - thisBlock.offsetWidth) && currentLeft + left >= 0 - thisBlock.offsetWidth / 2) {
          thisBlock.style.left = currentLeft + left + 'px';
          actionBar.style.width = currentLeft + left + (actionBlock.offsetWidth / 2) + 'px';

          var value = Math.round(actionBar.offsetWidth / barLength * total);
          callback && callback(value);
        }
        return false;
      }

      document.onmouseup = function () {
        document.onmousemove = document.onmouseup = null;
      }

      return false;
    }
  },

  /***************************************************
   * [移动端] 滑动
   * @param id  滑块id
   * @param total 总共区分多少刻度  比如音量100
   * @param barLength 总刻度对应的长度
   * @param callback 回调方法
   ***************************************************/
  touchDrag: function (id, total, barLength, callback) {
    var moveX, startX;
    $(document).on("touchstart", "#" + id, function (event) {
      var $tar = $(event.target);
      if ($tar.attr('id') == id) {
        var touchPros = event.touches[0];
        startX = touchPros.clientX - event.target.offsetLeft;
      }
      return false;
    }).on("touchmove", "#" + id, function (event) {
      if ($(event.target).attr('id') == id) {
        var target = event.target;
        var touchPros = event.touches[0];
        moveX = touchPros.clientX - startX;
        if (moveX < 0) moveX = 0;
        if (moveX > target.parentNode.offsetWidth - target.offsetWidth) moveX = target.parentNode.offsetWidth - target.offsetWidth;
        $('#' + id).css('left', moveX)
        var value = Math.round((target.offsetLeft ) / (barLength - target.offsetWidth) * total);
        callback && callback(value);
      }
    });
  },

  setValue: function (id, value, barLength, total) {
    var $block = $('#' + id);
    var _left = barLength / total * value;
    console.log("_left", _left)
    $block.css('left', _left);
  },

  getStyle: function (obj, attr) {
    return obj.currentStyle ? obj.currentStyle[attr] : getComputedStyle(obj)[attr];
  }
}
