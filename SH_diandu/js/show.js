/*=============================定义变量 START===========================*/
var click = Util.IsPC() ? 'click' : 'tap';
var audio, video;
var SCALE = 1; //缩放的比例
var isVertical = false;  //是否为竖屏
var DATA; //用来保存请求回来的变量

var GLOBAL = {
	PREBGID: '_diandu',  //每一个背景页的前缀

	H_IMGSCALE: 1920 / 1080,  //横屏比例点
	V_IMGSCALE: 1080 / 1760,  //竖屏比例点
	OLDWIDTH: 1200,  //创建页面的横屏宽度  上传点读页的时候,横屏默认1200*675,竖屏 540*960,这边会从数据库返回
	OLDHEIGHT: 960,  //创建页面的竖屏高度,
	EXAM_W: 0,
	EXAM_H: 0,

	AUTOPLAYINTERVAL: 0,//图片自动轮播的时间, 0为关闭自动播放

	STARTSIZE: 150,   //点读开关大小
	POINTSIZE: 72,  //点读位缩放前大小

	SEC_EXAM: '.sec-exam',  //考试展示容器
	SEC_EXAM_LIST: '.sec-exam .exam-list',  //考生页面容器
	SEC_QUESTION_LIST: '.sec-exam .question-list',  //题干列表容器

	videoid: 0, // 点读展示的id,
	DEFAULTAUTOPLAYTIME: 100, //自动播放的间隔时间
	PAGESIZE: {  //创建时的容器大小
		W: 1200,
		H: 675
	},
	SCREEN: {
		W: (function () {
			return Util.IsPC() ? 1200 : window.screen.width
		}),
		H: (function () {
			return Util.IsPC() ? 675 : window.screen.height
		}),
	},
	STARTBTNSIZE: 100,  //开始按钮大小
	GLOBAL_POINT_SIZE: 100,  //全局点读点大小比例 %
	BACK_COLOR: 'rgb(0,0,0)', //背景图片空白区域颜色
	CurrentPageIndex: 0, //当前点读页下标
}
/**
 * 背景音乐相关操作
 */
GLOBAL.BGAUDIO = {
	bgaudio: document.getElementById('bg-audio'),
	audio: document.getElementById('point-audio'),
	$btnBgAudio: $('#btn_bgAudio'),
	setAudio: function (src) {
		var that = this;
		//如果已经设置了, 则不在设置背景音乐
		if (!$(this.bgaudio).attr('src')) {
			setAudioSource(this.bgaudio, src)
		}

		//停止背景音乐, 监听事件
		$('body').off('STOPBGAUDIO').on('STOPBGAUDIO', function (e, flag) {
			//暂停播放背景音乐
			if (flag) {
				that.timer && clearTimeout(that.timer)
				that.pause()
			}
			//播放背景音乐
			else {
				that.timer = setTimeout(function () {
					that.play();
				}, 5000)
			}
		})
	},
	isOn: function () {
		if (this.$btnBgAudio.attr('src').indexOf('on') !== -1) {
			return true;
		}
		return false;
	},
	play: function () {
		if (this.audio.paused && this.bgaudio.paused) {
			this.bgaudio.play();
			this.$btnBgAudio.attr('src', 'imgs/bg_audio_on.png')
		}
	},
	pause: function () {
		this.$btnBgAudio.attr('src', 'imgs/bg_audio.png')
		if (!this.bgaudio.paused) {
			this.bgaudio.pause();
		}
	},
	hideBtn: function () {
		this.$btnBgAudio.hide();
	},
	setTimePlay: function (duration) {
		duration = duration || 5000;
		var that = this;
		that.timer = setTimeout(function () {
			that.play()
		}, duration)
	},
	clearTimeout: function () {
		this.timer && clearTimeout(this.timer)
	}
}

// 设置音频的音频文件路径
function setAudioSource(audio, src) {
	var source = ""
	source += '<source src="' + src.replace('mp3', 'm3u8') + '">'
	source += '<source src="' + src + '">'
	$(audio).html("")
	$(audio).append(source)
	//注意：资源为 srouce格式的，需要重新加载，否则还是播放上一个资源。 这个是和src指定资源的区别
	audio.load()
}

// 获取当前音频[mp3格式的地址]
function getAudioSource(audio) {
	return $(audio).find('source').eq(1).attr('src')
}

/*=============================初始化页面 START===========================*/
$(function () {
	init();
});

/*========================页面缩放,横竖屏切换事件 START=====================*/
// if (window.onorientationchange) {
// 	window.onorientationchange = function () {
// 		fn_onResize();
// 	};
// } else {

// }

/*后期改掉这部分操作*/
$(window).on('resize', function (e) {
	setTimeout(function () {
		//主要用户移动端,弹出输入法面板,导致触发 resize. 如果是输入法触发的resize,不做处理
		if (!window.SHOWINPUT && !window.SHOWVIDEO) {
			fn_onResize();
		}
	}, 10)
})

/**
 * 窗口变化时展示
 */
function fn_onResize() {
	window.W = $(window).width();
	window.H = $(window).height();

	// FIX BUG 1051：在全屏后，在退出全屏，获取的工具栏宽度可能为0，因为设置一个默认值  
	if (window.W > window.H) {
		window.W -= ($('#header_vue').width() || 45);
	} else {
		window.H -= ($('#header_vue').height() || 45);
	}

	$('#container').css({
		height: window.H,
		width: window.W
	});

	var _size;
	if (window.W > window.H) {
		//横屏
		SCALE = (window.W / GLOBAL.OLDWIDTH);
		$('.cd-close').removeClass('cd-close-v');

		GLOBAL.EXAM_W = window.W * (1500 / 1920);
		GLOBAL.EXAM_H = window.H * (800 / 1080);

		$('.sec-exam').css({
			height: GLOBAL.EXAM_H,
			width: GLOBAL.EXAM_W,
			left: (window.W - GLOBAL.EXAM_W) / 2,
			top: (window.H - GLOBAL.EXAM_H) / 2
		});

		_size = window.W * 0.28;
		isVertical = false;
	}
	else {
		//竖屏
		SCALE = (window.H / GLOBAL.OLDWIDTH);
		$('.cd-close').addClass('cd-close-v')

		GLOBAL.EXAM_W = window.W * (800 / 1080);
		GLOBAL.EXAM_H = window.H * (1200 / 1920);

		$('.sec-exam').css({
			height: GLOBAL.EXAM_H,
			width: GLOBAL.EXAM_W,
			left: (window.W - GLOBAL.EXAM_W) / 2,
			top: (window.H - GLOBAL.EXAM_H) / 2
		});


		_size = window.W * 0.5;
		isVertical = true;
	}

	$('.sec-imgtext-main').css({ width: _size, height: _size });

	//设置顶部进度条的宽高
	styleHandler();

	if (DATA) {
		$('.gallery-main').css('opacity', 0).show();
		initDiandu(DATA);
	}
}

/**
 * 横竖屏 滑动条样式处理[TODO:使用样式来处理]
 */
function styleHandler() {
	var $scrollBar = $('#scroll-bar');
	var $opacityScrollBar = $('#opacity-scroll-bar');
	if (isVertical) {
		$scrollBar.css({
			width: '80%'
		});
		$opacityScrollBar.css('width', '80%')
	} else {
		$scrollBar.css({
			width: '45%'
		})
		$opacityScrollBar.css('width', '45%')
	}
}

/*========================页面缩放,横竖屏切换事件 END=====================*/

/**
 * 初始化
 */
function init() {
	// 点读页的ID,保存的时候会返回ID
	var id = GLOBAL.videoid = Util.getQueryStringByName('videoid');
	//如果没有获取到id，则从文件名中获取
	if (!id) {
		var paths = location.href.split('/')
		var id = paths[paths.length - 1].split('.')[0]
		try {
			id = parseInt(id)
			if (!id) {
				window._load.loading("hide")
				alert('点读页面唯一标识不存在')
				return
			}
		} catch (e) {
			return
		}
	}

	initAudio();
	initVideo();

  /**
   * 获取点读数据
   */
	Model.getList(id, function (data) {
		$('title').text(data.title);
		DATA = data;

		initVue(data)

		//排序点读页顺序
		ArrayUtil.sortByKey(data.pages, 'seq');
		data['pages'] = data['pages'] || []
		data['pages'][0] = data['pages'][0] || {}
		if (data['pages'][0]['pic']) {
			Util.getImageWH(data['pages'][0]['pic'], function () {
				//页面大小重新渲染放在这边, 微信浏览器显示就不会有问题
				setTimeout(function () {
					fn_onResize();
					window._load.loading("hide");
					DianduEffect.blink(0);

					//自定义GIF图片，获取第一帧，展示  zhongxia
					var $customGifPoints = $('.create-point-img[data-dynamic="true"]');
					for (var i = 0; i < $customGifPoints.length; i++) {
						var $point = $customGifPoints.eq(i);

						(function ($point, i) {
							Util.getImageBase64($point.data('src'), function (base64) {
								$point
									.css({
										backgroundImage: 'url(' + base64 + ')'
									})
								var dataId = $point.attr('data-id');
								var pointData = Util.getPointDataByIds(DATA, dataId)
								pointData.base64 = base64;
							})
						})($point, i)

					}
					// end

				}, 100)
			})
		} else {
			alert('该点读页，没有内容')
			window._load.loading("hide");
		}
	})
}

/**
 * 初始化点读展示页
 * @param  {[type]} data [description]
 */
function initDiandu(data) {
	$('#pages').html('');

	initPage('pages', data);

	initSwipe();

	//针对早期的数据, 由于数据库默认保存 数据为 0 , 因此这边需要做处理
	if (data['point_size'] !== "0") {
		GLOBAL.GLOBAL_POINT_SIZE = parseInt(data['point_size']);
	}
	if (data['back_color'] !== "0") {
		GLOBAL.BACK_COLOR = data['back_color'];
	}
	//设置背景图片空白区域的颜色
	initPointSizeAndBgColor(GLOBAL.BACK_COLOR);

	$('.gallery-main').hide();  //默认透明度为0 ,会占位置,让下面的点击不到,这里用隐藏,隐藏起来

	bindEvent();
	//渲染后的操作
	afterRenderOp(data);
	bgScaleOp(0);
}

/**
 * 设置背景图片缩放功能
 * @param currentIndex
 */
function bgScaleOp(currentIndex) {
	var $wrap = $('#_diandu' + currentIndex).find('.wrap');
	var _width = $wrap.width();
	var _height = $wrap.height();

	GLOBAL.picScale = null;
	GLOBAL.picScale = new PicScale('#_diandu' + currentIndex, '.wrap', _width, _height,
		function (ev) {
			VueApp.$data.hasScale = true
			if (this.scale > 1) {
				window.galleryTop.lockSwipes();
			} else {
				VueApp.$data.hasScale = false
				window.galleryTop.unlockSwipes();
			}
		},
		function () {
			if (this.scale > 1) {
				VueApp.$data.hasScale = true
				// GLOBAL.picScale.showTip();
				window.galleryTop.lockSwipes();
			} else {
				VueApp.$data.hasScale = false
				// GLOBAL.picScale.hideTip();
				window.galleryTop.unlockSwipes();
			}
		}
	);
}

/**
 * 渲染之后,对页面进 一些操作
 * eg: 是否显示背景音乐按钮,是否显示全程音频按钮, 位置样式调整等
 */
function afterRenderOp(data) {
	var globalAudioConfig = JSON.parse(data.content || "{}")
	// 存在全程音频，则去掉全程音频的点读点
	if (globalAudioConfig.id) {
		var ids = globalAudioConfig.id.split('_')
		var _id = (parseInt(ids[0]) - 1) + '_' + (parseInt(ids[1]) - 1)
		$('.m-audio[data-id="' + _id + '"]').remove()
	}
	//存在背景音乐
	if (data['background']) {
		GLOBAL.BGAUDIO.setAudio(data['background']);
		//全程音频和背景音乐只能同时打开一个
		if (!globalAudioConfig.id) {
			//PC端直接设置自动播放
			if (Util.IsPC()) {
				// GLOBAL.BGAUDIO.play();
			} else {
				//移动端
				// document.addEventListener("touchstart", playBgAduio, false);
			}
		} else {
			GLOBAL.BGAUDIO.pause();
		}
	} else {
		GLOBAL.BGAUDIO.hideBtn()
	}
}


/**
 * 初始化空白区域背景颜色, 以及点读点的大小
 * @param color 颜色
 */
function initPointSizeAndBgColor(color) {
	$('.m-bgs').css('background-color', color)
}

/**
 * 监听点击屏幕 播放背景音乐
 */
function playBgAduio() {
	GLOBAL.BGAUDIO.play();
	document.removeEventListener("touchstart", playBgAduio, false)
}


/**
 * 按比例缩放点读点
 * @param wrap 点读点容器
 * @param scale 比例大小
 */
function setPointSizeScale(wrap, scale) {

	if (isVertical) {
		//竖屏
		GLOBAL.STARTBTNSIZE = GLOBAL.STARTSIZE * GLOBAL.SCREEN.W() / 800;
	} else {
		//横屏
		GLOBAL.STARTBTNSIZE = GLOBAL.STARTSIZE * GLOBAL.SCREEN.W() / 1200;
	}
	GLOBAL.STARTBTNSIZE = GLOBAL.STARTBTNSIZE > 80 ? 80 : GLOBAL.STARTBTNSIZE;
}


/**
 * 设置大小
 * @param {[type]} selector [description]
 * @param {[type]} size     [description]
 */
function setScale(selector, size) {
	$(selector).css({
		width: size,
		height: size
	})
}

/**
 * [DO: 这个地方 必须初始化, 否则 切换 横竖屏的时候, swiper 每一个页 不占满屏幕]
 *  决: 使用 swiper.onResize();
 * 初始化左右滑动的插件
 * @return {[type]} [description]
 */
function initSwipe() {

	//PC端,展示左右剪头,只有一个 点读页不展示
	if (Util.IsPC() && DATA.pages.length > 1) {
		$('.swiper-button-next').show();
		$('.swiper-button-prev').show();
	} else {
		$('.swiper-button-next').hide();
		$('.swiper-button-prev').hide();
	}

	// 如果已经初始化了, 则不在初始化 Swiper
	if (!window.galleryTop) {
		window.galleryTop = new Swiper('.dandu-pages', {
			autoplayStopOnLast: true,
			nextButton: '.swiper-button-next',
			prevButton: '.swiper-button-prev',
			lazyLoading: true,
			effect: 'fade',
			fade: {
				crossFade: true,
			},
			onTransitionEnd: function (swiper) {  //没有切换到另外一个点读页也会触发
				//切换了点读页
				if (GLOBAL.CurrentPageIndex !== swiper.activeIndex) {
					//背景缩放移动
					bgScaleOp(swiper.activeIndex);

					GLOBAL.CurrentPageIndex = swiper.activeIndex;

					window.VueApp.$data.pageActiveIndex = swiper.activeIndex

					//添加点读点闪烁效果
					DianduEffect.blink(swiper.activeIndex);

					$('#id_pagination_cur').text(swiper.activeIndex + 1);

					var _$thumbsSwipers = $('#thumbs>div[data-id]');
					_$thumbsSwipers.removeClass('swiper-slide-active-custom');
					_$thumbsSwipers.eq(swiper.activeIndex).addClass('swiper-slide-active-custom')

					//播放到最后一个,停止自动播放
					if (swiper.activeIndex + 1 === window.DATA['pages'].length) {
						window.silideBar.setValue(110);  //setValue 会调通 时间进度条的 callback事件
					}
				}
			}
		});
	}

	//大小改变之后, 重新规划大小
	window.galleryTop.onResize()
	initSlide();
}

/**
 * 初始化时间进度条
 */
function initSlide() {
	//因为窗体改变的时候,onresize会调用该方法,这里判断是否已经设置了自动播放的值
	window.silideBar = new SlideBar({
		actionBlock: 'action-block',
		scrollBar: 'scroll-bar',
		entireBar: 'entire-bar',
		barLength: $('#scroll-bar').width(),
		maxNumber: 30,
		value: 110,
		callback: function (value) {
			var $block = $('#action-block')
			if (value <= 30) {
				$block.removeClass('close').addClass('open');
				$block.text(value);
				GLOBAL.AUTOPLAYINTERVAL = value * 1000;
				window.galleryTop.stopAutoplay();
				window.galleryTop.params.autoplay = GLOBAL.AUTOPLAYINTERVAL;
				window.galleryTop.startAutoplay();
			} else {
				$block.removeClass('open').addClass('close')
				$block.text("关");
				GLOBAL.AUTOPLAYINTERVAL = 0;
				window.galleryTop.stopAutoplay();
			}
		}
	});
	//设置 刚开始 自动播放的间隔时间
	window.silideBar.setValue(GLOBAL.DEFAULTAUTOPLAYTIME);

	//因为窗体改变的时候,onresize会调用该方法,这里判断是否已经设置了自动播放的值
	window.opacitySilideBar = new SlideBar({
		actionBlock: 'opacity-action-block',
		scrollBar: 'opacity-scroll-bar',
		entireBar: 'opacity-entire-bar',
		barLength: $('#opacity-scroll-bar').width(),
		maxNumber: 9,
		value: 0,
		callback: function (value) {
			var $block = $('#opacity-action-block')
			$block.removeClass('close').addClass('open');

			var val = value - 1 > 10 ? 10 : value - 1;
			val = val < 0 ? 0 : val;

			var opacity = (10 - val) / 10;
			PointOpacity.setOpacity(opacity)

			$block.find('.action-block-spam').text(val);
			$block.find('.action-block-color').css('opacity', opacity)
		}
	});
}

/*************************************根据数据生成页面 START********************************/
/**
 * 根据返回的数据，动态生成页面(多个)
 * @param  id 点读页容器id
 */
function initPage(id, data) {
	var pages = data['pages'] || [];

	$('#id_pagination_total').text(pages.length);

	//动态生成点读页  START
	var html = '';
	for (var i = 0; i < pages.length; i++) {
		html += initDianDuPage(pages[i], GLOBAL.PREBGID + i);
	}
	$('#' + id).html('').html(html);
	//动态生成点读页  END

	//控制点读页的缩放,以及点读点的大小控制  START
	for (var i = 0; i < pages.length; i++) {
		var subid = GLOBAL.PREBGID + i;  //每一个页面的id

		var w = parseInt(pages[i]['w']) || 1200;
		var h = parseInt(pages[i]['h']) || 675;

		var whScale = w / h;   //宽高比
		var hwScale = h / w;   //高宽比

		var _imgScale = 1;
		var wrapWidth = window.W;
		var wrapHeight = window.H;

		var _flag = false;  //图片是否某一边拉伸,铺满长度 或者 宽度,  false: 没有  true: 有
		//竖屏
		if (isVertical) {
			//普通图片
			if (whScale > GLOBAL.V_IMGSCALE && whScale <= GLOBAL.H_IMGSCALE) {
				wrapHeight = wrapWidth * hwScale;
				_imgScale = wrapHeight / GLOBAL.PAGESIZE.H
				_flag = true;
			}
			else if (whScale >= GLOBAL.V_IMGSCALE) {
				//竖图,横向100%, 重新计算计算缩放比例
				wrapHeight = window.W * hwScale;  //计算该宽高, 主要为是了兼容早期图片大小为1200  675  没有计算缩放后的大小
				if (hwScale > 1) {
					_imgScale = wrapHeight / GLOBAL.SCREEN.H()
				}
			}
			else {
				//横图,纵向100%, 重新计算计算缩放比例
				wrapWidth = window.H * whScale;
				if (whScale > 1) {
					_imgScale = wrapWidth / GLOBAL.SCREEN.H
				}
			}
		}
		//横屏
		else {
			//普通图片
			if (whScale > GLOBAL.V_IMGSCALE && whScale <= GLOBAL.H_IMGSCALE) {
				wrapWidth = wrapHeight * whScale;
				_imgScale = wrapHeight / GLOBAL.PAGESIZE.H
				_flag = true;
			}
			else if (whScale >= GLOBAL.H_IMGSCALE) {
				//横图
				wrapHeight = window.W * hwScale;
				if (hwScale > 1) {
					_imgScale = wrapHeight / GLOBAL.SCREEN.H()
				}
			} else {
				//竖图
				wrapWidth = window.H * whScale;
				if (whScale > 1) {
					_imgScale = wrapWidth / GLOBAL.SCREEN.H()
				}
			}
		}

		$('#' + subid).css('background-size', 'contain');

		//计算点读点缩放比例
		var _pointSizeScale = getPointSizeScale(wrapWidth, wrapHeight)
		if (!_flag) {
			_pointSizeScale = _pointSizeScale * _imgScale;
		} else {
			_pointSizeScale = _imgScale
		}

		//针对小图, 创建的时候, 没有缩放的图片 START
		if (w < GLOBAL.PAGESIZE.W && h < GLOBAL.PAGESIZE.H) {
			if (whScale > window.screen.width / window.screen.height) {
				_pointSizeScale = GLOBAL.SCREEN.W() / w
			} else {
				_pointSizeScale = GLOBAL.SCREEN.H() / h
			}
		}

		//针对小图, EN

		var $wrap = $('#' + subid).find('.wrap');
		$wrap.css({ height: wrapHeight, width: wrapWidth });
		$wrap.html('');
		$wrap.append(initPoints(i, pages[i], wrapWidth, wrapHeight, _pointSizeScale))

		setPointSizeScale('#' + subid, _pointSizeScale);

		// 初始化视窗
		initWindow(i, pages[i], wrapWidth, wrapHeight)
	}
}

/**
 * 初始化视窗 
 * @param {any} pageIndex  点读点的id标记，早期用这个+点读点下标[懒得切割，所以传过来] 
 * @param {any} pageData 
 * @param {int} ingW 图片的宽(不包括黑色区域)
 * @param {int} ingH 图片的高
 */
function initWindow(pageIndex, pageData, imgW, imgH) {
	/**
	 * 初始化相关的区域设置[视频，音频，3D模型]
	 */
	var pointsData = pageData['points'];
	for (var i = 0; i < pointsData.length; i++) {
		var pointData = JSON.parse(pointsData[i].data || "{}");
		if (pointData.drawcustomarea && pointData.drawcustomarea.type === 'area') {
			switch (pointData.type) {
				case 'viewer3d':
					AreaSetting.initViewer3d(pageIndex, i, pointData)
					break
				case 'audio':
					AreaSetting.initAudio()
					break
				case 'video':
					AreaSetting.initVideo()
					break
			}
		}
	}


	/**
   * 视窗上面的点读点类型图标
   */
	$('.js-viewer3d-point').off().on('click', function (e) {
		var $cTar = $(e.currentTarget)
		$cTar.hide()

		var $operator = $(e.target).parent().find('.js-viewer3d-tip')
		$operator.show()
		setTimeout(function () {
			$operator.hide()
		}, 3000)

		var pointId = $cTar.parent().data('id')
		$('#viewer3d_event_' + pointId).removeClass('u-hide')

		AreaSetting.stopAreaAudio()
	})

  /**
   * 三视图提示图片点击关闭
   */
	$('.js-viewer3d-tip').off().on('click', function (e) {
		var $cTar = $(e.currentTarget)
		$cTar.hide()
	})
}

/**
 *  取点读点的缩放比例
 * 1. 创建时 横图 宽 1200  ==> 点读点 72px
 *          竖图 高 675   ==> 点读点 72px
 * 这里按比例缩放
 * @param imgW 创建时保存的图片宽
 * @param imgH 创建时保存的图片高
 * @returns {number}
 */
function getPointSizeScale(imgW, imgH) {
	if (imgW > imgH) {
		return GLOBAL.SCREEN.W() / GLOBAL.PAGESIZE.W;
	} else {
		return GLOBAL.SCREEN.H() / GLOBAL.PAGESIZE.H;
	}
}

/**
 * 生成点读页
 * @param data [根据数据生成点读页]
 * @param id 点读页的id
 */
function initDianDuPage(data, id) {
	var bgPath = data['pic'];
	var h = window.H
	var html = "";
	html += '<div id="' + id + '" data-id="' + data['id'] + '" class="m-bg swiper-slide swiper-lazy" style="height:' + h + 'px;">'
	html += '    <div class="m-dd-start-comment-div"></div>'
	html += '    <div data-id="btn-start" class="m-dd-start" style="display:none;"></div>'
	html += '    <div class="wrap" style="background-image:url(' + bgPath + ')">'
	html += '    </div>'
	html += '</div>'
	return html;
}

/**
 * 生成点读位【根据类别使用不同的图标,目前只有  频,音频,图文】
 * @param data 点读点集合数据
 * @param imgW 背景图片缩放后的宽
 * @param imgH 背景图片缩放后的高
 * @param scale 缩放比例
 * @returns {string}
 */
function initPoints(pageIndex, data, imgW, imgH, scale) {

	var pointDatas = data['points']

	//点读点相关样式
	var classNames = {
		1: "m-video",
		2: "m-audio",
		3: "m-imgtext",
		4: "m-exam",
		6: "m-seturl",
		7: 'm-sway',
		8: 'm-viewer3d'
	};

	var html = "";
	html += '<div data-id="all-radius" data-hide="all-radius-hide">'

	for (var i = 0; i < pointDatas.length; i++) {
		//隐藏点, 则不显示出来
		if (pointDatas[i]['hide'] != "1") {
			//点读点大小比例(百分比)
			var pointSizeScale = parseInt(pointDatas[i]['point_size']) || GLOBAL.GLOBAL_POINT_SIZE;
			pointSizeScale = pointSizeScale / 100;

			var pointScale = scale * pointSizeScale;

			var pointId = pageIndex + '_' + i;
			var left = parseFloat(pointDatas[i].x) * imgW;
			var top = parseFloat(pointDatas[i].y) * imgH;
			var type = pointDatas[i]['type'];
			//自定义图片
			var pic = JSON.parse(pointDatas[i]['pic'] || "{}")
			//自定义标题
			var pointTitle = JSON.parse(pointDatas[i]['custom'] || "{}")
			//开关图
			var switchImg = JSON.parse(pointDatas[i]['onoff'] || '{}')

			//点读点的所有数据，会保存在data字段里面
			var _pointData = JSON.parse(pointDatas[i]['data'] || '{}')
			// 3d模型点读点
			var drawCustomArea = _pointData.drawcustomarea || {}
			var style = 'left:' + left + 'px; top:' + top + 'px; transform: scale(' + pointScale + '); transform-origin:left top;-webkit-transform: scale(' + pointScale + '); -webkit-transform-origin:left top;';

			var mediaImg = "";
			switch (type) {
				case "1": //视频
					mediaImg = '   <img  style="display:none; width:100%;height:100%;" src="imgs/video_on.png" alt="video" />';
					break;
				case "2": //音频
					mediaImg = '    <img  class="audio-play" style="display:none; border-radius:50%;width:100%;height:100%" src="imgs/audio.gif" alt="audio" />';
					mediaImg += '   <img  class="audio-load" style="display:none; border-radius:50%;width:100%;height:100%;" src="imgs/load.gif" alt="audio" />';
					mediaImg += '  <img  class="audio-global-play" style="display:none;border-radius: 50%; width: 100%; height: 100%;" src="imgs/global_audio/global-audio-other-page-on.gif" alt="audio">'
					break;
			}

			//自定义点读点
			if (pic.src || pointTitle.title) {
				var config = {
					pointId: pointId,
					left: left,
					top: top,
					title: pointTitle,
					pic: pic,
					scale: pointScale,
					className: classNames[type],
					outHTML: mediaImg
				}
				//自定义图片
				if (pic.src) {
					var loadImg = '   <img  class="audio-load" style="display:none; width:100%;height:100%;" src="imgs/load.gif" alt="audio" />';
					config.outHTML = loadImg;
					html += CreatePoint.initPoint(5, config)
				}
				//自定义点读点
				else {
					html += CreatePoint.initPoint(4, config)
				}
			}
			//开关图
			else if (switchImg.img) {
				var _hideImgW = switchImg.img.scaleW * imgW;
				var _hideImgH = switchImg.img.scaleW * imgW * switchImg.img.h / switchImg.img.w;
				style += 'background-image:url(' + (switchImg.img.path) + ');'
				style += 'width:' + (_hideImgW) + 'px; height:' + (_hideImgH) + 'px;'
				style += 'transform: scale(' + (switchImg.img.scale) + ');'
				style += 'left:' + (switchImg.img.x * imgW) + 'px;top:' + (switchImg.img.y * imgH) + 'px;';
				if (!switchImg.hideSwitchArea) {
					style += 'display:none;'
				}

				switchImg.mp3 = switchImg.mp3 || {}

				html += '<div id="' + pointId + '" class="on-off-hideimg" style="' + style + '" data-hide-switch="' + switchImg.hideSwitchArea + '"  data-show="' + switchImg.img.defaultShow + '" data-mp3="' + switchImg.mp3.path + '"></div>'
				html += '<div id="' + pointId + '_bg" class="on-off-bg"></div>'
				//隐藏触发区
				var hideSwitchArea = switchImg.hideSwitchArea;
				if (!hideSwitchArea) {
					for (var j = 0; j < switchImg.switchArea.length; j++) {
						var area = switchImg.switchArea[j];
						var w = imgW * parseFloat(area.scaleW);
						var h = imgH * parseFloat(area.scaleH);
						var x = imgW * parseFloat(area.x);
						var y = imgH * parseFloat(area.y);

						var css = 'width:' + w + 'px;height:' + h + 'px;left:' + x + 'px;top:' + y + 'px';
						html += '<div data-target="' + pointId + '" class="on-off-switch-area" style="' + css + '"></div>'
					}
				}
			}
			// 3d模型
			// FIX:这里的判断  不等于point, 是为了兼容旧的点读版本
			else if (drawCustomArea.type && drawCustomArea.type !== 'point') {
				switch (_pointData.type) {
					case 'viewer3d':
						html += AreaSetting.initHTML_Vierer3d(pointId, drawCustomArea, _pointData, imgW, imgH)
						break;

					case 'audio':
						html += AreaSetting.initHTML_Audio(pointId, drawCustomArea, _pointData, imgW, imgH)
						break;

					case 'video':
						html += AreaSetting.initHTML_Video(pointId, drawCustomArea, _pointData, imgW, imgH)
						break;
				}
			}
			//普通点读点
			else {
				html += '<div class="' + classNames[type] + '" data-id="' + pointId + '"  style="' + style + '">'
				html += mediaImg;
				html += '</div>'
			}
		}
	}
	html += '</div>'

	return html;
}

/*************************************根据数据生成页面 END********************************/
/*=======================音频视频播放相关 START====================*/
function initAudio() {
	window.audio = document.getElementById('point-audio');
}
function initVideo() {
	window.video = document.getElementById('video');
}

/**
 * 为了 决移动端播放音频需 加载, 加载过程 做一个优化, 展示 load 效果, 让用户知道正正在加载
 * @param audio
 */
function audioPlay(e, url) {

	var $cTar = $(e.currentTarget);

	//音频加载结束
	if ($cTar.attr('isLoad')) {
		window.audio.play();
		if ($cTar.attr('data-type') === 'pointImg') {
			DianduEffect.customPlay($cTar, true)
		} else {
			$cTar.attr('data-play', true)
			$cTar.find('.audio-play').show();
			// DianduEffect.audio_blink($cTar, true)
		}
		$cTar.find('.audio-load').hide();
	}
	//音频还未加载
	else {
		if ($cTar.attr('data-type') !== 'pointImg') {
			$cTar.find('.audio-play').hide();
			// DianduEffect.audio_blink($cTar, false)
		}
		$cTar.find('.audio-load').show();
		$cTar.css('background-size', '0')
		$cTar.attr('data-loading', true)

		//移动端 canplaythrough 必须 设置 play 之后, 才能触发
		window.audio.play()
		window.audio.setAttribute('data-volume', window.audio.volume)
	}


	/*audio可以播放的事件*/
	window.audio.addEventListener('canplaythrough', function (e) {
		if (!$cTar.attr('isLoad')) {
			//是当前播放的音频, 则显示 正在播放状态
			if (getAudioSource(window.audio).indexOf(url) !== -1) {

				window.audio.play();

				window.audio.volume = window.audio.getAttribute('data-volume') || 0.5;

				$cTar.find('.audio-load').hide();
				$cTar.find('.audio-play').show();
				// DianduEffect.audio_blink($cTar, true)
				$cTar.css('background-size', '100%')

				if ($cTar.attr('data-type') === 'pointImg') {
					DianduEffect.customPlay($cTar, true)
				}

				$cTar.attr('isLoad', true)   //加载结束标记
				$cTar.attr('data-play', true) //正在播放标记
				$cTar.attr('data-loading', false)  //正在加载中标记
			}
		}
	}, false);
}

/**
 * 播放或者暂停 音频
 */
function playOrPaused(e, pointData) {
	var url = pointData.url;
	var $cTar = $(e.currentTarget);

	GLOBAL.BGAUDIO.clearTimeout();
	//正在加载中加载状态
	if ($cTar.attr('data-loading') === 'true') {
		$cTar.attr('data-loading', false)
		$cTar.find('.audio-load').hide();
		$cTar.css('background-size', '100%');
	}
	//正在播放
	else if ($cTar.attr('data-play') === 'true') {
		$cTar.find('.audio-play').hide();
		// DianduEffect.audio_blink($cTar, false)
		$cTar.attr('data-play', false);

		//自定义点读点，有静态图
		customPng2Gif($cTar, pointData, false)

		window.audio.pause();

		DianduEffect.customPlay($cTar, false);

		//关闭音频的时候,间隔自动播放的时间在启动
		VueApp.restartPlayBgAudio()
	}
	//未播放
	else {
		customPng2Gif($cTar, pointData, true)
		$('.m-audio[data-play]').removeAttr('data-play')
		$cTar.attr('data-play', true)
		$cTar.attr('data-play', true)
		if (getAudioSource(window.audio) !== url) {
			setAudioSource(window.audio, url)
		}
		if (window.audio.paused) {
			audioPlay(e, url)
		}

		//关闭背景音乐
		// GLOBAL.BGAUDIO.pause();
		VueApp.pauseBgAudio()
	}
}

/**
 * 点击自定义点读图，静态图，动态图之间切换
 * @param $cTar 自定义点读点的DOM节点
 * @param pointData 点读点数据
 * @param falg true 展示动态图，否则静态图
 */
function customPng2Gif($cTar, pointData, flag) {
	var customPointData = JSON.parse(pointData['pic'] || "{}")
	if (flag && customPointData.src) {
		$cTar.css('backgroundImage', 'url(' + customPointData.src + ')')
	} else if (pointData.base64) {
		$cTar.css('backgroundImage', 'url(' + pointData.base64 + ')')
	}
}


/**
 * 隐 音频和 频，并且关闭播放
 * @param flag 是否关闭自动播放  默认为true
 */
function closeVideoOrAudio(flag) {
	if (flag === undefined) flag = true;

	// 音频面板
	if (window.GLOBAL.audio_panel) {
		$('.m-audio .audio-panel__flag').remove()
		window.GLOBAL.audio_panel.close()
	}

	// 摇摆图音频
	if (window._swayAudio) {
		_swayAudio.pause();
	}

	//停止音频
	window.audio.pause();

	//隐藏所有的播放GIF图
	// DianduEffect.audio_blink($('.m-audio'), false)

	$('.m-audio img').hide();
	$('.m-audio').css('background-size', '100%')

	//清除闪烁
	var $customImgs = $('[data-type="pointImg"]');
	for (var i = 0; i < $customImgs.length; i++) {
		var $customImg = $($customImgs[i]);
		DianduEffect.customPlay($customImg, false);
	}

	//停止视频
	var $video = $('.m-video-size');
	$video.find('img').hide();
	$video.removeClass('m-video-size');

	//停止全程音频
	if (VueApp) {
		VueApp.pauseAudio()
	}

	if (flag) {
		// GLOBAL.BGAUDIO.pause();
		VueApp.pauseBgAudio()
	}

	AreaSetting.stopAreaAudio()
}
/*=======================音频视频播放相关 END====================*/
/*=======================点击事件相关 START====================*/
function bindEvent() {
  /**
   * 背景音乐开关按钮
   */
	$('#btn_bgAudio').off().on(click, function (e) {
		if (!GLOBAL.useGlobalAudio) {
			if (!GLOBAL.BGAUDIO.isOn()) {
				GLOBAL.BGAUDIO.play();
				GLOBAL.useBgAudio = true;
			} else {
				GLOBAL.BGAUDIO.pause();
				GLOBAL.useBgAudio = false;
			}
		} else {
			//confirm 确定删除?
			var dia = $.dialog({
				content: '全程音频和背景音乐不能同时使用',
				button: ["确认"]
			});
			dia.on("dialog:action", function (ev) {
				if (ev.index === 0) {

				}
			});
		}
	})

	// 视频
	$('.m-video').off().on(click, function (e) {
		GLOBAL.BGAUDIO.clearTimeout();  //清除背景音乐定时器,防止快速打开视频, 又关闭, 又打开, 播放背景音乐

		closeVideoOrAudio(true);
		var $cTar = $(e.currentTarget);
		var dataId = $cTar.attr('data-id');
		var pointData = Util.getPointDataByIds(DATA, dataId);
		var url = pointData.url;
		var area = {};
		if (pointData.area) {
			area = JSON.parse(pointData.area);
		}

		//点读点容器的高度
		var wrapH = $cTar.parents('.wrap').height();
		var wrapTop = 0;

		//移动端,计算位置
		if (!Util.IsPC()) {
			wrapTop = (screen.height - wrapH) / 2;
		}

		area.bgW = $cTar.parents('.wrap').width();
		area.bgH = $cTar.parents('.wrap').height();
		window.SHOWVIDEO = true
		PlayVideo.show($cTar.parents('.wrap'), url, area, wrapTop, function () {
			closeVideoOrAudio();
			//关闭音频的时候,间隔自动播放的时间在启动
			// GLOBAL.BGAUDIO.setTimePlay()
			VueApp.restartPlayBgAudio()
			window.SHOWVIDEO = false
		});
		return false;
	});


	// 音频
	$('.m-audio').off().on(click, function (e) {
		e.stopPropagation();
		var $cTar = $(e.currentTarget);

		if ($cTar.find('.audio-panel__flag').length == 0) {
			//关闭视频,并且设置所有的 音频为默认图标状态
			closeVideoOrAudio(true);
		}

		window._audioEnded = true;
		audio.addEventListener('ended', function () {
			if (window._audioEnded) {
				window._audioEnded = false
				$cTar.find('img').hide()
				$cTar.attr('data-play', false)
				DianduEffect.customPlay($cTar, false)

				if (GLOBAL.AUTOPLAYINTERVAL !== 0) {
					window.galleryTop.startAutoplay();
				}

				customPng2Gif($cTar, pointData, false)
			}
		})

		// 获取当前音频数据
		var dataId = $cTar.attr('data-id');
		var pointData = Util.getPointDataByIds(DATA, dataId)

		var audioPanelConfig = JSON.parse(pointData['audio_panel'] || "{}")
		// 需要展示音频面板
		if (audioPanelConfig.show) {
			//点击音频点读点，则暂停音频
			if (window.GLOBAL.audio_panel) {
				$('.m-audio .audio-panel__flag').remove()
				window.GLOBAL.audio_panel.close()
			} else {
				window.GLOBAL.audio_panel = new AudioPanel({
					mp3_path: pointData.url,
					lrc_path: audioPanelConfig.lrc,
					// 关闭音频面板的回调
					closeCallback: function () {
						window.GLOBAL.audio_panel = null
						$cTar.find('.audio-play').hide()
						// DianduEffect.audio_blink($cTar, false)
						$cTar.find('.audio-panel__flag').remove()
					},
					// 音频还在播放，关闭后，展示标识
					showFlag: function () {
						$cTar.find('.audio-play').show()
						// DianduEffect.audio_blink($cTar, false)
						$cTar.append('<div class="audio-panel__flag"></div>')
						//点击出现音频面板
						$cTar.find('.audio-panel__flag').on(click, function (e) {
							e.stopPropagation()
							if (audioPanelConfig.show) {
								window.GLOBAL.audio_panel.show()
								$cTar.find('.audio-panel__flag').remove()
							}
						})
					}
				})
			}
		} else {
			//普通音频点读点
			playOrPaused(e, pointData)
		}
	})




	// 图文
	$('.m-imgtext').off().on(click, function (e) {
		e.stopPropagation();
		closeVideoOrAudio(false);
		var $cTar = $(e.currentTarget);
		var dataId = $cTar.attr('data-id');
		var pointData = Util.getPointDataByIds(DATA, dataId);

		var $secImgText = $('.sec-imgtext-mask');
		$secImgText.css({ position: 'absolute' });
		$secImgText.show();
		var $secImgTextMain = $('.sec-imgtext-main');
		setImgTextLocation_Scale($cTar, $secImgTextMain, $cTar.parent().parent());  //设置弹窗的位置

		var _url = pointData.url;
		var _title = pointData.title;
		var _content = decodeURI(pointData.content);

		var $title = $secImgText.find('.sec-imgtext-title');
		var $img = $secImgText.find('.sec-imgtext-img');

		//设置 第二次打开，重新从页面顶部开始查看
		$title.html("");
		$img.attr('src', "");
		$title.show();
		$img.show();
		_title ? $title.html(_title) : $title.hide();
		_url ? $img.attr('src', _url) : $img.hide();
		$secImgText.find('.sec-imgtext-content').html(decodeURIComponent(_content));

		//设置内容可以滚动, 由于 zepto 为了搞定 微信向上滑兼容性, 重写了touchmove事件导致
		$secImgText.find('.sec-imgtext-content').find('*').addClass('sec-scorll')
	})

  /**
   * 图文展示框
   */
	$('.sec-imgtext-mask').off('click').on(click, function (e) {
		var $tar = $(e.target);
		if ($tar.hasClass('sec-imgtext-mask') || $tar.hasClass('sec-imgtext')) {
			$(e.currentTarget).hide();
		}
	})
  /**
   * 图文展示框,防止弹出图文框之后,可以移动遮罩
   */
	$('.sec-imgtext-mask').off('touchmove').on('touchmove', function (e) {
		return false;
	})

  /**
   * 考试点读位
   */
	$('.m-exam').off().on(click, function (e) {
		fnExamClick(e)
	})

  /**
   * 超链接点读点
   */
	$('.m-seturl').off().on(click, function (e) {
		var $tar = $(e.target)
		var ids = $tar.attr('data-id');
		var pointData = Util.getPointDataByIds(DATA, ids);

		// FIX: url 的 " 去掉
		var url = pointData.linkurl.replace(/"/g, '');
		var w = window.screen.width * 0.8;
		var h = window.screen.height * 0.8;
		var left = window.screen.width * 0.1;
		var top = window.screen.height * 0.1;
		window.open(url, '', 'width=' + w + 'px,height=' + h + 'px,top=' + left + 'px,left=' + top + 'px');
	})

	//关闭时间进度条
	$('#btn-close').off().on(click, function (ev) {
		$(".gallery-main").hide();
		return false;
	});

	/**
	 * TODO:这个和移动端自动播放有冲突，因为设置自动播放后，这边点击又给停止了
	*/
	//点击背景图,停止自动播放
	$('#pages').off().on(click, function (ev) {
		window.galleryTop.stopAutoplay();
		return false;
	})

	//点击开关图,展示隐藏图片
	$('.on-off-switch-area').off().on(click, function (ev) {
		var $cTar = $(ev.currentTarget);
		var id = $cTar.attr('data-target');
		var $hideImg = $('#' + id);
		var $hideImgBg = $('#' + id + '_bg');

		var mp3Path = $hideImg.attr('data-mp3');

		if ($hideImg.css('opacity') === '0') {
			_playShowAudio(true, mp3Path);
			$hideImg.css('opacity', 1).show();
			_domShowEffect($hideImg);
			$hideImgBg.show();
		}
	})

	//开关图点击事件
	$('.on-off-hideimg').off().on(click, function (e) {
		var $cTar = $(e.currentTarget);
		var mp3Path = $cTar.attr('data-mp3')
		var hideSwitchArea = $cTar.data('hide-switch')
		var $hideImgBg = $('#' + $cTar.attr('id') + '_bg');

		if (hideSwitchArea) {
			if ($cTar.css('opacity') === '0') {
				_playShowAudio(true, mp3Path);
				$cTar.css('opacity', 1);
				_domShowEffect($cTar);
				$hideImgBg.show();
			} else {
				$cTar.css('opacity', 0);
				_playShowAudio(false, mp3Path);
				$hideImgBg.hide()
			}
		} else {
			if ($cTar.css('opacity') === '1') {
				$cTar.css('opacity', 0).hide()
				_playShowAudio(false, mp3Path);
				$hideImgBg.hide()
			}
		}
	})

	//摇摆图
	$('.m-sway').off().on(click, function (e) {
		closeVideoOrAudio(true);

		var $tar = $(e.target);
		var ids = $tar.attr('data-id');
		var pointData = Util.getPointDataByIds(DATA, ids);
		var swayData = JSON.parse(pointData.pic)

		if ($tar.attr('data-add-effect') === '1') {
			$tar.attr('data-add-effect', 0)
			SwayEffect.removeAnimation(e)
			if (window._swayAudio) {
				_swayAudio.pause();
			}
		} else {
			//移除其他点读点的摇摆效果
			$('.m-sway').removeClass('sway-effect')
			for (var i = 0; i < $('.m-sway').length; i++) {
				$('.m-sway').eq(i).attr('data-add-effect', 0)
			}
			if (window._swayAudio) {
				_swayAudio.pause();
			}
			if (swayData.audio && swayData.audio.src) {
				window._swayAudio = document.createElement('audio');
				window._swayAudio.src = swayData.audio.src;
				// _swayAudio.src = '/uploads/01d34068c7.mp3';
				_swayAudio.play();
			}

			$tar.attr('data-add-effect', 1)
			SwayEffect.addAnimation(e)
		}
	})

	//3D模型文件
	$('.m-viewer3d').off().on(click, function (e) {
		closeVideoOrAudio(true);
		var $tar = $(e.currentTarget);
		var ids = $tar.attr('data-id');
		var pointData = Util.getPointDataByIds(DATA, ids);
		pointData = JSON.parse(pointData.data || "{}")

		new Modal_3DViewer({ url: pointData.url, data: pointData.drawcustomarea })
	})
}

/**
 * 点击考试点读位
 * @param e
 */
function fnExamClick(e) {
	var $cTar = $(e.currentTarget);
	var ids = $cTar.attr('data-id');
	var pointData = Util.getPointDataByIds(DATA, ids);

	//解析题目的JSON字符串, 加强版解析  BUG 300 START
	var _count = 0;
	var questions = [];
	while (typeof pointData['questions'] === "string" && _count < 10) {
		_count++;
		pointData['questions'] = JSON.parse(pointData['questions']);
	}
	if (_count >= 10) {
		alert('解析题目JSON字符串报错,请查看数据库中,数据是否有问题')
	} else {
		questions = pointData['questions'];
	}

	// BUG 300 END

	var $secExam = $(GLOBAL.SEC_EXAM);
	$secExam.show()
	$(GLOBAL.SEC_EXAM_LIST).show();
	$(GLOBAL.SEC_QUESTION_LIST).hide();

	var scaleExam = isVertical ? $secExam.width() / 320 : $secExam.width() / 1500 * 2;

	GLOBAL.examShowList = new ExamShowList(GLOBAL.SEC_EXAM_LIST, {
		data: { questions: questions },
		scale: scaleExam,
		isVertical: isVertical,
		callback: function (questionData) {
			//点击题干
			$(GLOBAL.SEC_EXAM_LIST).hide();
			$(GLOBAL.SEC_QUESTION_LIST).show();

			GLOBAL.questionsList = new QuestionsList(GLOBAL.SEC_QUESTION_LIST, {
				data: questionData,
				scale: scaleExam,
				isVertical: isVertical,
				fnReturn: function () {

					//题干列表返回到考生页面
					$(GLOBAL.SEC_EXAM_LIST).show();
					$(GLOBAL.SEC_QUESTION_LIST).hide();
				},
				fnQuestionClick: function (questionIndex) {

					//点击第几题,考生页面跳转到该题目
					$(GLOBAL.SEC_EXAM_LIST).show();
					$(GLOBAL.SEC_QUESTION_LIST).hide();
					GLOBAL.examShowList.swiper.slideTo(questionIndex);
				}
			})
		}
	})
}

/**
 * 根据点读位的位置，计算出图文展示的位置[算法]
 * @param $tar
 */
function setImgTextLocation_Scale($tar, $secImgTextMain, $wrap) {
	$('.sec-imgtext').css({
		width: $wrap.width(),
		height: $wrap.height(),
	});

	//缩放的大小
	var scale = GLOBAL.picScale.scale || 1;
	var moveX = GLOBAL.picScale.maxX - GLOBAL.picScale.translateX || 0
	var moveY = GLOBAL.picScale.translateY || 0;


	var gap = 0;  //图文展示坐标，与点读位的距离
	var rW = $tar.width();
	var rH = $tar.height();


	var left = css2Float($tar.css('left')) * scale - moveX;
	var top = css2Float($tar.css('top')) * scale + moveY;

	var imgTextW = $secImgTextMain.width();
	var imgTextH = $secImgTextMain.height();

	var windowW = $(window).width();
	var windowH = $(window).height();


	var distTopAndBottom = 30;  //距离顶部,底部小于30px ,考虑图片放其他地方
	var distLeftAndRight = 40;  //距离左边右边小于40,考虑图文放其他地方


	//var wrapLeft = css2Float($tar.parents('.wrap').css('margin-left'));  //背景图片黑色区域宽度
	//var wrapTop = css2Float($tar.parents('.wrap').css('margin-top'));  //黑色区域高度
	var wrapTop = css2Float($('.sec-imgtext').css('margin-top'));  //黑色区域高度
	var wrapLeft = css2Float($('.sec-imgtext').css('margin-left'));  //背景图片黑色区域宽度

	var minLeft = distLeftAndRight - wrapLeft;  //图文允许放置的最左边大小
	var maxLeft = windowW - distLeftAndRight;  //最右边
	var minTop = distTopAndBottom - wrapTop;  //最上边
	var maxTop = windowH - distTopAndBottom;  //最下边


	var minX = left - imgTextW - gap;    //图文最左边位置
	var centerX = left + -(imgTextW + gap - rW) / 2;  //图文中间位置
	var maxX = left + rW + gap;  //图文最右边位置

	var minY = top - imgTextH - gap;  //图文最上边位置
	var centerY = top - (imgTextH + gap - rH) / 2;  //图文中间位置
	var maxY = top + rH + gap;  //图文最下边位置

	var imgTextLeft = left;
	var imgTextTop = top;

	//图文放在点读点右边
	if (minX < minLeft) {
		//图片放在点读点右边
		if (maxX + imgTextW < maxLeft) {
			imgTextLeft = maxX;
		}
		//图文放在点读点中间
		else {
			imgTextLeft = centerX;
		}
	}
	//图文放在点读点左边
	else {
		imgTextLeft = minX;
	}


	//图文放在点读点下边
	if (minY < minTop) {
		//图文放在点读点下边
		if (maxY + imgTextH < maxTop) {
			imgTextTop = maxY;
		}
		//图文放点读点下班, 超过页面, 因此放点读点中间
		else {
			imgTextTop = centerY;
		}
	}
	//放点读点上边
	else {
		imgTextTop = minY;
	}

	$secImgTextMain.css({ left: imgTextLeft, top: imgTextTop });

}

/*=======================点击事件相关 END====================*/


/**
 * 设置图标选中的图片地址
 * @param {[type]} $target [点击图标的Jquery对象]
 */
function setHoverImgSrcx($target) {
	var imgSrc = $target.css('background-image') || $target.css('backgroundImage');
	if (imgSrc.indexOf("_on") === -1) {
		var srcs = imgSrc.split('.png');
		var hoverImgSrc = srcs[0] + '_on.png' + srcs[1];
		$target.css('backgroundImage', hoverImgSrc);
	} else {
		var srcs = imgSrc.split('_on');
		var hoverImgSrc = srcs[0] + srcs[1];
		$target.css('backgroundImage', hoverImgSrc);
	}
}


/**
 * 从 样式  10px  变成 数字 10
 */
function css2Float(cssProp) {
	cssProp = cssProp || "";
	return parseFloat(cssProp.replace('px', ''));
}

/**
 * 判断鼠标是向上滑动,或者向下滑动[原生JS]
 */
window.mouseUpOrDown = (function () {
	return function (bar, callback) {
		var oldX, oldY, ev;
		var distance = 20; //距离大于10有效
		bar.onmousedown = function (event) {
			oldX = event.screenX;
			oldY = event.screenY;
			ev = event;
		};
		bar.onmouseup = function (event) {
			var newX = event.screenX;
			var newY = event.screenY;

			if (newY - oldY >= distance) {
				callback && callback(ev, 'down')
			} else if (oldY - newY > distance) {
				callback && callback(ev, 'up')
			}
			oldX = 0;
			oldY = 0;
		};
	};
})();


/**
 * 开关图隐藏,展示的音效
 * @param flag true 表示展示, false 表示隐藏
 * @param mp3Src 开关图展示1s,播放的mp3录音
 * @private
 */
function _playShowAudio(flag, mp3Src) {
	flag = flag || false;
	var showMP3 = ['assets/show/1.mp3', 'assets/show/2.mp3', 'assets/show/3.mp3']
	var hideMP3 = ['assets/hide/1.mp3', 'assets/hide/2.mp3', 'assets/hide/3.mp3']

	var index = parseInt((Math.random() * 2).toFixed(0));
	var src = flag ? showMP3[index] : hideMP3[index];

	var audio = document.createElement('audio');
	audio.src = src;
	audio.play();


	// if (window.OnOffAudio) window.OnOffAudio.src = '';
	if (window.OnOffAudio) setAudioSource(window.OnOffAudio, '');
	// 存在开关图mp3,则在音效播放完,播放mp3
	if (mp3Src && mp3Src !== 'undefined') {
		//音效结束1s,则播放mp3
		$(audio).on('ended', function () {
			if (flag) {
				setTimeout(function () {
					_playOnOffMp3(mp3Src)
				}, 1000)
			}
		})
	}
}

/**
 * 播放开关图mp3音效
 * @private
 */
function _playOnOffMp3(src) {
	window.OnOffAudio = window.OnOffAudio || document.createElement('audio');
	setAudioSource(window.OnOffAudio, src)
	// window.OnOffAudio.src = src;
	window.OnOffAudio.play();
}

/**
 * DOM节点展示的时候,添加闪烁效果
 * @param $dom
 * @private
 */
function _domShowEffect($dom) {
	$dom.addClass('custom-point-blink')
	setTimeout(function () {
		$dom.removeClass('custom-point-blink')
	}, 2000)
}
