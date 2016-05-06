/* author laolizi */
(function (factory) {
	// UMD start
	// https://github.com/umdjs/umd/blob/master/jqueryPluginCommonjs.js
	//hard code set false, because the f**kin mod.js v1.0.0
	if (false && typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['jquery'], factory);
	} else if (typeof module === 'object' && module.exports) {
		// Node/CommonJS
		module.exports = function( root, jQuery ) {
			if ( jQuery === undefined ) {
				// require('jQuery') returns a factory that requires window to
				// build a jQuery instance, we normalize how we use modules
				// that require this pattern but the window provided is a noop
				// if it's defined (how jquery works)
				if ( typeof window !== 'undefined' ) {
					jQuery = require('jquery');
				}
				else {
					jQuery = require('jquery')(root);
				}
			}
			factory(jQuery);
			return jQuery;
		};
	} else {
		// Browser globals
		factory(jQuery);
	}
}(function ($) {
	$.notificationOptions = {
		className: '',
		click: function() {},
		content: '',
		duration: 5000,
		fadeIn: 400,
		fadeOut: 600,
		limit: 2,
		queue: true,
		slideUp: 200,
		horizontal: 'right',
		vertical: 'top',
		min:1,
    afterShow: function(){},
    afterClose: function(){}
	};

	var Notification = function(board, options) {
		var that = this;
		// build notification template
		var htmlElement = options.$el;
		htmlElement.addClass('notification');
		// getter for template
		this.getHtmlElement = function() {
			return htmlElement;
		};
		// custom hide
		this.hide = function() {
			htmlElement.addClass('hiding');
			htmlElement.animate({ opacity: .01 }, options.fadeOut, function() {
				var queued = queue.shift();
				if (queued) {
					$.createNotification(queued);
				}
			});
			htmlElement.slideUp(options.slideUp, function() {
				$(this).remove();
        options.afterClose();
			});
		};
		// show in board
		this.show = function() {
			// append to board and show
			htmlElement[options.vertical == 'top' ? 'appendTo' : 'prependTo'](board);
			htmlElement.fadeIn(options.fadeIn, options.afterShow());
		};
		// set custom click callback
		htmlElement.on('click', function() {
			options.click.apply(that);
		});
		// helper classes to avoid hide when hover
		htmlElement.on('mouseenter', function() {
			htmlElement.addClass('hover');
			if (htmlElement.hasClass('hiding')) {
				// recover
				htmlElement.stop(true);
				// reset slideUp, could not find a better way to achieve this
				htmlElement.attr('style', 'opacity: ' + htmlElement.css('opacity'));
				htmlElement.animate({ opacity: 1 }, options.fadeIn);
				htmlElement.removeClass('hiding');
				htmlElement.addClass('pending');
			}
		});
		htmlElement.on('mouseleave', function() {
			if (htmlElement.hasClass('pending')) {
				// hide was pending
				that.hide();
			}
			htmlElement.removeClass('hover');
		});
		// close button bind
		htmlElement.children('.notify-close').on('click', function() {
			that.hide();
		});
		if (options.duration) {
			// hide timer
			setTimeout(function() {
				if (htmlElement.hasClass('hover')) {
					// hovering, do not hide now
					htmlElement.addClass('pending');
				} else {
					that.hide();
				}
			}, options.duration);
		}
		return this;
	};

	var queue = [];

	$.createNotification = function(options) {
		options = $.extend({}, $.notificationOptions, options || {});
		// get notification container (aka board)
		var $board = $('.laolizi-Barbapapa');
		if (!$board.length) {
			board = $('<div class="laolizi-Barbapapa" />');
			board.css({
				'position': 'fixed',
			    'z-index': '9999',
			    'width':'250px',
			    'top':0,
			    'left': '0px',
				'right': '0px',
				'margin-left':'auto',
				'margin-right':'auto'
			});

			board.appendTo('body');
		}
		if (options.limit && board.children('.notification:not(.hiding)').length >= options.limit) {
			// limit reached
			if (options.queue) {
				queue.push(options);
			}
			return;
		}
		// create new notification and show
		var notification = new Notification(board, options)
		notification.show(board);
		return notification;
	};

}));
