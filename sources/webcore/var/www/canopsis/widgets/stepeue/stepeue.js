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
	useScreenShot: true,
	initComponent: function( ) {
		this.cntxtFeature = { } ;
		this.stepOfScenario = { } ;
		this.endLoadedStepOfScenario = false ;
		this.model = Ext.ModelManager.getModel('canopsis.model.Event');
		this.titleScenario = { } ;
		this.imgToBuildWindow = new Array () ;
		this.graphData = { } ;
		this.callParent(arguments);
		pnl = Ext.create('Ext.Panel', { 
			xtype: "panel",
			width: "100%",
			height: "100%",
		} ) ;
		pnl.on( 'afterrender', function ( ) {
			pnl.setLoading(true, true);
		} ) ;
		this.wcontainer.add ( pnl ) ;
		this.wcontainer.setLoading(true, true) ; //masked = { 
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
        findPerfData: function (records ) {
//              var gId = record.connector +"\."+record.connector_name+"\."+record.event_type+"\.resource\."+record.component+"\."+scenario+"*";
		console.log (records )  ;
                url = this.urlPerfStore
		post_params_tmp = new Array() ;
		for ( i in records ) {
			var object = { id: records[i]._id, metrics: ["duration", "total", "succeed"] } ;
			post_params_tmp.push( object ) ;
		}
		console.log ( post_params_tmp ) ;
                post_params = { 'nodes':  Ext.JSON.encode(post_params_tmp)} ;
                Ext.Ajax.request({
                        url: url,
                        scope: this,
                        params: post_params,
                        method: 'POST',
                        success: function(response) {
                                var data = Ext.JSON.decode(response.responseText);
				arrayOfNodeAndValue =   {}  ;
                  		for ( i in data.data ) {
					if ( arrayOfNodeAndValue[data.data[i].node] == null )
						arrayOfNodeAndValue[data.data[i].node]= { } ;
					arrayOfNodeAndValue[data.data[i].node][data.data[i].metric] = data.data[i].values ;
				}
				for ( i in arrayOfNodeAndValue ) { 
					var record = {  } ;
					var values = arrayOfNodeAndValue[i].duration ;
					var valuesTotal = arrayOfNodeAndValue[i].total ;
					var valuesSucceed  = arrayOfNodeAndValue[i].succeed ;
        	                        myArrVal = new Array( );
                	                for( var j in values ) {
						if ( valuesSucceed[j][1] != valuesTotal[j][1] ) 
							myArrVal.push( ( values[j][1] - 2*values[j][1] )  ) ; 
						else 
		                                     myArrVal.push( values[j][1] ) ;

					}
					
                        	        record.graphData = "<span class=\"line-graph\">" + myArrVal.join(', ') + "</span>" ;
                                	record.values = data.values;
					this.graphData[i] = record ;
				}
	                       	this.buildHtml() ;
                        },
                        failure: function(result, request) {
                                log.error('Ajax request failed ... ('+ request.url + ')', this.logAuthor);
                        }
                });

        },
        doRefresh: function ( from, to ) {
                this.urlPerfStore = this.makeUrl(from, to);
                this.last_from = to;
                this.callParent(arguments);
        },

	onRefresh: function(data) {
			var j = 0 ;
			var filter = { '$or': [] } ;
			if ( ! (  data instanceof Array ) )
				data = new Array ( data );
			this.eventsLoaded = data ;
			for ( i in data ) {
				var object = { 'child': data[i]._id } ;
				filter['$or'].push(object) ;
				j++;
			}
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
               	                        },
					autoLoad: true,
       	                        },
	               	});
			this.storeEvent.setFilter ( filter );
			this.storeEvent.sort( { property: "timestamp", direction: "ASC" } ) ;
			var me = this;
			this.storeEvent.load( { callback: function ( records, operation, success) {  
				if ( success ) { 
					me.structureRecords ( records ) ;
					return true ;
				}
				console.log ( 'records are not loaded. There is a problem' );
				return false ;
				
			}   } );
	},
	structureRecords: function ( records ) {
		this.component = null ;
		this.arboStructure = { };
		this.scenarioToDisplay = [ ] ;
		this.lastContext = {  } ;
		this.lastTimestamp = { } ;
		var index = 0 ;
		for (  var i  in records ) {
			var current = records[i] ;
			var arrayResource = records[i].raw.resource.split('.') ;
			if ( this.component == null )
				this.component = current.raw.component ;
			if ( this.arboStructure[records[i].raw.child] == null ) {
				this.arboStructure[records[i].raw.child] = { } ;
			}
			if ( this.arboStructure[records[i].raw.child][arrayResource[2]] == null ) {
				this.arboStructure[records[i].raw.child][arrayResource[2]] = { } ;
				index++;
			}
			if ( this.arboStructure[records[i].raw.child][arrayResource[2]][current.raw.cntxt_localization] == null )
				this.arboStructure[records[i].raw.child][arrayResource[2]][current.raw.cntxt_localization] = { } ;
			if ( this.arboStructure[records[i].raw.child][arrayResource[2]][current.raw.cntxt_localization][current.raw.cntxt_os] == null ) 
				this.arboStructure[records[i].raw.child][arrayResource[2]][current.raw.cntxt_localization][current.raw.cntxt_os] = { } ;
			if ( this.arboStructure[records[i].raw.child][arrayResource[2]][current.raw.cntxt_localization][current.raw.cntxt_os][current.raw.cntxt_browser] == null)
				this.arboStructure[records[i].raw.child][arrayResource[2]][current.raw.cntxt_localization][current.raw.cntxt_os][current.raw.cntxt_browser] = { } ;
			this.arboStructure[records[i].raw.child][arrayResource[2]][current.raw.cntxt_localization][current.raw.cntxt_os][current.raw.cntxt_browser] = records[i] ;
			if ( this.lastContext[records[i].raw.child] == null ||
				this.lastTimestamp[records[i].raw.child] < records[i].raw.timestamp 
			) 
			{
				 this.lastContext[records[i].raw.child] = {  
					localization: current.raw.cntxt_localization,
					os : current.raw.cntxt_os,
					browser: current.raw.cntxt_browser
				} ;
				if ( this.lastTimestamp[records[i].raw.child] == null )
				{
					this.lastTimestamp[records[i].raw.child] = { } ;
				}
				this.lastTimestamp[records[i].raw.child] = records[i].raw.timestamp ;
			}
		}
		var findPerfData = new Array() ;
                for ( i in this.arboStructure ) {
			for ( j in this.arboStructure[i] ) {
                        	var current = this.arboStructure[i][j][this.lastContext[i]['localization'] ] [this.lastContext[i]['os']][this.lastContext[i]['browser'] ];
				findPerfData.push( current.raw ) ;
			}
                }
		console.log( findPerfData ) ;
               	this.findPerfData( findPerfData ) ;

//		this.buildHtml() ;
	
	},

        buildOtherInfoTitle : function( current ) {
                //return "<table><tr><td>localization</td><td>"+current.cntxt_localization+"</td></tr><tr><td>OS</td><td>"+current.cntxt_os+"</td></tr><tr><td>browser</td><td>"+current.cntxt_browser+"</td></tr></table>" ;
		return "<div class=\"context-info\"><div class=\"country\">"+rdr_country( current.cntxt_localization ) +"</div><div class=\"os\"> "+rdr_os( current.cntxt_os ) +"</div><div class=\"browser\">"+rdr_browser( current.cntxt_browser ) +"</div></div>" ;
        },
	writeTitleScenario: function ( i, id_child) {
		

		currentRecord = this.arboStructure[id_child][i][this.lastContext[id_child]['localization'] ][this.lastContext[id_child]['os']][this.lastContext[id_child]['browser'] ]; // [i][this.cntxtFeature['localization']][this.cntxtFeature['os']][this.cntxtFeature['browser']] ;
		return "<div><div class=\"scenario-status\">"+ rdr_status( currentRecord.data.state )  +"</div><div class=\"title-bar-scenario\"> <span class=\"scenario-title\">"+i+"</span><span>"+ rdr_tstodate( currentRecord.data.timestamp ) + " | "+ currentRecord.data.perf_data_array[0].value + " "+currentRecord.data.perf_data_array[0].unit + "</span></div><div class=\"other-info-title\"><div>"+this.buildOtherInfoTitle( currentRecord.raw ) +"</div></div><div class=\"graph-data\">"+ this.graphData[currentRecord.data._id].graphData  +"</div></div>";
	
//		console.log ( eventStore.find ( 'child', id_child )  ) ;
//		console.log ( eventStore.data ) ;
	},
	findScenarioOfFeature: function ( id_child ) {
		var step = new Array() ;
		for ( i in this.arboStructure[id_child] ) {
			var object  = { } ;
			object.xtype = "panel" ;
			object.layout = "fit";
			object.title = this.writeTitleScenario ( i, id_child )  ;
/*			object.tools = [
				{
					type: 'plus',
					handler: function (event, target, owner, tool) {
					}
				}
			] ;*/
			object.border = false ;
			object.collapsible = true ;
			object.collapsed = true ;
			object.animCollapse = true ;
			object.cls = "collapse" ;
			object.width= "100%" ;
//			object.html = "coool" ;
			object.items = this.buildScenarioView ( i, id_child ) ;
			step.push( object );
		}
		return step ;
	},
	buildOptionTable: function (i, id_child ) {
		
		var listItem = new Array() ;
		var curLine = 0 ;
		locIndex = 0 ;
		locOS = 1 ;
		currCell = 0 ;
		for ( loc in this.arboStructure[id_child][i] ) {
			lineToSpan = 0 ;
			var firstLoc = true ;	
			for ( os in this.arboStructure[id_child][i][loc] ) {
				lineToSpanOS = 0 ;
				var firstOS = true;
				for ( browser in this.arboStructure[id_child][i][loc][os] ) {
					var cellLoc = { html: rdr_country( loc ) } ;
					var cellOs = { html: rdr_os( os ) } ;
					var cellBrowser = { html: rdr_browser(browser) }
					var cellDuration = { html: this.arboStructure[id_child][i][loc][os][browser].data.perf_data_array[0].value + " "+ this.arboStructure[id_child][i][loc][os][browser].data.perf_data_array[0].unit } ;
					var cellTimestamp = { html: rdr_tstodate ( this.arboStructure[id_child][i][loc][os][browser].data.timestamp ) } ;
					var cellStatus = { html: rdr_status ( this.arboStructure[id_child][i][loc][os][browser].data.state ) }
					if ( firstLoc ) {
						listItem.push( cellLoc ) ;
						currCell++ ;
						firstLoc  = false; 
					}
					if ( firstOS ) {
						listItem.push( cellOs ) ;
						currCell++ ;
						firstOS = false;
					}
					listItem.push( cellBrowser ) ;
					listItem.push( cellDuration ) ;
					listItem.push( cellTimestamp ) ;
					listItem.push( cellStatus ) ;
					curLine++ ;
					lineToSpan++;
					lineToSpanOS++ ;
					currCell+=4 ;
				}
				listItem[locOS].rowspan = lineToSpanOS ;
				locOS = currCell + 1 ;
			}
			listItem[locIndex].rowspan = lineToSpan ;
			locIndex = currCell ;
		}
		var table =  {
			width: "100%",
			xtype: "panel",
			border: false,
    			layout:{ type: "table", columns: 6 },
			defaults: {
				padding: "3%"
			},
			items: listItem 
		}  ;
		return table ;
	},
        buildScreenShot: function ( i , id_child) {
		if ( this.useScreenShot) {
			var context = this.lastContext[id_child] ;
			var currentNode = this.arboStructure[id_child][i][context['localization']][context['os']][context['browser']] ;
			if ( currentNode.raw.media_type == 'screenshot' ) {
				if ( ! this.useStepScreenShot ) {
			                var srcImg = "/files/" ; //+currentNode.raw.media_id ;
					this.imgToBuildWindow.push ( "img-"+currentNode.raw.resource ) ;
                			return Ext.create( 'Ext.Img', {
                        			id: "img-"+currentNode.raw.resource,
		                        	src: srcImg,
	        		                width: "100%"
        	        		} ) ;
				} else {
					this.findStepOfNode ( currentNode ) ;
				}
			} else console.log ( "the media cannot be read" );
		}
		
        },
	findStepOfNode: function ( record ) {
			var filter = { 'child': record.raw._id } ;
                        var storeEvent = Ext.create('canopsis.lib.store.cstore', {
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
                                        },
                                        autoLoad: true,
                                },
                        });
                        storeEvent.setFilter ( filter );
			me = this ;
			storeEvent.load ( /* { callback: function ( records, operation, success ) {
				for ( i in records ) {
					if ( me.stepOfScenario[records[i].raw.child] == null )
						me.stepOfScenario[records[i].raw.child] = new Array( ) ;
					me.stepOfScenario[records[i].raw.child].push( records[i] ) ;
				}
			}
			} */);
			var rec = new Array( ) ;
			storeEvent.on('load', function(store, records) {
					return records  ;
			}, { single: true, scope: this});
			console.log ( rec  ) ;
				
	},
	buildScenarioView : function ( i, id_child ) {
		var array = [ {
			xtype: "panel",
			autoScroll : true,
			border: false,
			width:"100%",
			height: "100%",
			layout :  { 
			type: "hbox",
				align: "stretch"
			},				
			items : [ {
				border: false,
				items:[
					this.buildOptionTable ( i, id_child )
				],
				flex: 2
			},{
				border: false,
				items: this.buildScreenShot (i, id_child ),
				flex: 1

			}]
	
		}];
		return array ;
	},
	buildFeaturePresentation : function ( id_child, subtitle ) {
		return {
			xtype : 'panel',
			border: false,
			layout: {
				type: 'vbox',
				align: 'stretch',
			},
			title: subtitle,
			autoScroll: true,
			width: "100%", 
			items: this.findScenarioOfFeature( id_child ) 
		};
	},
	buildHtml : function ( ) {
		var listItem = [ ] ;
		var j = 0 ;
		var videoString ;
		console.log (this.eventsLoaded )  ;
		for ( i in  this.eventsLoaded ) {
			var item = { } ;
			item.id = "tab-"+i
			item.title = this.eventsLoaded[i].resource ;
			console.log( this.eventsLoaded[i] ) ; 
			var subtitle =  this.eventsLoaded[i].description;
			item.width = "100%" ;
			item.height = "100%" ;
			var media_id = this.eventsLoaded[i].media_id ;
			console.log ( media_id );
			var ts = this.eventsLoaded[i].timestamp ;
			//item.border = falseu ;
			item.layout = "fit";
			item.items = this.buildFeaturePresentation( this.eventsLoaded[i]._id, subtitle ) ;
			listItem.push( item ) ;
 			if ( j == 0 )
				videoString = "<video controls=\"controls\" width=\"80%\" src=\"/files/"+media_id+"\">video of the last play Feature </video><br/>"+item.title+" - "+rdr_tstodate( ts ) ;
			j++;
		}
		var videoPanel =  {
			xtype:"panel",
			id : "panel-video-stepbystep",
			html: videoString,
			flex: 1 

		} ; 
                var tabsPanel = Ext.create('Ext.tab.Panel', {
			xtype: "Panel",
			items: listItem,
			flex:1,
			listeners : {
				tabchange: function ( tabpanel, tab, old ) {
					var el = Ext.getCmp("panel-video-stepbystep");
					el =  el.getContentTarget() 
					videoString = "<video controls=\"controls\" width=\"80%\" src=\"/files/"+this.eventsLoaded[tab.id].media_id+"\">video of the last play Feature </video><br/>"+this.eventsLoaded[tab.id].resource+" - "+rdr_tstodate( this.eventsLoaded[tab.id].timestamp ) ;
					el.setHTML( videoString ) ;
					this.buildGraph() ;
				}
			}

                });
		this.content = Ext.create('Ext.Panel', {
			layout: {
				type: "hbox",
				align: "stretch"
			},
			items: [tabsPanel, videoPanel ] 
		} ) ;
/*			
			                var gWidth = $('.line-graph').width() ;
			                var gHeight = $('.line-graph').height() ;
			                $(".line-graph").sparkline("html", { type: "bar",  height: gHeight, width:gWidth, tooltipClassname : "tooltip" } ) ;
		
					for ( i in this.imgToBuildWindow ) {
						var el = Ext.get(this.imgToBuildWindow[i] ) ;
						el.addListener( 'click', function(ev, element, o ) {
							var attr = element.getAttribute('src' ) ;
							var img = Ext.create( 'Ext.Img', {
                                                	src: attr,
		                                        width: "65%"
                	                        	} ) ;
							Ext.create('Ext.window.Window', {
								xtype: "xpanel",
								width:"75%",
								items: [img ]
							}).show();
						} ) ;
					}
*/
                this.wcontainer.removeAll();
                this.wcontainer.add(this.content);
		this.buildGraph() ;
	},
	buildGraph : function () {
			                var gWidth = $('.line-graph').width() ;
			                var gHeight = $('.line-graph').height() ;
			                $(".line-graph").sparkline("html", { type: "bar",  height: gHeight, width:gWidth, tooltipClassname : "tooltip" } ) ;
		
					for ( i in this.imgToBuildWindow ) {
						var el = Ext.get(this.imgToBuildWindow[i] ) ;
						el.addListener( 'click', function(ev, element, o ) {
							var attr = element.getAttribute('src' ) ;
							var img = Ext.create( 'Ext.Img', {
                                                	src: attr,
		                                        width: "65%"
                	                        	} ) ;
							Ext.create('Ext.window.Window', {
								xtype: "xpanel",
								width:"75%",
								items: [img ]
							}).show();
						} ) ;
					}

	}
});
