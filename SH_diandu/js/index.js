/**
 * 2016-3-27 09:02:41
 * 作者 : zhongxia
 * 说明 :
 *      1. fn+数字 表示第几期的函数
 *      2. 共用的方法，会抽取出来，放到一个个闭包里面【每一个类型，一个闭包】
 *      3. 通用的组件，可能封装成一个 组件类，目前有 图文上传 ImgText
 */
/*==========================变量定义 START==================================*/
window.DD = window.DD || {};
window.DD.items = []; //点读的位置记录


/******************************************
 * 全局对象
 ******************************************/
var GLOBAL = {
  PAGECOUNT: 1,                        // 点读页数量
  PREFIX_DIANDU: "__diandu",          // 点读位文件类型列表的ID前缀
  SCREENTYPE: "",                     //屏幕类型，横屏，或者竖屏[选中之后，所有点读页都一致]
  ISSELECTEDSCREENTYPE: false,        //是否选中了点读页类型
  H_IMGSCALE: 1920 / 1080,  //横屏比例点
  V_IMGSCALE: 1080 / 1760,  //竖屏比例点
  OLDWIDTH: 1200,  //创建页面的横屏宽度
  OLDHEIGHT: 960,  //创建页面的竖屏高度
  SCREENSIZE: {
    h: {width: 1200, height: 675},
    v: {width: 540, height: 960}
  },
  ISEDIT: {
    flag: false                       //是否为编辑页面,默认为false
  }
}
/***************************************
 * 程序入口
 ***************************************/
$(function () {
  var _id;
  //本地测试[上传FTP注释掉]
  if (window.location.host.indexOf('localhost') !== -1) {
    _id = Util.getQueryStringByName('id');
    teamid = 3100;
    unitid = 184;
    userid = 92;
  }
  else {
    _id = videoid;
  }
  _id ? _edit.initEdit(_id) : _create.initCreate();
  bindEvent();
});


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
      auto: true, //关闭自动上传
      removeTimeout: 1, //文件队列上传完成1秒后删除
      swf: 'js/lib/uploadify/uploadify.swf',
      uploader: 'php/uploadify.php',
      method: 'post', //方法，服务端可以用$_POST数组获取数据
      buttonText: '', //设置按钮文本
      multi: true, //允许同时上传多张图片
      uploadLimit: 100, //一次最多只允许上传10张图片
      fileTypeDesc: 'Image Files',
      fileTypeExts: '*.gif;*.jpg;*.png',
      fileSizeLimit: "2GB", //限制上传的图片不得超过约等于2G
      onUploadSuccess: function (file, data, response) { //每次成功上传后执行的回调函数，从服务端返回数据到前端
      },
      onError: function (event, queueId, fileObj, errObj) {
        console.log('upload error', event)
      }
    };
    // 合并参数
    config = $.extend({}, defaultConfig, config);
    $file.uploadify(config);
  }

  return {
    setUploadify: setUploadify
  }
})();


/***************************************
 * window.DD.items 数据对象方法
 ***************************************/
var _data = (function () {
  /**
   * 根据id，设置数据仓库点读位置数据
   * @param  {[type]} id 点读的id ,类似  1_1
   * @return {[type]}    [description]
   */
  function setDDItems(id, config) {
    //点读背景默认从1开始，所以，这里减1
    var index = parseInt(id.split('_')[0]);
    var arr = window.DD.items[index - 1]['data'];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].id == id) {
        arr[i] = $.extend({}, arr[i], config);
        break;
      }
    }
  }

  /**
   * 根据id 获取 点读位置的数据
   * @param id  点读位置标识  类似 1_1
   */
  function getDDItems(id) {
    var index = parseInt(id.split('_')[0]);
    var arr = window.DD.items[index - 1]['data'];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].id == id) {
        return arr[i];
      }
    }
  }

  /**
   * 获取有效的点读位
   * @return {[type]} [description]
   */
  function getValidItems() {
    var destArr = [];
    var delPageIds = '';
    var srcArr = window.DD.items;
    ArrayUtil.sortByKey(srcArr, 'sort');

    //点读页
    for (var i = 0; i < srcArr.length; i++) {
      if (!srcArr[i].isRemove) { //去掉已经删除的点读页
        var destPage = {
          name: srcArr[i].name,
          pic: srcArr[i].pic,
          h: srcArr[i].h,
          w: srcArr[i].w,
          id: srcArr[i]['oldId']
        };

        //点读位
        var destItems = [];
        var items = srcArr[i]['data'];

        for (var j = 0; j < items.length; j++) {

          if (!items[j].isRemove && !isEmpty(items[j])) {
            var obj = {
              x: items[j].x,
              y: items[j].y,
              filename: items[j].filename,
              url: items[j].url,
              title: items[j].title,
              content: items[j].content,
              questions: JSON.stringify(items[j].questions),
              type: _data.getTypeByName(items[j].type)
            }
            if (items[j]['oldId']) obj['id'] = items[j]['oldId'];
            destItems.push(obj);
          }
        }

        destPage['points'] = destItems;
        destArr.push(destPage)
      }
      else {
        delPageIds += srcArr[i]['oldId'] + ',';
      }
    }
    delPageIds = delPageIds.length > 0 ? delPageIds.substr(0, delPageIds.length - 1) : '';
    return {
      data: destArr,
      delPageIds: delPageIds
    };
  }

  /**
   * 根据类型名字，获取类型的ID
   * @return {[type]} [description]
   */
  function getTypeByName(typeName) {
    // TODO：有其他类型，在添加
    switch (typeName) {
      case 'video':
        return 1;
      case 'audio':
        return 2;
      case 'imgtext':
        return 3;
      case 'exam':
        return 4;
      default:
        return 1;
    }
  }

  /**
   * 判断创建的点读是否为空[没有上传数据]
   * @param item 点读位数据
   */
  function isEmpty(item) {
    //如果这些每一项都为空,则表示为空的点读位
    if (item.content || item.filename || item.questions || item.title || item.url) {
      return false;
    }
    return true;
  }

  return {
    getDDItems: getDDItems,
    setDDItems: setDDItems,
    getValidItems: getValidItems,
    getTypeByName: getTypeByName
  }
})();


/***************************************
 * 创建相关操作
 ***************************************/
var _create = (function () {
  /**
   * 默认创建一个点读背景页
   */
  function initCreate() {
    addDianDuPageTpl();
  }

  return {
    initCreate: initCreate
  }
})();


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
      console.log("data", data)
      _initFormData(data);
      _initPages(data.pages);
      //把数据解析到window.DD.items里面
      _data2DDItems(data);
      GLOBAL.ISEDIT = {
        flag: true,
        id: id
      }
    })
  }

  /**
   * 初始化点读背景页
   * @param pages
   * @private
   */
  function _initPages(pages) {
    for (var i = 0; i < pages.length; i++) {
      var pageIndex = i + 1;
      var picW = parseFloat(pages[i]['w']);
      var picH = parseFloat(pages[i]['h']);
      var picPath = pages[i]['pic']
      var picName = pages[i]['name'] || "";
      var points = pages[i]['points'];

      GLOBAL.ISSELECTEDSCREENTYPE = true;  //已经选中点读页的类型(横屏或者竖屏)

      //生成点读背景图
      addDianDuPageTpl();
      addDianduPageByUpload(pageIndex, picName, picPath);
      setBgImageScale(picPath, "#id_bg" + pageIndex);
      //设置上传的图片信息,以及修改提示信息
      $('.sort-info').show();
      var _$fileBg = $("#file_bg" + pageIndex);
      _$fileBg.parent().find('.filename').text(picName);

      //生成点读位
      for (var j = 0; j < points.length; j++) {
        var point = points[j];
        //初始化点读位
        _initPointByData(pageIndex, picW, picH, point);
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
    if (data['background'])
      $('#btnAutoAudio>span').text(data['background'])
  }

  /**
   * 根据数据快速生成点读位[不根据点击事件]
   * @param pageIndex     背景图下标
   * @param w             背景图 w
   * @param h             背景图 h
   * @param x             点读位top
   * @param y             点读位left
   * @private
   */
  function _initPointByData(pageIndex, w, h, point) {
    var x = parseFloat(point['x']) * w;
    var y = parseFloat(point['y']) * h;
    // 获取当前点读页的数据
    var DDPageItems = window.DD.items[pageIndex - 1]['data'];
    //唯一标识该点读位 1_3 第一个点读页的第三个点读位[从1开始算]
    var dataid = pageIndex + "_" + (DDPageItems.length + 1);


    //存放位置信息在全部变量里面，使用按比例的方式存放
    DDPageItems.push({
      x: x / w, //坐标的比例
      y: y / h,
      id: dataid
    });

    //创建点图位置小圆圈，以及上传文件的列表
    var index = DDPageItems.length;
    var id = GLOBAL.PREFIX_DIANDU + dataid;

    createCircle(pageIndex, id, index, x, y);
    addDianDu(pageIndex, id, index);

    //移动点读位【引入了 drag.js 文件，并且把最新位置放到存储器中 START】
    var $pdiv = $('#' + id).parent();

    new Drag($pdiv[0], function (x, y) {
      x += 50;
      y += 50;
      //把移动之后的位置，赋值到window变量里面
      var newxy = getValidXY(x, y, w, h);
      _data.setDDItems(dataid, {x: newxy.x / w, y: newxy.y / h});
    });

    //初始化视频,音频,图文的数据
    _initPointItemData(dataid, point);
  }

  /**
   * 初始化视频,音频,图文的数据  [新增试卷]
   * @param dataid        点读位的唯一标识
   * @param point          点读数据
   * @private
   */
  function _initPointItemData(dataid, point) {
    var type = point['type'];
    var fileName = point['filename'];
    var url = point['url'];

    var ids = dataid.split('_');
    var $currentTarget = $('#uploadSetting' + ids[0]).find('.item' + ids[1]).eq(0);
    var $rightName = $currentTarget.find('.upload-right-name').eq(0);
    var $filemask = $currentTarget.find('.div-file-mask'); //文件上传按钮的遮罩层，用于图文
    $filemask.attr('data-type', type);
    var $target, className;
    $rightName.removeClass('notselect');
    switch (type) {
      case "1":
        className = ".video";
        point['type'] = 'video';
        $rightName.addClass('uploaded').attr('data-src', url).find('span').eq(0).text(fileName);
        break;
      case "2":
        className = ".audio";
        point['type'] = 'audio';
        $rightName.addClass('uploaded').attr('data-src', url).find('span').eq(0).text(fileName);
        break;
      case "3":
        className = ".imgtext";
        point['type'] = 'imgtext';
        $rightName.addClass('uploaded-imgtext').find('span').eq(0).text('图文已上传(点击编辑)');
        $filemask.show().off().on('click', fn2_uploadImgText);
        break;
      case "4":
        className = ".exam";
        point['type'] = 'exam';
        $rightName.addClass('uploaded-exam').find('span').eq(0).text('试卷已上传(点击编辑)');
        $filemask.show().off().on('click', fn2_examCreate);
        break;
    }
    $target = $currentTarget.find(className).eq(0);
    var pdata = $target.parent().data(); //点读位文件类型列表data-数据(文件列表的ul)
    var id = pdata.id;
    //设置上传类型的默认图标--》设置选中的图片
    setUnSelectImgSrc($currentTarget);
    setHoverImgSrcx($target);
    $('#__file' + id).hide();
  }

  function _data2DDItems(data) {
    $('input[name="pic"]').val(data['pic']);
    var pages = data.pages;
    for (var i = 0; i < pages.length; i++) {
      window.DD.items[i]['oldId'] = pages[i]['id'];
      for (var j = 0; j < pages[i]['points'].length; j++) {
        var obj = pages[i]['points'][j];
        window.DD.items[i]['data'][j]['oldId'] = obj['id'];
        window.DD.items[i]['data'][j]['url'] = obj['url'];
        window.DD.items[i]['data'][j]['filename'] = obj['filename'];
        window.DD.items[i]['data'][j]['title'] = obj['title'];
        window.DD.items[i]['data'][j]['content'] = obj['content'];
        window.DD.items[i]['data'][j]['type'] = obj['type'];
        window.DD.items[i]['data'][j]['questions'] = obj['questions'];
      }
    }
  }

  return {
    initEdit: initEdit
  }
})();


/*************************编辑页面 END**************************/
/**
 * 设置背景图的缩放
 * @param path
 * @param id
 */
function setBgImageScale(path, id) {
  //获取图片的宽高
  Util.getImageWH(path, null, function (obj) {
    var bgSize = '100% auto';
    var currentScale = obj.w / obj.h;

    //竖屏
    if (GLOBAL.SCREENTYPE === 'v') {
      if (currentScale > GLOBAL.V_IMGSCALE) {
        bgSize = '100% auto';
      } else {
        bgSize = 'auto 100%';
      }

      //竖屏 , 宽度小于 竖屏宽度, 不缩放,不放大
      if (obj.w < GLOBAL.SCREENSIZE.v.width) {
        bgSize = "auto auto";
      }
    }
    //横屏
    else {
      if (currentScale > GLOBAL.H_IMGSCALE) {
        bgSize = '100% auto';
      } else {
        bgSize = 'auto 100%';
      }

      //横屏 , 高度小于 横屏高度, 不缩放,不放大
      if (obj.h < GLOBAL.SCREENSIZE.h.height) {
        bgSize = "auto auto";
      }
    }
    console.log(id, bgSize)
    $(id).css('background-size', bgSize);
  })
}

/*************************设置背景图的缩放比例 END**************************/

/**
 * 绑定事件
 */
function bindEvent() {
  // 提交
  $('#btnSubmit').on('click', handleSubmit);
  // 添加点读页
  $('#btnAdd').on('click', addDianDuPageTpl);
  //收费标准验证只能输入数字和小数点
  $('#chargeStandard').on('keyup', function (e) {
    var $tar = $(e.target);
    $tar.val($tar.val().replace(/[^\d.]/g, ''))
  });

  _upload.setUploadify($('#file_btnAutoAudio'), {
    width: '100%',
    height: '50',
    multi: false,
    fileTypeDesc: 'Audio Files',
    fileTypeExts: '*.mp3',
    onUploadSuccess: function (file, resultPath) {
      $('#file_btnAutoAudio_path').val(resultPath);
      $('#btnAutoAudio>span').text(file.name);
    }
  });
}


/**
 * 横竖切换操作
 * @return {[type]} [description]
 */
function bindH2V() {
  //TODO: 二期：背景图横竖屏切换 [已经去掉,可以考虑清除]
  $('.bigimg-h2s-right').on('click', function (e) {
    if (!GLOBAL.ISSELECTEDSCREENTYPE) {
      $tar = $(e.target);
      //切换横竖屏按钮图标
      var src = $tar.attr('src');
      $tar.attr('src', $tar.attr('data-src'));
      $tar.attr('data-src', src);
      //背景图
      var $bg = $tar.parent().parent().find('.setting-bigimg-img');
      //背景刚开始是横屏
      if (src.indexOf('h2v') !== -1) {
        GLOBAL.SCREENTYPE = "v";
        $bg.css(GLOBAL.SCREENSIZE[GLOBAL.SCREENTYPE])
        $('.v-tip').show();
        $('.h-tip').hide();
        $bg.find('.setting-bigimg-tip-h').hide();
        $bg.find('.setting-bigimg-tip-v').show();
      } else { //背景是竖屏
        GLOBAL.SCREENTYPE = "h";
        $('.v-tip').hide();
        $('.h-tip').show();
        $bg.find('.setting-bigimg-tip-v').hide();
        $bg.find('.setting-bigimg-tip-h').show();
      }
      $bg.css(GLOBAL.SCREENSIZE[GLOBAL.SCREENTYPE])
    }
  })
}
/*==========================动态创建页面，根据模板 START==================================*/
/**
 * 添加点读页
 */
function addDianDuPageTpl() {
  var style;
  if (GLOBAL.SCREENTYPE) {
    style = {style: "width:" + GLOBAL.SCREENSIZE[GLOBAL.SCREENTYPE].width + "px; height:" + GLOBAL.SCREENSIZE[GLOBAL.SCREENTYPE].height + "px"};
  }
  var data = {
    index: GLOBAL.PAGECOUNT,
    visible: GLOBAL.ISSELECTEDSCREENTYPE ? 'none' : 'block'
  };
  data = $.extend(true, data, style);
  var tpls = Handlebars.compile($("#tpl_bg").html());
  $('#id_diandupages').append(tpls(data));
  //初始化上传控件
  setUploadControl(GLOBAL.PAGECOUNT);
  // 绑定横竖切换按钮的事件
  bindH2V();

  //没每添加一个点读页，就在这里添加一个数组
  window.DD.items.push({
    id: GLOBAL.PAGECOUNT, //id 用来标识该点读页
    sort: GLOBAL.PAGECOUNT, //排序的顺序
    pic: '', //背景图地址
    name: '', //名称
    data: [] //点读位数组
  });
  GLOBAL.PAGECOUNT++;
}

/**
 * 创建点读位置
 * @param  {id}  当前点读位置的ID
 * @param  {index}  点读位置的显示的编号
 * @param  {left}  点读位置的偏移量  left
 * @param  {top}  点读位置的偏移量  top
 */
function createCircle(pageIndex, circleid, index, left, top) {
  left = left || 0;
  top = top || 0;
  var pid = "#id_bg" + pageIndex;
  var style = "style='position:absolute; left:" + left + "px; top :" + top + "px;'";
  var html = "";
  html += '<div class="radius" ' + style + '>';
  html += '    <div id="' + circleid + '" class="radius_in">' + index + '</div>';
  html += '</div>';
  $(pid).append(html);
}


/**
 * 添加点读设置项
 */
function addDianDu(pageIndex, dianduItemid, index) {
  var settingId = "#uploadSetting" + pageIndex;
  var data = {
    id: dianduItemid,
    index: index
  }
  var tpls = Handlebars.compile($("#tpl_uploadSetting").html());
  $(settingId).append(tpls(data));
  // 点读设置项
  $('.upload-item').off().on('click', handleUploadItem);
}


/*==========================uploadify控件设置  START==================================*/


/**
 * [CORE]
 * 【上传背景图】,上传之后的一直操作
 * 初始化上传控件
 * @return {[type]} [description]
 */
function setUploadControl(index) {
  //index 从 1 开始
  var file_bg = "#file_bg" + index;
  var newIndex = index;

  _upload.setUploadify($(file_bg), {
    onUploadSuccess: function (file, resultPath, response) {
      GLOBAL.ISSELECTEDSCREENTYPE = true;  //已经选中点读页的类型
      //移除上传按钮,显示上传的文件信息
      var oldIndex = newIndex;
      //upload muitl image
      if (this.queueData.filesSelected > 1) {
        //first image not add DianduPage
        if (newIndex !== index) {
          addDianDuPageTpl();
        }
        addDianduPageByUpload(newIndex, file.name, resultPath);
        newIndex++;
      }
      else {
        addDianduPageByUpload(index, file.name, resultPath);
      }

      //设置上传的图片信息,以及修改提示信息
      $('.sort-info').show();
      var _$fileBg = $("#file_bg" + oldIndex);
      _$fileBg.parent().find('.filename').text(file.name);
      console.log("newIndex", oldIndex)
      setBgImageScale(resultPath, "#id_bg" + (oldIndex))
    }
  });
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
    GLOBAL.SCREENTYPE = GLOBAL.SCREENTYPE || "h"; //默认横屏

    var id_bg = "#id_bg" + index;
    var $bg = $(id_bg);

    var src = resultPath;   //PHP返回的资源路径
    // TODO：上传文件的路径
    //var src = FILEBASEPATH + file.name; //统一改成使用返回的路径

    $bg.css('backgroundImage', 'url("' + src + '")');

    $bg.parent().find('.setting-bigimg-header>span').eq(0).hide();
    $bg.parent().find('.setting-bigimg-header>span').eq(1).show();
    $bg.parent().find('.bigimg-h2s-right').hide();

    // 判断是横屏还是竖屏，点读页操作按钮位置不一样的位置[800是取540~1200的中间值，随便都可以]
    if ($bg.width() > 800) {
      $bg.parent().find('.hide').removeClass('hide');
    } else {
      $bg.parent().find('.hide').removeClass().addClass('bigimg-v');
    }

    $('.btn_start').show();
    $('.bigimg-tip').hide();

    window.DD.items[index - 1]['name'] = fileName;
    window.DD.items[index - 1]['pic'] = src;
    window.DD.items[index - 1]['w'] = $bg.width();
    window.DD.items[index - 1]['h'] = $bg.height();

    bindDianDuPageEvent();
  }
}

/**
 * 绑定点读页的事件
 * @return {[type]} [description]
 */
function bindDianDuPageEvent() {
  $('.setting-bigimg-img').off()
    .on('click', addDianDuLocation);

  // 点读页上下移动操作
  $('.setting-bigimg-header ul').off()
    .on('click', dianduPageOperator)

  $('.upload-item').off()
    .on('click', handleUploadItem);


  $('.div-file-mask').off()
    .on('click', function (e) {
      var type = $(e.target).attr('data-type');
      if (type === "3") {
        fn2_uploadImgText(e);
      }
      else if (type === "4") {
        fn2_examCreate(e);
      }
    });
}

/*==========================图片选中，不选中状态设置 START==================================*/

/**
 * 设置图标选中的图片地址
 * @param {[type]} $target [点击图标的Jquery对象]
 */
function setHoverImgSrcx($target) {
  var imgSrc = $target.css('backgroundImage');
  if (imgSrc.indexOf("_on") === -1) {
    var srcs = imgSrc.split('.png');
    var hoverImgSrc = srcs[0] + '_on.png' + srcs[1];
    $target.css('backgroundImage', hoverImgSrc);
  } else {
    var srcs = imgSrc.split('_on');
    var hoverImgSrc = srcs[0] + srcs[1];
    $target.css('backgroundImage', hoverImgSrc);
  }
}

/**
 * 设置默认的图标
 * @param {[type]} $currentTarget [绑定点击事件的标签,Jquery对象]
 */
function setUnSelectImgSrc($currentTarget) {
  var $imgs = $currentTarget.find('.upload-type li');
  $imgs.each(function (index, el) {
    $el = $(el);
    var imgSrc = $el.css('backgroundImage');
    if (imgSrc.indexOf("_on") != -1) {
      var srcs = imgSrc.split('_on');
      var hoverImgSrc = srcs[0] + srcs[1];
      $el.css('backgroundImage', hoverImgSrc);
    }
  });
}

/*==========================点读位置拖动，下载点读位的文件 START==================================*/
/**
 * 获取有效的XY坐标，防止超出背景图
 */
function getValidXY(ex, ey, w, h) {
  // 不允许超过背景图之外
  var x = ex - 50; //减去圆的半径
  var y = ey - 50;

  if (ex - 50 < 0) {
    x = 0;
  }
  if (ey - 50 < 0) {
    y = 0;
  }
  if (ex + 50 > w) {
    x = w - 100;
  }
  if (ey + 50 > h) {
    y = h - 100;
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
  var src = $(e.target).parent().data().src;
  window.open(src);
}

/*************************************************************
 *              逻辑部分【重点】  START
 *************************************************************/
/**
 * 添加点读位置
 */
function addDianDuLocation(e) {
  e.stopPropagation(); //阻止冒泡，否则背景会触发点击事件
  $tar = $(e.target);
  var w = $tar.width();
  var h = $tar.height();

  //每一个点读页用一个数组来保存
  var pageIndex = parseInt($tar.data().index);
  // 添加点读位置
  if ($tar.hasClass('setting-bigimg-img')) {

    var xy = getValidXY(e.offsetX, e.offsetY, w, h);
    var x = xy.x;
    var y = xy.y;

    // 获取当前点读页的数据
    var DDPageItems = window.DD.items[pageIndex - 1]['data'];
    //唯一标识该点读位
    var dataid = pageIndex + "_" + (DDPageItems.length + 1);
    //存放位置信息在全部变量里面，使用按比例的方式存放
    DDPageItems.push({
      x: x / w, //坐标的比例
      y: y / h,
      id: dataid
    });


    //创建点图位置小圆圈，以及上传文件的列表
    var index = DDPageItems.length;
    var id = GLOBAL.PREFIX_DIANDU + dataid;

    createCircle(pageIndex, id, index, x, y);
    addDianDu(pageIndex, id, index);

    //移动点读位【引入了 drag.js 文件，并且把最新位置放到存储器中 START】
    var $pdiv = $('#' + id).parent();
    $tar.on('selectstart', function () {
      return false;
    });

    new Drag($pdiv[0], function (x, y) {
      x += 50;
      y += 50;
      //把移动之后的位置，赋值到window变量里面
      var newxy = getValidXY(x, y, w, h);
      _data.setDDItems(dataid, {x: newxy.x / w, y: newxy.y / h});
    });
    //移动点读位【引入了 drag.js 文件，并且把最新位置放到存储器中 END】
  }
}


/**
 * 点读项点击事件处理
 */
function handleUploadItem(e) {
  e.preventDefault();
  e.stopPropagation();
  var $currentTarget = $(e.currentTarget);
  var $target = $(e.target);
  var data = $target.data();

  if ($target[0].nodeName === "LI") {
    switch (data.type) {
      // 如果是点击上传的类型,视频或者音频
      case "uploadType":
        fileTypeItemClick(e);
        break;
      // 隐藏按钮
      case "hide":
        hideDDLocation(e);
        break;
      // 删除按钮
      case "delete":
        var itemdata = $target.parent().data();
        $('#' + itemdata.id).parent().remove();
        $currentTarget.remove();

        //在本地数据变量里面标注，已经删除
        var _dataid = itemdata.id.replace(GLOBAL.PREFIX_DIANDU, '');
        _data.setDDItems(_dataid, {isRemove: true});
        break;
      // 默认报错，不处理
      default:
        break;
    }
  }
  //右侧下载按钮
  else if ($target.parent().hasClass('upload-right-name uploaded') && $target[0].nodeName === "IMG") {
    // 根据路径
    downloadFile(e);
  }
}

/**
 * 点图文件上传，文件类型选择，上传框，序号小圆圈样式管理
 * @param  {[type]} e [点击事件对象]
 */
function fileTypeItemClick(e) {
  var $currentTarget = $(e.currentTarget);
  var $target = $(e.target);
  var $filemask = $currentTarget.find('.div-file-mask'); //文件上传按钮的遮罩层，用于图文

  var data = $target.data(); //文件类型，和提示信息（上传什么类型文件）
  var pdata = $target.parent().data(); //点读位文件类型列表data-数据(文件列表的ul)
  var id = pdata.id;
  var _dataid = id.replace(GLOBAL.PREFIX_DIANDU, ''); //在变量里面的唯一标识(eg:1_1)  setItem的数据需要用到这个标识

  //设置上传类型的默认图标--》设置选中的图片
  setUnSelectImgSrc($currentTarget);
  setHoverImgSrcx($target);

  // 设置右边上传位置文字，以及背景颜色
  var $rightName = $currentTarget.find('.upload-right-name');
  $rightName.find('span').html(data.text);
  //未上传文件，设置上传文件的样式
  $rightName.removeClass('notselect').addClass('upload');
  //已经上传文件，修改成 需要上传新的文件
  $rightName.removeClass('uploaded').addClass('upload');
  //已经上传图文文件[二期]
  $rightName.removeClass('uploaded-imgtext').addClass('upload');

  var fileTypeDesc, fileTypeExts;

  //用来遮住uploadify 组件的, 图文和试卷 不需要直接使用上传功能
  $filemask.hide();
  console.log("$filemask", $filemask)

  console.log("data.fileType", data.fileType)
  // 目前只做视频和音频,图文,试卷
  switch (data.fileType) {
    case 'video':
      fileTypeExts = '*.mp4';
      fileTypeDesc = "MP4文件";
      break;
    case 'audio':
      fileTypeExts = '*.mp3';
      fileTypeDesc = "MP3文件";
      break;
    case 'imgtext':
      fileTypeExts = '*.gif;*.jpg;*.png';
      fileTypeDesc = "Image 文件";
      $filemask.show().off().on('click', fn2_uploadImgText);
      break;
    case 'exam':
      fileTypeExts = '*.gif;*.jpg;*.png';
      fileTypeDesc = "Image 文件";
      $filemask.show().off().on('click', fn2_examCreate);
      break;
    default:
      fileTypeExts = '*.gif;*.jpg;*.png';
      fileTypeDesc = "Image 文件";
      break;
  }

  //把文件类型，保存到变量里面
  _data.setDDItems(_dataid, {type: data.fileType});

  $('#__file' + id + '-queue').remove();

  //设置上传文件用 uploadify插件,并且透明化按钮
  _upload.setUploadify($('#__file' + id), {
    width: '100%',
    height: '100%',
    fileTypeExts: fileTypeExts,
    fileTypeDesc: fileTypeDesc,
    onUploadSuccess: function (file, resultPath) {
      if (resultPath.indexOf('error') === -1) {
        var $rightName = $('#__file' + id).parent().parent();
        var fileSrc = resultPath;
        $rightName.attr('data-src', fileSrc);

        $rightName.removeClass('upload').addClass('uploaded');
        $rightName.find('span').html(file.name);

        _data.setDDItems(_dataid, {url: fileSrc, filename: file.name});
      }
    }
  });

  $('#__file' + id + ' object').css('left', 0);
}

/**
 * 上传图文[共用一个图文上传页]  TODO:zhongxia
 * @return {[type]} [description]
 */
function fn2_uploadImgText(e) {
  //获取 id
  var ids = CommonUtil.getIds(e);
  var _isEdit = ids.isEdit;
  var pageId = ids.pageId;
  var dianduId = ids.dianduId;

  // 常规操作,获取数据的方式,由点击创建时传过来的
  window.imgText = window.imgText || null;
  var data = window.DD.items[pageId].data[dianduId];

  if (!window.imgText) {
    window.imgText = new ImgText('body', data,
      function (result, file, sResult) {
        //图文 上传图片之后的回调
      }, function (result) {
        _data.setDDItems(result.id, result);
        //这个不能写外面，否则会被缓存起来
        var ids = result.id.split('_');
        var $uploadRight = $('#uploadSetting' + ids[0]).find('.item' + ids[1]).find('.upload-right').eq(0);
        $uploadRight.find('.upload').removeClass('upload').addClass('uploaded-imgtext')
        $uploadRight.find('.upload-right-name span').text('图文已上传(点击编辑)');
      }).init();

    //如果是编辑页面,则第一次就需要赋值初始值
    if (_isEdit) {
      window.imgText.data = data;
      window.imgText.reset();
      window.imgText.set(data);
      window.imgText.show();
    }

  } else {
    //更新 图文上传组件 上的data，保证所有点读页共用一个 图文上传页面，参数参数是正确的
    window.imgText.data = data;
    window.imgText.reset();
    window.imgText.set(data);
    window.imgText.show();
  }
}

/**
 * 上传试卷[20150507]
 */
function fn2_examCreate(e) {
  var ids = CommonUtil.getIds(e);
  // 试卷数据
  var examData = _data.getDDItems(ids.id) || {};
  if (typeof examData['questions'] === "string") {
    examData['questions'] = JSON.parse(examData['questions']);
  }
  new ExamCreate('#_examCreate', examData, function (submitData) {
    //标识试卷已经上传
    var $uploadRight = $('#uploadSetting' + (ids.pageId + 1)).find('.item' + (ids.dianduId + 1)).find('.upload-right').eq(0);
    $uploadRight.find('.upload').removeClass('upload').addClass('uploaded-exam')
    $uploadRight.find('.upload-right-name span').text('试卷已上传(点击编辑)');

    layer.close(_layer);
    _data.setDDItems(ids.id, submitData);
  })
  var _layer = layer.open({
    type: 1,
    title: '上传试卷',
    shadeClose: false,
    content: $('#_examCreate')
  });
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
    //计算出当前数据的ID,然后去window.DD.items 里面获取数据 [针对点读页上下移动,重新绑定事件获取数据的方式]
    var id, _isEdit = false;
    if ($(e.target).parent().find('.uploadify').attr('id')) {
      id = $(e.target).parent().find('.uploadify').attr('id');
    } else {
      id = $(e.target).parent().find('input').attr('id');  //编辑由于没有初始化uploadify,所有获取id的方式使用这种
      _isEdit = true;
    }
    id = id.replace('__file__diandu', '');
    var pageId = parseInt(id.split('_')[0]) - 1;
    var dianduId = parseInt(id.split('_')[1]) - 1;
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
})();

/**
 * 隐藏点读位置
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
function hideDDLocation(e) {
  var $currentTarget = $(e.currentTarget);
  var $lis = $currentTarget.find('.upload-type li');
  var $target = $(e.target);
  var $rightName = $currentTarget.find('.upload-right-name');
  // 该点读位置的下标，就是ＩＤ
  var index = $(e.currentTarget).attr('data-index');

  var data = $target.data();
  setHoverImgSrcx($target);

  var itemdata = $target.parent().data();
  var _dataid = itemdata.id.replace(GLOBAL.PREFIX_DIANDU, '');

  var $itemSortId = $('#item' + itemdata.id);  //序号
  // 隐藏点读位
  if ($target.attr('data-show') === "0") {
    $target.attr('data-show', "1");

    var style = {
      'background': '#7F7F7F',
      'textDecoration': 'line-through'
    };
    $('#' + itemdata.id).css(style);  //背景上的点读位置
    $itemSortId.css(style);
    $itemSortId.prev().css('visibility', 'initial');  //隐藏的图片展示出来

    _data.setDDItems(_dataid, {hide: true});

    // TODO:理论上，隐藏之后，文件类型的点击事件是不可以用的，目前产品没有要求做
    //记录旧的样式，等显示在赋值上去
    for (var i = 0; i < $lis.length; i++) {
      var $li = $($lis[i]);
      $li.attr('data-style', $li.attr('style'));
      $li.removeAttr('style');
    }
    ;
    //设置右侧名称【上传文件按钮】
    $rightName.attr('data-class', $rightName.attr('class'));
    $rightName.removeClass().addClass('upload-right-name notselect');
  }
  //显示点读位
  else {
    var style = {
      'background': '#66CCCC',
      'textDecoration': 'none'
    };
    $target.attr('data-show', "0");

    $('#' + itemdata.id).css(style);
    $itemSortId.css(style);
    $itemSortId.prev().css('visibility', 'hidden');
    $('#item' + itemdata.id).css(style);

    for (var i = 0; i < $lis.length; i++) {
      var $li = $($lis[i]);
      $li.attr('style', $li.attr('data-style'));
    }
    ;
    // 还原
    $rightName.removeClass().addClass($rightName.attr('data-class'));
    _data.setDDItems(_dataid, {hide: false});
  }
}

/*=====================================点读位置相关JS逻辑事件 END=============================================*/

/*=====================二期，点读页上下移动，显示删除隐藏 START==========================*/
/**
 * 点读页上下操作的点击事件
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
function dianduPageOperator(e) {
  var $tar = self = $(e.target);
  var $bgItem = $(e.currentTarget).parentsUntil('.diandupageitem').parent();
  var sortIndex = parseInt($bgItem.attr('data-index')); //下标

  switch ($tar.attr('class')) {
    case 'down':
      var _old = self.closest(".diandupageitem");
      var _new = self.closest(".diandupageitem").next().next();
      if (_new.length > 0) {
        var _temp = _old.html();
        _old.empty().append(_new.html());
        _new.empty().append(_temp);
      }
      ArrayUtil.nextItem(window.DD.items, 'sort', sortIndex);

      // 移动位置之后，需要重新绑定事件，和上传控件，否则会事件不起作用
      setUploadControl(sortIndex); //重新设置上传控件
      setUploadControl(_new.data().index);
      bindDianDuPageEvent(); //需要重新绑定事件
      break;
    case 'up':
      var _old = self.closest(".diandupageitem");
      var _new = self.closest(".diandupageitem").prev().prev();
      if (_new.length > 0) {
        var _temp = _old.html();
        _old.empty().append(_new.html());
        _new.empty().append(_temp);
      }
      ArrayUtil.prevItem(window.DD.items, 'sort', sortIndex);
      setUploadControl(sortIndex);
      setUploadControl(_new.data().index);
      bindDianDuPageEvent();
      break;
    case 'hide1':
      $tar.hide();
      $tar.next('.show1').show();
      $bgItem.find('._mask').show();
      break;
    case 'show1':
      $tar.hide();
      $tar.prev('.hide1').show();
      $bgItem.find('._mask').hide();
      break;
    case 'del':
      layer.confirm('确定删除该点读页？', {
        btn: ['确定', '取消'] //按钮
      }, function (index) {
        layer.close(index);
        $bgItem.prev('hr').remove();
        $bgItem.remove();
        delDDItem($bgItem.attr('data-index'));
      });
      break;
  }
}

/**
 * 删除点读页
 * @param  {[type]} id [description]
 * @return {[type]}    [description]
 */
function delDDItem(id) {
  var arr = window.DD.items;
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].id == id) {
      arr[i]['isRemove'] = true; //标记删除
    }
  }
}


/*=====================二期，点读页上下移动，显示删除隐藏 END==========================*/
/**
 * 提交
 */
function handleSubmit(e) {
  var _pagesInfo = _data.getValidItems();
  var data = {
    title: $('#name').val(),
    saytext: $('#intro').val(),
    charge: $('input[type="radio"][name="chargeType"]:checked').val(),
    cost: $('#chargeStandard').val(),
    pic: $('input[name="pic"]').val(),  //缩略图地址, 多个用,隔开
    background: $('#file_btnAutoAudio_path').val(),
    pages: _pagesInfo.data,
    delPageIds: _pagesInfo.delPageIds
  }

  //小组ID，开发用3000
  data.teamid = teamid;  //Util.getQueryStringByName('teamid') || 3000;
  data.unitid = unitid;  //Util.getQueryStringByName('unitid') || 405;
  data.userid = userid;
  data.checked = 1

  //如果是编辑页面,把当前id传给后端
  if (GLOBAL.ISEDIT.flag) {
    data.id = GLOBAL.ISEDIT.id
  }

  //如果有删除的话
  if (data.delPageIds.length > 0) {
    var _ids = data.delPageIds.split(',');
    for (var i = 0; i < _ids.length; i++) {
      Model.delDianduPage(_ids[i]);
    }
  }

  Model.addDianduPage(data, function (result) {
    console.log("操作成功,返回点读页的id为(videoid)= ", result)

    var msg = "创建成功,点击确定返回单元列表!";
    var returnUrl = "/edu/course/unit_video.php?unitid=" + data.unitid;

    if (GLOBAL.ISEDIT.flag) {
      msg = "保存成功!点击确定返回展示页面!";
      returnUrl = "/edu/course/diandu.php?id=" + id;
      //这里的id 是 diandu.php 需要用的 , 而videoid 是点读这边需要用的. [备注下]
    }

    alert(msg);
    window.location.href = returnUrl;
  });
}
