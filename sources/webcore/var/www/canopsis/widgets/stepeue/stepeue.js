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
	scroll : true,	
	initComponent: function( ) {
		this.chart = new Array( ) ;
		this.nbResource = 0 ;
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
		console.log('structure');
		console.log(records);
		this.structuredRaw = { } ;
		for (i in records ) {
			this.nbResource++ ;
			var current = records[i] ;
			this.structuredRaw[ current.data.resource ] = current.raw ;
			this.findPerfData( current.data ) ;
		}
	},
	buildOptionsTable: function ( resource_name )  
	{
		console.log ( "build browser table" );
		console.log ( this.structuredRaw[resource_name] ) ;
/*                Ext.Ajax.request({
                        url: url,
                        scope: this,
                        params: post_params,
                        method: 'POST',
                        success: function(response) {
                                var data = Ext.JSON.decode(response.responseText);
                                data = data.data[0];
                                console.log(data);
                                myArrVal = new Array( );
                        },
                        failure: function(result, request) {
                                log.error('Ajax request failed ... ('+ request.url + ')', this.logAuthor);
                        }
                });
*/
		browser = {
			"firefox" : {
   				'state': 0,
				'timestamp': 0,
				'duration' : 1	
			} 
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
		console.log ( this.structuredData.length );
		for ( var i  in this.structuredData ) {
			var object = { } ;
			var rState = this.structuredData[i].state ;
			var currDate = rdr_tstodate(this.structuredData[i].timestamp ) ;
			object.width = "100%" ; 
			object.xtype = "panel" ;
			//object.minHeight = 150 ; //this.el.dom.clientHeight / this.nbResource  ;
			object.title = "<div><div class=\"scenario-status\">"+ rdr_status( rState )  +"</div><div class=\"title-bar-scenario\"> <span class=\"scenario-title\">"+i+"</span><span>"+ currDate+ " | "+ this.structuredData[i].perf_data_array[0].value + " "+this.structuredData[i].perf_data_array[0].unit + "</span></div><div class=\"graph-data\">"+ this.structuredData[i].graphData +"</div></div>";
			object.items = [ {
				xtype: xt,
				border: false,
				items: [
				{
					xtype: xt,
					anchor: "100% 100%",
					border: false,
					layout: "column",
					height: "100%",
					items: [ 
						{
							columnWidth: 0.7,
							border:false,
							html: "Ceci est du code html"//,<br /><br/><br/>ceci encore,<br/><br/><br/> ceci encore !" 
							//tems: this.buildOptionsTable( i )  
						},
						{
							columnWidth: 0.3,
					//		height: "100%",
							border: false,
							items: this.buildScreenShot( i ) 
						}
					]	
				} ]  
		 	} ] ; 
			/*, {
				anchor: "100% 100%",
				border: false,
				items: this.buildScreenShot( i )
			}  ] ;*/
//			object.layout = "anchor" ;
/*			object.bbar = [
		        {
		            id: this.structuredData[i].resource+':!:move-prev',
		            text: 'Back',
		            handler: function(btn) {
                		navigate(btn.up("panel"), "prev", btn);
		            },
		            disabled: true
		        },
		        '->', // greedy spacer so that the buttons are aligned to each side
		        {
		            id: this.structuredData[i].resource+':!:move-next',
		            text: 'Next',
 		            handler: function(btn) {
 			    navigate(btn.up("panel"), "next" , btn);
            			}
        		}
    			]; */
			items.push( object ) ;
		}
		return items ;
	}, 
	buildScreenShot: function ( i ) {
		var srcImg = this.structuredRaw[i].server_media_url + "/"+this.structuredRaw[i].scenario_screenshot ;
		console.log( "build screen shot");
		return Ext.create( 'Ext.Img', {
			id: "img-"+this.structuredRaw[i].resource,
			src: srcImg,
			width: "100%",
		} ) ;
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
			autoScroll: true,
			layout:  {
			        type: 'accordion',
				align:'stretch'
			},
			items: itemsList 
	
		});
                this.wcontainer.removeAll();
                this.wcontainer.add(this.content);
		var gWidth = $('.line-graph').width() ;
		var gHeight = $('.line-graph').height() ;
		$(".line-graph").peity("line", { height: gHeight, width:gWidth } ) ;
		for ( var i in this.structuredRaw ) {
			Ext.EventManager.on ( 'img-'+this.structuredRaw[i].resource, 'click', function( e, t) {
 				e.preventDefault() ;
				var srcImg = t.getAttribute('src');
				var img = Ext.create( 'Ext.Img', {
		                        src: srcImg,
                		        width: "100%",
         		       } ) ;
				Ext.create('Ext.window.Window',{ 
					width:"53%",
					layout: 'auto',
					items: img
				}).show();
			}  ) ;
		}
	},

	
});
