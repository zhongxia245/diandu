//加载依赖的脚本和样式
(function () {
  function getBasePath() {
    //兼容Chrome 和 FF
    var currentPath = document.currentScript && document.currentScript.src || '';
    var paths = currentPath.split('/');
    paths.pop();
    return paths.join('/');
  }

  Util.loadCSS(getBasePath() + '/style.css');
})();


/**
 * 音频面板，含有歌词，控制音量，控制播放速度，控制进度
 */
function AudioPanel(config) {

  $('body').append(initHTML());

  var mp3_path = config.mp3_path || ''
  var lrc_path = config.lrc_path || ''
  var baseImgPath = config.baseImgPath || './imgs/audio_sound/'

  init(mp3_path, lrc_path, baseImgPath);

  if (window.Util && window.Util.drag) {
    Util.drag('.audio-panel', function (e, x, y) {
      // console.log('drag', x, y)
      $('.audio-panel').css({
        left: x,
        top: y
      })
    }, ['js-ap-close', 'ap__progress', 'ap__progress_val', 'ap__speed_val', 'js-ap-sound', 'js-ap-lrc', 'ap__volume-li'])
  }

  function initHTML() {
    var html = '';
    html += '<div class="audio-panel-wrap">';
    html += '<div class="audio-panel">';
    html += '  <audio style="display: none;" id="js-ap-audio"></audio>';
    html += '  <div class="ap__close js-ap-close"></div>';
    html += '  <div class="ap__lrc js-container-lrc"></div>';
    html += '  <div class="ap__container">';
    html += '    <div class="ap__container--top">';
    html += '      <div class="ap__progress-container">';
    html += '        <span class="ap__time--current js-ap-current">00:00</span>';
    html += '        <span class="ap__time--total js-ap-total">00:00</span>';
    html += '        <div class="ap__progress" id="ap_progress">';
    html += '          <div class="ap__progress_val" id="ap_progress_val"></div>';
    html += '        </div>';
    html += '      </div>';
    html += '      <div class="ap__btn-lrc js-ap-lrc">字</div>';
    html += '    </div>';
    html += '    <div class="ap__container--bottom">';
    html += '      <div class="ap__volume">';
    html += '        <p>音量调整</p>';
    html += '        <ul class="ap__sound js-ap-sound">';
    html += '        </ul>';
    html += '      </div>';
    html += '      <div class="ap__speed">';
    html += '        <p>语速调整</p>';
    html += '        <div class="ap__speed-bar" id="ap_speed_bar">';
    html += '          <div class="ap__speed_val" id="ap_speed_val"></div>';
    html += '        </div>';
    html += '      </div>';
    html += '    </div>';
    html += '  </div>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  function init(mp3_path, lrc_path, baseImgPath) {
    var $btnLrc = $('.js-ap-lrc');
    var $containerLrc = $('.js-container-lrc');
    var $btnClose = $('.js-ap-close');
    var $btnSound = $('.js-ap-sound');

    initSlide();
    initSoundControl(baseImgPath, function (size) {
      getMedia().volume = size / 6;
    });
    if (lrc_path) {
      initLrc(lrc_path);
    } else {
      $btnLrc.hide();
    }

    playSong(mp3_path);

    //显示歌词  
    $btnLrc.on('click', function (e) {
      e.stopPropagation();
      if ($btnLrc.hasClass('ap__btn-lrc--active')) {
        $btnLrc.removeClass('ap__btn-lrc--active');
        $containerLrc.removeClass('ap__lrc--active');
      } else {
        $btnLrc.addClass('ap__btn-lrc--active');
        $containerLrc.addClass('ap__lrc--active');
      }
    })

    //关闭弹窗
    $btnClose.on('click', function (e) {
      e.stopPropagation();
      try {
        getMedia().pause();
      } catch (error) { }
      $('.audio-panel-wrap').remove();
    })


    //初始化音量控制器
    function initSoundControl(baseImgPath, callback) {
      var htmls = [];
      for (var i = 1; i <= 6; i++) {
        htmls.push('<li class="ap__volume-li" data-index="' + i + '"></li>');
      }

      $btnSound.html(htmls.join(''));

      var _$lis = $btnSound.find('li');
      for (var j = 1; j <= 6; j++) {
        _$lis.eq(j - 1).css('background-image', 'url(' + baseImgPath + j + '.png)')
      }

      $btnSound.on('click', 'li', function (e) {
        e.stopPropagation();
        var $lis = $btnSound.find('li');
        var soundSize = $(e.target).data('index');
        if (callback) callback(soundSize)

        //设置音量的图片
        for (var j = 1; j <= 6; j++) {
          if (j <= soundSize) {
            $lis.eq(j - 1).css('background-image', 'url(' + baseImgPath + j + '.png)')
          } else {
            $lis.eq(j - 1).css('background-image', 'url(' + baseImgPath + j + '_1.png)')
          }
        }
      })
    }

    //初始化滑块
    function initSlide() {
      new Slide({
        allowClick: true,
        progressBar: '#ap_progress',
        progressVal: '#ap_progress_val',
        callback: function (val) {
          if (getMedia().duration) {
            var currentTime = getMedia().duration * val
            getMedia().currentTime = currentTime
          }
        }
      })

      new Slide({
        allowClick: true,
        value: 0.5,
        progressBar: '#ap_speed_bar',
        progressVal: '#ap_speed_val',
        callback: function (val) {
          var speed = parseFloat((2 * val).toFixed(1));
          $('#ap_speed_val').text(speed);
          if (getMedia().duration) {
            getMedia().playbackRate = speed
          }
        }
      })
    }

    function setAudioTotalTime() {
      var totalTime = getMedia().duration
      $('.js-ap-total').text(getTimeM(parseInt(totalTime)))
    }


    // ===================生成歌词的方法====================

    //格式化时间
    function getTimeM(totalTime) {
      var totalTimeStr = "00:00";
      if (!isNaN(totalTime)) {
        var totalTimeStr = totalTime / 60 >= 10 ? parseInt(totalTime / 60) : "0" + parseInt(totalTime / 60);
        totalTimeSec = (totalTime % 60 >= 10 ? parseInt(totalTime % 60) : "0" + parseInt(totalTime % 60));
        if (totalTimeStr > 99) {
          totalTimeStr = "00";
        }
        totalTimeStr = totalTimeStr + ":" + totalTimeSec;
      }
      return totalTimeStr;
    }


    var ltime = 0;
    var lastLine = false;
    var lrcLst = null;
    var llrcObj = null;
    var $lrcInfo = $('.js-container-lrc')
    var llrcId = 'llrcId'
    var lrc_line_marginTop = '1.2rem'

    //获取lrc歌词文件
    function initLrc(path) {
      $.get(path, function (data) {
        calLrcInfo(data)
      })
    }

    //计算歌词信息
    function calLrcInfo(lrcStr) {
      var data = lrcStr.split('\n')
      var lrcInfoData = []
      for (var i = 0; i < data.length; i++) {
        var lrcInfoItem = data[i].split(']')
        lrcInfoItem[0] = lrcInfoItem[0].replace('[', '')
        if (lrcInfoItem.length === 2 && lrcInfoItem[1].trim() !== "") {
          lrcInfoData.push({ text: lrcInfoItem[1], timeId: calTime2Sec(lrcInfoItem[0]) })
        } else if (lrcInfoItem.length === 1 && lrcInfoItem[0].trim() !== "") {
          lrcInfoData.push({ text: lrcInfoItem[0], timeId: '' })
        }
      }
      lrcinfo(lrcInfoData)
    }

    //计算毫秒数
    function calTime2Sec(timeStr) {
      timeStr = timeStr || '';
      var times = timeStr.split('.');
      var min = times[0].split(':')[0];
      var sec = times[0].split(':')[1];
      return parseInt(min) * 60 + parseInt(sec);
    }

    //生成歌词信息，插入到HTML中
    function lrcinfo(data) {
      lrcLst = data;
      if (!lrcLst || lrcLst.length == 0) {
        $lrcInfo.html('随便听听')
      } else {
        var htm = [];
        htm[htm.length] = "<div id='" + llrcId + "' style='overflow-x: hidden;overflow-y: hidden; '>";
        for (var i = 0; i < lrcLst.length; i++) {
          if (i == 0) {
            htm[htm.length] = '<p id="lId' + i + '">';
          } else {
            htm[htm.length] = "<p id='lId" + i + "'>";
          }
          htm[htm.length] = lrcLst[i].text;
          htm[htm.length] = "</p>";
        }
        htm[htm.length] = "</div>";
        $lrcInfo.html(htm.join(""))
      }

      llrcObj = document.getElementById(llrcId);
      llrcObj.style.marginTop = lrc_line_marginTop
    }

    //获取媒体对象
    function getMedia() {
      var audio = $('#js-ap-audio')[0]
      audio.ontimeupdate = updateMethod;
      return audio;
    }

    //更新当前时间和进度条
    function updateMethod() {
      try {
        var currentTime = getMedia().currentTime;
        var totalTime = getMedia().duration;
        $('.js-ap-current').text(getTimeM(currentTime))
        $('.js-ap-total').text(getTimeM(totalTime))

        var left = currentTime / totalTime * ($('#ap_progress').width() - $('#ap_progress_val').width())

        $('#ap_progress_val').css('left', left)
        if (ltime > 3) {
          moveLrc();
          ltime = 0;
        }
        ltime++;
      } catch (e) { e.message }
    }

    //移动歌词
    function moveLrc() {
      if (!lrcLst || lrcLst.length == 0) return;
      var msec = getMedia().currentTime + 1;
      var found = false;
      var mv = 0;
      var sIndex = 0;
      var line_height = $('#lId0').height();
      for (var i = 0; i < lrcLst.length; i++) {
        if (found == false && msec >= lrcLst[i].timeId && (i == lrcLst.length - 1 || lrcLst[i + 1].timeId > msec)) {
          mv = i * line_height;
          sIndex = i;
          found = true;
        }
      }
      if (mv != 0) {
        if (lastLine) {
          try {
            document.getElementById("lId" + lastLine).className = '';
          } catch (e) { }
        }
        try {
          document.getElementById("lId" + sIndex).className = 'lyric_now';
        } catch (e) { }
        lastLine = sIndex;

        try {
          document.getElementById(llrcId).style.webkitTransition = "-webkit-transform 500ms ease-out";
        } catch (e) { }
        try {
          document.getElementById(llrcId).style.webkitTransform = "translate(0px," + -mv + "px) scale(1) translateZ(0px)";
        } catch (e) { }
      }
    }

    //播放
    function playSong(url) {
      getMedia().src = url;
      try { getMedia().load(); } catch (e) { };
      getMedia().play();
    }
  }
}
