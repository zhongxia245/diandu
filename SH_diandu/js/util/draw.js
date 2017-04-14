/**
 * 自定义绘制图形
 * roud 圆角矩形  
 * rect 矩形
 * circle  圆
 * square 正方形
 */
window.Draw = (function () {
  function DrawCustomArea(options) {
    var that = this
    that.data = options
    this.data.enable = options.enable || true;

    var oCanvas = document.getElementById(that.data.pageId)

    oCanvas.onmousedown = function (ev) {
      oCanvas.style.cursor = 'se-resize'
      // 是否允许绘制,默认为true
      if (that.data.enable) {
        if (oCanvas.setCapture) {
          oCanvas.setCapture();
        }
        var oEv = ev || window.event;
        var dragging = false;
        var disX = oEv.layerX;
        var disY = oEv.layerY;

        var oR = document.createElement('div');
        oR.setAttribute('id', '__drawarea__')
        oR.id = that.data.pointId;
        oR.className = 'draw-area-container'
        oR.style.top = disY + 'px';
        oR.style.left = disX + 'px';
        oCanvas.appendChild(oR);

        document.onmousemove = function (ev) {
          ev.stopPropagation()
          ev.preventDefault()

          var oEv = ev || window.event;
          var x = oEv.layerX;
          var y = oEv.layerY;

          // if (x < oCanvas.offsetLeft) {
          //   x = oCanvas.offsetLeft;
          // }
          // else if (x > oCanvas.offsetLeft + oCanvas.offsetWidth) {
          //   x = oCanvas.offsetLeft + oCanvas.offsetWidth
          // }
          // if (y < oCanvas.offsetTop) {
          //   y = oCanvas.offsetTop;
          // }
          // else if (y > oCanvas.offsetTop + oCanvas.offsetHeight) {
          //   y = oCanvas.offsetTop + oCanvas.offsetHeight
          // }

          oR.style.width = Math.abs(x - disX) + 'px';
          oR.style.top = Math.min(disY, y) + 'px';
          oR.style.left = Math.min(disX, x) + 'px';


          switch (that.data.type) {
            // 圆角矩形
            case 'roud':
              oR.style.height = Math.abs(y - disY) + 'px';
              oR.style.borderRadius = that.data.radius + 'px';
              break;
            // 圆形
            case 'circle':
              oR.style.height = Math.min(Math.abs(x - disX), Math.abs(y - disY)) + 'px';
              oR.style.width = Math.min(Math.abs(x - disX), Math.abs(y - disY)) + 'px';
              oR.style.borderRadius = '50%'
              break;
            // 椭圆形
            case 'oval':
              oR.style.height = Math.abs(y - disY) + 'px';
              oR.style.borderRadius = '50%'
              break;
            // 矩形
            case 'rect':
              oR.style.height = Math.abs(y - disY) + 'px';
              break;
            // 正方形
            case 'square':
              oR.style.height = Math.min(Math.abs(x - disX), Math.abs(y - disY)) + 'px';
              oR.style.width = Math.min(Math.abs(x - disX), Math.abs(y - disY)) + 'px';
          }
        }
        document.onmouseup = function () {
          oCanvas.style.cursor = 'pointer'
          document.onmousemove = null;
          // document.onmouseout = null;
          document.onmouseup = null;
          if (oCanvas.releaseCapture) {
            oCanvas.releaseCapture();
          }
          if (that.data.callback) {
            that.data.callback({
              left: parseInt(oR.style.left),
              top: parseInt(oR.style.top),
              width: parseInt(oR.style.width),
              height: parseInt(oR.style.height)
            })
          }
        }
        return false;
      } else {
        oCanvas.onmousedown = null;
        document.onmousemove = null;
        // document.onmouseout = null;
        document.onmouseup = null;
      }
    }
    return that;
  }

  DrawCustomArea.prototype.setEnable = function (enable) {
    this.data.enable = enable;
  }

  return {
    DrawCustomArea: DrawCustomArea,
  }
})()