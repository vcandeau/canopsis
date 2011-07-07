Ext.define('canopsis.view.form.selector' ,{
	extend: 'Ext.form.Panel',
	//autoShow: true,
	//autoRender: true,	
	//url:'save-form.php',
	frame:true,
	height: '100%',
	//title: 'Simple Form',
	//bodyStyle:'padding:5px 5px 0',
	//width: 350,
	
	style: {borderWidth:'0px'},
	
	fieldDefaults: {
		msgTarget: 'side',
		labelWidth: 75
	},
	defaultType: 'textfield',
	defaults: {
		anchor: '100%'
	},

	items: [{
		fieldLabel: 'First Name',
		name: 'first',
		allowBlank:false
	},{
		fieldLabel: 'Last Name',
		name: 'last'
	},{
		fieldLabel: 'Company',
		name: 'company'
	}, {
		fieldLabel: 'Email',
		name: 'email',
		vtype:'email'
	}, {
		xtype: 'timefield',
		fieldLabel: 'Time',
		name: 'time',
		minValue: '8:00am',
		maxValue: '6:00pm'
	}],

	buttons: [{
		text: 'Save'
		},{
            text: 'Cancel'
	}]
	
});
