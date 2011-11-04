Ext.define('canopsis.view.ViewEditor.Form' ,{
	extend: 'Ext.panel.Panel',

	alias : 'widget.ConfigView',
	
	items: [],

	layout: {
		type: 'table',
		tableAttrs: {
			style: {
				width: '100%',
            		}
		},
	},    

	tbar: [{
		iconCls: 'icon-save',
		text: 'Save',
		action : 'save',
	},{
		iconCls: 'icon-cancel',
		text: 'Cancel',
		action: 'cancel',
	}
	],
	
	initComponent: function() {
		this.on('beforeclose', this.beforeclose)

		//var totalWidth = this.getWidth() - 20
		var totalWidth = 800

		this.nbColumns = 4
		this.layout.columns = this.nbColumns
		this.layout.tableAttrs.style.width = totalWidth

		this.DefaultWidth = (totalWidth/this.nbColumns)

		this.defaults = {
			width: this.DefaultWidth,
			height: 200,
			padding:4,
		}
		
		this.callParent(arguments);

		this.removeAll();
		
		var GlobalOptions = {
			xtype: 'form',
			colspan: 2, width: this.DefaultWidth * 2,
			
			border: 0,
			defaultType: 'textfield',
			items : [{
					fieldLabel: 'view\'s name',
					itemId: 'name',
					name: 'name',
					allowBlank: false,
				},{
					fieldLabel: 'refresh interval',
					itemId : 'refreshInterval',
					name: 'refreshInterval',
				},{
					fieldLabel: 'nb column',
					itemId: 'column',
					name: 'column',
				},
				Ext.create('canopsis.lib.form.field.cinventory', {
					multiSelect: false,
				})
			]
		}

		//fixing layout (table goes wild without it)
		for (i; i<this.nbColumns; i++){
			this.add({ html: '', border: 0, height: 0, padding:0})
		}


		var Preview = { html: 'Preview', colspan: 2, width: this.DefaultWidth * 2,}

		var Widgets =  Ext.create('Ext.grid.Panel', {
			store: 'Widget',
			columns: [{
				header: 'widget',
				dataIndex: 'xtype',
				flex: 1
       			 }],
		});
		
		var ItemsStore = Ext.data.Store({model: 'canopsis.model.widget'});

		var ItemsList = Ext.create('Ext.grid.Panel', {
			store: ItemsStore,
			
			bbar: [{
					text : 'delete selected row',
					action : 'deleteRow'
				},{
					xtype: 'tbseparator'
				},{
					text : 'clear all',
					action : 'reset'
				}],

				columns: [{
					text: 'Option name',
					flex: 1,
					dataIndex: 'xtype'
				},{
					//we must use the templateheader component so we can use a custom tpl
					//xtype: 'templatecolumn',
					text: 'title',
					flex: 1,
					dataIndex: 'title',
					//align: 'center',
				},{
					text: 'length',
					flex: 1,
					dataIndex: 'colspan',
				},{
					text: 'height',
					flex: 1,
					dataIndex: 'rowspan',
				},{
					text: 'nodeId',
					flex: 1,
					dataIndex: 'nodeId',
				},{
					text: 'refresh interval',
					flex: 1,
					dataIndex: 'refreshInterval',
				}],
				
			html: 'Items List', colspan: 3, width: this.DefaultWidth * 3 
		});

		this.add(GlobalOptions)
		this.add(Preview)
		this.add(Widgets)
		this.add(ItemsList)
	},

	loadRecord: function(record){
	},

	beforeclose: function(tab, object){
		console.log('[ViewEditor][cform] - Active previous tab');
		old_tab = Ext.getCmp('main-tabs').old_tab;
		if (old_tab) {
			Ext.getCmp('main-tabs').setActiveTab(old_tab);
		}
	},

	beforeDestroy : function() {
		log.debug("Destroy items ...")
		canopsis.view.Tabs.Content.superclass.beforeDestroy.call(this);
		log.debug(this.id + " Destroyed.")
	}
});
