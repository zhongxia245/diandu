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
 * @param fn_submit  提交的处理
 * @returns {ImgText}
 */
var ImgText = function (selector, data, fn_submit) {
  var that = this;
  this.selector = selector || "body";
  this.tpl = [
    '<div class="upload-imgtext-modal" data-id="{{id}}">',
    '   <div class="upload-imgtext-mask"></div>',
    '   <div class="upload-imgtext">',
    '       <div class="upload-imgtext-top">',
    '           <input class="_title" type="text" placeHolder="输入图文标题(可选)" value="">',
    '           <span class="glyphicon glyphicon-remove upload-imgtext-close" aria-hidden="true"></span>',
    '       </div>',
    '       <div class="upload-imgtext-content">',
    '           <textarea class="_content" name="_content" id="" placeHolder="输入区"></textarea>',
    //'           <div class="upload-imgtext-img"><img class="_img" src=""/></div>',
    '       </div>',
    '       <div class="upload-imgtext-bottom">',
    '          <div class="upload-imgtext-btn"> 提交</div>',
    '       </div>',
    '   </div>',
    '</div>'
  ].join('');
  this.data = data;
  this.fn_submit = fn_submit;
  this.imgList = [];  //上传的图片列表

  this.submit = function () {
    that.data['title'] = that.$input.val();
    //that.data['content'] = that.$textarea.val();
    that.data['content'] = that.editor && that.editor.html()
    that.hide();
    that.fn_submit && that.fn_submit(that.data);
  }
  this.reset = function () {
    that.$input.val("");
    //that.$textarea.val("");
    that.editor && that.editor.html("")
    that.$img.attr('src', '');
  }
  this.set = function (data) {
    that.$input.val(data['title']);
    //that.$textarea.val(data['content']);
    that.editor && that.editor.html(data['content'])
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
  var that = this;

  $(this.selector).append(this.initTpl());

  this.$modal = $('.upload-imgtext-modal');
  this.$close = $('.upload-imgtext-modal .upload-imgtext-close');
  this.$btn = $('.upload-imgtext-modal .upload-imgtext-btn');
  this.$textarea = this.$modal.find('._content');
  this.$input = this.$modal.find('._title');
  this.$img = this.$modal.find('._img');
  that.editor = KindEditor.create(that.selector + ' textarea[name="_content"]', {
    uploadJson: "js/lib/kindeditor/php/upload_json.php",
    fileManagerJson: "js/lib/kindeditor/php/file_manager_json.php",
    cssPath: "js/lib/kindeditor/user.css",
    allowFileManager: true,
    width: '100%',
    items: ['image']
    //items: [
    //  'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold', 'italic', 'underline',
    //  'removeformat', '|', 'justifyleft', 'justifycenter', 'justifyright', 'insertorderedlist',
    //  'insertunorderedlist', '|', 'emoticons', 'image', 'link']
  });

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
}
