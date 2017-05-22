(function () {
	var currentScriptSrc = Util.getBasePath(document.currentScript.src);
	Util.loadCSS(Util.getBasePath(document.currentScript.src) + '/style.css')
})()

window.Modal_Audio = (function () {
	var currentScriptSrc = Util.getBasePath(document.currentScript.src);
  /**
   * 点读点类型弹窗
   * @param {any} options 弹窗配置
   * @param {any} selector  不使用弹窗，而是添加到指定的dom节点里面 
   */
	function Modal_Audio(options, selectorId) {
		var that = this
		that.dom_id = '__modal_audio__'
		that.options = options
		// 音频区域点读点设置
		Util.getTpl(currentScriptSrc + '/tpl.html', function (tpl) {
			// 1. 添加一个DOM节点，存放弹窗
			var div = document.createElement('div')
			div.setAttribute('id', that.dom_id)
			document.body.append(div)
			$(div).append(tpl)

			// 2. 使用一个弹窗来展示
			_layer = layer.open({
				type: 1,
				scrollbar: false,
				area: ['600px', '550px'],
				title: false,
				shadeClose: false,
				content: $(div),
				cancel: function () {
					that.close()
				}
			})

			// 3. 初始化Vue组件
			that.initVue()
		})
	}


	/**
	 * 初始化Vue
	 */
	Modal_Audio.prototype.initVue = function () {
		var that = this
		
		var defaultData = {
			title: '音频区域设置',
			border_opacity: 100,
			border_width: 3,
			border_color: '#ff0065'
		}
		var data = $.extend(defaultData, that.options.data)

		that.vue = new Vue({
			el: '#' + this.dom_id,
			data: data,
			computed: {
				border_style: function () {
					var color = Util.hex2RGBA(this.border_color, this.border_opacity / 100)
					return this.border_width + 'px' + ' solid ' + color
				}
			},
			methods: {
				handleBorderColor: function () {
					$('input[name="audio-border-color"]').click()
				},
				handleChangeBorderColor: function (e) {
					var border_color = e.target.value;
					this.border_color = border_color;
				},
				handelSubmit: function () {
					that.close()
					if (that.options.callback) {
						var data = $.extend(that.options.data, this.$data)
						that.options.callback(data)
					} else {
						console.warn('未设置音频区域设置的回调函数')
					}
				}
			}
		})
	}

	/**
	 * 关闭弹窗
	 */
	Modal_Audio.prototype.close = function () {
		layer.closeAll()
		$('#' + this.dom_id).remove()
	}
	return Modal_Audio
})()
