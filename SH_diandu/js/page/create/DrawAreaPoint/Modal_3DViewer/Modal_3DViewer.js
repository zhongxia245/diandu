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
		},
		bgOpacity: {
			name: 'bg_opacity',
			defaultValue: 1,
			step: 0.1,
			min: 0,
			max: 1
		}
	}
  /**
   * 点读点类型弹窗
   * @param {any} options 弹窗配置
   * @param {any} selector  不使用弹窗，而是添加到指定的dom节点里面 
   */
	function Modal_3DViewer(options, selectorId) {

		var that = this
		that.options = options;
		that.data = options.data || {}
		that.id = selectorId || '__modal_3dviewer__'

		that.submitCallback = options.callback;

		this.setUploadify = options.setUploadify || (_upload && _upload.initWebUpload)

		SLIDES.borderOpacity.value = that.data.border_opacity;
		SLIDES.borderWidth.value = that.data.border_width;
		SLIDES.btnOpacity.value = that.data.btn_opacity;
		SLIDES.bgOpacity.value = that.data.bg_opacity;

		// 区域点读点设置
		Util.getTpl(currentScriptSrc + '/tpl.html', function (tpl) {
			var tpls = Handlebars.compile(tpl)
			if (selectorId) {
				$('#' + selectorId).append(tpls({ title: '区域设置', slides: SLIDES }))
				// 点模式
				that.data.type = 'point'
			} else {
				//  区域模式
				that.data.type = 'area'
				var div = document.createElement('div')
				div.setAttribute('id', '__modal_3dviewer__')
				document.body.append(div)
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
			}

			that.initVar();
			that.bindEvent(SLIDES);
			that.initData();
		})
	}

	Modal_3DViewer.prototype.initVar = function () {
		this.$container = $('#' + this.id)
		this.$btnBorderColor = this.$container.find('input[name="borderColor"]')
		this.$btnSubmit = this.$container.find('.js-submit')
		this.$uploadImg = this.$container.find('.js-ds-upload-img')
		this.$btnBgColor = this.$container.find('.js-ds-btn-bg-color')
		this.$bgColor = this.$container.find('input[name="bgColor"]')
		this.$btnModelColor = this.$container.find('.js-ds-btn-model-color')
		this.$modelColor = this.$container.find('input[name="modelColor"]')
	}

	Modal_3DViewer.prototype.initData = function () {
		this.data = $.extend({
			bgColor: '#999999',
			borderColor: '#a5a5a5',
			border_opacity: 1,
			bg_opacity: 1,
			btn_opacity: 1,
			border_width: 5
		}, this.data)

		if (this.data.borderColor) {
			this.$btnBorderColor.val(this.data.borderColor)
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
			borderColor: Util.hex2RGBA(this.data.borderColor, this.data.border_opacity),
			backgroundColor: Util.hex2RGBA(this.data.bgColor, this.data.bg_opacity),
			borderWidth: this.data.border_width,
		})

		if (this.data.bgImgUrl) {
			this.$uploadImg.css({
				backgroundImage: 'url(' + this.data.bgImgUrl + ')'
			})
		}

		this.$bgColor.val(this.data.bgColor)
		this.$btnBgColor.css({
			backgroundColor: this.data.bgColor
		})

		this.$modelColor.val(this.data.modelColor)
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
			that.data = that.getData()
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
				var _selector = "#" + that.id + " input[name='" + _slideData.name + "']";

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
								that.$uploadImg.css({
									borderColor: Util.hex2RGBA(that.data.borderColor, slideEvt.value)
								})
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
							case 'bg_opacity':
								that.$uploadImg.css({
									backgroundColor: Util.hex2RGBA(that.data.bgColor, slideEvt.value),
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
		$('#' + this.id).remove()
	}

	Modal_3DViewer.prototype.getData = function () {
		for (var key in SLIDES) {
			if (SLIDES.hasOwnProperty(key)) {
				var _slideItem = SLIDES[key];
				var _selector = "#" + this.id + " input[name='" + _slideItem.name + "']";
				this.data[_slideItem.name] = parseFloat($(_selector).val())
			}
		}

		this.data['bgColor'] = this.$bgColor.val()
		this.data['borderColor'] = this.$btnBorderColor.val()
		this.data['modelColor'] = this.$modelColor.val()

		return this.data
	}

	return Modal_3DViewer
})()
