<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, minimum-scale=1.0, maximum-scale=1.0">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <title>点读</title>
  <link rel="stylesheet" href="js/lib/modal/css/style.css">
  <link rel="stylesheet" href="css/show.css">
  <link rel="stylesheet" href="js/components/slide/slide.css">
  <link rel="stylesheet" href="js/lib/swipe/css/swiper.min.css">
</head>

<body>
<div id="main" class="m-bgs page-swipe">
  <div class="swiper-container gallery-top">
    <div id="pages" class="swiper-wrapper">
    </div>
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
      <div id="btn-close"
           style="position: absolute; right: 10px; top: 5px; font-size: 26px; font-weight: bold; color: red; cursor: pointer;">
        X
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
<section class="sec-audio">
  <audio id="bg-audio" src="uploads/5c4a5551f2e5a9e38b81d2e37778d007.mp3" preload="auto"></audio>
  <audio id="audio" preload="auto"></audio>
</section>
<section class="sec-video">
  <div class="cd-bouncy-nav-modal" style="text-align:center;">
    <div id="div_video" style="width:100%; margin:0 auto; padding:0 10px;">
      <video style="width:100%;height:100%;" preload="auto" id="video" controls="controls">
        your browser does not support the video tag
      </video>
    </div>
    <a href="javascript:void(0);" class="cd-close">Close modal</a>
  </div>
</section>
<section class="sec-imgtext">
  <div class="sec-imgtext-main">
    <div class="sec-imgtext-title"></div>
    <div class="sec-imgtext-box">
      <div class="sec-imgtext-content"></div>
      <img class="sec-imgtext-img" src="" alt="">
    </div>
  </div>
</section>

<!--lib-->
<script src="js/lib/zepto.min.js"></script>
<script src="js/lib/swipe/js/swiper.js"></script>
<!--custom-->
<script src="js/util/util.js"></script>
<script src="js/util/log.js"></script>
<script src="js/model/model.js"></script>
<script src="js/components/slide/touchslide.js"></script>
<script src="js/show.js"></script>
</body>

</html>
