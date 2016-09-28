<?php
//处理方法，
upload();

//media_id为微信jssdk接口上传后返回的媒体id
function upload(){
    $media_id = $_POST["media_id"];
    //$media_id = "kP2tWgUT_Bd7-gYLOhLX-toi4Pr4P9RMzXYtgReCawNDmdnh8ThfaBKKZjIFsVbJ";
    $access_token = getAccessToken();
    
    $path = "./weixinrecord/";  //保存路径，相对当前文件的路径
    $outPath = "./php/weixinrecord/";  //输出路径，给show.php 文件用，上一级
    
    if(!is_dir($path)){
        mkdir($path);
    }
    
    //微	信上传下载媒体文件
    $url = "http://file.api.weixin.qq.com/cgi-bin/media/get?access_token={$access_token}&media_id={$media_id}";
    $fileName = "wxupload_".time().rand(1111,9999);
    
    $mp3Path = $path."/".$fileName.".mp3";
    $amrPath = $path."/".$fileName.".amr";
    
    //下载微信录音文件
    downAndSaveFile($url,$amrPath);
    
    //转换成mp3文件，TODO：一直没有转换成mp3，麻烦定位下
    if(file_exists($mp3Path) != true){
        // $command = "ffmpeg -i $amrPath $mp3Path & rm $mp3Path";
        $command = "ffmpeg -i $amrPath $mp3Path";
        system($command,$error);
    }
    
    $data["path"] = $outPath.$fileName.".mp3";
    $data["msg"] = "download record audio success!";
    $data['error'] = $error;
    // $data["url"] = $url;
    
    echo json_encode($data);
}

//获取Token
function getAccessToken() {
    // 	access_token 应该全局存储与更新，以下代码以写入到文件中做示例
    //把token写在文件里面，算过期时间有时候有问题
    
    // $data = json_decode(file_get_contents("./access_token.json"));
    // if ($data->expire_time < time()) {
    //     $appid = "wx226ae435e99fe5a6";
    //     $appsecret = "354fe7648b0c7188d7e0a65e7f600a11";
    //     $url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid={$appid}&secret={$appsecret}";
    //     $res = json_decode(httpGet($url));
    //     $access_token = $res->access_token;
    //     if ($access_token) {
    //         $data->expire_time = time() + 7000;
    //         $data->access_token = $access_token;
    //         $fp = fopen("./access_token.json", "w");
    //         fwrite($fp, json_encode($data));
    //         fclose($fp);
    //     }
    // }
    // else {
    //     $access_token = $data->access_token;
    // }
    
    
    $appid = "wx226ae435e99fe5a6";
    $appsecret = "354fe7648b0c7188d7e0a65e7f600a11";
    $url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid={$appid}&secret={$appsecret}";
    $res = json_decode(httpGet($url));
    $access_token = $res->access_token;
    return $access_token;
    
}

//HTTP get 请求
function httpGet($url) {
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_TIMEOUT, 500);
    curl_setopt($curl, CURLOPT_URL, $url);
    
    $res = curl_exec($curl);
    curl_close($curl);
    
    return $res;
}

/**
* 根据URL地址，下载文件
* @param $url
* @param $amrPath
*/
function downAndSaveFile($url,$amrPath){
    ob_start();
    readfile($url);
    $img  = ob_get_contents();
    ob_end_clean();
    $size = strlen($img);
    $fp = fopen($amrPath, 'a');
    fwrite($fp, $img);
    fclose($fp);
}
?>