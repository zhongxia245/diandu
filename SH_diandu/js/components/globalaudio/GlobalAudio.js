/***************************************************
 * 时间: 7/26/16 22:52
 * 作者: zhongxia
 * 说明: 全局音频
 *
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

  Util.loadCSS(getBasePath() + '/GlobalAudio.css');
  //Util.loadJS(getBasePath() + '/bootstrap-slider.min.js');
})()


function GlobalAudio(selector, config) {
  this.selector = selector;

  config = config || {};
  this.callback = config.callback;
  this.data = {
    size: config.size || 100,
    color: config.color || 'rgb(255,255,255)'
  };
  this.render();
}

/**
 * 渲染页面, 绑定事件,初始化变量
 */
GlobalAudio.prototype.render = function () {
  var html = this.initHTML();
  $(this.selector).html(html);
  this.init();
  this.bindEvent();

  this.audio.src = "http://localhost/uploads/0a77a417fdccc16ac132ad5dee5655e4.mp3";
}

/**
 * 初始化HTML页面
 */
GlobalAudio.prototype.initHTML = function () {
  var html = [];
  html.push('<div class="ga-container">')
  html.push('  <div class="ga-logo"></div>')
  html.push('  <div class="ga-header">全局音频设置</div>')
  html.push('  <div class="ga-content">')
  html.push('    <div class="ga-content-top">')
  html.push('      <p>')
  html.push('        <input type="checkbox" id="cbkGlobalAudio">')
  html.push('        <label for="cbkGlobalAudio">设置本音频为全局音频</label>')
  html.push('      </p>')
  html.push('      <p>全局音频为多个点读页面所用,可设置各个点读页对应音频的时间点出现,每一个点读只能设置一个全局音频</p>')
  html.push('    </div>')
  html.push('    <!--音频名称,音频时间信息 START-->')
  html.push('    <div class="ga-content-info">')
  html.push('      <span class="ga-audio-name">音频名称...</span>')
  html.push('      <div class="ga-content-info-time">')
  html.push('        <span class="ga-currentTime">00:01</span> /')
  html.push('        <span class="ga-totalTime">10:01</span>')
  html.push('      </div>')
  html.push('    </div>')
  html.push('    <!--音频名称,音频时间信息 END-->')
  html.push('    <!--音频控制条 START-->')
  html.push('    <div class="ga-audio-control">')
  html.push('      <div class="ga-progressBar"></div>')
  html.push('      <div class="ga-speed"></div>')
  html.push('      <div class="ga-drag">')
  html.push('        <audio class="ga-audio" loop="loop"></audio>')
  html.push('        <i class="fa fa-play-circle ga-play" aria-hidden="true"></i>')
  html.push('        <i class="fa fa-pause-circle ga-pause" aria-hidden="true" style="display: none;"></i>')
  html.push('      </div>')
  html.push('    </div>')
  html.push('    <!--音频控制条 END-->')
  html.push('    <!--点读页 START-->')
  html.push('    <div class="ga-content-bottom">')
  html.push('    </div>')
  html.push('    <!--点读页 END-->')
  html.push('  </div>')
  html.push('</div>')
  return html.join(' ');
}


/**
 * 初始化组件
 */
GlobalAudio.prototype.init = function () {
  this.$container = $(this.selector);
  this.audio = this.$container.find('.ga-audio')[0];
  this.drag = this.$container.find('.ga-drag')[0];
  this.speed = this.$container.find('.ga-speed')[0];

  this.$progressBar = this.$container.find('.ga-progressBar')
  this.$play = this.$container.find('.ga-play');
  this.$pause = this.$container.find('.ga-pause');
  this.$currentTime = this.$container.find('.ga-currentTime');
  this.$totalTime = this.$container.find('.ga-totalTime');
  this.$audioName = this.$container.find('.ga-audio-name');
  this.$cbkGlobalAudio = this.$container.find('#cbkGlobalAudio');
}

GlobalAudio.prototype.bindEvent = function () {
  var that = this;
  var audio = this.audio;
  audio.addEventListener("loadeddata", //歌曲一经完整的加载完毕( 也可以写成上面提到的那些事件类型)
    function () {
      var allTime = audio.duration;
      that.timeChange(allTime, '$totalTime');

      setInterval(function () {
        var currentTime = audio.currentTime;
        that.timeChange(currentTime, '$currentTime')
      }, 1000);

      that.clicks();
    }, false);

  audio.addEventListener("pause",
    function () {
      //监听暂停
      console.log("点击播放")
      if (audio.currentTime == audio.duration) {
        audio.stop();
        audio.currentTime = 0;
      }
    }, false);
  audio.addEventListener("play",
    function () {
      //监听暂停
      that.dragMove();
      console.log("暂停播放")
    }, false);
  audio.addEventListener("ended", function () {
    alert(0)
  }, false)
}

/**
 * 播放事件
 * @param time
 * @param timePlace
 */
GlobalAudio.prototype.timeChange = function (time, timePlace) {
  //默认获取的时间是时间戳改成我们常见的时间格式
  var $timePlace = this[timePlace]
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
  $timePlace.html(allTime);
}

/**
 * 点击播放
 */
GlobalAudio.prototype.clicks = function () {
  var audio = this.audio;
  var that = this;

  this.$play.on('click', function () {
    audio.play();
    that.$play.hide();
    that.$pause.show();

    that.dragMove();
  })

  this.$pause.on('click', function () {
    audio.pause();
    that.$pause.hide();
    that.$play.show();
  })
}

/**
 * 播放抽根据进度滑动
 */
GlobalAudio.prototype.dragMove = function () {
  var drag = this.drag;
  //var speed = this.speed;
  var audio = this.audio;
  var width = this.$container.width();

  setInterval(function () {
    drag.style.left = (audio.currentTime / audio.duration) * (width - 30) + "px";
    //speed.style.left = -(width - (audio.currentTime / audio.duration) * (width - 10)) + "px";
  }, 500);
}

GlobalAudio.prototype.getData = function () {
  return this.data;
}