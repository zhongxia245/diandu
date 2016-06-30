<!--获取wiki帐号-->
<?php
session_start();
include_once('../course_common.php');
if(strpos($_SERVER['HTTP_USER_AGENT'], 'MicroMessenger') !== false){
  require_once "php/jssdk.php";
  $jssdk = new JSSDK("wx226ae435e99fe5a6", "354fe7648b0c7188d7e0a65e7f600a11");
  $signPackage = $jssdk->GetSignPackage();
}
?>
<!DOCTYPE html>
<html lang="en" style="font-size: 100px">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, minimum-scale=1.0, maximum-scale=1.0">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate"/>
  <meta http-equiv="Pragma" content="no-cache"/>
  <meta http-equiv="Expires" content="0"/>
  <title>点读展示</title>
  <link rel="stylesheet" href="js/lib/frozen/css/frozen.css"/>
  <link rel="stylesheet" href="js/lib/modal/css/style.css">
  <link rel="stylesheet" href="css/show.css?v=20160628">
  <link rel="stylesheet" href="js/lib/swipe/css/swiper.min.css">
  <link rel="stylesheet" href="js/components/slide/slide.css">
  <link rel="stylesheet" href="js/components/examshowlist/ExamShowList.css">
  <link rel="stylesheet" href="js/components/questionslist/QuestionsList.css">
  <link rel="stylesheet" href="js/components/examcomment/ExamComment.css?v=26">
  <link rel="stylesheet" href="js/lib/flowplayer/skin/functional.css">
</head>

<body>
<div id="main" class="m-bgs page-swipe">
  <div class="swiper-container gallery-top">
    <div id="pages" class="swiper-wrapper">
    </div>
    <!-- Add Arrows -->
    <div class="swiper-button-next" style="display: none;"></div>
    <div class="swiper-button-prev" style="display: none;"></div>
    <div id="id_pagination" class="pages_pagination">
      <span id="id_pagination_cur">1</span> / <span id="id_pagination_total">1</span>
    </div>
  </div>

  <div class="gallery-main" style="opacity: 0; overflow: hidden;">
    <!--自动播放时间进度条  START-->
    <div class="gallery-main-switch">
      <div id="txtTip" style="width:30%; float: left; font-size: 12px; text-align: center;">
        <div>自动播放设置</div>
        <div>(方格中的数字为间隔时间)</div>
      </div>
      <div class="scroll-bar" id="scroll-bar" style="width: 40%; float: left;">
        <div class="entire-bar" id="entire-bar"></div>
        <div class="action-block close" id="action-block">关</div>
      </div>
      <img class="" id="btn_bgAudio" style="cursor: pointer;" src="imgs/bg_audio_on.png" alt="开启背景音乐">
      <!--<label style="line-height: 40px;"><input id="cb_bgAudio" checked type="checkbox"/>背景音乐</label>-->
      <div id="btn-close" class="btn-close">X</div>
    </div>
    <!--自动播放时间进度条 END-->
    <!--缩略图 START-->
    <div class="swiper-container gallery-thumbs">
      <div id="thumbs" class="swiper-wrapper ">
      </div>
    </div>
    <!--缩略图 END-->
  </div>
</div>
<!--音频 START-->
<section class="sec-audio">
  <audio id="bg-audio" preload="auto" loop="loop" ></audio>
  <audio id="audio" preload="auto"></audio>
</section>
<!--音频 END-->
<!--视频 START-->
<section class="sec-video">
  <div class="cd-bouncy-nav-modal" style="text-align:center;">
    <div id="div_video" class="flowplayer" style="width:100%; margin:0 auto; padding:0 10px;">
      <video style="width:100%;height:100%;" preload="auto" id="video" controls="controls">
        your browser does not support the video tag
      </video>
      <!--<video id="video" style="width:100%;height:100%;">-->
        <!--<source id="videoSource"  type="video/mp4" src="http://vjs.zencdn.net/v/oceans.mp4">-->
      <!--</video>-->
    </div>
    <a href="javascript:void(0);" class="cd-close">Close modal</a>
  </div>
</section>
<!--视频 END-->
<!--图文 START-->
<section class="sec-imgtext">
  <div class="sec-imgtext-main">
    <div class="sec-imgtext-title"></div>
    <div class="sec-imgtext-box">
      <div class="sec-imgtext-content"></div>
      <img class="sec-imgtext-img" src="" alt="">
    </div>
  </div>
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
      'startRecord','stopRecord','onVoiceRecordEnd','playVoice','pauseVoice','stopVoice','onVoicePlayEnd','uploadVoice','downloadVoice'
    ]
  });

  //演示demo代码
  window.resLocalId='';//本地录音文件ID
  window.resRemoteId='';//服务器端录音文件ID
  wx.ready(function () {
    // 在这里调用 API
    console.log("微信录音初始化成功")
  });

  //获取用户id
  window.__userid=<?php echo intval($_SESSION['G']['userid']);?>;
</script>
<!--<script src="js/lib/jquery.min.js"></script>-->
<!--<script src="js/lib/vconsole.min.js"></script>-->
<script src="js/lib/zepto.js?vvv=20160628_1112"></script>
<script src="js/lib/swipe/js/swiper.js"></script>
<script src="js/lib/webuploader/webuploader.html5only.min.js"></script>
<script src="js/lib/frozen/js/frozen.js"></script>
<!--custom-->
<script src="js/util/arrayUtil.js"></script>
<script src="js/util/util.js"></script>
<script src="js/util/drag.js"></script>
<script src="js/util/timeago.js"></script>
<script src="js/lib/flowplayer/flowplayer.min.js"></script>
<!--Ajax操作-->
<script src="js/model/model.js"></script>
<!--展示页面组件,定时播放滑块,考试列表,题目列表,评论列表-->
<script src="js/components/slide/touchslide.js"></script>
<script src="js/components/examshowlist/ExamShowList.js"></script>
<script src="js/components/questionslist/QuestionsList.js"></script>
<script src="js/components/examcomment/ExamComment.js?_version=20160625"></script>
<!--页面入口-->
<script src="js/show.js?version=20160628"></script>
</body>

</html>
