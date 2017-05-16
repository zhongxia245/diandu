/**
 * 提供一些常用工具
 * @type {{getImageWH, getQueryStringByName}}
 */
window.Util = (function () {
  /**
   * 根据URL,获取图片的宽高
   * @param src 图片地址
   * @param callback 回调,返回 w  h 属性
   */
	function getImageWH(src, callback) {
		var image = new Image();
		image.src = src;
		image.onload = function () {
			var obj = {
				w: image.width,
				h: image.height
			}
			callback && callback(obj);
		};
	}

  /**
   * 根据URL,获取视频的宽高
   * @param src 视频地址
   * @param callback 获取后的回调
   */
	function getVideoWH(src, callback) {
		var video = document.createElement('video')
		video.setAttribute('src', src);
		video.oncanplaythrough = function () {
			var obj = {
				w: this.videoWidth,
				h: this.videoHeight
			}
			callback && callback(obj);
			video = null;
		};
	}

  /**
   * 根据QueryString参数名称获取值
   * @param  {[type]} key [key]
   */
	function getQueryStringByName(key) {
		var result = location.search.match(new RegExp("[\?\&]" + key + "=([^\&]+)", "i"));
		if (result == null || result.length < 1) {
			return "";
		}
		return result[1];
	}

  /**
   * 关闭浏览器窗口
   * @constructor
   */
	function closeWebPage() {
		var userAgent = navigator.userAgent;
		if (userAgent.indexOf("Firefox") != -1 || userAgent.indexOf("Chrome") != -1) {
			window.location.href = "about:blank";
			window.opener = null;
			window.open("", "_self");
			window.close();
		} else {
			window.opener = null;
			window.open("", "_self");
			window.close();
		}
	}

  /**
   * 鼠标是点击或者移动
   * @param selector
   * @param cb_tap
   * @param cb_move
   */
	function Moblie_MoveOrTap($selector, cb_tap, cb_move) {
		var flag = false;
		$selector.off().on('touchstart touchmove touchend', function (event) {
			switch (event.type) {
				case 'touchstart':
					flag = false;
					break;
				case 'touchmove':
					flag = true;
					break;
				case 'touchend':
					if (!flag) {
						cb_tap && cb_tap(event);
					} else {
						cb_move && cb_move(event);
					}
					break;
			}
		})
	}


  /**
   * 判断是否是ＰＣ端
   */
	function IsPC() {
		var userAgentInfo = navigator.userAgent;
		var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
		var flag = true;
		for (var v = 0; v < Agents.length; v++) {
			if (userAgentInfo.indexOf(Agents[v]) > 0) {
				flag = false;
				break;
			}
		}
		return flag;
	}

  /**
   * 根据 ids 获取数据 (ids : 1_1)
   * @param data
   * @param ids
   */
	function getPointDataByIds(data, ids) {
		var _ids = ids.split('_');
		var pages = data.pages;
		var pointsData = pages[_ids[0]]['points'];
		return pointsData[_ids[1]];
	}

  /**
   * 加载样式
   * @param path
   */
	function loadCSS(path) {
		if (!path || path.length === 0) {
			throw new Error('argument "path" is required !');
		}
		var head = document.getElementsByTagName('head')[0];
		var link = document.createElement('link');
		link.href = path;
		link.rel = 'stylesheet';
		link.type = 'text/css';
		head.appendChild(link);
	}

  /**
   * 加载脚本
   * @param path
   */
	function loadJS(path) {
		if (!path || path.length === 0) {
			throw new Error('argument "path" is required !');
		}
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');
		script.src = path;
		script.type = 'text/javascript';
		head.appendChild(script);
	}

  /**
   * 获取当前脚本文件路径
   * @param {any} currentPath 
   * @returns 
   */
	function getBasePath(currentPath) {
		// 兼容Chrome 和 FF
		var currentPath = currentPath || ''
		var paths = currentPath.split('/')
		paths.pop()
		return paths.join('/')
	}

  /**
   * 检查样式里面是否存在某个样式名
   * @param string className 
   * @param array  not_allow_drag_class
   */
	function hasClass(className, not_allow_drag_class) {
		if (!not_allow_drag_class) not_allow_drag_class = []
		if (!className) className = ''

		for (var i = 0; i < not_allow_drag_class.length; i++) {
			if (className.indexOf(not_allow_drag_class[i]) !== -1) {
				return true;
			}
		}
		return false;
	}

  /**
   * 移动端拖动
   * @param selector
   */
	function touchDrag(selector, callback, not_allow_drag_class) {
		var moveX, moveY, startX, startY, left = 0, top = 0;

		$(selector)
			.on("touchstart", function (event) {
				if (!hasClass($(event.target).attr('class'), not_allow_drag_class)) {
					event.preventDefault();
					var touchPros = event.touches[0];
					startX = touchPros.clientX;
					startY = touchPros.clientY;

					if ($(selector).css('left') !== 'auto') {
						left = parseFloat($(selector).css('left').replace('px', '').replace('rem', ''))
						top = parseFloat($(selector).css('top').replace('px', '').replace('rem', ''))
					}
				}
			})
			.on("touchmove", function (event) {
				if (!hasClass($(event.target).attr('class'), not_allow_drag_class)) {
					event.preventDefault();

					var touchPros = event.touches[0];
					moveX = touchPros.clientX - startX + left;
					moveY = touchPros.clientY - startY + top;
					if (callback) callback(event, moveX, moveY)
				}
			})
	}

  /**
   * PC端拖动
   * @param selector
   * @param callback
   * @param not_allow_drag_class 点击selector里面的字节点，一些子节点点击不允许拖动
   */
	function mouseDrag(selector, callback, not_allow_drag_class) {
		var moveX, moveY, startX, startY, left = 0, top = 0, flag = false;

		$(selector)
			.on("mousedown", function (event) {
				if (!hasClass($(event.target).attr('class'), not_allow_drag_class)) {
					event.preventDefault();
					startX = event.clientX;
					startY = event.clientY;

					if ($(selector).css('left') !== 'auto') {
						left = parseFloat($(selector).css('left').replace('px', '').replace('rem', ''))
						top = parseFloat($(selector).css('top').replace('px', '').replace('rem', ''))
					}
					flag = true;

					$(document)
						.on("mousemove", function (event) {
							event.preventDefault();
							if (flag) {
								moveX = event.clientX - startX + left;
								moveY = event.clientY - startY + top;

								callback(event, moveX, moveY)
							}
						})
						.on('mouseup', function () {
							flag = false;
						})
				}
			})
	}

  /**
   * 兼容PC和移动端的拖动
   */
	function drag(selector, callback, not_allow_drag_class) {
		mouseDrag(selector, callback, not_allow_drag_class);
		touchDrag(selector, callback, not_allow_drag_class);
	}

  /**
   * 把图片转换成base64的数据格式
   * gif图会变成静态图
   * @param {any} path 
   * @param {any} callback 
   */
	function getImageBase64(path, callback) {
		var canvas = document.createElement('canvas');

		var ctx = canvas.getContext("2d");
		var img = new Image();
		//指定图片的URL
		img.src = path;
		img.onload = function (e) {
			var width = e.target.width;
			var height = e.target.height;
			canvas.width = width;
			canvas.height = height;

			ctx.drawImage(img, 0, 0, width, height);
			var cropStr = canvas.toDataURL("image/png", 0.7)
			callback(cropStr)
		}
	}

  /**
   * 获取模板
   * @param {any} url 
   * @param {any} callback 
   */
	function getTpl(url, callback) {
		$.ajax({
			url: url,
			success: function (tpl) {
				callback(tpl)
			}
		})
	}

  /**
   * 从模板文件获取指定的模板（一个文件中有多个模板）
   * @param {any} url 模板地址
   * @param {string} id 模板的id
   * @param {any} callback 
   */
	function getTplById(url, id, callback) {
		$.ajax({
			url: url,
			success: function (tpl) {
				var sub_tpl = $('<div></div>').html(tpl).find('#' + id).html()
				callback(sub_tpl)
			}
		})
	}


  /**
   * 绘制区域的时候使用，避免绘制图形后还触发点击事件
   * 鼠标拖动还是点击
   * @param {any} selector 
   * @param {any} onClick 
   * @param {any} onMove 
   */
	function MoveOrClick(selector, onClick, onMove) {
		var Mouse = {
			x: 0,
			y: 0,
			mousedown: function (event) {
				Mouse.y = event.clientY;
				Mouse.x = event.clientX;
			},
			mouseup: function (event) {
				if (event.clientX != Mouse.x || event.clientY != Mouse.y) {
					if (onMove) {
						onMove(event);
					}
				} else {
					console.log('click');
					if (onClick) {
						onClick(event)
					}
				}
			}
		}
		$('body').on('mousedown', selector, Mouse.mousedown)
		$('body').on('mouseup', selector, Mouse.mouseup);
	}

	/*16进制颜色转为RGB格式*/
	String.prototype.colorRgb = function (sColor) {
		var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
		sColor = this.toLowerCase();
		if (sColor && reg.test(sColor)) {
			if (sColor.length === 4) {
				var sColorNew = "#";
				for (var i = 1; i < 4; i += 1) {
					sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
				}
				sColor = sColorNew;
			}
			//处理六位的颜色值
			var sColorChange = [];
			for (var i = 1; i < 7; i += 2) {
				sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
			}
			return "RGB(" + sColorChange.join(",") + ")";
		} else {
			return sColor;
		}
	};

  /**
   * 把16进制颜色转换成rgba的颜色
   * #000000 + 0.5 = rgba(0,0,0,0.5)
   * @param {any} colorStr 
   * @param {any} opacity 
   * @returns 
   */
	function hex2RGBA(colorStr, opacity) {
		var rgb = colorStr || '#000000';
		var a = opacity || 0;
		var matches = rgb.match(/#([\da-f]{2})([\da-f]{2})([\da-f]{2})/i);
		var rgba = 'rgba(' + matches.slice(1).map(function (m) { return parseInt(m, 16); }).concat(a) + ')';
		return rgba;
	}

	/**
	 * 把数字转换成时间
	 * eg: 81  => 01:21
	 * @param {any} num 
	 */
	function num2time(num) {
		var minute = parseInt(num / 60);
		var seconds = num - 60 * minute
		if (minute < 10) {
			minute = '0' + minute
		}
		if (seconds < 10) {
			seconds = '0' + seconds
		}
		return minute + ':' + seconds
	}

	/**
	 * 把时间字符串转换成数字
	 * 01:21 => 81
	 * @param {any} timeStr 
	 */
	function time2num(timeStr) {
		if (!timeStr) {
			return null
		}
		var time = 0;
		var _times = timeStr.split(':');

		//把 00:01:21计算成秒  81
		var _timesLength = _times.length - 1
		for (var j = _timesLength; j >= 0; j--) {
			var _time = parseInt(_times[_timesLength - j]) || 0;
			switch (j) {
				case 2:
					time += _time * 3600;
					break;
				case 1:
					time += _time * 60;
					break;
				case 0:
					time += _time;
					break;
			}
		}
		return time;
	}

	/**
	 * 全屏功能参考
	 * http://www.cnblogs.com/mq0036/p/5042871.html
	*/
	function requestFullScreen(element) {
		// 判断各种浏览器，找到正确的方法
		var requestMethod = element.requestFullScreen || //W3C
			element.webkitRequestFullScreen ||    //Chrome等
			element.mozRequestFullScreen || //FireFox
			element.msRequestFullScreen; //IE11
		if (requestMethod) {
			requestMethod.call(element);
		}
		else if (typeof window.ActiveXObject !== "undefined") {//for Internet Explorer
			var wscript = new ActiveXObject("WScript.Shell");
			if (wscript !== null) {
				wscript.SendKeys("{F11}");
			}
		}
	}

	//退出全屏 判断浏览器种类
	function exitFullScreen() {
		// 判断各种浏览器，找到正确的方法
		var exitMethod = document.exitFullscreen || //W3C
			document.mozCancelFullScreen ||    //Chrome等
			document.webkitExitFullscreen || //FireFox
			document.webkitExitFullscreen; //IE11
		if (exitMethod) {
			exitMethod.call(document);
		}
		else if (typeof window.ActiveXObject !== "undefined") {//for Internet Explorer
			var wscript = new ActiveXObject("WScript.Shell");
			if (wscript !== null) {
				wscript.SendKeys("{F11}");
			}
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

	/**
	 * 获取手机系统和浏览器类型 
	 */
	function getBrowserInfo() {
		var browser = {
			versions: function () {
				var u = navigator.userAgent,
					app = navigator.appVersion;
				return {
					trident: u.indexOf('Trident') > -1, //IE内核
					presto: u.indexOf('Presto') > -1, //opera内核
					webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
					gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1,//火狐内核
					mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
					ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
					android: u.indexOf('Android') > -1 || u.indexOf('Adr') > -1, //android终端
					iPhone: u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器
					iPad: u.indexOf('iPad') > -1, //是否iPad
					webApp: u.indexOf('Safari') == -1, //是否web应该程序，没有头部与底部
					weixin: u.indexOf('MicroMessenger') > -1, //是否微信 （2015-01-22新增）
					qq: u.match(/\sQQ/i) == " qq" //是否QQ
				};
			}(),
			language: (navigator.browserLanguage || navigator.language).toLowerCase()
		}
		return browser.versions
	}

	return {
		getImageWH: getImageWH,
		getVideoWH: getVideoWH,
		getQueryStringByName: getQueryStringByName,
		closeWebPage: closeWebPage,
		Moblie_MoveOrTap: Moblie_MoveOrTap,
		IsPC: IsPC,
		getPointDataByIds: getPointDataByIds,
		loadCSS: loadCSS,
		loadJS: loadJS,
		getBasePath: getBasePath,
		touchDrag: touchDrag,
		mouseDrag: mouseDrag,
		drag: drag,
		getImageBase64: getImageBase64,
		getTpl: getTpl,
		getTplById: getTplById,
		MoveOrClick: MoveOrClick,
		hex2RGBA: hex2RGBA,
		num2time: num2time,
		time2num: time2num,
		requestFullScreen: requestFullScreen,
		exitFullScreen: exitFullScreen,
		setAudioSource: setAudioSource,
		getBrowserInfo: getBrowserInfo
	}
})()

