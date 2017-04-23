(function () {
  var currentScriptSrc = Util.getBasePath(document.currentScript.src);
  Util.loadCSS(Util.getBasePath(document.currentScript.src) + '/style.css')
})()

window.Modal_3DViewer = (function () {
  var currentScriptSrc = Util.getBasePath(document.currentScript.src);
  var SLIDES = {
    borderOpacity: {
      name: 'border_opacity',
      defaultValue: 1,
      step: 0.1,
      min: 0,
      max: 1
    },
    borderWidth: {
      name: 'border_width',
      defaultValue: 5,
      step: 1,
      min: 0,
      max: 10
    },
    btnOpacity: {
      name: 'btn_opacity',
      defaultValue: 1,
      step: 0.1,
      min: 0,
      max: 1
    }
  }
  /**
   * 点读点类型弹窗
   * @param {any} selector 弹窗对应的点读点
   * @param {any} selectedType  选中的类型 
   */
  function Modal_3DViewer(options) {

    var that = this
    that.options = options;
    that.data = options.data || {}

    that.submitCallback = options.callback;

    this.setUploadify = options.setUploadify || (_upload && _upload.initWebUpload)

    SLIDES.borderOpacity.value = that.data.border_opacity;
    SLIDES.borderWidth.value = that.data.border_width;
    SLIDES.btnOpacity.value = that.data.btn_opacity;

    // 区域点读点设置
    Util.getTpl(currentScriptSrc + '/tpl.html', function (tpl) {
      var div = document.createElement('div')
      div.setAttribute('id', '__modal_3dviewer__')
      document.body.append(div)

      var tpls = Handlebars.compile(tpl)
      $(div).append(tpls({ title: '区域设置', slides: SLIDES }))

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
      that.initVar();
      that.bindEvent(SLIDES);
      that.initData();
    })
  }

  Modal_3DViewer.prototype.initVar = function () {
    this.$container = $('#__modal_3dviewer__')
    this.$btnBorderColor = this.$container.find('input[name="borderColor"]')
    this.$btnSubmit = this.$container.find('.js-submit')
    this.$uploadImg = this.$container.find('.js-ds-upload-img')
    this.$btnBgColor = this.$container.find('.js-ds-btn-bg-color')
    this.$bgColor = this.$container.find('input[name="bgColor"]')
    this.$btnModelColor = this.$container.find('.js-ds-btn-model-color')
    this.$modelColor = this.$container.find('input[name="modelColor"]')
  }

  Modal_3DViewer.prototype.initData = function () {
    if (this.data.borderColor) {
      this.$btnBorderColor[0].value = this.data.borderColor
    }

    if (this.data.btn_opacity) {
      this.$uploadImg.css({
        opacity: this.data.btn_opacity
      })
    }
    if (this.data.border_width) {
      this.$uploadImg.css({
        borderWidth: this.data.border_width
      })
    }

    this.$uploadImg.css({
      borderColor: this.data.borderColor,
      backgroundColor: this.data.bgcolor,
      borderWidth: this.data.border_width,
    })

    if (this.data.bgImgUrl) {
      this.$uploadImg.css({
        backgroundImage: 'url(' + this.data.bgImgUrl + ')'
      })
    }

    this.$btnBgColor.css({
      backgroundColor: this.data.bgcolor
    })

    this.$btnModelColor.css({
      backgroundColor: this.data.modelColor
    })
  }

  /**
   * 关闭弹窗
   */
  Modal_3DViewer.prototype.bindEvent = function () {
    var that = this;

    /**
     * 点读点自定义 图片上传（如果上传gif图则展示上传静态度的按钮）
     */
    that.setUploadify('#ds-content-img', {
      onUploadSuccess: function (file, result) {
        result = result._raw
        that.data.bgImgUrl = result;
        that.$uploadImg.css({
          backgroundImage: 'url(' + result + ')',
          backgroundSize: '100%'
        })
      }
    });

    that.$btnSubmit.on('click', function () {

      for (var key in SLIDES) {
        if (SLIDES.hasOwnProperty(key)) {
          var _slideItem = SLIDES[key];
          var _selector = "#__modal_3dviewer__ input[name='" + _slideItem.name + "']";
          that.data[_slideItem.name] = parseFloat($(_selector).val())
        }
      }

      that.data['bgColor'] = $('#__modal_3dviewer__ input[name="bgColor"]').val()
      that.data['borderColor'] = $('#__modal_3dviewer__ input[name="borderColor"]').val()
      that.data['modelColor'] = $('#__modal_3dviewer__ input[name="modelColor"]').val()

      that.close()
      if (that.submitCallback) {
        that.submitCallback(that.data)
      }
    })

    that.$btnBorderColor.on('change', function (e) {
      var color = $(e.target).val()
      that.data['borderColor'] = color
      that.$uploadImg.css({
        borderColor: color
      })
    })

    that.$btnBgColor.on('click', function () {
      that.$bgColor.click()
    })

    that.$bgColor.on('change', function (e) {
      var color = $(e.target).val()
      that.data['bgColor'] = color
      that.$uploadImg.css({
        backgroundColor: color
      })

      that.$btnBgColor.css({
        backgroundColor: color
      })
    })

    that.$btnModelColor.on('click', function () {
      that.$modelColor.click()
    })

    that.$modelColor.on('change', function (e) {
      var color = $(e.target).val()
      that.data['modelColor'] = color
      that.$btnModelColor.css({
        backgroundColor: color
      })
    })

    /**
     * 初始化滑块组件
     */
    for (var key in SLIDES) {
      if (SLIDES.hasOwnProperty(key)) {
        var _slideData = SLIDES[key];
        var _selector = "#__modal_3dviewer__ input[name='" + _slideData.name + "']";

        (function (_selector, name) {
          var _slider = new Slider(_selector, {
            tooltip: 'hide',
            step: _slideData.step,
            min: _slideData.min,
            max: _slideData.max,
            value: _slideData.value || _slideData.defaultValue,
            formatter: function (val) {
              $(_selector).prev().find('.min-slider-handle').text(val)
            }
          });

          _slider.on('slide', function (slideEvt) {
            that.data[name] = slideEvt.value;
            switch (name) {
              case 'border_opacity':
                // that.$uploadImg.css({
                //   opacity: slideEvt.value
                // })
                break
              case 'border_width':
                that.$uploadImg.css({
                  borderWidth: slideEvt.value
                })
                break
              case 'btn_opacity':
                that.$uploadImg.css({
                  opacity: slideEvt.value
                })
                break
            }
          })
        })(_selector, _slideData.name)
      }
    }
  }

  /**
   * 关闭弹窗
   */
  Modal_3DViewer.prototype.close = function () {
    layer.closeAll()
    $('#__modal_3dviewer__').remove()
  }

  return Modal_3DViewer
})()