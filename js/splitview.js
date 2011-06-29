(function($) {
	$.fn.splitview = function(options) {
		var opts = $.extend({},$.fn.splitview.defaults,options);
		return this.each(function() {
			$this = $(this);
			// Support for the meta plugin
			o = $.metadata ? $.extend({},opts, $this.metadata()) : opts;

			$(this).data('svOptions', o);
			var sv = $(this),
					panes = sv.find('>.pane'),
					svId = sv.attr('id'),
					axis = sv.hasClass('vert') ? 'x' : 'y',
					offset = sv.offset(),
					containment = [
						offset.left + o.margin.left, 
						offset.top + o.margin.top,  
						offset.left + sv.width() - o.margin.right, 
						offset.top + sv.height() - o.margin.bottom
					];
			$(sv).find('>.drag').data('splitview', sv).draggable({
				axis: axis,
				containment: containment,
				drag: function(e, ui) {
					var pos = ui.position;									
					if (axis === 'x') {							
						panes.eq(0).css({width: pos.left});
						panes.eq(1).css({left: pos.left});	
					} else {
						panes.eq(0).css({height: pos.top});
						panes.eq(1).css({top: pos.top});
					}
				},
				stop: function(e, ui) {
					$('.drag').trigger('resize');
					//Save current split state somehow 
				}
			}).bind('resize', function() {					
				var sv = $(this).data('splitview'),
						offset = sv.offset(),
						o = sv.data('svOptions'),
						containment = [
							offset.left + o.margin.left, 
							offset.top + o.margin.top,
							offset.left + sv.width() - o.margin.right, 
							offset.top + sv.height() - o.margin.bottom
						];
				$(this).draggable('option', 'containment', containment);	
			});
		});
	};
	
	//Defaults
	$.fn.splitview.defaults = {
		margin: {
			top: 100,
			right: 100,
			bottom: 100,
			left: 100
		}
	};
})(jQuery);