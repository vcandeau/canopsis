Ext.define('canopsis.controller.Widgets', {
    extend: 'Ext.app.Controller',

    //views: ['Widgets.kpi', 'Widgets.host_header'],
    stores: ['Widget'],

    init: function() {
		Ext.Loader.setPath('widgets', './widgets');
		var store = this.getStore('Widget');
		log.debug('[controller][Widgets] : parsing Widget store');
		store.on('load',function(){
			this.each(function(record){
				log.debug('[controller][Widgets] : loading ' + record.data.xtype);
				var name ='widgets.' + record.data.xtype + '.' + record.data.xtype ;
				Ext.require(name);
			});
			
		});
    },
    
	
});
