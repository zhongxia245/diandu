<!DOCTYPE html>
<html lang="en" style="font-size: 100px">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, minimum-scale=1.0, maximum-scale=1.0">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
  <meta http-equiv="Pragma" content="no-cache" />
  <meta http-equiv="Expires" content="0" />
  <!--上线后去掉注释-->
  <!--<base href="/edu/course/diandu/"></base>-->
  <title></title>
  <link rel="stylesheet" href="./js/lib/vue/MINT/style.css">
  <link rel="stylesheet" href="./css/common.css" />
  <link rel="stylesheet" href="./css/font-awesome.min.css" />
  <link rel="stylesheet" href="./js/lib/frozen/css/frozen.css" />
  <link rel="stylesheet" href="./js/lib/modal/css/style.css">
  <link rel="stylesheet" href="./css/show.css">
  <link rel="stylesheet" href="./js/lib/swipe/css/swiper.min.css">
  <link rel="stylesheet" href="./js/components/slide/slide.css">
  <link rel="stylesheet" href="./js/components/examshowlist/ExamShowList.css">
  <link rel="stylesheet" href="./js/components/questionslist/QuestionsList.css">
  <link rel="stylesheet" href="./js/components/pagecomment/pagecomment.css">
  <script>
    document.oncontextmenu = function () { return false; };
    // 动态计算rem的大小，参照基准 iphone6  375px
    (function (doc, win) {
      let docEl = doc.documentElement
      let resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize'
      let recalc = function () {
        let clientWidth = docEl.clientWidth
        if (!clientWidth) return
        if (clientWidth >= 640) {
          docEl.style.fontSize = '100px'
        } else {
          docEl.style.fontSize = 100 * (clientWidth / 375) + 'px'
        }
      }
      recalc()
      if (!doc.addEventListener) return
      win.addEventListener(resizeEvt, recalc, false)
      doc.addEventListener('DOMContentLoaded', recalc, false)
    })(document, window)
  </script>
</head>

<body>
  <div id="header_vue">
    <!--header START-->
    <header class="diandu__header">
      <div class="diandu__header--left">
        <i class="fa fa-bars" @click="handleOpenSideBar"></i>
        <img 
          v-cloak 
          v-if="hasScale" 
          @click="handleScaleNormal" 
          src="./imgs/mods/header/scale.png" 
          class="diandu-header__scale"
          alt="放大">
      </div>
      <div class="diandu__header--center">
        <img 
          v-cloak 
          v-if="hasGlobalAudio" 
          @click="handleOpenAudio" 
          :src="globalAudioIconPath" 
          class="diandu-header__global-audio"
          alt="全程音频">
      </div>
      <div class="diandu__header--right">
        <div 
          v-if="show_page_comment_btn"
          alt="点读页评论"
          :title="page_comment_count_str"
          class="diandu-header-right__comment" 
          @click="handleOpenComment">
        </div>
        <img 
          src="./imgs/mods/header/icon_setting.png" 
          alt="点读设置" 
          class="diandu-header-right__setting"
          @click="handleOpenSetting">
        <img 
          v-cloak 
          :src="popup_pagelist?'./imgs/mods/header/icon_pages_active.png':'./imgs/mods/header/icon_pages.png'" 
          alt="点读页列表" 
          @click="handleOpenPageList">
        <img 
          v-cloak 
          v-if="show_fullscreen"
          :src="is_fullscreen?'./imgs/mods/header/icon_screen_n.png':'./imgs/mods/header/icon_screen_f.png'" 
          alt="PC全屏" 
          @click="handleFullPanel">
      </div>
    </header>
    <!--header END-->
    <!--POPUP COMPONENT START-->
    <!--右侧目录列表 START-->
    <mt-popup v-cloak v-model="popup_sidebar" position="left" style="width:70%; height:101%;">
      <p style="margin-top:45px;">目录列表[待实现]</p>
    </mt-popup>

    <!--设置页面-->
    <mt-popup v-cloak v-model="popup_setting" position="bottom" style="width:101%;">
      <div class="diandu__setting">
        <div class="diandu-setting__item">
          <p>
            点读点透明度
            <span class="diandu-setting__range-tip">{{setting_opacity}}%</span>
          </p>
          <mt-range :min="0" :max="100" class="audio-player__range" v-model="setting_opacity">
            <div class="range__min" slot="start">0</div>
            <div class="range__max" slot="end">100</div>
          </mt-range>
        </div>
        <div class="diandu-setting__item">
          <p>
            连播间隔
            <span class="diandu-setting__range-tip">{{setting_gap}}秒</span>
          </p>
          <mt-range :min="0" :max="30" class="audio-player__range" v-model="setting_gap">
            <div class="range__min" slot="start">0</div>
            <div class="range__max" slot="end">30</div>
          </mt-range>
        </div>
        <div v-if="hasBgAudio" class="diandu-setting__item diandu-setting__flex">
          <span>背景音乐</span>
          <mt-switch v-model="setting_bgaudio_enable"></mt-switch>
        </div>
      </div>
    </mt-popup>

    <!--点读页列表 START-->
    <mt-popup v-cloak v-model="popup_pagelist" position="bottom" style="width:101%; height:100%;">
      <div class="diandu__pages">
        <div class="diandu-pages__close" @click="handleClosePageList"></div>
        <div class="diandu-pages__top">
          <img :src="pagelist.pic" alt="点读页图片">
          <div class="diandu-pages__top-info">
            <p class="diandu-pages__top-title">{{pagelist.title}}</p>
            <div class="diandu-pages__top-intro">{{pagelist.intro}}</div>
          </div>
        </div>
        <ul class="diandu-pages__main">
          <li :class="{'diandu-pages__item':true,'diandu-pages__item--active':index===pageActiveIndex}" @click="handleSelectedPage"
            v-for="(page,index) in pagelist.data" :data-index="index" :style="{backgroundImage:'url('+page.pic+')'}">
            <p>{{index + 1}}</p>
          </li>
        </ul>
        <div>
        </div>
      </div>
    </mt-popup>

    <!--音乐播放器 START-->
    <mt-popup  v-cloak v-model="popup_audioplayer" position="bottom" style="width:101%;">
      <div class="audio-player">
        <div class="audio-player__progress">
          <span>{{currentTimeStr}}</span>
          <mt-range :min="0" :max="audioplayer.totalTime" class="audio-player__range" v-model="audioplayer.currentTime"></mt-range>
          <span>{{totalTimeStr}}</span>
        </div>
        <div class="audio-player__controls">
          <div class="audio-player__control--left">
            <div class="audio-player-control_btn"></div>
          </div>
          <div class="audio-player__control--center">
            <div class="audio-player-control_btn audio-player-control__pre" @click="handleAudioPlayerPre"></div>
            <div :class="{'audio-player-control_btn':true,'audio-player-control--play':true,'audio-player-control--pause':audioplayer.play}"
              @click="handleAudioPlayerPlay"></div>
            <div class="audio-player-control_btn audio-player-control__next" @click="handleAudioPlayerNext"></div>
          </div>
          <div class="audio-player__control--right">
            <div class="audio-player-control_btn audio-player-control__setting" @click="handleAudioPlayerSetting"></div>
          </div>
        </div>
      </div>
    </mt-popup>
    <!--POPUP COMPONENT END-->
  </div>
  

  <div id="container" class="m-bgs page-swipe">
    <div class="swiper-container dandu-pages">
      <div id="pages" class="swiper-wrapper">
      </div>
      <!-- Add Arrows -->
      <div class="swiper-button-next" style="display: none;"></div>
      <div class="swiper-button-prev" style="display: none;"></div>
      <div id="id_pagination" class="pages_pagination">
        <span id="id_pagination_cur">1</span> / <span id="id_pagination_total">1</span>
      </div>
    </div>
  </div>
  <!--音频 START-->
  <section class="sec-audio">
    <audio id="bg-audio" loop="loop"></audio>
    <audio id="global-audio" preload="auto"></audio>
    <audio id="point-audio" preload="auto"></audio>
  </section>
  <!--音频 END-->
  <!--图文 START-->
  <section class="sec-imgtext-mask">
    <section class="sec-imgtext">
      <div class="sec-imgtext-main">
        <div class="sec-imgtext-title"></div>
        <div class="sec-imgtext-box">
          <div class="sec-imgtext-content"></div>
          <img class="sec-imgtext-img" src="" alt="">
        </div>
      </div>
    </section>
  </section>
  <!--图文 END-->
  <!--考试 START-->
  <section class="sec-exam" style="display: none;">
    <div class="exam-list" style="height: 100%;"></div>
    <div class="question-list" style="height: 100%;"></div>
  </section>
  <!--考试 END-->
  <!--lib-->
  <!--微信录音-->
  <script src="http://res.wx.qq.com/open/js/jweixin-1.0.0.js"></script>
  <script>
    wx.config({
      debug: false,//调试开关
      appId: '<?php echo $signPackage["appId"];?>',
      timestamp: '<?php echo $signPackage["timestamp"];?>',
      nonceStr: '<?php echo $signPackage["nonceStr"];?>',
      signature: '<?php echo $signPackage["signature"];?>',
      jsApiList: [
        'startRecord', 'stopRecord', 'onVoiceRecordEnd', 'playVoice', 'pauseVoice', 'stopVoice', 'onVoicePlayEnd', 'uploadVoice', 'downloadVoice'
      ]
    });

    wx.ready(function () {
      // 在这里调用 API
      console.log("微信录音初始化成功")
    });
  </script>
  <script src="./js/lib/vue/vue.min.js"></script>
  <script src="./js/lib/vue/MINT/index.js"></script>
  <script src="./js/lib/zepto.js"></script>
  <script src="js/lib/handlebars.min.js"></script>
  <script src="./js/lib/frozen/js/frozen.js"></script>
  <script type="text/javascript">
    window._load = $.loading({ content: '加载中...' });
  </script>
  <script src="./js/lib/swipe/js/swiper.min.js"></script>
  <script src="./js/lib/webuploader/webuploader.html5only.min.js"></script>
  <script src="./js/util/scale.js"></script>
  <script src="./js/lib/hammer.min.js"></script>
  <script src="./js/lib/three.min.js"></script>
  <script src="./js/lib/OBJLoader.js"></script>
  <!--custom-->
  <script src="./js/util/util.js"></script>
  <script src="./js/util/arrayUtil.js"></script>
  <script src="./js/util/drag.js"></script>
  <script src="./js/util/timeago.js"></script>
  <!--Ajax操作-->
  <script src="./js/model/model.js?v=5"></script>
  <!--展示页面组件,定时播放滑块,考试列表,题目列表,评论列表-->
  <script src="./js/components/slide/touchslide.js"></script>
  <script src="./js/components/slide/slide.js"></script>
  <script src="./js/components/examshowlist/ExamShowList.js"></script>
  <script src="./js/components/questionslist/QuestionsList.js"></script>
  <script src="./js/components/pagecomment/PageComment.js"></script>
  <script src="./js/page/show/globalAudio.js"></script>
  <script src="./js/page/show/pointOpacity.js"></script>
  <script src="./js/page/common/CreatePoint/CreatePoint.js"></script>
  <script src="./js/page/show/playVideo/playVideo.js"></script>
  <script src="./js/page/show/pointEffect/pointEffect.js"></script>
  <script src="./js/page/show/picScale/PicScale.js"></script>
  <script src="./js/page/show/audioPanel/audioPanel.js"></script>
  <script src="./js/page/show/swayEffect/swayEffect.js"></script>
  <script src="./js/page/common/ObjViewer/ObjViewer.js"></script>
  <script src="./js/page/show/modal_3dviewer/Modal_3DViewer.js"></script>
  <!--页面入口-->
  <script src="./js/header.vue.js"></script>
  <script src="./js/show.js"></script>
  <script>
    $(function () {
      var _isDebug = Util.getQueryStringByName('debug');
      if (_isDebug) {
        Util.loadJS("./js/lib/vconsole.min.js")
      }
    })
  </script>
</body>

</html>
