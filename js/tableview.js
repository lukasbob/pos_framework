// Table view plugin. Provides simple resizable and sortable columns.
// Requires jquery ui and tablesorter.

(function($) {
$.fn.tableview = function(options) {
  var opts = $.extend({}, $.fn.tableview.defaults, options);

  return this.each(function() {
    var $$ = $(this);

    // Support for the Metadata Plugin.
    var o = $.metadata ? $.extend({}, opts, $$.metadata()) : opts;
		var tv = $(this),
				tvWidth = tv.width(),
				tbl = tv.find('table').css({
					tableLayout: 'fixed'
				}),
				tblWidth = tbl.width();
		//Column properties
		tv.find('th').each(function(i) {
			var th = $(this),
					nextTh = th.next('th'),
					//Allow each column to specify min-width individually.
					th_o = $.metadata ? $.extend({}, o, th.metadata()) : o,
					thWidth = th.width(),
					initialPos = th.position().left + th.outerWidth(),
					txt = th.text(),
					headerMarkup = th.html(),
					abbr = th.attr('abbr'),
					switchAbbr = abbr.length > 0 ? true : false;
			
			th.wrapInner('<b></b>');
			
			if ( th.hasClass('inp') ) {
				th.addClass('{sorter: false}');
			}
			th.data('thWidth', thWidth)
				.data('initialPos', initialPos);						
			if ( !th.hasClass('res') ) { return; }			
			// Add a draghandle  to control resizable columns.			
			$('<div class="drag v"/>')
			.appendTo(tv)
			.draggable({
				axis: 'x',
				containment: [th.offset().left + th_o.minColWidth, 0, 7000, 0],
				drag: function(e, ui) {
					var d = th.data(),
							delta = d['initialPos'] - ui.position.left,
							showAbbr = false;
					th.css({
						width: d['thWidth'] - delta
					});
					tbl.css('width', tblWidth - delta);					
					if ( !switchAbbr ) { return; }
					if ( ( d['thWidth'] - delta < o.abbrThreshold ) && !showAbbr ) {						
						th.find('b').attr('title', txt).text(abbr);
						showAbbr = true;
					} else {						
						th.find('b').attr('title', '').html(headerMarkup);
						showAbbr = false;
					}
				},
				stop: function() {					
					tv.find('.drag').trigger('resize');
					tblWidth = tbl.width();
				}
			}).bind('resize', function() {
				var tw = tbl.width(),
						w = th.width();	
				th.data('thWidth', w)
					.data('initialPos', th.position().left + th.outerWidth());
				$(this).css({
					left: th.data('initialPos')
				}).draggable('option', 'containment', [th.offset().left + o.minColWidth, 0, 7000, 0]);
			}).bind('dblclick', function() {
				//Resize column to fit largest item. 
				//Set table layout to autosize, and set width to very small in order to always shrink cells without expanding other cells.
				tbl.css({
					'table-layout': 'auto',
					width: '1px'
				});
				//Remove specified width, let the table autosize the column and apply resulting width.
				th.css('width', '').css('width', th.outerWidth());
				//Revert to fixed table layout to allow overflow to clip.
				tbl.css('table-layout', 'fixed');
				//Reposition drag handles.
				tv.find('.drag').trigger('resize');
				//Save new table width for later
				tblWidth = tbl.width();
			}).css({
				left: initialPos
			});
		}).end().find('.data').bind('scroll', function(e) {
			tv.find('.drag').trigger('resize');
		});
		
		// Run cell plugins
		// Performance is not good enough currently, so disabled.
		// A bit of fluff: Animate css width of percentage bars.

		// tv.find('.bar span').each(function() {
		// 	var t = $(this).text();
		// 	$(this).css({
		// 		'width': 0,
		// 		opacity: 0
		// 	}).animate({
		// 		'width': t,
		// 		'text-indent': t,
		// 		opacity: 1
		// 	}, 100);
		// });
		
		// vs. average view. Move all these calculations to the server side.
		var perc = [];
		var max = 0;		
		var pivot_span = tv.find('.pivot span').css({width: 0, left: '50%'});		
		pivot_span.each(function(i){
			perc[i] = parseFloat($(this).text().split('%')[0]);
			max = max < Math.abs(perc[i]) ? Math.abs(perc[i]) : max; 
		});
		for (var i=0; i < perc.length; i++) {
			var indent = perc[i]/max * 20;
			if ( perc[i] > 0 ) {
				pivot_span.eq(i).addClass('pos').css({
					'text-indent': indent + '%',
					width: indent + '%'
				}, 100);
			} else {
				pivot_span.eq(i).addClass('neg').css({
					marginLeft: indent + '%',
					textIndent: '-40px',
					width: Math.abs(indent) + '%'
				}, 100);
			}
		}
		
//		 Apply tablesorter
		tbl.tablesorter();
		
		//If all data is loaded, simply use tablesorter as is. Otherwise, get data from server.
		if (!tbl.hasClass('loaded')) {
			tv.find('th').each(function(i) {
				var th = $(this);
				var dir = 0; //Initial sort direction: 0 for asc, 1 for desc.
				//IDEA: For percieved speed, prefetch asc and desc versions of the table on hover after delay?
				th.click(function() {
					th_inp = $('#' + tv.attr('id') + '_th' + (i+1));
					dir === 0 ? th_inp.val('asc') : th_inp.val('desc');
					th_inp.siblings().val('');

					var p = tv.find('form').serialize();
					$.get(o.dataUrl + '?' + p, function(data) {
						tbl.find('tbody').html(data);
						var sort = [[i,dir]];
						tbl.trigger('update');
						tbl.trigger('sorton', [sort]);
						dir = dir === 1 ? 0 : 1;
					});
				});
			});				
		}
		
		//Paging toolbar buttons
		// IDEA: For perceived speed, maybe always preload the next n rows, where n is number of items?

  });

  // private function for debugging
  function debug($obj) {
    if (window.console && window.console.log) {
      window.console.log($obj);
    }
  }
};

// default options
$.fn.tableview.defaults = {
	minColWidth: 25,
	abbrThreshold: 80,
	dataUrl: 'tables.html'
};

})(jQuery);
