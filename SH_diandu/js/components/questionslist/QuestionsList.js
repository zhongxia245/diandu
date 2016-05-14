/***************************************************
 * 时间: 16/5/12 00:09
 * 作者: zhongxia
 * 说明: 题干列表
 *
 ***************************************************/
var QuestionsList = (function () {
  function QuestionsList(selector, config) {
    this.selector = selector;
    this.config = config;
    this.data = config.data;
    this.scale = config.scale;

    this.fnReturn = config.fnReturn;
    this.fnClose = config.fnClose;
    this.fnQuestionClick = config.fnQuestionClick;

    this.click = IsPC() ? 'click' : 'tap';
    //存放一些常量
    this.GLOBAL = {
      doCount: 0,
      undoCount: 0,
      rightCount: 0,
      errorCount: 0,
      CLASS: {
        do: {class: 'exam-question-list-do', text: '已做'},
        undo: {class: 'exam-question-list-undo', text: '未做'},
        error: {class: 'exam-question-list-error', text: '错误'},
        right: {class: 'exam-question-list-right', text: '正确'}
      }
    }
    this.render();

    return this;
  }

  QuestionsList.prototype = {
    /**
     * 渲染页面
     */
    render: function () {
      var html = this.renderContainer();
      $(this.selector).html(html);
      this.initVar();
      this.bindEvent();

      this.setScale();
    },
    /**
     * 初始化题干列表
     */
    renderContainer: function () {
      var html = '';
      html += '<div class="exam-question-list">'
      html += '    <div class="exam-question-list-top">'
      html += '    <div class="exam-question-list-return">返回</div>'
      html += '    <div class="exam-question-list-close">X</div>'
      html += '    </div>'
      html += '    <!--题目列表 START-->'
      html += '  <div class="exam-question-list-main">'
      html += this.renderQuestionItems(this.data.questions)
      html += '    </div>'
      html += '    <!--题目列表 END-->'
      html += '  <div class="exam-question-list-bottom">'
      html += '    <!--已做,未做,正确,错误的比例 START-->'
      html += '  <div class="exam-question-percents">'
      html += this.renderAllPercents()
      html += '    </div>'
      html += '    <!--已做,未做,正确,错误的比例 END-->'
      html += '    <div class="exam-question-list-showAnswer"> 查看答案 </div>'
      html += '    <div class="exam-question-list-hideAnswer" style="display: none;"> 隐藏答案 </div>'
      html += '  </div>'
      html += '</div>'
      return html;
    },

    /**
     * 渲染题干列表
     * @param questions
     * @returns {string}
     */
    renderQuestionItems: function (questions) {
      var html = '';

      for (var i = 0; i < questions.length; i++) {
        var question = questions[i];

        //计算正确,错误,已做,未做的题目数量
        var curClassName = ''
        var classNameType = ''

        if (question.selected) {
          this.GLOBAL.doCount++
          curClassName = this.GLOBAL.CLASS.do.class;
          if (question.isRight) {
            this.GLOBAL.rightCount++
            classNameType = this.GLOBAL.CLASS.right.class;
          } else {
            this.GLOBAL.errorCount++;
            classNameType = this.GLOBAL.CLASS.error.class;
          }
        } else {
          classNameType = curClassName = this.GLOBAL.CLASS.undo.class;
          this.GLOBAL.undoCount++
        }

        html += '<div class="exam-question-list-item ' + curClassName + '" data-index="' + i + '" data-hideanswer="' + curClassName + '"  data-showanswer="' + classNameType + '">' + (i + 1) + '</div>';
      }

      return html;
    },


    /**
     * 渲染所有的百分比展示(已做百分比,未做,正确,错误)
     */
    renderAllPercents: function () {
      var html = '';
      var rightPercent = (this.GLOBAL.rightCount / this.data.questions.length * 100).toFixed(2) + "%";
      var errorPercent = (this.GLOBAL.errorCount / this.data.questions.length * 100).toFixed(2) + "%";
      var doPercent = (this.GLOBAL.doCount / this.data.questions.length * 100).toFixed(2) + "%";
      var undoPercent = (this.GLOBAL.undoCount / this.data.questions.length * 100).toFixed(2) + "%";

      html += ' <div class="exam-question-percent" data-type="right" style="display: none;">'
      html += '     <div class="exam-question-percent-left ' + this.GLOBAL.CLASS.right.class + '">' + this.GLOBAL.CLASS.right.text + '</div>'
      html += '     <div class="exam-question-percent-right">' + rightPercent + '</div>'
      html += ' </div>'

      html += ' <div class="exam-question-percent"  data-type="error" style="display: none;">'
      html += '     <div class="exam-question-percent-left ' + this.GLOBAL.CLASS.error.class + '">' + this.GLOBAL.CLASS.error.text + '</div>'
      html += '     <div class="exam-question-percent-right">' + errorPercent + '</div>'
      html += ' </div>'

      html += ' <div class="exam-question-percent" data-type="do" >'
      html += '     <div class="exam-question-percent-left ' + this.GLOBAL.CLASS.do.class + '">' + this.GLOBAL.CLASS.do.text + '</div>'
      html += '     <div class="exam-question-percent-right">' + doPercent + '</div>'
      html += ' </div>'

      html += ' <div class="exam-question-percent" data-type="undo" >'
      html += '     <div class="exam-question-percent-left ' + this.GLOBAL.CLASS.undo.class + '">' + this.GLOBAL.CLASS.undo.text + '</div>'
      html += '     <div class="exam-question-percent-right">' + undoPercent + '</div>'
      html += ' </div>'

      return html;
    },

    /**
     * 初始化变量
     */
    initVar: function () {
      this.$container = $(this.selector);
      this.$btn_return = this.$container.find('.exam-question-list-return');
      this.$btn_close = this.$container.find('.exam-question-list-close');
      this.$btn_showAnswer = this.$container.find('.exam-question-list-showAnswer');
      this.$btn_hideAnswer = this.$container.find('.exam-question-list-hideAnswer');

      this.$questions = this.$container.find('.exam-question-list-item');

      this.$rightPercent = this.$container.find('div[data-type="right"]');
      this.$errorPercent = this.$container.find('div[data-type="error"]');
      this.$doPercent = this.$container.find('div[data-type="do"]');
      this.$undoPercent = this.$container.find('div[data-type="undo"]');
    },

    setScale: function () {
      this.$container.css('zoom', this.scale)
    },

    /**
     * 绑定事件
     */
    bindEvent: function () {
      var that = this;
      this.$btn_return.off().on(that.click, function () {
        that.fnReturn && that.fnReturn(that);
      })

      this.$btn_close.off().on(that.click, function () {
        that.fnClose && that.fnClose(that);
      })


      this.$btn_showAnswer.off().on(that.click, function () {
        that.$doPercent.hide();
        that.$rightPercent.show();
        that.$errorPercent.show();

        for (var i = 0; i < that.$questions.length; i++) {
          var $question = $(that.$questions[i]);
          $question
            .removeClass($question.attr('data-hideanswer'))
            .addClass($question.attr('data-showanswer'));
        }


        that.$btn_hideAnswer.show();
        that.$btn_showAnswer.hide();
      })


      this.$btn_hideAnswer.off().on(that.click, function () {
        that.$doPercent.show();
        that.$rightPercent.hide();
        that.$errorPercent.hide();

        for (var i = 0; i < that.$questions.length; i++) {
          var $question = $(that.$questions[i]);
          $question
            .removeClass($question.attr('data-showanswer'))
            .addClass($question.attr('data-hideanswer'));
        }

        that.$btn_hideAnswer.hide();
        that.$btn_showAnswer.show();
      })


      this.$questions.off().on(that.click, function (e) {
        that.fnQuestionClick && that.fnQuestionClick($(e.currentTarget).attr('data-index'))
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

  return QuestionsList;
})()

