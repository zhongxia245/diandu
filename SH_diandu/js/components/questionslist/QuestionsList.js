/***************************************************
 * 时间: 16/5/12 00:09
 * 作者: zhongxia
 * 说明: 题干列表
 *
 ***************************************************/
var QuestionsList = (function () {
  function QuestionsList(selector, data, callback) {
    this.selector = selector;
    this.data = data;
    this.callback = callback;
    this.click = IsPC() ? 'click' : 'tap';

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
      html += this.renderPercents(this.data.questions)
      html += '    </div>'
      html += '    <!--已做,未做,正确,错误的比例 END-->'
      html += '    <div class="exam-question-list-showAnswer"> 查看答案 </div>'
      html += '    <div class="exam-question-list-hideAnswer" style="display: none;"> 隐藏答案 </div>'
      html += '  </div>'
      html += '</div>'
      return html;
    },
    renderQuestionItems: function (questions) {
      var html = '';

      for (var i = 0; i < questions.length; i++) {
        var question = questions[i];
        html += '<div class="exam-question-list-item exam-question-list-do">' + i + '</div>';
      }

      return html;
    },
    renderPercents: function (questions) {
      var html = '';

      for (var i = 0; i < questions.length; i++) {
        var question = questions[i];
        html += ' <div class="exam-question-percent">'
        html += '     <div class="exam-question-percent-left exam-question-list-do">已做</div>'
        html += '     <div class="exam-question-percent-right">40%</div>'
        html += ' </div>'
      }

      return html;
    },
    initVar: function () {
      this.$container = $('.exam-question-list');
      this.$btn_return = this.$container.find('.exam-question-list-return');
      this.$btn_close = this.$container.find('.exam-question-list-close');
      this.$btn_showAnswer = this.$container.find('.exam-question-list-showAnswer');
      this.$btn_hideAnswer = this.$container.find('.exam-question-list-hideAnswer');

      this.$questions = this.$container.find('.exam-question-list-item');
      this.$percents = this.$container.find('.exam-question-percent');
    }

    ,
    bindEvent: function () {
      var that = this;
      this.$btn_return.off().on(that.click, function () {

      })
      this.$btn_close.off().on(that.click, function () {

      })
      this.$btn_showAnswer.off().on(that.click, function () {
        that.$btn_hideAnswer.show();
        that.$btn_showAnswer.hide();
      })
      this.$btn_hideAnswer.off().on(that.click, function () {
        that.$btn_hideAnswer.hide();
        that.$btn_showAnswer.show();
      })
      this.$questions.off().on(that.click, function () {

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

