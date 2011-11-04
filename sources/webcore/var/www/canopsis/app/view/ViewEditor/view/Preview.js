Ext.define('canopsis.view.ViewEditor.view.Preview', {
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
	
/*	
	//dummy entries -> testing preview 
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
		colspan : 2,
		rowspan : 2
	},{
		xtype : 'panel',
		html : '4',
		colspan : 5
	}],
*/
	initComponent: function() {
		this.callParent(arguments);	
		/*
		var totalWidth = Ext.getCmp('#ConfigPreview').getWidth() - 20;
		console.log(totalWidth);
		//if pass nbColumn , take this, else 5 by default
		if (this.nbColumn){
			var nbColumn = this.nbColumn;
			console.log('column defined');
		} else {
			var nbColumn = 5;
			console.log('column by default, 5');
		}
		
		*/
	}
});
