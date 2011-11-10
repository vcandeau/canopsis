Ext.define('canopsis.view.Widgets.kpi' ,{
	//extend: 'Ext.container.Container',
	extend: 'Ext.panel.Panel',
	alias : 'widget.kpi',

	only_hard: true,
  	iconset: 'meteo1',
	type: 'state',

	colors: {
		up: '#50b432',
		down: '#ed241b',
		unreachable: '#f0f0ff',
		ok : '#50b432',
		warning: '#ed941b',
		critical: '#ed241b',
		unknown: '#f0f0ff' 
	},

	items: [{html: 'KPI: No data. Please wait ...'}],

	layout: {
		type: 'hbox',
		align: 'stretch'
	},

	initComponent: function() {
		log.debug('Init KPI '+this.id)
		var me = this
		log.debug(' - Id: '+ this.nodeId)

		var border = 1
		if (this.border == 0){
			this.title = ''
			this.border = 0
		}
		this.previous_state = -1
		this.defaults = { flex: 1, border: 0 }

		this.callParent(arguments);

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
	

	getHtml: function (state){
		return "<center><img src='resources/icons/"+this.iconset+"/"+state+".png'/></center>"
	},

	refresh_ui: function(){
		if (this.type == 'state'){

			state_type = this.data.state_type
			state = this.data.state

			var refresh = true
			if (this.only_hard && (state_type != 1)){
				refresh = false
				log.debug(" + Show only Hard State")
			}
				
			if (refresh) {
				if (this.last_state != state) {
					log.debug("Update state ...")
					this.removeAll()
					this.add({html: this.getHtml(this.data.state)})
					this.doLayout();
					this.last_state = state
				}
			}
		
		}else if (this.type == 'speedometer') {

			var value = this.data.perf_data_array[this.label]['value']
			var unit = this.data.perf_data_array[this.label]['unit']

			if (! this.jgauge){
				log.debug(' + Init gauge div ...')
				this.removeAll()
				this.add({html: "<div id='jgauge-"+this.id+"' class='jgauge'></div>"})
				this.doLayout();

				log.debug(' + Create gauge ...')
				this.jgauge = new jGauge()
				this.jgauge.id = 'jgauge-'+this.id

				this.jgauge.ticks.count = 5
				this.jgauge.ticks.start = 0
				this.jgauge.ticks.end = 100

				this.jgauge.label.suffix = unit
			
				var orig_start = -200
				var orig_end = 20

				var total = 220
			
				this.jgauge.range.radius = 50;
				this.jgauge.range.thickness = 10;
				this.jgauge.range.start = (( 90 * total) / 100) + orig_start ;
				this.jgauge.range.end = (( 100 * total) / 100) + orig_start;
				this.jgauge.range.color = 'rgba(0, 255, 0, 0.5)';
		
				this.jgauge.init();

			}			

			if (value){
				if (this.last_value != value) {
					log.debug(' + Update gauge ...')
					this.jgauge.setValue(value);
					this.last_value = value
				}
			}
			
		}else if (this.type == 'pie') {
			var value = this.data.perf_data_array

			if (! this.chart){
				this.removeAll()
				this.add({html: "<div id='pie-"+this.id+"' style=height:100%></div>"})
				this.doLayout();

				this.options = 
					{
						defaultHeight: 100,
						grid: {
							borderWidth: 0,
							shadow: false,
							background: 'transparent'
						},
						seriesDefaults: {
							renderer: jQuery.jqplot.PieRenderer,
							rendererOptions: {
								showDataLabels: true
							}
						},
						legend: {
							show:true,
							location: 'e',
						}
					}
			}

			if (value){
				if (this.last_value != value) {
					log.debug(' + Update pie ...')

					var values = []
					var legend = []
					var colors = ['#fff']

					var ok = Math.round(this.data.perf_data_array['ok']['value'])
					var warn = Math.round(this.data.perf_data_array['warn']['value'])
					var crit = Math.round(this.data.perf_data_array['crit']['value'])
					var unkn = Math.round(this.data.perf_data_array['unkn']['value'])

					this.options.seriesColors = []
					if (ok > 0){   values.push(['Ok', ok]);	       this.options.seriesColors.push(this.colors['ok']);}
					if (warn > 0){ values.push(['Warning', warn]); this.options.seriesColors.push(this.colors['warning']);}
					if (crit > 0){ values.push(['Critical', crit]);this.options.seriesColors.push(this.colors['critical']);}
					if (unkn > 0){ values.push(['Unknown', unkn]); this.options.seriesColors.push(this.colors['unknown']);}

					//log.debug('  + ok: '+ok)
					//log.debug('  + warn: '+warn)
					//log.debug('  + crit: '+crit)
					//log.debug('  + unkn: '+unkn)

					//var legendpos = "east";

					if (! this.chart){
						this.chart = jQuery.jqplot("pie-"+this.id, [values], this.options);
					}else{
						this.chart.series[0].data = values
						//this.chart.series[0].color = "#FF0000"
						this.chart.replot(this.options)
					}

					this.last_value = ok+'-'+warn+'-'+crit+'-'+unkn
				}
			}
		}
	},

	refresh: function (){
		//log.debug("Refresh "+this.id+" ...")
		Ext.Ajax.request({
			url: '/rest/inventory/event/'+this.nodeId,
			scope: this,
			success: function(response){
				data = Ext.JSON.decode(response.responseText)

				data = data.data[0]
				this.data = data

				this.refresh_ui()
			},
			failure: function ( result, request) {
				log.error("Ajax request failed ... ("+request.url+")")
			} 
		})

	}
});
