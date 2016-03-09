/**
 * 拖拽类，对外抛出一个方法
 * @return {[type]} [description]
 */
window.startDrag = (function () {
    var params = {
        left: 0,
        top: 0,
        currentX: 0,
        currentY: 0,
        flag: false
    };
    //获取相关CSS属性
    var getCss = function (o, key) {
        return o.currentStyle ? o.currentStyle[key] : document.defaultView.getComputedStyle(o, false)[key];
    };

    /**
     * 拖拽的实现
     * @param  {[type]}   bar      [拖拽栏]
     * @param  {[type]}   target   [拖拽目标，如果没有拖拽栏，则设置 bar 和 callback]
     * @param  {Function} callback [拖拽的回调函数]
     * @return {[type]}            [description]
     */
    var startDrag = function (bar, target, callback) {
        switch (arguments.length) {
        case 1:
            target = bar;
            break;
        case 2:
            callback = target;
            target = bar;
            break;
        default:
            // statements_def
            break;
        }
        if (getCss(target, "left") !== "auto") {
            params.left = getCss(target, "left");
        }
        if (getCss(target, "top") !== "auto") {
            params.top = getCss(target, "top");
        }
        //o是移动对象
        bar.onmousedown = function (event) {
            params.flag = true;
            if (!event) {
                event = window.event;
                //防止IE文字选中
                bar.onselectstart = function () {
                    return false;
                }
            }
            var e = event;
            params.currentX = e.clientX;
            params.currentY = e.clientY;
        };
        document.onmouseup = function () {
            params.flag = false;
            if (getCss(target, "left") !== "auto") {
                params.left = getCss(target, "left");
            }
            if (getCss(target, "top") !== "auto") {
                params.top = getCss(target, "top");
            }
            if (typeof callback == "function") {
                // 返回移动控件的左上角坐标
                callback(parseInt(params.left), parseInt(params.top));
            }
        };
        document.onmousemove = function (event) {
            var e = event ? event : window.event;
            if (params.flag) {
                var nowX = e.clientX,
                    nowY = e.clientY;
                var disX = nowX - params.currentX,
                    disY = nowY - params.currentY;
                target.style.left = parseInt(params.left) + disX + "px";
                target.style.top = parseInt(params.top) + disY + "px";
            }
        }
    };

    return startDrag;
})();
