(function () {
	var currentScriptSrc = Util.getBasePath(document.currentScript.src);
	Util.loadCSS(Util.getBasePath(document.currentScript.src) + '/style.css')
})()

window.Modal_3DViewer = (function () {

	var currentScriptSrc = Util.getBasePath(document.currentScript.src);
  /**
   * 点读点类型弹窗
   * @param {any} selector 弹窗对应的点读点
   * @param {any} selectedType  选中的类型 
   */
	function Modal_3DViewer(options) {
		var that = this
		that.options = options || {}

		// 区域点读点设置
		Util.getTpl(currentScriptSrc + '/tpl.html', function (tpl) {
			var div = document.createElement('div')
			div.setAttribute('id', '__modal_3dviewer__')
			$('body').append(div)

			var tpls = Handlebars.compile(tpl)
			$(div).append(tpls())

			that.initVar();
			that.bindEvent();
			that.initData();
		})
	}

	Modal_3DViewer.prototype.initVar = function () {
		this.$container = $('#__modal_3dviewer__')
		this.$wrapper = this.$container.find('.js-viewer3d-wrapper')
		this.$btnScale = this.$container.find('.js-viewer3d-scale')
		this.$scene = this.$container.find('#scene')
		this.$help = this.$container.find('.js-viewer3d-help')
	}

	Modal_3DViewer.prototype.initData = function () {
	}

  /**
   * 关闭弹窗
   */
	Modal_3DViewer.prototype.bindEvent = function () {
		var that = this
		new ObjViewer('scene', {
			url: this.options.url,
			data: that.options.data
		})

		that.$wrapper.on('click', function (e) {
			if ($(e.target).hasClass('js-viewer3d-wrapper')) {
				that.close()
			}
		})

		that.$btnScale.on('click', function () {
			if (that.$btnScale.attr('data-max') === '1') {
				that.$btnScale.attr('data-max', 0).removeClass('viewer3d-btns__scale--normal')
				that.$scene.css({
					width: '80%',
					height: '80%'
				})
			} else {
				that.$btnScale.attr('data-max', 1).addClass('viewer3d-btns__scale--normal')
				that.$scene.css({
					width: '100%',
					height: '100%'
				})
			}
		})

		that.$help.on('click', function () {
			that.$help.hide()
		})

		setTimeout(function () {
			that.$help.hide()
		}, 3000)
	}

  /**
   * 关闭弹窗
   */
	Modal_3DViewer.prototype.close = function () {
		this.$container.remove()
	}

	return Modal_3DViewer
})()
