Ext.define('canopsis.view.Widgets.header' ,{
	extend: 'canopsis.lib.view.cwidget',

	alias : 'widget.header',

	htmlTpl: new Ext.Template('<strong>{id}</strong>', {compiled: true}),

	initComponent: function() {
		this.refreshInterval = 0
		this.callParent(arguments);		
	},

	onRefresh: function(data){
		this.data = data
		this.setHtmlTpl(this.htmlTpl, data)
	}
});
