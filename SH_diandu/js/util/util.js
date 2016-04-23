/**
 * 提供一些常用工具
 * @type {{getImageWH, getQueryStringByName}}
 */
window.Util = (function () {
    /**
     * 根据URL,获取文件的宽高
     * @param  {[type]}   src      [description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    function getImageWH(src, callback) {
        var image = new Image();
        image.src = src;
        image.onload = function () {
            var obj = {
                w: image.width,
                h: image.height
            }
            callback && callback(obj);
        };
    }

    /**
     * 根据QueryString参数名称获取值
     * @param  {[type]} key [key]
     * @return {[type]}      [description]
     */
    function getQueryStringByName(key) {
        var result = location.search.match(new RegExp("[\?\&]" + key + "=([^\&]+)", "i"));
        if (result == null || result.length < 1) {
            return "";
        }
        return result[1];
    }

    return {
        getImageWH: getImageWH,
        getQueryStringByName: getQueryStringByName,
    }
})()