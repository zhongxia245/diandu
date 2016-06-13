/*=============================定义变量 START===========================*/
var click = Util.IsPC() ? 'click' : 'tap';
var bgAudio, audio, video;
var GLOBAL = {
  PREBGID: '_diandu',  //每一个背景页的前缀
  H_IMGSCALE: 1920 / 1080,  //横屏比例点
  V_IMGSCALE: 1080 / 1760,  //竖屏比例点
  OLDWIDTH: 1200,  //创建页面的横屏宽度  上传点读页的时候,横屏默认1200*675,竖屏 540*960,这边会从数据库返回
  OLDHEIGHT: 960,  //创建页面的竖屏高度,
  EXAM_W: 0,
  EXAM_H: 0,
  STARTSIZE: 100,   //点读开关大小
  POINTSIZE: 72,  //点读位缩放前大小
  SEC_EXAM: '.sec-exam',  //考试展示容器
  SEC_EXAM_LIST: '.sec-exam .exam-list',  //考生页面容器
  SEC_QUESTION_LIST: '.sec-exam .question-list',  //题干列表容器
  CURRENTINDEX: 0,
  videoid: 0, // 点读展示的id,
  DEFAULTAUTOPLAYTIME: 15, //自动播放的间隔时间
  PAGESIZE: {  //创建时的容器大小
    W: 1200,
    H: 675
  },
  SCREEN: {
    W: (function () {
      return Util.IsPC() ? 1200 : window.screen.width
    })(),
    H: (function () {
      return Util.IsPC() ? 675 : window.screen.height
    })(),
  }
}
/**
 * 背景音乐相关操作
 */
GLOBAL.BGAUDIO = {
  bgaudio: document.getElementById('bg-audio'),
  audio: document.getElementById('audio'),
  $btnBgAudio: $('#btn_bgAudio'),
  setAudio: function (src) {
    $(this.bgaudio).attr('src', src);
  },
  isOn: function () {
    if (this.$btnBgAudio.attr('src').indexOf('on') !== -1) {
      return true;
    }
    return false;
  },
  play: function () {
    if (this.audio.paused && this.bgaudio.paused) {
      this.bgaudio.play();
      this.$btnBgAudio.attr('src', 'imgs/bg_audio_on.png')
    }
  },
  pause: function () {
    if (!this.bgaudio.paused) {
      this.bgaudio.pause();
      this.$btnBgAudio.attr('src', 'imgs/bg_audio.png')
    }
  },
  hideBtn: function () {
    this.$btnBgAudio.hide();
  },
  setTimePlay: function (duration) {
    duration = duration || 5000;
    var that = this;
    setTimeout(function () {
      if (that.audio.paused) {
        that.play()
      }
    }, duration)
  }
}

var POINTSIZE;
var SCALE = 1; //缩放的比例
var isVertical = false;  //是否为竖屏

window.AUTOPLAYINTERVAL = 0;  //自动播放时间 ,0 为关闭

var DATA; //用来保存请求回来的变量
var _ISCLICKTHUMBS = false; // 记录是否为点击缩略图进行跳转

/*=============================初始化页面 START===========================*/
$(function () {
  init();
});

/*========================页面缩放,横竖屏切换事件 START=====================*/
/**
 *横竖屏切换事件,重新绘制点读页
 */
window.addEventListener("orientationchange", function () {
  // 宣布新方向的数值
  console.log(window.orientation);

  //直接重置有BUG, 需要停顿一下
  setTimeout(function () {
    fn_onResize();
  }, 100)

}, false);

/**
 * 窗口变化时展示
 */
function fn_onResize() {
  console.log("trigger onresize")
  window.W = $(window).width();
  window.H = $(window).height();
  $('#main').css({
    height: window.H,
    width: window.W
  });

  var _size;
  if (W > H) {
    //横屏
    SCALE = (window.W / GLOBAL.OLDWIDTH);
    $('.cd-close').removeClass('cd-close-v');
    $('#div_video').css({
      width: '80%',
      height: '60%',
      position: 'relative',
      top: '20%'
    })

    GLOBAL.EXAM_W = $(window).width() * (1500 / 1920);
    GLOBAL.EXAM_H = $(window).height() * (800 / 1080);

    $('.sec-exam').css({
      height: GLOBAL.EXAM_H,
      width: GLOBAL.EXAM_W,
      left: (window.W - GLOBAL.EXAM_W) / 2,
      top: (window.H - GLOBAL.EXAM_H) / 2
    });

    _size = window.W * 0.28;
    isVertical = false;
  }
  else {
    //竖屏
    SCALE = (window.H / GLOBAL.OLDWIDTH);
    $('.cd-close').addClass('cd-close-v')
    $('#div_video').css({
      width: '100%',
      //height: '75%',
      position: 'relative',
      top: '30%'
    })

    GLOBAL.EXAM_W = $(window).width() * (800 / 1080);
    GLOBAL.EXAM_H = $(window).height() * (1200 / 1920);

    $('.sec-exam').css({
      height: GLOBAL.EXAM_H,
      width: GLOBAL.EXAM_W,
      left: (window.W - GLOBAL.EXAM_W) / 2,
      top: (window.H - GLOBAL.EXAM_H) / 2
    });

    _size = window.W * 0.5;
    isVertical = true;
  }

  $('.sec-imgtext-main').css({width: _size, height: _size});

  POINTSIZE = SCALE * GLOBAL.POINTSIZE;

  //设置顶部进度条的宽高
  styleHandler();

  if (DATA) {
    $('.gallery-main').css('opacity', 0).show();
    initDiandu(DATA);
  }
}

/**
 * 横竖屏样式处理[批量添加需求]
 */
function styleHandler() {
  var $scrollBar = $('#scroll-bar');
  var $tip = $('#txtTip')
  var $btn_bgAudio = $('#btn_bgAudio');
  if (isVertical) {
    $scrollBar.css({
      width: '80%'
    });
    $tip.css({
      width: '60%',
      marginBottom: '10px'
    })
    $tip.find('div').css({
      float: 'left'
    })
    $btn_bgAudio.css({margin: '-4px 0', width: '85px'});
  } else {
    $scrollBar.css({
      width: '45%'
    })
    $tip.css({
      width: '30%',
      marginBottom: '0px'
    })
    $tip.find('div').css({
      float: 'none'
    })
    $btn_bgAudio.css({margin: '9px 0 0 10px', width: '100px'});
  }
}

/*========================页面缩放,横竖屏切换事件 END=====================*/

/**
 * 初始化
 */
function init() {
  // 点读页的ID,保存的时候会返回ID
  var id = GLOBAL.videoid = Util.getQueryStringByName('videoid') || 1080;

  Model.getList(id, function (data) {
    DATA = data;

    //排序点读页顺序
    ArrayUtil.sortByKey(data.pages, 'seq');

    initDiandu(data);

    console.log("data", data)

    //页面大小重新渲染放在这边, 微信浏览器显示就不会有问题
    fn_onResize();
  })

  //初始化播放器，页面里面只有一个视频播放器和一个音频播放器,还有一个背景音乐,默认播放
  initBgAudio();
  initAudio();
  initVideo();
}

/**
 * 初始化点读展示页
 * @param  {[type]} data [description]
 */
function initDiandu(data) {
  $('#pages').html('');
  $('#thumbs').html('');
  initPage('pages', data);
  initThumbs('thumbs', data.pages);
  initSwipe();

  //背景音乐相关操作
  if (data['background']) {
    GLOBAL.BGAUDIO.setAudio(data['background']);
    if (GLOBAL.BGAUDIO.isOn()) {
      GLOBAL.BGAUDIO.play();
    }
  } else {
    GLOBAL.BGAUDIO.hideBtn()
  }
  $('.gallery-main').hide();  //默认透明度为0 ,会占位置,让下面的点击不到,这里用隐藏,隐藏起来
}


/**
 * 按比例缩放点读点
 * @param wrap 点读点容器
 * @param scale 比例大小
 */
function setPointSizeScale(wrap, scale) {
  var pointSize = GLOBAL.POINTSIZE * scale;
  setScale(wrap + ' .m-audio', pointSize);
  setScale(wrap + ' .m-audio img', pointSize);
  setScale(wrap + ' .m-video', pointSize);
  setScale(wrap + ' .m-video img', pointSize);


  var startSize;
  if (isVertical) {
    //竖屏
    startSize = GLOBAL.STARTSIZE * GLOBAL.SCREEN.w / 800;
  } else {
    //横屏
    startSize = GLOBAL.STARTSIZE * GLOBAL.SCREEN.w / 1200;
  }
  setScale(wrap + ' .m-dd-start', startSize > 80 ? 80 : startSize);
}


/**
 * 设置大小
 * @param {[type]} selector [description]
 * @param {[type]} size     [description]
 */
function setScale(selector, size) {
  $(selector).css({
    width: size,
    height: size
  })
}

/**
 * [DO: 这个地方 必须初始化, 否则 切换 横竖屏的时候, swiper 每一个页 不占满屏幕]
 * 解决: 使用 swiper.onResize();
 * 初始化左右滑动的插件
 * @return {[type]} [description]
 */
function initSwipe() {

  //PC端,展示左右剪头,只有一个 点读页不展示
  if (Util.IsPC() && DATA.pages.length > 1) {
    $('.swiper-button-next').show();
    $('.swiper-button-prev').show();
  } else {
    $('.swiper-button-next').hide();
    $('.swiper-button-prev').hide();
  }

  // 如果已经初始化了, 则不在初始化 Swiper
  if (!window.galleryTop) {
    window.galleryTop = new Swiper('.gallery-top', {
      autoplayStopOnLast: true,
      nextButton: '.swiper-button-next',
      prevButton: '.swiper-button-prev',
      onSlideChangeEnd: function (swiper) {
        //closeVideoOrAudio();
        GLOBAL.CURRENTINDEX = swiper.activeIndex;  // 记录当前的点读页

        $('#id_pagination_cur').text(swiper.activeIndex + 1);

        var _$thumbsSwipers = $('#thumbs>div[data-id]');
        _$thumbsSwipers.removeClass('swiper-slide-active-custom');
        _$thumbsSwipers.eq(swiper.activeIndex).addClass('swiper-slide-active-custom')

        //!_ISCLICKTHUMBS && window.galleryThumbs.slideTo(swiper.activeIndex);
        //_ISCLICKTHUMBS = true;

        //播放到最后一个,停止自动播放
        if (swiper.activeIndex + 1 === window.DATA['pages'].length) {
          window.silideBar.setValue(110);  //setValue 会调通 时间进度条的 callback事件
        }
      }
    });

    window.galleryThumbs = new Swiper('.gallery-thumbs', {
      slidesPerView: 5,
      spaceBetween: 5,
      freeMode: true
    });
  }

  //大小改变之后, 重新规划大小
  window.galleryTop.onResize()
  window.galleryThumbs.onResize()
  initSlide();
}

/**
 * 初始化时间进度条
 */
function initSlide() {
  //因为窗体改变的时候,onresize会调用该方法,这里判断是否已经设置了自动播放的值
  window.silideBar = new SlideBar({
    actionBlock: 'action-block',
    scrollBar: 'scroll-bar',
    entireBar: 'entire-bar',
    barLength: $('#scroll-bar').width(),
    maxNumber: 30,
    value: 110,
    callback: function (value) {
      var $block = $('#action-block')
      if (value <= 30) {
        $block.removeClass('close').addClass('open');
        $block.text(value);
        window.AUTOPLAYINTERVAL = value * 1000;
        window.galleryTop.stopAutoplay();
        window.galleryTop.params.autoplay = window.AUTOPLAYINTERVAL;
        window.galleryTop.startAutoplay();
      } else {
        $block.removeClass('open').addClass('close')
        $block.text("关");
        window.AUTOPLAYINTERVAL = 0;
        window.galleryTop.stopAutoplay();
      }
    }
  });
  //设置 刚开始 自动播放的间隔时间
  window.silideBar.setValue(GLOBAL.DEFAULTAUTOPLAYTIME);
  //window.galleryTop.stopAutoplay();
}

/*************************************根据数据生成页面 START********************************/
/**
 * 根据返回的数据，动态生成页面(多个)
 * @param  {[type]} id [点读页容器id]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function initPage(id, data) {
  var html = '';

  if (data || data['pages']) {
    var pages = data['pages'];

    $('#id_pagination_total').text(pages.length);
    for (var i = 0; i < pages.length; i++) {
      var subid = GLOBAL.PREBGID + i;  //每一个页面的id

      //获取图片的宽高
      Util.getImageWH(pages[i]['pic'], {subid: subid, page: pages[i], i: i}, function (obj, param) {
        var bgSize = '100% auto';
        var currentScale = obj.w / obj.h;
        var $wrap = $('#' + param.subid).find('.wrap');
        //获取图片大小
        var _imgScale = 1; //竖图  横向100%, 修改缩放比例  创建时,竖图,是纵向100%  当前图片高度/675

        var wrapWidth = window.W;
        var wrapHeight = window.H;
        var _flag = false;

        //设置图片比例
        if (isVertical) {
          if (currentScale > GLOBAL.V_IMGSCALE && currentScale < GLOBAL.H_IMGSCALE) {
            bgSize = '100% auto';
            wrapHeight = wrapWidth * obj.h / obj.w;
            _imgScale = wrapHeight / GLOBAL.PAGESIZE.H
            _flag = true;
          }
          else if (currentScale > GLOBAL.V_IMGSCALE) {
            //竖屏
            //横图
            bgSize = '100% auto';
            wrapHeight = window.W * obj.h / obj.w;  //计算该宽高, 主要为是了兼容早期图片大小为1200  675  没有计算缩放后的大小

            //竖图,横向100%, 重新计算计算缩放比例
            if (obj.h / obj.w > 1) {
              _imgScale = wrapHeight / GLOBAL.SCREEN.H
            }
          }
          else {
            //竖图
            bgSize = 'auto 100%';
            wrapWidth = window.H * obj.w / obj.h;

            //横图,纵向100%, 重新计算计算缩放比例
            if (obj.w / obj.h > 1) {
              _imgScale = wrapWidth / GLOBAL.SCREEN.H
            }
          }
        } else {
          //横屏
          if (currentScale > GLOBAL.V_IMGSCALE && currentScale < GLOBAL.H_IMGSCALE) {
            bgSize = 'auto 100%';
            wrapWidth = window.H * obj.w / obj.h;
            _imgScale = GLOBAL.SCREEN.H / GLOBAL.PAGESIZE.H
            _flag = true;
          }
          else if (currentScale > GLOBAL.H_IMGSCALE) {
            //横图
            bgSize = '100% auto';
            wrapHeight = window.W * obj.h / obj.w;
            if (obj.h / obj.w > 1) {
              _imgScale = wrapHeight / GLOBAL.SCREEN.H
            }
          } else {
            //竖图
            bgSize = 'auto 100%';
            wrapWidth = window.H * obj.w / obj.h;
            if (obj.w / obj.h > 1) {
              _imgScale = wrapWidth / GLOBAL.SCREEN.H
            }
          }
        }
        $('#' + param.subid).css('background-size', bgSize);

        var _pointSizeScale = getPointSizeScale(wrapWidth, wrapHeight)
        if (!_flag) {
          _pointSizeScale = _pointSizeScale * _imgScale;
        } else {
          _pointSizeScale = _imgScale
        }

        //针对小图, 创建的时候, 没有缩放的图片 START
        if (obj.w < GLOBAL.PAGESIZE.W && obj.h < GLOBAL.PAGESIZE.H) {
          if (currentScale > GLOBAL.H_IMGSCALE) {
            //横图
            _pointSizeScale = GLOBAL.SCREEN.H / obj.w
          } else {
            //竖图
            _pointSizeScale = GLOBAL.SCREEN.H / obj.h
          }
        }
        //针对小图, END

        $wrap.css({height: wrapHeight, width: wrapWidth});
        $wrap.html('');
        $wrap.append(initPoints(param, wrapWidth, wrapHeight, _pointSizeScale))

        setPointSizeScale('#' + param.subid, _pointSizeScale);

        //所有点读位置生成结束
        bindEvent();
      })

      html += initDianDuPage(pages[i], subid);
    }
  }
  $('#' + id).html('').html(html);
}

/**
 * 获取点读点的缩放比例
 * 1. 创建时 横图 宽 1200  ==> 点读点 72px
 *          竖图 高 675   ==> 点读点 72px
 * 这里按比例缩放
 * @param imgW 创建时保存的图片宽
 * @param imgH 创建时保存的图片高
 * @returns {number}
 */
function getPointSizeScale(imgW, imgH) {
  if (imgW > imgH) {
    return GLOBAL.SCREEN.W / GLOBAL.PAGESIZE.W;
  } else {
    return GLOBAL.SCREEN.H / GLOBAL.PAGESIZE.H;
  }
}

/**
 * 生成点读页
 * @param data [根据数据生成点读页]
 * @param id 点读页的id
 */
function initDianDuPage(data, id) {
  var bgPath = data['pic'];
  var h = $(window).height()
  var html = "";
  html += '<div id="' + id + '" data-id="' + data['id'] + '" class="m-bg swiper-slide" style="height:' + h + 'px;background-size: 100% 100%;background-image: url(' + bgPath + ');">'
  html += '        <div class="m-dd-start-comment-div"></div>'
  html += '        <div class="m-dd-start"></div>'
  html += '    <div class="wrap">'
  //html += '        <div class="m-dd-start"></div>'
  html += '    </div>'
  html += '</div>'
  return html;
}

/**
 * 生成缩略图【针对批量上传新增的需求】
 */
function initThumbs(id, pages) {
  var html = "";
  for (var i = 0; i < pages.length; i++) {
    var page = pages[i];
    var bgPath = page['pic'];
    html += '<div data-id="' + i + '" class="swiper-slide" style="background-image: url(' + bgPath + ');">'
    html += ' <span class="thumbs-sort-id">' + (i + 1) + '</span>'
    html += '</div>'
  }

  var $thumbs = $('#' + id);
  $thumbs.html('').html(html);

  var $swiperSlide = $thumbs.find('.swiper-slide');
  $swiperSlide.eq(0).addClass('swiper-slide-active-custom');

  if (isVertical) {
    $swiperSlide.css({
      width: $('#thumbs').height() * 9 / 16
    })
  } else {
    $swiperSlide.css({
      width: $('#thumbs').height() * 16 / 9
    })
  }
}

/**
 * 生成点读位【根据类别使用不同的图标,目前只有 视频,音频,图文】
 * @param data 点读点集合数据
 * @param imgW 图片缩放后的宽
 * @param imgH 图片缩放后的高
 * @param scale 缩放比例
 * @returns {string}
 */
function initPoints(data, imgW, imgH, scale) {

  var pointDatas = data['page']['points']

  var html = "";
  html += '<div data-id="all-radius" data-hide="all-radius-hide">'
  for (var i = 0; i < pointDatas.length; i++) {
    //隐藏点, 则不显示出来
    if (pointDatas[i]['hide'] != "1") {
      //这里由于点读位置大小从开始的100变成72,而页面的比例不变,导正点读位置的比例 和 刚创建时的不一致
      var pointSize = scale * GLOBAL.POINTSIZE;
      var left = parseFloat(pointDatas[i].x) * imgW;
      var top = parseFloat(pointDatas[i].y) * imgH;
      var style = 'left:' + left + 'px; top:' + top + 'px; width:' + pointSize + 'px; height:' + pointSize + 'px';
      var type = pointDatas[i]['type'];
      var url = pointDatas[i]['url'];
      var filename = pointDatas[i]['filename'];
      var title = pointDatas[i]['title'];
      var content = encodeURI(pointDatas[i]['content']);  //ZHONGXIA
      var question = pointDatas[i]['questions'];

      var className = '';
      var mediaImg = "";

      switch (type) {
        case 1:
        case "1": //视频
          className = 'm-video';
          mediaImg = '   <img style="display:none;" src="imgs/video_on.png" alt="video" />';
          break;
        case 2:
        case "2": //音频
          className = 'm-audio';
          mediaImg = '   <img style="display:none; border-radius:50%;" src="imgs/audio.gif" alt="audio" />';
          break;
        case 3:
        case "3": //图文
          className = 'm-imgtext';
          mediaImg = '   <img style="display:none; border-radius:50%;" src="imgs/m_imgtext.png" alt="imgtext" />';
          break;
        case 4:
        case "4"://考试
          className = 'm-exam';
          mediaImg = '   <img style="display:none; border-radius:50%;" src="imgs/m_exam.png" alt="imgtext" />';
          break;
        default:
          className = 'm-video';
          break;
      }

      html += '<div class="' + className + '" data-id="' + (data.i + "_" + i) + '" data-title="' + title + '" data-content="' + content + '" data-type="' + type + '" data-url="' + url + '" data-filename="' + filename + '" style="' + style + '">'
      html += mediaImg;
      html += '</div>'
    }
  }
  html += '</div>'
  return html;
}

/*************************************根据数据生成页面 END********************************/
/*=======================音频视频播放相关 START====================*/
function initBgAudio() {
  bgAudio = document.getElementById('bg-audio')
}
function initAudio() {
  audio = document.getElementById('audio');
}

/**
 * 播放或者暂停 音频
 * @param  {[type]} flag [true ，则播放， false 则暂停]
 */
function playOrPaused(flag) {
  if (flag) {
    if (audio.paused)  audio.play();
    GLOBAL.BGAUDIO.pause();
  } else {
    audio.pause();

    //关闭音频的时候,间隔自动播放的时间在启动
    GLOBAL.BGAUDIO.setTimePlay()
  }
}

function initVideo() {
  video = document.getElementById('video');
}

/**
 * 弹出模态框
 */
function triggerBouncyNav($bool) {
  if (!$bool) {
    closeVideoOrAudio();
  }
  //切换菜单动画
  $('.cd-bouncy-nav-modal')
    .toggleClass('fade-in', $bool)
    .toggleClass('fade-out', !$bool)
    .find('li:last-child')
    .one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function () {
      $('.cd-bouncy-nav-modal').toggleClass('is-visible', $bool);
      if (!$bool) {
        $('.cd-bouncy-nav-modal').removeClass('fade-out');
      }
    });
  //判断css 动画是否开启..
  if ($('.cd-bouncy-nav-trigger').parents('.no-csstransitions').length > 0) {
    $('.cd-bouncy-nav-modal').toggleClass('is-visible', $bool);
  }
}

/**
 * 隐藏音频和视频，并且关闭播放
 * @param flag 是否关闭自动播放
 */
function closeVideoOrAudio(flag) {
  if (flag === undefined) flag = true;
  $('.m-audio img').hide(); //隐藏所有的播放GIF图
  var $video = $('.m-video-size');
  $video.find('img').hide();
  $video.removeClass('m-video-size');
  video.pause();
  audio.pause();
  if (flag) {
    GLOBAL.BGAUDIO.pause();
  }
}
/*=======================音频视频播放相关 END====================*/
/*=======================点击事件相关 START====================*/
function bindEvent() {
  // 启动开关
  $('.m-dd-start').off().on(click, function (e) {
    //new ExamComment('.exam-comment', {data: []})
    e.preventDefault();
    e.stopPropagation(); //阻止冒泡，否则背景会触发点击事件

    var $cTar = $(e.currentTarget);
    //var $allRadius = $('div[data-id="all-radius"]');  //隐藏点读页
    var $allRadius = $cTar.parent().find('div[data-id="all-radius"]');  //隐藏当前点读页
    var hideClassName = $allRadius.attr('data-hide');
    var type = $cTar.attr('data-type') || 2;
    var pageid = $cTar.parent().attr('data-id');
    var _dianduid = $cTar.parent().attr('id');
    var div_comment = '#' + _dianduid + " .m-dd-start-comment-div";
    $(div_comment).hide()
    console.log("type", type)
    switch (type) {
      //隐藏
      case 0:
      case "0":
        $cTar.attr('class', 'm-dd-start-hide')
        $allRadius.addClass(hideClassName);
        closeVideoOrAudio(false);
        break;

      //显示点读
      case 1:
      case "1":
        $cTar.attr('class', 'm-dd-start')
        $allRadius.removeClass();
        break;

      //评论
      case 2:
      case "2":
        $(div_comment).show()
        $cTar.attr('class', 'm-dd-start-comment')

        Model.getComment(pageid, function (result) {
          new ExamComment('#' + _dianduid + " .m-dd-start-comment-div", {
            data: result,
            pageid: pageid,
            videoid: GLOBAL.videoid,
            userid: window.__userid
          })
        })

        //关闭自动播放,超出最大范围值, 就显示为关闭
        window.silideBar.setValue(110);
        break;
    }
    $cTar.attr('data-type', (parseInt(type) + 1) % 3)

    ///*点读按钮控制所有点读页的点读位置  2016.3.20 修改 START*/
    //setHoverImgSrcx($('.m-dd-start'));
    //var $allRadius = $('div[data-id="all-radius"]');
    ///*点读按钮控制所有点读页的点读位置  2016.3.20 修改 START*/
    //
    //var hideClassName = $allRadius.attr('data-hide');
    //if ($allRadius.hasClass(hideClassName)) {
    //  $allRadius.removeClass();
    //} else {
    //  $allRadius.addClass(hideClassName);
    //  closeVideoOrAudio(false);
    //}
    return false;
  });

  /**
   * 背景音乐开关按钮
   */
  $('#btn_bgAudio').off().on(click, function (e) {
    if (!GLOBAL.BGAUDIO.isOn()) {
      GLOBAL.BGAUDIO.play();
    } else {
      GLOBAL.BGAUDIO.pause();
    }
  })
  /**
   * 关闭视频播放
   */
  function closeVideo() {
    triggerBouncyNav(false);
    $('#video').hide();
    //关闭音频的时候,间隔自动播放的时间在启动
    GLOBAL.BGAUDIO.setTimePlay()
  }

  /**
   * 视频遮罩层关闭菜单
   */
  $('.cd-bouncy-nav-modal .cd-close').off().on(click, function () {
    closeVideo();
  });

  /**
   * 点击空白处,关闭视频播放窗口
   */
  $('.cd-bouncy-nav-modal').off().on(click, function (event) {
    if ($(event.target).hasClass('cd-bouncy-nav-modal')) {
      closeVideo();
    }
  });

  // 视频
  $('.m-video').off().on(click, function (e) {
    closeVideoOrAudio();
    var $cTar = $(e.currentTarget);
    var $tar = $(e.target);
    var className = 'm-video-size';
    triggerBouncyNav(true);
    $('#video').show();

    if ($tar[0].tagName === "IMG") { // 关闭播放
      $tar.hide();
      $cTar.removeClass(className)
    } else { //开始播放
      var url = $tar.attr('data-url');
      var filename = $tar.attr('data-filename');

      //var jsSrc = $("#videoSource")
      //if (jsSrc.attr('src') !== url) {
      //  jsSrc.attr('src', url);
      //}


      if (video.getAttribute('src') !== url) {
        video.setAttribute('src', url);
      }
      $cTar.addClass(className)
      $tar.find('img').show();
    }

    return false;
  });


  // 音频
  $('.m-audio').off().on(click, function (e) {
    var $tar = $(e.target);
    var $cTar = $(e.currentTarget);
    closeVideoOrAudio();
    var timer = setInterval(function () {
      if (audio.ended) {
        $cTar.find('img').hide();
        playOrPaused(false);
        window.clearInterval(timer);

        if (AUTOPLAYINTERVAL !== 0) {
          window.galleryTop.startAutoplay();
        }
      }
    }, 10)

    if ($tar[0].tagName === "IMG") { // 正在播放
      $tar.hide();
      playOrPaused(false);
    } else { //设置播放
      var url = $tar.attr('data-url');
      var filename = $tar.attr('data-filename');

      if (audio.getAttribute('src') !== url) {
        audio.setAttribute('src', url);
      }
      $tar.find('img').show();
      playOrPaused(true);
    }

    return false;
  })

  // 图文
  $('.m-imgtext').off().on(click, function (e) {
    closeVideoOrAudio(false);
    var $tar = $(e.target);

    var $secImgText = $('.sec-imgtext');
    $secImgText.css({position: 'absolute'});
    $secImgText.show();
    var $secImgTextMain = $('.sec-imgtext-main');
    setImgTextLocation_Scale($tar, $secImgTextMain, $(e.currentTarget).parent().parent());  //设置弹窗的位置

    var _url = $tar.attr('data-url');
    var _title = $tar.attr('data-title');
    var _content = decodeURI($tar.attr('data-content'));
    var $title = $secImgText.find('.sec-imgtext-title');
    var $img = $secImgText.find('.sec-imgtext-img');

    //设置 第二次打开，重新从页面顶部开始查看
    $title.html("");
    $img.attr('src', "");
    $title.show();
    $img.show();
    _title ? $title.html(_title) : $title.hide();
    _url ? $img.attr('src', _url) : $img.hide();
    $secImgText.find('.sec-imgtext-content').html(_content);
  })

  /**
   * 图文展示框
   */
  $('.sec-imgtext').off().on(click, function (e) {
    var $tar = $(e.target);
    if ($tar.attr('class') === "sec-imgtext") {
      $tar.css({position: 'relative'});
      $tar.hide();
    }
  })

  /**
   * 考试点读位
   */
  $('.m-exam').off().on(click, function (e) {
    fnExamClick(e)
  })


  //关闭时间进度条
  $('#btn-close').off().on(click, function (ev) {
    $(".gallery-main").hide();
    return false;
  });

  //点击背景图,停止自动播放
  $('#pages').off().on(click, function (ev) {
    window.galleryTop.stopAutoplay();
    //silideBar.setValue(110);  //setValue 会调通 时间进度条的 callback事件
    return false;
  })

  /**
   * 点击缩略图,跳转到该位置
   */
  if (Util.IsPC()) {
    $('#thumbs .swiper-slide').off().on(click, function (e) {
      var $tar = $(e.currentTarget)
      $tar.parent().find('.swiper-slide').removeClass('swiper-slide-active-custom');
      $tar.addClass('swiper-slide-active-custom');
      window.galleryTop.slideTo(parseInt($tar.attr('data-id')));
      _ISCLICKTHUMBS = true;  // 使用点击缩略图进行跳转的
    })
  } else {
    Util.Moblie_MoveOrTap($('#thumbs .swiper-slide'), function (e) {
      var $tar = $(e.currentTarget)
      $tar.parent().find('.swiper-slide').removeClass('swiper-slide-active-custom');
      $tar.addClass('swiper-slide-active-custom');
      window.galleryTop.slideTo(parseInt($tar.attr('data-id')));
      _ISCLICKTHUMBS = true;  // 使用点击缩略图进行跳转的
    })
  }

  if (Util.IsPC()) {
    mouseUpOrDown($('body')[0], function (ev, type) {
      if (type === "up") {
        console.log("swipeUp", $(ev.target).attr('class'))
        if ($(ev.target).hasClass('swiper-slide') || $(ev.target).hasClass('wrap')) {
          ev.preventDefault();
          $(".gallery-main").show();
          $(".gallery-main").css('opacity', 1);
        }
        return false;
      }
    })
  } else {
    /*上下滑动,展示缩略图和自动播放控制轴*/
    $('body').off('swipeUp').on('swipeUp', function (ev) {
      console.log("swipeUp", $(ev.target).attr('class'))
      //var _className = $(ev.target).attr('class');
      if ($(ev.target).hasClass('swiper-slide') || $(ev.target).hasClass('wrap')) {
        ev.preventDefault();
        $(".gallery-main").show();
        $(".gallery-main").css('opacity', 1);
      }
      return false;
    });
  }
}

/**
 * 点击考试点读位
 * @param e
 */
function fnExamClick(e) {
  var $cTar = $(e.currentTarget);
  var ids = $cTar.attr('data-id');
  var pointData = Util.getPointDataByIds(DATA, ids);

  //解析题目的JSON字符串, 加强版解析  BUG 300 START
  var _count = 0;
  var questions = [];
  while (typeof pointData['questions'] === "string" && _count < 10) {
    _count++;
    pointData['questions'] = JSON.parse(pointData['questions']);
  }
  if (_count >= 10) {
    alert('解析题目JSON字符串报错,请查看数据库中,数据是否有问题')
  } else {
    questions = pointData['questions'];
  }

  // BUG 300 END

  var $secExam = $(GLOBAL.SEC_EXAM);
  $secExam.show()
  $(GLOBAL.SEC_EXAM_LIST).show();
  $(GLOBAL.SEC_QUESTION_LIST).hide();

  var scaleExam = isVertical ? $secExam.width() / 320 : $secExam.width() / 1500 * 2;

  GLOBAL.examShowList = new ExamShowList(GLOBAL.SEC_EXAM_LIST, {
    data: {questions: questions},
    scale: scaleExam,
    isVertical: isVertical,
    callback: function (questionData) {
      //点击题干
      $(GLOBAL.SEC_EXAM_LIST).hide();
      $(GLOBAL.SEC_QUESTION_LIST).show();

      GLOBAL.questionsList = new QuestionsList(GLOBAL.SEC_QUESTION_LIST, {
        data: questionData,
        scale: scaleExam,
        isVertical: isVertical,
        fnReturn: function () {
          //题干列表返回到考生页面
          $(GLOBAL.SEC_EXAM_LIST).show();
          $(GLOBAL.SEC_QUESTION_LIST).hide();
        },
        fnQuestionClick: function (questionIndex) {
          //点击第几题,考生页面跳转到该题目
          $(GLOBAL.SEC_EXAM_LIST).show();
          $(GLOBAL.SEC_QUESTION_LIST).hide();
          GLOBAL.examShowList.swiper.slideTo(questionIndex);
        }
      })
    }
  })
}

/**
 * 根据点读位的位置，计算出图文展示的位置[算法]
 * @param $tar
 */
function setImgTextLocation_Scale($tar, $secImgTextMain, $wrap) {
  $('.sec-imgtext').css({width: $wrap.width(), height: $wrap.height()});

  var gap = 0;  //图文展示坐标，与点读位的距离
  var rW = $tar.width();
  var rH = $tar.height();
  var top = css2Float($tar.css('top'));
  var left = css2Float($tar.css('left'));
  var imgTextW = $secImgTextMain.width();
  var imgTextH = $secImgTextMain.height();
  var windowW = $(window).width();
  var windowH = $(window).height();
  //左上点读位的角
  var _ltx = left - imgTextW - gap;
  var _lty = top - imgTextH;

  //右上点读位的角
  var _rtx = left + rW + gap;
  var _rty = top - imgTextH;

  //左下点读位的角
  var _lbx = left - imgTextW - gap;
  var _lby = top + rH + gap;
  //右下点读位的角
  var _rbx = left + rW + gap;
  var _rby = top + rH + gap;
  //如果图文展示 超出了顶部，则考虑放下下半部分
  if (_lty > 10) {
    //如果图文展示，超出了左边，则考虑右边部分
    if (_ltx > 10) {
      $secImgTextMain.css({left: _ltx, top: _lty})
    }
    else if ((_rtx + imgTextW) > ( windowW - 10)) {
      $secImgTextMain.css({left: _rtx - (imgTextW / 2), top: _rty})
    }
    else {
      $secImgTextMain.css({left: _rtx, top: _rty})
    }
  }
  else if ((_lby + imgTextH) > ( windowH - 10)) {
    if (_lbx > 10) {
      $secImgTextMain.css({left: _lbx, top: _lby - (imgTextH / 2)})
    }
    else if ((_rbx + imgTextW) > ( windowW - 10)) {
      $secImgTextMain.css({left: _rbx - (imgTextW / 2), top: _rby - (imgTextH / 2)})
    }
    else {
      $secImgTextMain.css({left: _rbx, top: _rby - (imgTextH / 2)})
    }
  }
  else {
    if (_lbx > 10) {
      $secImgTextMain.css({left: _lbx, top: _lby})
    }
    else if ((_rbx + imgTextW) > ( windowW - 10)) {
      $secImgTextMain.css({left: _rbx - (imgTextW / 2), top: _rby})
    }
    else {
      $secImgTextMain.css({left: _rbx, top: _rby})
    }
  }
}

/*=======================点击事件相关 END====================*/


/**
 * 设置图标选中的图片地址
 * @param {[type]} $target [点击图标的Jquery对象]
 */
function setHoverImgSrcx($target) {
  var imgSrc = $target.css('background-image') || $target.css('backgroundImage');
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
 * 从 样式  10px  变成 数字 10
 */
function css2Float(cssProp) {
  cssProp = cssProp || "";
  return parseFloat(cssProp.replace('px', ''));
}

/**
 * 判断鼠标是向上滑动,或者向下滑动[原生JS]
 */
window.mouseUpOrDown = (function () {
  return function (bar, callback) {
    var oldX, oldY, ev;
    var distance = 20; //距离大于10有效
    bar.onmousedown = function (event) {
      oldX = event.screenX;
      oldY = event.screenY;
      ev = event;
    };
    bar.onmouseup = function (event) {
      var newX = event.screenX;
      var newY = event.screenY;

      if (newY - oldY >= distance) {
        callback && callback(ev, 'down')
      } else if (oldY - newY > distance) {
        callback && callback(ev, 'up')
      }
      oldX = 0;
      oldY = 0;
    };
  };
})();

