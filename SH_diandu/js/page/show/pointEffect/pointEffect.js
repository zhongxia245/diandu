/***************************************************
 * 时间: 9/4/16 21:32
 * 作者: zhongxia
 * 说明: 点读点强调的效果
 * 1.  闪烁效果
 * 2.  先展示点读点, 在展示背景图片[觉得不可取]
 *
 * 使用说明:
 * diandu.blank(0) ; 表示第一个点读页下的所有点读点,闪烁
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

  Util.loadCSS(getBasePath() + '/style.css');
})()
window.diandu = (function (dd) {
  /**
   * 闪烁效果[发光效果,针对透明图片]
   * 提示时间为2秒，闪烁3个来回，头两个为0.5秒，最后一个为1秒
   * @param pageIndex  当前的点读页下标
   */
  dd.blink = function (pageIndex) {
    var duration = 250;  //ms
    var size = 5; //默认大小为10
    var maxSize = 15;  //闪烁圆的最大半径
    var minSize = 5;  //最小半径
    var shadowColor = 'red'; //闪烁背景的颜色
    var gap = 10; //每次变动大小
    var flag = true; //true: 大小自增  false:大小减小
    var showTime = 2000; //闪烁时间  ms
    var tempTime = 0;

    var $point = $('#_diandu' + pageIndex).find('[data-id="all-radius"]>div')  //所有的点读点

    $point.addClass('custom-point-blink')

    setTimeout(function () {
      $point.removeClass('custom-point-blink')
    }, 2000)


    //BUT: 使用定时器,导致 音频无法播放, 只要设置了 setInterval  , audio.play()就没有效果
    //var blinkTimer = setInterval(function () {
    //  //闪烁结束
    //  if (tempTime >= showTime) {
    //    clearInterval(blinkTimer)
    //    tempTime = 0;
    //
    //    //还原发光的效果
    //    for (var i = 0; i < $point.length; i++) {
    //      var css = $point.eq(i).attr('data-filter');
    //      $point.eq(i).css({'-webkit-filter': css, filter: css});
    //    }
    //  }
    //  //开始闪烁
    //  else {
    //    tempTime += duration;
    //
    //    //最后一次闪烁1s
    //    if (tempTime >= showTime / 2) {
    //      gap = 5;
    //    }
    //
    //    //闪烁到最大则变小,到最小则变大
    //    if (size >= maxSize) {
    //      flag = false;
    //    }
    //    if (size <= minSize) {
    //      flag = true
    //    }
    //
    //    if (flag) {
    //      size += gap;
    //    } else {
    //      size -= gap;
    //    }
    //    var css = 'drop-shadow(' + shadowColor + ' 0px 0px ' + size + 'px)';
    //    var style = {'-webkit-filter': css, filter: css};
    //    $point.css(style)
    //  }
    //}, duration)
  }


  var playTimer;
  /**
   * 自定义图片闪烁效果
   * @param $selector 需要动画的节点
   * @param show 是否开启 true 有动画   false 关闭动画
   */
  dd.customPlay = function ($selector, show) {
    var tmpStyle = 'drop-shadow(rgb(255, 255, 11) 0px 0px ';
    var size = 1;
    var maxSize = 15;
    var minSize = 5;
    var gap = 5;
    var duration = 200;
    var flag = true;
    if (show) {
      //-webkit-filter: drop-shadow(rgb(255, 255, 11) 0px 0px 5px);
      playTimer = setInterval(function () {
        //闪烁到最大则变小,到最小则变大
        if (size >= maxSize) {
          flag = false;
        }
        if (size <= minSize) {
          flag = true
        }
        if (flag) {
          size += gap;
        } else {
          size -= gap;
        }
        var css = tmpStyle + size + 'px)';
        $selector.css({'-webkit-filter': css, filter: css})
      }, duration)
    } else {
      clearTimeout(playTimer)
      var css = $selector.attr('data-filter');
      $selector.css({'-webkit-filter': css, filter: css})
    }
  }

  return dd;
})(window.diandu || {})