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
				text: 'Run',
				//flex : 0.5
			},{
				text: 'Build',
				//flex : 0.5
			},{
				text: 'Report',
				//flex : 0.5
			},'-',{
				xtype: 'container',
				html: "<div class='cps-title' >Canopsis</div>",
				flex : 1
			},/*{
				xtype : 'container',
				width : 300
			},*/{
				xtype : 'container',
				name : 'clock',
				align : 'strech',
				flex : 4
			},'->',{
				xtype: 'container',
				html: "<div class='cps-account' >"+global.account.firstname+" "+global.account.lastname+"</div>",
				flex:2.3
			},'-',{
				iconCls: 'icon-preferences',
				flex : 0.2,
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
