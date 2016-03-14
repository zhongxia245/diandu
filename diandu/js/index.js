/*==========================变量定义 START==================================*/
window.DD = window.DD || {};
window.DD.items = []; //点读的位置记录

// 点读页背景的大小
var maxWidth = 1200;
var maxHeight = 675;
var minWidth = 0;
var minHeight = 0;

// 点读页数量
var dianduPageCount = 1;
// 点读位文件类型列表的ID前缀
var PREFIX_DIANDU = "__diandu";

//接口地址
var URL = {
    base: 'http://dev.catics.org/edu/course/api.php',
    save: 'save_touch_page'
};
/*==========================程序入口 START==================================*/
$(function () {
    // 添加一个点读页
    addDianDuPageTpl();
    bindEvent();
});

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
    $('.btn_start').on('click', function (e) {
        e.stopPropagation(); //阻止冒泡，否则背景会触发点击事件
        setHoverImgSrcx($('.btn_start'));
    });
}

/*==========================动态创建页面，根据模板 START==================================*/
/**
 * 添加点读页
 */
function addDianDuPageTpl() {
    var data = { index: dianduPageCount };
    var tpls = Handlebars.compile($("#tpl_bg").html());
    $('#id_diandupages').append(tpls(data));
    //初始化上传控件
    setUploadControl(dianduPageCount);

    //没每添加一个点读页，就在这里添加一个数组
    window.DD.items.push({
        pic: '', //背景图地址
        name: '', //名称
        data: [] //点读位数组
    });
    dianduPageCount++;
}

/**
 * 创建点读位置
 * @param  {id}  当前点读位置的ID
 * @param  {index}  点读位置的显示的编号
 * @param  {left}  点读位置的偏移量  left
 * @param  {top}  点读位置的偏移量  top
 */
function createCircle(pageIndex, circleid, index, left, top) {
    left = left || 0;
    top = top || 0;
    var pid = "#id_bg" + pageIndex;
    var style = "style='position:absolute; left:" + left + "px; top :" + top + "px;'";
    var html = "";
    html += '<div class="radius" ' + style + '>';
    html += '    <div id="' + circleid + '" class="radius_in">' + index + '</div>';
    html += '</div>';
    $(pid).append(html);
}


/**
 * 添加点读设置项
 */
function addDianDu(pageIndex, dianduItemid, index) {
    var settingId = "#uploadSetting" + pageIndex;
    var data = {
        id: dianduItemid,
        index: index
    }
    var tpls = Handlebars.compile($("#tpl_uploadSetting").html());
    $(settingId).append(tpls(data));
    // 点读设置项
    $(settingId + ' .upload-item').off('click', handleUploadItem).on('click', handleUploadItem);
}


/*==========================window.DD.items 数据对象方法 START==================================*/
/**
 * 根据ID获取
 * @param  {[type]} id [description]
 * @return {[type]}    [description]
 */
function setDDItems(id, config) {
    //点读背景默认从1开始，所以，这里减1
    var index = parseInt(id.split('_')[0]);
    var arr = window.DD.items[index - 1]['data'];
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].id == id) {
            arr[i] = $.extend({}, arr[i], config);
            break;
        }

    };
}

/**
 * 获取有效的点读位
 * @return {[type]} [description]
 */
function getValidItems() {
    var destArr = [];
    var srcArr = window.DD.items;
    for (var i = 0; i < srcArr.length; i++) {
        destArr[i] = {
            pic: srcArr[i].pic
        };
        // destArr[i] = srcArr[i];
        var destItems = [];
        var items = srcArr[i]['data'];
        for (var j = 0; j < items.length; j++) {
            if (!items[j].isRemove) {
                var obj = {
                    x: items[j].x,
                    y: items[j].y,
                    filename: items[j].filename,
                    url: items[j].url,
                    type: getTypeByName(items[j].type)
                }
                destItems.push(obj);
            }
        };
        destArr[i]['points'] = destItems;
    };
    return destArr;
}

/**
 * 根据类型名字，获取类型的ID
 * @return {[type]} [description]
 */
function getTypeByName(typeName) {
    // TODO：有其他类型，在添加
    switch (typeName) {
    case 'video':
        return 1;
    case 'audio':
        return 2;
    default:
        return 1;
    }
}

/*==========================uploadify控件设置  START==================================*/

/**
 * 初始化上传控件
 * @return {[type]} [description]
 */
function setUploadControl(index) {
    //index 从 1 开始
    var id_bg = "#id_bg" + index;
    var file_bg = "#file_bg" + index;
    setUploadify($(file_bg), {
        onUploadSuccess: function (file, data, response) {
            // TODO：上传文件的路径
            var src = "js/lib/uploadify/uploads/" + file.name;
            $(id_bg).css('backgroundImage', 'url("' + src + '")');
            $('.btn_start').show();

            window.DD.items[index - 1]['name'] = file.name;
            window.DD.items[index - 1]['pic'] = src;

            //点击背景，添加点读位
            $(id_bg).off('click', addDianDuLocation).on('click', addDianDuLocation);
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
    // TODO：可能重新设置接口
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
        // fileSizeLimit: 2048 * 10, //限制上传的图片不得超过约等于2G
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

/*==========================图片选中，不选中状态设置 START==================================*/

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

/*==========================点读位置拖动，下载点读位的文件 START==================================*/
/**
 * 获取有效的XY坐标，防止超出背景图
 */
function getValidXY(ex, ey) {
    // 不允许超过背景图之外
    var x = ex - 50; //减去圆的半径
    var y = ey - 50;

    if (ex - 50 < 0) {
        x = minWidth;
    }
    if (ey - 50 < 0) {
        y = minHeight;
    }
    if (ex + 50 > maxWidth) {
        x = maxWidth - 100;
    }
    if (ey + 50 > maxHeight) {
        y = maxHeight - 100;
    }
    return {
        x: x,
        y: y
    }
}

/**
 * 下载文件
 */
function downloadFile(e) {
    var src = $(e.target).parent().data().src;
    window.open(src);
}

/*************************************************************
 *              逻辑部分【重点】  START  TODO：明天做
 *************************************************************/
/**
 * 添加点读位置
 */
function addDianDuLocation(e) {
    e.stopPropagation(); //阻止冒泡，否则背景会触发点击事件
    $tar = $(e.target);

    //每一个点读页用一个数组来保存
    var pageIndex = parseInt($tar.data().index);
    // 添加点读位置
    if ($tar.hasClass('setting-bigimg-img')) {

        var xy = getValidXY(e.offsetX, e.offsetY);
        var x = xy.x;
        var y = xy.y;

        // 获取当前点读页的数据
        var DDPageItems = window.DD.items[pageIndex - 1]['data'];
        //唯一标识该点读位
        var dataid = pageIndex + "_" + (DDPageItems.length + 1);
        //存放位置信息在全部变量里面，使用按比例的方式存放
        //
        DDPageItems.push({
            x: x / maxWidth, //坐标的比例
            y: y / maxHeight,
            // w: maxWidth,
            // h: maxHeight,
            id: dataid
        });


        //创建点图位置小圆圈，以及上传文件的列表
        var index = DDPageItems.length;
        var id = PREFIX_DIANDU + dataid;

        createCircle(pageIndex, id, index, x, y);
        addDianDu(pageIndex, id, index);

        //移动点读位【引入了 drag.js 文件，并且把最新位置放到存储器中 START】
        var $pdiv = $('#' + id).parent();
        $tar.on('selectstart', function () {
            return false;
        });

        new Drag($pdiv[0], function (x, y) {
            //把移动之后的位置，赋值到window变量里面
            var newxy = getValidXY(x, y);
            setDDItems(dataid, { x: newxy.x, y: newxy.y });
        });
        //移动点读位【引入了 drag.js 文件，并且把最新位置放到存储器中 END】
    }
}


/**
 * 点读项点击事件处理
 */
function handleUploadItem(e) {
    e.preventDefault();
    e.stopPropagation();
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

            //在本地数据变量里面标注，已经删除
            var __dataid = itemdata.id.replace(PREFIX_DIANDU, '');
            setDDItems(__dataid, { isRemove: true });
            break;
            // 默认报错，不处理
        default:
            break;
        }
    }
    //右侧下载按钮 
    else if ($target.parent().hasClass('upload-right-name uploaded') && $target[0].nodeName === "IMG") {
        // 根据路径
        downloadFile(e);
    }
}

/**
 * 点图文件上传，文件类型选择，上传框，序号小圆圈样式管理
 * @param  {[type]} e [点击事件对象]
 */
function fileTypeItemClick(e) {
    e.preventDefault();
    var $currentTarget = $(e.currentTarget);
    var $target = $(e.target); //点击的类型节点
    var data = $target.data(); //文件类型，和提示信息（上传什么类型文件）
    var pdata = $target.parent().data(); //点读位文件类型列表data-数据(文件列表的ul)
    var id = pdata.id;
    var __dataid = id.replace(PREFIX_DIANDU, ''); //在变量里面的唯一标识  setItem的数据需要用到这个标识

    //设置上传类型的默认图标--》设置选中的图片
    setUnSelectImgSrc($currentTarget);
    setHoverImgSrcx($target);

    // 设置右边上传位置文字，以及背景颜色
    var $rightName = $currentTarget.find('.upload-right-name');
    $rightName.find('span').html(data.text);
    //未上传文件，设置上传文件的样式
    $rightName.removeClass('notselect').addClass('upload');
    //已经上传文件，修改成 需要上传新的文件
    $rightName.removeClass('uploaded').addClass('upload');

    var fileTypeDesc, fileTypeExts;

    // 目前只做视频和音频的，其他的目前暂时不做
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

    //把文件类型，保存到变量里面
    setDDItems(__dataid, { type: data.fileType });

    //设置上传文件用 uploadify插件,并且透明化按钮
    setUploadify($('#__file' + id), {
        width: '100%',
        height: '100%',
        fileTypeExts: fileTypeExts,
        fileTypeDesc: fileTypeDesc,
        onUploadSuccess: function (file, data, response) {
            var $rightName = $('#__file' + id).parent().parent();
            debugger;
            //TODO:该下载地址，从后端返回，目前适应硬编码
            // var fileSrc = 'http://files.cnblogs.com/files/zhongxia/AppSettingHelper.zip';
            var fileSrc = 'js/lib/uploadify/uploads/' + file.name;
            $rightName.attr('data-src', fileSrc);

            $rightName.removeClass('upload').addClass('uploaded');
            $rightName.find('span').html(file.name);

            setDDItems(__dataid, { url: fileSrc, filename: file.name });
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
    var $lis = $currentTarget.find('.upload-type li');
    var $target = $(e.target);
    var $rightName = $currentTarget.find('.upload-right-name');
    // 该点读位置的下标，就是ＩＤ
    var index = $(e.currentTarget).attr('data-index');

    var data = $target.data();
    setHoverImgSrcx($target);

    var itemdata = $target.parent().data();
    var __dataid = itemdata.id.replace(PREFIX_DIANDU, '');

    // 隐藏点读位
    if ($target.attr('data-show') === "0") {
        $target.attr('data-show', "1");

        var style = {
            'background': '#7F7F7F',
            'textDecoration': 'line-through'
        };
        $('#' + itemdata.id).css(style);
        $('#item' + itemdata.id).css(style);
        setDDItems(__dataid, { hide: true });

        // TODO:理论上，隐藏之后，文件类型的点击事件是不可以用的，还没有做
        //记录旧的样式，等显示在赋值上去
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

        $('#' + itemdata.id).css(style);
        $('#item' + itemdata.id).css(style);

        for (var i = 0; i < $lis.length; i++) {
            var $li = $($lis[i]);
            $li.attr('style', $li.attr('data-style'));
        };
        // 还原
        $rightName.removeClass().addClass($rightName.attr('data-class'));
        setDDItems(__dataid, { hide: false });
    }
}


/*=====================================点读位置相关JS逻辑事件 END=============================================*/
/**
 * 关闭按钮
 */
function closePage(e) {
    alert('close')
}


// 添加点图页
function addDianDuPage() {
    addDianDuPageTpl();
}

/**
 * 提交
 */
function handleSubmit(e) {
    var data = {
        name: $('#name').val(),
        saytext: $('#intro').val(),
        charge: $('input[type="radio"][name="chargeType"]:checked').val(),
        cost: $('#chargeStandard').val(),
        pages: getValidItems()
    }

    //小组ID，开发用3000
    data.teamid = 3000;

    var dataStr = JSON.stringify(data);
    // 提交数据
    var url = URL.base;
    $.post(url, {
        action: URL.save,
        data: dataStr
    }, function (result, textStatus, xhr) {
        console.log('result', result);
        alert('保存成功！');
    });
}
