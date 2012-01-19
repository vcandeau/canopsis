/*
#--------------------------------
# Copyright (c) 2011 "Capensis" [http://www.capensis.com]
#
# This file is part of Canopsis.
#
# Canopsis is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# Canopsis is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with Canopsis.  If not, see <http://www.gnu.org/licenses/>.
# ---------------------------------
*/

if (jQuery){
	(function($) {
		var debug, options
		var vars = {}
		var widgets = 0
		
		//#########################################################################################################################
		//##  Methods declarations
		//#########################################################################################################################

		var methods = {

			//#########################################################################################################################
			//##  Init Method
			//#########################################################################################################################
			init : function(initOptions) {

				// Default options
				var defaults = {
					columns: 5,
					margin: 15,
					widget_height: 0.7,
					scroll_width: 15,
					debug: false,
					container: this,
					autoScale: true,

					selectable_distance: 50,

					draggable_opacity: 0.7,

					cls_ui_selectable_helper: "ui-selectable-helper",
					cls_ui_selected: "ui-selected",

					cls_resizable_helper: "ui-resizable-helper",
					cls_ui_widget_content: "ui-widget-content",
					cls_ui_widget_header: "ui-widget-header",

					cls_jqGridable_widget_wrapper: "widget-wrapper",
					cls_jqGridable_widget_container: "widget-container",
					cls_jqGridable_widget_container_debug: "widget-container-debug",
					cls_jqGridable_widget_container_vgrid: "widget-container-vgrid",
					cls_jqGridable_widget_container_hgrid: "widget-container-hgrid",
					cls_jqGridable_widget_container_grid: "widget-container-grid",

					tpl_widget: "<div class='[cls_ui_widget_content]'><h3 id='[id]-title' class='[cls_ui_widget_header]'></h3><div id='[id]-content'></div></div>",

					do_build_widget: undefined,
					on_add_widget: undefined,
					on_del_widget: undefined,
					on_resize_widget: undefined,
					
					on_widget_dblclick: undefined,
					on_widget_rightclick: undefined,

					draggable: true,
					resizable:  true,
					selectable: true,

					show_grid: true,
					dump: undefined,
				
				}

				options = $.extend(defaults, initOptions);

				debug = function(text){
						if (options.debug) { 
							console.log(text)
						}
				}
				
				vars.container_ori_width = options.container.width() - options.scroll_width

				if (! options.on_add_widget ){
					options.on_add_widget = _on_add_widget
				}

				if (! options.do_build_widget){
					options.do_build_widget = _do_build_widget
				}


				// Init selectable
				if (options.selectable){
					options.container.selectable({
						filter: '.'+options.cls_jqGridable_widget_wrapper,
						distance: options.selectable_distance,
						stop: function(event, ui) {
							// prevent collision
							if ($(".ui-selected", this ).size() != 0){
								return
							}

							var widgetId = 'widget-' + widgets
							var position = calcul_position($("."+options.cls_ui_selectable_helper))

							if (position){
								add_widget(widgetId, position)
							}
						}
					});
				}
				
				// draw plugin
				if (options.dump){
					load(dump)
				}else{
					redraw();
				}

			},
			
			//#########################################################################################################################
			//##  Add row on grid
			//#########################################################################################################################
			addRow: function(nb){
					if (! nb) { nb = 1; }
					options.container.height(options.container.height() + (nb * vars.widget_height) + vars.borderCorrection)
					if (vars.grid){
						remove_grid()
						show_grid()
					}
			},
			
			//#########################################################################################################################
			//##  Add column
			//#########################################################################################################################	
			addColumn : function(nb) {
				if (! nb) { nb = 1; }
				options.columns += nb
				redraw()
			},
			
			//#########################################################################################################################
			//##  Toggle grid mark
			//#########################################################################################################################	
			toggleGrid : function() {
				if (vars.grid){
					remove_grid()
					options.show_grid = false
				}else{
					show_grid()
					options.show_grid = true
				}
			},
			
			//#########################################################################################################################
			//##  Toggle Debug Mode
			//#########################################################################################################################	
			toggleDebug : function() {
				if (options.debug){
					options.debug = false
				}else{
					options.debug = true
					debug("In debug mode")
				}
				redraw()
			},
			
			//#########################################################################################################################
			//##  Redraw
			//#########################################################################################################################	
			redraw : function() {
				redraw()
			},
			
			//#########################################################################################################################
			//##  Clear
			//#########################################################################################################################	
			clear : function() {
				$('.' + options.cls_jqGridable_widget_wrapper).each(function (){
					$(this).remove()
				})
				widgets = 0
				redraw()
			},
			
			//#########################################################################################################################
			//##  Dump
			//#########################################################################################################################	
			dump : function() {
				var data = dump()
				debug("Dump:")
				debug(data)
				return data
			},
			
			//#########################################################################################################################
			//##  Load
			//#########################################################################################################################	
			load : function(dump) {
				load(dump)
			},
			
			//#########################################################################################################################
			//##  Set widget title and content (default template)
			//#########################################################################################################################	
			widget_setTitle : function(id, html) {
				//DRAFT
				$('#'+id+'-title').text(html)
			},
			widget_setContent : function(id, html) {
				//DRAFT
				$('#'+id+'-content').text(html)
			},
			
			//#########################################################################################################################
			//##  Widget data
			//#########################################################################################################################			
			widget_setData : function(id, data) {
				debug("Set data on "+id)
				debug(data)
				$('#'+id).data(data)
			},
			
			widget_getData : function(id) {
				debug("Get data of "+id)
				var data = $('#'+id).data()
				debug(data)
				return data
			},			
			
			//#########################################################################################################################
			//##  Remove widget
			//#########################################################################################################################
			remove_widget: function(id){
				$('#'+id).remove()
			}
		}

		//#########################################################################################################################
		//##  Plugin functions
		//#########################################################################################################################

		//#########################################################################################################################
		//##  Load from dump
		//#########################################################################################################################	
		var load = function(dump){

			debug("Load widgets")
			var index
			//adjust size
			if (options.autoScale){
				var maxRow = 0
				var maxCol = 0
				for (index in dump){
					var widget = dump[index]
					var height = widget.position.height + widget.position.top
					var width = widget.position.width + widget.position.left
					if (height > maxRow){ maxRow = height }
					if (width > maxCol){ maxCol = width }
				}
				debug(" + rows: "+maxRow)
				debug(" + cols: "+maxCol)
					
				redraw(maxRow, maxCol)
			}else{
				redraw()
			}
				
			for (index in dump){
				var widget = dump[index]
				add_widget(widget.id, widget.position)
			}
		}

		//#########################################################################################################################
		//##  Dump
		//#########################################################################################################################			
		var dump = function(){
			var dump = []
				
			$('.' + options.cls_jqGridable_widget_wrapper).each(function (){
				var id = $(this).attr('id')
				dump.push({
					id: id,
					position: get_position($(this)),
					data: methods.widget_getData(id),
				})
			})
			return dump
		}
		
		//#########################################################################################################################
		//##  Redraw
		//#########################################################################################################################	
		var redraw = function(rows, colums){
			debug("Redraw")
			
			if (colums) { options.columns = colums }
			
			options.container.removeClass(options.cls_jqGridable_widget_container_debug)
			
			vars.borderCorrection = 0
			if (options.debug) {
				options.container.addClass(options.cls_jqGridable_widget_container_debug)
				//vars.borderCorrection = options.container.css('border-width')
				vars.borderCorrection = 1
			}
			
			//Init container
			options.container.removeClass(options.cls_jqGridable_widget_container)
			options.container.addClass(options.cls_jqGridable_widget_container)

			options.widget_width = Math.round((vars.container_ori_width - vars.borderCorrection) / options.columns)
			options.container.width(options.widget_width * options.columns )

			vars.widget_height = options.widget_height
			if (vars.widget_height <= 1){
				vars.widget_height = Math.round(vars.widget_height * options.widget_width)
			}

			var nb_height
			if (rows) {
				nb_height = rows
			}else{
				nb_height =  Math.round((options.container.height() / vars.widget_height))
			}
			
			options.container.height(nb_height * vars.widget_height + vars.borderCorrection )				
			
			// repositionning all widget
			$('.' + options.cls_jqGridable_widget_wrapper).each(function (){
				set_position($(this))
			})
				
			if (options.show_grid){
				show_grid()
			}
		}

		//#########################################################################################################################
		//##  HTML build function
		//#########################################################################################################################
		var _do_build_widget = function(id) {
			debug(" + Set widget html")
			html_widget = options.tpl_widget
			html_widget = html_widget.replace("[cls_ui_widget_content]", options.cls_ui_widget_content)
			html_widget = html_widget.replace("[cls_ui_widget_header]", options.cls_ui_widget_header)
			html_widget = html_widget.replace("[id]", id)
			html_widget = html_widget.replace("[id]", id)
			return html_widget
		}

		//#########################################################################################################################
		//##  On add widget (after rendering)
		//#########################################################################################################################
		var _on_add_widget = function(id, widget) {
		}

		//#########################################################################################################################
		//##  Calcul widget position (in row and col) between container and helper 
		//#########################################################################################################################
		var calcul_position = function (helper, dragmode){

			debug("")
			debug("Calcul positioning and sizing")

			var x_tolerance = 20
			var y_tolerance = 20

			var container_pos = options.container.offset()
			var container_width = options.container.width()
			var container_height = options.container.height()
			var container_top = container_pos.top
			var container_left = container_pos.left

			var max_row = Math.round(container_height / vars.widget_height)

			var helper_pos = helper.offset()
			var helper_width = helper.width() - 2 * x_tolerance
			var helper_height = helper.height() - 2 * y_tolerance
			var helper_top = helper_pos.top + y_tolerance
			var helper_left = helper_pos.left + x_tolerance

			//ng
			var top, left

			left = helper_left - container_left
			top = helper_top - container_top

			if (dragmode){
				//use center
				left += options.widget_width/2
				top += vars.widget_height/2
			}

			left = Math.ceil(left / options.widget_width) - 1		
			top = Math.ceil(top / vars.widget_height) - 1

			if (left < 0 ) { left = 0}
			if (top  < 0 ) { top  = 0}

			var width, height
			if (! dragmode){
				width = (helper_left + helper_width) - container_left
				width = Math.ceil(width / options.widget_width) - left
				if (width < 1 ) { width = 1}

				height = (helper_top + helper_height) - container_top
				height = Math.ceil(height / vars.widget_height) - top
				if (height < 1 ) { height = 1}
			}else{
				height = Math.ceil(helper_height / vars.widget_height)
				width = Math.ceil(helper_width / options.widget_width)
			}
			
			if ((left + width) > options.columns)	{ width = options.columns - left }
			if ((top + height) > max_row)			{ height = max_row - top }

			debug("Finish:")
			debug(" + Top: "+top)
			debug(" + Left: "+left)
			debug(" + Width: "+width)
			debug(" + Height:"+height)
			
			return { top: top, left: left, width: width, height: height}	
		}

		//#########################################################################################################################
		//##  Add widget on grid
		//#########################################################################################################################
		var add_widget = function(id, position, html) {
			debug("Add Widget")

			if (! html){
				html = options.do_build_widget(id)
			}


			var AttrPos = "gtop='"+position.top+"' gleft='"+position.left+"' gheight='"+position.height+"' gwidth='"+position.width+"'"
			options.container.append('<div id="'+id+'" '+AttrPos+' class="'+options.cls_jqGridable_widget_wrapper+'">'+html+'</div>');

			var widget = $("#"+id)
			
			set_position(widget, position)

			//widget.jqGridableWidget({})


			// Bind double click
			if (options.on_widget_dblclick){
				widget.dblclick(function(){
					options.on_widget_dblclick(widget)
				})
			}

			// Bind right click
			if (options.on_widget_rightclick){
				widget.bind("contextmenu",function(e){
					return false;
				}); 
				widget.mousedown(function(event) {
					switch (event.which) {
						case 3:
							if (options.on_widget_rightclick){
									options.on_widget_rightclick(widget)
							}
							break;
					}
				});
			}


			// Set resizable
			if (options.resizable){
				debug(" + Set Widget resizable")
				widget.resizable({
					//containment: options.container,
					autoHide: true,
					grid: [ 10, 10 ],
					minHeight: vars.widget_height - 30,
					minWidth: options.widget_width - 30,
					helper: options.cls_resizable_helper,
					stop: function(event, ui){
						var widget = $(this)
						var position = calcul_position(widget)
						set_position(widget, position)
						if (options.on_resize_widget){
							options.on_resize_widget($(this).attr('id'), $(this))
						}
					}
				});
			}

			// Set draggable
			if (options.draggable){
				debug(" + Set Widget draggable")
				widget.draggable({
					opacity: options.draggable_opacity,
					containment: 'parent',
					stack: '.'+options.cls_jqGridable_widget_wrapper,
					grid: [ 10, 10 ],
					stop: function(event, ui) {
						var widget =  $(this)
						var position = calcul_position(widget, true)
						set_position(widget, position)				
					}
				});
			}

			widgets +=1

			options.on_add_widget(id, widget)

			debug("Widget added")
		}
		
		//#########################################################################################################################
		//##  Get position
		//#########################################################################################################################
		var get_position = function(widget){
			return {
					top: parseInt(widget.attr('gtop')),
					left: parseInt(widget.attr('gleft')),
					height: parseInt(widget.attr('gheight')),
					width: parseInt(widget.attr('gwidth')),
				}
		}
		
		//#########################################################################################################################
		//##  Widget positioning
		//#########################################################################################################################
		var set_position = function(widget, position){

			if (! position){
				position = get_position(widget)
			}else{
				 widget.attr('gtop', position.top)
				 widget.attr('gleft', position.left)
				 widget.attr('gheight', position.height)
				 widget.attr('gwidth', position.width)
			}
			
			var top = position.top * vars.widget_height
			var left = position.left * options.widget_width

			var width = position.width * options.widget_width
			var height = position.height * vars.widget_height

			debug(" + Set widget position")
			widget.css({
				position: 'absolute',
				'z-index': widget.css('z-index') + 999,
				top: top,
				left: left,
				width: width,
				height: height
			})

			var content = widget.find("."+options.cls_ui_widget_content)
			content.css({
				margin: (options.margin / 2),
				height: height - options.margin
			})
		}
		
		//#########################################################################################################################
		//##  Remove grid
		//#########################################################################################################################
		var remove_grid = function(){
			debug("Remove grid")

			$('.' + options.cls_jqGridable_widget_container_grid).each(function (){
					$(this).remove()
			})
			
			$('.' + options.cls_jqGridable_widget_container_vgrid).each(function (){
				$(this).remove()
			})
			
			$('.' + options.cls_jqGridable_widget_container_hgrid).each(function (){
				$(this).remove()
			})
			
			vars.grid = false
		}
		
		//#########################################################################################################################
		//##  Show grid
		//#########################################################################################################################
		
		var show_grid = function(){
			remove_grid()			
			debug("Show grid")

			options.container.prepend('<div class="'+options.cls_jqGridable_widget_container_grid+'"></div>');

			var i
			for (i=0; i<options.columns; i++){
				options.container.prepend('<div class="'+options.cls_jqGridable_widget_container_vgrid+'" style="width: '+options.widget_width+'px; left: '+(i*options.widget_width)+'px;"></div>');
			}
	
			var height = options.container.height() - vars.borderCorrection
			for (i=0; (i*vars.widget_height) < height; i++){
				options.container.prepend('<div class="'+options.cls_jqGridable_widget_container_hgrid+'" style="top: '+(i*vars.widget_height)+'px; height: '+vars.widget_height+'px; "></div>');
			}
			
			vars.grid = true
		}
		
		//#########################################################################################################################
		//##  Plugin declaration
		//#########################################################################################################################

		$.fn.jqGridable = function(method) {

			// Method calling logic
			if ( methods[method] ) {
				return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
			} else if ( typeof method === 'object' || ! method ) {
				return methods.init.apply( this, arguments );
			} else {
				$.error( 'Method ' +  method + ' does not exist on jQuery.jqGridable' );
			}

			return this
		}

	})(jQuery);
}
