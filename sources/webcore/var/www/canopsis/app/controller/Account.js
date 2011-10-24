Ext.define('canopsis.controller.Account', {
	extend: 'canopsis.lib.controller.cgrid',
    
	views: ['Account.Grid', 'Account.Form'],
	stores: ['Account'],
	models: ['Account'],

	iconCls: 'icon-crecord_type-account',

	init: function() {
		console.log('[account] - Initialize ...');

		this.form = 'AccountForm'
		this.model = 'Account'

		this.callParent(arguments);
	},

	validateForm: function(store, data, form){
		var already_exist = false;

		if (! form._record) {
			store.findBy(
				function(record, id){
					if(record.get('user') == data['user']){
						console.log('[account][validateForm] -  User already exist');
						already_exist = true;  // a record with this data exists
					}
				}
			);
		}

		if (already_exist){
			Ext.MessageBox.show({
				title: data['user'] + ' already exist !',
				msg: 'you can\'t add the same user twice',
				icon: Ext.MessageBox.WARNING,
  				buttons: Ext.Msg.OK
			});
			return false
		}else{
			return true
		}	
	},
	
});
