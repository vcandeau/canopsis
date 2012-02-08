Ext.define('canopsis.view.Tabs.WidgetToolbar' ,{
	extend: 'canopsis.lib.view.ctoolbar',
	
	title : 'View edition toolbar',
	width:500,
	
	initComponent: function() {
		this.callParent(arguments);

		if(this.jqgridable){
			this.jqgridable.pause_widgets()
			this.jqgridable._toggle_grid()
			this.jqgridable._toggle_draggable_mode()
			this.jqgridable._toggle_resizable_mode()
			this.jqgridable._toggle_selectable_mode()
		}
		
		var addRowButton = Ext.create('Ext.button.Button',{text:'addRow'})
		addRowButton.on('click',function(){this.jqgridable.add_row()},this)
		
		var addColumnButton = Ext.create('Ext.button.Button',{text:'addColumn'})
		addColumnButton.on('click',function(){this.jqgridable.add_column()},this)


		var saveButton = Ext.create('Ext.button.Button',{text:'save'})
		saveButton.on('click', function(){
			this.close();
		},this)
		
		var grid = Ext.create('Ext.button.Button',{text:'save'})

	
		
		this.add(saveButton)
		this.add(addRowButton)
		this.add(addColumnButton)
		
		this.show()
	},
	
	

})
