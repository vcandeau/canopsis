// initComponent -> get_config -> init_js -> init_task -> refresh -> refresh_metric(metric) -> add_data(metric) -> refresh_chart:
//                                init_img
Ext.define('canopsis.view.Widgets.graph' ,{
	//extend: 'Ext.container.Container',
	extend: 'Ext.panel.Panel',
	alias : 'widget.graph',

	items: [{html: 'No data. Please wait ...'}],

	layout: {
		type: 'hbox',
		align: 'stretch'
	},

	start: {},

	type: 'js', //or js
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
			url: '/rest/perfdata_config/raw/'+this._id,
			scope: this,
			success: function(response){
				data = Ext.JSON.decode(response.responseText)
				config = data.data[0]

				if (this.type == 'js'){
					this.init_js(config)
				}else if(this.type == 'img'){
					this.init_img(config)
				}
			},
			failure: function ( result, request) {
				log.error("Ajax request failed ... ("+request.url+")")
			} 
		})
	},

	init_img: function(config){
		this.init_task()
	},

	init_js: function(config){
		log.debug(' + Init Graph ...')
		//log.debug(config)

		//HTML
		this.removeAll()
		var height = this.height
		if (this.title != ""){height -= 50}

		this.add({html: "<div id='graph-"+this.id+"' style=height:"+height+"></div>"})
		this.doLayout();

		//JQplot Options
		this.options = {
			grid: {
				borderWidth: 0,
				shadow: false,
				background: 'transparent'
			},
			//axesDefaults: {
        		//	labelRenderer: $.jqplot.CanvasAxisLabelRenderer
      			//},
			axes: {
				xaxis: {
					//label: "X Axis",
					autoscale: true,
					//min: 1316781500,
					//max: 1316782500,
					pad: 0,
					//renderer:$.jqplot.DateAxisRenderer,
					//tickOptions: {
					//	formatString: '%d/%m/%y %H:%M'
					//},
					//tickInterval: 300				
		
				},
				yaxis: {
					label: " ",
					//min: 0,
					//max: 100,
					pad: 0,
					autoscale: true,
					//rendererOptions: {
					//	forceTickAt0: true
					//}
				}
		     	},
			legend: {
				show: true,
				location: 'nw',
				
			},
			series: []
		}

		//Extract metrics
		this.metrics = []
		for (id in config.metrics){
			metric = config.metrics[id]['metric']
			this.metrics.push(metric)
			this.start[metric] = false
			this.options.series.push({label: metric, lineWidth: 1.5, showMarker: false})
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

		if (this.type == 'js'){
			for (metric in this.metrics){
				metric = this.metrics[metric]
				log.debug(" + Refresh metric '"+metric+"' ...")
				this.refresh_metric(metric)
			}
		}else if(this.type == 'img'){
			this.removeAll()
			var h = 170
			var w = 300
			this.add({html: "<img src='/perfstore_chart/"+this._id+"/"+h+"/"+w+"'></img>"})
			this.doLayout();			
		}
	

	},

	refresh_metric: function (metric){
		//log.debug(" + Refresh metric "+metric+" ...")

		var url = '/perfstore/'+this._id+'/'+metric
		if (this.start[metric]){
			// only last values
			url = url + '/' + this.start[metric]
		}

		Ext.Ajax.request({
			url: url,
			scope: this,
			success: function(response){
				data = Ext.JSON.decode(response.responseText)

				data = data.data[0]
				this.data = data

				if (this.add_data(data)){
					this.refresh_chart(metric)
				}
			},
			failure: function ( result, request) {
				log.error("Ajax request failed ... ("+request.url+")")
			} 
		})

	},

	add_data: function(data) {
		var metric = data['metric']
		var values = data['values']

		if (values.length <= 0){
			return false
		}

		log.debug(' + Update graph ...')

		if (! this.chart){
			log.debug('  + Create chart ...')
			init_values = []
			for (tmp in this.metrics){
				init_values.push([[0,0]])
			}
			this.chart = jQuery.jqplot("graph-"+this.id, init_values, this.options);
			//this.chart.replot(this.options)	
			//this.chart.resetAxesScale()
			
		}
				
		metric_id = this.metrics.indexOf(metric)
		log.debug('  + Set data for serie '+metric+' ('+metric_id+') ...')

		if (this.start[metric]){
			log.debug('    + Push')
			log.dump(values)
			this.chart.series[metric_id].data.push(values[0])
		}else{
			log.debug('    + Init data')
			this.chart.series[metric_id].data=values
		}

		// last timestamp ...
		this.start[metric] = values[values.length-1][0] + 1

		return true

		//if (this.chart.series[0].data.length > this.max_data){
		//	this.chart.series[0].data.shift()
		//}
	},

	refresh_chart: function(metric){
		log.debug(' + Reload charting ...')
		this.chart.resetAxesScale(true, this.options)		
		this.chart.replot(this.options)
		
	}


});
