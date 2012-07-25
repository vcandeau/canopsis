/*
#--------------------------------
# Copyright (c) 2011 "Capensis" [http://www.capensis.com]
#
# This file is part of Canopsis.
#
# Canopsis is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# Canopsis is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with Canopsis.  If not, see <http://www.gnu.org/licenses/>.
# ---------------------------------
*/
Ext.define('canopsis.controller.ReportingBar', {
	extend: 'Ext.app.Controller',

	views: ['ReportingBar.ReportingBar'],
	logAuthor: '[controller][ReportingBar]',

	init: function() {
		log.debug('Initialize ...', this.logAuthor);

		this.control({
			'ReportingBar' : {afterrender: this._bindBarEvents}
		});

		this.callParent(arguments);
	},

	_bindBarEvents: function(bar) {
		log.debug('Bind events...', this.logAuthor);
		this.bar = bar;

		bar.saveButton.on('click', this.saveButton, this);
		bar.htmlButton.on('click', this.htmlReport, this);
		bar.exitButton.on('click', this.exitButton, this);
		bar.searchButton.on('click',this.launchReport,this)
		bar.toggleButton.on('click',this.toggle_mode,this)
		
		bar.nextButton.on('click',this.nextButton,this)
		bar.previousButton.on('click',this.previousButton,this)
		
	},

	launchReport: function() {
		var tab = Ext.getCmp('main-tabs').getActiveTab();
		
		var timestamps = this.getReportTime()
		var startTimestamp = timestamps.start
		var stopTimestamp =  timestamps.stop

		if (startTimestamp && stopTimestamp) {
			log.debug('------------------------Asked Report date-----------------------');
			log.debug('from : ' + startTimestamp + ' To : ' + stopTimestamp, this.logAuthor);
			log.debug('startReport date is : ' + Ext.Date.format(new Date(startTimestamp * 1000), 'Y-m-d H:i:s'), this.logAuthor);
			log.debug('endReport date is : ' + Ext.Date.format(new Date(stopTimestamp * 1000), 'Y-m-d H:i:s'), this.logAuthor);
			log.debug('----------------------------------------------------------------');
			tab.setReportDate(startTimestamp * 1000, stopTimestamp * 1000);
		} else {
			global.notify.notify(_('Invalid date'), _('The selected date is invalid'));
		}
	},
	
	nextButton: function(){
		log.debug('Next button pressed', this.logAuthor);
		var dateField = this.bar.fromDate
		
		var selectedTime = parseInt(Ext.Date.format(dateField.getValue(), "U"))
		var timeUnit = this.bar.combo.getValue()
		
		var timestamp = selectedTime + (timeUnit * this.bar.periodNumber.getValue())
		var newDate = new Date(timestamp * 1000)
		dateField.setValue(newDate)
		this.launchReport()
	},

	previousButton: function(){
		log.debug('Previous button pressed', this.logAuthor);
		var dateField = this.bar.fromDate
		
		var selectedTime = parseInt(Ext.Date.format(dateField.getValue(), "U"))
		var timeUnit = this.bar.combo.getValue()
		
		var timestamp = selectedTime - (timeUnit * this.bar.periodNumber.getValue())
		var newDate = new Date(timestamp * 1000)
		dateField.setValue(newDate)
		this.launchReport()
	},

	saveButton: function() {
		log.debug('launching pdf reporting', this.logAuthor);

		var timestamps = this.getReportTime()
		var startTimestamp = timestamps.start
		var stopTimestamp =  timestamps.stop

		if (startTimestamp && stopTimestamp) {
			var view_id = Ext.getCmp('main-tabs').getActiveTab().view_id;
			var ctrl = this.getController('Reporting');

			log.debug('view_id : ' + view_id,this.logAuthor);
			log.debug('startReport : ' + startTimestamp * 1000,this.logAuthor);
			log.debug('stopReport : ' + stopTimestamp * 1000,this.logAuthor);

			ctrl.launchReport(view_id, startTimestamp * 1000, stopTimestamp * 1000);
		} else {
			global.notify.notify(_('Invalid date'), _('The selected date is in futur'));
		}
	},
	
	htmlReport: function() {
		log.debug('launching html window reporting', this.logAuthor);
		
		var timestamps = this.getReportTime()
		var startTimestamp = timestamps.start
		var stopTimestamp =  timestamps.stop

		if (startTimestamp && stopTimestamp) {
			var ctrl = this.getController('Reporting');
			var view = Ext.getCmp('main-tabs').getActiveTab().view_id;
			ctrl.openHtmlReport(view, startTimestamp * 1000, stopTimestamp * 1000);
		}
	},
	
	getReportTime : function(){
		if(this.bar.advancedMode){
			var startTimestamp = this.getStartTimestamp()
			var stopTimestamp =  this.getStopTimestamp()
		} else {
			var timeUnit = this.bar.combo.getValue()
			var periodLength = this.bar.periodNumber.getValue()
			var stopTimestamp = this.getStartTimestamp()
			var startTimestamp = stopTimestamp - (timeUnit * periodLength)
		}
		
		return {start:startTimestamp,stop:stopTimestamp}
		
	},
	
	getStartTimestamp : function(){
		var fromDate = this.bar.fromDate
		var fromHour = this.bar.fromHour
		
		if(fromDate.isValid() && fromHour.isValid()){
			var date = parseInt(Ext.Date.format(fromDate.getValue(), 'U'));
			var hour = stringTo24h(fromHour.getValue())
			
			//date + hour in seconds + minute in second
			var timestamp = date + (hour.hour * 60 * 60) + (hour.minute * 60)
			timestamp = timestamp + (new Date().getTimezoneOffset() * 60)
		}else{
			var timestamp = undefined
		}
		
		return parseInt(timestamp, 10)
	},

	getStopTimestamp : function(){
		var toDate = this.bar.toDate
		var toHour = this.bar.toHour
		
		if(toDate.isValid() && toHour.isValid()){
			var date = parseInt(Ext.Date.format(toDate.getValue(), 'U'));
			var hour = stringTo24h(toHour.getValue())
			
			//date + hour in seconds + minute in second
			var timestamp = date + (hour.hour * 60 * 60) + (hour.minute * 60)
			timestamp = timestamp + (new Date().getTimezoneOffset() * 60)
		}else{
			var timestamp = undefined
		}
		return parseInt(timestamp, 10)
	},

	exitButton: function() {
		log.debug('Exit reporting mode', this.logAuthor);
		var tab = Ext.getCmp('main-tabs').getActiveTab();
		tab.report_window.destroy();
		tab.report_window = undefined;
		this.getController('Tabs').reload_active_view();
	},

	enable_reporting_mode: function() {
		log.debug('Enable reporting mode', this.logAuthor);
		Ext.getCmp('main-tabs').getActiveTab().addReportingBar();
	},
	
	toggle_mode : function(){
		if(this.bar.advancedMode){
			this.bar.toDate.hide()
			this.bar.toHour.hide()
			this.bar.textFor.show()
			this.bar.previousButton.show()
			this.bar.nextButton.show()
			this.bar.periodNumber.show()
			this.bar.combo.show()
			this.bar.advancedMode = false
		}else{
			this.bar.toDate.show()
			this.bar.toHour.show()
			this.bar.textFor.hide()
			this.bar.previousButton.hide()
			this.bar.nextButton.hide()
			this.bar.periodNumber.hide()
			this.bar.combo.hide()
			this.bar.advancedMode = true
		}

	}
	
});
