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

// initComponent -> doRefresh -> -> createHighchart -> doRefresh -> onRefresh -> addDataOnChart
//                                -> setchartTitle                                -> getSerie
//				  -> setOptions
//				  -> createChart

Ext.define('widgets.line_graph.line_graph' ,{
	extend: 'canopsis.lib.view.cwidget',

	alias : 'widget.line_graph',

	layout: 'fit',

	first: false,
	
	shift: false,

	last_from: false,
	pushPoints: false,

	//addToRequestManager: false,

	logAuthor: '[line_graph]',

	options: {},
	chart: false,

	PollNodeInfo: false,

	params: {},

	//metrics: [],

	time_window: global.commonTs.day, //24 hours

	initComponent: function() {
		this.callParent(arguments);
		this.metrics = []
	},

	doRefresh: function(from, to){
		if (this.chart){
			log.debug(" + Do Refresh "+from+" -> "+to, this.logAuthor)

			if (! to || to < 10000000) {
				to = Date.now();
			}

			if (! from || from < 10000000) {
				from = to - (this.time_window * 1000);
			}

			if (! this.reportMode && this.last_from){
				from = this.last_from;
				to = Date.now();
			}
			
			if (this.exportMode){
				from = this.export_from;
				to = this.export_to;
			}

			url = this.makeUrl(from, to)
			this.last_from = to

			Ext.Ajax.request({
				url: url,
				scope: this,
				params: this.params,
				method: 'GET',
				success: function(response){
					var data = Ext.JSON.decode(response.responseText)
					data = data.data
					this.onRefresh(data)	
				},
				failure: function ( result, request) {
					log.error("Ajax request failed ... ("+request.url+")", this.logAuthor)
				} 
			})
		}else{
			this.createHighchart();
		}
	},

	makeUrl: function(from, to){
		var metrics_txt

		if (this.metrics.lenght > 0){
			var i;
			for (i in this.metrics){
				metrics_txt += this.metrics[i] + ","
			}
			//small hack
			metrics_txt = metrics_txt.replace('/', "<slash>")
		}
		
		if (metrics_txt){
			log.debug(" + Refresh metrics '"+metrics_txt+"', "+from+" -> "+to, this.logAuthor)

			var url = '/perfstore/values/'+this.nodeId + '/' + metrics_txt
		}else{
			log.debug(" + Refresh All metrics, "+from+" -> "+to, this.logAuthor)
			//small hack
			var url = '/perfstore/values/'+this.nodeId+'/<all>'
		}

		if (! to){
			url += '/' + from
		}

		if (from && to){
			url += '/' + from + '/' + to
		}
	
		return url;	
	},

	onRefresh: function (data){
		if (this.chart){
			log.debug(" + On refresh "+this.id+" ...", this.logAuthor)

			/*if (this.reportMode){
				this.chart.showLoading();
			}*/

			if (this.reportMode){
				log.debug(' + Clean series', this.logAuthor)
				var i;
				for (i in this.metrics){
					metric = this.metrics[i]
					this.addDataOnChart({'metric': metric, 'values': [] })
				}
			}

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

			/*if (this.reportMode){
				this.chart.hideLoading();
			}*/
		}
	},

	createHighchart: function(){
		log.debug(" + Set config", this.logAuthor)

		this.setchartTitle();

		this.setOptions();

		this.createChart();
	
		this.doRefresh();
	},

	setchartTitle: function(){
		var title = ""
		if(!this.title && this.nodeId){
			var nodeName = this.nodeId.split('.')
			
			// resource
			if (nodeName[5]){
				title += nodeName[5] + ' ' + _('line_graph.on') + ' '
			}

			//component
			if(nodeName[4]){
				title += nodeName[4]
			}
			
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
				renderTo: this.divId,
				//zoomType: 'x',
				defaultSeriesType: 'area',
				height: this.divHeight,
				animation: false,
				borderColor: "#FFFFFF"
			},
			global: {
				useUTC: false
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
				enabled: true,
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
			/*legend: {
				layout: 'vertical',
				align: 'right',
				verticalAlign: 'top',
				x: -10,
				y: 100,
				borderWidth: 1
			      },*/
			series: []
		}

		//specifique options to add
		if(this.exportMode){
			this.options.plotOptions.series['enableMouseTracking'] = false;
		}else{
			this.options.chart.zoomType = "x"
		}
	},

	createChart: function(){
		this.chart = new Highcharts.Chart(this.options);
	},

	getSerie: function(metric_name, bunit){
		var metric_index = this.metrics.indexOf(metric_name)
		if (metric_index >= 0){
			return this.chart.get(metric_name)
		}

		log.debug('  + Create Metric '+metric_name+' '+bunit, this.logAuthor)
		metric_index = this.metrics.push(metric_name)
		log.debug('    + metric_index: '+metric_index, this.logAuthor)

		var metric_long_name = metric_name
		if (bunit){
			metric_long_name += " ("+bunit+")"
		}

		var color = global.default_colors[metric_index]

		var serie = {id: metric_name, name: metric_long_name, data: [], color: color}
		//log.dump(serie)

		log.debug('    + metric_id: '+metric_name, this.logAuthor)
		
		this.chart.addSeries(serie, true, false)
	
		return this.chart.get(metric_name)
	},

	addDataOnChart: function(data){
		var metric_name = data['metric']
		var values = data['values']
		var bunit = data['bunit']
		
		//log.dump(data)

		var serie = this.getSerie(metric_name, bunit)
	
		log.debug('  + Add data on metric '+metric_name+' ...', this.logAuthor)

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
	
		if (! this.pushPoints || this.reportMode){
			log.debug('   + Set data', this.logAuthor)
			this.first = values[0][0];

			serie.setData(values, false);
			this.pushPoints = true;
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

});
