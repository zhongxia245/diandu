/**
 * 2016-3-27 09:02:41
 * 作者 : zhongxia
 * 说明 :
 *      1. fn+数字 表示第几期的函数
 *      2. 共用的方法，会抽取出来，放到一个个闭包里面【每一个类型，一个闭包】
 *      3. 通用的组件，可能封装成一个 组件类，目前有 图文上传 ImgText
 *
 *  TODO : 1. 已经选中一个全局音频之后,不能修改点读点类型, 否则会有问题
 */
/*==========================变量定义 START==================================*/
window.DD = window.DD || {}
window.DD.items = []; // 点读的位置记录

// 点读点类型
var TYPE = {
  1: 'video',
  2: 'audio',
  3: 'imgtext',
  4: 'exam',
  5: 'on-off',
  6: 'set-url'
}

/******************************************
 * 全局对象
 ******************************************/
var GLOBAL = {
  PAGECOUNT: 1, // 点读页数量
  SCREENTYPE: '', // 屏幕类型，横屏，或者竖屏[选中之后，所有点读页都一致]
  ISSELECTEDSCREENTYPE: false, // 是否选中了点读页类型
  DIANDUSIZE: 72, // 点读点大小
  H_IMGSCALE: 1920 / 1080, // 横屏比例点
  V_IMGSCALE: 1080 / 1760, // 竖屏比例点
  OLDWIDTH: 1200, // 创建页面的横屏宽度
  OLDHEIGHT: 960, // 创建页面的竖屏高度
  SCREENSIZE: {
    h: {width: 1200, height: 675},
    v: {width: 540, height: 960}
  },
  ISEDIT: {
    flag: false // 是否为编辑页面,默认为false
  },
  POINT_SIZE: 100, // 点读点缩放比例(%)
  BACK_COLOR: 'rgb(0,0,0)' // 背景图之外空白区域的颜色
}
/***************************************
 * 程序入口
 ***************************************/
$(function () {
  var _id
  // 本地测试[上传FTP注释掉]
  if (window.location.host.indexOf('localhost') !== -1) {
    _id = Util.getQueryStringByName('id')
    teamid = 3100
    unitid = 184
    userid = 92
  } else {
    _id = videoid
  }
  _id ? _edit.initEdit(_id) : _create.initCreate()
  bindEvent()
})

/***************************************
 * uploadify 相关的方法
 ***************************************/
var _upload = (function () {
  /**
   * 设置input file 标签，使用 uploadify 插件
   * @param {[type]}  $file   [file文件标签的Jquery对象]
   * @param {Boolean} isSetWH [是否设置寛高，上传MP4，MP3等]
   * @param {[type]}  success [成功回调函数]
   * @param {[type]}  error   [失败回调函数]
   */
  function setUploadify($file, config) {
    var defaultConfig = {
      width: 100,
      height: 30,
      auto: true, // 关闭自动上传
      removeTimeout: 1, // 文件队列上传完成1秒后删除
      swf: 'js/lib/uploadify/uploadify.swf',
      uploader: 'php/uploadify.php',
      method: 'post', // 方法，服务端可以用$_POST数组获取数据
      buttonText: '', // 设置按钮文本
      multi: true, // 允许同时上传多张图片
      uploadLimit: 100, // 一次最多只允许上传100张图片
      fileTypeDesc: 'Image Files',
      fileTypeExts: '*.gif;*.jpg;*.png;*.jepg',
      fileSizeLimit: '2GB', // 限制上传的图片不得超过约等于2G
      onUploadSuccess: function (file, data, response) { // 每次成功上传后执行的回调函数，从服务端返回数据到前端
      },
      onError: function (event, queueId, fileObj, errObj) {
        Logger.log('upload error', event)
      }
    }
    // 合并参数
    config = $.extend({}, defaultConfig, config)
    $file.uploadify(config)
  }

  return {
    setUploadify: setUploadify
  }
})()

/***************************************
 * window.DD.items 数据对象方法
 ***************************************/
var _data = (function () {
  /**
   * 根据id，设置数据仓库点读位置数据
   * @param  id 点读的id ,类似  1_1
   */
  function setDDItems(id, config) {
    // 点读背景默认从1开始，所以，这里减1
    var index = parseInt(id.split('_')[0])
    var arr = window.DD.items[index - 1]['data']
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].id == id) {
        arr[i] = $.extend({}, arr[i], config)
        break
      }
    }
  }

  /**
   * 根据id 获取 点读位置的数据
   * @param id  点读位置标识  类似 1_1
   */
  function getDDItems(id) {
    var index = parseInt(id.split('_')[0])
    var arr = window.DD.items[index - 1]['data']
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].id == id) {
        return arr[i]
      }
    }
  }

  /**
   * 获取有效的点读位
   * @return {[type]} [description]
   */
  function getValidItems() {
    var destArr = []
    var delPageIds = ''
    var isDelGlobalAudio = false; // 是否删掉了全程音频的点读点
    var srcArr = window.DD.items
    ArrayUtil.sortByKey(srcArr, 'sort')

    // 点读页
    for (var i = 0; i < srcArr.length; i++) {
      if (!srcArr[i].isRemove) { // 去掉已经删除的点读页
        var destPage = {
          name: srcArr[i].name,
          pic: srcArr[i].pic,
          h: srcArr[i].h,
          w: srcArr[i].w,
          id: srcArr[i]['oldId'],
          seq: srcArr[i]['sort']
        }

        // 点读点
        var destItems = []
        var items = srcArr[i]['data']

        destPage['delPointIds'] = destPage['delPointIds'] || ''

        for (var j = 0; j < items.length; j++) {
          if (!items[j].isRemove && !isEmpty(items[j])) { // 去掉删除的点读位

            var obj = {
              x: items[j].x,
              y: items[j].y,
              point_size: items[j]['point_size'],
              filename: items[j].filename,
              url: items[j].url,
              title: items[j].title,

              area: items[j].area && JSON.stringify(items[j].area) || '',
              custom: items[j].custom && JSON.stringify(items[j].custom) || '',
              pic: items[j].pic && JSON.stringify(items[j].pic) || '',

              content: items[j].content,
              hide: items[j].hide ? 1 : 0,
              questions: typeof items[j]['questions'] !== 'string' ? JSON.stringify(items[j].questions) : items[j].questions,
              type: _data.getTypeByName(items[j].type),

              remarks: JSON.stringify(items[j].remarks),

              onoff: JSON.stringify(items[j].onoff),
              linkurl: JSON.stringify(items[j].linkurl),
            }

            if (items[j]['oldId']) obj['id'] = items[j]['oldId']

            destItems.push(obj)
          } else {
            // 记录下删除的点读位ID
            var _oldid = items[j]['oldId'] ? items[j]['oldId'] : ''

            if (_oldid) {
              destPage['delPointIds'] += _oldid + ','
            }
            // 如果删除点读点的时候,把全程音频删掉了,则需要把全程音频数据清空
            if ((i + 1) + '_' + (j + 1) === window.DD.globalAudioId) {
              isDelGlobalAudio = true
            }
          }
        }

        destPage['delPointIds'] = destPage['delPointIds'].length > 0 ? destPage['delPointIds'].substr(0, destPage['delPointIds'].length - 1) : ''
        destPage['points'] = destItems
        destArr.push(destPage)
      } else {
        if (srcArr[i]['oldId']) {
          delPageIds += srcArr[i]['oldId'] + ','
        }
      }
    }

    delPageIds = delPageIds.length > 0 ? delPageIds.substr(0, delPageIds.length - 1) : ''
    return {
      data: destArr,
      delPageIds: delPageIds,
      isDelGlobalAudio: isDelGlobalAudio
    }
  }

  /**
   * 根据类型名字，获取类型的ID
   * @return {[type]} [description]
   */
  function getTypeByName(typeName) {
    switch (typeName) {
      case 'video':
        return 1
      case 'audio':
        return 2
      case 'imgtext':
        return 3
      case 'exam':
        return 4
      case 'on-off':
        return 5
      case 'set-url':
        return 6
      default:
        return 1
    }
  }

  /**
   * 判断创建的点读是否为空[没有上传数据]
   * @param item 点读位数据
   */
  function isEmpty(item) {
    // 如果这些每一项都为空,则表示为空的点读位
    if (item.content || item.filename || item.questions || item.title || item.linkurl || item.url || item.remarks || item.onoff || item.pic) {
      return false
    }
    return true
  }

  return {
    getDDItems: getDDItems,
    setDDItems: setDDItems,
    getValidItems: getValidItems,
    getTypeByName: getTypeByName
  }
})()

/***************************************
 * 创建相关操作
 ***************************************/
var _create = (function () {
  /**
   * 默认创建一个点读背景页
   */
  function initCreate() {
    addDianDuPageTpl()
  }

  return {
    initCreate: initCreate
  }
})()

/***************************************
 * 编辑相关操作
 ***************************************/
var _edit = (function () {
  /**
   * 初始化编辑页面
   * @param id
   */
  function initEdit(id) {
    Model.getList(id, function (data) {
      Logger.info('加载点读点数据完成! ', data)
      // 编辑的时候,按照点读页进行排序
      ArrayUtil.sortByKey(data.pages, 'seq')

      // 初始化 表单数据
      _initFormData(data)

      // 初始化点读页
      _initPages(data.pages)

      // 把数据解析到window.DD.items里面
      _data2DDItems(data)

      // 设置点读位状态, 显示或者隐藏
      _setPointState(data.pages)

      GLOBAL.ISEDIT = {
        flag: true,
        id: id
      }

      // 回显背景图片的空白区域颜色
      setBackColor(GLOBAL.BACK_COLOR)

      // 回显全局音频设置配置
      _resetGlobalAudioData(data)
    })
  }

  /**
   * 初始化点读背景页
   * @param pages
   * @private
   */
  function _initPages(pages) {
    for (var i = 0; i < pages.length; i++) {
      var pageIndex = i + 1
      var picW = parseFloat(pages[i]['w'])
      var picH = parseFloat(pages[i]['h'])
      var picPath = pages[i]['pic']
      var picName = pages[i]['name'] || ''
      var points = pages[i]['points']

      GLOBAL.ISSELECTEDSCREENTYPE = true; // 已经选中点读页的类型(横屏或者竖屏)

      // 生成点读背景图
      addDianDuPageTpl()
      addDianduPageByUpload(pageIndex, picName, picPath)
      setBgImageScale(picPath, '#id_bg' + pageIndex)
      // 设置上传的图片信息,以及修改提示信息
      $('.sort-info').show()
      var _$fileBg = $('#file_bg' + pageIndex)
      _$fileBg.parent().find('.filename').text(picName)

      // 生成点读位
      for (var j = 0; j < points.length; j++) {
        var point = points[j]
        // 初始化点读位
        _initPointByData(pageIndex, picW, picH, point)
      }
    }
  }

  /**
   * 初始化表单
   * @param data
   */
  function _initFormData(data) {
    $('#name').val(data['title'])
    $('#intro').val(data['saytext'])
    $('input[name="chargeType"][value="' + data['charge'] + '"]').attr('checked', true)
    $('#input[name="pic"]').val(data['pic'])
    $('#chargeStandard').val(data['cost'])
    $('#file_btnAutoAudio_path').val(data['background'])
    $('#btnAutoAudio>span').text(data['bgFileName'])

    GLOBAL.POINT_SIZE = parseInt(data['point_size']) || 100
    GLOBAL.BACK_COLOR = data['back_color'] === '0' ? 'rgb(0,0,0)' : data['back_color']

    Logger.info('全局背景颜色:GLOBAL.BACK_COLOR', GLOBAL.BACK_COLOR, '全局点读点大小:GLOBAL.POINT_SIZE', GLOBAL.POINT_SIZE)
  }

  /**
   * 根据数据快速生成点读位[根据数据生存]
   * @param pageIndex     背景图下标
   * @param w             背景图 w
   * @param h             背景图 h
   * @param x             点读位top
   * @param y             点读位left
   * @private
   */
  function _initPointByData(pageIndex, w, h, point) {
    // 计算图片的宽高
    var _scaleWH = getImageScaleWH(w, h)
    w = _scaleWH.scaleW
    h = _scaleWH.scaleH

    // 创建的时候,减去图片缩放后的 黑色区域宽度,  编辑的时候加上, 回显
    var left = parseFloat(point['x']) * w + (GLOBAL.SCREENSIZE.h.width - w) / 2
    var top = parseFloat(point['y']) * h + (GLOBAL.SCREENSIZE.h.height - h) / 2

    var DDPageItems = window.DD.items[pageIndex - 1]['data']; // 获取当前点读页的数据
    var dataid = pageIndex + '_' + (DDPageItems.length + 1); // 唯一标识该点读位 1_3 第一个点读页的第三个点读位[从1开始算]

    // 把数据在插入到全局变量中
    DDPageItems.push({
      x: parseFloat(point['x']), // 坐标的比例
      y: parseFloat(point['y']),
      id: dataid
    })

    // 默认为普通点读点,  1 普通点读点  2: 自定义标题   3. 自定义图片
    var type = 1
    var pic = JSON.parse(point.pic || '{}')
    var title = JSON.parse(point.custom || '{}')
    if (pic && pic.src) type = 3
    if (title && title.title) type = 2

    var config = {
      left: left,
      top: top,
      title: title,
      pic: pic
    }

    createPoint(dataid, type, config)
    addDianDu(dataid, point)

    // 设置了自定义图片,自定义标题,或者视频播放区域, 则设置 自定义点读点 为 激活状态
    if (type !== 1 || (point.area && JSON.parse(point.area).w)) {
      $('.upload-right-btn')
        .find('[data-id="' + dataid + '"]')
        .find('.img-point-setting')
        .addClass('img-point-setting-on')

      Logger.info('自定义点读点', dataid, type, config)
    }

    // 初始化视频,音频,图文的数据
    _initPointItemData(dataid, point)
  }

  /**
   * 初始化视频,音频,图文的数据  [新增试卷]
   * @param dataid        点读位的唯一标识
   * @param point          点读数据
   * @private
   */
  function _initPointItemData(dataid, point) {
    var type = point['type']
    var fileName = point['filename']
    var url = point['url']
    var hide = point['hide'] == '1' ? true : false
    var $target, className

    var ids = dataid.split('_')
    var $currentTarget = $('#uploadSetting' + ids[0]).find('.item' + ids[1]).eq(0)
    var $rightName = $currentTarget.find('.upload-right-name').eq(0)
    var $filemask = $currentTarget.find('.div-file-mask'); // 文件上传按钮的遮罩层，用于图文

    $filemask.attr('data-type', type)
    $rightName.removeClass('notselect')

    switch (type) {
      case '1':
        className = '.video'
        point['type'] = 'video'
        $rightName.addClass('uploaded').attr('data-src', url).find('span').eq(0).text(fileName)
        break
      case '2':
        className = '.audio'
        point['type'] = 'audio'
        $rightName.addClass('uploaded').attr('data-src', url).find('span').eq(0).text(fileName)
        break
      case '3':
        className = '.imgtext'
        point['type'] = 'imgtext'
        $rightName.addClass('uploaded-imgtext').find('span').eq(0).text('图文已上传(点击编辑)')
        $filemask.show().off().on('click', fn2_uploadImgText)
        break
      case '4':
        className = '.exam'
        point['type'] = 'exam'
        $rightName.addClass('uploaded-exam').find('span').eq(0).text('试卷已上传(点击编辑)')
        $filemask.show().off().on('click', fn2_examCreate)
        break
      case '5':
        className = '.on-off'
        point['type'] = 'on-off'
        $rightName.addClass('uploaded-on-off').find('span').eq(0).text('开关图已设置(点击编辑)')
        $filemask.show().off().on('click', fn3_onoffImgCreate)
        break
      case '6':
        className = '.set-url'
        point['type'] = 'set-url'
        $rightName.addClass('uploaded-set-url').find('span').eq(0).text('超链接已设置(点击编辑)')
        $filemask.show().off().on('click', fn3_setUrl)
        break;
    }
    $target = $currentTarget.find(className).eq(0)
    var pdata = $target.parent().data(); // 点读位文件类型列表data-数据(文件列表的ul)
    var id = pdata.id
    // 设置上传类型的默认图标--》设置选中的图片
    setUnSelectImgSrc($currentTarget)
    setHoverImgSrcx($target)
    $('#__file' + id).hide()
  }

  /**
   * 把编辑返回的数据, 保存到window.DD.items里面
   * @param data
   * @private
   */
  function _data2DDItems(data) {
    $('input[name="pic"]').val(data['pic'])
    var pages = data.pages
    for (var i = 0; i < pages.length; i++) {
      window.DD.items[i]['oldId'] = pages[i]['id']
      for (var j = 0; j < pages[i]['points'].length; j++) {
        var obj = pages[i]['points'][j]
        window.DD.items[i]['data'][j]['oldId'] = obj['id']
        window.DD.items[i]['data'][j]['point_size'] = obj['point_size']
        window.DD.items[i]['data'][j]['url'] = obj['url']
        window.DD.items[i]['data'][j]['filename'] = obj['filename']
        window.DD.items[i]['data'][j]['title'] = obj['title']
        window.DD.items[i]['data'][j]['content'] = obj['content']
        window.DD.items[i]['data'][j]['type'] = obj['type']
        window.DD.items[i]['data'][j]['questions'] = obj['questions']
        window.DD.items[i]['data'][j]['hide'] = (obj['hide'] == '1' ? true : false)

        window.DD.items[i]['data'][j]['custom'] = JSON.parse(obj['custom'] || '{}')
        window.DD.items[i]['data'][j]['pic'] = JSON.parse(obj['pic'] || '{}')
        window.DD.items[i]['data'][j]['area'] = JSON.parse(obj['area'] || '{}')

        window.DD.items[i]['data'][j]['remarks'] = JSON.parse(obj['remarks'] || '{}')

        window.DD.items[i]['data'][j]['linkurl'] = JSON.parse(obj['linkurl'] || '{}')   //开关图数据,暂时保存在这
        window.DD.items[i]['data'][j]['onoff'] = JSON.parse(obj['onoff'] || '{}')   //开关图数据,暂时保存在这
      }
    }
  }

  // 设置点读位的状态,点读位是否为隐藏状态
  function _setPointState(pages) {
    for (var i = 0; i < pages.length; i++) {
      for (var j = 0; j < pages[i]['points'].length; j++) {
        var point = pages[i]['points'][j]
        if (point['hide'] == '1') {
          var _ids = (i + 1) + '_' + (j + 1)
          $('[data-id="' + _ids + '"]').find('.img-hide').click()
        }
      }
    }
  }

  /**
   * 把全局音频的数据,保存到点读数据里面  DD.items
   * 重置全局音频的数据
   * @param data
   * @private
   */
  function _resetGlobalAudioData(data) {
    var globalAudioConfig = JSON.parse(data.content || '{}')
    if (globalAudioConfig.id) {
      window.DD.globalAudioId = globalAudioConfig.id
      window.DD.globalAudioSrc = globalAudioConfig.src
      window.DD.globalAudioName = globalAudioConfig.name

      for (var i = 0; i < globalAudioConfig.pageConfig.length; i++) {
        window.DD.items[i]['time'] = globalAudioConfig.pageConfig[i]
      }

      // 回显全局音频设置
      $('html').attr('data-selected', 1)
      var uploadRightBtns = $('.upload-right-btn').find('ul[data-id="' + globalAudioConfig.id + '"]')
      uploadRightBtns.find('.img-global-audio').hide()
      uploadRightBtns.find('.img-global-audio-setting').show()

      // 设置点读点是音频的做标记,并且标记已经上传(音频+已经上传, 可以显示出 设置全局音频按钮)
      var pages = window.DD.items
      for (var i = 0; i < pages.length; i++) {
        var points = pages[i].data || []
        for (var j = 0; j < points.length; j++) {
          var point = points[j]
          if (point.type === 'audio' && point.url !== '') {
            var id = point.id
            var pageIndex = id.split('_')[0]
            var pointIndex = id.split('_')[1]

            $('.diandupageitem[data-index="' + pageIndex + '"]')
              .find('.upload-item[data-index="' + pointIndex + '"]')
              .find('.upload-right')
              .attr('data-upload', 1)
              .attr('data-type', point.type)
          }
        }
      }
    }
  }

  return {
    initEdit: initEdit
  }
})()

/*************************编辑页面 END**************************/
/**
 * 设置背景图的缩放
 * @param path
 * @param id
 */
function setBgImageScale(path, id) {
  // 获取图片的宽高
  Util.getImageWH(path, function (obj) {
    var bgSize = '100% auto'
    var currentScale = obj.w / obj.h
    // 竖屏
    if (GLOBAL.SCREENTYPE === 'v') {
      if (currentScale > GLOBAL.V_IMGSCALE) {
        bgSize = '100% auto'
      } else {
        bgSize = 'auto 100%'
      }

      // 竖屏 , 小图, 没有办法铺满 宽 或者 高  [不缩放,不放大]
      if (obj.w < GLOBAL.SCREENSIZE.v.width) {
        bgSize = 'auto auto'
      }
    }
    // 横屏
    else {
      if (currentScale > GLOBAL.H_IMGSCALE) {
        bgSize = '100% auto'
      } else {
        bgSize = 'auto 100%'
      }

      // 横屏 , 高度小于 横屏高度, 不缩放,不放大
      if (obj.h < GLOBAL.SCREENSIZE.h.height) {
        bgSize = 'auto auto'
      }
    }
    $(id).css('background-size', bgSize)
  })
}

/*************************设置背景图的缩放比例 END**************************/

/**
 * 绑定事件
 */
function bindEvent() {
  // 提交
  $('#btnSubmit').on('click', handleSubmit)

  // 添加点读页
  $('#btnAdd').on('click', addDianDuPageTpl)

  // 收费标准验证只能输入数字和小数点
  $('#chargeStandard').on('keyup', function (e) {
    var $tar = $(e.target)
    $tar.val($tar.val().replace(/[^\d.]/g, ''))
  })

  // 删除点读页.   该使用方法相当于 live
  $(document).on('click', '.bigimg-h .del', function (e) {
    Logger.log('del diandi page')
    e.stopPropagation()
    var $bgPage = $(e.currentTarget).parent().parent().parent().parent()
    var display = $bgPage.find('.setting-bigimg-tip-h').css('display')
    layer.confirm('确定删除该点读页？', {
      btn: ['确定', '取消'] // 按钮
    }, function (index) {
      $bgPage.remove()
      $bgPage.prev('hr').remove()
      delDDItem($bgPage.attr('data-index'))
      layer.close(index)
    })
  })

  // 上传背景音乐
  _upload.setUploadify($('#file_btnAutoAudio'), {
    width: '100%',
    height: '50',
    multi: false,
    fileTypeDesc: 'Audio Files',
    fileTypeExts: '*.mp3',
    onUploadSuccess: function (file, resultPath) {
      $('#file_btnAutoAudio_path').val(resultPath)
      $('#btnAutoAudio>span').text(file.name)
    }
  })

  // 点读点大小设置 START  2016-07-17 17:02:42
  $('#pointSetting').on('click', function (e) {
    e.stopPropagation()
    var $divDPS = $('#dianduPointSetting')

    // 实例化 点读点大小设置页面
    if ($divDPS.html() === '') {
      Logger.log('GLOBAL.POINT_SIZE', GLOBAL.POINT_SIZE, 'GLOBAL.BACK_COLOR', GLOBAL.BACK_COLOR)

      new PointSetting('#dianduPointSetting', {
        size: GLOBAL.POINT_SIZE,
        color: GLOBAL.BACK_COLOR,
        callback: function (config) {
          // 保存变量到全局
          GLOBAL.POINT_SIZE = config.size
          GLOBAL.BACK_COLOR = config.color

          // 设置页面上的效果,去除已经设置单个大小的点读点
          setPointSize('.radius:not([data-change="1"])', config.size)
          setBackColor(config.color)

          // 没有单独设置大小的点读点, 都受影响
          var $val = $('.c-number-val:not([data-change])')
          CNumber.prototype.setColorOut($val, config.size)
        }
      })
    }

    layer.open({
      type: 1,
      title: false,
      scrollbar: false,
      closeBtn: 1,
      area: ['600px', '600px'], // 宽高
      shadeClose: false,
      skin: 'yourclass',
      content: $divDPS
    })
  })
  // 点读点大小设置 END

}

/**
 * [COMMON]设置背景页的颜色
 * @param color
 */
function setBackColor(color) {
  $('.setting-bigimg-img').css('background-color', color)
}

/*==========================动态创建页面，根据模板 START==================================*/

/**
 * 添加点读页
 */
function addDianDuPageTpl() {
  var style
  if (GLOBAL.SCREENTYPE) {
    style = {style: 'width:' + GLOBAL.SCREENSIZE[GLOBAL.SCREENTYPE].width + 'px; height:' + GLOBAL.SCREENSIZE[GLOBAL.SCREENTYPE].height + 'px'}
  }
  var data = {
    index: GLOBAL.PAGECOUNT,
    visible: GLOBAL.ISSELECTEDSCREENTYPE ? 'none' : 'block'
  }
  data = $.extend(true, data, style)
  var tpls = Handlebars.compile($('#tpl_bg').html())
  $('#id_diandupages').append(tpls(data))
  // 初始化上传控件
  setUploadControl(GLOBAL.PAGECOUNT)

  // 没每添加一个点读页，就在这里添加一个数组
  window.DD.items.push({
    id: GLOBAL.PAGECOUNT, // id 用来标识该点读页
    sort: GLOBAL.PAGECOUNT, // 排序的顺序
    pic: '', // 背景图地址
    name: '', // 名称
    data: [] // 点读位数组
  })
  GLOBAL.PAGECOUNT++

  setBackColor(GLOBAL.BACK_COLOR)
}

/**
 * 创建点读位置
 * @param  {id}  当前点读位置的ID
 * @param  {index}  点读位置的显示的编号
 * @param  {left}  点读位置的偏移量  left
 * @param  {top}  点读位置的偏移量  top
 */
function createPoint(pointId, type, config) {
  config.left = config.left || 0
  config.top = config.top || 0
  config.pointId = pointId

  var pageIndex = parseInt(config.pointId.split('_')[0])
  var pid = '#id_bg' + pageIndex
  var style = "style='position:absolute; left:" + config.left + 'px; top :' + config.top + "px;'"

  var html = CreatePoint.initPoint(type, config)
  $(pid).append(html)

  new Drag('#' + pointId, function (x, y) {
    var _page = window.DD.items[pageIndex - 1]
    var location = getLocation(_page.w, _page.h, x, y)
    _data.setDDItems(pointId, {x: location.x, y: location.y})
  })
}

// 获取点读点 相对于图片左上角的位置[不能去掉,否则点读点位置会有问题]
function getLocation(imgW, imgH, x, y) {
  var _x = x - (GLOBAL.SCREENSIZE.h.width - imgW) / 2
  var _y = y - (GLOBAL.SCREENSIZE.h.height - imgH) / 2
  return {
    x: _x / imgW,
    y: _y / imgH
  }
}

/**
 * 添加点读设置项
 * @param pageIndex 点读页下标
 * @param dianduItemid 点读点文件类型选择id
 * @param index 第几个点读点
 * @param point 点读点数据[编辑的时候有数据]
 */
function addDianDu(pointId, point) {
  point = point || {}
  var pageIndex = parseInt(pointId.split('_')[0])
  var pointIndex = parseInt(pointId.split('_')[1])

  var settingId = '#uploadSetting' + pageIndex

  var data = {
    id: pointId,
    index: pointIndex,
    type: TYPE[point.type],
    upload: point.url ? '1' : '0'
  }
  var tpls = Handlebars.compile($('#tpl_uploadSetting').html())
  $(settingId).append(tpls(data))

  // 设置单个点读点的大小  2016-07-18 22:43:43  START
  var pointSize = parseInt(point['point_size'])
  new CNumber('[data-id="' + pointId + '"] .number-container', {
    val: pointSize || GLOBAL.POINT_SIZE,
    flag: !!pointSize,
    pointSelector: '#' + pointId,
    callback: function (val) {
      var id = pointId
      _data.setDDItems(id, {point_size: val})

      setPointSize('#' + pointId, val)
      Logger.log('set point_size:', id, val)
    }
  })

  if (point) {
    // 编辑
    if (pointSize) {
      // 单独设置了大小
      setPointSize('#' + pointId, pointSize)
    } else {
      // 全局大小
      GLOBAL.POINT_SIZE && setPointSize('#' + pointId, GLOBAL.POINT_SIZE)
    }
  } else {
    // 新增
    GLOBAL.POINT_SIZE && setPointSize('#' + pointId, GLOBAL.POINT_SIZE)
  }

  // 设置单个点读点的大小  2016-07-18 22:43:43  END

  // 点读设置项
  $('.upload-item').off().on('click', handleUploadItem)
}

/**
 * [COMMON]设置点读位置的大小
 * @param id
 */
function setPointSize(selector, val) {
  var scale = val / 100
  var style = 'scale(' + scale + ')'
  $(selector).css({
    transform: style,
    '-webkit-transform': style,
    'transform-origin': 'left top',
    '-webkit-transform-origin': 'left top'
  })
}

/*==========================uploadify控件设置  START==================================*/

/**
 * [CORE]
 * 【上传背景图】,上传之后的一直操作
 * 初始化上传控件
 * @return {[type]} [description]
 */
function setUploadControl(index) {
  // index 从 1 开始
  var file_bg = '#file_bg' + index
  var newIndex = index

  _upload.setUploadify($(file_bg), {
    onUploadSuccess: function (file, resultPath, response) {
      GLOBAL.ISSELECTEDSCREENTYPE = true; // 已经选中点读页的类型
      // 移除上传按钮,显示上传的文件信息
      var oldIndex = newIndex
      // upload muitl image
      if (this.queueData.filesSelected > 1) {
        // first image not add DianduPage
        if (newIndex !== index) {
          addDianDuPageTpl()
        }
        addDianduPageByUpload(newIndex, file.name, resultPath)
        newIndex++
      } else {
        addDianduPageByUpload(index, file.name, resultPath)
      }

      // 设置上传的图片信息,以及修改提示信息
      $('.sort-info').show()
      var _$fileBg = $('#file_bg' + oldIndex)
      _$fileBg.parent().find('.filename').text(file.name)
      Logger.log('newIndex', oldIndex)
      setBgImageScale(resultPath, '#id_bg' + (oldIndex))
    }
  })
}

/**
 * 根据上传的图片,快速生成点读背景
 * @param index 点读页的下标
 * @param id_bg 点读页的id
 * @param fileName 文件名
 * @param resultPath 文件路径
 */
function addDianduPageByUpload(index, fileName, resultPath) {
  if (resultPath.indexOf('error') === -1) {
    GLOBAL.SCREENTYPE = GLOBAL.SCREENTYPE || 'h'; // 默认横屏

    var id_bg = '#id_bg' + index
    var $bg = $(id_bg)

    var src = resultPath; // PHP返回的资源路径

    $bg.css('backgroundImage', 'url("' + src + '")')

    $bg.parent().find('.setting-bigimg-header>span').eq(0).hide()
    $bg.parent().find('.setting-bigimg-header>span').eq(1).show()
    $bg.parent().find('.bigimg-h2s-right').hide()

    $bg.parent().find('.hide').removeClass('hide')

    $('.btn_start').show()
    $('.bigimg-tip').hide()

    // 获取图片的大小
    Util.getImageWH(src, function (obj) {
      var _scaleWH = getImageScaleWH(obj.w, obj.h)

      window.DD.items[index - 1]['w'] = _scaleWH.scaleW
      window.DD.items[index - 1]['h'] = _scaleWH.scaleH
      window.DD.items[index - 1]['name'] = fileName
      window.DD.items[index - 1]['pic'] = src

      bindDianDuPageEvent()
    })
  }
}

/**
 * 传入宽高,获取缩放到适应屏幕的宽高大小
 * @param w
 * @param h
 * @returns {{scaleW: *, scaleH: *}}
 */
function getImageScaleWH(w, h) {
  var obj = {}, _scaleImgW, _scaleImgH
  obj.w = w
  obj.h = h
  if (obj.w < GLOBAL.SCREENSIZE.h.width && obj.h < GLOBAL.SCREENSIZE.h.height) {
    _scaleImgW = obj.w
    _scaleImgH = obj.h
  }
  else if (obj.w > obj.h) {
    // 横向图, w=1200 h=按比例缩小  1200 * 实际高 = 实际宽 * 缩放高
    _scaleImgW = GLOBAL.SCREENSIZE.h.width
    _scaleImgH = _scaleImgW / obj.w * obj.h
    // 如果缩放宽高, 宽1200  高>675 , 则以高为缩放比例
    if (_scaleImgH > GLOBAL.SCREENSIZE.h.height) {
      _scaleImgH = GLOBAL.SCREENSIZE.h.height
      _scaleImgW = _scaleImgH / obj.h * obj.w
    }
  } else {
    // 竖型图  h=675  w=按比例缩小
    _scaleImgH = GLOBAL.SCREENSIZE.h.height
    _scaleImgW = _scaleImgH / obj.h * obj.w

    if (_scaleImgW > GLOBAL.SCREENSIZE.h.height) {
      _scaleImgW = GLOBAL.SCREENSIZE.h.width
      _scaleImgH = _scaleImgW / obj.w * obj.h
    }
  }
  return {
    scaleW: _scaleImgW,
    scaleH: _scaleImgH
  }
}

/**
 * 绑定点读页的事件
 * @return {[type]} [description]
 */
function bindDianDuPageEvent() {

  // 2016-08-14 21:56:13 这里不能使用 off() , 否则编辑的时候, 点读点的mouesdown事件被清除掉, 无法移动
  $('.setting-bigimg-img').off()
    .on('click', addDianDuLocation)

  // 点读页上下移动操作
  $('.setting-bigimg-header ul').off()
    .on('click', dianduPageOperator)

  $('.upload-item').off()
    .on('click', handleUploadItem)

  $('.div-file-mask').off()
    .on('click', function (e) {
      var type = $(e.target).attr('data-type')
      if (type === '3') {
        fn2_uploadImgText(e)
      }
      else if (type === '4') {
        fn2_examCreate(e)
      } else if (type === '5') {
        fn3_onoffImgCreate(e)
      } else if (type === '6') {
        fn3_setUrl(e)
      }
    })
}

/*==========================图片选中，不选中状态设置 START==================================*/

/**
 * 设置图标选中的图片地址
 * @param {[type]} $target [点击图标的Jquery对象]
 */
function setHoverImgSrcx($target) {
  var imgSrc = $target.css('backgroundImage')
  if (imgSrc.indexOf('_on') === -1) {
    var srcs = imgSrc.split('.png')
    var hoverImgSrc = srcs[0] + '_on.png' + srcs[1]
    $target.css('backgroundImage', hoverImgSrc)
  } else {
    var srcs = imgSrc.split('_on')
    var hoverImgSrc = srcs[0] + srcs[1]
    $target.css('backgroundImage', hoverImgSrc)
  }
}

/**
 * 设置默认的图标
 * @param {[type]} $currentTarget [绑定点击事件的标签,Jquery对象]
 */
function setUnSelectImgSrc($currentTarget) {
  var $imgs = $currentTarget.find('.upload-type li')
  $imgs.each(function (index, el) {
    $el = $(el)
    var imgSrc = $el.css('backgroundImage')
    if (imgSrc.indexOf('_on') != -1) {
      var srcs = imgSrc.split('_on')
      var hoverImgSrc = srcs[0] + srcs[1]
      $el.css('backgroundImage', hoverImgSrc)
    }
  })
}

/*==========================点读位置拖动，下载点读位的文件 START==================================*/
/**
 * 获取有效的XY坐标，防止超出背景图
 */
function getValidXY(ex, ey, w, h) {
  var size = GLOBAL.DIANDUSIZE
  var r = size / 2
  // 不允许超过背景图之外
  var x = ex - r; // 减去圆的半径
  var y = ey - r

  if (ex - r < 0) {
    x = 0
  }
  if (ey - r < 0) {
    y = 0
  }
  if (ex + r > w) {
    x = w - size
  }
  if (ey + r > h) {
    y = h - size
  }
  return {
    x: x,
    y: y
  }
}

/**
 * 下载文件
 */
function downloadFile(e) {
  var src = $(e.target).parent().data().src
  window.open(src)
}

/*************************************************************
 *              逻辑部分【重点】  START
 *************************************************************/
/**
 * 添加点读位置
 */
function addDianDuLocation(e) {
  e.stopPropagation(); // 阻止冒泡，否则背景会触发点击事件

  var $tar = $(e.target)
  var w = $tar.width()
  var h = $tar.height()

  // 添加点读位置,点读位上点击是不能添加新的点读位的
  if ($tar.hasClass('setting-bigimg-img')) {
    var pageIndex = parseInt($tar.attr('data-index'))
    var xy = getValidXY(e.offsetX, e.offsetY, w, h)
    var x = xy.x
    var y = xy.y

    // 获取当前点读页的数据
    var _page = window.DD.items[pageIndex - 1]

    // 点读点 id 和点读点下标
    var DDPageItems = _page['data']
    var dataid = pageIndex + '_' + (DDPageItems.length + 1)

    var location = getLocation(_page.w, _page.h, x, y)
    DDPageItems.push({
      x: location.x, // 坐标的比例
      y: location.y,
      id: dataid
    })
    // 创建点读点
    createPoint(dataid, 1, {
      left: x,
      top: y
    })
    // 创建点读点项
    addDianDu(dataid)
  }
}

/**
 * 点读项点击事件处理
 */
function handleUploadItem(e) {
  e.preventDefault()
  e.stopPropagation()
  var $currentTarget = $(e.currentTarget)
  var $target = $(e.target)
  var data = $target.data()

  if ($target[0].nodeName === 'LI') {
    switch (data.type) {
      // 如果是点击上传的类型,视频或者音频
      case 'uploadType':
        fileTypeItemClick(e)
        break

      case 'point-setting':
        addCustomPointSetting(e)
        break
      // 隐藏按钮
      case 'hide':
        hideDDLocation(e)
        break
      // 删除按钮
      case 'delete':
        var itemdata = $target.parent().data()
        $('#' + itemdata.id).remove()
        $currentTarget.remove()

        // 在本地数据变量里面标注，已经删除
        var _dataid = itemdata.id
        _data.setDDItems(_dataid, {isRemove: true})
        break

      // 设置全局音频按钮
      case 'global-audio':
        e.stopPropagation()
        var $tar = $(e.target)
        $tar.hide()
        $tar.next().show()
        $('html').attr('data-selected', 1)
        break

      // 全程音频设置参数
      case 'global-audio-setting':
        e.stopPropagation()
        var $tar = $(e.target)
        var dataItemId = $tar.parent().attr('data-id'); // DD.items 里面的标识id
        var globalAudioSrc = $tar.parents('.upload-right-btn').prev().attr('data-src')
        var globalAudioName = $tar.parents('.upload-right-btn').prev().find('span').eq(0).text()

        // 保存到window变量里面
        window.DD.globalAudioId = dataItemId
        window.DD.globalAudioSrc = globalAudioSrc
        window.DD.globalAudioName = globalAudioName

        $tar.attr('data-dataid', dataItemId).attr('data-src', globalAudioSrc).attr('data-name', globalAudioName)

        addGlobalAudio(e, {
          id: dataItemId,
          src: globalAudioSrc,
          name: globalAudioName,
          callback: function (e) {
            layer.confirm('确定删除该全局音频？', {
              btn: ['确定', '取消'] // 按钮
            }, function () {
              layer.closeAll()
              $tar.parent().find('.img-global-audio-setting').hide()
              $tar.parent().find('.img-global-audio').show()
              $('html').attr('data-selected', 0)

              // 去掉全局音频之后, 去掉之前的配置
              window.DD.globalAudioId = ''
              window.DD.globalAudioSrc = ''
              window.DD.globalAudioName = ''
              for (var i = 0; i < window.DD.items.length; i++) {
                var obj = window.DD.items[i]
                obj.time = ''
              }
            })
          }
        })
        break

      // 默认报错，不处理
      default:
        break
    }
  }
  // 右侧下载按钮
  else if ($target.parent().hasClass('upload-right-name uploaded') && $target[0].nodeName === 'IMG') {
    // 根据路径
    downloadFile(e)
  }
}

/**
 * 添加全局音频设置
 * @param e
 */
function addGlobalAudio(e, param) {
  var $tar = $(e.target)

  var $divGA = $('#globalAudioSetting')
  // 实例化 点读点大小设置页面
  new GlobalAudio('#globalAudioSetting', param)

  layer.open({
    type: 1,
    title: false,
    scrollbar: false,
    closeBtn: 1,
    area: ['600px', '600px'], // 宽高
    shadeClose: false,
    skin: 'yourclass',
    content: $divGA
  })
  Logger.log('设置该全局音频的参数', $tar)
}

/**
 * 弹出自定义点读点窗口
 * @param e
 * @param param
 */
function addCustomPointSetting(e) {
  var $divGA = $('#customPointSetting')
  var $cTar = $(e.target)
  var dataId = $cTar.parent().data().id || '1_1'
  var pageIndex = parseInt(dataId.split('_')[0]) - 1
  var pointIndex = parseInt(dataId.split('_')[1]) - 1
  var pointType = $(e.target).parents('.upload-right').attr('data-type')

  // 获取数据,编辑
  var _data = window.DD.items[pageIndex]['data'][pointIndex] || {}
  _data.custom = _data.custom || {}
  _data.custom.type = pointType
  // 实例化 点读点大小设置页面
  new CustomPointSetting('#customPointSetting', {
    dataId: dataId,
    pointData: _data, // 点读点数据
    title: _data.custom, // 点读点自定义title
    pic: _data.pic, // 点读点自定义图片
    bgPic: window.DD.items[pageIndex], // 背景图片地址

    submitCallback: function (data, isSetData) {
      layer.closeAll()
      var $point = $('#' + dataId)
      $point.remove()

      var left = $point.css('left')
      var top = $point.css('top')

      // 保存视频播放区域的数据
      window.DD.items[pageIndex].data[pointIndex].area = data.area

      // 是否设置了数据
      if (isSetData) {
        Logger.info('自定义点读点数据:', data)
        $cTar.addClass('img-point-setting-on')

        // 保存数据到变量里面
        window.DD.items[pageIndex].data[pointIndex].pic = data.pic
        window.DD.items[pageIndex].data[pointIndex].custom = data.title
        // 点读点类型,是自定义图片,还是自定义标题
        var type = 1
        if (data.pic.src) type = 3
        if (data.title.title) type = 2

        var config = {
          left: left,
          top: top,
          title: data.title,
          pic: data.pic
        }
        createPoint(dataId, type, config)
      } else {
        $cTar.removeClass('img-point-setting-on')
        // 保存数据到变量里面
        window.DD.items[pageIndex].data[pointIndex].pic = null
        window.DD.items[pageIndex].data[pointIndex].custom = null

        var config = {
          left: left,
          top: top
        }
        createPoint(dataId, 1, config)
      }
    }
  })

  layer.open({
    type: 1,
    title: false,
    scrollbar: false,
    closeBtn: 1,
    area: ['600px', '600px'], // 宽高
    shadeClose: false,
    content: $divGA
  })
  Logger.info('自定义点读点样式')
}

/**
 * 点图文件上传，文件类型选择，上传框，序号小圆圈样式管理
 * @param  {[type]} e [点击事件对象]
 */
function fileTypeItemClick(e) {
  var $currentTarget = $(e.currentTarget)
  var $target = $(e.target)
  var $filemask = $currentTarget.find('.div-file-mask'); // 文件上传按钮的遮罩层，用于图文

  var data = $target.data(); // 文件类型，和提示信息（上传什么类型文件）
  var pdata = $target.parent().data(); // 点读位文件类型列表data-数据(文件列表的ul)
  var id = pdata.id
  var _dataid = id
  var fileTypeDesc, fileTypeExts

  // 设置右边上传位置文字，以及背景颜色
  var $rightName = $currentTarget.find('.upload-right-name')

  // 上传文件名称，以及点读点操作按钮区域
  var $uploadRight = $currentTarget.find('.upload-right')

  // 设置上传类型的默认图标--》设置选中的图片
  setUnSelectImgSrc($currentTarget)
  setHoverImgSrcx($target)

  // 加上点读点类型【用于hover出现全局音频按钮】
  $uploadRight.attr('data-type', data.fileType)

  $rightName.find('span').html(data.text)
  // 未上传文件，设置上传文件的样式
  $rightName.removeClass('notselect').addClass('upload')
  // 已经上传文件，修改成 需要上传新的文件
  $rightName.removeClass('uploaded').addClass('upload')
  // 已经上传图文文件[二期]
  $rightName.removeClass('uploaded-imgtext').addClass('upload')

  // 用来遮住uploadify 组件的, 图文和试卷 不需要直接使用上传功能
  $filemask.hide()
  Logger.log('点读点的类型为 => data.fileType:', data.fileType)

  switch (data.fileType) {
    case 'video': // 视频
      fileTypeExts = '*.mp4'
      fileTypeDesc = 'MP4文件'
      break
    case 'audio': // 音频
      fileTypeExts = '*.mp3'
      fileTypeDesc = 'MP3文件'
      $target.parent().parent().parent().find('.upload-right').attr('data-upload', 0)
      break
    case 'imgtext': // 图文
      $filemask.show().off().on('click', fn2_uploadImgText)
      break
    case 'exam': // 考试
      $filemask.show().off().on('click', fn2_examCreate)
      break
    case 'on-off': // 开关图
      $filemask.show().off().on('click', fn3_onoffImgCreate)
      break
    case 'set-url': //设置超链接
      $filemask.show().off().on('click', fn3_setUrl)
      break

  }

  // 把文件类型，保存到变量里面
  _data.setDDItems(_dataid, {type: data.fileType})

  $('#__file' + id + '-queue').remove()

  // 设置上传文件用 uploadify插件,并且透明化按钮
  _upload.setUploadify($('#__file' + id), {
    width: '100%',
    height: '100%',
    fileTypeExts: fileTypeExts,
    fileTypeDesc: fileTypeDesc,
    onUploadSuccess: function (file, resultPath) {
      if (resultPath.indexOf('error') === -1) {
        var $rightName = $('#__file' + id).parent().parent()
        var fileSrc = resultPath
        $rightName.attr('data-src', fileSrc)

        $rightName.removeClass('upload').addClass('uploaded')
        $rightName.find('span').html(file.name)

        $uploadRight.attr('data-upload', 1); // 标记已经上传文件

        // 如果是视频点读点,则获取视频的宽高
        if (data.fileType === 'video') {
          Util.getVideoWH(fileSrc, function (obj) {
            console.log('Audio', obj)
            _data.setDDItems(_dataid, {
              url: fileSrc,
              filename: file.name,
              area: {
                w: obj.w, h: obj.h,
                videoW: obj.w, videoH: obj.h
              }
            })
          })
        } else {
          _data.setDDItems(_dataid, {url: fileSrc, filename: file.name})
        }
      }
    }
  })

  $('#__file' + id + ' object').css('left', 0)
}

/**
 * 2016-11-21 00:12:19
 * 设置超级链接点读点
 * @param e
 */
function fn3_setUrl(e) {
  // 获取 id
  var ids = CommonUtil.getIds(e)
  var pageId = ids.pageId
  var dianduId = ids.dianduId
  var _pointData = window.DD.items[pageId].data[dianduId]
  new UrlPoint('body', _pointData.linkurl, function (val) {
    _pointData.linkurl = val;
  })
}

/**
 * 2016-11-09 22:40:46
 * 上传开关图
 * @param e
 */
function fn3_onoffImgCreate(e) {
  // 获取 id
  var ids = CommonUtil.getIds(e)
  var pageId = ids.pageId
  var dianduId = ids.dianduId
  var _data = window.DD.items[pageId].data[dianduId];

  _data.onoff = _data.onoff || {};
  new OnOffImg('body', {
    id: ids.id,
    bg: {w: window.DD.items[pageId].w, h: window.DD.items[pageId].h, bgPath: window.DD.items[pageId].pic},
    img: _data.onoff.img,
    switchArea: _data.onoff.switchArea,
    mp3: _data.onoff.mp3,
    hideSwitchArea: _data.onoff.hideSwitchArea
  }, function (result) {
    _data.onoff = result;
    // 标识试卷已经上传
    var $uploadRight = $('#uploadSetting' + (ids.pageId + 1)).find('.item' + (ids.dianduId + 1)).find('.upload-right').eq(0)
    $uploadRight.find('.upload').removeClass('upload').addClass('uploaded-on-off')
    $uploadRight.find('.upload-right-name span').text('开关图已设置(点击编辑)')
  }).init()
}

/**
 * 上传图文[共用一个图文上传页]
 * @return {[type]} [description]
 */
function fn2_uploadImgText(e) {
  // 获取 id
  var ids = CommonUtil.getIds(e)
  var _isEdit = ids.isEdit
  var pageId = ids.pageId
  var dianduId = ids.dianduId

  // 常规操作,获取数据的方式,由点击创建时传过来的
  window.imgText = window.imgText || null
  var data = window.DD.items[pageId].data[dianduId]

  if (!window.imgText) {
    window.imgText = new ImgText('body', data, function (result) {
      _data.setDDItems(result.id, result)
      // 这个不能写外面，否则会被缓存起来
      var ids = result.id.split('_')
      var $uploadRight = $('#uploadSetting' + ids[0]).find('.item' + ids[1]).find('.upload-right').eq(0)
      $uploadRight.find('.upload').removeClass('upload').addClass('uploaded-imgtext')
      $uploadRight.find('.upload-right-name span').text('图文已上传(点击编辑)')
    }).init()

    // 如果是编辑页面,则第一次就需要赋值初始值
    if (_isEdit) {
      window.imgText.data = data
      window.imgText.reset()
      window.imgText.set(data)
      window.imgText.show()
    }
  } else {
    // 更新 图文上传组件 上的data，保证所有点读页共用一个 图文上传页面，参数参数是正确的
    window.imgText.data = data
    window.imgText.reset()
    window.imgText.set(data)
    window.imgText.show()
  }
}

/**
 * 上传试卷[20150507], TODO:编辑的时候如果从非考试转成考试有问题
 */
function fn2_examCreate(e) {
  var ids = CommonUtil.getIds(e)
  // 试卷数据
  var examData = _data.getDDItems(ids.id) || {}

  /**
   * 编辑时,从其他点读类型(图文,视频,音频==>考试), 设置 examData 为 {}, 否则报错
   * 因为其他类型的点读中,examData["question"]为null, 不能
   **/
  if (examData['questions'] === '') {
    examData = {}
  } else {
    /**
     * 如果不是字符串就一直解析, 解析10次不行就跳过
     * 解决多次序列化的问题,导致JSON字符串多许序列化问题
     * */
    var _count = 0
    while (typeof examData['questions'] === 'string' && _count < 10) {
      _count++
      examData['questions'] = JSON.parse(examData['questions'])
    }
    if (_count > 10) {
      alert('解析题目JSON字符串报错,请查看数据库中,数据是否有问题')
    }
  }

  new ExamCreate('#_examCreate', examData, function (submitData) {
    // 标识试卷已经上传
    var $uploadRight = $('#uploadSetting' + (ids.pageId + 1)).find('.item' + (ids.dianduId + 1)).find('.upload-right').eq(0)
    $uploadRight.find('.upload').removeClass('upload').addClass('uploaded-exam')
    $uploadRight.find('.upload-right-name span').text('试卷已上传(点击编辑)')

    layer.close(_layer)
    _data.setDDItems(ids.id, submitData)
  })
  var _layer = layer.open({
    type: 1,
    scrollbar: false,
    title: '上传试卷',
    shadeClose: false,
    content: $('#_examCreate')
  })

  // 设置 textarea 自动撑开
  autosize($('#_examCreate').find('textarea'))
}

/**
 * [创建于 开发试卷时]公用的一些方法
 * @type {{getIds}}
 */
var CommonUtil = (function () {
  /**
   * 点击上传项类型,获取id  [图文,试卷目前在用]
   * @param e
   * @returns {{id: (XML|string|void|*), pageId: number, dianduId: number, isEdit: boolean}}
   */
  function getIds(e) {
    // 计算出当前数据的ID,然后去window.DD.items 里面获取数据 [针对点读页上下移动,重新绑定事件获取数据的方式]
    var id, _isEdit = false

    if ($(e.target).parent().find('.uploadify').attr('id')) {
      id = $(e.target).parent().find('.uploadify').attr('id')
    } else {
      id = $(e.target).parent().find('input').attr('id'); // 编辑由于没有初始化uploadify,所有获取id的方式使用这种
      _isEdit = true
    }

    id = id.replace('__file', '')
    var pageId = parseInt(id.split('_')[0]) - 1
    var dianduId = parseInt(id.split('_')[1]) - 1

    return {
      id: id,
      pageId: pageId,
      dianduId: dianduId,
      isEdit: _isEdit
    }
  }

  return {
    getIds: getIds
  }
})()

/**
 * 隐藏点读位置
 */
function hideDDLocation(e) {
  var $currentTarget = $(e.currentTarget)
  var $lis = $currentTarget.find('.upload-type li')
  var $target = $(e.target)
  var $rightName = $currentTarget.find('.upload-right-name')
  // 该点读位置的下标，就是ＩＤ
  var index = $(e.currentTarget).attr('data-index')

  var data = $target.data()
  setHoverImgSrcx($target)

  var itemdata = $target.parent().data()
  var _dataid = itemdata.id

  var $itemSortId = $('#item' + itemdata.id); // 序号

  // 隐藏点读位
  if ($target.attr('data-show') === '0') {
    $target.attr('data-show', '1')

    var style = {
      'background': '#7F7F7F',
      'textDecoration': 'line-through'
    }
    $('#' + itemdata.id).find('.radius-in').css(style); // 背景上的点读位置

    $itemSortId.css(style)

    $itemSortId.prev().css('visibility', 'initial'); // 隐藏的图片展示出来

    _data.setDDItems(_dataid, {hide: true})

    // 记录旧的样式，等显示在赋值上去
    for (var i = 0; i < $lis.length; i++) {
      var $li = $($lis[i])
      $li.attr('data-style', $li.attr('style'))
      $li.removeAttr('style')
    }

    // 设置右侧名称【上传文件按钮】
    $rightName.attr('data-class', $rightName.attr('class'))
    $rightName.removeClass().addClass('upload-right-name notselect')
  }

  // 显示点读位
  else {
    var style = {
      'background': '#66CCCC',
      'textDecoration': 'none'
    }
    $target.attr('data-show', '0')

    $('#' + itemdata.id).find('.radius-in').css(style)
    $itemSortId.css(style)
    $itemSortId.prev().css('visibility', 'hidden')
    $('#item' + itemdata.id).css(style)

    for (var i = 0; i < $lis.length; i++) {
      var $li = $($lis[i])
      $li.attr('style', $li.attr('data-style'))
    }
    // 还原
    $rightName.removeClass().addClass($rightName.attr('data-class'))
    _data.setDDItems(_dataid, {hide: false})
  }
}

/*=====================================点读位置相关JS逻辑事件 END=============================================*/

/*=====================二期，点读页上下移动，显示删除隐藏 START==========================*/
/**
 * 点读页上下移动,隐藏, 删除 等点击事件
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
function dianduPageOperator(e) {
  Logger.log('ul click')
  var $tar = self = $(e.target)
  var $bgItem = $(e.currentTarget).parentsUntil('.diandupageitem').parent()
  var sortIndex = parseInt($bgItem.attr('data-index')); // 下标

  switch ($tar.attr('class')) {
    case 'down':
      var _old = self.closest('.diandupageitem')
      var _new = self.closest('.diandupageitem').next().next()
      if (_new.length > 0) {
        var _temp = _old.html()
        _old.empty().append(_new.html())
        _new.empty().append(_temp)
      }
      ArrayUtil.nextItem(window.DD.items, 'sort', sortIndex)

      // 移动位置之后，需要重新绑定事件，和上传控件，否则会事件不起作用
      setUploadControl(sortIndex); // 重新设置上传控件
      setUploadControl(_new.data().index)
      bindDianDuPageEvent(); // 需要重新绑定事件
      break
    case 'up':
      var _old = self.closest('.diandupageitem')
      var _new = self.closest('.diandupageitem').prev().prev()
      if (_new.length > 0) {
        var _temp = _old.html()
        _old.empty().append(_new.html())
        _new.empty().append(_temp)
      }
      ArrayUtil.prevItem(window.DD.items, 'sort', sortIndex)
      setUploadControl(sortIndex)
      setUploadControl(_new.data().index)
      bindDianDuPageEvent()
      break
    case 'hide1':
      $tar.hide()
      $tar.next('.show1').show()
      $bgItem.find('._mask').show()
      break
    case 'show1':
      $tar.hide()
      $tar.prev('.hide1').show()
      $bgItem.find('._mask').hide()
      break
  }
}

/**
 * 删除点读页
 * @param  {[type]} id [description]
 * @return {[type]}    [description]
 */
function delDDItem(id) {
  var arr = window.DD.items
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].id == id) {
      arr[i]['isRemove'] = true; // 标记删除
    }
  }
}

/*=====================二期，点读页上下移动，显示删除隐藏 END==========================*/

/**
 * 获取全局音频的配置数据
 * 全局音频,音频名称,音频地址,每个点读页的出现事件
 */
function getGlobalAudioConfig() {
  var pageConfig = []
  for (var i = 0; i < window.DD.items.length; i++) {
    var obj = window.DD.items[i]
    if (!obj.isRemove) {
      pageConfig.push(obj.time)
    }
  }
  var globalAudioConfig = {
    id: window.DD.globalAudioId,
    src: window.DD.globalAudioSrc,
    name: window.DD.globalAudioName,
    pageConfig: pageConfig
  }
  return globalAudioConfig
}

/**
 * 提交
 */
function handleSubmit(e) {
  var pagesInfo = _data.getValidItems()
  var globalAudioContent = getGlobalAudioConfig()

  var data = {
    title: $('#name').val(),
    saytext: $('#intro').val() || ' ',
    charge: $('input[type="radio"][name="chargeType"]:checked').val(),
    cost: $('#chargeStandard').val(),
    pic: $('input[name="pic"]').val(), // 缩略图地址, 多个用,隔开
    background: $('#file_btnAutoAudio_path').val(),
    bgFileName: $('#btnAutoAudio>span').text(),
    pages: pagesInfo.data,
    delPageIds: pagesInfo.delPageIds,
    point_size: GLOBAL.POINT_SIZE,
    back_color: GLOBAL.BACK_COLOR,
    content: JSON.stringify(globalAudioContent)
  }

  if (pagesInfo.isDelGlobalAudio) {
    data.content = '{}'
  }

  if (data.title.trim() === '') {
    alert('点读页名称不能为空!')
    return
  }

  // 需要传给后台的参数
  data.teamid = teamid
  data.unitid = unitid
  data.userid = userid
  data.checked = 1 // 验证 是否审核通过

  // 如果是编辑页面,把当前id传给后端
  if (GLOBAL.ISEDIT.flag) {
    data.id = GLOBAL.ISEDIT.id
  }

  var qrcode = Util.getQueryStringByName('qrcode') || '' // 尹果要求加的参数

  Model.addDianduPage(data, qrcode, function (result) {
    Logger.log('操作成功,返回点读页的id为(videoid)= ', result)

    var msg = '创建成功,点击确定返回单元列表!'
    var returnUrl = '/edu/course/unit_video.php?unitid=' + data.unitid

    if (GLOBAL.ISEDIT.flag) {
      msg = '保存成功!点击确定返回展示页面!'
      returnUrl = '/edu/course/diandu.php?id=' + id
      // 这里的id 是 diandu.php 需要用的 , 而videoid 是点读这边需要用的. [备注下]
    }

    alert(msg)
    window.location.href = returnUrl
  })
}
