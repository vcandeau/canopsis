Ext.define('canopsis.controller.LiveSearch', {
	extend: 'Ext.app.Controller',
    
	views: ['LiveSearch.View','LiveSearch.Grid'],
	stores: ['Inventory'],

	logAuthor: '[controller][LiveSearch]',
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
		log.debug('Search button pushed', this.logAuthor);
		var store = this.getGrid().getStore();
		store.clearFilter();

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
		
		store.load();
		
		
	},
	
	
});
