// initComponent -> get_config -> init_js -> init_task -> refresh -> refresh_metric(metric) -> add_data(metric)

Ext.define('canopsis.view.Widgets.highcharts' ,{
	//extend: 'Ext.container.Container',
	extend: 'Ext.panel.Panel',
	alias : 'widget.highcharts',

	items: [{html: 'No data. Please wait ...'}],

	layout: {
		type: 'hbox',
		align: 'stretch'
	},

	start: {},

	colors: {
		ok : '#50b432',
		warn: '#ed941b',
		crit: '#ed241b',
		unkn: '#f0f0ff' 
	},

	default_colors: [
		'#4572A7', 
		'#AA4643', 
		'#89A54E', 
		'#80699B', 
		'#3D96AE', 
		'#DB843D', 
		'#92A8CD', 
		'#A47D7C', 
		'#B5CA92'
	],

	type: 'line', //stock or pie
	max_data: 5,

	initComponent: function() {
		log.debug('Init Graph '+this.id)
		log.debug(' + Id: '+ this._id)

		var border = 1
		if (this.border == 0){
			this.title = ''
			this.border = 0
		}
		this.previous_state = -1
		this.defaults = { flex: 1, border: 0 }

		this.callParent(arguments);

		this.get_config();
			
	},

	get_config: function(){
		log.debug(" + Get config "+this.id+" ...")
		Ext.Ajax.request({
			url: '/rest/perfdata/raw/'+this._id,
			scope: this,
			success: function(response){
				data = Ext.JSON.decode(response.responseText)
				config = data.data[0]

				this.init_js(config)

			},
			failure: function ( result, request) {
				log.error("Ajax request failed ... ("+request.url+")")
			} 
		})
	},

	init_js: function(config){
		log.debug(' + Init Graph ...')
		//log.debug(config)

		//HTML
		this.removeAll()
		var height = this.height
		if (this.title != ""){height -= 25}

		this.add({html: "<div id='graph-"+this.id+"' style='height: "+height+"'></div>"})
		this.doLayout();

		//HighChart Common Options
		this.options = {
			chart: {
				renderTo: "graph-"+this.id,
				zoomType: 'x',
				//marginTop : 100,
				//width: 300,
				
			},
			exporting: {
				enabled: false
			},
			colors: [],
			title: {
				text: ''
			},
			tooltip: {
				enabled: true
			},
			xAxis: {
				min: Date.now() - (60 * 60 * 24 * 1000), // 24hours
				maxZoom: 60 * 60 * 1000, // 1 hour
			},
			yAxis: {
				title: {
					text: ''
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


		// Options by type
		if (this.type == 'line'){
			this.options['chart']['defaultSeriesType'] = 'area'
			this.options['plotOptions'] = {
					area: {
						lineWidth: 1,
						marker: {
							enabled: false,
						}
				 	}
			      	};


			this.options['tooltip'] = { formatter: function() {
						return '<b>' + Ext.Date.format(new Date(this.x), 'd/m/y h:i') + '<br/>' + this.series.name + ':</b> ' + this.y;
					}
				};


			this.options['xAxis']['labels'] = { formatter: function() {
						return Ext.Date.format(new Date(this.value), 'H:i');
					}
				};

		}else if (this.type == 'stock'){

			this.options['rangeSelector'] =  {
				buttons: [ {
							type: 'all',
							text: 'All'
						}, {
							type: 'day',
							count: 1,
							text: '1d'
						}, {
							type: 'day',
							count: 7,
							text: '7d'
						}, {
							type: 'month',
							count: 1,
							text: '1m'
						}, {
							type: 'year',
							count: 1,
							text: '1y'
					}],
					selected: 0,
					inputEnabled: false,
				}

		}else if (this.type == 'pie'){
			this.options['tooltip'] = {
					formatter: function() {
 						return '<b>'+ this.point.name +'</b>: '+ this.y +' %';
					}
				};
			this.options['plotOptions'] = {
 					pie: {
						allowPointSelect: true,
						cursor: 'pointer',
						dataLabels: {
							enabled: false
						},
						showInLegend: true
					},
					color: '#FF0000',
			      	};		
		}

		

		//Extract metrics

		if (this.type == 'pie'){
			this.options.series.push({type: 'pie', data: []})
		}else {
			this.metrics = config.metrics
			
			var i = 0
			for (metric in config.metrics){
				metric = config.metrics[metric]
				this.start[metric] = false

				var name = metric
				if ( config.perf_data[metric]['unit']){
					name = name + " ("+config.perf_data[metric]['unit']+")"
				}

				if (this.colors[metric]){
					this.options.colors.push(this.colors[metric])
				}else{
					this.options.colors.push(this.default_colors[i])
				}

				this.options.series.push({name: name, data: []})
				i+=1
			}
		}

		log.debug(' + Create graphe')
		if (this.type == 'line' || this.type == 'pie'){
			this.chart = new Highcharts.Chart(this.options);
		}else if (this.type == 'stock'){
			this.chart = new Highcharts.StockChart(this.options);
		}

		this.init_task()
	},

	init_task: function(){
		if (this.refreshInterval > 0){
			log.debug(' - refreshInterval: '+this.refreshInterval)
			this.task = {
				run: this.refresh,
				scope: this,
				interval: this.refreshInterval * 1000
			}
			Ext.TaskManager.start(this.task);
		
			this.mytab.on('show', function(){
				Ext.TaskManager.start(this.task);
			}, this);
			this.mytab.on('hide', function(){
				Ext.TaskManager.stop(this.task);
			}, this);

		}else{
			this.refresh()
		}
	},

	refresh: function (){
		log.debug("Refresh "+this.id+" ...")

		if (this.type == 'pie'){
			this.refresh_metric()	
		}else{
			for (metric in this.metrics){
				metric = this.metrics[metric]
				log.debug(" + Refresh metric '"+metric+"' ...")
				this.refresh_metric(metric)
			}
		}

	},

	refresh_metric: function (metric){
		//log.debug(" + Refresh metric "+metric+" ...")

		if (this.type == 'pie'){
			var url = '/rest/inventory/event/'+this._id
		}else{
			var url = '/perfstore/'+this._id+'/'+metric
			if (this.start[metric]){
				// only last values
				url = url + '/' + (this.start[metric]+1000)
			}
		}

		Ext.Ajax.request({
			url: url,
			scope: this,
			success: function(response){
				data = Ext.JSON.decode(response.responseText)

				data = data.data[0]
				this.data = data

				this.add_data(data)
			},
			failure: function ( result, request) {
				log.error("Ajax request failed ... ("+request.url+")")
			} 
		})

	},

	add_data: function(data) {

		if (this.type == 'pie'){
			var ok = Math.round(data.perf_data_array['ok']['value'])
			var warn = Math.round(data.perf_data_array['warn']['value'])
			var crit = Math.round(data.perf_data_array['crit']['value'])
			var unkn = Math.round(data.perf_data_array['unkn']['value'])

			var values=[]
			/*if (ok > 0){   values.push({ name: 'Ok', y: ok});}
			if (warn > 0){ values.push({ name: 'Warning', y: warn});}
			if (crit > 0){ values.push({ name: 'Critical', y: crit});}
			if (unkn > 0){ values.push({ name: 'Unknown', y: unkn});}*/

			values.push({ name: 'Ok', y: ok, color: this.colors['ok']});
			values.push({ name: 'Warning', y: warn, color: this.colors['warn']});
			values.push({ name: 'Critical', y: crit, color: this.colors['crit']});
			values.push({ name: 'Unknown', y: unkn, color: this.colors['unkn']});

			//log.dump(values)

			if (this.chart){
				this.chart.series[0].setData(values)
			}
			return true
		}

		var metric = data['metric']
		var values = data['values']

		if (values.length <= 0){
			return false
		}

		log.debug(' + Add data on graph ...')

		metric_id = this.metrics.indexOf(metric)
		log.debug('  + Set data for serie '+metric+' ('+metric_id+') ...')

		if (this.chart){
			
			if (! this.start[metric]){
				log.debug(' + Set data')
				this.chart.series[metric_id].setData(values,true);
			}else{
				log.debug(' + Push data')
				for (value in values) {
					value = values[value]
					//log.dump(this.chart.series[metric_id])
					//addPoint (Object options, [Boolean redraw], [Boolean shift], [Mixed animation]) : 
            				this.chart.series[metric_id].addPoint(value, true, false, false);
				}
			}
		}

		//log.dump(this.chart.series[metric_id])
		this.start[metric] = values[values.length-1][0]

		return true
	},

});
