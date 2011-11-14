Ext.define('widgets.host_header.host_header' ,{
	extend: 'canopsis.lib.view.cwidget',

	alias : 'widget.host_header',

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
