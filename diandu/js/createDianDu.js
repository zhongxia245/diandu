/*******************************
 *   程序入口
 *******************************/
$(function () {
    setUploadControl();
    bindEvent();
});
/*******************************
 *   变量定义
 *******************************/
window.DD = window.DD || {};
window.DD.items = []; //点读的位置记录
window.DD.isStart = false; //默认不启动点读

/**
 * 根据ID获取
 * @param  {[type]} id [description]
 * @return {[type]}    [description]
 */
function setDDItems(id, config) {
    var arr = window.DD.items;
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].id == id) {
            arr[i] = $.extend({}, arr[i], config);
            break;
        }

    };
}

/*******************************
 *   函数定义
 *******************************/

/**
 * 绑定事件
 */
function bindEvent() {
    // 提交
    $('#btnSubmit').on('click', handleSubmit);
    // 添加点读页
    $('#btnAdd').on('click', addDianDuPage);
    // header的关闭按钮
    $('#close').on('click', closePage);

    //启动位置[创建的时候，该按钮不起作用]
    $('#btn_start').on('click', function (e) {
        e.stopPropagation(); //阻止冒泡，否则背景会触发点击事件
        setHoverImgSrcx($('#btn_start'));
    });
}


/*=====================================点读位置相关JS逻辑事件 START=============================================*/
// 添加点图页
function addDianDuPage() {
    // TODO 添加点读页
    alert('添加点读页')
}

/**
 * 添加点读位置
 */
function addDianDuLocation(e) {
    if ($(e.target).hasClass('setting-bigimg-img')) {
        e.stopPropagation(); //阻止冒泡，否则背景会触发点击事件
        //点击位置在容器中的 左上角的相对位置
        console.log('x:', e.offsetX, '===>y:' + e.offsetY)

        var maxWidth = 1200;
        var maxHeight = 675;
        var minWidth = 0;
        var minHeight = 0;
        // 不允许超过背景图之外
        var x = e.offsetX - 50; //减去圆的半径
        var y = e.offsetY - 50;

        if (e.offsetX - 50 < 0) {
            x = minWidth;
        }
        if (e.offsetY - 50 < 0) {
            y = minHeight;
        }
        if (e.offsetX + 50 > maxWidth) {
            x = maxWidth - 100;
        }
        if (e.offsetY + 50 > maxHeight) {
            y = maxHeight - 100;
        }
    }

    //存放位置信息在全部变量里面，使用按比例的方式存放
    window.DD.items.push({
        x: x / maxWidth,
        y: y / maxHeight,
        id: window.DD.items.length + 1
    });

    //创建点图位置小圆圈，以及上传文件的列表
    var index = window.DD.items.length;
    var id = "__diandu" + index;
    createCircle(id, index, x, y);
    addDianDu(id, index);
}

/**
 * 创建点读位置
 * @param  {id}  当前点读位置的ID
 * @param  {index}  点读位置的显示的编号
 * @param  {left}  点读位置的偏移量  left
 * @param  {top}  点读位置的偏移量  top
 */
function createCircle(id, index, left, top) {
    left = left || 0;
    top = top || 0;
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
 * 点读项点击事件处理
 */
function handleUploadItem(e) {
    var $currentTarget = $(e.currentTarget);
    var $target = $(e.target);
    var data = $target.data();

    if ($target[0].nodeName === "LI") {
        switch (data.type) {
            // 如果是点击上传的类型,视频或者音频
        case "uploadType":
            fileTypeItemClick(e);
            break;
            // 隐藏按钮
        case "hide":
            hideDDLocation(e);
            break;
            // 删除按钮
        case "delete":
            var itemdata = $target.parent().data();
            $('#' + itemdata.id).parent().remove();
            $currentTarget.remove();
            setDDItems(itemdata.index, { isRemove: true });
            break;
            // 默认报错，不处理
        default:
            break;
        }
    }
    //右侧下载按钮 
    else if ($target.parent().hasClass('upload-right-name uploaded') && $target[0].nodeName === "IMG") {
        downloadFile(e);
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
    var pdata = $target.parent().data();
    var id = pdata.id;

    //设置上传类型的默认图标--》设置选中的图片
    setUnSelectImgSrc($currentTarget);
    setHoverImgSrcx($target);

    // 设置右边上传位置文字，以及背景颜色
    var $rightName = $currentTarget.find('.upload-right-name');
    $rightName.find('span').html(data.text);
    $rightName.removeClass('notselect').addClass('upload');

    var fileTypeDesc, fileTypeExts;
    switch (data.fileType) {
    case 'video':
        fileTypeExts = '*.mp4';
        fileTypeDesc = "MP4文件";
        break;
    case 'audio':
        fileTypeExts = '*.mp3';
        fileTypeDesc = "MP3文件";
        break;
    default:
        fileTypeExts = '*.gif;*.jpg;*.png';
        fileTypeDesc = "Image 文件";
        break;
    }

    //设置上传文件用 uploadify插件,并且透明化按钮
    setUploadify($('#__file' + id), {
        width: '100%',
        height: '100%',
        fileTypeExts: fileTypeExts,
        fileTypeDesc: fileTypeDesc,
        onUploadSuccess: function (file, data, response) {
            var $rightName = $('#__file' + id).parent().parent();

            //TODO:该下载地址，从后端返回
            $rightName.attr('data-src', 'http://files.cnblogs.com/files/zhongxia/AppSettingHelper.zip');

            $rightName.removeClass('upload').addClass('uploaded');
            $rightName.find('span').html(file.name);
        }
    });
    $('#__file' + id + ' object').css('left', 0);
}

/**
 * 隐藏点读位置
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
function hideDDLocation(e) {
    var $currentTarget = $(e.currentTarget);
    var $lis = $currentTarget.find('li');
    var $target = $(e.target);
    var $rightName = $currentTarget.find('.upload-right-name');
    // 该点读位置的下标，就是ＩＤ
    var index = $(e.currentTarget).attr('data-index');

    var data = $target.data();
    setHoverImgSrcx($target);
    // 隐藏点读位
    if ($target.attr('data-show') === "0") {
        $target.attr('data-show', "1");
        var itemdata = $target.parent().data();

        var style = {
            'background': '#7F7F7F',
            'textDecoration': 'line-through'
        };
        $('#' + itemdata.id).css(style);
        $('#item' + itemdata.id).css(style);
        setDDItems(index, { hide: true });

        // TODO:理论上，隐藏之后，文件类型的点击事件是不可以用的，还没有做

        for (var i = 0; i < $lis.length; i++) {
            var $li = $($lis[i]);
            $li.attr('data-style', $li.attr('style'));
            $li.removeAttr('style');
        };
        //设置右侧名称【上传文件按钮】
        $rightName.attr('data-class', $rightName.attr('class'));
        $rightName.removeClass().addClass('upload-right-name notselect');
    }
    //显示点读位 
    else {
        var style = {
            'background': '#66CCCC',
            'textDecoration': 'none'
        };
        $target.attr('data-show', "0");
        var itemdata = $target.parent().data();
        $('#' + itemdata.id).css(style);
        $('#item' + itemdata.id).css(style);

        for (var i = 0; i < $lis.length; i++) {
            var $li = $($lis[i]);
            $li.attr('style', $li.attr('data-style'));
        };
        // 还原
        $rightName.removeClass().addClass($rightName.attr('data-class'));
        setDDItems(index, { hide: false });
    }
}

/**
 * 下载文件
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
function downloadFile(e) {
    var src = $(e.target).parent().data().src;
    window.open(src);
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
 * 初始化上传控件
 * @return {[type]} [description]
 */
function setUploadControl() {
    setUploadify($('#file_bg'), {
        onUploadSuccess: function (file, data, response) {
            var src = "js/lib/uploadify/uploads/" + file.name;
            $('#id_bg').css('backgroundImage', 'url("' + src + '")');
            $('#btn_start').show();

            //点击背景，添加点读位
            $('#id_bg').off('click', addDianDuLocation).on('click', addDianDuLocation);
            // $('#file_bg').hide();
        }
    })
}

/**
 * 设置input file 标签，使用 uploadify 插件
 * @param {[type]}  $file   [file文件标签的Jquery对象]
 * @param {Boolean} isSetWH [是否设置寛高，上传MP4，MP3等]
 * @param {[type]}  success [成功回调函数]
 * @param {[type]}  error   [失败回调函数]
 */
function setUploadify($file, config, success, error) {
    var defaultConfig = {
        auto: true, //关闭自动上传
        removeTimeout: 1, //文件队列上传完成1秒后删除
        swf: 'js/lib/uploadify/uploadify.swf',
        uploader: 'js/lib/uploadify/uploadify.php',
        method: 'post', //方法，服务端可以用$_POST数组获取数据
        buttonText: '选择图片', //设置按钮文本
        multi: false, //允许同时上传多张图片
        uploadLimit: 10, //一次最多只允许上传10张图片
        fileTypeDesc: 'Image Files',
        fileTypeExts: '*.gif;*.jpg;*.png',
        fileSizeLimit: '200000KB', //限制上传的图片不得超过20000KB 
        onUploadSuccess: function (file, data, response) { //每次成功上传后执行的回调函数，从服务端返回数据到前端
            if (success) {
                success(file, data, response);
            }
        },
        onError: function (event, queueId, fileObj, errObj) {
            if (error) {
                error(event, queueId, fileObj, errObj);
            }
            console.log('upload error', event)
        }
    };
    // 合并参数
    config = $.extend({}, defaultConfig, config);
    $file.uploadify(config);
}

/**
 * 提交
 */
function handleSubmit(e) {
    var data = {
        name: $('#name').val(),
        intro: $('#intro').val(),
        chargeType: $('input[type="radio"][name="chargeType"]:checked').val(),
        chargeStandard: $('#chargeStandard').val(),
        dianduItems: getValidItems()
    }
    console.log('data', data)
}

/**
 * 获取有效的点读位
 * @return {[type]} [description]
 */
function getValidItems() {
    var destArr = [];
    var srcArr = window.DD.items;
    for (var i = 0; i < srcArr.length; i++) {
        if (!srcArr[i].isRemove) {
            destArr.push(srcArr[i]);
        }
    };
    return destArr;
}
