Ext.define('canopsis.view.Account.Form', {
	extend: 'canopsis.lib.view.cform',
	alias: 'widget.AccountForm',

	iconCls: 'icon-crecord_type-account',

	items: [{
				fieldLabel: 'Login',
				name: 'user',
				allowBlank: false,
			},{
				fieldLabel: 'First Name',
				name: 'firstname',
			}, {
				fieldLabel: 'Last Name',
				name: 'lastname',
			},/*{
				fieldLabel: 'aaa access owner',
				name: 'aaa_access_owner'
			},*/{
				fieldLabel: 'E-mail',
				name: 'mail',
				vtype: 'email',
				allowBlank : true
			},/*{
				fieldLabel: 'groups',
				name: 'groups'
			},*/{
				fieldLabel: 'group',
				name: 'aaa_group'
			},{
				fieldLabel: 'password',
				name: 'passwd',
			}/*,{
				fieldLabel: 'aaa owner',
				name: 'aaa_owner'
			}*/],
    

    initComponent: function(){
        this.callParent();
    },
    
});
