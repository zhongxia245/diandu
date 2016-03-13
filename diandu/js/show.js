/*=============================定义变量 START===========================*/
var click = IsPC ? 'click' : 'tap';
var audio, video;
var _pagePositionId = 'position';

var URL = {
    base: 'http://dev.catics.org/edu/course/api.php',
    get: 'get_touch_page_data'
};

/*=============================初始化页面 START===========================*/

$(function () {
    init();
});

function init() {
    // var height = screen.width / 1200 * 675;
    window.W = $(window).width();
    window.H = $(window).height();
    console.log('width', $(window).width(), '==>height', $(window).height());
    $('#main').css({
        height: window.H
    });

    //本地测试用的
    // $.ajax({
    //     type: 'GET',
    //     url: 'data.json',
    //     dataType: 'json',
    //     success: function (data) {
    //         initPage('pages', data);
    //         initSwipe();
    //         bindEvent();
    //     },
    //     error: function (xhr, type) {
    //         console.log('Ajax error!', xhr, type)
    //     }
    // });

    // 点读页的ID,保存的时候会返回ID
    var id = 961;
    $.post(URL.base, { action: URL.get, id: id }, function (result, textStatus, xhr) {
        var data = JSON.parse(result);
        initPage('pages', data);
        initSwipe();
        bindEvent();
    });

    //初始化播放器，页面里面只有一个视频播放器和一个音频播放器
    initAudio();
    initVideo();
}

/**
 * 初始化左右滑动的插件
 * @return {[type]} [description]
 */
function initSwipe() {
    var slider = Swipe(document.getElementById('slider'), {
        continuous: false,
        callback: function (pos) {
            var i = bullets.length;
            while (i--) {
                bullets[i].className = ' ';
            }
            bullets[pos].className = 'on';
        }
    });
    var bullets = document.getElementById('position').getElementsByTagName('li');
}

/*************************************根据数据生成页面 START********************************/
/**
 * 根据返回的数据，动态生成页面
 * @param  {[type]} id [点读页容器id]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function initPage(id, data) {
    console.log('data', data)
    var html = '';
    if (data || data.pages) {
        var pages = data.pages;
        for (var i = 0; i < pages.length; i++) {
            html += initDianDuPage(pages[i]);
        };
        initPagePosition(data.pages.length);
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
    };
    $('#' + _pagePositionId).html(html);
}

/**
 * 生成点读页
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function initDianDuPage(data) {
    console.log('data', data);
    var bgPath = data.pic;
    var cicleHtml = initCircle(data.points);
    var html = "";
    html += '<figure class="m-bg" style="background-image: url(' + bgPath + ');">'
    html += '    <div class="wrap">'
    html += '        <div class="m-dd-start"></div>'
    html += cicleHtml;
    html += '    </div>'
    html += '</figure>'
    return html;
}

/**
 * 生成点读位【根据类别使用不同的图标,目前只有 视频和音频】
 * @param  {[type]} data [description]
 * @return {[type]} [description]
 */
function initCircle(data) {
    var html = "";
    html += '<div data-id="all-radius" data-hide="all-radius-hide">'
    for (var i = 0; i < data.length; i++) {
        var left = parseFloat(data[i].x) * window.W;
        var top = parseFloat(data[i].y) * window.H;
        var type = data[i].type;
        var url = data[i].url;
        var filename = data[i].filename;
        var className = '';
        var mediaImg = "";
        switch (type) {
        case "1": //视频
            className = 'm-video';
            mediaImg = '   <img style="display:none;" src="imgs/video_on.png" alt="video" />';
            break;
        case "2": //音频
            className = 'm-audio';
            mediaImg = '   <img style="display:none;" src="imgs/audio.gif" alt="playing" />';
            break;
        default:
            className = 'm-video';
            break;
        };
        html += '<div class="' + className + '" data-type="' + type + '" data-url="' + url + '" data-filename="' + filename + '" style="left:' + left + 'px; top:' + top + 'px;">'
        html += mediaImg;
        html += '</div>'
    };
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
    $('.cd-bouncy-nav-modal').toggleClass('fade-in', $bool).toggleClass('fade-out', !$bool).find('li:last-child').one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function () {
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
        setHoverImgSrcx($(e.target));
        var $allRadius = $(e.target).parent().find('div[data-id="all-radius"]');
        var hideClassName = $allRadius.attr('data-hide');
        if ($allRadius.hasClass(hideClassName)) {
            $allRadius.removeClass();
        } else {
            $allRadius.addClass(hideClassName);
        }
    });

    //关闭菜单
    $('.cd-bouncy-nav-modal .cd-close').on(click, function () {
        triggerBouncyNav(false);
    });
    $('.cd-bouncy-nav-modal').on(click, function (event) {
        if ($(event.target).is('.cd-bouncy-nav-modal')) {
            triggerBouncyNav(false);
        }
    });

    // 视频
    $('.m-video').on(click, function (e) {
        closeVideoOrAudio();

        $cTar = $(e.currentTarget);
        $tar = $(e.target);
        var className = 'm-video-size';
        triggerBouncyNav(true);

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
        $tar = $(e.target);

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
}
/*=======================点击事件相关 END====================*/
/**
 * 设置图标选中的图片地址
 * @param {[type]} $target [点击图标的Jquery对象]
 */
function setHoverImgSrcx($target) {
    var imgSrc = $target.css('background-image') || $target.css('backgroundImage');
    if (imgSrc.indexOf("_on") === -1) {
        var srcs = imgSrc.split('.');
        var hoverImgSrc = srcs[0] + '_on.' + srcs[1];
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
