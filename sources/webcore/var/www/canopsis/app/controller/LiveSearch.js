Ext.define('canopsis.controller.LiveSearch', {
	extend: 'Ext.app.Controller',
    
	views: ['LiveSearch.View','LiveSearch.Grid'],
	stores: ['Inventory'],
	//models: [''],

	//iconCls: 'icon-crecord_type-account',
	
	refs : [{
		
		ref : 'grid',
		selector : 'LiveGrid'
		
	},{
		ref : 'liveSearch',
		selector : 'LiveSearch'
	}],
	
	init : function() {
		this.callParent(arguments);
		
		this.control({
			
			'LiveSearch #LiveSearchButton' : {
				click : this.addFilter,
			}
			
			
			
		})
		
	},
	
	addFilter : function() {
		console.log('Search button pushed');
		var store = this.getGrid().getStore();
		store.clearFilter();
		//console.log(this.getLiveSearch());
		search = {};
		
		var searchValue = this.getLiveSearch().down('#source_name').value;
		if (searchValue){
			store.load().filter('source_name',searchValue);
			//search['source_name'] = searchValue;
		}
		
		searchValue = this.getLiveSearch().down('#type').value;
		if (searchValue){
			store.load().filter('type',searchValue);
			//search['type'] = searchValue;
		}
		
		searchValue = this.getLiveSearch().down('#source_type').value;
		if (searchValue){
			store.load().filter('source_type',searchValue);
			//search['source_type'] = searchValue;
		}
		
		searchValue = this.getLiveSearch().down('#host_name').value;
		if (searchValue){
			store.load().filter('host_name',searchValue);
			//search['host_name'] = searchValue;
		}
		

		
		//console.log(search);
		store.load();
		
		
	},
	
	
});
