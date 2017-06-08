/***************************************************
 * 时间: 8/14/16 13:12
 * 作者: zhongxia
 * 说明: 拖拽的类库
 ***************************************************/
/**
 * 拖动
 * @param selector 需要拖动的选择器
 * @param callback 移动的回调
 * @param moveFlag 是否需要移动
 * @constructor
 */
function Drag(selector, callback, moveFlag) {
	moveFlag = moveFlag || false;
	this.dianduSize = 72;
	this.selector = selector;
	this.$selector = $(selector);

	this.callback = callback;

	//获取屏幕寛高，防止点读位移除背景图
	this.$container = this.$selector.parent();
	this.w = this.$container.width();
	this.h = this.$container.height();
	this.params = {
		left: 0,
		top: 0,
		currentX: 0,
		currentY: 0,
		flag: false
	};

  /**
   * 拖拽的实现
   */
	this.startDrag = function () {
		var that = this;

		that.$selector.on('mousedown', function (e) {
			if (e.target.tagName === 'INPUT') {
				return
			}
			e.preventDefault();
			e.stopPropagation();

			that.params.flag = true;
			that.params.currentX = e.clientX;
			that.params.currentY = e.clientY;

			that.params.left = that.$selector.css('left').replace('px', '');
			that.params.top = that.$selector.css('top').replace('px', '');

			$(document).on('mouseup', function () {
				$(document).off()
				that.params.flag = false;
				that.params.left = that.$selector.css('left');
				that.params.top = that.$selector.css('top');
				if (!moveFlag) {
					that.callback && that.callback(parseInt(that.params.left), parseInt(that.params.top));
				}
			});

			$(document).on('mousemove', function (e) {
				e.preventDefault();
				e.stopPropagation();
				if (that.params.flag) {
					var nowX = e.clientX;
					var nowY = e.clientY;
					var disX = nowX - that.params.currentX;
					var disY = nowY - that.params.currentY;

					// 限制点读位不能超出背景图  START
					var x = parseInt(that.params.left) + disX;
					var y = parseInt(that.params.top) + disY;

					if (x < 0) {
						x = 0;
					}
					if (y < 0) {
						y = 0;
					}
					//if (x > that.w - that.dianduSize) {
					//  x = that.w - that.dianduSize;
					//}
					//if (y > that.h - that.dianduSize) {
					//  y = that.h - that.dianduSize;
					//}
					// 限制点读位不能超出背景图  END

					//移动图片
					if (!moveFlag) {
						that.$selector.css({
							left: x,
							top: y
						})
					}
					//不移动图片,主要做,左下角下拉,父容器大小改变
					else {
						var newX = parseInt(that.params.left) + disX;
						var newY = parseInt(that.params.top) + disY;
						callback && callback(newX, newY, e)
					}
				}
			})
		});
	};

	//启动拖拽
	this.startDrag();
}
