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

// initComponent -> doRefresh -> get_config -> createHighchartConfig -> doRefresh -> addDataOnChart

Ext.define('widgets.line_graph.line_graph' ,{
	extend: 'canopsis.lib.view.cwidget',

	alias : 'widget.line_graph',

	layout: 'fit',

	first: false,
	start: false,
	shift: false,

	logAuthor: '[line_graph]',

	options: {},
	chart: false,


	time_window: 86400, //24 hours

	initComponent: function() {
		log.debug('Init Line Graph '+this.id, this.logAuthor)
		log.debug(' + NodeId: '+ this.nodeId, this.logAuthor)

		this.callParent(arguments);
		this.get_config();
	},

	get_config: function(){
		log.debug(" + Get config "+this.id+" ...", this.logAuthor)
		Ext.Ajax.request({
			url: '/perfstore/node/'+this.nodeId,
			scope: this,
			success: function(response){
				var data = Ext.JSON.decode(response.responseText)
				var config = data.data[0]

				this.createHighchartConfig(config)
			},
			failure: function ( result, request) {
				log.error("Ajax request failed ... ("+request.url+")", this.logAuthor)
			} 
		})
	},

	createHighchartConfig: function(config){

		log.debug(" + Set config", this.logAuthor)

		var title = ""

		if (! this.title) {
			if (this.nodeData.service_description) {
				title = this.nodeData.service_description;
			}else if (this.nodeData.host_name){
				title = this.nodeData.host_name;
			}
		}

		this.options = {
			chart: {
				renderTo: this.divId,
				zoomType: 'x',
				defaultSeriesType: 'area',
				height: this.divHeight,
				animation: false,
			},
			exporting: {
				enabled: false
			},
			colors: [],
			title: {
				text: title,
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
				maxZoom: 60 * 60 * 1000, // 1 hour
				labels: {
					formatter: function() {
						return Ext.Date.format(new Date(this.value), 'H:i');
					}
				}
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

		log.debug(" + Set Metrics Series", this.logAuthor)
		this.metrics = []
		
		var i=0;
		for (metric in config.metrics){
			log.debug("   + Metric "+metric+":", this.logAuthor)

			this.metrics.push(metric)

			this.start[metric] = false

			var name = metric
			if ( config.metrics[metric]['bunit']){
				name = name + " ("+config.metrics[metric]['bunit']+")"
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


		this.chart = new Highcharts.Chart(this.options);
		//this.doRefresh();
	},

	onRefresh: function (data){
		if (this.chart){
			var metrics_txt = ""
			var i;
			for (i in this.metrics){
				metrics_txt += this.metrics[i] + ","
			}

			log.debug(" + Refresh metrics '"+metrics_txt+"' ...", this.logAuthor)

			var url = '/perfstore/values/'+this.nodeId+'/'+metrics_txt

			if (this.start){
				// only last values
				url = url + '/' + (this.start+1000)
			}

			Ext.Ajax.request({
				url: url,
				scope: this,
				success: function(response){
					var data = Ext.JSON.decode(response.responseText)
					data = data.data

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
				},
				failure: function ( result, request) {
					log.error("Ajax request failed ... ("+request.url+")", this.logAuthor)
				} 
			})
		}else{
			this.nodeId_refresh = false;
			this.get_config();
		}
	},

	addDataOnChart: function(data){
		var metric = data['metric']
		var values = data['values']
		
		//log.dump(data)

		if (values.length <= 0){
			return false
		}

		metric_id = this.metrics.indexOf(metric)
		log.debug('  + Add data on metric '+metric+' ('+metric_id+')...', this.logAuthor)

		if (! this.start){
			log.debug('   + Set data', this.logAuthor)
			this.first = values[0][0];
			this.chart.series[metric_id].setData(values,true);
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
	
	//add data on chart
	reporting: function(from, to){
		//this.setHtml('widget reporting from date ' + from + ' to ' + to)
		//this.doRefresh()
		
		var metrics_txt = ""
		var i;
		for (i in this.metrics){
			metrics_txt += this.metrics[i] + ","
		}
		//log.debug(" + Refresh metrics '"+metrics_txt+"' ...", this.logAuthor)
		
		//var url = '/perfstore/values/'+this.nodeId+'/'+metrics_txt
		var url = '/perfstore/values/'+this.nodeId+'/'+metrics_txt+ '/' + from// + '/' + to

		Ext.Ajax.request({
			url: url,
			scope: this,
			success: function(response){
				var data = Ext.JSON.decode(response.responseText)
				data = data.data

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
			},
			failure: function ( result, request) {
				log.error("Ajax request failed ... ("+request.url+")", this.logAuthor)
			} 
		})
	},

});
