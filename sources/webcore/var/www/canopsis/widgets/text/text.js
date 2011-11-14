Ext.define('widgets.text.text' ,{
	extend: 'canopsis.lib.view.cwidget',
	
	alias : 'widget.text',

	initComponent: function() {
		this.nodeId = false
		this.callParent(arguments);
	},

	doRefresh: function (){
		if (this.text){
			this.setHtml(this.text);
		}
	}
	
});
