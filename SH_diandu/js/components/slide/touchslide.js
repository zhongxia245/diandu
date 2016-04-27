/*
 * 进度条组件[支持PC,移动端,使用 zepto]
 * */

// 构造函数
function SlideBar(data) {
    this.data = data;
    this.entireBar = data.entireBar || 'entire-bar';
    this.actionBlock = data.actionBlock || 'action-block';
    this.scrollBar = data.scrollBar || 'scroll-bar';
    this.callback = data.callback;
    this.barLength = data.barLength || 900;
    this.maxNumber = (data.maxNumber || 100) * 90 / 70;  //底图的比例,超过这个比例,则是关闭自动播放
    this.data = data;
    this.scale = data.barLength / 900; //缩放的比例
    this.value = data.value || 110;

    this.useScale();
    this.setValue(this.value)
    this.touchDrag();

}

SlideBar.prototype = {
    touchDrag: function () {
        var that = this;
        var moveX, startX;
        $(document).on("touchstart", "#" + that.data.actionBlock, function (event) {
            var $tar = $(event.target);
            if ($tar.attr('id') == that.actionBlock) {
                var touchPros = event.touches[0];
                startX = touchPros.clientX - event.target.offsetLeft;
            }
            return false;
        }).on("touchmove", "#" + that.actionBlock, function (event) {
            if ($(event.target).attr('id') == that.actionBlock) {
                var target = event.target;
                var touchPros = event.touches[0];

                moveX = touchPros.clientX - startX;

                if (moveX < 0) moveX = 0;
                if (moveX > target.parentNode.offsetWidth - target.offsetWidth) moveX = target.parentNode.offsetWidth - target.offsetWidth;
                $('#' + that.actionBlock).css('left', moveX)

                that.value = Math.round((target.offsetLeft) / (that.barLength - target.offsetWidth) * that.maxNumber);
                that.value = that.value === 0 ? 1 : that.value;
                that.callback && that.callback(that.value, that);
            }
        });
    },

    setValue: function (value) {
        var $block = $('#' + this.actionBlock);
        var _left = this.barLength / this.maxNumber * value;
        $block.css('left', _left);
        this.callback && this.callback(value);
    },

    getStyle: function (obj, attr) {
        return obj.currentStyle ? obj.currentStyle[attr] : getComputedStyle(obj)[attr];
    },

    useScale: function () {
        console.log("scalue", this.scale)
        var size = 122 * this.scale;
        var entireW = 900 * this.scale;
        var entireH = 46 * this.scale;
        var _fontSize = 50 * this.scale;

        var _top = -((size - entireH) / 2);
        $('#' + this.actionBlock).css({
            width: size,
            height: size,
            lineHeight: size + "px",
            top: _top,
            fontSize: _fontSize
        })

        $('#' + this.entireBar).css({
            width: entireW,
            height: entireH
        })

        $('#' + this.scrollBar).css({
            width: entireW,
            height: 100 * this.scale
        })

    }
}

