/***************************************************
 * 时间: 8/7/16 20:35
 * 作者: zhongxia
 * 说明: 自定义点读点风格,文字
 * 依赖: js/lib/bootstrap-slider 组件
 ***************************************************/
$('body').off()
  .on('focus', '[contenteditable]', function () {
    var $this = $(this);
    $this.data('before', $this.html());
    return $this;
  })
  .on('blur keyup paste input', '[contenteditable]', function () {
    var $this = $(this);
    if ($this.data('before') !== $this.html()) {
      $this.data('before', $this.html());
      $this.trigger('change');
    }
    return $this;
  });

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

  Util.loadCSS(getBasePath() + '/customPointSetting.css');
  //Util.loadJS(getBasePath() + '/bootstrap-slider.min.js');
})()


function CustomPointSetting(selector, config) {
  this.selector = selector;
  this.data = {};
  this.setUploadify = config.setUploadify || (_upload && _upload.setUploadify);

  config = config || {};

  this.submitCallback = config.submitCallback;    //关闭页面的回调
  this.pointType = config.pointType || 'audio';  //点读点类型

  this.colorSize = 5;
  this.color = '#FFFF0B';

  this.pointTypeClasses = {
    audio: 'cps-point-audio',
    video: 'cps-point-video',
    imgtext: 'cps-point-imgtext',
    exam: 'cps-point-exam'
  }

  $(this.selector).html(this.render());
  this.initVar();
  this.bindEvent();
}

/**
 * 渲染页面
 */
CustomPointSetting.prototype.render = function () {
  var pointTypeClass = this.pointTypeClasses[this.pointType];
  var html = [];
  html.push('<div class="cps-container">')
  html.push('  <div class="cps-header">点读点设置</div>')
  html.push('  <div class="cps-content">')
  html.push('    <div class="cps-content-left">')
  html.push('       <h4>设置点读点的注释文件</h4>')
  html.push('       <em>(建议不超过10个字)</em>')
  html.push('       <div class="cps-point">')
  html.push('         <div class="cps-point-img ' + pointTypeClass + '"></div>')
  html.push('         <div class="cps-point-line"></div>')
  html.push('         <div class="cps-point-text" contenteditable="true"></div>')
  html.push('       </div>')
  html.push('    </div>')
  html.push('    <div class="cps-content-right">')
  html.push('       <h4>自定制点读点按钮图案</h4>')
  html.push('       <em>(请采用背景色透明的png图片文件)</em>')
  html.push('       <div id="cps-upload-img">点击上传</br>点读点按钮</br>图片</div>')
  html.push('       <div class="cps-show-img" style="display: none;"></div>')
  html.push('       <ul class="cps-show-color">')
  html.push('         <li tabindex="1" style="background: #FB0006;"></li>')
  html.push('         <li tabindex="2" style="background: #15A53F;"></li>')
  html.push('         <li tabindex="3" style="background: #0A5AB2;"></li>')
  html.push('         <li tabindex="4" class="cps-show-color-active" style="background: #FFFF0B;"></li>')
  html.push('         <li tabindex="5" style="background: #CA0081;"></li>')
  html.push('         <li tabindex="6" style="background: #1D1D1D;"></li>')
  html.push('       </ul>')
  html.push('       <div style="clear:both"></div>')
  html.push('       <div class="cps-show-color-size"><input id="cpsColorSize" type="text" data-slider-handle="square"/></div>')
  html.push('    </div>')
  html.push('  </div>')
  html.push('  <div class="cps-submit">提交</div>')
  html.push('</div>')
  return html.join(' ');
}

/**
 * 渲染页面
 */
CustomPointSetting.prototype.initVar = function () {
  this.$container = $(this.selector);
  this.$text = this.$container.find('.cps-point-text');
  this.$upload = this.$container.find('#cps-upload-img');
  this.$submit = this.$container.find('.cps-submit');
  this.$showImg = this.$container.find('.cps-show-img');
  this.$showColor = this.$container.find('.cps-show-color');
}

/**
 * 绑定事件
 */
CustomPointSetting.prototype.bindEvent = function () {
  var that = this;

  /**
   * 获取焦点之后,清除自定义图片
   */
  that.$text.off().on('focus', function (e) {
    //TODO:标题和自定义图片选中一个
  })

  //初始化点读点大小滑块
  var slideSize = new Slider('#cpsColorSize', {
    step: 1,
    min: 1,
    max: 10,
    value: that.colorSize,
    tooltip: 'hide'
  })

  slideSize.on('slide', function (slideEvt) {
    that.colorSize = slideEvt.value;
    var filter = "drop-shadow(0px 0px " + that.colorSize + "px " + that.color + ")"
    that.$showImg.css({
      '-webkit-filter': filter,
      filter: filter
    })
  })

  /**
   * 重新上传图片
   */
  that.$showImg.off().on('click', function (e) {
    layer.confirm('是否重新选择图片？', {
      btn: ['确定', '取消'] //按钮
    }, function (index) {
      that.data.pic = null;
      that.$container.find('#cps-upload-img').css({left: 0});
      that.$showImg.hide().html("");
      layer.close(index);
    });
  })

  /**
   * 选中自定义图片的发光的颜色
   */
  that.$showColor.off().on('click', function (e) {
    var $tar = $(e.target);
    var $cTar = $(e.currentTarget);
    var color = $tar.attr('style').split(':')[1];

    $cTar.find('li').removeClass('cps-show-color-active');
    $tar.addClass('cps-show-color-active');

    if (color) {
      color = color.replace(';', '');
      that.color = color;
      var filter = "drop-shadow(0px 0px " + that.colorSize + "px " + color + ")"
      that.$showImg.css({
        '-webkit-filter': filter,
        filter: filter
      })
      console.log(that.$showImg.attr('style'))
    }
  })

  /**
   * 点读点自定义图片上传
   */
  that.setUploadify(that.$upload, {
    width: '175px',
    height: '175px',
    onUploadSuccess: function (file, result, response) {
      that.data.pic = result;
      //that.$upload 还是最早保存的变量,
      that.$container.find('#cps-upload-img').css({left: -99999});   //记住  that.$upload !== that.$container.find('#cps-upload-img')
      that.$showImg.show().css({
        background: 'url(' + result + ') no-repeat',
        backgroundSize: 'contain',
        backgroundPosition: 'center'
      })
    }
  });

  /**
   * 提交[保存到点读点数据里面]
   */
  that.$submit.off().on('click', function () {
    that.data.title = that.$text.text();
    console.info("自定义点读点数据保存到 window.DD 里面", that.data)

    //参数2 表示, 是否设置了数据
    that.submitCallback && that.submitCallback(that.data, !!(that.data.title || that.data.pic));
  })
}