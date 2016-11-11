/**
 * TODO：问题
 * 1. 保存数据,接口,关联到 创建页面中去
 * 2. 图片缩放后移动
 * 3. 展示页面,逻辑编写
 * 4. 编辑功能实现
 * 5. 开关触发区功能实现
 */

/***************************************************
 * 时间: 11/9/16 22:45
 * 作者: zhongxia
 * 说明: 开关图模板
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

  Util.loadCSS(getBasePath() + '/onoffimg.css');
})()


var OnOffImg = function (selector, data, fn_submit) {
  data = data || {id: 1, bgPath: 'uploads/f15247fa230c653f37b290133135f2d2.jpg'}
  var that = this;
  this.basePath = "uploads/";
  this.setUploadify = _upload && _upload.setUploadify;
  this.addImageId = "on-off-img-addImage";
  this.switchCount = 0;
  this.switchId = 'switchImg';
  this.submitData = {img: {}, switchArea: []}; //提交的数据

  this.selector = selector || "body";
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
    '           <div class="on-off-img-bg" style="background-image:url({{bgPath}})">',
    '             <div class="on-off-img-add">增加开关触发区域</div>',
    '           </div>',
    '       </div>',
    '       <div class="on-off-img-bottom">',
    '          <div class="on-off-img-btn"> 提交</div>',
    '       </div>',
    '   </div>',
    '</div>'
  ].join('');
  this.data = data;
  this.fn_submit = fn_submit;
  this.imgList = [];  //上传的图片列表

  //提交
  this.submit = function () {
    that.hide();
    var bgW = that.$onOffBg.width();
    var bgH = that.$onOffBg.height();

    var $hideImg = $('#' + that.addImageId);
    that.submitData.img.x = that.parsePx2Int($hideImg.css('left')) / bgW;
    that.submitData.img.y = that.parsePx2Int($hideImg.css('top')) / bgH;
    that.submitData.img.x = that.submitData.img.x.toFixed(2);
    that.submitData.img.y = that.submitData.img.y.toFixed(2);


    var $switchBtns = $('.on-off-img-switchImg');
    if ($switchBtns.length && $switchBtns.length > 0) {
      for (var i = 0; i < $switchBtns.length; i++) {
        var $switch = $switchBtns.eq(i);
        var x = that.parsePx2Int($switch.css('left')) / bgW;
        var y = that.parsePx2Int($switch.css('top')) / bgH;

        x = x.toFixed(2);
        y = y.toFixed(2);

        var scaleW = ($switch.width() / bgW).toFixed(2);
        var scaleH = ($switch.height() / bgH).toFixed(2);
        that.submitData.switchArea.push({x: x, y: y, scaleW: scaleW, scaleH: scaleH})
      }
    }

    that.fn_submit && that.fn_submit(that.submitData);
  }

  //隐藏
  this.hide = function () {
    that.$modal.hide();
  }

  //展示
  this.show = function () {
    that.$modal.show();
  }

  //下载图片,TODO:目前只是打开,最好改成下载
  this.download = function () {
    window.open(that.data.submitData.img.path)
  }

  /**
   * 增加开关位置
   * @param $parent 放开关的容器
   * @param resizeCallback 改变开关大小的移动回调
   */
  this.addSwitch = function ($parent, resizeCallback) {
    var id = this.switchId + this.switchCount;
    var resizeId = this.switchId + this.switchCount + 'resize';
    var $switchImg = $('<div id="' + id + '" class="on-off-img-switchImg">拖动移动位置，拖动角标改变大小<div id="' + resizeId + '" class="on-off-img-switch-resize"></div></div>');
    $parent.append($switchImg);
    new Drag('#' + id);
    new Drag('#' + resizeId, function (x, y) {
      resizeCallback && resizeCallback($switchImg, $('#' + resizeId), x, y);
    }, true)
  }

  /**
   * 增加隐藏图片
   * @param $parent
   * @param callback
   */
  this.addHideImg = function ($parent, path, callback) {
    var that = this;
    var $divImg = $('<div>');
    $divImg.css({backgroundImage: 'url(' + path + ')'});
    $divImg.addClass('on-off-img-addImage')
    $divImg.attr('id', this.addImageId)

    $parent.append($divImg);
    new Drag('#' + this.addImageId, function (x, y) {
      callback && callback(x, y)
    });

    Util.getImageWH(path, function (wh) {
      that.submitData.img.w = wh.w;
      that.submitData.img.h = wh.h;

      var w = 550 / 1920 * wh.w;
      var h = 550 / 1920 * wh.h;
      $divImg.css({width: w, height: h})
    })
  }

  this.parsePx2Int = function (px) {
    return parseFloat(px.replace('px', '')) || 0;
  }

  return this;
}

/**
 * 初始化组件
 * @returns {OnOffImg}
 */
OnOffImg.prototype.init = function () {
  var that = this;
  this.$container = $(this.selector);

  $(this.selector).append(this.initTpl());

  //初始化放大小缩小组件
  new CNumber(this.selector + ' .on-off-img-resize', {
    val: 100,
    maxValue: 400,
    callback: function (val) {
      var size = val / 100;
      that.$modal.find('#' + that.addImageId).css({transform: 'scale(' + size + ')'});
      that.submitData.img.scale = size;
    }
  })

  this.$modal = this.$container.find('.on-off-img-modal');
  this.$close = $('.on-off-img-modal .on-off-img-close');
  this.$btn = $('.on-off-img-modal .on-off-img-btn');
  this.$textarea = this.$modal.find('._content');
  this.$input = this.$modal.find('._title');
  this.$img = this.$modal.find('._img');
  this.$fileName = this.$modal.find('.on-off-img-filename');
  this.$download = this.$modal.find('.on-off-img-download');
  this.$uploadBtn = this.$modal.find('.on-off-img-unupload');
  this.$fileInfo = this.$modal.find('.on-off-img-uploaded');
  this.$resizeNumber = this.$modal.find('.on-off-img-resize');
  this.$addOnOff = this.$modal.find('.on-off-img-add');
  this.$onOffBg = this.$modal.find('.on-off-img-bg');

  this.bindEvent();
  return this;
}


/**
 * 初始化模板
 */
OnOffImg.prototype.initTpl = function () {
  var tpl = this.tpl;
  var tpls = Handlebars.compile(tpl);
  return tpls(this.data);
}


/**
 * 绑定点击事件
 */
OnOffImg.prototype.bindEvent = function () {
  var that = this;
  this.$close.off('click', this.hide).on('click', this.hide);
  this.$btn.off('click', this.submit).on('click', this.submit);

  this.$download.off('click', this.download).on('click', this.download)

  this.setUploadify($('#on-off-img-' + this.data.id), {
    width: '48px',
    height: '48px',
    onUploadSuccess: function (file, result, response) {
      that.$uploadBtn.hide();
      that.$fileInfo.show();
      that.$resizeNumber.show();
      that.$addOnOff.show();
      that.$fileName.text(file.name);
      that.submitData.img.path = result;
      that.addImg(result);
    }
  });
}

/**
 * 生成开关图片,和隐藏区域
 * @param path 开关触发区
 */
OnOffImg.prototype.addImg = function (path) {
  var that = this;
  that.addHideImg(that.$onOffBg, path)
  that.addSwitch(that.$onOffBg, function ($parent, $target, x, y) {
    var newX = x - that.parsePx2Int($target.css('left'));
    var newY = y - that.parsePx2Int($target.css('top'));
    $parent.css({
      width: $parent.width() + newX,
      height: $parent.height() + newY
    })
  })
}