/**
 * 2016-3-27 09:02:41
 * 作者 : zhongxia
 * 说明 :
 *      1. fn+数字 表示第几期的函数
 *      2. 共用的方法，会抽取出来，放到一个个闭包里面【每一个类型，一个闭包】
 *      3. 通用的组件，可能封装成一个 组件类，目前有 图文上传 ImgText
 */
/*==========================变量定义 START==================================*/
window.DD = window.DD || {}
window.DD.items = []; // 点读的位置记录

// 点读点类型
var TYPE = {
	1: 'video',
	2: 'audio',
	3: 'imgtext',
	4: 'exam',
	5: 'on-off',
	6: 'set-url',
	7: 'sway',
	8: 'viewer3d'
}

/******************************************
 * 全局对象
 ******************************************/
var GLOBAL = {
	PAGECOUNT: 1, 	// 点读页数量
	SCREENTYPE: '', // 屏幕类型，横屏，或者竖屏[选中之后，所有点读页都一致]
	ISSELECTEDSCREENTYPE: false, // 是否选中了点读页类型
	DIANDUSIZE: 72, // 点读点大小
	H_IMGSCALE: 1920 / 1080, // 横屏比例点
	V_IMGSCALE: 1080 / 1760, // 竖屏比例点
	OLDWIDTH: 1200, // 创建页面的横屏宽度
	OLDHEIGHT: 960, // 创建页面的竖屏高度
	SCREENSIZE: {
		h: { width: 1200, height: 675 },
		v: { width: 540, height: 960 }
	},
	ISEDIT: {
		flag: false // 是否为编辑页面,默认为false
	},
	POINT_SIZE: 100, // 点读点缩放比例(%)
	BACK_COLOR: 'rgb(0,0,0)', // 背景图之外空白区域的颜色
	AUDIO_AREA_SETTING: {    // 全局音频区域设置值
		title: '全局音频区域设置',
		border_color: '#ff0065',
		border_opacity: 100,
		border_width: 3
	}
}
/***************************************
 * 程序入口 Entry
 ***************************************/
$(function () {
	var _id
	// 本地测试[上传FTP注释掉]
	if (window.location.host.indexOf('localhost') !== -1) {
		_id = Util.getQueryStringByName('id')
		teamid = 3100
		unitid = 184
		userid = 92
	} else {
		_id = videoid
	}
	_id ? _edit.initEdit(_id) : _create.initCreate()
	bindEvent()
})


/***************************************
 * 创建相关操作
 ***************************************/
var _create = (function () {
  /**
   * 默认创建一个点读背景页
   */
	function initCreate() {
		addDianDuPageTpl()
	}

	return {
		initCreate: initCreate
	}
})()

/***************************************
 * 编辑相关操作
 ***************************************/
var _edit = (function () {
  /**
   * 初始化编辑页面
   * @param id
   */
	function initEdit(id) {
		Model.getList(id, function (data) {
			// 编辑的时候,按照点读页进行排序
			ArrayUtil.sortByKey(data.pages, 'seq')

			// 初始化 表单数据
			_initFormData(data)

			// 初始化点读页
			_initPages(data.pages)

			// 把数据解析到window.DD.items里面
			_data2DDItems(data)

			// 设置点读位状态, 显示或者隐藏
			_setPointState(data.pages)

			GLOBAL.ISEDIT = {
				flag: true,
				id: id
			}

			if (data.data && data.data.AUDIO_AREA_SETTING) {
				GLOBAL.AUDIO_AREA_SETTING = data.data.AUDIO_AREA_SETTING
			}

			// 回显背景图片的空白区域颜色
			setBackColor(GLOBAL.BACK_COLOR)

			// 回显全局音频设置配置
			_resetGlobalAudioData(data)
		})
	}

  /**
   * 初始化点读背景页
   * @param pages
   * @private
   */
	function _initPages(pages) {
		for (var i = 0; i < pages.length; i++) {
			var pageIndex = i + 1
			var picW = parseFloat(pages[i]['w'])
			var picH = parseFloat(pages[i]['h'])
			var picPath = pages[i]['pic']
			var picName = pages[i]['name'] || ''
			var points = pages[i]['points']

			GLOBAL.ISSELECTEDSCREENTYPE = true; // 已经选中点读页的类型(横屏或者竖屏)

			// 生成点读背景图
			addDianDuPageTpl()
			addDianduPageByUpload(pageIndex, picName, picPath)
			setBgImageScale(picPath, '#id_bg' + pageIndex)

			// 设置上传的图片信息,以及修改提示信息
			$('.sort-info').show()
			var _$fileBg = $('#file_bg' + pageIndex)
			_$fileBg.parent().find('.filename').text(picName)

			// 生成点读位
			for (var j = 0; j < points.length; j++) {
				var point = points[j]
				// 初始化点读位
				_initPointByData(pageIndex, picW, picH, point)
			}
		}
	}

  /**
   * 初始化表单
   * @param data
   */
	function _initFormData(data) {
		$('#name').val(data['title'])
		$('#intro').val(data['saytext'])
		$('#keywords').val(data['keywords'])
		$('input[name="chargeType"][value="' + data['charge'] + '"]').attr('checked', true)
		$('input[name="permissionType"][value="' + data['isprivate'] + '"]').attr('checked', true)
		$('#input[name="pic"]').val(data['pic'])
		$('#chargeStandard').val(data['cost'])

		if (data['background']) {
			$('#file_btnAutoAudio_path').val(data['background'])
			$('#btnAutoAudio>span').text(data['bgFileName'])
			$('.js-autovideo-btns').css({ display: 'flex' })

			$('#download_btnAutoAudio').attr('href', data['background']).attr('download', data['bgFileName'])
		}

		GLOBAL.POINT_SIZE = parseInt(data['point_size']) || 100
		GLOBAL.BACK_COLOR = data['back_color'] === '0' ? 'rgb(0,0,0)' : data['back_color']
	}

  /**
   * 根据数据快速生成点读位[根据数据生存]
   * @param pageIndex     背景图下标
   * @param w             背景图 w
   * @param h             背景图 h
   * @param x             点读位top
   * @param y             点读位left
   * @private
   */
	function _initPointByData(pageIndex, w, h, point) {
		// 计算图片的宽高
		var _scaleWH = getImageScaleWH(w, h)
		w = _scaleWH.scaleW
		h = _scaleWH.scaleH

		// 创建的时候,减去图片缩放后的 黑色区域宽度,  编辑的时候加上, 回显
		var left = parseFloat(point['x']) * w + (GLOBAL.SCREENSIZE.h.width - w) / 2
		var top = parseFloat(point['y']) * h + (GLOBAL.SCREENSIZE.h.height - h) / 2

		var DDPageItems = window.DD.items[pageIndex - 1]['data']; // 获取当前点读页的数据
		var dataid = pageIndex + '_' + (DDPageItems.length + 1); // 唯一标识该点读位 1_3 第一个点读页的第三个点读位[从1开始算]

		// 把数据在插入到全局变量中
		DDPageItems.push({
			x: parseFloat(point['x']), // 坐标的比例
			y: parseFloat(point['y']),
			id: dataid
		})

		// 默认为普通点读点,  1 普通点读点  2: 自定义标题   3. 自定义图片  6. 区域点读点 [4,5是展示页面的]
		var type = 1

		var pic = JSON.parse(point.pic || '{}')
		var title = JSON.parse(point.custom || '{}')
		var drawAreaData = JSON.parse(point.data || '{}').drawcustomarea

		if (title && title.title) type = 2
		if (pic && pic.src) type = 3
		if (drawAreaData && drawAreaData.type === 'area') type = 6
		var config = {
			left: left,
			top: top,
			w: w,
			h: h,
			title: title,
			pic: pic,
			drawAreaData: drawAreaData
		}
		createPoint(dataid, type, config)
		addDianDu(dataid, point)

		/**
		 * 设置了自定义图片,自定义标题,或者视频播放区域, 则设置 点模式 为 激活状态
		*/
		var is_point_mode = (type !== 1 && type !== 6) ||
			// (point.area && JSON.parse(point.area).w) ||
			(drawAreaData && drawAreaData.type === 'point')

		if (is_point_mode) {
			$('.point-types__setting[data-id="' + dataid + '"]')
				.find('.point-types-setting__point')
				.addClass('point-types-setting__point--active')
		}
		// 设置3D模型点读点的选中状态
		if (type === 6) {
			$('.upload-type>[data-id="' + dataid + '"]')
				.parent()
				.find('.point-types-setting__area')
				.addClass('point-types-setting__area--active')
		}

		// 初始化视频,音频,图文的数据
		_initPointItemData(dataid, point)
	}

  /**
   * 初始化视频,音频,图文的数据  [新增试卷]
   * @param dataid        点读位的唯一标识
   * @param point          点读数据
   * @private
   */
	function _initPointItemData(dataid, point) {
		var type = point['type']
		var fileName = point['filename']
		var url = point['url']
		var hide = point['hide'] == '1' ? true : false
		var $target, className

		var ids = dataid.split('_')
		var $currentTarget = $('#uploadSetting' + ids[0]).find('.item' + ids[1]).eq(0)
		var $rightName = $currentTarget.find('.upload-file-name').eq(0)
		var $filemask = $currentTarget.find('.div-file-mask'); // 文件上传按钮的遮罩层，用于图文

		$filemask.attr('data-type', type)
		$rightName.removeClass('notselect')
		$rightName.find('.download').parent().attr('download', fileName).attr('href', url)

		switch (type) {
			case '1':
				className = '.video'
				point['type'] = 'video'
				if (fileName) {
					$rightName.addClass('uploaded').attr('data-src', url).find('span').eq(0).text(fileName)
				}
				break
			case '2':
				className = '.audio'
				point['type'] = 'audio'
				if (url) {
					$rightName.addClass('uploaded').attr('data-src', url).find('span').eq(0).text(fileName)
				}
				break
			case '3':
				className = '.imgtext'
				point['type'] = 'imgtext'
				$rightName.addClass('uploaded-imgtext').find('span').eq(0).text('图文已上传(点击编辑)')
				$filemask.show().off().on('click', fn2_uploadImgText)
				break
			case '4':
				className = '.exam'
				point['type'] = 'exam'
				$rightName.addClass('uploaded-exam').find('span').eq(0).text('试卷已上传(点击编辑)')
				$filemask.show().off().on('click', fn2_examCreate)
				break
			case '5':
				className = '.on-off'
				point['type'] = 'on-off'
				$rightName.addClass('uploaded-on-off').find('span').eq(0).text('开关图已设置(点击编辑)')
				$filemask.show().off().on('click', fn3_onoffImgCreate)
				break
			case '6':
				className = '.set-url'
				point['type'] = 'set-url'
				$rightName.addClass('uploaded-set-url').find('span').eq(0).text('超链接已设置(点击编辑)')
				$filemask.show().off().on('click', fn3_setUrl)
				break;
			case '7':
				className = '.sway'
				point['type'] = 'sway'
				$rightName.addClass('uploaded-sway').find('span').eq(0).text('摇摆图已设置(点击编辑)')
				$filemask.show().off().on('click', fn_sway)
				break;
			case '8': //上传文件的点击类型
				className = '.viewer3d'
				point['type'] = 'viewer3d'
				$rightName.addClass('uploaded').attr('data-src', url).find('span').eq(0).text(fileName)
				// 3DObj
				break;
		}


		$target = $currentTarget.find(className).eq(0)
		var pdata = $target.parent().data(); // 点读位文件类型列表data-数据(文件列表的ul)
		if (pdata) {
			var id = pdata.id
			// 设置上传类型的默认图标--》设置选中的图片
			setUnSelectImgSrc($currentTarget)
			setHoverImgSrcx($target)
			$('#__file' + id).hide()
		}
	}

  /**
   * 把编辑返回的数据, 保存到window.DD.items里面
   * @param data
   * @private
   */
	function _data2DDItems(data) {
		$('input[name="pic"]').val(data['pic'])

		var _tempData = data.data || '{}'
		_tempData = JSON.parse(_tempData)
		window.DD.globalAudioData = _tempData.globalAudioData || {}

		//兼容旧的（单个全程音频）
		if (data.content) {
			var oldGlobalAudioData = JSON.parse(data.content)
			window.DD.globalAudioData[oldGlobalAudioData.id] = oldGlobalAudioData
		}

		window.GLOBAL.AUDIO_AREA_SETTING = $.extend({}, window.GLOBAL.AUDIO_AREA_SETTING, _tempData.AUDIO_AREA_SETTING)

		var pages = data.pages
		window.DD.point_size = data.point_size

		for (var i = 0; i < pages.length; i++) {
			window.DD.items[i]['oldId'] = pages[i]['id']
			for (var j = 0; j < pages[i]['points'].length; j++) {
				var obj = pages[i]['points'][j]
				window.DD.items[i]['data'][j]['oldId'] = obj['id']
				window.DD.items[i]['data'][j]['point_size'] = obj['point_size']
				window.DD.items[i]['data'][j]['url'] = obj['url']
				window.DD.items[i]['data'][j]['filename'] = obj['filename']
				window.DD.items[i]['data'][j]['title'] = obj['title']
				window.DD.items[i]['data'][j]['content'] = obj['content']
				window.DD.items[i]['data'][j]['type'] = obj['type']
				window.DD.items[i]['data'][j]['hide'] = (obj['hide'] == '1' ? true : false)

				window.DD.items[i]['data'][j]['questions'] = JSON.parse(obj['questions'] || '{}')
				window.DD.items[i]['data'][j]['audio_panel'] = JSON.parse(obj['audio_panel'] || '{}')
				window.DD.items[i]['data'][j]['custom'] = JSON.parse(obj['custom'] || '{}')
				window.DD.items[i]['data'][j]['pic'] = JSON.parse(obj['pic'] || '{}')
				window.DD.items[i]['data'][j]['area'] = JSON.parse(obj['area'] || '{}')

				window.DD.items[i]['data'][j]['remarks'] = JSON.parse(obj['remarks'] || '{}')

				window.DD.items[i]['data'][j]['linkurl'] = JSON.parse(obj['linkurl'] || '{}')   //开关图数据,暂时保存在这
				window.DD.items[i]['data'][j]['onoff'] = JSON.parse(obj['onoff'] || '{}')   //开关图数据,暂时保存在这

				window.DD.items[i]['data'][j]['data'] = JSON.parse(obj['data'] || '{}')
				window.DD.items[i]['data'][j]['drawcustomarea'] = window.DD.items[i]['data'][j]['data']['drawcustomarea']
			}
		}
	}

	// 设置点读位的状态,点读位是否为隐藏状态
	function _setPointState(pages) {
		for (var i = 0; i < pages.length; i++) {
			for (var j = 0; j < pages[i]['points'].length; j++) {
				var point = pages[i]['points'][j]
				if (point['hide'] == '1') {
					var _ids = (i + 1) + '_' + (j + 1)
					$('[data-id="' + _ids + '"]').find('.img-hide').click()
				}
			}
		}
	}

	/**
   * 把全局音频的数据,保存到点读数据里面  DD.items
   * 重置全局音频的数据
   * @param data
   * @private
   */
	function _resetGlobalAudioData(data) {
		var globalData = JSON.parse(data.data || '{}')
		var globalAudioData = globalData.globalAudioData || {}

		//兼容旧的（单个全程音频）
		if (data.content) {
			var oldGlobalAudioData = JSON.parse(data.content)
			globalAudioData[oldGlobalAudioData.id] = oldGlobalAudioData
		}

		for (var key in globalAudioData) {
			if (globalAudioData.hasOwnProperty(key)) {
				var globalAudioItemData = globalAudioData[key] || {}
				globalAudioItemData.pageConfig = globalAudioItemData.pageConfig || []
				// 回显全局音频设置
				var uploadRightBtns = $('.upload-right-btn').find('ul[data-id="' + key + '"]')
				uploadRightBtns.find('.img-global-audio').hide()
				uploadRightBtns.find('.img-global-audio-setting').show()

				// 设置点读点是音频的做标记,并且标记已经上传(音频+已经上传, 可以显示出 设置全局音频按钮)
				// hover 会显示全程音频的设置按钮
				var pages = window.DD.items
				for (var i = 0; i < pages.length; i++) {
					var points = pages[i].data || []
					for (var j = 0; j < points.length; j++) {
						var point = points[j]
						if (point.type === 'audio' && point.url !== '') {
							var id = point.id
							var pageIndex = id.split('_')[0]
							var pointIndex = id.split('_')[1]

							$('.diandupageitem[data-index="' + pageIndex + '"]')
								.find('.upload-item[data-index="' + pointIndex + '"]')
								.find('.upload-right')
								.attr('data-upload', 1)
								.attr('data-type', point.type)
						}
					}
				}
			}
		}
	}

	return {
		initEdit: initEdit
	}
})()

/*************************编辑页面 END**************************/
/**
 * 设置背景图的缩放
 * @param path 背景图路径
 * @param id 背景图的DOM id
 */
function setBgImageScale(path, id) {
	// 获取图片的宽高
	Util.getImageWH(path, function (obj) {
		var bgSize = '100% auto'
		var currentScale = obj.w / obj.h
		// 竖屏
		if (GLOBAL.SCREENTYPE === 'v') {
			if (currentScale > GLOBAL.V_IMGSCALE) {
				bgSize = '100% auto'
			} else {
				bgSize = 'auto 100%'
			}

			// 竖屏 , 小图, 没有办法铺满 宽 或者 高  [不缩放,不放大]
			if (obj.w < GLOBAL.SCREENSIZE.v.width) {
				bgSize = 'auto auto'
			}
		}
		// 横屏
		else {
			if (currentScale > GLOBAL.H_IMGSCALE) {
				bgSize = '100% auto'
			} else {
				bgSize = 'auto 100%'
			}

			// 横屏 , 高度小于 横屏高度, 不缩放,不放大
			if (obj.h < GLOBAL.SCREENSIZE.h.height) {
				bgSize = 'auto auto'
			}
		}
		$(id).css('background-size', bgSize)
	})
}

/*************************设置背景图的缩放比例 END**************************/

/**
 * 绑定事件
 */
function bindEvent() {
	// 提交
	$('#btnSubmit').on('click', handleSubmit)

	// 添加点读页
	$('#btnAdd').on('click', addDianDuPageTpl)

	// 双击点读点的时候，可以出现绘制区域的工具栏  2017-06-11 10:12:44
	$('body').on('dblclick', '.id_bg .radius', function (e) {
		var id = $(e.currentTarget).attr('id')
		var $areaSetting = $('.point-types__setting[data-id="' + id + '"]')
		var $uploadItem = $areaSetting.parents('.upload-item')
		fn_settingArea($uploadItem)
	})

	// 收费标准验证只能输入数字和小数点
	$('#chargeStandard').on('keyup', function (e) {
		var $tar = $(e.target)
		$tar.val($tar.val().replace(/[^\d.]/g, ''))
	})

	// 删除点读页.   该使用方法相当于 live
	$(document).on('click', '.bigimg-h .del', function (e) {
		e.stopPropagation()
		var $bgPage = $(e.currentTarget).parent().parent().parent().parent()
		var display = $bgPage.find('.setting-bigimg-tip-h').css('display')
		layer.confirm('确定删除该点读页？', {
			btn: ['确定', '取消'] // 按钮
		}, function (index) {
			$bgPage.remove()
			$bgPage.prev('hr').remove()
			delDDItem($bgPage.attr('data-index'))
			layer.close(index)
		})
	})

	//自动播放的背景音乐
	_upload.initWebUpload('#file_btnAutoAudio', {
		multiple: false,
		fileTypeDesc: 'Audio Files',
		fileTypeExts: 'audio/mpeg',
		onUploadSuccess: function (file, resultPath) {
			resultPath = resultPath._raw
			$('#file_btnAutoAudio_path').val(resultPath)
			$('#btnAutoAudio>span').text(file.name)
			$('.js-autovideo-btns').css({ display: 'flex' })
			$('.js-autovideo-progress').hide()
		},
		onUploadProgress: function (file, percentage) {
			$('.js-autovideo-progress').show()
			var $autoVideoProgress = $('.js-autovideo-progress');
			var percent = parseInt(percentage * 100);
			$autoVideoProgress.text(percent + '%');
			$autoVideoProgress.css({ width: percent + '%' })
		}
	})

	// 删除背景音乐
	$('.js-autovideo-del').on('click', function () {
		if (confirm('是否删除背景音乐？')) {
			$('#file_btnAutoAudio_path').val('');
			$('#download_btnAutoAudio').removeAttr('href').removeAttr('download')
			$('#btnAutoAudio>span').text('点击上传自动播放时的背景音乐(MP3格式)');
			$('.js-autovideo-btns').hide()
		}
	})

	// 点读点大小设置 START  2016-07-17 17:02:42
	$('#pointSetting').on('click', function (e) {
		e.stopPropagation()
		var $divDPS = $('#dianduPointSetting')

		// 实例化 点读点大小设置页面
		if ($divDPS.html() === '') {
			new PointSetting('#dianduPointSetting', {
				size: GLOBAL.POINT_SIZE,
				color: GLOBAL.BACK_COLOR,
				callback: function (config) {
					// 保存变量到全局
					GLOBAL.POINT_SIZE = config.size
					GLOBAL.BACK_COLOR = config.color

					// 设置页面上的效果,去除已经设置单个大小的点读点
					setPointSize('.radius:not([data-change="1"])', config.size)
					setBackColor(config.color)

					// 没有单独设置大小的点读点, 都受影响
					var $val = $('.c-number-val:not([data-change])')
					CNumber.prototype.setColorOut($val, config.size)
				}
			})
		}

		layer.open({
			type: 1,
			title: false,
			scrollbar: false,
			closeBtn: 1,
			area: ['600px', '600px'], // 宽高
			shadeClose: false,
			skin: 'yourclass',
			content: $divDPS
		})
	})
	// 点读点大小设置 END

	// 全局音频区域设置 START
	$('#audioAreaSetting').on('click', function (e) {
		new Modal_Audio({
			data: window.GLOBAL.AUDIO_AREA_SETTING,
			callback: function (data) {
				console.log(data)
				window.GLOBAL.AUDIO_AREA_SETTING = data
			}
		})
	})
	// 全局音频区域设置 END 

	// 添加点读点 START
	Util.MoveOrClick('.setting-bigimg-img',
		//点击处理 
		function (e) {
			onAddPoint(e)
		},
		// 拖动处理
		function (e) {

		})

	// 绘制自定义图形
	$('body').on('click', '.js-draw-custom-area', function (e) {
		var $cTar = $(e.currentTarget)
		var $tar = $(e.target)
		var config = $tar.data()
		// 获取当前点读页的数据
		var pageIndex = window.temp_draw_point_data.pageIndex
		var pointIndex = window.temp_draw_point_data.pointIndex
		var dataid = window.temp_draw_point_data.id
		var pointData = data_util.getDDItems(dataid)
		var _pageData = window.DD.items[pageIndex - 1]
		// 自定义绘制图形  START 
		var drawCustomArea = new Draw.DrawCustomArea({
			pageId: 'id_bg' + pageIndex,
			pointId: dataid,
			type: config.type,
			beforeDrawCallback: function () {
				$('#' + dataid).remove()
			},
			callback: function (data) {
				$cTar.hide()
				// 修改点读点的数据
				var location = getLocation(_pageData.w, _pageData.h, data.left, data.top)

				var temp_drawcustomarea = {
					// FIX问题，这里针对图片大小，而不是窗口大小
					w: data.width / _pageData.w,
					h: data.height / _pageData.h,
					//FIX: 默认为区域设置模式，（3D模型点模式的设置页面和区域模式设置页面一样，共用了，因此这里设置type（area,point）来区分）
					type: 'area',
					// FIX：早期只有一个3D模型区域设置，然后这个名称的含义是：区域展示的类型（矩形，圆角矩形，圆等的类型）
					pointType: config.type
				}

				//设置区域的默认参数，不需要点击设置弹窗后，就能有默认值
				switch (pointData.type) {
					case 'audio':
						// TODO:默认值，变成全局的设置，单独存放起来，因此下面的就不需要了
						// temp_drawcustomarea = window.GLOBAL.AUDIO_AREA_SETTING || {}
						// temp_drawcustomarea.border_color = '#ff0065'
						// temp_drawcustomarea.border_opacity = 100
						// temp_drawcustomarea.border_width = 3
						break
					case 'video':
						temp_drawcustomarea.btn_opacity = 100
						temp_drawcustomarea.border_opacity = 100
						temp_drawcustomarea.border_width = 3
						break
					case '3dviewer':
						break
				}


				data_util.setDDItems(dataid, {
					x: location.x,
					y: location.y,
					drawcustomarea: temp_drawcustomarea
				})

				drawCustomArea.setEnable(false)

				//创建绘制区域内部的内容
				new DrawAreaPoint({
					id: '#' + dataid,
					pointIndex: pointIndex,
					dataid: dataid,
					data: data_util.getDDItems(dataid).drawcustomarea,
					type: window.temp_draw_point_data.pointType,
					callback: function (data) {
						//注意： 保存区域设置的数据字段名，在 DrawAreaPoint.js 文件里面同样有使用
						var tempPointData = data_util.getDDItems(dataid)
						data = $.extend(data_util.getDDItems(dataid).drawcustomarea, data)
						tempPointData.drawcustomarea = data;
					}
				})

				//设置区域可以移动
				new Drag('#' + dataid, function (x, y) {
					var location = getLocation(_pageData.w, _pageData.h, x, y)
					data_util.setDDItems(dataid, { x: location.x, y: location.y })
				})
			}
		})
		// 自定义绘制图形  END
	})
}

/**
 * [COMMON]设置背景页的颜色
 * @param color
 */
function setBackColor(color) {
	$('.setting-bigimg-img').css('background-color', color)
}

/*==========================动态创建页面，根据模板 START==================================*/

/**
 * 添加点读页
 */
function addDianDuPageTpl() {
	var style
	if (GLOBAL.SCREENTYPE) {
		style = { style: 'width:' + GLOBAL.SCREENSIZE[GLOBAL.SCREENTYPE].width + 'px; height:' + GLOBAL.SCREENSIZE[GLOBAL.SCREENTYPE].height + 'px' }
	}
	var data = {
		index: GLOBAL.PAGECOUNT,
		visible: GLOBAL.ISSELECTEDSCREENTYPE ? 'none' : 'block'
	}
	data = $.extend(true, data, style)
	var tpls = Handlebars.compile($('#tpl_bg').html())
	$('#id_diandupages').append(tpls(data))

	// 初始化上传控件
	setUploadControl(GLOBAL.PAGECOUNT)

	// 没每添加一个点读页，就在这里添加一个数组
	window.DD.items.push({
		id: GLOBAL.PAGECOUNT, // id 用来标识该点读页
		sort: GLOBAL.PAGECOUNT, // 排序的顺序
		pic: '', // 背景图地址
		name: '', // 名称
		data: [] // 点读位数组
	})
	GLOBAL.PAGECOUNT++

	setBackColor(GLOBAL.BACK_COLOR)
}

/**
 * 创建点读位置
 * @param  {id}  当前点读位置的ID
 * @param  {index}  点读位置的显示的编号
 * @param  {left}  点读位置的偏移量  left
 * @param  {top}  点读位置的偏移量  top
 */
function createPoint(pointId, type, config) {
	config.left = config.left || 0
	config.top = config.top || 0
	config.pointId = pointId

	var pageIndex = parseInt(config.pointId.split('_')[0])
	var pid = '#id_bg' + pageIndex
	var style = "style='position:absolute; left:" + config.left + 'px; top :' + config.top + "px;'"
	var html = CreatePoint.initPoint(type, config)
	$(pid).append(html)

	if (type === 6) {
		//创建绘制区域内部的内容
		new DrawAreaPoint({
			id: '#' + config.pointId,
			pointIndex: config.pointId.split('_')[1],
			dataid: config.pointId,
			data: data_util.getDDItems(config.pointId).drawcustomarea,
			type: config.drawAreaData.pointType,
			callback: function (data) {
				//注意： 保存区域设置的数据字段名，在 DrawAreaPoint.js 文件里面同样有使用
				var tempPointData = data_util.getDDItems(config.pointId)
				data = $.extend(data_util.getDDItems(config.pointId).drawcustomarea, data)
				tempPointData.drawcustomarea = data;
			}
		})
	}

	new Drag('#' + config.pointId, function (x, y) {
		var _page = window.DD.items[pageIndex - 1]
		var location = getLocation(_page.w, _page.h, x, y)
		data_util.setDDItems(pointId, { x: location.x, y: location.y })
	})
}

// 获取点读点 相对于图片左上角的位置[不能去掉,否则点读点位置会有问题]
function getLocation(imgW, imgH, x, y) {
	var _x = x - (GLOBAL.SCREENSIZE.h.width - imgW) / 2
	var _y = y - (GLOBAL.SCREENSIZE.h.height - imgH) / 2
	return {
		x: _x / imgW,
		y: _y / imgH
	}
}

/**
 * 添加点读设置项
 * @param pageIndex 点读页下标
 * @param dianduItemid 点读点文件类型选择id
 * @param index 第几个点读点
 * @param point 点读点数据[编辑的时候有数据]
 */
function addDianDu(pointId, point) {
	point = point || {}
	var pageIndex = parseInt(pointId.split('_')[0])
	var pointIndex = parseInt(pointId.split('_')[1])

	var settingId = '#uploadSetting' + pageIndex

	var data = {
		id: pointId,
		index: pointIndex,
		type: TYPE[point.type],
		upload: point.url ? '1' : '0'
	}
	var tpls = Handlebars.compile($('#tpl_uploadSetting').html())
	$(settingId).append(tpls(data))

	// 设置单个点读点的大小  2016-07-18 22:43:43  START
	var pointSize = parseInt(point['point_size'])
	new CNumber('[data-id="' + pointId + '"] .number-container', {
		val: pointSize || GLOBAL.POINT_SIZE,
		flag: !!pointSize,
		pointSelector: '#' + pointId,
		callback: function (val) {
			var id = pointId
			data_util.setDDItems(id, { point_size: val })

			setPointSize('#' + pointId, val)
		}
	})

	if (point) {
		// 编辑
		if (pointSize) {
			// 单独设置了大小
			setPointSize('#' + pointId, pointSize)
		} else {
			// 全局大小
			GLOBAL.POINT_SIZE && setPointSize('#' + pointId, GLOBAL.POINT_SIZE)
		}
	} else {
		// 新增
		GLOBAL.POINT_SIZE && setPointSize('#' + pointId, GLOBAL.POINT_SIZE)
	}

	// 设置单个点读点的大小  2016-07-18 22:43:43  END

	// 点读设置项
	$('.upload-item').off().on('click', handleUploadItem)
}

/**
 * [COMMON]设置点读位置的大小
 * @param id
 */
function setPointSize(selector, val) {
	var $dom = $(selector)
	var scale = val / 100

	var style = 'scale(' + scale + ')'
	var rotate = $dom.attr('data-rotate')
	if (rotate) {
		style += 'rotate(' + rotate + 'deg)'
	}
	$dom.css({
		transform: style,
		'-webkit-transform': style,
		'transform-origin': 'left top',
		'-webkit-transform-origin': 'left top'
	})
}

/*==========================uploadify控件设置  START==================================*/

/**
 * [CORE]
 * 【上传背景图】,上传之后的一直操作
 * 初始化上传控件
 * @return {[type]} [description]
 */
function setUploadControl(index) {
	// index 从 1 开始
	var file_bg = '#file_bg' + index
	var newIndex = index
	_upload.initWebUpload(file_bg, {
		multiple: true,
		label: '选择图片',
		onUploadSuccess: function (file, resultPath, response) {
			resultPath = resultPath._raw
			GLOBAL.ISSELECTEDSCREENTYPE = true;  //已经选中点读页的类型
			var oldIndex = newIndex;

			//上传多个文件
			if (this.getFiles().length > 1) {
				//第一个上传的文件，不需要新添加一个点读页
				if (newIndex !== index) {
					addDianDuPageTpl();
				}
				addDianduPageByUpload(newIndex, file.name, resultPath);
				newIndex++;
			}
			else {
				addDianduPageByUpload(index, file.name, resultPath);
			}

			//设置上传的图片信息,以及修改提示信息
			$('.sort-info').show();
			var _$fileBg = $("#file_bg" + oldIndex);
			_$fileBg.parent().find('.filename').text(file.name);
			setBgImageScale(resultPath, "#id_bg" + (oldIndex))
		}
	})
}

/**
 * 根据上传的图片,快速生成点读背景
 * @param index 点读页的下标
 * @param id_bg 点读页的id
 * @param fileName 文件名
 * @param resultPath 文件路径
 */
function addDianduPageByUpload(index, fileName, resultPath, callback) {
	if (resultPath.indexOf('error') === -1) {
		GLOBAL.SCREENTYPE = GLOBAL.SCREENTYPE || 'h'; // 默认横屏

		var id_bg = '#id_bg' + index
		var $bg = $(id_bg)

		var src = resultPath; // PHP返回的资源路径

		$bg.css('backgroundImage', 'url("' + src + '")')

		$bg.parent().find('.setting-bigimg-header>span').eq(0).hide()
		$bg.parent().find('.setting-bigimg-header>span').eq(1).show()
		$bg.parent().find('.bigimg-h2s-right').hide()

		$bg.parent().find('.hide').removeClass('hide')

		$('.btn_start').show()
		$('.bigimg-tip').hide()

		// 获取图片的大小
		Util.getImageWH(src, function (obj) {
			var _scaleWH = getImageScaleWH(obj.w, obj.h)

			window.DD.items[index - 1]['w'] = _scaleWH.scaleW
			window.DD.items[index - 1]['h'] = _scaleWH.scaleH
			window.DD.items[index - 1]['name'] = fileName
			window.DD.items[index - 1]['pic'] = src

			bindDianDuPageEvent()
			if (callback) {
				callback(window.DD.items[index - 1])
			}
		})
	}
}

/**
 * 传入宽高,获取缩放到适应屏幕的宽高大小
 * @param w
 * @param h
 * @returns {{scaleW: *, scaleH: *}}
 */
function getImageScaleWH(w, h) {
	var obj = {}, _scaleImgW, _scaleImgH
	obj.w = w
	obj.h = h
	if (obj.w < GLOBAL.SCREENSIZE.h.width && obj.h < GLOBAL.SCREENSIZE.h.height) {
		_scaleImgW = obj.w
		_scaleImgH = obj.h
	}
	else if (obj.w > obj.h) {
		// 横向图, w=1200 h=按比例缩小  1200 * 实际高 = 实际宽 * 缩放高
		_scaleImgW = GLOBAL.SCREENSIZE.h.width
		_scaleImgH = _scaleImgW / obj.w * obj.h
		// 如果缩放宽高, 宽1200  高>675 , 则以高为缩放比例
		if (_scaleImgH > GLOBAL.SCREENSIZE.h.height) {
			_scaleImgH = GLOBAL.SCREENSIZE.h.height
			_scaleImgW = _scaleImgH / obj.h * obj.w
		}
	} else {
		// 竖型图  h=675  w=按比例缩小
		_scaleImgH = GLOBAL.SCREENSIZE.h.height
		_scaleImgW = _scaleImgH / obj.h * obj.w

		if (_scaleImgW > GLOBAL.SCREENSIZE.h.height) {
			_scaleImgW = GLOBAL.SCREENSIZE.h.width
			_scaleImgH = _scaleImgW / obj.w * obj.h
		}
	}
	return {
		scaleW: _scaleImgW,
		scaleH: _scaleImgH
	}
}

/**
 * 绑定点读页的事件
 * @return {[type]} [description]
 */
function bindDianDuPageEvent() {
	// 区分点击还是绘制图形  TODO 
	// 添加点读点
	// $('.setting-bigimg-img').off()
	//   .on('click', onAddPoint)

	// 点读页上下移动操作
	$('.setting-bigimg-header ul').off()
		.on('click', dianduPageOperator)

	$('.upload-item').off()
		.on('click', handleUploadItem)

	$('.div-file-mask').off()
		.on('click', function (e) {
			var type = $(e.target).attr('data-type')
			if (type === '3') {
				fn2_uploadImgText(e)
			}
			else if (type === '4') {
				fn2_examCreate(e)
			} else if (type === '5') {
				fn3_onoffImgCreate(e);
			} else if (type === '6') {
				fn3_setUrl(e);
			} else if (type === '7') {
				fn_sway(e);
			}
		})
}

/*==========================图片选中，不选中状态设置 START==================================*/

/**
 * 设置图标选中的图片地址
 * @param {[type]} $target [点击图标的Jquery对象]
 */
function setHoverImgSrcx($target) {
	var imgSrc = $target.css('backgroundImage')
	if (imgSrc.indexOf('_on') === -1) {
		var srcs = imgSrc.split('.png')
		var hoverImgSrc = srcs[0] + '_on.png' + srcs[1]
		$target.css('backgroundImage', hoverImgSrc)
	} else {
		var srcs = imgSrc.split('_on')
		var hoverImgSrc = srcs[0] + srcs[1]
		$target.css('backgroundImage', hoverImgSrc)
	}
}

/**
 * 设置默认的图标
 * @param {[type]} $currentTarget [绑定点击事件的标签,Jquery对象]
 */
function setUnSelectImgSrc($currentTarget) {
	var $imgs = $currentTarget.find('.upload-type li')
	$imgs.each(function (index, el) {
		$el = $(el)
		var imgSrc = $el.css('backgroundImage')
		if (imgSrc.indexOf('_on') != -1) {
			var srcs = imgSrc.split('_on')
			var hoverImgSrc = srcs[0] + srcs[1]
			$el.css('backgroundImage', hoverImgSrc)
		}
	})
}

/*==========================点读位置拖动，下载点读位的文件 START==================================*/
/**
 * 获取有效的XY坐标，防止超出背景图
 */
function getValidXY(ex, ey, w, h) {
	var size = GLOBAL.DIANDUSIZE
	var r = size / 2
	// 不允许超过背景图之外
	var x = ex - r; // 减去圆的半径
	var y = ey - r

	if (ex - r < 0) {
		x = 0
	}
	if (ey - r < 0) {
		y = 0
	}
	if (ex + r > w) {
		x = w - size
	}
	if (ey + r > h) {
		y = h - size
	}
	return {
		x: x,
		y: y
	}
}

/*************************************************************
 *              逻辑部分【重点】  START
 *************************************************************/
/**
 * 添加点读位置
 */
function onAddPoint(e) {
	var $tar = $(e.target)
	var w = $tar.width()
	var h = $tar.height()

	// 添加点读位置,点读位上点击是不能添加新的点读位的
	if ($tar.hasClass('setting-bigimg-img')) {
		var pageIndex = parseInt($tar.attr('data-index'))
		var xy = getValidXY(e.offsetX, e.offsetY, w, h)
		var x = xy.x
		var y = xy.y

		// 获取当前点读页的数据
		var _page = window.DD.items[pageIndex - 1]

		// 点读点 id 和点读点下标
		var DDPageItems = _page['data']
		var dataid = pageIndex + '_' + (DDPageItems.length + 1)

		var location = getLocation(_page.w, _page.h, x, y)
		DDPageItems.push({
			x: location.x, // 坐标的比例
			y: location.y,
			id: dataid
		})
		// 创建点读点
		createPoint(dataid, 1, {
			left: x,
			top: y
		})
		// 创建点读点项
		addDianDu(dataid)
	}
}

/**
 * 点读项点击事件处理
 */
function handleUploadItem(e) {
	var $cTar = $(e.currentTarget)
	var $target = $(e.target)
	var data = $target.data()

	switch (data.type) {
		// 点击区域设置
		case 'setting-area':
			fn_settingArea($cTar)
			break
		// 选择点读类型
		case 'selectType':
			selectTypeClick(e)
			break
		// 点读点设置（点读点上加图片，自定义图片等功能）
		case 'point-setting':
			addCustomPointSetting(e)
			break
		// 隐藏按钮
		case 'hide':
			hideDDLocation(e)
			break
		// 删除按钮
		case 'delete':
			var itemdata = $target.parent().data()
			$('#' + itemdata.id).remove()
			$cTar.remove()
			// 在本地数据变量里面标注，已经删除
			var _dataid = itemdata.id
			data_util.setDDItems(_dataid, { isRemove: true })
			break

		// 设置全局音频按钮（点击，把全程音频按钮从hover状态展示，到默认展示）
		case 'global-audio':
			var $tar = $(e.target)
			$tar.hide()
			$tar.next().show()
			break

		// 全程音频设置参数
		case 'global-audio-setting':
			fn_globalAudioSetting(e)
			break
		default:
			break
	}
}


/**
 * 设置区域点读点（展示绘制区域的类型）
 */
function fn_settingArea($cTar) {
	var pointType = $cTar.find('.upload-right').attr('data-type')
	var pointIndex = $cTar.attr('data-index')
	var pageIndex = $cTar.parents('.diandupageitem').attr('data-index')

	if (pointType === 'on-off') {
		console.info('开关图没有点模式和区域模式')
		return
	}
	if (pointType === 'sway') {
		console.info('摇摆图没有区域模式')
		return
	}
	// TODO:目前只开发了[3D模型的区域,音频，视频]，其他的目前还没有规划有区域模式
	if (pointType !== 'viewer3d' && pointType !== 'audio' && pointType !== 'video') {
		alert('该点读点类型，尚未规划区域功能，请期待后期功能哦~')
		return
	}
	//设置区域设置按钮 选中状态
	var $settingArea = $cTar.find('.point-types-setting__area')
	if ($settingArea.hasClass('point-types-setting__area--active')) {
		$settingArea.removeClass('point-types-setting__area--active')
	} else {
		$settingArea.addClass('point-types-setting__area--active')
	}

	//  记录绘制区域点读点的数据
	window.temp_draw_point_data = {
		id: pageIndex + '_' + pointIndex,
		pageIndex: pageIndex,
		pointIndex: pointIndex,
		pointType: pointType
	}

	var $drawCustomArea = $cTar.parents('.diandupageitem').find('.js-draw-custom-area')
	if ($drawCustomArea.css('display') === 'none') {
		$drawCustomArea.css({
			display: 'flex'
		})
	} else {
		$drawCustomArea.css({
			display: 'none'
		})
	}
}

/**
 * 设置全程音频
 * 点读页第几秒会跳转
 * 如何保存数据，在组件里面编写了。
 * @param {any} e 
 * 
 */
function fn_globalAudioSetting(e) {
	var $tar = $(e.target)
	var dataItemId = $tar.parent().attr('data-id'); // DD.items 里面的标识id
	var globalAudioSrc = $tar.parents('.upload-item').find('.upload-file-name').attr('data-src')
	var globalAudioName = $tar.parents('.upload-item').find('.upload-file-name span').eq(0).text()

	$tar.attr('data-dataid', dataItemId)
		.attr('data-src', globalAudioSrc)
		.attr('data-name', globalAudioName)

	var data = window.global_audio_util.get(dataItemId)
	data.id = data.id || dataItemId
	data.src = data.src || globalAudioSrc
	data.name = data.name || globalAudioName
	data.pageConfig = data.pageConfig || []

	new GlobalAudio({
		data: data,
		callback: function (e) {
			layer.confirm('确定删除该全局音频？', {
				btn: ['确定', '取消'] // 按钮
			}, function () {
				layer.closeAll()
				$tar.parent().find('.img-global-audio-setting').hide()
				$tar.parent().find('.img-global-audio').show()
				window.global_audio_util.remove(data.id)
			})
		}
	})
}

/**
 * 弹出自定义点读点窗口
 * @param e
 * @param param
 */
function addCustomPointSetting(e) {
	var $divGA = $('#customPointSetting')
	var $cTar = $(e.target)
	var dataId = $cTar.parent().attr('data-id') || '1_1'
	var pageIndex = parseInt(dataId.split('_')[0]) - 1
	var pointIndex = parseInt(dataId.split('_')[1]) - 1
	var pointType = $(e.target).parents('.upload-item').find('.upload-right').attr('data-type')

	var audioPath

	if (pointType === 'audio') {
		audioPath = $(e.target).parents('.upload-item').find('.upload-file-name').attr('data-src')
	}

	if (pointType === 'on-off') {
		console.info('开关图没有点模式和区域模式')
		return
	}

	// 获取数据,编辑
	var _data = window.DD.items[pageIndex]['data'][pointIndex] || {}
	_data.custom = _data.custom || {}
	_data.custom.type = pointType

	// 实例化 点读点大小设置页面
	new CustomPointSetting('#customPointSetting', {
		dataId: dataId,
		pointData: _data, // 点读点数据
		title: _data.custom, // 点读点自定义title
		pic: _data.pic, // 点读点自定义图片
		bgPic: window.DD.items[pageIndex], // 背景图片地址
		audioPath: audioPath,
		audio_panel: _data.audio_panel,

		submitCallback: function (data, isSetData) {

			layer.closeAll()

			var $point = $('#' + dataId)
			$point.remove()

			var left = $point.css('left')
			var top = $point.css('top')

			// 把音频面板设置保存到变量[直接保存到点配置里面]
			data.title = data.title || {};

			// 保存视频播放区域的数据
			window.DD.items[pageIndex].data[pointIndex].area = data.area
			if (data.audio_panel.lrc !== '' || data.audio_panel.show) {
				window.DD.items[pageIndex].data[pointIndex].audio_panel = data.audio_panel
			}

			// 是否设置了数据
			if (isSetData) {
				$cTar.addClass('point-types-setting__point--active')

				// 保存数据到变量里面
				window.DD.items[pageIndex].data[pointIndex].pic = data.pic
				window.DD.items[pageIndex].data[pointIndex].custom = data.title
				window.DD.items[pageIndex].data[pointIndex].drawcustomarea = data.viewer3d

				// 点读点类型,是自定义图片,还是自定义标题
				var type = 1
				if (data.pic.src) type = 3   //自定义图片
				if (data.title.title) type = 2  //自定义标题

				var config = {
					left: left,
					top: top,
					title: data.title,
					pic: data.pic
				}
				createPoint(dataId, type, config)
			} else {
				$cTar.removeClass('point-types-setting__point--active')
				// 保存数据到变量里面
				window.DD.items[pageIndex].data[pointIndex].pic = null
				window.DD.items[pageIndex].data[pointIndex].custom = null

				var config = {
					left: left,
					top: top
				}
				createPoint(dataId, 1, config)
			}
		}
	})

	layer.open({
		type: 1,
		title: false,
		scrollbar: false,
		closeBtn: 1,
		area: ['600px', '600px'], // 宽高
		shadeClose: false,
		content: $divGA
	})
}

/**
 * 选择点读点类型点击操作
 */
function selectTypeClick(e) {
	var $target = $(e.target)
	var $uploadItem = $target.parents('.upload-item')
	new PointTypes({
		offset: $target.offset(),
		selectedType: $target.attr('data-point-type'),
		closeCallback: function (data) {
      /**
       * 选择好类型的处理方式
       * 1. 上传类型，则初始化 webupload组件
       * 2. 点击弹窗类型（开关图，考试,超链接点读点）
       */
			_selectTypeHandle(e, data)
			// 开关图
			if (data.type === 'on-off') {
				$uploadItem.find('.point-types-setting__area').addClass('point-typs-setting--disabled')
				$uploadItem.find('.point-types-setting__point').addClass('point-typs-setting--disabled')
			} else {
				$uploadItem.find('.point-types-setting__area').removeClass('point-typs-setting--disabled')
				$uploadItem.find('.point-types-setting__point').removeClass('point-typs-setting--disabled')
			}
			// 摇摆图
			if (data.type === 'sway') {
				$uploadItem.find('.point-types-setting__area').addClass('point-typs-setting--disabled')
			} else if (data.type !== 'on-off') {
				$uploadItem.find('.point-types-setting__area').removeClass('point-typs-setting--disabled')
			}


			$target
				.attr('data-point-type', data.type)
				.attr('style', '')
				.text('')
				.removeClass()
				.addClass('point-types__item--' + data.type + '-selected')
		}
	})
}

/**
 * FLAG:类型操作处理
 * 选择点读点类型后的处理方法
 * @param {any} e 
 */
function _selectTypeHandle(e, data) {
	var $target = $(e.target)
	var $currentTarget = $(e.currentTarget)
	var $filemask = $currentTarget.find('.div-file-mask'); // 文件上传按钮的遮罩层，用于图文
	var $webuploaderDiv = $currentTarget.find('[data-fileid]');

	var pdata = $target.parent().data(); // 点读位文件类型列表data-数据(文件列表的ul)
	var id = pdata.id
	var _dataid = id
	var fileTypeDesc, fileTypeExts

	// 设置右边上传位置文字，以及背景颜色
	var $rightName = $currentTarget.find('.upload-file-name')

	// 上传文件名称，以及点读点操作按钮区域
	var $uploadRight = $currentTarget.find('.upload-right')

	// 设置上传类型的默认图标--》设置选中的图片
	setUnSelectImgSrc($currentTarget)
	setHoverImgSrcx($target)

	// 加上点读点类型【用于hover出现全局音频按钮】
	$uploadRight.attr('data-type', data.type)

	$rightName.find('span').html(data.text)
	// 未上传文件，设置上传文件的样式
	$rightName.removeClass('notselect').addClass('upload')
	// 已经上传文件，修改成 需要上传新的文件
	$rightName.removeClass('uploaded').addClass('upload')
	// 已经上传图文文件[二期]
	$rightName.removeClass('uploaded-imgtext').addClass('upload')
	// 用来遮住uploadify 组件的, 图文和试卷 不需要直接使用上传功能
	$filemask.hide()
	switch (data.type) {
		case 'video': // 视频
			fileTypeExts = 'audio/mp4,video/mp4'
			fileTypeDesc = 'MP4文件'
			$webuploaderDiv.show()
			break
		case 'audio': // 音频
			fileTypeExts = 'audio/mpeg'
			fileTypeDesc = 'MP3文件'
			$webuploaderDiv.show()
			$target.parents('.upload-item').find('.upload-right').attr('data-upload', 0)
			break
		case 'viewer3d': //3D观察期
			fileTypeExts = 'obj/*'
			fileTypeDesc = 'Obj Files'
			$webuploaderDiv.show()
			break
		case 'imgtext': // 图文
			$filemask.show().off().on('click', fn2_uploadImgText)
			break
		case 'exam': // 考试
			$filemask.show().off().on('click', fn2_examCreate)
			break
		case 'on-off': // 开关图
			$filemask.show().off().on('click', fn3_onoffImgCreate)
			break
		case 'set-url': //设置超链接
			$filemask.show().off().on('click', fn3_setUrl)
			break
		case 'sway': //摇摆图
			$filemask.show().off().on('click', fn_sway)
			break

	}
	// 把文件类型，保存到变量里面
	data_util.setDDItems(_dataid, { type: data.type })

	$('#__file' + id + '-queue').remove()

	_upload.initWebUpload('#__file' + id, {
		id: id,
		fileTypeExts: fileTypeExts,
		fileTypeDesc: fileTypeDesc,
		onUploadSuccess: function (file, resultPath) {
			resultPath = resultPath._raw
			if (resultPath.indexOf('error') === -1) {
				$('#download_' + id).attr('href', resultPath).attr('download', file.name)

				var $rightName = $('#__file' + id).parents('.upload-file-name')

				$rightName.attr('data-src', resultPath)
				$rightName.removeClass('upload').addClass('uploaded')
				$rightName.find('span').html(file.name)

				$uploadRight.attr('data-upload', 1); // 标记已经上传文件

				// 如果是视频点读点,则获取视频的宽高
				if (data.type === 'video') {
					Util.getVideoWH(resultPath, function (obj) {
						data_util.setDDItems(_dataid, {
							url: resultPath,
							filename: file.name,
							area: {
								w: obj.w, h: obj.h,
								videoW: obj.w, videoH: obj.h
							}
						})
					})
				} else {
					data_util.setDDItems(_dataid, { url: resultPath, filename: file.name })
				}
			}
		}
	})

}

/**
 * 2017-04-07 22:11:56
 *  设置摇摆图类型点读点
 */
function fn_sway(e) {
	var ids = CommonUtil.getIds(e);
	var pageId = ids.pageId;
	var dianduId = ids.dianduId;
	var _pointData = window.DD.items[pageId].data[dianduId];
	new SwayPoint({
		data: _pointData.pic,
		id: ids.id,
		callback: function (data) {
			// 上传了摇摆图，则替换创建页面的点读点展示
			if (data.src) {
				var $uploadFileName = $('#uploadSetting' + (ids.pageId + 1)).find('.item' + (ids.dianduId + 1)).find('.upload-file-name')
				$uploadFileName.removeClass('upload').addClass('uploaded-sway')
				$uploadFileName.find('span').text('摇摆图已设置(点击编辑)')

				var $point = $('#' + ids.id)
				$point.remove()
				var config = {
					left: $point.css('left'),
					top: $point.css('top'),
					pic: data
				}
				createPoint(ids.id, 3, config)
				//还原缩放的大小
				if (_pointData.point_size !== '0') {
					$('#' + ids.id).css({
						'transform': 'scale(' + _pointData.point_size / 100 + ')',
						'transform-origin': 'top left'
					})
				}

				_pointData.pic = data
			}
		}
	})
}

/**
 * 2016-11-21 00:12:19
 * 设置超级链接点读点
 * @param e
 */
function fn3_setUrl(e) {
	// 获取 id
	var ids = CommonUtil.getIds(e)
	var pageId = ids.pageId
	var dianduId = ids.dianduId
	var _pointData = window.DD.items[pageId].data[dianduId]
	new UrlPoint('body', _pointData.linkurl, function (val) {
		// FIX:这里直接用_pointData.linkurl赋值的时候，有少数时候没有赋值到 window.DD上，因此改为下面这种方式
		window.DD.items[pageId].data[dianduId].linkurl = val;
		if (val) {
			var $uploadFileName = $('#uploadSetting' + (ids.pageId + 1)).find('.item' + (ids.dianduId + 1)).find('.upload-file-name')
			$uploadFileName.removeClass('upload').addClass('uploaded-set-url')
			$uploadFileName.find('span').text('超链接已设置(点击编辑)')
		}
	})
}

/**
 * 2016-11-09 22:40:46
 * 上传开关图
 * @param e
 */
function fn3_onoffImgCreate(e) {
	// 获取 id
	var ids = CommonUtil.getIds(e)
	var pageId = ids.pageId
	var dianduId = ids.dianduId
	var _data = window.DD.items[pageId].data[dianduId];

	_data.onoff = _data.onoff || {};
	new OnOffImg('body', {
		id: ids.id,
		bg: { w: window.DD.items[pageId].w, h: window.DD.items[pageId].h, bgPath: window.DD.items[pageId].pic },
		img: _data.onoff.img,
		switchArea: _data.onoff.switchArea,
		mp3: _data.onoff.mp3,
		hideSwitchArea: _data.onoff.hideSwitchArea
	}, function (result) {
		_data.onoff = result;
		// 标识开关图
		var $uploadFileName = $('#uploadSetting' + (ids.pageId + 1)).find('.item' + (ids.dianduId + 1)).find('.upload-file-name')
		$uploadFileName.removeClass('upload').addClass('uploaded-on-off')
		$uploadFileName.find('span').text('开关图已设置(点击编辑)')
	}).init()
}

/**
 * 上传图文[共用一个图文上传页]
 * @return {[type]} [description]
 */
function fn2_uploadImgText(e) {
	// 获取 id
	var ids = CommonUtil.getIds(e)
	var _isEdit = ids.isEdit
	var pageId = ids.pageId
	var dianduId = ids.dianduId

	// 常规操作,获取数据的方式,由点击创建时传过来的
	window.imgText = window.imgText || null
	var data = window.DD.items[pageId].data[dianduId]

	if (!window.imgText) {
		window.imgText = new ImgText('body', data, function (result) {
			data_util.setDDItems(result.id, result)
			// 这个不能写外面，否则会被缓存起来
			var ids = result.id.split('_')
			var $uploadFileName = $('#uploadSetting' + ids[0]).find('.item' + ids[1]).find('.upload-file-name')
			$uploadFileName.removeClass('upload').addClass('uploaded-imgtext')
			$uploadFileName.find('span').text('图文已上传(点击编辑)')
		}).init()

		// 如果是编辑页面,则第一次就需要赋值初始值
		if (_isEdit) {
			window.imgText.data = data
			window.imgText.reset()
			window.imgText.set(data)
			window.imgText.show()
		}
	} else {
		// 更新 图文上传组件 上的data，保证所有点读页共用一个 图文上传页面，参数参数是正确的
		window.imgText.data = data
		window.imgText.reset()
		window.imgText.set(data)
		window.imgText.show()
	}
}

/**
 * 上传试卷[20150507]
 */
function fn2_examCreate(e) {
	var ids = CommonUtil.getIds(e)
	// 试卷数据
	var examData = data_util.getDDItems(ids.id) || {}

	new ExamCreate('#_examCreate', examData, function (submitData) {
		// 标识试卷已经上传
		var $uploadFileName = $('#uploadSetting' + (ids.pageId + 1)).find('.item' + (ids.dianduId + 1)).find('.upload-file-name')
		$uploadFileName.removeClass('upload').addClass('uploaded-exam')
		$uploadFileName.find('.span').text('试卷已上传(点击编辑)')

		layer.close(_layer)
		data_util.setDDItems(ids.id, submitData)
	})
	var _layer = layer.open({
		type: 1,
		scrollbar: false,
		title: '上传试卷',
		shadeClose: false,
		content: $('#_examCreate')
	})

	// 设置 textarea 自动撑开
	autosize($('#_examCreate').find('textarea'))
}

/**
 * [创建于 开发试卷时]公用的一些方法
 * @type {{getIds}}
 */
var CommonUtil = (function () {
  /**
   * 点击上传项类型,获取id  [图文,试卷目前在用]
   * @param e
   * @returns {{id: (XML|string|void|*), pageId: number, dianduId: number, isEdit: boolean}}
   */
	function getIds(e) {
		// 计算出当前数据的ID,然后去window.DD.items 里面获取数据 [针对点读页上下移动,重新绑定事件获取数据的方式]
		var id, _isEdit = false

		if ($(e.target).parent().find('[data-fileid]').attr('id')) {
			id = $(e.target).parent().find('[data-fileid]').attr('id')
		} else {
			id = $(e.target).parent().find('input').attr('id'); // 编辑由于没有初始化uploadify,所有获取id的方式使用这种
			_isEdit = true
		}

		id = id.replace('__file', '')
		var pageId = parseInt(id.split('_')[0]) - 1
		var dianduId = parseInt(id.split('_')[1]) - 1

		return {
			id: id,
			pageId: pageId,
			dianduId: dianduId,
			isEdit: _isEdit
		}
	}

	return {
		getIds: getIds
	}
})()

/**
 * 隐藏点读位置
 */
function hideDDLocation(e) {
	var $currentTarget = $(e.currentTarget)
	var $lis = $currentTarget.find('.upload-type li')
	var $target = $(e.target)
	var $rightName = $currentTarget.find('.upload-file-name')
	// 该点读位置的下标，就是ＩＤ
	var index = $(e.currentTarget).attr('data-index')

	var data = $target.data()
	setHoverImgSrcx($target)

	var itemdata = $target.parent().data()
	var _dataid = itemdata.id

	var $itemSortId = $('#item' + itemdata.id); // 序号

	// 隐藏点读位
	if ($target.attr('data-show') === '0') {
		$target.attr('data-show', '1')

		var style = {
			'background': '#7F7F7F',
			'textDecoration': 'line-through'
		}
		$('#' + itemdata.id).find('.radius-in').css(style); // 背景上的点读位置

		$itemSortId.css(style)

		$itemSortId.prev().css('visibility', 'initial'); // 隐藏的图片展示出来

		data_util.setDDItems(_dataid, { hide: true })

		// 记录旧的样式，等显示在赋值上去
		for (var i = 0; i < $lis.length; i++) {
			var $li = $($lis[i])
			$li.attr('data-style', $li.attr('style'))
			$li.removeAttr('style')
		}

		// 设置右侧名称【上传文件按钮】
		$rightName.attr('data-class', $rightName.attr('class'))
		$rightName.removeClass().addClass('upload-file-name notselect')
	}

	// 显示点读位
	else {
		var style = {
			'background': '#66CCCC',
			'textDecoration': 'none'
		}
		$target.attr('data-show', '0')

		$('#' + itemdata.id).find('.radius-in').css(style)
		$itemSortId.css(style)
		$itemSortId.prev().css('visibility', 'hidden')
		$('#item' + itemdata.id).css(style)

		for (var i = 0; i < $lis.length; i++) {
			var $li = $($lis[i])
			$li.attr('style', $li.attr('data-style'))
		}
		// 还原
		$rightName.removeClass().addClass($rightName.attr('data-class'))
		data_util.setDDItems(_dataid, { hide: false })
	}
}

/*=====================================点读位置相关JS逻辑事件 END=============================================*/

/*=====================二期，点读页上下移动，显示删除隐藏 START==========================*/
/**
 * 点读页上下移动,隐藏, 删除 等点击事件
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
function dianduPageOperator(e) {
	var $tar = self = $(e.target)
	var $bgItem = $(e.currentTarget).parentsUntil('.diandupageitem').parent()
	var sortIndex = parseInt($bgItem.attr('data-index')); // 下标

	switch ($tar.attr('class')) {
		case 'down':
			var _old = self.closest('.diandupageitem')
			var _new = self.closest('.diandupageitem').next().next()
			if (_new.length > 0) {
				var _temp = _old.html()
				_old.empty().append(_new.html())
				_new.empty().append(_temp)
			}
			ArrayUtil.nextItem(window.DD.items, 'sort', sortIndex)

			// 移动位置之后，需要重新绑定事件，和上传控件，否则会事件不起作用
			setUploadControl(sortIndex); // 重新设置上传控件
			setUploadControl(_new.data().index)
			bindDianDuPageEvent(); // 需要重新绑定事件
			break
		case 'up':
			var _old = self.closest('.diandupageitem')
			var _new = self.closest('.diandupageitem').prev().prev()
			if (_new.length > 0) {
				var _temp = _old.html()
				_old.empty().append(_new.html())
				_new.empty().append(_temp)
			}
			ArrayUtil.prevItem(window.DD.items, 'sort', sortIndex)
			setUploadControl(sortIndex)
			setUploadControl(_new.data().index)
			bindDianDuPageEvent()
			break
		case 'hide1':
			$tar.hide()
			$tar.next('.show1').show()
			$bgItem.find('._mask').show()
			break
		case 'show1':
			$tar.hide()
			$tar.prev('.hide1').show()
			$bgItem.find('._mask').hide()
			break
	}
}

/**
 * 删除点读页
 * @param  {[type]} id [description]
 * @return {[type]}    [description]
 */
function delDDItem(id) {
	var arr = window.DD.items
	for (var i = 0; i < arr.length; i++) {
		if (arr[i].id == id) {
			arr[i]['isRemove'] = true; // 标记删除
		}
	}
}

/*=====================二期，点读页上下移动，显示删除隐藏 END==========================*/

/**
 * 提交
 */
function handleSubmit(e) {
	var $cTar = $(e.currentTarget);

	var pagesInfo = data_util.getValidItems()

	var data = {
		title: $('#name').val(),
		saytext: $('#intro').val() || ' ',
		charge: $('input[type="radio"][name="chargeType"]:checked').val(),
		isprivate: $('input[type="radio"][name="permissionType"]:checked').val(),
		keywords: $('#keywords').val(),
		cost: $('#chargeStandard').val(),
		pic: $('input[name="pic"]').val(), // 缩略图地址, 多个用,隔开
		background: $('#file_btnAutoAudio_path').val(),
		bgFileName: $('#btnAutoAudio>span').text(),
		pages: pagesInfo.data,
		delPageIds: pagesInfo.delPageIds,
		point_size: GLOBAL.POINT_SIZE,
		back_color: GLOBAL.BACK_COLOR,
		data: JSON.stringify(
			{
				AUDIO_AREA_SETTING: GLOBAL.AUDIO_AREA_SETTING,
				globalAudioData: DD.globalAudioData
			})
	}

	if (pagesInfo.isDelGlobalAudio) {
		data.content = '{}'
	}

	if (data.title.trim() === '') {
		alert('点读页名称不能为空!')
		return
	}

	// 需要传给后台的参数
	data.teamid = teamid
	data.unitid = unitid
	data.userid = userid
	data.checked = 1 // 验证 是否审核通过

	// 如果是编辑页面,把当前id传给后端
	if (GLOBAL.ISEDIT.flag) {
		data.id = GLOBAL.ISEDIT.id
	}

	var qrcode = Util.getQueryStringByName('qrcode') || '' // 尹果要求加的参数

	if (data.pages.length === 0 || !data.pages[0]['pic']) {
		alert('至少需要有一个点读页!')
	} else {
		// 禁止重复提交
		if ($cTar.attr('data-flag') === '1') {
			console.warn('请勿重复提交...')
			return
		}
		$cTar.attr('data-flag', 1);
		Model.addDianduPage(data, qrcode, function (result) {
			// 开发环境，跳转地址
			if (window.location.href.indexOf('localhost') !== -1) {
				if (!GLOBAL.ISEDIT.flag) {
					window.location.href = window.location.href + '?id=' + result
				} else {
					window.location.reload()
				}
			} else {
				var msg = '创建成功,点击确定返回单元列表!'

				var returnUrl = '/edu/course/unit_video.php?unitid=' + data.unitid

				if (GLOBAL.ISEDIT.flag) {
					msg = '保存成功!点击确定返回展示页面!'
					// 注意，如果静态话页面的地址修改了，这里也要跟着修改地址
					returnUrl = '/point-read/' + id + '.html'
				}
				alert(msg)
				window.location.href = returnUrl
			}
		})
	}
}
