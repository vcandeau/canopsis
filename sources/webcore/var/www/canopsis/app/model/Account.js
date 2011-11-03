Ext.define('canopsis.model.Account', {
    extend: 'Ext.data.Model',
    fields: [
		{name : 'id'},
		{name : 'crecord_type'},
		{name : 'firstname'},
		{name : 'lastname'},
		{name : 'user'},
		{name : 'mail'},
		{name : 'aaa_group'},//todo cahnger nom , en groupe
		//{name : 'groups'},
		{name : 'passwd'}
		],
});
