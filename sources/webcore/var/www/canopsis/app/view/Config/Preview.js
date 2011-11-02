Ext.define('canopsis.view.Config.Preview', {
    extend: 'Ext.form.Panel',
    alias: 'widget.ConfigPreview',

	layout: {
		type: 'table',
		columns : 5
	},
	
	defaults: {
		//width:40, 
		height: 40,
		padding:4,
		//margin:2
		tableAttrs: {
			style: {
				width: '100%',
            		}
		},
	},
	
	items: [{
		xtype : 'panel',
		html : '1',
		//colspan : 1
		
	},{
		xtype : 'panel',
		html : '2',
		colspan : 2
	},{
		xtype : 'panel',
		html : '3',
		colspan : 2
	},{
		xtype : 'panel',
		html : '4',
		colspan : 5
	}]
});
