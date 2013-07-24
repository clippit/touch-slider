/* global Zepto:false, console:false */

(function ($) {
  'use strict';

  var methods = {

    init: function (options) {
      var settings = $.extend({
        images: '.slider-images',
        title: '.slider-title',
        indicators: '.slider-indicators'
      }, options);

      var touchstart = 'touchstart',
        touchmove = 'touchmove',
        touchend = 'touchend',
        isTouchDevice = true;
      // Not a touch device
      if (!('ontouchstart' in window)) {
        touchstart = 'mousedown';
        touchmove = 'mousemove';
        touchend = 'mouseup';
        isTouchDevice = false;
      }

      var $this = this;
      var images = $(settings.images, $this);
      var title = $(settings.title, $this);
      var indicators = $(settings.indicators, $this);
      var imgs = images.find('img');
      var imgWidth = imgs[0].width;
      var imgsLen = imgs.length;
      var current = 0;
      var leftBase = $this.offset().left;
      var sliderOffset = 0;
      var touchstartX = 0;
      var fastMove = true;
      var fastMoveTimer;

      // Init transform of images and slider
      $('li', images).each(function (index, item) {
        item.style.transform = item.style.webkitTransform = 'translateX(' + index * imgWidth + 'px)';
      });
      methods.setSliderOffset.call(images, sliderOffset);

      // Init first title
      title.text(imgs[current].title);

      // Init indicators
      var frag = document.createDocumentFragment();
      for (var i = 0; i < imgsLen; i++) {
        frag.appendChild(document.createElement("li"));
      }
      frag.firstChild.className = 'active';
      indicators.append(frag);

      // Init events
      $this.on(touchstart, function (evt) {
        evt.preventDefault();

        // Clear transition if necessary
        images.css({
          transition: 'none',
          '-webkit-transition': 'none'
        });

        if (isTouchDevice && evt.changedTouches.length !== 1) {
          return;
        }

        var touchPoint = evt;
        if (isTouchDevice) {
          touchPoint = evt.changedTouches[0];
        }

        touchstartX = touchPoint.pageX - leftBase;
        title.css('bottom', -45);

        // If touch ends in 300ms, it's called a fast move
        fastMoveTimer = setTimeout(function () {
          fastMove = false;
        }, 300);
      });

      $this.on(touchmove, function (evt) {
        evt.preventDefault();
        if (isTouchDevice && evt.changedTouches.length !== 1) {
          return;
        }

        var touchPoint = evt;
        if (isTouchDevice) {
          touchPoint = evt.changedTouches[0];
        } else {
          // Detect if mouse is dragging
          if (touchPoint.which !== 1) {
            return;
          }
        }

        var offset = touchPoint.pageX - leftBase - touchstartX;

        // If move to the edge, set damping y=x^0.75
        if (current === 0 && offset > 0 || current === imgsLen - 1 && offset < 0) {
          var factor = offset > 0 ? 1 : -1;
          offset = factor * Math.pow(Math.abs(offset), 0.75);
        }
        sliderOffset = -current * imgWidth + offset;
        methods.setSliderOffset.call(images, sliderOffset);
      });

      $this.on(touchend, function (evt) {
        evt.preventDefault();
        if (isTouchDevice && evt.changedTouches.length !== 1) {
          return;
        }

        // Left to the first image
        if (sliderOffset > 0) {
          sliderOffset = 0;
        }

        // Use different function to determine which image to show according to fast move or not
        var touchPoint = evt;
        if (isTouchDevice) {
          touchPoint = evt.changedTouches[0];
        }
        var offset = touchPoint.pageX - leftBase - touchstartX;

        // No fast move, default
        var intFunction = Math.round;
        if (fastMove && offset > 0) {
          intFunction = Math.floor;  // Fast move to left
        } else if (fastMove && offset < 0) {
          intFunction = Math.ceil;  // Fast move to right
        }

        current = Math.min(intFunction(-sliderOffset / imgWidth), imgsLen - 1);
        sliderOffset = -current * imgWidth;

        clearTimeout(fastMoveTimer);
        fastMove = true;

        // Slide to right place
        images.css({
          transition: 'transform 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
          '-webkit-transition': '-webkit-transform 0.5s cubic-bezier(0.19, 1, 0.22, 1)'
        });

        // Once the transition ends, clear it
        images.one('transitionend', function (evt) {
          evt.target.style.transition = evt.target.style.webkitTransition = 'none';
        });
        methods.setSliderOffset.call(images, sliderOffset);

        // Show image title
        title.text(imgs[current].title);
        title.css('bottom', 0);

        // Set indicator
        indicators.find('.active').removeClass('active');
        indicators.find('li').eq(current).addClass('active');
      });
    },

    setSliderOffset: function (value) {
      var translateX = 'translateX(' + value + 'px)';
      this.css({
        transform: translateX,
        '-webkit-transform': translateX
      });
    }
  };

  $.fn.touchSlider = function () {
    methods.init.apply(this, arguments);
  };
})(Zepto);

