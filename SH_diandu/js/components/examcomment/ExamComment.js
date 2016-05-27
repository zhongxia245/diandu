/***************************************************
 * 时间: 16/5/21 21:48
 * 作者: zhongxia
 * 说明: 评论列表
 *
 ***************************************************/
var ExamComment = (function () {
  function ExamComment(selector, config) {
    this.selector = selector;
    this.config = config;
    this.data = config.data;
    this.scale = config.scale;

    this.basePath = '../'

    this.pageid = config.pageid || 1240;
    this.videoid = config.videoid || 1466;
    this.type = "0";

    this.config.isVertical = this.config.isVertical || true;
    this.click = IsPC() ? 'click' : 'tap';
    this.global = {
      ENUM: {
        TEXT: "0",
        IMG: "1",
        AUDIO: "2"
      },
      isUploadPage: false, // 当前是否显示  图片上传, 语音录制的页面, 是: 点击取消, 返回 创建 评论页面
    }
    this.render();
    return this;
  }

  ExamComment.prototype = {
    /**
     * 渲染页面
     */
    render: function () {
      var html = this.config.isVertical ? this.renderContainer() : this.renderHContainer();

      $(this.selector).html(html);

      this.initWebUploader();
      this.initVar();
      this.bindEvent();
      this.setScale();
    },
    /**
     * 初始化题干列表
     */
    renderContainer: function () {
      var html = '';
      html += '<div class="cmt-container">'
      html += '  <div class="cmt-top">'
      html += '    <span>评论</span>'
      html += '    <div class="cmt-top-img"></div>'
      html += '  </div>'
      html += this.renderCommentCreate()
      html += '  <div class="cmt-main">'
      html += '   <ul class="main-comment-list">'
      html += this.renderComments(this.data)
      html += '   </ul>'
      html += '  </div>'
      html += '</div>'
      return html;
    },
    /**
     * 初始化题干列表[ 横屏 ]
     */
    renderHContainer: function () {
      var html = '';

      return html;
    },

    /**
     * 生成评论列表
     * @param list 列表数据
     * @returns {string}
     */
    renderComments: function (list) {
      var html = '';
      for (var i = 0; i < list.length; i++) {
        var comment = list[i];
        html += '<li data-id="' + comment.id + '">'
        html += '  <span class="u-img">'
        html += '    <img src="' + comment.avatar + '" class="img">'
        html += '  </span>'
        html += '  <div class="detail">'
        html += '    <div class="cmt-name-wrap">'
        html += '      <a class="cmt-name">' + comment.truename + '</a>'
        html += '      <img class="cmt-setgood" src="../imgs/exam_comment/comment_good.png" alt="">'
        html += '      <span style="float: right; margin-right:10px">' + comment.support + '</span>'
        html += '    </div>'
        html += '    <div class="cmt-title">'
        if (comment.location) {
          html += '      <span class="location">' + comment.location + '</span>'
        }
        html += '      <time class="time">' + $.timeago(comment.addtime) + '</time>'
        html += '    </div>'
        html += '    <div class="cmt-content">'
        html += this.renderCommentContent(comment)
        html += '    </div>'
        html += '  </div>'
        html += '</li>'
      }
      return html;
    },

    /**
     * 创建评论
     * @returns {string}
     */
    renderCommentCreate: function () {
      var html = '';
      html += '<div class="cmt-create" style="display: none">'
      html += '   <textarea style="width: 100%" rows="5"></textarea>'
      html += '   <div class="cmt-upload-div">'
      html += '     <div class="cmt-audio-div">'
      html += '       <div class="cmt-audio-div-img"></div>'
      html += '       <div class="cmt-audio-div-text"><div>按住后对着麦克风说话</div>限时60秒</div>'
      html += '     </div>'
      html += '     <div class="cmt-image-div">照片</div>'
      html += '   </div>'
      html += '   <div class="cmt-upload-type">'
      html += '     <div class="cmt-audio"></div>'
      html += '     <div class="cmt-image"></div>'
      html += '   </div>'
      html += '   <div class="cmt-create-btns">'
      html += '      <div class="cmt-cancle"></div>'
      html += '      <div class="cmt-submit"></div>'
      html += '   </div>'
      html += '</div>'
      return html;
    },
    /**
     * 渲染评论内容, 三种类型, 文字, 图片, 语音
     * @param content 可能是文字, 或者图片地址, audio 地址
     * @param type
     */
    renderCommentContent: function (comment) {
      var html = '';
      switch (comment.type) {
        case this.global.ENUM.TEXT:
          html = comment.content;
          break;
        case this.global.ENUM.IMG:
          html = '<img src="' + this.basePath + comment.attachment + '" alt="">'
          break;
        case this.global.ENUM.AUDIO:
          html += '<div class="cmt-comment-audio">'
          html += '  <div class="audio-size"></div>'
          html += ' <div class="audio-length" data-audio="' + comment.attachment + '">' + comment.attachment + '\'</div>'
          html += '</div>'
          break;
      }
      return html;
    },
    /**
     * 初始化上传组件
     */
    initWebUploader: function () {
      var that = this;
      var url = "../php/fileupload2.php";
      this.uploader = WebUploader.create({
        server: url,
        pick: this.selector + " .cmt-image-div",
        resize: true,
        auto: true,
        threads: 1,
        duplicate: true,
        accept: {
          title: 'Images',
          extensions: 'gif,jpg,jpeg,bmp,png',
          mimeTypes: 'image/*'
        },
        fileSingleSizeLimit: 1024 * 1024 * 3  //最大 3M
      })

      /**
       * 上传成功
       */
      this.uploader.on('uploadSuccess', function (file, res) {
        var path = res._raw;

        that.attachment = path;

        that.$container.find('.webuploader-pick').addClass('cmt-hide');
        that.$div_uploadImage.css({
          backgroundImage: 'url(../' + path + ')',  //在 show.html 就不需要使用这个地址
          backgroundSize: 'auto 100%',
          backgroundRepeat: 'no-repeat',
          backgroundColor: 'transparent',
          backgroundPosition: 'center'
        })
      })
    },
    /**
     * 初始化变量
     */
    initVar: function () {
      this.$container = $(this.selector);
      this.$btn_createCmt = this.$container.find('.cmt-top-img');
      this.$div_cmtCreate = this.$container.find('.cmt-create');
      this.$textarea = this.$container.find('textarea');
      this.$div_upload = this.$container.find('.cmt-upload-div');
      this.$div_uploadAudio = this.$container.find('.cmt-audio-div');
      this.$div_uploadImage = this.$container.find('.cmt-image-div');
      this.$btn_setGood = this.$container.find('.cmt-setgood');
      this.$btn_cancle = this.$container.find('.cmt-cancle');
      this.$btn_submit = this.$container.find('.cmt-submit');
      this.$btn_audio = this.$container.find('.cmt-audio');
      this.$btn_image = this.$container.find('.cmt-image');
    },

    /**
     * 设置容器缩放的比例
     */
    setScale: function () {

    },

    /**
     * 绑定事件
     */
    bindEvent: function () {
      var that = this;

      //创建评论
      that.$btn_createCmt.off().on(that.click, function () {
        if (that.$btn_createCmt.hasClass('cmt-top-img-on')) {
          that.$div_cmtCreate.hide()
          that.$btn_createCmt.removeClass('cmt-top-img-on')
        } else {
          that.$div_cmtCreate.show()
          that.$btn_createCmt.addClass('cmt-top-img-on')
        }
      })

      // 图片上传
      that.$btn_image.off().on(that.click, function () {
        that.type = "1";
        that.global.isUploadPage = true;
        that.$textarea.hide();
        that.$div_upload.show();
        that.$div_uploadAudio.hide();
        that.$div_uploadImage.show();
      })

      // 语音录制
      that.$btn_audio.off().on(that.click, function () {
        that.type = "2";
        that.global.isUploadPage = true;
        that.$textarea.hide();
        that.$div_upload.show();
        that.$div_uploadAudio.show();
        that.$div_uploadImage.hide();
      })

      // 取消
      that.$btn_cancle.off().on(that.click, function () {
        that.cancleCreateCmt()
      })

      //提交
      that.$btn_submit.off().on(that.click, function () {
        var data = {
          videoid: that.videoid,
          pageid: that.pageid,
          content: that.$textarea.val(),
          type: that.type,
          attachment: that.attachment
        }

        //如果评论内容, 或者附件列表为空,则不允许添加评论
        if (data.content || data.attachment) {
          Model.addComment(data, function (result) {
            that.cancleCreateCmt();
            console.log("result", result)
            that.reRender()
          })
        }
      })

      //点赞
      that.$btn_setGood.off().on(that.click, function (e) {
        var $ctar = $(e.currentTarget);
        var _cmtId = $ctar.parent().parent().parent().attr('data-id');

        //发送点赞接口
        Model.support(_cmtId, function (result) {
          if (result) {
            $ctar.next().text(parseInt($ctar.next().text()) + 1)
          }
        })
      })
    },
    /**
     * 隐藏评论
     */
    cancleCreateCmt: function () {
      this.type = "0"
      this.$textarea.val("");
      if (this.global.isUploadPage) {
        this.$div_upload.hide();
        this.$textarea.show();
      } else {
        this.$div_cmtCreate.hide()
        this.$btn_createCmt.removeClass('cmt-top-img-on')
      }
    },
    /**
     * 重新渲染
     */
    reRender: function () {
      var that = this;
      Model.getComment(that.pageid, function (data) {
        that.data = data;
        that.render();
      })
    }
  }


  /**
   * 判断是否为PC端
   * @returns {boolean}
   * @constructor
   */
  function IsPC() {
    var userAgentInfo = navigator.userAgent;
    var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
      if (userAgentInfo.indexOf(Agents[v]) > 0) {
        flag = false;
        break;
      }
    }
    return flag;
  }

  return ExamComment;
})()

