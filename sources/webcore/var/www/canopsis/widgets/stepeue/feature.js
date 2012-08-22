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
Ext.define('widgets.stepeue.feature' , {
	alias: 'widget.stepeue.feature',
	logAuthor: '[widget][stepeue][feature]',
	scroll : true,	
	useScreenShot: true,
	node: null,
	init: function( node ) {
		log.debug( "Initialization of feature ["+node+"]", this.logAuthor ) ;
		this.node = node ;
		var filter =  { '$and' : [ { 'id': this.node  } ] } ;
                this.model = Ext.ModelManager.getModel('canopsis.model.Event');
		this.storeEvent = Ext.create('canopsis.lib.store.cstore', {
			model: this.model,
			pageSize: 30,
			proxy: {
				type: 'rest',
				url: '/rest/events/event',
				reader: {
					type: 'json',
					root: 'data',
					totalProperty: 'total',
					successProperty: 'success'
				}
                                }
			});
		this.storeEvent.setFilter ( filter );
		this.scenarios = { }  ;
		var me = this;
		this.storeEvent.load({ callback: function ( records, operation, success) {  
			if ( success ) {
				log.debug( "feature is loaded", me.logAuthor ) ;
				me.record = records[0]
				me.findScenario() ;
                        } else {
				log.debug( "Problem during the load of scenarios' records of the feature", me.logAuthor );
                                return false ;
			}
                                
		} });
	},
	findScenario : function () {
		var filter =  { '$and' : [ { 'child': this.node  }, { 'type_message' : 'scenario'} ] } ;
		this.storeEvent.setFilter ( filter );
		this.storeEvent.sort( { property: "timestamp", direction: "ASC" } ) ;
		me = this;
		this.storeEvent.load({ callback: function ( records, operation, success) {  
			if ( success ) {
				log.debug( "feature's Scenario are  loaded", me.logAuthor ) ;
				cntxtBrowser = records[0].raw.cntxt_browser ;
				cntxtLoc = records[0].raw.cntxt_localization ;
				cntxtOS = records[0].raw.cntxt_os ;
				for ( i in records ) {
					infoScenario = records[i].raw.resource.split('.' );
					scenario_name = infoScenario[2] ;
					if ( me.scenarios.hasOwnProperty(scenario_name) && me.scenarios[scenario_name] != undefined )
						me.scenarios[scenario_name].addScenario( records[i] ) ;
					else{	
						var scenario = Ext.create("widgets.stepeue.scenario") ;
						scenario.init( me.node, scenario_name ) ;
						scenario.putMainScenario( records[i] ) ;
						me.scenarios[scenario_name] =  scenario  ;
					}
				}
                        } else {
				log.debug( "Problem during the load of scenarios' records of the feature", me.logAuthor );
                                return false ;
			}
                                
		} });
	},
	getFeatureViewObject: function () {
		console.log( this.record ) ;
		return {'title' : this.record.id , 'html': this.record.id } ;
	}
});
