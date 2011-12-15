Ext.define('canopsis.view.Reporting.Reporting' ,{
	extend: 'Ext.toolbar.Toolbar',

	alias: 'widget.Reporting',
	
	dock: 'top',
	
	initComponent: function() {
		this.callParent(arguments);
		
		var comboStore = Ext.create('Ext.data.Store', {
			fields: ['name', 'value'],
			data : [
				{"name":"Day", "value":86400},
				{"name":"Week", "value":604800},
				{"name":"Month", "value":2629800},
				{"name":"Year", "value":31557600}
			]
		});
		
		comboStore.load();
		
		this.combo = this.add({
			xtype: 'combobox',
			store: comboStore,
			queryMode: 'local',
			displayField: 'name',
			valueField: 'value',
			forceSelection : true,
			value : 'Day'
		});
		
		this.combo.setValue(86400)
		
		this.add({ xtype: 'tbspacer', width: 400 });
		
		this.previousButton = this.add({
			xtype: 'button', // default for Toolbars
			//text: '<',
			cls: 'x-btn-icon x-tbar-page-prev',
			action: 'previous'
		})
		
		this.currentDate = this.add({
			xtype: 'datefield',
			name: 'from',
			//fieldLabel: 'From',
			value: new Date(),
			maxValue: new Date(),
			//format: 'd m Y',
		})
		
		this.nextButton = this.add({
			xtype: 'button', // default for Toolbars
			cls: 'x-btn-icon x-tbar-page-next',
			//text: '>',
			action: 'next'
		})
		
		this.add('->');
		
		this.requestButton = this.add({
			xtype: 'button', // default for Toolbars
			iconCls: 'icon-reload',
			text: 'request',
			action: 'request'
		})
	}
	
});
