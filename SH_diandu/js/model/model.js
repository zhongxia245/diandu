/**********************************************
 * 时间:2016-04-23 22:33:16
 * 作者:zhongxia
 * 功能:[统一管理][依赖Jquery]
 * 所有Ajax 相关的操作,都在这里执行
 *
 *

 评论保存接口 save_review
 参数：
 videoid: 跟get_touch_page_data的id一样，用videoid这个参数名
 replyid：如果是回复某评论，返回要回复的评论记录id（评论记录id会在评论列表中返回）
 content 评论内容
 type 评论类型
 attachment:评论附件地址，可能是图片或音频
 返回：0失败，>1成功，


 评论列表：get_review
 参数：id （跟get_touch_page_data接口用的的id一样）
 返回：评论列表，字段如下：
 userid 用户id
 truename 真实姓名
 avatar 头像
 id: 本条评论的id
 content 评论内容
 type 评论类型
 attachment:评论附件地址，可能是图片或音频
 addtime:评论时间，日期格式
 support:点赞数


 点赞接口： support
 参数：id （跟get_touch_page_data接口用的的id一样）
 返回，0失败，1成功


 删除评论 接口 del_review
 参数是评论的id
 **********************************************/
window.Model = (function ($) {
  //接口地址
  var URL = {
    base: '/edu/course/api.php',
    //base: 'http://dev.catics.org/edu/course/api.php',
    save: 'save_touch_page',  //创建点读
    get: 'get_touch_page_data',  //获取点读列表
    delPage: 'del_touch_page',  //删除点读页
    addComment: 'save_review',  //添加评论
    getComment: 'get_review_list',  //获取评论列表
    supportComment: 'support_review',  //点赞
    delComment: 'del_review',  //删除评论
  };

  //如何是本地的测试环境
  if (window.location.host.indexOf("localhost") !== -1 || window.location.host.indexOf('192.168') !== -1) {
    URL.base = "http://dev.catics.org/edu/course/api.php";
  }

  /**
   * 提交点读数据
   */
  function addDianduPage(data, callback) {
    var dataStr = JSON.stringify(data);
    $.post(URL.base, {action: URL.save, data: dataStr}, function (result) {
      console.log('result', result);
      callback && callback(result);
    });
  }

  /**
   * 删除点读页 [同步]
   */
  function delDianduPage(id, callback) {
    $.ajax({
      type: "POST",
      url: URL.base,
      async: false,
      data: {action: URL.delPage, id: id},
      success: function (result) {
        console.log("del success!", id)
        callback && callback(result);
      }
    });
  }

  //=====================点读展示页 START==================

  /**
   * 获取点读列表
   * @param id            点读页ID
   * @param callback      成功的回调函数
   */
  function getList(id, callback) {
    $.post(URL.base, {action: URL.get, id: id}, function (result) {
      var data = JSON.parse(result);
      callback && callback(data, id)
    });
  }

  //=====================评论功能 START==================
  /**
   * 添加评论
   * @param data          添加的参数
   * @param callback      成功的回调函数
   */
  function addComment(data, callback) {
    data.action = URL.addComment;
    $.post(URL.base, data, function (result) {
      callback && callback(result)
    });
  }

  /**
   * 删除评论
   * @param id            点读页ID
   * @param callback      成功的回调函数
   */
  function delComment(id, callback) {
    $.post(URL.base, {action: URL.delComment, id: id}, function (result) {
      callback && callback(result, id)
    });
  }

  /**
   * 获取评论列表
   * @param id            点读页ID
   * @param callback      成功的回调函数
   */
  function getComment(id, callback) {
    $.post(URL.base, {action: URL.getComment, pageid: id}, function (result) {
      if (result !== "") {
        var data = JSON.parse(result);
        callback && callback(data, id)
      }
    });
  }

  /**
   * 点赞
   * @param id            点读页ID
   * @param callback      成功的回调函数
   */
  function support(id, callback) {
    $.post(URL.base, {action: URL.supportComment, id: id}, function (result) {
      callback && callback(result, id)
    });
  }


  return {
    getList: getList,
    addDianduPage: addDianduPage,
    delDianduPage: delDianduPage,
    addComment: addComment,
    delComment: delComment,
    getComment: getComment,
    support: support,
  }
})($);