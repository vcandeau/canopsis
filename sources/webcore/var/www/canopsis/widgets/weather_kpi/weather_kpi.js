Ext.define('widgets.weather_kpi.weather_kpi' ,{
	extend: 'canopsis.lib.view.cwidget',

	alias : 'widget.weather_kpi',
	
	logAuthor: '[weather_kpi]',
	
	iconset: 'meteo1',
	
	initComponent: function() {
		log.debug('Init Weather kpi '+this.id, this.logAuthor)
		log.debug(' + NodeId: '+ this.nodeId, this.logAuthor)

		this.callParent(arguments);
		
		
	},
	
	onRefresh: function(data){
		this.setHtml("<center><img src='widgets/weather_kpi/icon_set/"+this.iconset+"/"+data.state+".png'/></center>");
	},
	
	
});
