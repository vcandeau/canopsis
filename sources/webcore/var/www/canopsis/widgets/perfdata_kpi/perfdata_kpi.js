Ext.define('widgets.perfdata_kpi.perfdata_kpi' ,{
	extend: 'canopsis.lib.view.cwidget',

	alias : 'widget.perfdata_kpi',
	
	logAuthor: '[perfdata_kpi]',
	
	iconset: '1',
	
	initComponent: function() {
		log.debug('Init Weather kpi '+this.id, this.logAuthor)
		log.debug(' + NodeId: '+ this.nodeId, this.logAuthor)

		this.callParent(arguments);
		
		
	},
	
	onRefresh: function(data){
		
		//formating iconset name
		if(this.iconset < 10){
			var icon = '0' + this.iconset
		}else{
			var icon = this.iconset
		}
		
		//calculer % of metric
		
		
		
		if (data.perf_data_array){
			var value = data.perf_data_array		
			if(data.perf_data_array[this.metric]){
				data = data.perf_data_array[this.metric];

				//give the health , 0% very bad , 100% all clear , and rounded
				if(data.max){
					var health = Math.round((100 - (data.value / data.max * 100)) / 10) *10;
				} else if(data.crit){
					var health = Math.round((100 - (data.value / data.crit * 100)) / 10) *10;
				} else {
					log.debug('impossible to calculate health (no max value in data)', this.logAuthor)
					this.setHtml("<center><div>impossible to calculate health (no max value in data)</br>change it in the view editor</div></center>");
				}
				
				switch (health){
					case 0:
						this.setHtml("<center><span class='kpi kpi_iconSet"+icon+"_0-10'/></center>");
						break;
					case 10:
						this.setHtml("<center><span class='kpi kpi_iconSet"+icon+"_10-20'/></center>");
						break;
					case 20:
						this.setHtml("<center><span class='kpi kpi_iconSet"+icon+"_20-30'/></center>");
						break;
					case 30:
						this.setHtml("<center><span class='kpi kpi_iconSet"+icon+"_30-40'/></center>");
						break;
					case 40:
						this.setHtml("<center><span class='kpi kpi_iconSet"+icon+"_40-50'/></center>");
						break;
					case 50:
						this.setHtml("<center><span class='kpi kpi_iconSet"+icon+"_50-60'/></center>");
						break;
					case 60:
						this.setHtml("<center><span class='kpi kpi_iconSet"+icon+"_60-70'/></center>");
						break;
					case 70:
						this.setHtml("<center><span class='kpi kpi_iconSet"+icon+"_70-80'/></center>");
						break;
					case 80:
						this.setHtml("<center><span class='kpi kpi_iconSet"+icon+"_80-90'/></center>");
						break;
					case 90:
						this.setHtml("<center><span class='kpi kpi_iconSet"+icon+"_90-100'/></center>");
						break;
					case 100:
						this.setHtml("<center><span class='kpi kpi_iconSet"+icon+"_90-100'/></center>");
						break;
				}
			}
		}else{
			log.debug('no perfdata', this.logAuthor)
			this.setHtml("<center><div>No perfdata for the nodeId specified</br>change it in the view editor</div></center>");
		}
	},
	
	
});
