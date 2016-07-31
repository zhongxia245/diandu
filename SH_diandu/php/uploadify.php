<?php
/*
Uploadify 后台处理 Demo
Author:wind
Date:2013-1-4
uploadify 后台处理！
*/

function resize_image($uploadedfile,$dst)
{
	// 上传的图片文件
	$src = imagecreatefromjpeg($uploadedfile);
	// 原图片尺寸
	list($width,$height)=getimagesize($uploadedfile);

	//新图片尺寸
	if ($width > 1920 ) {
		$newwidth=1920;
		$newheight=($height/$width)*1920;
	}
	else if ($height > 1080) {
		$newheight=1080;
		$newwidth=($width/$height)*1080;
	}
	else
	{
		$newheight=$height;
		$newwidth=$width;
	}
	
	// 按新尺寸创建临时图片文件
	$tmp=imagecreatetruecolor($newwidth,$newheight);
	// 压缩图片到临时文件
	imagecopyresampled($tmp,$src,0,0,0,0,$newwidth,$newheight,$width,$height);
	// 将临时文件保存到指定文件
	$ret = imagejpeg($tmp,$dst,100);
	
	imagedestroy($src);
	imagedestroy($tmp);

	return $ret;
	 
}

//设置上传目录
$path ="../uploads/";	
$returnPath ="uploads/";
if (!empty($_FILES)) {
	
	//得到上传的临时文件流
	$tempFile = $_FILES['Filedata']['tmp_name'];
	
	//允许的文件后缀
	$fileTypes = array('jpg','jpeg','gif','png','mp3','mp4'); 

	//图片文件后缀
	$imgFile = array('jpg','jpeg','png'); 
	
	//得到文件原名
	$fileName = iconv("UTF-8","GB2312",$_FILES["Filedata"]["name"]);


	//上传文件的后缀
	$ext = pathinfo($fileName, PATHINFO_EXTENSION); 
	if (!in_array($ext, $fileTypes)) {
		echo $fileName."--file type not allowed!";
	}
	
	$rand = md5(time() . mt_rand(1,10000));//随机文件名
	$fileName = $rand.substr($fileName,-4);//保存的文件名

	$fileParts = pathinfo($_FILES['Filedata']['name']);
	
	//接受动态传值
	// $files=$_POST['typeCode'];
	header("Content-Type: text/html; charset=utf-8");
	//最后保存服务器地址
	if(!is_dir($path))
	   mkdir($path);

	//文件上传
	$ret = move_uploaded_file($tempFile, $path.$fileName);


	if (!$ret) {
		echo $fileName."--file upload error!";
		exit();
	}
	//上传成功，返回保存的文件路径
	if ( in_array($ext, $imgFile)) {
		//图片文件，判断是否需要压缩
		// 原图片尺寸
		list($width,$height)=getimagesize($uploadedfile);
		if ($width>1920 || $height>1080) {
			//压缩图片
			$ret = resize_image($tempFile, $path.$fileName);
			if (!$ret) {
				echo $fileName."--image resize error!";
				exit();
			}
		}
		
	}
	
	echo $returnPath.$fileName;  

}

?>
