//加载依赖的脚本和样式
(function () {
	function getBasePath() {
		//兼容Chrome 和 FF
		var currentPath = document.currentScript && document.currentScript.src || '';
		var paths = currentPath.split('/');
		paths.pop();
		return paths.join('/');
	}
	Util.loadCSS(getBasePath() + '/style.css');
})();

/**
 * 区域设置相关代码
 * 1. 初始化区域设置的相关展示页面
 * 2. 初始化区域设置的相关逻辑【比如可以直接操作模型，直接播放音频，直接查看考试等】
 */
window.AreaSetting = (function () {
	/**
	 *  计算宽高，坐标
	 */
	function getWHXY(drawCustomArea, _pointData, imgW, imgH) {
		var w = imgW * parseFloat(drawCustomArea.w || 0.2);
		var h = imgH * parseFloat(drawCustomArea.h || 0.2);
		var x = imgW * parseFloat(_pointData.x);
		var y = imgH * parseFloat(_pointData.y);

		// 圆型,宽高一样，按小的算
		if (drawCustomArea.pointType === 'circle') {
			if (w > h) {
				w = h;
			} else {
				h = w;
			}
		}
		return {
			x: x,
			y: y,
			w: w,
			h: h
		}
	}

	function initHTML_Vierer3d(pointId, drawCustomArea, _pointData, imgW, imgH) {
		var whxy = getWHXY(drawCustomArea, _pointData, imgW, imgH)
		var w = whxy.w
		var h = whxy.h
		var x = whxy.x
		var y = whxy.y

		var html = ''
		var css = 'width:' + w + 'px;height:' + h + 'px;left:' + x + 'px;top:' + y + 'px;' + 'background:none; border:1px solid #000;';
		css += 'border-color:' + Util.hex2RGBA(drawCustomArea.borderColor, drawCustomArea.border_opacity) + '; border-width:' + drawCustomArea.border_width + 'px;';
		css += 'opacity:' + drawCustomArea.btn_opacity + ';'

		html += '<div data-id="' + pointId + '" data-opacity="' + drawCustomArea.btn_opacity + '"  class="draw-custom-area draw-custom-area__' + drawCustomArea.pointType + ' " style="' + css + '">'
		html += '   <div class="m-viewer3d__point js-viewer3d-point" data-style="' + css + '"></div>'
		html += '   <div class="m-viewer3d__tip js-viewer3d-tip"></div>'
		html += '   <canvas class="m-viewer3d__canvas no-swiper no-scale" data-url="' + _pointData.url + '" id="viewer3d_' + pointId + '"></canvas>'
		html += '</div>'

		// 模型视窗的操作区域，覆盖点读页，让在这上面的操作针对模型
		var wrapCss = 'width:' + imgW + 'px;height:' + imgH + 'px;';
		var eventAreaCss = 'width:' + w + 'px;height:' + h + 'px;left:' + x + 'px;top:' + y + 'px;' + 'background:none;';
		var eventAreaHtml = ''
		eventAreaHtml += '<div class="m-viewer3d__event u-hide" id="viewer3d_event_' + pointId + '">'
		eventAreaHtml += '	<div class="m-viewer3d__event-wrap" style="' + wrapCss + '">'
		eventAreaHtml += '		<div class="m-viewer3d__event-area js-viewer3d-event-area" style="' + eventAreaCss + '">'
		eventAreaHtml += '		<div class="viewer3d-btns__scale m-viewer3d__event-scale js-viewer3d-event-scale"></div>'
		eventAreaHtml += '		</div>'
		eventAreaHtml += '	</div>'
		eventAreaHtml += '</div>'
		$('body').append(eventAreaHtml)

		return html
	}
	/**
	 * 初始化3D模型的区域设置
	 * @param pageIndex 点读页下标
	 * @param pointIndex 点读点下标
	 * @param pointData 点读点数据
	 */
	function initViewer3d(pageIndex, pointIndex, pointData) {
		/**
		 * 只能在点读区域中进行对模型进行操作
		 */
		var canvasId = 'viewer3d_' + pageIndex + '_' + pointIndex
		var canvasEventAreaId = 'viewer3d_event_' + pageIndex + '_' + pointIndex
		var $canvas = $('#' + canvasId)
		new ObjViewer(canvasId,
			{
				url: $canvas.data('url'),
				width: $canvas.width(),
				height: $canvas.height(),
				data: pointData.drawcustomarea,
				canvasEventAreaId: canvasEventAreaId,   //获取焦点后，在该区域上操作，作用在模型上
				cbCloseEventArea: function (ev, dom, temp_canvasId, setRenderSize) {
					// ev 点击事件源  dom 操作模型的事件区域  canvasId 模型展示区域的id
					var $temp_canvas = $('#' + temp_canvasId)
					var $viewer3d_tip = $temp_canvas.parent().find('.js-viewer3d-tip')
					var $viewer3d_point = $temp_canvas.parent().find('.js-viewer3d-point')

					if (ev.target.className.indexOf('js-viewer3d-event-scale') !== -1) {

						if (!$temp_canvas.parent().hasClass('viewer3d_max')) {
							$temp_canvas.parent().addClass('viewer3d_max')
							$(dom).find('.js-viewer3d-event-area').addClass('viewer3d_event_max')
						} else {
							$temp_canvas.parent().removeClass('viewer3d_max')
							$(dom).find('.js-viewer3d-event-area').removeClass('viewer3d_event_max')
						}
						setRenderSize($temp_canvas.parent().width(), $temp_canvas.parent().height())

					} else if (ev.target.className.indexOf('js-viewer3d-event-area') === -1) {
						dom.classList.add('u-hide')
						$viewer3d_point.show()
						$viewer3d_tip.hide()

						//  如果已经放大了，则还原到原来大小
						$temp_canvas.parent().removeClass('viewer3d_max')
						$(dom).find('.js-viewer3d-event-area').removeClass('viewer3d_event_max')
						setRenderSize($temp_canvas.parent().width(), $temp_canvas.parent().height())
					} else {
						// 如何点击的时候，操作提示图还没有隐藏，则手动关闭（默认3s关闭）
						if ($viewer3d_tip.css('display') !== 'none') {
							$viewer3d_tip.hide()
						}
					}
				}
			})
	}

	/**
	 * ==============================================================================
	 * 下一个：音频区域设置相关操作
	 * ==============================================================================
	 */

	/**
	 * 初始化音频的区域设置,以及相关展示页面
	 */
	function initHTML_Audio(pointId, drawCustomArea, _pointData, imgW, imgH) {
		var whxy = getWHXY(drawCustomArea, _pointData, imgW, imgH)
		var w = whxy.w
		var h = whxy.h
		var x = whxy.x
		var y = whxy.y

		var html = ''
		var css = 'width:' + w + 'px;height:' + h + 'px;left:' + x + 'px;top:' + y + 'px;' + 'background:none; border:1px solid #000;';
		css += 'border-color:' + Util.hex2RGBA(drawCustomArea.border_color, drawCustomArea.border_opacity / 100) + '; border-width:' + drawCustomArea.border_width + 'px;';

		html += '<div data-id="' + pointId + '" data-url="' + _pointData.url + '"  class="area-setting__audio draw-custom-area draw-custom-area__' + drawCustomArea.pointType + '" style="' + css + '">'
		html += '</div>'
		return html
	}

	// 给音频区域添加事件
	function initAudio() {
		$('.area-setting__audio').off().on('click', function (e) {
			var $cTar = $(e.currentTarget)

			$('.area-setting__audio').removeClass('audio-point-blink')
			$('.area-setting__audio').css({ opacity: 0 })
			$('.area-setting__audio').removeAttr('data-show')

			$cTar.css({ opacity: 1 })
			$cTar.addClass('audio-point-blink')
			$cTar.attr('data-show', '1')

			playAreaAudio($cTar.data('url'), $cTar)

			$cTar.parents('.wrap').off().on('click', function (e) {
				if (!$(e.target).hasClass('area-setting__audio')) {
					stopAreaAudio()
					$cTar.parents('.wrap').off()
					setAreaAudioSrcNull()
				}
			})
		})
	}

	function playAreaAudio(src, $dom) {
		if (!window._area_audio_) {
			window._area_audio_ = new Audio()
		}
		// 音频地址不一样，则重新赋值音频
		if ($(window._area_audio_).find('source').eq(1).attr('src') !== src) {
			Util.setAudioSource(window._area_audio_, src)

			window._area_audio_.addEventListener('canplaythrough', function (e) {
				window._area_audio_.play()
			})

			window._area_audio_.addEventListener('ended', function () {
				stopAreaAudio()
				setAreaAudioSrcNull()
				$dom.removeAttr('data-show')
			})
		} else {  //地址一样，表示点击暂停播放,或者再次点击播放
			if (window._area_audio_.paused) {
				window._area_audio_.play()
			} else {
				stopAreaAudio(true)
			}
		}
	}

	/**
	 * 暂停播放
	 * @param {boolean} flag true,边线不透明
	 */
	function stopAreaAudio(flag) {
		if (!flag) {
			$('.area-setting__audio').css({ opacity: 0 })
		}
		$('.area-setting__audio').removeClass('audio-point-blink')
		if (window._area_audio_ && !window._area_audio_.paused) {
			window._area_audio_.pause()
		}
	}

	function setAreaAudioSrcNull() {
		if (window._area_audio_) {
			$(window._area_audio_).html('')
		}
	}


	/**
	 * ==============================================================================
	 * 下一个：视频区域设置相关操作
	 * ==============================================================================
	 */

	/**
	 * 初始化视频的区域设置,以及相关展示页面
	 */
	function initHTML_Video(pointId, drawCustomArea, _pointData, imgW, imgH) {
		var whxy = getWHXY(drawCustomArea, _pointData, imgW, imgH)
		var w = whxy.w
		var h = whxy.h
		var x = whxy.x
		var y = whxy.y

		var url = _pointData.url
		var currentTime = drawCustomArea.currentTime

		var html = ''
		var css = 'width:' + w + 'px;height:' + h + 'px;left:' + x + 'px;top:' + y + 'px;' + 'background:none; border:1px solid #000;';
		css += 'border-color:' + Util.hex2RGBA(drawCustomArea.border_color, drawCustomArea.border_opacity / 100) + '; border-width:' + drawCustomArea.border_width + 'px;';
		css += 'opacity:' + drawCustomArea.btn_opacity + ';'

		html += '<div data-id="' + pointId + '"  class="draw-custom-area" style="' + css + '">'
		html += '		<video data-src="' + url + '"></video>'
		html += '   <div class="area-setting__video js-area-setting-video" data-style="' + css + '"></div>'
		html += '   <div data-time="' + currentTime + '" data-src="' + url + '" class="area-setting__video-poster" data-style="' + css + '"></div>'
		html += '</div>'
		return html
	}

	function initVideo() {

		// 设置视频的背景图片
		var $areaVideos = $('.area-setting__video-poster')
		for (var i = 0; i < $areaVideos.length; i++) {
			var $ele = $areaVideos.eq(i)
			var url = $ele.data('src')
			var time = $ele.data('time')
			if (time !== 'undefined') {
				Util.getVideoImage(url, time, function (result) {
					$ele.css('backgroundImage', 'url(' + result.base64 + ')')
				})
			}
		}

		$('.js-area-setting-video').off().on('click', function (e) {
			var $cTar = $(e.currentTarget)
			$cTar.css('background', 'initial')

			var $video = $cTar.parent().find('video')

			$video.on('pause', function (e) {
				$cTar.css('background', '')
				$video.hide()
				$cTar.next('.area-setting__video-poster').show()
				window.SHOWVIDEO = false    //标记，禁止因为视频全屏，触发的onresize事件, 看 show.js 142行
			})

			if (!$video[0].paused) {
				$video[0].pause()
			} else {
				$video.attr('src', $video.attr('data-src'))
				window.SHOWVIDEO = true
				$video[0].play()
				$video.show()
				$cTar.next('.area-setting__video-poster').hide()
			}

			$cTar.parents('.wrap').off().on('click', function (e) {
				if (!$(e.target).hasClass('js-area-setting-video')) {
					$video[0].pause()
					$cTar.parents('.wrap').off()
				}
			})

		})
	}


	return {
		initHTML_Vierer3d: initHTML_Vierer3d,
		initViewer3d: initViewer3d,
		initHTML_Audio: initHTML_Audio,
		initAudio: initAudio,
		stopAreaAudio: stopAreaAudio,
		initHTML_Video: initHTML_Video,
		initVideo: initVideo,
	}
})()
