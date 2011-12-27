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

// initComponent -> doRefresh -> get_perfnode -> createHighchartConfig -> doRefresh -> onRefresh -> addDataOnChart
//						  -> setOptions                                  -> addDataOnChart ...
//						  -> createChart

Ext.define('widgets.line_graph.line_graph' ,{
	extend: 'canopsis.lib.view.cwidget',

	alias : 'widget.line_graph',

	layout: 'fit',

	first: false,
	start: false,
	shift: false,

	//addToRequestManager: false,

	logAuthor: '[line_graph]',

	options: {},
	chart: false,

	PollNodeInfo: false,

	params: {},

	time_window: 86400, //24 hours

	doRefresh: function(from, to){
		if (this.chart){
			
			if (! to && ! from){
				if (this.start){
					from = this.start;
					to = Date.now();
				}else{
					to = Date.now();
					from = to - (this.time_window * 1000);
				}
			}

			if (this.exportMode){
				from = this.export_from;
				to = this.export_to;
			}

			url = this.makeUrl(from, to)

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
			this.get_perfnode();
		}
	},

	makeUrl: function(from, to){
		var metrics_txt = ""
		var i;
		for (i in this.metrics){
			metrics_txt += this.metrics[i] + ","
		}
			
		//small hack
		metrics_txt = metrics_txt.replace('/', "<slash>")

		log.debug(" + Refresh metrics '"+metrics_txt+"', "+from+" -> "+to, this.logAuthor)

		var url = '/perfstore/values/'+this.nodeId + '/' + metrics_txt

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
			var i;
			for (i in data){
				this.addDataOnChart(data[i])
			}

			if (data[0].values.length > 0){
				this.start = data[0].values[data[0].values.length-1][0];

				this.shift = this.first < (this.start - (this.time_window*1000))
				//log.debug('     + First: '+this.first, this.logAuthor)
				//log.debug('     + First graph: '+(this.start - this.time_window), this.logAuthor)
				log.debug('     + Shift: '+this.shift, this.logAuthor)
			}
				
			this.chart.redraw();
			if(this.mytab.mask){
				this.mytab.mask.hide();
			}
		}
	},

	get_perfnode: function(){
		log.debug(" + Get perfnode "+this.id+" ...", this.logAuthor)
		Ext.Ajax.request({
			url: '/perfstore/node/'+this.nodeId,
			scope: this,
			success: function(response){
				var data = Ext.JSON.decode(response.responseText)
				var perfnode = data.data[0]
				this.perfnode = perfnode
				this.createHighchartConfig(perfnode)
			},
			failure: function ( result, request) {
				log.error("Ajax request failed ... ("+request.url+")", this.logAuthor)
			} 
		})
	},

	createHighchartConfig: function(perfnode){
		log.debug(" + Set config", this.logAuthor)

		var title = ""

		if(!this.title && perfnode.id){
			var nodeName = perfnode.id.split('.')
			
			//component
			if(nodeName[5]){
				title += nodeName[5]
			}
	
			// resource
			if (nodeName[4]){
				title += ' on ' + nodeName[4]
			}
			
		}

		this.chartTitle = title

		this.setOptions()

		log.debug(" + Set Metrics Series", this.logAuthor)
		this.metrics = []
		
		var i=0;
		for (metric in perfnode.metrics){
			log.debug("   + Metric "+metric+":", this.logAuthor)

			this.metrics.push(metric)

			//this.start[metric] = false

			var name = metric
			if ( perfnode.metrics[metric]['bunit']){
				name = name + " ("+perfnode.metrics[metric]['bunit']+")"
			}
			log.debug("     + Name: "+name, this.logAuthor)

			var color
			/*if (this.colors[metric]){
				this.options.colors.push(this.colors[metric])
			}else{
				this.options.colors.push(this.default_colors[i])
			}*/
			color = global.default_colors[i]
			this.options.colors.push(color)

			log.debug("     + Color: "+color, this.logAuthor)

			this.options.series.push({name: name, data: []})
			i = i+1;
		}

		this.createChart()
	
		this.doRefresh();
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
			chart: {
				renderTo: this.divId,
				//zoomType: 'x',
				defaultSeriesType: 'area',
				height: this.divHeight,
				animation: false,
				borderColor: "#FFFFFF"
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

	addDataOnChart: function(data){
		var metric = data['metric']
		var values = data['values']
		
		//log.dump(data)

		metric_id = this.metrics.indexOf(metric)
		log.debug('  + Add data on metric '+metric+' ('+metric_id+')...', this.logAuthor)

		if (values.length <= 0){
			log.debug('   + No data', this.logAuthor)
			if (this.reportMode){
				this.chart.series[metric_id].setData([], false);
				return true
			}else{
				return false
			}
		}


		if (! this.start || this.reportMode){
			log.debug('   + Set data', this.logAuthor)
			this.first = values[0][0];

			this.chart.series[metric_id].setData(values, false);
		}else{
			log.debug('   + Push data', this.logAuthor)

			var i;
			for (i in values) {
				value = values[i]
				//addPoint (Object options, [Boolean redraw], [Boolean shift], [Mixed animation]) : 
            			this.chart.series[metric_id].addPoint(value, false, this.shift, false);
			}
		}

		return true		
	},
	
	/*displayFromTs : function(from, to){
		
		this.chart.destroy()
		this.reportStart = from
		this.reportStop = to
		//log.dump(this.start)
		this.start = false

		this.createHighchartConfig(this.perfnode)
		
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
