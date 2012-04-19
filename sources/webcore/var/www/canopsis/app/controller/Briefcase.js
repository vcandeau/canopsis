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
Ext.define('canopsis.controller.Briefcase', {
	extend: 'canopsis.lib.controller.cgrid',

	views: ['Briefcase.Grid','Briefcase.Form'],
	stores: ['Document'],
	models: ['Document'],
	
	logAuthor : '[controller][Briefcase]',
	
	init: function() {
		this.listXtype = 'BriefcaseGrid'
		this.formXtype = 'BriefcaseForm'
		
		this.modelId = 'Document'
		
		this.callParent(arguments);
		
	},
	
	/*
	_viewElement: function(view, item, index){
		log.debug('Clicked on element, function viewElement',this.logAuthor);
		this.getController('Reporting').downloadReport(item.get('_id'))
	},
	*/
	_downloadButton : function(){
		log.debug('clicked deleteButton',this.logAuthor);
		var grid = this.grid
		var selection = grid.getSelectionModel().getSelection()[0];
		if (selection) {
			this.getController('Reporting').downloadReport(selection.get('_id'))
		}
	},
	
	sendMail : function(record){
		Ext.Msg.prompt('Recipients', 'Please mail recipients:', function(btn, text){
			if (btn == 'ok'){
				Ext.Ajax.request({
					type: 'rest',
					url: '/sendreport',
					method: 'POST',
					params:{
						'_id':record.get('_id'),
						'recipients':''
						},
					reader: {
						type: 'json',
						root: 'data',
						totalProperty  : 'total',
						successProperty: 'success'
					},
					success: function(response){
						request = Ext.JSON.decode(response.responseText)
						if (request.success){
							log.debug('Mail have been sent successfuly', this.logAuthor)
							log.dump(request.data.output)
						} else {
							log.error('Mail have not been sent',this.logAuthor)
						}
					},
					failure: function() {
						log.debug('Mail request have failed', this.logAuthor)
					}
				});
			}
		});
		
		
	}
})
