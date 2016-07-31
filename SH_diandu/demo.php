<!--获取wiki帐号-->
<?php
session_start();
include_once('../course_common.php');
if (strpos($_SERVER['HTTP_USER_AGENT'], 'MicroMessenger') !== false) {
    require_once "php/jssdk.php";
    $jssdk = new JSSDK("wx226ae435e99fe5a6", "354fe7648b0c7188d7e0a65e7f600a11");
    $signPackage = $jssdk->GetSignPackage();
}
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, minimum-scale=1.0, maximum-scale=1.0">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate"/>
    <meta http-equiv="Pragma" content="no-cache"/>
    <meta http-equiv="Expires" content="0"/>
    <title>Document</title>
</head>
<body>

<button id="btn_start">开始录音</button>
<button id="btn_end">结束录音</button>
<div id="result"></div>


<!--微信录音-->
<script src="js/lib/jweixin.js"></script>
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


</script>
<script src="js/lib/vconsole.min.js"></script>
<script>
    wx.ready(function () {
        // 在这里调用 API
        console.log("微信录音初始化成功")

        var btnStart = document.getElementById('btn_start')
        var btnEnd = document.getElementById('btn_end')
        var result = document.getElementById('result')
        btnStart.onclick = function (event) {
            event.preventDefault();
            wx.startRecord({
                success: function (res) {
                    console.log("res", res)
                    if (res.errMsg == 'startRecord:ok') {
                        console.log("正在开始录音....")
                        result.innerHTML += '开始录音' + new Date().getTime() + '</br>';
                        window._startTime = new Date().getTime();
                    }
                },
                cancel: function () {
                    alert('用户拒绝授权录音');
                }
            });
        }

        btnEnd.onclick = function (event) {
            event.preventDefault();
            wx.stopRecord({
                success: function (res) {
                    console.log("已经停止", window.resLocalId)
                    window.videoTime = ((new Date().getTime() - window._startTime) / 1000).toFixed(2);
                    console.log("window.videoTime", window.videoTime)
                    result.innerHTML += 'end record' + window.videoTime + '</br>';
                    //上传录音
                    wx.uploadVoice({
                        localId: res.localId,
                        isShowProgressTips: 1,
                        success: function (resUpload) {
                            window.attachment = resUpload.serverId;
                            console.log("resUpload.serverId", resUpload.serverId)
                        }
                    });

                }
            });
        }
    });
</script>
</body>
</html>