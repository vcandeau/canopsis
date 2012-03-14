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
		
		//savebutton
		var btns = Ext.ComponentQuery.query('#' + id + ' button[action="save"]')
		for (i in btns){
			btns[i].on('click', this.saveButton, this)
		}
		
		//exit button
		var btns = Ext.ComponentQuery.query('#' + id + ' button[action="exit"]')
		for (i in btns){
			btns[i].on('click', this.exitButton, this)
		}
		
		//if ask to reload data after duration/data selection
		if(this.bar.reloadAfterAction == true){
			log.debug('binding event to reload after any action',this.logAuthor)
			var btns = Ext.ComponentQuery.query('#' + id + ' combobox')
			for (i in btns){
				btns[i].on('change', this.launchReport, this)
			}
			var btns = Ext.ComponentQuery.query('#' + id + ' datefield')
			for (i in btns){
				btns[i].on('change', this.launchReport, this)
			}
			
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
		var endReport = parseInt(Ext.Date.format(toolbar.currentDate.getValue(), 'U'));
		var startReport =	endReport - toolbar.combo.getValue();
		log.debug('from : ' + startReport + 'To : ' + endReport,this.logAuthor)
		//launch tab function
		var tab = Ext.getCmp('main-tabs').getActiveTab();
		if(toolbar.currentDate.isValid()){
			tab.setReportDate(startReport*1000,endReport*1000)
		} else {
			global.notify.notify(_('Invalid date'),_('The selected date is in futur'))
		}
	},
	
	saveButton : function(){
		log.debug('launching pdf reporting',this.logAuthor)
		//get end/start
		var toolbar = this.bar
		if(toolbar.currentDate.isValid()){
			var endReport = parseInt(Ext.Date.format(toolbar.currentDate.getValue(), 'U'));
			var startReport = endReport - toolbar.combo.getValue();
			
			//Get view id
			var tab = Ext.getCmp('main-tabs').getActiveTab();
			var view_id = tab.view_id
			
			//launch reporting fonction
			var ctrl = this.getController('Reporting')
			
			log.debug('view_id : ' + view_id)
			log.debug('startReport : ' + startReport*1000)
			log.debug('stopReport : ' + endReport*1000)
			
			ctrl.launchReport(view_id,startReport*1000,endReport*1000)
		} else {
			global.notify.notify(_('Invalid date'),_('The selected date is in futur'))
		}
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
