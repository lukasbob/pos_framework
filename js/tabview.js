// Tab view plugin. Provides tabbed layout, and provides some fallback behaviour when tabs don't fit.
// Requires tooltips.

(function($) {
	$.fn.tabview = function(options) {
		var opts = $.extend({},$.fn.tabview.defaults,options);
		return this.each(function() {
			var $$ = $(this);
			// Support for the meta plugin
			var id = new Date() - 0,
					o = $.metadata ? $.extend({},opts, $$.metadata()) : opts,
					maxHeight = 0,
					tabs = $$.find('.tabs li'),
					dataContainer = $$.find('>.data'),
					panes = $$.find('.tabcontent'),
					selectedPane = $$.find('.tabcontent.selected'),
					abs = $$.hasClass('abs'),
					overflowList = $('<ul id="tt_tabview_' + id + '" />').appendTo($$),
					overflowItems = tabs.clone().hide().appendTo(overflowList),
					overflowButton = $('<a id="tabview_' + id + '" href="#tt_tabview_' + id + '" class="overflowBtn abs t r">+</a>')
						.hide()
						.tt({
							align: 'flushRight',
							vAlign: 'below',
							showEvent: 'click',
							delay: 0,
							fadeIn: 0,
							timeOut: 150,
							ttClass: 'dropdown',
							beforeshow: function(e) {
								e.elm.reposition();
							}
						})
						.appendTo($$),
					hiddenTabs = 0,
					hidden = [];
			
			
			
			panes.each(function() {
				var currHeight = $(this).outerHeight();
				maxHeight = currHeight > maxHeight ? currHeight : maxHeight;
				if ( !abs ) { $(this).addClass('abs t r b l').hide(); }
				else { $(this).hide(); }
			});
			
			if ( !abs ) {
				dataContainer.css({
					position: 'relative',
					height: maxHeight + 15
				});
			}
			
			var padR = tabs.parent().css('paddingLeft').split('px');
			var tabsW = tabs.outerWidth();
			
			tabs.each(function(i) {
				var isLocal = $(this).find('a').attr('href').indexOf('#') === 0 ? true : false;
				//Assuming everything is local anchors
				var tab = $(this),
						l = tab.find('a'),
						currPane = isLocal ? $(l.attr('href')) : $('<div class="tabcontent" id="tab_' + i + '"/>').appendTo(dataContainer),
						tabWidth = tabsW * (i+1) + parseFloat(padR);
				hidden[i] = false;
				  
				if ( tab.hasClass('selected') ) {
					currPane.show();
				}
				
				tab.bind('resize', function() { positionTabs(i) });
				$(document).ready(function() { positionTabs(i) });
				
				l.add(overflowItems.eq(i)).bind('click', function() {
					if ( tab.hasClass('selected') ) { return false; }	
									
					tab.add(overflowItems.eq(i)).addClass('selected').siblings().removeClass('selected');
					
					if (!isLocal && !tab.loaded) {
						$.get(l.attr('href'), function(data) {
							currPane.html(data);
							init(currPane);
							tab.loaded = true;
						});
					}
					if (selectedPane.length === 0) {
						selectedPane = currPane;
						return false;
					};
					selectedPane.fadeOut(o.crossfade, function() {
						currPane.fadeIn(o.crossfade);
						selectedPane = currPane;
						$(window).trigger('resize');
					});
					return false;
				});
				function positionTabs(i) {
					if ($$.width() < tabWidth + o.overflowButtonWidth) {
						// if ( hidden[i] ) { return; };
						tab.hide();
						hidden[i] = true;
						overflowItems.eq(i).show();
						if ( hiddenTabs === 0 ) { overflowButton.show(); }
						hiddenTabs++;
					} else if ( hidden[i] ) {
						tab.show();
						hidden[i] = false;
						overflowItems.eq(i).hide();
						hiddenTabs--;
						if ( hiddenTabs === 0 ) { overflowButton.hide(); }
					}
				}
			});
			$(window).resize(function() {
				$$.find('.tabs li').trigger('resize');
			});
		});
	};
	//Defaults
	$.fn.tabview.defaults = {	
		crossfade: 100,
		overflowButtonWidth: 29
	};
})(jQuery);