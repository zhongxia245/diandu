(function () {
  Util.loadCSS(Util.getBasePath(document.currentScript.src) + '/style.css')
})()

window.SwayEffect = (function () {
  /**
   * 摇摆图效果
   * @param {any} selector 弹窗对应的点读点
   * @param {any} selectedType  选中的类型
   */
  function SwayEffect(e, data) {

  }

  /**
   * 添加摇摆图的动画效果 
   * @param {any} e 
   */
  function addAnimation(e) {
    var $tar = $(e.target);
    var ids = $tar.attr('data-id');
    var pointData = Util.getPointDataByIds(DATA, ids);
    var swayData = JSON.parse(pointData.pic)

    // 动态生成Animation，否则值不可控制
    var animationStyle = [
      '.sway-effect {',
      '   animation-name:' + (swayData.blink ? 'sway-ratate,sway-blink;' : 'sway-ratate;'),
      '   animation-duration:' + (1 / swayData.speed) + 's;',
      '   animation-iteration-count:' + swayData.count + ';',
      '}',
      '@-webkit-keyframes sway-ratate {',
      '   0% {transform: rotate(' + swayData.angle[0] + 'deg) scale(1);}',
      '   50% {transform: rotate(' + swayData.angle[1] + 'deg) scale(' + (1 + swayData.scale / 100) + ');}',
      '   100% {transform: rotate(' + swayData.angle[0] + 'deg) scale(1);}',
      '}',
      '@-webkit-keyframes sway-blink {',
      '   0%, 50%, 100% {-webkit-filter: drop-shadow(' + swayData.color + ' 0px 0px  5px);}',
      '   25%, 75%  {-webkit-filter: drop-shadow(' + swayData.color + ' 0px 0px 15px);}',
      '}'
    ].join(' ')

    $('#animation_style').remove();
    var style = document.createElement('style');
    style.type = 'text/css';
    style.setAttribute('id', 'animation_style');
    style.innerHTML = animationStyle;
    document.getElementsByTagName('head')[0].appendChild(style);

    $tar.addClass('sway-effect')
  }

  /**
   * 移除摇摆图的动画效果
   * @param {any} e 
   */
  function removeAnimation(e) {
    var $tar = $(e.target);
    var ids = $tar.attr('data-id');
    var pointData = Util.getPointDataByIds(DATA, ids);
    var swayData = JSON.parse(pointData.pic)
    $tar.removeClass('sway-effect')
  }


  return {
    addAnimation: addAnimation,
    removeAnimation: removeAnimation
  }
})()