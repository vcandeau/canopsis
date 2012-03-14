Ext.define('canopsis.view.ReportingBar.ReportingBar' ,{
	extend: 'Ext.toolbar.Toolbar',

	alias: 'widget.ReportingBar',
	
	dock: 'top',
	
	//false to prevent reloading after choosing date/duration
	reloadAfterAction: false,
	
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
			xtype: 'button', 
			cls: 'x-btn-icon x-tbar-page-prev',
			action: 'previous'
		})
		
		this.currentDate = this.add({
			xtype: 'datefield',
			name: 'from',
			value: new Date(),
			maxValue: new Date(),
		})
		
		this.nextButton = this.add({
			xtype: 'button', 
			cls: 'x-btn-icon x-tbar-page-next',
			action: 'next'
		})
		
		this.add('->');
		
		if(this.reloadAfterAction == false){
			this.requestButton = this.add({
				xtype: 'button', 
				iconCls: 'icon-reload',
				text: _('Refresh'),
				action: 'request'
			})
		}
		
		this.saveButton = this.add({
			xtype: 'button', 
			iconCls: 'icon-save',
			action: 'save',
			tooltip: _('Export this view to pdf')
		})
		
		this.linkButton = this.add({
			xtype: 'button', 
			iconCls: 'icon-page-html',
			action: 'link',
			tooltip: _('View page in html')
		})
		
		this.exitButton = this.add({
			xtype: 'button', 
			iconCls: 'icon-exit',
			action: 'exit',
			tooltip: _('Leave reporting mode')
		})
	}
	
});
