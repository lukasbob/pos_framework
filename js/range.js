// Requires jQuery UI draggables.
// Recommended styling in css/range.css:
(function($) {
	/* Range plugin for creating a range slider, implementing the html5 input type=range uniformly, back to IE7.
                _
===============|_|========== <-- Range rail (.rail) and range button (.btn)
          ------^-------
          | 400 of 600 |  <-- Current position label (.lbl) and arrow/triangular marker (.arr)
          --------------

		Expects this HTML:
			<[container]>
				<input type="range" min="1" max="600" value="1">
				<p class="range_indicator">
					<span class="curr_value">1</span> of 600
				</p>
			</[container]>

		Sets up an HTML structure like this:
			<[container]>
				<input type="range" min="1" max="600" value="1">
				<p class="range_indicator">
					<span class="curr_value">1</span> of 600
					<i class="arr"></i>
				</p>
			 	<span class="range_rail">
					<a href="#" class="range_btn"></a>
				</span>
			</[container]>
	*/
	$.fn.range = function(options) {
		// build main options before element iteration
		var opts = $.extend({}, $.fn.range.defaults, options);
		// iterate and reformat each matched element
		return this.each(function() {

			var $$ = $(this),
					range = $$.find('input'),
					min = parseFloat(range.attr('min')),
					max = parseFloat(range.attr('max')),
					rail = $('<span class="rail"><a href="#" class="btn">||</a></span>').appendTo($$),
					curr_value = $$.find('.curr'),
					label = $$.find('.lbl'),
					range_btn = $$.find('.btn'),
					control_pos = $$.offset(),
					control_w = rail.outerWidth(),
					step = 180 / (max - min);

			// Set the initial label position
			label.css({
				marginLeft: 0 - label.width() / 2
			}).append('<i class="arr"/>');

			setRangeVal(range.val());

			range_btn.draggable({
				axis: 'x',
				containment: 'parent',
				start: function(e, ui) {
					label.addClass('sliding');
					opts.start(range);
				},
				drag: function(e, ui) {
					var delta = e.pageX - $$.offset().left;
					delta = delta < 0 ? 0 : delta;
					delta = delta > rail.outerWidth() ? rail.outerWidth() : delta;
					var count = Math.round(delta / step) + min;
					count = count > max ? max : count;
					range.val(count).trigger('change');
					label.css({
						left: ui.position.left,
						marginLeft: 0 - label.width() / 2 + $$.position().left
					});

					// Callback with the range input field as parameter.
					opts.drag(range);
				},
				stop: function(e, ui) {
					label.removeClass('sliding');
					// Callback with the range input field as parameter.
					opts.stop(range);
				}
			}).hover(
				function() { label.addClass('hover'); },
				function() { label.removeClass('hover'); }
			).focus(function() { //Bind keyboard event handlers when the button receives focus.
				label.addClass('sliding');
				var eventCounter = 0;
				var keyupTimer;
				range_btn.bind({
					'keydown': function(e) {
						var key = e.keyCode || e.charCode;
						// Clear keyup timer for calling the stop callback function (i.e. delay calling it until the next keyup).
						clearTimeout(keyupTimer);
						// If the key is held down, events keep firing. Count them.
						eventCounter++;
						// Gradually accelerate incrementation based on number of events fired.
						var accelerator = Math.round(Math.sqrt(eventCounter));
						// Simultaneously pressing the shift key factors the increment by an order of magnitude.
						if (e.shiftKey) {
							accelerator = accelerator * 10;
						}

						switch (key) {
							case 37: // Left arrow
							case 40: // Down arrow
								updateVal(0 - accelerator);
								break;
							case 38: // Up arrow
							case 39: // Right arrow
								updateVal(accelerator);
								break;
							default:
								break;
						}
					},
					'keyup': function(e) {
						var key = e.keyCode || e.charCode;
						if (key === 37 || key === 39) {
							//Reset the event counter.
							eventCounter = 0;
							//Only update run callback after a short delay to avoid firing callbacks on repeated keypresses.
							keyupTimer = setTimeout(stopCallback, 500);
						}
						function stopCallback() {
							opts.stop(range);
						};
					}
				});
			}).blur(function() {
				//Tear down keyboard event handlers
				range_btn.unbind('keydown').unbind('keyup');
				label.removeClass('sliding');
			});

			range.addClass('replaced').change(function() {
				// Update the label to reflect the current range value
				curr_value.html(range.val());
			});
			function updateVal(increment) {
				var curr_val = parseInt(range.val(), 10);
				// Make sure that min <= new value <= max is true
				var new_val = curr_val + increment > max ? max : curr_val + increment;
				new_val = new_val < min ? min : new_val;

				// If there is no change, do nothing.
				if (new_val === curr_val) {
					return;
				}
				setRangeVal(new_val);
				range.val(new_val).trigger('change');
			};
			function setRangeVal(value) {
				// Position the range button
				left_pos = Math.round((value - min) / (max - min) * (rail.outerWidth() - range_btn.outerWidth() - 2));
				range_btn.css('left', left_pos);
				curr_value.html(range.val());

				//Position the range label
				label.css({
					left: left_pos,
					marginLeft: 0 - label.width() / 2 + $$.position().left
				});
			};
		});
	};

	$.fn.range.defaults = {
		start: function() { return; },
		stop: function(range) {
			if (window.console) {
				// console.log(range.val());
			}
		},
		drag: function(range) { return; }
	};
})(jQuery);
