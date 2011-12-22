Ext.define('canopsis.controller.ReportingBar', {
	extend: 'Ext.app.Controller',
	
	views: ['ReportingBar.ReportingBar'],
	
	logAuthor : 'ReportingBar',
	
	refs : [{
		ref : 'toolbar',
		selector : 'Reporting'
	}],
	
	init: function() {
		log.debug('Initialize ...', this.logAuthor);
		
		this.control({
			/*'Reporting button[action="previous"]' : {
				click : this.previousButton,
			},
			'Reporting button[action="next"]' : {
				click : this.nextButton,
			},	*/	
		})
		
		this.callParent(arguments);
	},
	
	//the following is now manage bien mainbar/content.js
	
/*	launchReport: function(){
		var toolbar = this.getToolbar()
		var startReport = parseInt(Ext.Date.format(toolbar.currentDate.getValue(), 'U'));
		var endReport =	startReport - toolbar.combo.getValue();
		log.debug('from : ' + startReport + 'To : ' + endReport)
		toolbar.fireEvent('reporting', {start : startReport, stop : endReport})
	},
	
	nextButton: function(){
		//get toolbar elements
		var inputField = this.getToolbar().currentDate;
		var selectedTime = parseInt(Ext.Date.format(inputField.getValue(), "U"))
		var timeUnit = this.getToolbar().combo.getValue()
		//add the time and build a date
		var timestamp = selectedTime + timeUnit
		var newDate = new Date(timestamp * 1000)
		//set the time
		inputField.setValue(newDate)
	},
	
	previousButton: function(){
		//get toolbar elements
		var inputField = this.getToolbar().currentDate;
		var selectedTime = parseInt(Ext.Date.format(inputField.getValue(), "U"))
		var timeUnit = this.getToolbar().combo.getValue()
		//substract the time and build a date
		var timestamp = selectedTime - timeUnit
		var newDate = new Date(timestamp * 1000)
		//set the time
		inputField.setValue(newDate)
	}*/
	
})
