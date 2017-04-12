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
        oR.style.top = disY + 'px';
        oR.style.left = disX + 'px';
        oR.style.backgroundColor = '#5b9bd5';
        oR.style.position = 'absolute';
        oR.style.cursor = 'move';
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
            case 'roud':
              oR.style.height = Math.abs(y - disY) + 'px';
              oR.style.borderRadius = that.data.radius + 'px';
              break;
            case 'circle':
              oR.style.height = Math.min(Math.abs(x - disX), Math.abs(y - disY)) + 'px';
              oR.style.width = Math.min(Math.abs(x - disX), Math.abs(y - disY)) + 'px';
              oR.style.borderRadius = '50%'
              break;
            case 'oval':
              oR.style.height = Math.abs(y - disY) + 'px';
              oR.style.borderRadius = '50%'
              break;
            case 'rect':
              oR.style.height = Math.abs(y - disY) + 'px';
              break;
            case 'square':
              oR.style.height = Math.min(Math.abs(x - disX), Math.abs(y - disY)) + 'px';
              oR.style.width = Math.min(Math.abs(x - disX), Math.abs(y - disY)) + 'px';
          }
        }
        document.onmouseup = function () {
          oCanvas.style.cursor = 'pointer'
          document.onmousemove = null;
          document.onmouseout = null;
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
        document.onmouseout = null;
      }
    }
    return that;
  }

  DrawCustomArea.prototype.setEnable = function (enable) {
    this.data.enable = enable;
  }



  function drawCustomArea1(options) {
    var id = options.pageId
    var type = options.type
    var radius = options.radius
    var callback = options.callback
    // startX, startY 为鼠标点击时初始坐标
    // diffX, diffY 为鼠标初始坐标与 box 左上角坐标之差，用于拖动
    var startX, startY, diffX, diffY;
    // 是否拖动，初始为 false
    var dragging = false;

    // 鼠标按下
    document.getElementById(id).onmousedown = function (e) {
      startX = e.layerX;
      startY = e.layerY;

      // 如果鼠标在 box 上被按下
      if (e.target.className.match(/box/)) {
        // 允许拖动
        dragging = true;

        // 设置当前 box 的 id 为 moving_box
        if (document.getElementById("moving_box") !== null) {
          document.getElementById("moving_box").removeAttribute("id");
        }
        e.target.id = "moving_box";
        // 计算坐标差值
        diffX = startX - e.target.offsetLeft;
        diffY = startY - e.target.offsetTop;
      }
      else {
        // 在页面创建 box
        var active_box = document.createElement("div");
        active_box.style.position = 'absolute';
        active_box.style.backgroundColor = 'red';
        active_box.id = "active_box";
        active_box.className = "box";
        active_box.style.cursor = 'move';
        active_box.style.top = startY + 'px';
        active_box.style.left = startX + 'px';
        document.getElementById(id).appendChild(active_box);
        active_box = null;
      }
    };

    // 鼠标移动
    document.onmousemove = function (e) {
      // 更新 box 尺寸
      if (document.getElementById("active_box") !== null) {
        var ab = document.getElementById("active_box");
        ab.style.width = e.layerX - startX + 'px';
        ab.style.height = e.layerY - startY + 'px';
      }

      // 移动，更新 box 坐标
      if (document.getElementById("moving_box") !== null && dragging) {
        var mb = document.getElementById("moving_box");
        mb.style.top = e.layerX - diffY + 'px';
        mb.style.left = e.layerY - diffX + 'px';
      }
    };

    // 鼠标抬起
    document.onmouseup = function (e) {
      // 禁止拖动
      dragging = false;
      if (document.getElementById("active_box") !== null) {
        var ab = document.getElementById("active_box");
        ab.removeAttribute("id");
        // 如果长宽均小于 3px，移除 box
        if (ab.offsetWidth < 3 || ab.offsetHeight < 3) {
          document.body.removeChild(ab);
        }
      }
    };
  }

  return {
    DrawCustomArea: DrawCustomArea,
    drawCustomArea1: drawCustomArea1,
  }
})()