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
	logAuthor: '[widget][stepeue]',
	scroll : true,	
	useScreenShot: true,
	initComponent: function( ) {
                pnl = Ext.create('Ext.Panel', { 
                        xtype: "panel",
                        width: "100%",
                        height: "100%",
                } ) ;
                pnl.on( 'afterrender', function ( ) {
                        pnl.setLoading(true, true);
                } ) ;
		this.features = new Array( );
		for ( i in this.nodes ) {
			var feature = Ext.create('widgets.stepeue.feature' ) ;
			feature.init( this.nodes[i] ) ;
			this.features.push( feature ) ;
		}	
                this.callParent(arguments);
                this.wcontainer.add ( pnl ) ;
                this.wcontainer.setLoading(true, true) ;
	},
	onRefresh: function( data ){
		log.	
		var listItems = new Array() ;
		for ( i in this.features ) {
			var object = this.features[i].getFeatureViewObject() ;
			listItems.push( object ) ;
		}
		console.log ( listItems ) ;
                var tabsPanel = Ext.create('Ext.tab.Panel', {
                        xtype: "Panel",
                        items: listItem,
                        flex:1,
		});	
	}

});
