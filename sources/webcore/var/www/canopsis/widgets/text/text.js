Ext.define('widgets.text.text' ,{
	extend: 'canopsis.lib.view.cwidget',
	
	alias : 'widget.text',
	
	initComponent: function() {
		this.callParent(arguments);
		this.add({
			xtype : 'panel',
			html : this.options[0].value,
			border: 0
		});
	},
	
});
