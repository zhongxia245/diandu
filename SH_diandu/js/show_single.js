/*=============================定义变量 START===========================*/
var click = IsPC ? 'click' : 'tap';
var audio, video;
var _pagePositionId = 'position';

//创建点读页的背景图大小【本该传到数据库，在传回来，这里就先写死了】
var OLDWIDTH = 1200;
var OLDHEIGHT = 675;

var POINTSIZE;
var SCALE = 1; //缩放的比例
var POINTPOINTSIZE = 72; //点读位置默认大小
var STARTSIZE = 100; //启动位大小

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
 * 页面大小变化，则重新绘制点读位
 * @return {[type]} [description]
 */
window.onresize = function () {
    fn_onResize();
}

function fn_onResize() {
    window.W = $(window).width();
    window.H = $(window).height();
    // SCALE = W > H ? (window.W / OLDWIDTH) : (window.H / OLDWIDTH);
    var _size;
    if (W > H) {
        //横屏
        SCALE = (window.W / OLDWIDTH);
        $('.cd-close').removeClass('cd-close-v');
        $('#div_video').css({
            width: '80%',
            height: '60%'
        })
        _size = window.W * 0.28;
    } else {
        //竖屏
        SCALE = (window.H / OLDWIDTH);
        $('.cd-close').addClass('cd-close-v')
        $('#div_video').css({
            width: '100%',
            height: '75%'
        })
        _size = window.W * 0.5;
    }
    $('.sec-imgtext-main').css({width: _size, height: _size});

    //设置点图为，最大 72 【不符合实际需求，修改成按比例设置大小】
    //POINTSIZE = SCALE * POINTPOINTSIZE > 72 ? 72 : SCALE * POINTPOINTSIZE;
    POINTSIZE = SCALE * POINTPOINTSIZE;

    $('#main').css({
        height: window.H,
        width: window.W
    });
    if (DATA) {
        initPoint(DATA);
    }
}

function init() {
    fn_onResize();

    // 点读页的ID,保存的时候会返回ID
    var id = getQueryStringByName('id') || 1080;
    $.post(URL.base, {action: URL.get, id: id}, function (result, textStatus, xhr) {
        var data = JSON.parse(result);
        DATA = data;
        var strw = data && data.pages.length && data.pages[0].w || "1200";
        OLDWIDTH = parseFloat(strw);
        console.log("OLDWIDTH", OLDWIDTH)
        initPoint(data);
    });

    //初始化播放器，页面里面只有一个视频播放器和一个音频播放器
    initAudio();
    initVideo();
}
/**
 * 初始化节点，在横竖屏切换的时候，可能重新调用
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function initPoint(data) {
    $('#pages').html('');
    initPage('pages', data);
    initThumbs('thumbs', data.pages);
    initSwipe();
    bindEvent();
    initScale();
}

/**
 * 按比例缩放图标
 * @return {[type]} [description]
 */
function initScale() {
    setScale('.m-dd-start', STARTSIZE * SCALE);
    //setScale('.m-dd-start', STARTSIZE);
    setScale('.m-audio', POINTSIZE);
    setScale('.m-audio img', POINTSIZE);
    setScale('.m-video', POINTSIZE);
    setScale('.m-video img', POINTSIZE);
    var $div_video = $('#div_video');
    $div_video.css('marginTop', ((window.H - $div_video.height()) / 2))
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
    //var bullets = document.getElementById('position').getElementsByTagName('li');
    //var slider = Swipe(document.getElementById('slider'), {
    //    continuous: false,
    //    callback: function (pos) {
    //        closeVideoOrAudio();
    //        var i = bullets.length;
    //        while (i--) {
    //            bullets[i].className = ' ';
    //        }
    //        bullets[pos].className = 'on';
    //    }
    //});
    var galleryTop = new Swiper('.gallery-top', {
        continuous: false,
        callback: function (pos) {
            closeVideoOrAudio();
            var i = bullets.length;
            while (i--) {
                bullets[i].className = ' ';
            }
            bullets[pos].className = 'on';
        }
    });
    var galleryThumbs = new Swiper('.gallery-thumbs', {
        spaceBetween: 10,
        centeredSlides: true,
        slidesPerView: 'auto',
        touchRatio: 0.2,
        slideToClickedSlide: true
    });
    galleryTop.params.control = galleryThumbs;
    galleryThumbs.params.control = galleryTop;
}

/*************************************根据数据生成页面 START********************************/
/**
 * 根据返回的数据，动态生成页面
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
        initPagePosition(data['pages'].length);
    }
    $('#' + id).html(html);
}

/**
 * 左右滑动，底部的小圆点
 * @return {[type]} [description]
 */
function initPagePosition(length) {
    var html = "";
    for (var i = 0; i < length; i++) {
        if (i === 0) {
            html += '<li class="on"></li>';
        } else {
            html += '<li></li>';
        }
    }
    ;
    $('#' + _pagePositionId).html(html);
}

/**
 * 生成缩略图【针对批量上传新增的需求】
 */
function initThumbs(id, pages) {
    var html = "";
    for (var i = 0; i < pages.length; i++) {
        var page = pages[i];
        var bgPath = page['pic'];
        html += '<div class="swiper-slide" style="background-image: url(' + bgPath + ');">'
        html += '</div>'
    }
    $('#' + id).html(html)
}

/**
 * 生成点读页
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function initDianDuPage(data) {
    var bgPath = data['pic'];
    var w = window.W;
    var h = window.H;
    var cicleHtml = initCircle(data['points'], w, h);
    var html = "";
    html += '<div class="m-bg swiper-slide" style="background-image: url(' + bgPath + ');">'
    html += '    <div class="wrap">'
    html += '        <div class="m-dd-start"></div>'
    html += cicleHtml;
    html += '    </div>'
    html += '</div>'
    return html;
}

/**
 * 生成点读位【根据类别使用不同的图标,目前只有 视频,音频,图文】
 * @param  {[type]} data [description]
 * @param  {[type]} w [窗体宽]
 * @param  {[type]} h [窗体高]
 * @return {[type]} [description]
 */
function initCircle(data, w, h) {
    var html = "";
    html += '<div data-id="all-radius" data-hide="all-radius-hide">'
    for (var i = 0; i < data.length; i++) {
        var left = parseFloat(data[i].x) * w;
        var top = parseFloat(data[i].y) * h;

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
 * @return {[type]}      [description]
 */
function playOrPaused(flag) {
    if (flag) {
        if (audio.paused) {
            audio.play();
            console.log('播放')
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
 * @return {[type]} [description]
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
 * @return {[type]} [description]
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
    $('.m-dd-start').on(click, function (e) {
        e.stopPropagation(); //阻止冒泡，否则背景会触发点击事件
        // setHoverImgSrcx($(e.target));
        // var $allRadius = $(e.target).parent().find('div[data-id="all-radius"]');

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
    });

    //关闭菜单
    $('.cd-bouncy-nav-modal .cd-close').on(click, function () {
        triggerBouncyNav(false);
        $('#video').hide();
    });
    $('.cd-bouncy-nav-modal').on(click, function (event) {
        if ($(event.target).is('.cd-bouncy-nav-modal')) {
            triggerBouncyNav(false);
        }
    });

    // 视频
    $('.m-video').on(click, function (e) {
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
            console.log('video', url, filename)
        }
    });


    // 音频
    $('.m-audio').on(click, function (e) {
        closeVideoOrAudio();
        var $tar = $(e.target);

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
            console.log('audio', url, filename)
        }
    })

    // 图文
    $('.m-imgtext').on(click, function (e) {
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
    $('.sec-imgtext').on(click, function (e) {
        var $tar = $(e.target);
        if ($tar.attr('class') === "sec-imgtext") {
            $tar.css({position: 'relative'});
            $tar.hide();
        }
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
    console.log(left, _lbx)
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
/**
 * 从 样式  10px  变成 数字 10
 */
function css2Float(cssProp) {
    cssProp = cssProp || "";
    return parseFloat(cssProp.replace('px', ''));
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
