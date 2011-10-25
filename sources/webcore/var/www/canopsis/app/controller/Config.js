Ext.define('canopsis.controller.Config', {
    extend: 'Ext.app.Controller',
    
    views: ['Config.View','Config.treeGrid','Config.treeOrdering','Config.ConfigForm'],
    stores: ['Widget'],
    models: ['widget','view'],
    
    init: function() {
		console.log('Initialized Configuration editor');
		
		this.control({

			'treeGrid': {
				itemdblclick: this.addToTree
			},
			
			'treeOrdering': {
				itemdblclick: this.configureItem
			},
			
			'treeOrdering #deleteRow': {
				click: this.deleteRow
			},
			
			'treeOrdering #clearAll': {
				click: this.clearAll
			},
			
			
			//buttons from the form
			'ConfigForm button[action=save]' : {
				click : this.saveForm
			},
			
			'ConfigForm #cancelForm' : {
				click : this.cancelForm
			}			
		});
	},
	
	saveForm : function(button) {
		var form    = button.up('ConfigForm');
		console.log(form);
        record = form.getRecord(),
        values = form.getValues();
		record.set(values);	
	},
	
	cancelForm : function() {
		console.log('clicked on button to cancel form');
		remove_active_tab();
	},	
	
	deleteRow : function(){
		console.log('clicked on delete row');
	},
	
	clearAll : function(){
		console.log('clicked on clear all');
		Ext.getCmp('treeOrdering').getRootNode().removeAll();
	},
	
	addToTree : function(record, item, index){
		console.log('clicked on tree item')
		if (item) {			
			console.log(item)
			var TreeRootNode = Ext.getCmp('treeOrdering').getRootNode();
			console.log('Tree root : ')
			console.log(TreeRootNode);
			
			//need to copy record, else it disapear from the first tree
			//console.log(item.data)
			//console.log(item)
			copy = Ext.ClassManager.instantiate('canopsis.model.widget',item.data);
			//console.log(copy)
			TreeRootNode.appendChild(copy);	
		} else {
			console.log('no record selected');
		}
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
