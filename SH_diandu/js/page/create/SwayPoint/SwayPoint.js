(function () {
  Util.loadCSS(Util.getBasePath(document.currentScript.src) + '/style.css')
})()

window.SwayPoint = (function () {
  var _layer, _audio_layer, _temp_audio;
  var currentScriptSrc = Util.getBasePath(document.currentScript.src)
  var CONFIG_DATA = {
    title: '摆动图设置',
    items: [
      { type: 'slide', name: 'angle', label: '摆动角度', unit: '', min: -60, max: 60, defaultValue: [-30, 30] },
      { type: 'slide', name: 'speed', label: '速度', unit: '秒/次', min: 1, max: 10, defaultValue: 5 },
      { type: 'slide', name: 'count', label: '摆动次数', unit: '', min: 1, max: 10, defaultValue: 5 },
      { type: 'slide', name: 'scale', label: '摆动放大', unit: '%', min: -50, max: 50, defaultValue: 0 },
      { type: 'button', name: 'blink', label: '摆动闪烁', unit: '', html: '<div class="swap-blink-enable" data-name="blink" data-enable="false">闪烁</div>' },
      { type: 'button', name: 'audio', label: '摆动音频', unit: '', html: '<div class="swap-select-audio" data-name="audio">选择音频</div>' },
    ],
    audios: [
      { label: '鸟鸣', src: 'assets/show/1.mp3' },
      { label: '滴水', src: 'assets/show/2.mp3' },
      { label: '叫声', src: 'assets/show/3.mp3' }
    ]
  }
  /**
   * 点读点类型弹窗
   * @param {any} selector 弹窗对应的点读点
   * @param {any} selectedType  选中的类型
   */
  function SwayPoint(options) {
    var that = this
    this.callback = options.callback
    this.setUploadify = options.setUploadify || (_upload && _upload.initWebUpload);

    this.data = $.extend({
      color: '#FB0006',
      colorSize: 5,
      type: 'sway',
      audio: {}
    }, options.data)

    _temp_audio = this.data.audio;

    CONFIG_DATA.audios = addItem2Audios(CONFIG_DATA.audios, this.data.audio);

    // 根据模板引擎生成页面
    Util.getTpl(currentScriptSrc + '/tpl.html', function (tpl) {
      var div = document.createElement('div')
      div.setAttribute('id', '__SwayPoint__')
      document.body.append(div)

      var tpls = Handlebars.compile(tpl)
      $(div).append(tpls(CONFIG_DATA))

      _layer = layer.open({
        type: 1,
        scrollbar: false,
        area: ['600px', '550px'],
        title: false,
        shadeClose: false,
        content: $(div),
        cancel: function () {
          that.close();
        }
      })

      that.initSlide();
      that.initVar(options);
      that.bindEvent();
      that.initData();
    })
  }

  SwayPoint.prototype.initSlide = function () {
    var that = this

    //设置闪烁光晕的大小
    var colorSizeSlide = new Slider("#swayColorSetting", {
      step: 1,
      min: 1,
      max: 10,
      value: that.data.colorSize || 5
    });
    colorSizeSlide.on('slide', function (slideEvt) {
      that.data.colorSize = slideEvt.value;
      var filter = "drop-shadow(0px 0px " + that.data.colorSize + "px " + that.data.color + ")"
      that.$showImg.css({
        '-webkit-filter': filter,
        filter: filter
      })
    })

    // 摇摆图控制滑动条
    for (var i = 0; i < CONFIG_DATA.items.length; i++) {
      var item = CONFIG_DATA.items[i]
      if (item.type === "slide") {
        var _slide = new Slider(".sway-content__op-item input[name='" + item.name + "']", {
          step: 1,
          min: item.min,
          max: item.max,
          value: that.data[item.name] || item.defaultValue
        });

        _slide.on('slide', function (slideEvt) {
          let name = $(slideEvt.target).attr('name');
          that.data[name] = slideEvt.value;
        })
      }
    }

    /**
   * 点读点自定义 图片上传（如果上传gif图则展示上传静态度的按钮）
   */
    that.setUploadify('#sway-upload-img', {
      onUploadSuccess: function (file, result) {
        result = result._raw
        Util.getImageWH(result, function (obj) {
          that.data.src = result;
          that.data.w = obj.w;
          that.data.h = obj.h;
          //that.$upload 还是最早保存的变量,
          that.$container.find('#sway-upload-img').css({ left: -99999 });   //记住  that.$upload !== that.$container.find('#cps-upload-img')

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
  }

  // 初始化变量
  SwayPoint.prototype.initVar = function (options) {
    options = options || {};
    this.closeCallback = options.closeCallback;
    this.$container = $('#__SwayPoint__');
    this.$upload = this.$container.find('#sway-upload-img');
    this.$submit = this.$container.find('.js-submit');
    this.$showImg = this.$container.find('.sway-show-img');
    this.$showColor = this.$container.find('.sway-show-color');
    this.$btnBlink = this.$container.find('.swap-blink-enable');
    this.$btnSelectAudio = this.$container.find('.swap-select-audio')
  }

  /**
   * 绑定点击事件
   */
  SwayPoint.prototype.bindEvent = function () {
    var that = this

    /**
     * 是否闪烁
     */
    that.$btnBlink.on('click', function () {
      var name = that.$btnBlink.attr('data-name')
      var enable = that.$btnBlink.attr('data-enable')
      if (enable === "true") {
        that.$btnBlink.removeClass('swap-blink-enable--active')
        that.$btnBlink.attr('data-enable', 'false')
        that.data[name] = false
      } else {
        that.$btnBlink.addClass('swap-blink-enable--active')
        that.$btnBlink.attr('data-enable', 'true')
        that.data[name] = true
      }
    })

    /**
     * 重新上传图片
     */
    that.$showImg.off().on('click', function (e) {
      if (confirm('是否重新选择图片？')) {
        that.data.src = null;
        that.$container.find('#sway-upload-img').css({ left: 0 });
        that.$showImg.hide().html("");
      }
    })

    /**
     * 选中自定义图片的发光的颜色
     */
    that.$showColor.off().on('click', function (e) {
      var $tar = $(e.target);
      var $cTar = $(e.currentTarget);
      var color = $tar.attr('style').split(':')[1];

      $cTar.find('li').removeClass('sway-show-color-active');
      $tar.addClass('sway-show-color-active');

      if (color) {
        color = color.replace(';', '');
        that.data.color = color;
        var filter = "drop-shadow(0px 0px " + that.data.colorSize + "px " + color + ")"
        that.$showImg.css({
          '-webkit-filter': filter,
          filter: filter
        })
      }
    })

    /**
     * 提交
     */
    that.$submit.on('click', function () {
      that.close()
      if (that.callback) {
        that.callback(that.data)
      }
    })


    /**
     *  上传音效,弹出弹窗，选择音效
     */
    that.$btnSelectAudio.on('click', function () {
      var audio_div = document.createElement('div')
      audio_div.setAttribute('id', '__SwayPoint_audio__')
      document.body.append(audio_div)

      var $content = that.$container.find('.sway-audio-container').clone()
      $content.show()
      $(audio_div).append($content)

      _audio_layer = layer.open({
        type: 1,
        scrollbar: false,
        area: ['500px', '400px'],
        title: false,
        shadeClose: false,
        content: $(audio_div),
        cancel: function (index) {
          layer.close(index);
          $(audio_div).remove();
        },
        success: function () {
          that.bindAudioEvent()
        }
      })
    })
  }

  SwayPoint.prototype.bindAudioEvent = function () {
    var that = this;
    this.$audioContainer = $('#__SwayPoint_audio__');
    this.$audioSubmit = this.$audioContainer.find('.js-audio-submit');
    this.$audiosItem = this.$audioContainer.find('.js-audios .sway-audios__item')

    // 初始化数据
    this.$audioContainer
      .find('.js-audios .sway-audios__item[data-src="' + this.data.audio.src + '"]')
      .addClass('sway-audios__item--active')

    // 音频选择提交事件
    this.$audioSubmit.on('click', function () {
      layer.close(_audio_layer);
      that.$audioContainer.remove();
      that.data.audio = _temp_audio;
      that.$btnSelectAudio.text(that.data.audio.label);
      _temp_audio = {};
    })

    // 选择音频(采用事件委托)
    this.$audioContainer.on('click', '.sway-audios__item', function (e) {
      var $cTar = $(e.currentTarget)

      for (var i = 0; i < that.$audiosItem.length; i++) {
        that.$audiosItem.eq(i).removeClass('sway-audios__item--active')
      }

      $cTar.addClass('sway-audios__item--active')
      _temp_audio = $cTar.data();
    })

    /**
   * 点读点自定义 图片上传（如果上传gif图则展示上传静态度的按钮）
   */
    var $progress = $('#__SwayPoint_audio__ #sway__progress');
    $progress.css({
      'z-index': 100,
      'line-height': '30px'
    })

    that.setUploadify('#__SwayPoint_audio__ #sway-upload-audio', {
      id: that.data.id,
      fileTypeExts: 'audio/mpeg',
      fileTypeDesc: 'MP3文件',
      onUploadProgress: function (file, percentage) {
        if ($progress) {
          $progress.show()
          var percent = parseInt(percentage * 100);
          $progress.text(percent + '%')
          $progress.css('width', percent + '%')
          if (percent === 100) {
            $progress.hide()
          }
        }
      },
      onUploadSuccess: function (file, result) {
        result = result._raw
        _temp_audio = {
          src: result,
          label: file.name
        }

        var html = []
        html.push('<li class="sway-audios__item" title="' + file.name + '" data-src="' + result + '" data-label="' + file.name + '">')
        html.push('    <img src="imgs/audio-icon.png" alt="音效">')
        html.push('    <p>' + file.name + '</p>')
        html.push('</li>')

        that.$audioContainer.find('.js-audios').append(html.join(''))
      }
    });
  }

  /**
   * 关闭弹窗
   */
  SwayPoint.prototype.close = function () {
    layer.closeAll()
    this.$container.remove()
  }

  /**
   * 初始化数据
   */
  SwayPoint.prototype.initData = function () {
    //设置了自定义图片
    if (this.data.src) {
      var filter = "drop-shadow(0px 0px " + this.data.colorSize + "px " + this.data.color + ")"
      this.$showImg.show().css({
        background: 'url(' + this.data.src + ') no-repeat',
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        '-webkit-filter': filter,
        filter: filter
      })
      this.$container.find('#sway-upload-img').css({ left: -99999 });   //记住  that.$upload !== that.$container.find('#cps-upload-img')
    }

    //初始化发光颜色
    var _$colors = this.$showColor.find('li');
    _$colors.removeClass('sway-show-color-active');
    for (var i = 0; i < _$colors.length; i++) {
      var _$color = _$colors.eq(i);
      if (_$color.attr('style').split(':')[1].indexOf(this.data.color) !== -1) {
        _$color.addClass('sway-show-color-active');
        break;
      }
    }

    // 初始化是否闪烁
    if (this.data.blink) {
      this.$btnBlink.addClass('swap-blink-enable--active').attr('data-enable', true)
    }

    if (this.data.audio) {
      this.$btnSelectAudio.text(this.data.audio.label)
    }
  }


  /**
   * 公用的普通方法
   * 添加配置项到默认数组中
   */
  function addItem2Audios(audios, item) {
    if (item && item.src) {
      var length = audios.length;
      var flag = false;  //是否可以插入到数组中
      for (var i = 0; i < length; i++) {
        var audioItem = audios[i];
        if (audioItem.src === item.src) {
          flag = true;
          break;
        }
      }
      if (!flag) {
        audios.push(item);
      }
    }
    return audios;
  }

  return SwayPoint
})()