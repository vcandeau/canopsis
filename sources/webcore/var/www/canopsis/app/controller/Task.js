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
Ext.define('canopsis.controller.Task', {
	extend: 'canopsis.lib.controller.cgrid',
    
	views: ['Task.Grid','Task.Form'],
	stores: ['Task'],
	models: ['Task'],
	
	init: function() {
		log.debug('Initialize ...', this.logAuthor);

		this.formXtype = 'TaskForm'
		this.listXtype = 'TaskGrid'
		
		this.modelId = 'Task'

		this.callParent(arguments);
	},
	
	preSave: function(record,data){
		record.set('task','task_reporting.render_pdf')
		
		//(filename viewname starttime stoptime account wrapper_conf_file)
		var timeLength = data.timeLength * data.timeLengthUnit
		
		record.set('args',[null,data.view,timeLength,null,global.account.user,null])
		record.set('_id',data['_id'])
		
		//--------------formating crontab-----------------------
		var time = data.hours.split(':')
		var crontab = {
			minute: time[1],
			hour: time[0]
		}

		if(data.day != undefined)
			crontab['day_of_week'] = data.day.substring(0,3)
		record.set('crontab',crontab)
		//------------------------------------------------------
		
		return record
	},
	
	beforeload_EditForm : function(form,item){
		var user_textfield = Ext.ComponentQuery.query("#" + form.id + " textfield[name=crecord_name]")[0]
		if (user_textfield){
			user_textfield.hide()
		}
		
		//---------------get args--------------
		var args = item.get('args')
		var viewName = args[1]
		var timeLength = args[2]
		
		//--------------get cron---------------
		var cron = item.get('crontab')
		var hours = cron.hour + ':' + cron.minute
		
		//set view
		item.set('view',viewName)
		
		//set right day if exist
		if(cron.day_of_week != undefined){
			item.set('every','week')
			item.set('day',this.trunc_day_to_day(cron.day_of_week))
		}else{
			item.set('every','day')
		}
		
		item.set('hours',hours)
		
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
	},

	trunc_day_to_day: function(day){
		switch(day)
		{
			case 'mon':
				return 'monday';
			case 'tue':
				return 'tuesday';
			case 'wed':
				return 'wednesday';
			case 'thu':
				return 'thursday';
			case 'fri':
				return 'friday';
			case 'sat':
				return 'satursday';
			case 'sun':
				return 'sunday';
			default:
				return undefined
		}
		
	},
	
	validateForm: function(store, data, form){
		if(!form.editing){
			var already_exist = false
			
			store.findBy(
				function(record, id){
					if(record.get('crecord_name') == data['crecord_name']){
						log.debug('task already exist exist', this.logAuthor);
						already_exist = true;  // a record with this data exists
					}
				}
			);
			
			if (already_exist){
				global.notify.notify(data['crecord_name'] + ' already exist','you can\'t add the same task twice','error')
				return false
			}else{
				return true
			}
		}else{
			return true
		}
	}
	
});
