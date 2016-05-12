/***************************************************
 * 时间: 16/5/8 22:15
 * 作者: zhongxia
 * 依赖: Zepto.js Util.js
 * 说明: 点读考试 (答题组件)
 * 1. 左右滑动, swiper
 * 2. 分为单选,多选,对错题
 * 3. 自动判断是否答对
 * 4. 自动记录是否已经答题
 *
 ***************************************************/
function ExamShowList(selector, data, callback) {
  this.selector = selector;
  this.data = data;
  this.callback = callback;
  this.swiper;
  this.click = this.IsPC() ? 'click' : 'tap';
  this.CLASSENUM = {
    radio: {
      UNSELECTRIGHT: 'exam-list-radio-unselect-right',
      ERROR: 'exam-list-radio-error',
      RIGHT: 'exam-list-radio-right',
    },
    bool: {
      UNSELECTRIGHT: 'exam-list-bool-unselect-right',
      ERROR: 'exam-list-bool-error',
      RIGHT: 'exam-list-bool-right',
    },
    checkbox: {
      UNSELECTRIGHT: 'exam-list-checkbox-unselect-right',
      ERROR: 'exam-list-checkbox-error',
      RIGHT: 'exam-list-checkbox-right'
    }
  }
  this.render();
}

/**
 * 渲染页面
 */
ExamShowList.prototype.render = function () {
  var html = this.createContainer();
  $(this.selector).html(html);
  this.initVar();
  this.bindEvent();
}

/**
 * 创建页面容器
 * @returns {string}
 */
ExamShowList.prototype.createContainer = function () {
  var data = this.data;
  this.currentIndex = this.currentIndex || 1;
  this.total = data.questions.length || 1;
  var html = '';
  html += '<div class="exam-list-container">'
  html += '  <div class="exam-list-righttop exam-radio">'
  //html += '    <img src="../imgs/exam_create/exam_type_radio.png" alt="单选">'
  html += '  </div>'
  html += '  <div class="exam-list-top">'
  html += '    <div class="exam-list-sortid">'
  html += '     <div class="exam-list-sortid-spandiv"><span data-id="currentIndex">' + this.currentIndex + '</span> / <span  data-id="total">' + this.total + '</span></div>'
  html += '     <div class="exam-list-questionsList"></div>'
  html += '    </div>'
  html += '  </div>'
  html += this.createQuestions(data.questions);
  html += '  <div class="exam-list-show-answer">'
  html += '  </div>'
  html += '</div>'
  return html;
}

/**
 * 创建问题页
 * @param questions
 * @returns {string}
 */
ExamShowList.prototype.createQuestions = function (questions) {
  var html = '';
  html += '<div class="exam-list-main swiper-container">'
  html += ' <div class="exam-list-questions swiper-wrapper">'
  for (var i = 0; i < questions.length; i++) {
    var question = questions[i];
    html += '<div class="exam-list-question swiper-slide">'
    html += '  <p class="exam-list-question-title">' + question.text + '</p>'
    html += this.createAnswers(question.answers, question.type, i)
    html += '</div>'
  }
  html += ' </div>'
  html += '</div>'
  return html;
}

/**
 * 创建答案项
 * @param answers
 * @param type
 * @param index
 * @returns {string}
 */
ExamShowList.prototype.createAnswers = function (answers, type, index) {
  var html = '';
  html += '<ul class="exam-list-question-answer">'
  for (var i = 0; i < answers.length; i++) {
    var answer = answers[i];
    html += '  <li data-type="' + type + '" data-flag="' + answer.answer + '" data-id="' + (index + '_' + i) + '">'  //li列表上,标注着该选项是否为答案
    html += '    <div class="exam-list-' + type + '">'
    html += answer.text;
    html += '    </div>'
    html += '  </li>'
  }
  html += '</ul>'
  return html;
}

/**
 * 初始化变量
 */
ExamShowList.prototype.initVar = function () {
  this.$container = $(this.selector).find('.exam-list-container')
  this.$currentIndex = this.$container.find('span[data-id="currentIndex"]')
  this.$total = this.$container.find('span[data-id="total"]')
  this.$questions = this.$container.find('.exam-list-question')
  this.$answers = this.$container.find('.exam-list-question-answer>li')  //所有答案选项
  this.$showAnswer = this.$container.find('.exam-list-show-answer')  //显示答案
  this.$btnQuestionsList = this.$container.find('.exam-list-questionsList');  //题干
  this.$questionType = this.$container.find('.exam-list-righttop');  //题型图片
}

/**
 * 事件绑定
 */
ExamShowList.prototype.bindEvent = function () {
  var that = this;

  /**
   * 初始化 Swiper 组件
   * @type {*|Swiper}
   */
  that.swiper = new Swiper('.exam-list-main', {
    autoplayStopOnLast: true,
    onSlideChangeEnd: function (swiper) {
      that.currentIndex = swiper.activeIndex + 1;
      that.renderCurrentIndex();
      that.callback && that.callback(swiper, this)

      //切换题目类型图标
      that.$questionType.removeClass('exam-radio')
        .removeClass('exam-bool')
        .removeClass('exam-checkbox')
        .addClass('exam-' + that.data.questions[swiper.activeIndex].type);
    }
  });

  that.bindEvent_answer();

  /**
   * 显示所有答案, [注释掉的是显示当前题目的答案]
   */
  that.$showAnswer.off().on(that.click, function () {
    //隐藏答案
    if (that.$showAnswer.hasClass('exam-list-hide-answer')) {
      that.$showAnswer.removeClass('exam-list-hide-answer')
      that.$btnQuestionsList.hide();
      for (var i = 0; i < that.data.questions.length; i++) {
        that.hideAnswer4Index(i);
      }
      that.bindEvent_answer();
      //that.hideAnswer4Index(that.currentIndex - 1);
    }
    else { //显示答案
      that.$showAnswer.addClass('exam-list-hide-answer');
      that.$answers.off();
      that.$btnQuestionsList.show();
      for (var i = 0; i < that.data.questions.length; i++) {
        that.showAnswer4Index(i);
      }
      //that.showAnswer4Index(that.currentIndex - 1);
    }
  });

  /**
   * 点击题干
   */
  that.$btnQuestionsList.off().on(that.click, function () {
    alert('点击题干')
  })

}

/**
 * 绑定点击答案的事件
 * 在查看答案的时候,清除了点击事件
 */
ExamShowList.prototype.bindEvent_answer = function () {
  var that = this;
  /**
   * tap 答案选项, 由于滑动屏幕会触发,所以改成下面的方式
   * 分为 PC 端 和 移动端的展示方式
   */
  if (that.IsPC()) {
    that.$answers.off().on(that.click, function (e) {
      that.renderAnswer(e);
    })
  } else {
    that.Moblie_MoveOrTap(that.$answers, function (e) {
      that.renderAnswer(e);
    })
  }
}

/** 根据问题的下标,显示该问题的答案
 * @param questionIndex 问题的下标 (this.currentIndex -1)
 */
ExamShowList.prototype.showAnswer4Index = function (questinoIndex) {
  var question = this.data.questions[questinoIndex];
  var $question = $(this.$questions[questinoIndex]);
  var _$answers = $question.find('.exam-list-question-answer>li>div')

  var className = 'exam-list-' + question.type + '-active';
  var classENUM = this.CLASSENUM[question.type];


  for (var i = 0; i < question['answers'].length; i++) {
    var answer = question['answers'][i];

    if (answer.answer && $(_$answers[i]).hasClass(className)) {
      //设置显示答案的样式
      $(_$answers[i]).addClass(classENUM.RIGHT)
    } else if (answer.answer) {
      $(_$answers[i]).addClass(classENUM.UNSELECTRIGHT)
    } else if ($(_$answers[i]).hasClass(className)) {
      $(_$answers[i]).addClass(classENUM.ERROR)
    }
  }
}

/**
 * 隐藏答案,隐藏某一题的答案
 * @param questinoIndex
 */
ExamShowList.prototype.hideAnswer4Index = function (questinoIndex) {
  var question = this.data.questions[questinoIndex];
  var $question = $(this.$questions[questinoIndex]);
  var _$answers = $question.find('.exam-list-question-answer>li>div')
  var classENUM = this.CLASSENUM[question.type];

  _$answers.removeClass(classENUM.RIGHT).removeClass(classENUM.ERROR).removeClass(classENUM.UNSELECTRIGHT);
}


/**
 * 渲染 第几题, 根据 控件里面的 this.currentIndex
 */
ExamShowList.prototype.renderCurrentIndex = function () {
  this.$currentIndex.text(this.currentIndex);
}
/**
 * 渲染答案选项,选中或者未选中
 * @param id
 */
ExamShowList.prototype.renderAnswer = function (e) {
  var $cTar = $(e.currentTarget);
  var $answers = $cTar.parent().find('li>div');
  var $answer = $cTar.find('div');
  var type = $cTar.attr('data-type');
  var id = $cTar.attr('data-id');
  var className = 'exam-list-' + type + '-active'

  //单选,对错题, 则 默认清除之前选中的状态
  if (type !== 'checkbox') {
    $answers.removeClass(className);
  }

  //已选中在点击 则 变成 未选中
  if ($answer.hasClass(className)) {
    $answer.removeClass(className)
  } else {
    $answer.addClass(className)
  }
  this.setValue2Data();
}


/**
 * 把 答题的 题目 记录到 data 里面,并判断是否做对
 */
ExamShowList.prototype.setValue2Data = function () {
  var $questions = this.$questions;
  var questionsData = this.data.questions;

  for (var i = 0; i < $questions.length; i++) {
    var $question = $($questions[i]);
    var $answers = $question.find('ul>li>div');
    var _selected = ''; //判断题目是否已经做了
    var flag = true; //标记多选题是否全部选对

    var className = 'exam-list-' + questionsData[i].type + '-active'

    for (var j = 0; j < $answers.length; j++) {
      var $answer = $($answers[j]);

      //选中,表示题目已经选择答案了
      if ($answer.hasClass(className)) {
        questionsData[i]['answers'][j].selected = true;  //记录选项
        _selected += "1"; //题目已做
      } else {
        questionsData[i]['answers'][j].selected = false;
        _selected += "0";  //题目未做
      }
    }

    if (_selected.indexOf('1') !== -1) {
      questionsData[i].selected = true;
    } else {
      questionsData[i].selected = false;
      delete questionsData[i].isRight;  //如果为做题目,则没有做对做错之说法
    }

    //判断题目是否答对
    if (questionsData[i].selected) {
      for (var k = 0; k < questionsData[i]['answers'].length; k++) {
        var _answer = questionsData[i]['answers'][k];
        if (_answer.selected !== _answer.answer) {
          flag = false;
        }
      }
      questionsData[i].isRight = flag;
    }
  }
}

/*========================工具方法===========================*/
/**
 * 判断是否为PC端
 * @returns {boolean}
 * @constructor
 */
ExamShowList.prototype.IsPC = function () {
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

/**
 * 鼠标是点击或者移动 [Util里面也有该方法]
 * @param selector
 * @param cb_tap
 * @param cb_move
 */
ExamShowList.prototype.Moblie_MoveOrTap = function ($selector, cb_tap, cb_move) {
  var flag = false;
  $selector.on('touchstart touchmove touchend', function (event) {
    switch (event.type) {
      case 'touchstart':
        flag = false;
        break;
      case 'touchmove':
        flag = true;
        break;
      case 'touchend':
        if (!flag) {
          cb_tap && cb_tap(event);
        } else {
          cb_move && cb_move(event);
        }
        break;
    }
  })
}

