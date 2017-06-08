(function () {
	var currentScriptSrc = Util.getBasePath(document.currentScript.src);
	Util.loadCSS(currentScriptSrc + '/style.css')
	Util.loadJS(currentScriptSrc + '/Modal_3DViewer/Modal_3DViewer.js')
	Util.loadJS(currentScriptSrc + '/modal_audio/Modal_Audio.js')
	Util.loadJS(currentScriptSrc + '/modal_video/Modal_Video.js')
})()

window.DrawAreaPoint = (function () {
	var currentScriptSrc = Util.getBasePath(document.currentScript.src);
  /**
   * 点读点类型弹窗
   * @param {any} selector 弹窗对应的点读点
   * @param {any} selectedType  选中的类型 
   */
	function DrawAreaPoint(options) {
		var that = this
		that.options = options;
		that.submitCallback = options.callback;
		that.pointData = _data.getDDItems(options.dataid)
		that.$container = $(options.id)


		// 根据模板引擎生成页面
		Util.getTpl(currentScriptSrc + '/tpl.html', function (tpl) {
			$(options.id).append(tpl)
			that.initVue()

			// 生成vue后，$container 就变成新的，因此这里需要重新获取下，否则设置操作的DOM不是页面上展示的那个
			that.$container = $(options.id)
		})
	}

	/************************************************************
	 * 	VUE 相关操作
	 * 	1. vue的el属性，可以设置dom节点，可以放选择器
	 * 	2. vue初始化后，刚开始在dom上设置的事件，就被清除了
	 ************************************************************/
	DrawAreaPoint.prototype.initVue = function () {
		var that = this

		var origin_rotate = 0
		if (that.pointData.drawcustomarea && that.pointData.drawcustomarea.rotate) {
			origin_rotate = that.pointData.drawcustomarea.rotate
		}

		// 初始数据，默认从页面中获取，这样就和数据无关了,等操作完成，在插入到数据中
		that.originData = {
			w: parseInt(that.$container.css('width')),
			h: parseInt(that.$container.css('height')),
			x: parseInt(that.$container.css('left')),
			y: parseInt(that.$container.css('top')),
			rotate: 0
		}

		var defaultData = {
			index: 1,
			type: 'audio',
			params: [
				{ label: 'x', key: 'x' },
				{ label: 'y', key: 'y' },
				{ label: '宽度', key: 'w' },
				{ label: '高度', key: 'h' },
				{ label: '角度', key: 'rotate' },
			],
			paramsData: that.originData,
			show_param: false
		}

		var data = {
			index: that.options.pointIndex,
			type: that.pointData.type
		}

		data = $.extend(defaultData, data)

		that.vm = new Vue({
			el: that.$container[0],
			data: data,
			mounted: function () {
				this.paramsData.rotate = origin_rotate
				var vueThat = this
				//设置区域可以移动
				new Drag(that.options.id, function (x, y) {
					vueThat.paramsData.x = x
					vueThat.paramsData.y = y
					vueThat._is_move = true
				}, true)
			},
			computed: {
			},
			watch: {
				'paramsData.w': function () {
					that.$container.css('width', this.paramsData.w)
					this.updateData()
				},
				'paramsData.h': function () {
					that.$container.css('height', this.paramsData.h)
					this.updateData()
				},
				'paramsData.x': function () {
					that.$container.css('left', this.paramsData.x + 'px')
					this.updateData()
				},
				'paramsData.y': function () {
					that.$container.css('top', this.paramsData.y + 'px')
					this.updateData()
				},
				'paramsData.rotate': function () {
					var _pointData = _data.getDDItems(that.options.dataid)
					var point_size = parseInt(_pointData.point_size) || parseInt(window.DD.point_size)
					var css = 'rotate(' + this.paramsData.rotate + 'deg)'
					if (point_size) {
						css += ' scale(' + point_size / 100 + ')'
					}
					that.$container.attr('data-rotate', this.paramsData.rotate)
					that.$container.css('transform', css)
					this.updateData()
				}
			},
			methods: {
				handleShowParam: function (e) {
					if ($(e.target).hasClass('draw-area-point__container')) {
						// 由于鼠标移动 mousedown 会先执行，然后在执行 click事件，
						// 因此只要在移动的时候，添加一个标记，然后在 click 里面把标记清除即可
						if (!this._is_move) {
							this.show_param = !this.show_param
							if (this.show_param) {
								$(e.target).parent('.draw-area-container').css('z-index', 99)
							} else {
								$(e.target).parent('.draw-area-container').css('z-index', 0)
							}
						}
					}
					this._is_move = false

				},
				handleClickSetting: function () {
					that.options.data = that.pointData.drawcustomarea || {}
					that.options.pointData = that.pointData
					switch (that.pointData.type) {
						case 'audio':
							new Modal_Audio(that.options)
							break
						case 'video':
							new Modal_Video(that.options)
							break
						case 'viewer3d':
							new Modal_3DViewer(that.options)
							break
						default:
							new Modal_Audio(that.options)
					}
				},
				handleMouseDown: function (startEv) {
					startEv.stopPropagation()

					var type = $(startEv.target).data('type')

					var vueThat = this
					// 记录移动前位置
					var startX = startEv.clientX
					var startY = startEv.clientY
					var distX = 0
					var distY = 0
					// 记录区域移动前大小和位置
					var origin = {
						width: parseInt(vueThat.paramsData.w),
						height: parseInt(vueThat.paramsData.h),
						x: parseInt(vueThat.paramsData.x),
						y: parseInt(vueThat.paramsData.y),
						rotate: parseInt(vueThat.paramsData.rotate)
					}

					$(document).on('mouseup', function () {
						$(document).off()
					})


					$(document).on('mousemove', function (moveEv) {
						moveEv.stopPropagation()
						distX = parseInt(moveEv.clientX - startX)
						distY = parseInt(moveEv.clientY - startY)

						// 临时大小和位置
						var temp_w = origin.width
						var temp_h = origin.height
						var temp_x = origin.x
						var temp_y = origin.y
						var temp_rotate = origin.rotate

						// 不同的位置移动，不同的效果
						switch (type) {
							case 'top':
								temp_y += distY
								temp_h -= distY
								break
							case 'bottom':
								temp_h += distY
								break
							case 'left':
								temp_x += distX
								temp_w -= distX
								break
							case 'right':
								temp_w += distX
								break
							case 'top_left':
								temp_y += distY
								temp_h -= distY
								temp_x += distX
								temp_w -= distX
								break
							case 'top_right':
								temp_y += distY
								temp_h -= distY
								temp_w += distX
								break
							case 'bottom_left':
								temp_h += distY
								temp_x += distX
								temp_w -= distX
								break
							case 'bottom_right':
								temp_w += distX
								temp_h += distY
								break
							case 'rotate':
								temp_rotate += parseInt(distX)
								temp_rotate = temp_rotate % 360
								break
						}

						vueThat.paramsData.w = temp_w
						vueThat.paramsData.h = temp_h
						vueThat.paramsData.x = temp_x
						vueThat.paramsData.y = temp_y
						vueThat.paramsData.rotate = temp_rotate
					})
				},
				/**
				 * 修改区域大小，或者位置，旋转，都会更新到数据中[提交用的数据]
				 */
				updateData: function () {

					var pageIndex = that.options.dataid.split('_')[0]
					var pointIndex = that.options.dataid.split('_')[1]
					var _pageData = _data.getPageData(pageIndex)
					var _pointData = _data.getDDItems(that.options.dataid)
					var location = getLocation(_pageData.w, _pageData.h, this.paramsData.x, this.paramsData.y)

					_pointData.drawcustomarea.w = this.paramsData.w / _pageData.w
					_pointData.drawcustomarea.h = this.paramsData.h / _pageData.h
					_pointData.drawcustomarea.rotate = this.paramsData.rotate
					_pointData.x = location.x
					_pointData.y = location.y

					_data.setDDItems(that.options.dataid, _pointData)
				}
			}
		})
	}
	return DrawAreaPoint
})()
