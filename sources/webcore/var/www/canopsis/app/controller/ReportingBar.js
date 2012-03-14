Ext.define('canopsis.controller.ReportingBar', {
	extend: 'Ext.app.Controller',
	
	views: ['ReportingBar.ReportingBar'],
	
	logAuthor : '[controller][ReportingBar]',
	
	init: function() {
		log.debug('Initialize ...', this.logAuthor);

		this.control({
			'ReportingBar' : {
				afterrender : this._bindBarEvents
			}
		})
		
		this.callParent(arguments);
	},
	
	_bindBarEvents: function(bar) {
		var id = bar.id
		this.bar = bar
		log.debug('Bind events "'+id , this.logAuthor)
		
		//previous button
		var btns = Ext.ComponentQuery.query('#' + id + ' button[action="previous"]')
		for (i in btns){
			btns[i].on('click', this.previousButton, this)
		}
		
		//next button
		var btns = Ext.ComponentQuery.query('#' + id + ' button[action="next"]')
		for (i in btns){
			btns[i].on('click', this.nextButton, this)
		}
		
		var btns = Ext.ComponentQuery.query('#' + id + ' button[action="exit"]')
		for (i in btns){
			btns[i].on('click', this.exitButton, this)
		}
		
		//if ask to reload data after duration/data selection
		if(this.bar.reloadAfterAction == true){
			log.debug('binding event to reload after any action',this.logAuthor)
			
		} else {
			var btns = Ext.ComponentQuery.query('#' + id + ' button[action="request"]')
			for (i in btns){
				btns[i].on('click', this.launchReport, this)
			}
		}
		
		
	},
	
	//the following is now manage bien mainbar/content.js
	
	launchReport: function(){
		var toolbar = this.bar
		var startReport = parseInt(Ext.Date.format(toolbar.currentDate.getValue(), 'U'));
		var endReport =	startReport - toolbar.combo.getValue();
		log.debug('from : ' + startReport + 'To : ' + endReport,this.logAuthor)
		//launch tab function
		var tab = Ext.getCmp('main-tabs').getActiveTab();
		tab.setReportDate(endReport*1000,startReport*1000)
	},
	
	nextButton: function(){
		//get toolbar elements
		var inputField = this.bar.currentDate;
		var selectedTime = parseInt(Ext.Date.format(inputField.getValue(), "U"))
		var timeUnit = this.bar.combo.getValue()
		//add the time and build a date
		var timestamp = selectedTime + timeUnit
		var newDate = new Date(timestamp * 1000)
		//set the time
		inputField.setValue(newDate)
	},
	
	previousButton: function(){
		//get toolbar elements
		var inputField = this.bar.currentDate;
		var selectedTime = parseInt(Ext.Date.format(inputField.getValue(), "U"))
		var timeUnit = this.bar.combo.getValue()
		//substract the time and build a date
		var timestamp = selectedTime - timeUnit
		var newDate = new Date(timestamp * 1000)
		//set the time
		inputField.setValue(newDate)
	},
	
	exitButton : function(){
		log.debug('Exit reporting mode', this.logAuthor)
		var tab = Ext.getCmp('main-tabs').getActiveTab();
		tab.removeReportingBar()
	},
	
	enable_reporting_mode : function(){
		log.debug('Enable reporting mode', this.logAuthor)
		var tab = Ext.getCmp('main-tabs').getActiveTab();
		tab.addReportingBar()
	},
	
	disable_reporting_mode : function(){
		log.debug('Disable reporting mode', this.logAuthor)
		tab.removeReportingBar()
	},
	
})
