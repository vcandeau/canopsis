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
		
		this.add('-');
		
		this.beforeButton = this.add({
			xtype: 'button', // default for Toolbars
			text: '<',
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
		
		this.afterButton = this.add({
			xtype: 'button', // default for Toolbars
			text: '>',
			action: 'next'
		})
		
		this.add('-');
		
		this.requestButton = this.add({
			xtype: 'button', // default for Toolbars
			text: 'request',
			action: 'request'
		})
		

		
		/*
		this.reportFrom = this.add({
			xtype: 'datefield',
			name: 'from',
			fieldLabel: 'From',
			value: new Date(),
			maxValue: new Date(),
		})

		this.reportTo = this.add({
			xtype: 'datefield',
			name: 'to',
			fieldLabel: 'To',
			value: new Date(),
			maxValue: new Date(),
		})
		
		this.reportButton = this.add({
			xtype: 'button', // default for Toolbars
			text: 'fetch',
		})*/
	}
	
});
