/**
 * TODO：问题
 * 1. 保存数据,接口,关联到 创建页面中去   ok
 * 2. 图片缩放后移动                   ok
 * 3. 展示页面,逻辑编写                还差隐藏图片位置，刚进入页面的时候闪烁
 * 4. 编辑功能实现
 * 5. 开关触发区功能实现                ok
 */

/***************************************************
 * 时间: 11/9/16 22:45
 * 作者: zhongxia
 * 说明: 开关图模板
 ***************************************************/

// 加载依赖的脚本和样式
;(function () {
  /**
   * 获取当前脚本的目录
   * @returns {string}
   */
  function getBasePath() {
    // 兼容Chrome 和 FF
    var currentPath = document.currentScript && document.currentScript.src || ''
    var paths = currentPath.split('/')
    paths.pop()
    return paths.join('/')
  }

  Util.loadCSS(getBasePath() + '/onoffimg.css')
})()

//======================================MAIN==============================================

var OnOffImg = function (selector, data, fn_submit) {
  var that = this
  this.scaleWH = 550 / 1200;   //和创建页面背景页大小的比例
  this.basePath = 'uploads/'
  this.setUploadify = _upload && _upload.setUploadify
  this.addImageId = 'on-off-img-addImage'
  this.switchCount = 0
  this.switchId = 'switchImg'
  this.submitData = {img: {}, mp3: {}, switchArea: []}; // 提交的数据

  this.selector = selector || 'body'
  this.tpl = [
    '<div class="on-off-img-modal" data-id="{{id}}">',
    '   <div class="on-off-img-mask"></div>',
    '   <div class="on-off-img">',
    '       <div class="on-off-img-top">',
    '           <span>开关图设置</span>',
    '           <span class="glyphicon glyphicon-remove on-off-img-close" aria-hidden="true"></span>',
    '       </div>',
    '       <div class="on-off-img-resize">',
    '         ',
    '       </div>',
    '       <div class="on-off-img-content">',
    '           <div class="on-off-img-upload">',
    '              <div class="on-off-img-unupload"> 请点击上传开关图片(建议背景透明的开关图片)',
    '                 <input class="upload-input" type="file" id="on-off-img-{{id}}" name="upload" class="fileupload"/>',
    '             </div>',
    '              <div class="on-off-img-uploaded">',
    '                 <div class="on-off-img-filename"></div>',
    '                 <div class="on-off-img-download"></div>',
    '             </div>',
    '           </div>',
    '           <div class="on-off-img-bg" style="background-image:url({{bg.bgPath}})">',
    '             <div class="on-off-img-add">增加开关触发区域</div>',
    '           </div>',
    '       </div>',
    '       <div class="on-off-p">',
    '         <label class="on-off-hide-area"><input class="on-off-checkbox js-hide-area" type="checkbox"/>取消触发区</label>',
    '         <label class="on-off-default-show"><input class="on-off-checkbox js-default-show" type="checkbox"/>图片初始为显示状态</label>',
    '       </div>',
    '       <div class="on-off-mp3-upload">',
    '         <div class="on-off-mp3-unupload"> 上传配音(可选,限mp3格式)',
    '           <input class="upload-input" type="file" id="on-off-mp3-{{id}}" name="upload" class="fileupload"/>',
    '         </div>',
    '         <div class="on-off-mp3-uploaded">',
    '            <div class="on-off-mp3-filename"></div>',
    '            <div class="on-off-mp3-download"></div>',
    '         </div>',
    '       </div>',
    '       <div class="on-off-img-bottom">',
    '          <div class="on-off-img-btn"> 提交</div>',
    '       </div>',
    '   </div>',
    '</div>'
  ].join('')
  this.data = data || {};
  this.fn_submit = fn_submit;
  this.imgList = []; // 上传的图片列表

  // 隐藏
  this.hide = function () {
    that.$modal.remove();
  }

  // 展示
  this.show = function () {
    that.$modal.show()
  }

  // 下载图片,TODO:目前只是打开,最好改成下载
  this.download = function () {
    window.open(that.submitData.img.path)
  }

  //下载mp3
  this.downloadMp3 = function () {
    window.open(that.submitData.mp3.path)
  }

  /**
   * 增加开关位置
   * @param $parent 放开关的容器
   * @param resizeCallback 改变开关大小的移动回调
   */
  this.addSwitch = function ($parent, resizeCallback) {
    var id = this.switchId + this.switchCount++;
    var resizeId = this.switchId + this.switchCount + 'resize'
    var $switchImg = $('<div id="' + id + '" class="on-off-img-switchImg">触发区<div id="' + resizeId + '" class="on-off-img-switch-resize"></div></div>')
    $parent.append($switchImg)
    new Drag('#' + id)
    new Drag('#' + resizeId, function (x, y) {
      resizeCallback && resizeCallback($switchImg, $('#' + resizeId), x, y)
    }, true)
  }

  /**
   * 增加隐藏图片
   * @param $parent
   * @param callback
   */
  this.addHideImg = function ($parent, path, callback) {
    var that = this
    var $divImg = $('<div>')
    $divImg.css({backgroundImage: 'url(' + path + ')'})
    $divImg.addClass('on-off-img-addImage')
    $divImg.attr('id', this.addImageId)

    $parent.append($divImg)
    new Drag('#' + this.addImageId, function (x, y) {
      callback && callback(x, y)
    })

    Util.getImageWH(path, function (wh) {
      var w = 550 / 1920 * wh.w
      var h = 550 / 1920 * wh.h
      $divImg.css({width: w, height: h})

      that.submitData.img.w = wh.w
      that.submitData.img.h = wh.h
      that.submitData.img.scaleW = w / that.$onOffBg.width();
    })
  }

  this.parsePx2Int = function (px) {
    if (!px)
      return 0;
    return parseFloat(px.replace('px', '')) || 0
  }

  /**
   * 开关区域移动的回调事件
   * @param $parent 需要移动的节点
   * @param $target 拖动的节点
   * @param x
   * @param y
   */
  this._resizeHandler = function ($parent, $target, x, y) {
    var newX = x - that.parsePx2Int($target.css('left'))
    var newY = y - that.parsePx2Int($target.css('top'))
    $parent.css({
      width: $parent.width() + newX,
      height: $parent.height() + newY
    })
  }

  /**
   * 提交
   */
  this.submit = function () {
    var bgW = that.$onOffBg.width()
    var bgH = that.$onOffBg.height()

    var $hideImg = $('#' + that.addImageId)
    that.submitData.img.x = that.parsePx2Int($hideImg.css('left')) / bgW
    that.submitData.img.y = that.parsePx2Int($hideImg.css('top')) / bgH
    that.submitData.img.x = that.submitData.img.x.toFixed(2)
    that.submitData.img.y = that.submitData.img.y.toFixed(2)

    var $switchBtns = $('.on-off-img-switchImg')
    if ($switchBtns.length && $switchBtns.length > 0) {
      for (var i = 0; i < $switchBtns.length; i++) {
        var $switch = $switchBtns.eq(i)
        var x = that.parsePx2Int($switch.css('left')) / bgW
        var y = that.parsePx2Int($switch.css('top')) / bgH

        x = x.toFixed(2)
        y = y.toFixed(2)

        var scaleW = ($switch.width() / bgW).toFixed(2)
        var scaleH = ($switch.height() / bgH).toFixed(2)
        that.submitData.switchArea.push({x: x, y: y, scaleW: scaleW, scaleH: scaleH})
      }
    }
    that.data.img = that.data.img || {}
    that.submitData.img.scale = that.submitData.img.scale || that.data.img.scale || 1;

    that.submitData.img.defaultShow = that.$cbkDefaultShow[0].checked
    that.submitData.hideSwitchArea = that.$cbkHideArea[0].checked

    that.fn_submit && that.fn_submit(that.submitData)

    //提交后移除
    that.hide();
  }

  return this
}

/**
 * 初始化组件
 * @returns {OnOffImg}
 */
OnOffImg.prototype.init = function () {
  var that = this
  this.$container = $(this.selector)

  $(this.selector).append(this.initTpl())

  // 初始化放大小缩小组件
  this.cNumber = new CNumber(this.selector + ' .on-off-img-resize', {
    val: 100,
    step: 1,
    maxValue: 400,
    canInput: true,
    callback: function (val) {
      var size = val / 100
      that.$modal.find('#' + that.addImageId).css({transform: 'scale(' + size + ')'})
      that.submitData.img.scale = size
    }
  })

  this.$modal = this.$container.find('.on-off-img-modal')
  this.$close = $('.on-off-img-modal .on-off-img-close')
  this.$submitBtn = $('.on-off-img-modal .on-off-img-btn')
  this.$textarea = this.$modal.find('._content')
  this.$input = this.$modal.find('._title')
  this.$img = this.$modal.find('._img')
  this.$fileName = this.$modal.find('.on-off-img-filename')
  this.$download = this.$modal.find('.on-off-img-download')
  this.$uploadBtn = this.$modal.find('.on-off-img-unupload')
  this.$fileInfo = this.$modal.find('.on-off-img-uploaded')

  this.$fileNameMp3 = this.$modal.find('.on-off-mp3-filename')
  this.$downloadMp3 = this.$modal.find('.on-off-mp3-download')
  this.$uploadBtnMp3 = this.$modal.find('.on-off-mp3-unupload')
  this.$fileInfoMp3 = this.$modal.find('.on-off-mp3-uploaded')

  this.$resizeNumber = this.$modal.find('.on-off-img-resize')
  this.$addOnOff = this.$modal.find('.on-off-img-add')
  this.$onOffBg = this.$modal.find('.on-off-img-bg')

  this.$cbkHideArea = this.$modal.find('.js-hide-area')
  this.$cbkDefaultShow = this.$modal.find('.js-default-show')

  this.$onOffBg.css({width: this.scaleWH * this.data.bg.w, height: this.scaleWH * this.data.bg.h})

  this.bindEvent()

  //刚进来先设置值,如果是编辑就把数据展示出来
  this.setData(this.data);

  return this
}

/**
 * 初始化模板
 */
OnOffImg.prototype.initTpl = function () {
  var tpl = this.tpl
  var tpls = Handlebars.compile(tpl)
  return tpls(this.data)
}

/**
 * 设置数据
 */
OnOffImg.prototype.setData = function (data) {
  //进来就有值,则是编辑
  if (data && data.img && data.img.path) {
    var bgW = this.$onOffBg.width()
    var bgH = this.$onOffBg.height()
    var imgData = data.img || {};
    var mp3Data = data.mp3 || {};
    var switchArea = data.switchArea || [];

    this.uploadImgCallback(imgData.path, imgData.name)
    this.uploadMp3Callback(mp3Data.path, mp3Data.name)

    $('#' + this.addImageId).css({
      left: parseFloat(imgData.x) * bgW,
      top: parseFloat(imgData.y) * bgH,
      transform: 'scale(' + (parseFloat(imgData.scale)) + ')'
    })

    this.cNumber.setVal(parseFloat(imgData.scale) * 100)

    for (var i = 0; i < switchArea.length; i++) {
      if (i >= 1) {
        this.addSwitch(this.$onOffBg, this._resizeHandler);
      }
      $('#' + this.switchId + i).css({
        left: parseFloat(switchArea[i].x) * bgW,
        top: parseFloat(switchArea[i].y) * bgH,
        width: parseFloat(switchArea[i].scaleW) * bgW,
        height: parseFloat(switchArea[i].scaleH) * bgH
      })
    }


    var hideSwitchArea = data.hideSwitchArea || false
    this.$cbkDefaultShow.attr('checked', imgData.defaultShow || false)
    this.$cbkHideArea.attr('checked', hideSwitchArea)
    if (hideSwitchArea) {
      $('.on-off-img-switchImg').hide()
    }
  }
}

/**
 * 绑定点击事件
 */
OnOffImg.prototype.bindEvent = function () {
  var that = this
  this.$close.off('click', this.hide).on('click', this.hide)
  this.$submitBtn.off('click', this.submit).on('click', this.submit)

  this.$download.off('click', this.download).on('click', this.download)
  this.$downloadMp3.off('click', this.downloadMp3).on('click', this.downloadMp3)

  //初始化uploadify组件,上传图片
  this.setUploadify($('#on-off-img-' + this.data.id), {
    width: '48px',
    height: '48px',
    onUploadSuccess: function (file, result, response) {
      that.uploadImgCallback(result, file.name)
    }
  })

  //初始化uploadify组件,上传mp3音效
  this.setUploadify($('#on-off-mp3-' + this.data.id), {
    width: '48px',
    height: '48px',
    fileTypeDesc: 'Audio Files',
    fileTypeExts: '*.mp3',
    onUploadSuccess: function (file, result, response) {
      that.uploadMp3Callback(result, file.name)
    }
  })

  //添加触发区
  this.$addOnOff.off().on('click', function () {
    that.addSwitch(that.$onOffBg, that._resizeHandler)
  })

  //取消触发区 复选框 改变事件
  this.$cbkHideArea.off().on('change', function (e) {
    if (e.target.checked) {
      $('.on-off-img-switchImg').hide()
    } else {
      $('.on-off-img-switchImg').show()
    }
  })
}

/**
 * 生成开关图片,和隐藏区域
 * @param path 开关触发区
 */
OnOffImg.prototype.addImg = function (path) {
  var that = this;
  that.addHideImg(that.$onOffBg, path);
  that.addSwitch(that.$onOffBg, that._resizeHandler);
}

/**
 * 隐藏图上传成功的回调
 * @param path
 * @param filename
 */
OnOffImg.prototype.uploadImgCallback = function (path, filename) {
  if (path) {
    this.$uploadBtn.hide();
    this.$fileInfo.show();
    this.$resizeNumber.show();
    this.$addOnOff.show();
    this.$fileName.text(filename);

    this.submitData.img.name = filename;
    this.submitData.img.path = path;

    this.addImg(path);
  }
}

/**
 * 上传mp3音效的回调
 * @param path
 * @param filename
 */
OnOffImg.prototype.uploadMp3Callback = function (path, filename) {
  if (path) {
    this.$uploadBtnMp3.hide();
    this.$fileInfoMp3.show();
    this.$fileNameMp3.text(filename);

    this.submitData.mp3.name = filename;
    this.submitData.mp3.path = path;
  }
}