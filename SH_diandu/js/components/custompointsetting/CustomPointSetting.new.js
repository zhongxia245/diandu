/***************************************************
 * 时间: 8/7/16 20:35
 * 作者: zhongxia
 * 说明: 自定义点读点风格,文字
 * 依赖: js/lib/bootstrap-slider 组件
 ***************************************************/
$('body').off()
  .on('focus', '[contenteditable]', function () {
    var $this = $(this);
    $this.data('before', $this.html());
    return $this;
  })
  .on('blur keyup paste input', '[contenteditable]', function () {
    var $this = $(this);
    if ($this.data('before') !== $this.html()) {
      $this.data('before', $this.html());
      $this.trigger('change');
    }
    return $this;
  });

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

  Util.loadCSS(getBasePath() + '/customPointSetting.new.css');
})()


function CustomPointSetting(selector, config) {
  config = config || {};

  this.selector = selector;
  this.data = {};
  //自定义视频播放  背景图大小,宽高
  this.data.bgPic = config.bgPic || {};


  //点读点数据
  this.data.pointData = config.pointData || {};


  //自定义视频的地址,宽高
  this.data.videoPath = config.videoPath;

  //自定义点读点标题
  this.data.title = config.title || {};

  //自定义图片地址,颜色,发光大小
  this.data.pic = config.pic || {};
  this.data.pic.color = this.data.pic.color || '#FFFF0B';
  this.data.pic.colorSize = this.data.pic.colorSize || 5;

  this.setUploadify = config.setUploadify || (_upload && _upload.setUploadify);

  this.submitCallback = config.submitCallback;    //关闭页面的回调

  this.bgPath = this.data.bgPic.pic; //'./uploads/0d1f57cf949021538d75198a3bf15a51.jpg';
  this.isRelate = true; //宽高是否关联

  this.whScale = (this.data.pointData.w / this.data.pointData.h) || 1;
  this.hwScale = (this.data.pointData.h / this.data.pointData.w) || 1;

  this.pointTypeClasses = {
    audio: 'cps-point-audio',
    video: 'cps-point-video',
    imgtext: 'cps-point-imgtext',
    exam: 'cps-point-exam'
  }

  $(this.selector).html(this.render());

  this.initVar(); //初始化变量
  this.bindEvent(); //绑定事件
  this.initData(); //初始化数据
  this.$container.find('#cps-upload-img').css({left: -99999});   //记住  that.$upload !== that.$container.find('#cps-upload-img')
}

/**
 * 渲染页面
 */
CustomPointSetting.prototype.render = function () {
  var pointTypeClass = this.pointTypeClasses[this.data.title.type];
  var html = [];
  html.push('<div class="cps-container">')
  html.push('  <div class="cps-tabs">')
  html.push('    <div class="cps-tab-point cps-tab-active">点</div>')
  html.push('    <div class="cps-tab-playarea">播放区</div>')
  html.push('  </div>')
  html.push('  <div class="cps-header">点读点设置</div>')
  html.push('  <div class="cps-content-point">')
  html.push('     <div class="cps-content-left">')
  html.push('       <h4>设置点读点的注释文件</h4>')
  html.push('       <em>(建议不超过10个字)</em>')
  html.push('       <div class="cps-point">')
  html.push('         <div class="cps-point-img ' + pointTypeClass + '"></div>')
  html.push('         <div class="cps-point-line"></div>')
  html.push('         <div class="cps-point-text" contenteditable="true">' + (this.data.title.title || "") + '</div>')
  html.push('       </div>')
  html.push('     </div>')
  html.push('     <div class="cps-content-right">')
  html.push('       <h4>自定制点读点按钮图案</h4>')
  html.push('       <em>(请采用背景色透明的png图片文件)</em>')
  html.push('       <div id="cps-upload-img">点击上传</br>点读点按钮</br>图片</div>')
  html.push('       <div class="cps-show-img" style="display: none;"></div>')
  html.push('       <ul class="cps-show-color">')
  html.push('         <li tabindex="1" style="background-color:#FB0006;"></li>')
  html.push('         <li tabindex="2" style="background-color:#15A53F;"></li>')
  html.push('         <li tabindex="3" style="background-color:#0A5AB2;"></li>')
  html.push('         <li tabindex="4" style="background-color:#FFFF0B;"></li>')
  html.push('         <li tabindex="5" style="background-color:#CA0081;"></li>')
  html.push('         <li tabindex="6" style="background-color:#1D1D1D;"></li>')
  html.push('       </ul>')
  html.push('       <div style="clear:both"></div>')
  html.push('       <div class="cps-show-color-size"><input id="cpsColorSize" type="text" data-slider-handle="square"/></div>')
  html.push('     </div>')
  html.push('  </div>')

  html.push('    <div class="cps-content-playarea" style="display:none;">')
  html.push('       <p>请设置视频播放区域的长度和高度</p>')
  html.push('       <div class="cps-content-video-size">')
  html.push('         <input name="width" type="number"  class="cps-video-width"/>')
  html.push('         <div class="cps-video-size-title" >长度</div>')
  html.push('         <div class="cps-video-size-relate"></div>')
  html.push('         <div class="cps-video-size-title">高度</div>')
  html.push('         <input name="height" type="number"  class="cps-video-height"/>')
  html.push('       </div>')


  var subTip = parseInt(this.data.bgPic.w) + ':' + parseInt(this.data.bgPic.h);
  html.push('       <p>请拖动改变播放区的位置<em>背景图宽高:' + subTip + '(相对1200大小)</em></p>')
  html.push('       <div class="cps-content-video-area" style="background:url(' + this.bgPath + ') no-repeat; background-size:contain;background-position: center;">')
  html.push('         <div class="cps-video-location"></div>')
  html.push('       </div>')
  html.push('    </div>')

  html.push('  <div class="cps-submit">提交</div>')
  html.push('</div>')
  return html.join(' ');
}

/**
 * 渲染页面
 */
CustomPointSetting.prototype.initVar = function () {
  this.$container = $(this.selector);
  this.$text = this.$container.find('.cps-point-text');
  this.$upload = this.$container.find('#cps-upload-img');
  this.$submit = this.$container.find('.cps-submit');
  this.$showImg = this.$container.find('.cps-show-img');
  this.$showColor = this.$container.find('.cps-show-color');

  this.$tabPoint = this.$container.find('.cps-tab-point');
  this.$divPoint = this.$container.find('.cps-content-point');
  this.$tabVideo = this.$container.find('.cps-tab-playarea');
  this.$divVideo = this.$container.find('.cps-content-playarea');

  this.$inputWidth = this.$container.find('input[name="width"]')
  this.$inputHeight = this.$container.find('input[name="height"]')

  this.$relate = this.$container.find('.cps-video-size-relate');

  this.$videoLocation = this.$container.find('.cps-video-location');

  //初始化发光颜色
  var _$colors = this.$showColor.find('li');
  _$colors.removeClass('cps-show-color-active');
  for (var i = 0; i < _$colors.length; i++) {
    var _$color = _$colors.eq(i);
    if (_$color.attr('style').split(':')[1].indexOf(this.data.pic.color) !== -1) {
      _$color.addClass('cps-show-color-active');
      break;
    }
  }
}

/**
 * 绑定事件
 */
CustomPointSetting.prototype.bindEvent = function () {
  var that = this;
  /**
   * 自定义点读点区域
   */
  that.$tabPoint.off().on('click', function (e) {
    that.$tabVideo.removeClass('cps-tab-active')
    that.$tabPoint.addClass('cps-tab-active');
    that.$divPoint.show();
    that.$divVideo.hide();
  })

  /**
   * 自定义播放区域
   */
  that.$tabVideo.off().on('click', function (e) {
    that.$tabPoint.removeClass('cps-tab-active');
    that.$tabVideo.addClass('cps-tab-active')
    that.$divPoint.hide();
    that.$divVideo.show();
    that.initDrag();
  })

  /**
   * 输入宽
   */
  that.$inputWidth.off().on('keyup mouseup', function (e) {
    var val = e.target.value;
    if (that.isRelate && val) {
      that.$inputHeight.val(parseInt(val * that.hwScale))
    }
    that.$videoLocation.css({
      width: that.getSacleWH(that.$inputWidth.val()),
      height: that.getSacleWH(that.$inputHeight.val())
    })
    that.initDrag();
  })

  /**
   * 输入高
   */
  that.$inputHeight.off().on('keyup mouseup', function (e) {
    var val = e.target.value;
    if (that.isRelate && val) {
      that.$inputWidth.val(parseInt(val * that.whScale))
    }
    that.$videoLocation.css({
      width: that.getSacleWH(that.$inputWidth.val()),
      height: that.getSacleWH(that.$inputHeight.val())
    })
    that.initDrag();
  })

  /**
   * 宽高是否按比例
   */
  that.$relate.off().on('click', function (e) {
    if (that.$relate.hasClass('cps-video-size-relate-off')) {
      that.$relate.removeClass('cps-video-size-relate-off');
      that.isRelate = true;
      that.$inputHeight.attr('disabled', true)
    } else {
      that.$relate.addClass('cps-video-size-relate-off');
      that.isRelate = false;
      that.$inputHeight.attr('disabled', false)
    }
  })


  /**
   * 获取焦点之后,清除自定义图片
   */
  that.$text.off().on('click', function (e) {
    if (that.data.pic.src) {
      layer.confirm('是否要变更设置，放弃已有设置？', {
        btn: ['是', '否'] //按钮
      }, function (index) {
        that.data.pic.src = null;
        that.$container.find('#cps-upload-img').css({left: 0});
        that.$showImg.hide().html("");
        layer.close(index);
      });
    }
  })

  //初始化点读点大小滑块
  var slideSize = new Slider('#cpsColorSize', {
    step: 1,
    min: 1,
    max: 10,
    value: that.data.pic.colorSize,
    tooltip: 'hide'
  })

  slideSize.on('slide', function (slideEvt) {
    that.data.pic.colorSize = slideEvt.value;
    var filter = "drop-shadow(0px 0px " + that.data.pic.colorSize + "px " + that.data.pic.color + ")"
    that.$showImg.css({
      '-webkit-filter': filter,
      filter: filter
    })
  })

  /**
   * 重新上传图片
   */
  that.$showImg.off().on('click', function (e) {
    layer.confirm('是否重新选择图片？', {
      btn: ['确定', '取消'] //按钮
    }, function (index) {
      that.data.pic.src = null;
      that.$container.find('#cps-upload-img').css({left: 0});
      that.$showImg.hide().html("");
      layer.close(index);
    });
  })

  /**
   * 选中自定义图片的发光的颜色
   */
  that.$showColor.off().on('click', function (e) {
    var $tar = $(e.target);
    var $cTar = $(e.currentTarget);
    var color = $tar.attr('style').split(':')[1];

    $cTar.find('li').removeClass('cps-show-color-active');
    $tar.addClass('cps-show-color-active');

    if (color) {
      color = color.replace(';', '');
      that.data.pic.color = color;
      var filter = "drop-shadow(0px 0px " + that.data.pic.colorSize + "px " + color + ")"
      that.$showImg.css({
        '-webkit-filter': filter,
        filter: filter
      })
      Logger.log(that.$showImg.attr('style'))
    }
  })

  /**
   * 点读点自定义图片上传
   */
  that.setUploadify(that.$upload, {
    width: '175px',
    height: '175px',
    onUploadSuccess: function (file, result, response) {
      Util.getImageWH(result, function (obj) {
        that.data.title.title = null;
        that.$text.text("");
        that.data.pic.src = result;
        that.data.pic.w = obj.w;
        that.data.pic.h = obj.h;
        //that.$upload 还是最早保存的变量,
        that.$container.find('#cps-upload-img').css({left: -99999});   //记住  that.$upload !== that.$container.find('#cps-upload-img')
        that.$showImg.show().css({
          background: 'url(' + result + ') no-repeat',
          backgroundSize: 'contain',
          backgroundPosition: 'center'
        })
      })
    }
  });

  /**
   * 提交[保存到点读点数据里面]
   */
  that.$submit.off().on('click', function () {
    that.data.title.title = that.$text.text();
    //返回的数据
    Logger.info("自定义点读点数据保存到 window.DD 里面", that.data)
    //参数2 表示, 是否设置了数据
    that.submitCallback && that.submitCallback(that.data, !!(that.data.title.title || that.data.pic.src));
  })
}

CustomPointSetting.prototype.initData = function () {
  //如果是编辑,有数据,回显
  if (this.data.pic.src) {
    var filter = "drop-shadow(0px 0px " + this.data.pic.colorSize + "px " + this.data.pic.color + ")"
    this.$showImg.show().css({
      background: 'url(' + this.data.pic.src + ') no-repeat',
      backgroundSize: 'contain',
      backgroundPosition: 'center',
      '-webkit-filter': filter,
      filter: filter
    })
  }

  var _w = this.data.pointData.w;
  var _h = this.data.pointData.h;
  this.$inputWidth.val(_w);
  this.$inputHeight.val(_h).attr('disabled', true);
  if (_w >= _h) {
    this.$videoLocation.attr("width", this.getSacleWH(_w));
  } else {
    this.$videoLocation.attr("height", this.getSacleWH(_h));
  }

}


CustomPointSetting.prototype.initDrag = function () {
  this.Drag(this.$videoLocation, function (x, y) {
    console.log("x", x, y)
  })
}

/**
 * 拖拽功能[TODO:为了不影响点读点的拖拽,这里单独写一个]
 * @param selector
 * @param callback
 * @constructor
 */
CustomPointSetting.prototype.Drag = function ($selector, callback) {
  this.$selector = $selector;

  this.callback = callback;

  //获取屏幕寛高，防止点读位移除背景图
  this.$container = this.$selector.parent();
  this.w = this.$container.width();
  this.h = this.$container.height();
  this.targetW = this.$selector.width();
  this.targetH = this.$selector.height();

  console.log(this.targetW, this.targetH, this.w, this.h)

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
        that.params.left = that.$selector.css('left');
        that.params.top = that.$selector.css('top');
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
          if (x > that.w - that.targetW) {
            x = that.w - that.targetW;
          }
          if (y > that.h - that.targetH) {
            y = that.h - that.targetH;
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

/**
 * 传入宽高,获取等比缩放的大小
 */
CustomPointSetting.prototype.getSacleWH = function (val) {
  var scale = 480 / 1200;  //1200的大小,相对于自定义弹框这边背景图的大小
  return val * scale;
}