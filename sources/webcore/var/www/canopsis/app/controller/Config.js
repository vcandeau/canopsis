Ext.define('canopsis.controller.Config', {
    extend: 'Ext.app.Controller',
    
    views: ['Config.View','Config.TreeGrid','Config.TreeOrdering','Config.ConfigForm','Config.Preview'],
    stores: ['Widget'],
    models: ['widget','view'],
    
    refs : [
    {
		ref : 'ordering',
		selector: 'TreeOrdering'
	},
	{
		ref: 'grid',
		selector: 'TreeGrid'
	},
	{
		ref : 'configView',
		selector: 'ConfigView'
	},
	{
		ref : 'configPreview',
		selector: '#ConfigPreview'
	}],
    
    
    init: function() {
		console.log('Initialized Configuration editor');
		
		this.control({

			'TreeGrid': {
				itemdblclick: this.addToTree
			},
			
			'TreeOrdering': {
				itemdblclick: this.configureItem
			},
			
			'TreeOrdering #deleteRow': {
				click: this.deleteRow
			},
			
			'TreeOrdering [action=reset]': {
				click: this.clearAll
			},
			
			'TreeOrdering [action=deleteRow]': {
				click: this.deleteRow
			},
			
			////buttons from the widget form
			'ConfigForm [action=save]' : {
				click : this.saveForm
			},
			
			'ConfigForm [action=cancel]' : {
				click : this.cancelForm
			},
			/*
			'ConfigForm' : {
				close : this.closeTab
			}*/
		
			////buttons from the livesearch form
			'LiveSearch Grid' : {
				itemdblclick : this.setID
			}
		
		});
	},
	
	createPreview : function() {
		console.log('creating preview')
		//get the container
		var preview_container = this.getConfigPreview();
		//cleaning and adding new preview
		preview_container.removeAll();
		
		//global options
		var global_opt = preview_container.up('panel').down('form');
		
		
		//get number of column
		if (global_opt.down('#nbcolumn').getValue()){
			var nbColumn = global_opt.down('#nbcolumn').getValue();
			console.log('column defined');
		} else {
			var nbColumn = 5;
			console.log('column by default');
		}

		var myLayout = []
		myLayout['type'] = 'table';
		myLayout['columns'] = nbColumn;
		
		preview_container.add({
			xtype: 'ConfigPreview',
			layout : myLayout,
		});
			
		//get the simulation preview
		var draw = preview_container.down('ConfigPreview');

		//get the store node
		var TreeRootNode = this.getOrdering().getRootNode()
		//console.log(TreeRootNode);
		
		//calculate width
		var totalWidth = preview_container.getWidth() - 20;
		//if pass nbColumn , take this, else 5 by default
		//console.log(preview_container.up('panel').down('form').down('#nbcolumn').getValue());
		console.log(draw)
		
		//starting loop
		TreeRootNode.eachChild(function(node) {
			panel_width = ((100/nbColumn) * node.data.colspan)/100 * totalWidth;
			base_heigth = 30 * node.data.rowspan;
			draw.add({
				xtype : 'panel',
				html : node.data.xtype,
				colspan : node.data.colspan,
				rowspan : node.data.rowspan,
				width : panel_width,
				height : base_heigth,
			})
		});	
		
	},
	
	setID : function(record, item, esp, index){
		console.log('ID selected')
	},
	
	closeTab : function(button) {
		this.getConfigView().show();
	},
	
	saveForm : function(button) {
		var form    = button.up('ConfigForm');
		//console.log(form);
        record = form.getRecord(),
        values = form.getValues();
		record.set(values);	
		remove_active_tab();
		this.getConfigView().show();
		//update the preview
		this.createPreview();
	},
	
	cancelForm : function() {
		console.log('clicked on button to cancel form');
		remove_active_tab();
		this.getConfigView().show();
		
	},	
	
	deleteRow : function(){
		console.log('clicked on delete row');
		var selection = this.getOrdering().getSelectionModel().getSelection()[0];
		console.log(selection)
		if (selection)
		{
			this.getOrdering().getStore().getRootNode().removeChild(selection);
		}
		this.createPreview();
	},
	
	clearAll : function(){
		console.log('clicked on clear all');
		this.getOrdering().getStore().getRootNode().removeAll();
		this.createPreview();
	},
	
	addToTree : function(record, item, index){
		console.log('clicked on tree item')
		if (item) {			
			var TreeRootNode = this.getOrdering().getRootNode();
			//need to copy record, else it disapear from the first tree
			copy = Ext.ClassManager.instantiate('canopsis.model.widget',item.data);
			//console.log(copy)
			TreeRootNode.appendChild(copy);	
		} else {
			console.log('no record selected');
		}
		this.createPreview();
	},
	
	configureItem : function(record, item, esp, index) {
			console.log('double click on the item');
			if (item) {
				//console.log('record get');
				//console.log(index)
				//set dynamical name usefull for naming tab, each tab 
				//can be opened one time
				var myName = 'ConfigFormEdit' + index
				var main_tabs = Ext.getCmp('main-tabs')
				if(!Ext.getCmp(myName))
				{
					//adding edit tab
					main_tabs.add({
						title: 'Modify options',
						xtype: 'ConfigForm',
						id: myName,
						closable: true,}).show();
					Ext.getCmp(myName).getForm().loadRecord(item);
				} else {
					console.log('tab already created');
				}
					
			} else {
				console.log('no record selected');
			}
	},
	
});
