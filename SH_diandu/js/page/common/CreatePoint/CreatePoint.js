/***************************************************
 * 时间: 8/14/16 08:53
 * 作者: zhongxia
 * 说明: 生成point点的
 * 目前需要支持三种类型的点读点
 * 1. 常规点读点
 * 2. 创建页面，带有标题的点读点  
 * 3. 创建页面，自定义图片的点读点 
 * 4. 展示页面，自定义标题
 * 5. 展示页面，自定义图片
 ***************************************************/
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

	Util.loadCSS(getBasePath() + '/CreatePoint.css');
})()


window.CreatePoint = (function () {
	var currentScriptSrc = Util.getBasePath(document.currentScript.src);
	//带有标题的点读点类型样式, 音频,视频,图文, 考试
	var POINTTITLECLASS = {
		audio: 'create-point-title-audio',
		video: 'create-point-title-video',
		imgtext: 'create-point-title-imgtext',
		exam: 'create-point-title-exam'
	}

  /**
   * 生成 point
   * @param type 点读点类型
   * @param data 点读点的数据
   */
	function initPoint(type, data) {

    /** 
     * TODO: 单独把模板抽离出来，后期可以修改成这样 
     **/
		// Util.getTplById(currentScriptSrc + '/tpl.html', 'tpl_show_viewer3d', function (tpl) {
		//   var tpls = Handlebars.compile(tpl)
		// })

		var html = "";
		var pointId = data.pointId;
		var pointIndex = data.pointId && data.pointId.split('_')[1];
		var left = data.left || "";
		var top = data.top || "";
		var scale = data.scale || 1;  //缩放的比例, 主要在展示页面用
		var className = data.className; //展示页面  添加到点读点的样式
		var outHTML = data.outHTML; //[展示页面] 外部传进来的HTML,添加到点读点的div里面

		left = typeof (left) === 'number' ? left : left.replace('px', '');
		top = typeof (top) === 'number' ? top : top.replace('px', '');

		var title = data.title || {};
		var pic = data.pic || { src: '', color: '', colorSize: '' };  //自定义图片需要 图片地址,发光颜色,光圈大小

		var style = "position:absolute; left:" + left + "px; top :" + top + "px;";
		switch (type) {
			//常规点读点
			case 1:
				html = initNormalPoint(pointId, pointIndex, style);
				break;
			//带有标题的点读点
			case 2:
				html = initTitlePoint(pointId, style, title);
				break;
			//自定义图片的点读点
			case 3:
				html = initCustomImgPoint(pointId, style, pic)
				break;
			//展示页面  自定义标题[展示页面]
			case 4:
				html = initMTitlePoint(pointId, style, title, className, outHTML, scale)
				break;
			//展示页面  自定义图片[展示页面]
			case 5:
				html = initMCustomImgPoint(pointId, style, pic, className, outHTML, scale)
				break;
			// 创建页面 自定义绘制区域[展示页面]
			case 6:
				html = initDrawAreaPoint(pointId, style, data)
				break;
			default:
				html = initCustomImgPoint(pointId, pointIndex, style);
		}

		return html;
	}

  /**
   * 生成普通Point
   * @param pointId 点读点id
   * @param index 点读点下标
   * @param style 坐标样式
   */
	function initNormalPoint(pointId, pointIndex, style) {
		var html = [];
		html.push('<div data-type="point" id="' + pointId + '"  class="radius" style="' + style + '">');
		html.push('    <div class="radius-in">' + pointIndex + '</div>');
		html.push('</div>');
		return html.join('');
	}

  /**
   * 生成带有标题的point
   */
	function initTitlePoint(pointId, style, titleObj) {
		var title = titleObj.title;
		var pointType = titleObj.type || 'audio';
		var className = POINTTITLECLASS[pointType]

		var id = "";
		if (pointId) {
			id = 'data-id=' + pointId
		}
		var html = [];
		html.push('       <div id="' + pointId + '" data-type="point" ' + id + ' style="' + style + '" class="create-point-title">')
		html.push('         <div class="create-point-title-img ' + className + '"></div>')
		html.push('         <div class="create-point-title-line"></div>')
		html.push('         <div class="create-point-title-text">' + title + '</div>')
		html.push('       </div>')
		return html.join('');
	}


  /**
   * 生成自定义图片的point
   */
	function initCustomImgPoint(pointId, style, pic) {
		var html = [];
		var src = pic.src;
		var dropFilter = "drop-shadow(0px 0px " + pic.colorSize + "px " + pic.color + ")"

		style += 'background: url(' + src + ') no-repeat ;background-size: contain; background-position:center;';
		style += 'filter:' + dropFilter + ';-webkit-filter:' + dropFilter + ';';

		if (pic.w && pic.h) {
			var width = pic.w * 1200 / 1920;
			var height = pic.h * 1200 / 1920;
			style += 'width:' + width + 'px;height:' + height + 'px';
		}

		var id = "";
		if (pointId) {
			id = 'data-id=' + pointId
		}

		html.push('<div id="' + pointId + '" data-type="point" ' + id + '  style="' + style + '" class="create-point-img"></div>');
		return html.join('');
	}

  /**
   * [展示页面,移动端]生成带有标题的point
   * @param outClassName 外部传进来的样式
   */
	function initMTitlePoint(pointId, style, titleObj, outClassName, outHTML, scale) {
		var title = titleObj.title;
		var pointType = outClassName.replace('m-', '');
		var className = POINTTITLECLASS[pointType]

		//缩放,并且使用左上角为缩放的  起始点
		if (scale !== 1) {
			style += 'transform: scale(' + scale + '); transform-origin:left top;-webkit-transform: scale(' + scale + '); -webkit-transform-origin:left top;';
		}

		var id = "";
		if (pointId) {
			id = 'data-id=' + pointId
		}

		var html = [];
		html.push('       <div data-type="point" ' + id + ' style="' + style + '" class="create-point-title ' + outClassName + '">')
		html.push('         <div class="create-point-title-img ' + className + '">')
		html.push(outHTML)
		html.push('         </div>')
		html.push('         <div class="create-point-title-line"></div>')
		html.push('         <div class="create-point-title-text">' + title + '</div>')
		html.push('       </div>')
		return html.join('');
	}

  /**
   * [展示页面,移动端]生成自定义图片的point
   * @param outClassName 外部传进来的样式
   */
	function initMCustomImgPoint(pointId, style, pic, outClassName, outHTML, scale) {
		var html = [];
		var src = pic.src;
		var dynamic = pic.dynamic;  //动态图是否只展示第一帧,true 是，false 否
		var dynamicAttr = ''
		if (dynamic) {
			dynamicAttr = 'data-src="' + src + '" data-dynamic="' + dynamic + '"';
		}

		var dropFilter = "drop-shadow(0px 0px " + pic.colorSize + "px " + pic.color + ")"
		style += 'border-radius:0;background: url(' + src + ') no-repeat ;background-size: contain; background-position:center;';
		style += 'filter:' + dropFilter + ';-webkit-filter:' + dropFilter + ';';

		if (pic.w && pic.h) {
      /**
       * 1200/1920*scale 按1920的比例缩放计算显示需要多大.
       * scale 是 移动端 针对 创建页面 1200 缩放的比例
       */
			var width = pic.w * 1200 / 1920 * scale;
			var height = pic.h * 1200 / 1920 * scale;
			style += 'width:' + width + 'px;height:' + height + 'px';
		}

		var id = "";
		if (pointId) {
			id = 'data-id=' + pointId
		}

		html.push('<div ' + dynamicAttr + ' data-filter="' + dropFilter + '"  data-type="pointImg" ' + id + '  style="' + style + '" class="content-center create-point-img ' + outClassName + '">' + outHTML + '</div>');
		return html.join('');
	}

  /**
   * 创建页面，自定义绘制区域[没用到,直接写在show.js里面了]
   */
	function initDrawAreaPoint(pointId, style, data) {
		var drawAreaData = data.drawAreaData || {}
		if (drawAreaData.w && drawAreaData.h) {
			var width = drawAreaData.w * data.w;
			var height = drawAreaData.h * data.h;
			style += 'width:' + width + 'px;height:' + height + 'px';
		}
		return '<div id="' + pointId + '" data-type="drawcustomarea"  style="' + style + '" class="draw-area-container draw-custom-area__' + drawAreaData.pointType + '"></div>'
	}

	return {
		initPoint: initPoint
	}
})();
