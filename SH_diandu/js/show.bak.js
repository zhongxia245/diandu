/*=============================定义变量 START===========================*/
var click = Util.IsPC() ? 'click' : 'tap';
var audio, video;
var SCALE = 1; //缩放的比例
var isVertical = false;  //是否为竖屏
var DATA; //用来保存请求回来的变量
var ctlGlobalAudio; //全程音频控制器

var GLOBAL = {
  PREBGID: '_diandu',  //每一个背景页的前缀

  H_IMGSCALE: 1920 / 1080,  //横屏比例点
  V_IMGSCALE: 1080 / 1760,  //竖屏比例点
  OLDWIDTH: 1200,  //创建页面的横屏宽度  上传点读页的时候,横屏默认1200*675,竖屏 540*960,这边会从数据库返回
  OLDHEIGHT: 960,  //创建页面的竖屏高度,
  EXAM_W: 0,
  EXAM_H: 0,

  AUTOPLAYINTERVAL: 0,//图片自动轮播的时间, 0为关闭自动播放

  STARTSIZE: 150,   //点读开关大小
  POINTSIZE: 72,  //点读位缩放前大小

  SEC_EXAM: '.sec-exam',  //考试展示容器
  SEC_EXAM_LIST: '.sec-exam .exam-list',  //考生页面容器
  SEC_QUESTION_LIST: '.sec-exam .question-list',  //题干列表容器

  videoid: 0, // 点读展示的id,
  DEFAULTAUTOPLAYTIME: 100, //自动播放的间隔时间
  PAGESIZE: {  //创建时的容器大小
    W: 1200,
    H: 675
  },
  SCREEN: {
    W: (function () {
      return Util.IsPC() ? 1200 : window.screen.width
    }),
    H: (function () {
      return Util.IsPC() ? 675 : window.screen.height
    }),
  },
  STARTBTNSIZE: 100,  //开始按钮大小
  GLOBAL_POINT_SIZE: 100,  //全局点读点大小比例 %
  BACK_COLOR: 'rgb(0,0,0)', //背景图片空白区域颜色
  CurrentPageIndex: 0, //当前点读页下标
}
/**
 * 背景音乐相关操作
 */
GLOBAL.BGAUDIO = {
  bgaudio: document.getElementById('bg-audio'),
  audio: document.getElementById('point-audio'),
  $btnBgAudio: $('#btn_bgAudio'),
  setAudio: function (src) {
    var that = this;
    //如果已经设置了, 则不在设置背景音乐
    if (!$(this.bgaudio).attr('src')) {
      $(this.bgaudio).attr('src', src);
    }

    //停止背景音乐, 监听事件
    $('body').off('STOPBGAUDIO').on('STOPBGAUDIO', function (e, flag) {
      //暂停播放背景音乐
      if (flag) {
        that.timer && clearTimeout(that.timer)
        that.pause()
        Logger.info("暂停背景音乐!")
      }
      //播放背景音乐
      else {
        that.timer = setTimeout(function () {
          that.play();
          Logger.info("间隔5秒,开始自动播放背景音乐!")
        }, 5000)
      }
    })
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
      Logger.info("背景音乐播放")
      this.$btnBgAudio.attr('src', 'imgs/bg_audio_on.png')
    }
  },
  pause: function () {
    this.$btnBgAudio.attr('src', 'imgs/bg_audio.png')
    if (!this.bgaudio.paused) {
      this.bgaudio.pause();
    }
  },
  hideBtn: function () {
    this.$btnBgAudio.hide();
  },
  setTimePlay: function (duration) {
    duration = duration || 5000;
    var that = this;
    Logger.info("设置定时器,5秒后播放背景音乐")
    that.timer = setTimeout(function () {
      that.play()
    }, duration)
  },
  clearTimeout: function () {
    Logger.info("清除背景音乐定时器!")
    this.timer && clearTimeout(this.timer)
  }
}

/*=============================初始化页面 START===========================*/
$(function () {
  init();
});

/*========================页面缩放,横竖屏切换事件 START=====================*/
$(window).on('resize', function (e) {
  setTimeout(function () {
    //主要用户移动端,弹出输入法面板,导致触发 resize. 如果是输入法触发的resize,不做处理
    if (!window.SHOWINPUT) {
      fn_onResize();
      Logger.log('获取屏幕的宽高,横竖屏切换过快,可能导致获取出错', "W:", GLOBAL.SCREEN.W(), "H:", GLOBAL.SCREEN.H())
    } else {
      Logger.info('输入法面板触发的resize,不做处理');
    }
  }, 10)
})

/**
 * 窗口变化时展示
 */
function fn_onResize() {
  window.W = $(window).width();
  window.H = $(window).height();

  $('#main').css({
    height: window.H,
    width: window.W
  });

  var _size;
  if (window.W > window.H) {
    //横屏
    SCALE = (window.W / GLOBAL.OLDWIDTH);
    $('.cd-close').removeClass('cd-close-v');

    GLOBAL.EXAM_W = window.W * (1500 / 1920);
    GLOBAL.EXAM_H = window.H * (800 / 1080);

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

    GLOBAL.EXAM_W = window.W * (800 / 1080);
    GLOBAL.EXAM_H = window.H * (1200 / 1920);

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

  //设置顶部进度条的宽高
  styleHandler();

  if (DATA) {
    $('.gallery-main').css('opacity', 0).show();
    initDiandu(DATA);
  }
}

/**
 * 横竖屏 滑动条样式处理
 */
function styleHandler() {
  var $scrollBar = $('#scroll-bar');
  var $opacityScrollBar = $('#opacity-scroll-bar');
  if (isVertical) {
    $scrollBar.css({
      width: '80%'
    });
    $opacityScrollBar.css('width', '80%')
  } else {
    $scrollBar.css({
      width: '45%'
    })
    $opacityScrollBar.css('width', '45%')
  }
}

/*========================页面缩放,横竖屏切换事件 END=====================*/

/**
 * 初始化
 */
function init() {
  // 点读页的ID,保存的时候会返回ID
  var id = GLOBAL.videoid = Util.getQueryStringByName('videoid') || 1080;
  initAudio();
  initVideo();
  /**
   * 获取点读数据
   */
  Model.getList(id, function (data) {
    DATA = data;
    //排序点读页顺序
    ArrayUtil.sortByKey(data.pages, 'seq');
    Util.getImageWH(data['pages'][0]['pic'], function () {

      //页面大小重新渲染放在这边, 微信浏览器显示就不会有问题
      setTimeout(function () {
        fn_onResize();
        window._load.loading("hide");
        diandu.blink(0);
      }, 100)

      Logger.info("展示页数据:", data)
    })
  })
}

/**
 * 初始化点读展示页
 * @param  {[type]} data [description]
 */
function initDiandu(data) {
  $('#pages').html('');
  $('#thumbs').html('');

  initPage('pages', data);
  initThumbs('thumbs', data['pages']);

  initSwipe();

  //针对早期的数据, 由于数据库默认保存 数据为 0 , 因此这边需要做处理
  if (data['point_size'] !== "0") {
    GLOBAL.GLOBAL_POINT_SIZE = parseInt(data['point_size']);
  }
  if (data['back_color'] !== "0") {
    GLOBAL.BACK_COLOR = data['back_color'];
  }
  //设置背景图片空白区域的颜色
  initPointSizeAndBgColor(GLOBAL.BACK_COLOR);

  $('.gallery-main').hide();  //默认透明度为0 ,会占位置,让下面的点击不到,这里用隐藏,隐藏起来

  bindEvent();
  //渲染后的操作
  afterRenderOp(data);
}

/**
 * 渲染之后,对页面进 一些操作
 * eg: 是否显示背景音乐按钮,是否显示全程音频按钮, 位置样式调整等
 */
function afterRenderOp(data) {
  var globalAudioConfig = JSON.parse(data.content || "{}")
  //存在全程音频
  if (globalAudioConfig.id) {
    //初始化全程音频
    ctlGlobalAudio = new GlobalAudioController('#global-audio',
      {
        controllerId: '#btn_globalAudio',
        data: data,
        callback: function (index) {
          window.galleryTop.slideTo(index);
          window.galleryThumbs.slideTo(index);
        },
        //播放后的回调
        playCallback: function () {
          $('[data-id="global-audio"]').removeClass().addClass('global-audio-other-page-on');
          $('.m-global-audio').find('.audio-global-play').show();
          $('.m-global-audio').find('.audio-load').hide();
          $('.m-global-audio').find('.audio-play').hide();
        },
        //暂停后的回调
        pauseCallback: function () {
          $('[data-id="global-audio"]').removeClass().addClass('global-audio-other-page-off');
          $('.m-global-audio').find('img').hide();
        },
        //隐藏其他点读点的回调
        hideOtherPointCallback: function (flag) {
          //隐藏
          if (flag) {
            $('.m-imgtext').hide();
            $('.m-audio:not(.m-global-audio)').hide();
            $('.m-video').hide();
            $('.m-exam').hide();
          }
          //不隐藏
          else {
            $('.m-imgtext').show();
            $('.m-audio:not(.m-global-audio)').show();
            $('.m-video').show();
            $('.m-exam').show();
          }
        },
        //隐藏全程音频功能的回调
        hideCallback: function (flag) {
          if (flag) {
            $('[data-id="global-audio"][data-show="1"]').show();
            $('.m-global-audio').show();
          }
          else {
            $('[data-id="global-audio"][data-show="1"]').hide();
            $('.m-global-audio').hide();
          }
        }
      }
    )
    GLOBAL.useGlobalAudio = true; //使用全程音频

  } else {
    $('#btn_globalAudio').hide();
    $('[data-id="global-audio"]').hide();
  }

  //存在背景音乐
  if (data['background']) {
    GLOBAL.BGAUDIO.setAudio(data['background']);
    //全程音频和背景音乐只能同时打开一个
    if (!GLOBAL.useGlobalAudio) {
      //PC端直接设置自动播放
      if (Util.IsPC()) {
        GLOBAL.BGAUDIO.play();
      } else {
        //移动端
        document.addEventListener("touchstart", playBgAduio, false);
      }
    } else {
      GLOBAL.BGAUDIO.pause();
    }

  } else {
    GLOBAL.BGAUDIO.hideBtn()
  }
}


/**
 * 初始化空白区域背景颜色, 以及点读点的大小
 * @param color 颜色
 */
function initPointSizeAndBgColor(color) {
  $('.m-bgs').css('background-color', color)
}

/**
 * 监听点击屏幕 播放背景音乐
 */
function playBgAduio() {
  Logger.log("play bg audio and remove touchstart event...")
  GLOBAL.BGAUDIO.play();
  document.removeEventListener("touchstart", playBgAduio, false)
}


/**
 * 按比例缩放点读点
 * @param wrap 点读点容器
 * @param scale 比例大小
 */
function setPointSizeScale(wrap, scale) {

  if (isVertical) {
    //竖屏
    GLOBAL.STARTBTNSIZE = GLOBAL.STARTSIZE * GLOBAL.SCREEN.W() / 800;
  } else {
    //横屏
    GLOBAL.STARTBTNSIZE = GLOBAL.STARTSIZE * GLOBAL.SCREEN.W() / 1200;
  }
  GLOBAL.STARTBTNSIZE = GLOBAL.STARTBTNSIZE > 80 ? 80 : GLOBAL.STARTBTNSIZE;

  setScale(wrap + ' .m-dd-start', GLOBAL.STARTBTNSIZE);
  setScale(wrap + ' .global-audio-other-page', GLOBAL.STARTBTNSIZE);
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
 *  决: 使用 swiper.onResize();
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
      lazyLoading: true,
      effect: 'fade',
      fade: {
        crossFade: true,
      },
      onTransitionEnd: function (swiper) {  //没有切换到另外一个点读页也会触发
        //切换了点读页
        if (GLOBAL.CurrentPageIndex !== swiper.activeIndex) {
          //添加点读点闪烁效果
          diandu.blink(swiper.activeIndex);

          Logger.info("页面跳转到第:", swiper.activeIndex, " 页")
          GLOBAL.CurrentPageIndex = swiper.activeIndex;

          //滑动,全程音频时间,跳转到指定时间
          if (ctlGlobalAudio && !ctlGlobalAudio.audio.paused) {
            ctlGlobalAudio.setActivePage(swiper.activeIndex, true)
          }

          $('#id_pagination_cur').text(swiper.activeIndex + 1);

          var _$thumbsSwipers = $('#thumbs>div[data-id]');
          _$thumbsSwipers.removeClass('swiper-slide-active-custom');
          _$thumbsSwipers.eq(swiper.activeIndex).addClass('swiper-slide-active-custom')

          //播放到最后一个,停止自动播放
          if (swiper.activeIndex + 1 === window.DATA['pages'].length) {
            window.silideBar.setValue(110);  //setValue 会调通 时间进度条的 callback事件
          }
        }
      }
    });

    window.galleryThumbs = new Swiper('.gallery-thumbs', {
      slidesPerView: 5,
      lazyLoading: true,
      spaceBetween: 10,
      lazyLoading: true,
      freeMode: true,
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
        GLOBAL.AUTOPLAYINTERVAL = value * 1000;
        window.galleryTop.stopAutoplay();
        window.galleryTop.params.autoplay = GLOBAL.AUTOPLAYINTERVAL;
        window.galleryTop.startAutoplay();
      } else {
        $block.removeClass('open').addClass('close')
        $block.text("关");
        GLOBAL.AUTOPLAYINTERVAL = 0;
        window.galleryTop.stopAutoplay();
      }
    }
  });
  //设置 刚开始 自动播放的间隔时间
  window.silideBar.setValue(GLOBAL.DEFAULTAUTOPLAYTIME);

  //因为窗体改变的时候,onresize会调用该方法,这里判断是否已经设置了自动播放的值
  window.opacitySilideBar = new SlideBar({
    actionBlock: 'opacity-action-block',
    scrollBar: 'opacity-scroll-bar',
    entireBar: 'opacity-entire-bar',
    barLength: $('#opacity-scroll-bar').width(),
    maxNumber: 9,
    value: 0,
    callback: function (value) {
      var $block = $('#opacity-action-block')
      $block.removeClass('close').addClass('open');

      var val = value - 1 > 10 ? 10 : value - 1;
      val = val < 0 ? 0 : val;

      var opacity = (10 - val) / 10;
      PointOpacity.setOpacity(opacity)

      $block.find('.action-block-spam').text(val);
      $block.find('.action-block-color').css('opacity', opacity)
    }
  });
}

/*************************************根据数据生成页面 START********************************/
/**
 * 根据返回的数据，动态生成页面(多个)
 * @param  id 点读页容器id
 */
function initPage(id, data) {
  var pages = data['pages'] || [];

  $('#id_pagination_total').text(pages.length);

  //动态生成点读页  START
  var html = '';
  for (var i = 0; i < pages.length; i++) {
    html += initDianDuPage(pages[i], GLOBAL.PREBGID + i);
  }
  $('#' + id).html('').html(html);
  //动态生成点读页  END

  //控制点读页的缩放,以及点读点的大小控制  START
  for (var i = 0; i < pages.length; i++) {
    var subid = GLOBAL.PREBGID + i;  //每一个页面的id

    var w = parseInt(pages[i]['w']) || 1200;
    var h = parseInt(pages[i]['h']) || 675;

    var whScale = w / h;   //宽高比
    var hwScale = h / w;   //高宽比

    var _imgScale = 1;
    var wrapWidth = window.W;
    var wrapHeight = window.H;

    var _flag = false;  //图片是否某一边拉伸,铺满长度 或者 宽度,  false: 没有  true: 有
    //竖屏
    if (isVertical) {
      //普通图片
      if (whScale > GLOBAL.V_IMGSCALE && whScale <= GLOBAL.H_IMGSCALE) {
        wrapHeight = wrapWidth * hwScale;
        _imgScale = wrapHeight / GLOBAL.PAGESIZE.H
        _flag = true;
      }
      else if (whScale >= GLOBAL.V_IMGSCALE) {
        //竖图,横向100%, 重新计算计算缩放比例
        wrapHeight = window.W * hwScale;  //计算该宽高, 主要为是了兼容早期图片大小为1200  675  没有计算缩放后的大小
        if (hwScale > 1) {
          _imgScale = wrapHeight / GLOBAL.SCREEN.H()
        }
      }
      else {
        //横图,纵向100%, 重新计算计算缩放比例
        wrapWidth = window.H * whScale;
        if (whScale > 1) {
          _imgScale = wrapWidth / GLOBAL.SCREEN.H
        }
      }
    }
    //横屏
    else {
      //普通图片
      if (whScale > GLOBAL.V_IMGSCALE && whScale <= GLOBAL.H_IMGSCALE) {
        wrapWidth = wrapHeight * whScale;
        _imgScale = wrapHeight / GLOBAL.PAGESIZE.H
        _flag = true;
      }
      else if (whScale >= GLOBAL.H_IMGSCALE) {
        //横图
        wrapHeight = window.W * hwScale;
        if (hwScale > 1) {
          _imgScale = wrapHeight / GLOBAL.SCREEN.H()
        }
      } else {
        //竖图
        wrapWidth = window.H * whScale;
        if (whScale > 1) {
          _imgScale = wrapWidth / GLOBAL.SCREEN.H()
        }
      }
    }

    $('#' + subid).css('background-size', 'contain');

    //计算点读点缩放比例
    var _pointSizeScale = getPointSizeScale(wrapWidth, wrapHeight)
    if (!_flag) {
      _pointSizeScale = _pointSizeScale * _imgScale;
    } else {
      _pointSizeScale = _imgScale
    }

    //针对小图, 创建的时候, 没有缩放的图片 START
    if (w < GLOBAL.PAGESIZE.W && h < GLOBAL.PAGESIZE.H) {
      if (whScale > window.screen.width / window.screen.height) {
        Logger.log("小图 宽铺满屏幕")
        _pointSizeScale = GLOBAL.SCREEN.W() / w
      } else {
        Logger.log("小图 高铺满屏幕")
        _pointSizeScale = GLOBAL.SCREEN.H() / h
      }
    }

    //针对小图, EN

    var $wrap = $('#' + subid).find('.wrap');
    $wrap.css({height: wrapHeight, width: wrapWidth});
    $wrap.html('');
    $wrap.append(initPoints(i, pages[i], wrapWidth, wrapHeight, _pointSizeScale))

    setPointSizeScale('#' + subid, _pointSizeScale);
  }

  //控制点读页的缩放,以及点读点的大小控制  END
  initGlobalAudio(DATA, pages[i]);
}


/**
 * 初始化全局音频的相关配置
 * @param data 数据
 * @param isEnd 所有图片是否加载结束
 */
function initGlobalAudio(data) {
  var globalAudioConfig = JSON.parse(data.content || "{}");

  if (globalAudioConfig && globalAudioConfig.id) {
    var pageIndex = parseInt(globalAudioConfig.id.split('_')[0]) - 1;
    var pointIndex = parseInt(globalAudioConfig.id.split('_')[1]) - 1;
    window.globalAudio.src = globalAudioConfig.src;

    for (var i = 0; i <= pageIndex; i++) {
      //不需要显示全程音频的做上标记
      $('#' + GLOBAL.PREBGID + i).find('[data-id="global-audio"]').attr('data-show', null).hide();
    }

    //全局音频所在的点读页 加载结束
    var selector = '.m-audio[data-id="' + pageIndex + "_" + pointIndex + '"]';
    var $globalAudio = $(selector);

    $globalAudio.addClass('m-global-audio').attr('data-global-audio', 1).css({
      width: GLOBAL.STARTBTNSIZE,
      height: GLOBAL.STARTBTNSIZE * 66 / 75
    });
  }
}

/**
 *  取点读点的缩放比例
 * 1. 创建时 横图 宽 1200  ==> 点读点 72px
 *          竖图 高 675   ==> 点读点 72px
 * 这里按比例缩放
 * @param imgW 创建时保存的图片宽
 * @param imgH 创建时保存的图片高
 * @returns {number}
 */
function getPointSizeScale(imgW, imgH) {
  if (imgW > imgH) {
    return GLOBAL.SCREEN.W() / GLOBAL.PAGESIZE.W;
  } else {
    return GLOBAL.SCREEN.H() / GLOBAL.PAGESIZE.H;
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
  html += '<div id="' + id + '" data-id="' + data['id'] + '" class="m-bg swiper-slide swiper-lazy" data-background="' + bgPath + '" style="height:' + h + 'px;">'
  html += '        <div class="m-dd-start-comment-div"></div>'
  html += '        <div data-id="btn-start" class="m-dd-start"></div>'
  html += '        <div data-id="global-audio" data-show="1" class="global-audio-other-page-off"></div>'
  html += '    <div class="wrap">'
  //html += '       <img src="' + bgPath + '"/>'
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
    //html += '<div data-id="' + i + '" class="swiper-slide" style="background-image: url(' + bgPath + ');">'
    html += '<div data-id="' + i + '" style=" background-size: contain;" class="swiper-slide  swiper-lazy" data-background="' + bgPath + '">'
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
 * 生成点读位【根据类别使用不同的图标,目前只有  频,音频,图文】
 * @param data 点读点集合数据
 * @param imgW 图片缩放后的宽
 * @param imgH 图片缩放后的高
 * @param scale 缩放比例
 * @returns {string}
 */
function initPoints(pageIndex, data, imgW, imgH, scale) {

  var pointDatas = data['points']

  //点读点相关样式
  var classNames = {
    1: "m-video",
    2: "m-audio",
    3: "m-imgtext",
    4: "m-exam"
  };

  var html = "";
  html += '<div data-id="all-radius" data-hide="all-radius-hide">'

  for (var i = 0; i < pointDatas.length; i++) {
    //隐藏点, 则不显示出来
    if (pointDatas[i]['hide'] != "1") {
      //点读点大小比例(百分比)
      var pointSizeScale = parseInt(pointDatas[i]['point_size']) || GLOBAL.GLOBAL_POINT_SIZE;
      pointSizeScale = pointSizeScale / 100;

      var pointScale = scale * pointSizeScale;

      var pointId = pageIndex + '_' + i;
      var left = parseFloat(pointDatas[i].x) * imgW;
      var top = parseFloat(pointDatas[i].y) * imgH;
      var type = pointDatas[i]['type'];
      //自定义图片
      var pic = JSON.parse(pointDatas[i]['pic'] || "{}")
      //自定义标题
      var pointTitle = JSON.parse(pointDatas[i]['custom'] || "{}")

      var style = 'left:' + left + 'px; top:' + top + 'px; transform: scale(' + pointScale + '); transform-origin:left top;-webkit-transform: scale(' + pointScale + '); -webkit-transform-origin:left top;';

      var mediaImg = "";
      switch (type) {
        case "1": //视频
          mediaImg = '   <img  style="display:none; width:100%;height:100%;" src="imgs/video_on.png" alt="video" />';
          break;
        case "2": //音频
          mediaImg = '    <img  class="audio-play" style="display:none; border-radius:50%;width:100%;height:100%" src="imgs/audio.gif" alt="audio" />';
          mediaImg += '   <img  class="audio-load" style="display:none; border-radius:50%;width:100%;height:100%;" src="imgs/load.gif" alt="audio" />';
          mediaImg += '  <img  class="audio-global-play" style="display:none;border-radius: 50%; width: 100%; height: 100%;" src="imgs/global_audio/global-audio-other-page-on.gif" alt="audio">'
          break;
      }
      //自定义点读点
      if (pic.src || pointTitle.title) {
        var config = {
          pointId: pointId,
          left: left,
          top: top,
          title: pointTitle,
          pic: pic,
          scale: pointScale,
          className: classNames[type],
          outHTML: mediaImg
        }
        //自定义图片
        if (pic.src) {
          var loadImg = '   <img  class="audio-load" style="display:none;" src="imgs/load.gif" alt="audio" />';
          config.outHTML = loadImg;
          html += CreatePoint.initPoint(5, config)
        }
        //自定义点读点
        else {
          html += CreatePoint.initPoint(4, config)
        }
      }
      //普通点读点
      else {
        html += '<div class="' + classNames[type] + '" data-id="' + pointId + '"  style="' + style + '">'
        html += mediaImg;
        html += '</div>'
      }
    }
  }
  html += '</div>'

  return html;
}

/*************************************根据数据生成页面 END********************************/
/*=======================音频视频播放相关 START====================*/
function initAudio() {
  window.audio = document.getElementById('point-audio');
  window.globalAudio = document.getElementById('global-audio');
}
function initVideo() {
  window.video = document.getElementById('video');
}

/**
 * 为了 决移动端播放音频需 加载, 加载过程 做一个优化, 展示 load 效果, 让用户知道正正在加载
 * @param audio
 */
function audioPlay(e, url) {

  var $cTar = $(e.currentTarget);

  if ($cTar.attr('isLoad')) {//音频加载结束
    window.audio.play();
    console.log('play()=>paused:', audio.paused)
    if ($cTar.attr('data-type') === 'pointImg') {
      diandu.customPlay($cTar, true)
    } else {
      $cTar.attr('data-play', true)
      $cTar.find('.audio-play').show();
    }
    $cTar.find('.audio-load').hide();
  }

  else {
    //音频还未加载
    if ($cTar.attr('data-type') !== 'pointImg') {
      $cTar.find('.audio-play').hide();
    }
    $cTar.find('.audio-load').show();
    $cTar.css('background-size', '0')
    $cTar.attr('data-loading', true)

    //移动端 canplaythrough 必须 设置 play 之后, 才能触发
    window.audio.play()
    window.audio.setAttribute('data-volume', window.audio.volume)
    window.audio.volume = 0.1;
  }


  /*audio可以播放的事件*/
  window.audio.addEventListener('canplaythrough', function (e) {
    if (!$cTar.attr('isLoad')) {
      //是当前播放的音频, 则显示 正在播放状态
      if (window.audio.src.indexOf(url) !== -1) {

        window.audio.play();
        console.log('play()=>paused:', audio.paused)

        window.audio.volume = window.audio.getAttribute('data-volume') || 0.5;

        $cTar.find('.audio-load').hide();
        $cTar.find('.audio-play').show();
        $cTar.css('background-size', '100%')

        if ($cTar.attr('data-type') === 'pointImg') {
          diandu.customPlay($cTar, true)
        }


        $cTar.attr('isLoad', true)   //加载结束标记
        $cTar.attr('data-play', true) //正在播放标记
        $cTar.attr('data-loading', false)  //正在加载中标记
      }
    }
  }, false);
}

/**
 * 播放或者暂停 音频
 * @param isGlobalAudio 是否为全程音频
 */
function playOrPaused(e, isGlobalAudio, pointData) {
  var url = pointData.url;
  var $cTar = $(e.currentTarget);

  GLOBAL.BGAUDIO.clearTimeout();

  //正在加载中加载状态
  if ($cTar.attr('data-loading') === 'true') {
    $cTar.attr('data-loading', false)
    $cTar.find('.audio-load').hide();
    $cTar.css('background-size', '100%');
  }
  //正在播放
  else if ($cTar.attr('data-play') === 'true') {
    $cTar.find('.audio-play').hide();
    $cTar.attr('data-play', false);
    if (ctlGlobalAudio && isGlobalAudio) {
      ctlGlobalAudio.pause();
      ctlGlobalAudio.render();
    } else {
      window.audio.pause();

      diandu.customPlay($cTar, false);

      //关闭音频的时候,间隔自动播放的时间在启动
      GLOBAL.BGAUDIO.setTimePlay();
    }
  }
  //未播放
  else {
    $cTar.attr('data-play', true)
    if (window.audio.getAttribute('src') !== url) {
      window.audio.setAttribute('src', url);
    }
    //是全局音频
    if (ctlGlobalAudio && isGlobalAudio) {
      ctlGlobalAudio.play();
    }
    else {
      if (window.audio.paused) {
        audioPlay(e, url)
      }
    }

    //关闭背景音乐
    GLOBAL.BGAUDIO.pause();
  }
}

/**
 * 隐 音频和 频，并且关闭播放
 * @param flag 是否关闭自动播放
 */
function closeVideoOrAudio(flag) {
  if (flag === undefined) flag = true;

  //停止音频
  window.audio.pause();
  $('.m-audio img').hide(); //隐藏所有的播放GIF图
  $('.m-audio').css('background-size', '100%')
  window.audio.src = '';

  //清除闪烁
  var $customImgs = $('[data-type="pointImg"]');
  for (var i = 0; i < $customImgs.length; i++) {
    var $customImg = $($customImgs[i]);
    diandu.customPlay($customImg, false);
  }


  //停止视频
  //window.video.pause();
  var $video = $('.m-video-size');
  $video.find('img').hide();
  $video.removeClass('m-video-size');

  //停止全程音频
  ctlGlobalAudio && ctlGlobalAudio.pause();

  if (flag) {
    GLOBAL.BGAUDIO.pause();
  }
}
/*=======================音频视频播放相关 END====================*/
/*=======================点击事件相关 START====================*/
function bindEvent() {
  // 启动开关
  $('.m-dd-start').off().on(click, function (e) {
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

    Logger.info("开始按钮类型(0: 隐藏点读点 1: 显示点读点 2:弹出评论框)", type)

    switch (type) {
      //隐藏
      case 0:
      case "0":
        $cTar.attr('class', 'm-dd-start-hide')
        $allRadius.addClass(hideClassName);
        closeVideoOrAudio(false);
        ctlGlobalAudio && ctlGlobalAudio.showOrHide(false);
        break;

      //显示点读
      case 1:
      case "1":
        $cTar.attr('class', 'm-dd-start')
        $allRadius.removeClass();
        ctlGlobalAudio && ctlGlobalAudio.showOrHide(true);
        break;

      //评论
      case 2:
      case "2":
        ctlGlobalAudio && ctlGlobalAudio.showOrHide(false);

        $(div_comment).show()
        $cTar.attr('class', 'm-dd-start-comment')

        Model.getComment(pageid, function (result) {
          new ExamComment('#' + _dianduid + " .m-dd-start-comment-div", {
            data: result,
            pageid: pageid,
            videoid: GLOBAL.videoid,
            userid: window.__userid,
            startRecordCallback: function () {
              Logger.info("暂停背景音乐")
              //开始录音结束背景音乐
              GLOBAL.BGAUDIO.pause();
            },
            stopRecordCallback: function () {
              Logger.info("录音结束之后,定时5秒,启动背景音乐播放")
              GLOBAL.BGAUDIO.setTimePlay();
            }
          })
        })

        //关闭自动播放,超出最大范围值, 就显示为关闭
        window.silideBar.setValue(110);
        break;
    }
    $cTar.attr('data-type', (parseInt(type) + 1) % 3)

    return false;
  });

  /**
   * 背景音乐开关按钮
   */
  $('#btn_bgAudio').off().on(click, function (e) {
    if (!GLOBAL.useGlobalAudio) {
      if (!GLOBAL.BGAUDIO.isOn()) {
        GLOBAL.BGAUDIO.play();
        GLOBAL.useBgAudio = true;
      } else {
        GLOBAL.BGAUDIO.pause();
        GLOBAL.useBgAudio = false;
      }
    } else {
      //confirm 确定删除?
      var dia = $.dialog({
        content: '全程音频和背景音乐不能同时使用',
        button: ["确认"]
      });
      dia.on("dialog:action", function (ev) {
        if (ev.index === 0) {

        }
      });
    }
  })

  // 视频
  $('.m-video').off().on(click, function (e) {
    GLOBAL.BGAUDIO.clearTimeout();  //清除背景音乐定时器,防止快速打开视频, 又关闭, 又打开, 播放背景音乐

    closeVideoOrAudio(true);
    var $cTar = $(e.currentTarget);
    var dataId = $cTar.attr('data-id');
    var pointData = Util.getPointDataByIds(DATA, dataId);
    var url = pointData.url;
    var area = null;
    if (pointData.area) {
      area = JSON.parse(pointData.area);
    }

    //点读点容器的高度
    var wrapH = $cTar.parents('.wrap').height();
    var wrapTop = 0;

    //移动端,计算位置
    if (!Util.IsPC()) {
      wrapTop = (screen.height - wrapH) / 2;
    }

    PlayVideo.show(url, area, wrapTop, function () {
      closeVideoOrAudio();
      //关闭音频的时候,间隔自动播放的时间在启动
      GLOBAL.BGAUDIO.setTimePlay()
    });
    return false;
  });


  // 音频
  $('.m-audio').off().on(click, function (e) {
    e.stopPropagation();

    var $cTar = $(e.currentTarget);
    var isGlobalAudio = $cTar.attr('data-global-audio')  //是否为全程音频 是为 "1"  否:null

    //关闭视频,并且设置所有的 音频为默认图标状态
    closeVideoOrAudio(true, $cTar);

    //var audioTimer = setInterval(function () {
    //  //播放结束, 则清除 正在播放的图片
    //  if (window.audio.ended) {
    //    $cTar.find('img').hide();
    //    clearInterval(audioTimer);
    //
    //    diandu.customPlay($cTar, false)
    //
    //    if (GLOBAL.AUTOPLAYINTERVAL !== 0) {
    //      window.galleryTop.startAutoplay();
    //    }
    //  }
    //}, 500)

    window._audioEnded = true;
    audio.addEventListener('ended', function () {
      if (window._audioEnded) {
        window._audioEnded = false;
        console.log("audio ended")
        $cTar.find('img').hide();
        $cTar.attr('data-play', false);
        diandu.customPlay($cTar, false)
        if (GLOBAL.AUTOPLAYINTERVAL !== 0) {
          window.galleryTop.startAutoplay();
        }
      }
    })

    //获取当前音频数据
    var dataId = $cTar.attr('data-id');
    var pointData = Util.getPointDataByIds(DATA, dataId);

    //播放或者暂停
    playOrPaused(e, isGlobalAudio, pointData)
  })


  //全程音频按钮[非全程音频点读点的页面]
  $('[data-id="global-audio"]').off().on(click, function (e) {
    var $cTar = $(e.currentTarget);
    if ($cTar.attr('class') === 'global-audio-other-page-on') {
      var currentIndex = parseInt($('#id_pagination_cur').text()) - 1;
      ctlGlobalAudio.pause();
      ctlGlobalAudio.render(currentIndex);
    } else {
      ctlGlobalAudio.play();
    }
  })


  // 图文
  $('.m-imgtext').off().on(click, function (e) {
    e.stopPropagation();
    closeVideoOrAudio(false);
    var $cTar = $(e.currentTarget);
    var dataId = $cTar.attr('data-id');
    var pointData = Util.getPointDataByIds(DATA, dataId);

    var $secImgText = $('.sec-imgtext-mask');
    $secImgText.css({position: 'absolute'});
    $secImgText.show();
    var $secImgTextMain = $('.sec-imgtext-main');
    setImgTextLocation_Scale($cTar, $secImgTextMain, $cTar.parent().parent());  //设置弹窗的位置

    var _url = pointData.url;
    var _title = pointData.title;
    var _content = decodeURI(pointData.content);

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

    //设置内容可以滚动, 由于 zepto 为了搞定 微信向上滑兼容性, 重写了touchmove事件导致
    $secImgText.find('.sec-imgtext-content').find('*').addClass('sec-scorll')
  })

  /**
   * 图文展示框
   */
  $('.sec-imgtext-mask').off().on(click, function (e) {
    var $tar = $(e.target);
    if ($tar.hasClass('sec-imgtext-mask') || $tar.hasClass('sec-imgtext')) {
      $(e.currentTarget).hide();
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


  //上滑,出现缩略图面板
  if (Util.IsPC()) {
    mouseUpOrDown($('body')[0], function (ev, type) {
      if (type === "up") {
        Logger.log("swipeUp", $(ev.target).attr('class'))
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
      Logger.log("swipeUp", $(ev.target).attr('class'))
      if ($(ev.target).hasClass('swiper-slide') || $(ev.target).hasClass('wrap')) {
        ev.preventDefault();
        $(".gallery-main").show();
        $(".gallery-main").css('opacity', 1);
      }
      return false;
    });
  }

  /**
   * 点击缩略图,跳转到该位置
   */
  if (Util.IsPC()) {
    $('#thumbs .swiper-slide').off().on(click, function (e) {
      var $tar = $(e.currentTarget)
      $tar.parent().find('.swiper-slide').removeClass('swiper-slide-active-custom');
      $tar.addClass('swiper-slide-active-custom');
      var pageIndex = parseInt($tar.attr('data-id'));
      window.galleryTop.slideTo(pageIndex);
    })
  } else {
    Util.Moblie_MoveOrTap($('#thumbs .swiper-slide'), function (e) {
      var $tar = $(e.currentTarget)
      $tar.parent().find('.swiper-slide').removeClass('swiper-slide-active-custom');
      $tar.addClass('swiper-slide-active-custom');
      var pageIndex = parseInt($tar.attr('data-id'));
      window.galleryTop.slideTo(pageIndex);
    })
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

  var distTopAndBottom = 30;  //距离顶部,底部小于30px ,考虑图片放其他地方
  var distLeftAndRight = 40;  //距离左边右边小于40,考虑图文放其他地方

  var wrapLeft = css2Float($tar.parents('.wrap').css('margin-left'));  //背景图片黑色区域宽度
  var wrapTop = css2Float($tar.parents('.wrap').css('margin-top'));  //黑色区域高度

  var minLeft = distLeftAndRight - wrapLeft;  //图文允许放置的最左边大小
  var maxLeft = windowW - distLeftAndRight;  //最右边
  var minTop = distTopAndBottom - wrapTop;  //最上边
  var maxTop = windowH - distTopAndBottom;  //最下边


  var minX = left - imgTextW - gap;    //图文最左边位置
  var centerX = left + -(imgTextW + gap - rW ) / 2;  //图文中间位置
  var maxX = left + rW + gap;  //图文最右边位置

  var minY = top - imgTextH - gap;  //图文最上边位置
  var centerY = top - (imgTextH + gap - rH ) / 2;  //图文中间位置
  var maxY = top + rH + gap;  //图文最下边位置

  var imgTextLeft = left;
  var imgTextTop = top;

  //图文放在点读点右边
  if (minX < minLeft) {
    //图片放在点读点右边
    if (maxX + imgTextW < maxLeft) {
      imgTextLeft = maxX;
    }
    //图文放在点读点中间
    else {
      imgTextLeft = centerX;
    }
  }
  //图文放在点读点左边
  else {
    imgTextLeft = minX;
  }


  //图文放在点读点下边
  if (minY < minTop) {
    //图文放在点读点下边
    if (maxY + imgTextH < maxTop) {
      imgTextTop = maxY;
    }
    //图文放点读点下班, 超过页面, 因此放点读点中间
    else {
      imgTextTop = centerY;
    }
  }
  //放点读点上边
  else {
    imgTextTop = minY;
  }


  $secImgTextMain.css({left: imgTextLeft, top: imgTextTop});

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

