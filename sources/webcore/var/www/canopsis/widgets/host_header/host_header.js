Ext.define('widgets.host_header.host_header' ,{
	extend: 'canopsis.lib.view.cwidget',

	alias : 'widget.host_header',
	
	tpl: '<h1>{source_name} > {type} > {source_type} > {host_name}</h1>',

	htmlTpl: false,

	initComponent: function() {
		this.refreshInterval = 0
		this.htmlTpl = new Ext.Template(this.tpl, {compiled: true})
		this.callParent(arguments);		
	},

	onRefresh: function(data){
		this.data = data
		this.setHtmlTpl(this.htmlTpl, data)
	}
});
