function Drag(bar, target, callback) {
    this.bar = bar;
    switch (arguments.length) {
    case 1:
        this.target = bar;
        break;
    case 2:
        this.callback = target;
        this.target = bar;
        break;
    }

    //获取屏幕寛高，防止点读位移除背景图
    this.w = $(bar).parent().width();
    this.h = $(bar).parent().height();

    this.params = {
        left: 0,
        top: 0,
        currentX: 0,
        currentY: 0,
        flag: false
    };

    /**
     * 获取相关CSS属性[公用的]
     * @param  {[type]} o   [对象]
     * @param  {[type]} key [样式名]
     * @return {[type]}     [description]
     */
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
    this.startDrag = function () {
        var that = this;

        if (getCss(that.target, "left") !== "auto") {
            that.params.left = getCss(that.target, "left");
        }
        if (getCss(that.target, "top") !== "auto") {
            that.params.top = getCss(that.target, "top");
        }
        //o是移动对象
        that.bar.onmousedown = function (event) {
            that.params.flag = true;
            if (!event) {
                event = window.event;
                //防止IE文字选中
                that.bar.onselectstart = function () {
                    return false;
                }
            }
            var e = event;
            that.params.currentX = e.clientX;
            that.params.currentY = e.clientY;

            document.onmouseup = function () {
                that.params.flag = false;
                if (getCss(that.target, "left") !== "auto") {
                    that.params.left = getCss(that.target, "left");
                }
                if (getCss(that.target, "top") !== "auto") {
                    that.params.top = getCss(that.target, "top");
                }
                if (typeof that.callback == "function") {
                    // 返回移动控件的左上角坐标
                    that.callback(parseInt(that.params.left), parseInt(that.params.top));
                }
            };
            document.onmousemove = function (event) {
                var e = event ? event : window.event;
                if (that.params.flag) {
                    var nowX = e.clientX,
                        nowY = e.clientY;
                    var disX = nowX - that.params.currentX,
                        disY = nowY - that.params.currentY;

                    // 在不需要这个功能的话，只能注释掉就可以了
                    // 限制点读位不能超出背景图  START
                    var x = parseInt(that.params.left) + disX;
                    var y = parseInt(that.params.top) + disY;
                    if (x < 0) {
                        x = 0;
                    }
                    if (y < 0) {
                        y = 0;
                    }
                    if (x > that.w - 100) {
                        x = that.w - 100;
                    }
                    if (y > that.h - 100) {
                        y = that.h - 100;
                    }
                    // 限制点读位不能超出背景图  END

                    that.target.style.left = x + "px";
                    that.target.style.top = y + "px";
                }
            }
        };

    };

    //启动拖拽
    this.startDrag();
}
