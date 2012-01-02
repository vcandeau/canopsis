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
Ext.define('widgets.pie.pie' ,{
	extend: 'canopsis.lib.view.cwidget',

	alias : 'widget.pie',
	
	logAuthor: '[pie]',
	
	initComponent: function() {
		this.callParent(arguments);
		
	},
	
	onRefresh: function(data){
		this.uri += '/' + this.nodeId;
		if (! this.chart){
			this.createHighchart(data);
		}
	},
	
	createHighchart: function(data){
		this.setOptions();

		var title = "";
		if (data.resource){
			title = data.resource + ' on ';
		}
		if (data.component){
			title += data.component;
		}
		this.options.title.text = title;
		
		log.debug(" + set title: '"+title+"'", this.logAuthor)
		
		if (data.perf_data_array){
			var perf_data = data.perf_data_array;			

			var serie = {
				type: 'pie',
				data: []
			};

			if (this.metric){
				log.debug(" + Use one metric: '"+this.metric+"'", this.logAuthor)
				metric = perf_data[this.metric]
	
				var metric_max = metric.max;
				if (this.metric_max){
					log.debug(" + Set max to: "+this.metric_max, this.logAuthor)
					metric_max = this.metric_max;
				}

				serie.data.push(['Free', metric_max-metric.value])
				serie.data.push([metric.metric, metric.value])
			}else{
				log.debug(" + Use Multiple metrics", this.logAuthor)
				var index;
				var total = 0;
				for (index in perf_data){
					metric = perf_data[index]
					total += metric.value			
				}
				if (total == 0){ total = 1 }
				log.debug("   + Total: "+total, this.logAuthor)

				for (index in perf_data){
					log.debug("   + Push metric: '"+index+"'", this.logAuthor)
					metric = perf_data[index]
					serie.data.push([metric.metric, Math.round(metric.value / total) ])
				}
			}

			this.options.series.push(serie)
		}

		this.chart = new Highcharts.Chart(this.options);
		//this.doRefresh();
	},

	setOptions: function(){
		this.options = {
			chart: {
				renderTo: this.divId,
				defaultSeriesType: 'pie',
				height: this.divHeight,
				animation: false,
				borderColor: "#FFFFFF"
			},
			exporting: {
				enabled: false
			},
			colors: [],
			plotOptions: {
				pie: {
					allowPointSelect: true,
					cursor: 'pointer',
					dataLabels: {
						enabled: false
					},
					showInLegend: true,
					animation: false,
				}
			},
			tooltip: {
				formatter: function() {
					return '<b>'+ this.point.name +'</b>: '+ Math.round(this.percentage) +' %';
					}
			},
			title: {
				text: '',
				floating: true
			},
			symbols: [],
			credits: {	
				enabled: false
			},
			series: []
		}

		//specifique options to add
		if(this.exportMode){
			this.options.plotOptions.pie.enableMouseTracking = false;
			this.options.plotOptions.tooltip = {}
		}

	}
	
	
	
});
