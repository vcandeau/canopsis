Ext.define('canopsis.view.Group.Form', {
	extend: 'canopsis.lib.view.cform',

	alias: 'widget.GroupForm',

	iconCls: 'icon-crecord_type-group',

	items: [{
			fieldLabel: 'Name',
			name: 'crecord_name',
			allowBlank: false,
		}],
    

    initComponent: function(){
        this.callParent();
    },
    
});
