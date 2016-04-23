/**
 * 2016年3月26日 23:44:03
 * 作者: zhongxia
 * 说明: 这个是一个JS的类，主要用来实例化一个图文上传的页面，并且内部集成了显示隐藏，图片上传的功能
 * 依赖: 依赖 jquery.uploadify 插件，和 upload.js 文件，内部封装了 如何把 input 实例化成 uploadify插件
 */
/**
 * 图文上传页面
 * @param selector 添加的位置
 * @param data    模板数据
 * @param fn_upload  图片上传成功的回调
 * @param fn_submit  提交的处理
 * @param setUploadify  把input 变成 uploadify 插件[默认使用 __upload中的方法]
 * @param basePath  上传图片的根目录[中文php返回乱码，所以上传目录写死了]  TODO:后期修改
 * @returns {ImgText}
 */
var ImgText = function (selector, data, fn_upload, fn_submit, setUploadify, basePath) {
    this.basePath = basePath || "uploads/";
    this.setUploadify = setUploadify || (__upload && __upload.setUploadify);
    var that = this;
    this.selector = selector || "body";
    this.tpl = [
        '<div components="upload-imgtext-modal" data-id="{{id}}">',
        '   <div components="upload-imgtext-mask"></div>',
        '   <div components="upload-imgtext">',
        '       <div components="upload-imgtext-top">',
        '           <input components="_title" type="text" placeHolder="输入图文标题(可选)" value="">',
        '           <span components="glyphicon glyphicon-remove upload-imgtext-close" aria-hidden="true"></span>',
        '       </div>',
        '       <div components="upload-imgtext-content">',
        '           <textarea components="_content" name="" id="" placeHolder="输入区"></textarea>',
        //'           <div components="upload-imgtext-img"><img components="_img" src=""/></div>',
        '       </div>',
        '       <div components="upload-imgtext-bottom">',
        '          <div components="upload-imgtext-upload">',
        '             <input components="upload-input" type="file" id="upload-imgtext-{{id}}" name="upload" components="fileupload"/>',
        '          </div>',
        '          <span components="upload-imgtext-info"> +图片 </span>',
        '          <div components="upload-imgtext-btn"> 提交</div>',
        '       </div>',
        '   </div>',
        '</div>'
    ].join('');
    this.data = data;
    this.fn_upload = fn_upload;
    this.fn_submit = fn_submit;
    this.imgList = [];  //上传的图片列表

    this.submit = function () {
        that.data['title'] = that.$input.val();
        that.data['content'] = that.$textarea.val();
        that.hide();
        that.fn_submit && that.fn_submit(that.data);
    }
    this.reset = function () {
        that.$input.val("");
        that.$textarea.val("");
        that.$img.attr('src', '');
    }
    this.set = function (data) {
        that.$input.val(data['title']);
        that.$textarea.val(data['content']);
        that.$img.attr('src', data['url']);
    }
    this.hide = function () {
        that.$modal.hide();
    }
    this.show = function () {
        that.$modal.show();
    }
    return this;
}
ImgText.prototype.init = function () {
    $(this.selector).append(this.initTpl());

    this.$modal = $('.upload-imgtext-modal');
    this.$close = $('.upload-imgtext-modal .upload-imgtext-close');
    this.$btn = $('.upload-imgtext-modal .upload-imgtext-btn');
    this.$textarea = this.$modal.find('._content');
    this.$input = this.$modal.find('._title');
    this.$img = this.$modal.find('._img');

    this.bindEvent();
    return this;
}
ImgText.prototype.initTpl = function () {
    var tpl = this.tpl;
    var tpls = Handlebars.compile(tpl);
    return tpls(this.data);
}
ImgText.prototype.bindEvent = function () {
    var that = this;
    this.$close.off('click', this.hide).on('click', this.hide);
    this.$btn.off('click', this.submit).on('click', this.submit);
    this.setUploadify($('#upload-imgtext-' + this.data.id), {
        width: '48px',
        height: '48px',
        onUploadSuccess: function (file, result, response) {
            //var imgPath = that.basePath + file.name;
            //that.imgList.push(imgPath);
            //that.data['url'] = imgPath;
            that.imgList.push(result);
            that.data['url'] = result;
            that.$img.attr('src', result);
            that.data['filename'] = file.name;
            that.fn_upload && that.fn_upload(that.data, file, result, response);
        }
    });

}
