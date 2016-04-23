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