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
	
	options: {},
	chart: undefined,
	serie: undefined,
	
	//Default Options
	max: undefined,
	other_label: "Free",
	
	autoTitle: true,
	title_fontSize: 15,
	
	legend_verticalAlign: "bottom",
	legend_align: "center",
	legend_layout: "horizontal",
	legend_backgroundColor: null,
	legend_borderColor: "#909090",
	legend_borderWidth: 1,
	legend_fontSize: 12,
	//

	initComponent: function() {
		//Set title
		if (this.autoTitle) {
			this.setchartTitle();
			this.title = ''
		}else{
			if (! this.border){
				this.chartTitle = this.title
				this.title = ''
			}
		}
		this.callParent(arguments);
	},

	setchartTitle: function(){
		var title = ""
		if (this.nodes) {
			if (this.nodes.length == 1){
				var info = split_amqp_rk(this.nodes[0].id)
				
				if (info.source_type == 'resource')
					title = info.resource + ' ' + _('line_graph.on') + ' ' + info.component
				else
					title = info.component
			}
		}
		this.chartTitle = title	
	},
	
	afterContainerRender: function(){
		log.debug("Initialize Pie", this.logAuthor)
		
		this.setOptions();
		this.createChart();
		
		this.ready();
	},

	setOptions: function(){
		this.options = {
			chart: {
				renderTo: this.wcontainerId,
				defaultSeriesType: 'pie',
				height: this.getHeight(),
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
				text: this.chartTitle,
				floating: true,
				style: {
					fontSize: this.title_fontSize
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
				backgroundColor: this.legend_backgroundColor,
				borderWidth: this.legend_borderWidth,
				borderColor: this.legend_borderColor,
				itemStyle: {
					fontSize: this.legend_fontSize
				}
			},
			series: []
		}

		//specifique options to add
		if(this.exportMode){
			this.options.plotOptions.pie.enableMouseTracking = false;
			this.options.plotOptions.tooltip = {}
			this.options.plotOptions.pie.shadow = false;
		}	
	},
	
	createChart: function(){
		this.chart = new Highcharts.Chart(this.options);
	},
	
	onRefresh: function(data){
		if (this.chart && data){
			
			// Remove old series
			this.removeSerie()
			
			var serie = {
				id: 'pie',
				type: 'pie',
				data: []
			};
			
			var node = this.nodes[0]
			
			// Parse perf_data
			var perf_data_array = data.perf_data_array
						
			for (var index in perf_data_array){
				
				var perf_data = perf_data_array[index]
				
				var metric = perf_data['metric']
				var value = perf_data['value']
				var max = perf_data['max']
				var unit = perf_data['unit']
				
				if (unit == '%' && ! max)
					max = 100
					
				var metric_name = metric 
				
				if (node.metrics.indexOf(metric) != -1 || node.metrics.indexOf('<all>') != -1){
					var other_label = this.other_label
					
					if (max == undefined)
						max = this.max
					
					if (unit){
						metric_name += " ("+unit+")"
						other_label += " ("+unit+")"
					}
					
					serie.data.push({ id: metric, name: metric_name, y: value, color: global.default_colors[0] })
					serie.data.push({ id: 'other', name: other_label, y: max-value, color: global.default_colors[1] })
				}
			}
			
			if (serie.data){
				this.serie = serie
				this.displaySerie()
			}else{
				log.debug("No data to display", this.logAuthor)
			}
		}
	
	},
	
	removeSerie: function(){
		var serie = this.chart.get('pie')
		if (serie)
			serie.destroy()
	},
	
	displaySerie: function(){
		if (this.serie)
			this.chart.addSeries(Ext.clone(this.serie))
	},
	
	reloadSerie: function(){
		this.removeSerie()
		this.displaySerie()
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
			this.reloadSerie()
		}
	},

});
