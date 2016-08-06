/***************************************************
 * 时间: 7/26/16 22:52
 * 作者: zhongxia
 * 说明: 全局音频
 *
 ***************************************************/
/**
 * 让可编辑的DIV,触发change事件
 */
$('body').on('focus', '[contenteditable]', function () {
  var $this = $(this);
  $this.data('before', $this.html());
  return $this;
}).on('blur keyup paste input', '[contenteditable]', function () {
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

  Util.loadCSS(getBasePath() + '/GlobalAudio.css');
  //Util.loadJS(getBasePath() + '/bootstrap-slider.min.js');
})()


function GlobalAudio(selector, config) {
  this.selector = selector;

  config = config || {};
  this.callback = config.callback;

  this.id = config.id;
  this.name = config.name || "";
  this.src = config.src || "";

  this.render();
}

/**
 * 渲染页面, 绑定事件,初始化变量
 */
GlobalAudio.prototype.render = function () {
  var html = this.initHTML();
  $(this.selector).html(html);
  this.init();

  var pageIndex = parseInt(this.id.split('_')[0]);
  var pagesHTML = this.renderPageItem(window.DD.items, pageIndex)
  this.$pages.html(pagesHTML);


  this.bindEvent();

  this.audio.src = this.src;
}

/**
 * 初始化HTML页面
 */
GlobalAudio.prototype.initHTML = function () {
  var html = [];
  html.push('<div class="ga-container">')
  html.push('  <div class="ga-logo"></div>')
  html.push('  <div class="ga-header">全程音频设置</div>')
  html.push('  <div class="ga-content">')
  html.push('    <div class="ga-content-top">')
  html.push('      <p>')
  html.push('        <input type="checkbox" id="cbkGlobalAudio" checked="true">')
  html.push('        <label for="cbkGlobalAudio">设置本音频为全程音频</label>')
  html.push('      </p>')
  html.push('      <p>全局音频为多个点读页面所用,可设置各个点读页对应音频的时间点出现,每一个点读只能设置一个全程音频</p>')
  html.push('    </div>')
  html.push('    <!--音频名称,音频时间信息 START-->')
  html.push('    <div class="ga-content-info">')
  html.push('      <span class="ga-audio-name">' + this.name + '</span>')
  html.push('      <div class="ga-content-info-time">')
  html.push('        <span class="ga-currentTime">00:00</span> /')
  html.push('        <span class="ga-totalTime">00:00</span>')
  html.push('      </div>')
  html.push('    </div>')
  html.push('    <!--音频名称,音频时间信息 END-->')
  html.push('    <!--音频控制条 START-->')
  html.push('    <div class="ga-audio-control">')
  html.push('      <div class="ga-progressBar"></div>')
  html.push('      <div class="ga-speed"></div>')
  html.push('      <div class="ga-drag">')
  html.push('        <audio class="ga-audio"></audio>')
  html.push('        <i class="fa fa-play-circle ga-play" aria-hidden="true"></i>')
  html.push('        <i class="fa fa-pause-circle ga-pause" aria-hidden="true" style="display: none;"></i>')
  html.push('      </div>')
  html.push('    </div>')
  html.push('    <!--音频控制条 END-->')
  html.push('    <!--点读页 START-->')
  html.push('    <div class="ga-content-pages">')
  html.push('    </div>')
  html.push('    <!--点读页 END-->')
  html.push('  </div>')
  html.push('</div>')
  return html.join(' ');
}

GlobalAudio.prototype.renderPageItem = function (data, pageIndex) {
  var html = [];
  data = data || [];

  for (var i = 0, length = data.length; i < length; i++) {

    var obj = data[i];
    var background = 'background:#008988 url(' + obj.pic + ') no-repeat; background-size: contain;   background-position: center;';
    var disabled = i < pageIndex ? "disabled" : "";

    html.push('<div ' + disabled + ' data-id="' + obj.id + '" class="ga-content-page-item" style="' + background + '">')
    html.push('  <div class="ga-content-page-item-index">' + (i+1) + '</div>')
    html.push('  <div class="ga-content-page-item-time">' + (obj.time || "") + '</div>')
    html.push('</div>')

  }

  return html.join(' ');
}


/**
 * 初始化组件
 */
GlobalAudio.prototype.init = function () {
  this.$container = $(this.selector);
  this.audio = this.$container.find('.ga-audio')[0];

  this.$drag = this.$container.find('.ga-drag');

  this.$audioControl = this.$container.find('.ga-audio-control')
  this.$play = this.$container.find('.ga-play');
  this.$pause = this.$container.find('.ga-pause');
  this.$currentTime = this.$container.find('.ga-currentTime');
  this.$totalTime = this.$container.find('.ga-totalTime');
  this.$pages = this.$container.find('.ga-content-pages');
  this.$pageItem = this.$container.find('.ga-content-page-item-time');
  this.$audioName = this.$container.find('.ga-audio-name');

  this.$cbkGlobalAudio = this.$container.find('#cbkGlobalAudio');
}

/**
 * 绑定事件
 */
GlobalAudio.prototype.bindEvent = function () {
  var that = this;
  var audio = this.audio;

  /**
   * 点击进度条,跳转到该进度
   */
  that.$audioControl.on('click', function (e) {
    e.stopPropagation();
    var left = e.offsetX - that.$drag.width() / 2;
    var width = that.$audioControl.width() - 30;

    left = left < 0 ? 0 : left;
    left = left > width ? width : left;

    var currentTime = (left / width) * that.audio.duration; //30是拖动圆圈的长度，减掉是为了让歌曲结束的时候不会跑到window以外
    that.audio.currentTime = currentTime;
    that.$drag.css('left', left);
  })

  /**
   * 播放
   */
  that.$play.on('click', function (e) {
    e.stopPropagation();
    that.audio.play();
    that.$play.hide();
    that.$pause.show();
  })

  /**
   * 暂停
   */
  that.$pause.on('click', function (e) {
    e.stopPropagation();
    that.audio.pause();
    that.$pause.hide();
    that.$play.show();
  })

  /**
   * 是否设置为全局音频
   */
  that.$cbkGlobalAudio.on('change', function (e) {
    that.callback && that.callback(e);
  })

  /**
   * 点击获取进度条上的时间
   */
  that.$container.on('click', '.ga-content-page-item-time', function (e) {
    var $cTar = $(e.currentTarget);
    $cTar.attr('contenteditable', false)
      .text(that.formatTime(audio.currentTime))

    var id = parseInt($cTar.parent().attr('data-id')) - 1;
    window.DD && ( window.DD.items[id].time = that.formatTime(audio.currentTime));
  })

  /**
   * 双击设置时间
   */
  that.$container.on('dblclick', '.ga-content-page-item-time', function (e) {
    $(e.currentTarget)
      .attr('contenteditable', true)
      .focus()
  })

  /**
   * 双击设置时间
   */
  that.$container.on('change', '.ga-content-page-item-time', function (e) {
    var $cTar = $(e.currentTarget);
    var id = parseInt($cTar.parent().attr('data-id')) - 1;
    var timeStr = $cTar.text();
    window.DD && ( window.DD.items[id].time = timeStr);
  })

  /**
   * 点击获取进度条上的时间
   */
  that.$container.on('keydown', '.ga-content-page-item-time', function (e) {
    if (e.keyCode === 13) {
      $(e.currentTarget)
        .attr('contenteditable', false)
    }
  })

  /**
   * 音频加载结束,展示总时长,并设置播放时的定时器让进度条在移动
   */
  audio.addEventListener("loadeddata", //歌曲一经完整的加载完毕( 也可以写成上面提到的那些事件类型)
    function () {
      that.$totalTime.html(that.formatTime(audio.duration));

      //设置进度条随着音频时间自动滑动
      setInterval(function () {
        that.$currentTime.html(that.formatTime(audio.currentTime));

        var width = that.$audioControl.width() - 30;
        var left = (audio.currentTime / audio.duration) * width;

        that.$drag.css('left', left);
      }, 500);

    }, false);

  audio.addEventListener('ended', function (e) {
    console.log("global audio play end ....")
    that.$pause.click();
  })
}

/**
 * 播放事件
 * @param time
 * @param timePlace
 */
GlobalAudio.prototype.formatTime = function (time) {
  //默认获取的时间是时间戳改成我们常见的时间格式
  //分钟
  var minute = time / 60;
  var minutes = parseInt(minute);
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  //秒
  var second = time % 60;
  var seconds = parseInt(second);
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  var allTime = minutes + ":" + seconds;
  return allTime;
}

GlobalAudio.prototype.getData = function () {
  return this.data;
}