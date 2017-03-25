//加载依赖的脚本和样式
(function () {
  /**
   * 获取当前脚本的目录
   * @returns {string}
   */
  function getBasePath() {
    //兼容Chrome 和 FF
    var currentPath = document.currentScript && document.currentScript.src || '';
    var paths = currentPath.split('/');
    paths.pop();
    return paths.join('/');
  }

  Util.loadCSS(getBasePath() + '/style.css');
})()

/**
 * 背景图片放大缩小
 */
window.PicScale = (function () {
  var PicScale = function (id, selector, w, h, cbStart, cbEnd) {
    this._id = document.querySelector(id);
    this._target = document.querySelector(id + '>' + selector);
    this._w = w;
    this._h = h;
    this._screenW = document.documentElement.clientWidth;
    this._screenH = document.documentElement.clientHeight;

    this.mc = new Hammer.Manager(this._id);
    this.timer = false;
    this.translateX = 0;
    this.translateY = 0;
    this.scale = 1;
    this.firstTouch = true; //用户第一次触摸
    this._relateX = (document.body.clientWidth - this._id.offsetWidth) / 2;
    this._relateY = (document.body.clientHeight - this._id.offsetHeight) / 2;
    this._oldX = 0;
    this._oldY = 0;
    this._oldScale = 1;
    this.cbStart = cbStart; //开始滑动的回调
    this.cbEnd = cbEnd; //滑动结束的回调
    this.picInit();
  }

  PicScale.prototype = {
    picAnimate: function () {
      return window[Hammer.prefixed(window, 'requestAnimationFrame')] || function (callback) {
          setTimeout(callback, 1000 / 60);
        };
    },
    _setPosition: function () {
      var that = this;
      that._selfPosition({
        translateX: that._relateX,
        translateY: that._relateY,
        scale: that.scale
      })
    },
    /**
     * 显示提示
     */
    showTip: function () {
      var that = this;
      var html = [];

      html.push('<div class="pic-scale">')
      html.push(' <div class="pic-scale-full-btn"></div>');
      if (!PicScale.prototype.noShowTipText) {
        html.push(' <div class="pic-scale-tip pic-scale-tip-effect">');
        html.push('   <div class="pic-scale-tip-text">当前为放大状态,如果需要切换页面或上滑调用底部悬浮框,请点击全页显示</div>');
        html.push('   <div class="pic-scale-tip-btn">不再提示</div>');
        html.push(' </div>');
      }
      html.push('</div>');

      var $container = $('.pic-scale');
      if (!$container.length > 0) {
        $('body').append(html.join(''));
        $container = $('.pic-scale');
        var $fullBtn = $container.find('.pic-scale-full-btn');
        var $hideBtn = $container.find('.pic-scale-tip-btn');

        $fullBtn.on('click', function (e) {
          that.reset();

          that._selfPosition();
          that._stopCallback();
          that.hideTip();
        })

        $hideBtn.on('click', function (e) {
          $(e.currentTarget).parent().hide();
          PicScale.prototype.noShowTipText = true; //记录不在提示
        })
      }
    },

    hideTip: function () {
      $('.pic-scale').remove();
    },
    reset: function () {
      this.timer = false;
      this.translateX = 0;
      this.translateY = 0;
      this.scale = 1;
      this.firstTouch = true; //用户第一次触摸
      this._relateX = (document.body.clientWidth - this._id.offsetWidth) / 2;
      this._relateY = (document.body.clientHeight - this._id.offsetHeight) / 2;
      this._oldX = 0;
      this._oldY = 0;
      this._oldScale = 1;
    },

    /**
     * 更新图片位置和缩放比例
     * @param style
     * @param timer
     * @param type
     * @private
     */
    _refresh: function (style, timer, type) {
      this._target.style.webkitTransitionProperty = "-webkit-transform";
      this._target.style.webkitTransform = style;
      if (timer) this._target.style.webkitTransitionDuration = timer;
      if (type)this._target.style.webkitTransitionTimingFunction = type;
    },

    /**
     * 限制移动的范围
     */
    _limitXY: function () {
      var flag = false;
      var width = this._w * this.scale;
      var height = this._h * this.scale;
      var maxX = Math.abs((width - this._screenW) / 2);
      var maxY = Math.abs((height - this._screenH) / 2);
      if (this.translateX > 0 && this.translateX > maxX) {
        this.translateX = maxX;
        flag = true;
      }
      if (this.translateX < 0 && this.translateX < -maxX) {
        this.translateX = -maxX;
        flag = true;
      }

      if (this.translateY > 0 && this.translateY > maxY) {
        this.translateY = maxY;
        flag = true;
      }
      if (this.translateY < 0 && this.translateY < -maxY) {
        this.translateY = -maxY;
        flag = true;
      }
      return flag;
    },

    _selfPosition: function (pos) {
      var that = this;

      var width = that._w * that.scale;
      var height = that._h * that.scale;
      that.maxX = Math.abs((width - that._screenW) / 2);
      that.maxY = Math.abs((height - that._screenH) / 2);

      var _pos = function () {
        pos = pos || {};
        pos.scale = pos.scale || 1;

        if (pos.scale <= 1) {
          pos.scale = 1;
          pos.translateX = 0;
          pos.translateY = 0;
        }

        var _style = [
          'translate3d(' + pos.translateX + 'px,' + pos.translateY + 'px,0)',
          'scale(' + pos.scale + ',' + pos.scale + ')'
        ]
        _style = _style.join(' ');

        that._refresh(_style)
      }
      that._picAnimate(_pos);
    },

    _picAnimate: function (fn) {
      return this.picAnimate()(fn);
    },

    _stopCallback: function () {
      this.cbEnd && this.cbEnd();
    },

    picInit: function () {
      var that = this;
      that.mc.on("hammer.input", function (ev) {
        if (ev.isFinal) {
          that._oldX = that.translateX;
          that._oldY = that.translateY;
          that._oldScale = that.scale;
        }
      })
      that.mc.add(new Hammer.Pan({
        direction: Hammer.DIRECTION_ALL,
        threshold: 0,
        pointers: 0
      }));

      that.mc.add(new Hammer.Pinch({
        threshold: 0
      })).recognizeWith(that.mc.get('pan'));

      that.mc.on('panstart panmove', _onPan);
      that.mc.on('pinchstart pinchmove', _onPinch);

      that.mc.on('pinchend', function () {
        that._stopCallback();
      });

      that._setPosition();

      function _onPan(ev) {
        that.cbStart && that.cbStart();
        ev.preventDefault();
        if (that.scale > 1) {
          if (that.firstTouch) {
            that._oldX = that._relateX;
            that._oldY = that._relateY;
          }

          that.translateX = that._oldX + ev.deltaX;
          that.translateY = that._oldY + ev.deltaY;

          //that._limitXY();

          var _position = {
            translateX: that.translateX,
            translateY: that.translateY,
            scale: that.scale
          };
          that._selfPosition(_position);

          that.firstTouch = false;
        }
      };

      function _onPinch(ev) {
        that.cbStart && that.cbStart();
        ev.preventDefault();
        that.scale = that._oldScale * ev.scale;
        var _position = {
          translateX: that.translateX,
          translateY: that.translateY,
          scale: that.scale
        };

        that._selfPosition(_position);
      };
    }
  }
  
  return PicScale;
})()