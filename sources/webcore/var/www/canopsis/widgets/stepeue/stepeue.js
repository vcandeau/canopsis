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

Ext.define('widgets.stepeue.stepeue' , {
	extend: 'canopsis.lib.view.cwidget',

	alias: 'widget.stepeue',
	logAuthor: '[widget][stream]',
	
	initComponent: function( ) {
		this.chart = new Array( ) ;
		this.chartsOptions = new Array( ); 
		this.model = Ext.ModelManager.getModel('canopsis.model.Event');
		this.callParent(arguments);
	},
	onRefresh: function(data) {
		this.baseNode = data ;
		this.filterEvent = { '$and' : [ { 'component' : this.baseNode.component }, {'connector_name': this.baseNode.connector_name},  { 'event_type':'eue'  } ] } ;
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
                                },

                });
		this.storeEvent.setFilter( this.filterEvent ) ;
		var me = this;
		this.storeEvent.load( { callback: function ( records, operation, success) { me.structureRecords(records)  }  }  );
	},
	findPerfData: function (record) {

		url = this.urlPerfStore
	

		post_params_tmp = [ { id: record._id, metrics: ["duration"] }] ;
		post_params = { 'nodes':  Ext.JSON.encode(post_params_tmp)} ;
                Ext.Ajax.request({
	                url: url,
        	        scope: this,
                	params: post_params,
	                method: 'POST',
		        success: function(response) {
        		        var data = Ext.JSON.decode(response.responseText);
                        	data = data.data[0];
				console.log(data);
				myArrVal = new Array( );
				for( var i in data.values ) 
					myArrVal.push( data.values[i][1] ) ;
				record.graphData = "<span class=\"line-graph\">" + myArrVal.join(', ') + "</span>" ;
				record.values = data.values;
				this.structuredData[record.resource] = record ;
				this.buildHtml() ;	
                	},
	                failure: function(result, request) {
        	                log.error('Ajax request failed ... ('+ request.url + ')', this.logAuthor);
                	}
                });

	},
        makeUrl: function(from, to) {
                var url = '/perfstore/values';
		if (! to) {
                        url += '/' + from;
                }

                if (from && to) {
                        url += '/' + from + '/' + to;
                } 

                return url;
        },
	doRefresh: function ( from, to ) {
		this.urlPerfStore = this.makeUrl(from, to);
                this.last_from = to;
		this.callParent(arguments);
	},
	structureRecords: function (records) {
		this.structuredData = {} ;
		this.raw
		console.log('structure');
		console.log(records);
		this.structuredRaw = { } ;
		for (i in records ) {
			var current = records[i] ;
			this.structuredRaw[ current.data.resource ] = current.raw ;
			this.findPerfData( current.data ) ;
		}
	},
	createAccordionItems : function( )
	{	
		var xt = "panel" ;
		var ly = {
      		        type: 'vbox',       // Arrange child items vertically
		        align: 'stretch',    // Each takes up full width
		        padding: 5
    		} ;
		var items = new Array() ;
		for ( var i  in this.structuredData ) {
			console.log(this.structuredData );
			var object = { } ;
			var rState = this.structuredData[i].state ;
			var currDate = rdr_tstodate(this.structuredData[i].timestamp ) ;
			object.title = "<span class=\"scenario-title\">"+i+"</span><span class=\"scenario-statut\">"+ rdr_status( rState) + "</span>"+ currDate ;
			object.items = [ {
				html: "box1",
				xtype: xt,
				anchor: "100% 70%",
				border: false 
			} ,
			{
				xtype: xt,
				anchor: "100% 30%",
				html: this.structuredData[i].graphData , 
				border: false 
			}  ] ;
			object.layout = "anchor" ;
			items.push( object ) ;
		}
		return items ;
	}, 
	prepareChart : function( object ) {
		var values = new Array ( ) ;
		for ( i in object ) {
			if ( values ) 
				values.push( object[i].perf_data_array[0]['value'] ) ;
			else values = new Array( object[i].perf_data_array[0]['value'] ) ;
		}
		return "<span class=\"line-graph\">"+ values.join(', ')+"</span>";	
	},
	buildHtml : function() {
		var itemsList = this.createAccordionItems() ;
		this.content = Ext.create('Ext.Panel', {
			title: "["+this.baseNode.component+"]<br/><span class=\"subtitle\">"+this.baseNode.description+"</span>" ,
			defaults: {
     				   // applied to each contained panel
			        bodyStyle: 'padding:15px'
    			},
			layout:  {
			        type: 'accordion',
			        titleCollapse: false,
			        animate: true,
			        activeOnTop: true	
			},
			items: itemsList 
	
		});
                this.wcontainer.removeAll();
                this.wcontainer.add(this.content);
		var gWidth = $('.line-graph').width() ;
		var gHeight = $('.line-graph').height() ;
		$(".line-graph").peity("line", { height: gHeight, width:gWidth } ) ;
	},

	
});
