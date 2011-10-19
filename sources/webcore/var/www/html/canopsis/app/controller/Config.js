Ext.define('canopsis.controller.Config', {
    extend: 'Ext.app.Controller',
    
    views: ['Config.View','Config.treeGrid','Config.treeOrdering','Config.ConfigForm'],
    stores: ['Widget'],
    models: ['Widget'],
    
    init: function() {
		console.log('Initialized Configuration editor');
		
		this.control({

			'treeGrid': {
				itemdblclick: this.addTree
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
			
			'ConfigView #saveView': {
				click : this.save
			}
			
		});
	},
	
	deleteRow : function(){
		console.log('clicked on delete row');
	},
	
	clearAll : function(){
		console.log('clicked on clear all');
		Ext.getCmp('treeOrdering').getRootNode().removeAll();
	},
	
	addTree : function(record, item, index){
		console.log('clicked on tree item')
		if (item) {			
			console.log(item)
			var TreeRootNode = Ext.getCmp('treeOrdering').getRootNode();
			console.log('Tree root : ')
			console.log(TreeRootNode);
			
			//need to copy record, else it disapear from the first tree
			//console.log(item.data)
			//console.log(item)
			copy = Ext.ClassManager.instantiate('canopsis.model.Widget',item.data);
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
	
	save : function(){
		console.log('clicked on save view');
	},
	
	
});
