Ext.define('canopsis.view.LiveSearch.View', {
    extend: 'Ext.form.Panel',
    alias: 'widget.LiveSearch',

	store : ['Inventory'],

	layout: {
			type: 'vbox',
			align: 'stretch'
		},
		border: false,
		bodyPadding: 10,

		fieldDefaults: {
			labelAlign: 'top',
			labelWidth: 100,
			labelStyle: 'font-weight:bold'
		},
		defaults: {
			margins: '0 0 10 0'
		},

		items: [{
			xtype: 'fieldcontainer',
			fieldLabel: 'Search Option',
			labelStyle: 'font-weight:bold;padding:0',
			layout: 'hbox',
			defaultType: 'textfield',

			fieldDefaults: {
				labelAlign: 'top'
			},

			items: [{
				flex: 1,
				//name: 'firstName',
				itemId : 'source_name',
				fieldLabel: 'Source Name',
			},{
				flex: 1,
				//name: 'lastName',
				itemId : 'type',
				fieldLabel: 'Type',
				margins: '0 0 0 5'
			},{
				flex: 1,
				//name: 'lastName',
				itemId : 'source_type',
				fieldLabel: 'Source type',
				margins: '0 0 0 5'
			},{
				flex: 1,
				//name: 'lastName',
				itemId : 'host_name',
				fieldLabel: 'Host name',
				margins: '0 0 0 5'
			},{
				xtype : 'button',
				flex: 1,
				text : 'search',
				itemId : 'LiveSearchButton',
				margins: '0 0 0 5'
			}]
		}, {
			xtype : 'LiveGrid',
			/*
			xtype: 'grid',
			flex: 1,
			margins: '0',
			store : ['Inventory'],
			columns : [
				{header : 'name', dataIndex : '_id', flex : 1},
				{header : 'type', dataIndex : 'source_type', flex : 1},
			],
			/*store : Ext.create('Ext.data.Store', {
				fields: ['name']
			})*/
				
		}],
/*
		buttons: [{
			text: 'Cancel',
		}, {
			text: 'Send',
			}
		}]
		*/
	});
