Ext.define('canopsis.controller.Widgets', {
    extend: 'Ext.app.Controller',

    //views: ['Widgets.kpi', 'Widgets.host_header'],
    stores: ['Widget'],
    models: ['inventory'],

    init: function() {
		Ext.Loader.setPath('widgets', './widgets');
		this.store = this.getStore('Widget');
		log.debug('[controller][Widgets] : parsing Widget store');
		this.store.on('load',function(){
			this.store.each(function(record){
				log.debug('[controller][Widgets] : loading ' + record.data.xtype);
				var name ='widgets.' + record.data.xtype + '.' + record.data.xtype ;
				Ext.require(name);
			});
			
			// small hack
			setTimeout(function(ctrl){ ctrl.fireEvent('loaded'); },1000, this);

		}, this);
    },
    
	
});
