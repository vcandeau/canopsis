Ext.define('widgets.pie.pie' ,{
	extend: 'canopsis.lib.view.cwidget',

	alias : 'widget.pie',
	
	logAuthor: '[pie]',
	
	//the pie does note support css color name, so must use the following
	colors: {
		up: '#50b432',
		down: '#ed241b',
		unreachable: '#f0f0ff',
		ok : '#50b432',
		warning: '#ed941b',
		critical: '#ed241b',
		unknown: '#f0f0ff' 
	},
	
	initComponent: function() {
		log.debug('Init pie kpi '+this.id, this.logAuthor)
		log.debug(' + NodeId: '+ this.nodeId, this.logAuthor)
		this.callParent(arguments);
	},
	
	onRefresh: function(data){		
		if(!this.chart){
			this.setPie();
		}
		
		var value = data.perf_data_array
		
		if (value){
				var values = [];
				var legend = [];
				var colors = ['#fff'];

				if(value[this.metric]){
					var ok = Math.round(value[this.metric].ok);
					if (ok > 0){
						values.push(['Ok', ok]);
						this.options.seriesColors.push(this.colors['ok']);
						//this.options.seriesColors.push(global.default_colors[15]);
					}
					
					var warn = Math.round(value[this.metric].warn);
					if (warn > 0){
						values.push(['Warning', warn]);
						this.options.seriesColors.push(this.colors['warning']);
						//this.options.seriesColors.push(global.default_colors[12]);
					}
					
					var crit = Math.round(value[this.metric].crit);
					if (crit > 0){
						values.push(['Critical', crit]);
						this.options.seriesColors.push(this.colors['critical']);
						//this.options.seriesColors.push(global.default_colors[5]);
					}
					
					var unkn = Math.round(value[this.metric].unkn);
					if (unkn > 0){
						values.push(['Unknown', unkn]); 
						this.options.seriesColors.push(this.colors['unknown']);
						//this.options.seriesColors.push(global.default_colors[10]);
					}
				}
				if(values.length != 0){
					if (!this.chart){
						log.debug('Create the pie '+this.id, this.logAuthor)
						this.chart = jQuery.jqplot("pie-"+this.id, [values], this.options);
					}else{
						log.debug('update the pie '+this.id, this.logAuthor)
						this.chart.series[0].data = values
						//this.chart.series[0].color = "#FF0000"
						this.chart.replot(this.options)
					}
				}else{
					log.debug('Pie cannot be built,no crit/warn/unkn/ok found', this.logAuthor)
					this.setHtml("<center><div>There is no data to display</br>check if you set the right metric in view editor.</div></center>");
				}			
		}else{
			this.setHtml("<center><div>Impossible to display pie because</br>input data are invalid (check console)</div></center>");
		}
	},
	
	setPie : function(){
		this.setHtml("<div id='pie-"+this.id+"' style=height:100%></div>");
		
		this.options = {
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
		this.options.seriesColors = [];
	}
	
	
	
});
