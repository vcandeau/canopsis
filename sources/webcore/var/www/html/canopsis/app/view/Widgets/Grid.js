Ext.define('canopsis.view.Widgets.Grid' ,{
	extend: 'Ext.grid.Panel',
	
	selector: undefined,
	collection: undefined,
	store: undefined,
	//form: 'selector',
	
	with_pagingdock: true,
	with_toolsbar: false,
	with_rowEditing: false,
	searchField: undefined,
	
	livesearch_fields: undefined,
	groupField: undefined,
	
	autoScroll: true,
	height: '100%',
	width: '100%',
	
	stripeRows: true,
	columnLines: true,
	
	initComponent: function() {
		var me = this
		var dockedItems = []
		var plugins = []
		var toolsbar_items = []
		var collection = this.collection
		var selector = this.selector
		var groupField = this.groupField
		var rest_url = '/webservices/rest/'+selector
		
		console.log("Create widget 'Grid' ...")
		console.log(" - selector: "+selector)
		console.log(" - collection: "+collection)
		console.log(" - groupField: "+groupField)
		console.log(" - REST URL: "+rest_url)
		
		if (this.columsClass){
			console.log("Use columns classe '"+this.columsClass+"'")
			this.columns = Ext.create('canopsis.view.column.'+this.columsClass)['columns']
		}else{
			console.log("Use default colums classe ('"+collection+"')")
			this.columns = Ext.create('canopsis.view.column.'+collection)['columns']
		}
		
		if (!this.store){
				//console.log("Init REST Store, selector: '"+selector+"', groupField: '"+groupField+"'")
				
				var options = {
					//autoSync: true,
					proxy: {
						type: 'rest',
						reader: {
							type: 'json',
							root : 'data',
							totalProperty  : 'total',
							successProperty: 'success'
						},
						writer: {
							type: 'json'
						}
					}
				}
				
				options['storeId'] = selector
				
				options['model'] = 'canopsis.model.'+collection
				
				if (groupField){
					options['groupField'] = groupField
				}
				
				//var store = Ext.create('canopsis.store.Mongo-REST', options)
				var store = Ext.create('Ext.data.Store', options);
				
				store.proxy.url = rest_url
			
				this.store = store
				//this.store = init_REST_Store(this.collection, this.selector, this.groupField)
		}
		
		if (this.groupField) {
			console.log("Group field with '"+this.groupField+"'")
			this.features = [{ftype:'grouping'}]
		}
		
		console.log("Load store ...")
		this.store.load({params: this.store.baseParams})
		
		if (this.with_pagingdock) {
			var dockedItem = {
						xtype: 'pagingtoolbar',
						store: this.store,   // same store GridPanel is using
						dock: 'bottom',
						displayInfo: true
					}
			console.log("Push PagingToolbar in dockedItems")
			dockedItems.push(dockedItem)	
		}
	
		
		if (this.with_rowEditing){
			Ext.require(['Ext.grid.plugin.RowEditing']);
			console.log("Configure rowEditing plugin")
			this.rowEditing = Ext.create('Ext.grid.plugin.RowEditing')
			plugins.push(this.rowEditing)
			
			//this.on('edit', function(editor, e) {
			//		me.store.sync()
			//	})

			
			var TBItem_add = {
					text: 'Add',
					iconCls: 'icon-add',
					icon   : 'themes/default/images/16x16/add.png',
					handler: function(){
						console.log("Add item")
						// empty record
						//me.store.insert(0, Ext.create('canopsis.model.DBObjects'));
						//me.store.add(new selectorRecord());
						//me.rowEditing.startEdit(0, 0);
						console.log(" - Create form 'canopsis.view.form."+me.form+"'")
						var maintabs = Ext.getCmp('main-tabs')
						var form = Ext.create('canopsis.view.form.'+me.form)
						//form['items'] = me.model,
						maintabs.add({
							title: "* new record",
							items: form,
							closable: true
						}).show();
					}
				}
				
			var TBItem_del = {
					text: 'Delete',
					iconCls: 'icon-delete',
					icon   : 'themes/default/images/16x16/delete.png',
					handler: function(){
						var selection = me.getView().getSelectionModel().getSelection()[0];
						if (selection) {
							console.log("Delete item")
							//console.log(selection)
							//me.store.remove(selection);
							//selection.destroy();
						}
					}
				}
			
			console.log(" - Add 'add' button")
			toolsbar_items.push(TBItem_add)
			toolsbar_items.push('-')
			console.log(" - Add 'del' button")
			toolsbar_items.push(TBItem_del)
				
			
		}
		
		
		if (this.searchField) {
			console.log("Add search field")
			console.log(this.searchField)
			var item = {
                 xtype: 'textfield',
                 name: 'search',
                 hideLabel: true,
                 width: 200,
                 listeners: {
					 change: {
                         fn: function(){
							 var searchValue = me.down('textfield[name=search]').getValue();
							 this.store.baseParams = this.store.baseParams || {};
			
							 //this.store.baseParams['search'] = searchValue;
							 params = {params:{'search': searchValue, 'fields': Ext.JSON.encode(this.searchField)}}
							 this.store.load(params);
							 //this.store.load()
						  },
                         scope: this,
                         buffer: 100
				 }
				}
			}
			toolsbar_items.push("->")
			toolsbar_items.push("LiveSearch:")
			toolsbar_items.push(item)
		}
	
		
		if (this.with_toolsbar || this.searchField) {
			//console.log("toolsbar_items: "+toolsbar_items)
			if (toolsbar_items != ''){
				var dockedItem = {
						xtype: 'toolbar',
						items: toolsbar_items,
					}
				console.log("Push Toolbar in dockedItems")
				dockedItems.push(dockedItem)
			}else{
				console.log("No item in Toolbar, dont display.")
			}
		}
		
		
		if (this.with_toolsbar || this.with_pagingdock) {
			console.log("Attach dockedItems")
			this.dockedItems = dockedItems
		}
		
		
		if (plugins != ''){
			console.log("Attach plugins")
			this.plugins = plugins
		}
		
		this.callParent(arguments);
	},
	
	/*beforeLayout: function() {
		console.log(this.store)
	},*/
	
    beforeDestroy : function() {
		console.log("Destroy 'canopsis.view.classes.Grid'")
		canopsis.view.classes.Grid.superclass.beforeDestroy.call(this);
    }
});
