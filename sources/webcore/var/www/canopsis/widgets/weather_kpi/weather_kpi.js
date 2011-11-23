Ext.define('widgets.weather_kpi.weather_kpi' ,{
	extend: 'canopsis.lib.view.cwidget',

	alias : 'widget.weather_kpi',
	
	logAuthor: '[weather_kpi]',
	
	iconset: '1',
	
	initComponent: function() {
		log.debug('Init Weather kpi '+this.id, this.logAuthor)
		log.debug(' + NodeId: '+ this.nodeId, this.logAuthor)

		this.callParent(arguments);
		
		
	},
	
	onRefresh: function(data){
		
		if(this.iconset < 10){
			var icon = '0' + this.iconset
		}else{
			var icon = this.iconset
		}
		
		if(data.state == 2){
			this.setHtml("<center><span class='kpi kpi_iconSet"+icon+"_0-10'/></center>");
		}else if(data.state == 1){
			this.setHtml("<center><span class='kpi kpi_iconSet"+icon+"_50-60'/></center>");
		} else {
			this.setHtml("<center><span class='kpi kpi_iconSet"+icon+"_90-100'/></center>");
		}
	},
	
	
});
