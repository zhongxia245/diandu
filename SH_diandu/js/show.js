/*=============================定义变量 START===========================*/
var click = IsPC() ? 'click' : 'tap';
var audio, video;
var _pagePositionId = 'position'; //背景图列表的列表小圆点

//上传点读页的时候,横屏默认1200*675,竖屏 540*960,这边会从数据库返回
var OLDWIDTH = 1200;
var OLDHEIGHT = 675;
/*
 var SCREENSIZE = {
 h: {width: 1200, height: 675},
 v: {width: 540, height: 960}
 };
 */
var OLDDIANDUSIZE = 100; //创建时的点读位置大小为100px
var POINTPOINTSIZE = 72; //点读位置默认大小

/*
 * 计算点读位从100变成72的圆心位置偏移
 * */
var DIFFR = (OLDDIANDUSIZE - POINTPOINTSIZE) / 2;
var DIFF = Math.sqrt(Math.pow(DIFFR, 2) / 2);


var POINTSIZE;
var SCALE = 1; //缩放的比例
var STARTSIZE = 100; //启动位大小
var isVertical = false;  //是否为竖屏

window.AUTOPLAYINTERVAL = 0;  //自动播放时间 ,0 为关闭

var DATA; //用来保存请求回来的变量
var URL = {
    base: 'http://dev.catics.org/edu/course/api.php',
    get: 'get_touch_page_data'
};

/*=============================初始化页面 START===========================*/


$(function () {
    init();
});

/**
 * 初始化
 */
function init() {
    fn_onResize();
    // 点读页的ID,保存的时候会返回ID
    var id = getQueryStringByName('id') || 1080;

    $.post(URL.base, {action: URL.get, id: id}, function (result) {
        var data = JSON.parse(result);
        DATA = data;

        var strw = data && data.pages.length && data.pages[0].w || "1200";
        var strh = data && data.pages.length && data.pages[0].h || "675";
        OLDWIDTH = parseFloat(strw);
        OLDHEIGHT = parseFloat(strh);

        initPoint(data);
    });

    //初始化播放器，页面里面只有一个视频播放器和一个音频播放器
    initAudio();
    initVideo();
}

/**
 * 页面大小变化，则重新绘制点读位
 * @return {[type]} [description]
 */
window.onresize = function () {
    fn_onResize();
}

/**
 * 窗口变化时展示
 * TODO:需要判断横屏的缩放比例,还有竖屏的缩放比例, 宽高要分开算
 */
function fn_onResize() {
    window.W = $(window).width();
    window.H = $(window).height();
    $('#main').css({
        height: window.H,
        width: window.W
    });
    console.log('window.W:', window.W, "window.H", window.H)
    var _size;
    if (W > H) {
        //横屏
        SCALE = (window.W / OLDWIDTH);
        $('.cd-close').removeClass('cd-close-v');
        $('#div_video').css({
            width: '80%',
            height: '60%',
            position: 'relative',
            top: '20%'
        })
        _size = window.W * 0.28;
        isVertical = false;
    }
    else {
        //竖屏
        SCALE = (window.H / OLDWIDTH);
        $('.cd-close').addClass('cd-close-v')
        $('#div_video').css({
            width: '100%',
            //height: '75%',
            position: 'relative',
            top: '30%'
        })
        _size = window.W * 0.5;
        isVertical = true;
    }

    $('.sec-imgtext-main').css({width: _size, height: _size});

    POINTSIZE = SCALE * POINTPOINTSIZE;

    //设置顶部进度条的宽高
    styleHandler();

    if (DATA) {
        $('.gallery-main').css('opacity', 0).show();
        initPoint(DATA);
    }
}

/**
 * 横竖屏样式处理[批量添加需求]
 */
function styleHandler() {
    var $scrollBar = $('#scroll-bar');
    var $tip = $('#txtTip')
    if (isVertical) {
        $scrollBar.css({
            width: '80%'
        });
        $tip.css({
            width: '80%',
            marginBottom: '10px'
        })
        $tip.find('div').css({
            float: 'left'
        })
    } else {
        $scrollBar.css({
            width: '50%'
        })
        $tip.css({
            width: '30%',
            marginBottom: '0px'
        })
        $tip.find('div').css({
            float: 'none'
        })
    }
}


/**
 * 初始化节点，在横竖屏切换的时候，可能重新调用
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function initPoint(data) {
    initPage('pages', data);
    initThumbs('thumbs', data.pages);
    initSwipe();
    bindEvent();
    initScale();
    $('.gallery-main').hide();  //默认透明度为0 ,会占位置,让下面的点击不到,这里用隐藏,隐藏起来
}

/**
 * 按比例缩放图标
 * @return {[type]} [description]
 */
function initScale() {
    setScale('.m-dd-start', STARTSIZE * SCALE);
    setScale('.m-audio', POINTSIZE);
    setScale('.m-audio img', POINTSIZE);
    setScale('.m-video', POINTSIZE);
    setScale('.m-video img', POINTSIZE);
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
 * 初始化左右滑动的插件
 * @return {[type]} [description]
 */
function initSwipe() {

    //判断是否已经设置了分页的点,如何没有设置,则设置分页
    var pagination = ".swiper-pagination";
    var paginationHTML = $(pagination).html();
    if (paginationHTML) {
        pagination = null;
    }
    window.galleryTop = new Swiper('.gallery-top', {
        //continuous: false,
        paginationClickable: true,
        pagination: pagination,
        onTouchEnd: function (pos) {
            //closeVideoOrAudio();
        }
    });

    var startX, endX, long;

    window.galleryThumbs = new Swiper('.gallery-thumbs', {
        spaceBetween: 5,
        centeredSlides: false,
        freeMode: true,
        freeModeSticky: true,
        slidesPerView: 'auto',
        touchRatio: 0.2,
        slideToClickedSlide: false,
        //onTouchStart: function (pos, e) {
        //    startX = e.changedTouches && e.changedTouches[0].clientX;
        //},
        //onTouchEnd: function (pos, e) {
        //    endX = e.changedTouches && e.changedTouches[0].clientX;
        //    //closeVideoOrAudio();
        //    //缩略图滑动位置小于20,认为是点击事件
        //    long = Math.abs(endX - startX)
        //    if (long < 20) {
        //        galleryThumbs.slideTo(pos.clickedIndex);
        //        galleryTop.slideTo(pos.clickedIndex);
        //    }
        //}
    });
    //window.galleryTop.params.control = window.galleryThumbs;
    //window.galleryThumbs.params.control = window.galleryTop;
    initSlide();
}

function initSlide() {
    //因为窗体改变的时候,onresize会调用该方法,这里判断是否已经设置了自动播放的值
    window.silideBar = new SlideBar({
        actionBlock: 'action-block',
        scrollBar: 'scroll-bar',
        entireBar: 'entire-bar',
        barLength: $('#scroll-bar').width(),
        maxNumber: 100,
        value: 110,
        callback: function (value) {
            var $block = $('#action-block')
            if (value <= 100) {
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
    window.galleryTop.stopAutoplay();
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
        for (var i = 0; i < pages.length; i++) {
            html += initDianDuPage(pages[i]);
        }
    }
    $('#' + id).html('').html(html);
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
        html += '</div>'
    }
    var $thumbs = $('#' + id);
    $thumbs.html('').html(html);
    var $swiperSlide = $thumbs.find('.swiper-slide');
    $swiperSlide.eq(0).addClass('swiper-slide-active');
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
 * 生成点读页
 * @param  {[type]} data [根据数据生成点读页]
 */
function initDianDuPage(data) {
    var bgPath = data['pic'];
    var cicleHtml = initCircle(data['points']);
    var h = $(window).height()
    var html = "";
    html += '<div class="m-bg swiper-slide" style="height:' + h + 'px;background-size: 100% 100%;background-image: url(' + bgPath + ');">'
    html += '    <div class="wrap">'
    html += '        <div class="m-dd-start"></div>'
    html += cicleHtml;
    html += '    </div>'
    html += '</div>'
    return html;
}

/**
 * 生成点读位【根据类别使用不同的图标,目前只有 视频,音频,图文】
 * @param  {[type]} data [根据数据生成点读位]
 */
function initCircle(data) {
    var html = "";
    html += '<div data-id="all-radius" data-hide="all-radius-hide">'
    for (var i = 0; i < data.length; i++) {
        //这里由于点读位置大小从开始的100变成72,而页面的比例不变,导正点读位置的比例 和 刚创建时的不一致
        var diff = DIFF * SCALE;
        var left = parseFloat(data[i].x) * $(window).width() + diff;
        var top = parseFloat(data[i].y) * $(window).height() + diff;
        var style = 'left:' + left + 'px; top:' + top + 'px; width:' + POINTSIZE + 'px; height:' + POINTSIZE + 'px';
        var type = data[i]['type'];
        var url = data[i]['url'];
        var filename = data[i]['filename'];
        var title = data[i]['title'];
        var content = data[i]['content'];
        var className = '';
        var mediaImg = "";

        switch (type) {
            case "1": //视频
                className = 'm-video';
                mediaImg = '   <img style="display:none;" src="imgs/video_on.png" alt="video" />';
                break;
            case "2": //音频
                className = 'm-audio';
                mediaImg = '   <img style="display:none; border-radius:50%;" src="imgs/audio.gif" alt="audio" />';
                break;
            case "3": //图文
                className = 'm-imgtext';
                mediaImg = '   <img style="display:none; border-radius:50%;" src="imgs/m_imgtext.png" alt="imgtext" />';
                break;
            default:
                className = 'm-video';
                break;
        }
        html += '<div class="' + className + '" data-title="' + title + '" data-content="' + content + '" data-type="' + type + '" data-url="' + url + '" data-filename="' + filename + '" style="' + style + '">'
        html += mediaImg;
        html += '</div>'
    }
    html += '</div>'
    return html;
}


/*************************************根据数据生成页面 END********************************/
/*=======================音频视频播放相关 START====================*/
function initAudio() {
    audio = document.getElementById('audio');
}

/**
 * 播放或者暂停 音频
 * @param  {[type]} flag [true ，则播放， false 则暂停]
 */
function playOrPaused(flag) {
    if (flag) {
        if (audio.paused) {
            audio.play();
        }
    } else {
        audio.pause();

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
 */
function closeVideoOrAudio() {
    $('.m-audio img').hide(); //隐藏所有的播放GIF图
    $video = $('.m-video-size');
    $video.find('img').hide();
    $video.removeClass('m-video-size');
    video.pause();
    audio.pause();
}
/*=======================音频视频播放相关 END====================*/
/*=======================点击事件相关 START====================*/
function bindEvent() {
    // 启动开关
    $('.m-dd-start').off(click).on(click, function (e) {
        e.preventDefault();
        e.stopPropagation(); //阻止冒泡，否则背景会触发点击事件

        /*点读按钮控制所有点读页的点读位置  2016.3.20 修改 START*/
        setHoverImgSrcx($('.m-dd-start'));
        var $allRadius = $('div[data-id="all-radius"]');
        /*点读按钮控制所有点读页的点读位置  2016.3.20 修改 START*/

        var hideClassName = $allRadius.attr('data-hide');
        if ($allRadius.hasClass(hideClassName)) {
            $allRadius.removeClass();
        } else {
            $allRadius.addClass(hideClassName);
            closeVideoOrAudio();
        }
        return false;
    });

    /**
     * 视频遮罩层关闭菜单
     */
    $('.cd-bouncy-nav-modal .cd-close').off(click).on(click, function () {
        triggerBouncyNav(false);
        $('#video').hide();
    });

    /**
     * 点击空白处,关闭视频播放窗口
     */
    $('.cd-bouncy-nav-modal').off(click).on(click, function (event) {
        if ($(event.target).hasClass('cd-bouncy-nav-modal')) {
            triggerBouncyNav(false);
            $('#video').hide();
        }
    });

    // 视频
    $('.m-video').off(click).on(click, function (e) {
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

            if (video.getAttribute('src') !== url) {
                video.setAttribute('src', url);
            }
            $cTar.addClass(className)
            $tar.find('img').show();
        }

        return false;
    });


    // 音频
    $('.m-audio').off(click).on(click, function (e) {
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
    $('.m-imgtext').off(click).on(click, function (e) {
        closeVideoOrAudio();
        var $tar = $(e.target);
        var $secImgText = $('.sec-imgtext');
        $secImgText.css({position: 'absolute'});
        $secImgText.show();
        var $secImgTextMain = $('.sec-imgtext-main');
        setImgTextLocation($tar, $secImgTextMain);

        var _url = $tar.attr('data-url');
        var _title = $tar.attr('data-title');
        var _content = $tar.attr('data-content');
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


    $('.sec-imgtext').off(click).on(click, function (e) {
        var $tar = $(e.target);
        if ($tar.attr('class') === "sec-imgtext") {
            $tar.css({position: 'relative'});
            $tar.hide();
        }
    })

    /*上下滑动,展示缩略图和自动播放控制轴*/
    $('body').off('swipeUp').on('swipeUp', function (ev) {
        if ($(ev.target).hasClass('swiper-slide-active')) {
            ev.preventDefault();
            $(".gallery-main").show();
            $(".gallery-main").css('opacity', 1);
        }
        return false;
    });

    //关闭时间进度条
    $('#btn-close').off(click).on(click, function (ev) {
        $(".gallery-main").hide();
        return false;
    });

    //点击背景图,停止自动播放
    $('#pages').off(click).on(click, function (ev) {
        window.galleryTop.stopAutoplay();
        //silideBar.setValue(110);  //setValue 会调通 时间进度条的 callback事件
        return false;
    })

    $('#thumbs .swiper-slide').off(click).on(click, function (e) {
        var $tar = $(e.target)
        $tar.parent().find('.swiper-slide').removeClass('swiper-slide-active');
        $tar.addClass('swiper-slide-active');
        window.galleryTop.slideTo(parseInt($tar.attr('data-id')));
    })

}

/**
 * 根据点读位的位置，计算出图文展示的位置[算法]
 * @param $tar
 */
function setImgTextLocation($tar, $secImgTextMain) {
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
 * 判断是否是ＰＣ端
 */
function IsPC() {
    var userAgentInfo = navigator.userAgent;
    var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = false;
            break;
        }
    }
    return flag;
}


/**
 * 从 样式  10px  变成 数字 10
 */
function css2Float(cssProp) {
    cssProp = cssProp || "";
    return parseFloat(cssProp.replace('px', ''));
}

/**
 * 根据QueryString参数名称获取值
 * @param  {[type]} key [key]
 * @return {[type]}      [description]
 */
function getQueryStringByName(key) {
    var result = location.search.match(new RegExp("[\?\&]" + key + "=([^\&]+)", "i"));
    if (result == null || result.length < 1) {
        return "";
    }
    return result[1];
}
