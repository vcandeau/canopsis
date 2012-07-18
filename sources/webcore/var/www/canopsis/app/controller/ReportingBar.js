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
	},

	launchReport: function() {
		var tab = Ext.getCmp('main-tabs').getActiveTab();
		var startTimestamp = this.getStartTimestamp()
		var stopTimestamp =  this.getStopTimestamp()

		if (startTimestamp && stopTimestamp) {
			log.debug('------------------------Asked Report date-----------------------');
			log.debug('from : ' + startTimestamp + ' To : ' + stopTimestamp, this.logAuthor);
			log.debug('startReport date is : ' + Ext.Date.format(new Date(startTimestamp * 1000), 'Y-m-d H:i:s'), this.logAuthor);
			log.debug('endReport date is : ' + Ext.Date.format(new Date(stopTimestamp * 1000), 'Y-m-d H:i:s'), this.logAuthor);
			log.debug('----------------------------------------------------------------');
			tab.setReportDate(startTimestamp * 1000, stopTimestamp * 1000);
		} else {
			global.notify.notify(_('Invalid date'), _('The selected date is in futur'));
		}
	},

	saveButton: function() {
		log.debug('launching pdf reporting', this.logAuthor);

		var startTimestamp = this.getStartTimestamp()
		var stopTimestamp =  this.getStopTimestamp()

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
		
		var startTimestamp = this.getStartTimestamp()
		var stopTimestamp =  this.getStopTimestamp()

		if (startTimestamp && stopTimestamp) {
			var ctrl = this.getController('Reporting');
			var view = Ext.getCmp('main-tabs').getActiveTab().view_id;
			ctrl.openHtmlReport(view, startTimestamp * 1000, stopTimestamp * 1000);
		}
	},
	
	getStartTimestamp : function(){
		var fromDate = this.bar.fromDate
		var fromHour = this.bar.fromHour
		
		if(fromDate.isValid() && fromHour.isValid()){
			var date = parseInt(Ext.Date.format(fromDate.getValue(), 'U'));
			var hour = stringTo24h(fromHour.getValue())
			
			//date + hour in seconds + minute in second
			var timestamp = date + (hour.hour * 60 * 60) + (hour.minute * 60)
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
		}else{
			var timestamp = undefined
		}
		return parseInt(timestamp, 10)
	},

	exitButton: function() {
		log.debug('Exit reporting mode', this.logAuthor);
		var tab = Ext.getCmp('main-tabs').getActiveTab();
		tab.export_window.destroy();
		this.getController('Tabs').reload_active_view();
	},

	enable_reporting_mode: function() {
		log.debug('Enable reporting mode', this.logAuthor);
		Ext.getCmp('main-tabs').getActiveTab().addReportingBar();
	},

	disable_reporting_mode: function() {
		log.debug('Disable reporting mode', this.logAuthor).removeReportingBar();
	}
});
