/***************************************************
 * 时间: 8/7/16 15:14
 * 作者: zhongxia
 * 说明: 点读点透明度设置
 ***************************************************/
window.PointOpacity = {
  /**
   * 设置点读点和开始按钮透明度
   * @param 透明度 0~1
   */
  setOpacity: function (value) {
    $('[data-id="all-radius"]').find('div[data-id]').css('opacity', value)
    $('[data-id="btn-start"]').css('opacity', value)
    $('[data-id="global-audio"]').css('opacity', value)
  }
}