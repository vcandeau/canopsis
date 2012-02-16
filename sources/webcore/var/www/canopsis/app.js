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




Ext.onReady(function() {
	Ext.Loader.setConfig({enabled:true});

	//check Auth
	log.debug('Check auth ...', "[app]");
	Ext.Ajax.request({
		type: 'rest',
		url: '/account/me',
		reader: {
			type: 'json',
			root: 'data',
			totalProperty  : 'total',
			successProperty: 'success'
		},
		success: function(response){
			request_state = Ext.JSON.decode(response.responseText).success
			if (request_state){
				global.account = Ext.JSON.decode(response.responseText).data[0];
				createApplication()
			} else {
				window.location.href='/';
			}
		},
		failure: function() {
			window.location.href='/';
		}
	});
});


function createApplication(){
	log.debug("Loading locale ...", "[app]");
	
	var locale = global.account['locale']
	if (! locale){
		locale = global.default_locale;
	}
	global.locale = locale
	log.debug(" + User locale: "+locale, "[app]");

	Ext.fly('extlocale').set({src:'resources/lib/extjs/locale/ext-lang-' + locale + '.js'});
	Ext.fly('canopsislocale').set({src:'resources/locales/lang-' + locale + '.js'});

	//set_Ext_locale(lang)

	log.debug("Start ExtJS application ...", "[app]");

	var app = Ext.application({
		name: 'canopsis',
		appFolder: 'app',

		controllers: [
			'Mainbar',
			'Widgets',
			'Menu',
			'View',
			'WebSocket',
			'Notify',
			'LiveEvents',
			'Account',
			'Group',
			'Tabs',
			'ReportingBar',
<<<<<<< HEAD
			'ViewBuilder',
			'Keynav',
=======
>>>>>>> 868f5a75fdd8e0282ac454cc88943d57fe78de67
		],
	
		//autoCreateViewport: true,
		launch: function() {
			this.getController('Widgets').on('loaded', this.createViewport,this,{single : true});
		},

		createViewport: function(){
			Ext.create('canopsis.view.Viewport');
			log.debug('Remove mask ...');
			Ext.get('loading').remove();
			Ext.get('loading-mask').remove();
			
		}
	});

	log.debug("Application started", "[app]");
}

