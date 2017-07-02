/***************************************
 * uploadify 相关的方法
 ***************************************/
window._upload = (function () {
  /**
   * 设置input file 标签，使用 uploadify 插件
   * @param {[type]}  $file   [file文件标签的Jquery对象]
   * @param {Boolean} isSetWH [是否设置寛高，上传MP4，MP3等]
   * @param {[type]}  success [成功回调函数]
   * @param {[type]}  error   [失败回调函数]
   */
	function setUploadify($file, config) {
		var defaultConfig = {
			width: 100,
			height: 30,
			auto: true, // 关闭自动上传
			removeTimeout: 1, // 文件队列上传完成1秒后删除
			swf: 'js/lib/uploadify/uploadify.swf',
			uploader: 'php/uploadify.php',
			method: 'post', // 方法，服务端可以用$_POST数组获取数据
			buttonText: '', // 设置按钮文本
			multi: true, // 允许同时上传多张图片
			uploadLimit: 100, // 一次最多只允许上传100张图片
			fileTypeDesc: 'Image Files',
			fileTypeExts: '*.gif;*.jpg;*.png;*.jepg',
			fileSizeLimit: '2GB', // 限制上传的图片不得超过约等于2G
			onUploadSuccess: function (file, data, response) { // 每次成功上传后执行的回调函数，从服务端返回数据到前端
			},
			onError: function (event, queueId, fileObj, errObj) {
				Logger.log('upload error', event)
			}
		}
		// 合并参数
		config = $.extend({}, defaultConfig, config)
		$file.uploadify(config)
	}

  /**
   * 初始化 webuploader 组件
   */
	function initWebUpload(id, config) {
		var $progress = $('#file__progress' + config.id);
		var defaultConfig = {
			server: 'php/fileupload.php',
			pick: {
				id: id,
				label: config.label || '',
				multiple: config.multiple || false,
			},
			accept: {
				title: config.fileTypeDesc || 'Images',
				extensions: config.extensions || '',
				mimeTypes: config.fileTypeExts || 'image/png,image/jpg,image/gif,image/jpeg'
			},
			auto: true,
			threads: 1,
			chunked: false,
			duplicate: true,
			fileSingleSizeLimit: 1024 * 1024 * 500,
			onUploadProgress: function (file, percentage) {
				if ($progress) {
					$progress.show()
					var percent = parseInt(percentage * 100);
					$progress.text(percent + '%')
					$progress.css('width', percent + '%')
				}
			},
			onUploadComplete: function () {
				if ($progress) {
					$progress.hide()
				}
			}
		};

		// 合并参数
		config = $.extend({}, defaultConfig, config);
		window.WebUploader.create(config)
	}

	return {
		setUploadify: setUploadify,
		initWebUpload: initWebUpload
	}
})()
