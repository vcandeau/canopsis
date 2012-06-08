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
Ext.define('canopsis.controller.Schedule', {
	extend: 'canopsis.lib.controller.cgrid',
    
	views: ['Schedule.Grid','Schedule.Form'],
	stores: ['Schedules'],
	models: ['Schedule'],
	
	init: function() {
		log.debug('Initialize ...', this.logAuthor);

		this.formXtype = 'ScheduleForm'
		this.listXtype = 'ScheduleGrid'
		
		this.modelId = 'Schedule'

		this.callParent(arguments);
	},
	
	preSave: function(record,data){
		var timeLength = data.timeLength * data.timeLengthUnit
		
		//--------------------------set kwargs----------------------------
		var kwargs = {
					viewname:data.view,
					starttime:timeLength,
					account:global.account.user,
					task:'task_reporting',
					method:'render_pdf',
					_scheduled: data.crecord_name
				}
		
		//check if a mail must be send
		if (data.sendMail != undefined){
			if(data.recipients != '' && data.recipients != undefined){
				log.debug('sendMail is true')
				 
				 var stripped_recipients = data.recipients.replace(/ /g,'')
				 var recipients = stripped_recipients.split(',')
				 if(recipients.length == 1){
					 recipients = stripped_recipients.split(';')
				 }
				 
				 log.dump(recipients)
				 
				var mail = {
					"recipients":recipients,
					"subject":data.subject,
					"body":"Scheduled task reporting",
				}
				kwargs['mail'] = mail
			}
		}
		record.set('kwargs',kwargs)
		
		//if id set, means update, so carry it to webserver
		if(data['_id'] != undefined){
			record.set('_id',data['_id'])
			record.set('id',data['_id'])

		}
		//----------------------formating crontab-----------------------
		var time = data.hours.split(' ')
		
		if(time.length > 1){
			//---------Format 12h
			var hour_type = time[1]
			var clock = time[0]
			
			clock = clock.split(':')
			var minute = parseInt(clock[1],10)
			var hour = parseInt(clock[0],10)
			
			if(hour_type == 'pm'){
				hour = hour + 12
			}
			
		} else {
			//--------Format 24h
			var time = data.hours.split(':')
			
			var minute = parseInt(time[1],10)
			var hour = parseInt(time[0],10)
		}
		
		//apply offset to get utc
		var d = new Date()
		d.setHours(parseInt(hour,10))
		d.setMinutes(parseInt(minute,10))
		
		//set crontab
		var crontab = {
			minute: d.getUTCMinutes(),
			hour: d.getUTCHours()
		}
		
		log.debug('crontab is')
		log.dump(crontab)
		
		if(data.month)
			crontab['month'] = data.month
		
		
		if(data.dayWeek)
			crontab['day_of_week'] = data.dayWeek
		
		
		if(data.day)
			crontab['day'] = data.day
		

		record.set('cron',crontab)
		//------------------------------------------------------
		
		return record
	},
	
	beforeload_EditForm : function(form,item){
		
		//---------------get args--------------
		var kwargs = item.get('kwargs')
		var viewName = kwargs['viewname']
		var timeLength = kwargs['starttime']
		//--------------get cron---------------
		var cron = item.get('cron')
		
		//format time
		var d = new Date()
		d.setUTCHours(parseInt(cron.hour,10))
		d.setUTCMinutes(parseInt(cron.minute,10))
		
		var minute = d.getMinutes()
		var hour = d.getHours()
		
		//cosmetic
		if(minute < 10)
			minute = '0' + minute
		if(hour < 10)
			hour = '0' + hour
		
		//check 12h / 24h clock
		if(global.locale == 'fr')
			var hours = hour + ':' + minute
		else 
			if(hour > 12)
				var hours = (hour-12) + ':' + minute + ' pm'
			else
				var hours = hour + ':' + minute + ' am'
		
		item.set('hours',hours)
		
		//set record id for editing (pass to webserver later for update)
		item.set('_id',item.get('_id'))
		
		//set view
		item.set('view',viewName)
		
		//set right day if exist
		if(cron.day_of_week != undefined){
			item.set('every','week')
			item.set('dayWeek',cron.day_of_week)
		}
		
		if(cron.day != undefined){
			item.set('day',cron.day)
		}
		
		if(cron.month != undefined){
			item.set('every','year')
			item.set('month',cron.month)
		}
		
		//compute timeLength
		scale = Math.floor(timeLength/global.commonTs.day)

		if(scale >= 365){
			item.set('timeLengthUnit',global.commonTs.year)
			item.set('timeLength',Math.floor(scale/365))
		}else if(scale >= 30){
			item.set('timeLengthUnit',global.commonTs.month)
			item.set('timeLength',Math.floor(scale/30))
		}else if(scale >= 7){
			item.set('timeLengthUnit',global.commonTs.week)
			item.set('timeLength',Math.floor(scale/7))
			log.dump(item)
		} else {
			item.set('timeLengthUnit',global.commonTs.day)
			item.set('timeLength',Math.floor(scale))
		}
		
		//set mail
		var mail_info = kwargs.mail
		if(mail_info != undefined){
			if(mail_info.recipients != undefined){
				item.set('sendMail', true)
				item.set('recipients',mail_info.recipients)
				if(mail_info.subject != undefined)
					item.set('subject',mail_info.subject)
			}
		}
		
		//hide task name
		var task_name_field = Ext.ComponentQuery.query("#" + form.id + " textfield[name=crecord_name]")[0]
		if(task_name_field != undefined){
			task_name_field.hide()
		}
	},
	
	validateForm: function(store, data, form){
		if(!form.editing){
			var already_exist = false
			
			store.findBy(
				function(record, id){
					if(record.get('crecord_name') == data['crecord_name']){
						log.debug('Schedule already exist exist', this.logAuthor);
						already_exist = true;  // a record with this data exists
					}
				}
			);
			
			if (already_exist){
				global.notify.notify(data['crecord_name'] + ' already exist','you can\'t add the same Schedule twice','error')
				return false
			}else{
				return true
			}
		}else{
			return true
		}
	},
	
	runItem : function(item){
		log.debug('Clicked on run item',this.logAuthor)
		
		options = item.get('kwargs')
		view_name = options.viewname
		start_time = options.starttime
		mail = options.mail
		if(mail != undefined)
			mail = Ext.encode(mail)
		
		this.getController('Reporting').launchReport(view_name,start_time,undefined,mail)
	},
	
	//call a window wizard to schedule Schedule with passed argument
	scheduleWizard : function(item,renderTo){
		//temporary hack, check if called by cgrid or ctree
		form = Ext.create('canopsis.view.Schedule.Form',{EditMethod: 'window'})
		store = Ext.getStore('Schedules')
		
		if(item != undefined){
			var viewName = item.get('_id')
			var combo = form.down('combobox[name=view]')
			if(combo != undefined)
				combo.setValue(viewName)
		}
		
		var window_wizard = Ext.widget('window',{
													title:_('Scheduling'),
													items:[form],
													constrain : true,
													renderTo : renderTo
												})

		window_wizard.show()
		
		//-------------------------binding events-----------------------
		btns = form.down('button[action=save]')
		btns.on('click', function(){
			log.debug('Schedule Wizard save',this.logAuthor)
			if (form.form.isValid()){
				var data = form.getValues();
				if (this._validateForm(store, data, form.form)) {
					var record = Ext.create('canopsis.model.'+this.modelId, data);
					record = this._preSave(record,data,form)
					store.suspendEvents()
					store.add(record);
					store.resumeEvents()
					store.load();
					global.notify.notify(_('Save'), _('Schedule saved'))
					window_wizard.destroy();
				}else{
					log.error('Form is not valid !',this.logAuthor);
					global.notify.notify(_('Invalid form'), _('Please check your form'), 'error')
				}
			}else{
				log.error('Form is not valid !',this.logAuthor);
				global.notify.notify(_('Invalid form'), _('Please check your form'), 'error')
			}
		}, this)
		
		btns = form.down('button[action=cancel]')
		btns.on('click', function(){window_wizard.destroy();}, this)

	}
});
