/**
 * 创建考试页面
 * @param selector 添加的位置
 * @param data 数据
 * @param config 配置文件
 */
var ExamCreate = function (selector, data, fn_submit) {
  this.data = data || {};
  this.fn_submit = fn_submit;
  this.config = {
    radio: 'radio',
    checkbox: 'checkbox',
    bool: 'bool'
  };
  this.selector = selector;
  // 创建页面模板
  this.tpl = [
    '<div class="exam-create-container">',
    '  <!--题型选择 START-->',
    '  <div class="exam-create-righttop">',
    '    <img data-type="radio" src="./imgs/exam_create/exam_type_radio.png" alt="单选" title="单选">',
    '    <img data-type="checkbox" src="./imgs/exam_create/exam_type_checkbox.png" alt="多选" title="多选">',
    '    <img data-type="bool" src="./imgs/exam_create/exam_type_bool.png" alt="对错" title="对错">',
    '  </div>',
    '  <!--题型选择 END-->',
    '  <!--顶部工具栏 START-->',
    '  <div class="exam-create-top">',
    '    <div class="exam-create-pre"></div>',
    '    <div class="exam-create-sortid">',
    '       <span class="eaxm-create-currentIndex">{{currentIndex}}</span>/<span class="eaxm-create-total">{{total}}</span>',
    '    </div>',
    '    <div class="exam-create-next"></div>',
    '    <div class="exam-create-add"></div>',
    '    <div class="exam-create-del"></div>',
    '  </div>',
    '  <!--顶部工具栏 END-->',
    '  <!--题目 START-->',
    '  <div class="exam-create-main">',
    '{{{questionsHTML}}}',
    '  </div>',
    '  <!--题目 END-->',
    '  <!--底部工具栏 START-->',
    '  <div class="exam-create-bottom">',
    '    <div class="exam-create-addItem"></div>',
    '    <div class="exam-create-submit"></div>',
    '  </div>',
    '  <!--底部工具栏 END-->',
    '</div>'
  ].join('');
  // 题目模板
  this.questionTpl = [
    '<div class="exam-create-main-item" data-id="{{index}}" style="display:{{hide}}">',
    '  <textarea class="exam-create-question form-control" placeholder="输入题干">{{text}}</textarea>',
    '  <div class="exam-create-answer">',
    '{{{answerHTML}}}',
    '  </div>',
    '</div>'
  ].join('');
  // 答案模板
  this.answerTpl = [
    '    <div class="exam-create-answer-item" data-id="{{index}}">',
    '      <div data-type="{{type}}" class="exam-create-answer-item-{{type}} {{answerClass}}"></div>',
    '      <div class="exam-create-answer-item-content">',
    '        <textarea class="form-control" rows="1" placeholder="{{placeholder}}">{{text}}</textarea>',
    '      </div>',
    '    </div>',
  ].join('');

  this.questionItem = {
    radio: {
      text: '',
      type: 'radio',
      answers: [
        {}, {}, { placeholder: "输入选项,少于三个请留空" }, { placeholder: "输入选项,少于四个请留空" }
      ]
    },
    checkbox: {
      text: '',
      type: 'checkbox',
      answers: [
        {}, {}, {}, { placeholder: "输入选项,少于四个请留空" }
      ]
    }
    ,
    bool: {
      text: '',
      type: 'bool',
      answers: [
        { text: "对 (True)" }, { text: "错 (False)" }
      ]
    }

  }

  this.render()
  return this;
}

/*====================render 方法 START===========================*/
/**
 * 采用数据驱动,每次都会根据 this.data 重新渲染一次
 * [怀念react 和双向数据绑定的开发方法]
 */
ExamCreate.prototype.render = function () {
  var html = this.init();
  $(this.selector).html(html);
  this.initVar();
  this.bindEvent();
  this.setQuestionType(this.currentIndex - 1);
}

/**
 * 初始化页面
 */
ExamCreate.prototype.init = function () {
  var tpls = Handlebars.compile(this.tpl);
  this.data.questions = this.data.questions || [this.getQuestionItemByType('radio')]; // [this.questionItem['radio']];

  this.total = this.data.questions.length || 1;
  this.currentIndex = this.currentIndex || 1;

  var data = $.extend(true, {}, this.data);
  data.total = this.total;
  data.currentIndex = this.currentIndex;

  data.questionsHTML = this.createQuestion(data.questions);

  return tpls(data);
}

/**
 * 创建问题列表
 * @param questions
 * @returns {string}
 */
ExamCreate.prototype.createQuestion = function (questions) {
  var tpls = Handlebars.compile(this.questionTpl);
  var quetionsHTML = '';

  for (var i = 0; i < questions.length; i++) {
    var question = questions[i];
    question.index = i;
    //题目不等于考卷的当前下标,则隐藏
    if (i != this.currentIndex - 1) {
      question.hide = 'none';
    }
    question.type = question.type || 'radio';
    question.answerHTML = this.createAnswer(question.answers || [], this.config[question.type], i);
    quetionsHTML += tpls(question);
  }
  return quetionsHTML;
}

/**
 * 创建答案列表
 * @param answers
 * @param type
 * @param questionIndex
 * @returns {string}
 */
ExamCreate.prototype.createAnswer = function (answers, type, questionIndex) {
  var tpls = Handlebars.compile(this.answerTpl);
  var answerHTML = '';

  for (var i = 0; i < answers.length; i++) {
    var answer = answers[i];
    answer.index = questionIndex + '_' + i;
    answer.type = type;
    answer.answerClass = answer.answer ? 'exam-create-active' : '';
    answer.placeholder = answer.placeholder || "输入选项";
    answerHTML += tpls(answer);
  }

  return answerHTML;
}


/*====================初始化变量 START===========================*/
/**
 * 初始化变量
 */
ExamCreate.prototype.initVar = function () {
  this.$container = $(this.selector);
  this.$questionsMain = this.$container.find('.exam-create-main');
  this.$questions = this.$container.find('.exam-create-main-item');
  this.$add = this.$container.find('.exam-create-add');
  this.$del = this.$container.find('.exam-create-del');
  this.$currentIndex = this.$container.find('.eaxm-create-currentIndex');
  this.$total = this.$container.find('.eaxm-create-total');
  this.$addItem = this.$container.find('.exam-create-addItem');
  this.$submit = this.$container.find('.exam-create-submit');
  this.$pre = this.$container.find('.exam-create-pre');
  this.$next = this.$container.find('.exam-create-next');
  this.$questionType = this.$container.find('.exam-create-righttop');
  this.$answerSelect = this.$container.find('.exam-create-answer-item>div[data-type]');
}

/*====================事件绑定 START===========================*/

/**
 * 事件绑定
 */
ExamCreate.prototype.bindEvent = function () {
  var that = this;

  /**
   * 上一题目
   */
  this.$pre.off().on('click', function () {
    if (that.currentIndex > 1) {
      that.currentIndex--;
      that.$currentIndex.text(that.currentIndex)
      that.changeQuestion(that.currentIndex - 1);
      that.setQuestionType(that.currentIndex - 1);
      autosize.update($(that.selector).find('textarea'));
    }
  });

  /**
   * 下一题目
   */
  this.$next.off().on('click', function () {
    if (that.currentIndex < that.total) {
      that.currentIndex++;
      that.$currentIndex.text(that.currentIndex);
      that.changeQuestion(that.currentIndex - 1);
      that.setQuestionType(that.currentIndex - 1);
      autosize.update($(that.selector).find('textarea'));
    }
  });

  /**
   * 题目类型[单选,多选,对错]
   */
  this.$questionType.off().on('click', function (e) {
    var $cTar = $(e.currentTarget);
    var $tar = $(e.target);
    if ($cTar.hasClass('exam-create-righttop-open')) {
      var type = $tar.attr('data-type');
      if (that.data.questions[that.currentIndex - 1].type !== type) {
        that.data.questions[that.currentIndex - 1]['type'] = type;
        that.data.questions[that.currentIndex - 1]['answers'] = that.getQuestionItemByType(type)['answers'];
        //切换题目类型则重置  选项和答案
        that.getValue2Data(true);

        that.render();
      }
      $cTar.removeClass('exam-create-righttop-open');

    } else {
      $cTar.addClass('exam-create-righttop-open')
    }
  });

  /**
   * 选择正确项
   */
  this.$answerSelect.off().on('click', function (e) {
    var $cTar = $(e.currentTarget);
    var type = $cTar.attr('data-type');
    if (type !== "checkbox") {
      $cTar.parent().parent().find('div[data-type]').removeClass('exam-create-active');
    }
    if ($cTar.hasClass('exam-create-active')) {
      $cTar.removeClass('exam-create-active');
    } else {
      $cTar.addClass('exam-create-active');
    }

  })

  /**
   * 添加题目
   */
  this.$add.off().on('click', function () {
    that.getValue2Data();
    var item = that.getQuestionItemByType('radio');//that.questionItem['radio'];
    that.currentIndex++;
    that.data.questions.splice(that.currentIndex - 1, 0, item);
    that.render();
    autosize($(that.selector).find('textarea'));
  });

  /**
   * 删除题目
   */
  this.$del.off().on('click', function () {
    that.getValue2Data();
    if (that.total == 1) {
      var type = that.data.questions[0].type || 'radio';
      that.data.questions = [that.getQuestionItemByType('radio')]//[that.questionItem[type]];
    } else {
      that.data.questions.splice(that.currentIndex - 1, 1);
      that.currentIndex > 1 ? that.currentIndex-- : '';
    }
    that.render();
  });

  /**
   * 添加答案项
   */
  this.$addItem.off().on('click', function () {
    that.getValue2Data();
    that.data.questions[that.currentIndex - 1].answers.push({ text: '' });
    that.render();
    autosize($(that.selector).find('textarea'));
  });

  /**
   * 提交
   */
  this.$submit.off().on('click', function () {
    that.getValue2Data();
    if (that.checkSettingAnswer()) {
      that.fn_submit && that.fn_submit(that.data);
    }
  });

}

/*====================工具方法 START===========================*/

/**
 * 设置指定下标的题目
 * @param index 下标
 */
ExamCreate.prototype.changeQuestion = function (index) {
  this.$questions.hide();
  this.$questions.eq(index).show();
}

/**
 * 设置指定下标的题目类型
 * @param index 下标
 */
ExamCreate.prototype.setQuestionType = function (index) {
  var type = this.data.questions[index] && this.data.questions[index].type || 'radio';
  var $tar = this.$questionType.find('img[data-type="' + type + '"]');
  $tar.remove();
  this.$questionType.prepend($tar);
}

/**
 * 把文本框的数据解析出来,放到对象的data 里面
 * @param flag 是否重置选项的值 true 是 [目前就切换题型时,重置选项和答案]
 */
ExamCreate.prototype.getValue2Data = function (flag) {
  var questions = this.$questions || [];
  for (var i = 0; i < questions.length; i++) {
    var $question = $(questions[i]);
    var id = $question.attr('data-id');
    this.data.questions[id]['text'] = $question.find('.exam-create-question').val();
    if (!flag) {
      // 每个答案的内容
      var $answerItems = $question.find('.exam-create-answer-item textarea');
      for (var j = 0; j < $answerItems.length; j++) {
        var $item = $($answerItems[j]);
        if (this.data.questions[id]['answers'][j]) {
          this.data.questions[id]['answers'][j]['text'] = $item.val();
        }
      }

      // 正确答案
      var $answerSelect = $question.find('div[data-type]');
      for (var j = 0; j < $answerSelect.length; j++) {
        var $item = $($answerSelect[j]);
        if (this.data.questions[id]['answers'][j]) {
          if ($item.hasClass('exam-create-active')) {
            this.data.questions[id]['answers'][j]['answer'] = true;
          } else {
            this.data.questions[id]['answers'][j]['answer'] = false;
          }
        }
      }

    }
  }
}

/**
 * 使用了深复制,不然会导致公用一个引用
 * @param type
 * @returns {*|void}
 */
ExamCreate.prototype.getQuestionItemByType = function (type) {
  return $.extend(true, {}, this.questionItem[type]);
}


/**
 * 检查所有题目是否设置了答案
 * 如果未设置答案，不允许提交
 */
ExamCreate.prototype.checkSettingAnswer = function () {
  var flag = []
  var questions = this.data.questions;
  for (var i = 0; i < questions.length; i++) {
    var question = questions[i];
    for (var j = 0; j < question.answers.length; j++) {
      if (question.answers[j].answer) {
        flag.push(true)
        break;
      }
      if (j === question.answers.length - 1) {
        flag.push(false)
      }
    }
  }

  for (var i = 0; i < flag.length; i++) {
    if (!flag[i]) {
      alert('第' + (i + 1) + '道题目未设置答案，请检查下题目答案哦！')
      return false;
    }
  }
  return true;
}