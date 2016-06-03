(function (window, undefined) {
  var document = window.document,
    support = {
      transform3d: ("WebKitCSSMatrix" in window && "m11" in new WebKitCSSMatrix()),
      touch: ("ontouchstart" in window)
    };

  function getTranslate(x, y) {
    var distX = x,
      distY = y;
    return support.transform3d ? "translate3d(" + distX + "px, " + distY + "px, 0)" : "translate(" + distX + "px, " + distY + "px)";
  }

  function getPage(event, page) {
    return support.touch ? event.changedTouches[0][page] : event[page];
  }

  var ImagesZoom = function () {
  };

  ImagesZoom.prototype = {
    // ç»™åˆå§‹åŒ–æ•°æ®
    init: function (param) {
      var self = this,
        params = param || {};

      var imgList = document.querySelectorAll(params.elem + " img"),
        zoomMask = document.querySelector(".imgzoom_pack"),
        zoomImg = document.querySelector(".imgzoom_pack .imgzoom_img img"),
        zoomClose = document.querySelector(".imgzoom_pack .imgzoom_x"),
        imgSrc = "";

      self.buffMove = 3; //ç¼“å†²ç³»æ•°
      self.buffScale = 2; //æ”¾å¤§ç³»æ•°
      self.finger = false; //è§¦æ‘¸æ‰‹æŒ‡çš„çŠ¶æ€ falseï¼šå•æ‰‹æŒ‡ trueï¼šå¤šæ‰‹æŒ‡

      self._destroy();

      zoomClose.addEventListener("click", function () {
        zoomMask.style.cssText = "display:none";
        zoomImg.src = "";
        zoomImg.style.cssText = "";

        self._destroy();

        document.removeEventListener("touchmove", self.eventStop, false);
      }, false);

      for (var len = imgList.length, i = 0; i < len; i++) {
        imgList[i].addEventListener("click", function () {
          imgSrc = this.getAttribute("src");
          zoomMask.style.cssText = "display:block";
          zoomImg.src = imgSrc;

          zoomImg.onload = function () {
            zoomImg.style.cssText = "margin-top:-" + (zoomImg.offsetHeight / 2) + "px";

            // ç¦æ­¢é¡µé¢æ»šåŠ¨
            document.addEventListener("touchmove", self.eventStop, false);

            self.imgBaseWidth = zoomImg.offsetWidth;
            self.imgBaseHeight = zoomImg.offsetHeight;

            self.addEventStart({
              wrapX: zoomMask.offsetWidth,
              wrapY: zoomMask.offsetHeight,
              mapX: zoomImg.width,
              mapY: zoomImg.height
            });
          }
        }, false);
      }
    },
    addEventStart: function (param) {
      var self = this,
        params = param || {};

      self.element = document.querySelector(".imgzoom_pack img");

      //config set
      self.wrapX = params.wrapX || 0; //å¯è§†åŒºåŸŸå®½åº¦
      self.wrapY = params.wrapY || 0; //å¯è§†åŒºåŸŸé«˜åº¦
      self.mapX = params.mapX || 0; //åœ°å›¾å®½åº¦
      self.mapY = params.mapY || 0; //åœ°å›¾é«˜åº¦

      self.outDistY = (self.mapY - self.wrapY) / 2; //å›¾ç‰‡è¶…è¿‡ä¸€å±çš„æ—¶å€™æœ‰ç”¨

      self.width = self.mapX - self.wrapX; //åœ°å›¾çš„å®½åº¦å‡åŽ»å¯è§†åŒºåŸŸçš„å®½åº¦
      self.height = self.mapY - self.wrapY; //åœ°å›¾çš„é«˜åº¦å‡åŽ»å¯è§†åŒºåŸŸçš„é«˜åº¦

      self.element.addEventListener("touchstart", function (e) {
        self._touchstart(e);
      }, false);
      self.element.addEventListener("touchmove", function (e) {
        self._touchmove(e);
      }, false);
      self.element.addEventListener("touchend", function (e) {
        self._touchend(e);
      }, false);
    },
    // é‡ç½®åæ ‡æ•°æ®
    _destroy: function () {
      this.distX = 0;
      this.distY = 0;
      this.newX = 0;
      this.newY = 0;

    },
    // æ›´æ–°åœ°å›¾ä¿¡æ¯
    _changeData: function () {
      this.mapX = this.element.offsetWidth; //åœ°å›¾å®½åº¦
      this.mapY = this.element.offsetHeight; //åœ°å›¾é«˜åº¦
      // this.outDistY = (this.mapY - this.wrapY)/2; //å½“å›¾ç‰‡é«˜åº¦è¶…è¿‡å±å¹•çš„é«˜åº¦æ—¶å€™ã€‚å›¾ç‰‡æ˜¯åž‚ç›´å±…ä¸­çš„ï¼Œè¿™æ—¶ç§»åŠ¨æœ‰ä¸ªé«˜åº¦åšä¸ºç¼“å†²å¸¦
      this.width = this.mapX - this.wrapX; //åœ°å›¾çš„å®½åº¦å‡åŽ»å¯è§†åŒºåŸŸçš„å®½åº¦
      this.height = this.mapY - this.wrapY; //åœ°å›¾çš„é«˜åº¦å‡åŽ»å¯è§†åŒºåŸŸçš„é«˜åº¦
    },
    _touchstart: function (e) {
      var self = this;

      self.tapDefault = false;
      // self.tapDefaultY = false;

      e.preventDefault();

      var touchTarget = e.targetTouches.length; //èŽ·å¾—è§¦æŽ§ç‚¹æ•°

      self._changeData(); //é‡æ–°åˆå§‹åŒ–å›¾ç‰‡ã€å¯è§†åŒºåŸŸæ•°æ®ï¼Œç”±äºŽæ”¾å¤§ä¼šäº§ç”Ÿæ–°çš„è®¡ç®—

      if (touchTarget == 1) {
        // èŽ·å–å¼€å§‹åæ ‡
        self.basePageX = getPage(e, "pageX");
        self.basePageY = getPage(e, "pageY");

        self.finger = false;
      } else {
        self.finger = true;

        self.startFingerDist = self.getTouchDist(e).dist;
        self.startFingerX = self.getTouchDist(e).x;
        self.startFingerY = self.getTouchDist(e).y;
      }
      /*console.log("pageX: " + getPage(e, "pageX"));
       console.log("pageY: " + getPage(e, "pageY"));*/
    },
    _touchmove: function (e) {
      var self = this;
      self.tapDefault = true;
      e.preventDefault();
      e.stopPropagation();

      // console.log("event.changedTouches[0].pageY: " + event.changedTouches[0].pageY);

      var touchTarget = e.targetTouches.length; //èŽ·å¾—è§¦æŽ§ç‚¹æ•°

      if (touchTarget == 1 && !self.finger) {

        self._move(e);
      }

      if (touchTarget >= 2) {
        self._zoom(e);
      }
    },
    _touchend: function (e) {
      var self = this;
      console.log(self.tapDefault)

      if (!self.finger && !self.tapDefault) {
        var zoomMask = document.querySelector(".imgzoom_pack"),
          zoomImg = document.querySelector(".imgzoom_pack .imgzoom_img img");
        zoomMask.style.cssText = "display:none";
        zoomImg.src = "";
        zoomImg.style.cssText = "";

        self._destroy();

        document.removeEventListener("touchmove", self.eventStop, false);
        return
      }
      ;
      self._changeData(); //é‡æ–°è®¡ç®—æ•°æ®
      if (self.finger) {
        self.distX = -self.imgNewX;
        self.distY = -self.imgNewY;
      }

      if (self.distX > 0) {
        self.newX = 0;
      } else if (self.distX <= 0 && self.distX >= -self.width) {
        self.newX = self.distX;
        self.newY = self.distY;
      } else if (self.distX < -self.width) {
        self.newX = -self.width;
      }


      self.reset();
    },
    _move: function (e) {

      var self = this,
        pageX = getPage(e, "pageX"), //èŽ·å–ç§»åŠ¨åæ ‡
        pageY = getPage(e, "pageY");

      // ç¦æ­¢é»˜è®¤äº‹ä»¶
      // e.preventDefault();
      // e.stopPropagation();

      /*self.tapDefaultX = pageX - self.basePageX;
       self.tapDefaultY = pageY - self.basePageY;*/
      // èŽ·å¾—ç§»åŠ¨è·ç¦»
      self.distX = (pageX - self.basePageX) + self.newX;
      self.distY = (pageY - self.basePageY) + self.newY;

      if (self.distX > 0) {
        self.moveX = Math.round(self.distX / self.buffMove);
      } else if (self.distX <= 0 && self.distX >= -self.width) {
        self.moveX = self.distX;
      } else if (self.distX < -self.width) {
        self.moveX = -self.width + Math.round((self.distX + self.width) / self.buffMove);
      }
      self.movePos();
      self.finger = false;
    },
    // å›¾ç‰‡ç¼©æ”¾
    _zoom: function (e) {
      var self = this;
      // e.preventDefault();
      // e.stopPropagation();

      var nowFingerDist = self.getTouchDist(e).dist, //èŽ·å¾—å½“å‰é•¿åº¦
        ratio = nowFingerDist / self.startFingerDist, //è®¡ç®—ç¼©æ”¾æ¯”
        imgWidth = Math.round(self.mapX * ratio), //è®¡ç®—å›¾ç‰‡å®½åº¦
        imgHeight = Math.round(self.mapY * ratio); //è®¡ç®—å›¾ç‰‡é«˜åº¦

      // è®¡ç®—å›¾ç‰‡æ–°çš„åæ ‡
      self.imgNewX = Math.round(self.startFingerX * ratio - self.startFingerX - self.newX * ratio);
      self.imgNewY = Math.round((self.startFingerY * ratio - self.startFingerY) / 2 - self.newY * ratio);

      if (imgWidth >= self.imgBaseWidth) {
        self.element.style.width = imgWidth + "px";
        self.refresh(-self.imgNewX, -self.imgNewY, "0s", "ease");
        self.finger = true;
      } else {
        if (imgWidth < self.imgBaseWidth) {
          self.element.style.width = self.imgBaseWidth + "px";
        }
      }

      self.finger = true;
    },
    // ç§»åŠ¨åæ ‡
    movePos: function () {
      var self = this;

      if (self.height < 0) {
        if (self.element.offsetWidth == self.imgBaseWidth) {
          self.moveY = Math.round(self.distY / self.buffMove);
          // console.log(self.moveY +"111")
        } else {
          var moveTop = Math.round((self.element.offsetHeight - self.imgBaseHeight) / 2);
          self.moveY = -moveTop + Math.round((self.distY + moveTop) / self.buffMove);
          // console.log(self.moveY +"222")
        }
      } else {
        var a = Math.round((self.wrapY - self.imgBaseHeight) / 2),
          b = self.element.offsetHeight - self.wrapY + Math.round(self.wrapY - self.imgBaseHeight) / 2;

        if (self.distY >= -a) {
          self.moveY = Math.round((self.distY + a) / self.buffMove) - a;
          // console.log(self.moveY +"333")
        } else if (self.distY <= -b) {
          self.moveY = Math.round((self.distY + b) / self.buffMove) - b;
          // console.log(self.moveY +"444")
        } else {
          self.moveY = self.distY;
          // console.log(self.moveY +"555")
        }
      }
      self.refresh(self.moveX, self.moveY, "0s", "ease");
    },
    // é‡ç½®æ•°æ®
    reset: function () {
      var self = this,
        hideTime = ".2s";
      if (self.height < 0) {
        self.newY = -Math.round(self.element.offsetHeight - self.imgBaseHeight) / 2;
      } else {
        var a = Math.round((self.wrapY - self.imgBaseHeight) / 2),
          b = self.element.offsetHeight - self.wrapY + Math.round(self.wrapY - self.imgBaseHeight) / 2;

        if (self.distY >= -a) {
          self.newY = -a;
        } else if (self.distY <= -b) {
          self.newY = -b;
        } else {
          self.newY = self.distY;
        }
      }
      self.refresh(self.newX, self.newY, hideTime, "ease-in-out");
    },
    // æ‰§è¡Œå›¾ç‰‡ç§»åŠ¨
    refresh: function (x, y, timer, type) {
      this.element.style.webkitTransitionProperty = "-webkit-transform";
      this.element.style.webkitTransitionDuration = timer;
      this.element.style.webkitTransitionTimingFunction = type;
      this.element.style.webkitTransform = getTranslate(x, y);
    },
    // èŽ·å–å¤šç‚¹è§¦æŽ§
    getTouchDist: function (e) {
      var x1 = 0,
        y1 = 0,
        x2 = 0,
        y2 = 0,
        x3 = 0,
        y3 = 0,
        result = {};

      x1 = e.touches[0].pageX;
      x2 = e.touches[1].pageX;
      y1 = e.touches[0].pageY - document.body.scrollTop;
      y2 = e.touches[1].pageY - document.body.scrollTop;

      if (!x1 || !x2) return;

      if (x1 <= x2) {
        x3 = (x2 - x1) / 2 + x1;
      } else {
        x3 = (x1 - x2) / 2 + x2;
      }
      if (y1 <= y2) {
        y3 = (y2 - y1) / 2 + y1;
      } else {
        y3 = (y1 - y2) / 2 + y2;
      }

      result = {
        dist: Math.round(Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))),
        x: Math.round(x3),
        y: Math.round(y3)
      };
      return result;
    },
    eventStop: function (e) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  window.ImagesZoom = new ImagesZoom();
})(this);
/*  |xGv00|e265149d8101b256799ca6fa116fac35 */
