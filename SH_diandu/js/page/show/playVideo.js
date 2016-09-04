/**
 * 播放 频的类
 * TODO: 在移动端, video 播放之后,会放在最上面,导致 关闭按钮无法点击到, 需 找 决方案
 */
window.PlayVideo = (function (Util) {
  var click = Util.IsPC() ? 'click' : 'tap';

  /**
   *  染HTML页面
   * @param src
   * @returns {string}
   */
  function _render(src) {
    var html = [];
    html.push('<div data-id="__videoContainer" class="video-container">')
    html.push('  <div class="vc-close">&times;</div>')
    html.push('  <i class="fa fa-arrows-alt vc-fullpanel" aria-hidden="true"></i>')
    html.push('  <img class="vc-play" src="./imgs/play.png">')
    html.push(' <div class="vc-video" ><video  controls data-src="' + src + '" </video></div>')
    html.push('</div>')
    return html.join('')
  }

  /**
   * 把字符串数字 换成数字+px,并且按 例缩小
   * @param strNum 大小
   * @param num 修正竖屏下位置问题[创建的时候,背景图是横屏的, 因此在展示时竖屏有问题]
   */
  function _str2Num(strNum, num) {
    num = num || 0;
    var size = parseInt(strNum);
    //移动端,则把视频播放区域,按屏幕大小缩放
    if (!Util.IsPC()) {
      size = size * window.screen.width / 1200 + num;
    }
    return size + 'px';
  }

  /**
   *  频播放
   * @param src  频地址
   * @param config  频展示 置, 宽高,xy
   */
  function show(src, config, wrapTop) {
    var _videoLoading;

    $('.video-container[data-id="__videoContainer"]').remove();
    var html = _render(src);

    $('body').append(html);
    var $container = $('.video-container[data-id="__videoContainer"]');
    var $playImg = $container.find('.vc-play');
    var $hide = $container.find('.vc-close');
    var $video = $container.find('video');
    var $fullpanel = $container.find('.vc-fullpanel')

    if (config) {
      var _scale = window.screen.width / 1200;
      $playImg.css({transform: 'scale(' + _scale + ')'})
      //$hide.css({transform: 'scale(' + _scale + ')'})
      $container.css({
        left: _str2Num(config.x),
        top: _str2Num(config.y, wrapTop),
        width: _str2Num(config.w),
        height: _str2Num(config.h),
      })
    }

    $video.on('canplaythrough', function () {
      _videoLoading.loading("hide");
      $video.attr('data-loaded', true)
    })

    //$video.on(click, function () {
    //  $playImg.show();
    //  $video[0].pause();
    //  $video.css({top: -9999, opacity: 0});
    //})

    //播放
    $playImg.on(click, function () {
      $playImg.hide();
      $video.show().css({width: '100%', height: '100%', top: 0, opacity: 1});

      if (!$video.attr('data-loaded')) {
        _videoLoading = $.loading({content: '加载中...'});
      }

      if (!$video.attr('src')) {
        $video.attr('src', $video.attr('data-src'))
      }
      $video[0].play();

    })


    //隐藏
    $hide.on(click, function (e) {
      console.log("hide")
      e.stopPropagation();
      $container.remove();
    })

    //全屏
    $fullpanel.on(click, function () {
      var elem = $video[0];
      if (!elem.paused) {
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) {
          elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
          elem.webkitRequestFullscreen();
        }
      }
    })

    Util.touchDrag('.video-container[data-id="__videoContainer"]', function (evt, x, y) {
      var $cTar = $(evt.currentTarget)
      var w = $cTar.width();
      var h = $cTar.height();
      var screenW = $(window).width();
      var screenH = $(window).height();
      var left = x;
      var top = y;

      //限制不能超出屏幕
      left = left < 0 ? 0 : left;
      top = top < 0 ? 0 : top;

      if (left > screenW - w) {
        left = screenW - w;
      }
      if (top > screenH - h) {
        top = screenH - h;
      }
      $cTar.css({
        left: left,
        top: top
      })
    })

  }


  return {
    show: show
  }
})(Util)