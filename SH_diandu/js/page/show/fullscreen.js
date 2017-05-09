/**
 * 如何不是被嵌套在iframe中，则删除掉
 * 功能：让iframe全屏展示
 */
(function () {
	if (self === top) {
		$('.btn-fullscreen').remove();
	} else {
		$('.btn-fullscreen').show();
		$('.btn-fullscreen').on('click', function (e) {
			var $cTar = $(e.currentTarget)
			var $ifr = $(window.parent.document.getElementsByTagName('iframe')[0]);
			if ($cTar.attr('data-flag') !== "1") {
				$ifr.css({
					position: 'fixed',
					top: 0,
					left: 0,
					width: '100%',
					height: '100%',
					'z-index': 99999999
				})
				$cTar.addClass('normal-screen')
				$cTar.attr('data-flag', "1")
			} else {
				$ifr.attr('style', '')
				$cTar.attr('data-flag', "0")
				$cTar.removeClass('normal-screen')
			}
		})
	}
})()
