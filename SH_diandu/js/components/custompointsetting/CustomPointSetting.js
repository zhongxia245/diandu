/***************************************************
 * 时间: 8/7/16 20:35
 * 作者: zhongxia
 * 说明: 自定义点读点风格,文字
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
  this.hideCallback = config.hideCallback;

  $(this.selector).html(this.render());
  this.initVar();
  this.bindEvent();
}

/**
 * 渲染页面
 */
CustomPointSetting.prototype.render = function () {
  var html = [];
  html.push('<div class="cps-container">')
  html.push('  <div class="cps-header">点读点设置</div>')
  html.push('  <div class="cps-content">')
  html.push('    <div class="cps-content-left">')
  html.push('       <h4>设置点读点的注释文件</h4>')
  html.push('       <em>(建议不超过10个字)</em>')
  html.push('       <div class="cps-point">')
  html.push('         <div class="cps-point-img"></div>')
  html.push('         <div class="cps-point-line"></div>')
  html.push('         <div class="cps-point-text" contenteditable="true">动感音频仔细聆听</div>')
  html.push('       </div>')
  html.push('    </div>')
  html.push('    <div class="cps-content-right">')
  html.push('       <h4>自定制点读点按钮图案</h4>')
  html.push('       <em>(请采用背景色透明的png图片文件,建议像素小于180*180)</em>')
  html.push('       <div id="cps-upload-img">点击上传</br>点读点按钮</br>图片</div>')
  html.push('       <div class="cps-show-img" style="display: none;"></div>')
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
}

/**
 * 绑定事件
 */
CustomPointSetting.prototype.bindEvent = function () {
  var that = this;


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
    that.hideCallback && that.hideCallback(that.data, !!(that.data.title || that.data.pic));
  })
}