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
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate"/>
  <meta http-equiv="Pragma" content="no-cache"/>
  <meta http-equiv="Expires" content="0"/>
  <base href="/edu/course/diandu/"></base>
  <title></title>
  <link rel="stylesheet" href="./css/font-awesome.min.css"/>
  <link rel="stylesheet" href="./js/lib/frozen/css/frozen.css"/>
  <link rel="stylesheet" href="./js/lib/modal/css/style.css">
  <link rel="stylesheet" href="./css/show.css">
  <link rel="stylesheet" href="./js/lib/swipe/css/swiper.min.css">
  <link rel="stylesheet" href="./js/components/slide/slide.css">
  <link rel="stylesheet" href="./js/components/examshowlist/ExamShowList.css">
  <link rel="stylesheet" href="./js/components/questionslist/QuestionsList.css">
  <link rel="stylesheet" href="./js/components/examcomment/ExamComment.css?v=26">
  <script>
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
    <div id="btn-close" class="btn-close">&times;</div>

    <!--背景音乐,全程音频开关 START-->
    <div class="control-audios">
      <img id="btn_globalAudio"
           style="margin-right: 10px;"
           class="control-global-audio"
           data-src="./imgs/global_audio/global-audio-off.png"
           src="./imgs/global_audio/global-audio-on.png" data-state="1" alt="开启全程音频">
      <img id="btn_bgAudio"
           class="control-bg-audio"
           src="imgs/bg_audio_on.png" alt="开启背景音乐">
    </div>
    <!--背景音乐,全程音频开关 END-->

    <!--透明度进度条 START-->
    <div class="opacity-scroll-bar">
      <div class="slide-txt" style="font-style: italic; margin-bottom: 2px;">设置点读点透明度</div>
      <div class="scroll-bar" id="opacity-scroll-bar" style="width: 40%; float: left;">
        <div class="entire-bar" id="opacity-entire-bar"></div>
        <div class="action-block close" id="opacity-action-block"
             style="color:#000;background: transparent; border-color:#4D4D4D;">
          <div class="action-block-color"
               style="background: #19C587; width:100%;height:100%;"></div>
          <div class="action-block-spam"
               style="position: absolute;text-align: center;width: 100%;height: 100%;top: 0;">
            10
          </div>
        </div>
      </div>
    </div>
    <!--透明度进度条 END-->

    <!--自动播放时间进度条  START-->
    <div class="gallery-main-switch">
      <div class="slide-txt" id="txtTip" style="font-style: italic">设置连播间隔(秒)</div>
      <div class="scroll-bar" id="scroll-bar" style="width: 40%; float: left;">
        <div class="entire-bar" id="entire-bar"></div>
        <div class="action-block close" id="action-block">关</div>
      </div>
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
<section class="btn-fullscreen" >
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
  window.__userid =<?php echo intval($_SESSION['G']['userid']);?>;
</script>
<script src="./js/util/log.js"></script>
<!--brian 2017-05-08-->
<?php if($noneedpay):?>
<script src="./js/lib/zepto.js"></script>
<script src="./js/lib/frozen/js/frozen.js"></script>
<script type="text/javascript">
  window._load = $.loading({content: '加载中...'});
</script>
<script src="./js/lib/swipe/js/swiper.js"></script>
<script src="./js/lib/webuploader/webuploader.html5only.min.js"></script>
<script src="./js/util/scale.js"></script>
<script src="./js/lib/hammer.min.js"></script>
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
<script src="./js/components/examcomment/ExamComment.js?v=1"></script>
<script src="./js/page/show/globalAudio.js?v=20161011"></script>
<script src="./js/page/show/pointOpacity.js"></script>
<script src="./js/page/common/CreatePoint/CreatePoint.js"></script>
<script src="./js/page/show/playVideo/playVideo.js"></script>
<script src="./js/page/show/pointEffect/pointEffect.js"></script>
<script src="./js/page/show/picScale/PicScale.js"></script>
<script src="./js/page/show/audioPanel/audioPanel.js"></script>
<!--<script src="./js/lib/vconsole.min.js"></script>-->
<!--页面入口-->

<script src="./js/show.js?v=3"></script>

<script>
  $(function () {
    var _isDebug = Util.getQueryStringByName('debug');
    if (_isDebug) {
      Util.loadJS("./js/lib/vconsole.min.js")
    }

    //增加PC全屏按钮
    if(!Util.IsPC()){
      $('.btn-fullscreen').remove();
    }else{
      $('.btn-fullscreen').show();
      $('.btn-fullscreen').on('click',function(e){
        var $cTar = $(e.currentTarget)
        var $ifr = $(window.parent.document.getElementsByTagName('iframe')[0]);
        if($cTar.attr('data-flag')!=="1"){
          $ifr.css({
            position:'fixed',
            top:0,
            left:0,
            width:'100%',
            height:'100%',
            'z-index':99999999
          })
          $cTar.addClass('normal-screen')
          $cTar.attr('data-flag',"1")
        }else{
          $ifr.attr('style','')
          $cTar.attr('data-flag',"0")
          $cTar.removeClass('normal-screen')
        }
      })
    }
  })
</script>
<?php else:?>

    <script>
        var teamid="<?php echo $team_video['teamid'];?>";
        var userfen="<?php echo $uinfo['userfen'];?>";
        var pay_videoid="<?php echo  $videoid;?>";
        var cur_url="<?php echo urlencode("/m/point-read/$videoid.html");?>";
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
