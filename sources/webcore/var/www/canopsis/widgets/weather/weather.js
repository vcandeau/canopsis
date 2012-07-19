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

Ext.define('widgets.weather.weather' , {
	extend: 'canopsis.lib.view.cwidget',

	alias: 'widget.weather',
	logAuthor: '[widget][weather]',
	border: false,
	
	cls: 'widget-weather',
	
	iconSet : '01',
	state_as_icon_value : false,
	
	wcontainer_autoScroll: true,
	wcontainer_layout: 'anchor',
	
	option_button : true,
	
	selector_record : undefined,
	sla_id: undefined,
	
	afterContainerRender: function() {
		if (this.nodeId) {
			Ext.Ajax.request({
				url: this.uri + '/' + this.nodeId,
				scope: this,
				success: function(response) {
					var data = Ext.JSON.decode(response.responseText);
					if ( this.nodeId.length > 1 )
						data = data.data ;
					else
						data = data.data[0];
						
					this.selector_record = data
					this.populate(data);
				},
				failure: function(result, request) {
					log.error('Impossible to get Node informations, Ajax request failed ... ('+ request.url + ')', this.logAuthor);
				}
			});
		}
	},
	
		
	/*
	doRefresh: function(from, to) {
		log.debug('Do refresh',this.logAuthor)
		//get selector info
		if(!this.selector_record)
			this.getNodeInfo()
			
		if(this.reportMode == true){
			log.debug('reportMode enabled',this.logAuthor)
			log.dump(this.getStateFromTs(from,to))
		}else{
			this._onRefresh(this.selector_record)
		}
	},
	*/
	
	doRefresh: function(from, to) {
		log.debug('Do refresh',this.logAuthor)
		for (var i = 0; i < this.wcontainer.items.length; i++) {
			var brick = this.wcontainer.getComponent(i);
			if(brick)
				brick.update_brick()
		}
	},
	
	
	populate: function(datas){
		log.debug('Populate widget', this.logAuthor)
		this.wcontainer.removeAll()

		if(!Ext.isArray(datas))
			datas = [datas]

		for (var i in datas){
			var data = datas[i]
			var sla_id = 'sla.engine.sla.resource.' + data.component + '.sla'

			var config = {
				sla_id: sla_id,
				iconSet: this.iconSet,
				state_as_icon_value: this.state_as_icon_value
			}

			var meteo = Ext.create('widgets.weather.brick', config)
			this.wcontainer.insert(0, meteo);
		}
	},
	
/*
	getStateFromTs : function(from,to){
		var post_params = [{id:this.sla_id,metrics:['cps_pct_by_state_0']}]

		Ext.Ajax.request({
			url: '/perfstore/values/' + from +'/'+ to ,
			params: {'nodes':Ext.JSON.encode(post_params)},
			scope: this,
			success: function(response) {
				var data = Ext.JSON.decode(response.responseText);

				data = data.data[0];
		
				this.build(data);

				this.displayReport(data.data[0]);
			},
			failure: function(result, request) {
				log.error('Impossible to get Node informations, Ajax request failed ... ('+ request.url + ')', this.logAuthor);
			}
		});
	},

	
	displayReport : function(data){
		var widget_data = {
				title: this.selector_record.component,
				percent: data.values[0][1],
				class_icon: data.values[0][1]
			}
		
		var _html = widget_weather_template.applyTemplate(widget_data);
		this.wcontainer.update(_html)
	},
	* */
	
});
