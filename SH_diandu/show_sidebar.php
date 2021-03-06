<!--获取wiki帐号-->
<?php
session_start();
include_once('../course_common.php');
if (strpos($_SERVER['HTTP_USER_AGENT'], 'MicroMessenger') !== false) {
	require_once "php/jssdk.php";
	$jssdk = new JSSDK("wx226ae435e99fe5a6", "354fe7648b0c7188d7e0a65e7f600a11");
	$signPackage = $jssdk->GetSignPackage();
}
//brian 2017-05-08
$videoid=intval($_GET['videoid']);
$team_video=$_COURSE->GetInfo("team_video",0,"videoid=$videoid");
$videoinfo=$_COURSE->GetInfo("video",$videoid);
$team_role=get_team_role($team_video['teamid']);
if($team_video['isprivate']==1 && $team_role<1)
{
  if(isMobile())
      header("Location:/edu/course/mobile/notfound.php?act=attend_group&teamid={$team_video['teamid']}&error_info=".urlencode("本内容仅限本组成员访问，您确定加入本小组吗?")."&jump_url=".urlencode("/m/point-read/$videoid.html"));
  else
      header("Location:/edu/course/notfound.php?act=attend_group&teamid={$team_video['teamid']}&error_info=".urlencode("本内容仅限本组成员访问，您确定加入本小组吗?")."&jump_url=".urlencode("/point-read/{$team_video['id']}.html"));
  exit();
}
$noneedpay=true;
if(!($videoinfo['charge']==0 || ($videoinfo['charge']==1 && $team_role==2) || $team_role>2))
{
    $noneedpay=$_COURSE->Study($_SESSION['G']['userid'],$videoid,0);
}
//brian 2017-05-08
?>
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
  <base href="/edu/course/diandu/"></base>
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
  <style>
      .side_bar{background-color:#00cc99;position:fixed;top:0;left:0;width:8rem;height:100%;font-size:14px;}
      .side_bar_width{width:6.6rem;margin:0 auto;}
      .side_search_area{width:6.6rem;height:40px;border-radius:40px;background-color:#1ea583;margin:0 auto;margin-top:25px;}
      .btn_search{width:40px;height:40px;margin-left:10px;background:url(images/gray_search.png) no-repeat center center / 30px 30px;display:inline-block;}
      .side_search_area input[name='search']{display:inline-block;  vertical-align:top;height:22px;margin-top:9px;width:4.5rem;background-color:transparent;border:none;-webkit-appearance: none;color:#fff;}

      .userinfo{margin-top:15px;color:#fff;}
      .userphoto{width:40px;height:40px;border-radius: 40px;}

      .group_name{text-align:left;height:0.9rem;line-height:0.9rem;border-top:1px solid #fff;border-bottom:1px solid #fff;color:#fff;background-color:#45c0a4;margin-top:15px;}
      .team_wrapper{margin-top:15px;color:#fff;}
      .team_name{height:0.9rem;line-height:0.9rem;margin-top:15px;text-indent:0.75rem;background:url(images/iconnav_group.png) no-repeat left center / auto 50%;}
      .unit_list{margin-left:0.75rem;width:5.5555rem;overflow-y:auto;-webkit-overflow-scrolling:touch;}
      .unit_name{position:relative;min-height:0.9rem;line-height:0.9rem;background:url(images/iconnav_danyuan.png) no-repeat left 0.225rem / auto 0.45rem;text-indent:0.75rem;}
      .unit_content{width: 4.73rem;border-left: 1px solid rgba(255,255,255,0.4);margin-left: 0.2rem;}
      .content_info{margin-left:0.55rem;}
      .info_icon{width:0.5rem;height:0.5rem;background:url() no-repeat left 0.1rem / auto 0.3rem;float:left;}
      .info_txt{float:left;width:3.65rem;line-height:0.5rem;}
      .icon_diandu{background-image:url(/edu/course/mobile/images/iconnav_reading.png);}
      .icon_tuwen{background-image:url(/edu/course/mobile/images/iconnav_picture.png);}
      .icon_video{background-image:url(/edu/course/mobile/images/iconnav_movie.png);}
      .icon_audio{background-image:url(/edu/course/mobile/images/iconnav_audio.png);}
      .icon_exam{background-image:url(/edu/course/mobile/images/iconnav_exam.png);}
      .icon_hua{background-image:url(/edu/course/mobile/images/iconnav_music.png);}

      .content_info_cur .icon_audio{background-image:url(/edu/course/mobile/images/iconnav_audio-a.png);}
      .content_info_cur .icon_diandu{background-image:url(/edu/course/mobile/images/iconnav_reading-a.png);}
      .content_info_cur .icon_tuwen{background-image:url(/edu/course/mobile/images/iconnav_picture-a.png);}
      .content_info_cur .icon_video{background-image:url(/edu/course/mobile/images/iconnav_movie-a.png);}
      .content_info_cur .icon_exam{background-image:url(/edu/course/mobile/images/iconnav_exam-a.png);}
      .content_info_cur .icon_hua{background-image:url(/edu/course/mobile/images/iconnav_music-a.png);}
      .content_info_cur .info_txt{color:#fff600;}
  </style>
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
  <div id="container" class="m-bgs page-swipe">
    <!--header START-->
    <header class="diandu__header">
      <div class="diandu__header--left" @click="handleOpenSideBar">
        <i class="fa fa-bars"></i>
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
          :title="page_comment_count_str"
          class="diandu-header-right__comment" 
          @click="handleOpenComment">
        </div>
        <img 
          src="./imgs/mods/header/icon_setting.png" 
          alt="点读页列表" 
          class="diandu-header-right__setting"
          @click="handleOpenSetting">
        <img 
          src="./imgs/mods/header/icon_pages.png" 
          alt="点读页列表" 
          @click="handleOpenPageList">
      </div>
    </header>
    <!--header END-->
    <!--POPUP COMPONENT START-->
    <!--右侧目录列表-->
    <mt-popup v-cloak v-model="popup_sidebar" position="left" style="width:70%; height:100%;">
      <p style="margin-top:45px;">
        <div id="weight_h">
            <div class="side_search_area">
                <span class="btn_search" @click="goSearch"></span><input type="search" v-model="search" name="search"/>
            </div>
            <div class="userinfo side_bar_width clearfix" v-if="userid>0">
                <img @click="jumpPersonalPage" class="userphoto" src="<?php echo $uinfo['avatar'];?>"/>
                <span class="username"><?php echo $uinfo['username'];?></span>
            </div>

            <div class="row group_name" v-if="logoid>0" @click="jumpTeamIconPage()">
                <div class="side_bar_width">{{logoname}}</div>
            </div>
        </div>
        <div class="team_wrapper side_bar_width">
            <div class="team_name" @click="jumpTeamPage()">{{group_name}}</div>
            <div class="unit_list">
                <template v-for="(item,index) in unit_list">
                    <div class="unit_name" @click="jumpUnitPage(item.id)"><div @click.stop="showUnitVideo(item.id,index)" style="width:0.75rem;height:0.9rem;position:absolute;left:0;"></div><span v-html="item.name"></span></div>
                    <div class="unit_content" v-show="show_unit==item.id">
                        <div @click="jumpVideoPage(item2.id,item2.istext)" class="content_info clearfix" v-for="(item2,index2) in item.videolist" :class="{content_info_cur:item2.id==team_video_id}">
                            <div class="info_icon" :class="{icon_video:item2.istext==0,icon_tuwen:item2.istext==1,icon_audio:item2.istext==2,icon_hua:item2.istext==3,icon_exam:item2.istext==4,icon_diandu:item2.istext==5}"></div>
                            <div class="info_txt" v-html="item2.title"></div>
                        </div>
                    </div>
                </template>
            </div>
        </div>
      </p>
    </mt-popup>

    <!--点读页列表-->
    <mt-popup v-cloak v-model="popup_pagelist" position="bottom" style="width:101%; height:100%;">
      <div class="diandu__pages">
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
      </div>
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

    <!--音乐播放器-->
    <mt-popup  v-cloak v-model="popup_audioplayer"  position="bottom" style="width:101%; height:25%;">
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
  <!--考试 START-->
  <section class="btn-fullscreen">
  </section>
  <!--考试 END-->
  <!--lib-->
<!--brian 2017-05-08-->
<?php if(!$noneedpay):?>
    <script type="text/javascript" src="/edu/course/js/jquery.min.js"></script>
    <script src="/edu/course/mobile/js/common.js"></script>
    <style>#pay_dialog{z-index:9999;}</style>
<?php
    include "../mobile/public/pay_dialog.php";
endif;
?>
<!--brian 2017-05-08-->
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
    //获取用户id
    window.__userid ='<?php echo intval($_SESSION['G']['userid']);?>';
  </script>
<!--brian 2017-05-08-->
<?php if($noneedpay):?>
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
  <script src="./js/page/show/fullscreen.js"></script>
  <script src="./js/header.vue.sidebar.js"></script>
  <script src="./js/show.js"></script>
  <script>
    var team_video_id="<?php echo intval($team_video['id']);?>";
    $(function () {
      var _isDebug = Util.getQueryStringByName('debug');
      if (_isDebug) {
        Util.loadJS("./js/lib/vconsole.min.js")
      }
    })
  </script>
<?php else:?>
  <script>
      var teamid="<?php echo $team_video['teamid'];?>";
      var userfen="<?php echo $uinfo['userfen'];?>";
      var pay_videoid="<?php echo  $videoid;?>";
      var cur_url="<?php echo urlencode('/m/point-read/$videoid.html');?>";
      var money="<?php echo $videoinfo['cost']?>";
      var islogin=window.__userid;
      <?php if($videoinfo['charge']==2 && $team_role==2):?>
      money="<?php echo $videoinfo['cost']/2;?>";
      <?php endif;?>
      pay_dialog.find("#content_fee").text(money);
      center_dialog(pay_dialog);
  </script>
<?php endif;?>
<!--brian 2017-05-08-->
</body>
</html>
