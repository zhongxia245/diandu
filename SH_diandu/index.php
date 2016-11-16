<?
session_start();
include_once('../course_common.php');
$teamid = $_REQUEST[teamid];//小组id
$id = $_REQUEST[id];//点读页id team_video_id
$unitid = intval($_GET['unitid']);
if (get_team_role($teamid) < 1) {
    exit("invalid");
}
if ($id > 0) {
    $team_video = $_COURSE->GetInfo("team_video", $id);
    if ($team_video['userid'] != $_SESSION['G']['userid']) {
        exit("invalid");
    }

    $video = $_COURSE->GetInfo("video", $team_video['videoid']);

    $pic_arr = explode(",", $video['pic']);
}
?>

<!DOCTYPE html>
<html lang="en" data-selected="0">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width,user-scalable=no">
    <title>创建点读页</title>
    <link rel="stylesheet" href="css/lib/bootstrap/css/bootstrap.min.css"/>
    <link rel="stylesheet" href="js/lib/bootstrap-slider/bootstrap-slider.min.css"/>
    <link rel="stylesheet" href="js/lib/uploadify/uploadify.css"/>
    <link rel="stylesheet" href="css/font-awesome.min.css"/>
    <link rel="stylesheet" href="css/index.css"/>
    <link rel="stylesheet" href="js/components/imgtext/imgtext2.css"/>
    <link rel="stylesheet" href="js/components/examcreate/ExamCreate.css"/>
    <link rel="stylesheet" href="/edu/course/js/jcrop/css/jquery.Jcrop.min.css"/>
    <link rel="stylesheet" href="/edu/course/js/jquery-ui/jquery-ui.min.css"/>
    <!---add by brian 20160426-->
    <style>
        .choose_area {
            background-color: #ff9900;
            color: #fff;
            width: 80px;
            height: 35px;
            line-height: 35px;
            text-align: center;
            margin: 0 auto;
            cursor: pointer;
            clear: both;
            margin-top: 15px;
        }

        .jc-demo-box {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(200, 200, 200, 0.5);
            display: none;
            z-index: 602;
        }

        .jcrop-holder {
            float: left;
            border: 2px solid #ddd;
            margin-left: 15px;
        }

        .jc-demo-dialog {
            width: 750px;
            margin: 0 auto;
            background: #f3f2f0;
            padding-bottom: 20px;
        }

        .jc-demo-content {
            margin-top: 15px;
        }

        .jc-demo-title {
            height: 40px;
            line-height: 40px;
            font-size: 18px;
            text-indent: 15px;
            background-color: #00d096;
            position: relative;
            color: #fff;
        }

        .jc-demo-close {
            height: 40px;
            width: 40px;
            background: url(../images/select_close.png);
            background-color: #fff;
            position: absolute;
            right: 0;
            cursor: pointer;
            top: 0;
        }

        .jc-demo-content-right {
            float: left;
            width: 280px;
            margin-left: 10px;
        }

        .preview-container {
            overflow: hidden;
            border: 2px solid #ddd;
            margin: 0 auto;
        }

        .choose_area_tips {
            margin: 0 auto;
            width: 200px;
            font-size: 16px;
            color: gray;
            clear: both;
        }

        .upload-li {
            position: relative;
        }

        .upload_cover_del {
            position: absolute;
            bottom: 0px;
            right: 0px;
            background-color: #ddd;
            color: gray;
            width: 60px;
            height: 30px;
            line-height: 30px;
            text-align: center;
        }
    </style>
</head>

<body>
<div class="main">
    <!-- Header start -->
    <header>
        <a href="/edu/index-login.php" class="header-logo">
        </a>

        <div class="header-title">
            创建点读页
        </div>
        <div class="header-close" id="close"><span>&times;</span></div>
    </header>
    <!-- Header end -->
    <!-- baseinfo start -->
    <section class="baseinfo">
        <div class="baseinfo-title">基本信息</div>
        <div class="form-group">
            <label for="name">点图页名称</label><span style="color: red;font-size: 20px;">*</span>
            <input type="text" class="form-control" id="name" placeholder="" value="<?php echo $video['name']; ?>">
        </div>
        <div class="form-group">
            <label for="intro">简介<span>( 选填 )</span></label>
            <textarea class="form-control" id="intro" rows="5"
                      placeholder="介绍测试的相关内容、注意点等,简洁不能超过100字"><?php echo $video['saytext']; ?></textarea>
        </div>
        <div class="form-group">
            <label>
                缩略图
                <span>(缩略图像素要求为205x205,1号图为封面图,
            <span style="color:#FF7B5A;">出现在点读页面</span> ,如上传多个缩略图，可实现鼠标预选序号动画效果)
        </span>
            </label>

            <div class="upload-img">
                <ul class="upload-ul" id="ulImgs">
                    <li class="upload-li seq0"><img
                            src="<?php echo empty($pic_arr[0]) ? 'imgs/upload_bg_150.png' : $pic_arr[0]; ?>"
                            alt=""></li>
                    <li class="upload-li seq1"><img
                            src="<?php echo empty($pic_arr[1]) ? 'imgs/upload_bg_150.png' : $pic_arr[1]; ?>"
                            alt=""></li>
                    <li class="upload-li seq2"><img
                            src="<?php echo empty($pic_arr[2]) ? 'imgs/upload_bg_150.png' : $pic_arr[2]; ?>"
                            alt=""></li>
                    <li class="upload-li seq3"><img
                            src="<?php echo empty($pic_arr[3]) ? 'imgs/upload_bg_150.png' : $pic_arr[3]; ?>"
                            alt=""></li>
                    <li class="upload-li seq4"><img
                            src="<?php echo empty($pic_arr[4]) ? 'imgs/upload_bg_150.png' : $pic_arr[4]; ?>"
                            alt=""></li>
                </ul>
            </div>
        </div>
    </section>
    <!-- baseinfo end -->
    <!-- setting start-->
    <section class="setting">
        <div class="setting-charge">
            <div class="setting-title">收费设置(可选)</div>
            <div class="form-group">
                <label for="">收费设置</label>
                <input name="pic" type="hidden"/>
                <div class="riado-group">
                    <div>
                        <label style="width:300px">
                            <input type="radio" name="chargeType" value="0" checked> 免费(或由视频收费)
                        </label>
                        <label style="width:300px">
                            <input type="radio" name="chargeType" value="1"> 收费但对VIP免费
                        </label>
                    </div>
                    <div>
                        <label style="width:300px">
                            <input type="radio" name="chargeType" value="2"> 收费但对VIP半价
                        </label>
                        <label style="width:300px">
                            <input type="radio" name="chargeType" value="3"> 全部收费
                        </label>
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label for="chargeStandard">收费标准</label>

        <div class="input-group">
          <input type="text" class="form-control" id="chargeStandard">

          <div class="input-group-addon">元</div>
          <div class="input-group-addon" style="background: none;border: 0;">
            <span class="note">(免费模式无需设置)</span>
          </div>
        </div>
      </div>
    </div>
    <div class="setting-diandu">
      <div class="baseinfo-title">
        <span>点读页创建</span>
        <div class="setting-diandu-icon" id="pointSetting"><i class="fa fa-cog" aria-hidden="true"></i></div>
      </div>
      <!-- TODO:多个点读页 -->
      <!-- 点读页集合 START -->
      <div id="id_diandupages" class="diandupages">
      </div>
      <!-- 点读页集合 END -->
      <!-- setting btns start -->
      <div class="setting-btns">
        <div class="setting-btn" id="btnAdd">新增点读页</div>
        <div style="margin: 25px 0;">
          <div class="setting-title" style="width: 100%;">自动播放时的音乐设置(可选)</div>
          <div class="setting-btn-autovideo" id="btnAutoAudio">
            <span>点击上传自动播放时的背景音乐(MP3格式)</span>
            <input type="file" id="file_btnAutoAudio" class="filehide"/>
            <input type="hidden" id="file_btnAutoAudio_path"/>
          </div>
        </div>
        <div class="setting-btn setting-btn-last" id="btnSubmit">提交</div>
      </div>
      <!-- setting btns end -->
    </div>
  </section>
  <!-- setting end -->
</div>
<!--创建考试-->
<div id="_examCreate"></div>
<!--点读点大小设置-->
<div id="dianduPointSetting"></div>

<!--点读点大小设置-->
<div id="globalAudioSetting" style="display: none;"></div>
<!--自定义点读点-->
<div id="customPointSetting" style="display: none;"></div>
<!--上传文件类型选择，显示隐藏，删除 模版 START-->
<script id="tpl_uploadSetting" type="text/x-handlebars-template">
  <li class="upload-item item{{index}}" data-index="{{index}}">
    <div class="upload-radius">
      <img src="imgs/hide_t.png" style="position: relative;visibility: hidden;">
      <div class="upload-radius-in" id="item{{id}}" style="margin-top:-90px;">{{index}}</div>
    </div>
    <div class="upload-type">
      <ul data-id="{{id}}">
        <li title="点读点大小" style="margin: -13px 22px 0 -11px;" class="number-container"></li>
        <li title="视频" class="video" data-type="uploadType" data-file-type="video"
            data-text="点击上传MP4格式的视频文件"></li>
        <li title="音频" class="audio" data-type="uploadType" data-file-type="audio"
            data-text="点击上传MP3格式的音频文件"></li>
        <li title="图文" class="imgtext" data-type="uploadType" data-file-type="imgtext"
            data-text="点击上传图文(支持文字和图片)"></li>
        <li title="考试" class="exam" data-type="uploadType" data-file-type="exam" data-text="点击上传试卷"></li>
        <li title="开关" class="on-off" data-type="uploadType" data-file-type="on-off" data-text="点击设置开关"></li>
      </ul>
    </div>
    <div class="upload-right" data-type="{{type}}" data-upload="{{upload}}">
      <div class="upload-right-name notselect">
        <span>{{fileName}}</span>

        <div class="div-file">
          <div class="div-file-mask" style="display:none"></div>
          <input type="file" id="__file{{id}}" data-fileId="{{id}}" name="upload" class="fileupload"/>
        </div>
        <img class="download" src="imgs/download.png" alt="download">
      </div>
      <div class="upload-right-btn">
        <ul data-id="{{id}}" data-index="{{index}}">
          <li title="点读点设置" class="img-point-setting" data-type="point-setting"></li>
          <li title="隐藏" class="img-hide" data-type="hide" data-show="0"></li>
          <li title="删除" class="img-delete" data-type="delete"></li>
          <li title="全程音频" class="img-global-audio" data-type="global-audio"></li>
          <li title="设置全程音频" class="img-global-audio-setting"
              data-type="global-audio-setting"
              style="display:none"></li>
        </ul>
      </div>
    </div>
  </li>
</script>
<!--上传文件类型选择，显示隐藏，删除 模版 END-->
<!--背景图模板 START-->
<script id="tpl_bg" type="text/x-handlebars-template">
  <hr/>
  <div class="diandupageitem" data-index="{{index}}">
    <div class="setting-bigimg">
      <div class="setting-bigimg-header">
        <div class="sort-info">
          <span class="sort">{{index}}</span>
          <span class="filename"></span>
        </div>
        <input type="file" name="file_bg" id="file_bg{{index}}" class="filehide file_bg"/>
        <span class="h-tip">横屏背景图比例 16:9</span>
        <span class="v-tip" style="display:none;">竖屏背景图比例 9:16</span>
        <span style="display:none">点击确定点读位置，根据对应的编号在图片下方列表中设置点读素材</span>
        <ul class="bigimg-h">
          <li class="down hide"></li>
          <li class="up hide"></li>
          <li class="hide1 hide"></li>
          <li class="show1" style="display:none;"></li>
          <li class="del"></li>
        </ul>
      </div>
      <div style="{{style}}" class="setting-bigimg-img id_bg" id="id_bg{{index}}" data-index="{{index}}">
        <div class="_mask"></div>
        <div class="diandu-img btn_start" style="display:none;"></div>
        <div class="setting-bigimg-tip-h bigimg-tip">
          <h3>提示</h3>
          <p style="font-size:16px">手机横屏比例为16:9，对应像素通常为1920*1080。建议上传小于此分辨率的图片作为背景图</p>
          <p style="font-size:16px;margin-top:10px">选择图片时,可批量上传,按CTRL键加选,按shift链选(第一个和最后一个之间的所有,可以按ctrl+a
            选择一个文件夹下的所有图片)
          <p/>
        </div>
      </div>
    </div>
    <ul class="setting-upload" id="uploadSetting{{index}}">
    </ul>
  </div>
</script>
<!--背景图模板 END -->
<!--lib-->
<script src="js/util/log.js"></script>
<script src="js/lib/jquery.min.js"></script>
<script src="js/lib/handlebars.min.js"></script>
<script src="js/lib/autosize.min.js"></script>
<script src="js/lib/layer/layer.js"></script>
<script src="js/lib/jcrop/js/jquery.Jcrop.min.js"></script>
<script src="js/lib/uploadify/jquery.uploadify-3.1.min.js"></script>
<script src="js/lib/kindeditor/kindeditor-min.js"></script>
<script src="js/lib/kindeditor/lang/zh_CN.js"></script>
<script src="js/lib/bootstrap-slider/bootstrap-slider.min.js"></script>

<link rel="stylesheet" type="text/css" href="js/lib/uploadify/uploadify.css"/>
<script type="text/javascript" src="/edu/course/js/jquery-ui/jquery-ui.min.js"></script>
<script type="text/javascript" src="/edu/course/js/resumable.js"></script>
<script type="text/javascript" src="/edu/course/js/common_tool.js"></script>
<!--custom-->
<script src="js/model/model.js"></script>
<script src="js/util/arrayUtil.js"></script>
<script src="js/util/util.js"></script>
<script src="js/util/drag.js"></script>

<!--组件-->
<script src="js/components/imgtext/ImgText2.js"></script>
<script src="js/components/examcreate/ExamCreate.js"></script>
<script src="js/components/pointsetting/PointSetting.js"></script>
<script src="js/components/number/CNumber.js"></script>
<script src="js/components/globalaudio/GlobalAudio.js"></script>
<script src="js/components/custompointsetting/CustomPointSetting.new.js"></script>
<script src="js/page/common/CreatePoint/CreatePoint.js"></script>
<script src="js/page/create/OnOffImg/OnOffImg.js"></script>

<script src="js/index.js"></script>


<script>
    var id = <?php echo intval($id);?>;//team_video id
    var teamid =  <?php echo empty($teamid) ? intval($team_video['teamid']) : $teamid;?>;
    var unitid =  <?php echo empty($unitid) ? intval($team_video['unitid']) : $unitid;?>;
    var videoid =<?php echo intval($team_video['videoid']);?>;
    var userid =<?php echo intval($_SESSION['G']['userid']);?>;
    var cover_list = [];
    $("#ulImgs").sortable({
        stop: function (event, ui) {
            upload_cover_sort();
        }
    });
    $("#ulImgs li").mousedown(function (e) {

        drag_event = mousePos(e).x + mousePos(e).y;

    });

    $("#ulImgs li").each(function () {

        var index = $(this).index();
        cover_list[index] = new Resumable({
            target: '/edu/course/form_submit_cl.php',
            testChunks: false,
            maxFiles: 1,
            query: {action: 'file_upload'}
        });
        cover_list[index].assignBrowse($(this)[0]);
        cover_list[index].on('fileAdded', function (file, event) {
            var ftype = cover_list[index].files[0].file['type'];
            if (ftype.indexOf('image') != -1) {
                $(".upload_mask").show();
                cover_list[index].upload();
            }
            else
                alert('请上传图片文件！');


        });
        cover_list[index].on('complete', function () {
            var jdata = eval('(' + message_g + ')');
            window.index = index;
            if (jdata["cur_pic"].indexOf("bmp") != -1) {
                upload_cover_callback(jdata["cur_pic"]);
            }
            else {
                $.crop_img({filename: jdata["cur_pic"], crop_img_backcall: upload_cover_callback});
            }

        });

    });
    function upload_cover_callback(pic_url) {
        $ode = $("<div class='upload_cover_del'>删除</div>").clone();
        $ode.click(function () {
            upload_cover_del(this);
            return false;
        });
        $('#ulImgs li.seq' + window.index).append($ode).find("img").attr("src", pic_url).show();

        upload_cover_sort();

        // $(".upload_mask").hide();
    }
    $(".upload_cover_del").click(function () {

        upload_cover_del(this);
        return false;
    });
    function upload_cover_del(el) {
        $(el).parent().find("img").attr('src', 'imgs/upload_bg_150.png')
            .end().find('.upload_cover_del').remove();
        upload_cover_sort();
    }
    function upload_cover_sort() {
        var upload_cover_list = $("input[name='pic']");
        upload_cover_list.val('');
        $upload_cover_list = $(".upload_cover_list");
        $("#ulImgs li").each(function () {

            var s = $(this).find("img").attr("src");
            if (s != 'imgs/upload_bg_150.png') {
                if (upload_cover_list.val() == '') {
                    upload_cover_list.val(s);
                }
                else
                    upload_cover_list.val(upload_cover_list.val() + ',' + s);
            }
            else {
                $upload_cover_list.append($(this));
            }

        });
    }
</script>
</body>

</html>
