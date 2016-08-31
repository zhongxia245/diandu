/**
 * 播放视频的类
 * @param config
 * @constructor
 */
window.PlayVideo = (function (Util) {
  var click = Util.IsPC() ? 'click' : 'tap';

  /**
   * 渲染HTML页面
   * @param src
   * @returns {string}
   */
  function _render(src) {
    var html = [];
    html.push('<div data-id="__videoContainer" class="video-container">')
    html.push('  <img class="vc-play" src="./imgs/play.png">')
    html.push('  <div class="vc-close">&times;</div>')
    html.push('  <video  preload="auto" controls data-src="' + src + '" </video>')
    html.push('</div>')
    return html.join('')
  }

  function show(src) {
    var html = _render(src);

    $('body').append(html);
    var $container = $('.video-container[data-id="__videoContainer"]');
    var $playImg = $container.find('.vc-play');
    var $hide = $container.find('.vc-close');
    var $video = $container.find('video');

    $video.on('load', function () {
      console.log("video load")
    })

    $video.on('pause', function () {
      $playImg.show();
    })

    //$video.on(click, function () {
    //  $playImg.show();
    //  $video[0].pause();
    //})

    //播放
    $playImg.on(click, function () {
      $playImg.hide();
      $video.show();
      if (!$video.attr('src')) {
        $video.css({width: '100%', height: '100%', top: 0}).attr('src', $video.attr('data-src'))
      }
      $video[0].play();
    })


    //隐藏
    $hide.on(click, function (e) {
      console.log("hide")
      e.stopPropagation();
      $container.remove();
    })
  }


  return {
    show: show
  }
})(Util)