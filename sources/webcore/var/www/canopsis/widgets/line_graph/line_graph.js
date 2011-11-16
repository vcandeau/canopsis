Ext.define('widgets.line_graph.line_graph' ,{
	extend: 'canopsis.lib.view.cwidget',

	alias : 'widget.line_graph',

	layout: 'fit',

	start: false,

	logAuthor: '[line_graph]',

	options: {},
	chart: false,

	// TODO
	shift: false,

	time_window: 86400,

	initComponent: function() {
		log.debug('Init Line Graph '+this.id, this.logAuthor)
		log.debug(' + NodeId: '+ this.nodeId, this.logAuthor)

		this.callParent(arguments);

		log.debug(" + Get config "+this.id+" ...", this.logAuthor)
		Ext.Ajax.request({
			url: '/rest/perfdata/raw/'+this.nodeId,
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

		/*if (this.title) {
			title = this.title;
			this.border = false
		}*/

		this.options = {
			chart: {
				renderTo: this.divId,
				zoomType: 'x',
				defaultSeriesType: 'area',
				height: this.divHeight,
				//marginTop : 100,
				//width: 300,
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
				min: Date.now() - (this.time_window * 1000),
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
				area: {
					lineWidth: 1,
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
		this.metrics = config.metrics
			
		var i;
		for (i in config.metrics){
			metric = config.metrics[i]
			log.debug("   + Metric "+metric+":", this.logAuthor)

			this.start[metric] = false

			var name = metric
			if ( config.perf_data[metric]['unit']){
				name = name + " ("+config.perf_data[metric]['unit']+")"
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
		}


		this.chart = new Highcharts.Chart(this.options);
		this.doRefresh();
	},

	doRefresh: function (){
		if (this.chart){
			var metrics_txt = ""
			var i;
			for (i in this.metrics){
				metrics_txt += this.metrics[i] + ","
			}

			log.debug(" + Refresh metrics '"+metrics_txt+"' ...", this.logAuthor)

			var url = '/perfstore/'+this.nodeId+'/'+metrics_txt

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

					if (data[0]){
						this.start = data[0].values[data[0].values.length-1][0];
					}
					this.chart.redraw();
				},
				failure: function ( result, request) {
					log.error("Ajax request failed ... ("+request.url+")", this.logAuthor)
				} 
			})
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

});
