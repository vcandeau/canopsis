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

// initComponent -> afterContainerRender 	-> setchartTitle -> ready -> doRefresh -> onRefresh -> addDataOnChart
//                                			-> setOptions                             			-> getSerie
//											-> createChart


Ext.define('widgets.line_graph.line_graph' ,{
	extend: 'canopsis.lib.view.cwidget',

	alias : 'widget.line_graph',

	layout: 'fit',

	first: false,
	shift: false,
	last_from: false,
	pushPoints: false,

	logAuthor: '[line_graph]',

	options: {},
	chart: false,
	
	params: {},
	
	metrics: [],

	chartTitle: "",

	//Default Options
	time_window: global.commonTs.day, //24 hours
	zoom: true,
	legend: true,
	tooltip: true,
	legend_verticalAlign: "bottom",
	legend_align: "center",
	legend_layout: "horizontal",
	legend_backgroundColor: null,
	SeriesType: "area",
	//..
	
	/*initComponent: function() {
		this.callParent(arguments);
	},*/
	
	afterContainerRender: function(){
		log.debug("Initialize line_graph", this.logAuthor)
		log.debug(' + Time window: '+this.time_window, this.logAuthor)
		
		this.series = {}
		
		this.setchartTitle();
		
		this.setOptions();
		this.createChart();
		
		if (this.nodes){
			// Clean this.nodes
			var post_params = []
			for (var i in this.nodes){
				post_params.push({
					id: this.nodes[i].id,
					metrics: this.nodes[i].metrics,
				})
			}
			this.post_params = { 'nodes': Ext.JSON.encode(post_params) }
		}

		this.ready();	
	},

	setchartTitle: function(){
		var title = ""
		if(!this.title && this.nodeId && this.nodes.length == 1){
			var info = split_amqp_rk(this.nodes[0].id)
			
			if (info.source_type == 'resource')
				title = info.resource + ' ' + _('line_graph.on') + ' ' + info.component
			else
				title = info.component
		}
		this.chartTitle = title	
	},

	setOptions: function(){
		//----------find the right scale and tickinterval for xAxis------------
		/*if (this.reportStop && this.reportStart){
			var timestampInterval = (this.reportStop/1000) - (this.reportStart/1000)
			var tsFormat = this.findScaleAxe(timestampInterval)
			var tickInterval = this.findTickInterval(timestampInterval)
		} else {
			var tsFormat = 'H:i'
			var tickInterval = global.commonTs.threeHours * 1000
		}*/
		//---------------------------------------------------------

		this.options = {
			reportMode: this.reportMode,
			chart: {
				renderTo: this.wcontainerId,
				defaultSeriesType: this.SeriesType,
				height: this.getHeight(),
				animation: false,
				borderColor: "#FFFFFF"
			},
			global: {
				useUTC: true
			},
			exporting: {
				enabled: false
			},
			colors: [],
			title: {
				text: this.chartTitle,
				floating: true
			},
			tooltip: {
				enabled: this.tooltip,
				formatter: function() {
					return '<b>' + rdr_tstodate(this.x / 1000) + '<br/>' + this.series.name + ':</b> ' + this.y;
				}
			},
			xAxis: {
				//min: Date.now() - (this.time_window * 1000),
				type: 'datetime',
				maxZoom: 60 * 60 * 1000, // 1 hour
				//tickInterval: tickInterval,
			/*	type: 'datetime',
				dateTimeLabelFormats:{
					second: '%H:%M:%S',
					minute: '%H:%M',
					hour: '%H:%M',
					day: '%e. %b',
					week: '%e. %b',
					month: '%b %y',
					year: '%Y'
				}*/
				/*labels: {
					formatter: function() {
						return Ext.Date.format(new Date(this.value), tsFormat);
					}
				}*/
			},
			yAxis: {
				title: {
					text: ''
				}
        	},
			plotOptions: {
				series: {
					animation: false,
					shadow: false
				},
				area: {
					lineWidth: 1,
					shadow: false,
					cursor: 'pointer',
					marker: {
						enabled: false,
					}
				}
			},
			symbols: [],
			credits: {	
				enabled: false
			},
			legend: {
				enabled: this.legend,
				verticalAlign: this.legend_verticalAlign,
				align: this.legend_align,
				layout: this.legend_layout,
				backgroundColor: this.legend_backgroundColor
			},
			series: []
		}

		//specifique options to add
		if(this.exportMode){
			this.options.plotOptions.series['enableMouseTracking'] = false;
		}else{
			if (this.zoom){
				this.options.chart.zoomType = "x"
			}
		}
	},

	createChart: function(){
		this.chart = new Highcharts.Chart(this.options);
	},
	
	////////////////////// CORE

	makeUrl: function(from, to){
		var url = '/perfstore/values'
		
		if (! to){
			url += '/' + from
		}

		if (from && to){
			url += '/' + from + '/' + to
		}
	
		return url;	
	},

	doRefresh: function(from, to){
		if (this.chart){
			log.debug(" + Do Refresh "+from+" -> "+to, this.logAuthor)

			if (! this.reportMode && this.last_from){
				from = this.last_from;
				to = Date.now();
			}
			
			if (this.exportMode){
				from = this.export_from;
				to = this.export_to;
			}

			//for (var i in this.nodes){
			//	var node = this.nodes[i].id
			//	var metrics = this.nodes[i].metrics
				
			//	log.debug("   + " + node, this.logAuthor)
			
			if (this.nodes) {
				url = this.makeUrl(from, to)
				this.last_from = to

				Ext.Ajax.request({
					url: url,
					scope: this,
					params: this.post_params,
					method: 'POST',
					success: function(response){
						var data = Ext.JSON.decode(response.responseText)
						data = data.data
						this.onRefresh(data)	
					},
					failure: function ( result, request) {
						log.error("Ajax request failed ... ("+request.url+")", this.logAuthor)
					} 
				})
			}
		}
	},

	onRefresh: function (data){
		if (this.chart){
			log.debug(" + On refresh "+this.id+" ...", this.logAuthor)
			
			/*if (this.reportMode){
				log.debug(' + Clean series', this.logAuthor)
				var i;
				for (i in this.metrics){
					metric = this.metrics[i]
					this.addDataOnChart({'metric': metric, 'values': [] })
				}
			}*/

			if(data.length > 0){
				var i;
				for (i in data){
					this.addDataOnChart(data[i])
				}

				this.chart.redraw();

				if (data[0].values.length > 0){
					var extremes = this.chart.series[0].xAxis.getExtremes()
					var data_window = extremes.max - extremes.min
					this.shift = data_window > (this.time_window*1000)

					log.debug('     + Data window: '+data_window, this.logAuthor)
					log.debug('      + Shift: '+this.shift, this.logAuthor)
				}

			} else {
				log.debug(' + On refresh : no metric data', this.logAuthor)
			}
		}
	},
	
	getHeight: function(){
		var height = this.callParent();
		if (this.title){ height -= 30 }
		return height
	},

	onResize: function(){
		log.debug("onRezize", this.logAuthor)
		if (this.chart){
			this.chart.setSize(this.getWidth(), this.getHeight() , false);
		}
	},
	
	getSerie: function(node, metric_name, bunit){
		var serie_id = node + '.' +metric_name
		
		var serie = this.chart.get(serie_id)
		if (serie) { return serie }

		log.debug('  + Create Serie:', this.logAuthor)
	
		var serie_index = this.chart.series.length
		
		log.debug('    + serie id: '+serie_id, this.logAuthor)
		log.debug('    + serie index: '+serie_index, this.logAuthor)
		log.debug('    + bunit: '+bunit, this.logAuthor)

		var metric_long_name = ''
		
		if (this.nodes.length != 1){
			var info = split_amqp_rk(node)
			
			metric_long_name = info.component
			if (info.source_type == 'resource')
				metric_long_name += " - " + info.resource 
			
			metric_long_name = "(" + metric_long_name + ") "
		}
		
		metric_long_name += "<b>" + metric_name + "</b>"
		
		if (bunit)
			metric_long_name += " ("+bunit+")"
			
		log.debug('    + legend: '+metric_long_name, this.logAuthor)
		
		var color = global.default_colors[serie_index]

		var serie = {id: serie_id, name: metric_long_name, data: [], color: color}
		
		this.series[serie_id] = serie
		
		this.chart.addSeries(serie, true, false)
	
		return this.chart.get(serie_id)
	},

	addDataOnChart: function(data){
		var metric_name = data['metric']
		var values = data['values']
		var bunit = data['bunit']
		var node = data['node']
		
		//log.dump(data)

		var serie = this.getSerie(node, metric_name, bunit)
		
		var serie_id = node + '.' +metric_name

		log.debug('  + Add data for '+node+', metric "'+metric_name+'" ...', this.logAuthor)
		
		if (values.length <= 0){
			log.debug('   + No data', this.logAuthor)
			if (this.reportMode){
				if (serie.visible){
					serie.setData([], false);
					serie.hide()
				}
				return true
			}else{
				return false
			}
		}

		if (this.reportMode){
			if (! serie.visible){
				serie.show()
			}
		}
	
		if (! this.series[serie_id].pushPoints || this.reportMode){
			log.debug('   + Set data', this.logAuthor)
			this.first = values[0][0];

			serie.setData(values, false);
			this.series[serie_id].pushPoints = true;
			
		}else{
			log.debug('   + Push data', this.logAuthor)

			var i;
			for (i in values) {
				value = values[i]
				//addPoint (Object options, [Boolean redraw], [Boolean shift], [Mixed animation]) : 
            	serie.addPoint(value, false, this.shift, false);
			}
		}

		return true		
	},
	
	/*displayFromTs : function(from, to){
		
		this.chart.destroy()
		this.reportStart = from
		this.reportStop = to
		//log.dump(this.from)
		this.from = false

		this.createHighchart(this.perfnode)
		
		if(this.mytab.mask){
			this.mytab.mask.show();
		}
	},*/
	
	//add data on chart
	/*reporting: function(from, to){
		this.onRefresh();
	},
	
	findScaleAxe : function(interval){
		if (interval <= global.commonTs.day){
			return 'H:i'
		}else if (interval <= global.commonTs.week){
			return 'D'
		}else if (interval <= global.commonTs.month){
			return 'j M'
		}else if (interval <= global.commonTs.year){
			return 'M'
		} else {
			return 'Y'
		}
	},
	
	findTickInterval : function(interval){
		if (interval <= global.commonTs.day){
			return global.commonTs.threeHours * 1000
		}else if (interval <= global.commonTs.week){
			return global.commonTs.day * 1000
		}else if (interval <= global.commonTs.month){
			return global.commonTs.week * 1000
		}else if (interval <= global.commonTs.year){
			return global.commonTs.month * 1000
		} else {
			return global.commonTs.year * 1000
		}
	}
	*/
	
	
 	beforeDestroy : function() {
		widgets.line_graph.line_graph.superclass.beforeDestroy.call(this);
		
 		if (this.chart){
			this.chart.destroy()
			log.debug(" + Chart Destroyed", this.logAuthor)
		}
 	}

});
