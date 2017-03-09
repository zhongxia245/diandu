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
    var $page = $('#_diandu' + pageIndex);
    var $point = $page.find('[data-id="all-radius"]>div')  //所有的点读点
    $point.addClass('custom-point-blink')
    setTimeout(function () {
      $point.removeClass('custom-point-blink')
    }, 2000)

    //开关图闪烁,然后隐藏,如果默认显示,则闪烁,不隐藏
    var $hideImgs = $page.find('.on-off-hideimg');
    var $hideArea = $page.find('.on-off-switch-area');

    for (var i = 0; i < $hideImgs.length; i++) {
      var $hideImg = $($hideImgs[i])
      if ($hideImg.attr('data-show') === 'true') {
        _effect($hideImg, 3);
      } else {
        _effect($hideImg, 1);
      }
    }
    _effect($hideArea, 2);

  }

  /**
   * 增加动画效果
   * @param $dom
   * @param flag 1:显示隐藏  2:增加边框,在取消边框
   * @private
   */
  function _effect($dom, flag) {
    switch (flag) {
      case 1:
      case 3:
        $dom.css('opacity', 1);
        break;
      case 2:
        $dom.css('border', '3px solid red');
    }
    $dom.addClass('custom-point-blink')

    setTimeout(function () {
      $dom.removeClass('custom-point-blink')
      switch (flag) {
        case 1:
          $dom.css('opacity', 0);
          break;
        case 2:
          $dom.css('border', '0');
      }
    }, 2000)
  }

  dd.showEffect = function ($dom) {
    _effect($dom);
  }


  var playTimer;
  /**
   * 自定义图片闪烁效果
   * @param $selector 需要动画的节点
   * @param show 是否开启 true 有动画   false 关闭动画
   */
  dd.customPlay = function ($selector, show) {
    var tmpStyle = 'drop-shadow(rgb(251, 0, 6) 0px 0px ';
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