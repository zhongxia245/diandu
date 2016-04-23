/*
 * [最原始的功能,后期删掉了一些不必要的功能,该版本针对PC端]
 * 进度条组件[支持PC,原生JS]
 * */
// 构造函数
function SlideBar(data) {
    var _this = this;
    var oActionBlock = document.getElementById(data.actionBlock);
    var oActionBar = document.getElementById(data.actionBar);

    var barLength = data.barLength;
    var maxNumber = data.maxNumber * 90 / 73;  //底图的比例,超过这个比例,则是关闭自动播放

    var callback = data.callback;

    var oShowArea = null;

    // is show slide value
    if (data.showArea) {
        oShowArea = document.getElementById(data.showArea);

        if (oShowArea) {
            _this.drag(oActionBlock, oActionBar, maxNumber, barLength, oShowArea, callback);
        } else {
            _this.drag(oActionBlock, oActionBar, maxNumber, barLength);
        }
    }

}

SlideBar.prototype = {
    /*  鼠标按着拖动滑动条   */
    drag: function (actionBlock, actionBar, total, barLength, showArea, callback) {
        /*  参数分别是点击滑动的那个块,滑动的距离,滑动条的最大数值,显示数值的地方(输入框)   */
        actionBlock.onmousedown = function (ev) {
            var ev = ev || event;
            var thisBlock = this;
            var disX = ev.clientX;
            var currentLeft = thisBlock.offsetLeft;

            document.onmousemove = function (ev) {
                var ev = ev || event;
                var left = ev.clientX - disX;

                //if (currentLeft + left <= (barLength - thisBlock.offsetWidth / 2) && currentLeft + left >= 0 - thisBlock.offsetWidth / 2) {
                if (currentLeft + left <= (barLength - thisBlock.offsetWidth) && currentLeft + left >= 0 - thisBlock.offsetWidth / 2) {
                    thisBlock.style.left = currentLeft + left + 'px';
                    actionBar.style.width = currentLeft + left + (actionBlock.offsetWidth / 2) + 'px';

                    if (showArea) {
                        var value = Math.round(actionBar.offsetWidth / barLength * total);
                        callback && callback(value);
                        showArea.value = value;
                    }
                }
                return false;
            }

            document.onmouseup = function () {
                document.onmousemove = document.onmouseup = null;
            }

            return false;
        }
    },

    getStyle: function (obj, attr) {
        return obj.currentStyle ? obj.currentStyle[attr] : getComputedStyle(obj)[attr];
    }
}
