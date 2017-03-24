/***************************************************
 * 时间: 8/7/16 20:35
 * 作者: zhongxia
 * 说明: 自定义点读点风格,文字,视频播放区域
 * 依赖: js/lib/bootstrap-slider 组件
 *       js/util/util.js
 ***************************************************/
$('body')
  .off()
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

  Util.loadCSS(getBasePath() + '/customPointSetting.css');
})()


function CustomPointSetting(selector, config) {
  config = config || {};

  this.selector = selector;
  this.data = {};
  this.data.area = this.data.area || {};


  //自定义视频播放  背景图大小,宽高
  this.data.bgPic = config.bgPic || {};

  //点读点数据
  this.data.pointData = config.pointData || {};


  //自定义视频的地址,宽高
  this.data.videoPath = config.videoPath;

  this.data.audioPath = config.audioPath;

  //自定义点读点标题
  this.data.title = config.title || {};

  //自定义图片地址,颜色,发光大小
  this.data.pic = config.pic || {};
  this.data.pic.color = this.data.pic.color || '#FB0006';
  this.data.pic.colorSize = this.data.pic.colorSize || 5;

  //音频面板设置
  this.data.audio_panel = config.audio_panel || {
    show: false,
    lrc: ''
  }

  this.setUploadify = config.setUploadify || (_upload && _upload.initWebUpload);

  this.submitCallback = config.submitCallback;    //关闭页面的回调


  //视频播放区域,放背景图片的宽高位置
  this.bgAreaWH = {
    w: 480,
    h: 270
  }

  this.bgPath = this.data.bgPic.pic; //背景图片地址
  this.isRelate = true; //宽高是否关联

  var _area = this.data.pointData.area || {};
  this.whScale = (_area.videoW / _area.videoH) || 1;
  this.hwScale = (_area.videoH / _area.videoW) || 1;

  this.pointTypeClasses = {
    audio: 'cps-point-audio',
    video: 'cps-point-video',
    imgtext: 'cps-point-imgtext',
    exam: 'cps-point-exam'
  }

  $(this.selector).html(this.render());
  /**
   * 添加下载按钮
   */
  this.addDownloadLrc = function (filename, url) {
    //增加下载字幕文件
    var downloadLrc = '<a class="cps-download-lrc" download="' + filename + '" href="' + url + '"><img src="imgs/download.png"/></a>'
    $('#cps-upload-audio').append(downloadLrc)
  }

  this.initVar(); //初始化变量
  this.bindEvent(); //绑定事件
  this.initData(); //初始化数据
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
  html.push('    <div class="cps-tab-audio">高级</div>')
  html.push('  </div>')
  html.push('  <div class="cps-header">点读点设置</div>')

  //自定义点读点设置区域
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
  html.push('       <div class="cps-img-dynamic js-img-dynamic"></div>')
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

  // 自定义视频播放区域设置
  html.push('    <div class="cps-content-playarea" style="display:none;">')
  html.push('       <p>请设置视频播放区域的长度和高度</p>')
  html.push('       <div class="cps-content-video-size">')
  html.push('         <input name="width" type="number"  class="cps-video-width"/>')
  html.push('         <div class="cps-video-size-title" >长度</div>')
  html.push('         <div class="cps-video-size-relate"></div>')
  html.push('         <div class="cps-video-size-title">高度</div>')
  html.push('         <input name="height" type="number"  class="cps-video-height"/>')
  html.push('       </div>')

  //计算图片在自定义视频区域上的大小
  this.bgW = parseInt(this.data.bgPic.w);
  this.bgH = parseInt(this.data.bgPic.h);
  var subTip = this.bgW + ':' + this.bgH;
  var locationW = this.bgAreaWH.w;
  var locationH = this.bgAreaWH.h;
  if (this.bgW / this.bgH > 16 / 9) {
    locationH = locationW * this.bgH / this.bgW;
  } else {
    locationW = locationH * this.bgW / this.bgH
  }
  var locationStyle = 'width:' + locationW + 'px;height:' + locationH + 'px;'

  html.push('       <p>请拖动改变播放区的位置<em>背景图宽高:' + subTip + '(相对1200大小)</em></p>')
  html.push('       <div class="cps-content-video-area" style="background:url(' + this.bgPath + ') no-repeat; background-size:contain;background-position: center;">')
  html.push('         <div class="cps-video-point"></div>')
  html.push('         <div class="cps-video-location-area" style="' + locationStyle + '">')
  html.push('            <div class="cps-video-location"></div>')
  html.push('         </div>')
  html.push('       </div>')
  html.push('    </div>')


  // 设置音频歌词等功能
  html.push('    <div class="cps-content-audio" style="display:none;">')
  html.push('       <em>当前音频时长为<span class="cps-audio-time"></span></em>')
  html.push('       <em>默认音频控制面板为显示，如需修改，请点击切换</em>')
  html.push('       <div class="cps-audio-switch  js-audio-switch">')
  html.push('         <div class="cps-audio-switch-content ">音频面板</div>')
  html.push('         <div class="cps-audio-on">开</div>')
  html.push('         <div class="cps-audio-off">关</div>')
  html.push('       </div>')
  html.push('       <div id="cps-upload-audio" class="cps-upload-audio">上传音频字幕文件(限LRC格式)</div>')
  html.push('    </div>')

  html.push(' <audio preload="auto" class="cps-audio"></audio>')

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
  this.$imgRun = this.$container.find('.js-img-dynamic');

  this.$tabPoint = this.$container.find('.cps-tab-point');
  this.$divPoint = this.$container.find('.cps-content-point');
  this.$tabVideo = this.$container.find('.cps-tab-playarea');
  this.$divVideo = this.$container.find('.cps-content-playarea');
  this.$tabAudio = this.$container.find('.cps-tab-audio');
  this.$divAudio = this.$container.find('.cps-content-audio');

  this.$inputWidth = this.$container.find('input[name="width"]')
  this.$inputHeight = this.$container.find('input[name="height"]')

  this.$relate = this.$container.find('.cps-video-size-relate');

  this.$bgArea = this.$container.find('.cps-content-video-area')
  this.$videoLocation = this.$container.find('.cps-video-location');
  this.$videoPoint = this.$container.find('.cps-video-point');

  this.$audioSwitch = this.$container.find('.js-audio-switch');
  this.audio = this.$container.find('.cps-audio')[0];
  this.$audioTimes = this.$container.find('.cps-audio-time');

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
    that.$tabVideo.removeClass('cps-tab-active');
    that.$tabAudio.removeClass('cps-tab-active');
    that.$tabPoint.addClass('cps-tab-active');
    that.$divPoint.show();
    that.$divVideo.hide();
    that.$divAudio.hide();
  })

  /**
   * 自定义播放区域
   */
  that.$tabVideo.off().on('click', function (e) {
    that.$tabPoint.removeClass('cps-tab-active');
    that.$tabVideo.addClass('cps-tab-active');
    that.$divPoint.hide();
    that.$divVideo.show();
    that.initDrag();
  })

  /**
   * 设置音频歌词
   */
  that.$tabAudio.off().on('click', function (e) {
    that.$tabPoint.removeClass('cps-tab-active');
    that.$tabAudio.addClass('cps-tab-active')
    that.$divPoint.hide();
    that.$divAudio.show();
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
        that.$container.find('#cps-upload-img').css({ left: 0 });
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
      that.data.pic.dynamic = false;
      that.$container.find('#cps-upload-img').css({ left: 0 });
      that.$showImg.hide().html("");
      layer.close(index);
    });
  })

  /**
   * 上传的为动图，则判断是否需要在展示页面就播放动图
   */
  that.$imgRun.on('click', function () {
    if (that.$imgRun.hasClass('cps-img-dynamic-stop')) {
      that.$imgRun.removeClass('cps-img-dynamic-stop')
      that.data.pic.dynamic = false;
    } else {
      that.$imgRun.addClass('cps-img-dynamic-stop')
      that.data.pic.dynamic = true;
    }
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
    }
  })

  /**
   * 点读点自定义 图片上传（如果上传gif图则展示上传静态度的按钮）
   */
  that.setUploadify('#cps-upload-img', {
    onUploadSuccess: function (file, result) {
      // 如果是动态图，则上传静态度按钮
      if (file.type === 'image/gif') {

      }

      result = result._raw
      Util.getImageWH(result, function (obj) {
        that.data.title.title = null;
        that.$text.text("");
        that.data.pic.src = result;
        that.data.pic.w = obj.w;
        that.data.pic.h = obj.h;
        //that.$upload 还是最早保存的变量,
        that.$container.find('#cps-upload-img').css({ left: -99999 });   //记住  that.$upload !== that.$container.find('#cps-upload-img')

        that.$showColor.attr('data-gif', result)
        that.$showImg.show().css({
          background: 'no-repeat',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundImage: 'url(' + result + ')'
        })
      })
    }
  });


  /**
   * 点读点自定义点读点的音频面板,字幕文件
   */
  that.setUploadify('#cps-upload-audio', {
    multiple: false,
    fileTypeDesc: 'LRC Files',
    fileTypeExts: 'lrc/*',
    extensions: 'lrc',
    onUploadSuccess: function (file, result) {
      result = result._raw
      that.data.audio_panel.lrc = result;
      that.data.audio_panel.name = file.name;
      $('#cps-upload-audio .webuploader-pick').text(file.name)

      that.addDownloadLrc(file.name, result)
    }
  });


  /**
   * 音频面板默认开关按钮
   */
  that.$audioSwitch.off().on('click', function (e) {
    var $cTar = $(e.currentTarget);
    if ($cTar.hasClass('cps-content-switch--active')) {
      $cTar.removeClass('cps-content-switch--active');
      $cTar.find('.cps-audio-on').hide();
      $cTar.find('.cps-audio-off').show();
      that.data.audio_panel.show = false;
    } else {
      $cTar.addClass('cps-content-switch--active');
      $cTar.find('.cps-audio-on').show();
      $cTar.find('.cps-audio-off').hide();
      that.data.audio_panel.show = true;
    }
  })



  /**
   * 提交[保存到点读点数据里面]
   */
  that.$submit.off().on('click', function () {

    that.data.title.title = that.$text.text();

    if (that.$inputWidth.val()) {
      that.data.area = that.data.pointData.area;

      that.data.area.w = parseInt(that.$inputWidth.val()) / that.bgW;
      that.data.area.h = parseInt(that.$inputHeight.val()) / that.bgH;

      //在480px 下的位置
      that.data.area.x = that.$videoLocation.css('left').replace('px', '');
      that.data.area.y = that.$videoLocation.css('top').replace('px', '');

      //转换成比例保存起来
      that.data.area.x = parseInt(that.data.area.x) / that.bgAreaWH.w;
      that.data.area.y = parseInt(that.data.area.y) / that.bgAreaWH.h;
    } else {
      that.data.area = {};
    }
    //是否编辑了数据
    var isEdit = !!(that.data.title.title || that.data.pic.src || that.data.area.w);

    that.submitCallback && that.submitCallback(that.data, isEdit);
  })
}

/**
 * 初始化数据
 */
CustomPointSetting.prototype.initData = function () {
  var that = this;

  var _area = this.data.pointData.area || {};
  //如果不是视频点读点,隐藏切换到播放区域的按钮
  if (this.data.pointData.type !== "video") {
    this.$tabVideo.hide();
    // this.$tabPoint.hide();
  }

  this.$videoPoint.css({
    left: this.data.pointData.x * this.$bgArea.width() + 'px',
    top: this.data.pointData.y * this.$bgArea.height() + 'px',
  })

  //设置音频面板的音频时长
  if (this.data.audioPath) {
    this.audio.src = this.data.audioPath;

    this.audio.addEventListener("loadeddata", function () {
      that.$audioTimes.html(that.formatTime(that.audio.duration));
    }, false);
  }

  //设置音频面板的数据
  if (this.data.audio_panel) {
    if (this.data.audio_panel.show) {
      this.$audioSwitch.addClass('cps-content-switch--active')
      this.$container.find('.cps-audio-on').show();
      this.$container.find('.cps-audio-off').hide();
    }
    else {
      this.$audioSwitch.removeClass('cps-content-switch--active')
      this.$container.find('.cps-audio-on').hide();
      this.$container.find('.cps-audio-off').show();
    }

    if (this.data.audio_panel.lrc) {
      $('#cps-upload-audio .webuploader-pick').text(this.data.audio_panel.name)
      this.addDownloadLrc(this.data.audio_panel.name, this.data.audio_panel.lrc)
    }
  }


  //如果是编辑,有数据,回显
  if (this.data.pic.src || _area.w) {

    //设置了自定义图片
    if (this.data.pic.src) {
      if (this.data.pic.dynamic) {
        that.$imgRun.addClass('cps-img-dynamic-stop')
      }

      var filter = "drop-shadow(0px 0px " + this.data.pic.colorSize + "px " + this.data.pic.color + ")"
      this.$showImg.show().css({
        background: 'url(' + this.data.pic.src + ') no-repeat',
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        '-webkit-filter': filter,
        filter: filter
      })
      this.$container.find('#cps-upload-img').css({ left: -99999 });   //记住  that.$upload !== that.$container.find('#cps-upload-img')
    }

    //设置了视频播放区域
    if (_area.w) {

      //未设置过视频播放区域
      if (_area.x !== undefined) {
        var _w = _area.w * this.bgW;
        var _h = _area.h * this.bgH;
      } else {
        var _w = _area.w;
        var _h = _area.h;
      }

      var _x = _area.x * this.bgAreaWH.w;
      var _y = _area.y * this.bgAreaWH.h;

      this.$inputWidth.val(_w);
      this.$inputHeight.val(_h).attr('disabled', true);

      this.$videoLocation.css({
        width: this.getSacleWH(_w) + 'px',
        height: this.getSacleWH(_h) + 'px',
        left: _x + 'px',
        top: _y + 'px'
      });
    }
  }
}


/**
 * 初始化拖拽功能
 */
CustomPointSetting.prototype.initDrag = function () {
  var that = this;
  that.Drag(this.$videoLocation, function (x, y) {
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

/**
 * 时间格式话
 * @param time
 * @param timePlace
 */
CustomPointSetting.prototype.formatTime = function (time) {
  //默认获取的时间是时间戳改成我们常见的时间格式
  //分钟
  var minute = time / 60;
  var minutes = parseInt(minute);
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  //秒
  var second = time % 60;
  var seconds = parseInt(second);
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  var allTime = minutes + ":" + seconds;
  return allTime;
}
