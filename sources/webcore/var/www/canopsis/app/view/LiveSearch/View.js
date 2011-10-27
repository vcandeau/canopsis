Ext.define('canopsis.view.LiveSearch.View', {
    extend: 'Ext.form.Panel',
    alias: 'widget.LiveSearch',


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
				fieldLabel: 'Source Name',
				allowBlank: false
			},{
				flex: 1,
				//name: 'lastName',
				fieldLabel: 'Type',
				allowBlank: false,
				margins: '0 0 0 5'
			},{
				flex: 1,
				//name: 'lastName',
				fieldLabel: 'Source type',
				allowBlank: false,
				margins: '0 0 0 5'
			},{
				flex: 1,
				//name: 'lastName',
				fieldLabel: 'Host name',
				allowBlank: false,
				margins: '0 0 0 5'
			},{
				xtype : 'button',
				flex: 1,
				text : 'search',
				margins: '0 0 0 5'
			}]
		}, {
			xtype: 'grid',
			flex: 1,
			margins: '0',
			columns : [
				{header : 'name', flex : 1}
			],
			store : Ext.create('Ext.data.Store', {
				fields: ['name']
			})
		}],

		buttons: [{
			text: 'Cancel',
			handler: function() {
				this.up('form').getForm().reset();
				this.up('window').hide();
			}
		}, {
			text: 'Send',
			handler: function() {
				if (this.up('form').getForm().isValid()) {
					// In a real application, this would submit the form to the configured url
					// this.up('form').getForm().submit();
					this.up('form').getForm().reset();
					this.up('window').hide();
					Ext.MessageBox.alert('Thank you!', 'Your inquiry has been sent. We will respond as soon as possible.');
				}
			}
		}]
	});
