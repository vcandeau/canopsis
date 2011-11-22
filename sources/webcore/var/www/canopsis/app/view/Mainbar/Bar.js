Ext.define('canopsis.view.Mainbar.Bar' ,{
	extend: 'Ext.toolbar.Toolbar',

	alias: 'widget.Mainbar',

	border: false,

	layout: {
		type: 'hbox',
		align: 'stretch',
		//padding: 5
	},

	baseCls: 'Mainbar',

	initComponent: function() {
		this.items = [
			{
				iconCls: 'icon-mainbar-run',
				text: 'Run'
			},{
				iconCls: 'icon-mainbar-build',
				text: 'Build'
			},{
				iconCls: 'icon-mainbar-report',
				text: 'Report'
			},'-',{
				xtype: 'container',
				html: "<div class='cps-title' >Canopsis</div>"
			},'->',{
				xtype: 'container',
				html: "<div class='cps-account' >"+global.account.firstname+" "+global.account.lastname+"</div>",
				width: 300
			},'-',{
				iconCls: 'icon-preferences',
				menu: {
					showSeparator: true,
					items: [
							{
								iconCls: 'icon-console',
								text: 'Show log console',
								action: 'showconsole'
							},{
								iconCls: 'icon-clear',
								text: 'Clear tabs cache',
								action: 'cleartabscache'
							},'-',{
								iconCls: 'icon-logout',
								text: 'Logout',
								action: 'logout'
							},
						],
				}
			}
		]
		this.callParent(arguments);
	}

});
