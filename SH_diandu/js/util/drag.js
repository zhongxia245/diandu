/***************************************************
 * 时间: 8/14/16 13:12
 * 作者: zhongxia
 * 说明: 拖拽的类库
 ***************************************************/
function Drag(selector, callback) {
  this.dianduSize = 72;
  this.selector = selector;
  this.$selector = $(selector);

  this.callback = callback;

  //获取屏幕寛高，防止点读位移除背景图
  this.$container = this.$selector.parent();
  this.w = this.$container.width();
  this.h = this.$container.height();

  this.params = {
    left: 0,
    top: 0,
    currentX: 0,
    currentY: 0,
    flag: false
  };

  /**
   * 拖拽的实现
   */
  this.startDrag = function () {
    var that = this;

    that.$selector.on('mousedown', function (e) {
      that.params.flag = true;
      that.params.currentX = e.clientX;
      that.params.currentY = e.clientY;

      that.params.left = that.$selector.css('left').replace('px', '');
      that.params.top = that.$selector.css('top').replace('px', '');

      $(document).on('mouseup', function () {
        that.params.flag = false;
        that.callback && that.callback(parseInt(that.params.left), parseInt(that.params.top));
      });

      $(document).on('mousemove', function (e) {
        if (that.params.flag) {
          var nowX = e.clientX;
          var nowY = e.clientY;
          var disX = nowX - that.params.currentX;
          var disY = nowY - that.params.currentY;

          // 限制点读位不能超出背景图  START
          var x = parseInt(that.params.left) + disX;
          var y = parseInt(that.params.top) + disY;
          if (x < 0) {
            x = 0;
          }
          if (y < 0) {
            y = 0;
          }
          if (x > that.w - that.dianduSize) {
            x = that.w - that.dianduSize;
          }
          if (y > that.h - that.dianduSize) {
            y = that.h - that.dianduSize;
          }
          // 限制点读位不能超出背景图  END

          that.$selector.css({
            left: x,
            top: y
          })
        }
      })
    });

  };

  //启动拖拽
  this.startDrag();
}
