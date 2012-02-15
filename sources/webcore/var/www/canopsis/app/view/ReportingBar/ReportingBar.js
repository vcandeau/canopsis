Ext.define('canopsis.view.ReportingBar.ReportingBar' ,{
	extend: 'Ext.toolbar.Toolbar',

	alias: 'widget.ReportingBar',
	
	dock: 'top',
	
	initComponent: function() {
		this.callParent(arguments);
		
		//---------------------- Create items --------------------------------
		
		var comboStore = Ext.create('Ext.data.Store', {
			fields: ['name', 'value'],
			data : [
				{"name":_("Day"), "value":global.commonTs.day},
				{"name":_("Week"), "value":global.commonTs.week},
				{"name":_("Month"), "value":global.commonTs.month},
				{"name":_("Year"), "value":global.commonTs.year}
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
			value : _('Day')
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
			//fieldLabel: _('From'),
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
			text: _('request'),
			action: 'request'
		})
		
		this.saveButton = this.add({
			xtype: 'button', // default for Toolbars
			iconCls: 'icon-save',
			//text: _('request'),
			action: 'save',
			tooltip: _('export this view to pdf')
		})
		
		this.linkButton = this.add({
			xtype: 'button', // default for Toolbars
			iconCls: 'icon-page-html',
			action: 'link',
			tooltip: _('view page in html')
		})
		
		
		
		
	}
	
});
