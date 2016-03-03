/*******************************
 *   程序入口
 *******************************/
$(function () {
    init();
    bindEvent();
});
/*******************************
 *   变量定义
 *******************************/
window.DD = window.DD || {};
window.DD.img_id_upload = []; //初始化数组，存储已经上传的图片名
window.DD.count = 0; //初始化数组下标

window.DD.items = []; //点读的位置记录
window.DD.isStart = false; //默认不启动点读

/*******************************
 *   函数定义
 *******************************/
/**
 * 初始化上传控件
 * @return {[type]} [description]
 */
function init() {
    setFileUpload('#file_upload');
    console.log('use uploadify ....')
    setFileUpload('#file_bg', function (file, data, response) {
        var src = "js/lib/uploadify/uploads/" + file.name;
        $('#id_bg').css('backgroundImage', 'url("' + src + '")');
        $('#btn_start').show();

        //点击背景，添加点读位
        $('#id_bg').off('click', addDianDuLocation).on('click', addDianDuLocation);
        // $('#file_bg').hide();
    });
}

/**
 * 绑定事件
 */
function bindEvent() {
    // 提交
    $('#btnSubmit').on('click', handleSubmit);
    // 添加点读页
    $('#btnAdd').on('click', addDianDu);
    // header的关闭按钮
    $('#close').on('click', closePage);

    // 上传测试
    $('#btn_upload').on('click', uploadFile);

    //启动位置
    $('#btn_start').on('click', function (e) {
        e.stopPropagation(); //阻止冒泡，否则背景会触发点击事件
        setHoverImgSrcx($('#btn_start'));
        if (window.DD.isStart) {
            window.DD.isStart = false;
            $('#id_bg').off('click', addDianDuLocation);
        } else {
            window.DD.isStart = true;
            $('#id_bg').off('click', addDianDuLocation).on('click', addDianDuLocation);
        }
    });
}

/**
 * 设置input file 标签，使用 uploadify 插件
 * @param {[type]} id input file 的 id
 */
function setFileUpload(id, success, error, queueComplete) {
    $(id).uploadify({
        'auto': true, //关闭自动上传
        'removeTimeout': 1, //文件队列上传完成1秒后删除
        'swf': 'js/lib/uploadify/uploadify.swf',
        'uploader': 'js/lib/uploadify/uploadify.php',
        'method': 'post', //方法，服务端可以用$_POST数组获取数据
        'buttonText': '选择图片', //设置按钮文本
        'multi': false, //允许同时上传多张图片
        'uploadLimit': 10, //一次最多只允许上传10张图片
        'fileTypeDesc': 'Image Files', //只允许上传图像
        'fileTypeExts': '*.gif; *.jpg; *.png ; *.jepg', //限制允许上传的图片后缀
        'fileSizeLimit': '200000KB', //限制上传的图片不得超过2000KB 
        'onUploadSuccess': function (file, data, response) { //每次成功上传后执行的回调函数，从服务端返回数据到前端
            window.DD.img_id_upload[DD.count] = data;
            window.DD.count++;
            // console.log('upload:', data)
            if (success) {
                success(file, data, response);
            }
            //alert(data);
        },
        'onError': function (event, queueId, fileObj, errObj) {
            if (error) {
                error(event, queueId, fileObj, errObj);
            }
        }
    });
}

/*=====================================点读位置相关JS逻辑事件 START=============================================*/

/**
 * 添加点读位置
 */
function addDianDuLocation(e) {
    if ($(e.target).hasClass('setting-bigimg-img')) {
        e.stopPropagation(); //阻止冒泡，否则背景会触发点击事件
        //点击位置在容器中的 左上角的相对位置
        console.log('x:', e.offsetX, '===>y:' + e.offsetY)
        var x = e.offsetX - 50 > 0 ? e.offsetX - 50 : 0;
        var y = e.offsetY - 50 > 0 ? e.offsetY - 50 : 0;;
        window.DD.items.push({
            x: x,
            y: y,
            id: window.DD.items.length + 1
        });

        //创建点图位置小圆圈，以及上传文件的列表

        var id = "__diandu" + window.DD.items.length;
        var index = window.DD.items.length;
        createCircle(id, index, x, y);
        addDianDu(id, index);
    }
}

/**
 * 创建点读位置
 * @param  {id}  当前点读位置的ID
 * @param  {index}  点读位置的显示的编号
 * @param  {left}  点读位置的偏移量  left
 * @param  {top}  点读位置的偏移量  top
 */
function createCircle(id, index, left, top) {
    left = left || 10;
    top = top || 10;
    var pid = "#id_bg";
    var style = "style='position:absolute; left:" + left + "px; top :" + top + "px;'";
    var html = "";
    html += '<div class="radius" ' + style + '>';
    html += '    <div id="' + id + '" class="radius_in">' + index + '</div>';
    html += '</div>';
    $(pid).append(html);
}


/**
 * 添加点读
 */
function addDianDu(id, index) {
    var data = {
        id: id,
        index: index
    }
    var tpls = Handlebars.compile($("#tpl_uploadSetting").html());
    $('#uploadSetting').append(tpls(data));
    // 点读设置项
    $('#uploadSetting .upload-item').off('click', handleUploadItem).on('click', handleUploadItem);
}

/**
 * 点读项设置
 */
function handleUploadItem(e) {
    var $currentTarget = $(e.currentTarget);
    var $target = $(e.target);
    var data = $target.data();

    if ($target[0].nodeName === "LI") {

        switch (data.type) {
        case "uploadType":
            fileTypeItemClick(e);
            break;
        case "hide":
            setHoverImgSrcx($target);
            // 隐藏点读位
            if ($target.attr('data-show') === "0") {
                $target.attr('data-show', "1");
                data = $target.parent().data();

                var style = {
                    'background': '#7F7F7F',
                    'textDecoration': 'line-through'
                };
                $('#' + data.id).css(style);
                $('#item' + data.id).css(style);
                // $currentTarget.find('.upload-right-name').css(style);
            }
            //显示点读位 
            else {
                var style = {
                    'background': '#66CCCC',
                    'textDecoration': 'none'
                };
                $target.attr('data-show', "0");
                data = $target.parent().data();
                $('#' + data.id).css(style);
                $('#item' + data.id).css(style);
                // $currentTarget.find('.upload-right-name').css(style);
            }
            break;
        case "delete":
            console.log('type', data);
            break;
        default:
            console.log('sorry ,type is not handler ,type :', type);
            break;
        }
    } else if ($target.hasClass('upload-right-name upload')) {
        console.log('upload file')
    } else if ($target.parent().hasClass('upload-right-name uploaded') && $target[0].nodeName === "IMG") {
        console.log('download file')
    }
}

/**
 * 点图文件上传，文件类型选择，上传框，序号小圆圈样式管理
 * @param  {[type]} e [点击事件对象]
 */
function fileTypeItemClick(e) {
    var $currentTarget = $(e.currentTarget);
    var $target = $(e.target);
    var data = $target.data();

    console.log('data', data);

    //设置上传类型的默认图标--》设置选中的图片
    setUnSelectImgSrc($currentTarget);
    setHoverImgSrcx($target);

    // 设置右边上传位置文字，以及背景颜色
    var $rightName = $currentTarget.find('.upload-right-name');
    $rightName.find('span').html(data.text);
    $rightName.removeClass('notselect').addClass('upload');

    // 设置小圆圈序号的颜色 
    // $currentTarget.find('.radius_in').css('background', '#66CCCC');
    // var id = '#' + $target.parent().data().id;
    // $(id).css('background', '#66CCCC');
}

/**
 * 设置图标选中的图片地址
 * @param {[type]} $target [点击图标的Jquery对象]
 */
function setHoverImgSrcx($target) {
    var imgSrc = $target.css('backgroundImage');
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
 * 设置默认的图标
 * @param {[type]} $currentTarget [绑定点击事件的标签,Jquery对象]
 */
function setUnSelectImgSrc($currentTarget) {
    var $imgs = $currentTarget.find('.upload-type li');
    $imgs.each(function (index, el) {
        $el = $(el);
        var imgSrc = $el.css('backgroundImage');
        if (imgSrc.indexOf("_on") != -1) {
            var srcs = imgSrc.split('_on');
            var hoverImgSrc = srcs[0] + srcs[1];
            $el.css('backgroundImage', hoverImgSrc);
        }
    });
}

/**
 * 关闭按钮
 */
function closePage(e) {
    alert('close')
}

/*=====================================点读位置相关JS逻辑事件 END=============================================*/

/**
 * 上传文件
 */
function uploadFile() {
    $('#file_upload').uploadify('settings', 'formData', {
        'typeCode': document.getElementById('id_file').value
    });
    $('#file_upload').uploadify('upload', '*')
}

/**
 * 提交
 */
function handleSubmit(e) {
    var data = {
        name: $('#name').val(),
        intro: $('#intro').val(),
        chargeType: $('input[type="radio"][name="chargeType"]:checked').val(),
        chargeStandard: $('#chargeStandard').val()
    }
    console.log('data', data)
}
