/**********************************************
 * 时间:2016-04-23 22:33:16
 * 作者:zhongxia
 * 功能:[统一管理][依赖Jquery]
 * 所有Ajax 相关的操作,都在这里执行
 **********************************************/
window.Model = (function ($) {
    //接口地址
    var URL = {
        base: 'http://dev.catics.org/edu/course/api.php',
        save: 'save_touch_page',
        get: 'get_touch_page_data'
    };

    var teamid = 3000;      //新增点读页的时候,需要传 小组ID,开发用3000

    /**
     * 提交点读数据
     */
    function addDianduPage(data, callback) {
        //小组ID，开发用3000
        data.teamid = teamid;
        var dataStr = JSON.stringify(data);
        $.post(URL.base, {action: URL.save, data: dataStr}, function (result) {
            console.log('result', result);
            callback(result);
        });
    }

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

    return {
        getList: getList,
        addDianduPage: addDianduPage
    }
})($);