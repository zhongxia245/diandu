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
 * 播放 频的类
 */
window.PlayVideo = (function (Util) {
	var click = Util.IsPC() ? 'click' : 'tap';

  /**
   *  染HTML页面
   * @param src
   * @returns {string}
   */
	function _render(src) {
		var html = [];
		html.push('<div data-id="__videoContainer" class="video-container">')
		html.push('  <div class="vc-btn-close"></div>')
		html.push('  <img class="vc-play" src="./imgs/play.png">')
		html.push(' <div class="vc-video" ><video  webkit-playsinline="" playsinline=""  controls="" data-src="' + src + '" </video></div>')
		html.push('</div>')
		return html.join('')
	}

  /**
   * 把字符串数字 换成数字+px,并且按 例缩小
   * @param strNum 大小
   * @param num 修正竖屏下位置问题[创建的时候,背景图是横屏的, 因此在展示时竖屏有问题]
   */
	function _str2Num(strNum, num) {
		num = num || 0;
		var size = parseInt(strNum);
		//移动端,则把视频播放区域,按屏幕大小缩放
		if (!Util.IsPC()) {
			size = size * window.screen.width / 1200 + num;
		}
		return size + 'px';
	}

  /**
   *  频播放
   * @param src  频地址
   * @param config  频展示 置, 宽高,xy
   * @param closeCallback 关闭之后的回调
   */
	function show($dom, src, config, wrapTop, closeCallback) {
		var _videoLoading;
		var _left;
		var _top;

		$('.video-container[data-id="__videoContainer"]').remove();
		var html = _render(src);

		$dom.append(html);
		var $container = $('.video-container[data-id="__videoContainer"]');
		var $playImg = $container.find('.vc-play');
		var $btnClose = $container.find('.vc-btn-close');
		var $video = $container.find('video');

		if (config) {

			//PC端,背景图片宽度1200,高度675
			if (Util.IsPC()) {
				_left = parseFloat(config.x || 0) * 1200;
				_top = parseFloat(config.y || 0) * 675;
			}
			//移动端,区分横竖屏
			else {
				_left = parseFloat(config.x || 0) * config.bgW;
				_top = parseFloat(config.y || 0) * config.bgH;
			}

			//计算视频位置
			//注意:如果没有设置视频播放区域大小位置,则使用默认的大小.不按比例来计算,比例可能刚好=1, 所以这里取 2[其他大于1的值也可以]
			if (config.w < 2) {
				$container.css({
					left: _left + 'px',
					top: _top + 'px',
					width: config.w * config.bgW || '80%',
					height: config.h * config.bgH || '80%',
				})
			} else {
				$container.css({
					left: '10%',
					top: '10%',
					//注意:如果没有设置视频播放区域大小位置,则使用默认的大小.不按比例来计算
					width: '80%',
					height: '80%',
				})
			}
		}

		$video.on('canplaythrough', function () {
			_videoLoading.loading("hide");
			$video.attr('data-loaded', true)
		})

		//播放
		$playImg.on(click, function () {
			$playImg.hide();
			$video.show().css({ top: 0, opacity: 1 });

			if (!$video.attr('data-loaded')) {
				_videoLoading = $.loading({ content: '加载中...' });
			}

			// if (!$video.attr('src')) {
			// 	$video.attr('src', $video.attr('data-src'))
			// }

			if (!$video.attr('data-play')) {
				$video.append('<source src="' + $video.attr('data-src') + '" type="video/mp4">')
				$video.attr('data-play', true)
			}

			$video[0].play();

		})


		//隐藏
		$btnClose.on(click, function (e) {
			e.stopPropagation();
			$container.remove();
			closeCallback();
		})

		Util.touchDrag('.video-container[data-id="__videoContainer"]', function (evt, x, y) {
			var $cTar = $(evt.currentTarget)
			var w = $cTar.width();
			var h = $cTar.height();
			var screenW = $(window).width();
			var screenH = $(window).height();
			var left = x;
			var top = y;

			//限制不能超出屏幕
			left = left < 0 ? 0 : left;
			top = top < 0 ? 0 : top;

			if (left > screenW - w) {
				left = screenW - w;
			}
			if (top > screenH - h) {
				top = screenH - h;
			}
			$cTar.css({
				left: left,
				top: top
			})
		})

	}

	return {
		show: show
	}
})(Util)
