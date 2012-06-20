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


Ext.define('widgets.line_graph.line_graph' , {
	extend: 'canopsis.lib.view.cwidget',

	alias: 'widget.line_graph',

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

	chartTitle: null,

	//Default Options
	time_window: global.commonTs.day, //24 hours
	zoom: true,
	legend: true,
	tooltip: true,
	autoTitle: true,
	backgroundColor: '#FFFFFF',
	borderColor: '#FFFFFF',
	borderWidth: 0,

	showWarnCritLine: true,

	marker_symbol: null,
	marker_radius: 2,

	title_fontSize: 15,

	chart_type: 'line',

	legend_verticalAlign: 'bottom',
	legend_align: 'center',
	legend_layout: 'horizontal',
	legend_backgroundColor: null,
	legend_borderColor: '#909090',
	legend_borderWidth: 1,
	legend_fontSize: 12,
	legend_fontColor: '#3E576F',
	maxZoom: 60 * 10, // 10 minutes

	interval: global.commonTs.hours,
	aggregate_method: 'MAX',

	SeriesType: 'area',
	SeriePercent: false,
	lineWidth: 1,

	//trends
	data_trends: [],
	trend_lines: false,
	trend_lines_type: 'ShortDot',
	use_window_ts: false,
	//..


	initComponent: function() {
		
		this.backgroundColor		= check_color(this.backgroundColor)
		this.borderColor			= check_color(this.borderColor)
		this.legend_fontColor		= check_color(this.legend_fontColor)
		this.legend_borderColor 	= check_color(this.legend_borderColor)
		this.legend_backgroundColor	= check_color(this.legend_backgroundColor)

		//Set title
		if (this.autoTitle) {
			this.setchartTitle();
			this.title = '';
		}else {
			if (! this.border) {
				this.chartTitle = this.title;
				this.title = '';
			}
		}
		this.callParent(arguments);
	},

	setchartTitle: function() {
		var title = '';
		if (this.nodes) {
			var node_list = []
			
			for(var i in this.nodes){
				var id = this.nodes[i].id
				if(node_list.indexOf(id) == -1)
					node_list.push(id)
			}
			log.dump('------------------------------------')
			log.dump(node_list)
			log.dump('------------------------------------')

			
			if (node_list.length == 1) {
				var resource = this.nodes[0].resource;
				var component = this.nodes[0].component;
				var source_type = this.nodes[0].source_type;

				if (source_type == 'resource')
					title = resource + ' ' + _('line_graph.on') + ' ' + component;
				else
					title = component;
			}
		}
		this.chartTitle = title;
	},

	afterContainerRender: function() {
		log.debug('Initialize line_graph', this.logAuthor);
		log.debug(' + Time window: ' + this.time_window, this.logAuthor);

		this.series = {};
		this.series_hc = {};

		this.setOptions();
		this.createChart();

		if (this.nodes) {
			// Clean this.nodes
			this.processNodes();
		}

		this.ready();
	},

	setOptions: function() {
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

			cwidget: this,

			chart: {
				renderTo: this.wcontainerId,
				defaultSeriesType: this.SeriesType,
				//type: this.chart_type,
				height: this.getHeight(),
				reflow: false,
				animation: false,
				borderColor: this.borderColor,
				borderWidth: this.borderWidth,
				backgroundColor: this.backgroundColor,
				events: {
					redraw: this.checkTimewindow
				}
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
				floating: true,
				style: {
					fontSize: this.title_fontSize
				}
			},
			tooltip: {
				enabled: this.tooltip,
				formatter: function() {
					var y = this.y;
					if (this.series.options.invert)
						y = - y;
					return '<b>' + rdr_tstodate(this.x / 1000) + '<br/>' + this.series.name + ':</b> ' + y;
				}
			},
			xAxis: {
				id: 'timestamp',
				type: 'datetime',
				tickmarkPlacement: 'on'
			},
			yAxis: [
				{
					title: { text: null }
				},{
					id: "state",
					title: { text: null },
					labels: { enabled: false },
					max: 100
				}
			],
			plotOptions: {
				series: {
					animation: false,
					shadow: false
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
					fontSize: this.legend_fontSize,
					color: this.legend_fontColor
				}
			},
			series: []
		};

		//graph type (for column)
		if (this.chart_type == 'column') {
			this.options.chart.type = this.chart_type;
		}

		// Check marker
		var marker_enable = false;
		if (this.marker_symbol) {
			marker_enable = true;
		}else {
			this.marker_symbol = null;
			this.marker_radius = 0;
		}

		// Ymax
		if (this.SeriePercent) {
			this.options.yAxis.max = 100;
			//this.options.yAxis.title.text = 'pct'
		}

		// Configure line type
		if (this.SeriesType == 'area') {
			this.options.plotOptions['area'] = {
				lineWidth: this.lineWidth,
				shadow: false,
				cursor: 'pointer',
				turboThreshold: 10,
				marker: {
					enabled: marker_enable,
					symbol: this.marker_symbol,
					radius: this.marker_radius
				}
			};

		}else if (this.SeriesType == 'line') {
			this.options.plotOptions['line'] = {
				lineWidth: this.lineWidth,
				shadow: false,
				cursor: 'pointer',
				turboThreshold: 10,
				marker: {
					enabled: marker_enable,
					symbol: this.marker_symbol,
					radius: this.marker_radius
				}
			};
		}

		//specifique options to add
		if (this.exportMode) {
			this.options.plotOptions.series['enableMouseTracking'] = false;
		}else {
			if (this.zoom) {
				this.options.chart.zoomType = 'x';
			}
		}
	},

	createChart: function() {
		this.chart = new Highcharts.Chart(this.options);
		this.chartMessage = this.chart.renderer.text(_('Waiting data') + ' ...', 50, 50).add();
	},

	////////////////////// CORE

	makeUrl: function(from, to) {
		var url = '/perfstore/values';

		if (! to) {
			url += '/' + from;
		}

		if (from && to) {
			url += '/' + from + '/' + to;
		}

		return url;
	},

	doRefresh: function(from, to) {
		if (this.chart) {

			//If bar chart, wait full insterval
			if (this.lastRefresh)
				if (Ext.Date.now() < this.lastRefresh + (this.refreshInterval * 1000) && this.chart_type == 'column') {
					log.debug(' +  Wait for refresh', this.logAuthor);
					return false;
				}

			log.debug(' + Do Refresh '+ from + ' -> '+ to, this.logAuthor);

			if (this.chart_type == 'column') {
				if (!this.last_form) {
					new_from = getMidnight(from);
					new_to = getMidnight(to);

					if ((to - from) <= global.commonTs.day)
						to = Ext.Date.now();
				}
			}

			if (! this.reportMode && this.last_from) {
				from = this.last_from;
				to = Ext.Date.now();
			}


			log.debug(' + Do Refresh '+ new Date(from) + ' -> '+ new Date(to), this.logAuthor);

			if (this.nodes) {
				if (this.nodes.length != 0) {
					url = this.makeUrl(from, to);
					this.last_from = to;

					Ext.Ajax.request({
						url: url,
						scope: this,
						params: this.post_params,
						method: 'POST',
						success: function(response) {
							var data = Ext.JSON.decode(response.responseText);
							data = data.data;
							this.onRefresh(data);
						},
						failure: function(result, request) {
							log.error('Ajax request failed ... ('+ request.url + ')', this.logAuthor);
						}
					});
				} else {
					log.debug('No nodes specified', this.logAuthor);
				}
			}
		}
	},

	onRefresh: function(data) {
		if (this.chart) {
			log.debug('On refresh', this.logAuthor);
			/*if (this.reportMode){
				log.debug(' + Clean series', this.logAuthor)
				var i;
				for (i in this.metrics){
					metric = this.metrics[i]
					this.addDataOnChart({'metric': metric, 'values': [] })
				}
			}*/

			if (data.length > 0) {
				for (var i in data) {
					this.addDataOnChart(data[i]);
					//add/refresh trend lines
					// Exclude state lines
					if (this.trend_lines && (data[i]['metric'] != 'cps_state' && data[i]['metric'] != 'cps_state_ok' && data[i]['metric'] != 'cps_state_warn' && data[i]['metric'] != 'cps_state_crit' ))
						this.addTrendLines(data[i]);
				}

				//Disable no data message
				if (this.chartMessage) {
					this.chartMessage.destroy();
					this.chartMessage = undefined;
				}

				this.chart.redraw();

			} else {
				log.debug(' + No data', this.logAuthor);
				//---------if report, cleaning the chart--------
				if (this.reportMode == true) {
					this.clearGraph();
					if (this.chartMessage == undefined) {
						this.chartMessage = this.chart.renderer.text('<div style="margin:auto;">' + _('Infortunatly, there is no data for this period') + '</div>', 50, 50).add();
					}
					this.chart.redraw();
				}
			}
		}
	},

	clearGraph: function() {
		for (var i in this.chart.series) {
			//log.debug('cleaning serie : ' + this.chart.series[i].name)
			this.chart.series[i].setData([], false);
		}
	},

	checkTimewindow: function() {
		var me = this.options.cwidget;
		var now = Ext.Date.now();

		if (this.series.length > 0 && now < (me.last_from + 500)) {
			var extremes = this.series[0].xAxis.getExtremes();
			var data_window = extremes.dataMax - extremes.dataMin;
			me.shift = data_window > (me.time_window * 1000);

			log.debug(' + Data window: ' + data_window, me.logAuthor);
			log.debug('   + Shift: ' + me.shift, me.logAuthor);
		}
	},

	onResize: function() {
		log.debug('onRezize', this.logAuthor);
		if (this.chart)
			this.chart.setSize(this.getWidth(), this.getHeight() , false);
	},

	dblclick: function() {
		if (this.chart && ! this.isDisabled()) {
			if (this.chart.xAxis) {
				this.chart.xAxis[0].setExtremes(null, null, true, false);
				try {
					this.chart.toolbar.remove('zoom');
				}catch (err) {
					log.debug("Toolbar zoom doesn't exist", this.logAuthor);
				}
			}
		}
	},

	getSerie: function(node, metric_name, bunit, min, max, yAxis) {		
		var serie_id = node + '.' + metric_name;
		
		if (! yAxis)
			yAxis = 0

		//var serie = this.chart.get(serie_id)
		var serie = this.series_hc[serie_id];
		if (serie) { return serie }

		log.debug('  + Create Serie:', this.logAuthor);

		if (this.SeriePercent && max > 0)
			bunit = '%';

		var serie_index = this.chart.series.length;

		log.debug('    + serie id: ' + serie_id, this.logAuthor);
		log.debug('    + serie index: ' + serie_index, this.logAuthor);
		log.debug('    + bunit: ' + bunit, this.logAuthor);

		var metric_long_name = '';

		if (this.nodes.length != 1) {
			var info = split_amqp_rk(node);

			metric_long_name = info.component;
			if (info.source_type == 'resource')
				metric_long_name += ' - ' + info.resource;

			metric_long_name = '(' + metric_long_name + ') ';
		}

		var colors = global.curvesCtrl.getRenderColors(metric_name, serie_index);
		var curve = global.curvesCtrl.getRenderInfo(metric_name);

		// Set Label
		var label = undefined;
		if (curve)
			label = curve.get('label');
		if (! label)
			label = metric_name;

		metric_long_name += '<b>' + _(label) + '</b>';

		if (bunit)
			metric_long_name += ' ('+ bunit + ')';

		log.debug('    + legend: ' + metric_long_name, this.logAuthor);

		var serie = {id: serie_id, name: metric_long_name, data: [], color: colors[0], min: min, max: max, yAxis: yAxis};

		if (curve) {
			serie['dashStyle'] = curve.get('dashStyle');
			serie['invert'] = curve.get('invert');
		}

		if (this.SeriesType == 'area' && curve) {
			serie['fillColor'] = colors[1];
			serie['fillOpacity'] = colors[2] / 100;
			serie['zIndex'] = curve.get('zIndex');
		}

		this.series[serie_id] = serie;

		this.chart.addSeries(Ext.clone(serie), false, false);

		var hcserie = this.chart.get(serie_id);

		this.series_hc[serie_id] = hcserie;

		return hcserie;
	},

	parseValues: function(serie, values) {
		//Do operation on value
		if (this.SeriePercent && serie.options.max > 0)
			for (var index in values)
				values[index][1] = getPct(values[index][1], serie.options.max);

		if (serie.options.invert)
			for (var index in values)
				values[index][1] = - values[index][1];

		return values;
	},

	addPlotlines: function(metric_name, value, color) {
		var curve = global.curvesCtrl.getRenderInfo(metric_name);
		var label = undefined;
		var zindex = 10;
		var width = 2;
		var dashStyle = 'Solid';

		if (curve) {
			label = curve.get('label');
			color = global.curvesCtrl.getRenderColors(metric_name, 1)[0];
			zindex = curve.get('zIndex');
			dashStyle = curve.get('dashStyle');
		}

		if (! label)
			label = metric_name;

		this.chart.yAxis[0].addPlotLine({
			value: value,
			width: width,
			zIndex: zindex,
			color: color,
			dashStyle: dashStyle,
			label: {
				text: label
			}
		});
	},

	addDataOnChart: function(data) {
		var metric_name = data['metric'];
		var values = data['values'];
		var bunit = data['bunit'];
		var node = data['node'];
		var min = data['min'];
		var max = data['max'];
		//log.dump(data)
		
		var serie = undefined;
		
		if (metric_name == 'cps_state_ok' || metric_name == 'cps_state_warn' || metric_name == 'cps_state_crit'){
			serie = this.getSerie(node, metric_name, undefined, undefined, undefined, 1);
		}

		if (metric_name == 'cps_state'){
						
			ok_values = []
			warn_values = []
			crit_values = []
			for (var index in data['values']){
				state = parseInt(data['values'][index][1]/100)
				if       (state == 0){
					ok_values.push([data['values'][index][0], 100])
					warn_values.push([data['values'][index][0], 0])
					crit_values.push([data['values'][index][0], 0])
				}else if (state == 1){
					ok_values.push([data['values'][index][0], 0])
					warn_values.push([data['values'][index][0], 100])
					crit_values.push([data['values'][index][0], 0])
				}else if (state == 2){
					ok_values.push([data['values'][index][0], 0])
					warn_values.push([data['values'][index][0], 0])
					crit_values.push([data['values'][index][0], 100])
				}
			}
			
			data['metric'] = 'cps_state_ok'
			data['values'] = ok_values
			this.addDataOnChart(data)
			data['metric'] = 'cps_state_warn'
			data['values'] = warn_values
			this.addDataOnChart(data)
			data['metric'] = 'cps_state_crit'
			data['values'] = crit_values
			this.addDataOnChart(data)
			
			return
			
			/*this.lastplotband = xaxis.addPlotBand({ // mark the weekend
					color: '#FCFFC5',
					from: data['values'][0][0],
					to: data['values'][data['values'].length-1][0]
				});
			console.log(this.lastplotband)*/
			
			
			/*var xaxis = this.chart.get('timestamp')
			var doPB = []
			if (this.lastplotband){

			}else{
				console.log("addplotband ")
				var from = data['values'][0][0]
				var last_state = parseInt(data['values'][0][1]/100)
				
				for (var index in data['values']){
					state = parseInt(data['values'][index][1]/100)
					if (state != last_state){
						doPB.push({from: from, to: data['values'][index][0], state: last_state})
						from = data['values'][index][0]
						last_state = state
					}
				}
				
				doPB.push({from: from, to: data['values'][data['values'].length-1][0], state: state})
			}
			
			console.log(doPB)
			for (var index in doPB){
				var pb = doPB[index]
				var color
					
				if      (pb.state == 0)
					color = global.state_colors['ok']
				else if (pb.state == 1)
					color = global.state_colors['warning']
				else if (pb.state == 2)
					color = global.state_colors['critical']
				
				this.lastplotband = xaxis.addPlotBand({ // mark the weekend
					color: color,
					from: pb.from,
					to: pb.to,
					state: pb.state
				});
			}*/
			
		}else{
			serie = this.getSerie(node, metric_name, bunit, min, max);
		}

		if (! serie) {
			log.error('Impossible to get serie, node: '+ node + ' metric: '+ metric_name, this.logAuthor);
			return;
		}

		if (! serie.options) {
			log.error("Impossible to read serie's option", this.logAuthor);
			log.dump(serie);
			return;
		}

		//Add war/crit line if on first serie
		if (this.chart.series.length == 1 && this.showWarnCritLine) {
			if (data['thld_warn']) {
				var value = data['thld_warn'];
				if (this.SeriePercent && serie.options.max > 0)
						value = getPct(value, serie.options.max);
				this.addPlotlines('pl_warning', value, 'orange');
			}
			if (data['thld_crit']) {
				var value = data['thld_crit'];
				if (this.SeriePercent && serie.options.max > 0)
						value = getPct(value, serie.options.max);
				this.addPlotlines('pl_critical', value, 'red');
			}

			this.showWarnCritLine = false;
		}

		var serie_id = serie.options.id;

		values = this.parseValues(serie, values);

		log.debug('  + Add data for ' + node + ', metric "' + metric_name + '" ...', this.logAuthor);

		if (values.length <= 0) {
			log.debug('   + No data', this.logAuthor);
			if (this.reportMode) {
				if (serie.visible) {
					serie.setData([], false);
					serie.hide();
				}
				return true;
			}else {
				return false;
			}
		}

		if (this.reportMode) {
			if (! serie.visible) {
				serie.show();
			}
		}

		if (! this.series[serie_id].pushPoints || this.reportMode) {
			log.debug('   + Set data', this.logAuthor);
			this.first = values[0][0];

			serie.setData(values, false);
			this.series[serie_id].pushPoints = true;

		}else {
			log.debug('   + Push data', this.logAuthor);

			var i;
			for (i in values) {
				value = values[i];
				//addPoint (Object options, [Boolean redraw], [Boolean shift], [Mixed animation]) :
            	serie.addPoint(value, false, this.shift, false);
			}
		}

		return true;
	},

	addTrendLines: function(data) {
		log.debug(' + Trend line', this.logAuthor);
		var referent_serie = this.series_hc[data.node + '.' + data.metric];
		var trend_id = data.node + '.' + data.metric + '-TREND';

		//get the trend line
		var trend_line = this.chart.get(trend_id);

		//update/create the trend line
		if (trend_line) {
			log.debug('  +  Trend line found : ' + trend_id, this.logAuthor);

			//add data
			for (var i in data.values)
				this.data_trends[trend_id].push(data.values[i]);

			//slice data (follow referent serie length)
			if (this.shift)
				this.data_trends[trend_id].splice(0, data.values.length);

			if (this.data_trends[trend_id].length > 2) {
				//compute data
				var line = fitData(this.data_trends[trend_id]).data;

				//trunc value
				line = this.truncValueArray(line);

				//set data
				trend_line.setData(line, false);
			} else {
				log.debug('  +  not enough data to draw trend line');
			}
		}else {
			log.debug('  +  Trend line not found : ' + trend_id, this.logAuthor);
			log.debug('  +  Create it', this.logAuthor);

			//name
			var curve = global.curvesCtrl.getRenderInfo(data.metric);

			// Set Label
			var label = undefined;
			if (curve)
				label = curve.get('label') + '-TREND';
			else
				label = data.metric + '-TREND';

			//color
			var color = undefined;
			if (referent_serie.options.color)
				color = referent_serie.options.color;

			//serie
			var serie = {
				id: trend_id,
				type: 'line',
				name: label,
				data: [],
				marker: {enabled: false},
				dashStyle: this.trend_lines_type
				//lineWidth: 1
			};
			if (color)
				serie['color'] = color;

			//push the trendline in hichart, load trend data
			this.chart.addSeries(Ext.clone(serie), false, false);
			var hcserie = this.chart.get(trend_id);

			this.data_trends[trend_id] = Ext.clone(data.values);

			if (this.data_trends[trend_id].length > 2) {
				var line = fitData(this.data_trends[trend_id]).data;

				//trunc value
				line = this.truncValueArray(line);

				log.debug('  +  set data', this.logAuthor);
				hcserie.setData(line, false);
			}else {
				log.debug('  +  not enough data to draw trend line');
			}
		}
	},

	truncValueArray: function(value_array) {
		for (var i in value_array) {
			value_array[i][1] = Math.floor(value_array[i][1] * 1000) / 1000;
		}
		return value_array;
	},

	processNodes: function() {
		var post_params = [];
		for (var i in this.nodes) {
			post_params.push({
				id: this.nodes[i].id,
				metrics: this.nodes[i].metrics
			});
		}
		this.post_params = {
			'nodes': Ext.JSON.encode(post_params),
			'aggregate_method' : this.aggregate_method
			};

		if (this.chart_type == 'column')
			this.post_params.interval = this.refreshInterval;

		if (this.use_window_ts)
			this.post_params.use_window_ts = this.use_window_ts;
	},

 	beforeDestroy: function() {
		this.callParent(arguments);

 		if (this.chart) {
			this.chart.destroy();
			log.debug(' + Chart Destroyed', this.logAuthor);
		}
 	}

});
