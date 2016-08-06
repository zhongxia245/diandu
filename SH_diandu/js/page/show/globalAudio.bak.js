/***************************************************
 * 时间: 8/4/16 20:48
 * 作者: zhongxia
 * 说明: 全程音频控制器 [备份用,未具体沟通前的逻辑代码]
 * 1. 播放的时候, 跳转到指定的页面
 ***************************************************/
function GlobalAudioController(selector, config) {
  config.data = config.data || {};
  this.click = Util.IsPC() ? 'click' : 'tap';
  this.selector = selector;
  this.controllerId = config.controllerId;

  this.audio = $(selector)[0];
  this.data = JSON.parse(config.data.content || "{}");
  this.pages = config.data.pages;

  this.timer = null;
  this.duration = 500;
  this.callback = config.callback;  //播放某个时刻,跳转页面
  this.playCallback = config.playCallback; //播放后的回调
  this.pauseCallback = config.pauseCallback; //暂停后的回调
  this.hideOtherPointCallback = config.hideOtherPointCallback; //暂停后的回调

  this.initData();

  var that = this;

  /**
   * 页面上滑出现的,全程音频开关
   */
  $(this.controllerId).off().on(this.click, function (e) {
    var $cTar = $(e.currentTarget);
    var src = $cTar.attr('src');
    var dataSrc = $cTar.attr('data-src');
    $cTar.attr('src', dataSrc);
    $cTar.attr('data-src', src);

    if ($cTar.attr('data-state') === "0") {
      $cTar.attr('data-state', "1")
      that.play();
    } else {
      $cTar.attr('data-state', "0")
      that.pause();
    }
  })
}

/**
 * 初始化全局音频的数据
 * 把点读页相对应的全局音频时间解析出来
 */
GlobalAudioController.prototype.initData = function () {
  //设置了全局音频
  if (this.data.id) {
    this.data.pageIndex = parseInt(this.data.id.split('_')[0]) - 1;  //全局音频页面下标
    this.data.pointIndex = parseInt(this.data.id.split('_')[1]) - 1; //全局音频点读点下标
    this.audio.src = this.data.src;

    this.data.pageTimes = [];
    //计算页面的播放时间
    var pageConfig = this.data.pageConfig || [];
    for (var i = 0; i < pageConfig.length; i++) {
      var pageTime = pageConfig[i];
      var time = null;
      if (pageTime) {
        var _times = pageTime.split(':');

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
      }
      this.data.pageTimes.push(time);
    }
  }
}

/**
 * 渲染弹窗页面
 * @param currentIndex 当前点读页下标
 */
GlobalAudioController.prototype.render = function (currentIndex) {
  //如果已经渲染, 不重新渲染
  if ($('.ga-modal').length === 0) {
    console.info("全程音频弹窗不存在,创建全程音频!")
    var html = [];
    html.push('<section class="ga-modal">');
    html.push('  <div class="ga-modal-mask"></div>');
    html.push('  <div class="ga-modal-content">');
    html.push('    <div class="ga-modal-content-logo"></div>');
    html.push('    <div data-id="btn-control" class="ga-modal-content-btn-off"></div>');
    html.push('    <div class="clearfix"></div>');
    html.push('    <ul class="ga-modal-content-pages">');
    html.push(this.renderPageItem(currentIndex))
    html.push('    </ul>');
    html.push('  </div>');
    html.push('  <div class="ga-modal-hide">');
    html.push('    <label for="ga-modal-hide" class="label-hide"><input id="ga-modal-hide" type="checkbox"/>隐藏其他点读点</label>');
    html.push('  </div>');
    html.push('</section>');
    $('body').append(html.join(''))

    this.initDOM()
    this.bindEvent();
  } else {
    console.info("全程音频弹窗已存在,显示全程音频!")
    this.$container && this.$container.show();
  }
}

/**
 * 渲染点读页
 */
GlobalAudioController.prototype.renderPageItem = function (currentIndex) {
  var data = this.pages || [];
  var html = [];
  for (var i = 0; i < data.length; i++) {
    var display = '';
    if (i <= this.data.pageIndex || this.data.pageTimes[i] === null) {
      display = 'display:none;';
    }
    var pageItem = data[i];
    var active = '';
    if (i === currentIndex) {
      active = 'active';
    }
    var style = 'background:url(' + pageItem.pic + ') no-repeat; background-size:cover;' + display;
    html.push('      <li data-index="' + i + '" class="ga-modal-content-page ' + active + '" style="' + style + '">');
    html.push('        <div class="ga-modal-content-page-index">' + ( i + 1 ) + '</div>');
    html.push('      </li>');
  }

  return html.join('');
}


/**
 * 初始化DOM节点
 */
GlobalAudioController.prototype.initDOM = function () {
  this.$container = $('.ga-modal');
  this.$logo = this.$container.find('.ga-modal-content-logo');
  this.$btn = this.$container.find('[data-id="btn-control"]');
  this.$pageItem = this.$container.find('.ga-modal-content-page');
  this.$btnHidePoint = this.$container.find('.label-hide');
}

/**
 * 设置相关点击事件
 */
GlobalAudioController.prototype.bindEvent = function () {
  var that = this;
  //关闭全程音频
  that.$btn.off().on(this.click, function (e) {
    console.info("关闭全程音频")
    var $cTar = $(e.currentTarget);
    if ($cTar.attr('class') === "ga-modal-content-btn-off") {
      $cTar.removeClass().addClass('ga-modal-content-btn-on');
      that.play();
    } else {
      $cTar.removeClass().addClass('ga-modal-content-btn-off');
      that.pause();
    }
  })

  //关闭弹窗
  that.$logo.off().on(this.click, function (e) {
    console.info("关闭全程音频弹框")
    that.$container.hide();
  })

  //点击点读页
  that.$pageItem.off().on(this.click, function (e) {
    var $cTar = $(e.currentTarget);
    var index = $cTar.attr('data-index');

    //点击点读页, 设置全局音频跳转到该时间点
    that.setActivePage(index, true);
  })

  //音频其他点读点
  that.$btnHidePoint.off().on(this.click, function (e) {
    var flag = $(e.currentTarget).find('input').attr('checked');
    console.info("隐藏其他点读点");
    that.hideOtherPointCallback && that.hideOtherPointCallback(flag);
  })
}


/**
 * 全局音频播放
 */
GlobalAudioController.prototype.play = function () {
  console.info("全局音频播放")
  var that = this;
  that.audio.play();
  that.timer = setInterval(function () {
    for (var i = 0; i < that.data.pageTimes.length; i++) {
      var _time = that.data.pageTimes[i];
      var _currentTime = parseInt(that.audio.currentTime.toFixed(0));

      if (_currentTime === _time && that.currentPageIndex != i) {
        that.currentPageIndex = i;
        console.info("全局音频播放到特定事件,跳转到页面:", i)

        that.setActivePage(i);
        break;
      }
    }
  }, that.duration);
  that.playCallback && that.playCallback()
}

/**
 * 设置当前选中的页面状态
 * @param index 当前page下标
 * @param flag 是否为点击pageItem触发  true 是  false 否
 */
GlobalAudioController.prototype.setActivePage = function (index, flag) {
  this.$pageItem && this.$pageItem.removeClass('active');
  this.$pageItem && this.$pageItem.eq(index).addClass('active');
  var time = this.data.pageTimes && this.data.pageTimes[index];
  if (time && flag) {
    console.info("点击全程音频点读页,跳转到该点读页的时间点:", index, time)
    this.audio.currentTime = time;  //因为实时在监听音频播放的时间,会重复执行一次., 因此这里+1
  }
  this.callback && this.callback(index, time);
}

/**
 * 全局音频播放
 */
GlobalAudioController.prototype.pause = function () {
  clearTimeout(this.timer)
  this.audio.pause();
  this.pauseCallback && this.pauseCallback();
}


/**
 * 设置全局音频当前播放时间
 */
GlobalAudioController.prototype.setCurrentPage = function (time) {
  this.audio.currentTime = time;
}

